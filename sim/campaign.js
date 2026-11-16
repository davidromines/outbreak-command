// Runs one full roguelite campaign (up to 4 stages) with a persona, on a real map pack, mirroring the game's rules.
const path = require('path'), fs = require('fs');
const { makeSim, CFG } = require('./core.js');
const { applyKnobs } = require('./knobs.js');
const { loadPack } = require('./mappack.js');
const { Persona } = require('./persona.js');
const TOOL_OF = { drop: 'drop', apc: 'apc', turret: 'turret', sniper: 'sniper', mortar: 'mortar', howitzer: 'howitzer', ship: 'ship', missile: 'ship', bomb: 'bomb', precision: 'precision', strafe: 'strafe', napalm: 'firebomb', gunship: 'heli', nuke: 'nuke', wall: 'wall', garrison: 'garrison', zone: 'zone', water: 'water', cmd: 'cmd' };
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function synthCity(N, RES) { const g = new Uint8Array(N * N), h = new Uint8Array(N * N), half = N * RES / 2; // fallback when no map pack exists
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const X = x * RES - half, Y = y * RES - half, mx = ((X % 250) + 250) % 250, my = ((Y % 80) + 80) % 80;
    let v = (mx < 18 || my < 14) ? 1 : 2; if (X > 900 && X < 1150) v = (((Y % 600) + 600) % 600 < 20) ? 1 : 16; g[x + y * N] = v; if (v === 2) h[x + y * N] = Math.hypot(X, Y) < 2000 ? 60 : 20; } return { g, h }; }
function allowedTools(C, k, blueprints) { const s = new Set(C.CAMPAIGN.START_TOOLS.concat(blueprints || [])); if (k >= 1) C.CAMPAIGN.TOOLS.forEach((t) => { if (t.id !== 'nuke' || k >= 2) s.add(t.id); }); 
  const kinds = new Set(); for (const [kind, tool] of Object.entries(TOOL_OF)) if (s.has(tool)) kinds.add(kind); return kinds; }
function shop(run, C, skill, rng, k) { const SH = C.SHOP, U = C.UPGRADES, order = skill === 'expert' ? ['damage', 'reload', 'range', 'ammo', 'bigdrop', 'logistics', 'income'] : skill === 'average' ? ['damage', 'ammo', 'reload', 'bigdrop', 'range'] : Object.keys(U).sort(() => rng() - 0.5);
  const bought = []; let guard = 20;
  while (guard-- > 0) { // alternate: an upgrade if affordable, else cash
    let did = false;
    if (skill !== 'novice' || rng() < 0.5) for (const id of order) { const lv = run.up[id] || 0; if (!U[id] || lv >= U[id].max) continue; const cost = SH.UPGRADE_BASE + SH.UPGRADE_STEP * lv; if (run.sp >= cost) { run.sp -= cost; run.up[id] = lv + 1; bought.push(id); did = true; break; } }
    if (!did) { const cash = SH.SUPPLIES.find((s) => s.id === 'cash'); if (run.sp >= cash.cost && (run.supplies.cash || 0) < cash.max) { run.sp -= cash.cost; run.supplies.cash = (run.supplies.cash || 0) + 1; run.bonus += SH.CASH_PER; bought.push('cash'); did = true; } }
    if (!did && k >= 0) { for (const id of ['bomb', 'heli']) { const it = SH.SUPPLIES.find((s) => s.id === id); if (run.sp >= it.cost && (run.supplies[id] || 0) < it.max) { run.sp -= it.cost; run.supplies[id] = (run.supplies[id] || 0) + 1; bought.push(id); did = true; break; } } }
    if (!did) break; }
  return bought; }
