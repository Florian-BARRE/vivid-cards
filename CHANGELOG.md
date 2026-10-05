# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [0.9.0] - 2026-10-05

### Added

- Lamp card display options: `show_names` and `show_status` (both off: icons
  only), `size` (`small`, `medium`, `large`), `columns` (lamps per row),
  `show_header`, `show_count` and `show_toggle_all`.
- Lamp card gestures: `tap_action` and `hold_action` on a lamp (`toggle`,
  `details`, `more-info` or `none`), with a Gestures section in the editor.

## [0.8.0] - 2026-10-05

### Added

- `vivid-lamp-group` card for lamps on smart plugs, wall switches or on/off
  lights. Two layouts: `ambiance` (quick presets and a round button per lamp)
  and `line` (the whole group on one line). Each lamp glows with what it draws
  and shows its watts and how long it has been on or off; off, its icon
  switches to the outline or crossed-out variant. Presets turn some lamps on
  and the others off, or activate a Home Assistant scene. A lamp on that draws
  nothing (bulb out) gets a red bulb. The details show today's timeline of
  each lamp, the energy of the day and its cost. Full visual editor.
- `price_entity` on the lamp card and `power.price_entity` on the LED card: the
  price of a kWh can come from a `sensor` or an `input_number`.

## [0.7.0] - 2026-10-05

### Added

- Dedicated badges: `vivid-led-badge` (LED strips, crossed-out strip icon),
  `vivid-lamp-badge` (lamps, bulbs or plugs, in amber), `vivid-window-badge`
  (window icons) and `vivid-door-badge` (door icons; garage doors keep theirs
  in the details). Each has its own name in the badge picker and suggests a
  matching group.
- README: banner, logo, badges, a gallery of screenshots and one per badge.

### Changed

- `vivid-light-badge` is now for any other lights; its icon follows the entity.
- `vivid-opening-badge` keeps working but is no longer offered in the badge
  picker: use the window and door badges.

### Fixed

- README images use absolute links, so they show in HACS.

## [0.6.0] - 2026-10-05

### Added

- `vivid-opening-badge`: doors and windows open out of the total; the color
  warms up with the oldest opening (`warn_after`, `alert_after`) and pulses
  when it is late.
- `vivid-presence-badge`: one room (present for, or seen ago) or rooms
  occupied out of the total, with each room's last six hours in the details.
- `vivid-illuminance-badge`: mean (or `aggregate`) of a group, with an icon
  from the moon to the sun, a color and a log gauge ring.
- `vivid-power-badge`: sum of a group (kW converted) with the consumption glow
  of the LED card, pulsing from half of `max`.
- `vivid-battery-badge`: lowest battery of a group or of the whole home, in an
  icon that empties and turns red; `display: low_count` shows how many are low.
- Every status badge: `look`, `glow`, `entities` instead of a group, details
  under the badge where a row opens the entity's dialog, and a visual editor.

### Changed

- The light badge shares the new badge base; its behavior is unchanged.

## [0.5.1] - 2026-10-05

### Added

- `show_zero` on `vivid-light-badge`: `0/3` next to the crossed-out icon when
  everything is off.
- The light badge accepts lamps on smart plugs: a `switch`, a switch group or
  an old-style `group.`. On/off lamps and plugs show no slider in the details.

## [0.5.0] - 2026-10-05

### Added

- `vivid-light-badge`, a badge for the badge bar: a light group's lights on out
  of the total, in their colors with a halo that grows with the brightness;
  the crossed-out icon, greyed, when everything is off. A tap turns everything
  off (or on when all are off); a hold opens every light under the badge with
  a switch and a brightness slider (`layout: list`) or as compact chips
  (`layout: compact`). `look: disc` colors a disc behind the icon,
  `look: pill` the whole badge. Visual editor included.
