/**
 * Vivid Cards — entry point. Importing this module registers every card and
 * component as custom elements.
 */
import './cards/led-group/vivid-led-group';
import './badges/light/vivid-light-badge';
import './badges/opening/vivid-opening-badge';
import './badges/presence/vivid-presence-badge';
import './badges/illuminance/vivid-illuminance-badge';
import './badges/power/vivid-power-badge';
import './badges/battery/vivid-battery-badge';

export const VERSION = __VIVID_VERSION__;

console.info(
  `%c VIVID CARDS %c v${VERSION} `,
  'color: #fff; background: #ff7043; font-weight: 700; border-radius: 4px 0 0 4px; padding: 2px 4px;',
  'color: #ff7043; background: #2b2b2b; font-weight: 600; border-radius: 0 4px 4px 0; padding: 2px 4px;',
);
