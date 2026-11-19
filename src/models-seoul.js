// Seven Seoul campuses built from one kit: each gets its own palette for ordinary buildings
// and hand-made models for the landmarks that define it.
import { hanokBuilder } from './models-skku.js?v=73';
import { collegiate } from './models-korea.js?v=73';

export function kit(h) {
  const { WIN, obb, frame, rectL, centroid, area, clipHalf, facingEdge } = h;
  const office = (wall, o = {}) => ({ wall, trim: '#e9e6dd', roof: '#7c7f82', win: WIN.GRID, bay: 3.3, floorH: 3.8, groundH: 4.6,
    cornice: { h: 0.5, d: 0.3 }, parapet: 1.0, plinth: { h: 0.9, d: 0.2, col: '#9d9a91' }, ...o });
  const brick = (wall = '#a65c47', o = {}) => office(wall, { win: WIN.BRICK, trim: '#e2d8ca', ...o });
  const glass = (wall = '#86a6b1', o = {}) => office(wall, { win: WIN.CURTAIN, bay: 3, ...o });
  const tall = (floors, st) => st.groundH + (Math.max(floors, 1) - 1) * st.floorH;
  const block = (floors, st) => (b) => [{ poly: b.p, h: tall(floors, st), style: st }];
  const onEdge = (e) => (t, d) => [e.a[0] + e.ux * t + e.nx * d, e.a[1] + e.uz * t + e.nz * d];
  const inset = (p, k) => { const [cx, cz] = centroid(p); return p.map(([x, z]) => [cx + (x - cx) * k, cz + (z - cz) * k]); };

  // building pierced by a great arch along its short axis
  function archBlock(b, { H, gap, spring, st, lintel = st }) {
    const o = obb(b.p), L = frame(o), u = [o.ux, o.uz];
    const left = clipHalf(b.p, L(-gap, 0), [-u[0], -u[1]]), right = clipHalf(b.p, L(gap, 0), u);
    const mid = clipHalf(clipHalf(b.p, L(-gap, 0), u), L(gap, 0), [-u[0], -u[1]]);
    return [{ poly: left, h: H, style: st }, { poly: right, h: H, style: st },
      { poly: mid, minY: spring, h: H - spring, supports: [0, 1], supportSpan: gap * 2 + 8, style: { ...lintel, plinth: null } }];
  }

  // hall with a taller entrance block on the face turned toward `face`
  function entranceHall(b, { floors, st, face, extra = 2, width = 16, entry = st }) {
    const H = tall(floors, st), specs = [{ poly: b.p, h: H, style: st }];
    const e = facingEdge(b.p, face[0], face[1]);
    if (e) {
      const P = onEdge(e), m = e.L / 2;
      specs.push({ poly: [P(m - width / 2, 1.6), P(m + width / 2, 1.6), P(m + width / 2, -6), P(m - width / 2, -6)], h: H + extra * st.floorH, style: entry });
    }
    return specs;
  }

  // ordinary campus buildings: weighted palette of style makers
  const fallback = (styles) => (b, rnd) => {
    const ar = Math.abs(area(b.p)), floors = Math.max(b.lv || 1, 1);
    if (['roof', 'shed', 'bridge', 'service', 'greenhouse', 'construction'].includes(b.k) || ar < 60) return [{ poly: b.p, h: 4, style: office('#bcb9af', { win: WIN.NONE, plinth: null, parapet: 0 }) }];
    if (b.k === 'dormitory' || b.k === 'apartments') { const st = office('#e3dfd4', { win: WIN.APART, floorH: 3.1, groundH: 4 }); return [{ poly: b.p, h: tall(floors, st), style: st }]; }
    const st = styles[Math.floor(rnd() * styles.length)]();
    return [{ poly: b.p, h: tall(floors, st), style: st }];
  };
  const pair = (b, st, H = 7) => { const o = obb(b.p), L = frame(o), w = Math.max(o.hl, 3.4); return [{ poly: rectL(L, -w, -w + 1.6, -1, 1), h: H, style: st }, { poly: rectL(L, w - 1.6, w, -1, 1), h: H, style: st }]; };
  return { WIN, obb, frame, rectL, clipHalf, facingEdge, onEdge, office, brick, glass, tall, block, inset, archBlock, entranceHall, fallback, pair };
}

