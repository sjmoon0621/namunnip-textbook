/* 카드: 두 종이 함께 살면 어떻게 될까? — 경쟁·포식·상리 공생 (로트카–볼테라 모식) */
(() => {
  const root = document.getElementById("card-bio-interact");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sS = $(".s"), oS = $(".s-out"), lab = $(".s-label"), alone = $(".alone");
  const nA = $(".na"), nB = $(".nb"), msg = $(".ia-msg");
  const TEND = 60, DT = 0.02, K = 500;
  const COL = { A: "#3f7fc4", B: "#c9463d" };
  const MODE = {
    comp: { A: "종 A", B: "종 B", s: [0, 1.6, 0.3], label: "먹이가 겹치는 정도", fmt: (v) => v.toFixed(2) },
    pred: { A: "먹이 (피식자)", B: "포식자", s: [0.2, 1.5, 0.8], label: "포식자의 사냥 성공률 (상대값)", fmt: (v) => v.toFixed(2) },
    mutu: { A: "종 A", B: "종 B", s: [0, 0.8, 0.5], label: "서로 주는 도움의 크기", fmt: (v) => v.toFixed(2) },
  };
  let mode = "comp";

  // 도함수: 두 종의 개체 수 [a, b] → [da/dt, db/dt]
  function deriv(m, s, a, b) {
    if (m === "comp") {            // 경쟁: A가 B에 주는 영향이 더 크다 (β > α)
      const al = 0.8 * s, be = 1.25 * s;
      return [0.6 * a * (1 - (a + al * b) / K), 0.5 * b * (1 - (b + be * a) / K)];
    }
    if (m === "pred") {            // 포식: 먹이는 로지스틱으로 자라고 포식자에게 먹힘
      const c = 0.004 * s;
      return [0.8 * a * (1 - a / (2 * K)) - c * a * b, 0.35 * c * a * b - 0.2 * b];
    }
    // 상리 공생: 서로 상대가 많을수록 환경 수용력이 커짐
    return [0.5 * a * (1 - (a - s * b) / K), 0.5 * b * (1 - (b - s * a) / K)];
  }
  function run(m, s, a0, b0, withB = true, withA = true) {
    let a = withA ? a0 : 0, b = withB ? b0 : 0; const pts = [[0, a, b]];
    for (let t = DT, i = 1; t <= TEND + 1e-9; t += DT, i++) {
      const f = (x, y) => deriv(m, s, x, y);
      const k1 = f(a, b), k2 = f(a + k1[0] * DT / 2, b + k1[1] * DT / 2), k3 = f(a + k2[0] * DT / 2, b + k2[1] * DT / 2), k4 = f(a + k3[0] * DT, b + k3[1] * DT);
      a = Math.max(0, a + DT / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]));
      b = Math.max(0, b + DT / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]));
      if (i % 10 === 0) pts.push([t, a, b]);
    }
    return pts;
  }

  const { ctx, size } = fit(cv, () => draw());
  let cur, soloA, soloB;

  function draw() {
    const { w, h } = size; if (!w || !cur) return;
    ctx.clearRect(0, 0, w, h);
    const M = MODE[mode];
    const all = cur.concat(alone.checked ? soloA.concat(soloB) : []);
    const ymax = Math.max(K * 1.1, ...all.map((p) => Math.max(p[1], p[2]))) * 1.05;
    const x0 = 42, y0 = 24, pw = w - x0 - 12, ph = h - y0 - 36;
    const X = (t) => x0 + t / TEND * pw, Y = (n) => y0 + (1 - n / ymax) * ph;
    const step = ymax > 1500 ? 1000 : ymax > 700 ? 500 : 250;
    const yt = []; for (let v = 0; v <= ymax; v += step) yt.push([v, `${v}`]);
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [0, 20, 40, 60].map((t) => [t, `${t}`]), yt, ylabel: "개체 수", xlabel: "시간 (세대)" });
    const line = (pts, idx, col, dash, lw) => {
      ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[idx])) : ctx.moveTo(X(p[0]), Y(p[idx])));
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]);
    };
    if (alone.checked) { line(soloA, 1, COL.A, [4, 4], 1.3); line(soloB, 2, COL.B, [4, 4], 1.3); }
    line(cur, 1, COL.A, [], 2.4); line(cur, 2, COL.B, [], 2.4);
    // 범례: 곡선이 잘 지나가지 않는 오른쪽 아래
    const lx = x0 + pw - 118, ly = y0 + ph - (alone.checked ? 58 : 42);
    ctx.fillStyle = "rgba(251,251,248,.85)"; ctx.fillRect(lx - 6, ly - 8, 122, alone.checked ? 54 : 38);
    ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left";
    [["A", M.A], ["B", M.B]].forEach(([k, name], i) => {
      ctx.fillStyle = COL[k]; ctx.fillRect(lx, ly + i * 16, 14, 3);
      ctx.fillStyle = C.ink2; ctx.fillText(name, lx + 20, ly + 5 + i * 16);
    });
    if (alone.checked) { ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.fillText("점선: 혼자 살 때", lx, ly + 38); }
  }

  function update() {
    const M = MODE[mode], s = +sS.value;
    oS.textContent = M.fmt(s); lab.textContent = M.label;
    const a0 = mode === "pred" ? 300 : 20, b0 = mode === "pred" ? 40 : 20;
    cur = run(mode, s, a0, b0);
    soloA = run(mode, s, a0, b0, false, true);
    soloB = run(mode, s, a0, b0, true, false);
    const end = cur[cur.length - 1];
    nA.textContent = `${Math.round(end[1])}`; nB.textContent = `${Math.round(end[2])}`;
    const endA = soloA[soloA.length - 1][1], endB = soloB[soloB.length - 1][2];
    if (mode === "comp") msg.textContent = end[2] < 5 ? "종 B가 사라졌습니다. 먹이가 많이 겹치면 한 종이 다른 종을 몰아냅니다(경쟁 배타)."
      : `두 종 모두 살아남았지만, 혼자 살 때(${Math.round(endA)}, ${Math.round(endB)})보다 적습니다. 경쟁은 두 종 모두에게 손해입니다.`;
    else if (mode === "pred") msg.textContent = "먹이가 늘면 뒤따라 포식자가 늘고, 포식자가 늘면 먹이가 줄어듭니다. 포식자의 봉우리가 먹이의 봉우리보다 늦게 옵니다.";
    else msg.textContent = `함께 살 때 두 종 모두 혼자 살 때(${Math.round(endA)})보다 많아집니다. 서로에게 이익이 되는 관계입니다.`;
    root.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
    draw();
  }
  root.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => {
    mode = b.dataset.mode; const M = MODE[mode];
    sS.min = M.s[0]; sS.max = M.s[1]; sS.step = 0.01; sS.value = M.s[2]; update();
  }));
  sS.addEventListener("input", update); alone.addEventListener("change", update);
  update();
})();
