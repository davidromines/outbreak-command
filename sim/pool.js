// Overnight runner: node pool.js <jobs.jsonl> <results.jsonl> [--workers N] [--until HH:MM] [--packs dir]
// Runs jobs in parallel worker threads, appends one JSON line per finished campaign, skips jobs already in the results
// file (so it can be stopped and restarted any time), and stops starting new jobs after the --until time.
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs = require('fs'), os = require('os'), path = require('path');
if (!isMainThread) {
  const { runCampaign } = require('./campaign.js');
  parentPort.on('message', (job) => { let r; try { r = runCampaign(job, workerData.packs); } catch (e) { r = { id: job.id, error: String(e && e.stack || e) }; } parentPort.postMessage(r); });
} else {
  const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
  const jobsFile = args[0], resFile = args[1], nW = +opt('--workers', Math.max(1, os.cpus().length - 2)), until = opt('--until', null), packs = path.resolve(opt('--packs', path.join(__dirname, 'packs')));
  const done = new Set(); if (fs.existsSync(resFile)) for (const l of fs.readFileSync(resFile, 'utf8').split('\n')) { if (!l.trim()) continue; try { done.add(JSON.parse(l).id); } catch (e) {} }
  const jobs = fs.readFileSync(jobsFile, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l)).filter((j) => !done.has(j.id));
  let stopAt = Infinity; if (until) { const [h, m] = until.split(':').map(Number), d = new Date(); d.setHours(h, m, 0, 0); if (d < new Date()) d.setDate(d.getDate() + 1); stopAt = d.getTime(); }
  const status = path.join(path.dirname(resFile), 'status.txt'), t0 = Date.now(); let next = 0, fin = 0, err = 0, active = 0;
  const writeStatus = () => fs.writeFileSync(status, JSON.stringify({ started: new Date(t0).toISOString(), now: new Date().toISOString(), workers: nW, jobsLeft: jobs.length - next, finished: fin, errors: err, active, previouslyDone: done.size, stopAt: until, perHour: +(fin / ((Date.now() - t0) / 3.6e6)).toFixed(1) }, null, 1));
  console.log('jobs to run', jobs.length, 'already done', done.size, 'workers', nW, 'packs', packs, 'until', until || 'all done');
  const out = fs.openSync(resFile, 'a');
  for (let w = 0; w < nW; w++) { const wk = new Worker(__filename, { workerData: { packs } });
    const feed = () => { if (next >= jobs.length || Date.now() > stopAt) { wk.terminate(); return; } active++; wk.postMessage(jobs[next++]); };
    wk.on('message', (r) => { active--; fin++; if (r.error) err++; fs.writeSync(out, JSON.stringify(r) + '\n'); if (fin % 5 === 0) writeStatus(); feed(); });
    wk.on('error', (e) => { err++; console.error(e); });
    feed(); }
  setInterval(() => { writeStatus(); if (active === 0 && (next >= jobs.length || Date.now() > stopAt)) { writeStatus(); console.log('finished', fin, 'errors', err); process.exit(0); } }, 15000);
}
