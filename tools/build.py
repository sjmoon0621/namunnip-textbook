#!/usr/bin/env python3
"""교육과정 JSON + 블록으로 절 페이지(c/<과목>/<대단원>-<절>.html)와 목차(js/toc.js)를 만든다.

사용: python3 tools/build.py [curricula/2022.json] [--out 디렉터리]

- 블록: blocks/<폴더>/<블록 id>.html. 맨 앞 <!--block {JSON} --> 머리, 선택적 <style>, 그다음 본문.
  type: intro(절 소개) · card(개념 카드) · text(읽기: 글·사진·그림·표) · video(영상) · related(관련 카드 상자)
- 번호: 카드·읽기 블록에 대단원.절.순서를 매겨 <span class="no">에 넣는다. 영상은 '영상'으로 표시.
- 교육과정이 바뀌면 curricula/*.json에서 블록 id의 위치만 옮기고 다시 빌드한다.
- 한 블록을 여러 과목·절에 배치해도 된다(예: 일반선택 카드를 진로선택 절에서 재사용). 같은 절에 두 번은 안 된다.
"""
import json, re, sys, pathlib, html as H

ROOT = pathlib.Path(__file__).resolve().parent.parent
NUMBERED = {"card", "text"}
TOC_KIND = {"card": "card", "text": "text", "video": "video"}


def load_blocks():
    blocks = {}
    for p in sorted((ROOT / "blocks").glob("*/*.html")):
        src = p.read_text()
        m = re.match(r"<!--block\n(.*?)\n-->\n", src, re.S)
        if not m:
            raise SystemExit(f"블록 머리 없음: {p}")
        meta = json.loads(m.group(1))
        rest = src[m.end():]
        style = ""
        sm = re.match(r"<style>\n(.*?)\n</style>\n", rest, re.S)
        if sm:
            style, rest = sm.group(1), rest[sm.end():]
        bid = p.stem
        if bid in blocks:
            raise SystemExit(f"블록 id 중복: {bid}")
        body = rest.rstrip("\n")
        if meta["type"] != "intro":
            m2 = re.match(r'<(\w+) class="[^"]*"[^>]*\bid="([^"]+)"', body)
            if not m2 or m2.group(2) != bid:
                raise SystemExit(f"블록 파일 이름과 최상위 요소 id가 다름: {p}")
        h2 = re.search(r"<h2>(.*?)</h2>", body, re.S)
        meta.update(id=bid, style=style, body=body, path=p,
                    title=H.unescape(re.sub(r"<.*?>", "", h2.group(1))).strip() if h2 else "",
                    toc_title=meta.get("short") or (h2.group(1).strip() if h2 else ""))
        blocks[bid] = meta
    return blocks


def indent(text, n):
    pad = " " * n
    return "\n".join(pad + l if l.strip() else "" for l in text.split("\n"))


