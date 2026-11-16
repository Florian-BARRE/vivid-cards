import { choice, failer, resolveEnergyBase, type ResolvedEnergyBase } from '../../energy/config';

export const ENERGY_CALENDAR = 'vivid-energy-calendar';

/** The month with the day under it, or the day alone (the former load curve card). */
export type CalendarShow = 'month' | 'day';
export const CALENDAR_SHOWS: CalendarShow[] = ['month', 'day'];

export interface ResolvedEnergyCalendar extends ResolvedEnergyBase {
  show: CalendarShow;
}

export function resolveEnergyCalendar(raw: unknown): ResolvedEnergyCalendar {
  const base = resolveEnergyBase(ENERGY_CALENDAR, raw);
  const config = raw as Record<string, unknown>;
  return {
    ...base,
    show: choice(config, 'show', CALENDAR_SHOWS, 'month', failer(ENERGY_CALENDAR)),
  };
}
