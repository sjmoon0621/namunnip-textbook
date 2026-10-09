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


# 다크 모드: 첫 그리기 전에 <html data-theme>을 정한다. ?theme=dark|light(저장 안 함) > 저장값 > 운영체제 설정.
# 손으로 쓴 페이지(index·graph·notes·c/*/index.html)에도 같은 줄이 있다. 고치면 함께 고칠 것.
THEME_SCRIPT = '''  <script>(function(){var d=document.documentElement,q=/[?&]theme=(dark|light)\\b/.exec(location.search),t=q&&q[1];if(!t)try{t=localStorage.getItem("namunnip-theme")}catch(e){}if(t!=="dark"&&t!=="light")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";d.dataset.theme=t;if(t==="dark")document.querySelector('meta[name="theme-color"]').content="#17181a"})()</script>'''
# 상단바 .top-right 끝의 다크 모드 버튼 (js/core.js가 누름을 잇는다)
THEME_BTN = ('<button type="button" class="theme-btn" aria-label="다크 모드" aria-pressed="false" title="다크 모드 켜고 끄기">'
             '<svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'
             '<svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>')


def pwa_head(p):
    """모든 페이지 <head>에 들어가는 아이콘·글꼴·앱 설치(PWA)·다크 모드 태그. p는 최상위까지의 상대 경로('', '../../')."""
    return f'''  <link rel="icon" href="{p}assets/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="{p}assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="{p}manifest.webmanifest">
  <meta name="theme-color" content="#f3f4ef">
{THEME_SCRIPT}
  <meta name="apple-mobile-web-app-title" content="나뭇잎 교과서">
  <link rel="stylesheet" href="{p}css/fonts.css">'''


# 오프라인 저장 목록(sw-files.js)에 넣을 파일: 실행에 필요한 것만. blocks/·tools/·graph/·curricula/는 빌드 재료라 뺀다.
PRECACHE_DIRS = ("c", "css", "js", "assets", "basics")
PRECACHE_SKIP = {".DS_Store"}


def build_sw():
    """sw.js가 설치 때 받아 둘 파일 목록과 버전(내용 해시)을 sw-files.js로 쓴다."""
    import hashlib
    files = sorted(p.name for p in ROOT.glob("*.html")) + ["manifest.webmanifest"]
    for d in PRECACHE_DIRS:
        files += sorted(str(p.relative_to(ROOT)) for p in (ROOT / d).rglob("*")
                        if p.is_file() and p.name not in PRECACHE_SKIP and p.suffix not in (".md", ".txt"))
    h = hashlib.sha256()
    for f in files + ["sw.js"]:
        h.update(f.encode()); h.update((ROOT / f).read_bytes())
    version = h.hexdigest()[:12]
    size = sum((ROOT / f).stat().st_size for f in files)
    (ROOT / "sw-files.js").write_text("/* 자동 생성: python3 tools/build.py — 오프라인 저장 목록. 직접 고치지 말 것 */\nself.PRECACHE = "
        + json.dumps({"version": version, "files": files}, ensure_ascii=False, indent=0) + ";\n")
    print(f"오프라인 저장: 파일 {len(files)}개, {size / 1e6:.1f} MB, 버전 {version}")


def indent(text, n):
    pad = " " * n
    return "\n".join(pad + l if l.strip() else "" for l in text.split("\n"))


EXAM_INDEX = ROOT / "exams" / "index.json"   # {"<과목>-<대단원>-<절>": 문항 수} — 기출 처리 도구가 만든다
_exam_counts = None


def exam_count(course, ch, sec):
    """절 끝 연습문제 버튼에 적을 문항 수 문구."""
    global _exam_counts
    if _exam_counts is None:
        _exam_counts = json.loads(EXAM_INDEX.read_text()) if EXAM_INDEX.exists() else {}
    n = _exam_counts.get(f'{course["id"]}-{ch["n"]}-{sec["n"]}', 0)
    return f"{n}문항" if n else "준비 중"


REL, USED, NAMES = {}, {}, {}   # main()이 채운다: 카드별 연관 카드, 블록 배치 위치, 과목 이름


