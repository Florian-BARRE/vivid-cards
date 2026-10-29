# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [0.15.4] - 2026-10-29

### Changed

- `vivid-led-group` with an Ambilight box: the details open on three tabs,
  LEDs (the strips), Ambilight Manager (the box's details and their four
  sub-tabs) and HyperHDR (the live picture while the tab is open, then the
  server and the Pi). HyperHDR's strips take the names of the strips they
  drive. Without a box or HyperHDR, the details stay a single page.

## [0.15.3] - 2026-10-29

### Fixed

- `vivid-led-group` in Ambilight mode no longer keeps the strips' last fixed
  color, and out of it the rail no longer shows the screen's colors: the
  rail takes the strips' own color.

### Added

- Ambilight mode takes the colors the LEDs show: every 4 s while the card is
  visible, a small still of the LED colors of an ambilight strip's HyperHDR
  instance (or, without it, of the captured picture) gives two or three
  colors for the line, the buttons and the rail. Without a picture, the
  screen palette drifts through the hues.
- The HyperHDR section of the group's details can show the live picture.

## [0.15.2] - 2026-10-29

### Changed

- `vivid-led-group` with an Ambilight box: the Ambilight button shows once
  the Pi runs. The collapsible line folds when the Pi starts and unfolds when
  the strips are taken back from the screen while the Pi keeps running.
  Ambilight mode follows the button (Pi running, every ambilight strip on
  the stream).
- Cards speak the language picked in the user's profile, else the server's
  language, else the device's; numbers and dates follow it.

### Fixed

- The day counter of `vivid-bill-card` in `layout: line` is translated.

## [0.15.1] - 2026-10-29

### Fixed

- `vivid-led-group` with an Ambilight box shows its Ambilight button again
  (in the collapsible line and the header). When the Pi is off, a tap starts
  it and switches the strips to the screen.

### Changed

- Ambilight mode: while the screen drives the strips, the LED group keeps
  only the brightness (no color bars, effects or favorites) and its
  collapsible line stays folded. Once the strips are taken back, it is a
  normal LED line again.

## [0.15.0] - 2026-10-29

### Added

- Electricity: `vivid-bill-card` (the bill in progress and its projection, as a
  card or one line), `vivid-bills-card` (past bills, the current one with its
  range, the next one), `vivid-bill-ring` (where each euro goes, or the
  off-peak share), `vivid-energy-calendar` (a day = a price and a color),
  `vivid-energy-flow` and `vivid-energy-ranking` (the devices of the Energy
  dashboard against the meter), `vivid-load-curve` (hourly curve over the
  off-peak hours), and the `vivid-bill-badge`, `vivid-tariff-badge` and
  `vivid-energy-badge` badges. They read the long-term statistics and a
  `tariff` block (prices, off-peak hours, subscription, billing day, invoices).
- `vivid-power-badge`: `cost: month | hour` with a `tariff` adds the cost of
  the power at this pace.

### Changed

- `vivid-room-header`: the halo fades out towards its edges instead of
  stopping at the card's corners.

## [0.14.1] - 2026-10-29

### Added

- `vivid-room-header` finds a room by role, the way group helpers are named:
  `<room>-<role>` (`salon-lampes`, `salon-leds`, `salon-présence`…) matched by
  entity id `<domain>.<room>_<role>` or by name, accents and case ignored. Roles
  in French or English: lampes/lamps, leds, interrupteurs/switches,
  puissance/power, eclairement/illuminance, presence/occupancy,
  fenetres/windows, portes/doors, temperature, humidite/humidity,
  pression/pressure, co2/air. Pressure gets its badge.
- `discover` (on by default with a `room`; `false` for a fully manual header)
  and `exclude` (roles or entity ids to leave out).
- Editor: one chip per role found, tap to exclude it.
- `room` accepts accents and spaces (`Salle de bain`).

### Changed

