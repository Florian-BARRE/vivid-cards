/* ====== Code Summary ======
 * Plain words for the power button in the editor: what a way runs
 * ("Restores Salon État (scene.vivid_pilot_salon_state)", "turns off the
 * lights: …") and the section's one-line hint.
 */

import { friendlyName } from '../../core/entities';
import type { HomeAssistant } from '../../core/hass-types';
import { editorText } from '../../i18n/editor';
import { slotText } from '../../i18n/slots';
import type { RoomHeaderCardConfig } from './config';
import type { PowerPlan, PowerWay } from './power-action';

export function describeWay(
  hass: HomeAssistant | undefined,
  way: PowerWay,
  turnOn: boolean,
): string {
  const names = way.entities.map((id) => (hass?.states[id] ? friendlyName(hass, id) : id));
  if (way.source === 'scene') {
    return `${editorText(hass, 'rh_tap_scene')} ${names.join(', ')} (${way.entities.join(', ')})`;
  }
  if (way.source === 'lights') {
    return `${editorText(hass, turnOn ? 'rh_tap_lights_on' : 'rh_tap_lights_off')} : ${names.join(', ')}`;
  }
  return slotText(hass, 'action_none');
}

export function powerHint(
  hass: HomeAssistant | undefined,
  config: RoomHeaderCardConfig,
  plan: PowerPlan | undefined,
): string {
  if (config.power_button?.on_action || config.power_button?.off_action) {
    return editorText(hass, 'rh_power_hint_config');
  }
  return editorText(
    hass,
    plan?.on.source === 'scene' ? 'rh_power_hint_scene' : 'rh_power_hint_lights',
  );
}
