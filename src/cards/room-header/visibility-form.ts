/* ====== Code Summary ======
 * The "shown only when" part of a badge's options: a mode (always, when an
 * entity is in a state, when it is not), the entity and the state, read back
 * as one Home Assistant state condition.
 */

import type { HomeAssistant } from '../../core/hass-types';
import { slotText } from '../../i18n/slots';
import type { StateCondition } from './config';

type Form = Record<string, unknown>;

export function visibilityModeField(hass: HomeAssistant | undefined): Form {
  const s = (key: Parameters<typeof slotText>[1]) => slotText(hass, key);
  return {
    name: 'visible_mode',
    selector: {
      select: {
        mode: 'dropdown',
        options: [
          { value: 'always', label: s('visible_always') },
          { value: 'is', label: `${s('visible_when')} … ${s('visible_state')}` },
          { value: 'not', label: `${s('visible_when')} … ${s('visible_state_not')}` },
        ],
      },
    },
  };
}

export function visibilityFields(): Form {
  return {
    type: 'grid',
    name: '',
    schema: [
      { name: 'visible_entity', selector: { entity: {} } },
      { name: 'visible_state', selector: { text: {} } },
    ],
  };
}

export function visibilityLabel(
  hass: HomeAssistant | undefined,
  name: string,
  mode: string,
): string | undefined {
  if (name === 'visible_mode') return slotText(hass, 'visible');
  if (name === 'visible_entity') return slotText(hass, 'visible_entity');
  if (name === 'visible_state') {
    return slotText(hass, mode === 'not' ? 'visible_state_not' : 'visible_state');
  }
  return undefined;
}

/** The visibility fields → one state condition, or none. */
export function visibilityConditions(value: Form): StateCondition[] | undefined {
  if (value.visible_mode === 'always' || !value.visible_mode) return undefined;
  const entity = typeof value.visible_entity === 'string' ? value.visible_entity : '';
  const state = typeof value.visible_state === 'string' ? value.visible_state.trim() : '';
  const condition: StateCondition = { condition: 'state', entity };
  if (value.visible_mode === 'not') condition.state_not = state;
  else condition.state = state;
  return [condition];
}
