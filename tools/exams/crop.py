#!/usr/bin/env python3
"""기출 시험지 PDF를 문항별 이미지·텍스트로 자른다.

사용: python3 tools/exams/crop.py <문제지.pdf> <출력 폴더> [--dpi 130]
출력: <출력 폴더>/<번호>.webp 와 <출력 폴더>/items.json
      items.json = [{"no", "page", "col", "box": [x0, y0, x1, y1](pt), "text", "type": "mc"|"short", "pts", "img"}]

시험지는 2단 편집이고 문항 번호가 단 왼쪽 끝에 "12." 꼴로 놓인다(평가원·교육청 공통).
문항 하나는 그 번호부터 같은 단의 다음 번호(없으면 단의 바닥)까지이고, 그림은 글자 상자에 잡히지 않으므로
렌더한 이미지에서 아래쪽 빈 줄을 잘라 낸다.
"""
import json, pathlib, re, subprocess, sys, tempfile
from html import unescape
from PIL import Image

NUM = re.compile(r"^(\d{1,2})\.$")


def words_by_page(pdf):
    html = subprocess.run(["pdftotext", "-bbox", str(pdf), "-"], capture_output=True, text=True, check=True).stdout
    pages = []
    for pm in re.finditer(r'<page width="([\d.]+)" height="([\d.]+)">(.*?)</page>', html, re.S):
        ws = [(float(a), float(b), float(c), float(d), unescape(t)) for a, b, c, d, t in
              re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)</word>', pm.group(3))]
        pages.append({"w": float(pm.group(1)), "h": float(pm.group(2)), "words": ws})
    return pages


def find_markers(pages):
    """단 왼쪽 끝에 놓인 번호 후보를 모은 뒤, 1부터 1씩 커지는 순서만 남긴다.
    수능·모평 수학처럼 선택과목마다 23번부터 다시 시작하면 part를 하나 늘려 따로 센다."""
    cands = []
    for pi, p in enumerate(pages):
        mid = p["w"] / 2
        lefts = {0: [], 1: []}
        for x0, y0, x1, y1, t in p["words"]:
            if y0 > p["h"] * 0.08 and y0 < p["h"] * 0.95:
                lefts[0 if x0 < mid else 1].append(x0)
        margin = {c: min(v) if v else (40 if c == 0 else mid) for c, v in lefts.items()}
        for x0, y0, x1, y1, t in p["words"]:
            m = NUM.match(t)
            if not m:
                continue
            col = 0 if x0 < mid else 1
            if x0 - margin[col] > 14:
                continue
            cands.append({"no": int(m.group(1)), "page": pi, "col": col, "x": x0, "y": y0})
    cands.sort(key=lambda c: (c["page"], c["col"], c["y"]))
    out, want, part, restart = [], 1, 0, None
    for i, c in enumerate(cands):
        if c["no"] == want:
            out.append({**c, "part": part}); want += 1
        elif c["no"] < want and not any(d["no"] == want for d in cands[i:]) \
                and any(d["no"] == c["no"] + 1 for d in cands[i + 1:]):
            if restart is None and c["no"] > 1:
                restart = c["no"]
            if c["no"] != restart:
                break   # 같은 파일에 다른 형(짝수형 등)이 다시 실려 있음
            part += 1
            out.append({**c, "part": part}); want = c["no"] + 1
    if restart:
        for m in out:
            m["elective_group"] = m["part"] if (m["part"] or m["no"] >= restart) else None
    return out


ELECTIVES = ["확률과 통계", "미적분", "기하", "가형", "나형"]


def part_label(page):
    """선택과목 묶음이 시작하는 쪽 위쪽의 제목(확률과 통계/미적분/기하)."""
    top = " ".join(w[4] for w in sorted(page["words"], key=lambda w: (w[1], w[0])) if w[1] < page["h"] * 0.12)
    top = top.replace(" ", "")
    return next((e for e in ELECTIVES if e.replace(" ", "") in top), None)


def render(pdf, page, dpi, tmp):
    stem = pathlib.Path(tmp) / f"p{page}"
    subprocess.run(["pdftoppm", "-r", str(dpi), "-f", str(page + 1), "-l", str(page + 1), "-png", "-singlefile", str(pdf), str(stem)], check=True)
    return Image.open(f"{stem}.png").convert("L")


