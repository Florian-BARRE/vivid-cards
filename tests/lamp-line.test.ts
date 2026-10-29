import { beforeEach, describe, expect, it } from 'vitest';
import { LAMP_PLUGS_GROUP_ID } from '../dev/mock-hass';
import { resolveLampConfig } from '../src/cards/lamp-group/config';
import {
  FOLD_STORAGE_PREFIX,
  canFold,
  clearFoldMemory,
  decodeFold,
  encodeFold,
  foldKey,
  initialFold,
  rememberFold,
  type FoldStorage,
} from '../src/cards/lamp-group/fold';

const config = (extra: Record<string, unknown> = {}) =>
  resolveLampConfig({
    type: 'custom:vivid-lamp-group',
    entity: LAMP_PLUGS_GROUP_ID,
    layout: 'line',
    ...extra,
  });

class MemoryStorage implements FoldStorage {
  items = new Map<string, string>();
  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }
}

const broken: FoldStorage = {
  getItem() {
    throw new Error('denied');
  },
  setItem() {
    throw new Error('quota');
  },
};

beforeEach(() => clearFoldMemory());

describe('expandable line config', () => {
  it('is expandable and folded by default', () => {
    expect(config()).toMatchObject({ layout: 'line', expandable: true, expanded: false });
  });

  it('reads expandable and expanded', () => {
    expect(config({ expandable: false, expanded: true })).toMatchObject({
      expandable: false,
      expanded: true,
    });
  });

  it('rejects values that are not booleans', () => {
    expect(() => config({ expandable: 'yes' })).toThrow(/expandable/);
    expect(() => config({ expanded: 1 })).toThrow(/expanded/);
  });

  it('only folds the line layout', () => {
    expect(canFold(config())).toBe(true);
    expect(canFold(config({ expandable: false }))).toBe(false);
    expect(canFold(config({ layout: 'ambiance' }))).toBe(false);
    expect(canFold(config({ layout: undefined }))).toBe(false);
  });
});

describe('fold state', () => {
  it('keys the storage by the entity, else the listed entities', () => {
    expect(foldKey(config())).toBe(`${FOLD_STORAGE_PREFIX}${LAMP_PLUGS_GROUP_ID}`);
    expect(foldKey(config({ entity: undefined, entities: ['switch.a', 'switch.b'] }))).toBe(
      `${FOLD_STORAGE_PREFIX}switch.a,switch.b`,
    );
  });

  it('encodes and decodes a choice', () => {
    expect(encodeFold({ expanded: true, base: false })).toBe('1:0');
    expect(decodeFold('1:0')).toEqual({ expanded: true, base: false });
    expect(decodeFold('0:1')).toEqual({ expanded: false, base: true });
    expect(decodeFold('true')).toBeUndefined();
    expect(decodeFold(null)).toBeUndefined();
  });

  it('starts from expanded without a remembered choice', () => {
    const storage = new MemoryStorage();
    expect(initialFold(config(), storage)).toBe(false);
    expect(initialFold(config({ expanded: true }), storage)).toBe(true);
  });

  it('never starts unfolded when it cannot fold', () => {
    const storage = new MemoryStorage();
    expect(initialFold(config({ expandable: false, expanded: true }), storage)).toBe(false);
    expect(initialFold(config({ layout: 'ambiance', expanded: true }), storage)).toBe(false);
  });

  it('remembers a choice in memory and in the storage', () => {
    const storage = new MemoryStorage();
    rememberFold(config(), true, storage);
    expect(storage.getItem(`${FOLD_STORAGE_PREFIX}${LAMP_PLUGS_GROUP_ID}`)).toBe('1:0');
    expect(initialFold(config(), undefined)).toBe(true);
    clearFoldMemory();
    // After a reload, the storage still has it.
    expect(initialFold(config(), storage)).toBe(true);
  });

  it('starts over when expanded changes in the config', () => {
    const storage = new MemoryStorage();
    rememberFold(config(), true, storage);
    expect(initialFold(config({ expanded: true }), storage)).toBe(true);
    rememberFold(config({ expanded: true }), false, storage);
    expect(initialFold(config({ expanded: true }), storage)).toBe(false);
    expect(initialFold(config(), storage)).toBe(false);
  });

  it('keeps a choice per card', () => {
    const storage = new MemoryStorage();
    rememberFold(config(), true, storage);
    expect(initialFold(config({ entity: 'switch.chambre_lampes' }), storage)).toBe(false);
  });

  it('survives a storage that throws', () => {
    expect(() => rememberFold(config(), true, broken)).not.toThrow();
    expect(initialFold(config(), broken)).toBe(true);
    clearFoldMemory();
    expect(initialFold(config(), broken)).toBe(false);
  });
});
