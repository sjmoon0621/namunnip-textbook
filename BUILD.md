# 제작 가이드 — 블록형 교과서

나뭇잎 디지털 과학 교과서는 **블록**을 **교육과정**에 배치해 만든다.

- **블록**(`blocks/`)은 카드, 읽기, 영상, 절 소개 같은 내용 한 조각이다. 고유 id를 가지며, 어느 절에 놓이는지는 모른다.
- **교육과정**(`curricula/2022.json`)은 과목 → 대단원 → 절 → [블록 id] 배치표다.
- `python3 tools/build.py`가 둘을 합쳐 절 페이지 `c/<과목>/<대단원>-<절>.html`과 목차 `js/toc.js`를 만든다. **생성된 파일은 직접 고치지 않는다.**

교육과정이 바뀌면 새 배치표(`curricula/20XX.json`)만 만들면 된다. 블록 id가 그대로이므로 학생의 노트와 진도도 따라간다.
`curriculum.md`는 처음 목차를 짤 때 쓴 기획안이고, 지금 구조의 기준은 `curricula/2022.json`이다.

## 1. 파일

| 무엇 | 경로 |
|---|---|
| 블록 | `blocks/<과목>/<블록 id>.html` — 파일 이름 = 블록 id = 최상위 요소의 id |
| 카드·영상 스크립트 | `js/cards/<과목>/<이름>.js` — 블록 머리의 `scripts`에 적는다 |
| 사진·그림 파일 | `assets/img/<과목>/<이름>` |
| 배치표 | `curricula/2022.json` |
| 공용 | `css/tb.css`, `js/core.js`, `js/home.js`, `index.html`, `c/*/index.html` |

과목 코드: `is1` 통합과학1 · `is2` 통합과학2 · `phy` 물리학 · `chem` 화학 · `bio` 생명과학 · `earth` 지구과학 · `extra` 교양·심화.
진로선택: `mech` 역학과 에너지 · `emq` 전자기와 양자 · `mateng` 물질과 에너지 · `rxn` 화학 반응의 세계 · `cell` 세포와 물질대사 · `gene` 생물의 유전 · `esys` 지구시스템과학 · `space` 행성우주과학.
과목을 새로 더하면 `js/graph.js`의 `COLORS`와 `ORDER`에도 넣는다(개념 지도의 색과 배치).

과목 안에서만 쓰는 공용 계산·그리기 도구는 카드 스크립트와 같은 폴더에 두고 `window.NM*` 이름으로 내보낸다. 이 파일은 특정 카드에 묶이지 않으므로, 쓰는 블록의 `scripts`에서 카드 스크립트보다 먼저 적는다.

| 도구 | 파일 | 쓰는 과목 |
|---|---|---|
| `NMChem` (맥스웰–볼츠만 분포) | `js/cards/mateng/k-mb.js` | 물질과 에너지 |
| `NMAcid` (산·염기 평형 풀이) | `js/cards/rxn/chem-eq.js` | 화학 반응의 세계 |
| `NMMol` (구조식 그리기) | `js/cards/rxn/mol-draw.js` | 화학 반응의 세계 |
| `NMCodon` (유전 부호 표) | `js/cards/gene/codon.js` | 생물의 유전 |

여러 과목에서 쓰게 되면 `js/lib/`로 옮기는 것을 검토한다(옮기면 블록 머리의 경로도 함께 고칠 것).
블록 폴더는 처음 만든 과목을 따르며, 다른 과목에 배치해도 옮기지 않는다.

## 2. 블록 파일 형식

```html
<!--block
{
  "type": "card",
  "scripts": ["js/cards/earth/ao-forcing.js"],
  "short": "옆 목차용 짧은 제목 (선택)"
}
-->
<style>
#card-earth-forcing canvas { aspect-ratio: 5 / 6; }
</style>
<article class="card" id="card-earth-forcing">
  <header class="card-head">
    <span class="no"></span><h2>…</h2><span class="kind">…</span>
  </header>
  …
</article>
```

