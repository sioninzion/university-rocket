// 국민대·숭실대·세종대·단국대(죽전): landmarks modelled from photos, keyed by OSM id,
// plus each campus's palette for the buildings without a hand-made model.
import { kit } from './models-seoul.js?v=92';

export const kssdCampuses = {
  kookmin(h) {
    const k = kit(h), { WIN, office, brick, glass, block, tall } = k, BEIGE = '#d3c6ad', GREY = '#b9b5ad';
    return { landmarks: {
      // 북악관: sixteen-storey beige slab with continuous window bands, seen from everywhere on campus
      172246889(b) {
        const o = h.obb(b.p), L = h.frame(o), W = Math.min(o.hw, 11.5);
        const st = office('#cdbfa5', { win: WIN.RIBBON, bay: 3, floorH: 3.5, groundH: 4.6, cornice: { h: 0.9, d: 0.4 }, parapet: 1.2 });
        const H = tall(16, st);
        return [{ poly: b.p, h: tall(3, st), style: office('#c6b99f', { floorH: 3.5, groundH: 4.6 }) },
          { poly: h.rectL(L, -o.hl, o.hl, -W, W), h: H, style: st },
          { poly: h.rectL(L, -o.hl * 0.25, o.hl * 0.25, -W * 0.6, W * 0.6), minY: H, h: 4.5, style: { ...st, win: WIN.NONE } }];
      },
      // 성곡도서관: two grey stone blocks either side of a tall green glass atrium
      172246893(b) {
        const o = h.obb(b.p), L = h.frame(o), st = office(GREY, { bay: 2.8, cornice: { h: 0.8, d: 0.4 } }), H = tall(5, st);
        return [{ poly: b.p, h: H, style: st },
          { poly: h.rectL(L, -6, 6, -o.hw - 0.6, o.hw + 0.6), h: H + 3, style: glass('#5f8d84', { bay: 2.2, parapet: 0, cornice: null }), roof: { type: 'gable', h: 3, axis: [o.vx, o.vz], color: '#6f9a90' } }];
      },
      // 과학관: pink brick above a grey stone retaining wall, a blue glass storey on top
      172646933(b) {
        const st = brick('#c27f70', { floorH: 3.9, groundH: 4.6, parapet: 0, cornice: null, plinth: { h: 3, d: 0.3, col: '#9d9a93' } }), H = tall(3, st);
        return [{ poly: b.p, h: H, style: st }, { poly: k.inset(b.p, 0.97), minY: H, h: 4.2, style: glass('#5c83b2', { floorH: 4.2, groundH: 4.2, plinth: null }) }];
      },
      172246894: block(5, brick('#a2513f', { cornice: { h: 0.7, d: 0.4 } })),                      // 조형관: red brick and glass
      579857196: block(6, office('#d6cbb6', { cornice: { h: 0.7, d: 0.4 } })),                    // 경상관
      172646938: block(5, office('#e6e4de', { win: WIN.RIBBON })),                                 // 예술관: white, with a glass drum
      172646936: block(5, office(BEIGE, { cornice: { h: 0.9, d: 0.5 }, pilaster: { every: 3, w: 0.7, d: 0.3, from: 1 } })), // 본부관
    }, fallback: k.fallback([() => office(BEIGE), () => office(GREY), () => brick('#a65a47'), () => glass('#7fa3b8')]) };
  },

  soongsil(h) {
    const k = kit(h), { WIN, office, brick, glass, tall } = k, WHITE = '#e8e6e0';
    return { landmarks: {
      // 형남공학관: fifteen-storey white tower with fine vertical fins; its east end is a low hall under a curved roof
      1381653405(b) {
        const tower = h.clipHalf(b.p, [164, 0], [-1, 0]), hall = h.clipHalf(b.p, [164, 0], [1, 0]);
        const st = office(WHITE, { bay: 2.2, floorH: 3.6, groundH: 4.6, cornice: { h: 0.8, d: 0.4 }, parapet: 1.4, pilaster: { every: 1, w: 0.35, d: 0.5, from: 4.6 } });
        const H = tall(15, st), specs = [];
        if (tower.length >= 3) specs.push({ poly: tower, h: H, style: st }, { poly: k.inset(tower, 0.62), minY: H, h: 3.4, style: { ...st, win: WIN.NONE, pilaster: null } });
        if (hall.length >= 3) specs.push({ poly: hall, h: 11, style: office(WHITE, { win: WIN.RIBBON, parapet: 0, cornice: null }), roof: { type: 'vault', h: 4, axis: [1, 0], color: '#e9ebec' } });
        return specs.length ? specs : [{ poly: b.p, h: H, style: st }];
      },
      // 정문: a long dark roof that arches over the steps on slanted concrete legs
      1381653395(b) {
        const o = h.obb(b.p), L = h.frame(o), u = [o.ux, o.uz], N = 12, specs = [], slices = [];
        const archY = (f) => 4.6 + 4.6 * (1 - f * f);
        for (let i = 0; i < N; i++) {
          const t0 = -o.hl + (2 * o.hl * i) / N, t1 = t0 + (2 * o.hl) / N;
          const piece = h.clipHalf(h.clipHalf(b.p, L(t0, 0), u), L(t1, 0), [-u[0], -u[1]]);
          if (piece.length >= 3) slices.push({ piece, f: (t0 + t1) / 2 / o.hl, c: h.centroid(piece) });
        }
        const legs = [];
        for (const want of [-0.72, -0.3, 0.42, 0.78]) {
          const s = slices.reduce((a, q) => (Math.abs(q.f - want) < Math.abs(a.f - want) ? q : a), slices[0]);
          if (!s) continue;
          legs.push(specs.length);
          specs.push({ poly: h.circle(s.c[0], s.c[1], 0.95, 8), h: archY(s.f), style: { wall: '#cbc8c0', trim: '#d9d6cf', win: WIN.NONE } });
        }
        for (const s of slices) specs.push({ poly: s.piece, minY: archY(s.f), h: 0.9, supports: legs, supportSpan: 60, style: { wall: '#4b5056', trim: '#5c6167', roof: '#43474c', win: WIN.NONE } });
        return specs;
      },
      // 안익태기념관: glass upper floors over a grey stone base
      1382013431(b) {
        const base = office('#a9a7a1', { win: WIN.GRID, parapet: 0, cornice: null }), H0 = tall(3, base);
        return [{ poly: b.p, h: H0, style: base }, { poly: b.p, minY: H0, h: 7.8, style: glass('#6d90ae', { floorH: 3.9, groundH: 3.9, plinth: null }) }];
      },
    }, fallback: k.fallback([() => office(WHITE), () => office('#c7c5bf'), () => brick('#a35a47'), () => glass('#7b9fb4')]) };
  },

  sejong(h) {
    const k = kit(h), { WIN, office, brick, glass } = k;
    const RED = '#8c3427', GREEN = '#2f7d6d', TILE = '#3b3f43';
    return { landmarks: {
      // 박물관: stone base with arched openings, a red timber storey and a great tiled roof, facing 아사달 연못
      101293858(b) {
        const base = { wall: '#c8c2b5', trim: '#d9d4c8', win: WIN.ARCH, bay: 4.2, floorH: 4, groundH: 4, cornice: { h: 0.5, d: 0.3 }, plinth: { h: 0.8, d: 0.2, col: '#9f998c' } };
        const wood = { wall: RED, trim: GREEN, win: WIN.GRID, bay: 3, floorH: 3.8, groundH: 3.8, bands: [{ y: 3.1, h: 0.6, d: 0.12 }], pilaster: { every: 1, w: 0.4, d: 0.15, from: 0 } };
        const eave = { wall: GREEN, trim: GREEN, roof: TILE, win: WIN.NONE };
        return [{ poly: b.p, h: 8, style: base },
          { poly: k.inset(b.p, 0.88), minY: 8, h: 3.8, style: wood },
          { poly: k.inset(b.p, 1.04), minY: 11.8, h: 0.45, style: eave, roof: { type: 'hip', h: 2.6, color: TILE } },       // lower eaves
          { poly: k.inset(b.p, 0.6), minY: 12.2, h: 3.4, style: { ...wood, bands: [] } },                                      // upper storey
          { poly: k.inset(b.p, 0.72), minY: 15.6, h: 0.4, style: eave, roof: { type: 'hip', h: 5, color: TILE } }];           // top roof
      },
      // 정문: a hanok gate, red posts under green-painted brackets and a tiled hip-and-gable roof
      9900000001(b) {
        const o = h.obb(b.p), L = h.frame(o), specs = [], cols = [];
        for (const t of [-0.8, -0.27, 0.27, 0.8]) for (const s of [-0.6, 0.6]) {
          const [x, z] = L(t * o.hl, s * o.hw); cols.push(specs.length);
          specs.push({ poly: h.circle(x, z, 0.42, 10), h: 5.6, style: { wall: RED, trim: RED, win: WIN.NONE } });
        }
        specs.push({ poly: h.rectL(L, -o.hl, o.hl, -o.hw * 0.75, o.hw * 0.75), minY: 5.6, h: 1.1, supports: cols, supportSpan: 8, style: { wall: GREEN, trim: '#b8432f', win: WIN.NONE } });
        specs.push({ poly: h.rectL(L, -o.hl - 1.6, o.hl + 1.6, -o.hw - 1.2, o.hw + 1.2), minY: 6.7, h: 0.35, supports: [specs.length - 1], supportSpan: 20,
          style: { wall: GREEN, trim: GREEN, roof: TILE, win: WIN.NONE }, roof: { type: 'hip', h: 3.4, color: TILE } });
        return specs;
      },
      744068665: k.block(4, glass('#7aa6b6', { bay: 2.6 })),                                       // 대양AI센터: glass curtain wall
    }, fallback: k.fallback([() => office('#d9d4c8'), () => brick('#a4573f'), () => office('#c9c6bf', { win: WIN.RIBBON }), () => glass()]) };
  },

  dankook(h) {
    const k = kit(h), { WIN, office, brick, glass, tall } = k, CREAM = '#ece5d4', TAN = '#d4bc98';
    return { landmarks: {
      // 범정관 (대학본부): long cream building with rounded end towers and a dark octagonal dome over its centre
      455430338(b) {
        const o = h.obb(b.p), L = h.frame(o);
        const st = office(CREAM, { trim: '#f6f2e8', bay: 3.2, floorH: 3.8, groundH: 4.6, cornice: { h: 0.8, d: 0.5 }, parapet: 1.0, plinth: { h: 1.2, d: 0.25, col: '#c9c1ae' } });
        const H = tall(5, st), R = Math.min(7, o.hw * 0.6), specs = [{ poly: b.p, h: H, style: st }];
        specs.push({ poly: h.rectL(L, -9, 9, -o.hw * 0.8, o.hw * 0.8), h: H + 3.8, style: st });
        specs.push({ poly: h.circle(o.cx, o.cz, R, 8), minY: H + 3.8, h: 2.4, style: { wall: '#e2dac8', trim: '#eee8db', win: WIN.NONE }, roof: { type: 'dome', h: R * 0.55, color: '#5b3b2b' } });
        for (const s of [-1, 1]) { const [x, z] = L(s * (o.hl - R * 0.9), 0); specs.push({ poly: h.circle(x, z, R * 0.95, 16), h: H + 3.8, style: st }); }
        return specs;
      },
      455430339: k.block(6, office('#e9e8e3', { cornice: { h: 0.8, d: 0.5 } })),                  // 퇴계기념중앙도서관: white with glass stairs
      825154288: k.block(6, office(TAN, { win: WIN.BRICK })),                                       // 인문관: tan brick
      825154287: k.block(6, office(TAN, { win: WIN.BRICK })),                                       // 상경관
      825154286: k.block(6, office(TAN, { win: WIN.BRICK })),                                       // 사범관
    }, fallback: k.fallback([() => office(CREAM), () => office(TAN, { win: WIN.BRICK }), () => office('#d9d5cc'), () => glass('#86a6b1')]) };
  },
};
