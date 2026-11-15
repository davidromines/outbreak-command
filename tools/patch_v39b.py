s=open('/home/claude/outbreak.html').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:70],s.count(a)); s=s.replace(a,b)
# --- sim: how many people shelter in one map building (its floor share of each 40 m block) ---
rep("    for (let k = 0; k < HN; k++) { if (fl[k]) { bH[k] = want * fl[k] / tot; hwalk[k] = 1; } } S.bgH = S.bgH0 = want; }",
    "    for (let k = 0; k < HN; k++) { if (fl[k]) { bH[k] = want * fl[k] / tot; hwalk[k] = 1; } } S.bgH = S.bgH0 = want; hFloor = fl; }\n  let hFloor = null;")
rep("  S.bgHit = bgHit;\n", """  S.bgHit = bgHit;
  S.shelterIn = function (f) { if (!bfid || !fcount || f < 0 || f >= fcount.length || !hFloor) return null; let p = 0, z = 0, floors = 0; const seen = new Set();
    for (let q = ffirst[f]; q < ffirst[f + 1]; q++) { const c = fcells[q]; if (!(walk[c] & 2)) continue; const k = hcOf(-HALF + (c % N + 0.5) * RES, -HALF + (((c / N) | 0) + 0.5) * RES);
      const fa = Math.max(1, Math.round((bheight[c] || CFG.FLOOR_HEIGHT) / CFG.FLOOR_HEIGHT)) * RES * RES; floors = Math.max(floors, fa / (RES * RES)); if (hFloor[k] > 0) p += bH[k] * fa / hFloor[k]; if (!seen.has(k)) { seen.add(k); z += bZ[k]; } }
    return { people: p, zombies: z, floors, gone: !!fgone[f], dmg: S.damageOf(f) }; };
""")
# --- glow: one stray zombie barely tints a block; real crowds glow ---
rep("if (z >= 1) { const a = Math.min(1, 0.25 + Math.log10(z) * 0.28);", "if (z >= 1) { const a = Math.min(1, 0.07 + Math.log10(z) * 0.26);")
# --- hover tooltip on buildings ---
rep("  function drawHorde() { try {", """  const bTip = document.createElement('div'); bTip.id = 'bTip'; document.body.appendChild(bTip);
  map.on('mousemove', (e) => { if (!sim || !sim.shelterIn || mode || introOn || trans) { bTip.style.display = 'none'; return; }
    let f = null; try { f = map.getLayer('bld3dg') ? map.queryRenderedFeatures(e.point, { layers: ['bld3dg'] })[0] : null; } catch (er) {}
    const r = f && f.id != null ? sim.shelterIn(f.id) : null; if (!r || r.gone) { bTip.style.display = 'none'; return; }
    const p = Math.round(r.people), z = Math.round(r.zombies);
    bTip.innerHTML = '<b>' + p.toLocaleString('en-US') + '</b> sheltering' + (r.floors > 1 ? ' · ' + r.floors + ' floors' : '') + (z ? '<br><span class="z">' + z.toLocaleString('en-US') + ' zombies on this block</span>' : '') + (r.dmg > 0.05 ? '<br><span class="d">' + Math.round(r.dmg * 100) + '% damaged</span>' : '');
    bTip.style.display = 'block'; bTip.style.left = (e.originalEvent.clientX + 14) + 'px'; bTip.style.top = (e.originalEvent.clientY + 12) + 'px'; });
  map.on('mouseout', () => { bTip.style.display = 'none'; });
  function drawHorde() { try {""")
rep("  .inb{", "  #bTip{position:fixed;z-index:30;display:none;pointer-events:none;background:rgba(12,16,20,.92);border:1px solid #3a4854;border-radius:6px;padding:5px 8px;color:#e8eef2;font:12.5px/1.35 system-ui,sans-serif}\n  #bTip .z{color:#78ff5a}#bTip .d{color:#ff9a5a}\n  .inb{")
# --- title card waits for the player ---
rep("        if (u < 1) tr.raf = requestAnimationFrame(frame);\n        else { tr.grown = true; dropAnim(); show(); tr.timers.push(setTimeout(() => { $('tCard').classList.remove('on'); fit(1700); }, 1100), setTimeout(() => transEnd(false), 2900)); } };",
    "        if (u < 1) tr.raf = requestAnimationFrame(frame);\n        else { tr.grown = true; dropAnim(); show(); $('tSkip').textContent = 'CLICK OR PRESS SPACE TO CONTINUE'; $('tSkip').classList.add('go'); } };")
rep("const u = Math.min(1, Math.max(0, (now - start) / DUR))", "const u = tr.fast ? 1 : Math.min(1, Math.max(0, (now - start) / DUR))")
rep("  $('trans').addEventListener('click', () => transEnd(true));", """  function transClick() { const tr = trans; if (!tr || tr.settling) return;
    if (tr.grown === true) { tr.settling = true; $('tCard').classList.remove('on'); $('tSkip').style.display = 'none'; fit(1700); tr.timers.push(setTimeout(() => transEnd(false), 1750)); }
    else if (tr.grown === 'running') tr.fast = true; } // first click finishes the animation; the card stays until the next one
  $('trans').addEventListener('click', transClick);""")
rep("    if (trans) { if (e.key === ' ' || e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); transEnd(true); } return; }",
    "    if (trans) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); transClick(); } else if (e.key === 'Escape') { e.preventDefault(); transEnd(true); } return; }")
rep("  #tSkip{position:absolute;right:18px;bottom:calc(11vh - 30px);color:#7d8a93;font-size:12px;letter-spacing:.1em}",
    "  #tSkip{position:absolute;right:18px;bottom:calc(11vh - 30px);color:#7d8a93;font-size:12px;letter-spacing:.1em}\n  #tSkip.go{left:0;right:0;text-align:center;bottom:calc(11vh + 18px);color:#ffd54a;font-size:14px;animation:tgo 1.4s ease-in-out infinite}\n  @keyframes tgo{50%{opacity:.35}}")
rep("    $('tCard').classList.remove('on'); document.body.classList.remove('trans');", "    $('tCard').classList.remove('on'); $('tSkip').className = ''; $('tSkip').style.display = ''; $('tSkip').textContent = 'CLICK OR SPACE TO SKIP'; document.body.classList.remove('trans');")
open('/home/claude/outbreak.html','w').write(s)
print('ok')