def page_html(course, ch, sec, blocks):
    ids = sec["blocks"]
    intro = [blocks[i] for i in ids if blocks[i]["type"] == "intro"]
    items = [blocks[i] for i in ids if blocks[i]["type"] != "intro"]
    no, toc, bodies, styles, scripts = 0, [], [], [], []
    for b in items:
        body = b["body"]
        if b["type"] in NUMBERED:
            no += 1
            label = f'{ch["n"]}.{sec["n"]}.{no}'
            body = body.replace('<span class="no"></span>', f'<span class="no">{label}</span>', 1)
            toc.append(f'        <li><a href="#{b["id"]}"><span class="mono">{label}</span>{b["toc_title"]}</a></li>')
        elif b["type"] == "video":
            toc.append(f'        <li><a href="#{b["id"]}"><span class="mono">영상</span>{b["toc_title"]}</a></li>')
        bodies.append(indent(body, 6))
        if b["style"]:
            styles.append(b["style"])
        scripts += b.get("scripts", [])
    for b in intro:
        if b["style"]:
            styles.insert(0, b["style"])
    desc = intro[0]["description"] if intro else ""
    hero = indent(intro[0]["body"], 4) + "\n" if intro else ""
    style = ("  <style>\n" + indent("\n".join(styles), 4) + "\n  </style>\n") if styles else ""
    return f'''<!doctype html>
<!-- 자동 생성: python3 tools/build.py — 직접 고치지 말고 blocks/ 와 curricula/ 를 고칠 것 -->
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{H.escape(sec["title"], quote=False)} — 나뭇잎 과학 교과서</title>
  <meta name="description" content="{H.escape(desc)}">
  <link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@1,6..72,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../css/tb.css">
{style}</head>
<body data-course="{course["id"]}" data-sec="{ch["n"]}-{sec["n"]}">

<header class="top">
  <a class="brand" href="../../"><svg class="brand-mark"><use href="#nm"/></svg>나뭇잎 과학 교과서</a>
  <nav class="crumbs" aria-label="위치"></nav>
  <div class="top-right"><a href="../../graph.html">개념 지도</a><a href="../../notes.html">내 노트</a><a href="./">← 과목 목차</a></div>
</header>

<main class="wrap">
  <section class="topic-hero">
    <div class="meta"></div>
    <h1>{sec["title"]}</h1>
{hero}  </section>

  <div class="topic-layout">
    <aside class="toc" aria-label="이 절의 카드">
      <p class="mono small">이 절의 카드</p>
      <ol>
{chr(10).join(toc)}
      </ol>
      <p class="progress mono small"></p>
      <p class="toc-links mono small"><a href="../../graph.html?sec={course["id"]}-{ch["n"]}-{sec["n"]}">이 절을 개념 지도에서 보기</a></p>
    </aside>

    <div>
{(chr(10) + chr(10)).join(bodies)}

      <nav class="next" aria-label="절 이동"></nav>
    </div>
  </div>
</main>

<script src="../../js/toc.js"></script>
<script src="../../js/core.js"></script>
<script src="../../js/store.js"></script>
<script src="../../js/notes.js"></script>
{"".join(f'<script src="../../{s}"></script>{chr(10)}' for s in scripts)}</body>
</html>
'''


def build_graph(blocks, used, out):
    """graph/concepts.txt → js/graph-data.js. 개념 id | 이름 | 블록들 | 선수 개념들"""
    src = ROOT / "graph" / "concepts.txt"
    if not src.exists():
        return
    concepts, errors = [], []
    for ln, line in enumerate(src.read_text().splitlines(), 1):
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        parts = [p.strip() for p in line.split("|")]
        if len(parts) != 4:
            errors.append(f"{ln}행: 칸이 4개가 아님"); continue
        cid, name, bl, req = parts
        concepts.append({"id": cid, "name": name, "blocks": bl.split(), "req": req.split(), "line": ln})
    ids = {c["id"] for c in concepts}
    if len(ids) != len(concepts):
        errors.append("개념 id 중복")
    for c in concepts:
        for b in c["blocks"]:
            if b not in blocks:
                errors.append(f'{c["line"]}행 {c["id"]}: 없는 블록 {b}')
            elif b not in used:
                errors.append(f'{c["line"]}행 {c["id"]}: 배치되지 않은 블록 {b}')
        for r in c["req"]:
            if r not in ids:
                errors.append(f'{c["line"]}행 {c["id"]}: 없는 선수 개념 {r}')
    # 선수 관계에 순환이 있으면 안 된다
    req = {c["id"]: [r for r in c["req"] if r in ids] for c in concepts}
    state = {}
    def visit(n, path):
        if state.get(n) == 1:
            errors.append("선수 관계 순환: " + " → ".join(path + [n])); return
        if state.get(n) == 2:
            return
        state[n] = 1
        for r in req[n]:
            visit(r, path + [n])
        state[n] = 2
    for n in req:
        visit(n, [])
    if errors:
        raise SystemExit("개념 지도 오류:\n  " + "\n  ".join(errors))
    covered = {b for c in concepts for b in c["blocks"]}
    missing = [b for b in used if blocks[b]["type"] in TOC_KIND and b not in covered]
    if missing:
        print(f"개념 지도에 없는 블록 {len(missing)}개: {', '.join(missing)}")
    data = [{k: c[k] for k in ("id", "name", "blocks", "req")} for c in concepts]
    # 카드끼리 직접 잇는 선 (graph/links.txt, 선택)
    extra = []
    lsrc = ROOT / "graph" / "links.txt"
    if lsrc.exists():
        for ln, line in enumerate(lsrc.read_text().splitlines(), 1):
            if not line.strip() or line.lstrip().startswith("#"):
                continue
            a, sep, b = (x.strip() for x in line.partition(">"))
            if not sep or a not in used or b not in used:
                raise SystemExit(f"graph/links.txt {ln}행: '먼저 블록 > 다음 블록' 형식이 아니거나 배치되지 않은 블록")
            extra.append([a, b])
    (out / "js" / "graph-data.js").write_text("/* 자동 생성: python3 tools/build.py (원본: graph/concepts.txt, graph/links.txt) — 직접 고치지 말 것 */\n"
        + "window.GRAPH = " + json.dumps(data, ensure_ascii=False) + ";\nwindow.GRAPH_LINKS = " + json.dumps(extra, ensure_ascii=False) + ";\n")
    print(f"개념 지도: 개념 {len(data)}개, 선수 관계 {sum(len(c['req']) for c in data)}개, 카드 사이 선 {len(extra)}개")


