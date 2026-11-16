// Human-like players ("procedural personas"). Each decision is scored by heuristics and picked by a noisy softmax;
// players act at a limited rate, react late, only see part of the map, and place things imprecisely.
const SKILL = {
  novice:  { apm: 8,  react: 4, view: 500, err: 60, temp: 0.9, focus: 0.5, planSpend: 0.0, hunt: 60, minU: 4, threat: 0, spots: 2, spendUrge: 0.2 },
  average: { apm: 15, react: 2, view: 750, err: 30, temp: 0.45, focus: 0.75, planSpend: 0.25, hunt: 40, minU: 5, threat: 0.6, spots: 3, spendUrge: 0.6 },
  expert:  { apm: 30, react: 1, view: 1100, err: 12, temp: 0.2, focus: 0.95, planSpend: 0.4, hunt: 25, minU: 6, threat: 1, spots: 5, spendUrge: 1 },
};
const STYLES = { // multipliers on each action family's utility
  mixed:    {},
  fortress: { wall: 2.2, garrison: 2, zone: 2, turret: 1.6, drop: 0.8, bomb: 0.6 },
  mobile:   { drop: 1.6, apc: 1.8, gunship: 1.3, wall: 0.5, mortar: 0.6 },
  artillery:{ mortar: 1.8, howitzer: 2.2, ship: 1.8, missile: 1.5, drop: 0.8 },
  air:      { bomb: 1.8, precision: 1.6, strafe: 1.8, napalm: 1.6, gunship: 1.5, nuke: 1.3, drop: 0.8 },
};
const CELL = 100;
class Persona {
  constructor(S, C, opts) {
    this.S = S; this.C = C; this.sk = SKILL[opts.skill || 'average']; this.style = STYLES[opts.style || 'mixed']; this.allowed = opts.allowed; this.rng = opts.rng || Math.random;
    this.G = Math.ceil(2 * S.HALF / CELL); this.obs = []; this.nextDecide = 0; this.nextHunt = 10; this.cam = [0, 0]; this.log = {}; this.spend = {}; this.sinceObs = 99;
    this.inRegion = null; this.water = []; this.fails = {}; this.howitzers = 0; this.ships = 0;
  }
  // ---- observation: 100 m grid of zombies (dots + horde) and people (street + sheltering) ----
  observe() { const S = this.S, G = this.G, H = S.HALF, Z = new Float32Array(G * G), P = new Float32Array(G * G);
    const cell = (x, y) => { const cx = ((x + H) / CELL) | 0, cy = ((y + H) / CELL) | 0; return cx < 0 || cy < 0 || cx >= G || cy >= G ? -1 : cx + cy * G; };
    for (let i = 0; i < S.n; i++) { const t = S.type[i]; if (t !== 1 && t !== 2) continue; const c = cell(S.px[i], S.py[i]); if (c < 0) continue; if (t === 2) Z[c]++; else P[c]++; }
    if (S.bgZField) { const HG = S.HG, HC = S.HC; for (let k = 0; k < HG * HG; k++) { const z = S.bgZField[k], h = S.bgHField[k]; if (z < 0.5 && h < 0.5) continue;
      const c = cell(-H + (k % HG + 0.5) * HC, -H + (((k / HG) | 0) + 0.5) * HC); if (c >= 0) { Z[c] += z; P[c] += h; } } }
    if (!this.inRegion) this.mapRegion();
    this.obs.push({ t: S.time, Z, P }); if (this.obs.length > 12) this.obs.shift(); }
  mapRegion() { const S = this.S, G = this.G, H = S.HALF, N = S.N, R = S.RES, reg = S.region; this.inRegion = new Uint8Array(G * G);
    for (let c = 0; c < N * N; c += 3) { const wk = S.walk[c]; if (reg && !reg[c]) continue; const x = -H + (c % N + 0.5) * R, y = -H + (((c / N) | 0) + 0.5) * R;
      const g = (((x + H) / CELL) | 0) + (((y + H) / CELL) | 0) * G; if (wk & 1) this.inRegion[g] = 1; if (wk & 16 && this.water.length < 4000 && (c % 97 === 0)) this.water.push([x, y]); } }
  view() { const lag = Math.min(this.obs.length - 1, Math.round(this.sk.react)); return this.obs[this.obs.length - 1 - lag]; }
  // ---- helpers ----
  xy(c) { return [-this.S.HALF + (c % this.G + 0.5) * CELL, -this.S.HALF + (((c / this.G) | 0) + 0.5) * CELL]; }
  sumR(A, x, y, r) { const G = this.G, H = this.S.HALF, cr = Math.ceil(r / CELL), cx = ((x + H) / CELL) | 0, cy = ((y + H) / CELL) | 0; let s = 0;
    for (let yy = Math.max(0, cy - cr); yy <= Math.min(G - 1, cy + cr); yy++) for (let xx = Math.max(0, cx - cr); xx <= Math.min(G - 1, cx + cr); xx++) { const dx = (xx - cx) * CELL, dy = (yy - cy) * CELL; if (dx * dx + dy * dy <= r * r + CELL * CELL) s += A[xx + yy * G]; } return s; }
  jitter(x, y) { const a = this.rng() * 6.283, d = this.rng() * this.sk.err; return [x + Math.cos(a) * d, y + Math.sin(a) * d]; }
  towardPeople(o, x, y, dist) { // point `dist` metres from (x,y) toward the nearest big group of people
    let best = null, bd = 1e18; for (let c = 0; c < o.P.length; c++) { if (o.P[c] < 20 || o.Z[c] > o.P[c] * 0.2) continue; const [cx, cy] = this.xy(c), d = (cx - x) ** 2 + (cy - y) ** 2; if (d < bd) { bd = d; best = [cx, cy]; } }
    if (!best) return [x, y]; const dx = best[0] - x, dy = best[1] - y, L = Math.hypot(dx, dy) || 1, k = Math.min(dist, L * 0.6); return [x + dx / L * k, y + dy / L * k]; }
  // ---- the decision step ----
  tick(planning) { const S = this.S; this.sinceObs += 1;
    if (this.sinceObs >= 1) { this.sinceObs = 0; this.observe(); }
    if (S.time < this.nextDecide) return; this.nextDecide = S.time + 60 / this.sk.apm * (0.6 + this.rng() * 0.8);
    const o = this.view(); if (!o) return;
    // attention: drift the camera toward the worst spot (zombies next to people)
    if (this.rng() < this.sk.focus) { let best = -1, bs = 0; for (let c = 0; c < o.Z.length; c++) { const s = o.Z[c] * (1 + Math.min(5, o.P[c] / 200)); if (s > bs) { bs = s; best = c; } } if (best >= 0) this.cam = this.xy(best); }
    if (!planning && S.time >= this.nextHunt) { this.nextHunt = S.time + this.sk.hunt; S.selectAll(); S.orderMode('hunt'); S.clearSel(); this.count('cmd', 0); }
    const cands = planning ? this.planCands(o) : this.cands(o); if (!cands.length) return;
    const us = cands.map((a) => Math.log(Math.max(1e-6, a.u)) / this.sk.temp), m = Math.max(...us), w = us.map((u) => Math.exp(u - m)), tot = w.reduce((a, b) => a + b, 0);
    let r = this.rng() * tot, pick = cands[cands.length - 1]; for (let i = 0; i < cands.length; i++) { r -= w[i]; if (r <= 0) { pick = cands[i]; break; } }
    const b0 = S.budget; let ok = false; try { ok = pick.go(); } catch (e) { ok = false; } if (ok && ok.ok !== false) this.count(pick.k, Math.max(0, b0 - S.budget));
  }
  count(k, spent) { this.log[k] = (this.log[k] || 0) + 1; this.spend[k] = (this.spend[k] || 0) + spent; }
  can(k) { return !this.allowed || this.allowed.has(k); }
  planCands(o) { const S = this.S, C = this.C, out = [], add = (k, cost, value, go) => { const free = cost <= 0; if (!free && cost > S.budget) return; const u = (value / Math.max(50, cost)) * (this.style[k] || 1); if (u >= this.sk.minU * 0.3) out.push({ k, u, go }); };
    if (S.spent >= S.budget * this.sk.planSpend + S.spent * 0) return out; // only a share of the budget goes into blind preparation
    // densest people: a safe zone and garrisons there
    let best = -1, bp = 0; for (let c = 0; c < o.P.length; c++) if (o.P[c] > bp) { bp = o.P[c]; best = c; }
    if (best < 0) return out; const [x, y] = this.xy(best);
    if (this.can('zone') && !S.zones.length) { const P = []; for (let a = 0; a < 6.28; a += 0.785) P.push([x + Math.cos(a) * 110, y + Math.sin(a) * 110]); const q = S.zoneQuote ? S.zoneQuote(P) : 300; add('zone', q && q.cost != null ? q.cost : 300, 900, () => { const r = S.addZonePoly(P); return r && r.ok !== false; }); }
    if (this.can('garrison')) for (let k = 0; k < 3; k++) { const [gx, gy] = this.jitter(x + (this.rng() - 0.5) * 300, y + (this.rng() - 0.5) * 300); const q = S.garrisonQuote(gx, gy); if (q && q.cost) add('garrison', q.cost, Math.min(600, q.need * 40), () => S.buyGarrison(gx, gy)); }
    return out; }
  // Values are in one unit: zombies removed (or kept away from people) the action is expected to achieve.
  // Repeating an action in the same area recently is worth less (diminishing returns), and money sitting idle raises the urge to spend.
  recent(k, x, y) { const now = this.S.time; this.mem = (this.mem || []).filter((m) => now - m.t < 90); let n = 0; for (const m of this.mem) if (m.k === k && (m.x - x) ** 2 + (m.y - y) ** 2 < 250 * 250) n++; return Math.pow(0.55, n); }
  cands(o) { const S = this.S, C = this.C, out = [], sk = this.sk, R = sk.view, [cx, cy] = this.cam;
    const idle = 1 + Math.min(2, S.budget / 1500) * sk.spendUrge;
    const add = (k, cost, value, x, y, go) => { if (!this.can(k) || value <= 0) return; if (cost > 0 && cost > S.budget) return;
      const v = value * this.recent(k, x, y) * (this.style[k] || 1), u = v / Math.max(60, cost) * 100 * idle;
      if (u >= sk.minU) out.push({ k, u, go: () => { const r = go(); (this.mem = this.mem || []).push({ k, x, y, t: S.time }); if (!r || r.ok === false) { this.fails[k] = (this.fails[k] || 0) + 1; this.mem.push({ k, x, y, t: S.time }); } return r; } }); };
    // hotspots inside the player's view; better players rank them by threat to people, novices by how many zombies they see
    const hot = []; for (let c = 0; c < o.Z.length; c++) { if (o.Z[c] < 3) continue; const [x, y] = this.xy(c); if ((x - cx) ** 2 + (y - cy) ** 2 > R * R) continue;
      const threat = o.Z[c] * (1 + sk.threat * Math.min(4, this.sumR(o.P, x, y, 250) / 150)); hot.push([threat, c, x, y]); }
    hot.sort((a, b) => b[0] - a[0]); const top = hot.slice(0, sk.spots); if (!top.length) return out;
    for (const [, c, x, y] of top) { const zc = o.Z[c], pc = o.P[c], Z2 = this.sumR(o.Z, x, y, 200), Z3 = this.sumR(o.Z, x, y, 300), Z15 = this.sumR(o.Z, x, y, 150), P15 = this.sumR(o.P, x, y, 150), P3 = this.sumR(o.P, x, y, 300);
      const near = Math.min(1, P3 / 300) * 0.5 + 0.5; // zombies near people matter more
      const [fx, fy] = this.towardPeople(o, x, y, 70);
      { const [jx, jy] = this.jitter(fx, fy); add('drop', S.dropCost, Math.min(Z3, 70) * near, jx, jy, () => S.drop(jx - 30, jy, jx + 30, jy)); }
      { const [jx, jy] = this.jitter(fx, fy); add('apc', C.APC_COST, Math.min(Z3, 140) * near, jx, jy, () => S.addApc(jx, jy)); }
      { const [px2, py2] = this.towardPeople(o, x, y, 140), [jx, jy] = this.jitter(px2, py2); add('turret', C.TURRET_COST, Math.min(this.sumR(o.Z, px2, py2, 200), 90) * near, jx, jy, () => S.addTurret(jx, jy)); }
      { const [jx, jy] = this.jitter(fx, fy); add('sniper', C.SNIPER_COST, Math.min(Z3, 45) * near, jx, jy, () => S.addSnipers(jx, jy)); }
      { const [px2, py2] = this.towardPeople(o, x, y, 180), [jx, jy] = this.jitter(px2, py2); add('mortar', C.MORTAR_COST, Math.min(this.sumR(o.Z, px2, py2, 350), 220), jx, jy, () => S.addMortar(jx, jy)); }
      if (this.howitzers < 2) { const [px2, py2] = this.towardPeople(o, x, y, 500), [jx, jy] = this.jitter(px2, py2); add('howitzer', C.HOWITZER_COST, Math.min(this.sumR(o.Z, px2, py2, 1400), 900), jx, jy, () => { const r = S.addHowitzer(jx, jy); if (r) this.howitzers++; return r; }); }
      if (this.ships < 2 && this.water.length) { let wb = null, wd = 1e18; for (const w of this.water) { const d = (w[0] - x) ** 2 + (w[1] - y) ** 2; if (d < wd) { wd = d; wb = w; } }
        if (wb && wd < 4500 * 4500) add('ship', C.SHIP_COST, Math.min(this.sumR(o.Z, wb[0], wb[1], 4500), 1400), wb[0], wb[1], () => { const r = S.addShip(wb[0], wb[1]); if (r) this.ships++; return r; }); }
      { const [jx, jy] = this.jitter(x, y); add('bomb', S.free.bomb > 0 ? 0 : C.BOMB_COST, Z15 * 0.8 - P15 * 3, jx, jy, () => S.airstrike(jx - 150, jy, jx + 150, jy)); }
      { const [jx, jy] = this.jitter(x, y); add('precision', C.PRECISION_COST, Math.min(zc, 150) * 0.9 - pc * 2, jx, jy, () => S.precisionBomb(jx, jy)); }
      { const [jx, jy] = this.jitter(x, y); add('strafe', C.STRAFE_COST, Z15 * 0.7 - P15 * 1.5, jx, jy, () => S.strafe(jx - 150, jy, jx + 150, jy)); }
      { const [jx, jy] = this.jitter(x, y); add('napalm', C.FIRE_COST, Z15 * 0.9 - P15 * 4, jx, jy, () => S.firebomb(jx - 140, jy, jx + 140, jy)); }
      { const [jx, jy] = this.jitter(x, y); add('gunship', S.free.heli > 0 ? 0 : C.HELI_COST, Math.min(Z3, 300), jx, jy, () => S.gunship(jx, jy)); }
      if (S.missilesLeft && S.missilesLeft() > 0 && zc > 80) { const [jx, jy] = this.jitter(x, y); add('missile', 1, zc - pc * 2, jx, jy, () => S.fireMissile(jx, jy)); }
      { const Zn = this.sumR(o.Z, x, y, 400), Pn = this.sumR(o.P, x, y, 400), alive = S.allH / Math.max(1, S.allH0);
        if (Zn > 2500) { const [jx, jy] = this.jitter(x, y); add('nuke', S.free.nuke > 0 ? 0 : C.NUKE_COST, (Zn * 0.9 - Pn * 1.5) * (alive < 0.5 ? 1.3 : 0.7), jx, jy, () => S.nuke(jx, jy)); } }
      // barricade across the zombies' path toward the people: worth the zombies it holds back from them
      { const [wx, wy] = this.towardPeople(o, x, y, 100), dx = wx - x, dy = wy - y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
        const x0 = wx + nx * 25, y0 = wy + ny * 25, x1 = wx - nx * 25, y1 = wy - ny * 25, cost = S.wallCost ? S.wallCost(x0, y0, x1, y1, false) : 60;
        add('wall', cost || 60, Math.min(Z2, this.sumR(o.P, wx, wy, 200)) * 0.25, wx, wy, () => S.buildWall(x0, y0, x1, y1, false)); }
      { const [gx, gy] = this.jitter(fx, fy), q = S.garrisonQuote(gx, gy); if (q && q.cost) add('garrison', q.cost, Math.min(q.need * 2.5, Z3 * 0.6 + 20) * near, gx, gy, () => S.buyGarrison(gx, gy)); }
    }
    if (S.fires && S.fires().length > 40) { const fl = S.fires(), c = fl[(this.rng() * fl.length) | 0], fx = -S.HALF + (c % S.N + 0.5) * S.RES, fy = -S.HALF + (((c / S.N) | 0) + 0.5) * S.RES;
      add('water', C.WATER_COST, fl.length * 1.2, fx, fy, () => S.waterbomb(fx - 150, fy, fx + 150, fy)); }
    return out; }
  summary() { return { actions: this.log, spend: this.spend, fails: this.fails }; }
}
module.exports = { Persona, SKILL, STYLES };
