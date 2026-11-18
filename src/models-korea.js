// 고려대학교 서울캠퍼스: collegiate-Gothic granite halls around 중앙광장 (인문계), modern blocks
// on the 자연계 side. Landmarks keyed by OSM id; `fallback` styles every other campus building.
// Collegiate-Gothic stone halls, shared by campuses built in that style
export function collegiate(h, { stone, roof, merlon: merlonCol, trim }) {
  const { WIN, obb, frame, rectL, facingEdge } = h;
  const tall = (floors, st) => st.groundH + (Math.max(floors, 1) - 1) * st.floorH;
  const onEdge = (e) => (t, d) => [e.a[0] + e.ux * t + e.nx * d, e.a[1] + e.uz * t + e.nz * d];

  // square battlemented tower, axis-aligned with the wall it stands on
  function tower(specs, P, t0, t1, d0, d1, H, st = stone()) {
    const base = specs.length;
    specs.push({ poly: [P(t0, d0), P(t1, d0), P(t1, d1), P(t0, d1)], h: H, style: { ...st, win: WIN.RUBBLE, bay: 2.8, cornice: { h: 0.6, d: 0.35 } } });
    const merlon = (t, d) => specs.push({ poly: [P(t - 0.55, d - 0.3), P(t + 0.55, d - 0.3), P(t + 0.55, d + 0.3), P(t - 0.55, d + 0.3)],
      minY: H, h: 1.3, supports: [base], supportSpan: 40, style: { wall: merlonCol, trim, win: WIN.NONE } });
    for (let t = t0 + 0.8; t <= t1 - 0.5; t += 2.2) { merlon(t, d0 - 0.3); merlon(t, d1 + 0.3); }
    return base;
  }

  // long hall: slate gable roof, gable-fronted end pavilions, dormers on the main face
  function hall(b, { floors = 4, face = [0, 1], towerH = 0, towerW = 13, dormers = true, st = stone() }) {
    const o = obb(b.p), L = frame(o), wall = tall(floors, st), specs = [];
    const inset = Math.min(o.hl * 0.2, 9);
    specs.push({ poly: rectL(L, -o.hl + inset, o.hl - inset, -o.hw * 0.86, o.hw * 0.86), h: wall, style: st, roof: { type: 'gable', h: Math.min(o.hw * 0.62, 6), axis: [o.ux, o.uz], color: roof } });
    for (const s of [-1, 1]) {
      const a = s * (o.hl - inset), c = s * o.hl;
      specs.push({ poly: rectL(L, Math.min(a, c), Math.max(a, c), -o.hw, o.hw), h: wall, style: st, roof: { type: 'gable', h: Math.min(inset * 0.7, 6.5), axis: [o.vx, o.vz], color: roof } });
    }
    const e = facingEdge(rectL(L, -o.hl, o.hl, -o.hw * 0.86, o.hw * 0.86), face[0], face[1]);
    if (e) {
      const P = onEdge(e), m = e.L / 2;
      if (towerH) tower(specs, P, m - towerW / 2, m + towerW / 2, 2.2, -towerW * 0.8, towerH, st);
      if (dormers) for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
        const t = m + s * (towerW / 2 + 5 + k * 6.5);
        if (t < inset + 2 || t > e.L - inset - 2) continue;
        specs.push({ poly: [P(t - 1.3, -0.4), P(t + 1.3, -0.4), P(t + 1.3, -2.8), P(t - 1.3, -2.8)], minY: wall, h: 1.8,
          style: { ...st, plinth: null, cornice: null, win: WIN.NONE }, roof: { type: 'gable', h: 1.1, axis: [e.nx, e.nz], color: roof } });
      }
    }
    return specs;
  }

  return { hall, tower };
}

