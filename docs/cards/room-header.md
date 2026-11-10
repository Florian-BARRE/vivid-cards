# vivid-room-header

The header of a room, in one card: its title with the room power button next
to it, the lights on and the consumption under it ("4 on · 138 W", or
"everything is off"), and the room badges centered below. Behind the title,
one soft glow per light source, in its real color: amber for the lamps and
switches, each LED strip in its current color, each as bright as the light.
No glow when everything is off; colors fade smoothly (instantly with reduced
motion).

It replaces the usual stack of a spacer, a title card, a badge row and a
separate power badge.

<p>
  <img src="../assets/cards/room-header.png" alt="Room header" width="440" />
  <img src="../assets/cards/room-header-light.png" alt="Room header, light theme" width="440" />
</p>

```yaml
type: custom:vivid-room-header
room: salon
```

## Set up in the editor

Everything is set in the visual editor, in five sections (YAML is optional):

- **Discovery**: the room, discovery on or off, the name pattern
  (`{room}-{role}` by default, with what it looks for), the Home Assistant
  area, and where to look first (by name, in the area, or both).
- **Lights and power**: one row per light role (lamps, LEDs, switches) and the
  power sensor. Each row shows what was found and how, with the
  [four modes](../guides/discovery.md): auto, adjusted (untick, add), manual,
  off.
- **Power button**: when it shows, the room's scripts (`salon-scripts-on`,
  `salon-scripts-off`, `salon-scripts-toggle`, found by name), and what a tap
  does when everything is off and when a light is on, and a hold. Each is
  automatic (the room's script for that way, else the lights) or any Home
  Assistant action (a script, a scene, navigate, more-info…). The section
  says in plain words what a tap runs now.
- **Badges**: the badges in order: the badge of a role, "the other badges
  found" (every role not listed, so a role found later shows up there), and
  free badges (a kind and any entity). Each moves, goes away, and unfolds to
  its options: name, icon, tap and hold actions, "shown only when" an entity
  is (or is not) in a state; a free badge shows its own full editor. Then one
  row per badge role, to choose what each shows.
- **Look**: title, subtitle, halo.

A 0.14–0.17 config keeps working; the editor shows it in these sections the
first time it opens.

## Roles

| Role (aliases)                             | Kind                          | Feeds                                     |
| ------------------------------------------ | ----------------------------- | ----------------------------------------- |
| `lampes` (`lamps`)                         | switch, light (area: outlets) | Lights (count, power button, halo), badge |
| `leds` (`led`)                             | light                         | Lights, LED badge                         |
| `interrupteurs` (`switches`)               | switch, light                 | Lights, light badge                       |
| `puissance` (`power`)                      | sensor                        | Consumption under the title               |
| `eclairement` (`illuminance`)              | sensor                        | Illuminance badge                         |
| `presence` (`occupancy`, `motion`)         | binary_sensor                 | Presence badge                            |
| `fenetres` (`windows`), `portes` (`doors`) | binary_sensor                 | Window and door badges                    |
| `temperature`, `humidite` (`humidity`)     | sensor                        | Temperature and humidity badges           |
| `pression` (`pressure`), `co2` (`air`)     | sensor                        | Pressure and air quality badges           |
| `scripts_on`, `scripts_off`                | script                        | What the power button runs                |
| `scripts_toggle`                           | script                        | Power button, both ways                   |

Lights on are counted per member of the light groups (two lamps and two
strips on make "4 on").

## In YAML

```yaml
type: custom:vivid-room-header
room: sdb
name: Salle de bain
naming: { pattern: '{room}-{role}' } # default
area: salle_de_bain # used when the name finds nothing
entities:
  presence: false
  leds: { exclude: [light.sdb_miroir] }
power_button:
  on_action:
    {
      action: perform-action,
      perform_action: scene.turn_on,
      target: { entity_id: scene.sdb_douce },
    }
badges:
  - slot: temperature
    tap_action: { action: more-info }
  - slot: '*'
  - type: custom:vivid-illuminance-badge
    entity: sensor.capteur_illumination
    visibility: [{ condition: state, entity: binary_sensor.sdb_presence, state: 'on' }]
```

## Options

| Option          | Default                      | Description                                                                                                               |
| --------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `room`          |                              | Room of the name pattern (`salon`, `Salle de bain`).                                                                      |
| `name`          | the room, capitalized        | Title.                                                                                                                    |
| `discover`      | `true` with a room/area      | Find the entities; `false`: every slot manual.                                                                            |
| `naming`        | `{pattern: "{room}-{role}"}` | Name pattern.                                                                                                             |
| `area`          | the area named like the room | Home Assistant area.                                                                                                      |
| `discover_by`   | `naming_area`                | `naming_area`, `area_naming`, `naming` or `area`.                                                                         |
| `entities`      |                              | One slot per role: absent (auto), `{exclude, add}`, an entity or a list, `false`.                                         |
| `entity`        | first light                  | Entity whose more-info a hold opens by default.                                                                           |
| `power_button`  |                              | `on_action`, `off_action`, `hold_action` (Home Assistant actions), `show` (`auto`, `always`, `never`).                    |
| `badges`        | `[{slot: "*"}]`              | Badges in order: `{slot: role}`, `{slot: "*"}`, or a free badge `{type, entity}`; each with its options and `visibility`. |
| `show_subtitle` | `true`                       | Lights on and consumption under the title.                                                                                |
| `show_badges`   | `true`                       | Badge row.                                                                                                                |
| `glow`          | `100`                        | Halo strength in percent (0–200), or `off`, `soft`, `normal`, `strong`.                                                   |

Still read: `exclude`, `lights` and `power` of 0.14–0.17.
