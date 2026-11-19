// Branch campuses of the universities already in the game (경희대 서울, 연세대 송도 ...).
// Landmarks are modelled from photos where Commons has them; otherwise each campus only gets its palette.
import { kit } from './models-seoul.js?v=81';

export const branchCampuses = {
  // 경희대학교 서울캠퍼스: grey granite gothic 평화의전당, white neoclassical 본관
  khus(h) {
    const k = kit(h), { WIN, office, brick, glass, tall } = k, GRANITE = '#bab4a7', SLATE = '#4f5b55';
    const stone = (o = {}) => ({ wall: GRANITE, trim: '#d2cdc2', roof: SLATE, win: WIN.GOTHIC, bay: 3.4, floorH: 6, groundH: 7,
      cornice: { h: 0.6, d: 0.3 }, plinth: { h: 1.4, d: 0.3, col: '#958f83' }, ...o });
    return { landmarks: {
      // 평화의전당: a cathedral-sized hall, twin pinnacled towers on the south-south-west front
      261207462(b) {
        const o = h.obb(b.p), specs = [{ poly: b.p, h: 30, style: stone(), roof: { type: 'gable', h: 13, axis: [o.ux, o.uz], color: SLATE } }];
        const e = h.facingSpan(b.p, -0.2, 0.98);
        if (!e) return specs;
        const P = k.onEdge(e), q = (a, c, d0, d1) => [P(a, d0), P(c, d0), P(c, d1), P(a, d1)], T = 58;
        for (const f of [0.2, 0.8]) {
          const t = e.L * f, i = specs.length;
          specs.push({ poly: q(t - 7, t + 7, 1.5, -12), h: T, style: stone({ bay: 2.6 }) });
          for (const [a, d] of [[-6, 0.5], [6, 0.5], [-6, -11], [6, -11]]) specs.push({ poly: h.circle(...P(t + a, d), 0.9, 6), minY: T, h: 7, supports: [i], supportSpan: 20, style: stone({ win: WIN.NONE, plinth: null }), roof: { type: 'pyramid', h: 2.5, color: '#9a9488' } });
          specs.push({ poly: q(t - 3.5, t + 3.5, -2, -9), minY: T, h: 4, supports: [i], supportSpan: 20, style: stone({ win: WIN.NONE, plinth: null }), roof: { type: 'pyramid', h: 9, color: SLATE } });
        }
        specs.push({ poly: q(e.L * 0.2 + 7, e.L * 0.8 - 7, 1, -10), h: 40, style: stone({ win: WIN.ARCH, bay: 5, floorH: 20, groundH: 20 }), roof: { type: 'gable', h: 9, axis: [e.nx, e.nz], color: SLATE } });
        return specs;
      },
      // 본관: white neoclassical block behind a giant colonnade, facing the fountain plaza
      286601680(b) {
        const st = h.classical({ wall: '#eceae3', floorH: 4.4, groundH: 5 }), H = 22, specs = [{ poly: b.p, h: H, style: st }];
        const e = h.facingSpan(b.p, 0.28, 0.96);
        if (e) {
          const W = e.L * 0.62, c = h.colonnade(specs, { a: k.onEdge(e)((e.L - W) / 2, 0), L: W, nx: e.nx, nz: e.nz, ux: e.ux, uz: e.uz }, { offset: 5, spacing: 4.4, r: 0.85, h: 20, pad: 1.5, entab: 2.2 });
          specs[c.entab].roof = { type: 'gable', h: 4, axis: [e.nx, e.nz], color: '#dcd9d1' };
        }
        return specs;
      },
    }, fallback: k.fallback([() => office(GRANITE, { win: WIN.RUBBLE }), () => office('#d8d4ca'), () => office('#c9c5bb', { win: WIN.RIBBON }), () => brick('#a35a46')]) };
  },

  // 성균관대학교 자연과학캠퍼스 (수원)
  skkun(h) {
    const k = kit(h), { WIN, office, brick, glass, tall } = k;
    return { landmarks: {
      // 삼성학술정보관: the oval library at the head of 글로벌 광장, under a low silver dome
      3571072(b) {
        const st = office('#cfd1d2', { win: WIN.RIBBON, cornice: { h: 0.8, d: 0.6 }, parapet: 0.6 });
        return [{ poly: b.p, h: tall(5, st), style: st, roof: { type: 'dome', h: 7, color: '#c3c9cd' } }];
      },
    }, fallback: k.fallback([() => office('#d9d7d1'), () => office('#c4c2bb', { win: WIN.RIBBON }), () => brick('#9c5a46'), () => glass('#7f9fb0')]) };
  },

  // 고려대학교 세종캠퍼스: grey granite blocks with vertical stone fins
  koreas(h) {
    const k = kit(h), { WIN, office, glass } = k, GRANITE = '#aaa69d';
    const fins = (o = {}) => office(GRANITE, { bay: 2.6, pilaster: { every: 1, w: 0.5, d: 0.45, from: 1 }, cornice: { h: 0.8, d: 0.4 }, ...o });
    return { landmarks: {
      434752711: k.block(5, fins()),                                                          // 학술정보원
    }, fallback: k.fallback([() => fins(), () => office('#bdb9b0'), () => office('#d6d3cb', { win: WIN.RIBBON }), () => glass('#86a3ae')]) };
  },

  // 연세대학교 국제캠퍼스 (송도): grey and glass blocks around long plazas
  yonseii(h) {
    const k = kit(h), { WIN, office, glass } = k;
    return { landmarks: {
      // 언더우드 기념도서관: grey box with dark glass bands at the end of the central plaza
      377561220: k.block(7, office('#9aa1a5', { win: WIN.RIBBON, cornice: { h: 1, d: 0.5 }, parapet: 1.2 })),
    }, fallback: k.fallback([() => office('#c6c9cb'), () => glass('#7f9db2'), () => office('#dcdcd8', { win: WIN.RIBBON }), () => office('#a9adb0')]) };
  },

  // 연세대학교 미래캠퍼스 (원주): red brick halls with glass entrances
  yonseiw(h) {
    const k = kit(h), { WIN, office, brick, glass } = k;
    return { landmarks: {
      577094636: k.block(5, brick('#9b4f3b', { cornice: { h: 0.8, d: 0.4 } })),               // 대학본부
    }, fallback: k.fallback([() => brick('#9b4f3b'), () => brick('#a85e47'), () => glass('#6f8fa5'), () => office('#d6d2c8')]) };
  },

  // 서울대학교 연건캠퍼스: hospital towers around the 1908 대한의원
  snuy(h) {
    const k = kit(h), { WIN, office, brick, glass } = k;
    return { landmarks: {
      // 대한의원: red brick and white trim, a clock tower with a dark baroque cupola over the south front
      614138825(b) {
        const red = brick('#a14f3c', { win: WIN.CLASSIC, trim: '#efe9dc', floorH: 4.6, groundH: 5, cornice: { h: 0.6, d: 0.35 }, parapet: 0 });
        const specs = [{ poly: b.p, h: 9.6, style: red, roof: { type: 'hip', h: 4, color: '#4a4f55' } }];
        const e = h.facingSpan(b.p, 0, 1);
        if (e) {
          const P = k.onEdge(e), m = e.L / 2, i = specs.length;
          specs.push({ poly: [P(m - 3.8, 2), P(m + 3.8, 2), P(m + 3.8, -6), P(m - 3.8, -6)], h: 21, style: { ...red, bay: 2.5 } });
          const [x, z] = P(m, -2);
          specs.push({ poly: h.circle(x, z, 3, 12), minY: 21, h: 3, supports: [i], supportSpan: 12, style: { wall: '#efe9dc', trim: '#f6f2ea', win: WIN.NONE }, roof: { type: 'dome', h: 3.6, color: '#2f3a36' } });
          specs.push({ poly: h.circle(x, z, 0.8, 8), minY: 27.6, h: 2.2, supports: [i], supportSpan: 12, style: { wall: '#2f3a36', trim: '#2f3a36', win: WIN.NONE } });
        }
        return specs;
      },
    }, fallback: k.fallback([() => office('#e4e1d9'), () => office('#cfc8b8'), () => glass('#8aa7b4'), () => brick('#a3573f')]) };
  },

  // 한양대학교 ERICA캠퍼스 (안산)
  erica(h) {
    const k = kit(h), { WIN, office, brick, glass } = k;
    return { landmarks: {
      367537518: k.block(5, office('#d6d2c7', { cornice: { h: 0.9, d: 0.5 } })),            // ERICA학술정보관
    }, fallback: k.fallback([() => office('#d8d4c9'), () => brick('#a65d48'), () => office('#cfd0cc', { win: WIN.RIBBON }), () => glass()]) };
  },

  // 한국외국어대학교 글로벌캠퍼스 (용인): red brick on a mountain ridge
  hufsg(h) {
    const k = kit(h), { WIN, office, brick, glass, tall } = k, RED = '#9a4a36';
    return { landmarks: {
      // 학생회관: symmetrical red brick front, two octagonal towers either side of a tall arched glass entrance
      468432116(b) {
        const st = brick(RED, { trim: '#e3dacb', floorH: 3.9, groundH: 4.6, cornice: { h: 0.7, d: 0.4 } }), H = tall(4, st), specs = [{ poly: b.p, h: H, style: st }];
        const e = h.facingSpan(b.p, -0.68, -0.74);
        if (e) {
          const P = k.onEdge(e), m = e.L / 2;
          for (const s of [-1, 1]) { const [x, z] = P(m + s * 9, -1.5); specs.push({ poly: h.circle(x, z, 3.4, 8), h: H + 9, style: { ...st, bay: 2.2 }, roof: { type: 'pyramid', h: 3.5, color: '#3f4448' } }); }
          specs.push({ poly: [P(m - 5, 1), P(m + 5, 1), P(m + 5, -3), P(m - 5, -3)], h: H + 3, style: glass('#7ea3b8', { bay: 2, plinth: null, parapet: 0 }), roof: { type: 'gable', h: 3, axis: [e.nx, e.nz], color: '#e3dacb' } });
        }
        return specs;
      },
      // 도서관: red brick with a pale drum at its west end
      468432115(b) {
        const o = h.obb(b.p), st = brick(RED, { trim: '#e3dacb' }), H = tall(5, st), s = o.ux > 0 ? -1 : 1, [x, z] = h.frame(o)(s * o.hl, 0);
        return [{ poly: b.p, h: H, style: st }, { poly: h.circle(x, z, 8, 18), h: H + 2, style: office('#e4e2dc', { win: WIN.RIBBON, parapet: 0, cornice: { h: 1.2, d: 1.4 } }) }];
      },
    }, fallback: k.fallback([() => brick(RED), () => brick('#a85b45'), () => office('#d9d5cb'), () => glass('#7f9fb2')]) };
  },

  // 건국대학교 글로컬캠퍼스 (충주)
  konkukg(h) {
    const k = kit(h), { WIN, office, brick, glass } = k;
    return { landmarks: {
      362323470: k.block(5, office('#d5cfc2', { cornice: { h: 0.9, d: 0.5 } })),            // 중원도서관
    }, fallback: k.fallback([() => office('#dcd8cd'), () => brick('#a7634e'), () => office('#c7c9c6', { win: WIN.RIBBON }), () => glass()]) };
  },

  // 홍익대학교 세종캠퍼스
  hongiks(h) {
    const k = kit(h), { WIN, office, glass } = k;
    return { landmarks: {
      477809324: k.block(5, office('#cfccc4', { win: WIN.RIBBON, cornice: { h: 0.8, d: 0.4 } })), // 문정도서관
    }, fallback: k.fallback([() => office('#d3d0c8'), () => office('#dedbd3'), () => office('#c8c6be', { win: WIN.RIBBON }), () => glass('#86a4ae')]) };
  },

  // 단국대학교 천안캠퍼스: cream terraces on the hill above 천호지
  dankookc(h) {
    const k = kit(h), { WIN, office, brick, glass } = k, CREAM = '#ebe6da';
    return { landmarks: {
      171904158: k.block(6, office(CREAM, { cornice: { h: 1, d: 0.6 }, pilaster: { every: 3, w: 0.7, d: 0.3, from: 1 } })), // 율곡기념도서관
    }, fallback: k.fallback([() => office(CREAM), () => office('#d6cfbf'), () => brick('#a6634c'), () => glass('#86a6b1')]) };
  },
};
