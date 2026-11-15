p = '/home/claude/outbreak.html'
s = open(p).read()
def rep(a, b, cnt=1):
    global s
    n = s.count(a); assert n == cnt, (n, a[:100]); s = s.replace(a, b)

# ---------------- CFG ----------------
rep("""  MAX_HUMANS: 60000,       // arrays are sized for this many civilians (the biggest stage)""",
"""  MAX_HUMANS: 60000,       // arrays are sized for this many civilians (the biggest stage)
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
  },""")
rep("""    START_TOOLS: ['drop', 'cmd', 'wall', 'gate', 'zone', 'crate'], // everything else is found as blueprints in supply crates""",
    """    START_TOOLS: ['drop', 'cmd', 'wall', 'gate', 'zone'], // everything else is bought as blueprints at the requisition screen""")

# ---------------- HTML / CSS: crate button becomes the shop button; shop overlay ----------------
rep("""  <div class="row"><button id="crateBtn">Supply crate (L)</button></div>""", """  <div class="row"><button id="crateBtn">Requisition (L)</button></div>""")
rep("""  #pick .opt .r{font-size:11px;letter-spacing:.14em;margin-bottom:6px}""", """  #pick .opt .r{font-size:11px;letter-spacing:.14em;margin-bottom:6px}
  #shop{position:absolute;inset:0;z-index:27;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.6)}
  #shop .box{background:#0b0e11;border:1px solid #3a4854;border-radius:12px;padding:16px 18px;width:min(860px,96vw);max-height:92vh;overflow:auto}
  #shop h3{margin:12px 0 6px;font-size:12px;letter-spacing:.14em;color:#8496a2;font-weight:600}
  #shop .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px}
  #shop .it{border:1px solid #2c3a45;border-radius:9px;padding:9px 10px;background:#121820;display:flex;flex-direction:column;gap:6px}
  #shop .it .n{font-weight:600} #shop .it .d{font-size:12px;color:#9fb0bb} #shop .it button{align-self:flex-start}
  #shop .top{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
  #shop .sp{font-size:20px;color:#ffd54a;font-weight:700}""")
rep("""<div id="pick">""", """<div id="shop"><div class="box"><div class="top"><div><div style="letter-spacing:.14em;color:#ffd54a;font-size:12px" id="shopTitle">REQUISITION</div><div class="sp" id="shopSP"></div></div><button id="shopGo">Done</button></div><div id="shopNote" style="font-size:12.5px;color:#9fb0bb;margin-top:6px"></div><div id="shopBody"></div></div></div>
<div id="pick">""")
rep("""Stars (25/50/75% alive) earn free crates and cash for the next stage. Crates let you pick 1 of 3, and blueprints unlock new tools for good.""",
    """Each stage pays supply points for how it went (civilians alive, stars, containment, kills). Spend them at the requisition screen between stages on upgrades for the rest of the run, supplies for the next stage, and blueprints that unlock new tools for good.""")

