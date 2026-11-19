// Playable campuses. To add one: bake data/<id>.json with tools/build_data.py and add it here.
//   short        : name in the picker; universities with several campuses name each one ('연세대 신촌캠', '연세대 송도캠'),
//                  except 서울대's main campus, which stays '서울대';
//                  the start screen shows the university only ('연세대') with tag = its English name
//   hero         : best-known building for the picker; view = direction its front faces
//   pad          : launch pad [x, z] in local metres (origin = the main gate)
//   launchTarget : point [x, z] the rocket faces on the pad
//   outerChunkScale : bigger fracture pieces for off-campus buildings (optional)
//   liteOuter    : simplified off-campus buildings for very dense neighbourhoods (optional)
//   style        : campus look for buildings without a hand-made model (see models.js)
//   treeClear    : [[x, z, radius]] kept free of trees (optional)
export const CAMPUSES = {
  khu: {
    short: '경희대 국제캠', full: '경희대학교 국제캠퍼스', tag: 'KYUNG HEE UNIVERSITY',
    hero: { id: 473963422, name: '네오르네상스 정문', view: [0.35, 1] },
    data: 'data/khu.json', pad: [0, 30], launchTarget: [104, 716],
  },
  cau: {
    short: '중앙대 서울캠', full: '중앙대학교 서울캠퍼스', tag: 'CHUNG-ANG UNIVERSITY',
    hero: { id: 278564996, name: '영신관', view: [0, -1] },
    data: 'data/cau.json', pad: [30, -2], launchTarget: [-16, 212],
    outerChunkScale: 1.6, treeClear: [[30, -2, 32]],
  },
  skku: {
    short: '성균관대 인사캠', full: '성균관대학교 인문사회과학캠퍼스', tag: 'SUNGKYUNKWAN UNIVERSITY',
    hero: { id: 415700719, name: '명륜당', view: [0, 1] },
    data: 'data/skku.json', pad: [-24, -1], launchTarget: [-195, -307],
    outerChunkScale: 1.6, liteOuter: true, treeClear: [[-24, -1, 22]],
  },
  korea: {
    short: '고려대 서울캠', full: '고려대학교 서울캠퍼스', tag: 'KOREA UNIVERSITY', style: 'korea',
    hero: { id: 183044140, name: '본관', view: [0.74, 0.67] },
    data: 'data/korea.json', pad: [-34, 18], launchTarget: [-159, -140],
    outerChunkScale: 2, liteOuter: true, treeClear: [[-34, 18, 20]],
  },
  yonsei: {
    short: '연세대 신촌캠', full: '연세대학교 신촌캠퍼스', tag: 'YONSEI UNIVERSITY', style: 'yonsei',
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
    short: '한양대 서울캠', full: '한양대학교 서울캠퍼스', tag: 'HANYANG UNIVERSITY', style: 'hanyang',
    hero: { id: 187185124, name: '본관', view: [-0.31, 0.95] },
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
    short: '한국외대 서울캠', full: '한국외국어대학교 서울캠퍼스', tag: 'HANKUK UNIVERSITY OF FOREIGN STUDIES', style: 'hufs',
    hero: { id: 478064706, name: '본관', view: [0.92, 0.39] },
    data: 'data/hufs.json', pad: [14, -50], launchTarget: [-211, -90],
    outerChunkScale: 2.2, liteOuter: true, treeClear: [[14, -50, 20]],
  },
  uos: {
    short: '서울시립대', full: '서울시립대학교', tag: 'UNIVERSITY OF SEOUL', style: 'uos',
    hero: { id: 224704349, name: '경농관', view: [-0.95, -0.32] },
    data: 'data/uos.json', pad: [36, 12], launchTarget: [140, 47],
    outerChunkScale: 2.2, liteOuter: true, treeClear: [[36, 12, 20]],
  },
  konkuk: {
    short: '건국대 서울캠', full: '건국대학교 서울캠퍼스', tag: 'KONKUK UNIVERSITY', style: 'konkuk',
    hero: { id: 367582526, name: '상허기념도서관', view: [0.93, 0.38] },
    data: 'data/konkuk.json', pad: [22, 22], launchTarget: [-253, 309],
    outerChunkScale: 2.9, liteOuter: true, treeClear: [[22, 22, 20]],
  },
  dongguk: {
    short: '동국대 서울캠', full: '동국대학교 서울캠퍼스', tag: 'DONGGUK UNIVERSITY', style: 'dongguk',
    hero: { id: 270032443, name: '본관', view: [0.94, 0.34] },
    data: 'data/dongguk.json', pad: [-62, -26], launchTarget: [-295, -209],
    outerChunkScale: 2.2, liteOuter: true, treeClear: [[-62, -26, 20]],
  },
  hongik: {
    short: '홍익대 서울캠', full: '홍익대학교 서울캠퍼스', tag: 'HONGIK UNIVERSITY', style: 'hongik',
    hero: { id: 1441620363, name: '홍문관', view: [0.45, -0.89] },
    data: 'data/hongik.json', pad: [86, 110], launchTarget: [67, 42],
    outerChunkScale: 2.4, liteOuter: true, treeClear: [[86, 110, 20]],
  },
  kookmin: {
    short: '국민대', full: '국민대학교', tag: 'KOOKMIN UNIVERSITY', style: 'kookmin',
    hero: { id: 172246889, name: '북악관', view: [-0.62, 0.79] },
    data: 'data/kookmin.json', pad: [32, -34], launchTarget: [192, -120],
    outerChunkScale: 2, liteOuter: true, treeClear: [[32, -34, 20]],
  },
  soongsil: {
    short: '숭실대', full: '숭실대학교', tag: 'SOONGSIL UNIVERSITY', style: 'soongsil',
    hero: { id: 1381653405, name: '형남공학관', view: [-0.96, 0.28] },
    data: 'data/soongsil.json', pad: [50, -31], launchTarget: [139, 15],
    outerChunkScale: 2.2, liteOuter: true, treeClear: [[50, -31, 20]],
  },
  sejong: {
    short: '세종대', full: '세종대학교', tag: 'SEJONG UNIVERSITY', style: 'sejong',
    hero: { id: 101293858, name: '박물관', view: [-0.66, 0.75] },
    data: 'data/sejong.json', pad: [-58, -10], launchTarget: [3, -263],
    outerChunkScale: 2.4, liteOuter: true, treeClear: [[-58, -10, 20], [-12, 8, 11]],
  },
  dankook: {
    short: '단국대 죽전캠', full: '단국대학교 죽전캠퍼스', tag: 'DANKOOK UNIVERSITY', style: 'dankook',
    hero: { id: 455430338, name: '범정관', view: [-0.72, -0.7] },
    data: 'data/dankook.json', pad: [20, 56], launchTarget: [98, 182],
    outerChunkScale: 2, liteOuter: true, treeClear: [[20, 56, 22]],
  },
  khus: {
    short: '경희대 서울캠', full: '경희대학교 서울캠퍼스', tag: 'KYUNG HEE UNIVERSITY', style: 'khus',
    hero: { id: 261207462, name: '평화의전당', view: [-0.2, 0.98] },
    data: 'data/khus.json', pad: [3, -24], launchTarget: [12, -527],
    outerChunkScale: 2, liteOuter: true, treeClear: [[3, -24, 20]],
  },
  skkun: {
    short: '성균관대 자과캠', full: '성균관대학교 자연과학캠퍼스', tag: 'SUNGKYUNKWAN UNIVERSITY', style: 'skkun',
    hero: { id: 3571072, name: '삼성학술정보관', view: [-0.18, 0.98] },
    data: 'data/skkun.json', pad: [15, -78], launchTarget: [63, -343],
    outerChunkScale: 2, liteOuter: true, treeClear: [[15, -78, 20]],
  },
  koreas: {
    short: '고려대 세종캠', full: '고려대학교 세종캠퍼스', tag: 'KOREA UNIVERSITY', style: 'koreas',
    hero: { id: 434752711, name: '학술정보원', view: [0.77, 0.64] },
    data: 'data/koreas.json', pad: [-66, -45], launchTarget: [-167, -129],
    outerChunkScale: 2, liteOuter: true, treeClear: [[-66, -45, 20]],
  },
  yonseii: {
    short: '연세대 송도캠', full: '연세대학교 국제캠퍼스', tag: 'YONSEI UNIVERSITY', style: 'yonseii',
    hero: { id: 377561220, name: '언더우드 기념도서관', view: [-0.9, 0.45] },
    data: 'data/yonseii.json', pad: [54, -57], launchTarget: [277, -168],
    outerChunkScale: 2, liteOuter: true, treeClear: [[54, -57, 20]],
  },
  yonseiw: {
    short: '연세대 원주캠', full: '연세대학교 미래캠퍼스', tag: 'YONSEI UNIVERSITY', style: 'yonseiw',
    hero: { id: 577094636, name: '대학본부', view: [0.63, 0.78] },
    data: 'data/yonseiw.json', pad: [-78, 9], launchTarget: [-368, -347],
    outerChunkScale: 2, liteOuter: true, treeClear: [[-78, 9, 20]],
  },
  snuy: {
    short: '서울대 연건캠', full: '서울대학교 연건캠퍼스', tag: 'SEOUL NATIONAL UNIVERSITY', style: 'snuy',
    hero: { id: 614138825, name: '대한의원', view: [0, 1] },
    data: 'data/snuy.json', pad: [-63, 3], launchTarget: [-265, 174],
    outerChunkScale: 2, liteOuter: true, treeClear: [[-63, 3, 20]],
  },
  erica: {
    short: '한양대 ERICA캠', full: '한양대학교 ERICA캠퍼스', tag: 'HANYANG UNIVERSITY', style: 'erica',
    hero: { id: 367537518, name: '학술정보관', view: [0.28, -0.96] },
    data: 'data/erica.json', pad: [-66, 45], launchTarget: [-156, 350],
    outerChunkScale: 2, liteOuter: true, treeClear: [[-66, 45, 20]],
  },
  hufsg: {
    short: '한국외대 글로벌캠', full: '한국외국어대학교 글로벌캠퍼스', tag: 'HANKUK UNIVERSITY OF FOREIGN STUDIES', style: 'hufsg',
    hero: { id: 468432116, name: '학생회관', view: [-0.68, -0.74] },
    data: 'data/hufsg.json', pad: [18, 6], launchTarget: [1250, -189],
    outerChunkScale: 2, liteOuter: true, treeClear: [[18, 6, 20]],
  },
  konkukg: {
    short: '건국대 글로컬캠', full: '건국대학교 글로컬캠퍼스', tag: 'KONKUK UNIVERSITY', style: 'konkukg',
    hero: { id: 362323470, name: '중원도서관', view: [-0.69, -0.72] },
    data: 'data/konkukg.json', pad: [51, 60], launchTarget: [282, 303],
    outerChunkScale: 2, liteOuter: true, treeClear: [[51, 60, 20]],
  },
  hongiks: {
    short: '홍익대 세종캠', full: '홍익대학교 세종캠퍼스', tag: 'HONGIK UNIVERSITY', style: 'hongiks',
    hero: { id: 477809324, name: '문정도서관', view: [0.82, 0.57] },
    data: 'data/hongiks.json', pad: [-78, -3], launchTarget: [-383, -216],
    outerChunkScale: 2, liteOuter: true, treeClear: [[-78, -3, 20]],
  },
  dankookc: {
    short: '단국대 천안캠', full: '단국대학교 천안캠퍼스', tag: 'DANKOOK UNIVERSITY', style: 'dankookc',
    hero: { id: 171904158, name: '율곡기념도서관', view: [-0.34, 0.94] },
    data: 'data/dankookc.json', pad: [12, -57], launchTarget: [144, -419],
    outerChunkScale: 2, liteOuter: true, treeClear: [[12, -57, 20]],
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

// leave the picker for the start screen of the campus played last (remembered by selectedCampusId)
export function backToCampus() {
  const u = new URL(location.href);
  u.searchParams.delete('pick');
  u.searchParams.set('campus', selectedCampusId());
  location.href = u.href;
}

// leave a game for this campus's start screen
export function exitToTitle() {
  const u = new URL(location.href);
  u.searchParams.delete('pick');
  location.href = u.href;
}
