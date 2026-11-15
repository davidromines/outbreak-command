p = '/home/claude/outbreak.html'
s = open(p).read()
def rep(a, b, cnt=1):
    global s
    n = s.count(a); assert n == cnt, (n, a[:100]); s = s.replace(a, b)

# ---------------- CFG ----------------
rep("""  // ---- DESTRUCTIBLE BUILDINGS""", """  // ---- TERRAIN (v32): real hills slow you uphill, speed you up a little downhill, and block line of fire ----
  UPHILL_SLOW: 4,          // speed lost per unit of slope uphill (a 10% grade = 40% slower)...
  UPHILL_MIN: 0.45,        // ...but never below this share of normal speed
  DOWNHILL_FAST: 1.5, DOWNHILL_MAX: 1.15, // downhill: a little faster, at most +15%
  TERRAIN_SIGHT: true,     // hills and ridges block shots and sight lines
  // ---- WATER BOMBERS (v32): put out fires along a line; wet buildings can't catch fire for a while ----
  WATER_COST: 250, WATER_RUN_LEN: 400, WATER_SPACING: 18, WATER_BLAST: 24, WATER_WET_TIME: 180, WATER_DELAY: 2.5,
  // ---- DESTRUCTIBLE BUILDINGS""")

# ---------------- sim: terrain in movement and sight ----------------
rep("""  function ground(x, y) {""", """  function groundB(x, y) { if (!elevG) return 0; // bilinear: smooth slopes for movement and sight
    let gx = (x + HALF) / elevR - 0.5, gy = (y + HALF) / elevR - 0.5; if (gx < 0) gx = 0; else if (gx > elevN - 1.001) gx = elevN - 1.001; if (gy < 0) gy = 0; else if (gy > elevN - 1.001) gy = elevN - 1.001;
    const ix = gx | 0, iy = gy | 0, fx = gx - ix, fy = gy - iy, o = ix + iy * elevN;
    return (elevG[o] * (1 - fx) + elevG[o + 1] * fx) * (1 - fy) + (elevG[o + elevN] * (1 - fx) + elevG[o + elevN + 1] * fx) * fy; }
  function terrainClear(x0, y0, z0, x1, y1, z1) { // does the ground rise above the straight line between two heights?
    const L = Math.hypot(x1 - x0, y1 - y0), st = Math.ceil(L / Math.max(4, elevR)); if (st < 3) return true;
    for (let k = 1; k < st; k++) { const f = k / st; if (groundB(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f) > z0 + (z1 - z0) * f + 0.3) return false; } return true; }
  function ground(x, y) {""")
rep("""    const dx = tx - px[i], dy = ty - py[i], d = Math.sqrt(dx * dx + dy * dy) || 1;
    return z ? moveZ(""", """    const dx = tx - px[i], dy = ty - py[i], d = Math.sqrt(dx * dx + dy * dy) || 1;
    if (elevG) { const ux = dx / d * 6, uy = dy / d * 6, sl = (groundB(px[i] + ux, py[i] + uy) - groundB(px[i] - ux, py[i] - uy)) / 12; // slope along the way we're heading
      s *= sl > 0 ? Math.max(CFG.UPHILL_MIN, 1 - sl * CFG.UPHILL_SLOW) : Math.min(CFG.DOWNHILL_MAX, 1 - sl * CFG.DOWNHILL_FAST); }
    return z ? moveZ(""")
rep("""    for (let k = 1; k < st; k++) { x += sx; y += sy; const w = walk[nav(x, y)]; if (sight ? (w & 2) : (w & 9) !== 1) return false; }
    return true;
  }""", """    for (let k = 1; k < st; k++) { x += sx; y += sy; const w = walk[nav(x, y)]; if (sight ? (w & 2) : (w & 9) !== 1) return false; }
    if (sight && elevG && CFG.TERRAIN_SIGHT) return terrainClear(x0, y0, groundB(x0, y0) + 1.8, x1, y1, groundB(x1, y1) + 1.2);
    return true;
  }""")
