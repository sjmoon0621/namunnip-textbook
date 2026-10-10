"""기출 텍스트 변환 준비: PDF에서 문항을 여백 두고 200dpi로 다시 자르고, pdftotext 글자층(수식 자리는 ⟦식⟧)과 공통 지문을 함께 준비한다."""
import json, re, subprocess, sys, pathlib, html
from PIL import Image

ROOT = pathlib.Path("/Users/munseongjin/Desktop/Claude/나뭇잎/textbook")
OUT = ROOT / "exams" / "text-work"
DPI = 200
PUA = re.compile(r"[\ue000-\uf8ff]+(?:\s*[\ue000-\uf8ff]+)*")
MARK = re.compile(r"\[(\d+)\s*[～~∼\-]\s*(\d+)\]")


def words(pdf, page):
    xml = subprocess.run(["pdftotext", "-bbox", "-f", str(page), "-l", str(page), str(pdf), "-"], capture_output=True, text=True).stdout
    return [(float(a), float(b), float(c), float(d), html.unescape(t)) for a, b, c, d, t in
            re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>', xml)]


def render(pdf, page):
    (OUT / "_pages").mkdir(parents=True, exist_ok=True)
    stem = OUT / "_pages" / f"_page_{pdf.parent.name}_{pdf.stem}_{page}"
    if not stem.with_suffix(".png").exists():
        subprocess.run(["pdftoppm", "-r", str(DPI), "-f", str(page), "-l", str(page), "-png", "-singlefile", str(pdf), str(stem)], check=True)
    return Image.open(stem.with_suffix(".png"))


def layer(ws):
    ws = sorted(ws, key=lambda w: (round(w[1] / 6), w[0]))
    t = " ".join(w[4] for w in ws)
    return re.sub(r"\s+", " ", PUA.sub(" ⟦식⟧ ", t)).strip()


for ex in sys.argv[1:]:
    if (OUT / ex / "list.json").exists():
        continue
    work = ROOT / "exams" / "work" / ex
    task = json.loads((work / "task.json").read_text())
    pdf = ROOT / task["mun_path"]
    items = json.loads((work / "items.json").read_text())
    d = OUT / ex
    d.mkdir(parents=True, exist_ok=True)
    s = DPI / 72
    pages = {}
    out = []
    for it in items:
        pg = it["page"]
        if pg not in pages:
            pages[pg] = (render(pdf, pg), words(pdf, pg))
        img, ws = pages[pg]
        x0, y0, x1, y1 = it["box"]
        top, bot = max(0, y0 - 14), max(y0 + 20, y1 - 12)
        crop = img.crop((int((x0 - 4) * s), int(top * s), int((x1 + 4) * s), int(bot * s)))
        ink = Image.eval(crop.convert("L").crop((24, 0, crop.width - 24, crop.height)), lambda v: 255 if v < 200 else 0).getbbox()
        if ink:
            crop = crop.crop((0, 0, crop.width, min(crop.height, ink[3] + 16)))
        name = it["img"].replace(".webp", ".png")
        crop.save(d / name)
        inside = [w for w in ws if w[0] >= x0 - 2 and w[2] <= x1 + 2 and w[1] >= top and w[3] <= bot + 2]
        rec = {"img": name, "no": it["no"], "type": it["type"], "elective": it.get("elective"), "w": crop.width, "h": crop.height, "text_layer": layer(inside)}
        # 공통 지문: 같은 쪽·같은 단에서 이 문항보다 위에 있는 [a~b] 표시 중 이 번호를 포함하는 것
        col_ws = [w for w in ws if w[0] >= x0 - 2 and w[2] <= x1 + 2]
        for w in col_ws:
            m = MARK.fullmatch(w[4]) or MARK.match(w[4])
            if m and int(m.group(1)) <= it["no"] <= int(m.group(2)) and w[1] < y0:
                first = min((o for o in items if o["page"] == pg and o["col"] == it["col"] and o["no"] >= int(m.group(1))), key=lambda o: o["box"][1], default=None)
                sy0, sy1 = w[1] - 4, (first["box"][1] if first else y0) - 2
                if sy1 > sy0 + 10:
                    sname = f"shared-{m.group(1)}-{m.group(2)}.png"
                    if not (d / sname).exists():
                        img.crop((int((x0 - 4) * s), int(sy0 * s), int((x1 + 4) * s), int(sy1 * s))).save(d / sname)
                    rec["shared"] = {"img": sname, "text_layer": layer([v for v in col_ws if v[1] >= sy0 and v[3] <= sy1 + 2])}
                break
        out.append(rec)
    groups = {(r["shared"]["img"]): r["shared"] for r in out if "shared" in r}
    for key, sh in groups.items():
        a, b = map(int, re.findall(r"\d+", key)[:2])
        for r in out:
            if a <= r["no"] <= b and not r.get("elective"):
                r["shared"] = sh
    (d / "list.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(ex, len(out), "items,", sum(1 for r in out if "shared" in r), "with shared stem")
