s=open('/home/claude/outbreak.html').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:70],s.count(a)); s=s.replace(a,b)
# 1. sim: keep the road-distance field so the game can animate the region growing
rep("""    const inside = new Uint8Array(NN); for (let c = 0; c < NN; c++) if (dist[c] <= maxD) inside[c] = 1;
    // buildings that front the region come with it (up to 45 m deep)
    let front = []; for (let c = 0; c < NN; c++) if (inside[c]) front.push(c);""",
"""    const inside = new Uint8Array(NN), rd = new Uint16Array(NN).fill(65535); for (let c = 0; c < NN; c++) if (dist[c] <= maxD) { inside[c] = 1; rd[c] = Math.min(65534, dist[c]); }
    // buildings that front the region come with it (up to 45 m deep)
    let front = []; for (let c = 0; c < NN; c++) if (inside[c]) front.push(c);""")
rep("if (m >= 0 && m < NN && !inside[m] && (walk[m] & 2)) { inside[m] = 2; nx.push(m); } }",
    "if (m >= 0 && m < NN && !inside[m] && (walk[m] & 2)) { inside[m] = 2; rd[m] = Math.min(65534, rd[c] + 1); nx.push(m); } }")
rep("    for (let c = 0; c < NN; c++) if (!inside[c]) walk[c] = 0;\n    dist.fill(INF); return inside;",
    "    for (let c = 0; c < NN; c++) if (!inside[c]) walk[c] = 0;\n    S.regionDist = rd; dist.fill(INF); return inside;")
# 2. CSS + HTML
rep("  #shop{position:absolute;", """  #trans{position:absolute;inset:0;z-index:35;display:none;cursor:pointer}
  #trans .bar{position:absolute;left:0;right:0;height:0;background:#000;transition:height .7s ease}
  #trans .bar.t{top:0}#trans .bar.b{bottom:0}
  body.trans #trans .bar{height:11vh}
  #tCard{position:absolute;left:50%;bottom:15vh;transform:translateX(-50%);text-align:center;opacity:0;transition:opacity .6s ease;pointer-events:none;width:90vw}
  #tCard.on{opacity:1}
  #tCard .k{color:#ffd54a;letter-spacing:.35em;font-size:13px}
  #tCard .n{font-size:clamp(34px,6vw,58px);font-weight:900;letter-spacing:.08em;color:#f2f6ee;text-shadow:0 0 22px rgba(255,60,50,.55),0 2px 0 #000;margin:4px 0}
  #tCard .l{color:#c9d3d9;font-size:15px;letter-spacing:.06em;text-shadow:0 1px 3px #000;min-height:20px}
  #tCard .l2{color:#78ff5a;font-size:14px;margin-top:3px;text-shadow:0 1px 3px #000;min-height:18px}
  #tSkip{position:absolute;right:18px;bottom:calc(11vh - 30px);color:#7d8a93;font-size:12px;letter-spacing:.1em}
  body.trans #hud,body.trans #dropLayer,body.trans .maplibregl-ctrl-bottom-right{display:none!important}
  #shop{position:absolute;""")
rep('<div id="shop"><div class="box">', '''<div id="trans"><div class="bar t"></div><div class="bar b"></div><div id="tCard"><div class="k" id="tK"></div><div class="n" id="tN"></div><div class="l" id="tL"></div><div class="l2" id="tL2"></div></div><div id="tSkip">CLICK OR SPACE TO SKIP</div></div>
<div id="shop"><div class="box">''')
# 3. hooks: stage advance, new run, continue
rep("bAction = () => { $('banner').style.display = 'none'; openShop(() => buildStage()); };",
    "bAction = () => { $('banner').style.display = 'none'; openShop(() => { transBegin(camp.run.stage, STAGES[camp.run.stage - 1] ? STAGES[camp.run.stage - 1].R : 0); buildStage(); }); };")
