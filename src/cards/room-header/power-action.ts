/* ====== Code Summary ======
 * What the power button of a room header does. Each way (turn on when
 * everything is off, turn off when a light is on) runs, first match wins:
 *   on:  the action set in the editor; the room's Vivid Pilot memory scene
 *        (its last lighting, kept up to date by Vivid Pilot); else the
 *        room's lights are turned on;
 *   off: the action set in the editor; else the room's lights are turned off.
 * Every way is a Home Assistant action, run like any other card action.
 */

import type { ActionConfig } from '../../core/action-handler';
import { domainOf } from '../../core/entities';

/** Where a way of the button comes from. */
export type PowerSource = 'config' | 'scene' | 'lights' | 'none';

export interface PowerWay {
  action?: ActionConfig;
  source: PowerSource;
  /** The scene or the lights it runs on, for the editor. */
  entities: string[];
}

export interface PowerPlan {
  on: PowerWay;
  off: PowerWay;
}

/** Service that runs an entity: a script, a scene, an automation or a button. */
const RUN_SERVICES: Record<string, string> = {
  script: 'script.turn_on',
  scene: 'scene.turn_on',
  automation: 'automation.trigger',
  button: 'button.press',
  input_button: 'input_button.press',
};

/** The action that runs an entity (`scene.vivid_pilot_salon_state`). */
export function runEntityAction(entity: string): ActionConfig {
  return {
    action: 'perform-action',
    perform_action: RUN_SERVICES[domainOf(entity)] ?? 'homeassistant.turn_on',
    target: { entity_id: entity },
  };
}

function lightsWay(lights: readonly string[], service: 'turn_on' | 'turn_off'): PowerWay {
  if (!lights.length) return { source: 'none', entities: [] };
  return {
    action: {
      action: 'perform-action',
      perform_action: `homeassistant.${service}`,
      target: { entity_id: [...lights] },
    },
    source: 'lights',
    entities: [...lights],
  };
}

/**
 * The two ways of the button. `scene` is the room's memory scene when it can
 * be activated now (memory on and something stored).
 */
export function powerPlan(
  config: { onAction?: ActionConfig; offAction?: ActionConfig },
  scene: string | undefined,
  lights: readonly string[],
): PowerPlan {
  const on: PowerWay = config.onAction
    ? { action: config.onAction, source: 'config', entities: [] }
    : scene
      ? { action: runEntityAction(scene), source: 'scene', entities: [scene] }
      : lightsWay(lights, 'turn_on');
  const off: PowerWay = config.offAction
    ? { action: config.offAction, source: 'config', entities: [] }
    : lightsWay(lights, 'turn_off');
  return { on, off };
}
