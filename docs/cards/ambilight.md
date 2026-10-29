# vivid-ambilight-card

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

## What the card shows

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

## Visual editor

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

## Recipes

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

## Options

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
| `glow`                | `100`                            | Halo strength in percent, see [Halos](../guides/theming.md#halos).                                                                    |

The firmware's `Pi status` steps are translated; any other text from it is
shown as it is.

Without `send_counter_entity`, sending the input that is already active
changes nothing in Home Assistant: the card shows `sent`, without a check.
