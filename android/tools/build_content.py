#!/usr/bin/env python3
"""Build app/src/main/assets/content/munajaat.json.

Clean pipeline: merges two reviewed source files in this directory:
  * arabic_content.json   — Arabic text + day/item structure only.
  * english_translation.json — fresh independent English translation only.

Each item's ``footnotes`` list is taken from ``english_translation.json``
(source/instruction notes reviewed against the Urdu edition); items without
notes ship an empty list. The merged document is validated (day order, item
counts, sequential ``n``, non-empty Arabic/English fields, well-formed
footnotes) before it is written.

Usage: tools/build_content.py
"""

import json
import sys
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
ARABIC_SRC = TOOLS / "arabic_content.json"
ENGLISH_SRC = TOOLS / "english_translation.json"
OUT_PATH = TOOLS.parent / "app/src/main/assets/content/munajaat.json"

EXPECTED = [("saturday", "Saturday", 46), ("sunday", "Sunday", 35),
            ("monday", "Monday", 31), ("tuesday", "Tuesday", 33),
            ("wednesday", "Wednesday", 22), ("thursday", "Thursday", 15),
            ("friday", "Friday", 13)]


def fail(msg):
    print(f"FAIL: {msg}")
    sys.exit(1)


def load(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        fail(f"missing source file: {path}")
    except json.JSONDecodeError as e:
        fail(f"{path} does not parse: {e}")


def main():
    arabic = load(ARABIC_SRC)
    english = load(ENGLISH_SRC)
    errors = []

    a_days = arabic.get("days", [])
    e_days = english.get("days", [])
    if [d.get("id") for d in a_days] != [e for e, _, _ in EXPECTED]:
        errors.append("arabic_content.json day order/ids do not match the expected 7 days")
    if [d.get("id") for d in e_days] != [e for e, _, _ in EXPECTED]:
        errors.append("english_translation.json day order/ids do not match the expected 7 days")

    out_days = []
    for idx, (exp_id, exp_title, exp_count) in enumerate(EXPECTED):
        if idx >= len(a_days) or idx >= len(e_days):
            continue
        a_items = a_days[idx].get("items", [])
        e_items = e_days[idx].get("items", [])
        if len(a_items) != exp_count:
            errors.append(f"{exp_id}: arabic_content has {len(a_items)} items, expected {exp_count}")
        if len(e_items) != exp_count:
            errors.append(f"{exp_id}: english_translation has {len(e_items)} items, expected {exp_count}")
        merged = []
        for n in range(1, min(len(a_items), len(e_items)) + 1):
            a, e = a_items[n - 1], e_items[n - 1]
            if a.get("n") != n:
                errors.append(f"{exp_id} item {n}: arabic n={a.get('n')!r} (not sequential)")
            if e.get("n") != n:
                errors.append(f"{exp_id} item {n}: english n={e.get('n')!r} (not sequential)")
            atext = a.get("arabic", "")
            etext = e.get("english", "")
            if not isinstance(atext, str) or not atext.strip():
                errors.append(f"{exp_id} item {n}: arabic is empty")
            if not isinstance(etext, str) or not etext.strip():
                errors.append(f"{exp_id} item {n}: english is empty")
            fns = e.get("footnotes", [])
            if not isinstance(fns, list) or any(
                    not isinstance(f, str) or not f.strip() for f in fns):
                errors.append(f"{exp_id} item {n}: footnotes must be a list of non-empty strings")
                fns = []
            utext = e.get("urdu", "")
            if not isinstance(utext, str):
                errors.append(f"{exp_id} item {n}: urdu must be a string")
                utext = ""
            item = {"n": n, "arabic": atext, "english": etext, "footnotes": fns}
            if utext.strip():
                item["urdu"] = utext
            merged.append(item)
        out_days.append({"id": exp_id, "title": exp_title, "items": merged})

    if errors:
        print(f"FAIL: {len(errors)} validation error(s):")
        for e in errors:
            print("  -", e)
        return 1

    doc = {"version": 1, "title": "Munajaat-e-Maqbool", "days": out_days}
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    total = sum(len(d["items"]) for d in out_days)
    nfn = sum(len(i["footnotes"]) for d in out_days for i in d["items"])
    print(f"Wrote {OUT_PATH} ({total} items, {nfn} footnotes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
