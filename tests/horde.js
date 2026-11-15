const mk = require('./simmod.js'), C = mk.CFG; const [area, res, R, hum, secs] = (process.argv[2] || '1600,3,650,6000,300').split(',').map(Number);
let seed = 7; Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const S = mk.makeSim(Object.assign({}, C, { AREA: area, NAV_RES: res, HUMANS: hum, MAX_HUMANS: 60000 })); S.regionR = R; S.fixedStrain = { speed: 1, health: 1, reach: 1 }; S.siteCount = 1;
const N = S.N, g = new Uint8Array(N * N), h = new Uint8Array(N * N); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const X = x * res - S.HALF, Y = y * res - S.HALF, v = ((((X % 250) + 250) % 250) < 18 || (((Y % 80) + 80) % 80) < 14) ? 1 : 2; g[x + y * N] = v; if (v === 2) h[x + y * N] = 40; }
S.setWalk(g, h); console.log('people: on the street', S.humans0, '| sheltering', Math.round(S.bgH0), '| total', Math.round(S.allH0));
S.startOutbreak(); const t0 = Date.now();
for (let t = 1; t <= secs; t++) { for (let k = 0; k < 30; k++) S.step(1 / 30);
  if (t % 60 === 0) console.log('t', t, 's | street civ', S.nh, '| zombie dots', S.nz, '| sheltering', Math.round(S.bgH), '| horde', Math.round(S.bgZ), '| alive', (100 * S.allH / S.allH0).toFixed(1) + '%'); }
console.log('ms/step', ((Date.now() - t0) / (secs * 30)).toFixed(1));
