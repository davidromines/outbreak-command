p = '/home/claude/outbreak.html'
s = open(p).read()
def rep(a, b, cnt=1):
    global s
    n = s.count(a); assert n == cnt, (n, a[:100]); s = s.replace(a, b)

# counters in millions; "saved" counts everyone, sheltering included
rep("""  const fmt = (v) => v.toLocaleString('en-US');
  const pct = (h) => { const v = 100 * h / sim.humans0;""", """  const fmt = (v) => Math.round(v).toLocaleString('en-US');
  const big = (v) => v >= 1e6 ? (v / 1e6).toFixed(v >= 1e7 ? 1 : 2) + 'M' : v >= 1e5 ? Math.round(v / 1e3) + 'k' : fmt(v);
  const pct = (h) => { const v = 100 * h / (sim.allH0 || sim.humans0);""")
rep("""    $('sH').textContent = fmt(sim.nh); $('sZ').textContent = fmt(sim.nz);""",
    """    $('sH').textContent = big(sim.allH); $('sZ').textContent = big(sim.allZ); $('sH').title = fmt(sim.nh) + ' on the street, ' + fmt(sim.bgH) + ' sheltering'; $('sZ').title = fmt(sim.nz) + ' dots, ' + fmt(sim.bgZ) + ' in the horde';""")
rep("""$('sS').textContent = pct(sim.nh + sim.evac);""", """$('sS').textContent = pct(sim.allH + sim.evac);""")
# sandbox end
rep("""      if (phase === 'live' && steps > 0) { if (isCamp()) campCheck(); else if (sim.nz === 0) end(true); else if (sim.nh === 0) end(false); }""",
    """      if (phase === 'live' && steps > 0) { if (isCamp()) campCheck(); else if (sim.allZ === 0) end(true); else if (sim.allH < 1) end(false); }""")
rep("""    const saved = sim.evac + (won ? sim.nh : 0), p = 100 * saved / sim.humans0;""", """    const saved = Math.round(sim.evac + (won ? sim.allH : 0)), p = 100 * saved / sim.allH0;""")
rep("""fmt(sim.zombies0) + ' zombies, ' + fmt(sim.humans0) + ' civilians\\n""", """fmt(sim.zombies0) + ' zombies, ' + fmt(sim.allH0) + ' civilians (' + fmt(sim.humans0) + ' on the street)\\n""")
# campaign
rep("""  function campCheck() { const st = STAGES[camp.run.stage], alive = sim.nh / sim.humans0;
    if (sim.nz === 0) stageEnd('contained'); else if (sim.nh === 0) stageEnd('wipe');""",
    """  function campCheck() { const st = STAGES[camp.run.stage], alive = sim.allH / sim.allH0;
    if (sim.allZ === 0) stageEnd('contained'); else if (sim.allH < 1) stageEnd('wipe');""")
rep("""    over = true; const run = camp.run, k = run.stage, st = STAGES[k], alive = sim.nh / sim.humans0, last = k === STAGES.length - 1;""",
    """    over = true; const run = camp.run, k = run.stage, st = STAGES[k], alive = sim.allH / sim.allH0, last = k === STAGES.length - 1;""")
rep("""    $('bGrade').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars) + ' · ' + fmt(sim.nh) + ' of ' + fmt(sim.humans0) + ' civilians · ' + fmt(sim.kills) + ' zombies killed';""",
    """    $('bGrade').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars) + ' · ' + big(sim.allH) + ' of ' + big(sim.allH0) + ' civilians · ' + big(sim.kills) + ' zombies killed';""")
rep("""    const seed = contained ? [] : Array.from(sim.zombieSample(Math.min(nx.seedCap, Math.ceil(sim.nz * CP.SEED_SHARE))), (v) => Math.round(v));
    Object.assign(run, { stage: k + 1, up: Object.assign({}, sim.up), crates, bonus: cash, seed, cPity: sim.cPity, bpPity: sim.bpPity }); saveCamp();""",
    """    const seed = contained ? [] : Array.from(sim.zombieSample(Math.min(nx.seedCap, Math.ceil(sim.nz * CP.SEED_SHARE))), (v) => Math.round(v));
    const seedBg = contained ? [] : sim.hordeSample(Math.min(CFG.HORDE.SEED_CAP[k + 1] || 0, sim.bgZ * CP.SEED_SHARE)), bgCount = seedBg.reduce((a, v, i) => a + (i % 3 === 2 ? v : 0), 0);
    Object.assign(run, { stage: k + 1, up: Object.assign({}, sim.up), crates, bonus: cash, seed, seedBg, cPity: sim.cPity, bpPity: sim.bpPity }); saveCamp();""")
