"""Turns a night's results into a balance report.  python analyze.py <results.jsonl> <jobs.jsonl> <report.html>"""
import json, sys, html, collections
import numpy as np
res = [json.loads(l) for l in open(sys.argv[1]) if l.strip()]
jobs = {j['id']: j for j in (json.loads(l) for l in open(sys.argv[2]) if l.strip())}
out = sys.argv[3]
ok = [r for r in res if 'error' not in r]; errs = [r for r in res if 'error' in r]
synthetic = sum(1 for r in ok for s in r['stages'] if s.get('map') == 'synthetic')
TARGET = {'novice': [0.85, 0.55, 0.25, (0.01, 0.03)], 'average': [0.95, 0.80, 0.55, (0.08, 0.15)], 'expert': [0.99, 0.95, 0.85, (0.35, 0.50)]}
def survived(r, k):  # survived stage k (1-based): it was played and didn't end the run by falling below the line
    st = [s for s in r['stages'] if s['stage'] == k]
    return bool(st) and st[0]['reason'] not in ('bar', 'wipe')
def ci(p, n):
    if n == 0: return (0, 0)
    z = 1.96; d = 1 + z * z / n; c = (p + z * z / (2 * n)) / d; h = z * np.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d; return (max(0, c - h), min(1, c + h))
rows = []; base = [r for r in ok if r['id'].startswith('base-')]
for sk in ('novice', 'average', 'expert'):
    R = [r for r in base if r['skill'] == sk]; n = len(R)
    if not n: continue
    cells = []
    for k in (1, 2, 3):
        reached = [r for r in R if any(s['stage'] == k for s in r['stages'])]
        p = sum(survived(r, k) for r in reached) / max(1, len(reached)); lo, hi = ci(p, len(reached)); t = TARGET[sk][k - 1]
        cells.append((f'{p:.0%} <small>({lo:.0%}–{hi:.0%}, n={len(reached)})</small>', abs(p - t) <= 0.08, f'{t:.0%}'))
    w = sum(r.get('result') == 'won' for r in R) / n; lo, hi = ci(w, n); t = TARGET[sk][3]
    cells.append((f'{w:.0%} <small>({lo:.0%}–{hi:.0%}, n={n})</small>', t[0] - 0.03 <= w <= t[1] + 0.03, f'{t[0]:.0%}–{t[1]:.0%}'))
    rows.append((sk, cells))
# economy, tension, tools, cities
allst = [s for r in base for s in r['stages']]
unspent = np.mean([s['unspent'] / max(1, s['unspent'] + s['spent']) for s in allst]) if allst else 0
tension = np.mean([0 <= s['alive'] - s['bar'] <= 0.15 for s in allst if s['reason'] not in ('bar', 'wipe')]) if allst else 0
spend = collections.Counter(); 
for s in allst:
    for k, v in (s.get('spend') or {}).items(): spend[k] += v
tot = sum(spend.values()) or 1
city = {}
for c in sorted({r['city'] for r in base}):
    R = [r for r in base if r['city'] == c and r['skill'] == 'average']; city[c] = (sum(survived(r, 2) for r in R) / max(1, len(R)), len(R))
# Morris
mtxt = ''
try:
    from SALib.analyze import morris as morris_an
    import subprocess
    knobs = json.loads(subprocess.check_output(['node', '-e', "const {KNOBS}=require('./knobs.js');console.log(JSON.stringify(KNOBS.map(k=>k.id)))"]))
    X = np.load(sys.argv[2].replace('.jsonl', '_morrisX.npy')); problem = {'num_vars': len(knobs), 'names': knobs, 'bounds': [[0, 1]] * len(knobs)}
    byid = {r['id']: r for r in ok}
    def score(r): # stages survived + share alive in the last stage played
        last = r['stages'][-1]; return sum(survived(r, k) for k in (1, 2, 3, 4)) + last['alive']
    for sk in ('average', 'expert'):
        Y = np.array([score(byid[f'morris-{i}-{sk}']) if f'morris-{i}-{sk}' in byid else np.nan for i in range(len(X))])
        if np.isnan(Y).any(): mtxt += f'<p>Morris ({sk}): {int(np.isnan(Y).sum())} of {len(Y)} points not finished yet — skipped.</p>'; continue
        Si = morris_an.analyze(problem, X, Y, num_levels=4, print_to_console=False)
        order = np.argsort(-np.array(Si['mu_star']))
        mtxt += f'<h3>Which knobs move the outcome most ({sk} player)</h3><table><tr><th>Knob</th><th>μ* (effect size)</th><th>μ (direction: + helps the player)</th><th>σ (interactions)</th></tr>'
        for i in order: mtxt += f"<tr><td>{knobs[i]}</td><td>{Si['mu_star'][i]:.3f}</td><td>{Si['mu'][i]:+.3f}</td><td>{Si['sigma'][i]:.3f}</td></tr>"
        mtxt += '</table>'
except Exception as e:
    mtxt += f'<p>Morris analysis not available: {html.escape(str(e))}</p>'
H = ['<!doctype html><meta charset=utf-8><title>Outbreak Command balance report</title><style>body{font:14px system-ui;margin:24px;max-width:1100px}td,th{border:1px solid #ccc;padding:4px 8px}table{border-collapse:collapse;margin:8px 0}.ok{background:#d9f7d9}.no{background:#fde0dc}small{color:#666}</style>',
     f'<h1>Balance report</h1><p>{len(ok)} campaigns finished ({len(base)} baseline), {len(errs)} errors, {synthetic} stages on synthetic fallback maps. Time step 0.1 s (fast mode).</p>',
     '<h2>Baseline vs targets</h2><table><tr><th>Player</th><th>Survive stage 1</th><th>Survive stage 2</th><th>Survive stage 3</th><th>Win run</th></tr>']
for sk, cells in rows:
    H.append(f'<tr><td>{sk}</td>' + ''.join(f'<td class={"ok" if good else "no"}>{v}<br><small>target {t}</small></td>' for v, good, t in cells) + '</tr>')
H.append('</table>')
H.append(f'<p>Unspent money at stage end: {unspent:.0%} (target &lt; 20%). Close calls (ended within 15 points of the fall line): {tension:.0%} (target 30–50%).</p>')
H.append('<h2>Where the money went (baseline)</h2><table><tr><th>Tool</th><th>Share of spend</th></tr>' + ''.join(f'<tr><td>{k}</td><td>{v / tot:.1%}</td></tr>' for k, v in spend.most_common()) + '</table>')
H.append('<h2>Cities (average player, survive stage 2)</h2><table>' + ''.join(f'<tr><td>{c}</td><td>{p:.0%} (n={n})</td></tr>' for c, (p, n) in city.items()) + '</table>')
H.append('<h2>Sensitivity (Morris screening)</h2>' + mtxt)
if errs: H.append('<h2>Errors</h2><pre>' + html.escape('\n'.join(e['id'] + ': ' + e['error'][:400] for e in errs[:10])) + '</pre>')
open(out, 'w', encoding='utf-8').write('\n'.join(H)); print('report written', out)
