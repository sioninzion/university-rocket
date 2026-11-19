// Shared play statistics kept by the Vercel function api/stats.js (Upstash Redis behind it):
// games entered today / in total (every 시작하기 counts) and buildings brought down today / in total.
// The GitHub Pages copy of the game reports to the same server.
const API = 'https://university-rocket.vercel.app/api/stats';

const S = { today_users: 0, total_users: 0, today_buildings: 0, total_buildings: 0 };
let el = null, pending = 0, loaded = false, started = false;
const BATCH = 100; // buildings are saved to the server every 100 brought down

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

function render() {
  if (!el || !loaded) return;
  el.textContent = `오늘 ${fmt(S.today_users)}명 · 누적 ${fmt(S.total_users)}명 | 파괴 오늘 ${fmt(S.today_buildings)}채 · 누적 ${fmt(S.total_buildings)}채`;
  el.classList.add('on');
}

// server numbers, plus what this page has brought down but not saved yet
function take(d) { if (d && d.total_users !== undefined) { Object.assign(S, d); S.today_buildings += pending; S.total_buildings += pending; loaded = true; render(); } }

function flush() {
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

// every entry into a game (시작하기 on the start screen or in the campus picker) counts once
export function countPlayer() {
  call({ play: 1 }).then(take).catch(() => {});
}

// a building collapsed in this game: show it at once, save every 100 (the rest when the page is left)
export function countDestroyed(n = 1) {
  if (n <= 0) return;
  pending += n; S.today_buildings += n; S.total_buildings += n; render();
  if (pending >= BATCH) flush();
}
