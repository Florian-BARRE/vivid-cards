# Light badges

Three badges for the badge bar of a dashboard (Home Assistant 2024.8 or later),
one per kind of light, with the same gestures:

- [`vivid-led-badge`](#vivid-led-badge): LED strips. The crossed-out strip icon
  when everything is off, the strips' colors (a gradient for a group) when on.
- [`vivid-lamp-badge`](#vivid-lamp-badge): lamps, smart bulbs or lamps on
  plugs (a `switch` or a switch group). The lamps icon crossed out when off,
  Home Assistant's amber when on.
- [`vivid-light-badge`](#vivid-light-badge): any other lights. Its icon follows
  the entity (or a bulb).

<p align="center">
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/led-badge.png" alt="LED badge with every strip under it" width="400" />
</p>

- **Everything off**: the crossed-out icon, greyed (with `0/3` when `show_zero`
  is on).
- **Something on**: the icon in the lights' colors with `2/3` next to it, or the
  brightness for a single light. The halo grows with the brightness. White
  lights (color temperature, dimmer or on/off) take Home Assistant's amber,
  translucent; colored lights fill solid.
- **Tap**: anything on turns everything off; everything off turns everything on.
- **Hold**: every light under the badge, with its color, a switch and a
  brightness slider (on/off lamps and plugs have no slider). Hold a name for the
  light's Home Assistant dialog. A tap outside or Escape closes it.

```yaml
badges:
  - type: custom:vivid-led-badge
    entity: light.living_room_leds
  - type: custom:vivid-lamp-badge
    entity: light.living_room_lamps
    look: pill
    layout: compact
    glow: 50
```

## vivid-led-badge

LED strips. Icon `mdi:led-strip-variant`, crossed out when off.

## vivid-lamp-badge

Lamps. Icon `mdi:lamps`, with a stroke when off.

<p align="center">
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/lamp-badge.png" alt="Lamp badge with every lamp under it" width="400" />
</p>

## vivid-light-badge

Any other lights: the entity's own icon, else an LED strip for a WLED group,
else a bulb.

Options of the three light badges:

| Option        | Default    | Description                                                                                                                                     |
| ------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `entity`      | (required) | A light, a switch, or a group of either (light group, switch group or `group.`).                                                                |
| `name`        | entity     | Title of the details.                                                                                                                           |
| `icon`        | auto       | Icon while on.                                                                                                                                  |
| `icon_off`    | auto       | Icon while off. Auto: the crossed-out version of `icon`, or `icon` with a stroke.                                                               |
| `look`        | `disc`     | `disc`: the colors on a disc behind the icon. `pill`: the whole badge filled.                                                                   |
| `layout`      | `list`     | Details: `list` (rows with a brightness slider) or `compact` (two columns, drag sideways to dim).                                               |
| `show_count`  | `true`     | `2/3` (or the brightness of a single light) next to the icon while on.                                                                          |
| `show_zero`   | `false`    | Also show `0/3` next to the crossed-out icon when everything is off.                                                                            |
| `glow`        | `100`      | Halo strength in percent, 0 to 200, the same scale on every card and badge (the light badge's 100 % is a little stronger: 120 % of the others). |
| `glow_boost`  | `100`      | How much the halo grows with the brightness, 0 to 200, as on the card.                                                                          |
| `transition`  | none       | Seconds of fade sent with every command.                                                                                                        |
| `tap_action`  | `toggle`   | Any card action; `toggle` switches the whole group.                                                                                             |
| `hold_action` | `details`  | `details` opens the lights under the badge.                                                                                                     |

The count leaves out lights Home Assistant cannot reach: they show as
unavailable in the details.