rep("""    for (let k = 1; k < st; k++) { x += sx; y += sy; const c = nav(x, y); if ((walk[c] & 2) && blabel[c] !== b && bheight[c] >= h) return false; }
    return true;
  }""", """    for (let k = 1; k < st; k++) { x += sx; y += sy; const c = nav(x, y); if ((walk[c] & 2) && blabel[c] !== b && bheight[c] >= h) return false; }
    if (elevG && CFG.TERRAIN_SIGHT) return terrainClear(x0, y0, groundB(x0, y0) + h, x1, y1, groundB(x1, y1) + 1.2);
    return true;
  }""")

# ---------------- sim: water bombers ----------------
rep("""  const bdam = new Float32Array(NN);""", """  const bdam = new Float32Array(NN), wetUntil = new Float32Array(NN);""")
rep("""  function ignite(c) { if (c >= 0 && c < NN && (walk[c] & 2) && !fstate[c]) {""", """  function ignite(c) { if (c >= 0 && c < NN && (walk[c] & 2) && !fstate[c] && wetUntil[c] <= S.time) {""")
rep("""  S.igniteArea = igniteArea;""", """  S.igniteArea = igniteArea;
  function douse(x, y, r) { let n0 = 0; const c0 = nav(x - r, y - r), c1 = nav(x + r, y + r);
    for (let cy = (c0 / N) | 0; cy <= ((c1 / N) | 0); cy++) for (let cx = c0 % N; cx <= c1 % N; cx++) {
      const dx = -HALF + (cx + 0.5) * RES - x, dy = -HALF + (cy + 0.5) * RES - y; if (dx * dx + dy * dy > r * r) continue; const c = cx + cy * N;
      wetUntil[c] = S.time + CFG.WATER_WET_TIME; if (fstate[c] === 1) { fstate[c] = 0; n0++; } }
    for (let q = S.gfires.length - 1; q >= 0; q--) { const g = S.gfires[q]; if (Math.hypot(g.x - x, g.y - y) < r + g.r) S.gfires.splice(q, 1); }
    S.doused = (S.doused || 0) + n0; }
  S.waterbomb = function (x0, y0, x1, y1) { // a water bomber run: puts out fire along the line and soaks the buildings
    if (S.planning || !spend(CFG.WATER_COST)) return false;
    let dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy); if (len < 10) { dx = 1; dy = 0; len = 120; x0 -= 60; } else { dx /= len; dy /= len; }
    len = Math.min(len, CFG.WATER_RUN_LEN); const nb = Math.max(2, Math.round(len / CFG.WATER_SPACING)) + 1, gap = 0.08;
    for (let k = 0; k < nb; k++) S.shells.push({ x: x0 + dx * len * k / (nb - 1), y: y0 + dy * len * k / (nb - 1), t: CFG.WATER_DELAY + k * gap, r: CFG.WATER_BLAST, water: true, snd: 22 });
    S.planes.push({ x: x0, y: y0, dx, dy, v: len / ((nb - 1) * gap), age: 0, delay: CFG.WATER_DELAY - 0.6 }); emit(14, x0 + dx * len / 2, y0 + dy * len / 2);
    return true;
  };""")
rep("""      const rad = sh.r || CFG.MORTAR_BLAST;
      S.shells.splice(q, 1);""", """      const rad = sh.r || CFG.MORTAR_BLAST;
      if (sh.water) { S.shells.splice(q, 1); douse(sh.x, sh.y, rad); S.splash.push({ x: sh.x, y: sh.y, r: rad, t: 2.5 }); continue; }
      S.shells.splice(q, 1);""")
rep("""      for (const c of fireList) {
        if (S.time - fstart[c] > CFG.FIRE_BURN_TIME)""", """      for (const c of fireList) { if (fstate[c] !== 1) continue; // put out by water
        if (S.time - fstart[c] > CFG.FIRE_BURN_TIME)""")

