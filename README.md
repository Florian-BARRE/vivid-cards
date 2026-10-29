<p align="center">
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/banner.png" alt="Vivid Cards" width="100%" />
</p>

<p align="center">
  <a href="https://hacs.xyz"><img src="https://img.shields.io/badge/HACS-Custom-41BDF5?style=for-the-badge" alt="HACS custom repository" /></a>
  <a href="https://github.com/Florian-BARRE/vivid-cards/releases/latest"><img src="https://img.shields.io/github/v/release/Florian-BARRE/vivid-cards?style=for-the-badge&color=ff5f6d" alt="Latest release" /></a>
  <img src="https://img.shields.io/badge/Home%20Assistant-2024.11%2B-18BCF2?style=for-the-badge&logo=homeassistant&logoColor=white" alt="Home Assistant 2024.11 or later" />
  <a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Florian-BARRE/vivid-cards?style=for-the-badge&color=8a3ffc" alt="License" /></a>
</p>

<p align="center">
  <b>Lovelace cards and badges that glow with the state of your home.</b><br />
  Lights in their real colors, an Ambilight you can see, an electricity bill you can read, the climate of every room.
</p>

<p align="center">
  <a href="#installation">Install</a> ·
  <a href="#the-cards">Cards</a> ·
  <a href="#badges">Badges</a> ·
  <a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/README.md">Documentation</a> ·
  <a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/CHANGELOG.md">Changelog</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/showcase.png" alt="A dashboard made with Vivid Cards" width="100%" />
</p>

## Why Vivid Cards

- **It glows with what it shows.** A power button lit with the real color of
  your LEDs, a window badge that warms up the longer it stays open, a bill badge that
  turns red when it runs ahead of the last one.
- **No templating.** Point a card at a group, a device or nothing at all:
  members, WLED entities, power sensors, HyperHDR and your meter are found in
  the Home Assistant registries.
- **A visual editor for everything,** that only shows what applies to what you
  picked. YAML stays possible and short.
- **One file, no dependency.** Light and dark themes, English and French.
- **Big cards, small cards.** The large cards gather everything about a thing;
  each of their parts also exists as a card of its own, to place where you want.

## The cards

### Lights

<table>
  <tr>
    <td align="center" valign="top" width="33%"><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/led-group.md"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/led-group.png" alt="vivid-led-group" width="260" /></a><br /><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/led-group.md"><code>vivid-led-group</code></a><br /><sub>LED strips and light groups, WLED aware, with details per light</sub></td>
    <td align="center" valign="top" width="33%"><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/lamp-group.md"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/lamp-group.png" alt="vivid-lamp-group" width="260" /></a><br /><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/lamp-group.md"><code>vivid-lamp-group</code></a><br /><sub>Lamps on smart plugs: on/off, watts, presets, daily cost</sub></td>
    <td align="center" valign="top" width="33%"><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/room-header.md"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/cards/room-header.png" alt="vivid-room-header" width="260" /></a><br /><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/room-header.md"><code>vivid-room-header</code></a><br /><sub>A room’s title, power button and badges, lit in the colors of its lights</sub></td>
  </tr>
  <tr>
    <td align="center" valign="top" width="33%"><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/light.md"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/cards/light-wled.png" alt="vivid-light-card" width="260" /></a><br /><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/light.md"><code>vivid-light-card</code></a><br /><sub>One light as a tile; a WLED strip with its settings</sub></td>
    <td align="center" valign="top" width="33%"><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/power.md"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/cards/power.png" alt="vivid-power-card" width="260" /></a><br /><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/power.md"><code>vivid-power-card</code></a><br /><sub>Consumption of a few devices over 6 h, 24 h, 7 days</sub></td>
  </tr>
</table>

### Ambilight and HyperHDR

