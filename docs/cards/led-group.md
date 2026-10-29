# vivid-led-group

A light group (or one light) as a header and a brightness tile, with every light
of the group in a details dialog. Works with any light: Hue, Zigbee, ESPHome…
WLED strips also get the ambilight button, presets, palettes, effect speed and
device information.

<p>
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/led-group-details.png" alt="Details dialog of the LED group card" width="640" />
</p>

## What the card shows

- **Header**: name, consumption badge glowing with the power drawn, ambilight
  button (WLED), power button filled with the light color (a gradient of every
  lit light for a group) whose halo grows with the brightness.
- **Tile**: drag to dim, effect picker, color bar (hue or color temperature),
  entity badges and favorite colors. The tile shimmers while an effect runs.
- **Details** (groups):
  - the group badges;
  - a **consumption chart** over 6 hours, 24 hours or 7 days, one color per
    light, with a cursor that reads every light at a given time, the energy
    used today and over the period, its cost and the peak;
  - every light with its own header and tile;
  - for WLED strips, two foldable panels: **Settings** (preset, playlist,
    palette, effect speed and intensity, reverse, freeze, nightlight, sync) and
    **Device** (Wi-Fi, uptime, LEDs, current limit, memory, IP, firmware, update
    and restart).

  Two columns on large screens, a bottom sheet on phones.

## Visual editor

<p>
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/led-group-editor.png" alt="Visual editor of the LED group card" width="420" />
</p>

Pick a light or a group first: the editor shows what it detected and only
offers what applies. The three switches on top turn the ambilight button, the
consumption badges and the details on or off. Everything else is folded into
sections that summarize their settings:

| Section             | What it sets                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| **Detected lights** | Per light: ambilight, how consumption is measured, name, icon, transition, shown in the details |
| **Tile**            | Color bar, state text, effect picker, favorite colors, badges, brightness, transition           |
| **Gestures**        | Tap, hold and double tap                                                                        |
| **Consumption**     | Sensor pattern, strip voltage, price, glow scale                                                |
| **Details**         | Link (hash), order, color bar, what the details show                                            |
| **Appearance**      | Glow, header, compact layout, gradient, shimmer                                                 |

The YAML only keeps what you changed. Actions richer than a toggle (navigate,
perform-action…) are kept as they are and shown as **Custom (YAML)**.

## Gestures

| Where             | Tap                                   | Hold                         | Drag                               |
| ----------------- | ------------------------------------- | ---------------------------- | ---------------------------------- |
| Tile              | `tile.tap_action` (toggle)            | `tile.hold_action` (details) | Set the brightness (0 % turns off) |
| Color bar         | Pick the hue or the color temperature |                              | Same                               |
| Favorite color    | Apply it                              |                              |                                    |
| Badge             | Home Assistant dialog of the entity   |                              |                                    |
| Name              | Open the details                      |                              |                                    |
| Power button      | Toggle                                |                              |                                    |
| Consumption badge | History of the power sensor (lights)  |                              |                                    |
| Ambilight button  | Switch the WLED live override         |                              |                                    |
| Chart             | Read the values at that time          |                              | Same                               |

A double tap runs `tile.double_tap_action` (nothing by default). Without
details (a single light, or `details.enabled: false`), holding the tile opens
the Home Assistant dialog. In the details dialog, a tap on a light's tile
toggles it and a hold opens its Home Assistant dialog. The details close with
Escape, a tap outside, or a swipe down on phones.

## Recipes

**WLED strips with a power sensor each** (a template or a smart plug):

```yaml
type: custom:vivid-led-group
entity: light.salon_leds
power:
  sensor_pattern: sensor.{object_id}_power
```

**WLED strips without power sensors**: WLED estimates its current; give the
strip voltage to turn it into watts. The glow then scales on WLED's own current
limit.

```yaml
type: custom:vivid-led-group
entity: light.salon_leds
power:
  voltage: 5
```

**Any other lights** (here two tunable white spots, one on a smart plug): the
power sensor of each device is found on its own, the color bar switches to
temperature.

