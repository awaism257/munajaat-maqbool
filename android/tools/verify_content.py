#!/usr/bin/env python3
"""Validate app/src/main/assets/content/munajaat.json against the SPEC data
contract. Exits non-zero and prints every violation found on failure.

Usage: tools/verify_content.py [path-to-munajaat.json]
"""

import json
import re
import sys
from pathlib import Path

EXPECTED = [("saturday", "Saturday", 46), ("sunday", "Sunday", 35),
            ("monday", "Monday", 31), ("tuesday", "Tuesday", 33),
            ("wednesday", "Wednesday", 22), ("thursday", "Thursday", 15),
            ("friday", "Friday", 13)]
ARABIC_RE = re.compile(r"[؀-ۿ]")


def main():
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else \
        Path(__file__).resolve().parent.parent / "app/src/main/assets/content/munajaat.json"
    errors = []

    raw = path.read_bytes()
    try:
        raw.decode("utf-8")
    except UnicodeDecodeError as e:
        errors.append(f"file is not valid UTF-8: {e}")
        raw = b"{}"
    try:
        doc = json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"FAIL: JSON does not parse: {e}")
        return 1

    if doc.get("version") != 1:
        errors.append("version must be 1")
    if doc.get("title") != "Munajaat-e-Maqbool":
        errors.append("title must be 'Munajaat-e-Maqbool'")

    days = doc.get("days")
    if not isinstance(days, list):
        errors.append("'days' must be a list")
        days = []
    if len(days) != 7:
        errors.append(f"expected exactly 7 days, got {len(days)}")

    for idx, (exp_id, exp_title, exp_count) in enumerate(EXPECTED):
        if idx >= len(days):
            errors.append(f"missing day '{exp_id}'")
            continue
        d = days[idx]
        if d.get("id") != exp_id:
            errors.append(f"day {idx + 1}: id must be '{exp_id}', got {d.get('id')!r}")
        if d.get("title") != exp_title:
            errors.append(f"{exp_id}: title must be '{exp_title}', got {d.get('title')!r}")
        items = d.get("items")
        if not isinstance(items, list):
            errors.append(f"{exp_id}: 'items' must be a list")
            continue
        if len(items) != exp_count:
            errors.append(f"{exp_id}: expected {exp_count} items, got {len(items)}")
        for i, it in enumerate(items, 1):
            where = f"{exp_id} item {i}"
            if it.get("n") != i:
                errors.append(f"{where}: n must be sequential ({i}), got {it.get('n')!r}")
            arabic = it.get("arabic")
            if not isinstance(arabic, str) or not arabic.strip():
                errors.append(f"{where}: arabic is empty/missing")
            elif not ARABIC_RE.search(arabic):
                errors.append(f"{where}: arabic contains no Arabic characters")
            english = it.get("english")
            if not isinstance(english, str) or not english.strip():
                errors.append(f"{where}: english is empty/missing")
            fns = it.get("footnotes")
            if not isinstance(fns, list):
                errors.append(f"{where}: footnotes must be a list")
            else:
                for j, f in enumerate(fns, 1):
                    if not isinstance(f, str) or not f.strip():
                        errors.append(f"{where}: footnote {j} is empty/non-string")

    if errors:
        print(f"FAIL: {len(errors)} violation(s) in {path}")
        for e in errors:
            print("  -", e)
        return 1
    total = sum(c for _, _, c in EXPECTED)
    nfn = sum(len(i["footnotes"]) for d in days for i in d["items"])
    print(f"PASS: {path}")
    print(f"  7 days in order, {total} items total "
          f"({'/'.join(str(c) for _, _, c in EXPECTED)}), {nfn} footnotes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