Made for a DIY Ambilight: an ESPHome box behind the TV (HDMI switch by IR, the
Raspberry Pi’s power, a fan) and [HyperHDR](https://github.com/Florian-BARRE/HA-HyperHDR)
on the Pi.

<table>
  <tr>
    <td align="center" valign="top" width="33%"><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/ambilight.md"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/ambilight.png" alt="vivid-ambilight-card" width="260" /></a><br /><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/ambilight.md"><code>vivid-ambilight-card</code></a><br /><sub>The DIY Ambilight box: HDMI by IR, Pi power, fan curve</sub></td>
    <td align="center" valign="top" width="33%"><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/hyperhdr.md"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/hyperhdr-all.png" alt="vivid-hyperhdr-card" width="260" /></a><br /><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/hyperhdr.md"><code>vivid-hyperhdr-card</code></a><br /><sub>HyperHDR: the Pi, what it captures, every strip</sub></td>
    <td align="center" valign="top" width="33%"><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/screen.md"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/cards/screen.png" alt="vivid-screen-card" width="260" /></a><br /><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/screen.md"><code>vivid-screen-card</code></a><br /><sub>The live picture of the TV, framed by its own colors</sub></td>
  </tr>
  <tr>
    <td align="center" valign="top" width="33%"><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/fan.md"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/cards/fan.png" alt="vivid-fan-card" width="260" /></a><br /><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/fan.md"><code>vivid-fan-card</code></a><br /><sub>The box’s fan and its temperature curve, editable</sub></td>
    <td align="center" valign="top" width="33%"><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/hdmi.md"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/cards/hdmi.png" alt="vivid-hdmi-card" width="260" /></a><br /><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/hdmi.md"><code>vivid-hdmi-card</code></a><br /><sub>HDMI inputs as tiles, sent by IR and confirmed</sub></td>
    <td align="center" valign="top" width="33%"><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/pi.md"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/cards/pi.png" alt="vivid-pi-card" width="260" /></a><br /><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/pi.md"><code>vivid-pi-card</code></a><br /><sub>The Raspberry Pi on one line, with its clean shutdown</sub></td>
  </tr>
</table>

### Electricity

The meter turned into money, from Home Assistant’s long-term statistics (a
Linky, a utility integration, any sensor in kWh). One [tariff](https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/guides/electricity.md)
shared by every card.

<table>
  <tr>
    <td align="center" valign="top" width="33%"><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/bill.md"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/cards/bill.png" alt="vivid-bill-card" width="260" /></a><br /><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/bill.md"><code>vivid-bill-card</code></a><br /><sub>The bill in progress, its projection and pace</sub></td>
    <td align="center" valign="top" width="33%"><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/bills.md"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/cards/bills.png" alt="vivid-bills-card" width="260" /></a><br /><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/bills.md"><code>vivid-bills-card</code></a><br /><sub>Past bills, the current one, the next one</sub></td>
    <td align="center" valign="top" width="33%"><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/bill-ring.md"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/cards/bill-ring.png" alt="vivid-bill-ring" width="260" /></a><br /><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/bill-ring.md"><code>vivid-bill-ring</code></a><br /><sub>Where each euro goes, or the off-peak share</sub></td>
  </tr>
  <tr>
    <td align="center" valign="top" width="33%"><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/energy-calendar.md"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/cards/energy-calendar.png" alt="vivid-energy-calendar" width="260" /></a><br /><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/energy-calendar.md"><code>vivid-energy-calendar</code></a><br /><sub>A month colored by price; a day hour by hour</sub></td>
    <td align="center" valign="top" width="33%"><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/energy-flow.md"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/cards/energy-flow.png" alt="vivid-energy-flow" width="260" /></a><br /><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/energy-flow.md"><code>vivid-energy-flow</code></a><br /><sub>From the meter to the devices</sub></td>
    <td align="center" valign="top" width="33%"><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/load-curve.md"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/cards/load-curve.png" alt="vivid-load-curve" width="260" /></a><br /><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/load-curve.md"><code>vivid-load-curve</code></a><br /><sub>A day hour by hour over the off-peak hours</sub></td>
  </tr>
  <tr>
    <td align="center" valign="top" width="33%"><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/energy-ranking.md"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/cards/energy-ranking.png" alt="vivid-energy-ranking" width="260" /></a><br /><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/energy-ranking.md"><code>vivid-energy-ranking</code></a><br /><sub>Devices ranked by energy and cost</sub></td>
  </tr>
</table>

### Climate

<table>
  <tr>
    <td align="center" valign="top" width="33%"><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/climate.md"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/cards/climate.png" alt="vivid-climate-card" width="260" /></a><br /><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/cards/climate.md"><code>vivid-climate-card</code></a><br /><sub>One sensor and its history, with the comfort band</sub></td>
  </tr>
</table>

## Badges

<table>
  <tr>
    <td align="center" valign="top" width="33%"><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/badges/status-badges.md"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/badges.png" alt="Light & status badges" width="260" /></a><br /><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/badges/status-badges.md"><code>Light & status badges</code></a><br /><sub>Lights, windows, doors, presence, illuminance, power, batteries</sub></td>
    <td align="center" valign="top" width="33%"><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/badges/climate-badges.md"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/cards/climate-badges.png" alt="Climate badges" width="260" /></a><br /><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/badges/climate-badges.md"><code>Climate badges</code></a><br /><sub>Temperature, humidity, pressure and CO₂</sub></td>
    <td align="center" valign="top" width="33%"><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/badges/energy-badges.md"><img src="https://raw.githubusercontent.com/Florian-BARRE/vivid-cards/main/docs/assets/cards/energy-badges.png" alt="Energy badges" width="260" /></a><br /><a href="https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/badges/energy-badges.md"><code>Energy badges</code></a><br /><sub>The bill, peak or off-peak now, the last day</sub></td>
  </tr>
</table>

Every badge is listed in [light badges](https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/badges/light-badges.md),
[status badges](https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/badges/status-badges.md),
[climate badges](https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/badges/climate-badges.md) and
[energy badges](https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/badges/energy-badges.md).

## Installation

Requires Home Assistant 2024.11 or newer.

### HACS (recommended)

[![Open your Home Assistant instance and open this repository in HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Florian-BARRE&repository=vivid-cards&category=plugin)

Click the button above, or add it by hand:

1. In HACS, open the menu (⋮) → **Custom repositories**.
2. Add `https://github.com/Florian-BARRE/vivid-cards` with the type **Dashboard**.
3. Search for **Vivid Cards** and download it.

HACS adds the dashboard resource for you; reload the page afterwards. Updates
show up in HACS like any other download.

### Manual

1. Download `vivid-cards.js` from the [latest release](https://github.com/Florian-BARRE/vivid-cards/releases/latest).
2. Copy it to `config/www/vivid-cards/vivid-cards.js`.
3. Add a dashboard resource: **Settings → Dashboards → ⋮ → Resources → Add resource**,
   URL `/local/vivid-cards/vivid-cards.js`, type **JavaScript module**.
4. Reload the page.

## Quick start

Open a dashboard, **⋮ → Edit dashboard → Add card**, and search for **Vivid**:
every card has a preview and a visual editor. Pick a light group for
**Vivid LED group**; the electricity cards read the grid of your Energy
dashboard and only ask for your tariff; the Ambilight cards find the box and
HyperHDR on their own.

The same in YAML:

```yaml
type: custom:vivid-led-group
entity: light.living_room_leds
```

```yaml
type: custom:vivid-bill-card
tariff:
  {
    peak: 0.1787,
    off_peak: 0.1344,
    off_peak_hours: ['00:36-05:36'],
    subscription: 16.58,
    billing_day: 12,
  }
```

## Documentation

Each card has its own page, with its options, examples and screenshots:
**[the documentation](https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/README.md)**. Also there:
[troubleshooting](https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/guides/troubleshooting.md),
[halos and theming](https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/guides/theming.md),
[development](https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/guides/development.md).

## Contributing

Issues and pull requests are welcome. Run `npm install`, then `npm run dev`
for preview pages with a simulated Home Assistant, and `npm run check` before
a pull request. See [CONTRIBUTING.md](CONTRIBUTING.md) and the
[development guide](https://github.com/Florian-BARRE/vivid-cards/blob/main/docs/guides/development.md).

## License

[MIT](LICENSE) © Florian Barre
