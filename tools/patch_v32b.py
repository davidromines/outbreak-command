p = '/home/claude/outbreak.html'
s = open(p).read()
def rep(a, b, cnt=1):
    global s
    n = s.count(a); assert n == cnt, (n, a[:100]); s = s.replace(a, b)

# ---------------- CFG ----------------
rep("""  // ---- TERRAIN (v32)""", """  // ---- MASSIVE HORDES (v32): the real population lives in a coarse grid of 40 m blocks, sheltering in the buildings.
  // Zombies break in, infect them, and move on as a horde. Near your units and the fleeing civilians the horde turns into
  // real zombies (dots); far away it stays a green glow. Bombs, shells, napalm, A-10s and nukes thin it out.
  HORDE: {
    ON: true,
    CELL: 40,              // metres per block
    M2_PER_PERSON: 30,     // real population: one person per this much floor space
    MAX_PEOPLE: 4000000,   // cap on the sheltering population
    INFECT: 0.04,          // sheltering civilians each zombie in the block infects per second
    MOVE: 0.06,            // share of a block's horde that moves to the next block toward people each second (~2.4 m/s)
    ACTIVE_R: 300,         // the horde becomes real zombies within this range of your units...
    SPAWN_RATE: 10,        // ...at up to this many zombies per block per second
    RESERVE: 2500,         // keep this many dot slots free; far-away zombies fold back into the horde when slots run low
    BLAST_KILL: 0.85, BLAST_CIV: 0.35, // share of the horde / sheltering civilians killed under a blast
    SEED_CAP: [0, 4000, 25000, 100000] // campaign: most horde zombies carried into each stage
  },
  // ---- TERRAIN (v32)""")

# ---------------- sim: horde field ----------------
rep("""  const bdam = new Float32Array(NN), wetUntil = new Float32Array(NN);""", """  const bdam = new Float32Array(NN), wetUntil = new Float32Array(NN);
  const HC = CFG.HORDE.CELL, HG = Math.ceil(2 * HALF / HC), HN = HG * HG; // horde blocks
  const bH = new Float32Array(HN), bZ = new Float32Array(HN), hwalk = new Uint8Array(HN), hbld = new Uint16Array(HN), hdist = new Uint16Array(HN), hq = new Int32Array(HN);
  const aH = new Uint16Array(HN), aZ = new Uint16Array(HN), hact = new Uint8Array(HN); let hordeT = 0;
  const hcOf = (x, y) => { let hx = ((x + HALF) / HC) | 0, hy = ((y + HALF) / HC) | 0; if (hx < 0) hx = 0; else if (hx >= HG) hx = HG - 1; if (hy < 0) hy = 0; else if (hy >= HG) hy = HG - 1; return hx + hy * HG; };""")
