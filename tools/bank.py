#!/usr/bin/env python3
"""AI 출제 연습 문항(문제은행) 도구. 문항은 과목마다 exams/bank/<과목>.json 한 파일에 둔다.

사용:
  python3 tools/bank.py import <원고.txt> [...]   원고를 읽어 exams/bank/<과목>.json을 새로 쓴다(검사 포함)
  python3 tools/bank.py check                     모든 문제은행 파일을 배치표(curricula/2022.json)와 맞춰 검사
  python3 tools/bank.py stat                      과목별 문항 수와 중간·기말 시험지 수

JSON 형식 (exams/bank/<과목>.json) — 카드 HTML과 따로 두어 나중에 문항 DB로 옮기기 쉽게 한다:
  { "course": "dmath", "kind": "ai", "note": "...",
    "items": [ { "id": "ai-dmath-1-1-01", "sec": "1-1", "type": "mc" | "short" | "free", "lv": "기본" | "응용" | "심화",
                 "q": "<p>문제 HTML(수식은 \\( … \\))</p>", "choices": ["…" ×5](mc만), "answer": "3",
                 "alt": ["다른 표기의 정답", …](short 선택), "rubric": [{"pt": 2, "t": "채점 요소"}, …](free만),
                 "hints": ["힌트", …](선택), "sol": "<p>풀이(free는 모범 답안) HTML</p>" } ] }
  - mc의 answer는 "1"~"5", short는 숫자나 짧은 글. 채점은 js/bank.js가 한다(공백 무시, 분수·소수는 값으로 비교).
  - free(서술형)는 풀이 과정을 쓰는 문항이다. answer는 최종 결론 한 줄, sol은 모범 답안, rubric은 부분 점수 요소이며
    화면에서 학생이 요소마다 스스로 채점한다.
  - 필드 이름(type, lv, q, choices, answer, hints, sol)은 QURI 시험 전용 문항 형식(qcard/1)과 같다.

원고 형식 (줄 단위, 빈 줄은 무시):
  # dmath                과목 코드 (첫 줄)
  ## 1-1                 절 (대단원-절). 아래 문항은 이 절에 속한다
  ? 문제 첫 문단         문항 시작. 이어지는 표시 없는 줄은 새 문단
  ㄱ. … / ㄴ. … / ㄷ. …  <보기> 상자
  | a | b |              표 한 줄(첫 줄은 머리)
  1) … ~ 5) …            선택지(있으면 객관식, 없으면 단답형)
  = 3                    정답. 단답형은 '= 12 | 12.0'처럼 다른 표기를 |로 더할 수 있다
  > 풀이 문단            풀이(여러 줄이면 문단 여러 개). 서술형이면 모범 답안
  ?* 문제 첫 문단        서술형(free) 문항 시작. '= 결론'과 '+2 채점 요소' 줄(점수와 설명)이 있어야 한다
  @ 응용                 난이도(기본·응용·심화, 첫 글자만 써도 된다). 모든 문항에 있어야 한다
  * 힌트                 힌트(여러 줄이면 여러 개)

  python3 tools/bank.py balance [과목 …] [--n 2000]   시험지 난이도 균형 검사(고정 시험지와 무작위 시험지 n번)

난이도(lv) 기준 — 풀이 단계 수, 엮인 개념 수, 계산량, 함정 여부로 매긴다:
  기본  개념 하나를 바로 적용, 1~2단계, 계산이 짧고 함정 없음
  응용  개념 두 개를 엮거나 새 상황·자료·그래프에 적용, 3단계 안팎
  심화  개념 셋 이상을 엮거나 조건을 바꾼 상황, 4단계 이상이거나 흔한 함정을 피해야 하는 문항(내신 변별 수준)
시험지 출제(js/bank.js deal): 시험지는 사람마다 다르다. 브라우저마다 한 번 만든 씨앗으로 범위 문항을 층(기본·응용·심화,
  서술형)마다 섞고 층 안에서는 절을 번갈아 늘어놓은 뒤 장마다 돌려 담는다(같은 사람은 늘 같은 시험지, 장끼리 겹치지 않음).
  장마다 서술형을 먼저 담고, 장 전체가 기본 30 · 응용 50 · 심화 20이 되도록 나머지를 채운다(층이 모자라면 가까운 층에서). 기출(exams/sec, conf high)을
  섞으면(기본값) 기출 난이도는 배점으로 정한다: 수학 2점 기본·3점 응용·4점 심화, 탐구 2점 기본·3점 응용(16번 이후 3점은 심화).
  배점이 없으면 문항 글의 '[n점]' 표기, 그것도 없으면 번호로 정한다(규칙 전문은 js/bank.js 머리말).
  그래서 AI 문항은 범위마다 기본 30% 안팎, 심화 20% 이상이 되게 쓰면 기출을 빼도 비율이 맞는다.
  아래 balance는 예전 고정 시험지 규칙으로 AI 문항 풀의 층 구성을 보는 비교용이다. 평균 난이도는 기본 1, 응용 2, 심화 3으로 낸다.

  python3 tools/bank.py lv <원고.txt> 기기응심…   난이도 줄이 없는 문항에 차례로 '@ …' 줄을 넣는다(옛 원고에 난이도를 붙일 때)
"""
import json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
BANK = ROOT / "exams" / "bank"
NOTE = "AI가 고등학교 교육과정 범위에서 출제한 연습 문항입니다. 실제 시험에 나온 문항이 아닙니다."
SHEET = 20   # 시험지 한 장의 문항 수(대략)
LV = {"기": "기본", "응": "응용", "심": "심화"}


