# vivid-lamp-group

Lamps on smart plugs, wall switches or plain on/off lights, where all you know
is whether a lamp is on and what it draws. Each lamp gets a round button that
glows with its consumption; quick presets switch several lamps at once.

<p>
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/lamp-group.png" alt="Lamp group card, ambiance layout" width="426" />
</p>

## What the card shows

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

## Expandable line

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

## Gestures

| Where        | Tap                                                          | Hold                             |
| ------------ | ------------------------------------------------------------ | -------------------------------- |
| A lamp       | Switch it (`tap_action`)                                     | Open the details (`hold_action`) |
| Title        | Open the details                                             | Open the details                 |
| Power button | Anything on: all off; else all on                            |                                  |
| Preset       | Apply it                                                     |                                  |
| Details row  | Disc or switch: switch the lamp; name: Home Assistant dialog |                                  |

## Visual editor

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

## Recipes

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

## Options

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
