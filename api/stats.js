// Shared play statistics: players today / in total and buildings brought down today / in total.
// Counters live in Upstash Redis "univ-stats" (Tokyo, connected through the Vercel Marketplace).
//   GET  /api/stats                         -> current numbers
//   POST /api/stats {"id": "<uuid>"}        -> count this browser's visit (once a day), returns numbers
//   POST /api/stats {"destroyed": n}        -> add buildings brought down since the last report (max 500 per call)
// The id is a random UUID the browser keeps; nothing personal is stored.
const URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const ORIGINS = ['https://university-rocket.vercel.app', 'https://sioninzion.github.io'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DAY_TTL = 3 * 24 * 3600;

const kstDay = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); // "today" is the Korean date

async function pipeline(cmds) {
  const r = await fetch(`${URL}/pipeline`, { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}` }, body: JSON.stringify(cmds) });
  if (!r.ok) throw new Error(`redis ${r.status}`);
  return (await r.json()).map((x) => x.result);
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.body === 'string') { try { return Promise.resolve(JSON.parse(req.body)); } catch { return Promise.resolve({}); } }
  return new Promise((resolve) => {
    let s = '';
    req.on('data', (c) => { s += c; if (s.length > 2000) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(s || '{}')); } catch { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}

module.exports = async (req, res) => {
  const origin = req.headers.origin || '';
  if (ORIGINS.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!URL || !TOKEN) return res.status(503).json({ error: 'storage not configured' });
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end();

  const day = kstDay(), k = { users: 'univ:users', usersDay: `univ:users:${day}`, bld: 'univ:bld', bldDay: `univ:bld:${day}` };
  const cmds = [];
  if (req.method === 'POST') {
    const body = await readBody(req);
    if (typeof body.id === 'string' && UUID.test(body.id)) {
      cmds.push(['SADD', k.users, body.id], ['SADD', k.usersDay, body.id], ['EXPIRE', k.usersDay, DAY_TTL]);
    }
    const n = Math.min(500, Math.max(0, Math.floor(Number(body.destroyed) || 0)));
    if (n > 0) cmds.push(['INCRBY', k.bld, n], ['INCRBY', k.bldDay, n], ['EXPIRE', k.bldDay, DAY_TTL]);
  }
  const at = cmds.length;
  cmds.push(['SCARD', k.usersDay], ['SCARD', k.users], ['GET', k.bldDay], ['GET', k.bld]);
  try {
    const r = await pipeline(cmds);
    const v = (i) => Number(r[at + i]) || 0;
    res.setHeader('Cache-Control', req.method === 'GET' ? 'public, s-maxage=20, stale-while-revalidate=60' : 'no-store');
    return res.status(200).json({ today_users: v(0), total_users: v(1), today_buildings: v(2), total_buildings: v(3) });
  } catch {
    return res.status(502).json({ error: 'storage unavailable' });
  }
};