def is_item(line):
    return line.startswith("? ") or line.startswith("?* ")


def rd(p):
    return p.read_text(encoding="utf-8")


def wr(p, s):
    p.write_text(s, encoding="utf-8", newline="\n")


def courses():
    cur = json.loads(rd(ROOT / "curricula" / "2022.json"))
    return {c["id"]: c for c in cur["courses"]}


def split(course):
    """tools/build.py의 exam_split과 같다. 중간고사 범위 = 앞쪽 절 몇 개(목차 순서). 절 수의 절반에서 1절 이내에 대단원 경계가 있으면 그 경계에서,
    없으면 대단원 중간이라도 절반(올림)에서 나눈다. 기말고사 범위는 나머지 절이다."""
    sizes = [len(ch["sections"]) for ch in course["chapters"]]
    total = sum(sizes)
    cuts = [sum(sizes[:k]) for k in range(1, len(sizes))]
    near = [x for x in cuts if abs(x - total / 2) <= 1]
    return min(near, key=lambda x: (abs(x - total / 2), -x)) if near else (total + 1) // 2


def parse(path):
    lines = rd(path).split("\n")
    cid, sec, items, cur = None, None, [], None

    def close():
        nonlocal cur
        if cur:
            if cur["gana"]:
                cur["q"].append('<ol class="gana">' + "".join(f"<li>{g}</li>" for g in cur["gana"]) + "</ol>")
            if cur["table"]:
                head, *rows = cur["table"]
                cur["q"].append("<table><tr>" + "".join(f"<th>{x}</th>" for x in head) + "</tr>"
                                + "".join("<tr>" + "".join(f"<td>{x}</td>" for x in r) + "</tr>" for r in rows) + "</table>")
            items.append(cur)
        cur = None

    for ln, raw in enumerate(lines, 1):
        line = raw.rstrip()
        if not line.strip():
            continue
        where = f"{path.name}:{ln}"
        if line.startswith("## "):
            close(); sec = line[3:].strip()
            if not re.fullmatch(r"\d+-\d+", sec):
                raise SystemExit(f"{where}: 절 표기는 '## 1-2' 꼴이어야 합니다")
        elif line.startswith("# "):
            close(); cid = line[2:].strip()
        elif is_item(line):
            close()
            if not (cid and sec):
                raise SystemExit(f"{where}: 과목(# …)과 절(## …)을 먼저 적어야 합니다")
            free = line.startswith("?* ")
            cur = {"sec": sec, "q": [line[3 if free else 2:].strip()], "gana": [], "table": [], "choices": [], "answer": None, "sol": [],
                   "ln": where, "free": free, "lv": None, "hints": [], "rubric": []}
        elif cur is None:
            raise SystemExit(f"{where}: 문항(? …) 밖의 줄입니다: {line[:40]}")
        elif re.match(r"^[ㄱㄴㄷㄹ]\. ", line):
            cur["gana"].append(line)
        elif line.startswith("|"):
            cur["table"].append([x.strip() for x in line.strip().strip("|").split("|")])
        elif re.match(r"^[1-5]\) ", line):
            cur["choices"].append(line[3:].strip())
        elif line.startswith("@ "):
            v = line[2:].strip()
            cur["lv"] = LV.get(v, v)
        elif line.startswith("* "):
            cur["hints"].append(line[2:].strip())
        elif re.match(r"^\+\d+ ", line):
            pt, t = line[1:].split(" ", 1)
            cur["rubric"].append({"pt": int(pt), "t": t.strip()})
        elif line.startswith("= ") and cur["free"]:
            cur["answer"] = [line[2:].strip()]
        elif line.startswith("= "):
            cur["answer"] = [x.strip() for x in line[2:].split("|") if x.strip()]
        elif line.startswith("> "):
            cur["sol"].append(line[2:].strip())
        else:
            if cur["sol"]:
                cur["sol"].append(line.strip())
            else:
                cur["q"].append(line.strip())
    close()
    if not cid:
        raise SystemExit(f"{path}: 첫 줄에 '# 과목코드'가 없습니다")

    out, seen = [], {}
    for it in items:
        k = seen[it["sec"]] = seen.get(it["sec"], 0) + 1
        o = {"id": f'ai-{cid}-{it["sec"]}-{k:02d}', "sec": it["sec"], "type": "free" if it["free"] else "mc" if it["choices"] else "short",
             "lv": it["lv"], "q": "".join(x if x.startswith("<") else f"<p>{x}</p>" for x in it["q"])}
        if it["choices"]:
            o["choices"] = it["choices"]
        if not it["answer"]:
            raise SystemExit(f'{it["ln"]}: 정답(= …)이 없습니다')
        o["answer"] = it["answer"][0]
        if len(it["answer"]) > 1:
            o["alt"] = it["answer"][1:]
        if it["rubric"]:
            o["rubric"] = it["rubric"]
        if it["hints"]:
            o["hints"] = it["hints"]
        o["sol"] = "".join(f"<p>{x}</p>" for x in it["sol"])
        o["_ln"] = it["ln"]
        out.append(o)
    balance(out)
    return cid, out


