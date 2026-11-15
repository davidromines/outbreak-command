s=open('/home/claude/outbreak.html').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:60],s.count(a)); s=s.replace(a,b)
# CSS
rep("  #shop{position:absolute;", """  #intro{position:absolute;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at center,rgba(8,12,10,.55) 0%,rgba(4,6,5,.92) 75%)}
  #intro .ibox{text-align:center;width:min(440px,90vw)}
  #intro h2{margin:0;font-size:clamp(38px,7vw,64px);letter-spacing:.08em;font-weight:900;color:#e8f5e0;text-shadow:0 0 24px rgba(57,255,20,.45),0 2px 0 #000}
  #intro h2 span{color:#39ff14}
  #intro .sub{color:#8fa39a;letter-spacing:.3em;font-size:12px;margin:6px 0 34px}
  #intro label{display:block;text-align:left;color:#9fb0bb;font-size:12px;letter-spacing:.12em;margin-bottom:6px}
  #intro select,#intro input{width:100%;box-sizing:border-box;background:#11171c;color:#e8eef2;border:1px solid #3a4854;border-radius:8px;padding:11px 12px;font-size:15px;margin-bottom:8px}
  #intro #iStart{width:100%;margin-top:18px;padding:15px;font-size:20px;font-weight:800;letter-spacing:.2em;background:#1f6e12;color:#fff;border:1px solid #39ff14;border-radius:10px;cursor:pointer}
  #intro #iStart:hover{background:#2a8f19}
  #intro #iNote{min-height:18px;color:#ffc857;font-size:12.5px;margin-top:4px;text-align:left}
  #shop{position:absolute;""")
# HTML
rep('<div id="shop"><div class="box">', '''<div id="intro"><div class="ibox"><h2>OUTBREAK <span>COMMAND</span></h2><div class="sub">HOLD THE CITY</div>
  <label for="iLoc">LOCATION</label><select id="iLoc"></select><input id="iSearch" placeholder="…or type any town, city or address"><div id="iNote"></div>
  <button id="iStart">START</button></div></div>
<div id="shop"><div class="box">''')
# don't boot until Start
rep("  setTimeout(bootstrap, 0);", r"""  // --- intro screen: pick a location, press Start ---
  let introOn = true; const LOCKEY = 'oc_loc';
  (function intro() {
    const sel = $('iLoc'); let saved = null; try { saved = JSON.parse(localStorage.getItem(LOCKEY) || 'null'); } catch (e) {}
    const add = (v, t) => { const o = document.createElement('option'); o.value = v; o.textContent = t; sel.appendChild(o); };
    if (isCamp() && camp.run) add('cont', 'Continue current run' + (saved && saved.name ? ' — ' + saved.name : ''));
    else if (saved) add('saved', saved.name || 'Last location');
    CITIES.forEach((c, i) => add(i, c[0]));
    const pick = () => { const v = sel.value; if (v === 'cont') return { lng: camp.run.lng, lat: camp.run.lat, name: saved && saved.name, cont: true };
      if (v === 'saved') return saved; const c = CITIES[+v]; return { lng: c[1], lat: c[2], name: c[0] }; };
    const note = () => { $('iNote').textContent = isCamp() && camp.run && sel.value !== 'cont' ? 'Starting somewhere new ends your current run.' : ''; };
    const preview = () => { const p = pick(); if (p) map.jumpTo({ center: [p.lng, p.lat] }); note(); };
    sel.onchange = () => { $('iSearch').value = ''; preview(); }; preview();
    async function start() {
      let p = pick(); const q = $('iSearch').value.trim();
      if (q) { $('iStart').textContent = 'FINDING…';
        try { const r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(q)); const j = await r.json();
          if (!j[0]) { $('iNote').textContent = 'Couldn’t find "' + q + '". Try adding the country.'; $('iStart').textContent = 'START'; return; }
          p = { lng: +j[0].lon, lat: +j[0].lat, name: q }; } catch (e) { $('iNote').textContent = 'Search failed — check the connection or pick from the list.'; $('iStart').textContent = 'START'; return; } }
      try { localStorage.setItem(LOCKEY, JSON.stringify({ lng: p.lng, lat: p.lat, name: p.name })); } catch (e) {}
      introOn = false; $('intro').style.display = 'none'; audio.init(); $('modeSel').value = gameMode; updateLocks();
      if (p.cont) bootstrap();
      else if (isCamp()) { setOrigin(p.lng, p.lat); map.jumpTo({ center: [p.lng, p.lat] }); newRun(p.lng, p.lat); }
      else { setOrigin(p.lng, p.lat); map.jumpTo({ center: [p.lng, p.lat] }); buildSandbox(); }
    }
    $('iStart').onclick = start;
    $('iSearch').addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') start(); });
    $('iSearch').addEventListener('input', () => note());
  })();
  // --- WASD camera panning (screen-relative, so it follows the map's rotation) ---
  const held = new Set(); let panLast = performance.now();
  (function panLoop(now) { const dt = Math.min(0.05, (now - panLast) / 1000); panLast = now;
    if (held.size && !introOn && !picking) { let dx = 0, dy = 0; if (held.has('w')) dy -= 1; if (held.has('s')) dy += 1; if (held.has('a')) dx -= 1; if (held.has('d')) dx += 1;
      if (dx || dy) { const k = (CFG.PAN_SPEED || 900) * dt / Math.hypot(dx, dy); camTouched = true; map.panBy([dx * k, dy * k], { duration: 0 }); } }
    requestAnimationFrame(panLoop); })(panLast);
  window.addEventListener('blur', () => held.clear());
  // --- right click (without dragging) = deselect: drops the current tool, then the selected troops ---
  function deselect() { if (zoneDraft.length) { zoneDraft = []; zonePoly.setAttribute('visibility', 'hidden'); costTxt.setAttribute('visibility', 'hidden'); }
    if (mode) setMode(mode); else sim.clearSel(); }
  let rdown = null; const cont = map.getCanvasContainer();
  cont.addEventListener('mousedown', (e) => { if (e.button === 2) rdown = [e.clientX, e.clientY]; });
  window.addEventListener('mouseup', (e) => { if (e.button === 2 && rdown) { if (Math.hypot(e.clientX - rdown[0], e.clientY - rdown[1]) < 6) deselect(); rdown = null; } });
  document.addEventListener('contextmenu', (e) => { if (!e.target.closest || !e.target.closest('input')) e.preventDefault(); });""")
