# Electricity

Cards and badges that turn the meter into money: the bill in progress and its
projection, past bills, off-peak hours, a calendar of prices, the devices. They
read Home Assistant's long-term statistics, so any meter imported there works
(a Linky through the Linky add-on, a utility integration, a sensor in kWh).

```yaml
type: custom:vivid-bill-card
tariff:
  peak: 0.1787 # € per kWh in peak hours, taxes included
  off_peak: 0.1344 # in off-peak hours (leave out for a single price)
  off_peak_hours: ['00:36-05:36', '14:06-17:06']
  subscription: 16.58 # per month, taxes included
  billing_day: 12 # the day a billing cycle starts
  invoices: # bills already received (optional)
    - {
        from: 2026-09-12,
        to: 2026-10-11,
        total: 79.52,
        peak_kwh: 285,
        off_peak_kwh: 91,
        subscription: 16.36,
      }
```

Every card and badge of this section takes the same options:

| Option   | Default                          | Description                                                                |
| -------- | -------------------------------- | -------------------------------------------------------------------------- |
| `tariff` | required                         | Prices, off-peak hours, subscription, billing day and invoices, see above. |
| `energy` | the Energy dashboard's grid      | Statistic of the energy drawn (`linky:…`, `sensor.…`).                     |
| `cost`   | the Energy dashboard's grid cost | Statistic of its cost; when unset with `energy` set, the tariff prices it. |
| `name`   |                                  | Title.                                                                     |
| `glow`   | `100`                            | Halo strength in percent (0–200), or `off`, `soft`, `normal`, `strong`.    |

An invoice takes `from`, `to` (both included), `total`, and either `peak_kwh`
and `off_peak_kwh` or `kwh`, plus `subscription` when it is known. Without
invoices, past cycles are computed from the statistics.

**How the projection works.** The bill in progress is what the days read cost
(the cost statistic, else the tariff), plus the subscription of the whole
cycle, plus the remaining days at the pace of the last 7 days. The range goes
from that to the pace of the last 30 days. Meters that report the next day
(Linky) leave today out.

**Peak and off-peak.** Daily data cannot be split: the split shows on the days
the meter gives hour by hour (Linky: once the hourly collection is on), and on
invoices that list their peak and off-peak kWh.

## The cards and badges

| Page                                                   | What it shows                                  |
| ------------------------------------------------------ | ---------------------------------------------- |
| [`vivid-bill-card`](../cards/bill.md)                  | The bill in progress, its projection, the pace |
| [`vivid-bills-card`](../cards/bills.md)                | Past bills, the one in progress, the next one  |
| [`vivid-bill-ring`](../cards/bill-ring.md)             | Where each euro goes, or the off-peak share    |
| [`vivid-energy-calendar`](../cards/energy-calendar.md) | A month colored by price; a day hour by hour   |
| [`vivid-energy-flow`](../cards/energy-flow.md)         | From the meter to the devices                  |
| [`vivid-energy-ranking`](../cards/energy-ranking.md)   | Devices ranked by energy and cost              |
| [`vivid-load-curve`](../cards/load-curve.md)           | A day hour by hour, with the standby           |
| [Energy badges](../badges/energy-badges.md)            | The bill, peak or off-peak now, the last day   |