```yaml
type: custom:vivid-led-group
entity: light.kitchen_spots
name: Spots
tile:
  favorites: [{ kelvin: 2700 }, { kelvin: 4000 }, { kelvin: 6000 }]
```

**A small tile for a grid**: no header, smaller controls.

```yaml
type: custom:vivid-led-group
entity: light.desk
appearance:
  header: false
  compact: true
```

**Open the details from another card**:

```yaml
# On the LED card
details:
  hash: salon-leds
# On any other card
tap_action:
  action: navigate
  navigation_path: '#salon-leds'
```

**Everything at once**:

```yaml
type: custom:vivid-led-group
entity: light.salon_leds
name: LEDs
badges:
  - sensor.salon_temperature
tile:
  favorites: ['#ff8a3d', '#8a2be2', { kelvin: 2700, brightness: 40 }]
  transition: 0.5
power:
  sensor_pattern: sensor.{object_id}_power
  voltage: 5
  price: 0.2516
details:
  hash: salon-leds
  sort: custom
  order: [light.salon_tv_wled, light.salon_sofa_wled]
appearance:
  glow: 60
members:
  - entity: light.salon_sofa_wled
    name: Sofa
    transition: 2
  - entity: light.salon_backlight_wled
    ambilight: false
```

## Options

| Option       | Default      | Description                                                                    |
| ------------ | ------------ | ------------------------------------------------------------------------------ |
| `entity`     | required     | A light group, or a single light.                                              |
| `name`       | entity name  | Title of the card.                                                             |
| `icon`       | each light's | Icon of the card and of every light. By default each light keeps its own icon. |
| `tile`       | see below    | Brightness tile.                                                               |
| `badges`     | none         | Entities shown on the tile and on top of the details.                          |
| `power`      | see below    | Consumption badges, chart and cost.                                            |
| `ambilight`  | see below    | WLED ambilight button.                                                         |
| `details`    | see below    | Details dialog.                                                                |
| `appearance` | see below    | Glow, layout and animations.                                                   |
| `members`    | none         | Per-light overrides.                                                           |

`tile`:

| Option              | Default      | Description                                                                                                                    |
| ------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `color_bar`         | `auto`       | `auto` (hue for color lights, temperature for tunable whites, none otherwise), `hue`, `temperature` or `none`.                 |
| `saturation_bar`    | `false`      | A saturation bar under the color bar (hue lights): from pale to full color. Without it the color bar always sends full colors. |
| `state`             | `brightness` | Text on the tile: `brightness` or `none`.                                                                                      |
| `effects`           | `true`       | Effect picker.                                                                                                                 |
| `favorites`         | none         | Up to 8 colors: `"#ff8800"`, `[255, 136, 0]`, `{ kelvin: 2700 }`, each with an optional `brightness` (%).                      |
| `brightness_min`    | `1`          | Lowest brightness (%) a drag sets; dragging to the left edge still turns off.                                                  |
| `brightness_step`   | `1`          | Brightness step (%) of a drag.                                                                                                 |
| `transition`        | none         | Seconds of fade sent with every light command.                                                                                 |
| `tap_action`        | `toggle`     | Any Home Assistant action, plus `details`.                                                                                     |
| `hold_action`       | `details`    | `details` for a group, `more-info` for a single light.                                                                         |
| `double_tap_action` | `none`       | Same syntax.                                                                                                                   |

Actions accept a name (`toggle`, `details`, `more-info`, `none`) or the usual
object: `navigate`, `url`, `perform-action`…

`badges` entries are entity ids, or `{ entity, name, icon }`. Sensors show
their value, on/off entities light up while on.

`power`:

