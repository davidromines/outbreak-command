s=open('/home/claude/outbreak.html').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:70],s.count(a)); s=s.replace(a,b)
# sim: per-building shelter levels for the whole city (cheap: one pass over building cells)
rep("  S.shelterIn = function (f) {", """  let cK = null, cW = null, p0 = null;
  S.shelterLevels = function () { if (!bfid || !fcount || !hFloor) return null; const nf = fcount.length;
    if (!cK || cK.length !== fcells.length) { cK = new Int32Array(fcells.length); cW = new Float32Array(fcells.length);
      for (let q = 0; q < fcells.length; q++) { const c = fcells[q], k = hcOf(-HALF + (c % N + 0.5) * RES, -HALF + (((c / N) | 0) + 0.5) * RES); cK[q] = k;
        cW[q] = hFloor[k] > 0 ? Math.max(1, Math.round((bheight[c] || CFG.FLOOR_HEIGHT) / CFG.FLOOR_HEIGHT)) * RES * RES / hFloor[k] : 0; } p0 = null; }
    const occ = new Float32Array(nf), inf = new Uint8Array(nf);
    for (let f = 0; f < nf; f++) { let p = 0, z = 0; for (let q = ffirst[f]; q < ffirst[f + 1]; q++) { const k = cK[q]; p += bH[k] * cW[q]; z += bZ[k]; } occ[f] = p; inf[f] = z >= 1 && p >= 0.5 ? 1 : 0; }
    if (!p0) p0 = occ.slice(); for (let f = 0; f < nf; f++) occ[f] = p0[f] > 0.5 ? Math.min(1, occ[f] / p0[f]) : 0;
    return { occ, inf }; };
  S.shelterIn = function (f) {""")
# game: tint buildings — lit blue-grey while people shelter, green while zombies break in, dark when empty
rep("paint: { 'fill-extrusion-color': ['interpolate', ['linear'], ['coalesce', ['feature-state', 'dmg'], 0], 0, '#2b3742', 0.5, '#3b302b', 1, '#4a2718'],",
    "paint: { 'fill-extrusion-color': ['case', ['>', ['coalesce', ['feature-state', 'dmg'], 0], 0.05], ['interpolate', ['linear'], ['coalesce', ['feature-state', 'dmg'], 0], 0, '#2b3742', 0.5, '#3b302b', 1, '#4a2718'], ['==', ['coalesce', ['feature-state', 'inf'], 0], 1], '#3e6a2c', ['interpolate', ['linear'], ['coalesce', ['feature-state', 'occ'], 1], 0, '#1b1f23', 0.4, '#262f38', 1, '#3a5068']],")
rep("  function drawHorde() { try {", """  let occLast = 0, occSim = null, occQ = null, infQ = null;
  function drawShelter() { const now = performance.now(); if (now - occLast < 1500 || !sim.shelterLevels || !map.getSource('bldg')) return; occLast = now;
    const r = sim.shelterLevels(); if (!r) return; const n = r.occ.length;
    if (occSim !== sim || !occQ || occQ.length !== n) { occSim = sim; occQ = new Uint8Array(n).fill(10); infQ = new Uint8Array(n); }
    for (let f = 0; f < n; f++) { const q = Math.round(r.occ[f] * 10); if (q !== occQ[f] || r.inf[f] !== infQ[f]) { occQ[f] = q; infQ[f] = r.inf[f]; map.setFeatureState({ source: 'bldg', id: f }, { occ: q / 10, inf: r.inf[f] }); } } }
  function drawHorde() { try {""")
rep("      drainCollapses(); drawHorde();", "      drainCollapses(); drawHorde(); try { drawShelter(); } catch (e) {}")
# adaptive stepping: big stages at 4x/8x take longer steps instead of freezing the frame
rep("""      acc += el * SPEEDS[speedI]; let steps = 0;
      while (acc >= DT && steps < 8) { sim.step(DT); acc -= DT; steps++; }
      if (steps === 8) acc = 0;""", """      acc += el * SPEEDS[speedI]; let steps = 0; const t0 = performance.now(), BUD = 24; // ms of sim work per frame
      const m = Math.max(1, Math.min(3, Math.ceil(stepMs * (acc / DT) / BUD))), dts = DT * m; // up to 0.1 s steps when the sim can't keep up
      while (acc >= dts && steps < 12 && (steps === 0 || performance.now() - t0 < BUD)) { sim.step(dts); acc -= dts; steps++; }
      if (steps) stepMs = stepMs * 0.8 + ((performance.now() - t0) / steps / m) * 0.2;
      if (acc > dts * 4) acc = dts * 4; // can't keep up: run slower than asked rather than freeze""")
rep("  const DT = 1 / 30, SPEEDS = [1, 2, 4, 8];", "  const DT = 1 / 30, SPEEDS = [1, 2, 4, 8]; let stepMs = 3;")
# reset tracking when buildings are replaced
rep("      if (map.getSource('bldg')) { map.removeFeatureState({ source: 'bldg' }); map.getSource('bldg').setData(data); }", "      occSim = null; if (map.getSource('bldg')) { map.removeFeatureState({ source: 'bldg' }); map.getSource('bldg').setData(data); }")
open('/home/claude/outbreak.html','w').write(s)
print('ok')