- `vivid-room-header` `badges` are added to the discovered badges instead of
  replacing them; a listed badge on a discovered entity takes its place (to
  change its options). `discover: false` keeps only the listed ones.

## [0.14.0] - 2026-10-29

A denser dashboard: climate badges and charts, a room header card, lamps and
LEDs on one line that unfold in place, and one LED card for strips driven by
hand or by the screen.

### Added

- `vivid-temperature-badge`, `vivid-humidity-badge`, `vivid-pressure-badge` and
  `vivid-air-quality-badge` (CO₂). The icon disc is filled with the exact color
  of the value on shared scales: temperature from blue to red through yellow and
  orange, humidity from light cyan to deep blue, pressure in violet, CO₂ from
  healthy to toxic green. A halo grows outside the comfort range
  (`comfort: [low, high]`); trend arrows (0.5 °C or 5 points over an hour,
  pressure over three hours); a pulse during a shower and on toxic air; an alert
  when the pressure drops more than 3 hPa in 3 h; the air quality level in words
  and an open-window icon when it is time to air. °F sensors are colored through
  °C and written in °F.
- Several sensors in one climate badge: the temperature range of the rooms with
  a split disc, the most humid room, the worst air, the mean pressure
  (`aggregate` overrides it).
- Climate details: a 24 h curve colored by its value with the comfort band,
  dated min and max, midnight separators, a hover cursor and a summary row (min,
  max, average, time outside comfort, the day before), with 6 h / 24 h / 7 d /
  30 d tabs (7 and 30 days from the long-term statistics). For several sensors,
  one small curve per room on a shared scale and time axis, sorted from the
  furthest to the closest to comfort; tap a room for its own chart.
- `vivid-room-header` card: the room title with its power button, "4 on ·
  138 W" under it, the room badges below, and behind the title one soft glow per
  light source in its real color. Discovers the room's groups from `room:` and
  builds its badges; `name`, `lights`, `power`, `entity`, `badges`,
  `show_subtitle`, `show_badges`, `glow`; visual editor.
- `vivid-lamp-group`, `layout: line`: the line unfolds the lamp grid (watts and
  durations) inside the card. Options `expandable` (default `true`) and
  `expanded`; the choice is remembered per card.
- `vivid-led-group`, `layout: collapsible`: a 64 px line tinted with the LEDs'
  color that unfolds into the tile inside the same card (`expanded`, remembered
  per light).
- `vivid-led-group` Ambilight rail, when the card has an Ambilight box
  (`ambilight.box`, found by itself when the home has one box next to the
  strips): temperature and fan, the red alarm line, the HDMI input menu and a
  switch that starts and stops the Pi cleanly. While the screen drives the
  strips, the tile fills with the captured colors and the color bar steps back
  behind "Colors follow the screen · tap to take over". The details gain the
  Ambilight box and HyperHDR server sections. `ambilight.box: false` removes the
  rail.
- `icon_color` option on every Vivid badge, and `show_label` on
  `vivid-illuminance-badge`.

### Changed

- Vivid badges draw a white icon with a soft shadow on every colored disc;
  `icon_color: auto` restores the dark icon on very light colors.
- Window and door badges show the longest open duration after the count:
  `3/6 · 19 min`.
- `vivid-illuminance-badge` reads `bright` / `dim` / `dark` text sensors (and
  `light`, `twilight`, `night`…), on the lux gauge with a sun, dimmed sun or
  moon icon; icon only unless `show_label: true`.
- `vivid-lamp-group`, `layout: line`: the group icon sits in a disc with an
  amber halo, the line is 64 px high, and a tap on the title unfolds the line
  (hold opens the details; `expandable: false` keeps the previous behaviour).

## [0.13.0] - 2026-10-21

The HyperHDR card, the Ambilight card working with HyperHDR, and compact cards
on one line. Sums up the betas 0.12.0-beta.1 to 0.13.0-beta.2.

### Added

