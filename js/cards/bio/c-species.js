/* 카드: '종'은 어떻게 정의할까? — 생김새 대신 생식적 격리의 관문으로 판정하기 */
(() => {
  const root = document.getElementById("card-bio-species");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const bNext = $(".gate-next");
  const nLook = $(".n-look"), nGate = $(".n-gate"), nVerd = $(".n-verd"), note = $(".sp-note");

  // 관문 상태: 1 통과, 0 막힘, .5 부분적, null 확인할 필요 없음
  const CASE = {
    horse: { a: "말", b: "당나귀", na: 64, nb: 62, look: "꽤 닮음",
      g: [[.5, "사람이 함께 기를 때만 짝짓기"], [1, "노새가 태어남 (2n = 63)"], [0, "노새는 거의 번식하지 못함"]],
      v: "다른 종", pair: [32, 31],
      note: "노새는 말에게서 32개, 당나귀에게서 31개의 염색체를 받습니다. 두 벌은 수도 구조도 달라, 감수 분열에서 상동 염색체끼리 제대로 짝을 짓지 못합니다. 그래서 정상적인 생식세포를 거의 만들지 못합니다." },
    dog: { a: "치와와", b: "그레이트데인", na: 78, nb: 78, look: "매우 다름",
      g: [[1, "짝짓기 가능 (몸집 차이가 크면 사람 도움 필요)"], [1, "강아지가 태어남 (2n = 78)"], [1, "자손도 번식 가능"]],
      v: "같은 종", pair: [39, 39],
      note: "두 품종은 모두 개(Canis lupus familiaris)입니다. 몸집 차이는 사람이 오랫동안 골라 기른 결과일 뿐, 염색체와 유전자 구성은 거의 같아 자손도 문제없이 번식합니다." },
    cat: { a: "사자", b: "호랑이", na: 38, nb: 38, look: "다름",
      g: [[0, "오늘날 자연에서는 사는 곳과 행동이 달라 짝짓지 않음"], [1, "동물원에서는 라이거·타이곤이 태어남"], [.5, "수컷은 번식 못 함, 암컷은 가능한 경우가 있음"]],
      v: "다른 종 (경계가 흐린 사례)", pair: [19, 19],
      note: "사자와 호랑이는 같은 표범속이고 염색체 수도 38개로 같습니다. 그래도 자연 상태에서는 서로 짝짓지 않으므로 다른 종으로 봅니다. 잡종 암컷이 번식하는 경우가 있어, 종의 경계가 늘 칼같이 나뉘지는 않는다는 것을 보여 줍니다." },
    lark: { a: "동부들종다리", b: "서부들종다리", look: "거의 같음",
      g: [[0, "사는 곳이 겹쳐도 노랫소리가 달라 서로 짝짓지 않음"], [null, ""], [null, ""]],
      v: "다른 종",
      note: "북아메리카의 두 들종다리는 겉모습으로는 거의 구별하기 어렵습니다. 하지만 노래가 달라 서로를 짝으로 알아보지 않습니다. 첫 관문에서 이미 막혀 있으니 다른 종입니다." },
    duck: { a: "청둥오리 수컷", b: "청둥오리 암컷", look: "매우 다름",
      g: [[1, "짝짓기함"], [1, "새끼가 태어남"], [1, "새끼도 번식 가능"]],
      v: "같은 종",
      note: "수컷은 초록 머리에 화려하고, 암컷은 갈색 얼룩무늬라 다른 새처럼 보입니다. 생김새만으로 종을 나누면 이런 경우를 잘못 판단하게 됩니다." },
  };
  const GATE = ["① 자연에서 서로 짝짓는가", "② 자손이 태어나는가", "③ 자손이 번식할 수 있는가"];
  let cur = "horse", shown = 0;

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const K = CASE[cur], small = w < 520;
    ctx.textAlign = "center"; ctx.font = `600 ${small ? 13 : 15}px ${F.sans}`; ctx.fillStyle = C.ink;
    ctx.fillText(`${K.a}${K.na ? ` (2n = ${K.na})` : ""}  ×  ${K.b}${K.nb ? ` (2n = ${K.nb})` : ""}`, w / 2, 20);
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.fillText(`생김새: ${K.look}`, w / 2, 38);

    // 관문 세 개
    const gy = 52, gh = h * (K.pair ? .5 : .7), gap = 10, gw = (w - 8 - gap * 2) / 3;
    for (let i = 0; i < 3; i++) {
      const x = 4 + i * (gw + gap), [st, txt] = K.g[i];
      const open = i < shown || (st === null && shown >= lastGate());
      const skip = st === null;
      ctx.fillStyle = !open ? C.paper : skip ? "transparent" : st === 1 ? "#e3efdd" : st === 0 ? "#f7e4dc" : "#f8efd9";
      ctx.strokeStyle = !open ? C.rule : skip ? C.rule : st === 1 ? C.forest : st === 0 ? C.warn : C.amber;
      ctx.lineWidth = open && !skip ? 1.6 : 1; ctx.setLineDash(open && skip ? [4, 4] : []);
      ctx.beginPath(); ctx.rect(x, gy, gw, gh); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
      ctx.textAlign = "left"; ctx.font = `600 ${small ? 11 : 14}px ${F.sans}`; ctx.fillStyle = C.ink;
      const ty = wrap(GATE[i], x + 8, gy + 20, gw - 14, small ? 14 : 18), vy = ty + (small ? 28 : 36);
      if (open) {
        if (skip) { ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink3; wrap("첫 관문에서 막혀 확인할 필요 없음", x + 8, vy, gw - 14, 15); }
        else {
          ctx.font = `600 ${small ? 20 : 28}px ${F.sans}`; ctx.fillStyle = st === 1 ? C.forest : st === 0 ? C.warn : "#a8781c";
          ctx.fillText(st === 1 ? "예" : st === 0 ? "아니요" : "일부만", x + 8, vy);
          ctx.font = `${small ? 10.5 : 13.5}px ${F.sans}`; ctx.fillStyle = C.ink2;
          wrap(txt, x + 8, vy + (small ? 20 : 26), gw - 14, small ? 14 : 19);
        }
      } else { ctx.font = `12px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.fillText("?", x + 8, vy); }
    }

    // 염색체 짝 맞추기 (모식)
    if (K.pair && shown >= 2) {
      const [pa, pb] = K.pair, n = Math.max(pa, pb), y0 = gy + gh + 30;
      const cw = Math.min(12, (w - 20) / n), x0 = (w - cw * n) / 2;
      ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
      ctx.fillText(`자손의 염색체: ${K.a}에게서 ${pa}개 + ${K.b}에게서 ${pb}개 (모식)`, x0, y0 - 10);
      const mismatch = pa !== pb;
      for (let i = 0; i < n; i++) {
        const x = x0 + i * cw, bad = mismatch && (i >= pb || i % 5 === 3);
        if (i < pa) { ctx.fillStyle = "#c8554a"; ctx.fillRect(x + 1, y0, cw - 2, 16); }
        if (i < pb) { ctx.fillStyle = "#3f6f9c"; ctx.fillRect(x + 1, y0 + 20, cw - 2, 16); }
        if (bad) { ctx.strokeStyle = C.warn; ctx.lineWidth = 1.2; ctx.strokeRect(x + .5, y0 - 2, cw - 1, 40); }
      }
      ctx.fillStyle = mismatch ? C.warn : C.forest; ctx.font = `11px ${F.sans}`;
      ctx.fillText(mismatch ? "빨간 테두리: 짝이 없거나 구조가 달라 제대로 짝짓지 못하는 염색체" : "모든 염색체가 짝을 지을 수 있음", x0, y0 + 54);
    }
  }
  function wrap(t, x, y, mw, lh) {
    let line = "", yy = y;
    for (const ch of t.split(" ")) {
      const test = line ? line + " " + ch : ch;
      if (ctx.measureText(test).width > mw && line) { ctx.fillText(line, x, yy); line = ch; yy += lh; } else line = test;
    }
    if (line) ctx.fillText(line, x, yy);
    return yy;
  }

  function lastGate() { return CASE[cur].g.filter(([s]) => s !== null).length; }
  function update() {
    const K = CASE[cur], done = shown >= lastGate();
    nLook.textContent = K.look;
    nGate.textContent = done ? (K.g.some(([s]) => s === 0) ? "막힘" : K.g.some(([s]) => s === .5) ? "일부 통과" : "모두 통과") : `${shown} / ${lastGate()} 확인`;
    nVerd.textContent = done ? K.v : "?";
    nVerd.classList.toggle("good", done && K.v === "같은 종");
    note.textContent = done ? K.note : "생김새만 보고 먼저 예상해 본 뒤, 관문을 하나씩 확인해 보세요.";
    bNext.textContent = done ? "처음부터" : "다음 관문 확인";
    root.querySelectorAll("[data-case]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.case === cur ? "true" : "false"));
    draw();
  }
  bNext.addEventListener("click", () => { shown = shown >= lastGate() ? 0 : shown + 1; update(); });
  root.querySelectorAll("[data-case]").forEach((b) => b.addEventListener("click", () => { cur = b.dataset.case; shown = 0; update(); }));
  update();
})();
