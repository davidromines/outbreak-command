// Balance sweep: node sweep.js <configName> <seeds> <bot>
// Benchmark: stage-1-sized city, one outbreak of 60 zombies, average strain, 5 minutes.
// bot 'one' = a single 30-trooper drop next to the outbreak (David's "start with one drop" case)
// bot 'full' = stage-1 budget ($1,200 + income), a new drop wherever zombies are, every 10 s
const mk = require('./simmod.js'); const C0 = mk.CFG;
const name = process.argv[2] || 'base', seeds = +process.argv[3] || 4, bot = process.argv[4] || 'full';
const W = JSON.parse(JSON.stringify(C0.WEAPONS)), K = JSON.parse(JSON.stringify(C0.ZOMBIE_KINDS));
const V = {
  base: {},
  zspeed80: { kinds: K.map((k) => ({ ...k, speed: k.speed * 0.8 })) },      // undo the +25%
  zspeed50: { kinds: K.map((k) => ({ ...k, speed: k.speed * 0.5 })) },
  zhp50: { ZOMBIE_HEALTH: 30 },
  zhp200: { ZOMBIE_HEALTH: 120 },
  reload50: { w: { trooper: { reload: 5 } } },
  reload25: { w: { trooper: { reload: 2.5 } } },
  mag2x: { w: { trooper: { mag: 10 } } },
  dmg2x: { w: { trooper: { damage: 20 } } },
  ammo2x: { w: { trooper: { ammo: 180 } } },
  reach75: { INFECT_RADIUS: 1.65 },
  flee125: { HUMAN_FLEE_SPEED: 4.0 },
  hp40: { ZOMBIE_HEALTH: 40 },
  inf02: { HORDE: Object.assign({}, C0.HORDE, { INFECT: 0.02 }) },
  inf01: { HORDE: Object.assign({}, C0.HORDE, { INFECT: 0.01 }) },
  c07: { HORDE: Object.assign({}, C0.HORDE, { INFECT: 0.07 }) },
  c05: { HORDE: Object.assign({}, C0.HORDE, { INFECT: 0.05 }) },
  c10: { HORDE: Object.assign({}, C0.HORDE, { INFECT: 0.1 }) },
  c20: { HORDE: Object.assign({}, C0.HORDE, { INFECT: 0.2 }) },
  inf025: { HORDE: Object.assign({}, C0.HORDE, { INFECT: 0.025 }) },
  inf03: { HORDE: Object.assign({}, C0.HORDE, { INFECT: 0.03 }) },
  inf015: { HORDE: Object.assign({}, C0.HORDE, { INFECT: 0.015 }) },
  inf005: { HORDE: Object.assign({}, C0.HORDE, { INFECT: 0.005 }) },
  inf01m03: { HORDE: Object.assign({}, C0.HORDE, { INFECT: 0.01, MOVE: 0.03 }) },
  noHorde: { HORDE: Object.assign({}, C0.HORDE, { ON: false }) },
  hp40s85: { ZOMBIE_HEALTH: 40, kinds: K.map((k) => ({ ...k, speed: k.speed * 0.85 })) },
  hp30s85: { ZOMBIE_HEALTH: 30, kinds: K.map((k) => ({ ...k, speed: k.speed * 0.85 })) },
  hp40s85r5: { ZOMBIE_HEALTH: 40, kinds: K.map((k) => ({ ...k, speed: k.speed * 0.85 })), w: { trooper: { reload: 5 } } },
  hp30s70: { ZOMBIE_HEALTH: 30, kinds: K.map((k) => ({ ...k, speed: k.speed * 0.7 })) },
};
const v = V[name]; if (!v) { console.log('unknown', name); process.exit(1); }
const cfg = Object.assign({}, C0, { AREA: 1600, NAV_RES: 3, HUMANS: 6000, MAX_HUMANS: 60000, START_BUDGET: 1200, INCOME: 5,
  RANDOM: Object.assign({}, C0.RANDOM, { ZOMBIES_PER_SITE: [60, 60], POPULATION: [0.8, 0.8] }) }, v);