CIRCLED = "①②③④⑤"


def _num(s):
    """선택지가 '수(와 단위)'뿐이면 그 값, 아니면 None. 수로만 된 선택지는 작은 것부터 늘어놓는 관례라 순서를 바꾸지 않는다."""
    t = re.sub(r"\\[()]|\\[,;!\s]|\s", "", s)
    m = re.fullmatch(r"-?\\dfrac\{(-?[\d.]+)\}\{([\d.]+)\}", t)
    if m:
        return float(m.group(1)) / float(m.group(2))
    m = re.match(r"(?:약)?(-?\d[\d,]*(?:\.\d+)?)", t)
    if m and not re.search(r"[가-힣]", re.sub(r"배|년|명|개|번|원|장|일|분|시간|초|가지|회|쌍|층|만|억", "", t[m.end():])):
        return float(m.group(1).replace(",", ""))   # 뒤에 단위(영문, 배·년·개 등)만 붙은 수
    return None


def fixed_order(it):
    """선택지 순서를 그대로 두어야 하는 문항: 수 선택지(오름차순 관례), ㄱㄴㄷ 조합, 선택지 글이 다른 선택지 번호를 가리키는 경우."""
    ch = it["choices"]
    if all(re.fullmatch(r"[ㄱㄴㄷㄹ](, [ㄱㄴㄷㄹ])*", c.strip()) for c in ch):
        return True
    if any(x in s for s in ch + [it["q"]] for x in CIRCLED):   # 문제 속 ①②는 대개 절차 번호라 바꾸면 안 된다
        return True
    return all(_num(c) is not None for c in ch)


