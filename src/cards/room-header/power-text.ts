/* ====== Code Summary ======
 * Plain words for the power button in the editor: what a way runs
 * ("Runs salon-scripts-on (script.salon_scripts_on)", "turns off the
 * lights: …") and the section's one-line hint.
 */

import { friendlyName } from '../../core/entities';
import type { HomeAssistant } from '../../core/hass-types';
import { editorText } from '../../i18n/editor';
import { slotText } from '../../i18n/slots';
import type { RoomHeaderCardConfig } from './config';
import type { PowerWay } from './power-action';
import type { RoomSlots } from './room-slots';

export function describeWay(
  hass: HomeAssistant | undefined,
  way: PowerWay,
  turnOn: boolean,
): string {
  const names = way.entities.map((id) => (hass?.states[id] ? friendlyName(hass, id) : id));
  if (way.source === 'script') {
    return `${slotText(hass, 'action_runs')} ${names.join(', ')} (${way.entities.join(', ')})`;
  }
  if (way.source === 'lights') {
    return `${editorText(hass, turnOn ? 'rh_tap_lights_on' : 'rh_tap_lights_off')} : ${names.join(', ')}`;
  }
  return slotText(hass, 'action_none');
}

export function powerHint(
  hass: HomeAssistant | undefined,
  config: RoomHeaderCardConfig,
  slots: RoomSlots | undefined,
): string {
  if (config.power_button?.on_action || config.power_button?.off_action) {
    return editorText(hass, 'rh_power_hint_config');
  }
  const scripts =
    slots &&
    (slots.scripts_on.entities.length ||
      slots.scripts_off.entities.length ||
      slots.scripts_toggle.entities.length);
  return editorText(hass, scripts ? 'rh_power_hint_room' : 'rh_power_hint_lights');
}
