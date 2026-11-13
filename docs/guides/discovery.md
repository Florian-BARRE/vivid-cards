# Vivid Pilot and manual

Vivid Cards no longer guess anything from entity names or areas.
[Vivid Pilot](https://github.com/Florian-BARRE/vivid-pilot) sorts the home:
each device in its room and its kind (lights, LEDs, switches, doors,
windows, presence, climate, illuminance, batteries, power), with its groups,
aggregates, power, energy and the memory of each room's last lighting. The
cards read what it generated, through two attributes every Vivid Pilot
entity carries: `vivid_pilot_node` (`salon`, `salon__light`, `all__battery`…)
and `vivid_pilot_kind` (`group`, `mean`, `any`, `power`, `energy`…). Renaming
an entity never breaks a card.

## Two sources

Every card and badge has a **Source** at the top of its editor:

| Source      | What the card shows                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Vivid Pilot | A room or a group picked in a list (`pilot: salon__light`); its members follow Vivid Pilot, live. |
| Manual      | Only the entities you pick (`entity:` or `entities:`), for what Vivid Pilot does not cover.       |

A home-level measure (`pilot: all__temperature`) lists the rooms in its
details ("Salon", "Chambre"), each room's own mean, rather than raw sensors.

## Slots

Each thing a card expects (a room's lights, its presence, the members of a
group, the rooms of the energy cards) is a **slot**, with the same row in
the editor and one of four modes:

| Mode            | What the card does                                                            |
| --------------- | ----------------------------------------------------------------------------- |
| Pilot           | Uses what Vivid Pilot gives: a device it adds to the room shows up by itself. |
| Pilot, adjusted | What Vivid Pilot gives, minus what you unticked, plus what you added.         |
| Manual          | Only the entities you picked.                                                 |
| Off             | Nothing for this slot (no badge, no light, no part of the card).              |

Unfolded, a slot row lists each entity with its origin: **Vivid Pilot ·
Salon › Lumières**, **member of light.x**, **from the device …**, **added**,
**chosen**. "Back to what is found" drops every adjustment.

## What stays outside Vivid Pilot

Device cards (Air Station, Ambilight, HyperHDR) find the entities of their
own device; the energy cards read the grid meter and its cost from the
Energy dashboard, and their tariff and invoices from their config. Those are
not rooms, so they keep their own settings.

## In YAML, if you want to

The editor writes the shortest config:

```yaml
pilot: salon # the room (room header) or the node (cards and badges)
entities:
  presence: false # off
  led: { exclude: [light.vivid_pilot_salon_led], add: [light.wled_tv] } # adjusted
  power: sensor.salon_power # manual
  # a slot not listed follows Vivid Pilot
```

Group cards and badges use `exclude:` and `add:` at the top of their config,
energy cards `devices:`.
