// Playable campuses. To add one: bake data/<id>.json with tools/build_data.py and add it here.
//   pad          : launch pad [x, z] in local metres (origin = the main gate)
//   launchTarget : point [x, z] the rocket faces on the pad
//   outerChunkScale : bigger fracture pieces for off-campus buildings (optional)
//   liteOuter    : simplified off-campus buildings for very dense neighbourhoods (optional)
//   style        : campus look for buildings without a hand-made model (see models.js)
//   treeClear    : [[x, z, radius]] kept free of trees (optional)
export const CAMPUSES = {
  khu: {
    short: '경희대', full: '경희대학교 국제캠퍼스', tag: 'KYUNG HEE GLOBAL CAMPUS',
    data: 'data/khu.json', pad: [0, 30], launchTarget: [104, 716],
  },
  cau: {
    short: '중앙대', full: '중앙대학교 서울캠퍼스', tag: 'CHUNG-ANG SEOUL CAMPUS',
    data: 'data/cau.json', pad: [-12, 34], launchTarget: [-16, 212],
    outerChunkScale: 1.6, treeClear: [[-12, 34, 32]],
  },
  skku: {
    short: '성균관대', full: '성균관대학교 인문사회과학캠퍼스', tag: 'SUNGKYUNKWAN SEOUL CAMPUS',
    data: 'data/skku.json', pad: [-24, -1], launchTarget: [-195, -307],
    outerChunkScale: 1.6, liteOuter: true, treeClear: [[-24, -1, 22]],
  },
  korea: {
    short: '고려대', full: '고려대학교 서울캠퍼스', tag: 'KOREA UNIVERSITY SEOUL', style: 'korea',
    data: 'data/korea.json', pad: [-24, -16], launchTarget: [-159, -140],
    outerChunkScale: 2, liteOuter: true, treeClear: [[-24, -16, 20]],
  },
  yonsei: {
    short: '연세대', full: '연세대학교 신촌캠퍼스', tag: 'YONSEI SINCHON CAMPUS', style: 'yonsei',
    data: 'data/yonsei.json', pad: [14, -42], launchTarget: [183, -667],
    outerChunkScale: 2.2, liteOuter: true, treeClear: [[14, -42, 20]],
  },
};

const KEY = 'univ-campus';

export function selectedCampusId() {
  let id = new URLSearchParams(location.search).get('campus');
  if (!CAMPUSES[id]) { try { id = localStorage.getItem(KEY); } catch { id = null; } }
  if (!CAMPUSES[id]) id = Object.keys(CAMPUSES)[0];
  try { localStorage.setItem(KEY, id); } catch { /* ignore */ }
  return id;
}

export function goToCampus(id) {
  const u = new URL(location.href);
  u.searchParams.set('campus', id);
  location.href = u.href;
}
