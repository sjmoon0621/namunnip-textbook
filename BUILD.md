# 절(section) 페이지 제작 가이드

나뭇잎 디지털 과학 교과서는 **과목 → 대단원 → 절 → 카드** 구조다. 목차와 카드 제목 가안은 `curriculum.md`에 있다.
여러 명이 동시에 만들고 있으니 **아래 규칙을 반드시 지킨다.**

## 1. 파일 규칙

| 무엇 | 경로 | 비고 |
|---|---|---|
| 절 페이지 | `c/<과목>/<대단원>-<절>.html` | 예: 통합과학1 Ⅲ-3 → `c/is1/3-3.html` |
| 카드·영상 스크립트 | `js/cards/<과목>/<이름>.js` | 카드 하나에 파일 하나 |
| 과목 코드 | `is1` 통합과학1 · `is2` 통합과학2 · `phy` 물리학 · `chem` 화학 · `bio` 생명과학 · `earth` 지구과학 | |

- **고치면 안 되는 공용 파일:** `css/tb.css`, `js/core.js`, `js/toc.js`, `index.html`, `c/*/index.html`, `tools/*`, 다른 사람이 맡은 절의 파일.
- 공용 CSS에 없는 스타일이 필요하면, 내 페이지 `<head>` 안 `<style>`에 **내 카드 id로 범위를 좁혀서** 쓴다 (`#card-is1-sound .foo { … }`).
- 공용 도구가 부족하면 내 카드 파일 안에 작은 함수를 만든다.
- 외부 라이브러리는 쓰지 않는다. 캔버스 2D(또는 인라인 SVG)와 순수 JS로 그린다. 3D가 필요하면 직접 회전·투영한다.
- 이미 만든 페이지(`c/is1/3-3.html`, `c/is2/2-4.html`, `c/phy/1-4.html`)에 카드를 **추가**하라고 지시받았다면, 기존 카드 마크업과 스크립트는 건드리지 말고 새 카드만 끼워 넣고 번호·목차만 맞춘다.

## 2. 페이지 뼈대

`c/is1/3-3.html`을 그대로 본뜬다. 핵심:

```html
<body data-course="is1" data-sec="1-3">          <!-- 과목 코드와 "대단원-절" -->
<header class="top"> … <nav class="crumbs"></nav> … </header>   <!-- 비워 두면 core.js가 채움 -->
<section class="topic-hero">
  <div class="meta"></div>                         <!-- 비워 두면 core.js가 채움 -->
  <h1>측정과 어림</h1>                              <!-- 절 제목 = curriculum.md의 절 이름 -->
  <p class="lead">…이 절에서 다루는 질문 2~3문장…</p>
  <div class="prereq"><span class="mono">먼저 알면 좋은 것</span><span class="p">…</span></div>
</section>
<aside class="toc"> 카드 목록 (#id 링크, 번호) + <p class="progress mono small"></p> </aside>
… 카드들 …
<nav class="next" aria-label="절 이동"></nav>        <!-- 비워 두면 core.js가 채움 -->
<script src="../../js/toc.js"></script>
<script src="../../js/core.js"></script>
<script src="../../js/cards/is1/….js"></script>
```

`<title>`과 설명 meta도 채운다(core.js가 title은 다시 쓴다).

## 3. 개념 카드

```html
<article class="card" id="card-<과목>-<짧은이름>">
  <header class="card-head"><span class="no">1.3.2</span><h2>질문 형태의 제목?</h2><span class="kind">주제 · 방식</span></header>
  <div class="card-body">
    <div class="card-fig"> 캔버스·조작 도구·수치 (.ctl, .presets .chip, .nums, .readout, .legend, .fig-note) </div>
    <ol class="steps">
      <li><span class="tag">질문</span>…</li>
      <li><span class="tag">복원</span>…</li>
      <li><span class="tag">설명</span>…</li>
      <li><span class="tag">연결</span>…</li>
      <li><span class="tag">적용</span>…그림을 조작하게 하는 지시…</li>
      <li class="warn"><span class="tag">판단</span>…오개념, 모형의 한계, 성립 조건…</li>
    </ol>
  </div>
  <div class="quiz">
    <h3><span class="mono">확인</span>조건이 달라지면</h3>
    <p class="q">…조건을 바꾼 새 상황의 문제…</p>
    <ol>
      <li><button class="opt" data-ok="0"><span class="mono">ㄱ</span><span>보기<span class="why"><b>한 줄 판정.</b> 왜 그럴듯한지, 왜 틀렸는지.</span></span></button></li>
      <li><button class="opt" data-ok="1">…정답도 .why로 이유…</button></li>
      <li><button class="opt" data-ok="0">…</button></li>
    </ol>
  </div>
</article>
```

