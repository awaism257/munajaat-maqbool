#!/usr/bin/env python3
"""Standardize hadith source footnotes to uniform 'Source cited: <Book>, no. X.' format.

Applies verified reference numbers from refs_*.json research files and
normalizes bare numbers in existing footnotes. Idempotent.
"""
import json, re, sys

BASE = "/tmp/wt-refs"
ET_PATH = BASE + "/tools/english_translation.json"

def load_refs(*paths):
    m = {}
    for p in paths:
        d = json.load(open(p))
        for day, items in d.items():
            for it in items:
                m[(day.lower(), it["n"])] = it
    return m

refs = load_refs(
    "/mnt/agents/output/work/refs_sat_sun.json",
    "/mnt/agents/output/work/refs_mon_tue.json",
    "/mnt/agents/output/work/refs_wed_thu_fri.json",
)

CORRECTION_NOTES = {
    ("saturday", 39): " Printed citation (al-Tirmidhi, Abu Dawud, and Ibn Majah) not verifiable; corrected sources given.",
    ("saturday", 37): " Printed citation (Musnad Ahmad) not verifiable; verified source given.",
    ("sunday", 29):   " Printed citation (al-Tirmidhi) not verifiable; verified source given.",
    ("thursday", 7):  " Printed citation (Musnad Ahmad) not verifiable; verified alternate sources given.",
    ("sunday", 1):    " (cited for items 1-2)",
    ("friday", 3):    " (the booklet cites Kanz al-Ummal, which in turn cites al-Daylami)",
}

def build_new(k, item):
    if k == ("wednesday", 10):
        return "Source cited: Musannaf Abd al-Razzaq, no. 4968 (mawquf — Umar (RA))."
    if k == ("saturday", 46):
        return ("Source cited: Musnad Ahmad, no. 12113 "
                "(the booklet gives a composite citation of al-Bukhari, Muslim, and Ahmad).")
    good = [r for r in item["refs"] if r.get("number")
            and "candidate" not in (r.get("note") or "")]
    bad = [r for r in item["refs"] if not r.get("number")]
    if good:
        s = "; ".join(f"{r['book']}, no. {r['number']}" for r in good)
        if k == ("monday", 28):
            return ("Source cited: the closing passage is the Prophet's (SAW) dua "
                    "at al-Ta'if — " + s + ".")
        note = CORRECTION_NOTES.get(k, "")
        if k == ("wednesday", 17) and item.get("note"):
            note = " " + item["note"]
        return f"Source cited: {s}.{note}".rstrip()
    if bad:
        return f"Source cited: {bad[0]['book']}."
    return None

def normalize_numbers(s):
    def rep(m):
        prefix = m.group(1)
        if re.search(r"(vol\.|p\.|no\.|verse[s]?|items?)$", prefix):
            return m.group(0)
        return prefix + ", no. " + m.group(2)
    return re.sub(r"(.*?[A-Za-z'’]) (\d{2,5}[a-z]?)(?=[)\s;,.]|$)", rep, s)

et = json.load(open(ET_PATH))
changed = 0
for d in et["days"]:
    for it in d["items"]:
        k = (d["id"], it["n"])
        fns = it.get("footnotes", [])
        if not fns:
            continue
        if k in refs:
            nf = build_new(k, refs[k])
            if nf and fns != [nf]:
                it["footnotes"] = [nf]
                changed += 1
        else:
            new_fns = [normalize_numbers(f) for f in fns]
            if new_fns != fns:
                it["footnotes"] = new_fns
                changed += 1

json.dump(et, open(ET_PATH, "w"), ensure_ascii=False, indent=1)
print(f"updated {changed} footnotes")
