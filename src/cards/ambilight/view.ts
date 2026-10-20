import type { SourceLabels } from '../../components/vivid-source-row';
import { tintTone, type ChipTone } from '../../core/glow';
import type { HomeAssistant, Rgb } from '../../core/hass-types';
import { localize, type StringKey } from '../../i18n';
import { temperatureColor, type Alarm, type AmbilightModel, type PiStatus } from './model';

export const GREEN: Rgb = [102, 187, 106];
export const AMBER: Rgb = [255, 193, 7];
export const ORANGE: Rgb = [255, 112, 67];
export const RED: Rgb = [239, 83, 80];
export const GREY: Rgb = [158, 158, 158];
export const FAN_RGB: Rgb = [77, 182, 245];

/** A number with exactly `digits` decimals, in the user's locale. */
export function fixed(hass: HomeAssistant | undefined, value: number, digits = 0): string {
  try {
    return new Intl.NumberFormat(hass?.locale?.language ?? hass?.language ?? 'en', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return value.toFixed(digits);
  }
}

/** "37,2 °C" with a non-breaking space. */
export function celsius(hass: HomeAssistant | undefined, value: number, digits = 1): string {
  return `${fixed(hass, value, digits)}\u00a0°C`;
}

/** Overheat threshold of the device, 55 °C by default. */
export function overheatOf(model: AmbilightModel): number {
  return model.curve.overheat.value ?? 55;
}

/** Color of the box: its temperature, red on an alarm, amber without sensor. */
export function healthColor(model: AmbilightModel): Rgb | undefined {
  if (!model.online) return undefined;
  if (model.alarms.includes('overheat') || model.alarms.includes('stalled')) return RED;
  if (model.alarms.includes('nosensor')) return AMBER;
  return temperatureColor(model.controlTemperature, overheatOf(model));
}

export function healthIcon(model: AmbilightModel): string {
  if (!model.online) return 'mdi:lan-disconnect';
  if (model.alarms.includes('overheat') || model.alarms.includes('stalled')) return 'mdi:fan-alert';
  return 'mdi:fan';
}

const PI_TEXT: Record<PiStatus, StringKey> = {
  off: 'amb_pi_off',
  on: 'amb_pi_on',
  unknown: 'unavailable',
};

export function piText(hass: HomeAssistant | undefined, status: PiStatus): string {
  return localize(hass, PI_TEXT[status]);
}

/** Tone of the Pi disc: green while powered. */
export function piTone(status: PiStatus): ChipTone | undefined {
  return status === 'on' ? tintTone(GREEN, 0.8) : undefined;
}

/** The worst alarm first. */
export const ALARM_ORDER: Alarm[] = ['offline', 'overheat', 'stalled', 'nosensor'];

export function topAlarm(model: AmbilightModel): Alarm | undefined {
  return ALARM_ORDER.find((alarm) => model.alarms.includes(alarm));
}

const ALARM_SHORT: Record<Alarm, StringKey> = {
  offline: 'amb_offline',
  overheat: 'amb_overheat',
  stalled: 'amb_stalled',
  nosensor: 'amb_nosensor',
};

/** One short status line: the worst alarm, else the fan mode and the Pi. */
export function statusLine(
  hass: HomeAssistant | undefined,
  model: AmbilightModel,
): { text: string; tone?: 'alarm' | 'warn' | 'muted' } {
  const alarm = topAlarm(model);
  if (alarm === 'offline') return { text: localize(hass, ALARM_SHORT.offline), tone: 'muted' };
  if (alarm)
    return {
      text: localize(hass, ALARM_SHORT[alarm]),
      tone: alarm === 'nosensor' ? 'warn' : 'alarm',
    };
  const mode =
    model.fan.mode === undefined
      ? undefined
      : localize(hass, model.fan.mode === 'manual' ? 'amb_manual' : 'amb_auto');
  const text = [mode, piText(hass, model.pi)].filter(Boolean).join(' · ');
  return { text, tone: model.pi === 'off' ? 'muted' : undefined };
}

export interface AlarmView {
  alarm: Alarm;
  color: Rgb;
  icon: string;
  title: string;
  detail: string;
}

export function alarmViews(hass: HomeAssistant | undefined, model: AmbilightModel): AlarmView[] {
  const views: AlarmView[] = [];
  for (const alarm of ALARM_ORDER) {
    if (!model.alarms.includes(alarm)) continue;
    if (alarm === 'offline') {
      views.push({
        alarm,
        color: GREY,
        icon: 'mdi:lan-disconnect',
        title: localize(hass, 'amb_alarm_offline_t'),
        detail: localize(hass, 'amb_alarm_offline'),
      });
    } else if (alarm === 'overheat') {
      const t = model.controlTemperature;
      views.push({
        alarm,
        color: RED,
        icon: 'mdi:thermometer-alert',
        title: localize(hass, 'amb_alarm_overheat_t'),
        detail: localize(hass, 'amb_alarm_overheat', {
          t: t === undefined ? '—' : celsius(hass, t),
          max: celsius(hass, overheatOf(model), 0),
        }),
      });
    } else if (alarm === 'stalled') {
      views.push({
        alarm,
        color: RED,
        icon: 'mdi:fan-alert',
        title: localize(hass, 'amb_alarm_stalled_t'),
        detail: localize(hass, 'amb_alarm_stalled'),
      });
    } else {
      views.push({
        alarm,
        color: AMBER,
        icon: 'mdi:thermometer-off',
        title: localize(hass, 'amb_alarm_nosensor_t'),
        detail: localize(hass, 'amb_alarm_nosensor'),
      });
    }
  }
  return views;
}

/** Seconds a fan turn takes in the spinning icon, from its speed. */
export function spinSeconds(percentage: number | undefined): number | undefined {
  if (!percentage || percentage <= 0) return undefined;
  return Math.round((2.6 - 2 * (Math.min(percentage, 100) / 100)) * 100) / 100;
}

export function sourceLabels(hass: HomeAssistant | undefined): SourceLabels {
  return {
    sending: localize(hass, 'amb_sending'),
    ok: localize(hass, 'amb_ok'),
    fail: localize(hass, 'amb_fail'),
    sent: localize(hass, 'amb_sent'),
  };
}
