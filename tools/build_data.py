#!/usr/bin/env python3
"""Bake OpenStreetMap + terrain tiles for one campus into a data file.

Usage: python3 tools/build_data.py <campus> <osm_all.json> <dem_dir> <out.json>
  e.g. python3 tools/build_data.py cau osm_all.json dem data/cau.json

Inputs:
  campus       : a key of CAMPUSES below
  osm_all.json : Overpass `out geom` result (buildings, highways, landuse ... in bbox)
  dem_dir      : cache folder for Copernicus GLO-30 tiles (downloaded on demand)
"""
import array, json, math, os, struct, sys, urllib.request, zlib, hashlib

# origin = the main gate; bbox = (s, w, n, e); outline = OSM element of the campus boundary.
# extra = buildings missing from OSM, traced from aerial imagery, in local metres.
CAMPUSES = {
    "khu": {  # 경희대학교 국제캠퍼스
        "origin": (37.24733, 127.07841), "bbox": (37.2345, 127.0738, 37.2515, 127.0898),
        "outline": ("relation", 11246784), "extra": [],
    },
    "cau": {  # 중앙대학교 서울캠퍼스
        "origin": (37.50667, 126.95813), "bbox": (37.4985, 126.9470, 37.5110, 126.9650),
        "outline": ("way", 284355223),
        "names": {367405910: "체육관"},
        "extra": [
            {"id": 9100000001, "n": "정문 조형물", "k": "yes", "lv": 1, "h": 9.0, "p": [[-4, -2], [4, -2], [4, 2], [-4, 2]]},
            {"id": 9100000002, "n": "청룡상", "k": "yes", "lv": 1, "h": 6.0,
             "p": [[-69.5, 114.7], [-71.0, 117.3], [-74.0, 117.3], [-75.5, 114.7], [-74.0, 112.1], [-71.0, 112.1]]},
            {"id": 9100000003, "n": "의혈탑", "k": "yes", "lv": 1, "h": 12.0, "p": [[-50, 160], [-45, 160], [-45, 165], [-50, 165]]},
        ],
    },
    "skku": {  # 성균관대학교 인문사회과학캠퍼스 (서울)
        "origin": (37.58470, 126.99680), "bbox": (37.5818, 126.9855, 37.5932, 127.0025),
        "outline": ("way", 75546222),
        "extra": [
            {"id": 9200000001, "n": "정문", "k": "yes", "lv": 1, "h": 6.0, "p": [[-9, -18.5], [-7, -18.5], [-7, -16.5], [-9, -16.5]]},
            {"id": 9200000002, "n": "명륜당 은행나무", "k": "yes", "lv": 1, "h": 20.0,
             "p": [[-90.0, -130.0], [-86.0, -130.0], [-86.0, -126.0], [-90.0, -126.0]]},
        ],
        "areas": [
            {"k": "grass", "flat": True, "p": [[-346.3, -405.1], [-293.4, -355.8], [-326.4, -341.3], [-367.5, -388.7]]},  # 금잔디광장
            {"k": "pitch", "p": [[-501.8, -321.0], [-420.4, -341.3], [-404.5, -284.8], [-490.6, -265.0]]},                 # 대운동장
        ],
        # 명륜동 houses are mostly missing from OSM: fill the blocks with small generated ones
        "infill": {"step": 18.0, "region": [(37.5932, 126.9935), (37.5902, 126.9919), (37.5885, 126.9928), (37.5869, 126.9935),
                                            (37.5850, 126.99475), (37.5838, 126.9955), (37.5818, 126.9962),
                                            (37.5818, 127.0025), (37.5932, 127.0025)]},
    },
    "korea": {  # 고려대학교 서울캠퍼스
        "origin": (37.58823, 127.03414), "bbox": (37.5815, 127.0205, 37.5955, 127.0395),
        "outline": ("way", 26253960), "extra": [], "infill": {"step": 25.0},
    },
    "yonsei": {  # 연세대학교 신촌캠퍼스
        "origin": (37.56037, 126.93663), "bbox": (37.5565, 126.9280, 37.5730, 126.9470),
        "outline": ("relation", 18619603),
        "extra": [{"id": 9400000001, "n": "정문 기념물", "k": "yes", "lv": 1, "h": 6.5, "p": [[-4, -1], [4, -1], [4, 1], [-4, 1]]}],
    },
    "snu": {  # 서울대학교 관악캠퍼스
        "origin": (37.46610, 126.94870), "bbox": (37.4435, 126.9415, 37.4690, 126.9665), "step": 6.0,
        "outline": ("relation", 11917142),
        "extra": [{"id": 9500000001, "n": "정문", "k": "yes", "lv": 1, "h": 25.0, "p": [[-2, -2], [2, -2], [2, 2], [-2, 2]]}],
        "infill": {"step": 24.0, "region": [(37.4690, 126.9415), (37.4690, 126.9665), (37.4660, 126.9665), (37.4660, 126.9415)]},
    },
    "hanyang": {  # 한양대학교 서울캠퍼스
        "origin": (37.55761, 127.04203), "bbox": (37.55, 127.036, 37.564, 127.054),
        "outline": ("way", 187645257),
        "extra": [], "infill": {"step": 26.0},
    },
    "sogang": {  # 서강대학교
        "origin": (37.55148, 126.93789), "bbox": (37.5445, 126.933, 37.5575, 126.949),
        "outline": ("way", 224132976),
        "extra": [{"id": 9600000001, "n": "정문", "k": "yes", "lv": 1, "h": 8.0, "p": [[-5, -1.2], [5, -1.2], [5, 1.2], [-5, 1.2]]}],
    },
    "hufs": {  # 한국외국어대학교 서울캠퍼스
        "origin": (37.59653, 127.06006), "bbox": (37.5915, 127.051, 37.603, 127.067),
        "outline": ("relation", 7027282),
        "extra": [], "infill": {"step": 26.0},
    },
    "uos": {  # 서울시립대학교
        "origin": (37.58336, 127.05504), "bbox": (37.5775, 127.051, 37.5905, 127.067),
        "outline": ("way", 1012785889),
        "extra": [], "infill": {"step": 26.0},
    },
    "konkuk": {  # 건국대학교 서울캠퍼스
        "origin": (37.54484, 127.0767), "bbox": (37.534, 127.069, 37.548, 127.089),
        "outline": ("way", 26281749),
        "extra": [], "infill": {"step": 26.0},
    },
    "dongguk": {  # 동국대학교 서울캠퍼스
        "origin": (37.55661, 127.00284), "bbox": (37.5515, 126.9915, 37.5645, 127.0085),
        "outline": ("way", 268230784),
        "extra": [{"id": 9700000001, "n": "정문", "k": "yes", "lv": 1, "h": 6.4, "p": [[-2.0, 11.9], [-0.6, -12.1], [2.0, -11.9], [0.6, 12.1]]},
                  {"id": 9700000002, "n": "코끼리상", "k": "yes", "lv": 1, "h": 4.0, "p": [[-16.3, -12.6], [-30.3, -13.4], [-30.0, -18.2], [-16.0, -17.4]]}], "infill": {"step": 26.0},
    },
    "hongik": {  # 홍익대학교 서울캠퍼스
        "origin": (37.55291, 126.92414), "bbox": (37.545, 126.917, 37.557, 126.933),
        "outline": ("way", 216908773),
        "extra": [],
    },
    "kookmin": {  # 국민대학교 (정릉): mountains to the north and west, 정릉동 houses mostly missing from OSM
        "origin": (37.61115, 126.99469), "bbox": (37.604, 126.988, 37.617, 127.004),
        "outline": ("way", 173018858),
        # houses only east and south-east of campus: the roads through the western forest stay bare
        "extra": [], "infill": {"step": 22.0, "avoid": ["grass"], "tallGap": 22, "region": [(37.6170, 126.9968), (37.6170, 127.0040), (37.6040, 127.0040), (37.6040, 126.9952),
                                                         (37.6074, 126.9952), (37.6109, 126.9966), (37.6119, 126.9968)]},
    },
    "soongsil": {  # 숭실대학교 (상도동)
        "origin": (37.49598, 126.95438), "bbox": (37.4895, 126.950, 37.5025, 126.966),
        "outline": ("relation", 19035920),
        "extra": [], "infill": {"step": 26.0, "avoid": ["grass"], "tallGap": 22},
    },
    "sejong": {  # 세종대학교 (군자동): the gate faces 어린이대공원 정문 across 능동로
        "origin": (37.54914, 127.07525), "bbox": (37.544, 127.066, 37.557, 127.082),
        "outline": ("way", 965940829),
        # 정문: a hanok gate across the drive in from 능동로 (not mapped in OSM)
        "extra": [{"id": 9900000001, "n": "정문", "k": "yes", "lv": 1, "h": 9.0, "p": [[-5.4, 3.0], [-12.4, 16.2], [-18.6, 13.0], [-11.6, -0.2]]}], "infill": {"step": 26.0, "avoid": ["grass"], "tallGap": 22},
    },
    "dankook": {  # 단국대학교 죽전캠퍼스 (용인): apartment towers all around
        "origin": (37.32345, 127.12553), "bbox": (37.309, 127.116, 37.328, 127.140), "step": 5.0,
        # OSM has the apartment towers; fill only the villa and village blocks it leaves empty
        "infill": {"step": 22.0, "avoid": ["grass"], "tallGap": 22, "regions": [
            [(37.32105, 127.11600), (37.32105, 127.12333), (37.31602, 127.12453), (37.31590, 127.12109), (37.31769, 127.11899), (37.31793, 127.11600)],
            [(37.31805, 127.12708), (37.31841, 127.12917), (37.31674, 127.13007), (37.31278, 127.13007), (37.31278, 127.12738), (37.31554, 127.12678)],
            [(37.32596, 127.12453), (37.32620, 127.12917), (37.32405, 127.12917), (37.32405, 127.12588), (37.32345, 127.12498), (37.32441, 127.12453)],
            [(37.32500, 127.13696), (37.32500, 127.13995), (37.31889, 127.13995), (37.32009, 127.13755), (37.32201, 127.13696)]]},
        "outline": ("way", 757042589),
        "extra": [],
    },
    "khus": {  # 경희대학교 서울캠퍼스
        "origin": (37.59388, 127.05267), "bbox": (37.5898, 127.0433, 37.6045, 127.0603),
        "outline": ("way", 326871536),
        "extra": [], "infill": {"step": 24.0, "avoid": ["grass", "farm"], "tallGap": 22},
    },
    "caua": {  # 중앙대학교 다빈치캠퍼스 (안성): not in the game yet, OSM maps only ~10 of its buildings
        "origin": (37.004, 127.23), "bbox": (36.9954, 127.2207, 37.0133, 127.2392), "step": 5.0,
        "outline": ("way", 471138197),
        "extra": [], "infill": {"step": 24.0, "avoid": ["grass", "farm"], "tallGap": 22},
    },
    "skkun": {  # 성균관대학교 자연과학캠퍼스 (수원)
        "origin": (37.29075, 126.9741), "bbox": (37.2875, 126.9662, 37.3006, 126.9831),
        "outline": ("way", 70081328),
        "extra": [], "infill": {"step": 24.0, "avoid": ["grass", "farm"], "tallGap": 22},
    },
    "koreas": {  # 고려대학교 세종캠퍼스
        "origin": (36.6089, 127.28899), "bbox": (36.6051, 127.2775, 36.6159, 127.2971),
        "outline": ("way", 227115256),
        "extra": [], "infill": {"step": 24.0, "avoid": ["grass", "farm"], "tallGap": 22},
    },
    "yonseii": {  # 연세대학교 국제캠퍼스 (송도): no infill, the empty lots around are unmapped high-rise blocks
        "origin": (37.38084, 126.66794), "bbox": (37.3742, 126.662, 37.3891, 126.6844), "step": 5.0,
        "outline": ("way", 314908138),
        "extra": [],
    },
    "yonseiw": {  # 연세대학교 미래캠퍼스 (원주)
        "origin": (37.27688, 127.9058), "bbox": (37.2714, 127.8936, 37.2886, 127.9109), "step": 5.0,
        "outline": ("way", 296912707),
        "extra": [], "infill": {"step": 24.0, "avoid": ["grass", "farm"], "tallGap": 22, "regions": [  # villages only, not the fields
            [(37.27428, 127.90403), (37.27428, 127.91087), (37.26933, 127.91087), (37.26933, 127.90403)],
            [(37.28716, 127.89576), (37.28716, 127.89863), (37.28601, 127.89863), (37.28601, 127.89576)]]},
    },
    "snuy": {  # 서울대학교 연건캠퍼스
        "origin": (37.58001, 127.00197), "bbox": (37.5735, 126.9927, 37.5851, 127.0059),
        "outline": ("way", 223434837),
        "extra": [], "infill": {"step": 24.0, "avoid": ["grass", "farm"], "tallGap": 22},
    },
    "erica": {  # 한양대학교 ERICA캠퍼스 (안산)
        "origin": (37.29981, 126.83687), "bbox": (37.2871, 126.823, 37.3062, 126.8482), "step": 5.0,
        "outline": ("way", 367535809),
        "extra": [], "infill": {"step": 24.0, "avoid": ["grass", "farm"], "tallGap": 22},
    },
    "hufsg": {  # 한국외국어대학교 글로벌캠퍼스 (용인)
        "origin": (37.33559, 127.25573), "bbox": (37.3297, 127.2518, 37.3435, 127.2804), "step": 5.0,
        "outline": ("way", 231591705),
        "extra": [], "infill": {"step": 24.0, "avoid": ["grass", "farm"], "tallGap": 22},
    },
    "konkukg": {  # 건국대학교 글로컬캠퍼스 (충주)
        "origin": (36.95155, 127.9053), "bbox": (36.9433, 127.8998, 36.9559, 127.9181),
        "outline": ("relation", 15575865),
        "extra": [], "infill": {"step": 24.0, "avoid": ["grass", "farm"], "tallGap": 22, "regions": [  # villages only, not the fields
            [(36.95422, 127.9076), (36.95422, 127.91273), (36.95131, 127.91273), (36.95131, 127.9076)],
            [(36.94672, 127.8998), (36.94672, 127.90779), (36.94424, 127.90779), (36.94424, 127.8998)],
            [(36.951, 127.90132), (36.951, 127.90493), (36.94672, 127.90493), (36.94672, 127.90132)],
            [(36.94825, 127.91444), (36.94825, 127.91806), (36.9458, 127.91806), (36.9458, 127.91444)]]},
    },
    "donggukw": {  # 동국대학교 WISE캠퍼스 (경주): not in the game yet, OSM maps only ~8 of its buildings
        "origin": (35.86234, 129.19788), "bbox": (35.8569, 129.1866, 35.8699, 129.2024),
        "outline": ("way", 469846147),
        "extra": [], "infill": {"step": 24.0, "avoid": ["grass", "farm"], "tallGap": 22},
    },
    "hongiks": {  # 홍익대학교 세종캠퍼스
        "origin": (36.6212, 127.2903), "bbox": (36.6159, 127.2779, 36.627, 127.2947),
        "outline": ("way", 795312568),
        "extra": [], "infill": {"step": 24.0, "avoid": ["grass", "farm"], "tallGap": 22, "regions": [  # villages only, not the fields
            [(36.62022, 127.28455), (36.62022, 127.29084), (36.61623, 127.29084), (36.61623, 127.28455)],
            [(36.627, 127.28542), (36.627, 127.28997), (36.62163, 127.28997), (36.62163, 127.28804), (36.62389, 127.28542)]]},
    },
    "dankookc": {  # 단국대학교 천안캠퍼스
        "origin": (36.83214, 127.16494), "bbox": (36.8287, 127.1608, 36.8448, 127.1778),
        "outline": ("way", 171904156),
        "extra": [], "infill": {"step": 24.0, "avoid": ["grass", "farm"], "tallGap": 22},
    },
}

