const CFG = {
  AREA: 3000,            // play area side length, metres

  // ---- ZOMBIES ----
  ZOMBIE_HEALTH: 40,     // v29 balance pass (was 60): 4 rifle hits instead of 6 — hit points of a standard zombie (each kind and each match's strain multiply this)
  ZOMBIE_KINDS: [        // share = fraction of all zombies, speed in m/s, health = multiplier on ZOMBIE_HEALTH
    { name: 'walker',  share: 0.65, speed: 2.76, health: 1.0 }, // v29 balance pass: v28 speeds x0.85 (still 6% faster than before v28)
    { name: 'runner',  share: 0.20, speed: 5.31, health: 0.7 },
    { name: 'crawler', share: 0.15, speed: 0.95, health: 1.4 }
  ],
  ZOMBIE_WATER_SPEED: 0.35, // m/s walking along the bottom; submerged zombies cannot be targeted
  WATER_COST: 8,         // how many land cells one water cell is "worth" when zombies choose a route

  // ---- HIDDEN, RANDOM PER MATCH (the player sees none of this before pressing Start) ----
  RANDOM: {
    SITES: [2, 6],             // number of outbreak sites
    ZOMBIES_PER_SITE: [60, 220],
    POPULATION: [0.55, 1.0],   // fraction of HUMANS actually in the city
    HOTSPOTS: [3, 9],          // crowded districts
    HOTSPOT_SHARE: 0.55,       // fraction of civilians living in the crowded districts
    HOTSPOT_RADIUS: [120, 420],
    STRAIN_SPEED: [0.85, 1.3], // multiplies every zombie's speed
    STRAIN_HEALTH: [0.75, 1.6],// multiplies every zombie's health
    STRAIN_REACH: [0.8, 1.5]   // multiplies INFECT_RADIUS (how easily it spreads)
  },

  // ---- WEAPONS: damage per hit, seconds between shots, rounds per magazine, reload seconds, total rounds carried, range (m) ----
  WEAPONS: {
    trooper: { damage: 10,  interval: 0.1,  mag: 5,   reload: 5,  ammo: 90,  range: 60 }, // v29: reload 10 s -> 5 s
    sniper:  { damage: 120, interval: 1.2,  mag: 5,   reload: 3, ammo: 30,   range: 250 },
    apc:     { damage: 15,  interval: 0.1,  mag: 20,  reload: 4, ammo: 240,  range: 90 }, // v30: was 600 rounds, 60 per magazine, 2 s reload
    turret:  { damage: 12,  interval: 0.08, mag: 200, reload: 4, ammo: 1000, range: 80 },
    mortar:  { damage: 150, interval: 4,    mag: 1,   reload: 0, ammo: 20,   range: 350 }, // damage is per zombie inside the blast
    howitzer:{ damage: 400, interval: 12,   mag: 1,   reload: 0, ammo: 30,   range: 1500 },
    ship:    { damage: 400, interval: 9,    mag: 1,   reload: 0, ammo: 2000, range: 1500 } // one deck cannon: howitzer-like, slow, lots of shells
  },
  // ---- SOUND (all generated in the browser) ----
  SOUND: {
    VOLUME: 0.7,
    DETAIL: 3,             // loudness of close-up sounds (shots, blasts, groans) against the background layers
    CITY: 0.6,             // loudness of normal city life (traffic, horns, crowds, planes); it fades as civilians are lost
    MAX_PER_FRAME: 24,     // most individual sounds started in one frame
    VOICES: { a10: 2, arty: 4, missile: 3, rifle: 8, sniper: 3, apc: 4, turret: 4, mortar: 3, blast: 5, nuke: 1, heli: 6, scream: 3, fall: 2, alarm: 1, plane: 2, groan: 4 } // most playing at once, per kind
  },

  // ---- CAMPAIGN (roguelite): 4 stages that grow outward from where you start, along the real roads ----
  // R = how far the play region reaches, in metres of travel from the centre (it follows streets and bridges).
  // bar = if the share of civilians still alive drops below this, the run is over.
  // time = seconds you must hold before the outbreak breaks out into the next, bigger stage (contain it sooner to win the stage).
  CAMPAIGN: {
    STAGES: [
      // v29: much faster growth — about 0.9, 8, 40 and 125 km² (each stage 3-9x the last)
      { name: 'Ground zero',   area: 1600,  res: 3, R: 650,  humans: 6000,  time: 300, budget: 1200, income: 5,  sites: [1, 1], zps: [40, 90],   seedCap: 0,    bar: 0.05 },
      { name: 'The district',  area: 3600,  res: 3, R: 2000, humans: 20000, time: 480, budget: 2000, income: 10, sites: [1, 2], zps: [40, 90],   seedCap: 250,  bar: 0.10 },
      { name: 'The city',      area: 8000,  res: 5, R: 4500, humans: 40000, time: 660, budget: 3500, income: 18, sites: [2, 3], zps: [60, 150],  seedCap: 500,  bar: 0.15 },
      { name: 'The metro',     area: 14000, res: 8, R: 8000, humans: 60000, time: 900, budget: 6000, income: 30, sites: [3, 4], zps: [80, 200],  seedCap: 900,  bar: 0.20 }
    ],
    START_TOOLS: ['drop', 'cmd', 'wall', 'gate', 'zone'], // everything else is bought as blueprints at the requisition screen
    TOOLS: [ // id = tool, rarity = how rare its blueprint is
      { id: 'wire', name: 'Razor wire', rarity: 'common' }, { id: 'garrison', name: 'Garrisons', rarity: 'common' },
      { id: 'sniper', name: 'Sniper teams', rarity: 'uncommon' }, { id: 'turret', name: 'Turrets', rarity: 'uncommon' }, { id: 'apc', name: 'APCs', rarity: 'uncommon' },
      { id: 'mortar', name: 'Mortars', rarity: 'uncommon' }, { id: 'heli', name: 'Helicopter gunships', rarity: 'rare' }, { id: 'bomb', name: 'Carpet bombing', rarity: 'rare' },
      { id: 'precision', name: 'Precision bombs', rarity: 'rare' }, { id: 'howitzer', name: 'Howitzers', rarity: 'rare' }, { id: 'ship', name: 'Destroyers + missiles', rarity: 'rare' },
      { id: 'water', name: 'Water bombers', rarity: 'uncommon' }, { id: 'strafe', name: 'A-10 strafing runs', rarity: 'jackpot' }, { id: 'firebomb', name: 'Firebombing', rarity: 'jackpot' }, { id: 'nuke', name: 'Nukes', rarity: 'jackpot' }
    ],
    TIERS: [0.25, 0.5, 0.75],      // share of civilians alive at the end of a stage for 1, 2 and 3 stars
    STAR_CRATES: 1, STAR_CASH: 250, // per star: free crates and cash for the next stage
    CONTAIN_CRATES: 1, CONTAIN_CASH: 500, CONTAIN_SEED: 0, // containing a stage: bonus, and nothing carries over
    SEED_SHARE: 0.25,              // share of the zombies still loose at the end of a stage that break out into the next (up to the next stage's seedCap)
    BUDGET_CARRY: 0.5,             // share of unspent money that carries into the next stage
    MEDALS_STAGE: 1, MEDALS_CONTAIN: 2, MEDALS_WIN: 5, // medals per stage reached, per star (1 each), per containment, for winning the run
    PERM_COST: 4, PERM_MAX: 1      // medals per permanent upgrade level, and the most permanent levels per upgrade
  },
  MAX_HUMANS: 60000,       // arrays are sized for this many civilians (the biggest stage)
  // ---- REQUISITION (v35): supply crates are gone. Between stages you spend supply points (SP) earned by how the stage went ----
  SHOP: {
    SP_ALIVE: 40,          // SP for the share of civilians alive (100% alive = 40)
    SP_STAR: 10,           // per star (25 / 50 / 75% alive)
    SP_CONTAIN: 25,        // for containing the stage
    SP_KILLS: 300,         // +1 SP per this many kills...
    SP_KILLS_MAX: 25,      // ...up to this many
    SP_STAGE: 5,           // just for getting through a stage
    UPGRADE_BASE: 18, UPGRADE_STEP: 14, // next upgrade level costs base + step x level already owned
    SUPPLIES: [            // one stage only; max = most you can stock for the next stage
      { id: 'cash',  name: 'War budget',    text: '+$750 budget for the next stage', cost: 14, max: 4 },
      { id: 'bomb',  name: 'Air strike',    text: 'one free carpet bombing next stage', cost: 18, max: 3, tool: 'bomb' },
      { id: 'heli',  name: 'Gunship',       text: 'one free helicopter gunship next stage', cost: 18, max: 3, tool: 'heli' },
      { id: 'nuke',  name: 'Tactical nuke', text: 'one free nuke next stage', cost: 80, max: 1, tool: 'nuke' },
      { id: 'intel', name: 'Intel',         text: 'the new outbreak sites are marked before you start', cost: 10, max: 1 }
    ],
    CASH_PER: 750,
    BLUEPRINT_COST: { common: 22, uncommon: 35, rare: 55, jackpot: 80 }, // unlocks a tool for good
    OFFERS: 3, REROLL: 5, REROLL_STEP: 5,   // blueprint offers per visit, reroll price (+5 each time)
    SANDBOX_DOLLARS: 10    // sandbox: the same shop, priced in dollars ($10 per SP)
  },

  // ---- SUPPLY CRATES + UPGRADES ----
  CRATE_COST: 250,
  CRATE_RARITY: { common: 55, uncommon: 28, rare: 14, jackpot: 3 }, // relative odds
  CRATE_ITEMS: {            // one item is picked at random from the rolled rarity
    common:   ['troops', 'ammo', 'cash'],
    uncommon: ['troops2', 'snipers', 'turret', 'mortar', 'strike', 'upgrade'],
    rare:     ['apc', 'heli', 'intel', 'upgrade', 'cash2'],
    jackpot:  ['nuke']
  },
  CRATE_PITY: 4,           // at least one rare-or-better offer in every 4 crates
  CRATE_BP_PITY: 3,        // campaign: at least one blueprint offer in every 3 crates while tools are still locked
  CRATE_BP_CHANCE: 0.25,   // campaign: chance that any offer is a blueprint
  CRATE_FREE_PER_KILLS: 2000, // after a loss: one free crate per this many zombies killed...
  CRATE_FREE_MIN: 1, CRATE_FREE_MAX: 5, // ...at least this many, at most this many
  UPGRADES: {               // per = effect of each level, max = highest level
    ammo:      { name: 'Extended magazines', text: '+50% ammunition carried', per: 0.5,  max: 3 },
    damage:    { name: 'Hollow points',      text: '+25% weapon damage',      per: 0.25, max: 3 },
    reload:    { name: 'Fast hands',         text: '25% faster reloads',      per: 0.25, max: 2 },
    range:     { name: 'Optics',             text: '+20% weapon range',       per: 0.2,  max: 2 },
    walls:     { name: 'Reinforced walls',   text: '+100% barricade and gate strength', per: 1, max: 2 },
    doors:     { name: 'Fortified doors',    text: '+100% garrison door strength',      per: 1, max: 2 },
    logistics: { name: 'Logistics',          text: 'troop drops cost 20% less',         per: 0.2, max: 2 },
    bigdrop:   { name: 'Bigger sticks',      text: '+10 paratroopers per drop',         per: 10,  max: 2 },
    chest:     { name: 'War chest',          text: '+$250 starting budget',             per: 250, max: 4 },
    income:    { name: 'Supply lines',       text: '+$1 per second income',             per: 1,   max: 3 }
  },
  ZONE_RECOVER_TIME: 20,  // v35: a breached safe zone with no zombie inside for this many seconds is safe again
  RESUPPLY_TIME: 5,      // seconds a unit out of ammo must spend inside a safe zone to restock
  HELI_DAMAGE: 30,       // per round
  BOMB_DAMAGE: 400,      // per zombie inside a bomb blast
  // ---- HEIGHT: shooting from higher ground reaches farther; shooting uphill is less accurate ----
  HEIGHT_RANGE_PER_M: 0.01, // +1% range per metre above the target (terrain + building height)
  HEIGHT_RANGE_MAX: 1.0,    // at most double range (snipers get there twice as fast)
  HEIGHT_DMG_PER_M: 0.02,   // -2% damage per metre below the target
  HEIGHT_DMG_MIN: 0.4,      // never less than 40% damage
  GARRISON_COST_PER_TROOP: 12, // buying a garrison: $ per trooper the building holds (they never leave)
  ZONE_COST_PER_M2: 0.008,  // safe zones: $ per square metre enclosed ($8 per 1,000 m²)
  ZONE_MIN_COST: 50,
  ZONE_MAX_AREA: 250000,    // m² (about 500 m x 500 m)
  GARRISON_FIRE_MULT: 3, // garrisoned troops fire this many times slower; when their ammo runs out they abandon the building as civilians
  // ---- MASSIVE HORDES (v32): the real population lives in a coarse grid of 40 m blocks, sheltering in the buildings.
  // Zombies break in, infect them, and move on as a horde. Near your units and the fleeing civilians the horde turns into
  // real zombies (dots); far away it stays a green glow. Bombs, shells, napalm, A-10s and nukes thin it out.
  HORDE: {
    ON: true,
    CELL: 40,              // metres per block
    M2_PER_PERSON: 30,     // real population: one person per this much floor space
    MAX_PEOPLE: 4000000,   // cap on the sheltering population
    SHOW_BREAKIN: 5,       // v39.1: buildings turn green only with at least this many zombies on their block
    INFECT_STAGE: [0.03, 0.035, 0.042, 0.05], // v39: gentler in the early campaign stages (David lost stages 1-2 badly at 0.05)
    INFECT: 0.05,          // (v32 tuned by simulation) sheltering civilians each zombie in the block infects per second...
    BREAKIN_CAP: 40,       // ...but only this many zombies per block can be breaking in at once
    SPILL: 0.3,            // share of a block's extra zombies that spill into the neighbouring blocks each second
    MOVE: 0.06,            // share of a block's horde that moves to the next block toward people each second (~2.4 m/s)
    ACTIVE_R: 300,         // the horde becomes real zombies within this range of your units...
    SPAWN_RATE: 10,        // ...at up to this many zombies per block per second
    SMALL: 30,             // blocks holding fewer horde zombies than this turn into dots anywhere (while there's room), so stragglers can be hunted down
    RESERVE: 2500,         // keep this many dot slots free; far-away zombies fold back into the horde when slots run low
    BLAST_KILL: 0.85, BLAST_CIV: 0.35, // share of the horde / sheltering civilians killed under a blast
    SEED_CAP: [0, 600, 3000, 10000] // campaign: most horde zombies carried into each stage (v32: cut after simulation)
  },
  // ---- TERRAIN (v32): real hills slow you uphill, speed you up a little downhill, and block line of fire ----
  UPHILL_SLOW: 4,          // speed lost per unit of slope uphill (a 10% grade = 40% slower)...
  UPHILL_MIN: 0.45,        // ...but never below this share of normal speed
  DOWNHILL_FAST: 1.5, DOWNHILL_MAX: 1.15, // downhill: a little faster, at most +15%
  TERRAIN_SIGHT: true,     // hills and ridges block shots and sight lines
  // ---- WATER BOMBERS (v32): put out fires along a line; wet buildings can't catch fire for a while ----
  WATER_COST: 250, WATER_RUN_LEN: 400, WATER_SPACING: 18, WATER_BLAST: 36, WATER_WET_TIME: 180, WATER_DELAY: 2.5,
  // ---- DESTRUCTIBLE BUILDINGS: shells, bombs and missiles damage building cells; burnt-out cells collapse ----
  BUILDING_HP: 100,        // hit points of one 3 m building cell...
  BUILDING_HP_PER_M: 4,    // ...plus this much per metre of building height (towers are tougher)
  BUILDING_COLLAPSE: 0.35, // once this share of a building is destroyed, the whole building comes down...
  BUILDING_COLLAPSE_M2: 1200, // ...or this much floor area of it, whichever comes first
  BUILDING_BLAST: 0.8,     // building damage reaches this share of a blast's radius
  GARRISON_OVERRUN_CONVERT: 0.5, // share of a fallen garrison that turns; the rest die fighting
  GARRISON_M2_PER_TROOPER: 2000, // floor area needed per trooper (footprint x floors)
  FLOOR_HEIGHT: 3.5,     // metres per storey
  GARRISON_MIN: 2, GARRISON_MAX: 16,
  M2_PER_PERSON: 40,     // campaign: civilians per square metre of floor space in the region (fewer in low-rise towns)
  HUMANS: 40000,         // maximum civilians (the real number is random per match)
  HUMAN_FLEE_SPEED: 3.2, // m/s (each human gets 0.6x–1.25x of this)
  HUMAN_WANDER_SPEED: 0.5,
  HUMAN_FEAR_RADIUS: 45, // metres at which humans notice zombies
  INFECT_RADIUS: 2.2,    // metres: zombie "touch"
  START_BUDGET: 10000,   // money available in the planning phase (TESTING VALUE — the balanced value is 1000)
  INCOME: 5,             // money per second once the outbreak is live
  DROP_COST: 100,        // cost of one paratrooper drop
  DROP_SIZE: 30,         // paratroopers per line
  DROP_SCATTER: 14,      // metres of scatter around the line
  DROP_MAX_LEN: 500,     // max line length, metres
  DROP_TIME: 2.5,        // seconds in the air
  BARRICADE_COST: 1,     // $ per metre. Barricades block everyone; zombies chew through them
  GATE_COST: 2,          // $ per metre. Gates let humans and troopers through, not zombies
  WALL_MAX_LEN: 300,     // metres per barricade/gate line
  WALL_HP: 150,          // zombie-seconds of chewing per 3 m of barricade
  GATE_HP: 100,
  ZOMBIE_WALL_DPS: 1,    // damage per zombie per second
  WALL_MAX_CHEWERS: 6,   // how many zombies can attack one wall cell at once
  WALL_PENALTY: 80,      // zombies detour up to this many grid cells before attacking a wall instead
  ZONE_COST: 2,          // safe zone: $ per metre of radius (30-150 m)
  EVAC_COST: 300,        // evacuation station
  EVAC_RATE: 10,         // civilians evacuated per second per station
  CALL_RADIUS: 500,      // metres (walking distance) from which civilians head for a zone or station
  GARRISON_HP: 120,      // zombie-seconds at the door before a garrisoned building falls (max 10 zombies at once)
  GARRISON_MIN_BONUS: 15, // extra range (m) for shooting from any building
  GARRISON_RANGE_PER_M: 1, // extra range per metre of building height
  GARRISON_MAX_BONUS: 60,
  BOMB_COST: 300,        // bomber airstrike along a drawn line (live phase only)
  BOMB_RUN_LEN: 400,     // max length of the bomb run, metres
  BOMB_SPACING: 35,      // metres between bombs
  BOMB_BLAST: 22,        // metres; kills everything in the open, levels barricades and gates
  DROP_DELAY: 6,         // seconds from ordering paratroopers until the transport plane drops them
  BOMB_DELAY: 4,         // seconds until the first bomb lands
  HELI_COST: 350,        // gatling-gun helicopter (live phase only)
  HELI_TIME: 30,         // seconds on station
  HELI_DELAY: 3,         // seconds to arrive
  HELI_RANGE: 120,       // metres from the helicopter; fires from above, no line of sight needed
  HELI_ROF: 25,          // rounds per second, one kill each
  HELI_SPRAY: 0.1,       // chance per round of also hitting a civilian standing next to the target
  HELI_ORBIT: 40,        // orbit radius, metres
  NUKE_COST: 1500,       // tactical nuke (live phase only)
  NUKE_DELAY: 8,         // seconds from order to detonation; cannot be cancelled
  NUKE_RADIUS: 400,      // metres; kills everything, even garrisons, and flattens walls and evac stations
  NUKE_FALLOUT: 250,     // metres; lethal to anything in the open that enters
  NUKE_FALLOUT_TIME: 45, // seconds the fallout lasts
  // ---- MORE AIR SUPPORT (live phase only) ----
  BOMB_SCATTER: 70,      // carpet bombing: bombs land this wide across the line (metres)
  PRECISION_COST: 200,   // one large guided bomb
  PRECISION_BLAST: 35, PRECISION_DAMAGE: 900, PRECISION_DELAY: 5,
  STRAFE_COST: 450,      // A-10 strafing run along a drawn line
  STRAFE_LEN: 320, STRAFE_DELAY: 3, STRAFE_TIME: 1.6, STRAFE_WIDTH: 15, STRAFE_KILL: 0.85, STRAFE_CIV: 0.5,
  FIRE_COST: 400,        // firebombing run: napalm along a line; sets buildings on fire
  FIRE_RUN_LEN: 300, FIRE_SPACING: 40, FIRE_BLAST: 18, FIRE_GROUND_TIME: 25,
  FIRE_BURN_TIME: 120,   // seconds a building cell burns before it is gutted
  FIRE_SPREAD: 0.05,     // chance per second to spread to each touching building cell
  FIRE_JUMP: 0.012,      // chance per second to jump a street (up to FIRE_JUMP_M)
  FIRE_JUMP_M: 18,
  FIRE_EMBER: 0.0001,    // chance per second of an ember starting a fire up to FIRE_EMBER_M away — fire never really stops
  FIRE_EMBER_M: 70,
  FIRE_HEAT: 0.25,       // chance per second that anyone standing right beside a burning building dies
  // ---- ARTILLERY + NAVY ----
  HOWITZER_COST: 900, HOWITZER_GUNS: 3, HOWITZER_MIN_RANGE: 150, HOWITZER_FLIGHT: 6, HOWITZER_BLAST: 56, // v40 (David): a 3-gun battery that fires salvos; blast radius doubled (was 28 m, $600 for one gun)
  HOWITZER_SCATTER: 16, HOWITZER_SPEED: 1,
  SHIP_COST: 900,        // destroyer: must be placed on water; gun fires on its own, missiles are fired by you
  SHIP_MISSILES: 4, SHIP_GUN_BLAST: 26, SHIP_GUN_FLIGHT: 5, SHIP_GUN_SCATTER: 14,
  MISSILE_SPEED: 260, MISSILE_BLAST: 40, MISSILE_DAMAGE: 1200,
  WIRE_COST: 0.5,        // razor wire: $ per metre; slows zombies, stops nobody
  WIRE_SLOW: 0.25,       // zombies move at this fraction of their speed on wire
  TURRET_COST: 200,      // automated sentry gun: fixed in place, can't be infected, zombies must wreck it
  TURRET_HP: 200,        // zombie-seconds of damage (max 8 zombies at once)
  SNIPER_COST: 150,      // sniper team
  SNIPER_SQUAD: 5,       // snipers per team
  SNIPER_HEIGHT_MULT: 2, // snipers get this many times the normal garrison height bonus
  SNIPER_MAX_BONUS: 150,
  ROOF_RATE_PER_M: 0.01,   // v33: snipers placed on a roof fire 1% faster per metre of height...
  ROOF_RATE_MAX: 0.6,      // ...up to +60%
  ROOF_AMMO_PER_M: 1,      // ...and carry 1 extra round per metre of height (stockpiled up there)
  ROOF_AMMO_MAX: 60,
  ROOF_COST_PER_M: 4,      // a roof position costs $4 more per metre of height (getting a team and ammo up there)
  MORTAR_COST: 250,      // mortar squad: indirect fire, no line of sight needed
  MORTAR_MIN_RANGE: 40,
  MORTAR_FLIGHT: 2.5,    // seconds a shell is in the air
  MORTAR_BLAST: 14,      // metres; kills everything in the open inside it, friend or foe
  MORTAR_SCATTER: 8,     // metres of inaccuracy
  MORTAR_MIN_ZOMBIES: 6, // won't fire at smaller groups
  MORTAR_CIV_WEIGHT: 3,  // each friendly near the target cancels this many zombies when picking a target
  MORTAR_SPEED: 2,       // m/s when ordered to move (cannot fire while moving)
  MORTAR_APC_DMG: 150,
  APC_COST: 400,         // armoured vehicle: cannot be infected, zombies have to wreck it
  APC_HP: 120,           // zombie-seconds of damage (max 8 zombies at once; v30: was 400)
  APC_CREW: 4,           // v30: when zombies wreck an APC, its crew turn into this many zombies
  APC_CRUSH_COST: 3,     // v30: each zombie run over costs the APC this much armour
  APC_SPEED: 9,          // m/s
  APC_CRUSH_RADIUS: 3,   // a moving APC kills zombies this close
  TROOPER_SPEED: 2.6,    // m/s when advancing on zombies
  WALK_MODE: 'open',     // 'open' = anywhere except buildings and water; 'streets' = roads only
  TERRAIN_EXAGGERATION: 1.5, // how much hills are stretched vertically
  VIEW_PITCH: 60,        // camera tilt in degrees (3D is always on)
  VIEW_BEARING: -20,     // camera rotation in degrees
  ELEV_RES: 10,          // metres per cell of the ground-height grid used to place dots on the 3D terrain
  ELEV_ZOOM: 13,         // detail level of the terrain tiles sampled for that grid
  NAV_RES: 3,            // street grid resolution, metres
  CELL: 8,               // spatial grid cell, metres
  MAX_TROOPERS: 20000
};
/* ============================================================================ */


