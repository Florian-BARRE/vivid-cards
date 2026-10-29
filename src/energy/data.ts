/**
 * Reading the energy data of Home Assistant: the sources of its Energy
 * dashboard and the long-term statistics. Results are cached a few minutes so
 * several cards on a page share their requests.
 */
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { HomeAssistant } from '../core/hass-types';
import { addDays, buildDays, dateKey, dateStart, type Change, type DayRecord } from './days';
import type { Tariff } from './tariff';

/** A device of the Energy dashboard. */
export interface DeviceSource {
  stat: string;
  name?: string;
  /** The device measuring this one too (a plug feeding a strip). */
  includedIn?: string;
}

export interface EnergySources {
  /** Energy drawn from the grid, and its cost. */
  energy?: string;
  cost?: string;
  devices: DeviceSource[];
}

interface EnergyPrefs {
  energy_sources?: {
    type?: string;
    stat_energy_from?: string | null;
    stat_cost?: string | null;
    flow_from?: { stat_energy_from?: string | null; stat_cost?: string | null }[];
  }[];
  device_consumption?: { stat_consumption?: string; name?: string; included_in_stat?: string }[];
}

interface StatisticPeriod {
  start: number | string;
  change?: number | null;
}

const CACHE_MS = 5 * 60_000;
const cache = new Map<string, { at: number; value: Promise<unknown> }>();

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && now - hit.at < CACHE_MS) return hit.value as Promise<T>;
  const value = load();
  cache.set(key, { at: now, value });
  // A failed request is not kept.
  value.catch(() => cache.delete(key));
  return value;
}

/** Forgets every cached request (tests, or a refresh asked by the user). */
export function clearEnergyCache(): void {
  cache.clear();
}

/** The grid source and the devices of Home Assistant's Energy dashboard. */
export function energySources(hass: HomeAssistant): Promise<EnergySources> {
  if (!hass.callWS) return Promise.resolve({ devices: [] });
  return cached('prefs', async () => {
    const prefs = (await hass.callWS!<EnergyPrefs>({ type: 'energy/get_prefs' })) ?? {};
    const sources: EnergySources = { devices: [] };
    for (const source of prefs.energy_sources ?? []) {
      if (source.type !== 'grid') continue;
      const flow = source.flow_from?.[0];
      sources.energy ??= source.stat_energy_from ?? flow?.stat_energy_from ?? undefined;
      sources.cost ??= source.stat_cost ?? flow?.stat_cost ?? undefined;
    }
    sources.devices = (prefs.device_consumption ?? []).flatMap((device) =>
      device.stat_consumption
        ? [
            {
              stat: device.stat_consumption,
              name: device.name || undefined,
              includedIn: device.included_in_stat || undefined,
            },
          ]
        : [],
    );
    return sources;
  });
}

/** Changes of sum statistics per period, energy in kWh. */
export function fetchChanges(
  hass: HomeAssistant,
  ids: readonly string[],
  start: number,
  end: number,
  period: 'hour' | 'day' | 'month',
): Promise<Record<string, Change[]>> {
  if (!hass.callWS || !ids.length) return Promise.resolve({});
  const unique = [...new Set(ids)].sort();
  const key = `stats|${period}|${unique.join(',')}|${Math.floor(start / 60_000)}|${Math.floor(end / 3_600_000)}`;
  return cached(key, async () => {
    const result = await hass.callWS!<Record<string, StatisticPeriod[]>>({
      type: 'recorder/statistics_during_period',
      start_time: new Date(start).toISOString(),
      end_time: new Date(end).toISOString(),
      statistic_ids: unique,
      period,
      types: ['change'],
      units: { energy: 'kWh' },
    });
    const changes: Record<string, Change[]> = {};
    for (const [id, values] of Object.entries(result ?? {})) {
      changes[id] = values
        .map((value) => ({
          start: typeof value.start === 'number' ? value.start : Date.parse(value.start),
          change: typeof value.change === 'number' ? value.change : Number.NaN,
        }))
        .filter((value) => Number.isFinite(value.start) && Number.isFinite(value.change))
        .sort((a, b) => a.start - b.start);
    }
    return changes;
  });
}

/** What a card needs to read. */
export interface EnergyNeeds {
  /** Days of daily data, today included. */
  days: number;
  /** Days of hourly data (peak / off-peak split, the day curve). */
  hourlyDays: number;
  /** Devices of the Energy dashboard and their energy over `deviceDays`. */
  devices?: boolean;
  deviceDays?: number;
}

