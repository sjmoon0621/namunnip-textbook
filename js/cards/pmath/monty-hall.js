/* 카드: 사회자가 빈 문을 열어 주면, 고른 문을 바꾸는 게 나을까? — 몬티 홀(직접 하기 + 시뮬레이션) */
(() => {
  const root = document.getElementById("card-pmath-monty-hall");
  if (!root) return;
  const { C, fit } = NM;
  const { BLUE } = NMPm;
  const $ = (s) => root.querySelector(s);
  const sd = $(".sd"), doorsEl = $(".doors"), msg = $(".msg"), bStay = $(".go-stay"), bSwitch = $(".go-switch");
  let N = 3, car, pick, opened, stage;   // stage: 0 고르기, 1 바꿀지, 2 끝
  const mine = { stay: [0, 0], sw: [0, 0] };
  let sim = { stay: 0, sw: 0, n: 0 };
  const { ctx, size } = fit($("canvas"), () => drawSim());

  function render() {
    doorsEl.style.setProperty("--n", Math.min(N, 5));
    doorsEl.innerHTML = Array.from({ length: N }, (_, i) => {
      const open = stage === 2 || opened.includes(i), cls = ["door", pick === i ? "pick" : "", open ? "open" : "", open && i === car ? "car" : ""].join(" ");
      return `<button type="button" class="${cls}" data-i="${i}" aria-label="${i + 1}번 문">${open ? (i === car ? "자동차" : "염소") : i + 1}</button>`;
    }).join("");
    bStay.disabled = bSwitch.disabled = stage !== 1;
  }
  function newGame() { N = +sd.value; car = Math.floor(Math.random() * N); pick = null; opened = []; stage = 0; msg.textContent = "문 하나를 고르세요."; render(); }
  doorsEl.addEventListener("click", (e) => {
    const b = e.target.closest(".door"); if (!b || stage !== 0) return;
    pick = +b.dataset.i;
    // 사회자: 고른 문과 자동차 문(고른 문이 자동차면 무작위 하나)을 뺀 나머지를 모두 연다
    const keep = pick === car ? (() => { const o = [...Array(N).keys()].filter((i) => i !== pick); return o[Math.floor(Math.random() * o.length)]; })() : car;
    opened = [...Array(N).keys()].filter((i) => i !== pick && i !== keep);
    stage = 1; msg.textContent = `사회자가 염소 문 ${opened.length}개를 열었습니다. 그대로 둘까요, 남은 문으로 바꿀까요?`; render();
  });
  const finish = (sw) => {
    if (sw) pick = [...Array(N).keys()].find((i) => i !== pick && !opened.includes(i));
    const win = pick === car, k = sw ? "sw" : "stay";
    mine[k][1]++; if (win) mine[k][0]++;
    stage = 2; msg.textContent = win ? "자동차! 이겼습니다." : "염소였습니다."; render();
    $(".mine").textContent = `내 기록, 그대로 ${mine.stay[0]}승/${mine.stay[1]}판 · 바꾸기 ${mine.sw[0]}승/${mine.sw[1]}판`;
  };
  bStay.addEventListener("click", () => finish(false));
  bSwitch.addEventListener("click", () => finish(true));
  $(".go-again").addEventListener("click", newGame);
  sd.addEventListener("input", () => { $(".d-out").textContent = sd.value; sim = { stay: 0, sw: 0, n: 0 }; newGame(); drawSim(); });

  function drawSim() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = sim.n ? [sim.stay / sim.n, sim.sw / sim.n] : [0, 0];
    NMSim.bars(ctx, { x0: 40, y0: 10, w: w - 50, h: h - 30 }, r, { labels: [`그대로 ${NMSim.pct(r[0])}`, `바꾸기 ${NMSim.pct(r[1])}`], expect: [1 / N, (N - 1) / N], top: 1, yfmt: (v) => `${Math.round(v * 100)}%`, ylabel: `승률 (${sim.n}판)` });
  }
  NMSim.runner(root, {
    trial(k) { for (let i = 0; i < k; i++) { const c = Math.floor(Math.random() * N), p = Math.floor(Math.random() * N); sim.n++; if (c === p) sim.stay++; else sim.sw++; } },
    draw: drawSim, reset() { sim = { stay: 0, sw: 0, n: 0 }; }, rate: 400,
  });
  newGame();
})();
