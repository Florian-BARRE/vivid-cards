/* ====== Code Summary ======
 * Vivid Pilot for the cards: the index of what the integration generated and
 * its node keys, and the `pilot` option of cards. The one facade cards and
 * editors import.
 */

export {
  HOME_NODE,
  PILOT_CATEGORIES,
  isPilotCategory,
  nodeKey,
  parseNodeKey,
  type PilotCategory,
  type PilotNodeKey,
} from './node-key';
export { PilotIndex, type PilotKind, type PilotRoom } from './pilot-index';
export { pilotStub, pilotTarget, withPilotEntity, type PilotTargetConfig } from './target';
