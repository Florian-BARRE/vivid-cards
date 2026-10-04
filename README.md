# Vivid Cards

Expressive Lovelace cards for Home Assistant. Badges glow with the state of what
they show: a power button lit with the real color of your LEDs, a consumption
badge that shines brighter the more a strip draws.

<p>
  <img src="docs/assets/led-group.png" alt="Vivid LED group card" width="420" />
</p>

- **No dependencies.** One JavaScript file, no other custom card required.
- **Zero templating.** Point a card at a group: members, WLED entities and
  power sensors are discovered from the Home Assistant registries.
- **Theme aware.** Follows your Home Assistant theme, light or dark.

| Card                                  | What it is for                                                      |
| ------------------------------------- | ------------------------------------------------------------------- |
| [`vivid-led-group`](#vivid-led-group) | A light group or a single light, WLED aware, with details per strip |

More cards and badges (battery, doors and windows, presence, illuminance…) are on
the [roadmap](#roadmap).

## Installation

### HACS

[![Open your Home Assistant instance and open this repository in HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Florian-BARRE&repository=vivid-cards&category=plugin)

Click the button above, or add it by hand:

1. In HACS, open the menu (⋮) → **Custom repositories**.
2. Add `https://github.com/Florian-BARRE/vivid-cards` with the type **Dashboard**.
3. Search for **Vivid Cards** and download it.

HACS adds the dashboard resource for you; reload the page afterwards.

### Manual

1. Download `vivid-cards.js` from the [latest release](https://github.com/Florian-BARRE/vivid-cards/releases/latest).
2. Copy it to `config/www/vivid-cards/vivid-cards.js`.
3. Add a dashboard resource: **Settings → Dashboards → ⋮ → Resources → Add resource**,
   URL `/local/vivid-cards/vivid-cards.js`, type **JavaScript module**.

Requires Home Assistant 2024.11 or newer.

## vivid-led-group

A light group (or one light) as a header and a brightness tile, with every strip
of the group in a details dialog.

<p>
  <img src="docs/assets/led-group-details.png" alt="Details dialog of the LED group card" width="560" />
</p>

```yaml
type: custom:vivid-led-group
entity: light.living_room_leds
```

### Gestures

| Where             | Tap                                  | Hold             | Drag                               |
| ----------------- | ------------------------------------ | ---------------- | ---------------------------------- |
| Tile              | Toggle                               | Open the details | Set the brightness (0 % turns off) |
| Color bar         | Pick the hue                         |                  | Pick the hue                       |
| Name              | Open the details                     |                  |                                    |
| Power badge       | Toggle                               |                  |                                    |
| Consumption badge | History of the power sensor (strips) |                  |                                    |
| Live override     | Switch it on or off                  |                  |                                    |

In the details dialog, holding a strip's tile opens its Home Assistant dialog.
The details close with Escape, a tap outside, or a swipe down on mobile.

### Options

| Option               | Default                 | Description                                                                                         |
| -------------------- | ----------------------- | --------------------------------------------------------------------------------------------------- |
| `entity`             | required                | A light group, or a single light.                                                                   |
| `name`               | entity name             | Title of the card.                                                                                  |
| `icon`               | `mdi:led-strip-variant` | Icon of the card and of every strip.                                                                |
| `details_hash`       | none                    | Opens the details when the page URL ends with this hash, so any card can open them with `navigate`. |
| `show_power`         | `true`                  | Consumption badges.                                                                                 |
| `show_live_override` | `true`                  | WLED live override badges.                                                                          |
| `show_effects`       | `true`                  | Effect picker.                                                                                      |
| `show_hue`           | `true`                  | Color bar.                                                                                          |
| `power`              | see below               | Where consumption comes from and how it glows.                                                      |
| `members`            | none                    | Per-strip overrides (YAML only).                                                                    |

`power` options:

| Option           | Default    | Description                                                                                                                                            |
| ---------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sensor_pattern` | none       | Power sensor of each strip. `{object_id}` is replaced by the light's object id: `sensor.{object_id}_power` finds `sensor.desk_power` for `light.desk`. |
| `voltage`        | none       | Strip voltage. When a strip has no power sensor, its WLED estimated current is converted to watts.                                                     |
| `idle`           | `3`        | Watts per strip under which the badge stays neutral.                                                                                                   |
| `max`            | `40`       | Watts per strip at which the glow is the brightest.                                                                                                    |
| `steps`          | `[10, 25]` | Watts per strip where the glow turns from yellow to amber, then to orange.                                                                             |

The group badge adds up its strips; its scale grows with the number of strips.

`members` entries:

| Option         | Description                              |
| -------------- | ---------------------------------------- |
| `entity`       | The strip to override.                   |
| `name`         | Display name.                            |
| `power_sensor` | Power sensor of this strip.              |
| `hidden`       | `true` hides the strip from the details. |

### Where consumption comes from

For each strip, the first source found wins:

1. `members[].power_sensor`
2. `power.sensor_pattern`
3. A power sensor attached to the same device
4. WLED estimated current × `power.voltage`

### Strip names

Strip names drop the words all members share at the start and at the end:
`salon-ambilight-wled`, `salon-buffet-wled` and `salon-canape-wled` become
**Ambilight**, **Buffet** and **Canape**. Use `members[].name` to pick your own.

### WLED live override

WLED can ignore realtime data (HyperHDR, Hyperion, E1.31…) with its live override
setting. The badge is amber while the override is on, so the strip shows its own
effect instead of the stream. Tap it to switch. The group badge switches every
strip that is online.

### Example

```yaml
type: custom:vivid-led-group
entity: light.salon_leds
name: LEDs
details_hash: salon-leds-details
power:
  sensor_pattern: sensor.{object_id}_puissance
  max: 34
members:
  - entity: light.salon_canape_wled
    name: Canapé
```

Another card can then open the details:

```yaml
tap_action:
  action: navigate
  navigation_path: '#salon-leds-details'
```

## Theming

Vivid Cards read the standard Home Assistant theme variables. A few of their own
can be set in a theme:

| Variable                 | Default | Description                         |
| ------------------------ | ------- | ----------------------------------- |
| `vivid-card-radius`      | `28px`  | Corner radius of cards and dialogs. |
| `vivid-card-tile-radius` | `22px`  | Corner radius of tiles.             |

## Roadmap

- Badge collection with presets per device class: battery, door and window,
  presence, illuminance, temperature.
- Label driven badges: show any entity of a strip's device on its header.
- WLED presets and palettes in the details dialog.

## Development

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev      # preview page with a simulated Home Assistant
npm run check    # format, lint, typecheck, tests and build
npm run build    # dist/vivid-cards.js
```

The preview page (`dev/`) runs the cards against an in-memory Home Assistant
with three WLED strips, so you can work on the UI without a server.

### Testing on your Home Assistant

1. Copy `.env.example` to `.env.local` and set `VIVID_DEPLOY_DIR` to your
   `config/www/vivid-cards` folder (a Samba share works).
2. Run `npm run deploy`: it builds and copies the bundle there.
3. Point your dashboard resource to `/local/vivid-cards/vivid-cards.js` and bump
   its `?v=` query after each deploy so browsers reload it.

### Releasing

1. Update `version` in `package.json` and the changelog, commit and push.
2. On GitHub, open **Releases → Draft a new release**, create the tag matching
   the version (e.g. `v0.2.0`) and publish it.
3. The release workflow checks the code, builds it and attaches
   `vivid-cards.js` to the release, which HACS installs.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the architecture and conventions.

## License

[MIT](LICENSE) © Florian Barre