def related_map(blocks, used):
    """graph/concepts.txt의 개념·선수 관계로 카드마다 먼저 볼 카드·같은 개념의 다른 과목 카드·이어지는 카드를 고른다.
    검사는 build_graph가 한다. 여기서는 읽기만 한다."""
    src = ROOT / "graph" / "concepts.txt"
    if not src.exists():
        return {}
    cons = {}
    for line in src.read_text().splitlines():
        parts = [p.strip() for p in line.split("|")]
        if line.strip() and not line.lstrip().startswith("#") and len(parts) == 4:
            cons[parts[0]] = (parts[2].split(), parts[3].split())
    of_block, next_of = {}, {}
    for cid, (bl, req) in cons.items():
        for b in bl:
            of_block.setdefault(b, []).append(cid)
        for r in req:
            next_of.setdefault(r, []).append(cid)
    def cards(cids, me):
        out = []
        for cid in cids:
            for b in cons.get(cid, ((), ()))[0]:
                if b != me and b in used and blocks[b]["type"] in NUMBERED and b not in out:
                    out.append(b)
        return out
    rel = {}
    for b, cids in of_block.items():
        if b not in used or blocks[b]["type"] not in NUMBERED:
            continue
        home = used[b][0].split()[0]
        rel[b] = {
            "before": cards([r for c in cids for r in cons[c][1]], b),
            "same": [x for x in cards(cids, b) if used[x][0].split()[0] != home],
            "after": cards([n for c in cids for n in next_of.get(c, [])], b),
        }
    return rel


def rel_html(bid, here):
    """카드 바로 아래에 붙는 연관 카드 링크 상자. 같은 절에 있는 카드는 뺀다."""
    r = REL.get(bid)
    if not r:
        return ""
    def link(x):
        cid, chsec = USED[x][0].split()
        return (f'<a href="../../c/{cid}/{chsec}.html#{x}"><small class="mono">{H.escape(NAMES[cid])} {chsec.replace("-", ".")}</small>'
                f'{H.escape(tex_plain(re.sub(r"<[^>]+>", "", blocks_title(x))), quote=False)}</a>')
    rows = []
    for key, label in (("before", "먼저 볼 카드"), ("same", "다른 과목에서"), ("after", "이어지는 카드")):
        xs = [x for x in r[key] if here not in USED[x]][:4]
        if xs:
            rows.append(f'<div><span class="mono">{label}</span>{"".join(link(x) for x in xs)}</div>')
    return f'\n      <nav class="rel" aria-label="연관 카드">{"".join(rows)}</nav>' if rows else ""


_SUP = str.maketrans("0123456789+-n()", "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿ⁽⁾")
_SUB = str.maketrans("0123456789+-n()", "₀₁₂₃₄₅₆₇₈₉₊₋ₙ₍₎")
_TEX_SYM = {"times": "×", "div": "÷", "cdot": "·", "le": "≤", "leq": "≤", "ge": "≥", "geq": "≥", "ne": "≠", "neq": "≠",
            "approx": "≈", "pi": "π", "infty": "∞", "cdots": "…", "ldots": "…", "pm": "±", "theta": "θ", "alpha": "α", "beta": "β",
            "sigma": "σ", "mu": "μ", "lambda": "λ", "Delta": "Δ", "sum": "Σ", "int": "∫", "to": "→", "rightarrow": "→", "lt": "<", "gt": ">"}


def tex_plain(s):
    """제목·링크처럼 KaTeX가 돌지 않는 곳(toc.js, 다른 절의 연관 링크, title 속성)에 쓸 때 \\( … \\)를 읽을 수 있는 글자로 바꾼다."""
    def plain(t):
        t = re.sub(r"\\(" + "|".join(sorted(_TEX_SYM, key=len, reverse=True)) + r")(?![A-Za-z])", lambda m: _TEX_SYM[m.group(1)], t)
        t = re.sub(r"\\(?:mathrm|text|mathbf|operatorname)\{([^{}]*)\}", r"\1", t)
        grp = lambda x: f"({x})" if re.search(r"[-+− ]", x.strip()) else x
        t = re.sub(r"\\frac\{([^{}]*)\}\{([^{}]*)\}", lambda m: f"{grp(m.group(1))}/{grp(m.group(2))}", t)
        t = re.sub(r"\\sqrt\{([^{}]*)\}", lambda m: "√" + grp(m.group(1)), t)
        t = re.sub(r"\\(?:vec|overrightarrow)\{([^{}]*)\}", r"\1⃗", t)
        t = re.sub(r"\\bar\{([^{}]*)\}", r"\1̄", t)
        t = re.sub(r"\^\{([^{}]*)\}|\^(.)", lambda m: (m.group(1) or m.group(2)).translate(_SUP), t)
        t = re.sub(r"_\{([^{}]*)\}|_(.)", lambda m: (m.group(1) or m.group(2)).translate(_SUB), t)
        t = re.sub(r"\\([A-Za-z]+)", r"\1", t)
        return t.replace("\\,", " ").replace("{", "").replace("}", "").replace(" - ", " − ")
    return re.sub(r"\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]", lambda m: plain(m.group(1) or m.group(2)), s)


