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
| [`vivid-led-group`](#vivid-led-group) | A light group or a single light, WLED aware, with details per light |

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

A light group (or one light) as a header and a brightness tile, with every light
of the group in a details dialog. Works with any light; WLED strips get live
override and estimated current on top.

<p>
  <img src="docs/assets/led-group-details.png" alt="Details dialog of the LED group card" width="560" />
</p>

```yaml
type: custom:vivid-led-group
entity: light.living_room_leds
```

### Visual editor

Pick a light or a group: the editor shows what it detected (members, WLED,
color or tunable white, where consumption comes from) and only offers what
applies. Each detected light has its own settings: answering the ambilight
button, how its consumption is measured, its name and whether it is shown in
the details. Everything else sits under **Advanced**. The YAML only keeps what
you changed.

<p>
  <img src="docs/assets/led-group-editor.png" alt="Visual editor of the LED group card" width="420" />
</p>

### Gestures

| Where             | Tap                                   | Hold                         | Drag                               |
| ----------------- | ------------------------------------- | ---------------------------- | ---------------------------------- |
| Tile              | `tile.tap_action` (toggle)            | `tile.hold_action` (details) | Set the brightness (0 % turns off) |
| Color bar         | Pick the hue or the color temperature |                              | Same                               |
| Name              | Open the details                      |                              |                                    |
| Power badge       | Toggle                                |                              |                                    |
| Consumption badge | History of the power sensor (lights)  |                              |                                    |
| Live override     | Switch it on or off                   |                              |                                    |

A double tap runs `tile.double_tap_action` (nothing by default). Without
details (a single light, or `details.enabled: false`), holding the tile opens
the Home Assistant dialog. In the details dialog, holding a light's tile opens
its Home Assistant dialog. The details close with Escape, a tap outside, or a
swipe down on mobile.

### Options

| Option      | Default      | Description                                                                    |
| ----------- | ------------ | ------------------------------------------------------------------------------ |
| `entity`    | required     | A light group, or a single light.                                              |
| `name`      | entity name  | Title of the card.                                                             |
| `icon`      | each light's | Icon of the card and of every light. By default each light keeps its own icon. |
| `tile`      | see below    | Brightness tile.                                                               |
| `power`     | see below    | Consumption badges: where they come from and how they glow.                    |
| `ambilight` | see below    | WLED live override badges.                                                     |
| `details`   | see below    | Details dialog.                                                                |
| `members`   | none         | Per-light overrides.                                                           |

`tile`:

| Option              | Default      | Description                                                                                                    |
| ------------------- | ------------ | -------------------------------------------------------------------------------------------------------------- |
| `color_bar`         | `auto`       | `auto` (hue for color lights, temperature for tunable whites, none otherwise), `hue`, `temperature` or `none`. |
| `state`             | `brightness` | Text on the tile: `brightness` or `none`.                                                                      |
| `effects`           | `true`       | Effect picker.                                                                                                 |
| `tap_action`        | `toggle`     | Any Home Assistant action, plus `details`.                                                                     |
| `hold_action`       | `details`    | `details` for a group, `more-info` for a single light.                                                         |
| `double_tap_action` | `none`       | Same syntax.                                                                                                   |

Actions accept a name (`toggle`, `details`, `more-info`, `none`) or the usual
object: `navigate`, `url`, `perform-action`…

`power`:

| Option           | Default    | Description                                                                                                                                            |
| ---------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `enabled`        | `true`     | Consumption badges.                                                                                                                                    |
| `sensor_pattern` | none       | Power sensor of each light. `{object_id}` is replaced by the light's object id: `sensor.{object_id}_power` finds `sensor.desk_power` for `light.desk`. |
| `voltage`        | none       | Strip voltage. Turns the WLED estimated current into watts.                                                                                            |
| `idle`           | `3`        | Watts per light under which the badge stays neutral.                                                                                                   |
| `max`            | `40`       | Watts per light at which the glow is the brightest.                                                                                                    |
| `steps`          | `[10, 25]` | Watts per light where the glow turns from yellow to amber, then to orange.                                                                             |

The group badge adds up its lights; its scale grows with the number of lights
that report a consumption.

`ambilight`:

| Option    | Default | Description                                                  |
| --------- | ------- | ------------------------------------------------------------ |
| `enabled` | `true`  | WLED live override badges (shown only when a light has one). |

`details`:

| Option      | Default          | Description                                                                                         |
| ----------- | ---------------- | --------------------------------------------------------------------------------------------------- |
| `enabled`   | groups only      | The details dialog.                                                                                 |
| `hash`      | none             | Opens the details when the page URL ends with this hash, so any card can open them with `navigate`. |
| `sort`      | `name`           | `name`, or `group` to keep the order of the group.                                                  |
| `summary`   | `true`           | Group badges at the top.                                                                            |
| `effects`   | `tile.effects`   | Effect picker of each light.                                                                        |
| `color_bar` | `tile.color_bar` | Color bar of each light, same values as `tile.color_bar`.                                           |

`members` entries:

| Option         | Description                                                                        |
| -------------- | ---------------------------------------------------------------------------------- |
| `entity`       | The light to override.                                                             |
| `name`         | Display name.                                                                      |
| `hidden`       | `true` hides the light from the details (it still counts in totals and ambilight). |
| `ambilight`    | `false` leaves the light out of the group ambilight badge and hides its own badge. |
| `power_mode`   | `auto` (default), `sensor`, `voltage` or `none`.                                   |
| `power_sensor` | Power sensor of this light.                                                        |
| `voltage`      | Voltage of this strip, instead of `power.voltage`.                                 |

### Where consumption comes from

With `power_mode: auto`, the first source found wins:

1. `members[].power_sensor`
2. `power.sensor_pattern`
3. A power sensor attached to the same device
4. WLED estimated current × voltage (`members[].voltage`, else `power.voltage`)

`sensor` only uses `power_sensor`, `voltage` only the estimated current, and
`none` turns the consumption of that light off.

### Light names

Names drop the words all members share at the start and at the end:
`salon-ambilight-wled`, `salon-buffet-wled` and `salon-canape-wled` become
**Ambilight**, **Buffet** and **Canape**. A bare number keeps the word before
it: `Cuisine Spot 1` and `Cuisine Spot 2` become **Spot 1** and **Spot 2**. Use
`members[].name` to pick your own.

### WLED live override

WLED can ignore realtime data (HyperHDR, Hyperion, E1.31…) with its live override
setting. The badge is amber while the override is on, so the strip shows its own
effect instead of the stream. Tap it to switch. The group badge switches every
strip that is online and answers the ambilight button.

### Example

```yaml
type: custom:vivid-led-group
entity: light.salon_leds
name: LEDs
power:
  sensor_pattern: sensor.{object_id}_puissance
  max: 34
details:
  hash: salon-leds-details
members:
  - entity: light.salon_canape_wled
    name: Canapé
  - entity: light.salon_ambilight_wled
    ambilight: false
```

Another card can then open the details:

```yaml
tap_action:
  action: navigate
  navigation_path: '#salon-leds-details'
```

### Upgrading from 0.1

0.1 options keep working and are read as their 0.2 equivalent; the editor
saves the new form.

| 0.1                  | 0.2                    |
| -------------------- | ---------------------- |
| `show_power`         | `power.enabled`        |
| `show_live_override` | `ambilight.enabled`    |
| `show_effects`       | `tile.effects`         |
| `show_hue: false`    | `tile.color_bar: none` |
| `details_hash`       | `details.hash`         |

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

The preview pages run the cards against an in-memory Home Assistant (three
WLED strips and two tunable white spots), so you can work on the UI without a
server: `/dev/` for the cards, `/dev/editor.html` for the visual editor in
several situations.

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
