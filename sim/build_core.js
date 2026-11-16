// Extracts the game's own simulation (CFG + makeSim) from ../index.html into core.js, so the simulator
// always runs exactly the code the game ships. Run before every batch: node build_core.js
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const a = html.indexOf('const CFG = {'), s0 = html.indexOf('/*SIM-START*/'), s1 = html.indexOf('/*SIM-END*/');
if (a < 0 || s0 < 0 || s1 < 0) throw new Error('markers not found in index.html');
const ver = (html.match(/<title>[^<]*<\/title>/) || [''])[0];
fs.writeFileSync(path.join(__dirname, 'core.js'), '// generated from index.html — do not edit\n' + html.slice(a, s0) + html.slice(s0 + 13, s1) + '\n;module.exports = { makeSim, CFG };\n');
console.log('core.js written', ver);
