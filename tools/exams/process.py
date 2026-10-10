#!/usr/bin/env python3
"""수집한 기출을 문항 단위 작업 폴더로 만들고(prepare), 분류가 끝난 문항을 교과서용 데이터로 내보낸다(publish).

  python3 tools/exams/process.py prepare   # exams/manifest.json → exams/work/<시험 id>/{NN.webp, items.json, answer.png, task.json}
  python3 tools/exams/process.py publish   # exams/work/*/meta.json → exams/img/<시험 id>/*.webp, exams/sec/<절>.json, exams/index.json

meta.json(분류 작업자가 쓴다) = [{"img": "07.webp", "answer": "3", "sec": "phy-1-2" 또는 null, "conf": "high"|"low"}]
  answer: 객관식은 보기 번호 1~5, 단답형은 숫자 그대로. sec: 2022 개정 교과서의 절(<과목>-<대단원>-<절>), 맞는 절이 없으면 null.
"""
import json, pathlib, re, shutil, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
EX = ROOT / "exams"
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import crop  # noqa: E402

KIND = {"csat": "csat", "mock": "mock", "hakp": "hakp"}
# 수식 글꼴은 pdftotext에서 사용자 정의 영역(PUA) 문자로 나온다. 검색에 쓸모가 없으므로 지운다.
PUA = re.compile(r"[\ue000-\uf8ff]+")


def search_text(s):
    return re.sub(r"\s+", " ", PUA.sub(" ", s)).strip()


def contact_sheets(work, per=6):
    """분류 작업자가 이미지를 덜 열도록 문항 여러 개를 이름표와 함께 세로로 잇는다 → sheet-1.png, sheet-2.png …"""
    from PIL import Image, ImageDraw
    imgs = sorted(p for p in work.glob("*.webp"))
    for k in range(0, len(imgs), per):
        group = [Image.open(p).convert("L") for p in imgs[k:k + per]]
        w = max(i.width for i in group)
        h = sum(i.height + 34 for i in group)
        sheet = Image.new("L", (w, h), 255)
        d, y = ImageDraw.Draw(sheet), 0
        for p, im in zip(imgs[k:k + per], group):
            d.rectangle([0, y, w, y + 30], fill=0)
            d.text((8, y + 8), f"FILE {p.name}", fill=255)
            sheet.paste(im, (0, y + 32)); y += im.height + 34
        sheet.save(work / f"sheet-{k // per + 1}.png")


def group_of(subject):
    for key, g in (("수학", "math"), ("확률", "math"), ("미적분", "math"), ("기하", "math"), ("물리", "phy"), ("화학", "chem"),
                   ("생명", "bio"), ("지구", "earth")):
        if key in subject:
            return g
    return "gosci"   # 고1 과학·통합과학


def prepare(shard="0/1"):
    k, n = map(int, shard.split("/"))
    man = json.loads((EX / "manifest.json").read_text())
    done = skipped = failed = 0
    for i, e in enumerate(man["exams"]):
        if e.get("status") != "ok" or i % n != k:
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
            contact_sheets(work)
            (work / "task.json").write_text(json.dumps({**e, "group": group_of(e["subject"])}, ensure_ascii=False, indent=1))
            done += 1
        except (SystemExit, Exception) as err:   # 한 시험지가 깨져도 나머지는 계속
            failed += 1
            print(f"실패 {e['id']}: {err}")
    print(f"prepare: 새로 {done}, 이미 있음 {skipped}, 실패 {failed}")


def text_of(work, img_dir, items_order):
    """exams/text-work/<시험>/text.json(검사 통과한 것만) → 문항 이미지 이름별 {html, choices, shared, figs, sfigs}. 그림은 상자대로 잘라 img_dir에 저장."""
    from PIL import Image
    tw = EX / "text-work" / work.name
    st = tw / "status.json"
    if not st.exists() or not json.loads(st.read_text()).get("ok"):
        return {}
    lst = json.loads((tw / "list.json").read_text())
    txt = json.loads((tw / "text.json").read_text())
    def crop(png, boxes, stem):
        out = []
        if not boxes:
            return out
        im = Image.open(tw / png)
        for k, f in enumerate(boxes):
            x, y, w, h = (int(v) for v in f["box"])
            name = f"{stem}-f{k + 1}.webp"
            im.crop((max(0, x), max(0, y), min(im.width, x + w), min(im.height, y + h))).save(img_dir / name, "WEBP", quality=80, method=6)
            out.append({"src": f"exams/img/{work.name}/{name}", "alt": f.get("alt", "")})
        return out
    shared = {}
    for e, t in zip(lst, txt):
        if e.get("shared") and t.get("shared"):
            s = e["shared"]["img"]
            shared[s] = {"html": t["shared"], "figs": crop(s, t.get("shared_figs"), s.rsplit(".", 1)[0])}
    res = {}
    for i, (e, t) in enumerate(zip(lst, txt)):
        img = items_order[i] if i < len(items_order) else None
        if not img:
            continue
        sh = shared.get((e.get("shared") or {}).get("img"), {})
        res[img] = {"html": t["stem"], "choices": t.get("choices"), "shared": sh.get("html"), "sfigs": sh.get("figs", []),
                    "figs": crop(e["img"], t.get("figs"), img.rsplit(".", 1)[0]), "tconf": t.get("conf", "high")}
    return res


def publish():
    by_sec, total, missing, texted = {}, 0, [], 0
    for work in sorted((EX / "work").iterdir()):
        meta_p = work / "meta.json"
        if not meta_p.exists():
            missing.append(work.name)
            continue
        task = json.loads((work / "task.json").read_text())
        items_list = json.loads((work / "items.json").read_text())
        items = {it["img"]: it for it in items_list}
        img_dir = EX / "img" / work.name
        img_dir.mkdir(parents=True, exist_ok=True)
        texts = text_of(work, img_dir, [it["img"] for it in items_list])
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
                "img": f"exams/img/{work.name}/{m['img']}", "text": search_text(it.get("text", "")),
                "type": "mc" if len(texts.get(m["img"], {}).get("choices") or []) == 5 else it["type"],
                "answer": str(m["answer"]), "conf": m.get("conf", "high"), **texts.get(m["img"], {})})
            total += 1
            texted += m["img"] in texts
    sec_dir = EX / "sec"
    if sec_dir.exists():
        shutil.rmtree(sec_dir)
    sec_dir.mkdir()
    for sec, items in by_sec.items():
        (sec_dir / f"{sec}.json").write_text(json.dumps({"sec": sec, "items": items}, ensure_ascii=False))
    (EX / "index.json").write_text(json.dumps({k: len(v) for k, v in sorted(by_sec.items())}, ensure_ascii=False, indent=0))
    print(f"publish: 문항 {total}개(텍스트 {texted}개), 절 {len(by_sec)}개, 분류 안 된 시험 {len(missing)}개")


if __name__ == "__main__":
    {"prepare": prepare, "publish": publish}[sys.argv[1]](*sys.argv[2:3])