_TITLES = {}
PREREQ = {}   # graph/prereqs.txt: '먼저 알면 좋은 것' 라벨 → ('card', 블록 id) 또는 ('basic', basics/ 파일 이름)


def load_prereqs(used):
    """graph/prereqs.txt → PREREQ. 한 줄: 라벨 | 블록 id  또는  라벨 | basics/<id>. 없는 대상은 오류로 멈춘다."""
    src = ROOT / "graph" / "prereqs.txt"
    if not src.exists():
        return
    errors = []
    for ln, line in enumerate(src.read_text().splitlines(), 1):
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        label, sep, target = (x.strip() for x in line.partition("|"))
        if not sep or not label or not target:
            errors.append(f"{ln}행: '라벨 | 대상' 형식이 아님"); continue
        if target.startswith("basics/"):
            name = target[len("basics/"):]
            if not (ROOT / "basics" / f"{name}.html").exists():
                errors.append(f"{ln}행: 없는 설명 카드 {target}"); continue
            PREREQ[label] = ("basic", name)
        elif target in used:
            PREREQ[label] = ("card", target)
        else:
            errors.append(f"{ln}행: 배치되지 않은 블록 {target}")
    if errors:
        raise SystemExit("graph/prereqs.txt 오류:\n  " + "\n  ".join(errors))


def link_prereqs(html):
    """절 소개의 <span class="p">라벨</span>을 카드 링크나 설명 카드 버튼으로 바꾼다(블록 원본은 그대로)."""
    def sub(m):
        label = re.sub(r"<[^>]+>", "", m.group(1)).strip()
        hit = PREREQ.get(label)
        if not hit:
            return m.group(0)
        kind, target = hit
        if kind == "basic":
            return f'<button type="button" class="p p-basic" data-basic="{target}" title="중학교 개념 설명 보기">{m.group(1)}</button>'
        cid, chsec = USED[target][0].split()
        where = f'{NAMES[cid]} {chsec.replace("-", ".")} · {tex_plain(re.sub(r"<[^>]+>", "", blocks_title(target)))}'
        return f'<a class="p p-card" href="../../c/{cid}/{chsec}.html#{target}" title="{H.escape(where)}">{m.group(1)}</a>'
    return re.sub(r'<span class="p">(.*?)</span>', sub, html, flags=re.S)


def blocks_title(bid):
    return _TITLES.get(bid, bid)