function makeSim(CFG) {
  const HALF = CFG.AREA / 2, CELL = CFG.CELL;
  const G = Math.ceil(CFG.AREA / CELL), NC = G * G;               // spatial grid (neighbour lookups)
  const RES = CFG.NAV_RES, N = Math.ceil(CFG.AREA / RES), NN = N * N, INF = 65535; // street grid (walls + pathfinding)
  const MAXN = (CFG.MAX_HUMANS || CFG.HUMANS) + 6000 + CFG.MAX_TROOPERS;
  const NONE = 0, HUMAN = 1, ZOMBIE = 2, TROOPER = 3, FALLING = 4, APC = 5, MORTAR = 6, SHIP = 7;

  const px = new Float32Array(MAXN), py = new Float32Array(MAXN), btry = new Int32Array(MAXN) /* howitzer battery: leader index + 1 */;
  const type = new Uint8Array(MAXN), hp = new Uint16Array(MAXN), zk = new Uint8Array(MAXN) /* zombie kind */, sub = new Uint8Array(MAXN) /* 1 = under water */,
    rounds = new Uint16Array(MAXN) /* total ammunition left */, rst = new Float32Array(MAXN) /* restock progress */, ammo = new Uint8Array(MAXN), adv = new Uint8Array(MAXN), sel = new Uint8Array(MAXN), mode = new Uint8Array(MAXN);
  // trooper mode: 0 = hunt (advance on zombies), 1 = hold position, 2+k = moving under order k
  const ORDERS = 6, ofield = [], orad = new Uint16Array(ORDERS); for (let k = 0; k < ORDERS; k++) ofield.push(new Uint16Array(NN));
  let onext = 0;
  const spd = new Float32Array(MAXN), timer = new Float32Array(MAXN);
  const wvx = new Float32Array(MAXN), wvy = new Float32Array(MAXN);
  const cellOf = new Int32Array(MAXN);
  const preyStart = new Int32Array(NC + 1), preyIdx = new Int32Array(MAXN), preyFill = new Int32Array(NC);
  const zomStart = new Int32Array(NC + 1), zomIdx = new Int32Array(MAXN), zomFill = new Int32Array(NC);
  // walk bits: 1 = walkable, 2 = building (blocks line of sight), 4 = barricade (bit 1 cleared while it stands), 8 = gate, 16 = water (only zombies enter, very slowly)
  const walk = new Uint8Array(NN).fill(1), pdist = new Uint16Array(NN), zdist = new Uint16Array(NN), queue = new Int32Array(NN * 2);
  const WALLCAP = 30000, wallList = new Int32Array(WALLCAP), q2 = new Int32Array(WALLCAP * 8), ahp = new Float32Array(MAXN), achew = new Uint8Array(MAXN), bhp = new Float32Array(NN), chew = new Uint8Array(NN), odest = new Int32Array(ORDERS).fill(-1);
  let walk0 = null, bheight0 = null, blabel0 = null, destroyed = []; // originals, to rebuild the city on restart
  let bfid = null, ffirst = null, fcells = null, fcount = null, fdead = null, fgone = null; // map building id per cell (from the game)
  const bdam = new Float32Array(NN), wetUntil = new Float32Array(NN);
  const HC = CFG.HORDE.CELL, HG = Math.ceil(2 * HALF / HC), HN = HG * HG; // horde blocks
  const bH = new Float32Array(HN), bZ = new Float32Array(HN), hwalk = new Uint8Array(HN), hbld = new Uint16Array(HN), hdist = new Uint16Array(HN), hq = new Int32Array(HN);
  const aH = new Uint16Array(HN), aZ = new Uint16Array(HN), hact = new Uint8Array(HN); let hordeT = 0;
  const hcOf = (x, y) => { let hx = ((x + HALF) / HC) | 0, hy = ((y + HALF) / HC) | 0; if (hx < 0) hx = 0; else if (hx >= HG) hx = HG - 1; if (hy < 0) hy = 0; else if (hy >= HG) hy = HG - 1; return hx + hy * HG; };
  const fstate = new Uint8Array(NN), fstart = new Float32Array(NN), heat = new Uint8Array(NN); let fireList = [], heatList = []; // building fires: 0 none, 1 burning, 2 gutted
  const wireList = []; const msl = new Uint8Array(MAXN); // razor wire cells; missiles left per ship
  const bmask = new Uint8Array(NN), edist = new Uint16Array(NN).fill(65535); // breached safe zones, and the way out of them
  let elevG = null, elevN = 0, elevR = 1; // ground height grid (metres), set by the game once terrain data is in
  const sdist = new Uint16Array(NN).fill(65535), rdist = new Uint16Array(NN).fill(65535), qw = new Int32Array(NN); let hasSafe = false, hasZone = false;
  const barea = [0], bhsum = [0]; // per building block: footprint cells, summed height
  // buildings: blabel = id of the connected building block under each cell, bheight = metres; gar[i] = garrison index + 1
  const blabel = new Int32Array(NN), bheight = new Uint8Array(NN), gar = new Int32Array(MAXN), lock = new Uint8Array(MAXN) /* 1 = bought garrison, can't leave */, cls = new Uint8Array(MAXN) /* unit class: 0 rifle / APC, 1 sniper, 2 turret (an immobile APC) */, ogar = new Int32Array(ORDERS);
  let wcells = new Int32Array(0);
  const TR_MAX = 4096, tracers = new Float32Array(TR_MAX * 4), trTtl = new Float32Array(TR_MAX);
  const DX = [1, 1, 0, -1, -1, -1, 0, 1], DY = [0, 1, 1, 1, 0, -1, -1, -1];
  const Wd = {}; // weapons after upgrades
  const EVMAX = 3000, ev = new Float32Array(EVMAX * 3); // sound events: type, x, y (read and cleared by the sound engine)
  const S = { ev, evN: 0, evDropped: 0, n: 0, nh: 0, nz: 0, nt: 0, kills: 0, drops: 0, time: 0, tick: 0, trHead: 0, streets: false, planning: false, fresh: true, outbreaks: [], budget: 0, lost: 0, spent: 0, nsel: 0, sel, nw: 0, wallList, wallsDirty: false, zones: [], stations: [], evac: 0, safeDirty: false, na: 0, lostApc: 0, garrisons: [], gar, lock, cls, breaches: 0, bheight, fstate, fires: () => fireList, wireList, msl, strafes: [], missiles: [], gfires: [], nFire: 0, nsh: 0, nhw: 0, lostShip: 0, zk, sub, rounds, strain: { speed: 1, health: 1, reach: 1 }, humans0: CFG.HUMANS, zombies0: 0, started: false, hasWater: false, ndry: 0, ngar: 0, lastGarrison: null, up: {}, freeCrates: 0, cratesOpened: 0, free: { bomb: 0, heli: 0, nuke: 0 }, intel: false, planSites: [], W: Wd,
    wallHp: 1, garHp: CFG.GARRISON_HP, dropCost: CFG.DROP_COST, income: CFG.INCOME, dropSize: CFG.DROP_SIZE, nsn: 0, ntu: 0, lostTurret: 0, nm: 0, lostMortar: 0, collateral: 0, shells: [], blasts: [], planes: [], helis: [], nukes: [], fallout: [], flash: 0, nukesUsed: 0,
    px, py, type, timer, hp, spd, ammo, tracers, trTtl, TR_MAX, HALF, N, RES, walk, AREA: CFG.AREA, regionR: 0, region: null, popScale: 1, seed: null, fixedStrain: null, siteCount: null, NONE, HUMAN, ZOMBIE, TROOPER, FALLING };
  const free = [];
  const rnd = Math.random;

  function nav(x, y) {
    let cx = ((x + HALF) / RES) | 0, cy = ((y + HALF) / RES) | 0;
    if (cx < 0) cx = 0; else if (cx >= N) cx = N - 1;
    if (cy < 0) cy = 0; else if (cy >= N) cy = N - 1;
    return cx + cy * N;
  }
  function ok(x, y) {
    if (!(x > -HALF && x < HALF && y > -HALF && y < HALF)) return false;
    return (walk[(((x + HALF) / RES) | 0) + (((y + HALF) / RES) | 0) * N] & 1) === 1;
  }
  // Move with wall sliding. Returns false when fully blocked.
  function move(i, nx, ny) {
    if (ok(nx, ny)) { px[i] = nx; py[i] = ny; return true; }
    if (ok(nx, py[i])) { px[i] = nx; return true; }
    if (ok(px[i], ny)) { py[i] = ny; return true; }
    return false;
  }
  function okZ(x, y) { // zombies cannot pass gates
    if (!(x > -HALF && x < HALF && y > -HALF && y < HALF)) return false;
    const w = walk[(((x + HALF) / RES) | 0) + (((y + HALF) / RES) | 0) * N];
    return (w & 9) === 1 || (w & 16) !== 0;
  }
  function moveZ(i, nx, ny) {
    if (okZ(nx, ny)) { px[i] = nx; py[i] = ny; return true; }
    if (okZ(nx, py[i])) { px[i] = nx; return true; }
    if (okZ(px[i], ny)) { py[i] = ny; return true; }
    return false;
  }
  // Zombie version of pick: walls and gates are valid targets (to be attacked).
  function pickZ(dist, c, k0) {
    const cx = c % N, cy = (c / N) | 0; let bk = -1, bd = dist[c];
    for (let q = 0; q < 8; q++) {
      const k = (k0 + q) & 7, xx = cx + DX[k], yy = cy + DY[k];
      if (xx < 0 || yy < 0 || xx >= N || yy >= N) continue;
      const m = xx + yy * N; if (!(walk[m] & 21)) continue;
      if (k & 1) { const a = walk[xx + cy * N], b = walk[cx + yy * N]; if (((a & 9) !== 1 && !(a & 16)) || ((b & 9) !== 1 && !(b & 16))) continue; }
      const d = dist[m]; if (d < bd) { bd = d; bk = k; }
    }
    return bk;
  }
  // Neighbouring street cell with the lowest (or highest) distance value; -1 if none is better.
  function pick(dist, c, k0, up) {
    const cx = c % N, cy = (c / N) | 0; let bk = -1, bd = dist[c];
    for (let q = 0; q < 8; q++) {
      const k = (k0 + q) & 7, xx = cx + DX[k], yy = cy + DY[k];
      if (xx < 0 || yy < 0 || xx >= N || yy >= N) continue;
      const m = xx + yy * N; if (!(walk[m] & 1)) continue;
      if ((k & 1) && (!(walk[xx + cy * N] & 1) || !(walk[cx + yy * N] & 1))) continue; // no corner cutting
      const d = dist[m];
      if (up ? d > bd : d < bd) { bd = d; bk = k; }
    }
    return bk;
  }
  // Head for neighbour cell k of cell c at step length s.
  function stepTo(i, c, k, s, z) {
    const cx = c % N + DX[k], cy = ((c / N) | 0) + DY[k];
    const tx = -HALF + (cx + 0.5) * RES + ((i * 37) % 64 / 64 - 0.5) * RES * 0.7;
    const ty = -HALF + (cy + 0.5) * RES + ((i * 101) % 64 / 64 - 0.5) * RES * 0.7;
    const dx = tx - px[i], dy = ty - py[i], d = Math.sqrt(dx * dx + dy * dy) || 1;
    if (elevG) { const ux = dx / d * 6, uy = dy / d * 6, sl = (groundB(px[i] + ux, py[i] + uy) - groundB(px[i] - ux, py[i] - uy)) / 12; // slope along the way we're heading
      s *= sl > 0 ? Math.max(CFG.UPHILL_MIN, 1 - sl * CFG.UPHILL_SLOW) : Math.min(CFG.DOWNHILL_MAX, 1 - sl * CFG.DOWNHILL_FAST); }
    return z ? moveZ(i, px[i] + dx / d * s, py[i] + dy / d * s) : move(i, px[i] + dx / d * s, py[i] + dy / d * s);
  }
  // Straight line check: sight=true -> blocked by buildings; sight=false -> must be walkable all the way.
  function clear(x0, y0, x1, y1, sight) {
    const dx = x1 - x0, dy = y1 - y0, st = Math.ceil(Math.sqrt(dx * dx + dy * dy) / (RES * 0.6));
    const sx = dx / st, sy = dy / st; let x = x0, y = y0;
    for (let k = 1; k < st; k++) { x += sx; y += sy; const w = walk[nav(x, y)]; if (sight ? (w & 2) : (w & 9) !== 1) return false; }
    if (sight && elevG && CFG.TERRAIN_SIGHT) return terrainClear(x0, y0, groundB(x0, y0) + 1.8, x1, y1, groundB(x1, y1) + 1.2);
    return true;
  }
  // Line of sight from inside building b at height h: own building and lower buildings don't block.
  function clearG(x0, y0, x1, y1, b, h) {
    const dx = x1 - x0, dy = y1 - y0, st = Math.ceil(Math.sqrt(dx * dx + dy * dy) / (RES * 0.6));
    const sx = dx / st, sy = dy / st; let x = x0, y = y0;
    for (let k = 1; k < st; k++) { x += sx; y += sy; const c = nav(x, y); if ((walk[c] & 2) && blabel[c] !== b && bheight[c] >= h) return false; }
    if (elevG && CFG.TERRAIN_SIGHT) return terrainClear(x0, y0, groundB(x0, y0) + h, x1, y1, groundB(x1, y1) + 1.2);
    return true;
  }
  // Flood fill. zm=true: zombie reach (gates block). zm=false: human/trooper reach.
  function bfs(dist, qt, zm) {
    let qh = 0; const mask = zm ? 9 : 1;
    while (qh < qt) {
      const c = queue[qh++], d = dist[c] + 1, cx = c % N; let m;
      if (cx > 0) { m = c - 1; if (dist[m] > d && (walk[m] & mask) === 1) { dist[m] = d; queue[qt++] = m; } }
      if (cx < N - 1) { m = c + 1; if (dist[m] > d && (walk[m] & mask) === 1) { dist[m] = d; queue[qt++] = m; } }
      if (c >= N) { m = c - N; if (dist[m] > d && (walk[m] & mask) === 1) { dist[m] = d; queue[qt++] = m; } }
      if (c < NN - N) { m = c + N; if (dist[m] > d && (walk[m] & mask) === 1) { dist[m] = d; queue[qt++] = m; } }
    }
  }
  // Weighted flood for zombies: walls/gates can be chewed through and water can be waded, each at a cost.
  function bfsW(dist, qt) {
    let qh = 0, ph = 0, pt = 0, wh = 0, wt = 0; const PEN = CFG.WALL_PENALTY, WC = CFG.WATER_COST, QL = queue.length, PL = q2.length, WL = qw.length;
    while (qh < qt || ph < pt || wh < wt) {
      let src = 0, bd = 70000;
      if (qh < qt) { bd = dist[queue[qh]]; src = 1; }
      if (ph < pt && dist[q2[ph]] < bd) { bd = dist[q2[ph]]; src = 2; }
      if (wh < wt && dist[qw[wh]] < bd) src = 3;
      const c = src === 1 ? queue[qh++] : src === 2 ? q2[ph++] : qw[wh++], d0 = dist[c], cx = c % N;
      for (let e = 0; e < 4; e++) {
        let m; if (e === 0) { if (cx === 0) continue; m = c - 1; } else if (e === 1) { if (cx === N - 1) continue; m = c + 1; } else if (e === 2) { if (c < N) continue; m = c - N; } else { if (c >= NN - N) continue; m = c + N; }
        const w = walk[m];
        if ((w & 9) === 1) { if (dist[m] > d0 + 1 && qt < QL) { dist[m] = d0 + 1; queue[qt++] = m; } }
        else if (w & 12) { const d = d0 + PEN; if (d < INF && dist[m] > d && pt < PL) { dist[m] = d; q2[pt++] = m; } }
        else if (w & 16) { const d = d0 + WC; if (d < INF && dist[m] > d && wt < WL) { dist[m] = d; qw[wt++] = m; } }
      }
    }
  }
  function seedAndFlood(dist, a, b, c3) {
    dist.fill(INF); let qt = 0;
    for (let i = 0; i < S.n; i++) { const t = type[i]; if ((t !== a && t !== b && t !== c3 && !(a === HUMAN && t === MORTAR)) || gar[i]) continue;
      const c = nav(px[i], py[i]); if (dist[c] !== 0) { dist[c] = 0; queue[qt++] = c; } }
    if (a === HUMAN) for (const g of S.garrisons) if (g.count && dist[g.entry] !== 0) { dist[g.entry] = 0; queue[qt++] = g.entry; } // zombies go for the door
    if (a === ZOMBIE) bfs(dist, qt, true); else if (S.nw || S.hasWater) bfsW(dist, qt); else bfs(dist, qt, false);
  }
  function wreckApc(b) { // zombies tear an APC open: the crew are dragged out and turn
    sel[b] = 0; S.lostApc++; S.apcTurned = (S.apcTurned || 0) + 1; const bx = px[b], by = py[b]; emit(10, bx, by); makeZombie(b);
    for (let k = 1; k < CFG.APC_CREW; k++) { const z = alloc(); if (z < 0) break; px[z] = bx + (rnd() - 0.5) * 3; py[z] = by + (rnd() - 0.5) * 3; makeZombie(z); } }
  function alloc() { const i = free.length ? free.pop() : S.n < MAXN ? S.n++ : -1; if (i >= 0) { lock[i] = 0; btry[i] = 0; } return i; }
  function randomStreetPoint(i) {
    const c = wcells[(rnd() * wcells.length) | 0];
    px[i] = -HALF + (c % N + 0.1 + rnd() * 0.8) * RES; py[i] = -HALF + (((c / N) | 0) + 0.1 + rnd() * 0.8) * RES;
  }

  // Install a street grid (Uint8Array N*N: bit0 walkable, bit1 building) or null for open ground.
  S.setWalk = function (src, heights) {
    destroyed = []; bfid = null; bdam.fill(0);
    S.nw = 0; wireList.length = 0; fstate.fill(0); fireList = [];
    if (src) walk.set(src); else walk.fill(1);
    S.region = null;
    if (src && S.regionR > 0) S.region = clipRegion(S.regionR);
    if (src) { // keep only the largest connected street network so nobody is stranded
      const comp = new Int32Array(NN).fill(-1); let id = 0, bestId = -1, bestSize = 0;
      for (let c0 = 0; c0 < NN; c0++) {
        if (!(walk[c0] & 1) || comp[c0] >= 0) continue;
        let qh = 0, qt = 0; queue[qt++] = c0; comp[c0] = id;
        while (qh < qt) { const c = queue[qh++], cx = c % N; let m;
          if (cx > 0) { m = c - 1; if (comp[m] < 0 && (walk[m] & 1)) { comp[m] = id; queue[qt++] = m; } }
          if (cx < N - 1) { m = c + 1; if (comp[m] < 0 && (walk[m] & 1)) { comp[m] = id; queue[qt++] = m; } }
          if (c >= N) { m = c - N; if (comp[m] < 0 && (walk[m] & 1)) { comp[m] = id; queue[qt++] = m; } }
          if (c < NN - N) { m = c + N; if (comp[m] < 0 && (walk[m] & 1)) { comp[m] = id; queue[qt++] = m; } } }
        if (qt > bestSize) { bestSize = qt; bestId = id; }
        id++;
      }
      if (bestSize < 2000) { walk.fill(1); src = null; }
      else for (let c = 0; c < NN; c++) if ((walk[c] & 1) && comp[c] !== bestId) walk[c] &= 2;
    }
    let cnt = 0; for (let c = 0; c < NN; c++) if (walk[c] & 1) cnt++;
    wcells = new Int32Array(cnt); cnt = 0; for (let c = 0; c < NN; c++) if (walk[c] & 1) wcells[cnt++] = c;
    blabel.fill(0); bheight.fill(0); barea.length = 1; bhsum.length = 1; S.hasWater = false;
    if (src) for (let c = 0; c < NN; c++) if (walk[c] & 16) { if (walk[c] & 3) walk[c] &= ~16; else S.hasWater = true; }
    if (src) { if (heights) bheight.set(heights); let bid = 0; // label connected building blocks
      for (let c0 = 0; c0 < NN; c0++) { if (!(walk[c0] & 2) || blabel[c0]) continue;
        bid++; let qh = 0, qt = 0, hs = 0; queue[qt++] = c0; blabel[c0] = bid;
        while (qh < qt) { const c = queue[qh++], cx = c % N; let m;
          if (cx > 0) { m = c - 1; if (!blabel[m] && (walk[m] & 2)) { blabel[m] = bid; queue[qt++] = m; } }
          if (cx < N - 1) { m = c + 1; if (!blabel[m] && (walk[m] & 2)) { blabel[m] = bid; queue[qt++] = m; } }
          if (c >= N) { m = c - N; if (!blabel[m] && (walk[m] & 2)) { blabel[m] = bid; queue[qt++] = m; } }
          if (c < NN - N) { m = c + N; if (!blabel[m] && (walk[m] & 2)) { blabel[m] = bid; queue[qt++] = m; } } }
        for (let q = 0; q < qt; q++) hs += heights ? bheight[queue[q]] : 0;
        barea[bid] = qt; bhsum[bid] = hs; } }
    walk0 = walk.slice(); bheight0 = bheight.slice(); blabel0 = blabel.slice();
    S.popScale = S.region ? Math.max(0.25, Math.min(1, S.floorArea() / (CFG.HUMANS * (CFG.M2_PER_PERSON || 40)))) : 1;
    S.streets = !!src; S.reset();
    return S.streets;
  };

  // Campaign stages: everything farther than maxM metres of travel from the centre becomes impassable.
  // Travel follows streets and open ground (cost 1 per cell) and can cross water at cost 4, so the region
  // grows along roads, over bridges and around coastlines rather than as a circle.
  function clipRegion(maxM) {
    const maxD = Math.max(10, Math.round(maxM / RES)), dist = pdist; dist.fill(INF);
    const c0 = nearestWalk(0, 0); if (c0 < 0) return null;
    const B = 5, buckets = []; for (let k = 0; k < B; k++) buckets.push([]);
    dist[c0] = 0; buckets[0].push(c0);
    for (let d = 0; d <= maxD; d++) { const bk = buckets[d % B]; if (!bk.length) continue; const list = bk.splice(0);
      for (const c of list) { if (dist[c] !== d) continue; const cx = c % N;
        for (let k = 0; k < 4; k++) { const m = k === 0 ? (cx > 0 ? c - 1 : -1) : k === 1 ? (cx < N - 1 ? c + 1 : -1) : k === 2 ? c - N : c + N;
          if (m < 0 || m >= NN) continue; const w = walk[m]; let cost;
          if (w & 1) cost = 1; else if ((w & 16) && !(w & 2)) cost = 4; else continue;
          const nd = d + cost; if (nd <= maxD && nd < dist[m]) { dist[m] = nd; buckets[nd % B].push(m); } } } }
    const inside = new Uint8Array(NN), rd = new Uint16Array(NN).fill(65535); for (let c = 0; c < NN; c++) if (dist[c] <= maxD) { inside[c] = 1; rd[c] = Math.min(65534, dist[c]); }
    // buildings that front the region come with it (up to 45 m deep)
    let front = []; for (let c = 0; c < NN; c++) if (inside[c]) front.push(c);
    for (let depth = 0; depth < Math.round(45 / RES) && front.length; depth++) { const nx = [];
      for (const c of front) { const cx = c % N;
        for (const m of [cx > 0 ? c - 1 : -1, cx < N - 1 ? c + 1 : -1, c - N, c + N]) if (m >= 0 && m < NN && !inside[m] && (walk[m] & 2)) { inside[m] = 2; rd[m] = Math.min(65534, rd[c] + 1); nx.push(m); } }
      front = nx; }
    for (let c = 0; c < NN; c++) if (!inside[c]) walk[c] = 0;
    S.regionDist = rd; dist.fill(INF); return inside;
  }
  const rr = (a) => a[0] + rnd() * (a[1] - a[0]);
  function emit(t, x, y) { if (S.evN < EVMAX) { const k = S.evN++ * 3; ev[k] = t; ev[k + 1] = x; ev[k + 2] = y; } else S.evDropped++; }
  S.floorArea = function () { let a = 0; for (let c = 0; c < NN; c++) if (walk[c] & 2) a += Math.max(1, Math.round((bheight[c] || CFG.FLOOR_HEIGHT) / CFG.FLOOR_HEIGHT)); return a * RES * RES; };
  // The game tells us which map building each cell belongs to (-1 = none), so a building can collapse as one.
  S.setBuildings = function (fid, nf) { bfid = fid; fcount = new Int32Array(nf); fdead = new Int32Array(nf); fgone = new Uint8Array(nf); fdmgFlag = new Uint8Array(nf);
    for (let c = 0; c < NN; c++) if (fid[c] >= 0) fcount[fid[c]]++;
    ffirst = new Int32Array(nf + 1); for (let f = 0; f < nf; f++) ffirst[f + 1] = ffirst[f] + fcount[f];
    fcells = new Int32Array(ffirst[nf]); const fill = new Int32Array(nf); for (let c = 0; c < NN; c++) { const f = fid[c]; if (f >= 0) fcells[ffirst[f] + fill[f]++] = c; } };
  S.goneQ = []; S.dmgQ = []; S.dust = []; S.splash = []; S.bldHit = false; S.bldDestroyed = 0; let fdmgFlag = null;
  S.rubble = () => destroyed;
  S.HG = HG; S.HC = HC; S.bgZField = bZ; S.bgHField = bH; S.bgH = 0; S.bgZ = 0; S.bgH0 = 0; S.bgKills = 0; S.seedBg = null;
  function hordeInit() { // sheltering population from the real floor space, minus the civilians already on the streets
    bH.fill(0); bZ.fill(0); hwalk.fill(0); hbld.fill(0); S.bgH = S.bgZ = S.bgH0 = 0; if (!CFG.HORDE.ON || !S.streets) return;
    const fl = new Float32Array(HN); let tot = 0;
    for (let c = 0; c < NN; c++) { const w = walk[c]; if (!w) continue; const hc = hcOf(-HALF + (c % N + 0.5) * RES, -HALF + (((c / N) | 0) + 0.5) * RES);
      if (w & 1) hwalk[hc] = 1; if (w & 2) { hbld[hc]++; const f = Math.max(1, Math.round((bheight[c] || CFG.FLOOR_HEIGHT) / CFG.FLOOR_HEIGHT)) * RES * RES; fl[hc] += f; tot += f; } }
    const want = Math.min(CFG.HORDE.MAX_PEOPLE, tot / CFG.HORDE.M2_PER_PERSON) - S.humans0; if (want <= 0 || !tot) return;
    for (let k = 0; k < HN; k++) { if (fl[k]) { bH[k] = want * fl[k] / tot; hwalk[k] = 1; } } S.bgH = S.bgH0 = want; hFloor = fl; }
  let hFloor = null;
  function bgHit(x, y, r, kz, kh) { // a blast over the horde grid
    const r0 = Math.ceil((r + HC) / HC), h0 = hcOf(x, y), hx0 = h0 % HG, hy0 = (h0 / HG) | 0, cov = Math.min(1, Math.PI * r * r / (HC * HC));
    for (let yy = hy0 - r0; yy <= hy0 + r0; yy++) { if (yy < 0 || yy >= HG) continue;
      for (let xx = hx0 - r0; xx <= hx0 + r0; xx++) { if (xx < 0 || xx >= HG) continue; const k = xx + yy * HG, cx = -HALF + (xx + 0.5) * HC - x, cy = -HALF + (yy + 0.5) * HC - y;
        const d = Math.sqrt(cx * cx + cy * cy); if (d > r + HC * 0.5) continue; const f = (d < r - HC * 0.5 ? 1 : cov * Math.max(0.2, 1 - (d - r + HC * 0.5) / HC));
        if (bZ[k] > 0) { const dz = bZ[k] * kz * f; bZ[k] -= dz; S.bgKills += dz; S.kills += dz; } if (bH[k] > 0) bH[k] -= bH[k] * kh * f; } }
    S.kills = Math.round(S.kills); }
  S.bgHit = bgHit;
  let cK = null, cW = null, p0 = null;
  S.shelterLevels = function () { if (!bfid || !fcount || !hFloor) return null; const nf = fcount.length;
    if (!cK || cK.length !== fcells.length) { cK = new Int32Array(fcells.length); cW = new Float32Array(fcells.length);
      for (let q = 0; q < fcells.length; q++) { const c = fcells[q], k = hcOf(-HALF + (c % N + 0.5) * RES, -HALF + (((c / N) | 0) + 0.5) * RES); cK[q] = k;
        cW[q] = hFloor[k] > 0 ? Math.max(1, Math.round((bheight[c] || CFG.FLOOR_HEIGHT) / CFG.FLOOR_HEIGHT)) * RES * RES / hFloor[k] : 0; } p0 = null; }
    const occ = new Float32Array(nf), inf = new Uint8Array(nf);
    const ZMIN = CFG.HORDE.SHOW_BREAKIN || 5; // a stray zombie or two drifting through a block isn't a break-in worth painting green
    for (let f = 0; f < nf; f++) { let p = 0, z = 0; for (let q = ffirst[f]; q < ffirst[f + 1]; q++) { const k = cK[q]; p += bH[k] * cW[q]; const zk = bZ[k] + aZ[k]; if (zk > z) z = zk; } occ[f] = p; inf[f] = z >= ZMIN && p >= 0.5 ? 1 : 0; }
    if (!p0) p0 = occ.slice(); for (let f = 0; f < nf; f++) occ[f] = p0[f] > 0.5 ? Math.min(1, occ[f] / p0[f]) : 0;
    return { occ, inf }; };
  S.shelterIn = function (f) { if (!bfid || !fcount || f < 0 || f >= fcount.length || !hFloor) return null; let p = 0, z = 0, floors = 0; const seen = new Set();
    for (let q = ffirst[f]; q < ffirst[f + 1]; q++) { const c = fcells[q]; if (!(walk[c] & 2)) continue; const k = hcOf(-HALF + (c % N + 0.5) * RES, -HALF + (((c / N) | 0) + 0.5) * RES);
      const fa = Math.max(1, Math.round((bheight[c] || CFG.FLOOR_HEIGHT) / CFG.FLOOR_HEIGHT)) * RES * RES; floors = Math.max(floors, fa / (RES * RES)); if (hFloor[k] > 0) p += bH[k] * fa / hFloor[k]; if (!seen.has(k)) { seen.add(k); z += bZ[k]; } }
    return { people: p, zombies: z, floors, gone: !!fgone[f], dmg: S.damageOf(f) }; };
  let lab = null, blab = null; S.labDirty = true;
  function computeLabels() { // connected areas of street (barricades and gates cut them); buildings join the area they open onto
    if (!lab || lab.length !== NN) lab = new Int32Array(NN); if (!blab || blab.length !== HN) blab = new Int32Array(HN);
    lab.fill(-1); let L = 0; const q = queue;
    const pass = (c) => (walk[c] & 1) && !(walk[c] & 12);
    for (let c0 = 0; c0 < NN; c0++) { if (lab[c0] >= 0 || !pass(c0)) continue; lab[c0] = L; let h = 0, t = 0; q[t++] = c0;
      while (h < t) { const c = q[h++], x = c % N;
        if (x > 0 && lab[c - 1] < 0 && pass(c - 1)) { lab[c - 1] = L; q[t++] = c - 1; } if (x < N - 1 && lab[c + 1] < 0 && pass(c + 1)) { lab[c + 1] = L; q[t++] = c + 1; }
        if (c >= N && lab[c - N] < 0 && pass(c - N)) { lab[c - N] = L; q[t++] = c - N; } if (c < NN - N && lab[c + N] < 0 && pass(c + N)) { lab[c + N] = L; q[t++] = c + N; } }
      L++; }
    { let h = 0, t = 0; for (let c = 0; c < NN; c++) if (lab[c] >= 0 && (walk[c] & 2) === 0) { const x = c % N; // street cells next to buildings seed the building fill
        if ((x > 0 && (walk[c - 1] & 2)) || (x < N - 1 && (walk[c + 1] & 2)) || (c >= N && (walk[c - N] & 2)) || (c < NN - N && (walk[c + N] & 2))) q[t++] = c; }
      while (h < t) { const c = q[h++], x = c % N, l = lab[c]; const nb = [x > 0 ? c - 1 : -1, x < N - 1 ? c + 1 : -1, c - N, c + N];
        for (const m of nb) if (m >= 0 && m < NN && lab[m] < 0 && (walk[m] & 2) && !(walk[m] & 12)) { lab[m] = l; q[t++] = m; } } }
    // each horde block belongs to the area that covers most of it (majority vote)
    const cnt = new Int32Array(HN); blab.fill(-1);
    for (let c = 0; c < NN; c++) { const l = lab[c]; if (l < 0) continue; const k = hcOf(-HALF + (c % N + 0.5) * RES, -HALF + (((c / N) | 0) + 0.5) * RES);
      if (blab[k] === l) cnt[k]++; else if (cnt[k] === 0) { blab[k] = l; cnt[k] = 1; } else cnt[k]--; }
    S.labDirty = false; S.areas = L; }
  const labAt = (x, y) => lab ? lab[nav(x, y)] : -1;
  S.labAt = labAt; S.blockLab = () => blab;
  function hordeStep(dts) {
    const H = CFG.HORDE; aH.fill(0); aZ.fill(0); hact.fill(0);
    if (S.labDirty || !lab) computeLabels();
    const same = (a, b) => blab[a] === blab[b];
    const ar = Math.ceil(H.ACTIVE_R / HC);
    for (let i = 0; i < S.n; i++) { const t = type[i]; if (!t) continue; const k = hcOf(px[i], py[i]);
      if (t === HUMAN) { if (aH[k] < 65000 && lab[nav(px[i], py[i])] === blab[k]) aH[k]++; } else if (t === ZOMBIE) { if (aZ[k] < 65000 && lab[nav(px[i], py[i])] === blab[k]) aZ[k]++; }
      else if ((t === TROOPER || t === APC || t === MORTAR || t === SHIP) && !hact[k]) { // the horde comes alive around your units
        const kx = k % HG, ky = (k / HG) | 0; for (let yy = Math.max(0, ky - ar); yy <= Math.min(HG - 1, ky + ar); yy++) for (let xx = Math.max(0, kx - ar); xx <= Math.min(HG - 1, kx + ar); xx++) hact[xx + yy * HG] = 1; } }
    // infection: zombies in a block (horde or dots) break into its buildings
    for (let k = 0; k < HN; k++) { const z = bZ[k] + aZ[k]; if (z >= 1 && bH[k] > 0) { const inf = Math.min(bH[k], (S.infect || H.INFECT) * Math.min(z, H.BREAKIN_CAP) * dts); bH[k] -= inf; bZ[k] += inf; } }
    // crowding: only so many can break in at once; the rest spill into the neighbouring blocks
    for (let k = 0; k < HN; k++) { const ex = bZ[k] - H.BREAKIN_CAP; if (ex <= 0) continue; const kx = k % HG, nb = [kx > 0 ? k - 1 : -1, kx < HG - 1 ? k + 1 : -1, k - HG, k + HG].filter((m) => m >= 0 && m < HN && hwalk[m] && same(m, k));
      if (!nb.length) continue; const m = ex * Math.min(0.5, H.SPILL * dts) / nb.length; for (const j of nb) bZ[j] += m; bZ[k] -= m * nb.length; }
    // movement: the horde walks toward the nearest people (sheltering or on the street)
    let qt = 0; for (let k = 0; k < HN; k++) { if (hwalk[k] && (bH[k] >= 1 || aH[k])) { hdist[k] = 0; hq[qt++] = k; } else hdist[k] = 65535; }
    for (let qh = 0; qh < qt; qh++) { const k = hq[qh], d = hdist[k] + 1, kx = k % HG;
      if (kx > 0 && hwalk[k - 1] && hdist[k - 1] > d && same(k, k - 1)) { hdist[k - 1] = d; hq[qt++] = k - 1; } if (kx < HG - 1 && hwalk[k + 1] && hdist[k + 1] > d && same(k, k + 1)) { hdist[k + 1] = d; hq[qt++] = k + 1; }
      if (k >= HG && hwalk[k - HG] && hdist[k - HG] > d && same(k, k - HG)) { hdist[k - HG] = d; hq[qt++] = k - HG; } if (k < HN - HG && hwalk[k + HG] && hdist[k + HG] > d && same(k, k + HG)) { hdist[k + HG] = d; hq[qt++] = k + HG; } }
    const mv = Math.min(0.5, H.MOVE * dts), flow = new Float32Array(0); // moves are applied in place, sweeping from both ends to avoid a drift bias
    for (let pass = 0; pass < 2; pass++) for (let q = 0; q < HN; q++) { const k = pass ? HN - 1 - q : q; if (bZ[k] < 0.5 || hdist[k] === 0 || hdist[k] === 65535) continue;
      const kx = k % HG; let best = -1, bd = hdist[k];
      if (kx > 0 && hdist[k - 1] < bd && same(k, k - 1)) { bd = hdist[k - 1]; best = k - 1; } if (kx < HG - 1 && hdist[k + 1] < bd && same(k, k + 1)) { bd = hdist[k + 1]; best = k + 1; }
      if (k >= HG && hdist[k - HG] < bd && same(k, k - HG)) { bd = hdist[k - HG]; best = k - HG; } if (k < HN - HG && hdist[k + HG] < bd && same(k, k + HG)) { bd = hdist[k + HG]; best = k + HG; }
      if (best >= 0) { const m = bZ[k] * mv * 0.5; bZ[k] -= m; bZ[best] += m; } }
    // the horde becomes real zombies near your units and near civilians on the street
    let slots = MAXN - S.n + free.length - H.RESERVE; const roomy = slots > H.RESERVE * 2; // small stray groups also become dots (so troops can hunt them) while there's room
    for (let k = 0; k < HN && slots > 0; k++) { if (bZ[k] < 1 || !(hact[k] || aH[k] || (roomy && bZ[k] < H.SMALL))) continue;
      let m = Math.min(Math.floor(bZ[k]), Math.ceil(H.SPAWN_RATE * dts), slots); const hx = k % HG, hy = (k / HG) | 0;
      while (m > 0) { let placed = false; for (let tr = 0; tr < 12 && !placed; tr++) { const x = -HALF + (hx + rnd()) * HC, y = -HALF + (hy + rnd()) * HC;
          if (x > -HALF && x < HALF && y > -HALF && y < HALF && ok(x, y) && lab[nav(x, y)] === blab[k]) { const i = alloc(); if (i < 0) { m = 0; break; } px[i] = x; py[i] = y; makeZombie(i); S.matCount = (S.matCount || 0) + 1; placed = true; } }
        if (!placed) break; bZ[k] -= 1; m--; slots--; } }
    // short of dot slots: far-away zombies fold back into the horde
    if (MAXN - S.n + free.length < H.RESERVE) { let need = H.RESERVE * 2;
      for (let i = 0; i < S.n && need > 0; i++) if (type[i] === ZOMBIE) { const k = hcOf(px[i], py[i]); if (hact[k] || aH[k]) continue; bZ[k] += 1; type[i] = NONE; free.push(i); need--; S.dematCount = (S.dematCount || 0) + 1; } }
    let th = 0, tz = 0; for (let k = 0; k < HN; k++) { if (bZ[k] > 0 && bZ[k] < 1) bZ[k] = rnd() < bZ[k] ? 1 : 0; th += bH[k]; tz += bZ[k]; } /* fractions of a zombie are rounded at random */ S.bgH = th; S.bgZ = tz; S.hordeDirty = true;
  }
  function destroyCell(c) { if (!(walk[c] & 2)) return;
    { const k = hcOf(-HALF + (c % N + 0.5) * RES, -HALF + (((c / N) | 0) + 0.5) * RES); if (bH[k] > 0 && hbld[k]) bH[k] -= bH[k] / hbld[k]; } /* people sheltering in it die */ walk[c] = 1; bheight[c] = 0; blabel[c] = 0; destroyed.push(c); S.bldHit = true; S.wallsDirty = true; S.bldDestroyed++;
    if (bfid) { const f = bfid[c]; if (f >= 0 && !fgone[f]) { fdead[f]++; if (!fdmgFlag[f]) { fdmgFlag[f] = 1; S.dmgQ.push(f); }
      if (fdead[f] >= Math.min(fcount[f] * CFG.BUILDING_COLLAPSE, CFG.BUILDING_COLLAPSE_M2 / (RES * RES))) { fgone[f] = 1; S.goneQ.push(f); S.collapseEv = true;
        { let sx = 0, sy = 0; const a = ffirst[f], e = ffirst[f + 1]; for (let k = a; k < e; k++) { sx += fcells[k] % N; sy += (fcells[k] / N) | 0; } // a dust cloud where it fell
          const m = Math.max(1, e - a); emit(21, -HALF + (sx / m + 0.5) * RES, -HALF + (sy / m + 0.5) * RES); S.dust.push({ x: -HALF + (sx / m + 0.5) * RES, y: -HALF + (sy / m + 0.5) * RES, r: Math.min(80, 6 + Math.sqrt(m) * RES * 0.6), t0: S.time, h: bheight0 ? bheight0[fcells[a]] || 12 : 12 }); }
      for (let k = ffirst[f]; k < ffirst[f + 1]; k++) destroyCell(fcells[k]); } } } }
  function damageBuildings(x, y, r, dmg) { const rr = r * CFG.BUILDING_BLAST, cr = Math.ceil(rr / RES), c0 = nav(x, y), cx0 = c0 % N, cy0 = (c0 / N) | 0;
    for (let yy = cy0 - cr; yy <= cy0 + cr; yy++) { if (yy < 0 || yy >= N) continue;
      for (let xx = cx0 - cr; xx <= cx0 + cr; xx++) { if (xx < 0 || xx >= N) continue; const c = xx + yy * N; if (!(walk[c] & 2)) continue;
        const dx = -HALF + (xx + 0.5) * RES - x, dy = -HALF + (yy + 0.5) * RES - y; if (dx * dx + dy * dy > rr * rr) continue;
        bdam[c] += dmg; if (bdam[c] >= CFG.BUILDING_HP + bheight[c] * CFG.BUILDING_HP_PER_M) destroyCell(c); } } }
  S.setElevation = function (g, n, r) { elevG = g; elevN = n; elevR = r; };
  S.damageOf = (f) => fdead && fcount[f] ? Math.min(1, fdead[f] / Math.min(fcount[f] * CFG.BUILDING_COLLAPSE, CFG.BUILDING_COLLAPSE_M2 / (RES * RES))) : 0;
  function groundB(x, y) { if (!elevG) return 0; // bilinear: smooth slopes for movement and sight
    let gx = (x + HALF) / elevR - 0.5, gy = (y + HALF) / elevR - 0.5; if (gx < 0) gx = 0; else if (gx > elevN - 1.001) gx = elevN - 1.001; if (gy < 0) gy = 0; else if (gy > elevN - 1.001) gy = elevN - 1.001;
    const ix = gx | 0, iy = gy | 0, fx = gx - ix, fy = gy - iy, o = ix + iy * elevN;
    return (elevG[o] * (1 - fx) + elevG[o + 1] * fx) * (1 - fy) + (elevG[o + elevN] * (1 - fx) + elevG[o + elevN + 1] * fx) * fy; }
  function terrainClear(x0, y0, z0, x1, y1, z1) { // does the ground rise above the straight line between two heights?
    const L = Math.hypot(x1 - x0, y1 - y0), st = Math.ceil(L / Math.max(4, elevR)); if (st < 3) return true;
    for (let k = 1; k < st; k++) { const f = k / st; if (groundB(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f) > z0 + (z1 - z0) * f + 0.3) return false; } return true; }
  function ground(x, y) { if (!elevG) return 0; let gx = ((x + HALF) / elevR) | 0, gy = ((y + HALF) / elevR) | 0;
    if (gx < 0) gx = 0; else if (gx >= elevN) gx = elevN - 1; if (gy < 0) gy = 0; else if (gy >= elevN) gy = elevN - 1; return elevG[gx + gy * elevN]; }
  // ---- upgrades (kept between attempts until the level is beaten) ----
  function applyUp() {
    const U = CFG.UPGRADES, L = (k) => S.up[k] || 0;
    const dm = 1 + L('damage') * U.damage.per, am = 1 + L('ammo') * U.ammo.per, rl = Math.max(0.2, 1 - L('reload') * U.reload.per), rg = 1 + L('range') * U.range.per;
    for (const k in CFG.WEAPONS) { const b = CFG.WEAPONS[k]; Wd[k] = { damage: b.damage * dm, interval: b.interval, mag: b.mag, reload: b.reload * rl, ammo: Math.round(b.ammo * am), range: b.range * rg }; }
    S.wallHp = 1 + L('walls') * U.walls.per; S.garHp = CFG.GARRISON_HP * (1 + L('doors') * U.doors.per);
    S.dropCost = Math.round(CFG.DROP_COST * (1 - L('logistics') * U.logistics.per)); S.income = CFG.INCOME + L('income') * U.income.per;
    S.dropSize = CFG.DROP_SIZE + L('bigdrop') * U.bigdrop.per;
  }
  function gainUpgrade() { // one level of a random upgrade that isn't maxed; returns its key or null
    const U = CFG.UPGRADES, open = Object.keys(U).filter((k) => (S.up[k] || 0) < U[k].max); if (!open.length) return null;
    const k = open[(rnd() * open.length) | 0]; S.up[k] = (S.up[k] || 0) + 1; applyUp();
    if (k === 'chest') S.budget += U.chest.per;
    return k;
  }
  // ---- supply crate: fixed price (or a free one earned by losing), random contents from a rarity table ----
  // ---- supply crates: pay (or use a free one), then pick 1 of 3 offers. A pity rule guarantees a rare-or-better
  // offer at least every CRATE_PITY crates, and (in the campaign) a blueprint offer every CRATE_BP_PITY crates.
  S.cPity = 0; S.bpPity = 0;
  S.applyUpgrades = () => applyUp();
  S.payCrate = function (x, y) {
    if (Math.abs(x) > HALF || Math.abs(y) > HALF) return null;
    if (S.freeCrates > 0) { S.freeCrates--; S.cratesOpened++; return 'free'; }
    if (S.budget >= CFG.CRATE_COST) { S.budget -= CFG.CRATE_COST; S.spent += CFG.CRATE_COST; S.cratesOpened++; return 'paid'; }
    return null;
  };
  const RANK = { common: 0, uncommon: 1, rare: 2, jackpot: 3 };
  function crateLabel(item) { const U = CFG.UPGRADES;
    if (item.slice(0, 3) === 'up:') { const k = item.slice(3); return 'Upgrade: ' + U[k].name + ' — ' + U[k].text; }
    switch (item) {
      case 'troops': return 'Troop drop: ' + S.dropSize + ' paratroopers land here';
      case 'troops2': return 'Double troop drop: ' + 2 * S.dropSize + ' paratroopers';
      case 'ammo': return 'Ammunition resupply for every unit on the map';
      case 'cash': return 'Cash: $' + Math.round(CFG.CRATE_COST * 0.8);
      case 'cash2': return 'Cash: $' + Math.round(CFG.CRATE_COST * 1.6);
      case 'snipers': return 'Sniper team lands here'; case 'turret': return 'Sentry turret placed here'; case 'mortar': return 'Mortar squad lands here';
      case 'apc': return 'APC delivered here'; case 'strike': return 'One free carpet bombing'; case 'heli': return 'One free helicopter gunship';
      case 'nuke': return 'ONE FREE NUKE'; case 'intel': return 'Intel: mark the outbreak sites before you start';
    } return item; }
  // locked: [{ id, name, rarity }] tools still to unlock (campaign); allow(item) says whether a deploy item can be offered
  S.rollCrate = function (locked, allow) {
    const RW = CFG.CRATE_RARITY, U = CFG.UPGRADES, opts = [], used = new Set();
    const roll = () => { let tot = 0; for (const k in RW) tot += RW[k]; let r = rnd() * tot; for (const k in RW) { if (r < RW[k]) return k; r -= RW[k]; } return 'common'; };
    const forceRare = S.cPity >= CFG.CRATE_PITY - 1, forceBp = locked && locked.length && S.bpPity >= CFG.CRATE_BP_PITY - 1;
    const openUp = () => Object.keys(U).filter((k) => (S.up[k] || 0) < U[k].max && !used.has('up:' + k));
    for (let slot = 0; slot < 3; slot++) {
      let made = null;
      for (let tries = 0; tries < 30 && !made; tries++) {
        let rarity = roll(); if (slot === 2 && forceRare && RANK[rarity] < 2) rarity = 'rare';
        const wantBp = locked && locked.length && ((slot === 0 && forceBp) || rnd() < CFG.CRATE_BP_CHANCE);
        if (wantBp) { const pool = locked.filter((t) => !used.has('bp:' + t.id) && (RANK[t.rarity] <= RANK[rarity] || slot === 0 && forceBp));
          if (pool.length) { const t = pool[(rnd() * pool.length) | 0]; made = { rarity: t.rarity, item: 'bp:' + t.id, label: 'BLUEPRINT: ' + t.name + ' — unlocked for good, every run' }; break; } }
        const pool = CFG.CRATE_ITEMS[rarity].filter((it) => !used.has(it) && (!allow || allow(it)) && !(it === 'intel' && S.started));
        if (!pool.length) continue;
        let item = pool[(rnd() * pool.length) | 0];
        if (item === 'upgrade') { const o = openUp(); if (!o.length) continue; item = 'up:' + o[(rnd() * o.length) | 0]; }
        made = { rarity, item, label: crateLabel(item) };
      }
      if (!made) made = { rarity: 'common', item: used.has('cash') ? 'cash2' : 'cash', label: crateLabel(used.has('cash') ? 'cash2' : 'cash') };
      used.add(made.item); opts.push(made);
    }
    if (opts.some((o) => RANK[o.rarity] >= 2)) S.cPity = 0; else S.cPity++;
    if (locked && locked.length) { if (opts.some((o) => o.item.slice(0, 3) === 'bp:')) S.bpPity = 0; else S.bpPity++; }
    return opts;
  };
  S.applyCrate = function (opt, x, y) {
    const item = opt.item, U = CFG.UPGRADES;
    const grant = (cost, fn) => { S.budget += cost; if (fn()) { S.spent -= cost; return true; } S.budget -= cost; return false; }; // deploy something without charging for it
    const cash = (v) => { S.budget += v; return 'Cash: $' + v; };
    if (item.slice(0, 3) === 'bp:') return opt.label;
    if (item.slice(0, 3) === 'up:') { const k = item.slice(3); if ((S.up[k] || 0) >= U[k].max) return cash(200);
      S.up[k] = (S.up[k] || 0) + 1; applyUp(); if (k === 'chest') S.budget += U.chest.per; return 'Upgrade: ' + U[k].name + ' ' + 'I'.repeat(S.up[k]) + ' — ' + U[k].text; }
    switch (item) {
      case 'troops': return grant(S.dropCost, () => S.drop(x - 30, y, x + 30, y)) ? S.dropSize + ' paratroopers' : cash(100);
      case 'troops2': return (grant(S.dropCost, () => S.drop(x - 30, y - 12, x + 30, y - 12)) | grant(S.dropCost, () => S.drop(x - 30, y + 12, x + 30, y + 12))) ? 'Double troop drop: ' + 2 * S.dropSize + ' paratroopers' : cash(200);
      case 'ammo': for (let i = 0; i < S.n; i++) { const t = type[i]; if (t === TROOPER || t === FALLING) rounds[i] = (cls[i] === 1 ? Wd.sniper : Wd.trooper).ammo; else if (t === APC) rounds[i] = (cls[i] === 2 ? Wd.turret : Wd.apc).ammo; else if (t === MORTAR) rounds[i] = Wd.mortar.ammo; }
        return 'Ammunition resupply for every unit on the map';
      case 'cash': return cash(Math.round(CFG.CRATE_COST * 0.8));
      case 'cash2': return cash(Math.round(CFG.CRATE_COST * 1.6));
      case 'snipers': return grant(CFG.SNIPER_COST, () => S.addSnipers(x, y)) ? 'Sniper team' : cash(150);
      case 'turret': return grant(CFG.TURRET_COST, () => S.addTurret(x, y)) ? 'Sentry turret' : cash(200);
      case 'mortar': return grant(CFG.MORTAR_COST, () => S.addMortar(x, y)) ? 'Mortar squad' : cash(250);
      case 'apc': return grant(CFG.APC_COST, () => S.addApc(x, y)) ? 'APC' : cash(400);
      case 'strike': S.free.bomb++; return 'One free airstrike';
      case 'heli': S.free.heli++; return 'One free helicopter gunship';
      case 'nuke': S.free.nuke++; return 'ONE FREE NUKE';
      case 'intel': if (!S.started) { S.intel = true; return 'Intel: the outbreak sites are now marked on the map'; } return cash(300);
    }
    return cash(100);
  };


  // Turn slot i into a zombie of a random kind (walker / runner / crawler).
  function makeZombie(i) {
    const K = CFG.ZOMBIE_KINDS, r = rnd(); let k = 0, acc = 0;
    for (; k < K.length - 1; k++) { acc += K[k].share; if (r < acc) break; }
    type[i] = ZOMBIE; zk[i] = k; sub[i] = 0; sel[i] = 0; lock[i] = 0;
    hp[i] = Math.max(1, Math.round(CFG.ZOMBIE_HEALTH * K[k].health * S.strain.health));
    spd[i] = K[k].speed * (0.85 + rnd() * 0.3);
  }
  // Damage a zombie; returns true if it died.
  function hit(j, dmg) { if (hp[j] > dmg) { hp[j] -= dmg; return false; } type[j] = NONE; free.push(j); S.kills++; return true; }

  S.reset = function () {
    if (walk0) for (const c of destroyed) { walk[c] = walk0[c]; bheight[c] = bheight0[c]; blabel[c] = blabel0[c]; }
    destroyed = []; bdam.fill(0); wetUntil.fill(0); if (fdead) { fdead.fill(0); fgone.fill(0); fdmgFlag.fill(0); } S.goneQ = []; S.dmgQ = []; S.dust = []; S.splash = []; S.bldDestroyed = 0; S.doused = 0;
    for (let j = 0; j < S.nw; j++) { const c = wallList[j]; walk[c] = (walk[c] & 2) | 1; }
    for (const c of wireList) walk[c] &= ~32; wireList.length = 0;
    for (const c of fireList) fstate[c] = 0; fstate.fill(0); fireList = []; for (const c of heatList) heat[c] = 0; heatList = []; S.strafes = []; S.missiles = []; S.gfires = []; S.nFire = 0; S.lostShip = 0;
    S.nw = 0; S.wallsDirty = false; odest.fill(-1); S.zones = []; S.stations = []; S.evac = 0; S.safeDirty = false; hasSafe = false; hasZone = false;
    type.fill(0); sel.fill(0); mode.fill(0); S.n = 0; free.length = 0; trTtl.fill(0); pdist.fill(INF); zdist.fill(INF); rdist.fill(INF);
    S.kills = 0; S.drops = 0; S.time = 0; S.tick = 0; S.fresh = true; S.outbreaks = []; S.lost = 0; S.spent = 0;
    applyUp(); S.budget = CFG.START_BUDGET + (S.up.chest || 0) * CFG.UPGRADES.chest.per; S.cratesOpened = 0; S.free = { bomb: 0, heli: 0, nuke: 0 }; S.intel = false; // S.up and S.freeCrates are set by the game before reset
    S.lostApc = 0; S.lostTurret = 0; S.ntu = 0; S.na = 0; S.nm = 0; S.lostMortar = 0; S.collateral = 0; S.shells = []; S.blasts = []; S.planes = []; S.helis = []; S.inbound = []; S.pendingDrops = [];
    S.nukes = []; S.fallout = []; S.flash = 0; S.nukesUsed = 0; S.garrisons = []; gar.fill(0); lock.fill(0); cls.fill(0); ogar.fill(0); bmask.fill(0); edist.fill(INF); S.breaches = 0; rounds.fill(0); rst.fill(0); sub.fill(0);
    S.started = false; S.zombies0 = 0; hordeT = 0; S.bgKills = 0; S.ndry = 0; S.ngar = 0; S.lastGarrison = null;
    // ---- hidden conditions for this match: nobody sees these until the end screen ----
    const R = CFG.RANDOM;
    S.strain = S.fixedStrain ? Object.assign({}, S.fixedStrain) : { speed: rr(R.STRAIN_SPEED), health: rr(R.STRAIN_HEALTH), reach: rr(R.STRAIN_REACH) };
    S.humans0 = Math.max(200, Math.min(CFG.HUMANS, Math.round(CFG.HUMANS * rr(R.POPULATION) * S.popScale)));
    const hot = [], nHot = Math.round(rr(R.HOTSPOTS)); // crowded districts
    for (let k = 0; k < nHot; k++) { const c = wcells[(rnd() * wcells.length) | 0]; hot.push({ x: -HALF + (c % N + 0.5) * RES, y: -HALF + (((c / N) | 0) + 0.5) * RES, r: rr(R.HOTSPOT_RADIUS) }); }
    for (let k = 0; k < S.humans0; k++) {
      const i = S.n++; let placed = false;
      if (nHot && rnd() < R.HOTSPOT_SHARE) { const h = hot[(rnd() * nHot) | 0];
        for (let tries = 0; tries < 10 && !placed; tries++) { const a = rnd() * 6.283, d = h.r * Math.abs(rnd() + rnd() - 1), x = h.x + Math.cos(a) * d, y = h.y + Math.sin(a) * d;
          if (ok(x, y)) { px[i] = x; py[i] = y; placed = true; } } }
      if (!placed) randomStreetPoint(i);
      const h = rnd() * 6.283; wvx[i] = Math.cos(h); wvy[i] = Math.sin(h);
      type[i] = HUMAN; spd[i] = 0.6 + rnd() * 0.65;
    }
    S.planSites = []; const nSites = S.siteCount != null ? S.siteCount : Math.max(1, Math.round(rr(R.SITES))); // decided now, shown to nobody
    for (let o = 0; o < nSites; o++) { const c = wcells[(rnd() * wcells.length) | 0]; S.planSites.push({ x: -HALF + (c % N + 0.5) * RES, y: -HALF + (((c / N) | 0) + 0.5) * RES, cnt: Math.max(1, Math.round(rr(R.ZOMBIES_PER_SITE))) }); }
    S.nh = S.humans0; S.nz = 0; S.nt = 0;
    hordeInit(); S.allH = S.nh + S.bgH; S.allZ = 0; S.allH0 = S.humans0 + S.bgH0;
  };
  // The outbreak begins: zombies appear at a random number of random sites, in random strength.
  S.startOutbreak = function () {
    if (S.started) return; S.started = true; S.planning = false; S.fresh = true;
    for (const site of S.planSites) {
      const ox = site.x, oy = site.y, cnt = site.cnt;
      S.outbreaks.push([ox, oy, cnt]);
      for (let k = 0; k < cnt; k++) {
        const i = alloc(); if (i < 0) break; px[i] = ox; py[i] = oy;
        for (let tries = 0; tries < 30; tries++) {
          const d = Math.sqrt(rnd()) * 70, aa = rnd() * 6.283, x = ox + Math.cos(aa) * d, y = oy + Math.sin(aa) * d;
          if (ok(x, y)) { px[i] = x; py[i] = y; break; }
        }
        makeZombie(i); S.zombies0++;
      }
    }
    if (S.seed) for (let k = 0; k < S.seed.length; k += 2) { const i = alloc(); if (i < 0) break;
      let x = S.seed[k], y = S.seed[k + 1]; if (!ok(x, y)) { const c = nearestWalk(x, y); if (c < 0) { type[i] = NONE; free.push(i); continue; } x = -HALF + (c % N + 0.5) * RES; y = -HALF + (((c / N) | 0) + 0.5) * RES; }
      px[i] = x; py[i] = y; makeZombie(i); S.zombies0++; }
    if (S.seed && S.seed.length) S.outbreaks.push([0, 0, S.seed.length / 2]);
    if (S.seedBg) for (let k = 0; k < S.seedBg.length; k += 3) { const h = hcOf(S.seedBg[k], S.seedBg[k + 1]); bZ[h] += S.seedBg[k + 2]; S.bgZ += S.seedBg[k + 2]; }
    S.nz = S.zombies0; // count them now, so the game doesn't think the outbreak is already over
  };

  // Nearest walkable cell to (x,y) within ~120 m, or -1.
  function nearestWalk(x, y) {
    const c = nav(x, y); if (walk[c] & 1) return c;
    const cx = c % N, cy = (c / N) | 0; let best = -1, bd = 1e9;
    for (let rr = 1; rr <= 40 && best < 0; rr++)
      for (let yy = cy - rr; yy <= cy + rr; yy++) { if (yy < 0 || yy >= N) continue;
        const edge = yy === cy - rr || yy === cy + rr;
        for (let xx = cx - rr; xx <= cx + rr; xx += edge ? 1 : 2 * rr) { if (xx < 0 || xx >= N) continue;
          if (walk[xx + yy * N] & 1) { const d = (xx - cx) * (xx - cx) + (yy - cy) * (yy - cy); if (d < bd) { bd = d; best = xx + yy * N; } } } }
    return best;
  }
  // ---- unit orders ----
  const isTroop = (i) => !lock[i] && (type[i] === TROOPER || type[i] === FALLING || (type[i] === APC && cls[i] !== 2) || type[i] === MORTAR); // turrets and bought garrisons take no orders
  S.countSel = function () { let c = 0; for (let i = 0; i < S.n; i++) if (sel[i] && isTroop(i)) c++; return (S.nsel = c); };
  S.clearSel = function () { sel.fill(0); S.nsel = 0; };
  S.selectAll = function () { for (let i = 0; i < S.n; i++) sel[i] = isTroop(i) ? 1 : 0; return S.countSel(); };
  S.selectQuad = function (q, add) { // q = 4 ground points in order
    if (!add) sel.fill(0);
    for (let i = 0; i < S.n; i++) { if (!isTroop(i)) continue;
      const x = px[i], y = py[i]; let pos = 0, neg = 0;
      for (let k = 0; k < 4; k++) { const a = q[k], b = q[(k + 1) & 3], cr = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]); if (cr > 0) pos++; else if (cr < 0) neg++; }
      if (pos === 0 || neg === 0) sel[i] = 1; }
    return S.countSel();
  };
  S.orderMode = function (m) { for (let i = 0; i < S.n; i++) if (sel[i] && isTroop(i)) { if (m === 0 && gar[i]) leave(i); mode[i] = m; adv[i] = 0; } };
  // ---- garrisons ----
  function cellXY(i, c, j) { px[i] = -HALF + (c % N + 0.5 + (rnd() - 0.5) * j) * RES; py[i] = -HALF + (((c / N) | 0) + 0.5 + (rnd() - 0.5) * j) * RES; }
  function garrisonAt(c0, x, y) { // find or create the garrison record for the building under cell c0
    const b = blabel[c0], entry = nearestWalk(x, y); if (!b || entry < 0 || fstate[c0]) return -1; // can't garrison a burning or gutted building
    let gi = S.garrisons.findIndex((g) => g.id === b);
    if (gi >= 0 && S.garrisons[gi].count > 0) return gi;
    const cells = [c0], seen = new Set(cells); let hmax = bheight[c0]; // the part of the building nearest the click
    for (let q = 0; q < cells.length && cells.length < 600; q++) { const c = cells[q], cx = c % N;
      for (const m of [cx > 0 ? c - 1 : -1, cx < N - 1 ? c + 1 : -1, c - N, c + N]) if (m >= 0 && m < NN && blabel[m] === b && !seen.has(m)) { seen.add(m); cells.push(m); if (bheight[m] > hmax) hmax = bheight[m]; } }
    const rec = { id: b, entry, ex: -HALF + (entry % N + 0.5) * RES, ey: -HALF + (((entry / N) | 0) + 0.5) * RES, cells, count: 0, breach: 0, h: hmax,
      area: Math.round(barea[b] * RES * RES), floors: Math.max(1, Math.round((bhsum[b] / barea[b] || CFG.FLOOR_HEIGHT) / CFG.FLOOR_HEIGHT)), cap: 0,
      bonus: Math.min(CFG.GARRISON_MAX_BONUS, CFG.GARRISON_MIN_BONUS + hmax * CFG.GARRISON_RANGE_PER_M) };
    rec.cap = Math.max(CFG.GARRISON_MIN, Math.min(CFG.GARRISON_MAX, Math.round(rec.area * rec.floors / CFG.GARRISON_M2_PER_TROOPER))); // footprint x storeys
    if (gi >= 0) S.garrisons[gi] = rec; else gi = S.garrisons.push(rec) - 1;
    return gi;
  }
  function enter(i, gi) { const g = S.garrisons[gi]; if (!g || g.count >= g.cap) return;
    g.count++; gar[i] = gi + 1; adv[i] = 0; cellXY(i, g.cells[(rnd() * g.cells.length) | 0], 0.8); }
  function leave(i) { if (lock[i]) return; const g = S.garrisons[gar[i] - 1]; gar[i] = 0; if (g) { g.count--; cellXY(i, g.entry, 0.8); } }
  // ---- buying a garrison: troops appear inside the building, cost depends on its size, and they never leave ----
  function buildingAt(x, y) { if (!(Math.abs(x) < HALF && Math.abs(y) < HALF)) return -1; const c = nav(x, y); return (walk[c] & 2) && blabel[c] ? c : -1; }
  S.garrisonQuote = function (x, y) {
    const c0 = buildingAt(x, y); if (c0 < 0 || fstate[c0]) return null; const b = blabel[c0];
    const g = S.garrisons.find((r) => r.id === b && r.count > 0);
    const area = barea[b] * RES * RES, floors = Math.max(1, Math.round((bhsum[b] / barea[b] || CFG.FLOOR_HEIGHT) / CFG.FLOOR_HEIGHT));
    const cap = g ? g.cap : Math.max(CFG.GARRISON_MIN, Math.min(CFG.GARRISON_MAX, Math.round(area * floors / CFG.GARRISON_M2_PER_TROOPER)));
    const need = cap - (g ? g.count : 0);
    return { cap, need, inside: g ? g.count : 0, cost: need * CFG.GARRISON_COST_PER_TROOP, floors, area: Math.round(area) };
  };
  S.buyGarrison = function (x, y) {
    const c0 = buildingAt(x, y); if (c0 < 0) return null;
    const gi = garrisonAt(c0, x, y); if (gi < 0) return null; const g = S.garrisons[gi];
    const n = Math.min(g.cap - g.count, Math.floor(S.budget / CFG.GARRISON_COST_PER_TROOP)); if (n <= 0) return { n: 0, cap: g.cap, full: g.count >= g.cap };
    const cost = n * CFG.GARRISON_COST_PER_TROOP; S.budget -= cost; S.spent += cost;
    for (let k = 0; k < n; k++) { const i = alloc(); if (i < 0) break;
      type[i] = TROOPER; cls[i] = 0; sel[i] = 0; mode[i] = 1; adv[i] = 0; spd[i] = 1; timer[i] = rnd(); ammo[i] = Wd.trooper.mag; rounds[i] = Wd.trooper.ammo; rst[i] = 0;
      gar[i] = gi + 1; lock[i] = 1; g.count++; cellXY(i, g.cells[(rnd() * g.cells.length) | 0], 0.8); }
    S.lastGarrison = g; return { n, cost, cap: g.cap, floors: g.floors };
  };
  // Send the selected troopers to (x,y). Returns the snapped destination or null.
  S.orderMove = function (x, y) {
    const cnt = S.countSel(); if (!cnt) return null;
    const c0 = nav(x, y), inB = Math.abs(x) < HALF && Math.abs(y) < HALF && (walk[c0] & 2) && blabel[c0];
    const gi = inB ? garrisonAt(c0, x, y) : -1; // clicking a building = garrison it
    S.lastGarrison = gi >= 0 ? S.garrisons[gi] : null;
    const dest = gi >= 0 ? S.garrisons[gi].entry : nearestWalk(x, y); if (dest < 0) return null;
    const use = new Int32Array(ORDERS); for (let i = 0; i < S.n; i++) if (isTroop(i) && mode[i] >= 2 && !sel[i]) use[mode[i] - 2]++;
    let k = -1; for (let j = 0; j < ORDERS; j++) if (use[j] === 0) { k = j; break; }
    if (k < 0) { k = onext; onext = (onext + 1) % ORDERS; for (let i = 0; i < S.n; i++) if (mode[i] === k + 2) mode[i] = 1; }
    const f = ofield[k]; f.fill(INF); f[dest] = 0; queue[0] = dest; bfs(f, 1, false); odest[k] = dest;
    orad[k] = gi >= 0 ? 2 : Math.max(1, Math.round(Math.sqrt(cnt) * 0.45)); ogar[k] = gi + 1;
    for (let i = 0; i < S.n; i++) if (sel[i] && isTroop(i)) {
      if (gar[i]) { if (gar[i] === gi + 1) continue; leave(i); } // already inside the target building: stay
      mode[i] = k + 2; }
    return [-HALF + (dest % N + 0.5) * RES, -HALF + (((dest / N) | 0) + 0.5) * RES];
  };

  // ---- barricades and gates ----
  function wallCells(x0, y0, x1, y1) { // walkable cells under a ~2-cell-thick line
    let dx = x1 - x0, dy = y1 - y0; const len0 = Math.hypot(dx, dy);
    if (len0 > CFG.WALL_MAX_LEN) { dx *= CFG.WALL_MAX_LEN / len0; dy *= CFG.WALL_MAX_LEN / len0; }
    const len = Math.min(len0, CFG.WALL_MAX_LEN), st = Math.max(1, Math.ceil(len)), nx = len ? -dy / len : 0, ny = len ? dx / len : 0, out = [];
    let built = 0; // metres of line that actually cross open ground (you only pay for those)
    for (let k = 0; k <= st; k++) for (let o = -1; o <= 1; o++) {
      const x = x0 + dx * k / st + nx * o * RES * 0.75, y = y0 + dy * k / st + ny * o * RES * 0.75;
      if (!(x > -HALF && x < HALF && y > -HALF && y < HALF)) continue;
      const c = nav(x, y); if ((walk[c] & 13) !== 1) continue;
      if (o === 0) built += len / st;
      if (!out.includes(c)) out.push(c);
    }
    return { cells: out, len: Math.max(built, out.length ? RES : 0) };
  }
  S.wallCost = function (x0, y0, x1, y1, gate) { const w = wallCells(x0, y0, x1, y1); return w.cells.length ? Math.ceil(w.len * (gate ? CFG.GATE_COST : CFG.BARRICADE_COST)) : 0; };
  S.buildWall = function (x0, y0, x1, y1, gate) {
    const w = wallCells(x0, y0, x1, y1), cost = Math.ceil(w.len * (gate ? CFG.GATE_COST : CFG.BARRICADE_COST));
    if (!w.cells.length || S.budget < cost || S.nw + w.cells.length > WALLCAP) return false;
    S.budget -= cost; S.spent += cost;
    for (const c of w.cells) { walk[c] = gate ? (walk[c] | 8) : ((walk[c] & 2) | 4); bhp[c] = (gate ? CFG.GATE_HP : CFG.WALL_HP) * S.wallHp; wallList[S.nw++] = c; }
    S.wallsDirty = true;
    return true;
  };
  function refreshWalls() { // drop destroyed cells, re-route standing move orders
    let k = 0; for (let j = 0; j < S.nw; j++) if (walk[wallList[j]] & 12) wallList[k++] = wallList[j];
    S.nw = k; S.wallsDirty = false; S.fresh = true; S.safeDirty = true; S.labDirty = true;
    for (let o = 0; o < ORDERS; o++) if (odest[o] >= 0) { const f = ofield[o]; f.fill(INF); f[odest[o]] = 0; queue[0] = odest[o]; bfs(f, 1, false); }
  }

  function killAgent(i) { // remove anyone, with the right bookkeeping
    const t = type[i]; if (t === NONE) return;
    if (t === ZOMBIE) S.kills++; else if (t === HUMAN) S.collateral++;
    else if (t === TROOPER || t === FALLING) { S.lost++; if (gar[i]) { const g = S.garrisons[gar[i] - 1]; if (g) g.count--; gar[i] = 0; } }
    else if (t === APC) { if (cls[i] === 2) S.lostTurret++; else S.lostApc++; } else if (t === MORTAR) S.lostMortar++; else if (t === SHIP) S.lostShip++;
    type[i] = NONE; sel[i] = 0; free.push(i);
  }
  S.nuke = function (x, y) {
    if (S.planning || (!S.free.nuke && S.budget < CFG.NUKE_COST) || Math.abs(x) > HALF || Math.abs(y) > HALF) return false;
    if (S.free.nuke) S.free.nuke--; else { S.budget -= CFG.NUKE_COST; S.spent += CFG.NUKE_COST; } S.nukesUsed++;
    S.nukes.push({ x, y, t: CFG.NUKE_DELAY }); S.inbound.push({ k: 'nuke', x, y, t: CFG.NUKE_DELAY });
    return true;
  };
  // ---- new units and strikes ----
  function spend(c) { if (S.budget < c) return false; S.budget -= c; S.spent += c; return true; }
  S.addHowitzer = function (x, y) {
    const c = nearestWalk(x, y); if (c < 0 || !spend(CFG.HOWITZER_COST)) return false;
    let lead = -1; const t0 = 2 + rnd() * 2;
    for (let g = 0; g < CFG.HOWITZER_GUNS; g++) { // guns side by side, 12 m apart
      const ox = (g - (CFG.HOWITZER_GUNS - 1) / 2) * 12; let cc = nearestWalk(-HALF + (c % N + 0.5) * RES + ox, -HALF + (((c / N) | 0) + 0.5) * RES); if (cc < 0) cc = c;
      const i = alloc(); if (i < 0) break; if (lead < 0) lead = i;
      px[i] = -HALF + (cc % N + 0.5) * RES; py[i] = -HALF + (((cc / N) | 0) + 0.5) * RES;
      type[i] = MORTAR; cls[i] = 1; gar[i] = 0; rounds[i] = Wd.howitzer.ammo; rst[i] = 0; timer[i] = t0; adv[i] = 0; sel[i] = 0; mode[i] = 1; spd[i] = 1; btry[i] = lead + 1; }
    return lead >= 0;
  };
  function nearestWater(x, y) { const c = nav(x, y); if (walk[c] & 16) return c; const cx = c % N, cy = (c / N) | 0;
    for (let r = 1; r <= 25; r++) for (let yy = cy - r; yy <= cy + r; yy++) { if (yy < 0 || yy >= N) continue; const edge = yy === cy - r || yy === cy + r;
      for (let xx = cx - r; xx <= cx + r; xx += edge ? 1 : 2 * r) { if (xx < 0 || xx >= N) continue; if (walk[xx + yy * N] & 16) return xx + yy * N; } }
    return -1; }
  S.addShip = function (x, y) {
    if (!(Math.abs(x) < HALF && Math.abs(y) < HALF)) return 'off';
    const c = nearestWater(x, y); if (c < 0) return 'water'; if (S.budget < CFG.SHIP_COST) return 'money';
    const i = alloc(); if (i < 0) return 'full'; spend(CFG.SHIP_COST);
    px[i] = -HALF + (c % N + 0.5) * RES; py[i] = -HALF + (((c / N) | 0) + 0.5) * RES;
    type[i] = SHIP; cls[i] = 0; gar[i] = 0; rounds[i] = Wd.ship.ammo; msl[i] = CFG.SHIP_MISSILES; timer[i] = 1 + rnd(); sel[i] = 0; mode[i] = 1; spd[i] = 1;
    return 'ok';
  };
  S.missilesLeft = function () { let m = 0; for (let i = 0; i < S.n; i++) if (type[i] === SHIP) m += msl[i]; return m; };
  S.fireMissile = function (x, y) { // nearest destroyer with missiles left fires one at (x,y)
    if (S.planning || !(Math.abs(x) < HALF && Math.abs(y) < HALF)) return false;
    let best = -1, bd = 1e18; for (let i = 0; i < S.n; i++) if (type[i] === SHIP && msl[i] > 0) { const d = (px[i] - x) ** 2 + (py[i] - y) ** 2; if (d < bd) { bd = d; best = i; } }
    if (best < 0) return false; msl[best]--;
    const d = Math.sqrt(bd); S.missiles.push({ sx: px[best], sy: py[best], tx: x, ty: y, t: d / CFG.MISSILE_SPEED + 0.6, T: d / CFG.MISSILE_SPEED + 0.6 }); emit(19, px[best], py[best]);
    return true;
  };
  S.precisionBomb = function (x, y) {
    if (S.planning || !(Math.abs(x) < HALF && Math.abs(y) < HALF) || !spend(CFG.PRECISION_COST)) return false;
    S.shells.push({ x: x + (rnd() - 0.5) * 4, y: y + (rnd() - 0.5) * 4, t: CFG.PRECISION_DELAY, r: CFG.PRECISION_BLAST, dz: CFG.PRECISION_DAMAGE, dmg: 600, walls: true, snd: 7 }); S.inbound.push({ k: 'precision', x, y, t: CFG.PRECISION_DELAY });
    emit(14, x, y); return true;
  };
  S.strafe = function (x0, y0, x1, y1) { // A-10: a line of 30 mm fire, narrow and deadly, civilians included
    if (S.planning || !spend(CFG.STRAFE_COST)) return false;
    let dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy); if (len < 10) { dx = 1; dy = 0; len = 150; x0 -= 75; } else { dx /= len; dy /= len; }
    len = Math.min(len, CFG.STRAFE_LEN);
    S.strafes.push({ x0, y0, dx, dy, len, t: CFG.STRAFE_DELAY, prog: 0, hit: new Set() }); S.inbound.push({ k: 'strafe', x: x0 + dx * len / 2, y: y0 + dy * len / 2, t: CFG.STRAFE_DELAY });
    S.planes.push({ x: x0, y: y0, dx, dy, v: len / CFG.STRAFE_TIME, age: 0, delay: CFG.STRAFE_DELAY, jet: 1 });
    return true;
  };
  S.firebomb = function (x0, y0, x1, y1) {
    if (S.planning || !spend(CFG.FIRE_COST)) return false;
    let dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy); if (len < 10) { dx = 1; dy = 0; len = 80; x0 -= 40; } else { dx /= len; dy /= len; }
    len = Math.min(len, CFG.FIRE_RUN_LEN); const nb = Math.max(2, Math.round(len / CFG.FIRE_SPACING)) + 1, gap = 0.15;
    for (let k = 0; k < nb; k++) S.shells.push({ x: x0 + dx * len * k / (nb - 1), y: y0 + dy * len * k / (nb - 1), t: CFG.BOMB_DELAY + k * gap, r: CFG.FIRE_BLAST, dz: 9999, dmg: 200, fire: true, snd: 20 }); S.inbound.push({ k: 'firebomb', x: x0 + dx * len / 2, y: y0 + dy * len / 2, t: CFG.BOMB_DELAY });
    S.planes.push({ x: x0, y: y0, dx, dy, v: len / ((nb - 1) * gap), age: 0 }); emit(14, x0 + dx * len / 2, y0 + dy * len / 2);
    return true;
  };
  // ---- razor wire ----
  function wireCells(x0, y0, x1, y1) { let dx = x1 - x0, dy = y1 - y0; const len0 = Math.hypot(dx, dy);
    if (len0 > CFG.WALL_MAX_LEN) { dx *= CFG.WALL_MAX_LEN / len0; dy *= CFG.WALL_MAX_LEN / len0; }
    const len = Math.min(len0, CFG.WALL_MAX_LEN), st = Math.max(1, Math.ceil(len)), nx = len ? -dy / len : 0, ny = len ? dx / len : 0, out = new Set();
    for (let k = 0; k <= st; k++) for (let o = -1; o <= 1; o++) { const x = x0 + dx * k / st + nx * o * RES, y = y0 + dy * k / st + ny * o * RES;
      if (!(x > -HALF && x < HALF && y > -HALF && y < HALF)) continue; const c = nav(x, y); if ((walk[c] & 45) === 1) out.add(c); }
    return { cells: [...out], len }; }
  S.wireCost = function (x0, y0, x1, y1) { const w = wireCells(x0, y0, x1, y1); return w.cells.length ? Math.max(1, Math.ceil(w.cells.length / 3 * RES * CFG.WIRE_COST)) : 0; };
  S.buildWire = function (x0, y0, x1, y1) { const w = wireCells(x0, y0, x1, y1), cost = Math.max(1, Math.ceil(w.cells.length / 3 * RES * CFG.WIRE_COST));
    if (!w.cells.length || !spend(cost)) return false; for (const c of w.cells) { walk[c] |= 32; wireList.push(c); } return true; };
  // ---- fire ----
  function ignite(c) { if (c >= 0 && c < NN && (walk[c] & 2) && !fstate[c] && wetUntil[c] <= S.time) { fstate[c] = 1; fstart[c] = S.time; fireList.push(c); } }
  function igniteArea(x, y, r) { const c0 = nav(x - r, y - r), c1 = nav(x + r, y + r);
    for (let cy = (c0 / N) | 0; cy <= ((c1 / N) | 0); cy++) for (let cx = c0 % N; cx <= c1 % N; cx++) {
      const dx = -HALF + (cx + 0.5) * RES - x, dy = -HALF + (cy + 0.5) * RES - y; if (dx * dx + dy * dy <= r * r) ignite(cx + cy * N); } }
  S.igniteArea = igniteArea;
  function douse(x, y, r) { let n0 = 0; const c0 = nav(x - r, y - r), c1 = nav(x + r, y + r);
    for (let cy = (c0 / N) | 0; cy <= ((c1 / N) | 0); cy++) for (let cx = c0 % N; cx <= c1 % N; cx++) {
      const dx = -HALF + (cx + 0.5) * RES - x, dy = -HALF + (cy + 0.5) * RES - y; if (dx * dx + dy * dy > r * r) continue; const c = cx + cy * N;
      wetUntil[c] = S.time + CFG.WATER_WET_TIME; if (fstate[c] === 1) { fstate[c] = 0; n0++; } }
    for (let q = S.gfires.length - 1; q >= 0; q--) { const g = S.gfires[q]; if (Math.hypot(g.x - x, g.y - y) < r + g.r) S.gfires.splice(q, 1); }
    S.doused = (S.doused || 0) + n0; }
  S.waterbomb = function (x0, y0, x1, y1) { // a water bomber run: puts out fire along the line and soaks the buildings
    if (S.planning || !spend(CFG.WATER_COST)) return false;
    let dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy); if (len < 10) { dx = 1; dy = 0; len = 120; x0 -= 60; } else { dx /= len; dy /= len; }
    len = Math.min(len, CFG.WATER_RUN_LEN); const nb = Math.max(2, Math.round(len / CFG.WATER_SPACING)) + 1, gap = 0.08;
    for (let k = 0; k < nb; k++) S.shells.push({ x: x0 + dx * len * k / (nb - 1), y: y0 + dy * len * k / (nb - 1), t: CFG.WATER_DELAY + k * gap, r: CFG.WATER_BLAST, water: true, snd: 22 }); S.inbound.push({ k: 'water', x: x0 + dx * len / 2, y: y0 + dy * len / 2, t: CFG.WATER_DELAY });
    S.planes.push({ x: x0, y: y0, dx, dy, v: len / ((nb - 1) * gap), age: 0, delay: CFG.WATER_DELAY - 0.6 }); emit(14, x0 + dx * len / 2, y0 + dy * len / 2);
    return true;
  };
  // ---- air support (only once the outbreak is live) ----
  S.airstrike = function (x0, y0, x1, y1) {
    if (S.planning || (!S.free.bomb && S.budget < CFG.BOMB_COST)) return false;
    let dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
    if (len < 10) { dx = 1; dy = 0; len = 70; x0 -= 35; } else { dx /= len; dy /= len; }
    if (len > CFG.BOMB_RUN_LEN) len = CFG.BOMB_RUN_LEN;
    if (S.free.bomb) S.free.bomb--; else { S.budget -= CFG.BOMB_COST; S.spent += CFG.BOMB_COST; }
    const nb = Math.max(2, Math.round(len / CFG.BOMB_SPACING * 1.5)) + 1, gap = 0.09;
    for (let k = 0; k < nb; k++) { const o = (rnd() - 0.5) * CFG.BOMB_SCATTER, a = (rnd() - 0.5) * 12; S.shells.push({ x: x0 + dx * (len * k / (nb - 1) + a) - dy * o, y: y0 + dy * (len * k / (nb - 1) + a) + dx * o, t: CFG.BOMB_DELAY + k * gap, r: CFG.BOMB_BLAST, dmg: 400, dz: CFG.BOMB_DAMAGE, walls: true }); }
    S.planes.push({ x: x0, y: y0, dx, dy, v: len / ((nb - 1) * gap), age: 0 }); emit(14, x0 + dx * len / 2, y0 + dy * len / 2); S.inbound.push({ k: 'bomb', x: x0 + dx * len / 2, y: y0 + dy * len / 2, t: CFG.BOMB_DELAY });
    return true;
  };
  S.gunship = function (x, y) {
    if (S.planning || (!S.free.heli && S.budget < CFG.HELI_COST) || Math.abs(x) > HALF || Math.abs(y) > HALF) return false;
    if (S.free.heli) S.free.heli--; else { S.budget -= CFG.HELI_COST; S.spent += CFG.HELI_COST; }
    S.helis.push({ x, y, hx: x, hy: y, t: CFG.HELI_TIME, delay: CFG.HELI_DELAY, a: rnd() * 6.283, acc: 0, age: 0 }); S.inbound.push({ k: 'heli', x, y, t: CFG.HELI_DELAY });
    return true;
  };
  S.addTurret = function (x, y) {
    const c = nearestWalk(x, y); if (c < 0 || S.budget < CFG.TURRET_COST) return false;
    const i = alloc(); if (i < 0) return false;
    S.budget -= CFG.TURRET_COST; S.spent += CFG.TURRET_COST;
    px[i] = -HALF + (c % N + 0.5) * RES; py[i] = -HALF + (((c / N) | 0) + 0.5) * RES;
    type[i] = APC; cls[i] = 2; gar[i] = 0; ahp[i] = CFG.TURRET_HP; ammo[i] = Wd.turret.mag; rounds[i] = Wd.turret.ammo; rst[i] = 0; timer[i] = 0; adv[i] = 0; sel[i] = 0; mode[i] = 1; spd[i] = 1;
    return true;
  };
  S.addSnipers = function (x, y) { // a small team: long range, slow fire, holds position; best on a tall roof
    const cb = buildingAt(x, y);
    if (cb >= 0 && !fstate[cb]) { // on the roof: they stay up there, with height bonuses to range, fire rate and ammo
      const gi = garrisonAt(cb, x, y); if (gi < 0) return false; const g = S.garrisons[gi], cost = Math.round(CFG.SNIPER_COST + g.h * CFG.ROOF_COST_PER_M);
      if (S.budget < cost) return false; S.budget -= cost; S.spent += cost; const extra = Math.min(CFG.ROOF_AMMO_MAX, Math.round(g.h * CFG.ROOF_AMMO_PER_M));
      for (let k = 0; k < CFG.SNIPER_SQUAD; k++) { const i = alloc(); if (i < 0) break;
        type[i] = TROOPER; cls[i] = 1; sel[i] = 0; mode[i] = 1; adv[i] = 0; spd[i] = 1; timer[i] = rnd(); ammo[i] = Wd.sniper.mag; rounds[i] = Wd.sniper.ammo + extra; rst[i] = 0;
        gar[i] = gi + 1; lock[i] = 1; g.count++; cellXY(i, g.cells[(rnd() * g.cells.length) | 0], 0.8); }
      S.lastRoof = { h: g.h, extra, cost, rate: Math.round(Math.min(CFG.ROOF_RATE_MAX, g.h * CFG.ROOF_RATE_PER_M) * 100) };
      return 'roof'; }
    const c = nearestWalk(x, y); if (c < 0 || S.budget < CFG.SNIPER_COST) return false;
    S.budget -= CFG.SNIPER_COST; S.spent += CFG.SNIPER_COST;
    for (let k = 0; k < CFG.SNIPER_SQUAD; k++) { const i = alloc(); if (i < 0) break;
      px[i] = -HALF + (c % N + 0.15 + rnd() * 0.7) * RES; py[i] = -HALF + (((c / N) | 0) + 0.15 + rnd() * 0.7) * RES;
      type[i] = TROOPER; cls[i] = 1; gar[i] = 0; ammo[i] = Wd.sniper.mag; rounds[i] = Wd.sniper.ammo; rst[i] = 0; timer[i] = rnd(); adv[i] = 0; sel[i] = 0; mode[i] = 1; spd[i] = 1; }
    return true;
  };
  S.addMortar = function (x, y) {
    const c = nearestWalk(x, y); if (c < 0 || S.budget < CFG.MORTAR_COST) return false;
    const i = alloc(); if (i < 0) return false;
    S.budget -= CFG.MORTAR_COST; S.spent += CFG.MORTAR_COST;
    px[i] = -HALF + (c % N + 0.5) * RES; py[i] = -HALF + (((c / N) | 0) + 0.5) * RES;
    type[i] = MORTAR; cls[i] = 0; gar[i] = 0; rounds[i] = Wd.mortar.ammo; rst[i] = 0; timer[i] = 1 + rnd(); adv[i] = 0; sel[i] = 0; mode[i] = 1; spd[i] = 1;
    return true;
  };
  S.addApc = function (x, y) {
    const c = nearestWalk(x, y); if (c < 0 || S.budget < CFG.APC_COST) return false;
    const i = alloc(); if (i < 0) return false;
    S.budget -= CFG.APC_COST; S.spent += CFG.APC_COST;
    px[i] = -HALF + (c % N + 0.5) * RES; py[i] = -HALF + (((c / N) | 0) + 0.5) * RES;
    type[i] = APC; cls[i] = 0; gar[i] = 0; ahp[i] = CFG.APC_HP; ammo[i] = Wd.apc.mag; rounds[i] = Wd.apc.ammo; rst[i] = 0; timer[i] = 0; adv[i] = 0; sel[i] = 0; mode[i] = 0; spd[i] = 1; // drives out hunting, like the troops
    return true;
  };
  // ---- safe zones and evacuation stations ----
  // Safe zones are polygons of any shape (drawn freehand or point by point). A zombie inside one breaches it.
  function inPoly(P, x, y) { let c = false; for (let a = 0, b = P.length - 1; a < P.length; b = a++) {
    const ya = P[a][1], yb = P[b][1]; if ((ya > y) !== (yb > y) && x < (P[b][0] - P[a][0]) * (y - ya) / (yb - ya) + P[a][0]) c = !c; } return c; }
  function polyArea(P) { let s = 0; for (let a = 0, b = P.length - 1; a < P.length; b = a++) s += (P[b][0] + P[a][0]) * (P[b][1] - P[a][1]); return Math.abs(s / 2); }
  S.zoneQuote = function (P) { const area = P.length >= 3 ? polyArea(P) : 0; return { area, cost: Math.max(CFG.ZONE_MIN_COST, Math.ceil(area * CFG.ZONE_COST_PER_M2)) }; };
  S.addZonePoly = function (P) {
    if (P.length < 3) return { ok: false, why: 'Draw at least three points.' };
    const q = S.zoneQuote(P);
    if (q.area < 200) return { ok: false, why: 'That safe zone is too small.' };
    if (q.area > CFG.ZONE_MAX_AREA) return { ok: false, why: 'That safe zone is too big (max ' + Math.round(CFG.ZONE_MAX_AREA / 1000) + ',000 m²).' };
    if (S.zones.length >= 32) return { ok: false, why: 'Too many safe zones.' };
    if (S.budget < q.cost) return { ok: false, why: 'Not enough money ($' + q.cost + ').' };
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, cx = 0, cy = 0;
    for (const v of P) { x0 = Math.min(x0, v[0]); y0 = Math.min(y0, v[1]); x1 = Math.max(x1, v[0]); y1 = Math.max(y1, v[1]); cx += v[0]; cy += v[1]; }
    S.budget -= q.cost; S.spent += q.cost;
    S.zones.push({ pts: P, x0, y0, x1, y1, x: cx / P.length, y: cy / P.length, area: q.area, breached: false }); S.safeDirty = true;
    return { ok: true, cost: q.cost, area: q.area };
  };
  S.addZone = function (x, y, r) { const P = []; for (let k = 0; k < 24; k++) P.push([x + Math.cos(k / 24 * 6.2832) * r, y + Math.sin(k / 24 * 6.2832) * r]); return S.addZonePoly(P).ok; };
  S.removeZoneAt = function (x, y) {
    for (let k = S.zones.length - 1; k >= 0; k--) if (inPoly(S.zones[k].pts, x, y)) { S.zones.splice(k, 1); S.safeDirty = true; return true; }
    return false;
  };
  S.zoneAt = function (x, y) { for (const z of S.zones) if (inPoly(z.pts, x, y)) return z; return null; };
  S.addStation = function (x, y) {
    const c = nearestWalk(x, y);
    if (c < 0 || S.budget < CFG.EVAC_COST || S.stations.length >= 32) return false;
    S.budget -= CFG.EVAC_COST; S.spent += CFG.EVAC_COST;
    S.stations.push({ x: -HALF + (c % N + 0.5) * RES, y: -HALF + (((c / N) | 0) + 0.5) * RES, acc: 0 }); S.safeDirty = true; return true;
  };
  function refreshSafe() { // walking distance to the nearest safe zone / station (humans may use gates)
    S.safeDirty = false; sdist.fill(INF);
    // breached zones: mark them, and build a way out (distance to the nearest open ground outside)
    bmask.fill(0); edist.fill(INF); let anyB = false;
    for (const z of S.zones) if (z.breached) { anyB = true; const c0 = nav(z.x0, z.y0), c1 = nav(z.x1, z.y1);
      for (let cy = (c0 / N) | 0; cy <= ((c1 / N) | 0); cy++) for (let cx = c0 % N; cx <= c1 % N; cx++)
        if (inPoly(z.pts, -HALF + (cx + 0.5) * RES, -HALF + (cy + 0.5) * RES)) bmask[cx + cy * N] = 1; }
    if (anyB) { let qe = 0; for (let c = 0; c < NN; c++) if (bmask[c] && (walk[c] & 1)) { const cx = c % N;
        for (const m of [cx > 0 ? c - 1 : -1, cx < N - 1 ? c + 1 : -1, c - N, c + N]) if (m >= 0 && m < NN && !bmask[m] && (walk[m] & 1) && edist[m]) { edist[m] = 0; queue[qe++] = m; } }
      bfs(edist, qe, false); }
    hasSafe = S.zones.some((z) => !z.breached) || S.stations.length > 0; if (!hasSafe) { hasZone = false; rdist.fill(INF); return; }
    let qt = 0;
    const seed = (x, y, r) => { const c0 = nav(x - r, y - r), c1 = nav(x + r, y + r);
      for (let cy = (c0 / N) | 0; cy <= ((c1 / N) | 0); cy++) for (let cx = c0 % N; cx <= c1 % N; cx++) {
        const m = cx + cy * N; if (!(walk[m] & 1) || sdist[m] === 0) continue;
        const dx = -HALF + (cx + 0.5) * RES - x, dy = -HALF + (cy + 0.5) * RES - y;
        if (dx * dx + dy * dy <= r * r) { sdist[m] = 0; queue[qt++] = m; } } };
    const cellsIn = (z, fn) => { const c0 = nav(z.x0, z.y0), c1 = nav(z.x1, z.y1);
      for (let cy = (c0 / N) | 0; cy <= ((c1 / N) | 0); cy++) for (let cx = c0 % N; cx <= c1 % N; cx++)
        if (inPoly(z.pts, -HALF + (cx + 0.5) * RES, -HALF + (cy + 0.5) * RES)) fn(cx + cy * N); };
    for (const z of S.zones) if (!z.breached) cellsIn(z, (m) => { if ((walk[m] & 1) && sdist[m] !== 0) { sdist[m] = 0; queue[qt++] = m; } });
    const zq = qt; hasZone = zq > 0; rdist.fill(INF); // ammunition is only available in safe zones
    if (hasZone) { for (let q = 0; q < zq; q++) rdist[queue[q]] = 0; const keep = queue.slice(0, zq); bfs(rdist, zq, false); queue.set(keep); }
    for (const st of S.stations) seed(st.x, st.y, 7);
    bfs(sdist, qt, false);
  }

  // Drop a line of paratroopers from (x0,y0) to (x1,y1), local metres. They drift to the nearest street.
  S.drop = function (x0, y0, x1, y1) {
    if (S.budget < S.dropCost) return false;
    S.budget -= S.dropCost; S.spent += S.dropCost;
    let dx = x1 - x0, dy = y1 - y0; const len = Math.hypot(dx, dy);
    if (len > CFG.DROP_MAX_LEN) { dx *= CFG.DROP_MAX_LEN / len; dy *= CFG.DROP_MAX_LEN / len; }
    const L = Math.hypot(dx, dy), D = CFG.DROP_DELAY, ux = L > 5 ? dx / L : 1, uy = L > 5 ? dy / L : 0;
    S.pendingDrops.push({ x0, y0, dx, dy, len, size: S.dropSize, t: D });
    S.planes.push({ x: x0 - ux * 40, y: y0 - uy * 40, dx: ux, dy: uy, v: (Math.max(L, 20) + 80) / 1.6, age: 0, delay: D, transport: 1 });
    S.inbound.push({ k: 'drop', x: x0 + dx / 2, y: y0 + dy / 2, t: D });
    S.drops++; emit(13, x0 + dx / 2, y0 + dy / 2);
    return true;
  };
  function spawnDrop(pd) { const { x0, y0, dx, dy, len } = pd;
    for (let k = 0; k < pd.size; k++) {
      const t = (k + rnd()) / S.dropSize, a = rnd() * 6.283, r = Math.sqrt(rnd()) * CFG.DROP_SCATTER * (len < 5 ? 2.5 : 1);
      let x = x0 + dx * t + Math.cos(a) * r, y = y0 + dy * t + Math.sin(a) * r;
      if (!ok(x, y)) { // drift to the nearest walkable ground
        const best = nearestWalk(x, y); if (best < 0) continue;
        x = -HALF + (best % N + 0.2 + rnd() * 0.6) * RES; y = -HALF + (((best / N) | 0) + 0.2 + rnd() * 0.6) * RES;
      }
      const i = alloc(); if (i < 0) break;
      px[i] = x; py[i] = y; type[i] = FALLING; timer[i] = CFG.DROP_TIME * (0.6 + rnd() * 0.8); ammo[i] = Wd.trooper.mag; rounds[i] = Wd.trooper.ammo; rst[i] = 0; adv[i] = 0; sel[i] = 0; mode[i] = 0; gar[i] = 0; cls[i] = 0; spd[i] = 1;
    }
  }

  S.step = function (dt) {
    for (let q = S.inbound.length - 1; q >= 0; q--) if ((S.inbound[q].t -= dt) <= 0) S.inbound.splice(q, 1);
    for (let q = S.pendingDrops.length - 1; q >= 0; q--) { const pd = S.pendingDrops[q]; if ((pd.t -= dt) <= 0) { S.pendingDrops.splice(q, 1); spawnDrop(pd); } }
    const n = S.n, plan = S.planning; // planning phase: civilians mill about, drops land, nothing else moves
    if (!plan) { S.time += dt; S.budget += S.income * dt; }
    S.tick++;
    if (S.wallsDirty) refreshWalls();
    for (let j = 0; j < S.nw; j++) chew[wallList[j]] = 0;
    if (S.safeDirty) refreshSafe();
    // ---- 1. bin everyone into the spatial grid ----
    preyStart.fill(0); zomStart.fill(0);
    let nh = 0, nz = 0, nt = 0, ns = 0, na = 0, nm = 0, nsn = 0, ntu = 0, ndry = 0, ngar = 0, nsh = 0, nhw = 0;
    for (let i = 0; i < n; i++) {
      const t = type[i]; if (t === NONE) continue;
      let cx = ((px[i] + HALF) / CELL) | 0, cy = ((py[i] + HALF) / CELL) | 0;
      if (cx < 0) cx = 0; else if (cx >= G) cx = G - 1;
      if (cy < 0) cy = 0; else if (cy >= G) cy = G - 1;
      const c = cx + cy * G; cellOf[i] = c;
      if (t === ZOMBIE) { zomStart[c + 1]++; nz++; }
      else if (t === HUMAN) { preyStart[c + 1]++; nh++; }
      else if (t === APC) { preyStart[c + 1]++; if (cls[i] === 2) ntu++; else na++; achew[i] = 0; if (sel[i]) ns++; if (rounds[i] === 0) ndry++; }
      else if (t === MORTAR) { preyStart[c + 1]++; if (cls[i] === 1) nhw++; else nm++; if (sel[i]) ns++; if (rounds[i] === 0) ndry++; }
      else if (t === SHIP) { nsh++; } // ships are out on the water: not reachable
      else { if (t === TROOPER && !gar[i]) preyStart[c + 1]++; nt++; if (cls[i]) nsn++; if (sel[i]) ns++; if (gar[i]) ngar++; else if (t === TROOPER && rounds[i] === 0) ndry++; } // garrisoned troopers can't be reached
    }
    for (let c = 0; c < NC; c++) { preyStart[c + 1] += preyStart[c]; zomStart[c + 1] += zomStart[c]; }
    preyFill.fill(0); zomFill.fill(0);
    for (let i = 0; i < n; i++) {
      const t = type[i], c = cellOf[i];
      if (t === ZOMBIE) zomIdx[zomStart[c] + zomFill[c]++] = i;
      else if (t === HUMAN || t === APC || t === MORTAR || (t === TROOPER && !gar[i])) preyIdx[preyStart[c] + preyFill[c]++] = i;
    }

    // ---- safe zones: a zombie inside breaches it; once no zombie has been inside for ZONE_RECOVER_TIME it is safe again (v35) ----
    if (!plan && S.tick % 5 === 0) for (const z of S.zones) {
      const gx0 = Math.max(0, ((z.x0 + HALF) / CELL) | 0), gx1 = Math.min(G - 1, ((z.x1 + HALF) / CELL) | 0), gy0 = Math.max(0, ((z.y0 + HALF) / CELL) | 0), gy1 = Math.min(G - 1, ((z.y1 + HALF) / CELL) | 0);
      let inside = false;
      search: for (let yy = gy0; yy <= gy1; yy++) for (let xx = gx0; xx <= gx1; xx++) { const cc = xx + yy * G;
        for (let k = zomStart[cc], e = zomStart[cc + 1]; k < e; k++) { const j = zomIdx[k]; if (type[j] === ZOMBIE && !sub[j] && inPoly(z.pts, px[j], py[j])) { inside = true; break search; } } }
      if (!z.breached) { if (inside) { z.breached = true; z.clearT = 0; S.breaches++; emit(12, z.x, z.y); S.safeDirty = true; } }
      else if (inside) z.clearT = 0;
      else if ((z.clearT = (z.clearT || 0) + dt * 5) >= CFG.ZONE_RECOVER_TIME) { z.breached = false; z.clearT = 0; S.recoveries = (S.recoveries || 0) + 1; S.safeDirty = true; } }

    // ---- 2. street-distance fields: to nearest prey (for zombies), to nearest zombie (for humans + troopers) ----
    const ph = S.tick % 10;
    if (!plan) {
      if (ph === 1 || S.fresh) seedAndFlood(pdist, HUMAN, TROOPER, APC);
      if (ph === 6 || S.fresh) seedAndFlood(zdist, ZOMBIE, ZOMBIE);
      S.fresh = false;
    }

    // ---- 3. zombies: chase nearest prey along the streets, infect on touch ----
    const zsm = S.strain.speed * dt, zws = CFG.ZOMBIE_WATER_SPEED * dt, inf2 = CFG.INFECT_RADIUS * S.strain.reach * CFG.INFECT_RADIUS * S.strain.reach;
    for (let i = 0; i < n; i++) {
      if (plan || type[i] !== ZOMBIE) continue;
      const c = cellOf[i], cx = c % G, cy = (c / G) | 0, x = px[i], y = py[i];
      let best = -1, bd = 1e9;
      const x0 = cx > 0 ? cx - 1 : 0, x1 = cx < G - 1 ? cx + 1 : G - 1, y0 = cy > 0 ? cy - 1 : 0, y1 = cy < G - 1 ? cy + 1 : G - 1;
      for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) {
        const cc = xx + yy * G; let e = preyStart[cc + 1]; const s = preyStart[cc];
        if (e - s > 12) e = s + 12;
        for (let k = s; k < e; k++) {
          const j = preyIdx[k], tj = type[j]; if (tj !== HUMAN && tj !== TROOPER && tj !== APC && tj !== MORTAR) continue;
          const dx = px[j] - x, dy = py[j] - y, d2 = dx * dx + dy * dy;
          if (d2 < bd) { bd = d2; best = j; }
        }
      }
      const subm = (walk[nav(x, y)] & 16) !== 0; sub[i] = subm ? 1 : 0; // wading along the bottom: slow, harmless, untargetable
      if (subm) best = -1;
      const s = subm ? zws : zsm * spd[i] * ((walk[nav(x, y)] & 32) ? CFG.WIRE_SLOW : 1); // razor wire slows them down
      if (best >= 0) {
        if (type[best] === APC) { // armour: can't be infected, has to be wrecked
          if (bd <= 12 && clear(x, y, px[best], py[best], false)) {
            if (achew[best] < 8) { achew[best]++; ahp[best] -= dt; if (ahp[best] <= 0) { sel[best] = 0;
              if (cls[best] === 2) { type[best] = NONE; free.push(best); S.lostTurret++; }
              else wreckApc(best); } }
            continue; }
        } else if (bd <= inf2 && clear(x, y, px[best], py[best], false)) { if (type[best] === TROOPER) { S.lost++; sel[best] = 0; } else if (type[best] === MORTAR) { S.lostMortar++; sel[best] = 0; } emit(10, px[best], py[best]); makeZombie(best); continue; }
        if (clear(x, y, px[best], py[best], false)) {
          const d = Math.sqrt(bd);
          moveZ(i, x + (px[best] - x) / d * s + (rnd() - 0.5) * 0.4, y + (py[best] - y) / d * s + (rnd() - 0.5) * 0.4);
          continue;
        }
      }
      const nc = nav(x, y), k = pickZ(pdist, nc, i & 7);
      if (k >= 0) {
        const m = nc + DX[k] + DY[k] * N;
        if (walk[m] & 12) { // barricade or gate in the way: chew on it
          if (chew[m] < CFG.WALL_MAX_CHEWERS) { chew[m]++; bhp[m] -= CFG.ZOMBIE_WALL_DPS * dt; }
          if (bhp[m] <= 0) { walk[m] = (walk[m] & 2) | 1; S.wallsDirty = true; }
        } else stepTo(i, nc, k, s, true);
      }
      else if (!moveZ(i, x + wvx[i] * s * 0.3, y + wvy[i] * s * 0.3) || ((i + S.tick) & 63) === 0) { const h = rnd() * 6.283; wvx[i] = Math.cos(h); wvy[i] = Math.sin(h); }
    }

    // ---- 4. humans: run down the streets away from zombies, otherwise wander ----
    const fearCells = Math.round(CFG.HUMAN_FEAR_RADIUS / RES), hs = CFG.HUMAN_FLEE_SPEED * dt, ws = CFG.HUMAN_WANDER_SPEED * dt, callCells = Math.round(CFG.CALL_RADIUS / RES);
    for (let i = 0; i < n; i++) {
      if (type[i] !== HUMAN) continue;
      const nc = nav(px[i], py[i]);
      if (bmask[nc]) { // inside a breached safe zone: get out
        const k = pick(edist, nc, i & 7, false); if (k >= 0) stepTo(i, nc, k, hs * spd[i]);
      } else if (zdist[nc] < fearCells) {
        const k = pick(zdist, nc, i & 7, true);
        if (k >= 0) stepTo(i, nc, k, hs * spd[i]);
      } else if (hasSafe && !plan && sdist[nc] <= callCells) { // head for the nearest safe zone / evac station and stay there
        if (sdist[nc] > 0) { const k = pick(sdist, nc, i & 7, false); if (k >= 0) stepTo(i, nc, k, hs * spd[i] * 0.8); }
        else { const nx = px[i] + wvx[i] * ws, ny = py[i] + wvy[i] * ws;
          if (sdist[nav(nx, ny)] !== 0 || !move(i, nx, ny) || ((i + S.tick) & 127) === 0) { const h = rnd() * 6.283; wvx[i] = Math.cos(h); wvy[i] = Math.sin(h); } }
      } else if (!move(i, px[i] + wvx[i] * ws, py[i] + wvy[i] * ws) || ((i + S.tick) & 127) === 0) {
        const h = rnd() * 6.283; wvx[i] = Math.cos(h); wvy[i] = Math.sin(h);
      }
    }

    // ---- evacuation stations: lift out civilians who reach them; lost if a zombie gets there ----
    if (!plan) for (let q = S.stations.length - 1; q >= 0; q--) {
      const st = S.stations[q]; st.acc = Math.min(st.acc + CFG.EVAC_RATE * dt, 5);
      let gx = ((st.x + HALF) / CELL) | 0, gy = ((st.y + HALF) / CELL) | 0, overrun = false;
      for (let yy = gy - 1; yy <= gy + 1 && !overrun; yy++) { if (yy < 0 || yy >= G) continue;
        for (let xx = gx - 1; xx <= gx + 1 && !overrun; xx++) { if (xx < 0 || xx >= G) continue; const cc = xx + yy * G;
          for (let k = zomStart[cc], e = zomStart[cc + 1]; k < e; k++) { const j = zomIdx[k]; if (type[j] !== ZOMBIE) continue;
            const dx = px[j] - st.x, dy = py[j] - st.y; if (dx * dx + dy * dy < 49) { overrun = true; break; } }
          for (let k = preyStart[cc], e = preyStart[cc + 1]; k < e && st.acc >= 1; k++) { const j = preyIdx[k]; if (type[j] !== HUMAN) continue;
            const dx = px[j] - st.x, dy = py[j] - st.y; if (dx * dx + dy * dy < 100) { type[j] = NONE; free.push(j); S.evac++; st.acc--; } } } }
      if (overrun) { S.stations.splice(q, 1); S.safeDirty = true; }
    }

    // ---- garrisons under siege: zombies at the door wear it down; if it gives way everyone inside turns ----
    if (!plan) for (let gi = 0; gi < S.garrisons.length; gi++) { const g = S.garrisons[gi]; if (!g.count) { g.breach = 0; continue; }
      const gx = ((g.ex + HALF) / CELL) | 0, gy = ((g.ey + HALF) / CELL) | 0; let at = 0;
      for (let yy = gy - 1; yy <= gy + 1; yy++) { if (yy < 0 || yy >= G) continue;
        for (let xx = gx - 1; xx <= gx + 1; xx++) { if (xx < 0 || xx >= G) continue; const cc = xx + yy * G;
          for (let k = zomStart[cc], e = zomStart[cc + 1]; k < e && at < 10; k++) { const j = zomIdx[k]; if (type[j] !== ZOMBIE) continue;
            const dx = px[j] - g.ex, dy = py[j] - g.ey; if (dx * dx + dy * dy < 81) at++; } } }
      g.breach = at ? g.breach + at * dt : Math.max(0, g.breach - 2 * dt);
      if (g.breach >= S.garHp) { // the building falls
        for (let i = 0; i < n; i++) if (gar[i] === gi + 1) { gar[i] = 0; sel[i] = 0; lock[i] = 0; S.lost++; // some go down fighting, the rest turn
          if (rnd() < CFG.GARRISON_OVERRUN_CONVERT) { cellXY(i, g.entry, 0.8); makeZombie(i); } else { type[i] = NONE; free.push(i); } }
        g.count = 0; g.breach = 0; emit(11, g.ex, g.ey); }
    }

    // ---- 5. units: fire (damage / rate / magazine / reload / total ammo per weapon), follow orders, restock when dry ----
    const W = Wd, crush2 = CFG.APC_CRUSH_RADIUS * CFG.APC_CRUSH_RADIUS;
    for (let i = 0; i < n; i++) {
      const t = type[i];
      if (t === FALLING) { timer[i] -= dt; if (timer[i] <= 0) { type[i] = TROOPER; timer[i] = rnd() * 0.3; } continue; }
      if (t !== TROOPER && t !== APC && t !== MORTAR && t !== SHIP) continue;
      const ship = t === SHIP, how = t === MORTAR && cls[i] === 1;
      const apc = t === APC, mor = t === MORTAR || ship, sn = t === TROOPER && cls[i] === 1, tur = apc && cls[i] === 2;
      const wp = ship ? W.ship : how ? W.howitzer : mor ? W.mortar : tur ? W.turret : apc ? W.apc : sn ? W.sniper : W.trooper;
      const sp = (ship ? 0 : how ? CFG.HOWITZER_SPEED : mor ? CFG.MORTAR_SPEED : apc ? CFG.APC_SPEED : CFG.TROOPER_SPEED) * dt;
      const md = mode[i], grec = gar[i] ? S.garrisons[gar[i] - 1] : null; let moved = false;
      const dry = rounds[i] === 0;
      if (grec && dry && !plan) { // out of ammunition inside a building: drop the rifle and walk out as a civilian
        grec.count--; gar[i] = 0; lock[i] = 0; sel[i] = 0; cls[i] = 0; mode[i] = 0; cellXY(i, grec.entry, 0.8);
        type[i] = HUMAN; spd[i] = 0.6 + rnd() * 0.65; const hd = rnd() * 6.283; wvx[i] = Math.cos(hd); wvy[i] = Math.sin(hd); S.abandoned = (S.abandoned || 0) + 1; continue; }
      if (grec) { /* inside a building: stay put and shoot from the windows */ }
      else if (dry) { // out of ammunition: fall back to the nearest safe zone and restock there
        const nc = nav(px[i], py[i]);
        if (rdist[nc] === 0) { rst[i] += dt; if (rst[i] >= CFG.RESUPPLY_TIME) { rounds[i] = wp.ammo; ammo[i] = wp.mag; rst[i] = 0; } }
        else if (!tur && !plan && rdist[nc] !== INF) { const k = pick(rdist, nc, i & 7, false); if (k >= 0) moved = stepTo(i, nc, k, sp); }
      }
      else if (md >= 2) { // under a move order: go there (even while firing), then hold
        const f = ofield[md - 2], nc = nav(px[i], py[i]);
        if (f[nc] <= orad[md - 2]) { mode[i] = 1; if (ogar[md - 2] && t === TROOPER) enter(i, ogar[md - 2] - 1); }
        else { const k = pick(f, nc, i & 7, false); if (k >= 0) moved = stepTo(i, nc, k, sp); else mode[i] = 1; }
      } else if (md === 0 && adv[i] && !plan && !mor && !tur) { const nc = nav(px[i], py[i]), k = pick(zdist, nc, i & 7, false); if (k >= 0) moved = stepTo(i, nc, k, sp); }
      if (plan) continue;
      const c = cellOf[i], cx = c % G, cy = (c / G) | 0, x = px[i], y = py[i];
      if (apc && moved) { // a moving APC runs zombies over
        for (let yy = cy - 1; yy <= cy + 1; yy++) { if (yy < 0 || yy >= G) continue;
          for (let xx = cx - 1; xx <= cx + 1; xx++) { if (xx < 0 || xx >= G) continue; const cc = xx + yy * G;
            for (let k = zomStart[cc], e = zomStart[cc + 1]; k < e; k++) { const j = zomIdx[k]; if (type[j] !== ZOMBIE || sub[j]) continue;
              const dx = px[j] - x, dy = py[j] - y; if (dx * dx + dy * dy < crush2) { type[j] = NONE; free.push(j); S.kills++; ahp[i] -= CFG.APC_CRUSH_COST; } } } }
        if (ahp[i] <= 0) { wreckApc(i); continue; }
      }
      if (dry || (mor && moved)) continue;
      timer[i] -= dt; if (timer[i] > 0) continue;
      if (mor && how && btry[i] && btry[i] - 1 !== i && type[btry[i] - 1] === MORTAR && btry[btry[i] - 1] === btry[i] && rounds[btry[i] - 1] > 0) { timer[i] = 1; continue; } // battery guns fire with their leader
      if (mor) { // mortar, howitzer, ship's gun: lob a shell at the densest zombie group in range; no line of sight needed
        const minR = ship ? 60 : how ? CFG.HOWITZER_MIN_RANGE : CFG.MORTAR_MIN_RANGE, step = how || ship ? 4 : 2;
        const R = Math.ceil(wp.range / CELL), min2 = minR * minR, max2 = wp.range * wp.range;
        let bs = CFG.MORTAR_MIN_ZOMBIES - 1, tx = 0, ty = 0, found = false;
        for (let yy = Math.max(1, cy - R); yy <= cy + R && yy < G - 1; yy += step) for (let xx = Math.max(1, cx - R); xx <= cx + R && xx < G - 1; xx += step) {
          const cc = xx + yy * G; if (zomStart[cc + 1] === zomStart[cc]) continue;
          const wx = -HALF + (xx + 0.5) * CELL, wy = -HALF + (yy + 0.5) * CELL, d2 = (wx - x) * (wx - x) + (wy - y) * (wy - y);
          if (d2 < min2 || d2 > max2 || (walk[nav(wx, wy)] & 16)) continue; // zombies under water can't be hit
          let z = 0, f = 0;
          for (let b = -1; b <= 1; b++) { const r0 = cc + b * G - 1; z += zomStart[r0 + 3] - zomStart[r0]; f += preyStart[r0 + 3] - preyStart[r0]; }
          const sc = z - CFG.MORTAR_CIV_WEIGHT * f; if (sc > bs) { bs = sc; tx = wx; ty = wy; found = true; }
        }
        if (!found) { timer[i] = 0.5; continue; }
        if (how && btry[i] === i + 1) { // battery salvo: every gun of the team that still has shells fires at the same target
          for (let j = 0; j < S.n; j++) { if (btry[j] !== i + 1 || type[j] !== MORTAR || rounds[j] <= 0) continue;
            const a = rnd() * 6.283, d = Math.sqrt(rnd()) * CFG.HOWITZER_SCATTER;
            S.shells.push({ x: tx + Math.cos(a) * d, y: ty + Math.sin(a) * d, t: CFG.HOWITZER_FLIGHT + rnd() * 0.4, dz: wp.damage, r: CFG.HOWITZER_BLAST, snd: 7, dmg: 250 }); emit(16, px[j], py[j]);
            rounds[j]--; timer[j] = wp.interval; }
          continue; }
        const a = rnd() * 6.283, d = Math.sqrt(rnd()) * (ship ? CFG.SHIP_GUN_SCATTER : how ? CFG.HOWITZER_SCATTER : CFG.MORTAR_SCATTER);
        S.shells.push({ x: tx + Math.cos(a) * d, y: ty + Math.sin(a) * d, t: ship ? CFG.SHIP_GUN_FLIGHT : how ? CFG.HOWITZER_FLIGHT : CFG.MORTAR_FLIGHT, dz: wp.damage,
          r: ship ? CFG.SHIP_GUN_BLAST : how ? CFG.HOWITZER_BLAST : 0, snd: how || ship ? 7 : 0, dmg: how || ship ? 250 : 0 }); emit(ship ? 18 : how ? 16 : 5, x, y);
        rounds[i]--; timer[i] = wp.interval; continue;
      }
      if (ammo[i] === 0) ammo[i] = wp.mag;
      // height: shooter = ground + building height if garrisoned; higher than the target reaches farther, lower hits for less
      const sAlt = ground(x, y) + (grec ? grec.h : 0), hk = sn ? CFG.SNIPER_HEIGHT_MULT : 1;
      const baseR = wp.range + (grec ? CFG.GARRISON_MIN_BONUS : 0), maxR = baseR * (1 + CFG.HEIGHT_RANGE_MAX), R = Math.ceil(maxR / CELL);
      let best = -1, bd = maxR * maxR, bdh = 0, stopAt = R, checks = 0;
      for (let r = 0; r <= stopAt; r++) {
        for (let yy = cy - r; yy <= cy + r; yy++) { if (yy < 0 || yy >= G) continue;
          const edge = (yy === cy - r || yy === cy + r);
          for (let xx = cx - r; xx <= cx + r; xx += (edge || r === 0) ? 1 : 2 * r) { if (xx < 0 || xx >= G) continue;
            const cc = xx + yy * G;
            for (let k = zomStart[cc], e = zomStart[cc + 1]; k < e; k++) {
              const j = zomIdx[k]; if (type[j] !== ZOMBIE || sub[j]) continue; // submerged zombies can't be targeted
              const dx = px[j] - x, dy = py[j] - y, d2 = dx * dx + dy * dy;
              if (d2 < bd && checks < 40) {
                const dh = sAlt - ground(px[j], py[j]), lim = baseR * (1 + Math.min(CFG.HEIGHT_RANGE_MAX, Math.max(0, dh) * CFG.HEIGHT_RANGE_PER_M * hk));
                if (d2 > lim * lim) continue;
                checks++; if (grec ? clearG(x, y, px[j], py[j], grec.id, grec.h) : clear(x, y, px[j], py[j], true)) { bd = d2; best = j; bdh = dh; } }
            }
          } }
        if (best >= 0 && stopAt === R) stopAt = Math.min(R, r + 1);
      }
      if (best < 0) { adv[i] = 1; timer[i] = 0.2; continue; }
      adv[i] = 0;
      const h = S.trHead; S.trHead = (h + 1) % TR_MAX;
      tracers[h * 4] = x; tracers[h * 4 + 1] = y; tracers[h * 4 + 2] = px[best]; tracers[h * 4 + 3] = py[best]; trTtl[h] = 0.09;
      emit(tur ? 4 : apc ? 3 : sn ? 2 : 1, x, y);
      hit(best, bdh < 0 ? wp.damage * Math.max(CFG.HEIGHT_DMG_MIN, 1 + bdh * CFG.HEIGHT_DMG_PER_M) : wp.damage); // shooting uphill is less accurate
      ammo[i]--; rounds[i]--;
      timer[i] = (ammo[i] === 0 ? wp.reload : wp.interval) * (grec ? (sn ? 1 / (1 + Math.min(CFG.ROOF_RATE_MAX, grec.h * CFG.ROOF_RATE_PER_M)) : CFG.GARRISON_FIRE_MULT) : 1); // garrisons fire slowly
    }
    // ---- aircraft ----
    for (let q = S.planes.length - 1; q >= 0; q--) { const pl = S.planes[q]; pl.age += dt; if (pl.age > (pl.delay || CFG.BOMB_DELAY) + 8) S.planes.splice(q, 1); }
    for (let q = S.helis.length - 1; q >= 0; q--) { const he = S.helis[q]; he.age += dt;
      if (he.delay > 0) { he.delay -= dt; continue; }
      he.t -= dt; if (he.t <= 0) { S.helis.splice(q, 1); continue; }
      he.a += dt * 0.6; he.hx = he.x + Math.cos(he.a) * CFG.HELI_ORBIT; he.hy = he.y + Math.sin(he.a) * CFG.HELI_ORBIT;
      he.acc += CFG.HELI_ROF * dt; let shots = he.acc | 0; if (!shots) continue; he.acc -= shots;
      let gx = ((he.hx + HALF) / CELL) | 0, gy = ((he.hy + HALF) / CELL) | 0; if (gx < 0) gx = 0; else if (gx >= G) gx = G - 1; if (gy < 0) gy = 0; else if (gy >= G) gy = G - 1;
      const R = Math.ceil(CFG.HELI_RANGE / CELL), r2 = CFG.HELI_RANGE * CFG.HELI_RANGE;
      for (let r = 0; r <= R && shots > 0; r++) // sweep outward from under the helicopter
        for (let yy = gy - r; yy <= gy + r && shots > 0; yy++) { if (yy < 0 || yy >= G) continue;
          const edge = (yy === gy - r || yy === gy + r);
          for (let xx = gx - r; xx <= gx + r && shots > 0; xx += (edge || r === 0) ? 1 : 2 * r) { if (xx < 0 || xx >= G) continue; const cc = xx + yy * G;
            for (let k = zomStart[cc], e = zomStart[cc + 1]; k < e && shots > 0; k++) { const j = zomIdx[k]; if (type[j] !== ZOMBIE || sub[j]) continue;
              const dx = px[j] - he.hx, dy = py[j] - he.hy; if (dx * dx + dy * dy > r2) continue;
              shots--; const h = S.trHead; S.trHead = (h + 1) % TR_MAX;
              tracers[h * 4] = he.hx; tracers[h * 4 + 1] = he.hy; tracers[h * 4 + 2] = px[j]; tracers[h * 4 + 3] = py[j]; trTtl[h] = 0.07;
              hit(j, CFG.HELI_DAMAGE); emit(9, he.hx, he.hy);
              if (rnd() < CFG.HELI_SPRAY) for (let k2 = preyStart[cc], e2 = preyStart[cc + 1]; k2 < e2; k2++) { const u = preyIdx[k2]; if (type[u] !== HUMAN) continue; // stray rounds
                const ux = px[u] - px[j], uy = py[u] - py[j]; if (ux * ux + uy * uy < 16) { type[u] = NONE; free.push(u); S.collateral++; break; } }
            } } }
    }
    // ---- A-10 strafing runs: a narrow strip of cannon fire sweeps along the line ----
    for (let q = S.strafes.length - 1; q >= 0; q--) { const st = S.strafes[q];
      if (st.t > 0) { st.t -= dt; if (st.t <= 0) emit(15, st.x0 + st.dx * st.len / 2, st.y0 + st.dy * st.len / 2); continue; }
      const p0 = st.prog; st.prog = Math.min(st.len, st.prog + st.len / CFG.STRAFE_TIME * dt);
      const w = CFG.STRAFE_WIDTH, w2 = w * w;
      for (let dd = p0; dd <= st.prog; dd += w) { const cx0 = st.x0 + st.dx * dd, cy0 = st.y0 + st.dy * dd; bgHit(cx0, cy0, w, 0.85, 0.2);
        const gx = ((cx0 + HALF) / CELL) | 0, gy = ((cy0 + HALF) / CELL) | 0, br = Math.ceil(w / CELL);
        for (let yy = gy - br; yy <= gy + br; yy++) { if (yy < 0 || yy >= G) continue;
          for (let xx = gx - br; xx <= gx + br; xx++) { if (xx < 0 || xx >= G) continue; const cc = xx + yy * G;
            for (let k = zomStart[cc], e = zomStart[cc + 1]; k < e; k++) { const j = zomIdx[k]; if (type[j] !== ZOMBIE || sub[j] || st.hit.has(j)) continue;
              const dx = px[j] - cx0, dy = py[j] - cy0; if (dx * dx + dy * dy > w2) continue; st.hit.add(j);
              if (rnd() < CFG.STRAFE_KILL) { const h = S.trHead; S.trHead = (h + 1) % TR_MAX; tracers[h * 4] = px[j] - st.dx * 40; tracers[h * 4 + 1] = py[j] - st.dy * 40; tracers[h * 4 + 2] = px[j]; tracers[h * 4 + 3] = py[j]; trTtl[h] = 0.12; hit(j, 9999); } }
            for (let k = preyStart[cc], e = preyStart[cc + 1]; k < e; k++) { const j = preyIdx[k]; if (type[j] === NONE || type[j] === ZOMBIE || st.hit.has(j)) continue;
              const dx = px[j] - cx0, dy = py[j] - cy0; if (dx * dx + dy * dy > w2) continue; st.hit.add(j);
              if (type[j] === APC) { ahp[j] -= 60; if (ahp[j] <= 0) killAgent(j); } else if (rnd() < CFG.STRAFE_CIV) killAgent(j); } } } }
      if (st.prog >= st.len) S.strafes.splice(q, 1);
    }
    // ---- cruise missiles from destroyers ----
    for (let q = S.missiles.length - 1; q >= 0; q--) { const ms = S.missiles[q]; ms.t -= dt; if (ms.t > 0) continue; S.missiles.splice(q, 1);
      S.shells.push({ x: ms.tx, y: ms.ty, t: 0, r: CFG.MISSILE_BLAST, dz: CFG.MISSILE_DAMAGE, dmg: 600, walls: true, snd: 7 }); }
    // ---- fire: buildings burn, fire creeps to touching buildings, jumps streets, and embers carry it further ----
    if (fireList.length && S.tick % 10 === 0) { const fdt = 10 * dt, J = Math.round(CFG.FIRE_JUMP_M / RES), E = Math.round(CFG.FIRE_EMBER_M / RES), add = [];
      for (const c of heatList) heat[c] = 0; heatList = [];
      const keep = [];
      for (const c of fireList) { if (fstate[c] !== 1) continue; // put out by water
        if (S.time - fstart[c] > CFG.FIRE_BURN_TIME) { fstate[c] = 2; destroyCell(c); continue; } keep.push(c);
        const cx = c % N;
        for (const m of [cx > 0 ? c - 1 : -1, cx < N - 1 ? c + 1 : -1, c - N, c + N]) { if (m < 0 || m >= NN) continue;
          if (walk[m] & 2) { if (!fstate[m] && rnd() < CFG.FIRE_SPREAD * fdt) add.push(m); }
          else if (!heat[m]) { heat[m] = 1; heatList.push(m); } }
        if (rnd() < CFG.FIRE_JUMP * fdt) add.push(c + (((rnd() * 2 - 1) * J) | 0) + (((rnd() * 2 - 1) * J) | 0) * N);
        if (rnd() < CFG.FIRE_EMBER * fdt) add.push(c + (((rnd() * 2 - 1) * E) | 0) + (((rnd() * 2 - 1) * E) | 0) * N);
      }
      fireList = keep; for (const c of add) ignite(c);
      // anyone inside a burning building dies; anyone pressed up against one may die too
      for (const g of S.garrisons) { if (!g.count) continue; let burning = false; for (const c of g.cells) if (fstate[c] === 1) { burning = true; break; }
        if (burning) { for (let i = 0; i < n; i++) if (gar[i] && S.garrisons[gar[i] - 1] === g) { gar[i] = 0; lock[i] = 0; killAgent(i); } g.count = 0; g.breach = 0; } }
      if (heatList.length) for (let i = 0; i < n; i++) { const t = type[i]; if (t === NONE || t === SHIP || gar[i] || t === APC) continue; if (heat[nav(px[i], py[i])] && rnd() < CFG.FIRE_HEAT * fdt) killAgent(i); }
    }
    // napalm on open ground keeps burning for a while: nothing walks through it
    for (let q = S.gfires.length - 1; q >= 0; q--) { const f = S.gfires[q]; f.t -= dt; if (f.t <= 0) { S.gfires.splice(q, 1); continue; }
      if (S.tick % 5 !== q % 5) continue; const r2 = f.r * f.r;
      for (let i = 0; i < n; i++) { const t = type[i]; if (t === NONE || t === SHIP || gar[i]) continue; const dx = px[i] - f.x, dy = py[i] - f.y;
        if (dx * dx + dy * dy < r2) { if (t === APC) { ahp[i] -= 20; if (ahp[i] <= 0) killAgent(i); } else killAgent(i); } } }

    // ---- nukes: countdown, detonation, then a lethal fallout zone ----
    for (let q = S.nukes.length - 1; q >= 0; q--) { const nk = S.nukes[q]; nk.t -= dt; if (nk.t > 0) continue;
      S.nukes.splice(q, 1); const r2 = CFG.NUKE_RADIUS * CFG.NUKE_RADIUS; bgHit(nk.x, nk.y, CFG.NUKE_RADIUS, 1, 1);
      for (let i = 0; i < n; i++) { if (type[i] === NONE) continue; const dx = px[i] - nk.x, dy = py[i] - nk.y; if (dx * dx + dy * dy < r2) killAgent(i); }
      for (let j = 0; j < S.nw; j++) { const c = wallList[j], wx = -HALF + (c % N + 0.5) * RES - nk.x, wy = -HALF + (((c / N) | 0) + 0.5) * RES - nk.y;
        if ((walk[c] & 12) && wx * wx + wy * wy < r2) { walk[c] = (walk[c] & 2) | 1; S.wallsDirty = true; } }
      for (let k = S.stations.length - 1; k >= 0; k--) { const st = S.stations[k]; if ((st.x - nk.x) * (st.x - nk.x) + (st.y - nk.y) * (st.y - nk.y) < r2) { S.stations.splice(k, 1); S.safeDirty = true; } }
      damageBuildings(nk.x, nk.y, CFG.NUKE_RADIUS * 0.75, 1e6);
      S.blasts.push({ x: nk.x, y: nk.y, t: 0.5, r: CFG.NUKE_RADIUS }); S.fallout.push({ x: nk.x, y: nk.y, r: CFG.NUKE_FALLOUT, t: CFG.NUKE_FALLOUT_TIME }); S.flash = 1; emit(8, nk.x, nk.y);
      for (let k = 0; k < 40; k++) { const a = rnd() * 6.283, d = CFG.NUKE_RADIUS * (0.8 + rnd() * 0.5); igniteArea(nk.x + Math.cos(a) * d, nk.y + Math.sin(a) * d, 12); } // the firestorm at its edge
    }
    if (S.flash > 0) S.flash = Math.max(0, S.flash - dt * 0.9);
    for (let q = S.fallout.length - 1; q >= 0; q--) { const fo = S.fallout[q]; fo.t -= dt; if (fo.t <= 0) { S.fallout.splice(q, 1); continue; }
      if (S.tick % 10 !== q % 10) continue; const r2 = fo.r * fo.r; // anything in the open inside the fallout dies; garrisons are sheltered
      for (let i = 0; i < n; i++) { if (type[i] === NONE || gar[i] || sub[i]) continue; const dx = px[i] - fo.x, dy = py[i] - fo.y; if (dx * dx + dy * dy < r2) killAgent(i); } }
    // ---- mortar shells land: everything in the open inside the blast dies, zombie or not ----
    for (let q = S.shells.length - 1; q >= 0; q--) { const sh = S.shells[q]; sh.t -= dt; if (sh.t > 0) continue;
      const rad = sh.r || CFG.MORTAR_BLAST;
      if (sh.water) { S.shells.splice(q, 1); douse(sh.x, sh.y, rad); if (q % 4 === 0) emit(22, sh.x, sh.y); S.splash.push({ x: sh.x, y: sh.y, r: rad, t: 2.5 }); continue; }
      S.shells.splice(q, 1); S.blasts.push({ x: sh.x, y: sh.y, t: 0.5, r: rad, fire: sh.fire }); emit(sh.snd || (sh.walls ? 7 : 6), sh.x, sh.y);
      damageBuildings(sh.x, sh.y, rad, sh.bld != null ? sh.bld : (sh.dz || Wd.mortar.damage)); bgHit(sh.x, sh.y, rad, CFG.HORDE.BLAST_KILL, CFG.HORDE.BLAST_CIV);
      if (sh.fire) { igniteArea(sh.x, sh.y, rad * 1.4); S.gfires.push({ x: sh.x, y: sh.y, r: rad, t: CFG.FIRE_GROUND_TIME }); }
      if (sh.walls) for (let j = 0; j < S.nw; j++) { const c = wallList[j], wx = -HALF + (c % N + 0.5) * RES - sh.x, wy = -HALF + (((c / N) | 0) + 0.5) * RES - sh.y; // bombs level walls
        if ((walk[c] & 12) && wx * wx + wy * wy < rad * rad) { walk[c] = (walk[c] & 2) | 1; S.wallsDirty = true; } }
      const b2 = rad * rad, br = Math.ceil(rad / CELL), gx = ((sh.x + HALF) / CELL) | 0, gy = ((sh.y + HALF) / CELL) | 0;
      for (let yy = gy - br; yy <= gy + br; yy++) { if (yy < 0 || yy >= G) continue;
        for (let xx = gx - br; xx <= gx + br; xx++) { if (xx < 0 || xx >= G) continue; const cc = xx + yy * G;
          for (let k = zomStart[cc], e = zomStart[cc + 1]; k < e; k++) { const j = zomIdx[k]; if (type[j] !== ZOMBIE) continue;
            const dx = px[j] - sh.x, dy = py[j] - sh.y; if (!sub[j] && dx * dx + dy * dy < b2) hit(j, sh.dz || Wd.mortar.damage); }
          for (let k = preyStart[cc], e = preyStart[cc + 1]; k < e; k++) { const j = preyIdx[k], tj = type[j]; if (tj === NONE || tj === ZOMBIE) continue;
            const dx = px[j] - sh.x, dy = py[j] - sh.y; if (dx * dx + dy * dy >= b2) continue;
            if (tj === APC) { ahp[j] -= sh.dmg || CFG.MORTAR_APC_DMG; if (ahp[j] > 0) continue; if (cls[j] === 2) S.lostTurret++; else S.lostApc++; }
            else if (tj === HUMAN) S.collateral++; else if (tj === TROOPER) S.lost++; else if (tj === MORTAR) S.lostMortar++;
            type[j] = NONE; sel[j] = 0; free.push(j); } } }
    }
    if (S.bldHit) { S.bldHit = false; // garrisons inside a building that has (mostly) come down are buried
      for (const g of S.garrisons) { if (!g.count) continue; let gone = 0; for (const c of g.cells) if (!(walk[c] & 2)) gone++;
        if (gone >= g.cells.length * CFG.BUILDING_COLLAPSE) { for (let i = 0; i < n; i++) if (gar[i] && S.garrisons[gar[i] - 1] === g) { gar[i] = 0; lock[i] = 0; killAgent(i); } g.count = 0; g.breach = 0; } } }
    for (let q = S.blasts.length - 1; q >= 0; q--) { S.blasts[q].t -= dt; if (S.blasts[q].t <= 0) S.blasts.splice(q, 1); }
    if (S.started && CFG.HORDE.ON && (S.bgH0 > 0 || S.bgZ > 0)) { hordeT += dt; if (hordeT >= 1) { hordeStep(hordeT); hordeT = 0; } }
    for (let q = S.splash.length - 1; q >= 0; q--) { S.splash[q].t -= dt; if (S.splash[q].t <= 0) S.splash.splice(q, 1); }
    if (S.dust.length && S.time - S.dust[0].t0 > 40) S.dust.shift();
    for (let k = 0; k < TR_MAX; k++) if (trTtl[k] > 0) trTtl[k] -= dt;
    S.allH = nh + S.bgH; S.allZ = nz + (S.bgZ >= 1 ? S.bgZ : 0); S.allH0 = S.humans0 + S.bgH0;
    S.nh = nh; S.nz = nz; S.nt = nt; S.nsel = ns; S.na = na; S.nm = nm; S.nsn = nsn; S.ntu = ntu; S.ndry = ndry; S.ngar = ngar; S.nsh = nsh; S.nhw = nhw; S.nFire = fireList.length;
  };
  S.hordeSample = function (max) { // the horde to carry into the next stage: [x, y, count, ...] scaled to at most max zombies
    // the biggest concentrations break out first (a few hot spots, not a thin film everywhere)
    const ord = []; for (let k = 0; k < HN; k++) if (bZ[k] >= 1) ord.push(k); ord.sort((a, b) => bZ[b] - bZ[a]); let left = max; const out = [];
    for (const k of ord) { if (left < 1) break; const c = Math.min(bZ[k], left); left -= c; out.push(Math.round(-HALF + (k % HG + 0.5) * HC), Math.round(-HALF + (((k / HG) | 0) + 0.5) * HC), Math.round(c)); }
    return out; };
  S.zombieSample = function (max) { const out = []; let seen = 0;
    for (let i = 0; i < S.n; i++) if (type[i] === ZOMBIE) { seen++;
      if (out.length < max * 2) out.push(px[i], py[i]); else { const j = (rnd() * seen) | 0; if (j < max) { out[j * 2] = px[i]; out[j * 2 + 1] = py[i]; } } }
    return out; };
  S.reset();
  return S;
}

;module.exports={makeSim,CFG};