rep("camp.run.sp = 0; camp.run.supplies = {}; camp.runs++; saveCamp(); setOrigin(lng, lat); map.jumpTo({ center: [lng, lat] }); buildStage();",
    "camp.run.sp = 0; camp.run.supplies = {}; camp.runs++; saveCamp(); setOrigin(lng, lat); map.jumpTo({ center: [lng, lat] }); transBegin(0, 0); buildStage();")
rep("sim.seed = run.seed; sim.seedBg = run.seedBg || null; seenBreaches = 0; seenRec = 0; fit(); loadStreets(); loadElevation();",
    "sim.seed = run.seed; sim.seedBg = run.seedBg || null; seenBreaches = 0; seenRec = 0; if (!trans) fit(); loadStreets(); loadElevation();")
rep("      if (p.cont) bootstrap();", "      if (p.cont) { if (isCamp() && camp.run) { setOrigin(camp.run.lng, camp.run.lat); map.jumpTo({ center: [camp.run.lng, camp.run.lat] }); transBegin(camp.run.stage, 0); } bootstrap(); }")
# 4. drawRegion: during a transition, animate instead
rep("    if (map.isStyleLoaded()) show(); else styleP.then(show);\n  }",
"""    const go = () => { if (trans && !trans.grown && sim.regionDist) transGrow(show); else show(); };
    if (map.isStyleLoaded()) go(); else styleP.then(go);
  }
  // ---- stage transition: camera pulls back, the border spreads along the real roads, title card, settle ----
  let trans = null;
  const shortN = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e4 ? Math.round(n / 1e3) + 'k' : Math.round(n).toLocaleString('en-US');
  function transBegin(k, fromR) {
    if (trans) transEnd(true);
    const st = STAGES[k], now = performance.now(); trans = { k, fromR, toR: st.R, t0: now, grown: false, done: false, raf: 0, timers: [] };
    document.body.classList.add('trans'); $('trans').style.display = 'block';
    $('tK').textContent = 'STAGE ' + (k + 1) + ' / ' + STAGES.length; $('tN').textContent = st.name.toUpperCase();
    $('tL').textContent = 'Hold ' + Math.floor(st.time / 60) + ':' + String(st.time % 60).padStart(2, '0') + ' · fall line ' + Math.round(st.bar * 100) + '% alive'; $('tL2').textContent = '';
    trans.timers.push(setTimeout(() => $('tCard').classList.add('on'), 350));
    // camera: frame the new region from higher up (stage 1 / continue: drop in from city level)
    const h = st.R * 0.8, a = toLngLat(-h, h), b = toLngLat(h, -h), cam = map.cameraForBounds([[a.lng, a.lat], [b.lng, b.lat]], { padding: 40 }) || {};
    if (!fromR) map.jumpTo({ center: toLngLat(0, 0), zoom: Math.max(3, (cam.zoom || 13) - 2.6), pitch: 0, bearing: 0 });
    map.flyTo({ center: toLngLat(0, 0), zoom: cam.zoom || 13, pitch: 38, bearing: CFG.VIEW_BEARING * 0.5, duration: fromR ? 2000 : 2600, essential: true });
    try { audio.sting(k); } catch (e) {}
    const wait = () => { if (!trans || trans.grown) return; if (!ready) $('tL2').textContent = $('status').textContent; trans.raf = requestAnimationFrame(wait); }; wait();
  }
  function transGrow(show) { const tr = trans;
    let cv, g, im, M = 512; try {
      const N = sim.N, RES = sim.RES, rd = sim.regionDist, pd = new Float32Array(M * M);
      for (let y = 0; y < M; y++) for (let x = 0; x < M; x++) { const v = rd[((x + 0.5) * N / M | 0) + ((y + 0.5) * N / M | 0) * N]; pd[x + y * M] = v === 65535 ? Infinity : v * RES; }
      cv = document.createElement('canvas'); cv.width = cv.height = M; g = cv.getContext('2d'); im = g.createImageData(M, M);
      // headline numbers
      let cells = 0; for (const v of sim.region) if (v) cells++;
      let seed = (sim.seed ? sim.seed.length / 2 : 0); if (sim.seedBg) for (let q = 2; q < sim.seedBg.length; q += 3) seed += sim.seedBg[q];
      $('tL2').textContent = (cells * RES * RES / 1e6).toFixed(1) + ' km² · ' + shortN(sim.allH || (sim.nh + (sim.bgH || 0))) + ' people' + (seed >= 1 ? ' · ' + shortN(seed) + ' infected broke through' : '');
      const hh = sim.HALF, co = [toLngLat(-hh, -hh), toLngLat(hh, -hh), toLngLat(hh, hh), toLngLat(-hh, hh)].map((p) => [p.lng, p.lat]);
      if (map.getLayer('region')) map.setLayoutProperty('region', 'visibility', 'none');
      if (map.getLayer('regionAnim')) map.removeLayer('regionAnim'); if (map.getSource('regionAnim')) map.removeSource('regionAnim');
      map.addSource('regionAnim', { type: 'canvas', canvas: cv, coordinates: co, animate: true });
      map.addLayer({ id: 'regionAnim', type: 'raster', source: 'regionAnim', paint: { 'raster-fade-duration': 0 } }, map.getLayer('bld3dg') ? 'bld3dg' : map.getLayer('agents') ? 'agents' : undefined);
      const r0 = tr.fromR * 0.98, r1 = tr.toR + 60, start = Math.max(performance.now(), tr.t0 + (tr.fromR ? 1300 : 1700)), DUR = 2600, d = im.data, kk = M / (2 * hh);
      const frame = (now) => { if (trans !== tr || tr.done) return;
        const u = clamp((now - start) / DUR, 0, 1), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2, r = r0 + (r1 - r0) * e, band = 160;
        for (let i = 0, n = M * M; i < n; i++) { const v = pd[i], o = i * 4;
          if (v > r) { d[o] = 4; d[o + 1] = 6; d[o + 2] = 9; d[o + 3] = 205; continue; }
          const x = i % M, edge = (x > 0 && pd[i - 1] > r) || (x < M - 1 && pd[i + 1] > r) || (i >= M && pd[i - M] > r) || (i < n - M && pd[i + M] > r);
          if (edge) { d[o] = 255; d[o + 1] = 70 + 120 * (1 - u); d[o + 2] = 40; d[o + 3] = 255; }
          else if (v > r - band && v > r0 && u < 1) { const a = (1 - (r - v) / band) * (1 - u * 0.6); d[o] = 255; d[o + 1] = 50; d[o + 2] = 30; d[o + 3] = 110 * a; }
          else d[o + 3] = 0; }
        g.putImageData(im, 0, 0);
        if (u > 0.35) { const pulse = 0.5 + 0.5 * Math.sin(now / 180), al = Math.min(1, (u - 0.35) * 2);
          const sd = sim.seed; if (sd) { g.fillStyle = 'rgba(90,255,40,' + (0.35 + 0.35 * pulse) * al + ')'; for (let q = 0; q < sd.length; q += 2) { g.beginPath(); g.arc((sd[q] + hh) * kk, (sd[q + 1] + hh) * kk, 2 + 2 * pulse, 0, 6.283); g.fill(); } }
          const sb = sim.seedBg; if (sb) for (let q = 0; q < sb.length; q += 3) { g.fillStyle = 'rgba(90,255,40,' + Math.min(0.7, 0.15 + Math.log10(1 + sb[q + 2]) * 0.18) * al * (0.6 + 0.4 * pulse) + ')'; const s2 = 5 + 3 * pulse; g.fillRect((sb[q] + hh) * kk - s2 / 2, (sb[q + 1] + hh) * kk - s2 / 2, s2, s2); } }
        if (u < 1) tr.raf = requestAnimationFrame(frame);
        else { tr.grown = true; dropAnim(); show(); tr.timers.push(setTimeout(() => { $('tCard').classList.remove('on'); fit(1700); }, 1100), setTimeout(() => transEnd(false), 2900)); } };
      tr.grown = 'running'; tr.show = show; tr.raf = requestAnimationFrame(frame);
    } catch (e) { console.warn('transition', e); dropAnim(); show(); transEnd(false); fit(0); }
  }
  function dropAnim() { try { if (map.getLayer('regionAnim')) map.removeLayer('regionAnim'); if (map.getSource('regionAnim')) map.removeSource('regionAnim'); } catch (e) {} }
  function transEnd(skip) { const tr = trans; if (!tr) return; tr.done = true; cancelAnimationFrame(tr.raf); tr.timers.forEach(clearTimeout); trans = null;
    if (tr.grown !== true && tr.show) { dropAnim(); tr.show(); }
    if (skip) { map.stop(); if (ready) fit(0); }
    $('tCard').classList.remove('on'); document.body.classList.remove('trans'); $('trans').style.display = 'none'; map.resize(); }
  $('trans').addEventListener('click', () => transEnd(true));""")