def page_html(course, ch, sec, blocks):
    ids = sec["blocks"]
    here = f'{course["id"]} {ch["n"]}-{sec["n"]}'
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
        bodies.append(indent(body, 6) + (rel_html(b["id"], here) if b["type"] in NUMBERED else ""))
        if b["style"]:
            styles.append(b["style"])
        scripts += b.get("scripts", [])
    for b in intro:
        if b["style"]:
            styles.insert(0, b["style"])
    hero = indent(link_prereqs(intro[0]["body"]), 4) + "\n" if intro else ""
    # \( … \) · \[ … \] → KaTeX. 중학교 개념 설명 창(basics/)에도 수식이 있어 설명 버튼이 있는 절은 항상 불러온다
    has_math = "p-basic" in hero or any("\\(" in b["body"] or "\\[" in b["body"] for b in intro + items)
    math_css = '  <link rel="stylesheet" href="../../assets/katex/katex.min.css">\n' if has_math else ""
    math_js = '<script src="../../assets/katex/katex.min.js"></script>\n<script src="../../js/math.js"></script>\n' if has_math else ""
    desc = intro[0]["description"] if intro else ""
    style = ("  <style>\n" + indent("\n".join(styles), 4) + "\n  </style>\n") if styles else ""
    return f'''<!doctype html>
<!-- 자동 생성: python3 tools/build.py — 직접 고치지 말고 blocks/ 와 curricula/ 를 고칠 것 -->
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{H.escape(sec["title"], quote=False)} — 나뭇잎 디지털 교과서</title>
  <meta name="description" content="{H.escape(desc)}">
{pwa_head("../../")}
  <link rel="stylesheet" href="../../css/tb.css">
{math_css}{style}</head>
<body data-course="{course["id"]}" data-sec="{ch["n"]}-{sec["n"]}">

<header class="top">
  <a class="brand" href="../../"><svg class="brand-mark"><use href="#nm"/></svg>나뭇잎 디지털 교과서</a>
  <nav class="crumbs" aria-label="위치"></nav>
  <div class="top-right"><a href="../../graph.html">개념 지도</a><a href="../../notes.html">내 노트</a><a href="./">← 과목 목차</a>{THEME_BTN}</div>
</header>

<main class="wrap">
  <section class="topic-hero">
    <div class="meta"></div>
    <h1>{sec["title"]}</h1>
{hero}  </section>

  <div class="topic-layout">
    <aside class="toc" aria-label="이 절의 카드">
      <p class="mono small toc-title">이 절의 카드<button type="button" class="toc-fold" aria-expanded="true" aria-controls="toc-list" title="카드 목록 접기"><span>접기</span></button></p>
      <ol id="toc-list">
{chr(10).join(toc)}
      </ol>
      <p class="progress mono small"></p>
      <p class="toc-links mono small"><a href="../../graph.html?sec={course["id"]}-{ch["n"]}-{sec["n"]}">이 절을 개념 지도에서 보기</a></p>
    </aside>

    <div>
{(chr(10) + chr(10)).join(bodies)}

      <a class="px-go" href="../../practice.html?sec={course["id"]}-{ch["n"]}-{sec["n"]}"><span class="mono">연습문제</span><b>이 절의 기출 문항 풀기</b><span class="mono px-n">{exam_count(course, ch, sec)}</span></a>

      <nav class="next" aria-label="절 이동"></nav>
    </div>
  </div>
</main>

<script src="../../js/toc.js"></script>
<script src="../../js/core.js"></script>
{math_js}<script src="../../js/store.js"></script>
<script src="../../js/notes.js"></script>
<script src="../../js/reader.js"></script>
<script src="../../js/prereq.js"></script>
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
    pages = []
    for c in cur["courses"]:
        NAMES[c["id"]] = c["name"]
        tc = {"id": c["id"], "name": c["name"], "meta": c["meta"], "track": c["track"], "level": c["level"], "chapters": []}
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
                items = [{"kind": TOC_KIND[blocks[b]["type"]], "id": b, "title": tex_plain(blocks[b]["title"])}
                         for b in s["blocks"] if blocks[b]["type"] in TOC_KIND]
                tch["sections"].append({"n": s["n"], "title": s["title"], "code": s["code"], "page": bool(s["blocks"]), "items": items})
                if s["blocks"]:
                    pages.append((c, ch, s))

    # 연관 카드는 모든 배치를 알아야 고를 수 있으므로 페이지는 배치표를 다 읽은 뒤에 쓴다
    USED.update(used)
    _TITLES.update({b: blocks[b]["title"] for b in used})
    REL.update(related_map(blocks, used))
    load_prereqs(used)
    for c, ch, s in pages:
        p = out / "c" / c["id"] / f'{ch["n"]}-{s["n"]}.html'
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(page_html(c, ch, s, blocks))

    (out / "js").mkdir(parents=True, exist_ok=True)
    (out / "js" / "toc.js").write_text("/* 자동 생성: python3 tools/build.py — 직접 고치지 말 것 */\nwindow.TOC = " + json.dumps(toc, ensure_ascii=False, indent=1) + ";\n")
    build_graph(blocks, used, out)
    if out == ROOT:
        build_sw()   # 페이지를 모두 만든 뒤에 해시를 잰다
    unused = sorted(set(blocks) - set(used))
    for c in toc:
        n = sum(len(s["items"]) for ch in c["chapters"] for s in ch["sections"])
        secs = [s for ch in c["chapters"] for s in ch["sections"]]
        print(f'{c["name"]}: 절 {sum(s["page"] for s in secs)}/{len(secs)}, 항목 {n}')
    if unused:
        print(f"배치되지 않은 블록 {len(unused)}개: {', '.join(unused)}")


if __name__ == "__main__":
    main()
