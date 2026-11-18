// 연세대학교 신촌캠퍼스: ivy-covered stone halls around 언더우드 동산, tan stone along 백양로.
import { collegiate } from './models-korea.js?v=61';

export function yonseiCampus(h) {
  const { WIN, obb, frame, rectL, centroid, area, circle } = h;

  const SLATE = '#4a4c50', IVY = '#77825e', OLD = '#a39a86', TAN = '#c8b89e', PALE = '#d8d2c5';
  const stone = (o = {}) => ({ wall: IVY, trim: '#c9c4b6', roof: SLATE, win: WIN.RUBBLE, bay: 3.3, floorH: 4.0, groundH: 4.6,
    cornice: { h: 0.45, d: 0.3 }, plinth: { h: 1.0, d: 0.2, col: '#8d887b' }, ...o });
  const modern = (wall, o = {}) => ({ wall, trim: '#ebe7dd', roof: '#7d7f82', win: WIN.GRID, bay: 3.2, floorH: 3.8, groundH: 4.6,
    cornice: { h: 0.5, d: 0.3 }, parapet: 1.0, plinth: { h: 0.9, d: 0.2, col: '#a39f94' }, ...o });
  const tall = (floors, st) => st.groundH + (Math.max(floors, 1) - 1) * st.floorH;
  const { hall } = collegiate(h, { stone, roof: SLATE, merlon: IVY, trim: '#c9c4b6' });
  const block = (floors, st) => (b) => [{ poly: b.p, h: tall(floors, st), style: st }];

  const landmarks = {
    246156115: (b) => hall(b, { floors: 3, towerH: 25, towerW: 10, face: [0, 1] }),          // 언더우드관
    246156116: (b) => hall(b, { floors: 3, dormers: false }),                                // 아펜젤러관
    246156118: (b) => hall(b, { floors: 2, dormers: false }),                                // 스팀슨관
    256933753: (b) => hall(b, { floors: 3, dormers: false, st: stone({ wall: OLD }) }),      // 백양관
    246156113: (b) => hall(b, { floors: 3, dormers: false, st: stone({ wall: OLD }) }),      // 핀슨관
    246156121: (b) => hall(b, { floors: 3, dormers: false, st: stone({ wall: OLD }) }),      // 신학관

    // 중앙도서관: grey stone with full-height arched window bays
    163525865: block(1, modern('#bcb8ae', { win: WIN.ARCH, floorH: 23, groundH: 23, bay: 7, cornice: { h: 1.2, d: 0.5 }, parapet: 0.6 })),
    224955922: block(5, modern('#7f9fb0', { win: WIN.CURTAIN, bay: 2.4 })),                  // 연세삼성학술정보관
    218430716: block(6, modern(TAN, { win: WIN.GRID, cornice: { h: 0.9, d: 0.6 } })),         // 공학원

    // 백주년기념관: a beige stone drum on a broad base
    324328422(b) {
      const [cx, cz] = centroid(b.p), inner = b.p.map(([x, z]) => [cx + (x - cx) * 0.86, cz + (z - cz) * 0.86]);
      const st = modern('#cdb893', { win: WIN.NONE, cornice: { h: 0.7, d: 0.4 }, parapet: 0 });
      return [{ poly: b.p, h: 9, style: { ...st, win: WIN.GRID, floorH: 4.5, groundH: 4.5, bay: 4 } }, { poly: inner, minY: 9, h: 11, style: { ...st, plinth: null } }];
    },

    // 루스채플: stone chapel with a steep roof and slim spire
    429249499(b) {
      const o = obb(b.p), L = frame(o), st = stone({ wall: OLD, win: WIN.GOTHIC, floorH: 8, groundH: 8, bay: 3.4 });
      return [{ poly: rectL(L, -o.hl, o.hl, -o.hw, o.hw), h: 9, style: st, roof: { type: 'gable', h: Math.min(o.hw * 0.9, 8), axis: [o.ux, o.uz], color: SLATE } },
        { poly: circle(...L(o.hl - 2.5, 0), 1.5, 8), minY: 9, h: 7, style: { wall: OLD, trim: '#c9c4b6', win: WIN.NONE }, roof: { type: 'pyramid', h: 5, color: SLATE } }];
    },

    // 대강당: tall plain hall
    371403811: (b) => [{ poly: b.p, h: 19, style: modern(TAN, { win: WIN.ARCH, floorH: 12, groundH: 12, bay: 6 }), roof: { type: 'hip', h: 2.6, color: '#6d7276' } }],

    // 정문 기념물: paired stone slabs with a navy plaque on a low wall
    9400000001(b) {
      const o = obb(b.p), L = frame(o), st = { wall: '#b9b3a6', trim: '#cec9bd', win: WIN.NONE, plinth: { h: 0.5, d: 0.2, col: '#8d887b' } };
      return [{ poly: rectL(L, -o.hl, o.hl, -0.5, 0.5), h: 1.2, style: st }, { poly: rectL(L, -2.8, -1.5, -0.8, 0.8), h: 6.5, style: st }, { poly: rectL(L, 1.5, 2.8, -0.8, 0.8), h: 6.5, style: st },
        { poly: rectL(L, -1.5, 1.5, -0.35, 0.35), minY: 3, h: 2.6, supports: [1, 2], supportSpan: 6, style: { wall: '#123f82', trim: '#1b4f9c', win: WIN.NONE } }];
    },
  };

  function fallback(b, rnd) {
    const ar = Math.abs(area(b.p)), floors = Math.max(b.lv || 1, 1);
    if (b.k === 'bridge') return [{ poly: b.p, minY: 6, h: 3.6, style: modern('#90aab2', { win: WIN.CURTAIN, plinth: null, parapet: 0, bay: 2.5, floorH: 3.6, groundH: 3.6 }) }];
    if (['roof', 'service', 'greenhouse', 'shed'].includes(b.k) || ar < 60) return [{ poly: b.p, h: 4, style: modern('#bdb9ae', { win: WIN.NONE, plinth: null, parapet: 0 }) }];
    if (b.k === 'dormitory') { const st = modern('#e3ddd0', { win: WIN.APART, floorH: 3.2 }); return [{ poly: b.p, h: tall(floors, st), style: st }]; }
    const st = modern([TAN, '#bfae95', PALE, '#b99f83'][Math.floor(rnd() * 4)], { win: rnd() < 0.15 ? WIN.CURTAIN : WIN.GRID, pilaster: ar > 800 ? { every: 3, w: 0.7, d: 0.3, from: 1 } : null });
    return [{ poly: b.p, h: tall(floors, st), style: st }];
  }

  return { landmarks, fallback };
}