# if the player skips before the stage has loaded, loadStreets/drawRegion still finish normally; frame them then
rep("    enterPlan(); ready = true;\n", "    enterPlan(); ready = true; if (!trans && !camTouched && isCamp()) fit(0);\n")
# 5. input while the transition plays
rep("    if (introOn) return;\n", "    if (introOn) return;\n    if (trans) { if (e.key === ' ' || e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); transEnd(true); } return; }\n")
rep("if (held.size && !introOn && !picking)", "if (held.size && !introOn && !picking && !trans)")
rep("window.addEventListener('keydown', (e) => { if (!introOn && !picking && (e.ctrlKey", "window.addEventListener('keydown', (e) => { if (!introOn && !picking && !trans && (e.ctrlKey")
# 6. sound sting: rumble swell, distant siren, radio squelch
rep("    return { init, update, setOn, setVol, pause,", """    function sting(k) { if (!ctx || !detail) return; const t = ctx.currentTime + 0.05, big = 1 + (k || 0) * 0.15;
      const s = ctx.createBufferSource(); s.buffer = nb('brown'); s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 95;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.9 * big, t + 1.6); g.gain.exponentialRampToValueAtTime(0.0001, t + 5); s.connect(f); f.connect(g); g.connect(detail); s.start(t, rnd()); s.stop(t + 5.1);
      tone(detail, t + 0.1, 3.6, 'sine', 48, 36, 0.35 * big, 1.2);
      for (const side of [-0.55, 0.6]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; const t1 = t + 0.4 + (side > 0 ? 0.35 : 0); o.frequency.setValueAtTime(560, t1);
        for (let q = 0; q < 4; q++) { o.frequency.linearRampToValueAtTime(940, t1 + q * 1.2 + 0.6); o.frequency.linearRampToValueAtTime(560, t1 + q * 1.2 + 1.2); }
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500; const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t1); e.gain.exponentialRampToValueAtTime(0.05, t1 + 1.6); e.gain.exponentialRampToValueAtTime(0.0001, t1 + 4.8);
        const out = panned(side, 1); o.connect(lp); lp.connect(e); e.connect(out); const w = ctx.createGain(); w.gain.value = 0.6; e.connect(w); w.connect(revIn); o.start(t1); o.stop(t1 + 5); }
      const radio = (t2) => { burst(detail, t2, 0.16, 'bandpass', 1900, 0, 1.2, 0.12); tone(detail, t2 + 0.18, 0.07, 'square', 1250, 0, 0.05); tone(detail, t2 + 0.28, 0.07, 'square', 1250, 0, 0.05);
        for (let q = 0; q < 7; q++) burst(detail, t2 + 0.42 + q * 0.11, 0.08, 'bandpass', 900 + rnd() * 900, 0, 3, 0.03); burst(detail, t2 + 1.3, 0.14, 'bandpass', 1900, 0, 1.2, 0.1); };
      radio(t + 0.5); }
    return { init, update, setOn, setVol, pause, sting,""")
open('/home/claude/outbreak.html','w').write(s)
print('ok')
