// Detailed remodels: every campus gets at least three buildings worked out part by part, like 경희대 국제캠
// 중앙도서관 or 성균관대 자과캠 삼성학술정보관 — entrance porticoes and canopies on columns, flights of steps,
// framed doors, stair towers, glass entrance halls, set-back top floors, skylights, flagpoles and roof plant.
// An entry either dresses up a campus's existing hand-made model (keep: the earlier parts stay, the details are
// added around them) or builds the whole building in one of the looks below.
import { kit } from './models-seoul.js?v=98';

function pip(p, x, z) {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const a = p[i], b = p[j];
    if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}

export function detailKit(h) {
  const k = kit(h), { WIN, office, brick, glass, tall } = k;
  const STONE = (c = '#d3cec4') => ({ wall: c, trim: '#e2ded6', roof: c, win: WIN.NONE, cornice: { h: 0.3, d: 0.15 } });
  const DARK = { wall: '#24303a', trim: '#5e6a72', roof: '#30383f', win: WIN.NONE };
  const METAL = { wall: '#a9adb0', trim: '#babdc0', roof: '#9fa3a6', win: WIN.NONE };

  const LOOKS = {
    stone: (c = '#cfc8b8') => office(c, { win: WIN.CLASSIC, trim: '#e6e1d6', bay: 3.2, floorH: 4, groundH: 4.8, cornice: { h: 1, d: 0.6 },
      pilaster: { every: 2, w: 0.8, d: 0.32, from: 1.4 }, plinth: { h: 1.4, d: 0.3, col: '#a8a192' }, bands: [{ y: 4.8, h: 0.4, d: 0.2 }] }),
    granite: (c = '#aeaaa1') => office(c, { bay: 2.6, floorH: 3.9, groundH: 4.8, cornice: { h: 0.9, d: 0.45 }, pilaster: { every: 1, w: 0.5, d: 0.45, from: 1 },
      plinth: { h: 1.2, d: 0.25, col: '#8f8b82' } }),
    white: (c = '#e7e6e1') => office(c, { bay: 3.2, floorH: 3.8, groundH: 4.8, cornice: { h: 0.7, d: 0.4 }, plinth: { h: 1, d: 0.2, col: '#bcbab4' } }),
    concrete: (c = '#c3c2bc') => office(c, { win: WIN.RIBBON, bay: 3.4, floorH: 3.8, groundH: 4.6, cornice: { h: 0.6, d: 0.5 } }),
    fins: (c = '#e3e1db') => office(c, { bay: 2.2, floorH: 3.8, groundH: 4.8, pilaster: { every: 1, w: 0.35, d: 0.55, from: 4.8 }, cornice: { h: 0.8, d: 0.4 } }),
    brick: (c = '#a2563f') => brick(c, { floorH: 3.8, groundH: 4.6, cornice: { h: 0.7, d: 0.4 }, bands: [{ y: 4.6, h: 0.35, d: 0.15 }] }),
    glass: (c = '#7a9db4') => glass(c, { floorH: 3.9, groundH: 5, cornice: { h: 0.8, d: 0.5 }, pilaster: { every: 2, w: 0.3, d: 0.2, from: 0 } }),
    beige: (c = '#d8cdb8') => office(c, { bay: 3.1, floorH: 3.8, groundH: 4.6, cornice: { h: 0.8, d: 0.45 }, pilaster: { every: 3, w: 0.7, d: 0.3, from: 1 } }),
  };

  // the facade turned toward dir; falls back to the side of the bounding box closest to it
  function front(poly, dir) {
    let e = h.facingSpan(poly, dir[0], dir[1]);
    if (!e || e.L < 6) {
      const o = h.obb(poly);
      let best = null;
      for (const [nx, nz, dn, tx, tz, dt] of [[o.vx, o.vz, o.hw, o.ux, o.uz, o.hl], [-o.vx, -o.vz, o.hw, o.ux, o.uz, o.hl],
        [o.ux, o.uz, o.hl, o.vx, o.vz, o.hw], [-o.ux, -o.uz, o.hl, o.vx, o.vz, o.hw]]) {
        const s = nx * dir[0] + nz * dir[1];
        if (!best || s > best.s) best = { s, a: [o.cx + nx * dn - tx * dt, o.cz + nz * dn - tz * dt], L: 2 * dt, nx, nz, ux: tx, uz: tz };
      }
      e = best;
    }
    const P = (t, d) => [e.a[0] + e.ux * t + e.nx * d, e.a[1] + e.uz * t + e.nz * d];
    return { ...e, P, R: (t0, t1, d0, d1) => [P(t0, d0), P(t1, d0), P(t1, d1), P(t0, d1)] };
  }

  // a flight of n steps climbing toward the facade, the outermost lowest
  function stairs(S, f, t0, t1, d0, n, rise = 0.22, run = 0.55) {
    for (let i = 1; i <= n; i++) S.push({ poly: f.R(t0, t1, d0 - 0.2, d0 + (n + 1 - i) * run), h: i * rise, style: STONE('#cdc8be') });
    for (const t of [t0 - 0.8, t1]) S.push({ poly: f.R(t, t + 0.8, d0 - 0.2, d0 + n * run), h: n * rise + 0.6, style: STONE('#bdb8ad') }); // cheek walls
  }
  // a slab on slim round columns
  function canopy(S, f, t0, t1, depth, y, { r = 0.32, spacing = 5, thick = 0.6, col = '#bfc3c6', slab = '#e4e2dc' } = {}) {
    const cols = [], n = Math.max(2, Math.round((t1 - t0 - 1.6) / spacing) + 1);
    for (let i = 0; i < n; i++) { cols.push(S.length); S.push({ poly: h.circle(...f.P(t0 + 0.8 + (t1 - t0 - 1.6) * i / (n - 1), depth - 0.9), r, 8), h: y, style: STONE(col) }); }
    S.push({ poly: f.R(t0, t1, -0.4, depth), minY: y, h: thick, supports: cols, supportSpan: spacing + 4, style: { ...STONE(slab), cornice: null } });
  }
  // framed glass doors on the facade line
  function doors(S, f, c, n, d = 0, { w = 2.2, hgt = 3.2, gap = 0.5, frame = '#d9d5cc' } = {}) {
    const W = n * w + (n - 1) * gap;
    S.push({ poly: f.R(c - W / 2 - 0.7, c + W / 2 + 0.7, d - 0.3, d + 0.45), h: hgt + 0.8, style: STONE(frame) });
    for (let i = 0; i < n; i++) { const a = c - W / 2 + i * (w + gap); S.push({ poly: f.R(a, a + w, d - 0.3, d + 0.6), h: hgt, style: DARK }); }
  }
  // free-standing columns carrying an entablature (and a pediment when asked)
  function portico(S, f, t0, t1, colH, { offset = 4.5, spacing = 4, r = 0.75, entab = 1.8, pediment = 0, roof = '#d9d5cc' } = {}) {
    const c = h.colonnade(S, { a: f.P(t0, 0), L: t1 - t0, nx: f.nx, nz: f.nz, ux: f.ux, uz: f.uz }, { offset, spacing, r, h: colH, pad: 1.2, entab });
    if (pediment) S[c.entab].roof = { type: 'gable', h: pediment, axis: [f.nx, f.nz], color: roof };
    return offset + r * 1.6;
  }
  // a block standing out of the facade, taller than the roof (stair cores, entrance halls)
  const tower = (S, f, t, w, out, back, H, style, roof) => S.push({ poly: f.R(t - w / 2, t + w / 2, -back, out), h: H, style, roof });
  // plant boxes on a flat roof, kept inside the outline
  function units(S, poly, H, n, rnd) {
    const o = h.obb(poly), L = h.frame(o);
    for (let i = 0, tries = 0; i < n && tries < n * 6; tries++) {
      const u = (rnd() - 0.5) * o.hl * 1.3, v = (rnd() - 0.5) * o.hw * 1.1, s = 1.2 + rnd() * 1.6, q = h.rectL(L, u - s, u + s, v - s * 0.7, v + s * 0.7);
      if (!q.every(([x, z]) => pip(poly, x, z))) continue;
      S.push({ poly: q, minY: H, h: 1.3 + rnd() * 1.3, style: METAL }); i++;
    }
  }
  function skylight(S, poly, H, frac = 0.38) {
    const o = h.obb(poly), L = h.frame(o), a = o.hl * frac, c = o.hw * frac;
    S.push({ poly: h.rectL(L, -a, a, -c, c), minY: H, h: 1, style: glass('#86abc0', { plinth: null, parapet: 0, cornice: null }), roof: { type: 'pyramid', h: Math.min(a, c) * 0.6, color: '#8fb2c4' } });
  }
  const flags = (S, f, c, d, n = 3) => { for (let i = 0; i < n; i++) S.push({ poly: h.circle(...f.P(c + (i - (n - 1) / 2) * 3, d), 0.14, 6), h: 11, style: METAL }); };

  // o: look/wall | keep (dress up the earlier model) | floors | face | at | entry 'canopy'|'portico'|'glass' | entW | depth | colH
  //    steps | doors | dOff (facade line for doors and steps, past existing projections) | towers [fraction...] | crown | sky | units | flags
  function hall(b, rnd, o, prev) {
    let S, H, st = o.look ? LOOKS[o.look](o.wall) : null;
    if (o.keep && prev && prev.length) { S = prev; H = o.H ?? (S[0].minY || 0) + S[0].h; st = st || S[0].style; }
    else { st = st || LOOKS.white(); H = o.H ?? tall(o.floors || Math.max(b.lv, 3), st); S = [{ poly: b.p, h: H, style: st, roof: o.roof }]; }
    const pitched = !!(S[0].roof && S[0].roof.type);
    const [cx, cz] = h.centroid(b.p), D = Math.hypot(cx, cz) || 1, f = front(b.p, o.face || [-cx / D, -cz / D]);
    const c = f.L * (o.at ?? 0.5), W = Math.min(o.entW || 14, f.L * 0.7), dOff = o.dOff || 0;
    let out = dOff;
    if (o.entry === 'canopy') { const dep = o.depth || 6; canopy(S, f, c - W / 2, c + W / 2, dep + dOff, o.canopyY || Math.min(5.2, st.groundH || 4.6)); out = dOff + 0.5; }
    else if (o.entry === 'portico') out = portico(S, f, c - W / 2, c + W / 2, o.colH || Math.min(H - 1.8, 13), { pediment: o.pediment || 0, offset: (o.depth || 4.5) + dOff });
    else if (o.entry === 'glass') { tower(S, f, c, W, 3 + dOff, 4, Math.min(H + 3.5, H * 1.25), glass('#6f97b3', { parapet: 0.6, cornice: { h: 0.6, d: 0.4 }, plinth: null })); out = dOff + 3; }
    if (o.doors !== 0) doors(S, f, c, o.doors || 3, o.entry === 'glass' ? out : dOff);
    if (o.steps) stairs(S, f, c - W / 2 - 1, c + W / 2 + 1, o.entry === 'canopy' ? (o.depth || 6) + dOff + 0.6 : out + 0.4, o.steps);
    for (const t of o.towers || []) tower(S, f, f.L * t, 6, 1.8, 6, H + 4, { ...st, win: WIN.NONE, pilaster: null, bands: [] });
    if (o.flags) flags(S, f, c, (o.entry === 'canopy' ? (o.depth || 6) : out) + (o.steps || 0) * 0.55 + 4, o.flags);
    if (!pitched) {
      if (o.crown) S.push({ poly: k.inset(b.p, o.crown === true ? 0.72 : o.crown), minY: H, h: 4, style: glass('#7896ab', { floorH: 4, groundH: 4, plinth: null, cornice: { h: 0.9, d: 0.7 } }) });
      if (o.sky) skylight(S, b.p, H);
      const ck = o.crown === true ? 0.72 : o.crown;
      if (o.units !== 0) units(S, ck ? k.inset(b.p, ck * 0.85) : b.p, ck ? H + 4 : H, o.units || 3, rnd);
    }
    return S;
  }
  return { hall, LOOKS };
}