| Option           | Default | Description                                                                                                                                            |
| ---------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `enabled`        | `true`  | Consumption badges and chart.                                                                                                                          |
| `sensor_pattern` | none    | Power sensor of each light. `{object_id}` is replaced by the light's object id: `sensor.{object_id}_power` finds `sensor.desk_power` for `light.desk`. |
| `voltage`        | none    | Strip voltage. Turns the WLED estimated current into watts.                                                                                            |
| `price`          | none    | Price of a kWh: the details show what today and the period cost.                                                                                       |
| `price_entity`   | none    | A `sensor` or `input_number` holding the price of a kWh (a tariff that changes). It wins over `price`, which stays the fallback.                       |
| `currency`       | HA's    | Currency code of the price, e.g. `EUR`.                                                                                                                |
| `idle`           | `3`     | Watts per light under which the badge stays neutral.                                                                                                   |
| `max`            | auto    | Watts per light at which the glow is the brightest. Without it, WLED's current limit × voltage when known, else 40.                                    |
| `steps`          | auto    | Watts per light where the glow turns from the first color to the second, then the third. They follow `max` unless set.                                 |
| `colors`         | yellow… | Three colors of the glow, low to high.                                                                                                                 |

`ambilight`:

| Option    | Default | Description                                                          |
| --------- | ------- | -------------------------------------------------------------------- |
| `enabled` | `true`  | WLED ambilight button (shown only when a light has a live override). |

`details`:

| Option           | Default          | Description                                                                                         |
| ---------------- | ---------------- | --------------------------------------------------------------------------------------------------- |
| `enabled`        | groups only      | The details dialog.                                                                                 |
| `hash`           | none             | Opens the details when the page URL ends with this hash, so any card can open them with `navigate`. |
| `sort`           | `name`           | `name`, `group` (order of the group) or `custom` (with `order`).                                    |
| `order`          | none             | Entity ids in display order, with `sort: custom`. The editor fills it with its arrows.              |
| `summary`        | `true`           | Group badges at the top.                                                                            |
| `history`        | `true`           | Consumption chart, energy and cost.                                                                 |
| `effects`        | `tile.effects`   | Effect picker of each light.                                                                        |
| `favorites`      | `true`           | Favorite colors on each light.                                                                      |
| `wled_controls`  | `true`           | WLED **Settings** panel.                                                                            |
| `health`         | `true`           | WLED **Device** panel.                                                                              |
| `color_bar`      | `tile.color_bar` | Color bar of each light, same values as `tile.color_bar`.                                           |
| `saturation_bar` | `true`           | Saturation bar under the color bar of each light.                                                   |

`appearance`:

| Option            | Default | Description                                                                                                                                        |
| ----------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `glow`            | `100`   | Halo strength in percent, 0 to 200 (`0` removes halos). `off`, `soft`, `normal` and `strong` still work (0, 50, 100, 170).                         |
| `glow_boost`      | `100`   | How much the power button halo grows with the brightness, 0 to 200. `0`: same halo at any brightness; `200`: discreet when dimmed, strong at full. |
| `header`          | `true`  | Header row (name and badges).                                                                                                                      |
| `compact`         | `false` | Smaller controls.                                                                                                                                  |
| `gradient`        | `true`  | Power button of a group in a gradient.                                                                                                             |
| `animate_effects` | `true`  | Shimmer while an effect runs.                                                                                                                      |

`members` entries:

| Option         | Description                                                                        |
| -------------- | ---------------------------------------------------------------------------------- |
| `entity`       | The light to override.                                                             |
| `name`         | Display name.                                                                      |
| `icon`         | Icon of this light.                                                                |
| `hidden`       | `true` hides the light from the details (it still counts in totals and ambilight). |
| `ambilight`    | `false` leaves the light out of the ambilight button and hides its own button.     |
| `power_mode`   | `auto` (default), `sensor`, `voltage` or `none`.                                   |
| `power_sensor` | Power sensor of this light.                                                        |
| `voltage`      | Voltage of this strip, instead of `power.voltage`.                                 |
| `transition`   | Seconds of fade for this light, instead of `tile.transition`.                      |

## Where consumption comes from

With `power_mode: auto`, the first source found wins:

1. `members[].power_sensor`
2. `power.sensor_pattern`
3. A power sensor attached to the same device (a smart bulb or plug that
   measures itself)
4. WLED estimated current × voltage (`members[].voltage`, else `power.voltage`)

`sensor` only uses `power_sensor`, `voltage` only the estimated current, and
`none` turns the consumption of that light off. The editor shows which source
each light uses.

