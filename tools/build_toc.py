#!/usr/bin/env python3
"""curriculum.md(구조) + c/**/*.html(실제 제작된 카드)를 합쳐 js/toc.js를 만든다.

사용: python3 tools/build_toc.py
"""
import json, re, pathlib, html

ROOT = pathlib.Path(__file__).resolve().parent.parent
COURSES = {"통합과학1": "is1", "통합과학2": "is2", "물리학": "phy", "화학": "chem", "생명과학": "bio", "지구과학": "earth"}
ROMAN = {"Ⅰ": 1, "Ⅱ": 2, "Ⅲ": 3, "Ⅳ": 4}
META = {
    "is1": "고1 공통", "is2": "고1 공통", "phy": "일반 선택", "chem": "일반 선택", "bio": "일반 선택", "earth": "일반 선택", "extra": "교육과정 밖",
}


def parse_plan():
    courses, cur, ch, sec = [], None, None, None
    for line in (ROOT / "curriculum.md").read_text().splitlines():
        m = re.match(r"^## (\S+) \(", line)
        if m and m.group(1) in COURSES:
            cur = {"id": COURSES[m.group(1)], "name": m.group(1), "meta": META[COURSES[m.group(1)]], "chapters": []}
            courses.append(cur); ch = sec = None; continue
        if line.startswith("## "):
            cur = None; continue
        if not cur:
            continue
        m = re.match(r"^### (\S+)\. (.+?) \(", line)
        if m:
            ch = {"n": ROMAN[m.group(1)], "title": m.group(2), "sections": []}
            cur["chapters"].append(ch); continue
        m = re.match(r"^\*\*(\d+)\. (.+?)\*\* `\[(.+?)\]`", line)
        if m:
            sec = {"n": int(m.group(1)), "title": m.group(2), "code": m.group(3), "plan": []}
            ch["sections"].append(sec); continue
        m = re.match(r"^- (카드|영상): (.+)$", line)
        if m and sec is not None:
            t = re.sub(r"\*\*\[.*?\]\*\*", "", m.group(2)).strip()
            sec["plan"].append({"kind": "card" if m.group(1) == "카드" else "video", "title": t})
    courses.append({"id": "extra", "name": "교양·심화", "meta": META["extra"], "chapters": [
        {"n": 1, "title": "교육과정 밖 카드", "sections": [{"n": 1, "title": "잎차례와 황금각", "code": "교양", "plan": []}]}]})
    return courses


def scan_page(path):
    src = path.read_text()
    items = []
    for m in re.finditer(r'<(article|section) class="(card|video-block)"[^>]*?id="([^"]+)"[^>]*>.*?<h2>(.*?)</h2>', src, re.S):
        items.append({"kind": "card" if m.group(2) == "card" else "video", "id": m.group(3),
                      "title": html.unescape(re.sub(r"<.*?>", "", m.group(4))).strip(), "pos": m.start()})
    items.sort(key=lambda x: x.pop("pos"))
    return items


def main():
    courses = parse_plan()
    for c in courses:
        for ch in c["chapters"]:
            for s in ch["sections"]:
                p = ROOT / "c" / c["id"] / f'{ch["n"]}-{s["n"]}.html'
                s["page"] = p.exists()
                s["items"] = scan_page(p) if p.exists() else []
    out = "/* 자동 생성: python3 tools/build_toc.py — 직접 고치지 말 것 */\nwindow.TOC = " + json.dumps(courses, ensure_ascii=False, indent=1) + ";\n"
    (ROOT / "js" / "toc.js").write_text(out)
    for c in courses:
        n = sum(len(s["items"]) for ch in c["chapters"] for s in ch["sections"])
        pages = sum(s["page"] for ch in c["chapters"] for s in ch["sections"])
        secs = sum(len(ch["sections"]) for ch in c["chapters"])
        print(f'{c["name"]}: 페이지 {pages}/{secs}, 항목 {n}')


if __name__ == "__main__":
    main()
