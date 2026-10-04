# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

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

[0.2.0]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.2.0
[0.1.1]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.1.1
[0.1.0]: https://github.com/Florian-BARRE/vivid-cards/releases/tag/v0.1.0
