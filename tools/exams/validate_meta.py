#!/usr/bin/env python3
"""분류 작업자가 쓴 exams/work/<시험 id>/meta.json 을 검사한다.

사용: python3 tools/exams/validate_meta.py <작업 폴더> [<작업 폴더> ...]
통과 조건: items.json 의 모든 문항 이미지가 meta.json 에 한 번씩 있고, answer 가 객관식이면 1~5, 단답형이면 숫자,
sec 은 교과서 배치표(curricula/2022.json)에 있는 절이거나 null.
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
cur = json.loads((ROOT / "curricula/2022.json").read_text())
SECS = {f'{c["id"]}-{ch["n"]}-{s["n"]}' for c in cur["courses"] for ch in c["chapters"] for s in ch["sections"]}

bad = 0
for d in map(pathlib.Path, sys.argv[1:]):
    errs = []
    try:
        items = {it["img"]: it for it in json.loads((d / "items.json").read_text())}
        meta = json.loads((d / "meta.json").read_text())
    except (OSError, ValueError) as e:
        print(f"FAIL {d.name}: {e}"); bad += 1; continue
    seen = [m.get("img") for m in meta]
    for img in items:
        if seen.count(img) != 1:
            errs.append(f"{img}: meta 에 {seen.count(img)}번")
    for m in meta:
        it = items.get(m.get("img"))
        if not it:
            errs.append(f"{m.get('img')}: items.json 에 없음"); continue
        a = str(m.get("answer", ""))
        if it["type"] == "mc" and a not in {"1", "2", "3", "4", "5"}:
            errs.append(f"{m['img']}: 객관식 답 {a!r}")
        if it["type"] == "short" and not re.fullmatch(r"-?\d+", a):
            errs.append(f"{m['img']}: 단답형 답 {a!r}")
        if m.get("sec") is not None and m["sec"] not in SECS:
            errs.append(f"{m['img']}: 없는 절 {m['sec']}")
    print(("OK   " if not errs else "FAIL ") + d.name + (f" ({len(meta)}문항, 분류 {sum(1 for m in meta if m.get('sec'))})" if not errs else ""))
    for e in errs[:10]:
        print("     " + e)
    bad += bool(errs)
sys.exit(1 if bad else 0)