/** Energy of a device of the Energy dashboard: per day, and over all the days read. */
export interface DeviceEnergy extends DeviceSource {
  daily: Change[];
  kwh: number;
}

export interface EnergyData {
  sources: EnergySources;
  energyId?: string;
  costId?: string;
  days: DayRecord[];
  /** Hourly energy changes of the last `hourlyDays` days. */
  hourly: Change[];
  devices: DeviceEnergy[];
  /** YYYY-MM-DD of today, when the data was read. */
  today: string;
  loadedAt: number;
}

export interface EnergyInputs {
  hass: HomeAssistant;
  /** Statistic ids set in the config; the Energy dashboard's grid source otherwise. */
  energy?: string;
  cost?: string;
  tariff: Tariff;
  needs: EnergyNeeds;
}

/** Reads everything a card needs, from the Energy dashboard and the statistics. */
export async function loadEnergy(inputs: EnergyInputs, now = Date.now()): Promise<EnergyData> {
  const { hass, tariff, needs } = inputs;
  const sources = await energySources(hass);
  const energyId = inputs.energy ?? sources.energy;
  const costId = inputs.cost ?? (inputs.energy ? undefined : sources.cost);
  const today = dateKey(now);
  const start = dateStart(addDays(today, -(needs.days - 1)));
  const tomorrow = dateStart(addDays(today, 1));
  const daily = energyId
    ? await fetchChanges(hass, costId ? [energyId, costId] : [energyId], start, tomorrow, 'day')
    : {};
  const hourly =
    energyId && needs.hourlyDays > 0
      ? await fetchChanges(
          hass,
          [energyId],
          dateStart(addDays(today, -needs.hourlyDays)),
          tomorrow,
          'hour',
        )
      : {};
  const hourlyEnergy = energyId ? (hourly[energyId] ?? []) : [];
  const days = energyId
    ? buildDays(daily[energyId] ?? [], costId ? daily[costId] : undefined, hourlyEnergy, tariff)
    : [];
  let devices: DeviceEnergy[] = [];
  if (needs.devices && sources.devices.length) {
    const from = dateStart(addDays(today, -((needs.deviceDays ?? needs.days) - 1)));
    const changes = await fetchChanges(
      hass,
      sources.devices.map((device) => device.stat),
      from,
      tomorrow,
      'day',
    );
    devices = sources.devices.map((device) => {
      const daily = changes[device.stat] ?? [];
      return {
        ...device,
        daily,
        kwh: daily.reduce((sum, item) => sum + Math.max(0, item.change), 0),
      };
    });
  }
  return { sources, energyId, costId, days, hourly: hourlyEnergy, devices, today, loadedAt: now };
}

/** How often a card reads the data again. */
export const ENERGY_REFRESH_MS = 15 * 60_000;

/**
 * Loads the energy data of a card when its inputs change and every quarter of
 * an hour, then asks the card to render.
 */
export class EnergyController implements ReactiveController {
  data?: EnergyData;
  error?: string;
  loading = false;
  private key?: string;
  private timer?: number;
  private session = 0;

  constructor(
    private readonly host: ReactiveControllerHost & HTMLElement,
    private readonly inputs: () => EnergyInputs | undefined,
  ) {
    host.addController(this);
  }

  hostConnected(): void {
    this.key = undefined;
  }

  hostDisconnected(): void {
    this.stop();
  }

  hostUpdated(): void {
    const inputs = this.inputs();
    if (!inputs || !this.host.isConnected) return;
    const key = JSON.stringify([
      inputs.energy,
      inputs.cost,
      inputs.needs,
      inputs.tariff.offPeakRanges,
    ]);
    if (key === this.key) return;
    this.key = key;
    this.stop();
    void this.load();
    this.timer = window.setInterval(() => void this.load(), ENERGY_REFRESH_MS);
  }

  /** Reads the data now. */
  async load(): Promise<void> {
    const inputs = this.inputs();
    if (!inputs) return;
    const session = ++this.session;
    this.loading = true;
    try {
      const data = await loadEnergy(inputs);
      if (session !== this.session) return;
      this.data = data;
      this.error = data.energyId ? undefined : 'no_source';
    } catch (error) {
      if (session !== this.session) return;
      this.error = (error as Error).message || 'error';
    } finally {
      if (session === this.session) {
        this.loading = false;
        this.host.requestUpdate();
      }
    }
  }

  private stop(): void {
    if (this.timer !== undefined) window.clearInterval(this.timer);
    this.timer = undefined;
  }
}
