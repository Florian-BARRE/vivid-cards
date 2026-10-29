<p align="center">
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/banner.png" alt="Vivid Cards" width="100%" />
</p>

<p align="center">
  <a href="https://hacs.xyz"><img src="https://img.shields.io/badge/HACS-Custom-41BDF5?style=for-the-badge" alt="HACS custom repository" /></a>
  <a href="https://github.com/Florian-BARRE/vivid-cards/releases/latest"><img src="https://img.shields.io/github/v/release/Florian-BARRE/vivid-cards?style=for-the-badge&color=ff5f6d" alt="Latest release" /></a>
  <img src="https://img.shields.io/badge/Home%20Assistant-2024.11%2B-18BCF2?style=for-the-badge&logo=homeassistant&logoColor=white" alt="Home Assistant 2024.11 or later" />
  <a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Florian-BARRE/vivid-cards?style=for-the-badge&color=8a3ffc" alt="License" /></a>
</p>

# Vivid Cards

Expressive Lovelace cards and badges for Home Assistant. Everything glows with
the state of what it shows: a power button lit with the real color of your
LEDs, a window badge that warms up the longer it stays open, a battery that
empties and turns red.

- **No dependencies.** One JavaScript file, no other custom card required.
- **Zero templating.** Point a card or a badge at a group: members, WLED
  entities and power sensors are discovered from the Home Assistant registries.
- **Visual editor.** Everything can be set without YAML, and the editor only
  shows what applies to what you picked.
- **Theme aware.** Follows your Home Assistant theme, light or dark, in English
  and French.

## Gallery

<table>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/led-group.png" alt="LED group card" width="400" /><br /><sub><b>LED group card</b></sub></td>
    <td align="center"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/badges.png" alt="Badges" width="400" /><br /><sub><b>Badges</b></sub></td>
  </tr>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/led-group-details.png" alt="Details of the LED group card" width="400" /><br /><sub><b>Details: every strip, consumption chart, WLED settings</b></sub></td>
    <td align="center"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/led-group-editor.png" alt="Visual editor" width="300" /><br /><sub><b>Visual editor</b></sub></td>
  </tr>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/lamp-group.png" alt="Lamp group card" width="400" /><br /><sub><b>Lamp group card: lamps on plugs, presets</b></sub></td>
    <td align="center"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/lamp-group-details.png" alt="Details of the lamp group card" width="400" /><br /><sub><b>Lamp details: today's timeline, energy and cost</b></sub></td>
  </tr>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/ambilight.png" alt="Ambilight manager card" width="400" /><br /><sub><b>Ambilight manager on one line: values, HDMI input menu, Pi</b></sub></td>
    <td align="center"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/ambilight-fan.png" alt="Fan curve of the Ambilight manager" width="400" /><br /><sub><b>Ambilight details: the fan curve, point by point</b></sub></td>
  </tr>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/hyperhdr.png" alt="HyperHDR card, one strip" width="400" /><br /><sub><b>HyperHDR: a strip, its LED device and its rate</b></sub></td>
    <td align="center"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/hyperhdr-all.png" alt="HyperHDR card, hub and strips" width="400" /><br /><sub><b>HyperHDR: the Pi, what it captures, every strip</b></sub></td>
  </tr>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/led-badge.png" alt="LED badge details" width="400" /><br /><sub><b>LED badge: hold for every strip</b></sub></td>
    <td align="center"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/window-badge.png" alt="Window badge details" width="400" /><br /><sub><b>Window badge: open first, with how long</b></sub></td>
  </tr>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/presence-badge.png" alt="Presence badge details" width="400" /><br /><sub><b>Presence: the last six hours of each room</b></sub></td>
    <td align="center"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/battery-badge.png" alt="Battery badge details" width="400" /><br /><sub><b>Batteries: every battery from the lowest</b></sub></td>
  </tr>
</table>

## What is inside

