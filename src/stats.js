// Shared play statistics kept on Supabase (see supabase/stats.sql):
// players today / in total and buildings brought down today / in total, shown in a small corner line.
// The anon key is meant to be public: the tables are closed and only three counter functions are callable.
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';

const ID_KEY = 'univ-visitor';
const S = { today_users: 0, total_users: 0, today_buildings: 0, total_buildings: 0 };
let el = null, pending = 0, timer = 0, loaded = false;

// 999 → 999, 1234 → 1.2K, 12345 → 12K, 1.5M, 2.3B
export function fmt(n) {
  n = Math.max(0, Math.floor(Number(n) || 0));
  for (const [v, s] of [[1e9, 'B'], [1e6, 'M'], [1e3, 'K']]) {
    if (n >= v) { const x = n / v; return (x < 10 ? Math.floor(x * 10) / 10 : Math.floor(x)) + s; }
  }
  return String(n);
}

async function rpc(fn, body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST', keepalive: true,
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  if (!r.ok) throw new Error(`${fn} ${r.status}`);
  return r.status === 204 ? null : r.json();
}

function visitorId() {
  try {
    let id = localStorage.getItem(ID_KEY);
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3) | 8).toString(16); });
      localStorage.setItem(ID_KEY, id);
    }
    return id;
  } catch { return null; } // private mode: still show the numbers, just do not count this visit
}

function render() {
  if (!el || !loaded) return;
  el.textContent = `오늘 ${fmt(S.today_users)}명 · 누적 ${fmt(S.total_users)}명 | 파괴 오늘 ${fmt(S.today_buildings)}채 · 누적 ${fmt(S.total_buildings)}채`;
  el.classList.add('on');
}

function take(d) { if (d) { Object.assign(S, d); loaded = true; render(); } }

function flush() {
  clearTimeout(timer); timer = 0;
  if (!pending || !SUPABASE_URL) return;
  const n = pending; pending = 0;
  rpc('add_destroyed', { p_n: n }).catch(() => { pending += n; });
}

export function initStats(target) {
  el = target;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  const id = visitorId();
  (id ? rpc('track_visit', { p_id: id }) : rpc('get_stats')).then(take).catch(() => {});
  setInterval(() => { if (!document.hidden) rpc('get_stats').then(take).catch(() => {}); }, 60000);
  addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
  addEventListener('pagehide', flush);
}

// a building collapsed in this game: show it at once, report in batches
export function countDestroyed(n = 1) {
  if (!SUPABASE_URL || n <= 0) return;
  pending += n; S.today_buildings += n; S.total_buildings += n; render();
  if (!timer) timer = setTimeout(flush, 8000);
}
