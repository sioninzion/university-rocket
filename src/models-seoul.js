// Seven Seoul campuses built from one kit: each gets its own palette for ordinary buildings
// and hand-made models for the landmarks that define it.
import { hanokBuilder } from './models-skku.js?v=64';

function kit(h) {
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
  return { WIN, obb, frame, rectL, office, brick, glass, tall, block, inset, archBlock, entranceHall, fallback, pair };
}

export const seoulCampuses = {
  hanyang(h) {
    const k = kit(h), { WIN, office, brick, glass, block } = k, PALE = '#d9d4c8', TAN = '#c9bda8';
    return { landmarks: {
      187185124: (b) => k.entranceHall(b, { floors: 8, st: office(PALE, { floorH: 3.9, cornice: { h: 1, d: 0.6 } }), entry: glass(), face: [-0.9, -0.43], extra: 1, width: 18 }), // 본관
      187436420: (b) => k.archBlock(b, { H: 15, gap: 3.4, spring: 7, st: office(PALE, { win: WIN.NONE }) }), // 애지문
      187181261: block(5, glass()),                                                  // 백남학술정보관
      187185123: block(3, office('#bdb6a8', { win: WIN.RUBBLE })),                   // 역사관
      605156372: (b) => [{ poly: b.p, h: 0.5, style: office('#bdb8ab', { win: WIN.NONE, plinth: null, parapet: 0 }), roof: { type: 'bowl', h: 5, center: h.centroid(b.p), color: '#b0ab9e' } }], // 노천극장
    }, fallback: k.fallback([() => office(PALE), () => office(TAN), () => office('#cfd0cc', { win: WIN.RIBBON }), () => brick('#a9654f')]) };
  },

  sogang(h) {
    const k = kit(h), { WIN, office, brick, glass, block } = k, WHITE = '#ecebe5';
    return { landmarks: {
      // 본관 (1959): white modernist block; the sun-screen grid shades its west side
      367474952: block(4, office(WHITE, { win: WIN.RIBBON, floorH: 3.9, cornice: { h: 0.7, d: 0.8 }, pilaster: { every: 1, w: 0.26, d: 0.7, from: 4.6 } })),
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
      478064706: block(13, office(STONE, { floorH: 3.6, cornice: { h: 1, d: 0.5 }, pilaster: { every: 3, w: 0.7, d: 0.3, from: 1 } })), // 본관
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
      // 경농관 (1937): the oldest building, long and low under a dark roof
      224704349: (b) => [{ poly: b.p, h: 8.4, style: brick('#a4604c', { floorH: 3.9, groundH: 4.5, cornice: { h: 0.4, d: 0.35 }, parapet: 0 }), roof: { type: 'hip', h: 3.6, color: '#4b4f53' } }],
      224705102(b) { const st = brick(); const H = k.tall(5, st); return [{ poly: b.p, h: H, style: st }, { poly: k.inset(b.p, 0.96), minY: H, h: 4, style: glass() }]; }, // 대학본부
      224703878: block(6, brick()), 224705116: block(4, brick()),                    // 중앙도서관, 배봉관
      224703949: block(6, office('#ab7d4d', { win: WIN.RIBBON })),                    // 건설공학관 (ochre steel panels)
      224621587: block(7, glass('#8ba5ad')),                                          // 21세기관
    }, fallback: k.fallback([() => brick(), () => brick('#99543f'), () => brick('#ad6a53'), () => glass()]) };
  },

  konkuk(h) {
    const k = kit(h), { WIN, office, brick, glass, block } = k, hanok = hanokBuilder(h), PALE = '#dcd8cd';
    return { landmarks: {
      367582526: (b) => k.entranceHall(b, { floors: 6, st: office('#cfc7b7', { floorH: 4, pilaster: { every: 2, w: 0.8, d: 0.4, from: 1 } }), entry: glass(), face: [0.95, -0.3], extra: 1, width: 22 }), // 상허기념도서관
      367251119: block(5, office(PALE, { cornice: { h: 0.9, d: 0.6 } })),            // 행정관
      372481901: block(15, glass('#86a2ac', { floorH: 3.6 })),                        // 새천년관
      572774580: hanok({ wallH: 3.2, roofH: 3 }),                                     // 도정궁 경원당
      551625235: hanok({ wallH: 3.2, roofH: 2.8 }),                                   // 일우헌
    }, fallback: k.fallback([() => office(PALE), () => brick('#a7634e'), () => office('#c7c9c6', { win: WIN.RIBBON }), () => glass()]) };
  },

  dongguk(h) {
    const k = kit(h), { WIN, office, brick, glass, block } = k, hanok = hanokBuilder(h), STONE = '#bab3a4';
    return { landmarks: {
      268231222: (b) => k.entranceHall(b, { floors: 3, st: office(STONE, { win: WIN.RUBBLE, floorH: 4, cornice: { h: 0.6, d: 0.4 } }), face: [0, -1], extra: 1.4, width: 15 }), // 명진관
      270032443: block(4, office(STONE, { win: WIN.RUBBLE, floorH: 3.9 })),           // 본관
      268779564: hanok({ wallH: 6, panel: '#3d9b90', roofH: 6, platform: 1.3 }),      // 정각원 (옛 숭정전)
      272537475: hanok({ wallH: 3.2, panel: '#a8352a', roofH: 2.6 }),                 // 종각
    }, fallback: k.fallback([() => office('#d2cdc1'), () => brick('#a4604b'), () => office('#c5c3bb', { win: WIN.RIBBON }), () => glass()]) };
  },

  hongik(h) {
    const k = kit(h), { WIN, office, glass } = k, CONC = '#d3d0c8';
    return { landmarks: {
      // 홍문관: a 16-storey triumphal arch that doubles as the main gate
      1441620363: (b) => k.archBlock(b, { H: 62, gap: 11, spring: 25, st: office('#c9c8c2', { floorH: 3.8, cornice: { h: 1, d: 0.5 } }), lintel: glass('#8ba7b3', { floorH: 3.8 }) }),
    }, fallback: k.fallback([() => office(CONC), () => office('#dedbd3'), () => office('#c8c6be', { win: WIN.RIBBON }), () => office('#d5d2ca', { win: WIN.GRID, bay: 4 })]) };
  },
};
