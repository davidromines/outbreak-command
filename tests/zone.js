const mk = require('./simmod.js'), C = mk.CFG;
const S = mk.makeSim(Object.assign({}, C, { AREA: 1200, HUMANS: 1500, START_BUDGET: 1e6, HORDE: Object.assign({}, C.HORDE, { ON: false }) }));
const N = S.N, g = new Uint8Array(N * N); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const X = x * S.RES - S.HALF, Y = y * S.RES - S.HALF; g[x + y * N] = ((((X % 100) + 100) % 100) < 16 || (((Y % 60) + 60) % 60) < 14) ? 1 : 2; }
S.setWalk(g, null); S.addZone(8, 7, 60); S.drop(-40, 7, 40, 7);
S.planning = false; S.siteCount = 1; S.planSites = [{ x: 200, y: 7, cnt: 40 }]; S.fixedStrain = { speed: 1, health: 1, reach: 1 }; S.startOutbreak();
let tB = -1, tR = -1; for (let t = 1; t <= 300; t++) { for (let k = 0; k < 30; k++) S.step(1 / 30); const z = S.zones[0];
  if (tB < 0 && z.breached) tB = t; if (tB > 0 && tR < 0 && !z.breached) tR = t; }
console.log('zone breached at', tB, 's; safe again at', tR, 's; zombies left', S.nz, '| recoveries', S.recoveries || 0);