# ---------------- game: shop ----------------
rep("""  // ---- crate pick: 1 of 3 ----""", """  // ===================== REQUISITION SCREEN (v35) =====================
  const SH = CFG.SHOP; let shopCtx = null;
  function spEarned(alive, stars, contained) { const p = { alive: Math.round(alive * SH.SP_ALIVE), stars: stars * SH.SP_STAR, contain: contained ? SH.SP_CONTAIN : 0, kills: Math.min(SH.SP_KILLS_MAX, Math.floor(sim.kills / SH.SP_KILLS)), stage: SH.SP_STAGE };
    p.total = p.alive + p.stars + p.contain + p.kills + p.stage; return p; }
  function rollOffers(run) { const lk = lockedTools(); const out = []; const pool = lk.slice();
    while (out.length < SH.OFFERS && pool.length) { const i = (Math.random() * pool.length) | 0; out.push(pool.splice(i, 1)[0].id); } run.offers = out; run.bought = []; }
  // campaign: spend run.sp; sandbox: spend dollars on the live budget
  function openShop(done) { picking = true; shopCtx = { done }; renderShop(); $('shop').style.display = 'flex'; }
  function closeShop() { $('shop').style.display = 'none'; picking = false; const d = shopCtx && shopCtx.done; shopCtx = null; if (d) d(); }
  $('shopGo').onclick = closeShop;
  function renderShop() {
    const camp1 = isCamp() && camp.run, run = camp.run, U = CFG.UPGRADES, body = $('shopBody'); body.innerHTML = '';
    const price = (sp) => camp1 ? sp : sp * SH.SANDBOX_DOLLARS, money = () => camp1 ? run.sp : Math.floor(sim.budget);
    const label = (sp) => camp1 ? sp + ' SP' : '$' + price(sp);
    const pay = (sp) => { const c = price(sp); if (money() < c) return false; if (camp1) run.sp -= c; else { sim.budget -= c; sim.spent += c; } return true; };
    $('shopSP').textContent = camp1 ? run.sp + ' SP to spend' : '$' + fmt(sim.budget) + ' budget';
    $('shopTitle').textContent = camp1 ? 'REQUISITION — BEFORE STAGE ' + (run.stage + 1) + ' · ' + STAGES[run.stage].name.toUpperCase() : 'REQUISITION (SANDBOX — PRICED IN DOLLARS)';
    $('shopGo').textContent = camp1 ? 'Advance to stage ' + (run.stage + 1) : 'Done';
    $('shopNote').textContent = camp1 ? 'Upgrades last the rest of this run. Supplies are for the next stage only. Blueprints unlock a tool for good, in every run. Unspent SP carries over to the next requisition.' : 'Upgrades and supplies apply right away.';
    const section = (t) => { const h = document.createElement('h3'); h.textContent = t; body.appendChild(h); const g = document.createElement('div'); g.className = 'grid'; body.appendChild(g); return g; };
    const card = (g, name, desc, btnText, can, fn, col) => { const d = document.createElement('div'); d.className = 'it'; if (col) d.style.borderColor = col;
      const n = document.createElement('div'); n.className = 'n'; n.textContent = name; const x = document.createElement('div'); x.className = 'd'; x.textContent = desc;
      const b = document.createElement('button'); b.textContent = btnText; b.disabled = !can; b.onclick = () => { if (fn()) { if (camp1) saveCamp(); else syncMeta(); renderShop(); } }; d.append(n, x, b); g.appendChild(d); };
    // upgrades
    const ups = camp1 ? run.up : sim.up, g1 = section('UPGRADES · for the rest of the run');
    for (const k in U) { const lv = ups[k] || 0, max = U[k].max, cost = SH.UPGRADE_BASE + SH.UPGRADE_STEP * lv;
      card(g1, U[k].name + ' ' + (lv ? 'I'.repeat(lv) : '') + (lv >= max ? ' (max)' : ''), U[k].text + ' · level ' + lv + '/' + max, lv >= max ? 'Maxed' : 'Buy · ' + label(cost), lv < max && money() >= price(cost),
        () => { if (!pay(cost)) return false; ups[k] = lv + 1; if (!camp1) { sim.up = ups; sim.applyUpgrades && sim.applyUpgrades(); if (k === 'chest') sim.budget += U.chest.per; } return true; }); }
    // supplies
    const g2 = section(camp1 ? 'SUPPLIES · for the next stage only' : 'SUPPLIES · right away');
    const sup = camp1 ? (run.supplies || (run.supplies = {})) : null;
    for (const it of SH.SUPPLIES) { if (it.tool && isLocked(it.tool)) continue; const have = camp1 ? sup[it.id] || 0 : 0, can = (!camp1 || have < it.max) && money() >= price(it.cost);
      if (!camp1 && it.id === 'intel' && sim.started) continue;
      card(g2, it.name + (have ? ' ×' + have : ''), it.text, (camp1 && have >= it.max) ? 'Full' : 'Buy · ' + label(it.cost), can, () => { if (!pay(it.cost)) return false;
        if (camp1) { sup[it.id] = have + 1; if (it.id === 'cash') run.bonus = (run.bonus || 0) + SH.CASH_PER; }
        else { if (it.id === 'cash') sim.budget += SH.CASH_PER; else if (it.id === 'intel') { sim.intel = true; showIntel(); } else sim.free[it.id]++; }
        return true; }); }
    // blueprints (campaign only)
    if (camp1) { const lk = lockedTools(); const g3 = section('BLUEPRINTS · unlock a tool for good' + (lk.length ? '' : ' — all tools unlocked'));
      if (lk.length) { if (!run.offers) rollOffers(run); run.offers = run.offers.filter((id) => lk.some((t) => t.id === id));
        for (const id of run.offers) { const t = CP.TOOLS.find((q) => q.id === id), cost = SH.BLUEPRINT_COST[t.rarity];
          card(g3, t.name, t.rarity + ' blueprint — yours in every future run', 'Unlock · ' + label(cost), money() >= cost, () => { if (!pay(cost)) return false; if (!camp.unlocked.includes(id)) camp.unlocked.push(id); run.offers = run.offers.filter((q) => q !== id); updateLocks(); return true; }, RCOL[t.rarity]); }
        const rc = SH.REROLL + SH.REROLL_STEP * (run.rerolls || 0);
        card(g3, 'New offers', 'swap these blueprint offers for others still locked', 'Reroll · ' + rc + ' SP', run.sp >= rc && lk.length > run.offers.length, () => { if (run.sp < rc) return false; run.sp -= rc; run.rerolls = (run.rerolls || 0) + 1; rollOffers(run); return true; }); } }
  }
  // supplies bought for this stage are handed over once the stage's city is built
  function applySupplies() { const sup = camp.run && camp.run.supplies; if (!sup) return;
    sim.free.bomb += sup.bomb || 0; sim.free.heli += sup.heli || 0; sim.free.nuke += sup.nuke || 0; if (sup.intel) { sim.intel = true; showIntel(); } }
  // ---- crate pick: 1 of 3 ----""")
