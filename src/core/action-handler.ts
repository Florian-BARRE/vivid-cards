import { fireEvent, openMoreInfo, toggleEntity } from './actions';
import type { HomeAssistant } from './hass-types';

/**
 * Card actions, following Home Assistant's action syntax plus `details`
 * (open the card's own details dialog).
 */
export type ActionName =
  | 'toggle'
  | 'more-info'
  | 'details'
  | 'navigate'
  | 'url'
  | 'perform-action'
  | 'call-service'
  | 'none';

export interface ActionConfig {
  action: ActionName;
  navigation_path?: string;
  url_path?: string;
  perform_action?: string;
  service?: string;
  data?: Record<string, unknown>;
  service_data?: Record<string, unknown>;
  target?: Record<string, unknown>;
}

/** Actions offered by the visual editor; the others are YAML only. */
export const SIMPLE_ACTIONS: ActionName[] = ['toggle', 'details', 'more-info', 'none'];

const ACTIONS = new Set<ActionName>([
  'toggle',
  'more-info',
  'details',
  'navigate',
  'url',
  'perform-action',
  'call-service',
  'none',
]);

/** Accepts `"toggle"` or `{ action: "toggle" }`; `undefined` keeps the default. */
export function normalizeAction(value: unknown, field: string): ActionConfig | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const config = typeof value === 'string' ? { action: value } : value;
  if (typeof config !== 'object' || config === null) {
    throw new Error(`"${field}" must be an action such as "toggle" or { action: navigate }.`);
  }
  const action = (config as { action?: unknown }).action;
  if (typeof action !== 'string' || !ACTIONS.has(action as ActionName)) {
    throw new Error(`"${field}" has an unknown action "${String(action)}".`);
  }
  return config as ActionConfig;
}

export interface ActionContext {
  /** Element attached to the Home Assistant tree (events are fired from it). */
  node: HTMLElement;
  hass: HomeAssistant;
  entityId: string;
  openDetails?: () => void;
}

function navigate(path: string): void {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
}

export function runAction(action: ActionConfig | undefined, context: ActionContext): void {
  if (!action) return;
  const { node, hass, entityId } = context;
  switch (action.action) {
    case 'toggle':
      void toggleEntity(hass, entityId);
      return;
    case 'more-info':
      openMoreInfo(node, entityId);
      return;
    case 'details':
      if (context.openDetails) context.openDetails();
      else openMoreInfo(node, entityId);
      return;
    case 'navigate':
      if (action.navigation_path) navigate(action.navigation_path);
      return;
    case 'url':
      if (action.url_path) window.open(action.url_path, '_blank', 'noopener');
      return;
    case 'perform-action':
    case 'call-service': {
      const service = action.perform_action ?? action.service;
      const [domain, name] = service?.split('.', 2) ?? [];
      if (!domain || !name) return;
      void hass.callService(
        domain,
        name,
        action.data ?? action.service_data ?? {},
        action.target as { entity_id?: string | string[] } | undefined,
      );
      return;
    }
    case 'none':
      return;
    default:
      fireEvent(node, 'vivid-unknown-action', action);
  }
}