# ---------------- sim: visual bookkeeping (rubble, dust, damage) ----------------
rep("""  S.goneQ = []; S.bldHit = false; S.bldDestroyed = 0;""", """  S.goneQ = []; S.dmgQ = []; S.dust = []; S.splash = []; S.bldHit = false; S.bldDestroyed = 0; let fdmgFlag = null;
  S.rubble = () => destroyed;""")
rep("""    if (bfid) { const f = bfid[c]; if (f >= 0 && !fgone[f]) { fdead[f]++; if (fdead[f] >= Math.min(fcount[f] * CFG.BUILDING_COLLAPSE, CFG.BUILDING_COLLAPSE_M2 / (RES * RES))) { fgone[f] = 1; S.goneQ.push(f);""",
"""    if (bfid) { const f = bfid[c]; if (f >= 0 && !fgone[f]) { fdead[f]++; if (!fdmgFlag[f]) { fdmgFlag[f] = 1; S.dmgQ.push(f); }
      if (fdead[f] >= Math.min(fcount[f] * CFG.BUILDING_COLLAPSE, CFG.BUILDING_COLLAPSE_M2 / (RES * RES))) { fgone[f] = 1; S.goneQ.push(f);
        { let sx = 0, sy = 0; const a = ffirst[f], e = ffirst[f + 1]; for (let k = a; k < e; k++) { sx += fcells[k] % N; sy += (fcells[k] / N) | 0; } // a dust cloud where it fell
          const m = Math.max(1, e - a); S.dust.push({ x: -HALF + (sx / m + 0.5) * RES, y: -HALF + (sy / m + 0.5) * RES, r: Math.min(80, 6 + Math.sqrt(m) * RES * 0.6), t0: S.time, h: bheight0 ? bheight0[fcells[a]] || 12 : 12 }); }""")
rep("""  S.setBuildings = function (fid, nf) { bfid = fid; fcount = new Int32Array(nf); fdead = new Int32Array(nf); fgone = new Uint8Array(nf);""",
    """  S.setBuildings = function (fid, nf) { bfid = fid; fcount = new Int32Array(nf); fdead = new Int32Array(nf); fgone = new Uint8Array(nf); fdmgFlag = new Uint8Array(nf);""")
rep("""  S.damageOf = undefined;""", "", 0) if False else None
s = s.replace("""  S.setElevation = function (g, n, r) { elevG = g; elevN = n; elevR = r; };""", """  S.setElevation = function (g, n, r) { elevG = g; elevN = n; elevR = r; };
  S.damageOf = (f) => fdead && fcount[f] ? Math.min(1, fdead[f] / Math.min(fcount[f] * CFG.BUILDING_COLLAPSE, CFG.BUILDING_COLLAPSE_M2 / (RES * RES))) : 0;""", 1)
rep("""    destroyed = []; bdam.fill(0); if (fdead) { fdead.fill(0); fgone.fill(0); } S.goneQ = []; S.bldDestroyed = 0;""",
    """    destroyed = []; bdam.fill(0); wetUntil.fill(0); if (fdead) { fdead.fill(0); fgone.fill(0); fdmgFlag.fill(0); } S.goneQ = []; S.dmgQ = []; S.dust = []; S.splash = []; S.bldDestroyed = 0; S.doused = 0;""")
rep("""    for (let q = S.blasts.length - 1; q >= 0; q--) { S.blasts[q].t -= dt; if (S.blasts[q].t <= 0) S.blasts.splice(q, 1); }""",
    """    for (let q = S.blasts.length - 1; q >= 0; q--) { S.blasts[q].t -= dt; if (S.blasts[q].t <= 0) S.blasts.splice(q, 1); }
    for (let q = S.splash.length - 1; q >= 0; q--) { S.splash[q].t -= dt; if (S.splash[q].t <= 0) S.splash.splice(q, 1); }
    if (S.dust.length && S.time - S.dust[0].t0 > 40) S.dust.shift();""")

