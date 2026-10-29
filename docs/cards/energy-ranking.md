# vivid-energy-ranking

The devices ranked by energy and cost over the period, nested devices under
their parent, with the share nothing measures.

<p>
  <img src="../assets/cards/energy-ranking.png" alt="Energy ranking" width="440" />
  <img src="../assets/cards/energy-ranking-light.png" alt="Energy ranking, light theme" width="440" />
</p>

## Configuration

```yaml
type: custom:vivid-energy-ranking
period: week
```

| Option        | Default | Description                       |
| ------------- | ------- | --------------------------------- |
| `period`      | `month` | `day`, `week`, `month` or `year`. |
| `max_devices` | `6`     | Devices listed.                   |

Like every electricity card, it takes `tariff`, `energy`, `cost`, `name` and `glow`: see [Electricity](../guides/electricity.md) for the tariff, the data source and how the projection works.