rep("""    if (isCamp() && camp.run && !camp.run.strain) { camp.run.strain = Object.assign({}, sim.strain); saveCamp(); }""",
    """    if (isCamp() && camp.run && !camp.run.strain) { camp.run.strain = Object.assign({}, sim.strain); saveCamp(); }
    if (isCamp() && camp.run) applySupplies();""")
# sim: expose re-applying upgrades (sandbox buys mid-game)
rep("""  S.payCrate = function (x, y) {""", """  S.applyUpgrades = () => applyUp();
  S.payCrate = function (x, y) {""")

# ---------------- stage end: SP instead of crates ----------------
rep("""    const nx = STAGES[k + 1], crates = sim.freeCrates + stars * CP.STAR_CRATES + (contained ? CP.CONTAIN_CRATES : 0);
    const cash = stars * CP.STAR_CASH + (contained ? CP.CONTAIN_CASH : 0) + Math.floor(sim.budget * CP.BUDGET_CARRY);""",
"""    const nx = STAGES[k + 1], sp = spEarned(alive, stars, contained);
    const cash = Math.floor(sim.budget * CP.BUDGET_CARRY);""")
rep("""    Object.assign(run, { stage: k + 1, up: Object.assign({}, sim.up), crates, bonus: cash, seed, seedBg, cPity: sim.cPity, bpPity: sim.bpPity }); saveCamp();""",
    """    Object.assign(run, { stage: k + 1, up: Object.assign({}, sim.up), crates: 0, bonus: cash, seed, seedBg, sp: (run.sp || 0) + sp.total, supplies: {}, offers: null, rerolls: 0 }); saveCamp();""")
rep("""    $('bCarry').textContent = 'You take with you: ' + crates + ' free crate' + (crates === 1 ? '' : 's') + ', $' + fmt(cash) + ' extra budget' + (upList() ? ', upgrades: ' + upList() : '') + '. Medals +' + medals + ' (total ' + camp.medals + ').';
    $('bBtn').textContent = 'Advance to stage ' + (k + 2) + ' — ' + nx.name; bAction = () => { $('banner').style.display = 'none'; buildStage(); };""",
"""    $('bCarry').textContent = 'Supply points +' + sp.total + ' (alive ' + sp.alive + ', stars ' + sp.stars + (sp.contain ? ', contained ' + sp.contain : '') + ', kills ' + sp.kills + ', stage ' + sp.stage + ') · ' + run.sp + ' SP to spend · $' + fmt(cash) + ' unspent budget carries over · Medals +' + medals + ' (total ' + camp.medals + ').';
    $('bBtn').textContent = 'Requisition — spend ' + run.sp + ' SP'; bAction = () => { $('banner').style.display = 'none'; openShop(() => buildStage()); };""")
