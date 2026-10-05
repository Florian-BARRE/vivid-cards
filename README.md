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
    <td align="center"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/led-badge.png" alt="LED badge details" width="400" /><br /><sub><b>LED badge: hold for every strip</b></sub></td>
    <td align="center"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/window-badge.png" alt="Window badge details" width="400" /><br /><sub><b>Window badge: open first, with how long</b></sub></td>
  </tr>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/presence-badge.png" alt="Presence badge details" width="400" /><br /><sub><b>Presence: the last six hours of each room</b></sub></td>
    <td align="center"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/battery-badge.png" alt="Battery badge details" width="400" /><br /><sub><b>Batteries: every battery from the lowest</b></sub></td>
  </tr>
</table>

## What is inside

| Card or badge                                         | What it is for                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------- |
| [`vivid-led-group`](#vivid-led-group) (card)          | A light group or a single light, WLED aware, with details per light    |
| [`vivid-lamp-group`](#vivid-lamp-group) (card)        | Lamps on smart plugs or switches: on/off, watts, presets, daily cost   |
| [`vivid-led-badge`](#vivid-led-badge)                 | LED strips on out of the total, in their colors; tap switches them all |
| [`vivid-lamp-badge`](#vivid-lamp-badge)               | Lamps (bulbs or smart plugs) on out of the total, in amber             |
| [`vivid-light-badge`](#vivid-light-badge)             | Any other lights (ceiling lights, spots…)                              |
| [`vivid-window-badge`](#vivid-window-badge)           | Windows open out of the total, warming up the longer they stay open    |
| [`vivid-door-badge`](#vivid-door-badge)               | Doors and garage doors open out of the total                           |
| [`vivid-presence-badge`](#vivid-presence-badge)       | Presence in a room, or rooms occupied, with the last hours of each     |
| [`vivid-illuminance-badge`](#vivid-illuminance-badge) | Illuminance of a group, from the moon to the sun, with a gauge         |
| [`vivid-power-badge`](#vivid-power-badge)             | Power of a group of devices, glowing brighter as it rises              |
| [`vivid-battery-badge`](#vivid-battery-badge)         | The lowest battery of a group or of the whole home                     |

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

| Option              | Default      | Description                                                                                                    |
| ------------------- | ------------ | -------------------------------------------------------------------------------------------------------------- |
| `color_bar`         | `auto`       | `auto` (hue for color lights, temperature for tunable whites, none otherwise), `hue`, `temperature` or `none`. |
| `state`             | `brightness` | Text on the tile: `brightness` or `none`.                                                                      |
| `effects`           | `true`       | Effect picker.                                                                                                 |
| `favorites`         | none         | Up to 8 colors: `"#ff8800"`, `[255, 136, 0]`, `{ kelvin: 2700 }`, each with an optional `brightness` (%).      |
| `brightness_min`    | `1`          | Lowest brightness (%) a drag sets; dragging to the left edge still turns off.                                  |
| `brightness_step`   | `1`          | Brightness step (%) of a drag.                                                                                 |
| `transition`        | none         | Seconds of fade sent with every light command.                                                                 |
| `tap_action`        | `toggle`     | Any Home Assistant action, plus `details`.                                                                     |
| `hold_action`       | `details`    | `details` for a group, `more-info` for a single light.                                                         |
| `double_tap_action` | `none`       | Same syntax.                                                                                                   |

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

| Option          | Default          | Description                                                                                         |
| --------------- | ---------------- | --------------------------------------------------------------------------------------------------- |
| `enabled`       | groups only      | The details dialog.                                                                                 |
| `hash`          | none             | Opens the details when the page URL ends with this hash, so any card can open them with `navigate`. |
| `sort`          | `name`           | `name`, `group` (order of the group) or `custom` (with `order`).                                    |
| `order`         | none             | Entity ids in display order, with `sort: custom`. The editor fills it with its arrows.              |
| `summary`       | `true`           | Group badges at the top.                                                                            |
| `history`       | `true`           | Consumption chart, energy and cost.                                                                 |
| `effects`       | `tile.effects`   | Effect picker of each light.                                                                        |
| `favorites`     | `true`           | Favorite colors on each light.                                                                      |
| `wled_controls` | `true`           | WLED **Settings** panel.                                                                            |
| `health`        | `true`           | WLED **Device** panel.                                                                              |
| `color_bar`     | `tile.color_bar` | Color bar of each light, same values as `tile.color_bar`.                                           |

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
| `glow`            | `100`      | Halo strength in percent, 0 to 200. Softer than the LED card: its 100 % is 70 % of the LED card's halo.  |
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

| Option        | Default    | Description                                                                                         |
| ------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| `entity`      | (required) | A light, a switch, or a group of either (light group, switch group or `group.`).                    |
| `name`        | entity     | Title of the details.                                                                               |
| `icon`        | auto       | Icon while on.                                                                                      |
| `icon_off`    | auto       | Icon while off. Auto: the crossed-out version of `icon`, or `icon` with a stroke.                   |
| `look`        | `disc`     | `disc`: the colors on a disc behind the icon. `pill`: the whole badge filled.                       |
| `layout`      | `list`     | Details: `list` (rows with a brightness slider) or `compact` (two columns, drag sideways to dim).   |
| `show_count`  | `true`     | `2/3` (or the brightness of a single light) next to the icon while on.                              |
| `show_zero`   | `false`    | Also show `0/3` next to the crossed-out icon when everything is off.                                |
| `glow`        | `100`      | Halo strength in percent, 0 to 200. Softer than the LED card: its 100 % is 70 % of the card's halo. |
| `glow_boost`  | `100`      | How much the halo grows with the brightness, 0 to 200, as on the card.                              |
| `transition`  | none       | Seconds of fade sent with every command.                                                            |
| `tap_action`  | `toggle`   | Any card action; `toggle` switches the whole group.                                                 |
| `hold_action` | `details`  | `details` opens the lights under the badge.                                                         |

The count leaves out lights Home Assistant cannot reach: they show as
unavailable in the details.

## Status badges

Six badges share the look and gestures of the light badges: an icon on a disc
(`look: disc`) or the whole badge filled (`look: pill`), a halo that follows
the situation (`glow`, 0 to 200 %, softer than the LED card as on the light badges), and details under the badge with one row
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

**An error on the card.** The card explains which option is wrong; fix it in
the YAML or open the editor, which keeps the last valid preview while you type.

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

A release drafted by hand on GitHub works too: the **Release** workflow attaches
the bundle to it.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the architecture and conventions.

## License

[MIT](LICENSE) © Florian Barre