- `vivid-hyperhdr-card`, for HyperHDR through the HA-HyperHDR integration:
  the hub (what it captures, temperature, CPU, RAM) and one line per strip
  (what drives it, its LED device and address, its rate, component states,
  power). Details in four tabs: overview with the picture on demand (1, 2 or
  5 minutes, then it stops by itself), colors, processing, system. The
  editor picks the lines' items as numbered chips.
- Ambilight card with HyperHDR: the Pi's CPU temperature, the Box / Pi CPU
  fan curves and the CPU overheat alarm, the clean shutdown of the Pi with its
  steps, restart over SSH, the server's health, and the editor's diagnosis of
  the box ↔ HyperHDR link with the ESPHome substitutions to write.

### Changed

- Ambilight card on one line by default: the name and its state, the chosen
  values as colored pills, the HDMI input as a menu showing the IR send and
  its echo, a round Pi button. `layout: tiles` keeps the earlier card.
- The details and the menus open in the browser's top layer, above Home
  Assistant's dialogs (the card editor's preview).
- Source buttons without their number.

## [0.13.0-beta.2] - 2026-10-21

### Fixed

- The details and the menus open above Home Assistant's own dialogs: in the
  card editor's preview they showed behind it and could not be used. They
  open as native modal dialogs, in the browser's top layer.
- Lines no longer cut what was asked for: the HyperHDR lines wrap, keeping
  each item whole (`60 Hz` stays together), and the Ambilight values wrap
  under the name.

### Changed

- Values as colored pills: temperatures in their temperature color, the fan
  in blue, humidity in cyan, pressure in lavender, rpm in orange; the HyperHDR
  hub's values likewise.
- Ambilight line: the name and its state on top, the values under it.

## [0.13.0-beta.1] - 2026-10-21

Compact cards: one line each, the details keep everything.

### Changed

- Ambilight card: one line by default (`layout: line`): the values you pick
  next to the name, the input as a menu (icon and name, icon or name) that
  shows the IR send and its echo, a round Pi button whose confirmation and
  shutdown steps show under the name. `layout: tiles` keeps the earlier
  card. Inputs can be hidden from the menu.
- HyperHDR card: one line for the hub (what it captures, temperature, CPU)
  and one per strip (what drives it, its LED device and address, its rate,
  component states), no brightness slider: brightness stays with the LED
  devices. The picture is no longer on the dashboard: in the details,
  **Show the screen** plays it for 1, 2 or 5 minutes (`picture_timeout`),
  then it stops by itself; HyperHDR encodes each frame while it streams.

### Added

- HyperHDR card options: `hub_info`, `hub_values`, `strip_info`,
  `strip_icons`, `show_strips`, `show_power`, `picture_timeout`; the editor
  picks the lines' items as numbered chips.
- Ambilight card options: `layout`, `source_display`, `info`,
  `show_status`, `show_pi`, and `hidden` on inputs.
- Uses HA-HyperHDR 0.1.0b7's LED device sensor (type and address).

### Removed

- HyperHDR card: `picture` (the picture is in the details only).

## [0.12.0-beta.3] - 2026-10-21

### Added

- Ambilight editor: the box and the HyperHDR server as two tiles joined by
  their link, which says whether the fan follows the Pi's CPU; when HyperHDR
  is connected but the firmware does not see it, the ESPHome `substitutions`
  to write, with the server's real entity ids; a warning when the server has
  no Power off button (SSH not set up). The same in the details (alarm and
  Maintenance).
- Ambilight editor: the HDMI inputs shown as on the card, tap one to edit it.

### Changed

- Source buttons (HDMI inputs) without their number: a send's state takes the
  name's place for a moment.

## [0.12.0-beta.2] - 2026-10-21

The Ambilight card with HyperHDR, for the firmware that drives the fan from
the Pi's CPU and shuts the Pi down cleanly.

### Added

