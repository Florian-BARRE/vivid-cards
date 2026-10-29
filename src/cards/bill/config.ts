import {
  choice,
  failer,
  resolveEnergyBase,
  type EnergyBaseConfig,
  type ResolvedEnergyBase,
} from '../../energy/config';

export const BILL_CARD = 'vivid-bill-card';

/** A full card, or one line that unfolds. */
export type BillLayout = 'card' | 'line';
export const BILL_LAYOUTS: BillLayout[] = ['card', 'line'];

export interface BillCardConfig extends EnergyBaseConfig {
  type: string;
  layout?: BillLayout;
}

export interface ResolvedBillCard extends ResolvedEnergyBase {
  layout: BillLayout;
}

export function resolveBillCard(raw: unknown): ResolvedBillCard {
  const base = resolveEnergyBase(BILL_CARD, raw);
  const config = raw as Record<string, unknown>;
  return { ...base, layout: choice(config, 'layout', BILL_LAYOUTS, 'card', failer(BILL_CARD)) };
}
