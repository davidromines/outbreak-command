// Balance knobs: each scales a group of game settings by a multiplier m (1 = the game as shipped).
// lo/hi = the range the experiments explore. apply(C, m) edits a deep copy of CFG.
const W = (name) => (C, m, key) => { C.WEAPONS[name][key] *= m; };
const KNOBS = [
  // zombies
  { id: 'z_speed', lo: 0.75, hi: 1.25, apply: (C, m) => C.ZOMBIE_KINDS.forEach((k) => k.speed *= m) },
  { id: 'z_health', lo: 0.6, hi: 1.5, apply: (C, m) => { C.ZOMBIE_HEALTH *= m; } },
  { id: 'z_runner_share', lo: 0.5, hi: 1.5, apply: (C, m) => { const r = C.ZOMBIE_KINDS[1], w = C.ZOMBIE_KINDS[0], old = r.share; r.share = Math.min(0.5, old * m); w.share += old - r.share; } },
  { id: 'z_sites', lo: 0.6, hi: 1.6, apply: (C, m) => C.CAMPAIGN.STAGES.forEach((s) => { s.zps = s.zps.map((v) => Math.max(1, Math.round(v * m))); }) },
  // horde
  { id: 'h_infect', lo: 0.5, hi: 1.6, apply: (C, m) => { C.HORDE.INFECT_STAGE = C.HORDE.INFECT_STAGE.map((v) => v * m); } },
  { id: 'h_breakin', lo: 0.5, hi: 1.6, apply: (C, m) => { C.HORDE.BREAKIN_CAP = Math.max(3, Math.round(C.HORDE.BREAKIN_CAP * m)); } },
  { id: 'h_move', lo: 0.6, hi: 1.5, apply: (C, m) => { C.HORDE.MOVE *= m; } },
  { id: 'h_spill', lo: 0.5, hi: 1.6, apply: (C, m) => { C.HORDE.SPILL = Math.min(0.9, C.HORDE.SPILL * m); } },
  { id: 'h_people', lo: 0.6, hi: 1.5, apply: (C, m) => { C.HORDE.M2_PER_PERSON /= m; } },
  { id: 'h_seed', lo: 0.5, hi: 1.6, apply: (C, m) => { C.HORDE.SEED_CAP = C.HORDE.SEED_CAP.map((v) => Math.round(v * m)); C.CAMPAIGN.SEED_SHARE = Math.min(0.8, C.CAMPAIGN.SEED_SHARE * m); } },
  // infantry and ground units
  { id: 'trooper_dmg', lo: 0.6, hi: 1.5, apply: (C, m) => W('trooper')(C, m, 'damage') },
  { id: 'trooper_rate', lo: 0.6, hi: 1.5, apply: (C, m) => { C.WEAPONS.trooper.reload /= m; } },
  { id: 'trooper_ammo', lo: 0.6, hi: 1.6, apply: (C, m) => W('trooper')(C, m, 'ammo') },
  { id: 'drop', lo: 0.6, hi: 1.6, apply: (C, m) => { C.DROP_COST /= m; } },
  { id: 'apc', lo: 0.6, hi: 1.6, apply: (C, m) => { C.APC_HP *= m; C.WEAPONS.apc.ammo *= m; } },
  { id: 'turret', lo: 0.6, hi: 1.6, apply: (C, m) => { C.TURRET_COST /= m; C.TURRET_HP *= m; } },
  { id: 'sniper', lo: 0.6, hi: 1.6, apply: (C, m) => { C.SNIPER_COST /= m; C.WEAPONS.sniper.damage *= m; } },
  { id: 'garrison', lo: 0.6, hi: 1.6, apply: (C, m) => { C.GARRISON_COST_PER_TROOP /= m; C.GARRISON_HP *= m; } },
  { id: 'walls', lo: 0.5, hi: 2.0, apply: (C, m) => { C.WALL_HP *= m; C.GATE_HP *= m; } },
  // artillery and navy
  { id: 'mortar', lo: 0.6, hi: 1.6, apply: (C, m) => { C.MORTAR_COST /= m; C.MORTAR_BLAST *= Math.sqrt(m); } },
  { id: 'howitzer', lo: 0.6, hi: 1.6, apply: (C, m) => { C.HOWITZER_COST /= m; C.WEAPONS.howitzer.interval /= m; } },
  { id: 'ship', lo: 0.6, hi: 1.6, apply: (C, m) => { C.SHIP_COST /= m; C.WEAPONS.ship.interval /= m; C.MISSILE_BLAST *= Math.sqrt(m); } },
  // air
  { id: 'bomb', lo: 0.6, hi: 1.6, apply: (C, m) => { C.BOMB_COST /= m; C.BOMB_BLAST *= Math.sqrt(m); } },
  { id: 'precision', lo: 0.6, hi: 1.6, apply: (C, m) => { C.PRECISION_COST /= m; } },
  { id: 'strafe', lo: 0.6, hi: 1.6, apply: (C, m) => { C.STRAFE_COST /= m; } },
  { id: 'napalm', lo: 0.6, hi: 1.6, apply: (C, m) => { C.FIRE_COST /= m; C.FIRE_SPREAD *= m; } },
  { id: 'gunship', lo: 0.6, hi: 1.6, apply: (C, m) => { C.HELI_COST /= m; C.HELI_TIME *= m; } },
  { id: 'nuke', lo: 0.6, hi: 1.6, apply: (C, m) => { C.NUKE_COST /= m; } },
  // economy and campaign
  { id: 'budget', lo: 0.6, hi: 1.8, apply: (C, m) => C.CAMPAIGN.STAGES.forEach((s) => { s.budget = Math.round(s.budget * m); }) },
  { id: 'income', lo: 0.5, hi: 2.0, apply: (C, m) => C.CAMPAIGN.STAGES.forEach((s) => { s.income *= m; }) },
  { id: 'stage_time', lo: 0.7, hi: 1.4, apply: (C, m) => C.CAMPAIGN.STAGES.forEach((s) => { s.time = Math.round(s.time * m); }) },
  { id: 'fall_line', lo: 0.5, hi: 1.6, apply: (C, m) => C.CAMPAIGN.STAGES.forEach((s) => { s.bar = Math.min(0.5, s.bar * m); }) },
  { id: 'sp_reward', lo: 0.5, hi: 2.0, apply: (C, m) => { for (const k of ['SP_ALIVE', 'SP_STAR', 'SP_CONTAIN', 'SP_KILLS_MAX', 'SP_STAGE']) C.SHOP[k] *= m; } },
];
// unit cube [0,1] -> log-scale multiplier between lo and hi (0.5 maps to the geometric middle; 1.0 lies inside every range)
const toMult = (k, u) => Math.exp(Math.log(k.lo) + u * (Math.log(k.hi) - Math.log(k.lo)));
function applyKnobs(baseCfg, mults) { const C = JSON.parse(JSON.stringify(baseCfg)); for (const k of KNOBS) { const m = mults && mults[k.id]; if (m != null && m !== 1) k.apply(C, m); } return C; }
module.exports = { KNOBS, toMult, applyKnobs };
