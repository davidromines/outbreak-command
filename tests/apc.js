for (const [label, mod] of [['v29 (old)', './simold.js'], ['v30 (new)', './simmod.js']]) {
  const mk = require(mod), res = [];
  for (let sd = 0; sd < 6; sd++) { let seed = 99 + sd * 31; Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const S = mk.makeSim(Object.assign({}, mk.CFG, { AREA: 1200, HUMANS: 1500, START_BUDGET: 1e6 }));
    const N = S.N, R = S.RES, g = new Uint8Array(N * N); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const X = x * R - S.HALF, Y = y * R - S.HALF; g[x + y * N] = ((((X % 100) + 100) % 100) < 16 || (((Y % 60) + 60) % 60) < 14) ? 1 : 2; }
    S.setWalk(g, null); S.addApc(0, 7); let a = 0; while (S.type[a] !== 5) a++;
    S.planning = false; S.siteCount = 1; S.planSites = [{ x: 150, y: 7, cnt: 300 }]; S.fixedStrain = { speed: 1, health: 1, reach: 1 }; S.startOutbreak();
    let life = -1; for (let t = 1; t <= 240; t++) { for (let k = 0; k < 30; k++) S.step(1 / 30); if (life < 0 && S.type[a] !== 5) life = t; }
    res.push({ kills: S.kills, life, turned: S.apcTurned || 0, roundsLeft: S.type[a] === 5 ? S.rounds[a] : 0 }); }
  console.log(label, 'kills', res.map((r) => r.kills).join(','), '| wrecked after (s)', res.map((r) => r.life < 0 ? 'survived' : r.life).join(','), '| crew turned', res.reduce((x, r) => x + r.turned, 0));
}