- 머리 JSON의 `type`: `intro`(절 소개), `card`(개념 카드), `text`(읽기), `video`(영상), `related`(관련 카드 상자)
- `<style>`은 선택이다. 셀렉터는 반드시 **이 블록의 id로 시작**해야 한다(`#card-… .foo`). 빌드가 페이지 `<head>`에 모아 넣는다.
- `<span class="no"></span>`는 비워 둔다. 빌드가 배치된 위치에 따라 `대단원.절.순서`를 넣는다.
- 본문에서 다른 카드를 번호로 가리키지 않는다("1.6.1 카드에서"처럼 쓰지 말 것). 배치가 바뀌면 번호도 바뀐다.
- **절 소개**(`intro-<과목>-<대단원>-<절>`): 머리에 `"description"`(검색용 요약)을 넣고, 본문은 `<p class="lead">`와 `<div class="prereq">`로 쓴다. 절 제목은 배치표에서 온다.
- 한 블록은 한 곳에만 배치한다. 다른 절에서 같은 내용을 쓰려면 `related` 블록으로 연결한다.

## 3. 개념 카드 (`type: card`)

```html
<article class="card" id="card-<과목>-<짧은이름>">
  <header class="card-head"><span class="no"></span><h2>질문 형태의 제목?</h2><span class="kind">주제 · 방식</span></header>
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
    </ol>
  </div>
</article>
```

- 카드 스크립트는 `(() => { const root = document.getElementById("card-…"); if (!root) return; … })();` 형태로 쓰고, 요소는 `root.querySelector`로만 찾는다.
- 공용 도구 `window.NM`: `C`(색), `F`(글꼴), `fit(canvas, draw)`(DPR 맞춤, 첫 그리기는 비동기라 `draw` 안에서 `if (!w) return;`), `loop(el, frame)`(보일 때만 도는 애니메이션), `axes(ctx, {...})`, `clamp`, `ease`, `reduce`.
- 캔버스 크기: `.cv-wide`(16:9), `.cv-sq`(1:1), 두 캔버스 나란히 `.card-fig.fig-2`. 카드 그림 칸은 넓은 화면에서도 폭이 430px 안팎이다.
- 외부 라이브러리는 쓰지 않는다.

## 4. 읽기 (`type: text`)

조작해서 발견할 거리가 없는 내용(분류, 사례, 사진으로 보는 것, 사회적 영향)은 억지로 카드로 만들지 않고 읽기 블록으로 쓴다.

```html
<article class="card reading" id="text-<과목>-<짧은이름>">
  <header class="card-head"><span class="no"></span><h2>질문 형태의 제목?</h2><span class="kind">읽기 · 주제</span></header>
  <div class="reading-body">
    <p class="ask">도입 질문 한두 문장</p>
    <h3><span class="mono">1</span>소제목</h3>
    <p>… <em>핵심 용어</em> …</p>
    <figure>
      <svg viewBox="…">…</svg>   또는   <img src="../../assets/img/<과목>/<파일>" alt="…" loading="lazy">
      <figcaption>설명 <span class="src">출처: … · 라이선스</span></figcaption>
    </figure>
    <div class="tbl"><table>…</table></div>
    <p class="judge"><b>판단</b>오개념, 한계, 주의할 점</p>
  </div>
  <div class="quiz"> …카드와 같은 형식… </div>
</article>
```

- 그림은 인라인 SVG로 직접 그리거나, 퍼블릭 도메인·CC 라이선스 사진을 `assets/img/`에 저장해 쓴다. 사진은 반드시 **출처와 라이선스**를 `.src`에 적는다.
- 반쪽 그림 두 장을 나란히 놓으려면 `<figure class="half">`를 쓴다. 목록은 `<ul class="dots">`를 쓴다.

## 5. 영상 (`type: video`)

`section.video-block` 안에 9:16 캔버스(360×640 논리 크기)를 두고 코드로 그린다. 장면 목록, 자막, 진행 막대, 재생/일시정지, 탐색 막대를 갖춘다. `blocks/is1/video-apple-moon.html`을 본뜬다. 길이는 20~40초로 한다.

## 6. 내용 원칙 (가장 중요)