# ---------------- renderer: rubble, smoke, dust, water splash ----------------
rep(""":t<22.5?vec3(1.0,0.42,0.06):vec3(1.0,0.82,0.2);v_sq=max(step(5.5,t)*(1.0-step(10.5,t)*step(t,11.5))*step(t,12.5),step(20.5,t)*step(t,21.5));}""",
    """:t<22.5?vec3(1.0,0.42,0.06):t<23.5?vec3(1.0,0.82,0.2):t<24.5?vec3(0.33,0.3,0.27):t<25.5?vec3(0.17,0.17,0.19):t<26.5?vec3(0.6,0.57,0.52):vec3(0.45,0.75,1.0);v_sq=max(max(step(5.5,t)*(1.0-step(10.5,t)*step(t,11.5))*step(t,12.5),step(20.5,t)*step(t,21.5)),step(23.5,t)*step(t,24.5));}""")
rep("""      let oH = wc, oZ = wc + cH, oT = wc + cH + cZ; const total = oT + cT, oT0 = oT;""",
"""      { // rubble where buildings came down (on the ground), then smoke over fires, dust where buildings fell, water splashes
        const rb = sim.rubble(), st = Math.max(1, Math.ceil(rb.length / 30000)), rsz = Math.max(2, sim.RES / mpp * dpr * 1.1) / size;
        for (let j = 0; j < rb.length && wc < 150000; j += st) { const c = rb[j]; vbuf[wc * 5] = -sim.HALF + (c % hN + 0.5) * sim.RES; vbuf[wc * 5 + 1] = -sim.HALF + (((c / hN) | 0) + 0.5) * sim.RES;
          vbuf[wc * 5 + 2] = 24; vbuf[wc * 5 + 3] = rsz * (0.7 + ((c * 7919) % 7) / 14); vbuf[wc * 5 + 4] = ((c * 31) % 5) * 0.4; wc++; }
        const now = performance.now() / 1000, fl = sim.fires(), puff = (x, y, z, sc, code) => { if (wc >= 160000) return; vbuf[wc * 5] = x; vbuf[wc * 5 + 1] = y; vbuf[wc * 5 + 2] = code; vbuf[wc * 5 + 3] = sc; vbuf[wc * 5 + 4] = z; wc++; };
        const msz = (m) => Math.max(1.5, m / mpp * dpr) / size, bh = sim.bheight, stp = Math.max(17, Math.ceil(fl.length / 1500));
        for (let j = 0; j < fl.length; j += stp) { const c = fl[j], x0 = -HALF2() + (c % hN + 0.5) * sim.RES, y0 = -HALF2() + (((c / hN) | 0) + 0.5) * sim.RES, r0 = (bh[c] || 6) + 4;
          for (let k = 0; k < 4; k++) { const ph = (now * 0.18 + k * 0.25 + (c % 97) / 97) % 1, z = r0 + ph * 70; puff(x0 + ph * 25 + Math.sin(now + k + c) * 4, y0 - ph * 12, z, msz(6 + ph * 22), 25); } }
        for (const d of sim.dust) { const age = sim.time - d.t0, a = Math.max(0, 1 - age / 40); if (a <= 0) continue;
          for (let k = 0; k < 10; k++) { const an = k * 2.4 + d.x, rr = d.r * (0.3 + age / 25) * (0.5 + (k % 3) / 3);
            puff(d.x + Math.cos(an) * rr, d.y + Math.sin(an) * rr, 2 + d.h * 0.4 * Math.min(1, age / 6) * ((k % 4) / 3), msz(d.r * 0.5 * a + 4), 26); } }
        for (const w of sim.splash) for (let k = 0; k < 12; k++) { const an = k / 12 * 6.283, rr = w.r * (1 - w.t / 2.5);
          puff(w.x + Math.cos(an) * rr, w.y + Math.sin(an) * rr, 3, msz(4), 27); } }
      let oH = wc, oZ = wc + cH, oT = wc + cH + cZ; const total = oT + cT, oT0 = oT;""")
