import { domainOf } from './entities';
import type { HomeAssistant } from './hass-types';

export type HapticType =
  'success' | 'warning' | 'failure' | 'light' | 'medium' | 'heavy' | 'selection';

export function fireEvent<T>(node: EventTarget, type: string, detail?: T): void {
  node.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
}

/** Opens Home Assistant's more-info dialog. `node` must be attached to the HA document tree. */
export function openMoreInfo(node: EventTarget, entityId: string): void {
  fireEvent(node, 'hass-more-info', { entityId });
}

/** Asks the companion app for haptic feedback (ignored by browsers). */
export function haptic(node: EventTarget, type: HapticType): void {
  fireEvent(node, 'haptic', type);
}

export function toggleEntity(hass: HomeAssistant, entityId: string): Promise<unknown> {
  const domain = domainOf(entityId);
  const service = domain === 'light' || domain === 'switch' ? domain : 'homeassistant';
  return hass.callService(service, 'toggle', {}, { entity_id: entityId });
}

/** 0 % turns the light off. */
export function setBrightness(
  hass: HomeAssistant,
  entityId: string,
  percent: number,
): Promise<unknown> {
  if (percent <= 0) return hass.callService('light', 'turn_off', {}, { entity_id: entityId });
  return hass.callService(
    'light',
    'turn_on',
    { brightness_pct: Math.round(percent) },
    { entity_id: entityId },
  );
}

export function setHue(
  hass: HomeAssistant,
  entityId: string,
  hue: number,
  saturation: number,
): Promise<unknown> {
  return hass.callService(
    'light',
    'turn_on',
    { hs_color: [Math.round(hue), Math.round(saturation)] },
    { entity_id: entityId },
  );
}

export function setEffect(hass: HomeAssistant, entityId: string, effect: string): Promise<unknown> {
  return hass.callService('light', 'turn_on', { effect }, { entity_id: entityId });
}

export function selectOption(
  hass: HomeAssistant,
  entityIds: readonly string[],
  option: string,
): Promise<unknown> {
  if (entityIds.length === 0) return Promise.resolve();
  return hass.callService('select', 'select_option', { option }, { entity_id: [...entityIds] });
}
