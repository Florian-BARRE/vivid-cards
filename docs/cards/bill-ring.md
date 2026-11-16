<p align="center">
  <img src="../assets/headers/bill-ring.jpg" alt="Bill ring" width="100%" />
</p>

<sub><a href="../../README.md">Vivid Cards</a> › <a href="../README.md">Documentation</a> › <a href="../README.md#electricity">Electricity</a> › Bill ring</sub>

# vivid-bill-ring

> [!NOTE]
> **Replaced by `vivid-bill-card`** (`layout: ring`). This card still works on the dashboards that
> use it, but it left the card picker and gets no new feature: switch to
> [`vivid-bill-card`](bill.md).

A bill as rings. `ring: money` shows where each euro goes (peak, off-peak,
subscription) around the total; `ring: off_peak` shows the share of energy
drawn in off-peak hours, the one that pays off with an off-peak contract.

<p>
  <img src="../assets/cards/bill-ring.png" alt="Bill ring, money" width="440" />
  <img src="../assets/cards/bill-ring-light.png" alt="Bill ring, money, light theme" width="440" />
</p>
<p>
  <img src="../assets/cards/bill-ring-off-peak.png" alt="Bill ring, off-peak share" width="440" />
  <img src="../assets/cards/bill-ring-off-peak-light.png" alt="Bill ring, off-peak share, light theme" width="440" />
</p>

## Configuration

```yaml
type: custom:vivid-bill-ring
ring: off_peak
cycle: current
```

| Option  | Default | Description                               |
| ------- | ------- | ----------------------------------------- |
| `ring`  | `money` | `money` or `off_peak`.                    |
| `cycle` | `last`  | `last` (the last full bill) or `current`. |

Like every electricity card, it takes `tariff`, `energy`, `cost`, `name` and `glow`: see [Electricity](../guides/electricity.md) for the tariff, the data source and how the projection works.