rep("""    draw(gl, arg) {""", """    draw(gl, arg) { const HALF2 = () => sim.HALF;""")

# damage tint on the 3D buildings
rep("""        paint: { 'fill-extrusion-color': '#2b3742', 'fill-extrusion-opacity': 0.88,""",
    """        paint: { 'fill-extrusion-color': ['interpolate', ['linear'], ['coalesce', ['feature-state', 'dmg'], 0], 0, '#2b3742', 0.5, '#3b302b', 1, '#4a2718'], 'fill-extrusion-opacity': 0.88,""")
rep("""  function drainCollapses() { if (!sim.goneQ.length) return; const q = sim.goneQ.splice(0);""",
    """  let dmgTick = 0;
  function drainCollapses() { if (++dmgTick % 15 === 0 && sim.dmgQ.length && map.getSource('bldg')) for (const f of sim.dmgQ.splice(0)) map.setFeatureState({ source: 'bldg', id: f }, { dmg: sim.damageOf(f) });
    if (!sim.goneQ.length) return; const q = sim.goneQ.splice(0);""")

# ---------------- UI: water bomber ----------------
rep("""  <div class="row"><button data-mode="strafe">A-10 (R)</button><button data-mode="firebomb">Firebomb (F)</button></div>""",
    """  <div class="row"><button data-mode="strafe">A-10 (R)</button><button data-mode="firebomb">Firebomb (F)</button></div>
  <div class="row"><button data-mode="water">Water bomber (Y)</button></div>""")
rep("""      { id: 'strafe', name: 'A-10 strafing runs', rarity: 'jackpot' },""", """      { id: 'water', name: 'Water bombers', rarity: 'uncommon' }, { id: 'strafe', name: 'A-10 strafing runs', rarity: 'jackpot' },""")
rep("""isLine = (k) => k === 'drop' || k === 'wall' || k === 'gate' || k === 'bomb' || k === 'strafe' || k === 'firebomb' || k === 'wire',""",
    """isLine = (k) => k === 'drop' || k === 'wall' || k === 'gate' || k === 'bomb' || k === 'strafe' || k === 'firebomb' || k === 'water' || k === 'wire',""")
rep("""drag.kind === 'firebomb' ? '#ffa11a' :""", """drag.kind === 'firebomb' ? '#ffa11a' : drag.kind === 'water' ? '#4db8ff' :""")
rep("""drag.kind === 'firebomb' ? CFG.FIRE_RUN_LEN""", """drag.kind === 'firebomb' ? CFG.FIRE_RUN_LEN : drag.kind === 'water' ? CFG.WATER_RUN_LEN""")
rep("""      else if (drag.kind === 'precision' || drag.kind === 'strafe' || drag.kind === 'firebomb' || drag.kind === 'missile') {""",
    """      else if (drag.kind === 'water') { if (phase === 'plan') flash('Air support is only available once the outbreak is live.');
        else { const a = local(drag.x, drag.y), b = local(e.clientX, e.clientY); if (!sim.waterbomb(a[0], a[1], b[0], b[1])) deny(); else flash('Water bomber inbound: it puts out fires along the line and soaks the buildings for ' + CFG.WATER_WET_TIME / 60 + ' minutes.'); } }
      else if (drag.kind === 'precision' || drag.kind === 'strafe' || drag.kind === 'firebomb' || drag.kind === 'missile') {""")
rep("""firebomb: ['Firebomb', CFG.FIRE_COST, 'F'],""", """firebomb: ['Firebomb', CFG.FIRE_COST, 'F'], water: ['Water bomber', CFG.WATER_COST, 'Y'],""")
rep("""    else if (e.key === 'f' || e.key === 'F') setMode('firebomb');""", """    else if (e.key === 'f' || e.key === 'F') setMode('firebomb');
    else if (e.key === 'y' || e.key === 'Y') setMode('water');""")
open(p, 'w').write(s)
print('ok')
