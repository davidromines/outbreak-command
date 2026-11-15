s=open('/home/claude/outbreak.html').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:70],s.count(a)); s=s.replace(a,b)
# --- barricade-aware horde: label the walkable areas that barricades/gates cut apart ---
rep("  function hordeStep(dts) {\n    const H = CFG.HORDE; aH.fill(0); aZ.fill(0); hact.fill(0);",
"""  let lab = null, blab = null; S.labDirty = true;
  function computeLabels() { // connected areas of street (barricades and gates cut them); buildings join the area they open onto
    if (!lab || lab.length !== NN) lab = new Int32Array(NN); if (!blab || blab.length !== HN) blab = new Int32Array(HN);
    lab.fill(-1); let L = 0; const q = queue;
    const pass = (c) => (walk[c] & 1) && !(walk[c] & 12);
    for (let c0 = 0; c0 < NN; c0++) { if (lab[c0] >= 0 || !pass(c0)) continue; lab[c0] = L; let h = 0, t = 0; q[t++] = c0;
      while (h < t) { const c = q[h++], x = c % N;
        if (x > 0 && lab[c - 1] < 0 && pass(c - 1)) { lab[c - 1] = L; q[t++] = c - 1; } if (x < N - 1 && lab[c + 1] < 0 && pass(c + 1)) { lab[c + 1] = L; q[t++] = c + 1; }
        if (c >= N && lab[c - N] < 0 && pass(c - N)) { lab[c - N] = L; q[t++] = c - N; } if (c < NN - N && lab[c + N] < 0 && pass(c + N)) { lab[c + N] = L; q[t++] = c + N; } }
      L++; }
    { let h = 0, t = 0; for (let c = 0; c < NN; c++) if (lab[c] >= 0 && (walk[c] & 2) === 0) { const x = c % N; // street cells next to buildings seed the building fill
        if ((x > 0 && (walk[c - 1] & 2)) || (x < N - 1 && (walk[c + 1] & 2)) || (c >= N && (walk[c - N] & 2)) || (c < NN - N && (walk[c + N] & 2))) q[t++] = c; }
      while (h < t) { const c = q[h++], x = c % N, l = lab[c]; const nb = [x > 0 ? c - 1 : -1, x < N - 1 ? c + 1 : -1, c - N, c + N];
        for (const m of nb) if (m >= 0 && m < NN && lab[m] < 0 && (walk[m] & 2) && !(walk[m] & 12)) { lab[m] = l; q[t++] = m; } } }
    // each horde block belongs to the area that covers most of it (majority vote)
    const cnt = new Int32Array(HN); blab.fill(-1);
    for (let c = 0; c < NN; c++) { const l = lab[c]; if (l < 0) continue; const k = hcOf(-HALF + (c % N + 0.5) * RES, -HALF + (((c / N) | 0) + 0.5) * RES);
      if (blab[k] === l) cnt[k]++; else if (cnt[k] === 0) { blab[k] = l; cnt[k] = 1; } else cnt[k]--; }
    S.labDirty = false; S.areas = L; }
  const labAt = (x, y) => lab ? lab[nav(x, y)] : -1;
  S.labAt = labAt; S.blockLab = () => blab;
  function hordeStep(dts) {
    const H = CFG.HORDE; aH.fill(0); aZ.fill(0); hact.fill(0);
    if (S.labDirty || !lab) computeLabels();
    const same = (a, b) => blab[a] === blab[b];""")
rep("      if (t === HUMAN) { if (aH[k] < 65000) aH[k]++; } else if (t === ZOMBIE) { if (aZ[k] < 65000) aZ[k]++; }",
    "      if (t === HUMAN) { if (aH[k] < 65000 && lab[nav(px[i], py[i])] === blab[k]) aH[k]++; } else if (t === ZOMBIE) { if (aZ[k] < 65000 && lab[nav(px[i], py[i])] === blab[k]) aZ[k]++; }")
rep(".filter((m) => m >= 0 && m < HN && hwalk[m]);", ".filter((m) => m >= 0 && m < HN && hwalk[m] && same(m, k));")
rep("""      if (kx > 0 && hwalk[k - 1] && hdist[k - 1] > d) { hdist[k - 1] = d; hq[qt++] = k - 1; } if (kx < HG - 1 && hwalk[k + 1] && hdist[k + 1] > d) { hdist[k + 1] = d; hq[qt++] = k + 1; }
      if (k >= HG && hwalk[k - HG] && hdist[k - HG] > d) { hdist[k - HG] = d; hq[qt++] = k - HG; } if (k < HN - HG && hwalk[k + HG] && hdist[k + HG] > d) { hdist[k + HG] = d; hq[qt++] = k + HG; } }""",
"""      if (kx > 0 && hwalk[k - 1] && hdist[k - 1] > d && same(k, k - 1)) { hdist[k - 1] = d; hq[qt++] = k - 1; } if (kx < HG - 1 && hwalk[k + 1] && hdist[k + 1] > d && same(k, k + 1)) { hdist[k + 1] = d; hq[qt++] = k + 1; }
      if (k >= HG && hwalk[k - HG] && hdist[k - HG] > d && same(k, k - HG)) { hdist[k - HG] = d; hq[qt++] = k - HG; } if (k < HN - HG && hwalk[k + HG] && hdist[k + HG] > d && same(k, k + HG)) { hdist[k + HG] = d; hq[qt++] = k + HG; } }""")
rep("""      if (kx > 0 && hdist[k - 1] < bd) { bd = hdist[k - 1]; best = k - 1; } if (kx < HG - 1 && hdist[k + 1] < bd) { bd = hdist[k + 1]; best = k + 1; }
      if (k >= HG && hdist[k - HG] < bd) { bd = hdist[k - HG]; best = k - HG; } if (k < HN - HG && hdist[k + HG] < bd) { bd = hdist[k + HG]; best = k + HG; }""",
"""      if (kx > 0 && hdist[k - 1] < bd && same(k, k - 1)) { bd = hdist[k - 1]; best = k - 1; } if (kx < HG - 1 && hdist[k + 1] < bd && same(k, k + 1)) { bd = hdist[k + 1]; best = k + 1; }
      if (k >= HG && hdist[k - HG] < bd && same(k, k - HG)) { bd = hdist[k - HG]; best = k - HG; } if (k < HN - HG && hdist[k + HG] < bd && same(k, k + HG)) { bd = hdist[k + HG]; best = k + HG; }""")
rep("if (x > -HALF && x < HALF && y > -HALF && y < HALF && ok(x, y)) { const i = alloc();",
    "if (x > -HALF && x < HALF && y > -HALF && y < HALF && ok(x, y) && lab[nav(x, y)] === blab[k]) { const i = alloc();")
rep("    S.nw = k; S.wallsDirty = false; S.fresh = true; S.safeDirty = true;", "    S.nw = k; S.wallsDirty = false; S.fresh = true; S.safeDirty = true; S.labDirty = true;")
open('/home/claude/outbreak.html','w').write(s)
print('ok')
