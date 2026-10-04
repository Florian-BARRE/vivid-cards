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

export function toggleEntity(
  hass: HomeAssistant,
  entityId: string,
  options?: LightCallOptions,
): Promise<unknown> {
  const domain = domainOf(entityId);
  const service = domain === 'light' || domain === 'switch' ? domain : 'homeassistant';
  const data = domain === 'light' ? lightData({}, options) : {};
  return hass.callService(service, 'toggle', data, { entity_id: entityId });
}

/** Options added to every light service call. */
export interface LightCallOptions {
  /** Seconds; omitted when undefined. */
  transition?: number;
}

function lightData(
  data: Record<string, unknown>,
  options: LightCallOptions = {},
): Record<string, unknown> {
  return options.transition === undefined ? data : { ...data, transition: options.transition };
}

/** 0 % turns the light off. */
export function setBrightness(
  hass: HomeAssistant,
  entityId: string,
  percent: number,
  options?: LightCallOptions,
): Promise<unknown> {
  if (percent <= 0) {
    return hass.callService('light', 'turn_off', lightData({}, options), { entity_id: entityId });
  }
  return hass.callService(
    'light',
    'turn_on',
    lightData({ brightness_pct: Math.round(percent) }, options),
    { entity_id: entityId },
  );
}

export function setHue(
  hass: HomeAssistant,
  entityId: string,
  hue: number,
  saturation: number,
  options?: LightCallOptions,
): Promise<unknown> {
  return hass.callService(
    'light',
    'turn_on',
    lightData({ hs_color: [Math.round(hue), Math.round(saturation)] }, options),
    { entity_id: entityId },
  );
}

/** A color preset: an RGB color or a color temperature, with an optional brightness. */
export interface ColorPreset {
  rgb?: [number, number, number];
  kelvin?: number;
  /** Percent. */
  brightness?: number;
}

export function applyColor(
  hass: HomeAssistant,
  entityId: string,
  preset: ColorPreset,
  options?: LightCallOptions,
): Promise<unknown> {
  const data: Record<string, unknown> = {};
  if (preset.rgb) data.rgb_color = preset.rgb;
  else if (preset.kelvin !== undefined) data.color_temp_kelvin = Math.round(preset.kelvin);
  if (preset.brightness !== undefined) data.brightness_pct = Math.round(preset.brightness);
  return hass.callService('light', 'turn_on', lightData(data, options), { entity_id: entityId });
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

export function setColorTemperature(
  hass: HomeAssistant,
  entityId: string,
  kelvin: number,
  options?: LightCallOptions,
): Promise<unknown> {
  return hass.callService(
    'light',
    'turn_on',
    lightData({ color_temp_kelvin: Math.round(kelvin) }, options),
    { entity_id: entityId },
  );
}

export function setNumber(hass: HomeAssistant, entityId: string, value: number): Promise<unknown> {
  return hass.callService('number', 'set_value', { value }, { entity_id: entityId });
}

export function pressButton(hass: HomeAssistant, entityId: string): Promise<unknown> {
  return hass.callService('button', 'press', {}, { entity_id: entityId });
}
