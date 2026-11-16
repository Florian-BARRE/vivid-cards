import { type CSSResultGroup } from 'lit';
import { defineElement } from '../../core/register';
import { localize } from '../../i18n';
import {
  choice,
  failer,
  resolveEnergyBase,
  SAMPLE_TARIFF,
  type EnergyBaseConfig,
  type ResolvedEnergyBase,
} from '../../energy/config';
import type { EnergyData, EnergyNeeds } from '../../energy/data';
import { addDays, daysBetween } from '../../energy/days';
import { formatShortDate } from '../../energy/format';
import {
  moneyRing,
  offPeakRingView,
  ringStyles,
  RING_CYCLES,
  type RingCycle,
} from '../../energy/ring';
import { VividEnergyCard, type EnergyHead } from '../../energy/vivid-energy-card';
import { energyEditor } from '../../energy/vivid-energy-editor';
import { billRing } from '../../energy/views';

export { RING_CYCLES, type RingCycle };

export const BILL_RING = 'vivid-bill-ring';

/** Where the money goes, or how much falls in off-peak hours. */
export type RingKind = 'money' | 'off_peak';
export const RING_KINDS: RingKind[] = ['money', 'off_peak'];
export interface BillRingConfig extends EnergyBaseConfig {
  type: string;
  ring?: RingKind;
  cycle?: RingCycle;
}

export interface ResolvedBillRing extends ResolvedEnergyBase {
  ring: RingKind;
  cycle: RingCycle;
}

export function resolveBillRing(raw: unknown): ResolvedBillRing {
  const base = resolveEnergyBase(BILL_RING, raw);
  const config = raw as Record<string, unknown>;
  const fail = failer(BILL_RING);
  return {
    ...base,
    ring: choice(config, 'ring', RING_KINDS, 'money', fail),
    cycle: choice(config, 'cycle', RING_CYCLES, 'last', fail),
  };
}

/**
 * A bill as rings. `money`: where each euro goes (peak, off-peak,
 * subscription), the kWh inside. `off_peak`: the share of kWh (outside) and
 * of money (inside) in off-peak hours, with the mark of an even day.
 */
export class VividBillRing extends VividEnergyCard<ResolvedBillRing> {
  static getConfigElement(): HTMLElement {
    return energyEditor({
      fields: [
        {
          name: 'ring',
          label: 'energy_ring',
          default: 'money',
          options: [
            { value: 'money', label: 'energy_ring_money' },
            { value: 'off_peak', label: 'energy_ring_off_peak' },
          ],
        },
        {
          name: 'cycle',
          label: 'energy_cycle',
          default: 'last',
          options: [
            { value: 'last', label: 'energy_cycle_last' },
            { value: 'current', label: 'energy_cycle_current' },
          ],
        },
      ],
      validate: (config) => resolveBillRing(config),
    });
  }

  static getStubConfig(): Record<string, unknown> {
    return { tariff: SAMPLE_TARIFF };
  }

  static override styles: CSSResultGroup = [VividEnergyCard.styles, ringStyles];

  protected resolveConfig(raw: unknown): ResolvedBillRing {
    return resolveBillRing(raw);
  }

  protected needs(config: ResolvedBillRing, today: string): EnergyNeeds {
    const first = config.tariff.invoices.at(-1)?.from;
    const back = first ? daysBetween(first, today) + 1 : 70;
    return {
      days: Math.min(400, Math.max(70, back)),
      hourlyDays: config.cycle === 'current' ? 32 : 70,
    };
  }

  protected head(config: ResolvedBillRing, data: EnergyData | undefined): EnergyHead {
    const hass = this.hass;
    const ring = data?.days.length
      ? billRing(data.days, config.tariff, data.today, config.cycle)
      : undefined;
    const range = ring
      ? localize(hass, 'energy_bill_range', {
          from: formatShortDate(hass, ring.bar.start),
          to: formatShortDate(hass, addDays(ring.bar.end, -1)),
        })
      : undefined;
    if (config.ring === 'off_peak') {
      return {
        icon: 'mdi:weather-night',
        title: config.name ?? localize(hass, 'energy_off_peak_title'),
        sub: range ? `${range} · ${localize(hass, 'energy_off_peak_sub')}` : undefined,
      };
    }
    return {
      icon: 'mdi:chart-donut',
      title: config.name ?? localize(hass, 'energy_where_title'),
      sub: range ? `${range} · ${localize(hass, 'energy_where_sub')}` : undefined,
    };
  }

  protected renderBody(config: ResolvedBillRing, data: EnergyData) {
    return config.ring === 'off_peak'
      ? offPeakRingView(this.hass, data, config.tariff, config.cycle)
      : moneyRing(this.hass, data, config.tariff, config.cycle);
  }
}

defineElement(BILL_RING, VividBillRing);

// Not in the card picker any more: replaced by the Bill card (`layout: ring`). Still defined, so
// dashboards that use it keep working.

declare global {
  interface HTMLElementTagNameMap {
    'vivid-bill-ring': VividBillRing;
  }
}