// id: options for hall() — three detailed buildings per campus, counting the ones already modelled this finely
const T = {
  // 중앙대 서울캠 (100주년기념관 already detailed)
  278564996: { keep: 1, face: [0, -1], steps: 6, doors: 2, dOff: 1.5, units: 0 },                                   // 영신관
  5462177: { keep: 1, entry: 'canopy', steps: 3, doors: 4, units: 4 },                                                // 중앙도서관
  // 성균관대 인사캠 (600주년기념관)
  415700716: { keep: 1, entry: 'canopy', depth: 7, steps: 4, doors: 4, crown: 0.75, units: 3 },                       // 중앙학술정보관
  1567692592: { look: 'granite', floors: 5, entry: 'glass', steps: 3, doors: 3, crown: true, units: 3 },             // 수기치인관
  // 연세대 신촌캠 (언더우드관)
  224955922: { look: 'granite', wall: '#c9bfae', floors: 5, entry: 'glass', entW: 16, steps: 5, doors: 4, sky: 1, units: 2 }, // 삼성학술정보관
  324328422: { keep: 1, entry: 'canopy', steps: 3, doors: 3, units: 3 },                                              // 백주년기념관
  // 서울대 관악캠 (중앙도서관, 규장각)
  329398175: { keep: 1, entry: 'canopy', depth: 8, canopyY: 5.2, entW: 20, steps: 4, doors: 5, crown: 0.8, units: 4 }, // 관정도서관
  // 한양대 서울캠 (본관)
  187181261: { keep: 1, entry: 'portico', entW: 16, colH: 11, steps: 6, doors: 3, units: 3 },                         // 백남학술정보관
  187178767: { look: 'glass', floors: 6, entry: 'canopy', steps: 2, towers: [0.12, 0.88], crown: true, units: 4 },    // 한양종합기술연구원
  // 서강대
  367474952: { keep: 1, face: [-0.97, -0.24], entry: 'canopy', depth: 5, steps: 3, doors: 3, flags: 3, units: 2 },  // 본관
  367474953: { look: 'white', wall: '#e9e7e0', floors: 4, entry: 'canopy', steps: 3, doors: 4, sky: 1 },             // 로욜라도서관 1관
  367483782: { look: 'brick', wall: '#a85c46', floors: 5, entry: 'glass', steps: 2, towers: [0.1], crown: true },    // 김대건관
  // 한국외대 서울캠 (본관)
  416469100: { keep: 1, entry: 'portico', entW: 15, colH: 10, steps: 5, doors: 3, units: 3 },                         // 도서관
  478064704: { look: 'brick', wall: '#9f5a44', floors: 6, entry: 'canopy', steps: 3, towers: [0.2, 0.8], units: 3 },  // 인문과학관
  // 서울시립대
  224704349: { keep: 1, face: [-0.95, -0.32], entry: 'portico', entW: 10, colH: 7.5, pediment: 2.2, steps: 5, doors: 2, units: 0 }, // 경농관
  224703877: { keep: 1, entry: 'canopy', steps: 4, doors: 5 },                                                        // 대강당
  224703878: { keep: 1, entry: 'glass', steps: 4, doors: 4, crown: 0.8, units: 3 },                                   // 중앙도서관
  // 건국대 서울캠 (상허기념도서관)
  372481901: { keep: 1, entry: 'canopy', depth: 7, steps: 3, doors: 4, crown: 0.7, units: 3 },                       // 새천년관
  369210727: { look: 'brick', floors: 7, entry: 'canopy', steps: 3, towers: [0.1, 0.9], units: 4 },                   // 공학관
  // 동국대 서울캠 (본관)
  268231222: { keep: 1, entry: 'portico', entW: 12, colH: 9, steps: 6, doors: 3, units: 2 },                          // 명진관
  268231333: { look: 'stone', wall: '#d2c6b0', floors: 4, entry: 'portico', entW: 14, colH: 10, steps: 5, doors: 3, sky: 1 }, // 중앙도서관
  // 홍익대 서울캠
  1441620363: { keep: 1, face: [0.45, -0.89], entry: 'canopy', depth: 7, steps: 4, doors: 4, units: 4 },             // 홍문관
  354214001: { look: 'brick', wall: '#9c4f3d', floors: 5, entry: 'glass', steps: 3, doors: 3, sky: 1 },              // 중앙도서관
  1441620371: { look: 'concrete', floors: 5, entry: 'canopy', towers: [0.2, 0.8], crown: true, units: 3 },           // 인문사회관
  // 국민대
  172246889: { keep: 1, face: [-0.62, 0.79], entry: 'canopy', steps: 4, doors: 4, units: 4 },                        // 북악관
  172246893: { keep: 1, steps: 5, doors: 3, dOff: 0.8, units: 3 },                                                   // 성곡도서관
  172646933: { keep: 1, entry: 'canopy', steps: 2, doors: 3, towers: [0.85] },                                       // 과학관
  // 숭실대
  1381653405: { keep: 1, face: [-0.96, 0.28], entry: 'canopy', steps: 3, doors: 4, units: 2 },                       // 형남공학관
  1381653409: { look: 'brick', wall: '#9b4a3a', floors: 4, entry: 'portico', entW: 14, colH: 10, pediment: 3, steps: 6, doors: 3, units: 2 }, // 한경직기념관
  1382013431: { keep: 1, entry: 'canopy', steps: 3, doors: 3 },                                                      // 안익태기념관
  // 세종대
  101293858: { keep: 1, face: [-0.66, 0.75], steps: 5, doors: 2, dOff: 0.5, units: 0 },                              // 박물관
  744068665: { look: 'glass', floors: 4, entry: 'canopy', towers: [0.5], crown: true, units: 3 },                    // 대양AI센터
  101293862: { look: 'white', floors: 15, entry: 'canopy', depth: 8, steps: 3, doors: 4, crown: 0.6, units: 4 },     // 광개토관
  // 단국대 죽전캠
  455430338: { keep: 1, face: [-0.72, -0.7], steps: 6, doors: 3, dOff: 0.5, flags: 3 },                              // 범정관
  455430339: { look: 'stone', floors: 6, entry: 'portico', entW: 16, colH: 12, steps: 5, doors: 3, sky: 1 },        // 퇴계기념중앙도서관
  455428875: { look: 'white', floors: 6, entry: 'canopy', towers: [0.15, 0.85], units: 4 },                          // 혜당관
  // 경희대 서울캠 (평화의전당, 본관)
  1272157465: { look: 'granite', wall: '#b9b3a6', floors: 4, entry: 'portico', entW: 16, colH: 11, pediment: 2.5, steps: 6, doors: 3, units: 2 }, // 중앙도서관
  // 성균관대 자과캠 (삼성학술정보관)
  70081287: { look: 'concrete', wall: '#d2d0c9', floors: 5, entry: 'canopy', steps: 3, towers: [0.25, 0.75], units: 4 }, // 수성관
  70081312: { look: 'brick', wall: '#9c5a46', floors: 5, entry: 'glass', steps: 2, crown: true, units: 3 },         // 제1공학관
  // 고려대 세종캠
  434752711: { keep: 1, face: [0.77, 0.64], entry: 'portico', entW: 16, colH: 12, steps: 5, doors: 4, sky: 1 },      // 학술정보원
  434857746: { look: 'granite', floors: 6, entry: 'canopy', towers: [0.15, 0.85], units: 4 },                        // 과학기술1관
  434856623: { look: 'granite', wall: '#b4b0a7', floors: 4, entry: 'glass', steps: 3, crown: true },                // 석원경상관
  // 연세대 송도캠
  377561220: { keep: 1, face: [-0.9, 0.45], entry: 'canopy', depth: 8, entW: 20, steps: 3, doors: 5, units: 3 },     // 언더우드 기념도서관
  478869586: { look: 'glass', floors: 5, entry: 'canopy', towers: [0.2, 0.8], crown: true },                         // 종합관
  377561221: { look: 'concrete', floors: 5, entry: 'glass', steps: 2, units: 4 },                                    // 진리관 A
  // 연세대 원주캠
  577094636: { keep: 1, face: [0.63, 0.78], entry: 'portico', entW: 14, colH: 11, pediment: 2.5, steps: 5, doors: 3, flags: 3 }, // 대학본부
  1361113874: { look: 'glass', floors: 5, entry: 'canopy', sky: 1, units: 3 },                                       // 컨버전스홀
  369388524: { look: 'brick', wall: '#9b4f3b', floors: 5, entry: 'canopy', towers: [0.2, 0.8], units: 3 },           // 학생회관
  // 서울대 연건캠
  614138825: { keep: 1, face: [0, 1], steps: 4, doors: 2, dOff: 2.2, units: 0 },                                     // 대한의원
  19282599: { look: 'white', floors: 6, entry: 'canopy', depth: 9, entW: 24, towers: [0.2, 0.8], units: 6 },         // 서울대학교병원 본관
  1214916489: { look: 'brick', floors: 5, entry: 'glass', steps: 2, crown: true },                                   // 의과학관
  // 한양대 ERICA캠
  367537518: { keep: 1, face: [0.28, -0.96], entry: 'portico', entW: 16, colH: 11, steps: 5, sky: 1 },               // 학술정보관
  367604421: { look: 'brick', floors: 5, entry: 'canopy', towers: [0.15, 0.85], units: 4 },                          // 제1공학관
  1471504923: { look: 'glass', floors: 4, entry: 'canopy', crown: true, sky: 1 },                                    // 융합교육관
  // 한국외대 글로벌캠
  468432116: { keep: 1, face: [-0.68, -0.74], steps: 5, doors: 3, dOff: 3, units: 2 },                               // 학생회관
  468432115: { keep: 1, entry: 'canopy', steps: 3, doors: 3, units: 3 },                                             // 도서관
  468432118: { look: 'brick', wall: '#9a4a36', floors: 7, entry: 'glass', towers: [0.15, 0.85], crown: true },       // 백년관
  // 건국대 글로컬캠
  362323470: { keep: 1, face: [-0.69, -0.72], entry: 'portico', entW: 15, colH: 11, steps: 5, sky: 1 },              // 중원도서관
  468436453: { look: 'glass', floors: 5, entry: 'canopy', steps: 2, units: 4 },                                      // KU Station
  1203390800: { look: 'brick', wall: '#a7634e', floors: 5, entry: 'canopy', towers: [0.2, 0.8], units: 3 },          // 학생회관
  // 홍익대 세종캠
  477809324: { keep: 1, face: [0.82, 0.57], entry: 'glass', steps: 4, doors: 3, sky: 1 },                            // 문정도서관
  911541628: { look: 'concrete', floors: 7, entry: 'canopy', crown: true, units: 4 },                                // 세종관
  477809325: { look: 'white', floors: 3, entry: 'portico', entW: 14, colH: 8, pediment: 2, steps: 4, units: 2 },     // 홍익아트홀
  // 단국대 천안캠
  171904158: { keep: 1, face: [-0.34, 0.94], entry: 'portico', entW: 16, colH: 12, steps: 6, sky: 1 },               // 율곡기념도서관
  368367022: { look: 'beige', wall: '#ebe6da', floors: 5, entry: 'canopy', towers: [0.2, 0.8], units: 3 },           // 인문과학관
  155103309: { look: 'beige', wall: '#e2dccd', floors: 5, entry: 'glass', steps: 2, units: 4 },                      // 학생회관
  // 카이스트
  1215432908: { keep: 1, face: [0.24, 0.97], entry: 'canopy', depth: 7, entW: 18, steps: 3, doors: 4, units: 0 },    // 학술문화관
  687286872: { keep: 1, entry: 'canopy', steps: 2, doors: 4, units: 4 },                                             // KI빌딩
  49931915: { keep: 1, face: [0.55, 0.83], steps: 4, doors: 3, dOff: 1.8, flags: 3 },                                // 본관
  // 디지스트
  1570040591: { keep: 1, face: [0.34, 0.94], entry: 'canopy', depth: 6, steps: 3, doors: 3, dOff: -1.2, units: 0 }, // 학술정보관
  1570028674: { keep: 1, entry: 'glass', entW: 18, steps: 3, doors: 4, towers: [0.3, 0.7], units: 8 },               // 강의동
  1570047432: { keep: 1, entry: 'canopy', steps: 3, crown: 0.7, units: 3 },                                          // 연구행정동
  // 광운대
  168287589: { keep: 1, face: [-0.66, 0.75], steps: 6, doors: 3, dOff: 2.2, units: 0 },                              // 화도관
  168284890: { keep: 1, entry: 'canopy', steps: 3, doors: 4, units: 0 },                                             // 비마관
  755371572: { keep: 1, entry: 'canopy', steps: 4, sky: 1, units: 3 },                                               // 80주년기념관
  // 명지대 인문캠
  462990139: { keep: 1, face: [0.54, 0.84], entry: 'portico', entW: 14, colH: 11, steps: 5, doors: 3, units: 2 },   // 방목학술정보관
  462990140: { keep: 1, face: [0.8, 0.6], steps: 4, doors: 3, dOff: 1.8, flags: 3 },                                 // 행정동
  462990137: { keep: 1, entry: 'canopy', towers: [0.15, 0.85], units: 4 },                                          // 종합관
  // 상명대 서울캠
  698228420: { keep: 1, face: [0, 1], entry: 'canopy', steps: 6, doors: 4, units: 0 },                               // 미래백년관
  463336783: { keep: 1, entry: 'portico', entW: 16, colH: 10, steps: 4, doors: 5 },                                  // 상명아트센터
  463336788: { keep: 1, entry: 'glass', steps: 3, units: 3 },                                                        // 밀레니엄관
  // 가톨릭대 성심캠
  343596941: { keep: 1, face: [0.7, -0.71], steps: 4, doors: 3, dOff: 2.2, flags: 3 },                               // 김수환추기경국제관
  343597087: { keep: 1, entry: 'portico', entW: 14, colH: 10, pediment: 2.5, steps: 5, doors: 3 },                   // 니콜스관
  278736790: { keep: 1, entry: 'canopy', steps: 3, units: 3 },                                                       // 베리타스관 (중앙도서관)
  // 가천대 글로벌캠
  1041736196: { keep: 1, face: [-1, 0.03], entry: 'canopy', depth: 9, entW: 18, steps: 4, doors: 5, flags: 3 },      // 가천관
  1041736203: { keep: 1, entry: 'glass', steps: 3, sky: 1 },                                                         // 전자정보도서관
  1041755558: { keep: 1, entry: 'canopy', towers: [0.2, 0.8], units: 3 },                                           // 중앙도서관
  // 한성대
  471425077: { keep: 1, face: [0.6, 0.8], entry: 'canopy', depth: 7, entW: 16, steps: 4, doors: 4, flags: 3, units: 0 }, // 상상관
  416291970: { keep: 1, entry: 'glass', steps: 3, doors: 3, units: 3 },                                              // 미래관
  471690519: { keep: 1, entry: 'portico', entW: 16, colH: 12, steps: 5, doors: 3, units: 3 },                         // 낙산관
  416291974: { keep: 1, entry: 'canopy', steps: 3, towers: [0.15, 0.85], crown: 0.7, units: 3 },                     // 연구관
};

// id -> (b, rnd, prev) => specs, where prev is the earlier model's parts (or null)
export function detailLandmarks(h) {
  const D = detailKit(h), out = {};
  for (const [id, o] of Object.entries(T)) out[id] = (b, rnd, prev) => D.hall(b, rnd, o, prev);
  return out;
}
