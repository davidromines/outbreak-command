// Loads a map pack exported from the game (__game.exportPack): the exact grids a stage is built from.
const fs = require('fs'), zlib = require('zlib');
const cache = new Map();
function loadPack(file) {
  if (cache.has(file)) return cache.get(file);
  const b = zlib.gunzipSync(fs.readFileSync(file)); const n = b.readUInt32LE(0), hdr = JSON.parse(b.slice(4, 4 + n).toString());
  let o = 4 + n; const NN = hdr.N * hdr.N;
  const take = (bytes) => { const s = b.slice(o, o + bytes); o += bytes; const c = new Uint8Array(bytes); c.set(s); return c; };
  const g = take(NN), h = take(NN), fid = new Int32Array(take(NN * 4).buffer), elev = new Float32Array(take(hdr.en * hdr.en * 4).buffer);
  const p = { hdr, g, h, fid, elev }; cache.set(file, p); return p;
}
module.exports = { loadPack };
