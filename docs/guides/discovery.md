# Discovery: auto, adjusted, manual

Every Vivid card finds what it shows on its own, tells you where each entity
comes from, and lets you change any of it in the visual editor. Nothing has
to be written in YAML.

## The four modes

Each thing a card expects (a room's lamps, its presence sensor, the fan of a
device, the members of a group, the devices of the Energy dashboard) is a
**slot**. Every slot has the same row in the editor, and one of four modes:

| Mode           | What the card does                                                             |
| -------------- | ------------------------------------------------------------------------------ |
| Auto           | Uses what is found, live: a new entity named the right way shows up by itself. |
| Auto, adjusted | Uses what is found, minus what you unticked, plus what you added.              |
| Manual         | Only the entities you picked; discovery is ignored for this slot.              |
| Off            | Nothing for this slot (no badge, no light, no part of the card).               |

Unfolded, a slot row lists each entity with its origin: **found by its name
"sdb-présence"**, **found in the area Salle de bain**, **member of
light.salon_leds**, **from the device …**, **from the Energy dashboard**,
**added**, **chosen**. A found entity has a box to keep or leave it out; an
added or chosen one can be moved or removed. "Back to what is found" drops
every adjustment.

## Where the discovery looks

| Source           | Finds                                             | Used by                    |
| ---------------- | ------------------------------------------------- | -------------------------- |
| Name pattern     | entities whose id or name follows `{room}-{role}` | room header                |
| Area             | entities placed in a Home Assistant area, by kind | room header                |
| Group            | the members of a group                            | LED and lamp cards, badges |
| Device           | the entities of an ESPHome device, by their names | Air Station, Ambilight     |
| Energy dashboard | the devices of Home Assistant's Energy dashboard  | energy ranking and flow    |

The name pattern is set in the room header's **Discovery** section. The
default, `{room}-{role}`, finds `salon-lampes`, `salon-présence`,
`salon-scripts-on`… (accents, case and separators ignored); write
`{role} {room}` or anything else that matches your own naming. The area is
used when the name finds nothing (or first, or alone: "Look" setting).

## In YAML, if you want to

The editor writes the shortest config. The same four modes read like this:

```yaml
entities:
  presence: false # off
  leds: { exclude: [light.salon_leds_tv], add: [light.lampe_bureau] } # adjusted
  puissance: sensor.salon_puissance # manual
  # a slot not listed is auto
```

Group cards use `exclude:` and `add:` at the top of their config; device
cards `entities: { co2: sensor.other, rssi: false }`; energy cards `devices:`.