def main():
    args = sys.argv[1:]
    out = ROOT
    if "--out" in args:
        i = args.index("--out"); out = pathlib.Path(args[i + 1]).resolve(); del args[i:i + 2]
    cur_path = ROOT / (args[0] if args else "curricula/2022.json")
    cur = json.loads(cur_path.read_text())
    blocks = load_blocks()

    used = {}
    toc = []
    for c in cur["courses"]:
        tc = {"id": c["id"], "name": c["name"], "meta": c["meta"], "chapters": []}
        toc.append(tc)
        for ch in c["chapters"]:
            tch = {"n": ch["n"], "title": ch["title"], "sections": []}
            tc["chapters"].append(tch)
            for s in ch["sections"]:
                for bid in s["blocks"]:
                    if bid not in blocks:
                        raise SystemExit(f'없는 블록: {bid} ({c["id"]} {ch["n"]}-{s["n"]})')
                    here = f'{c["id"]} {ch["n"]}-{s["n"]}'
                    if here in used.get(bid, []):
                        raise SystemExit(f"한 절에 같은 블록이 두 번 배치됨: {bid} ({here})")
                    used.setdefault(bid, []).append(here)   # 한 블록을 여러 과목·절에 재사용할 수 있다
                items = [{"kind": TOC_KIND[blocks[b]["type"]], "id": b, "title": blocks[b]["title"]}
                         for b in s["blocks"] if blocks[b]["type"] in TOC_KIND]
                tch["sections"].append({"n": s["n"], "title": s["title"], "code": s["code"], "page": bool(s["blocks"]), "items": items})
                if s["blocks"]:
                    p = out / "c" / c["id"] / f'{ch["n"]}-{s["n"]}.html'
                    p.parent.mkdir(parents=True, exist_ok=True)
                    p.write_text(page_html(c, ch, s, blocks))

    (out / "js").mkdir(parents=True, exist_ok=True)
    (out / "js" / "toc.js").write_text("/* 자동 생성: python3 tools/build.py — 직접 고치지 말 것 */\nwindow.TOC = " + json.dumps(toc, ensure_ascii=False, indent=1) + ";\n")
    build_graph(blocks, used, out)
    unused = sorted(set(blocks) - set(used))
    for c in toc:
        n = sum(len(s["items"]) for ch in c["chapters"] for s in ch["sections"])
        secs = [s for ch in c["chapters"] for s in ch["sections"]]
        print(f'{c["name"]}: 절 {sum(s["page"] for s in secs)}/{len(secs)}, 항목 {n}')
    if unused:
        print(f"배치되지 않은 블록 {len(unused)}개: {', '.join(unused)}")


if __name__ == "__main__":
    main()
