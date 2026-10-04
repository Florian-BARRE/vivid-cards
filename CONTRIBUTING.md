# Contributing

## Layout

```
src/
  vivid-cards.ts        Entry point: imports every card, logs the version.
  core/                 Home Assistant plumbing, no UI.
    hass-types.ts       Local subset of the frontend types.
    entities.ts         Groups, device siblings, states.
    actions.ts          Service calls and HA events (more-info, haptics).
    color.ts, glow.ts   Light colors and badge tones (pure functions).
    naming.ts           Sibling name shortening.
    register.ts         Custom element and card picker registration.
  integrations/         Knowledge about specific integrations (WLED, power).
  components/           Reusable elements shared by every card (vivid-*).
  cards/<card>/         One folder per card: config, model, editor, elements.
  i18n/                 Interface strings (en, fr).
dev/                    Preview page and the simulated Home Assistant.
tests/                  Vitest unit tests.
```

## Principles

- **A card is a pure model plus a view.** `model.ts` turns `hass` and the
  resolved config into plain data and is unit tested; elements only render it.
- **Discover, do not ask.** Read the entity and device registries
  (`hass.entities`, `hass.devices`) before adding a config option. Match
  integration entities by `platform` and `translation_key`, never by name.
- **Render only on relevant changes.** Every model exposes the entities it reads
  (`watched`); `shouldUpdate` ignores other state changes.
- **Validate config in one place.** `resolveConfig` applies defaults and throws
  readable errors; elements consume the resolved config only.
- **Stay theme aware.** Use Home Assistant theme variables and the tokens in
  `components/shared-styles.ts`; respect `prefers-reduced-motion`.
- **No decorators.** Elements declare `static properties` and `declare` their
  fields, which keeps the toolchain simple.

## Adding a card

1. Create `src/cards/<name>/` with `config.ts`, `model.ts`, the element
   `vivid-<name>.ts` (registered with `defineElement` and `registerCard`) and
   its editor `vivid-<name>-editor.ts`, returned by `getConfigElement()`. Keep
   config edits as pure functions (`editor-model.ts`) and wait for `ha-form`
   with `ensureHaForm()`.
2. Import it from `src/vivid-cards.ts`.
3. Extend `dev/mock-hass.ts`, mount the card in `dev/main.ts` and the editor in
   `dev/editor.ts` (`dev/ha-stubs.ts` stands in for `ha-form`).
4. Test the model and the editor helpers in `tests/`.
5. Document it in the README.

## Conventions

- Code, comments and commit messages in English.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/):
  `feat(led-group): …`, `fix(core): …`, `docs: …`, `chore: …`.
- `npm run check` must pass before pushing; CI runs the same command.