def balance(items):
    """원고를 쓸 때 정답이 ②에 몰리기 쉬워, 순서를 바꿔도 되는 객관식은 정답 자리를 과목 안에서 고르게 옮긴다.
    정답 선택지만 목표 자리로 옮기고 나머지는 원래 순서를 지킨다. 문제·풀이 속 ①~⑤ 표기도 새 번호로 바꾼다. 같은 원고면 결과도 같다."""
    mcs = [it for it in items if it["type"] == "mc"]
    count = [0] * 5
    movable = []
    for it in mcs:
        if fixed_order(it):
            count[int(it["answer"]) - 1] += 1
        else:
            movable.append(it)
    for it in movable:
        old = int(it["answer"]) - 1
        target = min(range(5), key=lambda k: (count[k], (k - old) % 5))   # 가장 적게 쓰인 자리(같으면 원래 자리에서 가까운 쪽)
        count[target] += 1
        order = [i for i in range(5) if i != old]
        order.insert(target, old)                                          # order[새 자리] = 옛 자리
        it["choices"] = [it["choices"][i] for i in order]
        new_of = {o: n for n, o in enumerate(order)}
        remap = lambda s: re.sub("[①②③④⑤]", lambda m: CIRCLED[new_of[CIRCLED.index(m.group(0))]], s)
        it["q"], it["sol"] = remap(it["q"]), remap(it["sol"])
        it["answer"] = str(target + 1)


def check_items(cid, items, cs):
    errs = []
    c = cs.get(cid)
    if not c:
        return [f"배치표에 없는 과목: {cid}"]
    secs = {f'{ch["n"]}-{s["n"]}' for ch in c["chapters"] for s in ch["sections"]}
    ids = set()
    for it in items:
        w = it.get("_ln") or it["id"]
        if it["id"] in ids:
            errs.append(f"{w}: id 중복 {it['id']}")
        ids.add(it["id"])
        if it["sec"] not in secs:
            errs.append(f"{w}: 이 과목에 없는 절 {it['sec']}")
        if it["type"] == "mc":
            if len(it.get("choices", [])) != 5:
                errs.append(f"{w}: 선택지가 5개가 아님({len(it.get('choices', []))}개)")
            if it["answer"] not in list("12345"):
                errs.append(f"{w}: 객관식 정답은 1~5 ({it['answer']})")
            if len(set(it.get("choices", []))) != len(it.get("choices", [])):
                errs.append(f"{w}: 같은 선택지가 두 번 있음")
        if it.get("lv") not in ("기본", "응용", "심화"):
            errs.append(f"{w}: 난이도(@ 기본·응용·심화)가 없거나 틀림 ({it.get('lv')})")
        if it["type"] == "free":
            rb = it.get("rubric") or []
            if sum(r["pt"] for r in rb) < 2 or any(r["pt"] < 1 or not r["t"] for r in rb):
                errs.append(f"{w}: 서술형은 채점 요소(+점수 설명)가 있어야 하고 만점이 2점 이상이어야 함")
        elif it.get("rubric"):
            errs.append(f"{w}: 채점 요소는 서술형에만 씀")
        if not it.get("sol"):
            errs.append(f"{w}: 풀이가 없음")
        text = it["q"] + "".join(it.get("choices", [])) + it.get("sol", "") + "".join(it.get("hints", [])) + "".join(r["t"] for r in it.get("rubric", []))
        if text.count("\\(") != text.count("\\)") or text.count("\\[") != text.count("\\]"):
            errs.append(f"{w}: 수식 괄호 \\( \\) 짝이 맞지 않음")
        if re.search(r"[\U0001F300-\U0001FAFF\u2600-\u27BF]", text):
            errs.append(f"{w}: 이모지")
    return errs


