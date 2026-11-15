const mk = require('./simmod.js'), C = mk.CFG;
for (const [lab, h, roof] of [['street', 30, false], ['roof 15 m', 15, true], ['roof 40 m', 40, true], ['roof 80 m', 80, true]]) {
  const res = [];
  for (let sd = 0; sd < 4; sd++) { let seed = 11 + sd * 97; Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const S = mk.makeSim(Object.assign({}, C, { AREA: 1600, HUMANS: 2000, START_BUDGET: 1e6, HORDE: Object.assign({}, C.HORDE, { ON: false }) }));
    const N = S.N, g = new Uint8Array(N * N), hh = new Uint8Array(N * N); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const X = x * S.RES - S.HALF, Y = y * S.RES - S.HALF, v = ((((X % 100) + 100) % 100) < 16 || (((Y % 60) + 60) % 60) < 14) ? 1 : 2; g[x + y * N] = v; if (v === 2) hh[x + y * N] = (Math.abs(X - 58) < 42 && Math.abs(Y - 37) < 23) ? h : 12; }
    S.setWalk(g, hh); const r = S.addSnipers(roof ? 58 : 58, roof ? 37 : 7); if (!roof && r === 'roof') throw 'bad';
    S.planning = false; S.siteCount = 1; S.fixedStrain = { speed: 1, health: 1, reach: 1 }; S.planSites = [{ x: 400, y: 7, cnt: 250 }]; S.startOutbreak();
    let sn = 0, rd = 0; for (let i = 0; i < S.n; i++) if (S.type[i] === 3 && S.cls[i] === 1) { sn++; rd += S.rounds[i]; }
    for (let t = 0; t < 30 * 120; t++) S.step(1 / 30);
    let left = 0; for (let i = 0; i < S.n; i++) if (S.type[i] === 3 && S.cls[i] === 1) left++;
    res.push({ placed: r, rounds: rd / sn, kills: S.kills, alive: left }); }
  console.log(lab.padEnd(10), '| placed as', res[0].placed === 'roof' ? 'roof' : 'street', '| rounds each', res[0].rounds, '| kills in 2 min', res.map((r) => r.kills).join(','), '| snipers left', res.map((r) => r.alive).join(','));
}