The chart reads Home Assistant's history for 6 and 24 hours, and the long-term
statistics for 7 days. Statistics exist for sensors with a `state_class`
(`measurement` for a power sensor; WLED's estimated current has one). The
energy of the day and of the period is computed from the power, so it can
differ slightly from an energy meter.

## WLED

WLED entities are recognized through the WLED integration, whatever you named
them: live override, estimated current, current limit, LED count, presets,
playlists, palette, speed, intensity, reverse, freeze, nightlight, sync, Wi-Fi,
uptime, memory, IP, firmware update and restart. Strips with several segments
use the entities of their own segment.

Home Assistant disables a few diagnostic entities by default (uptime, Wi-Fi
signal and RSSI, free memory). Enable them on the WLED device page
(**Settings → Devices & services → WLED → device → entities**) to see them in
the **Device** panel.

**Ambilight.** WLED can ignore realtime data (HyperHDR, Hyperion, E1.31…) with
its live override setting. The ambilight button is amber while the strips show
the realtime stream (live override off) and grey while WLED ignores it. Tap it
to switch. The group button is amber when every strip that answers it shows
the stream, and switches every one that is online.

**Transitions.** The WLED integration does not expose WLED's own transition
time, so the card sends one with its commands instead: `tile.transition` for
every light, `members[].transition` for one.

## Light names

Names drop the words all members share at the start and at the end:
`salon-ambilight-wled`, `salon-buffet-wled` and `salon-canape-wled` become
**Ambilight**, **Buffet** and **Canape**. A bare number keeps the word before
it: `Cuisine Spot 1` and `Cuisine Spot 2` become **Spot 1** and **Spot 2**. Use
`members[].name` to pick your own.

## Upgrading

Options from older versions keep working and are read as their current
equivalent; the editor saves the new form. 0.3 and 0.4 only add options. Since
0.5, `appearance.glow` is a percentage: `off`, `soft`, `normal` and `strong`
are read as 0, 50, 100 and 170, and the halo's opacity follows it too, so
`soft` looks softer than before.

| 0.1                  | Now                    |
| -------------------- | ---------------------- |
| `show_power`         | `power.enabled`        |
| `show_live_override` | `ambilight.enabled`    |
| `show_effects`       | `tile.effects`         |
| `show_hue: false`    | `tile.color_bar: none` |
| `details_hash`       | `details.hash`         |

## Collapsible layout and Ambilight rail

`vivid-led-group` keeps its header and tile by default. Two opt-in additions:

**Collapsible layout.** `layout: collapsible` turns the card into one 64 px line
tinted with the LEDs' color (icon, name, `57 % · Solid · 2/3 · 42 W`, power
button, chevron). The chevron unfolds the color bar and the favorites in the same
card; dragging the line still dims. The card remembers the choice per light on
this device; `expanded: true` sets the first state.

**Ambilight rail.** With the [Ambilight box](ambilight.md#vivid-ambilight-card), a rail at the
bottom of the card shows its state (controlling temperature and fan, or the
alarm in red), the HDMI input menu and a switch that starts and stops the Pi
(clean shutdown and confirmation, as in the Ambilight card). While the screen
drives the strips (WLED listens to realtime data, HyperHDR sends to them), the
tile fills with their captured colors and the color bar steps back: touching it
takes the strips back (WLED live override). The details dialog adds the box and
the HyperHDR server.

The only box of the home is found by itself when it sits in the strips' area or
when HyperHDR sends to one of the strips; `vivid-ambilight-card` and
`vivid-hyperhdr-card` keep working on their own.

```yaml
type: custom:vivid-led-group
entity: light.salon_leds
layout: collapsible # default: header and tile
expanded: false # first state of the collapsible layout
ambilight:
  box: device_ambilight # a device or one of its entities; false hides the rail
  hyperhdr: device_hub # optional, the only server when left out
  inputs: [TV box, Console, PC, HDMI 4, HDMI 5]
  confirm_off: true # second tap before switching Ambilight off
```
