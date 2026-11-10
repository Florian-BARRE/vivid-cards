/* ====== Code Summary ======
 * Which light slot an entity belongs to when nothing says so (0.14–0.17
 * `lights:`, a free badge): its name ends with a light role ("…_leds"), else
 * a switch is a lamp plug and any other light a plain light.
 */

import { domainOf, objectIdOf } from '../../core/entities';
import { roleOf } from './roles';

export type LightRole = 'lampes' | 'leds' | 'interrupteurs';

export function lightRoleOf(entityId: string): LightRole {
  const role = roleOf(objectIdOf(entityId).split('_').pop() ?? '');
  if (role === 'lampes' || role === 'leds' || role === 'interrupteurs') return role;
  return domainOf(entityId) === 'switch' ? 'lampes' : 'interrupteurs';
}
