# Troubleshooting

**"Custom element doesn't exist: vivid-led-group".** The resource is not
loaded. With HACS, reload the page; in the companion app, reset its frontend
cache from the app settings. Installed by hand, check the resource URL and that
its type is **JavaScript module**.

**The card did not change after an update.** The browser still has the old
file: reload without cache (Ctrl + F5) or reset the companion app frontend
cache. The browser console logs the loaded version (`VIVID CARDS vX.Y.Z`).

**No consumption badge.** The editor banner says how many lights have a
consumption source. Open **Consumption** and give a sensor pattern or a strip
voltage, or pick a sensor for a light in **Detected lights**.

**The 7 days chart is empty.** The power sensors have no long-term statistics:
give them `state_class: measurement` (template sensors accept it), and wait for
Home Assistant to compile the first hours.

**A red bulb on a lamp.** The lamp card flags a lamp on for a minute that
draws less than `warn_below` (1 W): a bulb out, or the lamp's own switch off.
Lower `warn_below` for lamps that really draw that little (some LED bulbs),
or set it to `0`. Plugs without a power sensor are never flagged.

**No ambilight button.** It only shows for WLED strips with their live override
entity enabled, and when `ambilight.enabled` is on.

**The details do not open from another card.** Set `details.hash` on the LED
card, and use the same hash, with `#`, in the other card's `navigation_path`.

**The Pi is cut instead of shutting down (Ambilight card).** Home Assistant
refused the box's action (a repair says "not allowed to perform Home
Assistant actions"): turn on "Allow the device to perform Home Assistant
actions" in the ESPHome device's options. The firmware waits for HyperHDR to
go, then cuts the power anyway.

**The fan stays on the box curve with HyperHDR connected.** The firmware does
not read the server's entities: the Ambilight editor (and the Maintenance
tab) shows the `substitutions` to write in the ESPHome YAML, with the real
entity ids.

**A beta version.** HACS → the repository → ⋮ → **Redownload** → **Show beta
versions**, then reload without cache.

**An error on the card.** The card explains which option is wrong; fix it in
the YAML or open the editor, which keeps the last valid preview while you type.