export function koreaCampus(h) {
  const { WIN, obb, frame, rectL, centroid, area } = h;

  const SLATE = '#464c53', GRANITE = '#aca698', TRIM = '#c5c0b3';
  const stone = (o = {}) => ({ wall: GRANITE, trim: TRIM, roof: SLATE, win: WIN.RUBBLE, bay: 3.2, floorH: 3.9, groundH: 4.5,
    cornice: { h: 0.5, d: 0.3 }, plinth: { h: 1.1, d: 0.2, col: '#8e897d' }, ...o });
  const modern = (wall, o = {}) => ({ wall, trim: '#ecebe6', roof: '#7c8287', win: WIN.GRID, bay: 3.2, floorH: 3.8, groundH: 4.6,
    cornice: { h: 0.5, d: 0.3 }, parapet: 1.0, plinth: { h: 0.9, d: 0.2, col: '#a3a19a' }, ...o });
  const tall = (floors, st) => st.groundH + (Math.max(floors, 1) - 1) * st.floorH;

  const { hall } = collegiate(h, { stone, roof: SLATE, merlon: GRANITE, trim: TRIM });

  const glassy = (floors, wall = '#8ba7ad') => (b) => { const st = modern(wall, { win: WIN.CURTAIN, bay: 3 }); return [{ poly: b.p, h: tall(floors, st), style: st }]; };

  const landmarks = {
    183044140: (b) => hall(b, { floors: 4, towerH: 29, towerW: 13, face: [0.72, 0.69] }),                 // 본관 (1934)
    435326228: (b) => hall(b, { floors: 4, towerH: 31, towerW: 10, face: [-1, 0] }),  // 대학원 도서관 일대 (옛 도서관)
    392749251: (b) => hall(b, { floors: 3, towerH: 24, towerW: 8, face: [1, 0], dormers: false }), // 인촌기념관
    469055517: (b) => hall(b, { floors: 7, dormers: false }),                         // 중앙도서관
    435326229: (b) => hall(b, { floors: 5, towerH: 30, towerW: 9, face: [-1, 0] }),   // 백주년기념삼성관
    448208838: (b) => hall(b, { floors: 5, dormers: false }),                         // 경영본관
    469055520: (b) => hall(b, { floors: 6, dormers: false }),                         // 문과대학 서관
    468227413: glassy(12),                                                            // 미디어관
    803710534: (b) => [{ poly: b.p, h: 6, style: modern('#a9c4c9', { win: WIN.GREENHOUSE, bay: 2.4, floorH: 6, groundH: 6, parapet: 0 }) }], // 하나스퀘어
    804525738: (b) => [{ poly: b.p, h: 6, style: modern('#a9c4c9', { win: WIN.GREENHOUSE, bay: 2.4, floorH: 6, groundH: 6, parapet: 0 }) }],

    // 중앙광장: a lawn on the roof of the underground campus
    469055522: (b) => [{ poly: b.p, h: 0.6, style: { wall: '#7d8b61', trim: '#88975f', roof: '#769552', win: WIN.NONE } }],

    // 파이빌99: stacked shipping containers
    469055523(b) {
      const o = obb(b.p), L = frame(o), cols = ['#d6573f', '#e0b23b', '#3e7fa8', '#7a8b52'], specs = [];
      for (let y = 0; y < 3; y++) for (let k = 0; k < 4; k++) {
        const w = o.hl * 2 / 4, u = -o.hl + k * w;
        specs.push({ poly: rectL(L, u + 0.15, u + w - 0.15, -o.hw, o.hw), minY: y * 2.9, h: 2.8, style: { wall: cols[(k + y) % 4], trim: '#eee', win: WIN.RIBBON, bay: 3, floorH: 2.8 } });
      }
      return specs;
    },

    // 정문: granite piers with a battlemented lintel
    944932586(b) {
      const o = obb(b.p), L = frame(o), st = stone({ win: WIN.RUBBLEPLAIN, minWinEdge: 0, cornice: { h: 0.4, d: 0.25 } });
      const span = Math.max(o.hl - 2.4, 4), lintel = { ...st, plinth: null };
      const specs = [
        { poly: rectL(L, -span - 2.2, -span, -1.8, 1.8), h: 9, style: st },
        { poly: rectL(L, span, span + 2.2, -1.8, 1.8), h: 9, style: st },
        { poly: rectL(L, -span - 2.2, span + 2.2, -1.4, 1.4), minY: 7, h: 1.6, supports: [0, 1], supportSpan: span * 2 + 6, style: lintel },
      ];
      for (const s of [-span - 1.1, span + 1.1]) specs.push({ poly: rectL(L, s - 1.4, s + 1.4, -2.1, 2.1), minY: 9, h: 0.8, style: { wall: GRANITE, trim: TRIM, win: WIN.NONE } });
      return specs;
    },
  };

  // Everything else: granite east of the hospital (인문계), modern on the 자연계 side
  function fallback(b, rnd) {
    const ar = Math.abs(area(b.p)), floors = Math.max(b.lv || 1, 1);
    if (['roof', 'shed', 'greenhouse', 'warehouse'].includes(b.k) || ar < 60) return [{ poly: b.p, h: 4, style: modern('#bdbcb5', { win: WIN.NONE, plinth: null, parapet: 0 }) }];
    if (b.k === 'hospital' || b.k === 'dormitory' || centroid(b.p)[0] < -420) {
      const wall = b.k === 'dormitory' ? '#e4e0d6' : ['#d8d4ca', '#cfd0cb', '#c9cfd1', '#b9c8cc'][Math.floor(rnd() * 4)];
      const st = modern(wall, { win: b.k === 'dormitory' ? WIN.APART : rnd() < 0.3 ? WIN.CURTAIN : WIN.GRID });
      return [{ poly: b.p, h: tall(floors, st), style: st }];
    }
    const st = stone({ pilaster: ar > 700 ? { every: 3, w: 0.7, d: 0.3, from: 1.1 } : null, parapet: 0.9 });
    return [{ poly: b.p, h: tall(floors, st), style: st }];
  }

  return { landmarks, fallback };
}