rep("""'Time is up, but ' + fmt(sim.nz) + ' zombies are still loose. ' + fmt(seed.length / 2) + ' of them break out into the next stage""",
    """'Time is up, but ' + big(sim.allZ) + ' zombies are still loose. ' + fmt(seed.length / 2 + bgCount) + ' of them break out into the next stage""")
rep("""    sim.seed = run.seed; seenBreaches = 0;""", """    sim.seed = run.seed; sim.seedBg = run.seedBg || null; seenBreaches = 0;""")
rep("""      const sd = sim.seed; if (sd && sd.length) { g.fillStyle = 'rgba(90,255,40,0.22)'; const k = M / (2 * sim.HALF);
        for (let q = 0; q < sd.length; q += 2) { g.beginPath(); g.arc((sd[q] + sim.HALF) * k, (sd[q + 1] + sim.HALF) * k, 3, 0, 6.283); g.fill(); } }""",
    """      const sd = sim.seed; if (sd && sd.length) { g.fillStyle = 'rgba(90,255,40,0.22)'; const k = M / (2 * sim.HALF);
        for (let q = 0; q < sd.length; q += 2) { g.beginPath(); g.arc((sd[q] + sim.HALF) * k, (sd[q + 1] + sim.HALF) * k, 3, 0, 6.283); g.fill(); } }
      const sb = sim.seedBg; if (sb && sb.length) { const k = M / (2 * sim.HALF);
        for (let q = 0; q < sb.length; q += 3) { g.fillStyle = 'rgba(90,255,40,' + Math.min(0.5, 0.08 + Math.log10(1 + sb[q + 2]) * 0.12) + ')'; g.fillRect((sb[q] + sim.HALF) * k - 4, (sb[q + 1] + sim.HALF) * k - 4, 8, 8); } }""")

# the horde glow: a green density image draped on the ground, refreshed once a second
rep("""  let dmgTick = 0;""", """  let hordeCanvas = null, hordeLast = 0;
  function drawHorde() { try {
    if (!sim.HG || !(sim.bgZ > 0 || hordeCanvas)) return; const now = performance.now(); if (now - hordeLast < 1000 || !sim.hordeDirty) return; hordeLast = now; sim.hordeDirty = false;
    const G = sim.HG, Z = sim.bgZField, H = sim.bgHField; if (!hordeCanvas || hordeCanvas.width !== G) { hordeCanvas = document.createElement('canvas'); hordeCanvas.width = hordeCanvas.height = G; }
    const g = hordeCanvas.getContext('2d'), im = g.createImageData(G, G), d = im.data;
    for (let k = 0; k < G * G; k++) { const z = Z[k], o = k * 4; if (z >= 1) { const a = Math.min(1, 0.25 + Math.log10(z) * 0.28); d[o] = 70; d[o + 1] = 255; d[o + 2] = 30; d[o + 3] = a * 210; }
      else if (H[k] >= 1 && false) { d[o] = 255; d[o + 1] = 255; d[o + 2] = 255; d[o + 3] = 20; } }
    g.putImageData(im, 0, 0);
    const a0 = -sim.HALF, a1 = -sim.HALF + sim.HG * sim.HC, co = [toLngLat(a0, a0), toLngLat(a1, a0), toLngLat(a1, a1), toLngLat(a0, a1)].map((p) => [p.lng, p.lat]), url = hordeCanvas.toDataURL();
    if (map.getSource('horde')) map.getSource('horde').updateImage({ url, coordinates: co });
    else map.addSource('horde', { type: 'image', url, coordinates: co });
    if (!map.getLayer('horde')) map.addLayer({ id: 'horde', type: 'raster', source: 'horde', paint: { 'raster-fade-duration': 0, 'raster-opacity': 0.75, 'raster-resampling': 'linear' } }, map.getLayer('bld3dg') ? 'bld3dg' : map.getLayer('agents') ? 'agents' : undefined);
  } catch (e) { console.warn('horde layer', e); } }
  let dmgTick = 0;""")
rep("""      drainCollapses();""", """      drainCollapses(); drawHorde();""")
# a fresh stage or sandbox clears the old glow
rep("""  function buildSandbox() { sim = makeSim(CFG);""", """  function clearHorde() { try { if (map.getLayer('horde')) map.removeLayer('horde'); if (map.getSource('horde')) map.removeSource('horde'); } catch (e) {} hordeCanvas = null; }
  function buildSandbox() { clearHorde(); sim = makeSim(CFG);""")
rep("""    sim = makeSim(stageCfg(run.stage));""", """    clearHorde(); sim = makeSim(stageCfg(run.stage));""")
rep("""    loadMeta(); sim.reset(); try {""", """    loadMeta(); sim.reset(); clearHorde(); try {""")
open(p, 'w').write(s)
print('ok')
