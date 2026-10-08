#!/usr/bin/env python3
"""수집한 기출을 문항 단위 작업 폴더로 만들고(prepare), 분류가 끝난 문항을 교과서용 데이터로 내보낸다(publish).

  python3 tools/exams/process.py prepare   # exams/manifest.json → exams/work/<시험 id>/{NN.webp, items.json, answer.png, task.json}
  python3 tools/exams/process.py publish   # exams/work/*/meta.json → exams/img/<시험 id>/*.webp, exams/sec/<절>.json, exams/index.json

meta.json(분류 작업자가 쓴다) = [{"img": "07.webp", "answer": "3", "sec": "phy-1-2" 또는 null, "conf": "high"|"low"}]
  answer: 객관식은 보기 번호 1~5, 단답형은 숫자 그대로. sec: 2022 개정 교과서의 절(<과목>-<대단원>-<절>), 맞는 절이 없으면 null.
"""
import json, pathlib, shutil, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
EX = ROOT / "exams"
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import crop  # noqa: E402

KIND = {"csat": "csat", "mock": "mock", "hakp": "hakp"}


def prepare():
    man = json.loads((EX / "manifest.json").read_text())
    done = skipped = failed = 0
    for e in man["exams"]:
        if e.get("status") != "ok":
            continue
        work = EX / "work" / e["id"]
        if (work / "items.json").exists():
            skipped += 1
            continue
        try:
            sys.argv = ["crop", str(ROOT / e["mun_path"]), str(work)]
            crop.main()
            if e.get("hsj_path") and (ROOT / e["hsj_path"]).exists():
                subprocess.run(["pdftoppm", "-r", "110", "-f", "1", "-l", "1", "-png", "-singlefile",
                                str(ROOT / e["hsj_path"]), str(work / "answer")], check=True)
            (work / "task.json").write_text(json.dumps(e, ensure_ascii=False, indent=1))
            done += 1
        except (SystemExit, Exception) as err:   # 한 시험지가 깨져도 나머지는 계속
            failed += 1
            print(f"실패 {e['id']}: {err}")
    print(f"prepare: 새로 {done}, 이미 있음 {skipped}, 실패 {failed}")


def publish():
    by_sec, total, missing = {}, 0, []
    for work in sorted((EX / "work").iterdir()):
        meta_p = work / "meta.json"
        if not meta_p.exists():
            missing.append(work.name)
            continue
        task = json.loads((work / "task.json").read_text())
        items = {it["img"]: it for it in json.loads((work / "items.json").read_text())}
        img_dir = EX / "img" / work.name
        img_dir.mkdir(parents=True, exist_ok=True)
        for m in json.loads(meta_p.read_text()):
            it = items.get(m["img"])
            if not it or not m.get("sec") or m.get("answer") in (None, ""):
                continue
            shutil.copy2(work / m["img"], img_dir / m["img"])
            subj = task["subject"] + (f" ({it['elective']})" if it.get("elective") else "")
            by_sec.setdefault(m["sec"], []).append({
                "id": f"ex-{work.name}-{m['img'].rsplit('.', 1)[0]}", "src": task["id"],
                "year": task.get("school_year") or task["year_admin"], "grade": task["grade"], "month": task["month"],
                "kind": KIND[task["kind"]], "subject": subj, "no": it["no"], "pts": it.get("pts"),
                "img": f"exams/img/{work.name}/{m['img']}", "text": it.get("text", ""), "type": it["type"],
                "answer": str(m["answer"]), "conf": m.get("conf", "high")})
            total += 1
    sec_dir = EX / "sec"
    if sec_dir.exists():
        shutil.rmtree(sec_dir)
    sec_dir.mkdir()
    for sec, items in by_sec.items():
        (sec_dir / f"{sec}.json").write_text(json.dumps({"sec": sec, "items": items}, ensure_ascii=False))
    (EX / "index.json").write_text(json.dumps({k: len(v) for k, v in sorted(by_sec.items())}, ensure_ascii=False, indent=0))
    print(f"publish: 문항 {total}개, 절 {len(by_sec)}개, 분류 안 된 시험 {len(missing)}개")


if __name__ == "__main__":
    {"prepare": prepare, "publish": publish}[sys.argv[1]]()
