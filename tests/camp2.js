// Full campaign with the v32 rules (horde, rising fall line). node camp2.js <bot> <runs>
const mk = require('./simmod.js'), C = mk.CFG, CP = C.CAMPAIGN, ST = CP.STAGES;
const bot = process.argv[2] || 'avg', runs = +process.argv[3] || 1, PERIOD = { avg: 6, good: 3 }[bot], BOMBS = bot === 'good';
function city(N, RES) { const g = new Uint8Array(N * N), h = new Uint8Array(N * N), half = N * RES / 2;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const X = x * RES - half, Y = y * RES - half, mx = ((X % 250) + 250) % 250, my = ((Y % 80) + 80) % 80;
    let v = (mx < 18 || my < 14) ? 1 : 2; if (X > 900 && X < 1150) v = (((Y % 600) + 600) % 600 < 20) ? 1 : 16; if (Y < -2600 && Y > -3000) v = 16;
    const far = Math.hypot(X, Y); g[x + y * N] = v; if (v === 2) h[x + y * N] = far < 2000 ? 60 : far < 5000 ? 25 : 10; } return { g, h }; }
for (let r = 0; r < runs; r++) {
  let seed = null, seedBg = null, strain = null, bonus = 0, crates = 0; const log = [];
  for (let k = 0; k < ST.length; k++) { const st = ST[k], t0 = Date.now();
    const S = mk.makeSim(Object.assign({}, C, { AREA: st.area, NAV_RES: st.res, HUMANS: st.humans, START_BUDGET: st.budget + bonus, INCOME: st.income, RANDOM: Object.assign({}, C.RANDOM, { ZOMBIES_PER_SITE: st.zps }) }));
    S.regionR = st.R; S.fixedStrain = strain; S.siteCount = Math.round(st.sites[0] + Math.random() * (st.sites[1] - st.sites[0]));
    const c = city(S.N, S.RES); S.setWalk(c.g, c.h); strain = S.strain; S.seed = seed; S.seedBg = seedBg; for (let i = 0; i < 30; i++) S.step(1 / 30); S.startOutbreak();
    let reason = 'time';
    for (let sec = 1; sec <= st.time; sec++) { for (let i = 0; i < 30; i++) S.step(1 / 30);
      if (sec % PERIOD === 0) { let spend = S.budget * 0.9;
        if (BOMBS && sec % 15 === 0 && S.nz > 200 && S.budget >= C.BOMB_COST + S.dropCost) { // carpet-bomb the densest zombie block
          const G = 50, cnt = new Map(); for (let i = 0; i < S.n; i += 2) if (S.type[i] === 2) { const kk = Math.floor(S.px[i] / G) + ',' + Math.floor(S.py[i] / G); cnt.set(kk, (cnt.get(kk) || 0) + 1); }
          let bk = null, bc = 0; for (const [kk, v] of cnt) if (v > bc) { bc = v; bk = kk; } if (bk) { const [gx, gy] = bk.split(',').map(Number); S.airstrike(gx * G - 10, gy * G + 25, gx * G + 60, gy * G + 25); spend -= C.BOMB_COST; } }
        while (spend >= S.dropCost && S.budget >= S.dropCost) { let bi = -1, bd = 1e18;
          for (let i = 0; i < S.n; i += 5) if (S.type[i] === 2 && !S.sub[i]) { const d = S.px[i] * S.px[i] + S.py[i] * S.py[i] + Math.random() * 4e5; if (d < bd) { bd = d; bi = i; } }
          if (bi < 0) break; const x = S.px[bi], y = S.py[bi], L = Math.hypot(x, y) || 1, tx = x - x / L * 60, ty = y - y / L * 60; S.drop(tx - 40, ty, tx + 40, ty); spend -= S.dropCost; } }
      const alive = S.allH / S.allH0; if (S.allZ === 0) { reason = 'contained'; break; } if (S.allH < 1) { reason = 'wipe'; break; } if (alive < st.bar) { reason = 'bar'; break; } }
    const alive = S.allH / S.allH0, stars = CP.TIERS.filter((t) => alive >= t).length, contained = reason === 'contained';
    log.push({ stage: k + 1, alive: +(alive * 100).toFixed(1), reason, t: Math.round(S.time), pop: Math.round(S.allH0), zEnd: Math.round(S.allZ), msStep: +((Date.now() - t0) / (S.time * 30)).toFixed(1) });
    if (reason === 'bar' || reason === 'wipe') break; if (k === ST.length - 1) break;
    const nx = ST[k + 1]; bonus = stars * CP.STAR_CASH + (contained ? CP.CONTAIN_CASH : 0) + Math.floor(S.budget * CP.BUDGET_CARRY);
    seed = contained ? null : S.zombieSample(Math.min(nx.seedCap, Math.ceil(S.nz * CP.SEED_SHARE))); seedBg = contained ? null : S.hordeSample(Math.min(C.HORDE.SEED_CAP[k + 1] || 0, S.bgZ * CP.SEED_SHARE));
  }
  console.log(bot, JSON.stringify(log));
}
