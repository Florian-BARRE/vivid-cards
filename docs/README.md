<p align="center"><img src="assets/logo.svg" alt="Vivid Cards" width="96" /></p>

# Vivid Cards documentation

Every card and badge has its own page: what it shows, its options, examples
and screenshots in both themes. New here? Start with the
[installation](../README.md#installation).

## Cards

### Lights

| Card                                        | What it is for                                                        |
| ------------------------------------------- | --------------------------------------------------------------------- |
| [`vivid-led-group`](cards/led-group.md)     | A light group or a single light, WLED aware, with details per light   |
| [`vivid-lamp-group`](cards/lamp-group.md)   | Lamps on smart plugs or switches: on/off, watts, presets, daily cost  |
| [`vivid-room-header`](cards/room-header.md) | A room's title, power button, lights on and watts, real-color halo    |
| [`vivid-light-card`](cards/light.md)        | One light as a tile; a WLED strip with its Settings and Device panels |
| [`vivid-power-card`](cards/power.md)        | The consumption of a few devices over 6 h, 24 h or 7 days             |

### Ambilight and HyperHDR

| Card                                         | What it is for                                                        |
| -------------------------------------------- | --------------------------------------------------------------------- |
| [`vivid-ambilight-card`](cards/ambilight.md) | The DIY Ambilight box: HDMI source by IR, Pi power, temperatures, fan |
| [`vivid-hyperhdr-card`](cards/hyperhdr.md)   | HyperHDR: the Pi and what it captures, the strips and their devices   |
| [`vivid-screen-card`](cards/screen.md)       | The live picture of the TV, framed by its own colors                  |
| [`vivid-fan-card`](cards/fan.md)             | The box's fan, its mode and its temperature curve                     |
| [`vivid-hdmi-card`](cards/hdmi.md)           | The HDMI inputs as tiles, sent by IR and confirmed by the echo        |
| [`vivid-pi-card`](cards/pi.md)               | The Raspberry Pi on one line, with its clean shutdown                 |

The LED group shows the Ambilight box as a rail under the strips and an
Ambilight mode: see [its page](cards/led-group.md#collapsible-layout-and-ambilight-rail).

### Electricity

Start with the [electricity guide](guides/electricity.md): the tariff, the data
source and how the projection works, shared by every card below.

| Card                                                | What it is for                                                  |
| --------------------------------------------------- | --------------------------------------------------------------- |
| [`vivid-bill-card`](cards/bill.md)                  | The bill in progress: estimated amount, what is spent, the pace |
| [`vivid-bills-card`](cards/bills.md)                | Past bills, the one in progress with its projection, the next   |
| [`vivid-bill-ring`](cards/bill-ring.md)             | Where each euro goes, or the off-peak share                     |
| [`vivid-energy-calendar`](cards/energy-calendar.md) | A month colored by price; a tap shows the day hour by hour      |
| [`vivid-energy-flow`](cards/energy-flow.md)         | From the meter to the devices, the measured part zoomed in      |
| [`vivid-energy-ranking`](cards/energy-ranking.md)   | Devices ranked by energy and cost                               |
| [`vivid-load-curve`](cards/load-curve.md)           | A day hour by hour over the off-peak hours, with the standby    |

### Climate

| Card                                     | What it is for                                    |
| ---------------------------------------- | ------------------------------------------------- |
| [`vivid-climate-card`](cards/climate.md) | One sensor and its history, with the comfort band |

## Badges

| Page                                       | Badges                                                         |
| ------------------------------------------ | -------------------------------------------------------------- |
| [Light badges](badges/light-badges.md)     | `vivid-led-badge`, `vivid-lamp-badge`, `vivid-light-badge`     |
| [Status badges](badges/status-badges.md)   | windows, doors, presence, illuminance, power, batteries        |
| [Climate badges](badges/climate-badges.md) | temperature, humidity, pressure, air quality                   |
| [Energy badges](badges/energy-badges.md)   | `vivid-bill-badge`, `vivid-tariff-badge`, `vivid-energy-badge` |

## Guides

- [Electricity](guides/electricity.md): tariff, invoices, data source, projection.
- [Troubleshooting](guides/troubleshooting.md): the card does not load, no consumption, the Pi is cut…
- [Halos and theming](guides/theming.md): the glow, the theme variables.
- [Development](guides/development.md): preview pages, tests, releases.

## Images

The screenshots come from the preview pages (`npm run dev`), captured in both
themes; the banner and the dashboard picture are drawn from them by
[`docs/design`](design/README.md).