function runCampaign(job, packDir) {
  const rng = mulberry32(job.seed >>> 0); Math.random = rng; // the sim uses Math.random: make every run reproducible
  const C = applyKnobs(CFG, job.mults), CP = C.CAMPAIGN, ST = CP.STAGES, dt = job.dt || 0.1, out = { id: job.id, city: job.city, skill: job.skill, style: job.style, stages: [] };
  const run = { bonus: 0, seed: null, seedBg: null, strain: null, up: {}, sp: 0, supplies: {} };
  const maxStage = Math.min(ST.length, job.maxStage || ST.length);
  for (let k = 0; k < maxStage; k++) { const st = ST[k], t0 = Date.now();
    const cfg = Object.assign({}, C, { AREA: st.area, NAV_RES: st.res, HUMANS: st.humans, START_BUDGET: st.budget + run.bonus, INCOME: st.income, RANDOM: Object.assign({}, C.RANDOM, { ZOMBIES_PER_SITE: st.zps }) });
    const S = makeSim(cfg); S.regionR = st.R; S.infect = C.HORDE.INFECT_STAGE[k]; S.fixedStrain = run.strain; S.siteCount = Math.round(st.sites[0] + rng() * (st.sites[1] - st.sites[0]));
    const pf = packDir && job.city !== 'synthetic' ? path.join(packDir, job.city + '_s' + (k + 1) + '.ocmap.gz') : null;
    let mapSrc = 'synthetic';
    if (pf && fs.existsSync(pf)) { mapSrc = 'pack'; const P = loadPack(pf); if (P.hdr.N !== S.N) throw new Error('pack ' + pf + ' has N=' + P.hdr.N + ' but stage needs ' + S.N);
      S.setWalk(P.g, P.h); if (P.hdr.en) S.setElevation(P.elev, P.hdr.en, P.hdr.er); S.setBuildings(P.fid, P.hdr.nf); }
    else { const c = synthCity(S.N, S.RES); S.setWalk(c.g, c.h); S.setBuildings(new Int32Array(S.N * S.N).fill(-1), 0); }
    S.up = Object.assign({}, run.up); if (S.applyUpgrades) S.applyUpgrades();
    S.free.bomb += run.supplies.bomb || 0; S.free.heli += run.supplies.heli || 0; run.supplies = {};
    run.strain = S.strain; S.seed = run.seed; S.seedBg = run.seedBg;
    const persona = new Persona(S, C, { skill: job.skill, style: job.style, allowed: allowedTools(C, k, job.blueprints), rng });
    // planning: a few blind preparations, then the outbreak starts
    const budget0 = S.budget; for (let i = 0; i < 3; i++) S.step(dt);
    persona.observe(); for (let i = 0; i < 8; i++) { persona.nextDecide = 0; persona.tick(true); }
    S.startOutbreak();
    let reason = 'time', minMargin = 1, steps = 0; const per = Math.round(1 / dt);
    for (let sec = 1; sec <= st.time; sec++) { for (let i = 0; i < per; i++) { S.step(dt); steps++; } persona.tick(false);
      const alive = S.allH / Math.max(1, S.allH0); minMargin = Math.min(minMargin, alive - st.bar);
      if (S.allZ === 0) { reason = 'contained'; break; } if (S.allH < 1) { reason = 'wipe'; break; } if (alive < st.bar) { reason = 'bar'; break; } }
    const alive = S.allH / Math.max(1, S.allH0), stars = CP.TIERS.filter((t) => alive >= t).length, contained = reason === 'contained';
    const ps = persona.summary();
    out.stages.push({ stage: k + 1, map: mapSrc, alive: +alive.toFixed(4), reason, stars, contained, t: Math.round(S.time), bar: st.bar, minMargin: +minMargin.toFixed(4), kills: S.kills, budget0, unspent: Math.round(S.budget), spent: Math.round(S.spent), pop: Math.round(S.allH0), zEnd: Math.round(S.allZ), actions: ps.actions, spend: ps.spend, msStep: +((Date.now() - t0) / Math.max(1, steps)).toFixed(2), sec: Math.round((Date.now() - t0) / 1000) });
    if (reason === 'bar' || reason === 'wipe') { out.result = 'fell'; out.lastStage = k + 1; return out; }
    if (k === ST.length - 1) { out.result = contained ? 'won' : 'lost_final'; out.lastStage = k + 1; return out; }
    if (k + 1 >= maxStage) { out.result = 'stopped'; out.lastStage = k + 1; return out; }
    // between stages: carry money, seed the next outbreak, earn and spend supply points
    const nx = ST[k + 1], SH = C.SHOP;
    run.bonus = Math.floor(S.budget * CP.BUDGET_CARRY);
    run.seed = contained ? null : Array.from(S.zombieSample(Math.min(nx.seedCap, Math.ceil(S.nz * CP.SEED_SHARE))), (v) => Math.round(v));
    run.seedBg = contained ? null : S.hordeSample(Math.min(C.HORDE.SEED_CAP[k + 1] || 0, S.bgZ * CP.SEED_SHARE));
    const sp = Math.round(alive * SH.SP_ALIVE) + stars * SH.SP_STAR + (contained ? SH.SP_CONTAIN : 0) + Math.min(SH.SP_KILLS_MAX, Math.floor(S.kills / SH.SP_KILLS)) + SH.SP_STAGE;
    run.sp += sp; out.stages[k].sp = sp; out.stages[k].bought = shop(run, C, job.skill, rng, k);
  }
  out.result = out.result || 'stopped'; return out;
}
module.exports = { runCampaign, mulberry32 };
