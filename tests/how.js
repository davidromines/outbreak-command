const mk = require('./simmod.js'), C = mk.CFG; let seed = 5; Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const S = mk.makeSim(Object.assign({}, C, { AREA: 1600, NAV_RES: 3, HUMANS: 2000, MAX_HUMANS: 60000 })); S.regionR = 650; S.fixedStrain = { speed: 1, health: 1, reach: 1 }; S.siteCount = 2;
const N = S.N, g = new Uint8Array(N * N), h = new Uint8Array(N * N); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const X = x * 3 - S.HALF, Y = y * 3 - S.HALF, v = ((((X % 250) + 250) % 250) < 18 || (((Y % 80) + 80) % 80) < 14) ? 1 : 2; g[x + y * N] = v; if (v === 2) h[x + y * N] = 40; }
S.setWalk(g, h); S.budget = 1e5; console.log('placed', S.addHowitzer(0, 0), 'guns', S.nm, 'budget spent', 1e5 - S.budget);
S.startOutbreak(); let salvos = {}, k0 = 0;
for (let t = 1; t <= 180; t++) { for (let k = 0; k < 30; k++) { const before = S.shells.length; S.step(1 / 30); const add = S.shells.length - before; if (add > 0) salvos[add] = (salvos[add] || 0) + 1; } }
console.log('shells added per step (count:times)', JSON.stringify(salvos), 'kills', S.kills, 'guns left', S.nm);