rep("""  S.rubble = () => destroyed;""", """  S.rubble = () => destroyed;
  S.HG = HG; S.HC = HC; S.bgZField = bZ; S.bgHField = bH; S.bgH = 0; S.bgZ = 0; S.bgH0 = 0; S.bgKills = 0; S.seedBg = null;
  function hordeInit() { // sheltering population from the real floor space, minus the civilians already on the streets
    bH.fill(0); bZ.fill(0); hwalk.fill(0); hbld.fill(0); S.bgH = S.bgZ = S.bgH0 = 0; if (!CFG.HORDE.ON || !S.streets) return;
    const fl = new Float32Array(HN); let tot = 0;
    for (let c = 0; c < NN; c++) { const w = walk[c]; if (!w) continue; const hc = hcOf(-HALF + (c % N + 0.5) * RES, -HALF + (((c / N) | 0) + 0.5) * RES);
      if (w & 1) hwalk[hc] = 1; if (w & 2) { hbld[hc]++; const f = Math.max(1, Math.round((bheight[c] || CFG.FLOOR_HEIGHT) / CFG.FLOOR_HEIGHT)) * RES * RES; fl[hc] += f; tot += f; } }
    const want = Math.min(CFG.HORDE.MAX_PEOPLE, tot / CFG.HORDE.M2_PER_PERSON) - S.humans0; if (want <= 0 || !tot) return;
    for (let k = 0; k < HN; k++) { if (fl[k]) { bH[k] = want * fl[k] / tot; hwalk[k] = 1; } } S.bgH = S.bgH0 = want; }
  function bgHit(x, y, r, kz, kh) { // a blast over the horde grid
    const r0 = Math.ceil((r + HC) / HC), h0 = hcOf(x, y), hx0 = h0 % HG, hy0 = (h0 / HG) | 0, cov = Math.min(1, Math.PI * r * r / (HC * HC));
    for (let yy = hy0 - r0; yy <= hy0 + r0; yy++) { if (yy < 0 || yy >= HG) continue;
      for (let xx = hx0 - r0; xx <= hx0 + r0; xx++) { if (xx < 0 || xx >= HG) continue; const k = xx + yy * HG, cx = -HALF + (xx + 0.5) * HC - x, cy = -HALF + (yy + 0.5) * HC - y;
        const d = Math.sqrt(cx * cx + cy * cy); if (d > r + HC * 0.5) continue; const f = (d < r - HC * 0.5 ? 1 : cov * Math.max(0.2, 1 - (d - r + HC * 0.5) / HC));
        if (bZ[k] > 0) { const dz = bZ[k] * kz * f; bZ[k] -= dz; S.bgKills += dz; S.kills += dz; } if (bH[k] > 0) bH[k] -= bH[k] * kh * f; } }
    S.kills = Math.round(S.kills); }
  S.bgHit = bgHit;
  function hordeStep(dts) {
    const H = CFG.HORDE; aH.fill(0); aZ.fill(0); hact.fill(0);
    const ar = Math.ceil(H.ACTIVE_R / HC);
    for (let i = 0; i < S.n; i++) { const t = type[i]; if (!t) continue; const k = hcOf(px[i], py[i]);
      if (t === HUMAN) { if (aH[k] < 65000) aH[k]++; } else if (t === ZOMBIE) { if (aZ[k] < 65000) aZ[k]++; }
      else if ((t === TROOPER || t === APC || t === MORTAR || t === SHIP) && !hact[k]) { // the horde comes alive around your units
        const kx = k % HG, ky = (k / HG) | 0; for (let yy = Math.max(0, ky - ar); yy <= Math.min(HG - 1, ky + ar); yy++) for (let xx = Math.max(0, kx - ar); xx <= Math.min(HG - 1, kx + ar); xx++) hact[xx + yy * HG] = 1; } }
    // infection: zombies in a block (horde or dots) break into its buildings
    for (let k = 0; k < HN; k++) { const z = bZ[k] + aZ[k]; if (z >= 1 && bH[k] > 0) { const inf = Math.min(bH[k], H.INFECT * z * dts); bH[k] -= inf; bZ[k] += inf; } }
    // movement: the horde walks toward the nearest people (sheltering or on the street)
    let qt = 0; for (let k = 0; k < HN; k++) { if (hwalk[k] && (bH[k] >= 1 || aH[k])) { hdist[k] = 0; hq[qt++] = k; } else hdist[k] = 65535; }
    for (let qh = 0; qh < qt; qh++) { const k = hq[qh], d = hdist[k] + 1, kx = k % HG;
      if (kx > 0 && hwalk[k - 1] && hdist[k - 1] > d) { hdist[k - 1] = d; hq[qt++] = k - 1; } if (kx < HG - 1 && hwalk[k + 1] && hdist[k + 1] > d) { hdist[k + 1] = d; hq[qt++] = k + 1; }
      if (k >= HG && hwalk[k - HG] && hdist[k - HG] > d) { hdist[k - HG] = d; hq[qt++] = k - HG; } if (k < HN - HG && hwalk[k + HG] && hdist[k + HG] > d) { hdist[k + HG] = d; hq[qt++] = k + HG; } }
    const mv = Math.min(0.5, H.MOVE * dts), flow = new Float32Array(0); // moves are applied in place, sweeping from both ends to avoid a drift bias
    for (let pass = 0; pass < 2; pass++) for (let q = 0; q < HN; q++) { const k = pass ? HN - 1 - q : q; if (bZ[k] < 0.5 || hdist[k] === 0 || hdist[k] === 65535) continue;
      const kx = k % HG; let best = -1, bd = hdist[k];
      if (kx > 0 && hdist[k - 1] < bd) { bd = hdist[k - 1]; best = k - 1; } if (kx < HG - 1 && hdist[k + 1] < bd) { bd = hdist[k + 1]; best = k + 1; }
      if (k >= HG && hdist[k - HG] < bd) { bd = hdist[k - HG]; best = k - HG; } if (k < HN - HG && hdist[k + HG] < bd) { bd = hdist[k + HG]; best = k + HG; }
      if (best >= 0) { const m = bZ[k] * mv * 0.5; bZ[k] -= m; bZ[best] += m; } }
    // the horde becomes real zombies near your units and near civilians on the street
    let slots = MAXN - S.n + free.length - H.RESERVE;
    for (let k = 0; k < HN && slots > 0; k++) { if (bZ[k] < 1 || !(hact[k] || aH[k])) continue;
      let m = Math.min(Math.floor(bZ[k]), Math.ceil(H.SPAWN_RATE * dts), slots); const hx = k % HG, hy = (k / HG) | 0;
      while (m > 0) { let placed = false; for (let tr = 0; tr < 12 && !placed; tr++) { const x = -HALF + (hx + rnd()) * HC, y = -HALF + (hy + rnd()) * HC;
          if (x > -HALF && x < HALF && y > -HALF && y < HALF && ok(x, y)) { const i = alloc(); if (i < 0) { m = 0; break; } px[i] = x; py[i] = y; makeZombie(i); placed = true; } }
        if (!placed) break; bZ[k] -= 1; m--; slots--; } }
    // short of dot slots: far-away zombies fold back into the horde
    if (MAXN - S.n + free.length < H.RESERVE) { let need = H.RESERVE * 2;
      for (let i = 0; i < S.n && need > 0; i++) if (type[i] === ZOMBIE) { const k = hcOf(px[i], py[i]); if (hact[k] || aH[k]) continue; bZ[k] += 1; type[i] = NONE; free.push(i); need--; } }
    let th = 0, tz = 0; for (let k = 0; k < HN; k++) { if (bZ[k] < 0.02) bZ[k] = 0; th += bH[k]; tz += bZ[k]; } S.bgH = th; S.bgZ = tz; S.hordeDirty = true;
  }""")
