# vivid-pi-card

The Raspberry Pi of the [Ambilight box](ambilight.md) on one line: its state,
the temperature that drives the fan and the fan speed, the HDMI input menu and
the switch. It is the rail drawn under a
[LED group with an Ambilight box](led-group.md#collapsible-layout-and-ambilight-rail),
as a card of its own.

<p>
  <img src="../assets/cards/pi.png" alt="Raspberry Pi card" width="440" />
  <img src="../assets/cards/pi-light.png" alt="Raspberry Pi card, light theme" width="440" />
</p>

## What the card shows

- **The icon** lit while the Pi is powered, red with an alarm (overheating,
  fan stalled, box offline).
- **The values**: box or CPU temperature, fan speed; or the alarm, or the
  shutdown in progress.
- **The input menu** and **the switch**. Turning the Pi off asks for a second
  tap; with the HyperHDR firmware it is a clean shutdown (HyperHDR stops, the
  Pi halts, then the relay opens), shown step by step.

A tap on the name opens the box's details.

## Configuration

```yaml
type: custom:vivid-pi-card
name: Ambilight
```

| Option           | Default         | Description                                         |
| ---------------- | --------------- | --------------------------------------------------- |
| `device`         | found by itself | The Ambilight manager ESPHome device (or `prefix`). |
| `inputs`         | HDMI 1…5        | Names and icons of the inputs of the menu.          |
| `confirm_pi_off` | `true`          | Turning the Pi off asks for a second tap.           |
| `name`           | the device      | Title.                                              |
