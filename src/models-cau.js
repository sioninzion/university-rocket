// 중앙대학교 서울캠퍼스 landmarks, keyed by OSM id. Storeys come from the campus building
// list; shapes and materials from photos and aerial imagery.
export function cauLandmarks(h) {
  const { WIN, obb, circle, frame, rectL, centroid, facingEdge, facingSpan, modernWhite, classical } = h;

  const GRANITE = '#c6c5c0', PALE = '#dedad1', CONCRETE = '#cfc9bc', BEIGE = '#d9cfbd';
  const BRICK = '#9d5a45', TERRA = '#a96a50', METAL = '#aeb3b6', SLATE = '#3f454b', ROOF = '#7c8287';

  const office = (wall, floors, o = {}) => modernWhite({
    wall, trim: '#ecebe6', floorH: 3.9, groundH: 4.6, bay: 3.2, win: WIN.GRID,
    cornice: { h: 0.5, d: 0.3 }, parapet: 1.0, plinth: { h: 1.0, d: 0.2, col: '#a9a7a1' }, floors, ...o,
  });
  const tall = (floors, st) => (st.groundH || st.floorH) + (floors - 1) * st.floorH;
  const block = (floors, wall, o) => (b) => { const st = office(wall, floors, o); return [{ poly: b.p, h: tall(floors, st), style: st }]; };
  const onEdge = (e) => (t, d) => [e.a[0] + e.ux * t + e.nx * d, e.a[1] + e.uz * t + e.nz * d];
  const inset = (poly, k) => { const [cx, cz] = centroid(poly); return poly.map(([x, z]) => [cx + (x - cx) * k, cz + (z - cz) * k]); };

  // columns just inside the outline of a footprint
  function perimeterColumns(specs, poly, { step, r, minY, h: colH, style }) {
    const [cx, cz] = centroid(poly), ids = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (L < step * 0.8) continue;
      const n = Math.max(1, Math.round(L / step));
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n;
        let x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t;
        const d = Math.hypot(cx - x, cz - z) || 1;
        x += (cx - x) / d * 1.6; z += (cz - z) / d * 1.6;
        ids.push(specs.length);
        specs.push({ poly: circle(x, z, r, 10), minY, h: colH, style });
      }
    }
    return ids;
  }

  return {
    // 101 영신관 (1938): rubble-stone Gothic hall, gabled end wings and a lancet-windowed centre gable
    278564996() {
      const st = { wall: '#a8a294', trim: '#c9c4b8', roof: SLATE, win: WIN.RUBBLE, bay: 3.0, floorH: 4.0, groundH: 4.4,
        cornice: { h: 0.45, d: 0.3 }, plinth: { h: 1.1, d: 0.2, col: '#8f8a7e' } };
      const gable = (axis, h = 4.6) => ({ type: 'gable', h, axis, color: SLATE });
      const front = { ...st, win: WIN.GOTHIC, bay: 2.1, floorH: 5.2, groundH: 5.2, plinth: null, cornice: null };
      return [
        { poly: [[-23, 69.3], [-24.3, 85.7], [3, 86.5], [3, 70.1]], h: 12.4, style: st, roof: gable([1, 0]) },
        { poly: [[-33, 66.7], [-33.7, 89.2], [-24.3, 89.4], [-22.9, 67]], h: 12.4, style: st, roof: gable([0, 1], 5.2) },
        { poly: [[3, 67.3], [2.9, 89.9], [12.6, 90.2], [13.2, 67.6]], h: 12.4, style: st, roof: gable([0, 1], 5.2) },
        { poly: [[-14.5, 67.8], [-5.5, 68.1], [-5.6, 75], [-14.6, 74.8]], h: 14.2, style: st, roof: gable([0, 1], 4.4) },
        { poly: [[-12.5, 67.45], [-7.5, 67.6], [-7.5, 67.9], [-12.5, 67.8]], minY: 8, h: 5.6, style: front },
      ];
    },

    // 102 약학대학·R&D센터: 11-storey glass slab on a wide podium, right at the main gate
    367405937(b) {
      const glass = office('#8ea4ad', 11, { win: WIN.CURTAIN, floorH: 3.7, groundH: 4.8, bay: 3, cornice: { h: 0.7, d: 0.25 } });
      const base = office(GRANITE, 4, { win: WIN.GRID, floorH: 4.0, groundH: 5 });
      const slab = [[75.8, -27.2], [95, -27.2], [95, 45.3], [58.5, 41.4], [58.5, -1.1], [75.8, -1.1]];
      return [{ poly: b.p, h: 17, style: base }, { poly: slab, minY: 17, h: 26.5, style: { ...glass, plinth: null } }];
    },

    5462178: block(7, PALE, { win: WIN.GRID }),                               // 104 수림과학관
    367405935: block(4, BRICK, { win: WIN.BRICK, floorH: 3.8, cornice: { h: 0.6, d: 0.35 } }), // 103 파이퍼홀
    367405933: block(6, BEIGE, { win: WIN.GRID }),                            // 105 제1의학관
    367405934: block(5, '#8fa6b0', { win: WIN.CURTAIN, bay: 3 }),             // 106 제2의학관 (curtain wall)
    1311845308: block(7, METAL, { win: WIN.CURTAIN, bay: 2.8 }),              // 108 의학도서관 (2023)
    278564995: block(6, CONCRETE, { win: WIN.RIBBON, floorH: 3.5 }),          // 107 학생회관
    367405918: block(5, METAL, { win: WIN.RIBBON, cornice: { h: 0.7, d: 0.5 } }), // 202 전산정보관
    367405916: block(8, CONCRETE, { win: WIN.GRID, floorH: 3.5, bay: 3 }),    // 203 서라벌홀 (1961)
    5466447: block(7, BEIGE, { win: WIN.GRID, floorH: 3.8 }),                 // 207 봅스트홀
    367405930: block(6, CONCRETE, { win: WIN.RIBBON }),                       // 208 제2공학관
    367771707: block(8, '#9fb0b6', { win: WIN.CURTAIN, bay: 3 }),             // 209 창업보육관
    278564999: block(5, BEIGE, { win: WIN.GRID }),                            // 302 대학원
    367405915: block(14, PALE, { win: WIN.GRID, floorH: 3.7, cornice: { h: 0.9, d: 0.4 } }), // 303 법학관
    367405912: block(10, '#dfe1de', { win: WIN.RIBBON, floorH: 3.7, cornice: { h: 0.8, d: 0.7 } }), // 305 교수연구동
    367405913: block(5, '#e7e3da', { win: WIN.APART, floorH: 3.2, groundH: 4.2, bay: 3 }), // 307 글로벌하우스

    // 201 본관: long, restrained three-storey block with pale piers, facing 청룡연못
    367405920: (b) => [{ poly: b.p, h: 15, style: classical({ wall: PALE, floorH: 4.3, groundH: 5, bay: 3.2, cornice: { h: 0.9, d: 0.6 },
      bands: [{ y: 5, h: 0.35, d: 0.2 }], pilaster: { every: 1, w: 0.6, d: 0.3, from: 1.4 } }) }],

    // 204 중앙도서관: glass curtain wall (2009) with a clock tower on the entrance side
    5462177(b) {
      const glass = office('#7f9ba8', 7, { win: WIN.CURTAIN, bay: 3, floorH: 3.9, groundH: 5, trim: '#eef0ef', cornice: { h: 1.0, d: 0.5 } });
      const specs = [{ poly: b.p, h: tall(7, glass), style: glass }];
      const e = facingEdge(b.p, 0.42, -0.9);
      if (e) {
        const P = onEdge(e), m = e.L / 2;
        const st = { wall: '#f0efea', trim: '#fff', roof: ROOF, win: WIN.NONE, cornice: { h: 0.6, d: 0.35 }, plinth: { h: 1, d: 0.2, col: '#bdbab2' } };
        specs.push({ poly: [P(m - 4, 2.5), P(m + 4, 2.5), P(m + 4, -5.5), P(m - 4, -5.5)], h: 45, style: st, roof: { type: 'pyramid', h: 3, color: ROOF } });
        const plate = (t0, t1, y, h, wall, d = 2.85) => specs.push({ poly: [P(m + t0, d), P(m + t1, d), P(m + t1, 2.5), P(m + t0, 2.5)], minY: y, h, style: { wall, trim: wall, win: WIN.NONE } });
        plate(-2.3, 2.3, 37.5, 4.6, '#f8f7f1');                 // clock face
        plate(-0.13, 0.13, 39.8, 1.9, '#20262b', 3.05);         // minute hand
        plate(-0.13, 1.35, 39.67, 0.26, '#20262b', 3.05);       // hour hand
      }
      return specs;
    },

    // 301 중앙문화예술관: terracotta-coloured hall with rounded corners
    367405909: block(9, TERRA, { win: WIN.GRID, floorH: 3.8, bay: 3.6, trim: '#e4d6c6' }),

    // 305 체육관: tall volume with few windows and a shallow roof
    367405910: (b) => [{ poly: b.p, h: 22, style: office('#c9cdcc', 3, { win: WIN.CURTAIN, floorH: 7, groundH: 7, bay: 4 }), roof: { type: 'hip', h: 2.4, color: '#6f7a83' } }],

    // 308·309 블루미르홀: stepped hillside dormitories
    607563321: block(15, '#ebe8e0', { win: WIN.APART, floorH: 3.1, groundH: 4.2, bay: 3, parapet: 1.3 }),
    607563320: block(12, '#e4e2dc', { win: WIN.APART, floorH: 3.1, groundH: 4.2, bay: 3, parapet: 1.3 }),

    // 310 100주년기념관: stone podium, recessed glass storey on columns, huge finned upper block
    607563318(b) {
      const specs = [];
      const stone = '#aeb1b1';
      specs.push({ poly: b.p, h: 13, style: office('#8d9496', 3, { win: WIN.GRID, floorH: 4.2, groundH: 4.6, cornice: { h: 0.5, d: 0.5 } }) });
      specs.push({ poly: inset(b.p, 0.88), minY: 13, h: 7.5, style: { wall: '#6f8d98', trim: '#d8dcdc', win: WIN.CURTAIN, bay: 3, floorH: 7.5 } });
      perimeterColumns(specs, b.p, { step: 9.5, r: 0.85, minY: 13, h: 7.5, style: { wall: stone, trim: stone, win: WIN.NONE } });
      const up = { wall: stone, trim: '#bfc2c2', roof: ROOF, win: WIN.CLASSIC, bay: 2.7, floorH: 3.9, groundH: 3.9,
        cornice: { h: 0.8, d: 0.25 }, parapet: 1.1, pilaster: { every: 1, w: 0.28, d: 0.32, from: 0 } };
      specs.push({ poly: b.p, minY: 20.5, h: 31, style: up });
      const e = facingSpan(b.p, 1, 0);
      if (e) {
        const P = onEdge(e), m = e.L / 2, hw = Math.min(e.L * 0.33, 34);
        specs.push({ poly: [P(m - hw, 0.18), P(m + hw, 0.18), P(m + hw, -0.6), P(m - hw, -0.6)], minY: 39, h: 7.8,
          style: { wall: '#5f8fa8', trim: '#d0d5d6', win: WIN.CURTAIN, bay: 2.7, floorH: 3.9 } });
      }
      return specs;
    },

    // 정문 입구 조형물: two slim piers carrying a blue bar
    9100000001(b) {
      const L = frame(obb(b.p));
      const st = { wall: '#d8dadb', trim: '#eff0f0', win: WIN.NONE, plinth: { h: 0.6, d: 0.2, col: '#8f9396' } };
      return [
        { poly: rectL(L, -3.6, -2.6, -0.8, 0.8), h: 9, style: st },
        { poly: rectL(L, 2.6, 3.6, -0.8, 0.8), h: 9, style: st },
        { poly: rectL(L, -4, 4, -1, 1), minY: 6.4, h: 1.5, supports: [0, 1], supportSpan: 7, style: { wall: '#1f4fa3', trim: '#2c62bd', win: WIN.NONE } },
      ];
    },

    // 청룡상 (1968): a brass dragon coiling up around a concrete globe, mid-pond
    9100000002(b) {
      const [cx, cz] = centroid(b.p);
      const globe = { wall: '#b9bcb8', trim: '#c9ccc8', win: WIN.NONE }, brass = { wall: '#6f8a5c', trim: '#8aa070', win: WIN.NONE };
      const specs = [{ poly: circle(cx, cz, 3, 14), h: 1.2, style: { wall: '#8b8a84', trim: '#a5a39b', win: WIN.NONE } }];
      for (let i = 0; i < 6; i++) {
        const y = (i + 0.5) / 6 * 2 - 1, r = Math.sqrt(1 - y * y) * 2.5;
        specs.push({ poly: circle(cx, cz, Math.max(r, 0.5), 14), minY: 1.2 + i * 0.84, h: 0.84, style: globe });
      }
      for (let i = 0; i < 13; i++) {
        const a = i * 0.72, y = 1.0 + i * 0.62, R = i < 9 ? 2.85 : 2.85 - (i - 8) * 0.55;
        specs.push({ poly: circle(cx + Math.cos(a) * R, cz + Math.sin(a) * R, 0.62 - i * 0.012, 8), minY: y, h: 0.72, style: brass });
      }
      specs.push({ poly: circle(cx + 0.5, cz + 0.2, 0.72, 8), minY: 9, h: 0.7, style: brass, roof: { type: 'pyramid', h: 1.1, color: '#8aa070' } });
      return specs;
    },

    // 의혈탑: slender white memorial tower near the library entrance
    9100000003(b) {
      const o = obb(b.p), L = frame(o);
      const st = { wall: '#ecebe6', trim: '#f6f5f1', win: WIN.NONE, plinth: { h: 0.7, d: 0.5, col: '#a7a59d' } };
      return [
        { poly: rectL(L, -1.2, 1.2, -1.2, 1.2), h: 9, style: st },
        { poly: rectL(L, -0.7, 0.7, -0.7, 0.7), minY: 9, h: 3, style: { ...st, plinth: null }, roof: { type: 'pyramid', h: 2.2, color: '#ecebe6' } },
      ];
    },
  };
}
