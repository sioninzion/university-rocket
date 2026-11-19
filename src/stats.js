// Shared play statistics kept by the Vercel function api/stats.js (Upstash Redis behind it):
// players today / in total and buildings brought down today / in total, shown in a small line.
// The GitHub Pages copy of the game reports to the same server.
const API = 'https://university-rocket.vercel.app/api/stats';

const ID_KEY = 'univ-visitor';
const S = { today_users: 0, total_users: 0, today_buildings: 0, total_buildings: 0 };
let el = null, pending = 0, timer = 0, loaded = false, started = false, counted = false;

// 999 → 999, 1234 → 1.2K, 12345 → 12K, 1.5M, 2.3B
export function fmt(n) {
  n = Math.max(0, Math.floor(Number(n) || 0));
  for (const [v, s] of [[1e9, 'B'], [1e6, 'M'], [1e3, 'K']]) {
    if (n >= v) { const x = n / v; return (x < 10 ? Math.floor(x * 10) / 10 : Math.floor(x)) + s; }
  }
  return String(n);
}

async function call(body) {
  const r = await fetch(API, body ? { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {});
  if (!r.ok) throw new Error(`stats ${r.status}`);
  return r.json();
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
  if (!pending) return;
  const n = pending; pending = 0;
  call({ destroyed: n }).catch(() => { pending += n; });
}

export function initStats(target) {
  el = target;
  if (started) return;
  started = true;
  call(null).then(take).catch(() => {}); // opening the page only reads the numbers
  setInterval(() => { if (!document.hidden) call(null).then(take).catch(() => {}); }, 60000);
  addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
  addEventListener('pagehide', flush);
}

// a player is counted when they start a game (시작하기 on the start screen or in the campus picker), once per page load;
// the server counts each browser once a day and once in total
export function countPlayer() {
  if (counted) return;
  counted = true;
  const id = visitorId();
  if (id) call({ id }).then(take).catch(() => { counted = false; });
}

// a building collapsed in this game: show it at once, report in batches
export function countDestroyed(n = 1) {
  if (n <= 0) return;
  pending += n; S.today_buildings += n; S.total_buildings += n; render();
  if (!timer) timer = setTimeout(flush, 8000);
}
