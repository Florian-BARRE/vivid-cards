/**
 * Timing shared by every press gesture of the cards and badges, so a long
 * press feels the same everywhere.
 */

/**
 * A press held this long is a hold. Shorter than the ~500 ms after which
 * phones start their own long-press behaviour (text selection, context menu),
 * so the hold wins instead of racing it.
 */
export const HOLD_MS = 450;
