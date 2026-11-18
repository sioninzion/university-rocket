// University picker: each campus's best-known building seen from above at an angle, in 가나다
// order. Swipe to browse; choosing one fires a rocket at it, then the screen fades to black and
// the game starts. It runs in its own light scene, torn down before the campus itself is built.
import * as THREE from 'three';
import { City, makeRng } from './buildings.js?v=64';
import { buildStructures } from './models.js?v=64';
import { buildSky } from './world.js?v=64';
import { Particles, Debris } from './fx.js?v=64';
import { Sfx } from './audio.js?v=64';
import { CAMPUSES, selectedCampusId } from './campuses.js?v=64';

const SPACING = 320, FLIGHT = 1.05;
const FADE_DELAY = 0.9, FADE_TIME = 0.5; // seconds after the blast
const FOV = 38, ELEVATION = 0.5, AZIMUTH = 0.62;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const $ = (id) => document.getElementById(id);

function addTrees(scene, list) {
  const rnd = makeRng(11), spots = [];
  list.forEach((h) => {
    for (let k = 0; k < 26; k++) {
      const a = rnd() * Math.PI * 2, r = h.radius + 14 + rnd() * 60;
      const x = h.x + Math.cos(a) * r, z = Math.sin(a) * r;
      if ((x - h.x) * Math.sin(AZIMUTH) + z * Math.cos(AZIMUTH) > -h.radius * 0.2 && r < h.radius + 62) continue; // keep the view clear
      spots.push([x, z, 5 + rnd() * 6, rnd() < 0.45]);
    }
  });
  const crown = new THREE.IcosahedronGeometry(1, 1), cone = new THREE.ConeGeometry(0.72, 2.2, 8), trunk = new THREE.CylinderGeometry(0.1, 0.16, 1, 5);
  const m = (geo, color, n) => { const i = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color }), n); i.castShadow = true; scene.add(i); return i; };
  const pines = spots.filter(s => s[3]), leafy = spots.filter(s => !s[3]);
  const P = m(cone, 0x2f5a3a, pines.length), L = m(crown, 0x5c8446, leafy.length), T = m(trunk, 0x5d4a39, spots.length);
  const o = new THREE.Object3D();
  pines.forEach(([x, z, s], i) => { o.position.set(x, s * 1.15, z); o.scale.setScalar(s); o.updateMatrix(); P.setMatrixAt(i, o.matrix); });
  leafy.forEach(([x, z, s], i) => { o.position.set(x, s * 1.25, z); o.scale.set(s * 0.72, s * 0.68, s * 0.72); o.updateMatrix(); L.setMatrixAt(i, o.matrix); });
  spots.forEach(([x, z, s], i) => { o.position.set(x, s * 0.4, z); o.scale.set(s * 0.7, s * 0.8, s * 0.7); o.updateMatrix(); T.setMatrixAt(i, o.matrix); });
}

