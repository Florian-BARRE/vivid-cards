/* ====== Code Summary ======
 * Slots: what a card expects (its lights, its power sensor, its presence…),
 * found automatically, tweaked, written by hand or turned off. The one
 * facade the cards and the editors import.
 */

export {
  AreaSource,
  DEFAULT_PATTERN,
  DiscoverySource,
  GroupSource,
  NamingSource,
  SOURCE_KINDS,
  areaForRoom,
  areaOf,
  fillPattern,
  isValidPattern,
  nameKey,
  type Found,
  type RoleQuery,
  type SourceKind,
} from './discovery';
export {
  discover,
  resolveSlot,
  type EntryOrigin,
  type ResolvedSlot,
  type SlotEntry,
} from './resolve';
export {
  addEntity,
  isTweaked,
  moveEntity,
  parseSlot,
  readSlot,
  removeEntity,
  setExcluded,
  setMode,
  writeSlot,
  type ParsedSlot,
  type SlotMode,
  type SlotTweaks,
  type SlotValue,
} from './slot-value';
