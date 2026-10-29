# Status badges

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

## vivid-window-badge

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

## vivid-door-badge

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

## vivid-presence-badge

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

## vivid-illuminance-badge

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

## vivid-power-badge

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

## vivid-battery-badge

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