1. **내용을 줄이지 말고 계단을 놓는다.** 정의보다 필요성, 식보다 관계, 결론보다 근거를 먼저 쓴다. 식에는 성립 조건을 붙인다.
2. **카드 그림은 반드시 학생이 조작해서 무언가를 발견하게** 만든다. 장식용 애니메이션이나 단순 슬라이드쇼는 카드가 아니다. 그런 내용은 읽기 블록으로 쓴다.
3. **숫자는 정확하게.** 실제 상수와 관측값을 쓰고, 단순화한 모형이면 블록 안에 '모식', '상대값'이라고 밝힌다. 확실하지 않은 자료는 만들어 내지 않는다.
4. **판단 단계**에는 대표 오개념이나 모형의 한계를 쓴다. 확인 문제는 조건이 달라진 새 상황으로 내고, 오답마다 '왜 그럴듯한지'를 설명한다.
5. **문체:** 고등학생에게 말하듯 존댓말(~입니다/~습니다), 짧은 문장. 번역투, 과장("놀라운", "혁신적인"), 이모지는 쓰지 않는다.
6. 교육과정 밖 내용은 다뤄도 된다. 다만 **절의 성취기준과 해설이 요구하는 내용은 빠짐없이** 블록들이 함께 다뤄야 한다.

## 7. 빌드와 확인

```bash
python3 tools/build.py                                   # 페이지와 목차 생성
python3 tools/check.py 8811 c/earth/1-6.html             # 콘솔 오류와 404 검사
python3 tools/check.py 8811 --shot <폴더> c/earth/1-6.html          # 1440px 스크린샷
python3 tools/check.py 8811 --mobile --shot <폴더> c/earth/1-6.html # 390px 스크린샷
```

- 모든 페이지가 `OK`여야 한다. 스크린샷을 열어 그림, 글자 겹침, 모바일 가로 넘침을 확인한다.
- 계산이 들어간 카드는 `node`로 핵심 수치를 따로 검산한다.

## 8. 개념 지도 데이터

`graph/concepts.txt`에 개념을 한 줄에 하나씩 적는다: `개념 id | 이름 | 블록 id들 | 선수 개념 id들`.

- 블록을 새로 만들면 알맞은 개념에 블록 id를 더한다. 어느 개념에도 없는 블록은 빌드가 알려 준다.
- 선수 개념은 "이 개념을 이해하려면 먼저 알아야 하는 것"만 적는다. 관련만 있는 것은 적지 않는다. 과목을 넘나들어도 된다.
- 없는 블록·개념, 선수 관계의 순환은 빌드가 오류로 멈춘다.
- 특정 카드끼리 직접 잇고 싶으면 `graph/links.txt`에 `먼저 블록 id > 다음 블록 id`를 적는다(선택).
- 결과는 `js/graph-data.js`(생성물)이고, `graph.html`이 그린다. 점은 블록(카드 ●, 읽기 ■, 영상 ▲), 고리는 개념 허브다.
- 주소: `graph.html?n=<블록 id>` 또는 `?n=c:<개념 id>`로 한 점을 고르고, `?sec=<과목>-<대단원>-<절>`로 그 절의 블록을 강조한다.
- 헤드리스 크롬으로 캡처할 때는 주소에 `&test`를 붙인다. 가상 시간에서는 애니메이션 프레임이 거의 돌지 않아서, 시험 모드에서는 타이머로 대신 돌리고 캔버스의 `data-state`에 상태를 적는다. iframe으로 감싸 `--virtual-time-budget=20000`으로 찍는다.

## 9. 학습 기록 (메모 · 형광펜 · 오답노트)

- `js/store.js`가 브라우저 localStorage(`namunnip-textbook-v1`)에 **블록 id 기준**으로 저장한다. 서버는 없다.
- 절 페이지의 `js/notes.js`는 카드 머리에 메모 버튼을 달고, 글을 고르면 형광펜 버튼을 띄우며, 확인 문제 결과와 본 블록을 기록한다.
- 형광펜은 칠한 글자와 앞뒤 24자로 저장하므로, 블록 글을 고치면 칠한 곳을 못 찾을 수 있다(찾지 못하면 내 노트에만 남는다).
- 블록 id를 바꾸면 그 블록의 기록이 끊긴다. 이미 공개한 블록의 id는 바꾸지 않는다.
- `notes.html`은 모아 보기와 백업(내보내기·가져오기), `graph.html`은 개념 지도다.