def write(cid, items):
    BANK.mkdir(parents=True, exist_ok=True)
    rows = [json.dumps({k: v for k, v in it.items() if not k.startswith("_")}, ensure_ascii=False) for it in items]
    head = json.dumps({"course": cid, "kind": "ai", "note": NOTE}, ensure_ascii=False)[:-1]
    wr(BANK / f"{cid}.json", head + ',\n"items": [\n' + ",\n".join(rows) + "\n]}\n")   # 문항 한 줄에 하나: diff를 읽기 쉽게


def load(cid):
    return json.loads(rd(BANK / f"{cid}.json"))


def stat_line(c, items):
    order = [f'{ch["n"]}-{s["n"]}' for ch in c["chapters"] for s in ch["sections"]]
    k = split(c)
    mid = [it for it in items if order.index(it["sec"]) < k]
    fin = [it for it in items if order.index(it["sec"]) >= k]
    sh = lambda xs: max(1, round(len(xs) / SHEET)) if xs else 0
    fr = lambda xs: sum(1 for it in xs if it["type"] == "free")
    hi = sum(1 for it in items if it.get("lv") in ("응용", "심화"))
    return (f'{c["id"]:9} {c["name"]:14} 문항 {len(items):4}  중간 {len(mid):3}({sh(mid)}장, 서술 {fr(mid):2})'
            f'  기말 {len(fin):3}({sh(fin)}장, 서술 {fr(fin):2})  응용·심화 {round(100 * hi / max(1, len(items))):3}%')


LV_ORDER = ["기본", "응용", "심화"]


def tier(it):
    return (3 if it["type"] == "free" else 0) + (LV_ORDER.index(it["lv"]) if it.get("lv") in LV_ORDER else 0)


def avg_lv(xs):
    v = [LV_ORDER.index(it["lv"]) + 1 for it in xs if it.get("lv") in LV_ORDER]
    return sum(v) / len(v) if v else 0


def fixed_sheets(pool, order, stratified=True):
    """js/bank.js sheets()와 같은 규칙. stratified=False는 예전 방식(단원 순서로 돌려 담기)"""
    key = (lambda it: (tier(it), order.index(it["sec"]), it["id"])) if stratified else           (lambda it: (it["type"] == "free", order.index(it["sec"]), it["id"]))
    pool = sorted(pool, key=key)
    n = max(1, round(len(pool) / SHEET)) if pool else 0
    return [pool[i::n] for i in range(n)]


