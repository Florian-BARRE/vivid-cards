/* ====== Code Summary ======
 * What the power button of a room header does. Each way (turn on when
 * everything is off, turn off when a light is on) runs, first match wins:
 * the action set in the editor; the room's script for that way (or its
 * toggle script); else the room's lights are switched. Every way is a Home
 * Assistant action, run like any other card action.
 */

import type { ActionConfig } from '../../core/action-handler';
import { domainOf } from '../../core/entities';
import type { ResolvedRoomHeaderConfig } from './config';
import type { RoomSlots } from './room-slots';

/** Where a way of the button comes from. */
export type PowerSource = 'config' | 'script' | 'lights' | 'none';

export interface PowerWay {
  action?: ActionConfig;
  source: PowerSource;
  /** The script or the lights it runs on, for the editor. */
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

/** The action that runs an entity (`script.salon_scripts_on`). */
export function runEntityAction(entity: string): ActionConfig {
  return {
    action: 'perform-action',
    perform_action: RUN_SERVICES[domainOf(entity)] ?? 'homeassistant.turn_on',
    target: { entity_id: entity },
  };
}

function way(
  configured: ActionConfig | undefined,
  script: string | undefined,
  lights: readonly string[],
  service: 'turn_on' | 'turn_off',
): PowerWay {
  if (configured) return { action: configured, source: 'config', entities: [] };
  if (script) return { action: runEntityAction(script), source: 'script', entities: [script] };
  if (lights.length) {
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
  return { source: 'none', entities: [] };
}

export function powerPlan(
  config: Pick<ResolvedRoomHeaderConfig, 'onAction' | 'offAction'>,
  slots: Pick<RoomSlots, 'scripts_on' | 'scripts_off' | 'scripts_toggle'>,
  lights: readonly string[],
): PowerPlan {
  const toggle = slots.scripts_toggle.entities[0];
  return {
    on: way(config.onAction, slots.scripts_on.entities[0] ?? toggle, lights, 'turn_on'),
    off: way(config.offAction, slots.scripts_off.entities[0] ?? toggle, lights, 'turn_off'),
  };
}
