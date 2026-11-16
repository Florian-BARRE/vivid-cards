import {
  choice,
  failer,
  resolveEnergyBase,
  type EnergyBaseConfig,
  type ResolvedEnergyBase,
} from '../../energy/config';

export const BILL_CARD = 'vivid-bill-card';

/** A full card, the same with its split as a ring, or one line that unfolds. */
export type BillLayout = 'card' | 'ring' | 'line';
export const BILL_LAYOUTS: BillLayout[] = ['card', 'ring', 'line'];

export interface BillCardConfig extends EnergyBaseConfig {
  type: string;
  layout?: BillLayout;
  /** The previous cycles under the bill. */
  history?: boolean;
}

export interface ResolvedBillCard extends ResolvedEnergyBase {
  layout: BillLayout;
  history: boolean;
}

export function resolveBillCard(raw: unknown, tag = BILL_CARD): ResolvedBillCard {
  const base = resolveEnergyBase(tag, raw);
  const config = raw as Record<string, unknown>;
  const fail = failer(tag);
  const history = config.history ?? true;
  if (typeof history !== 'boolean') fail('"history" must be true or false.');
  return {
    ...base,
    layout: choice(config, 'layout', BILL_LAYOUTS, 'card', fail),
    history: history as boolean,
  };
}
