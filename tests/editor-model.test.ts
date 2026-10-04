import { describe, expect, it } from 'vitest';
import type { LedGroupCardConfig } from '../src/cards/led-group/config';
import {
  memberOverride,
  setOption,
  setRoot,
  toggleDefaultOn,
  updateMember,
} from '../src/cards/led-group/editor-model';

const base: LedGroupCardConfig = { type: 'custom:vivid-led-group', entity: 'light.salon_leds' };

describe('setRoot', () => {
  it('sets and removes top-level keys', () => {
    const named = setRoot(base, 'name', 'LEDs');
    expect(named.name).toBe('LEDs');
    expect('name' in setRoot(named, 'name', '')).toBe(false);
    expect('name' in setRoot(named, 'name', undefined)).toBe(false);
  });

  it('does not mutate the input', () => {
    setRoot(base, 'name', 'LEDs');
    expect(base).toEqual({ type: 'custom:vivid-led-group', entity: 'light.salon_leds' });
  });
});

describe('setOption', () => {
  it('creates the section on demand', () => {
    expect(setOption(base, 'power', 'voltage', 5).power).toEqual({ voltage: 5 });
  });

  it('drops values equal to the default, and the section once empty', () => {
    const config = setOption(base, 'tile', 'color_bar', 'none', 'auto');
    expect(config.tile).toEqual({ color_bar: 'none' });
    expect('tile' in setOption(config, 'tile', 'color_bar', 'auto', 'auto')).toBe(false);
  });

  it('keeps the other keys of the section', () => {
    const config = setOption(
      { ...base, power: { sensor_pattern: 'sensor.{object_id}_puissance', max: 34 } },
      'power',
      'max',
      40,
      40,
    );
    expect(config.power).toEqual({ sensor_pattern: 'sensor.{object_id}_puissance' });
  });

  it('keeps false when the default is true', () => {
    expect(setOption(base, 'ambilight', 'enabled', false, true).ambilight).toEqual({
      enabled: false,
    });
  });
});

describe('updateMember', () => {
  const strip = 'light.salon_buffet_wled';

  it('adds an override and removes it once back to the defaults', () => {
    const hidden = updateMember(base, strip, { hidden: true });
    expect(hidden.members).toEqual([{ entity: strip, hidden: true }]);
    expect('members' in updateMember(hidden, strip, { hidden: false })).toBe(false);
  });

  it('drops the defaults of every field', () => {
    const config = updateMember(base, strip, { ambilight: true, power_mode: 'auto', name: '' });
    expect(config.members).toBeUndefined();
  });

  it('merges patches into the same member', () => {
    let config = updateMember(base, strip, { name: 'Buffet' });
    config = updateMember(config, strip, { ambilight: false });
    expect(memberOverride(config, strip)).toEqual({
      entity: strip,
      name: 'Buffet',
      ambilight: false,
    });
  });

  it('forgets the sensor or the voltage when the mode changes', () => {
    let config = updateMember(base, strip, { power_mode: 'sensor' });
    config = updateMember(config, strip, { power_sensor: 'sensor.prise_buffet_power' });
    expect(memberOverride(config, strip)?.power_sensor).toBe('sensor.prise_buffet_power');

    config = updateMember(config, strip, { power_mode: 'voltage', voltage: 12 });
    expect(memberOverride(config, strip)).toEqual({
      entity: strip,
      power_mode: 'voltage',
      voltage: 12,
    });

    config = updateMember(config, strip, { power_mode: 'auto' });
    expect(config.members).toBeUndefined();
  });

  it('leaves other members alone', () => {
    let config = updateMember(base, strip, { hidden: true });
    config = updateMember(config, 'light.salon_canape_wled', { name: 'Sofa' });
    config = updateMember(config, strip, { hidden: false });
    expect(config.members).toEqual([{ entity: 'light.salon_canape_wled', name: 'Sofa' }]);
  });
});

describe('toggleDefaultOn', () => {
  it('cycles unset → false → unset', () => {
    expect(toggleDefaultOn(undefined)).toBe(false);
    expect(toggleDefaultOn(false)).toBeUndefined();
    expect(toggleDefaultOn(true)).toBe(false);
  });
});