- 번호 `no`는 `대단원.절.순서` (예: 1.3.2).
- 카드 스크립트는 `(() => { const root = document.getElementById("card-…"); if (!root) return; … })();` 형태. `root.querySelector`로만 요소를 찾는다(페이지 안 id 충돌 방지).
- 공용 도구 `window.NM`: `NM.C`(색), `NM.F`(글꼴), `NM.fit(canvas, draw)`(DPR 맞춤, 첫 그리기는 비동기라 `draw` 안에서 `if (!w) return;` 처리), `NM.loop(el, frame)`(보일 때만 도는 애니메이션, `frame(dt)`), `NM.axes(ctx, {...})`(그래프 눈금), `NM.clamp`, `NM.ease`, `NM.reduce`(동작 줄이기 설정).
- 좋은 예시: `js/cards/free-fall.js`, `js/cards/pendulum.js`, `js/cards/leaf-color.js`, `js/cards/photo-rate.js`, `js/cards/inverse-square.js`.
- 캔버스 크기 클래스: `.cv-wide`(16:9), `.cv-sq`(1:1), 두 캔버스 나란히 `.card-fig.fig-2`.

## 4. 영상

`section.video-block` + 9:16 캔버스(360×640 논리 크기)를 코드로 그린다. 장면 목록·자막·진행 막대·재생/일시정지/탐색 막대를 갖춘다. `js/cards/reel-apple.js`와 `c/is1/3-3.html`의 영상 마크업을 본뜬다. 20~40초.

## 5. 내용 원칙 (가장 중요)

1. **내용을 줄이지 말고 계단을 놓는다.** 정의보다 필요성, 식보다 관계, 결론보다 근거를 먼저 쓴다. 식에는 성립 조건을 붙인다.
2. **그림은 반드시 학생이 조작해서 무언가를 발견하게** 만든다. 장식용 애니메이션, 단순 슬라이드쇼는 카드가 아니다.
3. **숫자는 정확하게.** 실제 상수·관측값을 쓰고, 단순화한 모형이면 카드 안에 ‘모식’, ‘상대값’이라고 밝힌다. 확실하지 않은 자료는 만들어 내지 말고 카드를 바꾸거나 뺀다.
4. **판단 단계**에는 대표 오개념이나 모형의 한계를 쓴다. 확인 문제는 조건이 달라진 새 상황이고, 오답마다 ‘왜 그럴듯한지’를 설명한다.
5. **문체:** 고등학생에게 말하듯 존댓말(~입니다/~습니다), 짧은 문장. 번역투, 과장(“놀라운”, “혁신적인”), 이모지 금지. 기존 카드 문장을 기준으로 삼는다.
6. **curriculum.md의 카드 제목은 가안이다.** 더 좋은 질문이 있으면 바꿔도 되고, 인터랙티브로 만들 가치가 없거나 부적절하면 **빼도 된다.** 억지로 채우지 않는다. 뺀 것과 바꾼 것은 보고서에 적는다.
7. 절의 성취기준(코드)이 요구하는 핵심을 카드들이 함께 다루는지 확인한다.

## 6. 확인

```bash
python3 tools/check.py <내 포트> c/is1/1-1.html c/is1/1-2.html            # 콘솔 오류 검사
python3 tools/check.py <내 포트> --shot <스크래치 폴더> c/is1/1-1.html     # 1440px 스크린샷
python3 tools/check.py <내 포트> --mobile --shot <스크래치 폴더> c/is1/1-1.html   # 390px
```

- 모든 내 페이지가 `OK`여야 한다. 스크린샷을 직접 열어 그림이 제대로 그려졌는지, 글자가 겹치지 않는지, 모바일에서 가로 넘침이 없는지 본다.
- 계산이 들어간 카드는 `node`로 핵심 수치를 따로 검산한다.

## 7. 보고

끝나면 다음을 짧게 보고한다: 만든 페이지 경로, 절마다 카드·영상 제목, curriculum.md와 달라진 점(뺀 것·바꾼 것·추가한 것과 이유), check.py 결과, 남은 문제.