export async function runPicker({ enterFullscreen }) {
  const entries = Object.entries(CAMPUSES).sort((a, b) => a[1].short.localeCompare(b[1].short, 'ko'));
  const box = $('picker'), msg = $('pickMsg'), btn = $('pickGo'), black = $('fadeBlack');
  box.classList.add('open');
  const heroes = await (await fetch('data/heroes.json?v=64')).json();
  await new Promise((r) => { requestAnimationFrame(r); setTimeout(r, 60); });

  // ------------------------------------------------------------ scene
  const canvas = $('pickCanvas'), MOBILE = matchMedia('(pointer: coarse)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !MOBILE, powerPreference: 'high-performance' });
  const dpr = Math.min(devicePixelRatio || 1, MOBILE ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xc9dbe8, 420, 1500);
  scene.add(buildSky(), new THREE.HemisphereLight(0xe4f0ff, 0x6a7352, 1.15));
  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 9000);
  const sun = new THREE.DirectionalLight(0xfff0dc, 2.9);
  const SUN = new THREE.Vector3(0.45, 0.55, 0.7).normalize();
  sun.castShadow = true;
  sun.shadow.mapSize.set(MOBILE ? 1024 : 2048, MOBILE ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -130, right: 130, top: 130, bottom: -130, near: 10, far: 700 });
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.5;
  scene.add(sun, sun.target);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(SPACING * entries.length + 6000, 3000), new THREE.MeshLambertMaterial({ color: 0x6f8c52 }));
  ground.rotation.x = -Math.PI / 2; ground.position.x = SPACING * (entries.length - 1) / 2; ground.receiveShadow = true; scene.add(ground);

  const list = entries.map(([id, c], i) => {
    const outer = new THREE.Group(), inner = new THREE.Group();
    outer.position.x = i * SPACING;
    outer.rotation.y = Math.atan2(-c.hero.view[0], c.hero.view[1]);
    outer.add(inner); scene.add(outer);
    const city = new City(buildStructures({ buildings: [heroes[id]], campus: [] }), inner);
    const b = city.buildings;
    const x0 = Math.min(...b.map(p => p.minx)), x1 = Math.max(...b.map(p => p.maxx)), z0 = Math.min(...b.map(p => p.minz)), z1 = Math.max(...b.map(p => p.maxz));
    const base = heroes[id].b, H = Math.max(...b.map(p => p.ytop + p.roof.max)) - base;
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, radius = Math.hypot(x1 - x0, z1 - z0) / 2;
    inner.position.set(-cx, -base, -cz);
    const plaza = new THREE.Mesh(new THREE.CircleGeometry(radius + 11, 48), new THREE.MeshLambertMaterial({ color: 0xb8b4a7 }));
    plaza.rotation.x = -Math.PI / 2; plaza.position.set(i * SPACING, 0.05, 0); plaza.receiveShadow = true; scene.add(plaza);
    return { id, c, i, x: i * SPACING, outer, inner, city, base, H, radius, cx, cz };
  });
  addTrees(scene, list);

  // rocket
  const rocket = new THREE.Group();
  {
    const white = new THREE.MeshLambertMaterial({ color: 0xf4f4f2 }), red = new THREE.MeshLambertMaterial({ color: 0xc8202f });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.76, 6, 16), white);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.72, 2.4, 16), red); nose.position.y = 4.2;
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.62, 4, 12), new THREE.MeshBasicMaterial({ color: 0xffb04a })); flame.rotation.x = Math.PI; flame.position.y = -5;
    rocket.add(body, nose, flame);
    for (let k = 0; k < 4; k++) { const fin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.7, 1.5), red), a = k * Math.PI / 2; fin.position.set(Math.cos(a) * 1.1, -2.3, Math.sin(a) * 1.1); fin.rotation.y = -a + Math.PI / 2; rocket.add(fin); }
    rocket.visible = false; scene.add(rocket);
  }

  // ------------------------------------------------------------ state and interface
  const start = Math.max(0, entries.findIndex(([id]) => id === selectedCampusId()));
  const S = { pos: start, target: start, drag: null, shown: -1, phase: 'browse', t: 0, shake: 0, time: 0, sway: !matchMedia('(prefers-reduced-motion: reduce)').matches };
  const sfx = new Sfx();
  try { sfx.muted = localStorage.getItem('khu-mute') === '1'; } catch { /* ignore */ }
  const dots = $('pickDots');
  entries.forEach((_, i) => { const d = document.createElement('i'); d.dataset.i = i; dots.append(d); });

  function show(i) {
    if (i === S.shown) return;
    S.shown = i;
    const { c } = list[i];
    $('pickName').textContent = c.short;
    $('pickFull').textContent = `${c.full} · ${c.hero.name}`;
    btn.textContent = `🚀 ${c.short} 부수기`;
    [...dots.children].forEach((d, k) => d.classList.toggle('on', k === i));
    $('pickPrev').disabled = i === 0; $('pickNext').disabled = i === list.length - 1;
  }
  const go = (i) => { if (S.phase === 'browse') S.target = clamp(i, 0, list.length - 1); };

  const area = $('pickSwipe');
  area.addEventListener('pointerdown', (e) => { if (S.phase !== 'browse') return; S.drag = { x: e.clientX, from: S.target, t: performance.now() }; area.setPointerCapture(e.pointerId); });
  area.addEventListener('pointermove', (e) => { if (!S.drag) return; S.pos = clamp(S.drag.from - (e.clientX - S.drag.x) / (innerWidth * 0.6), -0.25, list.length - 0.75); S.target = S.pos; });
  const release = (e) => {
    if (!S.drag) return;
    const dx = e.clientX - S.drag.x, quick = Math.abs(dx) / Math.max(performance.now() - S.drag.t, 1) > 0.35, step = Math.abs(dx) > innerWidth * 0.14 || (quick && Math.abs(dx) > 18) ? -Math.sign(dx) : 0;
    S.target = clamp(S.drag.from + step, 0, list.length - 1); S.drag = null;
  };
  area.addEventListener('pointerup', release); area.addEventListener('pointercancel', release);
  $('pickPrev').addEventListener('click', () => go(Math.round(S.target) - 1));
  $('pickNext').addEventListener('click', () => go(Math.round(S.target) + 1));
  dots.addEventListener('click', (e) => { if (e.target.dataset.i) go(+e.target.dataset.i); });

  const onKey = (e) => {
    if (e.code === 'ArrowLeft') go(Math.round(S.target) - 1);
    else if (e.code === 'ArrowRight') go(Math.round(S.target) + 1);
    else if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); choose(); }
  };
  addEventListener('keydown', onKey);

  // ------------------------------------------------------------ the launch
  let fx = null, hero = null, dataP = null, done;
  const finished = new Promise((r) => { done = r; });
  const p0 = new THREE.Vector3(), p1 = new THREE.Vector3(), p2 = new THREE.Vector3(), v = new THREE.Vector3(), w = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion();

  function choose() {
    if (S.phase !== 'browse') return;
    S.phase = 'launch'; S.t = 0;
    hero = list[clamp(Math.round(S.target), 0, list.length - 1)];
    S.target = hero.i;
    box.classList.add('firing');
    sfx.init(); sfx.engine(true, true);
    enterFullscreen();
    dataP = fetch(`${hero.c.data}?v=64`).then(r => r.json()); // start downloading the campus during the show
    dataP.catch(() => {});
    const stub = { height: () => hero.base };
    fx = { fire: new Particles(hero.inner, 900, true), smoke: new Particles(hero.inner, 900, false), debris: new Debris(hero.inner, 700, stub), flash: new THREE.PointLight(0xffa955, 0, 240, 1.2) };
    hero.inner.add(fx.flash);
    const d = rigDistance(hero);
    p0.set(hero.x + d * 0.62, 2, d * 0.55);
    p1.set(hero.x + d * 0.42, Math.max(hero.H * 1.7, 52), d * 0.28);
    p2.set(hero.x, Math.min(hero.H * 0.55, 34), 0);
    rocket.position.copy(p0); rocket.visible = true;
    black.classList.add('on');
  }
  btn.addEventListener('click', choose);

  function blast() {
    const p = hero.inner.worldToLocal(p2.clone());
    const R = clamp(Math.max(hero.radius, hero.H) * 0.34, 9, 24), big = clamp(R / 12, 0.8, 2.2);
    const { fire, smoke, debris, flash } = fx;
    const res = hero.city.explode(p.x, p.y, p.z, R, Math.random);
    const total = res.reduce((t, r) => t + r.killed.length + r.fallen.length, 0), every = Math.max(1, Math.ceil(total / 320));
    let n = 0;
    for (const r of res) for (const [cells, falling] of [[r.killed, false], [r.fallen, true]]) for (const c of cells) {
      if (n++ % every) continue;
      const ci = r.b.chunkInfo(c);
      if (falling) { debris.spawn(ci.x, ci.y, ci.z, ci.sx * 0.95, ci.sy * 0.95, ci.sz * 0.95, (Math.random() - 0.5) * 4, -3, (Math.random() - 0.5) * 4, ci.color, 1.5); continue; }
      w.set(ci.x - p.x, ci.y - p.y, ci.z - p.z).normalize();
      const sp = 14 + Math.random() * 24;
      debris.spawn(ci.x, ci.y, ci.z, ci.sx * 0.9, ci.sy * 0.85, ci.sz * 0.9, w.x * sp, w.y * sp + 8 + Math.random() * 10, w.z * sp, ci.color, 6);
      smoke.spawn(ci.x, ci.y, ci.z, w.x * 3, 2, w.z * 3, 5, 14, 2.5, 0.55, 0.53, 0.5, 0.7, 0.97, 1.5);
    }
    for (let i = 0; i < 70 * big; i++) {
      w.set(Math.random() - 0.5, Math.random() - 0.3, Math.random() - 0.5).normalize();
      const sp = (8 + Math.random() * 26) * Math.sqrt(big);
      fire.spawn(p.x, p.y, p.z, w.x * sp, w.y * sp, w.z * sp, (5 + Math.random() * 6) * Math.sqrt(big), 8 * big + R, 0.5 + Math.random() * 0.6, 1, 0.75, 0.35, 1, 0.9, 2);
    }
    for (let i = 0; i < 40 * big; i++) {
      w.set(Math.random() - 0.5, Math.random() * 0.8, Math.random() - 0.5).normalize();
      const sp = (4 + Math.random() * 10) * Math.sqrt(big), g = 0.18 + Math.random() * 0.15;
      smoke.spawn(p.x, p.y, p.z, w.x * sp, w.y * sp, w.z * sp, 6 * Math.sqrt(big), 22 * big + R * 2, 3, g, g, g, 0.85, 0.96, 3);
    }
    flash.position.copy(p); flash.intensity = 6000; S.shake = 2.2;
    sfx.engine(false); sfx.boom(1.4); setTimeout(() => sfx.rumble(), 180);
    rocket.visible = false;
    return total;
  }

  // ------------------------------------------------------------ frame
  function rigDistance(h) {
    const aspect = camera.aspect, tv = Math.tan(THREE.MathUtils.degToRad(FOV / 2)), th = tv * aspect;
    return Math.max((h.radius + 7) / th, (h.H * 0.72 + h.radius * 0.35 + 8) / tv) * 1.12;
  }
  let w0 = 0, h0 = 0;
  function resize() {
    const W = innerWidth, H = innerHeight;
    if (W === w0 && H === h0) return;
    w0 = W; h0 = H; renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
  }
  const look = new THREE.Vector3();
  function step(dt) {
    S.time += dt;
    if (!S.drag) S.pos += (S.target - S.pos) * (1 - Math.exp(-dt * 8));
    const pos = clamp(S.pos, 0, list.length - 1), a = list[Math.floor(pos)], b = list[Math.min(list.length - 1, Math.floor(pos) + 1)], f = pos - a.i;
    const near = Math.round(clamp(S.target, 0, list.length - 1));
    if (S.phase === 'browse') show(near);
    const d = THREE.MathUtils.lerp(rigDistance(a), rigDistance(b), f), H = THREE.MathUtils.lerp(a.H, b.H, f), x = pos * SPACING;
    const az = AZIMUTH + (S.sway ? Math.sin(S.time * 0.35) * 0.05 : 0);
    look.set(x, H * 0.36, 0);
    camera.position.set(x + Math.sin(az) * Math.cos(ELEVATION) * d, look.y + Math.sin(ELEVATION) * d, Math.cos(az) * Math.cos(ELEVATION) * d);
    if (S.shake > 0.01) { camera.position.x += (Math.random() - 0.5) * S.shake; camera.position.y += (Math.random() - 0.5) * S.shake; S.shake *= Math.exp(-dt * 5); }
    camera.lookAt(look);
    sun.target.position.set(x, 0, 0); sun.position.copy(sun.target.position).addScaledVector(SUN, 300);

    if (S.phase === 'launch') {
      S.t += dt;
      const u = Math.min(1, S.t / FLIGHT), e = u * u * (0.55 + 0.45 * u), m = 1 - e;
      rocket.position.set(0, 0, 0).addScaledVector(p0, m * m).addScaledVector(p1, 2 * m * e).addScaledVector(p2, e * e);
      v.set(0, 0, 0).addScaledVector(p1, 2 * m).addScaledVector(p0, -2 * m).addScaledVector(p2, 2 * e).addScaledVector(p1, -2 * e).normalize();
      rocket.quaternion.copy(q.setFromUnitVectors(UP, v));
      w.copy(rocket.position).addScaledVector(v, -5); hero.inner.worldToLocal(w);
      for (let i = 0; i < 2; i++) {
        fx.fire.spawn(w.x, w.y, w.z, (Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2, 2.4, 1.2, 0.25, 1, 0.7, 0.3, 1, 0.94, 0);
        fx.smoke.spawn(w.x, w.y, w.z, 0, 0.5, 0, 1.6, 7, 1.3, 0.86, 0.85, 0.83, 0.55, 0.97, 0.4);
      }
      if (u >= 1) { S.killed = blast(); S.phase = 'boom'; S.t = 0; }
    } else if (S.phase === 'boom') {
      S.t += dt;
      black.style.opacity = clamp((S.t - FADE_DELAY) / FADE_TIME, 0, 1);
      if (S.t >= FADE_DELAY + FADE_TIME) { S.phase = 'done'; done(); }
    }
    if (fx) { fx.fire.update(dt); fx.smoke.update(dt); fx.debris.update(dt); fx.flash.intensity *= Math.exp(-dt * 6); }
    renderer.render(scene, camera);
  }

  resize(); show(start);
  box.classList.add('ready');
  let last = performance.now(), running = true;
  const tick = (now) => { if (!running) return; requestAnimationFrame(tick); const dt = Math.min((now - last) / 1000, 0.05); last = now; resize(); step(dt); };
  requestAnimationFrame(tick);
  window.__picker = { S, list, go, choose, step, camera };
  msg.textContent = '';

  await finished;
  running = false;
  removeEventListener('keydown', onKey);
  const id = hero.id, data = dataP;
  delete window.__picker;
  box.classList.remove('open', 'ready', 'firing');
  scene.traverse((o) => { o.geometry?.dispose(); (Array.isArray(o.material) ? o.material : o.material ? [o.material] : []).forEach(m => m.dispose()); });
  renderer.dispose(); renderer.forceContextLoss(); canvas.remove();
  return { id, data, sfx };
}
