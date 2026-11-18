// 서울대학교 관악캠퍼스: 1970s concrete and brick-tile blocks in a valley under 관악산,
// the "샤" main gate, 규장각's broad roof and the library on its piers.
export function snuCampus(h) {
  const { WIN, obb, circle, frame, rectL, centroid, area, facingEdge } = h;

  const CONCRETE = '#c6c1b5', BRICK = '#ad6f58', TILE = '#b98a70', GREY = '#a9abab', GLASS = '#8ba6af';
  const office = (wall, o = {}) => ({ wall, trim: '#e8e5dc', roof: '#7b7e80', win: WIN.GRID, bay: 3.3, floorH: 3.8, groundH: 4.6,
    cornice: { h: 0.5, d: 0.3 }, parapet: 1.0, plinth: { h: 0.9, d: 0.2, col: '#9c9a92' }, ...o });
  const tall = (floors, st) => st.groundH + (Math.max(floors, 1) - 1) * st.floorH;
  const block = (floors, st) => (b) => [{ poly: b.p, h: tall(floors, st), style: st }];
  const inset = (p, k) => { const [cx, cz] = centroid(p); return p.map(([x, z]) => [cx + (x - cx) * k, cz + (z - cz) * k]); };

  // round or square piers along the two long sides of a footprint
  function piers(specs, b, { step, r, y = 0, H, style }) {
    const o = obb(b.p), L = frame(o), n = Math.max(2, Math.round(o.hl * 2 / step)), ids = [];
    for (let k = 0; k <= n; k++) for (const v of [-o.hw + 1.4, o.hw - 1.4]) {
      const [x, z] = L(-o.hl + 1.4 + (o.hl * 2 - 2.8) * k / n, v);
      ids.push(specs.length);
      specs.push({ poly: circle(x, z, r, 8), minY: y, h: H, style });
    }
    return ids;
  }

  const landmarks = {
    // 정문 "샤": a concrete chevron over the entrance with a slotted tower beside it
    9500000001(b) {
      const [cx, cz] = centroid(b.p), ux = -0.15, uz = 0.99, vx = uz, vz = -ux;
      const st = { wall: GREY, trim: '#bcc0c1', win: WIN.NONE };
      const q = (t, d) => [cx + ux * t + vx * d, cz + uz * t + vz * d];
      const box = (t0, t1, d0, d1) => [q(t0, d0), q(t1, d0), q(t1, d1), q(t0, d1)];
      const specs = [], N = 9, half = 13, rise = 1.5;
      for (const s of [-1, 1]) for (let k = 0; k < N; k++) {
        const t = s * half * (1 - (k + 0.5) / N), w = half / N * 0.9 + 0.7;
        const prev = specs.length - 1;
        specs.push({ poly: box(t - w, t + w, -1.4, 1.4), ...(k ? { minY: k * rise, supports: [prev], supportSpan: 8 } : {}), h: rise + 0.35, style: st });
      }
      const T = half + 4, col = [];
      for (const d of [-1.45, 1.45]) { col.push(specs.length); specs.push({ poly: box(T - 1.1, T + 1.1, d - 0.45, d + 0.45), h: 25, style: st }); }
      for (const y of [13, 17.5]) specs.push({ poly: box(T - 1.9, T + 1.9, -1.9, 1.9), minY: y, h: 1.1, supports: col, supportSpan: 8, style: st });
      specs.push({ poly: box(T - 3.8, T + 1.9, -2.3, 2.3), minY: 25, h: 1.3, supports: col, supportSpan: 9, style: st });
      return specs;
    },

    // 규장각: glass band under a wide, shallow traditional-profile roof on round columns
    238935852(b) {
      const specs = [{ poly: b.p, h: 5.2, style: office('#85878a', { win: WIN.RIBBON, floorH: 5.2, groundH: 5.2, parapet: 0 }) }];
      const inner = inset(b.p, 0.88);
      specs.push({ poly: inner, minY: 5.2, h: 7.4, style: { wall: '#9fb0b5', trim: '#d8d9d6', win: WIN.CURTAIN, bay: 3, floorH: 3.7 } });
      piers(specs, b, { step: 10, r: 0.95, y: 5.2, H: 7.4, style: { wall: '#d4d0c6', trim: '#e0ddd4', win: WIN.NONE } });
      specs.push({ poly: b.p, minY: 12.6, h: 0.7, style: { wall: '#6e7276', trim: '#6e7276', roof: '#6e7276', win: WIN.NONE }, roof: { type: 'hip', h: 5.2, color: '#6e7276' } });
      return specs;
    },

    // 중앙도서관: upper floors carried on tall square piers over a recessed glass ground floor
    148286730(b) {
      const specs = [{ poly: inset(b.p, 0.84), h: 7, style: office('#93aab0', { win: WIN.CURTAIN, bay: 3, floorH: 7, groundH: 7, parapet: 0 }) }];
      piers(specs, b, { step: 8, r: 1.15, H: 7, style: { wall: '#c8ba9f', trim: '#d4c8b0', win: WIN.NONE } });
      specs.push({ poly: b.p, minY: 7, h: 25, style: { ...office('#c6bda9', { win: WIN.GRID, floorH: 4, groundH: 4 }), plinth: null } });
      return specs;
    },

    329398175: block(9, office(GLASS, { win: WIN.CURTAIN, bay: 3, floorH: 4 })),                    // 관정도서관
    167609409: block(7, office(CONCRETE, { win: WIN.RIBBON, cornice: { h: 1.2, d: 0.9 } })),         // 행정관
    93549089: block(6, office(GLASS, { win: WIN.CURTAIN, bay: 3 })),                                // 글로벌공학교육센터
    439693757: block(4, office(BRICK, { win: WIN.BRICK, trim: '#ddd0c0', floorH: 4.3 })),            // 박물관
    386890380: block(5, office(BRICK, { win: WIN.BRICK, trim: '#ddd0c0' })),                         // 예술관
    167607356: block(5, office(CONCRETE, { win: WIN.GRID })),                                       // 학생회관

    // 미술관 (MoA): a metal box cantilevered off a slim core
    252233408(b) {
      const st = { wall: '#9fa4a6', trim: '#b4b8ba', roof: '#85898b', win: WIN.RIBBON, bay: 5, floorH: 4.3, groundH: 4.3, cornice: null };
      return [{ poly: inset(b.p, 0.42), h: 6.5, style: office('#6f8088', { win: WIN.CURTAIN, floorH: 6.5, groundH: 6.5, parapet: 0 }) },
        { poly: b.p, minY: 6.5, h: 13, style: st }];
    },

    // 종합체육관: big hall under a pitched metal roof
    386891006(b) {
      const o = obb(b.p);
      return [{ poly: b.p, h: 15, style: office(GREY, { win: WIN.RIBBON, floorH: 7.5, groundH: 7.5, bay: 6, parapet: 0 }), roof: { type: 'gable', h: Math.min(o.hw * 0.25, 6), axis: [o.ux, o.uz], color: '#6f7a83' } }];
    },
  };

  function fallback(b, rnd) {
    const ar = Math.abs(area(b.p)), floors = Math.max(b.lv || 1, 1);
    if (ar < 70) return [{ poly: b.p, h: 4, style: office('#bcb9af', { win: WIN.NONE, plinth: null, parapet: 0 }) }];
    if (b.k === 'dormitory' || b.k === 'apartments' || b.k === 'residential') { const st = office('#e1dccf', { win: WIN.APART, floorH: 3.1, groundH: 4 }); return [{ poly: b.p, h: tall(floors, st), style: st }]; }
    const r = rnd();
    const st = r < 0.32 ? office(BRICK, { win: WIN.BRICK, trim: '#ddd0c0' }) : r < 0.5 ? office(TILE) : r < 0.62 ? office(GLASS, { win: WIN.CURTAIN, bay: 3 }) : office(CONCRETE, { win: rnd() < 0.4 ? WIN.RIBBON : WIN.GRID });
    return [{ poly: b.p, h: tall(floors, st), style: st }];
  }

  return { landmarks, fallback };
}
