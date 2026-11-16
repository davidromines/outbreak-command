# Changelog

## v47 — 2026-11-15
- Recorded artillery and air: mortar launches, howitzer and naval guns, big explosions layered into shells and bombs, incoming-shell whistles (last 1.7 s of flight), falling-bomb scream before bomb runs, jet flyovers (strikes/bombers/F-35), propeller flyover for supply drops (pitched down for the AC-130), recorded helicopter rotor loop for the gunship.
- Military radio chatter every 40–90 s during play.

## v46 — 2026-11-15
- Recorded zombie voices: single groans and the horde chorus are built from 9 recordings; a bite/lunge plays when someone is turned; death groans as kills mount.
- Aircraft flyovers louder (still synth until recordings arrive).
- `window.__snd` debug helper shows which sounds are loaded.

## v45 — 2026-11-15
- Real recorded sounds: rifle (AR-15), sniper (bolt-action .30-06/.300), APC heavy MG (AK-47 pitched down), turret, gunship bursts (PPSh / M45). Explosions keep the synth body with a recorded blast layered on. Files in `sfx/`, credits in `sfx/CREDITS.md`; the synth sounds remain as fallback.

## v44 — 2026-11-15
- Map pack export (`__game.exportPack(name)`) for the balance simulator.
- New `sim/` folder: headless balance simulator (personas, campaign runner, overnight pool, Morris screening, report).

## v43 — 2026-11-15
- Balance: at most 25 zombies per 40 m block can break into buildings at once (was 40). Bot tests, stages 1–2, alive at the end of each stage:
  - current: 85–93% / 48–54%
  - break-in cap 25: 89–92% / 62–69%  ← applied
  - budgets +25%: 83–87% / 43–47%
  - cap 25 + budgets +25%: 92% / 66–68%
  - walkers −10% speed: 88–100% / 51–89% (high variance)

## v42 — 2026-11-15
- Shot lines: rifle and gun bolts now travel from the shooter to the target; artillery and naval shells show a streak along their flight path.
- Click a mortar, howitzer or destroyer to show its range (outer ring) and minimum range (inner ring); click again or elsewhere to hide.
- Destroyer deck cannon: range 1,500 m → 5,000 m, and it (and howitzers) now also target dense horde blocks, not only visible zombie dots. It never fired before because most zombies are in the horde.
- Destroyer missiles: blast radius 40 m → 100 m (about 6× the area).
- Howitzer shells damage buildings only within the old 28 m (the doubled 56 m blast is for zombies); whole districts were turning brown from distant shelling.
- Horde glow now drawn above the 3D buildings (it was hidden under them, so green 'break-in' buildings looked zombie-free).
- Guns (howitzer, mortar, turret) get solid olive bodies under their outlines and are drawn larger.

## v41 — 2026-11-15
- Real-proportion outline icons: AC-130 (paratrooper drops, water bomber), B-2 (carpet and napalm runs), F-35 (precision strike, now visible), A-10 (strafing).
- Howitzers, mortars and turrets drawn as outlines when zoomed in, turning to aim where they fire.

## v40.1 — 2026-11-15
- Building load: scanline fill instead of a point-in-polygon test per map cell. Measured on David's PC before the fix: 2.5 s freeze in stage 1, 16.4 s in stage 2.

## v40 — 2026-11-15
- Howitzer is now a 3-gun battery ($900) that fires 3-shell salvos; blast radius doubled to 56 m.
- F3 performance readout.

## v39.1
- Buildings turn green only with 5+ zombies on their block.

## v39
- Barricades and closed gates now stop the off-screen horde (it moves, spills, infects and appears only inside its own walled-off area).
- Shelter view: buildings tinted by occupancy (blue = sheltering, green = break-in, dark = empty); hover for counts.
- Softer horde glow; gentler infection in stages 1–2 (0.03 / 0.035 / 0.042 / 0.05).
- Military arrives in stage 2: every tool standard issue from stage 2 (nuke from stage 3); blueprints give stage-1 access.
- Title card waits for a click; adaptive sim stepping at 4×/8×; load-time breakdown.

## v38 — air order countdowns, transport-plane paratroopers
## v37 — stage transition animation
## v36 — intro screen, WASD, right-click deselect
## v35 — requisition screen (replaced loot crates), safe zone recovery
## v34 — synthesized sound engine v2
## v33 — rooftop snipers
## v32 — terrain, water bombers, massive hordes, destruction visuals
## v27–v31 — roguelite campaign, destructible buildings, balance, loading
