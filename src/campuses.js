// Playable campuses. To add one: bake data/<id>.json with tools/build_data.py and add it here.
//   hero         : best-known building for the picker; view = direction its front faces
//   pad          : launch pad [x, z] in local metres (origin = the main gate)
//   launchTarget : point [x, z] the rocket faces on the pad
//   outerChunkScale : bigger fracture pieces for off-campus buildings (optional)
//   liteOuter    : simplified off-campus buildings for very dense neighbourhoods (optional)
//   style        : campus look for buildings without a hand-made model (see models.js)
//   treeClear    : [[x, z, radius]] kept free of trees (optional)
export const CAMPUSES = {
  khu: {
    short: '경희대', full: '경희대학교 국제캠퍼스', tag: 'KYUNG HEE GLOBAL CAMPUS',
    hero: { id: 473963422, name: '네오르네상스 정문', view: [0.35, 1] },
    data: 'data/khu.json', pad: [0, 30], launchTarget: [104, 716],
  },
  cau: {
    short: '중앙대', full: '중앙대학교 서울캠퍼스', tag: 'CHUNG-ANG SEOUL CAMPUS',
    hero: { id: 278564996, name: '영신관', view: [0, -1] },
    data: 'data/cau.json', pad: [-12, 34], launchTarget: [-16, 212],
    outerChunkScale: 1.6, treeClear: [[-12, 34, 32]],
  },
  skku: {
    short: '성균관대', full: '성균관대학교 인문사회과학캠퍼스', tag: 'SUNGKYUNKWAN SEOUL CAMPUS',
    hero: { id: 415700719, name: '명륜당', view: [0, 1] },
    data: 'data/skku.json', pad: [-24, -1], launchTarget: [-195, -307],
    outerChunkScale: 1.6, liteOuter: true, treeClear: [[-24, -1, 22]],
  },
  korea: {
    short: '고려대', full: '고려대학교 서울캠퍼스', tag: 'KOREA UNIVERSITY SEOUL', style: 'korea',
    hero: { id: 183044140, name: '본관', view: [0.74, 0.67] },
    data: 'data/korea.json', pad: [-24, -16], launchTarget: [-159, -140],
    outerChunkScale: 2, liteOuter: true, treeClear: [[-24, -16, 20]],
  },
  yonsei: {
    short: '연세대', full: '연세대학교 신촌캠퍼스', tag: 'YONSEI SINCHON CAMPUS', style: 'yonsei',
    hero: { id: 246156115, name: '언더우드관', view: [0.27, 0.96] },
    data: 'data/yonsei.json', pad: [14, -42], launchTarget: [183, -667],
    outerChunkScale: 2.2, liteOuter: true, treeClear: [[14, -42, 20]],
  },
  snu: {
    short: '서울대', full: '서울대학교 관악캠퍼스', tag: 'SEOUL NATIONAL UNIVERSITY', style: 'snu',
    hero: { id: 9500000001, name: '정문 샤 조형물', view: [-1, -0.15] },
    data: 'data/snu.json', pad: [40, 14], launchTarget: [293, 757],
    outerChunkScale: 1.6, liteOuter: true, treeClear: [[40, 14, 22]],
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

export function rememberCampus(id) {
  try { localStorage.setItem(KEY, id); } catch { /* ignore */ }
  const u = new URL(location.href);
  u.searchParams.delete('pick');
  u.searchParams.set('campus', id);
  history.replaceState(null, '', u);
}

export function openPicker() {
  const u = new URL(location.href);
  u.searchParams.delete('campus');
  u.searchParams.set('pick', '1');
  location.href = u.href;
}
