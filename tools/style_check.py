"""STYLE.md 7절: 카드 문장·서식 점검. 나뭇잎·QURI 두 저장소에 같은 파일이 있다.

usage: python -I -X utf8 tools/style_check.py [파일이나 폴더 …] [--all] [--kind 본문]
  인자가 없으면 blocks/ 전체를 재서 요약만 보인다. --all이면 기준을 넘는 카드를 모두 적는다.
기준(STYLE.md 3절)을 넘으면 카드 이름과 이유를 적고, 하나라도 넘으면 종료 코드 1."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TAG = re.compile(r"<script\b.*?</script>|<style\b.*?</style>|<!--.*?-->|<pre\b.*?</pre>|<code\b.*?</code>", re.S)   # 코드는 문장이 아니므로 재지 않는다
ALLTAG = re.compile(r"<[^>]+>")
MATH = re.compile(r"\\\(.+?\\\)|\\\[.+?\\\]", re.S)
CONN = ("그러므로", "따라서", "즉", "하지만", "그런데", "그렇다면", "다시 말해", "바꿔 말하면", "여기서", "이제", "한편",
        "예를 들어", "가령", "이 때", "이때", "그러면", "왜냐하면", "물론", "사실", "그래서")
LABEL = re.compile(r"^(확인|복원|판단|연결|설명|적용|질문|핵심|요약|정리|답|힌트|주의|포인트|결론)\s*[:：]")
STOCK = re.compile(r"핵심은|중요합니다|중요한 점은|살펴보겠습니다|알아보겠습니다|살펴봅시다|다음과 같습니다|단순히 [^.]{0,30}아니라|라는 점에서|(?<![가-힣])이처럼|놀랍게도|흥미롭게도")
LIMITS = {"li": 2.0, "bold": 0.5, "dash": 0.1, "colon": 1.0, "stock": 0.3}   # 1천 자당 상한
MIN_CONN = 4.0   # 100문장당 하한 (본문)


QUIZ = re.compile(r'<div class="quiz">.*?(?=</article>)', re.S)   # 확인 문제는 존댓말 화면 문구이고 보기·판정 서식이 정해져 있어 재지 않는다
STEPS = re.compile(r'<ol class="steps">(.*?)</ol>', re.S)
STEP_LI = re.compile(r'<li\b[^>]*>\s*<span class="tag">[^<]*</span>(.*?)</li>', re.S)
STEP_END = re.compile(r"(다|까|자|가|라|나|지)(\s*\([^()]*\)|\s*식\s*)?[.?!]?[\"'”’)]*$")   # 단계 문장은 '~다'체 완결 문장으로 끝난다(2026-10-22 결정)
HON_END = re.compile(r"((?<!아)니다|세요|까요|에요|해요|가요|나요)(\s*\([^()]*\))?[.?!]?[\"'”’)]*$")
HON_MID = re.compile(r"((?<!아)니다|세요)[.?!]\s")


def step_issues(h):
    """탐구 카드 단계: 존댓말 끝맺음과 문장이 아닌 조각을 센다."""
    m = STEPS.search(h)
    if not m:
        return 0, 0
    hon = frag = 0
    for body in STEP_LI.findall(m.group(1)):
        t = re.sub(r"\s+", " ", ALLTAG.sub(" ", MATH.sub(" 식 ", body))).strip()
        if HON_END.search(t) or HON_MID.search(t):
            hon += 1
        elif not STEP_END.search(t):
            frag += 1
    return hon, frag


def measure(p):
    h = p.read_text(encoding="utf-8", errors="ignore")
    kind = (re.search(r'data-kind="([^"]+)"', h) or [None, "?"])[1]
    hon, frag = step_issues(h)
    h = QUIZ.sub(" ", h)
    h = re.sub(r'<span class="src">.*?</span>', " ", h, flags=re.S)   # 출처 줄(사진: 저작자 · 라이선스)은 본문이 아니다
    h = re.sub(r'<span class="(?:pf-)?why">.*?</span>(?=\s*</li>|\s*</span>)', " ", h, flags=re.S)   # 조작 칸의 판정 풀이는 확인 문제처럼 독자에게 답하는 존댓말 화면 문구이다
    h = re.sub(r'<ol class="(?:spot|pf-pool)">.*?</ol>', lambda m: re.sub(r"<li\b", "<p", m.group(0)), h, flags=re.S)   # 틀린 줄 찾기·증명 조립 칸의 줄은 누르는 조작 목록이다
    h = re.sub(r">\s*[—–-]\s*<", "><", h)   # 스크립트가 채울 자리표시 '—'는 줄표가 아니다
    h = re.sub(r"<b>\s*</b>|<li\b[^>]*>\s*</li>|<li class=|<li><label", lambda m: "" if m.group(0).startswith("<b") or m.group(0).endswith("</li>") else ("<p class=" if "class" in m.group(0) else "<p><label"), h)   # 빈 자리표시, 스크립트가 다루는 조작 목록(class 붙은 li), 고르는 체크 목록(label 붙은 li)은 글의 목록이 아니다
    h = re.sub(r'(<p class="judge">)\s*<b>([^<]*)</b>', r"\1\2 ", h)   # 판단 상자 머리의 <b>는 강조가 아니라 꼬리표 서식이다
    # 탐구 카드의 여섯 단계는 정해진 짜임이라 목록으로 세지 않는다
    h = STEPS.sub(lambda m: re.sub(r"<li\b", "<p", m.group(0)), h)
    body = TAG.sub(" ", h)
    t = re.sub(r"\s+", " ", ALLTAG.sub(" ", MATH.sub(" 식 ", body)))
    C = max(len(t), 1)
    ss = [s.strip() for s in re.split(r"(?<=[.?!])\s+", t) if len(s) > 8 and re.search(r"[가-힣]", s)]
    n = max(len(ss), 1)
    da = sum(bool(re.search(r"다\.$", s)) and not re.search(r"(?<!아)니다\.$", s) for s in ss)
    nida = sum(bool(re.search(r"(?<!아)니다\.$", s)) for s in ss)   # '아니다.'는 '~다'체이다
    return {
        "kind": kind, "chars": len(t), "sents": len(ss),
        "li": 1000 * len(re.findall(r"<li\b", body)) / C,
        "bold": 1000 * len(re.findall(r"<b>|<strong>", body)) / C,
        "dash": 1000 * len(re.findall(r"—", t)) / C,
        "colon": 1000 * len(re.findall(r"[가-힣a-z)]: ", t)) / C,
        "stock": 1000 * len(STOCK.findall(t)) / C,
        "conn": 100 * sum(s.startswith(CONN) for s in ss) / n,
        "label": sum(bool(LABEL.match(s)) for s in ss),
        "mixed": min(da, nida) >= 3 and min(da, nida) / n > 0.15,
        # 절 머리말(intro)과 영상 카드는 화면이 독자에게 말을 거는 안내라 존댓말을 쓴다
        "nida": nida if nida >= 3 and nida / n > 0.3 and not p.name.startswith(("intro-", "video-")) else 0,
        "figure": bool(re.search(r"<figure|<svg|<canvas|<img", h)),
        "step_hon": hon, "step_frag": frag,
    }


def problems(m):
    out = [f"{k} {m[k]:.1f}/1천자 > {v}" for k, v in LIMITS.items() if m[k] > v]
    if m["kind"] == "본문" and m["sents"] >= 15 and m["conn"] < MIN_CONN:
        out.append(f"잇는 말 {m['conn']:.1f}/100문장 < {MIN_CONN}")
    if m["label"]:
        out.append(f"꼬리표 문장 {m['label']}개")
    if m["mixed"]:
        out.append("'~다'체와 '~니다'체가 섞임")
    elif m["nida"]:
        out.append(f"'~니다'체 문장 {m['nida']}개")
    if m["kind"] == "본문" and not m["figure"]:
        out.append("그림 없음")
    if m["step_hon"]:
        out.append(f"존댓말로 끝나는 단계 {m['step_hon']}개")
    if m["step_frag"]:
        out.append(f"문장으로 끝나지 않는 단계 {m['step_frag']}개")
    return out


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    kind = sys.argv[sys.argv.index("--kind") + 1] if "--kind" in sys.argv else None
    if kind in args:
        args.remove(kind)
    paths = [Path(a) for a in args] or [ROOT / "blocks"]
    files = [f for p in paths for f in ([p] if p.is_file() else sorted(p.rglob("*.html")))]
    files = [f for f in files if not f.name.startswith("related-")]   # 관련 카드 상자는 링크 목록이라 글로 재지 않는다
    bad, rows = [], []
    for f in files:
        m = measure(f)
        if kind and m["kind"] != kind:
            continue
        rows.append(m)
        pr = problems(m)
        if pr:
            bad.append((f, m["kind"], pr))
    show = "--all" in sys.argv or bool(args)
    for f, k, pr in (bad if show else bad[:20]):
        print(f"{f.relative_to(ROOT) if f.is_relative_to(ROOT) else f} [{k}]: {'; '.join(pr)}")
    if rows:
        avg = lambda k: sum(r[k] for r in rows) / len(rows)
        print(f"\n카드 {len(rows)}장 중 기준을 넘는 카드 {len(bad)}장 · 평균 목록 {avg('li'):.1f} · 굵게 {avg('bold'):.1f} · 줄표 {avg('dash'):.2f} "
              f"· 쌍점 {avg('colon'):.1f} (1천 자당) · 잇는 말 {avg('conn'):.1f}/100문장 · 그림 있는 카드 {100 * avg('figure'):.0f}%")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
