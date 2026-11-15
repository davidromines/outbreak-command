s=open('/home/claude/outbreak.html').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:70],s.count(a)); s=s.replace(a,b)
rep("  BOMB_DELAY: 4,", "  DROP_DELAY: 6,         // seconds from ordering paratroopers until the transport plane drops them\n  BOMB_DELAY: 4,")
rep("S.shells = []; S.blasts = []; S.planes = []; S.helis = [];", "S.shells = []; S.blasts = []; S.planes = []; S.helis = []; S.inbound = []; S.pendingDrops = [];")
# countdown entries for every air-delivered order
rep("    S.nukes.push({ x, y, t: CFG.NUKE_DELAY });", "    S.nukes.push({ x, y, t: CFG.NUKE_DELAY }); S.inbound.push({ k: 'nuke', x, y, t: CFG.NUKE_DELAY });")
rep("t: CFG.PRECISION_DELAY, r: CFG.PRECISION_BLAST, dz: CFG.PRECISION_DAMAGE, dmg: 600, walls: true, snd: 7 });", "t: CFG.PRECISION_DELAY, r: CFG.PRECISION_BLAST, dz: CFG.PRECISION_DAMAGE, dmg: 600, walls: true, snd: 7 }); S.inbound.push({ k: 'precision', x, y, t: CFG.PRECISION_DELAY });")
rep("    S.strafes.push({ x0, y0, dx, dy, len, t: CFG.STRAFE_DELAY, prog: 0, hit: new Set() });", "    S.strafes.push({ x0, y0, dx, dy, len, t: CFG.STRAFE_DELAY, prog: 0, hit: new Set() }); S.inbound.push({ k: 'strafe', x: x0 + dx * len / 2, y: y0 + dy * len / 2, t: CFG.STRAFE_DELAY });")
rep("t: CFG.BOMB_DELAY + k * gap, r: CFG.FIRE_BLAST, dz: 9999, dmg: 200, fire: true, snd: 20 });", "t: CFG.BOMB_DELAY + k * gap, r: CFG.FIRE_BLAST, dz: 9999, dmg: 200, fire: true, snd: 20 }); S.inbound.push({ k: 'firebomb', x: x0 + dx * len / 2, y: y0 + dy * len / 2, t: CFG.BOMB_DELAY });")
rep("t: CFG.WATER_DELAY + k * gap, r: CFG.WATER_BLAST, water: true, snd: 22 });", "t: CFG.WATER_DELAY + k * gap, r: CFG.WATER_BLAST, water: true, snd: 22 }); S.inbound.push({ k: 'water', x: x0 + dx * len / 2, y: y0 + dy * len / 2, t: CFG.WATER_DELAY });")
rep("walls: true }); }\n    S.planes.push({ x: x0, y: y0, dx, dy, v: len / ((nb - 1) * gap), age: 0 }); emit(14, x0 + dx * len / 2, y0 + dy * len / 2);",
    "walls: true }); }\n    S.planes.push({ x: x0, y: y0, dx, dy, v: len / ((nb - 1) * gap), age: 0 }); emit(14, x0 + dx * len / 2, y0 + dy * len / 2); S.inbound.push({ k: 'bomb', x: x0 + dx * len / 2, y: y0 + dy * len / 2, t: CFG.BOMB_DELAY });")
rep("    S.helis.push({ x, y, hx: x, hy: y, t: CFG.HELI_TIME, delay: CFG.HELI_DELAY, a: rnd() * 6.283, acc: 0, age: 0 });", "    S.helis.push({ x, y, hx: x, hy: y, t: CFG.HELI_TIME, delay: CFG.HELI_DELAY, a: rnd() * 6.283, acc: 0, age: 0 }); S.inbound.push({ k: 'heli', x, y, t: CFG.HELI_DELAY });")
# paratroopers: pay now, a transport flies the line, troops jump when it arrives
rep("""    if (len > CFG.DROP_MAX_LEN) { dx *= CFG.DROP_MAX_LEN / len; dy *= CFG.DROP_MAX_LEN / len; }
    for (let k = 0; k < S.dropSize; k++) {""", """    if (len > CFG.DROP_MAX_LEN) { dx *= CFG.DROP_MAX_LEN / len; dy *= CFG.DROP_MAX_LEN / len; }
    const L = Math.hypot(dx, dy), D = CFG.DROP_DELAY, ux = L > 5 ? dx / L : 1, uy = L > 5 ? dy / L : 0;
    S.pendingDrops.push({ x0, y0, dx, dy, len, size: S.dropSize, t: D });
    S.planes.push({ x: x0 - ux * 40, y: y0 - uy * 40, dx: ux, dy: uy, v: (Math.max(L, 20) + 80) / 1.6, age: 0, delay: D, transport: 1 });
    S.inbound.push({ k: 'drop', x: x0 + dx / 2, y: y0 + dy / 2, t: D });
    S.drops++; emit(13, x0 + dx / 2, y0 + dy / 2);
    return true;
  };
  function spawnDrop(pd) { const { x0, y0, dx, dy, len } = pd;
    for (let k = 0; k < pd.size; k++) {""")
rep("""    S.drops++; emit(13, x0 + dx / 2, y0 + dy / 2);
    return true;
  };

  S.step = function (dt) {""", """  }

  S.step = function (dt) {
    for (let q = S.inbound.length - 1; q >= 0; q--) if ((S.inbound[q].t -= dt) <= 0) S.inbound.splice(q, 1);
    for (let q = S.pendingDrops.length - 1; q >= 0; q--) { const pd = S.pendingDrops[q]; if ((pd.t -= dt) <= 0) { S.pendingDrops.splice(q, 1); spawnDrop(pd); } }""")
open('/home/claude/outbreak.html','w').write(s)
print('ok')
