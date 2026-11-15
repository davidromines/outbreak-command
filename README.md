# Outbreak Command

Zombie horde-defence strategy game on real-world maps — pick any town in the world, hold it against the outbreak. Inspired by *Zombies Aren't Real*.

**Play:** https://davidromines.github.io/outbreak-command/ (Chrome or Edge on a PC; needs internet for map data)

- Single-file game: `index.html` (MapLibre GL, OpenFreeMap vector tiles, AWS terrain tiles, synthesized sound).
- Roguelite campaign: 4 stages that grow outward along the real road network from your starting point.
- Press **F3** in game for the performance readout (fps, sim cost, real speed, memory, last load breakdown).

## Repo layout
- `index.html` — the game (served by GitHub Pages).
- `tests/` — headless tests: `simmod.js` is the simulation extracted from `index.html` for Node runs (`node tests/barr.js`); `*_bt.py` are Playwright browser tests.
- `tools/` — patch scripts used to produce recent versions.
- `CHANGELOG.md` — version history.

Map data © OpenStreetMap contributors (OpenFreeMap, CARTO); elevation: Mapzen / AWS Terrain Tiles.