# init after civilians are placed; seeded horde added at outbreak start
rep("""    S.started = false; S.zombies0 = 0;""", """    S.started = false; S.zombies0 = 0; hordeT = 0;""")
rep("""    if (S.seed && S.seed.length) S.outbreaks.push([0, 0, S.seed.length / 2]);""",
    """    if (S.seed && S.seed.length) S.outbreaks.push([0, 0, S.seed.length / 2]);
    if (S.seedBg) for (let k = 0; k < S.seedBg.length; k += 3) { const h = hcOf(S.seedBg[k], S.seedBg[k + 1]); bZ[h] += S.seedBg[k + 2]; S.bgZ += S.seedBg[k + 2]; }""")
rep("""  S.zombieSample = function (max) {""", """  S.hordeSample = function (max) { // the horde to carry into the next stage: [x, y, count, ...] scaled to at most max zombies
    const out = [], f = S.bgZ > max ? max / S.bgZ : 1; for (let k = 0; k < HN; k++) if (bZ[k] * f >= 0.5) out.push(Math.round(-HALF + (k % HG + 0.5) * HC), Math.round(-HALF + (((k / HG) | 0) + 0.5) * HC), Math.round(bZ[k] * f)); return out; };
  S.zombieSample = function (max) {""")
# horde ticks once a second while live
rep("""    for (let q = S.splash.length - 1; q >= 0; q--) {""", """    if (S.started && CFG.HORDE.ON && (S.bgH0 > 0 || S.bgZ > 0)) { hordeT += dt; if (hordeT >= 1) { hordeStep(hordeT); hordeT = 0; } }
    for (let q = S.splash.length - 1; q >= 0; q--) {""")
# blasts, strafes, nukes and collapses hit the horde grid
rep("""      damageBuildings(sh.x, sh.y, rad, sh.bld != null ? sh.bld : (sh.dz || Wd.mortar.damage));""",
    """      damageBuildings(sh.x, sh.y, rad, sh.bld != null ? sh.bld : (sh.dz || Wd.mortar.damage)); bgHit(sh.x, sh.y, rad, CFG.HORDE.BLAST_KILL, CFG.HORDE.BLAST_CIV);""")
rep("""      for (let dd = p0; dd <= st.prog; dd += w) { const cx0 = st.x0 + st.dx * dd, cy0 = st.y0 + st.dy * dd;""",
    """      for (let dd = p0; dd <= st.prog; dd += w) { const cx0 = st.x0 + st.dx * dd, cy0 = st.y0 + st.dy * dd; bgHit(cx0, cy0, w, 0.85, 0.2);""")
rep("""      S.nukes.splice(q, 1); const r2 = CFG.NUKE_RADIUS * CFG.NUKE_RADIUS;""", """      S.nukes.splice(q, 1); const r2 = CFG.NUKE_RADIUS * CFG.NUKE_RADIUS; bgHit(nk.x, nk.y, CFG.NUKE_RADIUS, 1, 1);""")
rep("""  function destroyCell(c) { if (!(walk[c] & 2)) return;""", """  function destroyCell(c) { if (!(walk[c] & 2)) return;
    { const k = hcOf(-HALF + (c % N + 0.5) * RES, -HALF + (((c / N) | 0) + 0.5) * RES); if (bH[k] > 0 && hbld[k]) bH[k] -= bH[k] / hbld[k]; } // people sheltering in it die""")
rep("""  S.reset();
  return S;
}
/*SIM-END*/""", """  S.reset();
  return S;
}
/*SIM-END*/""")
# reset: horde initialised after civilians are spawned (end of reset)
rep("""    S.started = false; S.zombies0 = 0; hordeT = 0;""", """    S.started = false; S.zombies0 = 0; hordeT = 0; S.bgKills = 0;""")
# totals each step
rep("""    S.nh = nh; S.nz = nz;""", """    S.allH = nh + S.bgH; S.allZ = nz + (S.bgZ >= 1 ? S.bgZ : 0); S.allH0 = S.humans0 + S.bgH0;
    S.nh = nh; S.nz = nz;""")
open(p, 'w').write(s)
print('ok')
