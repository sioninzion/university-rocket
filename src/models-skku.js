// 성균관대학교 인문사회과학캠퍼스 landmarks, keyed by OSM id: the Joseon-era 성균관 and 문묘
// halls plus the modern campus climbing the hill behind them.
export function skkuLandmarks(h) {
  const { WIN, obb, circle, frame, rectL, centroid, clipHalf, facingEdge, facingSpan, colonnade, modernWhite } = h;

  const TILE = '#3b3f43', RED = '#a8352a', JADE = '#3d9b90', EAVE = '#2f7d6d', PLASTER = '#ded8c9', BASE = '#a9a598';
  const PALE = '#dad6cc', STONE = '#c9c6bd', TAN = '#b9a58a', BRICK = '#9c4f3d', GLASS = '#86a9ad';

  const office = (wall, o = {}) => modernWhite({
    wall, trim: '#ecebe6', floorH: 3.8, groundH: 4.6, bay: 3.2, win: WIN.GRID,
    cornice: { h: 0.5, d: 0.3 }, parapet: 1.0, plinth: { h: 1.0, d: 0.2, col: '#a3a19a' }, ...o,
  });
  const tall = (floors, st) => st.groundH + (floors - 1) * st.floorH;
  const block = (floors, wall, o) => (b) => { const st = office(wall, o); return [{ poly: b.p, h: tall(floors, st), style: st }]; };
  const onEdge = (e) => (t, d) => [e.a[0] + e.ux * t + e.nx * d, e.a[1] + e.uz * t + e.nz * d];

  // hanok hall: stone platform, red posts between infill panels, green eaves, dark tiled hip roof
  const hanok = ({ wallH = 4.4, roofH, panel = PLASTER, bay = 3.3, platform = 0.9 } = {}) => (b) => {
    const o = obb(b.p), L = frame(o);
    const body = { wall: panel, trim: RED, roof: TILE, win: WIN.NONE, bay, floorH: wallH, groundH: wallH,
      pilaster: { every: 1, w: 0.42, d: 0.16, from: platform }, bands: [{ y: wallH - 0.55, h: 0.55, d: 0.1 }] };
    const inX = Math.min(1.3, o.hl * 0.2), inZ = Math.min(1.3, o.hw * 0.25);
    return [
      { poly: rectL(L, -o.hl, o.hl, -o.hw, o.hw), h: platform, style: { wall: BASE, trim: '#bdb9ac', roof: '#b3afa2', win: WIN.NONE } },
      { poly: rectL(L, -o.hl + inX, o.hl - inX, -o.hw + inZ, o.hw - inZ), h: wallH, style: body },
      { poly: rectL(L, -o.hl - 0.5, o.hl + 0.5, -o.hw - 0.5, o.hw + 0.5), minY: wallH, h: 0.55,
        style: { wall: EAVE, trim: EAVE, roof: TILE, win: WIN.NONE }, roof: { type: 'hip', h: roofH ?? Math.min(o.hw * 0.75, 4.6), color: TILE } },
    ];
  };

  return {
    415700719: hanok({ wallH: 5.2, panel: JADE, roofH: 4.6 }),                 // 명륜당
    415700718: hanok({ wallH: 6.4, panel: JADE, roofH: 6, platform: 1.3 }),    // 대성전
    430191549: hanok({ wallH: 5.0, panel: JADE, roofH: 4.4 }),                 // 비천당
    430186993: hanok({ wallH: 4.2, panel: RED, roofH: 3 }),                    // 신삼문
    430187503: hanok({ wallH: 3.3, roofH: 2.6 }),                              // 동무
    430188425: hanok({ wallH: 3.3, roofH: 2.6 }),                              // 서무
    430188011: hanok({ wallH: 3.1, roofH: 2.5 }),                              // 동재
    430188338: hanok({ wallH: 3.1, roofH: 2.5 }),                              // 서재
    430188193: hanok({ wallH: 3.1, roofH: 2.5 }),                              // 진사식당
    430187807: hanok({ wallH: 3.0, roofH: 2.2 }),
    788178731: hanok({ wallH: 2.8, roofH: 2.2 }), 788178732: hanok({ wallH: 2.8, roofH: 2.2 }), // 창덕궁 후원 정자들
    788178733: hanok({ wallH: 2.8, roofH: 2.2 }), 790239872: hanok({ wallH: 2.8, roofH: 2.2 }),
    790239873: hanok({ wallH: 2.8, roofH: 2.2 }), 790239874: hanok({ wallH: 2.8, roofH: 2.2 }),
    790239875: hanok({ wallH: 2.8, roofH: 2.2 }), 790239876: hanok({ wallH: 2.8, roofH: 2.2 }),

    // 600주년기념관: glass front under a great canopy on round columns, stone core, curved glass hall
    415700715(b) {
      const glass = office(GLASS, { win: WIN.CURTAIN, bay: 3, floorH: 4.2, cornice: { h: 0.5, d: 0.2 } });
      const e = facingSpan(b.p, -1, 0);
      if (!e) return [{ poly: b.p, h: 26, style: glass }];
      const P = onEdge(e), cut = P(0, -36), n = [e.nx, e.nz];
      const front = clipHalf(b.p, cut, n), rear = clipHalf(b.p, cut, [-n[0], -n[1]]);
      const specs = [{ poly: front, h: 26, style: glass }];
      if (rear.length >= 3) specs.push({ poly: rear, h: 20, style: { ...glass, wall: '#9dbcc2', parapet: 0, cornice: null }, roof: { type: 'gable', h: 3.4, axis: [e.ux, e.uz], color: '#c5cbcc' } });
      specs.push({ poly: [P(e.L * 0.58, -36), P(e.L * 0.82, -36), P(e.L * 0.82, -54), P(e.L * 0.58, -54)], h: 34,
        style: office(STONE, { win: WIN.CLASSIC, floorH: 4.2 }) });
      colonnade(specs, e, { offset: 6, spacing: 11, r: 1.15, h: 27, pad: 4, entab: 1.1, depthBack: 34 });
      return specs;
    },

    // 중앙학술정보관: the old red-brick library with a newer glass wing attached
    415700716(b) {
      const [cx, cz] = centroid(b.p);
      const brick = office(BRICK, { win: WIN.BRICK, trim: '#e4dccd', floorH: 4 }), glass = office(GLASS, { win: WIN.CURTAIN, bay: 3, floorH: 4 });
      const east = clipHalf(b.p, [cx, cz], [1, 0]), west = clipHalf(b.p, [cx, cz], [-1, 0]);
      return [{ poly: east, h: tall(6, brick), style: brick }, { poly: west, h: tall(6, glass), style: glass }];
    },

    // 호암관: 14-storey 1969 science tower with a rooftop observatory
    430192739(b) {
      const st = office(TAN, { win: WIN.GRID, floorH: 3.6 }), o = obb(b.p), H = tall(14, st), R = Math.min(o.hw * 0.28, 6);
      return [{ poly: b.p, h: H, style: st },
        { poly: circle(o.cx, o.cz, R, 16), minY: H, h: 2, style: { wall: '#d9dbdc', trim: '#eceded', win: WIN.NONE }, roof: { type: 'dome', h: R, color: '#cfd4d7' } }];
    },

    // 경영관: "bookshelf" facade of tall vertical fins
    415700714: block(8, '#d8d4c9', { win: WIN.GRID, bay: 2.4, pilaster: { every: 3, w: 0.8, d: 0.75, from: 1 }, cornice: { h: 1, d: 0.8 } }),
    415700713: block(6, PALE, { win: WIN.GRID, bands: [{ y: 8.4, h: 0.3, d: 0.2 }] }),  // 다산경제관
    430193116: block(7, PALE, { win: WIN.GRID }),                                       // 퇴계인문관
    415889626: block(9, STONE, { win: WIN.RIBBON }),                                    // 수선관
    430193356: block(9, STONE, { win: WIN.RIBBON }),                                    // 수선관 별관
    415889625: block(8, GLASS, { win: WIN.CURTAIN, bay: 3 }),                           // 법학관
    430195379: block(5, PALE, { win: WIN.GRID, floorH: 4 }),                            // 학생회관
    415864489: block(5, STONE, { win: WIN.GRID }),                                      // 양현관
    1567692592: block(7, '#9db4b8', { win: WIN.CURTAIN, bay: 3 }),                      // 수기치인관
    430192218: block(5, '#e8e6df', { win: WIN.RIBBON, floorH: 4 }),                     // 국제관 (rotunda)
    841134514: block(6, '#d6d3ca', { win: WIN.GRID }),                                  // 유림회관
    841134513: block(10, '#e7e3da', { win: WIN.APART, floorH: 3.1, groundH: 4.2, bay: 3 }), // K하우스
    841134515: block(10, '#e7e3da', { win: WIN.APART, floorH: 3.1, groundH: 4.2, bay: 3 }), // I하우스

    // 노천극장: stepped seating in the hillside
    808268495(b) {
      const [cx, cz] = centroid(b.p);
      return [{ poly: b.p, h: 0.5, style: { wall: '#bdb8ab', trim: '#d0ccc0', roof: '#b0ab9e', win: WIN.NONE }, roof: { type: 'bowl', h: 5, center: [cx, cz] } }];
    },

    // 정문: four dark rubble-stone gate piers, each capped with a little tiled roof
    9200000001(b) {
      const [cx, cz] = centroid(b.p), ux = -0.99, uz = 0.14, vx = -uz, vz = ux; // road direction and its normal
      const specs = [];
      for (const s of [-11, -4.6, 4.6, 11]) {
        const x = cx + vx * s, z = cz + vz * s, big = Math.abs(s) < 6 ? 1.35 : 1.15;
        const q = (a, c) => [x + ux * a + vx * c, z + uz * a + vz * c], r = (m) => [q(-m, -m), q(m, -m), q(m, m), q(-m, m)];
        const i = specs.length;
        specs.push({ poly: r(big), h: 5.4, style: { wall: '#55575a', trim: '#6a6c6e', win: WIN.RUBBLEPLAIN, minWinEdge: 0, plinth: { h: 0.5, d: 0.12, col: '#77787a' } } });
        specs.push({ poly: r(big + 0.5), minY: 5.4, h: 0.3, supports: [i], supportSpan: 4, style: { wall: EAVE, trim: TILE, roof: TILE, win: WIN.NONE }, roof: { type: 'hip', h: 1.1, color: TILE } });
      }
      return specs;
    },

    // 명륜당 뜰의 은행나무 (천연기념물): huge trunk with a golden crown
    9200000002(b) {
      const [cx, cz] = centroid(b.p);
      const specs = [{ poly: circle(cx, cz, 1.3, 10), h: 8, style: { wall: '#5d4a39', trim: '#5d4a39', win: WIN.NONE } }];
      [[6, 8, 3], [8.2, 10.5, 3.5], [7, 13.5, 3], [4.4, 16, 2.6]].forEach(([r, y, H], i) => specs.push({
        poly: circle(cx + (i % 2 ? 0.8 : -0.5), cz + (i % 2 ? -0.5 : 0.6), r, 10), minY: y, h: H,
        supports: [0], supportSpan: 30, style: { wall: i % 2 ? '#e0b73d' : '#d6a92f', trim: '#e8c552', win: WIN.NONE },
      }));
      return specs;
    },
  };
}
