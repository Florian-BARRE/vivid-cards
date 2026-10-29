import { glowShadow, iconOn, type ChipTone } from '../../core/glow';
import { rgbCss } from '../../core/color';
import type { Rgb } from '../../core/hass-types';
import { resolveEnergyBase } from '../../energy/config';
import { EnergyController, type EnergyNeeds } from '../../energy/data';
import { dateKey } from '../../energy/days';
import type { Tariff } from '../../energy/tariff';
import type { EnergyEditorField } from '../../energy/vivid-energy-editor';
import { ConfigReader, resolveBase, type ResolvedBaseBadge } from '../base/config';
import { VividBadge } from '../base/vivid-badge';

export interface ResolvedEnergyBadge extends ResolvedBaseBadge {
  energy?: string;
  cost?: string;
  tariff: Tariff;
}

/** Options of an energy badge: the common badge ones, the source and the tariff. */
export function resolveEnergyBadge(tag: string, raw: unknown): ResolvedEnergyBadge {
  const reader = new ConfigReader(tag, raw);
  const base = resolveBase(reader, { domains: ['sensor'], entityOptional: true });
  const energy = resolveEnergyBase(tag, raw);
  return { ...base, energy: energy.energy, cost: energy.cost, tariff: energy.tariff };
}

/** A filled disc in a color, white ink, with its halo. */
export function solidTone(color: Rgb): ChipTone {
  return { background: rgbCss(color), iconColor: iconOn(color), shadow: glowShadow([color], 0.7) };
}

/** Editor fields every energy badge has. */
export const ENERGY_BADGE_FIELDS: EnergyEditorField[] = [
  {
    name: 'look',
    label: 'badge_look',
    default: 'disc',
    options: [
      { value: 'disc', label: 'look_disc' },
      { value: 'pill', label: 'look_pill' },
    ],
  },
  {
    name: 'glow',
    label: 'glow',
    selector: { number: { min: 0, max: 200, step: 10, mode: 'slider', unit_of_measurement: '%' } },
    default: 100,
  },
];

/** Base of the badges reading the energy statistics. */
export abstract class VividEnergyBadge<C extends ResolvedEnergyBadge> extends VividBadge<C> {
  protected readonly energy = new EnergyController(this, () => {
    const needs = this.needs();
    return this.hass && this._config && needs
      ? {
          hass: this.hass,
          energy: this._config.energy,
          cost: this._config.cost,
          tariff: this._config.tariff,
          needs,
        }
      : undefined;
  });

  /** What to read; nothing for a badge that only needs the tariff. */
  protected abstract needs(): EnergyNeeds | undefined;

  protected today(): string {
    return dateKey(Date.now());
  }
}