rep("""      '\\nIn-run upgrades and crates are gone. Blueprints, medals and permanent upgrades stay.';""",
    """      '\\nIn-run upgrades, supplies and unspent supply points are gone. Blueprints, medals and permanent upgrades stay.';""")
rep("""    camp.runs++; saveCamp(); setOrigin(lng, lat);""", """    camp.run.sp = 0; camp.run.supplies = {}; camp.runs++; saveCamp(); setOrigin(lng, lat);""")
rep("""function applyCampToSim() { const run = camp.run; sim.up = Object.assign({}, run.up); sim.freeCrates = run.crates; sim.cPity = run.cPity || 0; sim.bpPity = run.bpPity || 0; }""",
    """function applyCampToSim() { const run = camp.run; sim.up = Object.assign({}, run.up); sim.freeCrates = 0; }""")

# ---------------- sandbox end: no more free crates ----------------
rep("""    if (won) { carry = 'LEVEL BEATEN on attempt ' + meta.attempt + '. Upgrades and free crates are reset for the next run.'; meta = { up: {}, crates: 0, attempt: 1 }; saveMeta(); }
    else { const earned = Math.max(CFG.CRATE_FREE_MIN, Math.min(CFG.CRATE_FREE_MAX, Math.floor(sim.kills / CFG.CRATE_FREE_PER_KILLS)));
      meta.up = Object.assign({}, sim.up); meta.crates = sim.freeCrates + earned; meta.attempt++; saveMeta();
      carry = 'You earned ' + earned + ' free supply crate' + (earned > 1 ? 's' : '') + ' for attempt ' + meta.attempt + ' (' + meta.crates + ' waiting).' + (upList() ? '\\nUpgrades you keep: ' + upList() : ''); }""",
"""    if (won) { carry = 'LEVEL BEATEN on attempt ' + meta.attempt + '. Upgrades are reset for the next run.'; meta = { up: {}, crates: 0, attempt: 1 }; saveMeta(); }
    else { meta.up = Object.assign({}, sim.up); meta.crates = 0; meta.attempt++; saveMeta(); carry = 'Attempt ' + meta.attempt + ' next.' + (upList() ? '\\nUpgrades you keep: ' + upList() : ''); }""")
rep("""    meta = m && m.up ? m : { up: {}, crates: 0, attempt: 1 }; sim.up = Object.assign({}, meta.up); sim.freeCrates = meta.crates; }""",
    """    meta = m && m.up ? m : { up: {}, crates: 0, attempt: 1 }; sim.up = Object.assign({}, meta.up); sim.freeCrates = 0; }""")

# ---------------- the crate button opens the shop (sandbox); hidden in the campaign ----------------
rep("""    $('crateBtn').textContent = sim.freeCrates > 0 ? 'Supply crate — FREE ×' + sim.freeCrates + ' (L)' : 'Supply crate $' + CFG.CRATE_COST + ' (L)';""",
    """    $('crateBtn').style.display = isCamp() ? 'none' : '';""")
rep("""crateBtn: 'crate', wallBtn: 'wall',""", """wallBtn: 'wall',""")
rep("""    else if (e.key === 'l' || e.key === 'L') setMode('crate');""", """    else if ((e.key === 'l' || e.key === 'L') && !isCamp()) openShop(null);""")
rep("""if (isLocked(m)) { flash('Locked — find the blueprint in a supply crate.'); return; }""", """if (isLocked(m)) { flash('Locked — buy its blueprint at the requisition screen between stages.'); return; }""")
open(p, 'w').write(s)
print('ok')
