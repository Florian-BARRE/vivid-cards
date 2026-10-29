/**
 * Vivid Cards — entry point. Importing this module registers every card and
 * component as custom elements.
 */
import './cards/led-group/vivid-led-group';
import './cards/lamp-group/vivid-lamp-group';
import './cards/ambilight/vivid-ambilight-card';
import './cards/hyperhdr/vivid-hyperhdr-card';
import './cards/room-header/vivid-room-header';
import './cards/ambilight/focus-cards';
import './cards/focus/vivid-screen-card';
import './cards/focus/vivid-light-card';
import './cards/focus/vivid-power-card';
import './cards/focus/vivid-climate-card';
import './cards/bill/vivid-bill-card';
import './cards/bills/vivid-bills-card';
import './cards/bill-ring/vivid-bill-ring';
import './cards/energy-calendar/vivid-energy-calendar';
import './cards/energy-flow/vivid-energy-flow';
import './cards/energy-ranking/vivid-energy-ranking';
import './cards/load-curve/vivid-load-curve';
import './badges/light/vivid-light-badge';
import './badges/opening/vivid-opening-badge';
import './badges/presence/vivid-presence-badge';
import './badges/illuminance/vivid-illuminance-badge';
import './badges/power/vivid-power-badge';
import './badges/battery/vivid-battery-badge';
import './badges/climate/vivid-climate-badge';
import './badges/energy/vivid-bill-badge';
import './badges/energy/vivid-tariff-badge';
import './badges/energy/vivid-energy-badge';

export const VERSION = __VIVID_VERSION__;

console.info(
  `%c VIVID CARDS %c v${VERSION} `,
  'color: #fff; background: #ff7043; font-weight: 700; border-radius: 4px 0 0 4px; padding: 2px 4px;',
  'color: #ff7043; background: #2b2b2b; font-weight: 600; border-radius: 0 4px 4px 0; padding: 2px 4px;',
);
