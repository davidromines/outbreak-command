# Balance simulator

Runs thousands of headless campaigns of the real game code with human-like bot players, then reports how the game measures against the balance targets in the project plan.

- `build_core.js` — extracts the game's simulation from `../index.html` into `core.js`.
- `knobs.js` — 33 balance knobs (multipliers on groups of settings) and their test ranges.
- `persona.js` — human-like players: novice / average / expert × mixed / fortress / mobile / artillery / air.
- `campaign.js` — one full 4-stage campaign on a real map pack, mirroring the game's rules (fall line, seeds, money carry, requisition shop).
- `pool.js` — parallel overnight runner (worker threads, resumable, stops at a set time).
- `make_jobs.py` — baseline runs + Morris screening design (SALib).
- `analyze.py` — HTML report: targets table with confidence intervals, economy, tool mix, cities, knob sensitivity.
- `packs/` — map packs exported from the game (`__game.exportPack(name)`), one per city and stage: `<city>_s<stage>.ocmap.gz`.
- `run_overnight.cmd` — double-click on the laptop; keeps the PC awake while running; results in `runs/<date>/`.

Fast mode uses a 0.1 s time step (about 3× faster than the game's 1/30 s); in a check on stage 1 the share of survivors matched within noise (88–91% vs 89–92%). Final candidates are verified at the game's own step.
