# Halos and theming

## Halos

Every card and badge draws the same halo: a thin rim and a soft bloom whose
size follows the element (a 28 px badge disc and a 56 px lamp button keep the
same proportions) and whose opacity follows the color, since amber glows far
more than purple at the same opacity. It grows with what it shows: brightness,
watts, how long a window stays open. `glow` (100 % by default, 0 to 200)
scales it the same way everywhere, so one value looks alike on every
component. `/dev/glow.html` puts them all side by side at full level.

## Theming

Vivid Cards read the standard Home Assistant theme variables. A few of their own
can be set in a theme:

| Variable                 | Default | Description                                     |
| ------------------------ | ------- | ----------------------------------------------- |
| `vivid-card-radius`      | `28px`  | Corner radius of dialogs.                       |
| `vivid-card-tile-radius` | `22px`  | Corner radius of tiles and panels.              |
| `vivid-card-chip-height` | `36px`  | Height of badges and controls (`30px` compact). |
| `vivid-surface-color`    | theme   | Background of tiles, panels and badges.         |
