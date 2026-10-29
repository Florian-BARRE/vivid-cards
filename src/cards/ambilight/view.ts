import type { SourceLabels } from '../../components/vivid-source-row';
import { tintTone, type ChipTone } from '../../core/glow';
import type { HomeAssistant, Rgb } from '../../core/hass-types';
import { localize, type StringKey, localeOf } from '../../i18n';
import {
  temperatureColor,
  type Alarm,
  type AmbilightModel,
  type LinkState,
  type PiStatus,
} from './model';

export const GREEN: Rgb = [102, 187, 106];
export const AMBER: Rgb = [255, 193, 7];
export const ORANGE: Rgb = [255, 112, 67];
export const RED: Rgb = [239, 83, 80];
export const GREY: Rgb = [158, 158, 158];
export const FAN_RGB: Rgb = [77, 182, 245];

/** A number with exactly `digits` decimals, in the user's locale. */
export function fixed(hass: HomeAssistant | undefined, value: number, digits = 0): string {
  try {
    return new Intl.NumberFormat(localeOf(hass), {
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

/** Overheat threshold of the curve that drives the fan now. */
export function drivingOverheat(model: AmbilightModel): number {
  return model.fan.source === 'cpu' && model.cpu
    ? (model.cpu.overheat.value ?? 80)
    : overheatOf(model);
}

/** Color of the box: its temperature, red on an alarm, amber without sensor. */
export function healthColor(model: AmbilightModel): Rgb | undefined {
  if (!model.online) return undefined;
  if (
    model.alarms.some(
      (alarm) => alarm === 'overheat' || alarm === 'cpuoverheat' || alarm === 'stalled',
    )
  ) {
    return RED;
  }
  if (model.alarms.includes('nosensor')) return AMBER;
  return temperatureColor(model.controlTemperature, drivingOverheat(model));
}

export function healthIcon(model: AmbilightModel): string {
  if (!model.online) return 'mdi:lan-disconnect';
  if (
    model.alarms.some(
      (alarm) => alarm === 'overheat' || alarm === 'cpuoverheat' || alarm === 'stalled',
    )
  ) {
    return 'mdi:fan-alert';
  }
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
export const ALARM_ORDER: Alarm[] = ['offline', 'overheat', 'cpuoverheat', 'stalled', 'nosensor'];

export function topAlarm(model: AmbilightModel): Alarm | undefined {
  return ALARM_ORDER.find((alarm) => model.alarms.includes(alarm));
}

const ALARM_SHORT: Record<Alarm, StringKey> = {
  offline: 'amb_offline',
  overheat: 'amb_overheat',
  cpuoverheat: 'amb_cpu_overheat',
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
    } else if (alarm === 'cpuoverheat') {
      const t = model.cpuTemperature;
      views.push({
        alarm,
        color: RED,
        icon: 'mdi:raspberry-pi',
        title: localize(hass, 'amb_alarm_cpuoverheat_t'),
        detail: localize(hass, 'amb_alarm_cpuoverheat', {
          t: t === undefined ? '—' : celsius(hass, t),
          max: celsius(hass, model.cpu?.overheat.value ?? 80, 0),
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
        // The firmware falls back to 100 % only without the CPU temperature either.
        detail: localize(
          hass,
          model.fan.source === 'cpu' ? 'amb_alarm_nosensor_cpu' : 'amb_alarm_nosensor',
        ),
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

/** The firmware's "Pi status" (English), in the card's language; unknown texts as they are. */
export function piStatusText(hass: HomeAssistant | undefined, status: string): string {
  const known: [RegExp, StringKey][] = [
    [/^pi powered/i, 'amb_ps_on'],
    [/^pi off/i, 'amb_ps_off'],
    [/^pi starting/i, 'amb_ps_starting'],
    [/^shutting the pi down/i, 'amb_ps_shutting'],
    [/^pi shutting down/i, 'amb_ps_halting'],
    [/did not shut down/i, 'amb_ps_timeout'],
    [/^home assistant away/i, 'amb_ps_noha'],
  ];
  const key = known.find(([pattern]) => pattern.test(status))?.[1];
  return key ? localize(hass, key) : status;
}

/** How the editor and the details show the box ↔ HyperHDR link. */
export function linkView(state: LinkState): {
  kind: 'ok' | 'warn' | 'info';
  icon: string;
  rgb: Rgb;
  label: StringKey;
} {
  switch (state) {
    case 'ok':
      return { kind: 'ok', icon: 'mdi:link-variant', rgb: GREEN, label: 'amb_link_ok' };
    case 'unseen':
      return { kind: 'warn', icon: 'mdi:link-variant-off', rgb: AMBER, label: 'amb_link_unseen' };
    case 'waiting':
      return { kind: 'info', icon: 'mdi:timer-sand', rgb: GREY, label: 'amb_link_waiting' };
    case 'away':
      return { kind: 'info', icon: 'mdi:link-variant-off', rgb: GREY, label: 'amb_link_away' };
    case 'legacy':
      return { kind: 'info', icon: 'mdi:chip', rgb: GREY, label: 'amb_link_legacy' };
    default:
      return { kind: 'info', icon: 'mdi:help-circle-outline', rgb: GREY, label: 'amb_link_none' };
  }
}