- `appearance.glow_boost` (and the badge's `glow_boost`): how much the halo
  grows with the brightness, 0 to 200 %.

### Changed

- `appearance.glow` is a percentage from 0 to 200 and scales the halo's
  opacity as well as its size, so a low value gives a discreet halo. `off`,
  `soft`, `normal` and `strong` still work (0, 50, 100, 170 %); `soft` is now
  softer than before.
- On a very light color (white or warm white light), the power button icon
  turns dark so it stays visible.

## [0.4.1] - 2026-10-04

### Changed

- The power button halo grows with the brightness: a soft rim when dimmed, a
  wide bright bloom at full power. A group's gradient bleeds its first and
  last colors out on each side. `appearance.glow` still scales it.

## [0.4.0] - 2026-10-04

### Added

- Consumption chart over 6 hours, 24 hours or 7 days (7 days from the
  long-term statistics): one stacked area per light, axis in watts, hour or
  day labels, a cursor that reads every light, today / period / peak with the
  cost, and each light's share.
- WLED **Settings** panel per strip: preset, playlist, palette, effect speed
  and intensity, reverse, freeze, nightlight and sync switches.
- `members[].transition` overrides `tile.transition` for one light.

### Changed

- The WLED controls and device facts fold into two panels opened from tabs
  that summarize them; the **Device** panel is a compact grid of facts with
  the firmware, update and restart on one row.
- Lights without data are left out of the chart and marked in its legend.
- README: quick start, recipes, WLED notes and troubleshooting.

### Fixed

- The WLED uptime sensor is found with its translation key, and WLED entities
  with an unknown key fall back to their domain and device class.

## [0.3.0] - 2026-10-04

### Added

- Favorite colors on the tile and per light in the details (hex, RGB or
  kelvin, with an optional brightness).
- Entity badges on the tile and on top of the details.
- Details: 24 h consumption chart, energy used today per light and in total,
  and its cost with `power.price`.
- Details for WLED strips: presets, playlists, palette, effect speed and
  intensity, and a device panel (Wi-Fi, uptime, LEDs, current limit, memory,
  IP, firmware, nightlight and sync switches, update, restart with
  confirmation). Two columns on large screens.
- Appearance: glow level, header on/off, compact layout, gradient power
  button for groups, shimmer while an effect runs, custom glow colors.
- Brightness minimum and step, transition sent with every light command.
- Glow scale from WLED's current limit × voltage when `power.max` is not set.
- `details.sort: custom` with `details.order`, and `members[].icon`.

### Changed

- The ambilight button is amber while the strips show the realtime stream
  (live override off) and grey while WLED ignores it.
- The visual editor groups its options into foldable sections that summarize
  their settings; detected lights fold to one row each.
- Releases are created automatically when a new version reaches `main`.

### Fixed

- WLED preset and playlist pickers stay usable when nothing is running
  (their state is `unknown` then).

## [0.2.0] - 2026-10-04

### Added

- Visual editor for `vivid-led-group`: pick the entity first, see what was
  detected (group, WLED, color or tunable white, consumption sources) and
  set each light: ambilight participation, measurement, name, visibility in
  the details. Tile, gestures, details and glow under "Advanced".
- Configurable tile gestures (`tile.tap_action`, `hold_action`,
  `double_tap_action`) with Home Assistant actions plus `details`.
- Color temperature bar for tunable white lights (`color_bar: auto` picks it).
- Per-light measurement: `members[].power_mode` (`auto`, `sensor`, `voltage`,
  `none`) and `members[].voltage`.
- `members[].ambilight: false` leaves a strip out of the group ambilight badge.
- Details options: `enabled`, `sort`, `summary`, `effects`, `color_bar`.

### Changed

- Options are grouped in sections: `tile`, `power`, `ambilight`, `details`.
  0.1 options are still read (see "Upgrading from 0.1" in the README).
- Without a card icon, each light keeps its own icon.
- Short names keep the word before a bare number ("Spot 1" instead of "1").

## [0.1.1] - 2026-10-04

### Changed

- The LED group card has no frame anymore: the header sits on the dashboard
  and the tile is the card, with three surface levels taken from the theme.
- The color bar stays fully saturated when the light is off.
- The effect picker shows "Effect" when no effect is active.

## [0.1.0] - 2026-10-04

### Added

- `vivid-led-group` card: header with consumption, live override and power
  badges, brightness tile with effect picker and color bar, details dialog per
  strip, visual editor.
- Discovery of group members, WLED live override and estimated current, and
  power sensors through the Home Assistant registries.
- Glow system: power button filled with the light color, consumption badge
  glowing with the power drawn.
- English and French interface.
- Preview page with a simulated Home Assistant, unit tests, CI and release
  workflows.

[0.9.0]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.9.0
[0.8.0]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.8.0
[0.7.0]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.7.0
[0.6.0]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.6.0
[0.5.1]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.5.1
[0.5.0]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.5.0
[0.4.1]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.4.1
[0.4.0]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.4.0
[0.3.0]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.3.0
[0.2.0]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.2.0
[0.1.1]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.1.1
[0.1.0]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.1.0