cfg.WEAPONS = JSON.parse(JSON.stringify(W)); if (v.w) for (const k in v.w) Object.assign(cfg.WEAPONS[k], v.w[k]);
if (v.kinds) cfg.ZOMBIE_KINDS = v.kinds;
function city(S) { const N = S.N, R = S.RES, g = new Uint8Array(N * N), h = new Uint8Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const X = x * R - S.HALF, Y = y * R - S.HALF, mx = ((X % 250) + 250) % 250, my = ((Y % 80) + 80) % 80;
    const v = (mx < 18 || my < 14) ? 1 : 2; g[x + y * N] = v; if (v === 2) h[x + y * N] = 40; } return { g, h }; }
const out = [];
for (let sd = 0; sd < seeds; sd++) {
  let seed = 1234 + sd * 7919; Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const S = mk.makeSim(cfg); S.regionR = 650; S.fixedStrain = { speed: 1, health: 1, reach: 1 }; S.siteCount = 1;
  const c = city(S); S.setWalk(c.g, c.h); for (let i = 0; i < 30; i++) S.step(1 / 30);
  S.startOutbreak(); const o = S.planSites[0] || S.outbreaks[0] || { x: 0, y: 0 }; const ox = o.x !== undefined ? o.x : o[0], oy = o.y !== undefined ? o.y : o[1];
  let contained = -1, half = -1, dropped = 0;
  if (bot === 'one') { S.drop(ox - 40, oy - 60, ox + 40, oy - 60); dropped = 1; }
  for (let sec = 1; sec <= 300; sec++) {
    for (let i = 0; i < 30; i++) S.step(1 / 30);
    if (bot === 'full' && sec % 10 === 1) { while (S.budget >= S.dropCost) { let bi = -1, bd = 1e18;
        for (let i = 0; i < S.n; i += 3) if (S.type[i] === 2 && !S.sub[i]) { const d = (S.px[i] - ox) ** 2 + (S.py[i] - oy) ** 2 + Math.random() * 4e4; if (d < bd) { bd = d; bi = i; } }
        if (bi < 0) break; const x = S.px[bi], y = S.py[bi], a = Math.random() * 6.283; S.drop(x + Math.cos(a) * 50 - 30, y + Math.sin(a) * 50, x + Math.cos(a) * 50 + 30, y + Math.sin(a) * 50); dropped++;
        if (dropped % 3 === 0) break; } }
    if (half < 0 && S.allH < S.allH0 / 2) half = sec;
    if (S.allZ === 0) { contained = sec; break; } if (S.allH < 1) break; }
  if (process.env.DBG) console.error('end', S.nz, Math.round(S.bgZ), S.time|0, 'mat', S.matCount, 'demat', S.dematCount, 'bgH lost', Math.round(S.bgH0 - S.bgH), 'street civ', S.humans0, '->', S.nh, 'n', S.n);
  out.push({ alive: S.allH / S.allH0, contained, half, kills: S.kills, lost: S.lost, drops: dropped });
}
const avg = (f) => out.reduce((a, r) => a + f(r), 0) / out.length;
console.log(JSON.stringify({ name, bot, contain: out.filter((r) => r.contained > 0).length + '/' + out.length, alive: Math.round(avg((r) => r.alive) * 100),
  tContain: Math.round(avg((r) => r.contained > 0 ? r.contained : 0) / Math.max(1, out.filter((r) => r.contained > 0).length) * out.length),
  half: out.map((r) => r.half).join(','), killsPerTrooper: +(avg((r) => r.kills) / Math.max(1, avg((r) => r.drops) * 30)).toFixed(2), lostShare: Math.round(avg((r) => r.lost / Math.max(1, r.drops * 30)) * 100) }));