CAMPUS_ID, OSM, DEM_DIR, OUT = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
CFG = CAMPUSES[CAMPUS_ID]
LAT0, LON0 = CFG["origin"]
KX = math.cos(math.radians(LAT0)) * 111320.0
KZ = 110574.0
BBOX = CFG["bbox"]  # s, w, n, e


def proj(lat, lon):
    return ((lon - LON0) * KX, -(lat - LAT0) * KZ)


# ---------------------------------------------------------------- DEM
# Copernicus GLO-30 (AWS open data): 1 arc-second grid with flattened water bodies. Terrarium
# tiles were dropped because they carry large radar spikes over lakes (60 m on 일감호).
COG_URL = "https://copernicus-dem-30m.s3.amazonaws.com/{0}/{0}.tif"


def http_range(url, start, length):
    req = urllib.request.Request(url, headers={"Range": f"bytes={start}-{start + length - 1}", "User-Agent": "campus-map-builder/1.0"})
    return urllib.request.urlopen(req, timeout=120).read()


class CopTile:
    """Minimal reader for one tiled, deflate-compressed Float32 GeoTIFF (first image only)."""

    def __init__(self, lat, lon):
        ew = "E" if lon >= 0 else "W"
        self.name = f"Copernicus_DSM_COG_10_N{lat:02d}_00_{ew}{abs(lon):03d}_00_DEM"
        self.url = COG_URL.format(self.name)
        self.lat, self.lon, self.tiles = lat, lon, {}
        head = http_range(self.url, 0, 1 << 17)
        end = "<" if head[:2] == b"II" else ">"
        off = struct.unpack(end + "I", head[4:8])[0]
        n = struct.unpack(end + "H", head[off:off + 2])[0]
        tag = {}
        size = {1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 11: 4, 12: 8}
        code = {1: "B", 3: "H", 4: "I", 11: "f", 12: "d"}
        for i in range(n):
            e = head[off + 2 + i * 12:off + 14 + i * 12]
            t, ty, cnt = struct.unpack(end + "HHI", e[:8])
            if ty not in code:
                continue
            nb = size[ty] * cnt
            raw = e[8:8 + nb] if nb <= 4 else head[struct.unpack(end + "I", e[8:12])[0]:][:nb]
            tag[t] = struct.unpack(end + code[ty] * cnt, raw)
        self.end, self.w, self.h = end, tag[256][0], tag[257][0]
        self.tw, self.th, self.comp, self.pred = tag[322][0], tag[323][0], tag[259][0], tag.get(317, (1,))[0]
        self.offs, self.cnts = tag[324], tag[325]
        assert self.comp in (8, 32946), self.comp
        self.dx = 1.0 / self.w  # degrees per pixel; rows are always 1/3600 degree

    def tile(self, cache, ti, tj):
        key = (ti, tj)
        if key in self.tiles:
            return self.tiles[key]
        path = os.path.join(cache, f"{self.name}_{ti}_{tj}.f32")
        if os.path.exists(path):
            a = array.array("f"); a.frombytes(open(path, "rb").read())
        else:
            idx = tj * ((self.w + self.tw - 1) // self.tw) + ti
            raw = zlib.decompress(http_range(self.url, self.offs[idx], self.cnts[idx]))
            tw, th = self.tw, self.th
            a = array.array("f", bytes(4 * tw * th))
            if self.pred == 3:
                stride = tw * 4
                for r in range(th):
                    row = bytearray(raw[r * stride:(r + 1) * stride])
                    for i in range(1, stride):
                        row[i] = (row[i] + row[i - 1]) & 255
                    for c in range(tw):  # bytes are stored most significant first, plane by plane
                        a[r * tw + c] = struct.unpack(">f", bytes((row[c], row[tw + c], row[2 * tw + c], row[3 * tw + c])))[0]
            else:
                a = array.array("f"); a.frombytes(raw)
                if self.end == ">":
                    a.byteswap()
            os.makedirs(cache, exist_ok=True)
            open(path + ".tmp", "wb").write(a.tobytes()); os.replace(path + ".tmp", path)
        self.tiles[key] = a
        return a

    def sample(self, cache, col, row):
        a = self.tile(cache, col // self.tw, row // self.th)
        return a[(row % self.th) * self.tw + col % self.tw]


# Work on the 1 arc-second cells around the campus. The model is a surface model, so buildings
# and tree tops raise it: a grey-scale opening removes anything narrower than about 150 m.
_cop = {}
S_, W_, N_, E_ = BBOX
MARGIN = 6
cy0, cy1 = math.floor((90 - N_) * 3600) - MARGIN, math.ceil((90 - S_) * 3600) + MARGIN
cx0, cx1 = math.floor((W_ + 180) * 3600) - MARGIN, math.ceil((E_ + 180) * 3600) + MARGIN
gw, gh = cx1 - cx0 + 1, cy1 - cy0 + 1


def cop_cell(cx, cy):
    lon_i, lat_i = cx // 3600 - 180, 89 - cy // 3600
    t = _cop.get((lat_i, lon_i))
    if t is None:
        t = _cop[(lat_i, lon_i)] = CopTile(lat_i, lon_i)
    return t.sample(DEM_DIR, int((cx % 3600) * t.w / 3600), cy % 3600)


dsm = [cop_cell(cx0 + i, cy0 + j) for j in range(gh) for i in range(gw)]


def morph(src, pick, r=2):
    def pass1(data, w, h, step_i, step_j):
        out = list(data)
        for j in range(h):
            for i in range(w):
                v = [data[max(0, min(h - 1, j + k * step_j)) * w + max(0, min(w - 1, i + k * step_i))] for k in range(-r, r + 1)]
                out[j * w + i] = pick(v)
        return out
    return pass1(pass1(src, gw, gh, 1, 0), gw, gh, 0, 1)


ground = morph(morph(dsm, min), max)
for _ in range(2):  # light smoothing so the opening leaves no terraces
    ground = [sum(ground[max(0, min(gh - 1, j + b)) * gw + max(0, min(gw - 1, i + a))] * (4 if a == b == 0 else 2 if a == 0 or b == 0 else 1)
                  for a in (-1, 0, 1) for b in (-1, 0, 1)) / 16 for j in range(gh) for i in range(gw)]


def _cr(p0, p1, p2, p3, t):
    return p1 + 0.5 * t * (p2 - p0 + t * (2 * p0 - 5 * p1 + 4 * p2 - p3 + t * (3 * (p1 - p2) + p3 - p0)))


def elev(lat, lon):
    """Catmull-Rom bicubic sample of the bare-ground grid (cell centres at half arc-seconds)."""
    px, py = (lon + 180) * 3600 - cx0 - 0.5, (90 - lat) * 3600 - cy0 - 0.5
    x0, y0 = math.floor(px), math.floor(py)
    cell = lambda i, j: ground[max(0, min(gh - 1, j)) * gw + max(0, min(gw - 1, i))]
    rows = [_cr(*(cell(x0 + i, y0 + j) for i in range(-1, 3)), px - x0) for j in range(-1, 3)]
    return _cr(*rows, py - y0)


BASE_ELEV = elev(LAT0, LON0)

# terrain grid in local metres
x_min, z_max = proj(BBOX[0], BBOX[1])
x_max, z_min = proj(BBOX[2], BBOX[3])
STEP = float(CFG.get("step", 4.0))
nx = int((x_max - x_min) / STEP) + 1
nz = int((z_max - z_min) / STEP) + 1
heights = []
for j in range(nz):
    z = z_min + j * STEP
    lat = LAT0 - z / KZ
    for i in range(nx):
        x = x_min + i * STEP
        lon = LON0 + x / KX
        heights.append(round(elev(lat, lon) - BASE_ELEV, 1))


def hgt(x, z):
    fi = min(max((x - x_min) / STEP, 0), nx - 1.001)
    fj = min(max((z - z_min) / STEP, 0), nz - 1.001)
    i, j = int(fi), int(fj); fx, fz = fi - i, fj - j
    h = heights
    a = h[j * nx + i] * (1 - fx) + h[j * nx + i + 1] * fx
    b = h[(j + 1) * nx + i] * (1 - fx) + h[(j + 1) * nx + i + 1] * fx
    return a * (1 - fz) + b * fz


# ---------------------------------------------------------------- OSM
osm = json.load(open(OSM))["elements"]


def ring(geom):
    pts = [proj(p["lat"], p["lon"]) for p in geom if p]
    if len(pts) > 1 and abs(pts[0][0] - pts[-1][0]) < 1e-6 and abs(pts[0][1] - pts[-1][1]) < 1e-6:
        pts = pts[:-1]
    # dedupe consecutive
    clean = []
    for p in pts:
        if not clean or math.hypot(p[0] - clean[-1][0], p[1] - clean[-1][1]) > 0.3:
            clean.append(p)
    return [[round(x, 1), round(z, 1)] for x, z in clean]


def area(r):
    return sum(r[i][0] * r[(i + 1) % len(r)][1] - r[(i + 1) % len(r)][0] * r[i][1] for i in range(len(r))) / 2


def stitch(lines):
    # a multipolygon ring may be split over several ways: join them end to end into closed rings
    key = lambda p: (round(p["lat"], 7), round(p["lon"], 7))
    rings, open_ = [], []
    for g in lines:
        g = [p for p in g if p]
        if len(g) < 2:
            continue
        (rings if key(g[0]) == key(g[-1]) else open_).append(list(g))
    while open_:
        cur = open_.pop(0)
        grown = True
        while key(cur[0]) != key(cur[-1]) and grown:
            grown = False
            for i, g in enumerate(open_):
                if key(g[0]) == key(cur[-1]): cur += g[1:]
                elif key(g[-1]) == key(cur[-1]): cur += g[::-1][1:]
                elif key(g[-1]) == key(cur[0]): cur = g[:-1] + cur
                elif key(g[0]) == key(cur[0]): cur = g[::-1][:-1] + cur
                else: continue
                open_.pop(i); grown = True
                break
        if len(cur) >= 3:
            rings.append(cur)  # an unclosable chain is closed straight back to its start
    return rings


def outer_rings(e):
    if e["type"] == "way":
        return [ring(e["geometry"])]
    return [ring(g) for g in stitch([m["geometry"] for m in e.get("members", []) if m.get("role") == "outer" and m.get("geometry")])]


def inner_rings(e):
    if e["type"] != "relation":
        return []
    return [ring(g) for g in stitch([m["geometry"] for m in e.get("members", []) if m.get("role") == "inner" and m.get("geometry")])]


def hash01(s):
    return int(hashlib.md5(s.encode()).hexdigest()[:8], 16) / 0xFFFFFFFF


DEFAULT_LEVELS = {"house": 2, "apartments": 15, "residential": 5, "school": 4, "college": 5,
                  "university": 5, "dormitory": 8, "commercial": 4, "retail": 2, "kindergarten": 2}

buildings, roads, areas = [], [], []
ROAD_W = {"motorway": 16, "trunk": 14, "primary": 12, "secondary": 11, "tertiary": 8,
          "residential": 6, "unclassified": 6, "living_street": 5, "service": 4.5,
          "pedestrian": 4, "footway": 2.2, "path": 2, "cycleway": 2.2, "steps": 2.5, "track": 3}

for e in osm:
    t = e.get("tags", {})
    if "building" in t:
        for r in outer_rings(e):
            if len(r) < 3:
                continue
            a = area(r)
            if abs(a) < 12:
                continue
            if a < 0:  # make counter-clockwise in (x,z) -> consistent winding
                r = r[::-1]
            name = t.get("name") or CFG.get("names", {}).get(e["id"], "")
            kind = t["building"]
            if "height" in t:
                try: h = float(t["height"].replace("m", ""))
                except ValueError: h = None
            else:
                h = None
            lv = t.get("building:levels")
            try: lv = int(float(lv)) if lv else None
            except ValueError: lv = None
            if lv is None:
                if kind in DEFAULT_LEVELS:
                    lv = DEFAULT_LEVELS[kind]
                else:
                    aa = abs(a)
                    lv = 5 if aa > 2500 else 4 if aa > 800 else 3 if aa > 200 else 2
                    if aa > 800: lv += int(hash01(str(e["id"])) * 3)
            if "정문" in name:
                lv, h = 1, 9.0
            if h is None:
                h = lv * 3.6 + 1.0
            hs = [hgt(x, z) for x, z in r]
            cx = sum(p[0] for p in r) / len(r); cz = sum(p[1] for p in r) / len(r)
            rec = {"id": e["id"], "n": name, "k": kind, "lv": max(1, lv), "h": round(h, 1),
                   "b": round(min(hs + [hgt(cx, cz)]), 2), "p": r}
            holes = inner_rings(e)
            if holes:
                rec["in"] = holes  # courtyards, for hand-made models
            buildings.append(rec)
    elif e["type"] == "way" and "highway" in t and e.get("geometry"):
        w = ROAD_W.get(t["highway"])
        if not w:
            continue
        # underground roads must neither be painted on the ground nor carve the hills above them
        if t.get("tunnel", "no") != "no" or t.get("covered", "no") != "no" or t.get("indoor", "no") != "no":
            continue
        try:
            if float(t.get("layer", 0)) < 0:
                continue
        except ValueError:
            pass
        pts = [list(map(lambda v: round(v, 1), proj(p["lat"], p["lon"]))) for p in e["geometry"]]
        rec = {"w": w, "t": t["highway"], "p": pts}
        if t.get("bridge", "no") != "no":
            rec["br"] = 1  # keeps its deck height: the ground below is left alone
        roads.append(rec)
    elif e["type"] in ("way", "relation") and ("landuse" in t or "leisure" in t or "natural" in t or t.get("amenity") == "parking"):
        k = t.get("landuse") or t.get("leisure") or t.get("natural") or "parking"
        m = {"grass": "grass", "park": "grass", "recreation_ground": "grass", "meadow": "grass",
             "village_green": "grass", "garden": "grass", "golf_course": "grass", "farmland": "farm",
             "orchard": "farm", "forest": "wood", "wood": "wood", "scrub": "wood", "pitch": "pitch",
             "track": "track", "stadium": "pitch", "parking": "parking", "residential": "res",
             "education": "edu", "university": "edu", "construction": "dirt", "water": "water",
             "commercial": "res", "retail": "res", "cemetery": "grass", "playground": "pitch"}.get(k)
        if not m:
            continue
        for r in outer_rings(e):
            if len(r) >= 3:
                areas.append({"k": m, "p": r})
        if m == "water":  # islands in lakes
            for r in inner_rings(e):
                if len(r) >= 3 and abs(area(r)) > 40:
                    areas.append({"k": "wood", "p": r, "island": 1})


for x in CFG["extra"]:
    r = [list(p) for p in x["p"]]
    if area(r) < 0:
        r = r[::-1]
    buildings.append({"id": x["id"], "n": x["n"], "k": x["k"], "lv": x["lv"], "h": x["h"], "b": 0, "p": r})


# ---------------------------------------------------------------- terrain shaping
# Real campuses are graded: roads follow smooth grades, sports fields and building
# pads are flat, and wooded hills keep small natural bumps. Apply that to the DEM.
import base64

H = heights  # flat list nz*nx


def blend_region(x0b, z0b, x1b, z1b, fn):
    """Apply fn(x, z, h) -> (target, weight) to grid vertices in a bbox."""
    i0 = max(0, int((x0b - x_min) / STEP)); i1 = min(nx - 1, int((x1b - x_min) / STEP) + 1)
    j0 = max(0, int((z0b - z_min) / STEP)); j1 = min(nz - 1, int((z1b - z_min) / STEP) + 1)
    for j in range(j0, j1 + 1):
        z = z_min + j * STEP
        for i in range(i0, i1 + 1):
            x = x_min + i * STEP
            k = j * nx + i
            r = fn(x, z, H[k])
            if r:
                t, w = r
                if w > 0:
                    H[k] = H[k] * (1 - w) + t * w


def seg_dist(px, pz, ax, az, bx, bz):
    dx, dz = bx - ax, bz - az
    L2 = dx * dx + dz * dz
    t = 0 if L2 == 0 else max(0, min(1, ((px - ax) * dx + (pz - az) * dz) / L2))
    qx, qz = ax + dx * t, az + dz * t
    return math.hypot(px - qx, pz - qz), t


def smoothstep(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


def pip(pts, x, z):
    c = False
    j = len(pts) - 1
    for i in range(len(pts)):
        a, b = pts[i], pts[j]
        if (a[1] > z) != (b[1] > z) and x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]:
            c = not c
        j = i
    return c


def poly_dist(pts, x, z):
    d = min(seg_dist(x, z, pts[i][0], pts[i][1], pts[(i + 1) % len(pts)][0], pts[(i + 1) % len(pts)][1])[0] for i in range(len(pts)))
    return -d if pip(pts, x, z) else d


def bbox(pts):
    xs = [p[0] for p in pts]; zs = [p[1] for p in pts]
    return min(xs), min(zs), max(xs), max(zs)


for a in CFG.get("areas", []):
    r = [list(p) for p in a["p"]]
    areas.append({**a, "p": r if area(r) > 0 else r[::-1]})


def add_infill(cfg):
    """Small generated houses on city blocks OSM leaves empty (deterministic)."""
    s, w, n, e = BBOX
    regions = [[list(proj(la, lo)) for la, lo in r] for r in cfg.get("regions", [cfg.get("region", [(s, w), (s, e), (n, e), (n, w)])])]
    region = [p for r in regions for p in r]  # bounding points of all regions
    outline = [r for e in osm if (e["type"], e["id"]) == CFG["outline"] for r in outer_rings(e)]
    # optional: "avoid" adds area kinds (e.g. park grass); "tallGap" keeps houses that far from 8+ storey blocks,
    # so apartment-complex courtyards stay open
    blocked = [a["p"] for a in areas if a["k"] in ("wood", "water", "pitch", "track", "parking", *cfg.get("avoid", []))] + outline
    tall_gap = cfg.get("tallGap", 0)
    BIN = 30.0
    road_bins, bld_bins, tall_bins = {}, {}, {}
    for b in buildings:
        if tall_gap and b["lv"] >= 8:
            x0b, z0b, x1b, z1b = bbox(b["p"])
            for i in range(int(x0b // BIN), int(x1b // BIN) + 1):
                for j in range(int(z0b // BIN), int(z1b // BIN) + 1):
                    tall_bins.setdefault((i, j), []).append(b["p"])
    for r in roads:
        for a, b in zip(r["p"], r["p"][1:]):
            n = max(1, int(math.hypot(b[0] - a[0], b[1] - a[1]) / 12))
            for k in range(n + 1):
                x, z = a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n
                road_bins.setdefault((int(x // BIN), int(z // BIN)), []).append((a, b, r["w"], r["t"]))
    def add_bld(p):
        x0b, z0b, x1b, z1b = bbox(p)
        for i in range(int(x0b // BIN), int(x1b // BIN) + 1):
            for j in range(int(z0b // BIN), int(z1b // BIN) + 1):
                bld_bins.setdefault((i, j), []).append(p)
    for b in buildings:
        add_bld(b["p"])
    def near(bins, x, z):
        cx, cz = int(x // BIN), int(z // BIN)
        return [v for i in range(cx - 1, cx + 2) for j in range(cz - 1, cz + 2) for v in bins.get((i, j), [])]
    x0r, z0r, x1r, z1r = bbox(region)
    step, count, row = cfg["step"], 0, 0
    z = max(z0r, z_min + 12)
    while z < min(z1r, z_min + (nz - 1) * STEP - 12):
        x = max(x0r, x_min + 12) + (row % 2) * step / 2
        while x < min(x1r, x_min + (nx - 1) * STEP - 12):
            key = f"{x:.1f},{z:.1f}"
            px = x + (hash01(key + "x") - 0.5) * 5; pz = z + (hash01(key + "z") - 0.5) * 5
            x += step
            if math.hypot(px, pz) < 45 or not any(pip(r, px, pz) for r in regions) or any(pip(q, px, pz) for q in blocked):
                continue  # the gate plaza stays open
            if tall_gap and any(pip(t, px, pz) or min(seg_dist(px, pz, *t[i - 1], *t[i])[0] for i in range(len(t))) < tall_gap
                                for t in near(tall_bins, px, pz)):
                continue
            best, ux, uz, ok = 1e9, 1.0, 0.0, True
            for a, b, w, t in near(road_bins, px, pz):
                d = seg_dist(px, pz, a[0], a[1], b[0], b[1])[0]
                if d < w / 2 + 5.5:
                    ok = False; break
                if d < best and t not in ("footway", "path", "steps", "cycleway"):
                    L = math.hypot(b[0] - a[0], b[1] - a[1]) or 1
                    best, ux, uz = d, (b[0] - a[0]) / L, (b[1] - a[1]) / L
            if not ok or best > 45:
                continue
            hw = 4 + hash01(key + "w") * 2.2; hd = 4.2 + hash01(key + "d") * 2.2
            p = [[round(px + sx * hw * ux - sz * hd * uz, 1), round(pz + sx * hw * uz + sz * hd * ux, 1)]
                 for sx, sz in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
            if any(any(pip(o, c[0], c[1]) for c in p + [[px, pz]]) or any(pip(p, q[0], q[1]) for q in o)
                   for o in near(bld_bins, px, pz)):
                continue
            if area(p) < 0:
                p = p[::-1]
            lv = 2 + int(hash01(key + "l") * 3)
            buildings.append({"id": 9300000000 + count, "n": "", "k": "house" if hash01(key + "k") < 0.4 else "yes",
                              "lv": lv, "h": round(lv * 2.9 + 0.6, 1), "b": 0, "p": p})
            add_bld(p); count += 1
        z += step * 0.86; row += 1
    print("infill houses", count)


if CFG.get("infill"):
    add_infill(CFG["infill"])

# 1. natural micro relief on wooded / grassy hills (deterministic value noise)
def vnoise(x, z):
    def h(i, j):
        n = (i * 374761393 + j * 668265263) & 0xFFFFFFFF
        n = ((n ^ (n >> 13)) * 1274126177) & 0xFFFFFFFF
        return (n & 0xFFFF) / 65535.0
    i, j = math.floor(x), math.floor(z)
    fx, fz = x - i, z - j
    fx = fx * fx * (3 - 2 * fx); fz = fz * fz * (3 - 2 * fz)
    a = h(i, j) * (1 - fx) + h(i + 1, j) * fx
    b = h(i, j + 1) * (1 - fx) + h(i + 1, j + 1) * fx
    return a * (1 - fz) + b * fz


woods = [a["p"] for a in areas if a["k"] == "wood"]
for j in range(nz):
    z = z_min + j * STEP
    for i in range(nx):
        x = x_min + i * STEP
        n = (vnoise(x / 40, z / 40) - 0.5) * 3.0 + (vnoise(x / 13 + 7, z / 13 + 3) - 0.5) * 1.0
        H[j * nx + i] += n

# 2. roads: smooth grade along the centreline, flat across the carriageway
for r in roads:
    pts = r["p"]
    if len(pts) < 2 or r.get("br"):
        continue
    w = r["w"]
    # densify and smooth heights along the road
    dense = []
    for a, b in zip(pts, pts[1:]):
        L = math.hypot(b[0] - a[0], b[1] - a[1])
        n = max(1, int(L / 3))
        for k in range(n):
            t = k / n
            dense.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
    dense.append(tuple(pts[-1]))
    raw = [hgt(x, z) for x, z in dense]
    win = 6 if w >= 6 else 3
    sm = [sum(raw[max(0, k - win):k + win + 1]) / len(raw[max(0, k - win):k + win + 1]) for k in range(len(raw))]
    inner, outer = w / 2 + 0.8, w / 2 + (7 if w >= 6 else 3.5)
    for k in range(len(dense) - 1):
        (ax, az), (bx, bz) = dense[k], dense[k + 1]
        ha, hb = sm[k], sm[k + 1]

        def fn(x, z, h, ax=ax, az=az, bx=bx, bz=bz, ha=ha, hb=hb):
            d, t = seg_dist(x, z, ax, az, bx, bz)
            if d > outer:
                return None
            return ha + (hb - ha) * t, 1 - smoothstep(inner, outer, d)
        blend_region(min(ax, bx) - outer, min(az, bz) - outer, max(ax, bx) + outer, max(az, bz) + outer, fn)

# 2b. ponds and lakes lie level, slightly below their banks
for a in areas:
    if a["k"] != "water":
        continue
    pts = a["p"]
    x0b, z0b, x1b, z1b = bbox(pts)
    if x0b < x_min or z0b < z_min or x1b > x_min + (nx - 1) * STEP or z1b > z_min + (nz - 1) * STEP or (x1b - x0b) * (z1b - z0b) > 600000:
        continue  # rivers running off the map keep their natural fall
    shore = sorted(hgt(x, z) for x, z in pts)
    target = shore[len(shore) // 4] - 0.8

    def fn(x, z, h, pts=pts, target=target):
        d = poly_dist(pts, x, z)
        if d > 7:
            return None
        return target, 1 - smoothstep(-1, 7, d)
    blend_region(x0b - 7, z0b - 7, x1b + 7, z1b + 7, fn)

for a in areas:
    if not a.get("island"):
        continue
    pts = a["p"]
    x0b, z0b, x1b, z1b = bbox(pts)
    level = min(hgt(x, z) for x, z in pts)

    def fn(x, z, h, pts=pts, level=level):
        d = poly_dist(pts, x, z)
        return (level + 2.2, 1 - smoothstep(-3, 1.5, d)) if d < 1.5 else None
    blend_region(x0b - 2, z0b - 2, x1b + 2, z1b + 2, fn)

# 3. flat areas: pitches, tracks, parking
for a in areas:
    if a["k"] not in ("pitch", "track", "parking") and not a.get("flat"):
        continue
    pts = a["p"]
    x0b, z0b, x1b, z1b = bbox(pts)
    samples = [hgt(x0b + (x1b - x0b) * u / 6, z0b + (z1b - z0b) * v / 6) for u in range(7) for v in range(7)
               if pip(pts, x0b + (x1b - x0b) * u / 6, z0b + (z1b - z0b) * v / 6)] or [hgt(*pts[0])]
    target = sum(samples) / len(samples)

    def fn(x, z, h, pts=pts, target=target):
        d = poly_dist(pts, x, z)
        if d > 6:
            return None
        return target, 1 - smoothstep(0.5, 6, d)
    blend_region(x0b - 6, z0b - 6, x1b + 6, z1b + 6, fn)

# 4. building pads: each building sits on a level pad; slopes are cut around it
for b in buildings:
    pts = b["p"]
    x0b, z0b, x1b, z1b = bbox(pts)
    cx = sum(p[0] for p in pts) / len(pts); cz = sum(p[1] for p in pts) / len(pts)
    samples = [hgt(x, z) for x, z in pts] + [hgt(cx, cz)]
    target = sorted(samples)[len(samples) // 2]
    b["b"] = round(target, 2)
    m = 9 if abs(area(pts)) > 400 else 5

    def fn(x, z, h, pts=pts, target=target, m=m):
        d = poly_dist(pts, x, z)
        if d > m:
            return None
        return target, 1 - smoothstep(1.0, m, d)
    blend_region(x0b - m, z0b - m, x1b + m, z1b + m, fn)

terrain_b64 = base64.b64encode(array.array("h", [max(-32768, min(32767, int(round(v * 10)))) for v in H]).tobytes()).decode()

campus = []
for e in osm:
    if (e["type"], e["id"]) == CFG["outline"]:
        campus = outer_rings(e)

# sort areas: large first so small (pitch, parking) draw on top
areas.sort(key=lambda a: -abs(area(a["p"])))

out = {
    "origin": [LAT0, LON0], "baseElev": round(BASE_ELEV, 1),
    "terrain": {"x0": round(x_min, 1), "z0": round(z_min, 1), "step": STEP, "nx": nx, "nz": nz, "h16": terrain_b64},
    "buildings": buildings, "roads": roads, "areas": areas, "campus": campus,
    "attribution": "© OpenStreetMap contributors (ODbL); terrain: Copernicus DEM GLO-30",
}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump(out, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
print("buildings", len(buildings), "roads", len(roads), "areas", len(areas), "terrain", nx, nz,
      "h range", round(min(H), 1), round(max(H), 1), "size", os.path.getsize(OUT))