export const seoulCampuses = {
  hanyang(h) {
    const k = kit(h), { WIN, office, brick, glass, block } = k, PALE = '#d9d4c8', TAN = '#c9bda8', GREEN = '#4d7558';
    const stone = (o = {}) => office('#c8c1b0', { trim: '#e7e2d7', roof: GREEN, win: WIN.CLASSIC, bay: 3.1, floorH: 3.9, groundH: 4.5, parapet: 0,
      cornice: { h: 0.6, d: 0.35 }, plinth: { h: 1.2, d: 0.2, col: '#a59e8e' }, ...o });
    const { hall } = collegiate(h, { stone, roof: GREEN, merlon: '#c8c1b0', trim: '#e7e2d7' });
    return { landmarks: {
      // 본관: grey dressed stone, green roof with little white dormers, white-gabled end pavilions,
      // a six-column portico with a pediment over a broad flight of steps
      187185124(b) {
        const FACE = [-0.31, 0.95], specs = hall(b, { floors: 4, face: FACE, st: stone(), towerW: 24 });
        const o = k.obb(b.p), L = k.frame(o), e = k.facingEdge(k.rectL(L, -o.hl, o.hl, -o.hw * 0.86, o.hw * 0.86), FACE[0], FACE[1]);
        if (e) {
          const P = k.onEdge(e), m = e.L / 2, W = 21, q = (a, c, d0, d1) => [P(m + a, d0), P(m + c, d0), P(m + c, d1), P(m + a, d1)];
          specs.push({ poly: q(-W / 2 - 1, W / 2 + 1, 6, -0.2), h: 1.4, style: { wall: '#bdb7a9', trim: '#d4cfc3', roof: '#cbc6ba', win: WIN.NONE } });
          const c = h.colonnade(specs, { a: P(m - W / 2, 0), L: W, nx: e.nx, nz: e.nz, ux: e.ux, uz: e.uz }, { offset: 4.4, spacing: 3.6, r: 0.66, h: 14.6, pad: 1.5, entab: 1.5 });
          specs[c.entab].roof = { type: 'gable', h: 3.2, axis: [e.nx, e.nz], color: '#dcd6c9' };
          for (let i = 0; i < 4; i++) specs.push({ poly: q(-W / 2 - 4 + i, W / 2 + 4 - i, 6 + (4 - i) * 1.5, 5.8), h: 0.3 + i * 0.28, style: { wall: '#c3beb2', trim: '#d4cfc3', roof: '#cbc6ba', win: WIN.NONE } });
        }
        return specs;
      },
      187436420: (b) => k.archBlock(b, { H: 15, gap: 3.4, spring: 7, st: office(PALE, { win: WIN.NONE }) }), // 애지문
      // 백남학술정보관: grey granite block with tall narrow windows between stone piers
      187181261: block(6, office('#aeaba3', { bay: 2.6, cornice: { h: 0.9, d: 0.4 }, pilaster: { every: 2, w: 0.9, d: 0.4, from: 1 } })),
      187185123: block(3, office('#bdb6a8', { win: WIN.RUBBLE })),                   // 역사관
      605156372: (b) => [{ poly: b.p, h: 0.5, style: office('#bdb8ab', { win: WIN.NONE, plinth: null, parapet: 0 }), roof: { type: 'bowl', h: 5, center: h.centroid(b.p), color: '#b0ab9e' } }], // 노천극장
    }, fallback: k.fallback([() => office(PALE), () => office(TAN), () => office('#cfd0cc', { win: WIN.RIBBON }), () => brick('#a9654f')]) };
  },

  sogang(h) {
    const k = kit(h), { WIN, office, brick, glass, block } = k, WHITE = '#ecebe5';
    return { landmarks: {
      // 본관 (1959): white modernist bar with deep floor slabs; the west wing wears an egg-crate sun screen
      367474952(b) {
        const slabs = [0, 1, 2, 3].map(i => ({ y: 4.4 + i * 3.9, h: 0.32, d: 1.1 }));
        const base = { floorH: 3.9, groundH: 4.6, parapet: 0, cornice: { h: 0.55, d: 1.3 }, bands: slabs, plinth: { h: 1, d: 0.15, col: '#cfc6b2' } };
        const cut = [187.2, 70], n = [0.99, 0.13];
        const bar = k.clipHalf(b.p, cut, n), wing = k.clipHalf(b.p, cut, [-n[0], -n[1]]);
        if (bar.length < 3 || wing.length < 3) return [{ poly: b.p, h: 16.3, style: office(WHITE, { win: WIN.RIBBON, ...base }) }];
        return [{ poly: bar, h: 16.3, style: office(WHITE, { win: WIN.RIBBON, ...base }) },
          { poly: wing, h: 16.3, style: office(WHITE, { win: WIN.GRID, bay: 2.1, ...base, pilaster: { every: 1, w: 0.32, d: 1.1, from: 4.6 }, plinth: { h: 4.4, d: 0.2, col: '#cdbf9f' } }) }];
      },
      367483798: block(12, office(WHITE, { floorH: 3.3 })),                         // 곤자가 국제학사
      367474953: block(4, brick()), 367474954: block(5, brick()), 173883061: block(6, office(WHITE)), // 로욜라 도서관
      9600000001(b) { // 정문: IHS-inspired pillars, a cross on the right one
        const st = office('#c9c5bb', { win: WIN.NONE, plinth: { h: 0.5, d: 0.15, col: '#9d9a91' }, parapet: 0, cornice: null });
        const o = k.obb(b.p), L = k.frame(o), specs = k.pair(b, st, 8);
        specs.push({ poly: k.rectL(L, o.hl - 2.2, o.hl + 0.6, -0.25, 0.25), minY: 6, h: 0.5, supports: [1], supportSpan: 5, style: st });
        return specs;
      },
    }, fallback: k.fallback([() => brick(), () => brick('#9e5140'), () => glass('#6f93b3'), () => office(WHITE)]) };
  },

  hufs(h) {
    const k = kit(h), { WIN, office, glass, block } = k, STONE = '#c9c4b8';
    return { landmarks: {
      // 본관: three-storey neoclassical base with an eight-column portico, a twelve-storey stone tower
      // rising behind it to a stepped colonnaded crown
      478064706(b) {
        const BEIGE = '#dad1bd';
        const base = office(BEIGE, { win: WIN.CLASSIC, bay: 3.4, floorH: 4.4, groundH: 5, cornice: { h: 1, d: 0.6 }, parapet: 1.2,
          pilaster: { every: 2, w: 0.8, d: 0.3, from: 1.2 }, plinth: { h: 1.2, d: 0.25, col: '#b1a993' } });
        const specs = [{ poly: b.p, h: 14.4, style: base }];
        const e = h.facingSpan(b.p, 1, 0.07); // the front looks east over the plaza by the main gate
        if (!e) return specs;
        const P = k.onEdge(e), m = e.L / 2, q = (a, c, d0, d1) => [P(m + a, d0), P(m + c, d0), P(m + c, d1), P(m + a, d1)];
        const tower = office('#d3c9b3', { win: WIN.GRID, bay: 2.4, floorH: 3.7, groundH: 5, cornice: { h: 1, d: 0.5 }, parapet: 0, plinth: null,
          pilaster: { every: 2, w: 0.9, d: 0.45, from: 14.4 } });
        const T = 5 + 11 * 3.7;
        specs.push({ poly: q(-12, 12, -16, -38), h: T, style: tower });
        specs.push({ poly: q(-9, 9, -18.5, -35.5), minY: T, h: 5, style: { ...tower, win: WIN.ARCH, bay: 2.2, floorH: 5, groundH: 5, pilaster: { every: 1, w: 0.6, d: 0.5, from: 0 } } });
        specs.push({ poly: q(-5.5, 5.5, -21.5, -32.5), minY: T + 5, h: 3.4, style: { ...tower, win: WIN.NONE, pilaster: null, cornice: { h: 0.6, d: 0.4 }, parapet: 0.8 } });
        const W = 30, c = h.colonnade(specs, { a: P(m - W / 2, 0), L: W, nx: e.nx, nz: e.nz, ux: e.ux, uz: e.uz }, { offset: 5, spacing: 3.8, r: 0.8, h: 13, pad: 1.5, entab: 1.8 });
        specs[c.entab].roof = { type: 'gable', h: 3.8, axis: [e.nx, e.nz], color: '#cfc7b4' };
        for (let i = 0; i < 4; i++) specs.push({ poly: q(-W / 2 - 3 + i * 0.6, W / 2 + 3 - i * 0.6, 7 + (4 - i) * 1.4, -0.2), h: 0.25 + i * 0.25, style: { wall: '#c6bfae', trim: '#d6d0c3', roof: '#cdc7b9', win: WIN.NONE } });
        return specs;
      },
      416469100: block(6, glass()),                                                 // 도서관
      1188680345: block(16, glass('#7f9fb1', { floorH: 3.5 })),                      // 글로벌홀
      416469098(b) { // 국제관 with the round 애경홀 beside it
        const o = k.obb(b.p), L = k.frame(o), [x, z] = L(o.hl * 0.72, o.hw * 0.25), st = office(STONE);
        return [{ poly: b.p, h: k.tall(6, st), style: st }, { poly: h.circle(x, z, Math.min(o.hw * 0.62, 12), 18), h: 9, style: glass('#92adb6', { floorH: 4.5, groundH: 4.5, parapet: 0.6 }) }];
      },
    }, fallback: k.fallback([() => office(STONE), () => office('#d9d5ca'), () => office('#bfc3c1', { win: WIN.RIBBON }), () => glass()]) };
  },

  uos(h) {
    const k = kit(h), { WIN, office, brick, glass, block } = k;
    return { landmarks: {
      // 경농관 (1937): the oldest building, long and low in red brick under a blue-grey slate roof,
      // crossed by a gable over its middle porch
      224704349(b) {
        const st = brick('#9e5a46', { floorH: 3.9, groundH: 4.5, cornice: { h: 0.4, d: 0.35 }, parapet: 0 }), SLATE = '#56606a';
        return [{ poly: b.p, h: 8.4, style: st, roof: { type: 'hip', h: 3.6, color: SLATE } },
          { poly: [[135.6, 37.8], [146.6, 37.7], [146.8, 56.5], [135.8, 56.6]], h: 8.4, style: st, roof: { type: 'gable', h: 4.6, axis: [0, 1], color: SLATE } }];
      },
      224705102(b) { const st = brick(); const H = k.tall(5, st); return [{ poly: b.p, h: H, style: st }, { poly: k.inset(b.p, 0.96), minY: H, h: 4, style: glass() }]; }, // 대학본부
      // 대강당: red brick hall, a ribbon of glass under the eaves, a dark hipped roof
      224703877(b) {
        const red = brick('#9a5142', { floorH: 4.6, groundH: 4.6, parapet: 0, cornice: null });
        return [{ poly: b.p, h: 9.2, style: red },
          { poly: b.p, minY: 9.2, h: 2.6, style: glass('#7d9db3', { floorH: 2.6, groundH: 2.6, parapet: 0, cornice: null, plinth: null }) },
          { poly: b.p, minY: 11.8, h: 2.2, style: { ...red, win: WIN.NONE, plinth: null, cornice: { h: 0.45, d: 0.6 } }, roof: { type: 'hip', h: 3.2, color: '#3e4348' } }];
      },
      224703878: block(6, brick('#8e5441', { cornice: { h: 0.9, d: 0.8 }, pilaster: { every: 3, w: 1.6, d: 0.9, from: 0 } })), // 중앙도서관: brown brick, round piers
      224705116: block(4, brick('#a04b3b', { cornice: { h: 0.8, d: 0.4 } })),       // 배봉관
      224703949: block(6, office('#ab7d4d', { win: WIN.RIBBON })),                    // 건설공학관 (ochre steel panels)
      224621587: block(7, office('#e9e8e2', { win: WIN.RIBBON, cornice: { h: 0.7, d: 0.5 } })), // 21세기관: white, banded
      224704348: block(4, office('#ecebe5', { cornice: { h: 0.9, d: 0.7 }, pilaster: { every: 1, w: 0.5, d: 0.5, from: 4.6 } })), // 전농관
    }, fallback: k.fallback([() => brick(), () => brick('#99543f'), () => brick('#ad6a53'), () => glass()]) };
  },

  konkuk(h) {
    const k = kit(h), { WIN, office, brick, glass, block } = k, hanok = hanokBuilder(h), PALE = '#dcd8cd';
    return { landmarks: {
      // 상허기념도서관: stone box under a deep flat canopy, white slit-window panel over broad steps
      367582526(b) {
        const stone = office('#b9b1a1', { win: WIN.NONE, cornice: null, parapet: 0, plinth: { h: 1, d: 0.25, col: '#9f9788' } });
        const specs = [{ poly: b.p, h: 23, style: stone }, { poly: k.inset(b.p, 1.09), minY: 23, h: 1.6, style: { wall: '#d6d1c6', trim: '#e2ded4', roof: '#bdb9af', win: WIN.NONE } }];
        const e = h.facingSpan(b.p, 0.93, 0.38); // the front looks across 일감호
        if (e) {
          const P = k.onEdge(e), m = e.L / 2, w = e.L * 0.36, q = (a, c, d0, d1) => [P(a, d0), P(c, d0), P(c, d1), P(a, d1)];
          specs.push({ poly: q(m - w, m + w, 0.7, -0.2), minY: 7, h: 13, style: { wall: '#ece9e1', trim: '#f5f3ee', win: WIN.CLASSIC, bay: 1.35, floorH: 4.3, groundH: 4.3, cornice: { h: 0.4, d: 0.2 } } });
          specs.push({ poly: q(m - w * 0.72, m + w * 0.72, 0.4, -0.2), minY: 1, h: 4.6, style: { wall: '#39444a', trim: '#4a555b', win: WIN.CURTAIN, bay: 2.6, floorH: 4.6 } });
          for (let i = 0; i < 5; i++) specs.push({ poly: q(m - w * 1.25, m + w * 1.25, 3.2 * (5 - i) + 0.5, 0.4), h: 0.35 + i * 0.28, style: { wall: '#c8c4b9', trim: '#d6d2c8', roof: '#c9c5ba', win: WIN.NONE } });
        }
        return specs;
      },
      367251119: block(5, office(PALE, { cornice: { h: 0.9, d: 0.6 } })),            // 행정관
      372481901: block(15, glass('#86a2ac', { floorH: 3.6 })),                        // 새천년관
      572774580: hanok({ wallH: 3.2, roofH: 3 }),                                     // 도정궁 경원당
      551625235: hanok({ wallH: 3.2, roofH: 2.8 }),                                   // 일우헌
    }, fallback: k.fallback([() => office(PALE), () => brick('#a7634e'), () => office('#c7c9c6', { win: WIN.RIBBON }), () => glass()]) };
  },

  dongguk(h) {
    const k = kit(h), { WIN, office, brick, glass, block } = k, hanok = hanokBuilder(h), SLATE = '#4a4d50';
    const stone = (o = {}) => office('#a59f92', { win: WIN.RUBBLE, floorH: 4, groundH: 4.6, parapet: 0, cornice: { h: 0.45, d: 0.3 }, plinth: { h: 1.1, d: 0.2, col: '#837e73' }, ...o });
    const { hall } = collegiate(h, { stone, roof: SLATE, merlon: '#a59f92', trim: '#c9c4b8' });
    const PALE = { wall: '#e0d8c6', trim: '#eee8da', roof: '#cfc8b8', win: WIN.NONE, cornice: { h: 0.5, d: 0.25 } };
    return { landmarks: {
      // 본관: long stone hall with gabled ends; a tall pale portal shelters the white Buddha
      270032443(b) {
        const specs = hall(b, { floors: 3, face: [0.94, 0.34], dormers: false }), o = k.obb(b.p), L = k.frame(o);
        const e = k.facingEdge(k.rectL(L, -o.hl, o.hl, -o.hw * 0.86, o.hw * 0.86), 0.94, 0.34);
        if (e) {
          const P = k.onEdge(e), m = e.L / 2, q = (a, c, d0, d1) => [P(m + a, d0), P(m + c, d0), P(m + c, d1), P(m + a, d1)], i = specs.length;
          specs.push({ poly: q(-6.2, -3.4, 3.2, -2.2), h: 21, style: PALE }, { poly: q(3.4, 6.2, 3.2, -2.2), h: 21, style: PALE });
          specs.push({ poly: q(-6.2, 6.2, 3.2, -2.2), minY: 18, h: 3.6, supports: [i, i + 1], supportSpan: 9, style: PALE });
          specs.push({ poly: q(-3.4, 3.4, -0.6, -2.2), h: 18, style: { wall: '#65808a', trim: '#d9d6cc', win: WIN.CURTAIN, bay: 2.2, floorH: 3.6 } });
          const [x, z] = P(m, 1.5), W = { wall: '#f1ecdf', trim: '#f8f4ea', win: WIN.NONE };
          specs.push({ poly: h.circle(x, z, 1.5, 10), h: 1.1, style: { wall: '#8e897e', trim: '#a39e92', win: WIN.NONE } }, { poly: h.circle(x, z, 0.85, 10), minY: 1.1, h: 3.9, style: W }, { poly: h.circle(x, z, 0.5, 8), minY: 5, h: 1.1, style: W });
        }
        return specs;
      },
      // 명진관: rough-faced stone block with tall narrow windows
      268231222: block(4, office('#b3a58d', { win: WIN.RUBBLE, bay: 2.6, floorH: 4.4, groundH: 5, cornice: { h: 0.7, d: 0.35 }, parapet: 0.8, plinth: { h: 2.2, d: 0.35, col: '#8d8270' } })),
      268779564: hanok({ wallH: 6, panel: '#3d9b90', roofH: 6, platform: 2.4 }),      // 정각원 (옛 숭정전)
      272537475: hanok({ wallH: 3.2, panel: '#a8352a', roofH: 2.6 }),                 // 종각
      9700000001(b) { // 정문: four pale stone piers under little tiled caps
        const L = k.frame(k.obb(b.p)), st = { wall: '#c9c3b3', trim: '#d8d3c5', win: WIN.RUBBLEPLAIN, minWinEdge: 0, plinth: { h: 0.5, d: 0.12, col: '#a39d8e' } }, specs = [];
        for (const s of [-11, -4.6, 4.6, 11]) {
          const r = Math.abs(s) < 6 ? 1.3 : 1.1, i = specs.length;
          specs.push({ poly: k.rectL(L, s - r, s + r, -r, r), h: 6.2, style: st });
          specs.push({ poly: k.rectL(L, s - r - 0.45, s + r + 0.45, -r - 0.45, r + 0.45), minY: 6.2, h: 0.3, supports: [i], supportSpan: 4, style: { wall: SLATE, trim: SLATE, roof: SLATE, win: WIN.NONE }, roof: { type: 'hip', h: 1, color: SLATE } });
        }
        return specs;
      },
      9700000002(b) { // 코끼리상: a pair of bronze elephants
        const L = k.frame(k.obb(b.p)), st = { wall: '#7b6a4e', trim: '#8a7858', win: WIN.NONE }, specs = [];
        for (const c of [-3.4, 3.8]) {
          const box = (u0, u1, v0, v1, y, H) => specs.push({ poly: k.rectL(L, c + u0, c + u1, v0, v1), ...(y ? { minY: y } : {}), h: H, style: st });
          for (const [a, s] of [[-1.5, -0.75], [-1.5, 0.75], [1.1, -0.75], [1.1, 0.75]]) box(a - 0.33, a + 0.33, s - 0.33, s + 0.33, 0, 1.25);
          box(-2, 1.6, -1.05, 1.05, 1.25, 1.75); box(1.5, 2.6, -0.75, 0.75, 1.65, 1.25); box(2.55, 2.95, -0.2, 0.2, 0.45, 1.5);
        }
        return specs;
      },
    }, fallback: k.fallback([() => office('#d2cdc1'), () => brick('#a4604b'), () => office('#c5c3bb', { win: WIN.RIBBON }), () => glass()]) };
  },

  hongik(h) {
    const k = kit(h), { WIN, office, glass } = k, CONC = '#d3d0c8';
    return { landmarks: {
      // 홍문관: a green glass slab bridging the gateway, red-banded wing east, stone tower west
      1441620363(b) {
        const o = k.obb(b.p), L = k.frame(o), s = o.ux < 0 ? 1 : -1, W = (t) => L(s * t, 0), d = [s * o.ux, s * o.uz];
        const east = k.clipHalf(b.p, W(-0.16 * o.hl), [-d[0], -d[1]]), west = k.clipHalf(b.p, W(0.64 * o.hl), d);
        const bands = [0, 1, 2, 3, 4].map(i => ({ y: 4.4 + i * 3.7, h: 0.8, d: 0.12 }));
        const green = glass('#6f9d90', { floorH: 3.6, groundH: 3.6, bay: 2.4, parapet: 0.6, plinth: null });
        return [
          { poly: east, h: 24, style: office('#e6dac5', { trim: '#b5553c', floorH: 3.7, groundH: 4.4, parapet: 0, cornice: null, bands }) },
          { poly: west, h: 66, style: office('#d9ccb2', { win: WIN.NONE, cornice: { h: 0.8, d: 0.2 }, parapet: 0.6 }) },
          { poly: b.p, minY: 24, h: 29, supports: [0, 1], supportSpan: o.hl * 2, style: green },
          { poly: k.inset(b.p, 0.58), minY: 53, h: 9, style: { ...green, wall: '#86aeb0' } },
        ];
      },
    }, fallback: k.fallback([() => office(CONC), () => office('#dedbd3'), () => office('#c8c6be', { win: WIN.RIBBON }), () => office('#d5d2ca', { win: WIN.GRID, bay: 4 })]) };
  },
};