def random_sheet(pool, rng):
    """js/bank.js randomSheet()와 같은 규칙: 층마다 비율대로 몫(최대 나머지), 층 안에서는 단원을 번갈아 뽑는다"""
    want = min(SHEET, len(pool))
    tiers = {}
    for it in pool:
        tiers.setdefault(tier(it), []).append(it)
    quota = {t: want * len(v) // len(pool) for t, v in tiers.items()}
    for t in sorted(tiers, key=lambda t: -(want * len(tiers[t]) / len(pool) % 1)):
        if sum(quota.values()) < want and quota[t] < len(tiers[t]):
            quota[t] += 1
    out = []
    for t, v in tiers.items():
        bucket = {}
        for it in rng.sample(v, len(v)):
            bucket.setdefault(it["sec"], []).append(it)
        secs = list(bucket)
        rng.shuffle(secs)
        i = got = 0
        while got < quota[t]:
            b = bucket[secs[i % len(secs)]]
            if b:
                out.append(b.pop()); got += 1
            i += 1
    return out


def balance(c, items, runs, rng):
    order = [f'{ch["n"]}-{s["n"]}' for ch in c["chapters"] for s in ch["sections"]]
    k = split(c)
    rows = []
    for name, pool in (("중간", [it for it in items if order.index(it["sec"]) < k]),
                       ("기말", [it for it in items if order.index(it["sec"]) >= k])):
        if not pool:
            continue
        new = [avg_lv(s) for s in fixed_sheets(pool, order)]
        old = [avg_lv(s) for s in fixed_sheets(pool, order, False)]
        ra = [avg_lv(random_sheet(pool, rng)) for _ in range(runs)]
        rp = [avg_lv(rng.sample(pool, min(SHEET, len(pool)))) for _ in range(runs)]   # 예전 무작위(그냥 섞어 뽑기)
        sd = lambda xs: (sum((x - sum(xs) / len(xs)) ** 2 for x in xs) / len(xs)) ** 0.5
        rows.append((name, avg_lv(pool), max(new) - min(new), max(old) - min(old), sd(ra), max(ra) - min(ra), sd(rp), max(rp) - min(rp)))
    return rows


def main():
    a = sys.argv[1:]
    cs = courses()
    if a and a[0] == "balance":
        import random
        rng = random.Random(1)
        runs = int(a[a.index("--n") + 1]) if "--n" in a else 2000
        want = [x for x in a[1:] if x in cs]
        print("과목      범위  평균  고정(새)폭 고정(옛)폭 | 무작위(새) 표준편차·폭 | 무작위(옛) 표준편차·폭")
        worst = [0, 0, 0]
        for f in sorted(BANK.glob("*.json")):
            if want and f.stem not in want:
                continue
            d = json.loads(rd(f))
            for name, m, fn, fo, rs, rw, ps, pw in balance(cs[d["course"]], d["items"], runs, rng):
                worst = [max(worst[0], fn), max(worst[1], rs), max(worst[2], rw)]
                print(f'{d["course"]:9} {name}  {m:.2f}  {fn:9.2f} {fo:9.2f} | {rs:8.3f} {rw:6.2f} | {ps:8.3f} {pw:6.2f}')
        print(f"가장 큰 값 — 고정 시험지 평균 차 {worst[0]:.2f}, 무작위 표준편차 {worst[1]:.3f}, 무작위 폭 {worst[2]:.2f}")
        return
    if not a or a[0] not in ("import", "check", "stat", "lv"):
        print(__doc__); return
    if a[0] == "lv":
        f, marks = pathlib.Path(a[1]), [m for m in "".join(a[2:]) if m in LV]
        lines = rd(f).split("\n")
        need = []   # 난이도 줄이 없는 문항의 줄 번호
        for i, line in enumerate(lines):
            if is_item(line):
                j = i + 1
                while j < len(lines) and not (is_item(lines[j]) or lines[j].startswith("#") or lines[j].startswith("@ ")):
                    j += 1
                if not (j < len(lines) and lines[j].startswith("@ ")):
                    need.append(i)
        if len(need) != len(marks):
            raise SystemExit(f"난이도가 없는 문항 {len(need)}개, 받은 표시 {len(marks)}개 — 고치지 않았습니다")
        for i, m in sorted(zip(need, marks), reverse=True):
            lines.insert(i + 1, f"@ {LV[m]}")
        wr(f, "\n".join(lines)); print(f"{f.name}: 난이도 {len(marks)}개를 넣었습니다"); return
    if a[0] == "import":
        bad = False
        for f in a[1:]:
            cid, items = parse(pathlib.Path(f))
            errs = check_items(cid, items, cs)
            if errs:
                bad = True
                print(f"{f}: 문제 {len(errs)}개\n  " + "\n  ".join(errs))
                continue
            write(cid, items)
            print(stat_line(cs[cid], items))
        sys.exit(1 if bad else 0)
    files = sorted(BANK.glob("*.json")) if BANK.exists() else []
    if a[1:]:   # check cm1 cm2 …처럼 과목을 주면 그 과목만
        files = [f for f in files if f.stem in a[1:]]
    bad, total = False, 0
    for f in files:
        d = json.loads(rd(f))
        if a[0] == "check":
            errs = check_items(d["course"], d["items"], cs)
            if errs:
                bad = True
                print(f"{f.name}: 문제 {len(errs)}개\n  " + "\n  ".join(errs))
        else:
            print(stat_line(cs[d["course"]], d["items"]))
        total += len(d["items"])
    print(f"과목 {len(files)}개, 문항 {total}개" + ("" if bad else (" — 모두 OK" if a[0] == "check" else "")))
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
