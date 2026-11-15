const mk = require(process.argv[2] || './simmod.js'), C = mk.CFG; const seed0 = +(process.argv[3] || 7), area = 1600, res = 3, R = 650;
let seed = seed0; Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const S = mk.makeSim(Object.assign({}, C, { AREA: area, NAV_RES: res, HUMANS: 6000, MAX_HUMANS: 60000 })); S.regionR = R; S.fixedStrain = { speed: 1, health: 1, reach: 1 }; S.siteCount = 1;
const N = S.N, g = new Uint8Array(N * N), h = new Uint8Array(N * N); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const X = x * res - S.HALF, Y = y * res - S.HALF, v = ((((X % 250) + 250) % 250) < 18 || (((Y % 80) + 80) % 80) < 14) ? 1 : 2; g[x + y * N] = v; if (v === 2) h[x + y * N] = 40; }
S.setWalk(g, h); S.budget = 1e7;
const B = [130, 130, 390, 390]; // box
const ok = []; const seg = (x0, y0, x1, y1) => { const L = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(L / 60); for (let k = 0; k < n; k++) ok.push(S.buildWall(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, x0 + (x1 - x0) * (k + 1) / n, y0 + (y1 - y0) * (k + 1) / n)); };
seg(B[0], B[1], B[2], B[1]); seg(B[2], B[1], B[2], B[3]); seg(B[2], B[3], B[0], B[3]); seg(B[0], B[3], B[0], B[1]);
const inBox = (x, y) => x > B[0] + 5 && x < B[2] - 5 && y > B[1] + 5 && y < B[3] - 5;
const boxStat = () => { let p = 0, z = 0; const G = S.HG, HC = S.HC; for (let k = 0; k < G * G; k++) { const x = -S.HALF + (k % G + 0.5) * HC, y = -S.HALF + (((k / G) | 0) + 0.5) * HC; if (inBox(x, y)) { p += S.bgHField[k]; z += S.bgZField[k]; } } return [p, z]; };
S.startOutbreak();
const p0 = boxStat()[0]; let early = null;
const tl = []; for (let t = 1; t <= 300; t++) { for (let k = 0; k < 30; k++) S.step(1 / 30); if (t === 5) early = S.zombieSample(9999);
  if (t % 30 === 0) { const zz = S.zombieSample(99999); let zi = 0; for (let q = 0; q < zz.length; q += 2) if (inBox(zz[q], zz[q + 1])) zi++; tl.push(t + ':w' + S.nw + ':a' + S.areas + ':d' + zi + ':h' + Math.round(boxStat()[1])); } }
console.log(tl.join(' '));
const zs = S.zombieSample(99999); let zin = 0; for (let q = 0; q < zs.length; q += 2) if (inBox(zs[q], zs[q + 1])) zin++;
let startIn = 0; for (let q = 0; q < early.length; q += 2) if (inBox(early[q], early[q + 1])) startIn++;
const [p1, z1] = boxStat();
console.log(JSON.stringify({ walls: ok.filter(Boolean).length + '/' + ok.length, startedInside: startIn, boxPeople0: Math.round(p0), boxPeople300: Math.round(p1), boxHorde: Math.round(z1), dotsInBox: zin, alive: (100 * S.allH / S.allH0).toFixed(1), areas: S.areas }));
