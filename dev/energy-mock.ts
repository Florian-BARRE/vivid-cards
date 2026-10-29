/**
 * Energy data for the preview page: a Linky meter (daily kWh and cost, hourly
 * kWh when asked), the devices of the Energy dashboard, and Flo's contract.
 * Answers `energy/get_prefs` and `recorder/statistics_during_period` like Home
 * Assistant.
 */
import type { HomeAssistant } from '../src/core/hass-types';

export const ENERGY_STAT = 'linky:21497105635383';
export const COST_STAT = 'linky:21497105635383_cost';

/** Flo's tariff block (Primeo, peak / off-peak). */
export const FLO_TARIFF = {
  peak: 0.1787,
  off_peak: 0.1344,
  off_peak_hours: ['00:36-05:36', '14:06-17:06'],
  subscription: 16.58,
  billing_day: 12,
  invoices: [
    { from: '2026-09-02', to: '2026-09-11', total: 23.24, kwh: 106 },
    {
      from: '2026-09-12',
      to: '2026-10-11',
      total: 79.52,
      peak_kwh: 285,
      off_peak_kwh: 91,
      subscription: 16.36,
    },
  ],
};

/** Daily kWh, the last one being yesterday. */
const SERIES = [
  2.1, 10.3, 7.4, 13.2, 12.8, 13.9, 12.5, 13.5, 11.2, 11.5, 13.2, 16.5, 16.1, 13.8, 11.6, 13.4,
  10.5, 8.0, 13.1, 13.4, 13.2, 9.8, 10.4, 14.6, 14.2, 11.1, 9.7, 14.2, 12.5, 9.4, 11.7, 12.6, 11.7,
  15.0, 14.4, 10.4, 14.4, 12.5, 11.3, 14.3, 15.5, 11.1, 9.9, 16.9, 11.0, 14.4, 7.2, 8.6, 15.7, 12.1,
  16.2, 12.4, 12.7, 13.7, 19.2, 13.9, 12.6, 13.6, 12.6, 16.9, 9.0, 19.6, 16.8, 10.1, 16.5, 7.8,
  23.0, 16.7, 20.6, 17.7, 12.9, 20.0,
];
const BLEND = 0.168;

/** Devices of the Energy dashboard: name, kWh per day. */
const DEVICES = [
  { stat: 'sensor.prise_ambilight_energy', name: 'Prise ambilight', kwh: 0.28 },
  {
    stat: 'sensor.salon_ambilight_wled_energie',
    name: 'LEDs ambilight',
    kwh: 0.09,
    included: 'sensor.prise_ambilight_energy',
  },
  { stat: 'sensor.lampe_plafond_energy', name: 'Lampe plafond', kwh: 0.08 },
  { stat: 'sensor.suspension_buffet_energy', name: 'Suspension buffet', kwh: 0.05 },
  { stat: 'sensor.lampe_pied_buffet_energy', name: 'Lampe à pied buffet', kwh: 0.03 },
  { stat: 'sensor.lampe_bonhomme_energy', name: 'Lampe bonhomme', kwh: 0.02 },
  { stat: 'sensor.leds_canape_energie', name: 'LEDs canapé', kwh: 0.04 },
  { stat: 'sensor.miroir_chambre_energie', name: 'Miroir chambre', kwh: 0.01 },
];

/** Share of a day's energy in each hour: a standby, a water heater in off-peak hours and two evening peaks. */
const PROFILE = (() => {
  const shape = Array.from({ length: 24 }, (_, hour) => {
    let kw = 0.32;
    if (hour >= 1 && hour < 5) kw = 0.9;
    if (hour >= 7 && hour < 9) kw = 0.8;
    if (hour >= 12 && hour < 14) kw = 1.1;
    if (hour >= 14 && hour < 17) kw = 0.7;
    if (hour >= 18 && hour < 22) kw = 1.5;
    return kw;
  });
  const sum = shape.reduce((total, kw) => total + kw, 0);
  return shape.map((kw) => kw / sum);
})();

function midnight(daysAgo: number): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo).getTime();
}

export interface EnergyMockOptions {
  /** Hourly data for the last days (the Enedis hourly collection). */
  hourlyDays?: number;
  /** No device in the Energy dashboard. */
  noDevices?: boolean;
  /** No grid source. */
  noSource?: boolean;
}

/** Wraps a `callWS` so it answers the energy messages. */
export function withEnergy(
  fallback: HomeAssistant['callWS'],
  options: EnergyMockOptions = {},
): NonNullable<HomeAssistant['callWS']> {
  const days = SERIES.map((kwh, index) => ({ start: midnight(SERIES.length - index), kwh }));
  return async <T>(message: Record<string, unknown>): Promise<T> => {
    if (message.type === 'energy/get_prefs') {
      return {
        energy_sources: options.noSource
          ? []
          : [
              {
                type: 'grid',
                flow_from: [{ stat_energy_from: ENERGY_STAT, stat_cost: COST_STAT }],
              },
            ],
        device_consumption: options.noDevices
          ? []
          : DEVICES.map((device) => ({
              stat_consumption: device.stat,
              name: device.name,
              included_in_stat: device.included,
            })),
      } as T;
    }
    if (message.type === 'recorder/statistics_during_period') {
      const start = Date.parse(String(message.start_time));
      const end = Date.parse(String(message.end_time));
      const ids = message.statistic_ids as string[];
      const period = message.period as string;
      const result: Record<string, { start: number; end: number; change: number }[]> = {};
      const hourlyFrom = midnight(options.hourlyDays ?? 0);
      for (const id of ids) {
        const rows: { start: number; end: number; change: number }[] = [];
        for (const day of days) {
          if (day.start < start || day.start >= end) continue;
          const hourly = day.start >= hourlyFrom && (options.hourlyDays ?? 0) > 0;
          if (id === ENERGY_STAT || id === COST_STAT) {
            const cost = id === COST_STAT;
            if (period === 'hour') {
              if (hourly) {
                PROFILE.forEach((share, hour) => {
                  const kwh = day.kwh * share;
                  rows.push({
                    start: day.start + hour * 3_600_000,
                    end: day.start + (hour + 1) * 3_600_000,
                    change: cost ? kwh * BLEND : kwh,
                  });
                });
              } else {
                // Daily data comes as one row at midnight.
                rows.push({
                  start: day.start,
                  end: day.start + 3_600_000,
                  change: cost ? day.kwh * BLEND : day.kwh,
                });
              }
            } else {
              rows.push({
                start: day.start,
                end: day.start + 86_400_000,
                change: cost ? day.kwh * BLEND : day.kwh,
              });
            }
            continue;
          }
          const device = DEVICES.find((item) => item.stat === id);
          if (!device) continue;
          // Devices measured for the last 40 days only, with a little variety.
          if (day.start < midnight(40)) continue;
          const wobble = 0.7 + ((day.start / 86_400_000) % 7) / 10;
          rows.push({ start: day.start, end: day.start + 86_400_000, change: device.kwh * wobble });
        }
        if (rows.length) result[id] = rows;
      }
      return result as T;
    }
    if (!fallback) throw new Error(`unsupported: ${String(message.type)}`);
    return fallback<T>(message);
  };
}