def trim_bottom(img, pad=10):
    """아래쪽의 흰 줄(그림 아래 여백, 단 끝 빈칸)을 잘라 낸다."""
    px = img.load()
    w, h = img.size
    ink = [y for y in range(h) if any(px[x, y] < 200 for x in range(0, w, 2))]
    if not ink:
        return img
    # 맨 아래 잇크가 큰 빈칸 뒤의 얇은 가로줄(다음 상자의 윗변)이면 버린다
    tail = [ink[-1]]
    for y in reversed(ink[:-1]):
        if tail[-1] - y > 1:
            break
        tail.append(y)
    rest = [y for y in ink if y < min(tail)]
    last = ink[-1]
    if rest and len(tail) <= 4 and min(tail) - rest[-1] > 8:
        last = rest[-1]
    return img.crop((0, 0, w, min(h, last + pad)))


def main():
    args = sys.argv[1:]
    dpi = 130
    if "--dpi" in args:
        i = args.index("--dpi"); dpi = int(args[i + 1]); del args[i:i + 2]
    pdf, out = pathlib.Path(args[0]), pathlib.Path(args[1])
    out.mkdir(parents=True, exist_ok=True)
    pages = words_by_page(pdf)
    marks = find_markers(pages)
    if not marks:
        raise SystemExit(f"문항 번호를 찾지 못함: {pdf}")
    items, cache = [], {}
    with tempfile.TemporaryDirectory() as tmp:
        for k, mk in enumerate(marks):
            p = pages[mk["page"]]
            mid = p["w"] / 2
            nxt = next((m for m in marks[k + 1:] if m["page"] == mk["page"] and m["col"] == mk["col"]), None)
            x0 = (mk["x"] - 8) if mk["col"] == 0 else mid + 4
            x1 = mid - 4 if mk["col"] == 0 else p["w"] - 20
            x0 = min(x0, mk["x"] - 8)
            y0 = mk["y"] - 6
            foot = [w for w in p["words"] if w[1] > p["h"] * 0.9 and re.fullmatch(r"\d+|수학|영역", w[4])]
            notice = [w for w in p["words"] if w[4] == "확인" and w[1] > mk["y"] and (w[0] < mid) == (mk["col"] == 0)]
            bottom = min([w[1] for w in foot] + [w[1] - 26 for w in notice] or [p["h"] * 0.95]) - 3
            y1 = (nxt["y"] - 6) if nxt else bottom
            inside = [w for w in p["words"] if w[0] >= x0 - 2 and w[2] <= x1 + 2 and w[1] >= y0 and w[3] <= y1 + 2]
            inside.sort(key=lambda w: (round(w[1] / 6), w[0]))
            text = " ".join(w[4] for w in inside)
            if mk["page"] not in cache:
                cache[mk["page"]] = render(pdf, mk["page"], dpi, tmp)
            img = cache[mk["page"]]
            s = dpi / 72
            crop = trim_bottom(img.crop((int(x0 * s), int(y0 * s), int(x1 * s), int(y1 * s))))
            name = f"{mk['no']:02d}.webp" if not mk["part"] else f"{mk['no']:02d}_{mk['part']}.webp"
            crop.save(out / name, "WEBP", quality=70, method=6)
            pts = re.search(r"\[(\d)점\]", text)
            grp = mk.get("elective_group")
            first = next((m for m in marks if m.get("elective_group") == grp), mk) if grp is not None else None
            items.append({"no": mk["no"], "part": mk["part"], "elective": part_label(pages[first["page"]]) if first else None, "page": mk["page"] + 1, "col": mk["col"], "box": [round(x0), round(y0), round(x1), round(y1)],
                          "text": re.sub(r"\s+", " ", text).strip(), "type": "mc" if "①" in text else "short",
                          "pts": int(pts.group(1)) if pts else None, "img": name})
    (out / "items.json").write_text(json.dumps(items, ensure_ascii=False, indent=1))
    print(f"{pdf.name}: 문항 {len(items)}개 → {out}")


if __name__ == "__main__":
    main()