# dropLayer: right button = deselect, not a drag
rep("  dl.addEventListener('pointerdown', (e) => { dl.setPointerCapture(e.pointerId);",
    "  dl.addEventListener('pointerdown', (e) => { if (e.button === 2) { deselect(); return; } dl.setPointerCapture(e.pointerId);")
# keys
rep("    if (picking) { if (shopCtx)", "    if (introOn) return;\n    { const k = e.key.toLowerCase(); if ((k === 'w' || k === 'a' || k === 's' || k === 'd') && !e.ctrlKey && !e.metaKey) { held.add(k); return; } }\n    if (picking) { if (shopCtx)")
rep("    else if (e.key === 's' || e.key === 'S') setMode('sniper');", "    else if (e.key === 'i' || e.key === 'I') setMode('sniper');")
rep("    else if (e.key === 'd' || e.key === 'D') setMode('ship');", "    else if (e.key === '2') setMode('ship');")
rep("    else if (e.key === 'w' || e.key === 'W') setMode('heli');", "    else if (e.key === '1') setMode('heli');")
rep("    else if (e.key === 'a' || e.key === 'A') sim.selectAll();\n", "")
rep("  window.addEventListener('keyup', (e) => {", "  window.addEventListener('keydown', (e) => { if (!introOn && !picking && (e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) { e.preventDefault(); sim.selectAll(); } }, true);\n  window.addEventListener('keyup', (e) => { held.delete(e.key.toLowerCase());")
# labels
rep("'Snipers $' + CFG.SNIPER_COST + ' (S)'", "'Snipers $' + CFG.SNIPER_COST + ' (I)'")
rep("'Heli $' + CFG.HELI_COST + ' (W)'", "'Heli $' + CFG.HELI_COST + ' (1)'",2)
rep("ship: ['Destroyer', CFG.SHIP_COST, 'D']", "ship: ['Destroyer', CFG.SHIP_COST, '2']")
# hint
rep("<b>L</b> supply crate: click where it should land; the contents are random (common, uncommon, rare or jackpot) and can include upgrades. Upgrades and free crates earned by losing carry over to your next attempt on this map, and reset when you beat it. ", "<b>L</b> (sandbox only) requisition screen. ")
rep("<b>S</b> sniper team", "<b>I</b> sniper team")
rep("<b>W</b> gunship", "<b>1</b> gunship")
rep("<b>D</b> destroyer", "<b>2</b> destroyer")
rep("<b>A</b> select all", "<b>Ctrl+A</b> select all")
rep("Drag to pan, scroll to zoom, right-drag to tilt/rotate.", "<b>W A S D</b> or drag to pan, scroll to zoom, right-drag to tilt/rotate, <b>right-click</b> to drop the current tool or selection.")
open('/home/claude/outbreak.html','w').write(s)
print('ok')
