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
  hanyang: {
    short: '한양대', full: '한양대학교 서울캠퍼스', tag: 'HANYANG SEOUL CAMPUS', style: 'hanyang',
    hero: { id: 187185124, name: '본관', view: [-0.9, -0.43] },
    data: 'data/hanyang.json', pad: [34, 17], launchTarget: [222, 107],
    outerChunkScale: 2.2, liteOuter: true, treeClear: [[34, 17, 20]],
  },
  sogang: {
    short: '서강대', full: '서강대학교', tag: 'SOGANG UNIVERSITY', style: 'sogang',
    hero: { id: 367474952, name: '본관', view: [-0.97, -0.24] },
    data: 'data/sogang.json', pad: [37, 9], launchTarget: [187, 46],
    outerChunkScale: 2.4, liteOuter: true, treeClear: [[37, 9, 20]],
  },
  hufs: {
    short: '한국외대', full: '한국외국어대학교 서울캠퍼스', tag: 'HUFS SEOUL CAMPUS', style: 'hufs',
    hero: { id: 478064706, name: '본관', view: [0.92, 0.39] },
    data: 'data/hufs.json', pad: [-35, -15], launchTarget: [-211, -90],
    outerChunkScale: 2.2, liteOuter: true, treeClear: [[-35, -15, 20]],
  },
  uos: {
    short: '서울시립대', full: '서울시립대학교', tag: 'UNIVERSITY OF SEOUL', style: 'uos',
    hero: { id: 224704349, name: '경농관', view: [-0.95, -0.32] },
    data: 'data/uos.json', pad: [36, 12], launchTarget: [140, 47],
    outerChunkScale: 2.2, liteOuter: true, treeClear: [[36, 12, 20]],
  },
  konkuk: {
    short: '건국대', full: '건국대학교 서울캠퍼스', tag: 'KONKUK SEOUL CAMPUS', style: 'konkuk',
    hero: { id: 367582526, name: '상허기념도서관', view: [0.95, -0.3] },
    data: 'data/konkuk.json', pad: [-36, 11], launchTarget: [-509, 161],
    outerChunkScale: 2.9, liteOuter: true, treeClear: [[-36, 11, 20]],
  },
  dongguk: {
    short: '동국대', full: '동국대학교 서울캠퍼스', tag: 'DONGGUK SEOUL CAMPUS', style: 'dongguk',
    hero: { id: 268231222, name: '명진관', view: [0.97, -0.26] },
    data: 'data/dongguk.json', pad: [-37, 10], launchTarget: [-358, 95],
    outerChunkScale: 2.2, liteOuter: true, treeClear: [[-37, 10, 20]],
  },
  hongik: {
    short: '홍익대', full: '홍익대학교 서울캠퍼스', tag: 'HONGIK SEOUL CAMPUS', style: 'hongik',
    hero: { id: 1441620363, name: '홍문관', view: [0.45, -0.89] },
    data: 'data/hongik.json', pad: [24, 15], launchTarget: [67, 42],
    outerChunkScale: 2.4, liteOuter: true, treeClear: [[24, 15, 20]],
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
