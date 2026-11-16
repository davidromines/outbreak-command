// Verifies every map pack loads and matches its stage size, then runs a 60-second smoke test on each city's stage 1.
const fs = require('fs'), path = require('path'), { loadPack } = require('./mappack.js'), { CFG } = require('./core.js');
const dir = path.join(__dirname, 'packs'), files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.ocmap.gz')) : [];
const N = CFG.CAMPAIGN.STAGES.map((s) => Math.ceil(s.area / s.res)); let bad = 0;
for (const f of files.sort()) { const p = loadPack(path.join(dir, f)), k = +f.match(/_s(\d)/)[1] - 1, walk = p.g.reduce((a, v) => a + (v & 1 ? 1 : 0), 0), bld = p.g.reduce((a, v) => a + (v & 2 ? 1 : 0), 0), water = p.g.reduce((a, v) => a + (v & 16 ? 1 : 0), 0);
  const ok = p.hdr.N === N[k] && walk > 1000; if (!ok) bad++;
  console.log((ok ? 'OK  ' : 'BAD ') + f, 'N', p.hdr.N, 'want', N[k], 'street%', (100 * walk / p.g.length).toFixed(1), 'building%', (100 * bld / p.g.length).toFixed(1), 'water%', (100 * water / p.g.length).toFixed(1), 'buildings', p.hdr.nf, 'elev', p.hdr.en); }
console.log(files.length, 'packs,', bad, 'bad');
const { runCampaign } = require('./campaign.js');
for (const c of ['manhattan', 'sanfrancisco', 'losangeles', 'boston']) { const t = Date.now(); try { const r = runCampaign({ id: 'smoke-' + c, city: c, skill: 'average', style: 'mixed', seed: 7, dt: 0.1, maxStage: 1, mults: { stage_time: 0.7 } }, dir);
  const s = r.stages[0]; console.log('smoke', c, s.map, 'alive', s.alive, s.reason, 'kills', s.kills, 'pop', s.pop, 'actions', JSON.stringify(s.actions), ((Date.now() - t) / 1000).toFixed(0) + 's'); } catch (e) { console.log('smoke', c, 'ERROR', e.message); } }
