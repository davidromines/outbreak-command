// Campaign test: node camp.js <bot> <runs> [seed]
// 4 growing stages on a synthetic city (street grid, a river with bridges), outbreak carried over between stages.
const mk = require('./simmod.js');
const STAGES = require('./stages.json');
const bot = process.argv[2] || 'avg', runs = +process.argv[3] || 1, maxStage = +process.argv[4] || 4;
const PERIOD = { poor: 15, avg: 6, good: 2 }[bot] || 6, SHARE = { poor: 0.5, avg: 0.8, good: 1 }[bot] || 0.8;
function city(N, RES) {
  const g = new Uint8Array(N * N), h = new Uint8Array(N * N), half = N * RES / 2;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const X = x * RES - half, Y = y * RES - half; const mx = ((X % 250) + 250) % 250, my = ((Y % 80) + 80) % 80;
    let v = (mx < 18 || my < 14) ? 1 : 2;
    if (X > 900 && X < 1150) v = (((Y % 600) + 600) % 600 < 20) ? 1 : 16; // river 900 m east of the centre, bridges every 600 m
    if (Y < -2200 && Y > -2500) v = 16;                                   // a bay to the south
    g[x + y * N] = v; if (v === 2) h[x + y * N] = ((Math.floor(X / 250) * 7 + Math.floor(Y / 80) * 3) % 5 === 0) ? 80 : 20;
  }
  return { g, h };
}
const results = [];
for (let run = 0; run < runs; run++) {
  let seed = null, strain = null, bonus = 0; const row = [];
  for (let k = 0; k < Math.min(maxStage, STAGES.length); k++) {
    const st = STAGES[k];
    const S = mk.makeSim(Object.assign({}, mk.CFG, { AREA: st.area, NAV_RES: st.res, HUMANS: st.humans, MAX_HUMANS: 60000, RANDOM: Object.assign({}, mk.CFG.RANDOM, { ZOMBIES_PER_SITE: st.zps }), START_BUDGET: st.budget + bonus, INCOME: st.income }));
    S.regionR = st.R; S.fixedStrain = strain; S.siteCount = Math.round(st.sites[0] + Math.random() * (st.sites[1] - st.sites[0]));
    const c = city(S.N, S.RES); S.setWalk(c.g, c.h); strain = S.strain;
    if (bot === 'good') S.addZone(0, 0, 80);
    S.seed = seed; for (let i = 0; i < 30; i++) S.step(1 / 30);
    S.startOutbreak(); const t0 = Date.now(); let minAlive = 1, contained = false;
    for (let sec = 1; sec <= st.time; sec++) {
      for (let i = 0; i < 30; i++) S.step(1 / 30);
      if (sec % PERIOD === 0) { let spend = S.budget * SHARE;
        while (spend >= S.dropCost && S.budget >= S.dropCost) { let bi = -1, bd = 1e18;
          for (let i = 0; i < S.n; i += 5) if (S.type[i] === 2 && !S.sub[i]) { const d = S.px[i] * S.px[i] + S.py[i] * S.py[i] + Math.random() * 4e5; if (d < bd) { bd = d; bi = i; } }
          if (bi < 0) break; const x = S.px[bi], y = S.py[bi], L = Math.hypot(x, y) || 1, tx = x - x / L * 60, ty = y - y / L * 60;
          S.drop(tx - 40, ty, tx + 40, ty); spend -= S.dropCost; } }
      minAlive = Math.min(minAlive, S.nh / S.humans0);
      if (S.nz === 0) { contained = true; break; } if (S.nh === 0) break; }
    const alive = S.nh / S.humans0;
    row.push({ stage: k + 1, pop: S.humans0, z0: S.zombies0, alive: +alive.toFixed(3), minAlive: +minAlive.toFixed(3), contained, zEnd: S.nz, t: Math.round(S.time), ms: +((Date.now() - t0) / (S.time * 30)).toFixed(1) });
    const tier = alive >= 0.75 ? 3 : alive >= 0.5 ? 2 : alive >= 0.25 ? 1 : 0;
    bonus = tier * 300 + (contained ? 500 : 0);
    const next = STAGES[k + 1]; seed = contained || !next ? null : S.zombieSample(Math.min(next.seedCap, Math.ceil(S.nz * 0.25)));
    if (S.nh === 0 && !contained) break;
  }
  results.push(row); console.log(bot + ' ' + JSON.stringify(row));
}
