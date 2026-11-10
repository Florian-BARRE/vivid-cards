/* ====== Code Summary ======
 * What the power button of a room header triggers. A room may have its own
 * scripts ("sdb-scripts-on", "sdb-scripts-off", "sdb-scripts-toggle") that
 * remember the last state of its lights; the button runs them when they exist
 * (or the scripts, scenes, automations or buttons set in the config), and
 * only falls back to switching the lights itself when nothing else is set.
 * Pure functions, no DOM: tested in tests/room-header.test.ts.
 */

import { domainOf } from '../../core/entities';

/* ============================== Types ============================== */

/** Domains the power button can run, and the service that runs each. */
export const POWER_ACTION_SERVICES: Readonly<Record<string, string>> = {
  script: 'turn_on',
  scene: 'turn_on',
  automation: 'trigger',
  button: 'press',
  input_button: 'press',
};

export const POWER_ACTION_DOMAINS = Object.keys(POWER_ACTION_SERVICES);

/** Where an action of the power button comes from. */
export type PowerSource = 'config' | 'room';

export interface PowerStep {
  entity: string;
  source: PowerSource;
}

/** What the button runs to turn the room on and off; missing steps switch the lights. */
export interface PowerPlan {
  on?: PowerStep;
  off?: PowerStep;
}

/** One Home Assistant service call. */
export interface PowerCall {
  domain: string;
  service: string;
  entities: string[];
}

/** Scripts of the room found by their names. */
export interface RoomScripts {
  on?: string;
  off?: string;
  toggle?: string;
}

/* ============================== Plan ============================== */

/** True when the power button can run this entity (script, scene, automation, button). */
export function isPowerActionEntity(entityId: string): boolean {
  return POWER_ACTION_DOMAINS.includes(domainOf(entityId));
}

/**
 * The plan of the button: the config's `turn_on` / `turn_off` first, then the
 * room's own on / off scripts, then its toggle script for both ways.
 */
export function powerPlan(
  config: { turnOn?: string; turnOff?: string },
  scripts: RoomScripts,
): PowerPlan {
  const step = (configured: string | undefined, ...found: (string | undefined)[]) => {
    if (configured) return { entity: configured, source: 'config' as const };
    const entity = found.find((item): item is string => !!item);
    return entity ? { entity, source: 'room' as const } : undefined;
  };
  return {
    on: step(config.turnOn, scripts.on, scripts.toggle),
    off: step(config.turnOff, scripts.off, scripts.toggle),
  };
}

/** True when the button does something: a step of the plan, or lights to switch. */
export function hasPowerAction(plan: PowerPlan, lights: readonly string[]): boolean {
  return !!plan.on || !!plan.off || lights.length > 0;
}

/* ============================== Call ============================== */

/**
 * The call a tap makes: everything off when something is on, on otherwise.
 * A step of the plan runs its entity; without one the lights are switched.
 * `undefined` when there is nothing to call.
 */
export function powerCall(
  plan: PowerPlan,
  lights: readonly string[],
  anyOn: boolean,
): PowerCall | undefined {
  const step = anyOn ? plan.off : plan.on;
  if (step) {
    const domain = domainOf(step.entity);
    const service = POWER_ACTION_SERVICES[domain];
    if (service) return { domain, service, entities: [step.entity] };
  }
  if (!lights.length) return undefined;
  return {
    domain: 'homeassistant',
    service: anyOn ? 'turn_off' : 'turn_on',
    entities: [...lights],
  };
}
