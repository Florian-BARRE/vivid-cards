# vivid-hyperhdr-card

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

## What the card shows

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

## Visual editor

<p>
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/hyperhdr-editor.png" alt="Visual editor of the HyperHDR card" width="300" />
</p>

Pick what to show, then the HyperHDR server and, for one strip, the strip
(left empty: the first found). Then the lines: what the second line of the
hub and of the strips says, the values and component states shown, as
numbered chips (tap to add or remove, arrows to reorder); the strips' power
button, one line per strip, the picture's duration and the halo.

## Recipes

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

With the [Ambilight card](ambilight.md#vivid-ambilight-card) next to it, one column holds
the whole chain: the box behind the TV (HDMI source, Pi power, fan), then
HyperHDR and its strips.

## Options

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
| `glow`            | `100`                              | Halo strength in percent, see [Halos](../guides/theming.md#halos).                                            |

`picture` (older versions) is ignored: the picture is in the details only.
