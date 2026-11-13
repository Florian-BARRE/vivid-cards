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
pilot: salon
```

Everything comes from [Vivid Pilot](https://github.com/Florian-BARRE/vivid-pilot):
pick the room, and its lights, power, badges and turn-on scene follow what
Vivid Pilot sorted into it. Nothing is looked up by entity name.

## Set up in the editor

Everything is set in the visual editor, in five sections (YAML is optional):

- **Room**: the Vivid Pilot room. Without Vivid Pilot, leave it empty and
  pick every entity by hand.
- **Lights and power**: one row per light role (lights, LEDs, switches) and the
  power. Each row shows what Vivid Pilot gives the room, with the
  [modes](../guides/discovery.md): Pilot, Pilot adjusted (untick, add),
  manual, off.
- **Power button**: when it shows, and what a tap does when everything is
  off and when a light is on, and a hold. By default a tap with everything
  off restores the room's last lighting (its Vivid Pilot memory scene; the
  lights when nothing is stored yet), and a tap with a light on turns the
  room's groups off. Any Home Assistant action can replace either way. The
  section says in plain words what a tap runs now.
- **Badges**: the badges in order: the badge of a role, "the other badges
  found" (every role not listed, so a role Vivid Pilot adds later shows up
  there), and free badges (a kind and any entity). Each moves, goes away,
  and unfolds to its options: name, icon, tap and hold actions, "shown only
  when" an entity is (or is not) in a state; a free badge shows its own full
  editor. Then one row per badge role, to choose what each shows.
- **Look**: title, subtitle, halo.

## Roles

The roles are Vivid Pilot's categories; each reads what Vivid Pilot generated
for the room.

| Role                         | Vivid Pilot entity                   | Feeds                                     |
| ---------------------------- | ------------------------------------ | ----------------------------------------- |
| `light`                      | the room's light group               | Lights (count, power button, halo), badge |
| `led`                        | the room's LED group                 | Lights, LED badge                         |
| `switch`                     | the room's switch group              | Lights, light badge                       |
| `power`                      | the room's power                     | Consumption under the title               |
| `illuminance`                | the room's mean illuminance          | Illuminance badge                         |
| `presence`, `window`, `door` | on when any of the room's sensors is | Presence, window and door badges          |
| `temperature`, `humidity`    | the room's mean                      | Temperature and humidity badges           |
| `pressure`, `co2`            | the room's mean                      | Pressure and air quality badges           |
| `battery`                    | the room's lowest battery            | Battery badge                             |

Lights on are counted per member of the light groups (two lamps and two
strips on make "4 on").

## In YAML

```yaml
type: custom:vivid-room-header
pilot: sdb
name: Salle de bain # default: the area's name
entities:
  presence: false
  led: { exclude: [light.vivid_pilot_sdb_led], add: [light.wled_miroir] }
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
    visibility: [{ condition: state, entity: binary_sensor.vivid_pilot_sdb_presence, state: 'on' }]
```

## Options

| Option          | Default         | Description                                                                                                               |
| --------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `pilot`         |                 | Vivid Pilot room: its area id (`salon`).                                                                                  |
| `name`          | the area's name | Title.                                                                                                                    |
| `entities`      |                 | One slot per role: absent (Pilot), `{exclude, add}`, an entity or a list (manual), `false` (off).                         |
| `entity`        | first light     | Entity whose more-info a hold opens by default.                                                                           |
| `power_button`  |                 | `on_action`, `off_action`, `hold_action` (Home Assistant actions), `show` (`auto`, `always`, `never`).                    |
| `badges`        | `[{slot: "*"}]` | Badges in order: `{slot: role}`, `{slot: "*"}`, or a free badge `{type, entity}`; each with its options and `visibility`. |
| `show_subtitle` | `true`          | Lights on and consumption under the title.                                                                                |
| `show_badges`   | `true`          | Badge row.                                                                                                                |
| `glow`          | `100`           | Halo strength in percent (0–200), or `off`, `soft`, `normal`, `strong`.                                                   |
