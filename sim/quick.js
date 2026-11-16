const { runCampaign } = require('./campaign.js');
const job = JSON.parse(process.argv[2] || '{}');
const r = runCampaign(Object.assign({ id: 'q', city: 'synthetic', skill: 'average', style: 'mixed', seed: 1, dt: 0.1, maxStage: 1 }, job), process.argv[3]);
console.log(JSON.stringify(r));
