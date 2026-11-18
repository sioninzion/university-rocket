#!/usr/bin/env python3
"""Copy each campus's hero building (src/campuses.js `hero.id`) into data/heroes.json for the picker."""
import json, re

src = open("src/campuses.js", encoding="utf-8").read()
out = {}
for cid, hid in re.findall(r"^  (\w+): \{.*?hero: \{ id: (\d+)", src, re.M | re.S):
    rec = next(b for b in json.load(open(f"data/{cid}.json", encoding="utf-8"))["buildings"] if b["id"] == int(hid))
    out[cid] = rec
    print(cid, rec["n"], rec["b"])
json.dump(out, open("data/heroes.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