- Ambilight card: the Pi's CPU temperature from the HA-HyperHDR integration
  (server found by itself, or `hyperhdr` / the editor's picker), shown when it
  drives the fan; the Box / Pi CPU curves in the fan tab, each with its
  points and overheat threshold, and the lowest speed while the Pi is on
  without a CPU temperature; the Pi CPU overheat alarm.
- Ambilight card: the Pi switch uses the firmware's `Pi power` (clean
  shutdown, then the relay), with its steps; in Maintenance, a hard cut,
  restarting the Pi over SSH and the HyperHDR server's health.

### Changed

- The firmware from before HyperHDR still works: its missing entities are
  not counted as missing.

First beta of the HyperHDR card, to test from HACS ("Show beta versions").

### Added

- `vivid-hyperhdr-card`, for HyperHDR through the HA-HyperHDR integration:
  one strip with the captured picture framed by the colors of its edges, the
  machine HyperHDR runs on (temperature, CPU, memory, power supply, grabber),
  or the hub with every strip. Details in four tabs: overview (picture,
  source, effects, colors, brightness), colors, processing and system. The
  picture streams only while it is on screen. Visual editor: what to show,
  the server and the strip, found from the integration's devices.

### Changed

- Versions such as `0.12.0-beta.1` are released as pre-releases.

## [0.11.0] - 2026-10-20

### Added

- `vivid-ambilight-card`, for the DIY Ambilight Manager (ESPHome Wemos behind
  the TV): HDMI input sent by IR with an animation until the echo confirms it,
  the Raspberry Pi's power relay (a second tap to cut it), box temperature and
  fan speed; details in four tabs with an editable fan curve, the IR learning
  wizard and the maintenance tools. Visual editor: pick the device, the card
  finds and checks its entities; names and icons of the inputs.

## [0.10.0] - 2026-10-09

### Added

- Saturation bar under the color bar, from pale to full color: in the details
  of every light by default (`details.saturation_bar`), and on the card with
  `tile.saturation_bar`. Changing the hue keeps the saturation it shows.

### Fixed

- Colors picked on the color bar came out pale after a white or a pastel
  color: the bar kept the light's hidden saturation. Without a saturation bar
  it now sends the full color it shows.

## [0.9.3] - 2026-10-06

### Changed

- `vivid-light-badge`: its default halo is 120 % of the common one (what 120 %
  gave in 0.9.2), checked on a real dashboard. A `glow` of 120 % set by hand
  should go back to 100 %.

## [0.9.2] - 2026-10-05

### Changed

- One halo for every card and badge: a thin rim and a soft bloom, sized to
  each element (a badge disc, a lamp button, a power button keep the same
  proportions) and with an opacity that follows the color (amber glows more
  than purple at the same opacity, so darker colors get more). Calibrated on
  the lamp badge as validated on a real dashboard. `glow` now scales it the
  same way everywhere: one value looks alike on every component. The LED card
  follows it too, so its halo is lighter than before.
- A `glow` set by hand to compensate the previous defaults should go back to
  100 %.

### Added

- `dev/glow.html`: every glowing element side by side at full level.

## [0.9.1] - 2026-10-05

### Changed

- Softer default halo on every badge and on the lamp card: their `glow` now
  reads against 60 % of the LED card's halo, so the default (100 %) is less
  intense. The LED card keeps its halo. A `glow` set by hand is softer too:
  raise it to get the former look (about 170 %).

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

[0.13.0]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.13.0
[0.13.0-beta.2]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.13.0-beta.2
[0.13.0-beta.1]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.13.0-beta.1
[0.12.0-beta.3]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.12.0-beta.3
[0.12.0-beta.2]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.12.0-beta.2
[0.12.0-beta.1]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.12.0-beta.1
[0.11.0]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.11.0
[0.10.0]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.10.0
[0.9.3]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.9.3
[0.9.2]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.9.2
[0.9.1]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.9.1
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