| Card or badge                                          | What it is for                                                         |
| ------------------------------------------------------ | ---------------------------------------------------------------------- |
| [`vivid-led-group`](#vivid-led-group) (card)           | A light group or a single light, WLED aware, with details per light    |
| [`vivid-lamp-group`](#vivid-lamp-group) (card)         | Lamps on smart plugs or switches: on/off, watts, presets, daily cost   |
| [`vivid-ambilight-card`](#vivid-ambilight-card) (card) | A DIY Ambilight box: HDMI source by IR, Pi power, temperatures and fan |
| [`vivid-hyperhdr-card`](#vivid-hyperhdr-card) (card)   | HyperHDR: the Pi and what it captures, the strips and their devices    |
| [`vivid-led-badge`](#vivid-led-badge)                  | LED strips on out of the total, in their colors; tap switches them all |
| [`vivid-lamp-badge`](#vivid-lamp-badge)                | Lamps (bulbs or smart plugs) on out of the total, in amber             |
| [`vivid-light-badge`](#vivid-light-badge)              | Any other lights (ceiling lights, spots…)                              |
| [`vivid-window-badge`](#vivid-window-badge)            | Windows open out of the total, warming up the longer they stay open    |
| [`vivid-door-badge`](#vivid-door-badge)                | Doors and garage doors open out of the total                           |
| [`vivid-presence-badge`](#vivid-presence-badge)        | Presence in a room, or rooms occupied, with the last hours of each     |
| [`vivid-illuminance-badge`](#vivid-illuminance-badge)  | Illuminance of a group, from the moon to the sun, with a gauge         |
| [`vivid-power-badge`](#vivid-power-badge)              | Power of a group of devices, glowing brighter as it rises              |
| [`vivid-battery-badge`](#vivid-battery-badge)          | The lowest battery of a group or of the whole home                     |

Temperature, humidity and pressure badges are on the [roadmap](#roadmap).

## Installation

Requires Home Assistant 2024.11 or newer.

### HACS (recommended)

[![Open your Home Assistant instance and open this repository in HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Florian-BARRE&repository=vivid-cards&category=plugin)

Click the button above, or add it by hand:

1. In HACS, open the menu (⋮) → **Custom repositories**.
2. Add `https://github.com/Florian-BARRE/vivid-cards` with the type **Dashboard**.
3. Search for **Vivid Cards** and download it.

HACS adds the dashboard resource for you; reload the page afterwards. Updates
show up in HACS like any other download.

### Manual

1. Download `vivid-cards.js` from the [latest release](https://github.com/Florian-BARRE/vivid-cards/releases/latest).
2. Copy it to `config/www/vivid-cards/vivid-cards.js`.
3. Add a dashboard resource: **Settings → Dashboards → ⋮ → Resources → Add resource**,
   URL `/local/vivid-cards/vivid-cards.js`, type **JavaScript module**.
4. Reload the page.

## Quick start

1. Open a dashboard, **⋮ → Edit dashboard → Add card**, and search for
   **Vivid LED group** (or **Vivid lamp group** for lamps on plugs).
2. Pick a light or a light group. The editor tells you what it found: how many
   lights, which ones are WLED, whether they do color or tunable white, and
   where their consumption comes from.
3. If no consumption is found, open **Consumption** and give a sensor pattern
   (see [where consumption comes from](#where-consumption-comes-from)) or, for
   WLED strips, their voltage.
4. Save. Tap the name or hold the tile to open the details.

The same card in YAML:

```yaml
type: custom:vivid-led-group
entity: light.living_room_leds
```

## vivid-led-group

A light group (or one light) as a header and a brightness tile, with every light
of the group in a details dialog. Works with any light: Hue, Zigbee, ESPHome…
WLED strips also get the ambilight button, presets, palettes, effect speed and
device information.

<p>
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/led-group-details.png" alt="Details dialog of the LED group card" width="640" />
</p>

### What the card shows

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

### Visual editor

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

### Gestures

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

### Recipes

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

### Options

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

### Where consumption comes from

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

### WLED

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

### Light names

Names drop the words all members share at the start and at the end:
`salon-ambilight-wled`, `salon-buffet-wled` and `salon-canape-wled` become
**Ambilight**, **Buffet** and **Canape**. A bare number keeps the word before
it: `Cuisine Spot 1` and `Cuisine Spot 2` become **Spot 1** and **Spot 2**. Use
`members[].name` to pick your own.

### Upgrading

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

## vivid-lamp-group

Lamps on smart plugs, wall switches or plain on/off lights, where all you know
is whether a lamp is on and what it draws. Each lamp gets a round button that
glows with its consumption; quick presets switch several lamps at once.

<p>
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/lamp-group.png" alt="Lamp group card, ambiance layout" width="426" />
</p>

### What the card shows

- **Header**: name, lamps on out of the total, the group's consumption and a
  power button for the whole group (anything on turns everything off).
- **Presets** (optional): buttons that turn some lamps on and the others off,
  or activate a Home Assistant scene. A preset lights up while the lamps are as
  it sets them.
- **A button per lamp**: Home Assistant's amber with a halo that grows with
  the watts, the lamp's name, and `18 W · 35 min` (or `off · 3 h`). Off, the
  icon switches to its outline (or crossed-out) variant when one exists:
  `mdi:floor-lamp` → `mdi:floor-lamp-outline`, `mdi:desk-lamp` →
  `mdi:desk-lamp-off`.
- **A red bulb** on a lamp that has been on for a minute but draws less than
  `warn_below` (1 W): the bulb is out, or the lamp's own switch is off.
- **Details** (hold a lamp, or tap the title): every lamp with its watts, how
  long it has been on or off, when it was on today and a switch; the energy of
  the day and its cost at the bottom.

`layout: line` puts the whole group on one line, a small button per lamp:

<p>
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/lamp-group-line.png" alt="Lamp group card, one-line layout" width="426" />
</p>

<p>
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/lamp-group-details.png" alt="Details of the lamp group card" width="592" />
</p>

### Expandable line

On `layout: line`, the line stays 64 px high: the group's disc (amber halo
while a lamp is on), its name, `2/4 · 94 W`, a mini disc per lamp (tap to
switch it), the group's power button and a chevron. A tap on the chevron, the
title or the free part of the line unfolds the lamp grid of the ambiance
layout inside the card (disc, name, `48 W · 25 min` or `off · 2 d`); the mini
discs hide while it is open. Holding the title still opens the details.

The card remembers whether it is unfolded, per card and per device
(`localStorage`, keyed by its entity). Changing `expanded` in the config
starts over from the new value. `show_names`, `show_status`, `size` and
`columns` apply to the unfolded grid. In a sections dashboard, the card's
height follows its content.

| Option       | Default | Description                                                           |
| ------------ | ------- | --------------------------------------------------------------------- |
| `expandable` | `true`  | Line layout: a chevron unfolds the lamp grid inside the card.         |
| `expanded`   | `false` | Line layout: unfolded when first shown, until it is folded on a card. |

```yaml
type: custom:vivid-lamp-group
entity: switch.salon_lampes
layout: line
expanded: false # set true to start unfolded; expandable: false for the plain line
```

### Gestures

| Where        | Tap                                                          | Hold                             |
| ------------ | ------------------------------------------------------------ | -------------------------------- |
| A lamp       | Switch it (`tap_action`)                                     | Open the details (`hold_action`) |
| Title        | Open the details                                             | Open the details                 |
| Power button | Anything on: all off; else all on                            |                                  |
| Preset       | Apply it                                                     |                                  |
| Details row  | Disc or switch: switch the lamp; name: Home Assistant dialog |                                  |

### Visual editor

<p>
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/lamp-group-editor.png" alt="Visual editor of the lamp group card" width="300" />
</p>

| Section           | What it sets                                                             |
| ----------------- | ------------------------------------------------------------------------ |
| **Lamps**         | Per lamp: name, icon on and off, power sensor, shown on the card         |
| **Quick presets** | Name, icon, the lamps it turns on (none: all off) or a scene             |
| **Consumption**   | Watts, durations, energy of the day, price or price entity, halo, alerts |
| **Appearance**    | Header, count, group button, names, status, size, columns, halo          |
| **Gestures**      | Tap and hold on a lamp                                                   |

### Recipes

```yaml
type: custom:vivid-lamp-group
entity: switch.living_room_lamps # a switch group of smart plugs
price_entity: input_number.electricity_price
scenes:
  - name: Evening
    icon: mdi:sofa
    lamps: [switch.chandelier_plug, switch.floor_lamp_plug]
  - name: Movie
    scene: scene.movie
  - name: All off
    lamps: []
members:
  - entity: switch.chandelier_plug
    name: Chandelier
    icon: mdi:chandelier
  - entity: switch.desk_plug
    icon: mdi:desk-lamp
    icon_off: mdi:desk-lamp-off
    power_sensor: sensor.desk_plug_power
```

Icons only, small, without the header:

```yaml
type: custom:vivid-lamp-group
entity: switch.living_room_lamps
show_header: false
show_names: false
show_status: false
size: small
```

A few lamps without a group, on one line, without the watts:

```yaml
type: custom:vivid-lamp-group
name: Bedroom
layout: line
show_power: false
entities:
  - switch.bedside_lamp
  - light.garland
```

### Options

| Option            | Default    | Description                                                                                              |
| ----------------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| `entity`          | required\* | A group of lamps (switch group, light group or `group.`), or one lamp.                                   |
| `entities`        | none       | Lamps listed one by one, instead of `entity` (\*one of the two is required).                             |
| `name`            | group name | Title of the card.                                                                                       |
| `icon`            | group's    | Icon of the title (the group's own, else `mdi:lamps`); its outline variant while everything is off.      |
| `layout`          | `ambiance` | `ambiance` (presets and a round button per lamp) or `line` (one line, a small button per lamp).          |
| `show_header`     | `true`     | Header row of the ambiance layout (name, count, consumption, power button).                              |
| `show_count`      | `true`     | `3/4 on` under the title.                                                                                |
| `show_toggle_all` | `true`     | Power button of the whole group.                                                                         |
| `show_names`      | `true`     | Name under each lamp (ambiance). With `show_status: false` too, only the icons remain.                   |
| `show_status`     | `true`     | Watts and duration under each lamp (ambiance).                                                           |
| `size`            | `medium`   | Size of the lamp buttons: `small`, `medium` or `large`.                                                  |
| `columns`         | auto       | Lamps per row (ambiance), 1 to 12. Auto: as many as fit.                                                 |
| `tap_action`      | `toggle`   | Tap on a lamp: `toggle`, `details`, `more-info` (the lamp's Home Assistant dialog) or `none`.            |
| `hold_action`     | `details`  | Hold on a lamp, same choices. The title always opens the details.                                        |
| `show_power`      | `true`     | Watts of each lamp and of the group.                                                                     |
| `show_duration`   | `true`     | How long each lamp has been on or off.                                                                   |
| `show_energy`     | `true`     | Energy of the day and its cost in the details.                                                           |
| `price`           | none       | Price of a kWh, in Home Assistant's currency.                                                            |
| `price_entity`    | none       | A `sensor` or `input_number` holding the price of a kWh; it wins over `price`, which stays the fallback. |
| `max_watts`       | `60`       | Watts at which a lamp's halo is the brightest.                                                           |
| `warn_below`      | `1`        | A lamp on for a minute but drawing less than this (W) gets a red bulb. `0` turns it off.                 |
| `glow`            | `100`      | Halo strength in percent, 0 to 200, the same scale on every card and badge.                              |
| `scenes`          | none       | Quick presets, see below.                                                                                |
| `members`         | none       | Per-lamp overrides, see below.                                                                           |

`scenes` entries:

| Option  | Description                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------ |
| `name`  | Label of the button (required).                                                                  |
| `icon`  | Icon of the button.                                                                              |
| `lamps` | Lamps turned on; every other lamp of the card is turned off. An empty list turns everything off. |
| `scene` | A Home Assistant scene to activate instead of `lamps`.                                           |

A preset with `lamps` is lit while exactly those lamps are on. Home Assistant
only records when a scene was last activated, not what it sets, so a `scene`
preset is lit until a lamp changes after it.

`members` entries:

| Option         | Description                                                               |
| -------------- | ------------------------------------------------------------------------- |
| `entity`       | The lamp to override.                                                     |
| `name`         | Display name (by default the words all lamps share are dropped).          |
| `icon`         | Icon while on (by default the entity's own icon, else `mdi:lamp`).        |
| `icon_off`     | Icon while off (by default the outline or crossed-out variant of `icon`). |
| `power_sensor` | Power sensor of this lamp, when it is not on the same device as the plug. |
| `hidden`       | `true` leaves the lamp off the card; it still counts in the group.        |

Consumption comes from `power_sensor`, else from a power sensor of the same
device: a metering smart plug works without any setting. The energy of the day
is computed from the power history, so it can differ slightly from an energy
meter.

## vivid-ambilight-card

A card made for one DIY device, the **Salon Ambilight Manager**: a Wemos D1
mini under ESPHome in the box behind the TV that runs the Ambilight. It cools
the box with a fan on a temperature curve, switches the HDMI input of a 5-in-1
switch by replaying its remote's IR codes (and checks the echo), and powers
the Raspberry Pi running HyperHDR through a relay. The compact card keeps what
is used every day under the thumb; a tap opens everything else.

With the [HA-HyperHDR](https://github.com/Florian-BARRE/HA-HyperHDR)
integration and the firmware that knows it, the card also follows the Pi:
its CPU temperature (the fan follows a CPU curve while HyperHDR is
connected), its health, and a clean shutdown before the power is cut. For
that, on the Home Assistant side:

- HA-HyperHDR with SSH set up in its options (the **Power off** button);
- the ESPHome device's options: "Allow the device to perform Home Assistant
  actions" (the box presses **Power off** itself; without it Home Assistant
  refuses and raises a repair, and the Pi is cut after the firmware's wait);
- the firmware's substitutions naming the server's entities; the editor
  checks the link and writes them when they are wrong.

<p>
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/ambilight.png" alt="Ambilight manager card" width="428" />
</p>

### What the card shows

One line (`layout: line`, the default):

- **The fan icon**, turning faster with the speed and colored by the box
  temperature (blue, green, amber, red at the overheat threshold).
- **The name and its state**: the worst alarm (offline, overheating, Pi CPU
  overheating, fan stalled, sensor missing), else the fan mode and the Pi.
- **The values you pick, under it** (`info`), as pills in their own color:
  the temperature that drives the fan (the box's, or the Pi's CPU while
  HyperHDR is connected, or the one overheating), the fan speed, the
  humidity by default; also the box and CPU temperatures apart, pressure,
  rpm. They wrap when they do not fit.
- **The input menu**: the active input (icon and name, icon only or name
  only: `source_display`). A tap opens the inputs; picking one sends it: IR
  waves while the LED emits (`sending IR…`), a check when the Wemos hears its
  own frame back (`echo back ✓`), orange and a shake (`no echo`) when nothing
  came back after the firmware's retry. An input changed with the original
  remote flashes too. The echo proves the frame left the LED, not that the
  switch obeyed it (the switch gives no feedback). Inputs can be hidden from
  the menu.
- **The Pi button**, lit while the Pi is powered. With the firmware's
  `Pi power`, turning it off shuts the Pi down cleanly first (over SSH,
  through HA-HyperHDR's Power off button), then the relay opens: a second tap
  is asked, then the shutdown's steps show under the name until the power is
  cut. With an older firmware it is the relay itself, a hard power cut
  (`confirm_pi_off: false` removes the question for the relay). Turning it on
  is immediate.

`layout: tiles` keeps the earlier card: the head, then a row of input tiles.

- **Details** (tap the header), in four tabs:
  - **Overview**: alarms, box and CPU temperatures, humidity, pressure and
    fan speed, the inputs, the Pi with its shutdown steps, Auto / Manual with
    where the temperature sits on the curve that drives the fan.
  - **Fan**: the curve (temperature → speed) with its four points, dragged
    with a finger or set with − / +, the hysteresis band and the overheat
    zone; hysteresis, overheat threshold, stop below point 1; manual speeds
    (a speed switches the fan to Manual, as the firmware does). With
    HyperHDR, **Box / Pi CPU** switches between the two curves, the dot
    marking the one that drives the fan; each has its own overheat threshold,
    and the box curve its lowest speed while the Pi is on without a CPU
    temperature.
  - **HDMI & IR**: the code stored for each input, the last code received,
    and the learning wizard (listen, keep the capture, test the replay, save)
    with the firmware's `IR Status` shown as the live instruction.
  - **Maintenance**: the Pi (clean shutdown, hard cut, restart over SSH,
    forced restart by a 3 s cut), the HyperHDR server (CPU, temperature,
    memory, undervoltage, version), fan tests, PWM frequency, IR tests and
    detailed logs, Wi-Fi, IP, uptime, refresh and restart. What cuts or
    erases asks for a second tap.

<p>
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/ambilight-overview.png" alt="Details: overview" width="300" />
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/ambilight-fan.png" alt="Details: fan curve" width="300" />
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/ambilight-ir.png" alt="Details: HDMI and IR learning" width="300" />
</p>

Texts coming from the firmware (`Fan control`, `IR Status`, `Test Status`)
are shown as the firmware writes them.

### Visual editor

<p>
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/ambilight-editor.png" alt="Visual editor of the Ambilight card" width="300" />
</p>

Two tiles joined by their link: the **Ambilight box** (the ESPHome device:
online, how many entities found and which are missing) and the **HyperHDR
server** (connected, CPU temperature; the only one is used when none is
picked). The link between them says whether the fan follows the Pi's CPU. When
HyperHDR is connected but the firmware still follows the box, the firmware does
not read the server's entities: the editor writes the `substitutions` to put in
the ESPHome YAML, with the server's real entity ids (the details' Maintenance
tab shows them too). It also warns when the server has no Power off button
(SSH not set up in HA-HyperHDR), as the Pi would then be cut without shutting
down.

Then the HDMI inputs, as on the card: tap one to name it, pick its icon or
hide it from the menu. Display: layout, input menu, the values next to the
name as numbered chips (tap to add or remove, arrows to reorder), the line
under the name, the Pi button, name, confirmation, halo, send counter.

### Recipes

```yaml
type: custom:vivid-ambilight-card
device: 0123456789abcdef0123456789abcdef # the ESPHome device
name: Ambilight
inputs:
  - { name: TV box, icon: mdi:television-box }
  - { name: Console, icon: mdi:gamepad-variant }
  - PC
  - Cast
  - HDMI 5
```

Without the editor, `prefix` names the entities directly (the part between
the domain and the entity name):

```yaml
type: custom:vivid-ambilight-card
prefix: salon_salon_ambilight_manager_
```

### Options

| Option                | Default                          | Description                                                                                                                           |
| --------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `device`              | none                             | The Ambilight Manager device: its entities are found from it.                                                                         |
| `prefix`              | `salon_salon_ambilight_manager_` | Entity id prefix of the device; wins over `device`.                                                                                   |
| `name`                | `Ambilight`                      | Title of the card.                                                                                                                    |
| `inputs`              | `HDMI 1` … `HDMI 5`              | Up to five inputs, each a name or `{ name, icon, hidden }` (default icon `mdi:video-input-hdmi`; `hidden` leaves it out of the menu). |
| `layout`              | `line`                           | `line` (one line, the input as a menu) or `tiles` (head and a row of input tiles).                                                    |
| `source_display`      | `both`                           | `line`: the input menu shows `both` (icon and name), `icon` or `name`.                                                                |
| `info`                | `[temperature, fan, humidity]`   | Values next to the name: `temperature` (the one driving the fan), `box`, `cpu`, `fan`, `humidity`, `pressure`, `rpm`.                 |
| `show_status`         | `true`                           | The line under the name.                                                                                                              |
| `show_pi`             | `true`                           | The Pi button.                                                                                                                        |
| `hyperhdr`            | the only one                     | The HA-HyperHDR server device (CPU temperature, health, restart); found when there is only one.                                       |
| `confirm_pi_off`      | `true`                           | Turning the Pi off asks for a second tap (always for the clean shutdown).                                                             |
| `send_counter_entity` | none                             | A firmware sensor that changes on every confirmed send: confirms a resend of the input already on.                                    |
| `entities`            | none                             | Entities that do not follow the prefix, by key (`relay: switch.pi_power`); keys as in the source.                                     |
| `glow`                | `100`                            | Halo strength in percent, see [Halos](#halos).                                                                                        |

The firmware's `Pi status` steps are translated; any other text from it is
shown as it is.

Without `send_counter_entity`, sending the input that is already active
changes nothing in Home Assistant: the card shows `sent`, without a check.

## vivid-hyperhdr-card

HyperHDR, the software that drives the Ambilight LEDs from the picture, as
the [HA-HyperHDR](https://github.com/Florian-BARRE/HA-HyperHDR) integration
exposes it. One card, three ways to show it:

- **`strip`**: one LED strip (a HyperHDR instance) on one line: what drives
  it, the LED device it sends to (WLED and its address), its rate.
- **`hub`**: the machine HyperHDR runs on, on one line: what it captures
  (input, resolution, rate), temperature, CPU.
- **`all`** (default): the hub, then one line per strip.

The compact card informs; brightness and colors stay with the LED devices
(WLED). Everything else is in the details.

<p>
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/hyperhdr.png" alt="HyperHDR card, one strip" width="428" />
</p>
<p>
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/hyperhdr-hub.png" alt="HyperHDR card, the hub" width="428" />
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/hyperhdr-all.png" alt="HyperHDR card, hub and strips" width="428" />
</p>

Needs the HA-HyperHDR integration (HACS, custom repository). The card finds its
devices and entities by itself.

### What the card shows

- **Strip line**: the strip's icon lit with its colors; a second line of
  your choice (source, LED device, output rate, LED count, brightness), with
  `LED output off` first when nothing reaches the strip; the state of the
  components you pick (HDR by default; LED output, video capture, smoothing,
  black borders) as small lit icons; the power button.
- **Hub line**: green, orange from 70 °C, red from 80 °C or on undervoltage;
  a second line of your choice (input, resolution, capture rate,
  temperature, CPU, RAM, version, strips on), the problem first; up to three
  values on the right (temperature, CPU, RAM, capture rate).
- **Details** (tap a strip or the hub), in four tabs:
  - **Overview**: the picture on demand, the source (capture, an effect from the
    list, a color from the swatches or Home Assistant's color picker), the
    source forced on the LEDs if there is one, the brightness.
  - **Colors**: saturation, gamma, dark threshold, color temperature and how
    the picture becomes LED colors.
  - **Processing**: smoothing (time and type), black border detection, HDR
    tone mapping, continuous output, anti-flickering filter, background and
    boot effects.
  - **System**: the hub, the grabber, video capture and LED output, the
    version; from the hub, the list of strips.

<p>
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/hyperhdr-overview.png" alt="Details: overview" width="300" />
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/hyperhdr-processing.png" alt="Details: processing" width="300" />
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/hyperhdr-system.png" alt="Details: system" width="300" />
</p>

**The picture, on demand.** HyperHDR encodes every frame as JPEG while its
picture streams, which costs the Raspberry Pi. So the picture is never on the
dashboard: in the details, **Show the screen** plays it for 2 minutes
(`picture_timeout`: 1, 2 or 5), with **Extend** and **Stop**; it also stops
when the details close or leave the screen, and the integration then stops
HyperHDR's image stream. The picture, the LED device and most settings need
the admin password in the integration; without it the card keeps the strips,
the components and the hub.

### Visual editor

<p>
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/hyperhdr-editor.png" alt="Visual editor of the HyperHDR card" width="300" />
</p>

Pick what to show, then the HyperHDR server and, for one strip, the strip
(left empty: the first found). Then the lines: what the second line of the
hub and of the strips says, the values and component states shown, as
numbered chips (tap to add or remove, arrows to reorder); the strips' power
button, one line per strip, the picture's duration and the halo.

### Recipes

```yaml
# The Pi and every strip
type: custom:vivid-hyperhdr-card

# One strip: where it sends and how fast, LED output and HDR
type: custom:vivid-hyperhdr-card
mode: strip
instance: 0123456789abcdef0123456789abcdef # the strip's device
strip_info: [device, fps]
strip_icons: [led_output, hdr]

# The hub alone: what it captures, temperature, CPU and RAM
type: custom:vivid-hyperhdr-card
mode: hub
hub_info: [input, video_mode, capture_fps]
hub_values: [temperature, cpu, memory]
```

With the [Ambilight card](#vivid-ambilight-card) next to it, one column holds
the whole chain: the box behind the TV (HDMI source, Pi power, fan), then
HyperHDR and its strips.

### Options

| Option            | Default                            | Description                                                                                                   |
| ----------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `mode`            | `all`                              | `all` (hub and strips), `hub` or `strip`.                                                                     |
| `server`          | first found                        | The HyperHDR server device.                                                                                   |
| `instance`        | first found                        | `strip`: the strip's device (a HyperHDR instance).                                                            |
| `name`            | device's name                      | Title of the card.                                                                                            |
| `hub_info`        | `[input, video_mode, capture_fps]` | Hub's second line: `input`, `video_mode`, `capture_fps`, `temperature`, `cpu`, `memory`, `version`, `strips`. |
| `hub_values`      | `[temperature, cpu]`               | Values on the right of the hub: `temperature`, `cpu`, `memory`, `capture_fps`.                                |
| `strip_info`      | `[source, device, fps]`            | Strips' second line: `source`, `device`, `fps`, `leds`, `brightness`.                                         |
| `strip_icons`     | `[hdr]`                            | Component states: `led_output`, `video_capture`, `hdr`, `smoothing`, `black_border`.                          |
| `show_strips`     | `true`                             | `all`: one line per strip.                                                                                    |
| `show_power`      | `true`                             | The strips' power button.                                                                                     |
| `picture_timeout` | `120`                              | Seconds the picture plays in the details once asked: `60`, `120` or `300`.                                    |
| `glow`            | `100`                              | Halo strength in percent, see [Halos](#halos).                                                                |

`picture` (older versions) is ignored: the picture is in the details only.

## Light badges

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

### vivid-led-badge

LED strips. Icon `mdi:led-strip-variant`, crossed out when off.

### vivid-lamp-badge

Lamps. Icon `mdi:lamps`, with a stroke when off.

<p align="center">
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/lamp-badge.png" alt="Lamp badge with every lamp under it" width="400" />
</p>

### vivid-light-badge

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

## Status badges

Six badges share the look and gestures of the light badges: an icon on a disc
(`look: disc`) or the whole badge filled (`look: pill`), a halo that follows
the situation (`glow`, 0 to 200 %, the same scale everywhere), and details under the badge with one row
per entity; a row opens that entity's Home Assistant dialog. They only show
things, so a tap and a hold both open the details by default.

<p align="center">
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/badges.png" alt="Window, door, illuminance, power, presence and battery badges" width="420" />
</p>

Point a badge at a group (a binary sensor group or a sensor group made with the
Home Assistant group helper, or an old-style `group.`), at one entity, or list
`entities`. Badges that combine values compute them from the members with
`aggregate` (`mean`, `median`, `min`, `max` or `sum`), whatever the group's own
type.

Options of every status badge:

| Option        | Default   | Description                                     |
| ------------- | --------- | ----------------------------------------------- |
| `entity`      | —         | A group or an entity.                           |
| `entities`    | —         | Several entities, instead of a group.           |
| `name`        | entity    | Title of the details.                           |
| `icon`        | auto      | Icon while active.                              |
| `icon_off`    | auto      | Icon at rest (windows, doors, presence, power). |
| `look`        | `disc`    | `disc` or `pill`.                               |
| `glow`        | `100`     | Halo strength in percent, 0 to 200.             |
| `tap_action`  | `details` | Any card action.                                |
| `hold_action` | `details` | Any card action.                                |

### vivid-window-badge

Windows: `3/7` open. Everything closed: the closed window, greyed. The color
follows the oldest opening: blue, amber after `warn_after` minutes, red and
pulsing after `alert_after`. One sensor shows how long it has been open. The
details list open windows first, with how long.

<p align="center">
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/window-badge.png" alt="Window badge with its details" width="400" />
</p>

```yaml
- type: custom:vivid-window-badge
  entity: binary_sensor.windows
  warn_after: 20
  alert_after: 60
```

### vivid-door-badge

Doors: the same, with doors opening and closing (garage doors keep their own
icon in the details).

<p align="center">
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/door-badge.png" alt="Door badge with its details" width="400" />
</p>

```yaml
- type: custom:vivid-door-badge
  entity: binary_sensor.doors
```

Options of the window and door badges:

| Option        | Default | Description                                           |
| ------------- | ------- | ----------------------------------------------------- |
| `warn_after`  | `15`    | Minutes open before amber.                            |
| `alert_after` | `45`    | Minutes open before red and pulsing.                  |
| `show_count`  | `true`  | `3/7` next to the icon (the duration for one sensor). |
| `show_zero`   | `false` | `0/7` when everything is closed.                      |

`vivid-opening-badge` from 0.6.0 (windows and doors mixed) keeps working but is
no longer offered in the badge picker: use the window and door badges instead.

### vivid-presence-badge

One room: present for `12 min` (blue, a ring pulsing like a radar), or seen
`2 min` ago (greyed). A group: rooms occupied, `2/4`. The details draw each
room's last six hours from the history.

<p align="center">
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/presence-badge.png" alt="Presence badge with its details" width="400" />
</p>

```yaml
- type: custom:vivid-presence-badge
  entity: binary_sensor.living_room_presence
```

| Option          | Default | Description                                |
| --------------- | ------- | ------------------------------------------ |
| `show_duration` | `true`  | One sensor: the duration next to the icon. |
| `show_count`    | `true`  | A group: `2/4` next to the icon.           |
| `show_zero`     | `false` | A group: `0/4` when nobody is there.       |

### vivid-illuminance-badge

The mean of a group by default. The icon goes from the moon to the sun, the
color from night indigo to sunlight, and a ring around the icon fills on a log
scale (1 lx to `max`), so 20 lx and 200 lx stay apart.

<p align="center">
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/illuminance-badge.png" alt="Illuminance badge with its details" width="400" />
</p>

```yaml
- type: custom:vivid-illuminance-badge
  entity: sensor.illuminance
  aggregate: max
```

| Option      | Default | Description                              |
| ----------- | ------- | ---------------------------------------- |
| `aggregate` | `mean`  | `mean`, `median`, `min`, `max` or `sum`. |
| `max`       | `2000`  | Lux at which the ring is full.           |
| `gauge`     | `true`  | The ring around the icon.                |

### vivid-power-badge

The sum of a group by default, in W or kW (kW sensors are converted). Same glow
as the LED card's consumption badge: neutral below `idle`, then yellow, amber
and orange, pulsing from half of `max`. The details sort devices by power.

<p align="center">
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/power-badge.png" alt="Power badge with its details" width="400" />
</p>

```yaml
- type: custom:vivid-power-badge
  entity: sensor.home_power
  max: 4000
```

| Option      | Default | Description                               |
| ----------- | ------- | ----------------------------------------- |
| `aggregate` | `sum`   | `sum`, `mean`, `median`, `min` or `max`.  |
| `idle`      | `5`     | Watts below which the badge is neutral.   |
| `max`       | `3000`  | Watts at which the glow is the brightest. |

### vivid-battery-badge

The lowest battery of a group, or of every battery of the home when no entity
is set (sensors with the `battery` device class in %, and low-battery binary
sensors). The icon empties with the level; green, amber below `warn`, red and
pulsing below `low`. The details sort batteries from the lowest.

<p align="center">
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/battery-badge.png" alt="Battery badge with its details" width="400" />
</p>

```yaml
- type: custom:vivid-battery-badge
  display: low_count
```

| Option      | Default | Description                                                       |
| ----------- | ------- | ----------------------------------------------------------------- |
| `aggregate` | `min`   | `min`, `mean` or `median`.                                        |
| `display`   | `level` | `level` (`9 %`) or `low_count` (`2 low`, the level when none is). |
| `low`       | `15`    | Percent below which a battery is low (red).                       |
| `warn`      | `30`    | Percent below which a battery is amber.                           |

## Climate badges

Four badges for the climate of a room or of the whole home:
`vivid-temperature-badge`, `vivid-humidity-badge`, `vivid-pressure-badge` and
`vivid-air-quality-badge` (CO₂ in ppm). Each measure has its own color scale,
the same one the climate charts use:

- **Temperature**: blue when cold, pale yellow then orange inside the comfort
  range (19–23 °C by default), red when hot.
- **Humidity**: light cyan when dry to deep blue when very humid.
- **Pressure**: violet, dark for a low (stormy) pressure, light for a high one.
  The icon follows the weather it suggests.
- **Air quality**: healthy green to toxic green, with its level in words
  (Excellent, Good, Moderate, Poor, Toxic) in the tooltip and the details. From
  1 000 ppm the icon becomes an open window: time to air the room.

The icon disc is filled with the exact color of the value, with a white icon.
Inside the comfort range there is no halo; outside, a halo in the same color
grows the further the value goes. Temperatures from °F sensors are colored like
their °C equivalent and written in °F.

Small arrows show the trend: a temperature that moved more than 0.5 °C or a
humidity more than 5 points in the last hour, a pressure on its three-hour
trend. A pressure falling more than 3 hPa in three hours turns the halo to an
alert (storm or strong wind likely), a humidity jumping more than 10 points in
15 minutes pulses (a shower), and so does toxic air. The badge fetches this
short history when it appears, then every ten minutes.

With several sensors (a sensor group or `entities`), the badge shows what asks
for action:

- temperature: the range of the rooms (`17,9–22,7°`), the disc split between
  the color of the coldest room and the warmest, the halo in the color of the
  room furthest from comfort;
- humidity: the most humid room (`max 58 %`);
- air quality: the worst room;
- pressure: the mean.

`aggregate` overrides this. Tap a badge for the history of its sensor, or one
curve per room; tap a room for its own chart.

```yaml
- type: custom:vivid-temperature-badge
  entity: sensor.all_temperatures
  comfort: [19, 22]
- type: custom:vivid-humidity-badge
  entity: sensor.sdb_humidite
- type: custom:vivid-pressure-badge
  entity: sensor.sdb_pression
- type: custom:vivid-air-quality-badge
  entities:
    - sensor.salon_co2
    - sensor.bureau_co2
```

| Option      | Default     | Description                                                                                    |
| ----------- | ----------- | ---------------------------------------------------------------------------------------------- |
| `comfort`   | per measure | `[low, high]` in the sensor unit. Defaults: 19–23 °C, 40–60 %, 1 005–1 025 hPa, 400–1 000 ppm. |
| `aggregate` | per measure | `mean`, `median`, `min`, `max` or `sum` instead of the default above.                          |
| `range`     | `24h`       | Span of the details chart: `6h`, `24h`, `7d` or `30d`.                                         |
| `trend`     | `true`      | Trend arrows, shower and pressure drop alerts (not for air quality).                           |

Plus the options of every badge (`name`, `icon`, `look`, `icon_color`, `glow`,
`tap_action`, `hold_action`).

### White icons on colored discs

Every Vivid badge now draws a white icon on its colored disc, with a soft
shadow that keeps it readable on light colors (pale yellow, cyan, lavender, a
white light). `icon_color: auto` brings back the dark icon on very light colors.

| Option       | Default | Description                                          |
| ------------ | ------- | ---------------------------------------------------- |
| `icon_color` | `white` | `white`, or `auto` (dark icon on very light colors). |

### Doors and windows: count and duration

While something is open, a group badge shows how many are open and how long
the oldest has been open: `3/6 · 19 min`. That duration is what turns the
halo amber, then red. `show_count: false` hides both.

### Illuminance from a text sensor

`vivid-illuminance-badge` also reads sensors that report a word instead of lux:
`bright`, `dim`, `dark` (and `light`, `twilight`, `night`… whatever the case).
Each level sits on the same gauge and colors as the lux, with a sun, a dimmed
sun or a moon. The badge shows the icon alone; `show_label: true` also writes
the level (Bright, Dim, Dark).

## vivid-room-header

The header of a room, in one card: its title with the room power button next
to it, the lights on and the consumption under it ("4 on · 138 W", or
"everything is off"), and the room badges centered below. Behind the title,
one soft glow per light source, in its real color: amber for the lamps and
switches, each LED strip in its current color, each as bright as the light.
No glow when everything is off; colors fade smoothly (instantly with reduced
motion).

It replaces the usual stack of a spacer, a title card, a badge row and a
separate power badge.

```yaml
type: custom:vivid-room-header
room: salon
```

With `room: salon`, the card finds the entities named after the room:

| Entity                                                                  | Used for                                        |
| ----------------------------------------------------------------------- | ----------------------------------------------- |
| `switch.salon_lampes`, `switch.salon_interrupteurs`, `light.salon_leds` | Lights: count, power button, halo, badges       |
| `sensor.salon_puissance`                                                | Consumption under the title                     |
| `sensor.salon_eclairement`                                              | Illuminance badge                               |
| `binary_sensor.salon_presence`                                          | Presence badge                                  |
| `binary_sensor.salon_fenetres`, `binary_sensor.salon_portes`            | Window and door badges                          |
| `sensor.salon_temperature`, `_humidite`, `_co2`                         | Climate badges, when those badges are installed |

Lights on are counted per member of the groups (two lamps and two strips on
make "4 on"). A tap on the power button turns everything in the room off when
something is on, otherwise turns the room's lights on; a hold opens the
more-info of the main group (the first light, or `entity`).

Everything can be set instead of discovered:

```yaml
type: custom:vivid-room-header
room: salon
name: Living room
lights:
  - switch.salon_lampes
  - light.salon_leds
power: sensor.salon_puissance
badges:
  - type: custom:vivid-lamp-badge
    entity: switch.salon_lampes
  - type: custom:vivid-led-badge
    entity: light.salon_leds
  - type: custom:vivid-door-badge
    entity: binary_sensor.salon_portes
```

### Options

| Option          | Default                   | Description                                                             |
| --------------- | ------------------------- | ----------------------------------------------------------------------- |
| `room`          |                           | Room id of the naming convention (`salon`).                             |
| `name`          | the room id, capitalized  | Title.                                                                  |
| `lights`        | discovered groups         | Lights and switches (or groups) of the room.                            |
| `power`         | `sensor.<room>_puissance` | Power sensor (W or kW).                                                 |
| `entity`        | first light               | More-info opened by a hold on the power button.                         |
| `badges`        | discovered                | Vivid badges (`type: custom:vivid-…` plus their own options).           |
| `show_subtitle` | `true`                    | Lights on and consumption under the title.                              |
| `show_badges`   | `true`                    | Badge row.                                                              |
| `glow`          | `100`                     | Halo strength in percent (0–200), or `off`, `soft`, `normal`, `strong`. |

Set `room`, or a `name` with its `lights`.

## Troubleshooting

**"Custom element doesn't exist: vivid-led-group".** The resource is not
loaded. With HACS, reload the page; in the companion app, reset its frontend
cache from the app settings. Installed by hand, check the resource URL and that
its type is **JavaScript module**.

**The card did not change after an update.** The browser still has the old
file: reload without cache (Ctrl + F5) or reset the companion app frontend
cache. The browser console logs the loaded version (`VIVID CARDS vX.Y.Z`).

**No consumption badge.** The editor banner says how many lights have a
consumption source. Open **Consumption** and give a sensor pattern or a strip
voltage, or pick a sensor for a light in **Detected lights**.

**The 7 days chart is empty.** The power sensors have no long-term statistics:
give them `state_class: measurement` (template sensors accept it), and wait for
Home Assistant to compile the first hours.

**A red bulb on a lamp.** The lamp card flags a lamp on for a minute that
draws less than `warn_below` (1 W): a bulb out, or the lamp's own switch off.
Lower `warn_below` for lamps that really draw that little (some LED bulbs),
or set it to `0`. Plugs without a power sensor are never flagged.

**No ambilight button.** It only shows for WLED strips with their live override
entity enabled, and when `ambilight.enabled` is on.

**The details do not open from another card.** Set `details.hash` on the LED
card, and use the same hash, with `#`, in the other card's `navigation_path`.

**The Pi is cut instead of shutting down (Ambilight card).** Home Assistant
refused the box's action (a repair says "not allowed to perform Home
Assistant actions"): turn on "Allow the device to perform Home Assistant
actions" in the ESPHome device's options. The firmware waits for HyperHDR to
go, then cuts the power anyway.

**The fan stays on the box curve with HyperHDR connected.** The firmware does
not read the server's entities: the Ambilight editor (and the Maintenance
tab) shows the `substitutions` to write in the ESPHome YAML, with the real
entity ids.

**A beta version.** HACS → the repository → ⋮ → **Redownload** → **Show beta
versions**, then reload without cache.

**An error on the card.** The card explains which option is wrong; fix it in
the YAML or open the editor, which keeps the last valid preview while you type.

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

## Roadmap

- Temperature, humidity and pressure badges.
- Label driven badges: show any entity of a strip's device on its header.
- WLED palette previews.

## Development

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev      # preview page with a simulated Home Assistant
npm run check    # format, lint, typecheck, tests and build
npm run build    # dist/vivid-cards.js
```

The preview pages run the cards against an in-memory Home Assistant (three
WLED strips with presets, diagnostics and history, two tunable white spots), so you can work on the UI without a
server: `/dev/` for the cards, `/dev/editor.html` for the visual editor in
several situations, `/dev/lamps.html` for the lamp card.

### Testing on your Home Assistant

1. Copy `.env.example` to `.env.local` and set `VIVID_DEPLOY_DIR` to your
   `config/www/vivid-cards` folder (a Samba share works).
2. Run `npm run deploy`: it builds and copies the bundle there.
3. Point your dashboard resource to `/local/vivid-cards/vivid-cards.js` and bump
   its `?v=` query after each deploy so browsers reload it.

### Releasing

1. Update `version` in `package.json` and the changelog.
2. Merge into `main`. The **Auto release** workflow sees a version without a
   tag: it checks the code, builds it, creates the release `vX.Y.Z` with the
   changelog entry as notes and attaches `vivid-cards.js`, which HACS installs.

A version such as `0.12.0-beta.1` is published as a **pre-release**: HACS
offers it only with "Show beta versions" turned on, so betas can be tested
from HACS before the final version.

A release drafted by hand on GitHub works too: the **Release** workflow attaches
the bundle to it.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the architecture and conventions.

## License

[MIT](LICENSE) © Florian Barre

## LED group: collapsible layout and Ambilight rail

`vivid-led-group` keeps its header and tile by default. Two opt-in additions:

**Collapsible layout.** `layout: collapsible` turns the card into one 64 px line
tinted with the LEDs' color (icon, name, `57 % · Solid · 2/3 · 42 W`, power
button, chevron). The chevron unfolds the color bar and the favorites in the same
card; dragging the line still dims. The card remembers the choice per light on
this device; `expanded: true` sets the first state.

**Ambilight rail.** With the [Ambilight box](#vivid-ambilight-card), a rail at the
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
