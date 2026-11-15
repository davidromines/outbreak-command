const mk = require('./simmod.js'), C = mk.CFG; let seed = 9; Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const S = mk.makeSim(Object.assign({}, C, { AREA: 3600, NAV_RES: 3, HUMANS: 6000, MAX_HUMANS: 60000 })); S.regionR = 2000; S.fixedStrain = { speed: 1, health: 1, reach: 1 }; S.siteCount = 3;
const N = S.N, g = new Uint8Array(N * N), h = new Uint8Array(N * N), half = N * 3 / 2;
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const X = x * 3 - half, Y = y * 3 - half; let v = ((((X % 250) + 250) % 250) < 18 || (((Y % 80) + 80) % 80) < 14) ? 1 : 2; if (X > 900 && X < 1150) v = 16; g[x + y * N] = v; if (v === 2) h[x + y * N] = 40; }
S.setWalk(g, h); S.budget = 1e6; console.log('ship placed', S.addShip(1000, 0));
S.startOutbreak(); let shots = 0, far = 0;
for (let t = 1; t <= 240; t++) for (let k = 0; k < 30; k++) { const n0 = S.shells.length; S.step(1 / 30); for (let q = n0; q < S.shells.length; q++) { const sh = S.shells[q]; if (sh.sx !== undefined) { shots++; if (Math.hypot(sh.x - sh.sx, sh.y - sh.sy) > 1500) far++; } } }
console.log('ship shells in 4 min', shots, 'beyond old 1500 m range', far, 'horde left', Math.round(S.bgZ), 'kills', S.kills);
