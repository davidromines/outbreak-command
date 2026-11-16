"""Builds a night's job list.  python make_jobs.py <out.jsonl> [--morris-r 16] [--baseline-seeds 10] [--cities a,b,c,d]
Baseline: the game as shipped, every skill x city, to measure against the targets.
Morris screening (SALib): r trajectories through the knob space; each point is one campaign with a random persona/city,
twice (an average and an expert player), so we learn which knobs move which outcome most."""
import json, sys, random, subprocess, argparse
import numpy as np
from SALib.sample import morris as morris_sample
ap = argparse.ArgumentParser(); ap.add_argument('out'); ap.add_argument('--morris-r', type=int, default=16); ap.add_argument('--baseline-seeds', type=int, default=10)
ap.add_argument('--cities', default='manhattan,sanfrancisco,losangeles,boston'); ap.add_argument('--seed', type=int, default=1)
a = ap.parse_args(); random.seed(a.seed); np.random.seed(a.seed)
knobs = json.loads(subprocess.check_output(['node', '-e', "const {KNOBS}=require('./knobs.js');console.log(JSON.stringify(KNOBS.map(k=>({id:k.id,lo:k.lo,hi:k.hi}))))"]))
cities = a.cities.split(','); styles = ['mixed', 'fortress', 'mobile', 'artillery', 'air']; skills = ['novice', 'average', 'expert']
jobs = []
for sk in skills:
    for c in cities:
        for s in range(a.baseline_seeds):
            jobs.append({'id': f'base-{sk}-{c}-{s}', 'phase': 'baseline', 'mults': {}, 'city': c, 'skill': sk, 'style': random.choice(styles), 'seed': random.randrange(1 << 30), 'dt': 0.1})
problem = {'num_vars': len(knobs), 'names': [k['id'] for k in knobs], 'bounds': [[0, 1]] * len(knobs)}
X = morris_sample.sample(problem, N=a.morris_r, num_levels=4, seed=a.seed)
np.save(a.out.replace('.jsonl', '_morrisX.npy'), X)
mj = []
for i, row in enumerate(X):
    mults = {k['id']: float(np.exp(np.log(k['lo']) + u * (np.log(k['hi']) - np.log(k['lo'])))) for k, u in zip(knobs, row)}
    city = random.choice(cities); seed = random.randrange(1 << 30)  # same city and outbreak seed for both players: a fairer comparison
    for sk in ('average', 'expert'):
        mj.append({'id': f'morris-{i}-{sk}', 'phase': 'morris', 'row': i, 'mults': mults, 'city': city, 'skill': sk, 'style': random.choice(styles), 'seed': seed, 'dt': 0.1})
jobs += mj
with open(a.out, 'w') as f:
    for j in jobs: f.write(json.dumps(j) + '\n')
print(len(jobs), 'jobs:', sum(j['phase'] == 'baseline' for j in jobs), 'baseline,', len(mj), 'morris (', len(X), 'points )')
