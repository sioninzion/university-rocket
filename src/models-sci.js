// 카이스트·디지스트와 '광명상가가'(광운대·명지대 인문캠·상명대 서울캠·가톨릭대 성심교정·가천대 글로벌캠):
// landmarks keyed by OSM id, plus each campus's palette for the buildings without a hand-made model.
import { kit } from './models-seoul.js?v=95';

export const sciCampuses = {
  // 한국과학기술원 (대전): pale concrete and glass research blocks around 오리연못
  kaist(h) {
    const k = kit(h), { WIN, office, brick, glass, tall } = k, PALE = '#d9d6ce', GREY = '#b8bbbd';
    return { landmarks: {
      // 학술문화관 (E9): grey stone library halls by the pond, a long glass atrium under a ribbed sloping roof down its spine
      1215432908(b) {
        const o = h.obb(b.p), L = h.frame(o), st = office(GREY, { win: WIN.RIBBON, bay: 3.2, floorH: 4, groundH: 5, cornice: { h: 0.8, d: 0.4 } }), H = tall(4, st);
        const W = Math.min(o.hw * 0.35, 7);
        return [{ poly: b.p, h: H, style: st },
          { poly: h.rectL(L, -o.hl * 0.92, o.hl * 0.92, -W, W), minY: H, h: 2.5, supports: [0], supportSpan: 40, style: glass('#5d7d92', { plinth: null, parapet: 0, cornice: null }),
            roof: { type: 'gable', h: 4.5, axis: [o.ux, o.uz], color: '#47596a' } }];
      },
      // 홍&박 KI빌딩 (E4): white and glass square block around a glass pyramid over its atrium
      687286872(b) {
        const o = h.obb(b.p), L = h.frame(o), st = office('#e6e5e1', { win: WIN.CURTAIN, bay: 3, floorH: 4, groundH: 5, cornice: { h: 0.9, d: 0.5 } }), H = tall(5, st);
        const r = Math.min(o.hl, o.hw) * 0.55;
        return [{ poly: b.p, h: H, style: st },
          { poly: h.rectL(L, -r, r, -r, r), minY: H, h: 1.2, supports: [0], supportSpan: 40, style: glass('#7fa6bd', { plinth: null, parapet: 0, cornice: null }),
            roof: { type: 'pyramid', h: r * 0.8, color: '#86acc2' } }];
      },
      // 본관 (E14): three-storey pale block with a tall glass entrance hall in the middle of its long side
      49931915(b) {
        const st = office(PALE, { cornice: { h: 1, d: 0.6 }, pilaster: { every: 2, w: 0.7, d: 0.3, from: 1 }, floorH: 4, groundH: 4.8 });
        return k.entranceHall(b, { floors: 3, st, face: [0.55, 0.83], extra: 1.5, width: 14, entry: glass('#6f93ab', { parapet: 0 }) });
      },
      // 대강당 (E15): auditorium under a low barrel roof
      78058751(b) {
        const o = h.obb(b.p);
        return [{ poly: b.p, h: 15, style: office(PALE, { win: WIN.NONE, bay: 4, pilaster: { every: 1, w: 0.8, d: 0.4, from: 0 } }), roof: { type: 'vault', h: 5, axis: [o.ux, o.uz], color: '#8b9196' } }];
      },
      // 정문술빌딩 (E16): curved glass research tower
      78058752: (b) => [{ poly: b.p, h: 38, style: glass('#7d9db3', { floorH: 3.8, groundH: 5, cornice: { h: 0.8, d: 0.4 } }) }],
    }, fallback: k.fallback([() => office(PALE), () => office('#c9c6be', { win: WIN.RIBBON }), () => brick('#a5583f'), () => glass('#7f9fb4'), () => office(GREY)]) };
  },

  // 대구경북과학기술원 (달성): white and grey labs joined by a long glass spine, on the 비슬산 foothills
  dgist(h) {
    const k = kit(h), { WIN, office, glass, tall } = k, WHITE = '#e5e5e1';
    return { landmarks: {
      // E8 학술정보관: a glass drum with white floor rings in front of the teaching complex
      1570040591(b) {
        const o = h.obb(b.p), L = h.frame(o), n = 20, specs = [];
        const ring = Array.from({ length: n }, (_, i) => L(Math.cos(i / n * Math.PI * 2) * o.hl * 0.95, Math.sin(i / n * Math.PI * 2) * o.hw * 0.95));
        const st = glass('#6f98b6', { bay: 2.6, floorH: 4, groundH: 5, bands: [5, 9, 13, 17, 21].map((y) => ({ y, h: 0.5, d: 0.35 })), cornice: { h: 1.4, d: 1.2 }, parapet: 0 });
        specs.push({ poly: ring, h: tall(6, st), style: st, roof: { type: 'dome', h: 2.5, color: '#d9dcde' } });
        return specs;
      },
      // 강의동 (E1~E7): teaching wings either side of a long glass spine
      1570028674(b) {
        const st = office(WHITE, { win: WIN.RIBBON, bay: 3.2, floorH: 3.9, groundH: 4.8, cornice: { h: 0.7, d: 0.4 } });
        return [{ poly: b.p, h: tall(5, st), style: st }];
      },
      1570047432: k.block(5, glass('#7c9cb1', { cornice: { h: 0.8, d: 0.5 } })),                  // 연구행정동
      9110000001: k.block(4, office('#d0d1cf', { win: WIN.GRID, cornice: { h: 0.8, d: 0.4 } })), // 학사 건물
    }, fallback: k.fallback([() => office(WHITE, { win: WIN.RIBBON }), () => glass('#7d9bb0'), () => office('#c9ccce'), () => office('#d8d3c6')]) };
  },

  // 광운대학교 (월계동): dark red brick towers and an older stone main hall
  kw(h) {
    const k = kit(h), { WIN, office, brick, glass, tall } = k, RED = '#9b4d3b', STONE = '#cfc8b8';
    return { landmarks: {
      // 화도관: the oldest hall, pale dressed stone, five storeys with a tower over the entrance facing the plaza
      168287589(b) {
        const st = office(STONE, { win: WIN.CLASSIC, trim: '#ece7dc', bay: 3.2, floorH: 3.8, groundH: 4.6, cornice: { h: 0.9, d: 0.5 },
          pilaster: { every: 2, w: 0.8, d: 0.3, from: 1 }, plinth: { h: 1.4, d: 0.25, col: '#a8a192' } });
        const H = tall(5, st), specs = [{ poly: b.p, h: H, style: st }];
        const e = h.facingSpan(b.p, -0.66, 0.75);
        if (e) {
          const P = k.onEdge(e), m = e.L / 2, i = specs.length;
          specs.push({ poly: [P(m - 5, 2), P(m + 5, 2), P(m + 5, -7), P(m - 5, -7)], h: H + 9, style: { ...st, bay: 2.4 } });
          specs.push({ poly: [P(m - 4, 1.2), P(m + 4, 1.2), P(m + 4, -6.2), P(m - 4, -6.2)], minY: H + 9, h: 2.5, supports: [i], supportSpan: 12,
            style: { ...st, win: WIN.NONE, pilaster: null }, roof: { type: 'pyramid', h: 4, color: '#5b6166' } });
        }
        return specs;
      },
      // 비마관: nine-storey red brick block, its top floor set back
      168284890(b) {
        const st = brick(RED, { floorH: 3.7, groundH: 4.6, cornice: { h: 0.7, d: 0.4 } }), H = tall(8, st);
        return [{ poly: b.p, h: H, style: st }, { poly: k.inset(b.p, 0.82), minY: H, h: 4, supports: [0], supportSpan: 40, style: { ...st, plinth: null } }];
      },
      // 80주년기념관: glass hall over the sunken plaza
      755371572: k.block(4, glass('#6f97b3', { cornice: { h: 0.9, d: 0.6 } })),
      804460197: k.block(10, office('#e2dfd8', { win: WIN.RIBBON, cornice: { h: 0.8, d: 0.4 } })), // 참빛관
      168286643: k.block(9, brick('#a55a46')),                                                       // 새빛관
    }, fallback: k.fallback([() => brick(RED), () => brick('#a8604b'), () => office(STONE), () => glass('#7c9db2')]) };
  },

  // 명지대학교 인문캠퍼스 (남가좌동): beige stone halls packed on a hillside
  mju(h) {
    const k = kit(h), { WIN, office, brick, glass, tall } = k, BEIGE = '#d8cfbe';
    return { landmarks: {
      // 방목학술정보관: square library in warm stone with a glass skylight over its central reading court
      462990139(b) {
        const o = h.obb(b.p), L = h.frame(o), st = office('#c9b9a0', { bay: 3, floorH: 4, groundH: 5, cornice: { h: 1, d: 0.5 }, pilaster: { every: 2, w: 0.8, d: 0.35, from: 1 } }), H = tall(5, st);
        const r = Math.min(o.hl, o.hw) * 0.45;
        return [{ poly: b.p, h: H, style: st },
          { poly: h.rectL(L, -r, r, -r, r), minY: H, h: 1.4, supports: [0], supportSpan: 40, style: glass('#86abc0', { plinth: null, parapet: 0, cornice: null }), roof: { type: 'pyramid', h: r * 0.6, color: '#90b3c6' } }];
      },
      // MCC관: a new hall dug into the slope, its roof the campus sports field
      1127358152: (b) => [{ poly: b.p, h: 9, style: office('#c4c0b6', { win: WIN.CURTAIN, roof: '#4f8a3f', parapet: 1.2, cornice: { h: 0.6, d: 0.3 } }) }],
      462990140: (b) => k.entranceHall(b, { floors: 5, st: office(BEIGE, { cornice: { h: 0.9, d: 0.5 } }), face: [0.8, 0.6], width: 10 }), // 행정동
      462990137: k.block(5, office('#cfc6b5', { win: WIN.RIBBON, cornice: { h: 0.7, d: 0.4 } })),     // 종합관
      462990141: k.block(5, brick('#a35b45')),                                                        // 학생회관
    }, fallback: k.fallback([() => office(BEIGE), () => brick('#a35b45'), () => office('#c2c0b8', { win: WIN.RIBBON }), () => glass('#7e9fb3')]) };
  },

  // 상명대학교 서울캠퍼스 (홍지동): halls terraced up the slope under 북악산
  smu(h) {
    const k = kit(h), { WIN, office, brick, glass, tall } = k;
    return { landmarks: {
      // 미래백년관: newest hall, stone lower floors and a glass upper block stepped back toward the hill
      698228420(b) {
        const low = office('#cbc4b6', { bay: 3.2, floorH: 4, groundH: 5, parapet: 1.2, cornice: { h: 0.8, d: 0.4 } }), H = tall(4, low);
        return [{ poly: b.p, h: H, style: low },
          { poly: k.inset(b.p, 0.8), minY: H, h: 8, supports: [0], supportSpan: 40, style: glass('#6f95b0', { floorH: 4, groundH: 4, plinth: null, cornice: { h: 0.9, d: 0.6 } }) }];
      },
      // 상명아트센터 (문화예술관): concert hall under a curved roof
      463336783(b) {
        const o = h.obb(b.p);
        return [{ poly: b.p, h: 16, style: office('#d9d5cc', { win: WIN.RIBBON, bay: 4, cornice: { h: 0.6, d: 0.3 } }), roof: { type: 'vault', h: 6, axis: [o.ux, o.uz], color: '#9aa1a6' } }];
      },
      463336788: k.block(5, glass('#7c9fb6', { cornice: { h: 0.8, d: 0.5 } })),       // 밀레니엄관
      463336790: k.block(5, brick('#a65d47', { cornice: { h: 0.8, d: 0.4 } })),       // 학술정보관
    }, fallback: k.fallback([() => office('#d8d4cb'), () => brick('#a35b45'), () => glass('#7f9fb2'), () => office('#c7c2b6')]) };
  },

  // 가톨릭대학교 성심교정 (부천 역곡): red brick halls and a small round chapel
  cuk(h) {
    const k = kit(h), { WIN, office, brick, glass, tall } = k, RED = '#9c5040', CREAM = '#e2ddd0';
    return { landmarks: {
      // 김수환추기경국제관: red brick block by the gate, a glass stair hall on its corner
      343596941(b) {
        const st = brick(RED, { floorH: 3.8, groundH: 4.8, cornice: { h: 0.8, d: 0.45 } }), H = tall(5, st), specs = [{ poly: b.p, h: H, style: st }];
        const e = h.facingSpan(b.p, 0.7, -0.71);
        if (e) {
          const P = k.onEdge(e), m = e.L / 2;
          specs.push({ poly: [P(m - 6, 2), P(m + 6, 2), P(m + 6, -6), P(m - 6, -6)], h: H + 4, style: glass('#7aa0b8', { parapet: 0, cornice: { h: 0.8, d: 0.5 } }) });
        }
        return specs;
      },
      // 니콜스관: cream main hall under a dark hipped roof
      343597087: (b) => [{ poly: b.p, h: tall(4, office(CREAM)), style: office(CREAM, { win: WIN.CLASSIC, parapet: 0, cornice: { h: 0.6, d: 0.6 } }), roof: { type: 'hip', h: 4, color: '#4c4f55' } }],
      // 예수성심성당: an octagonal chapel with a tall pointed roof and a slim spire
      278736792(b) {
        const [cx, cz] = h.centroid(b.p), o = h.obb(b.p), r = Math.min(o.hl, o.hw) * 0.95;
        const st = brick(RED, { win: WIN.GOTHIC, bay: 2.4, floorH: 9, groundH: 9, parapet: 0, cornice: { h: 0.4, d: 0.3 } });
        return [{ poly: h.circle(cx, cz, r, 8), h: 9, style: st, roof: { type: 'dome', h: r * 0.9, color: '#5a5f63' } },
          { poly: h.circle(cx, cz, 0.7, 6), minY: 9 + r * 0.85, h: 6, supports: [0], supportSpan: 20, style: { wall: '#e8e4dc', trim: '#e8e4dc', win: WIN.NONE }, roof: { type: 'pyramid', h: 2.5, color: '#e8e4dc' } }];
      },
      278736790: k.block(5, brick('#a8604a', { cornice: { h: 0.8, d: 0.4 } })),       // 베리타스관 (중앙도서관)
    }, fallback: k.fallback([() => brick(RED), () => office(CREAM), () => brick('#a8604a'), () => glass('#7f9fb2')]) };
  },

  // 가천대학교 글로벌캠퍼스 (성남): white towers and glass on the hill above 가천대역
  gachon(h) {
    const k = kit(h), { WIN, office, glass, tall } = k, WHITE = '#e4e3de';
    return { landmarks: {
      // 가천관: twelve-storey white tower with a glass front and a crown frame on its roof
      1041736196(b) {
        const st = office(WHITE, { win: WIN.CURTAIN, bay: 2.6, floorH: 4, groundH: 5.5, pilaster: { every: 1, w: 0.45, d: 0.5, from: 5.5 }, cornice: { h: 1, d: 0.5 } });
        const H = tall(12, st), o = h.obb(b.p), L = h.frame(o);
        return [{ poly: b.p, h: H, style: st },
          { poly: h.rectL(L, -o.hl * 0.6, o.hl * 0.6, -o.hw * 0.5, o.hw * 0.5), minY: H, h: 6, supports: [0], supportSpan: 40, style: office('#d4d6d8', { win: WIN.NONE, parapet: 1.5, plinth: null }) }];
      },
      // 비전타워: the two glass wings either side of the great open stairway from the station plaza
      13941206: (b) => [{ poly: b.p, h: 22, style: glass('#6c93ae', { bay: 3, floorH: 4.4, groundH: 5, cornice: { h: 1.2, d: 0.8 }, parapet: 1.4 }) }],
      1041736203: k.block(7, office('#d9dad6', { win: WIN.RIBBON, cornice: { h: 0.8, d: 0.4 } })), // 전자정보도서관
      1041755558: k.block(7, glass('#7d9fb5', { cornice: { h: 0.8, d: 0.5 } })),                   // 중앙도서관
    }, fallback: k.fallback([() => office(WHITE), () => glass('#7fa1b6'), () => office('#c9c7c1', { win: WIN.RIBBON }), () => office('#d9cfbf')]) };
  },
};
