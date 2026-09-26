/* 카드: 두 번째 감염은 왜 더 빨리 이겨낼까? — 1차·2차 면역 반응 (모식 모형, 로그 눈금 상대값) */
(() => {
  const root = document.getElementById("card-bio-immune");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sT2 = $(".t2"), oT2 = $(".t2-out"), cLow = $(".lowt");
  const nLag1 = $(".lag1"), nLag2 = $(".lag2"), nRatio = $(".ratio"), nSym = $(".sym2"), msg = $(".im-msg");
  const XC = C.forest, YC = "#7a5aa6", PC = C.warn;
  const TM = 140, DT = 0.1, SYM = 3;
  let ag2 = "X";

  /* 한 번의 노출이 만드는 항체 (log10 상대값). 기억 세포가 있으면 잠복기가 짧고 더 많이, 더 오래 */
  function run(t2, same, lowT) {
    const ex = [{ t: 0, ag: "X" }, { t: t2, ag: same ? "X" : "Y" }], mem = {}, resp = [];
    for (const e of ex) { resp.push({ ...e, m: !!mem[e.ag] && !lowT }); if (!lowT) mem[e.ag] = 1; }
    const logA = (ag, t) => {
      let best = 0;
      for (const r of resp) {
        if (r.ag !== ag || t < r.t) continue;
        const L = r.m ? 2 : 6, R = r.m ? 4 : 7, P = (r.m ? 3.3 : 1.5) * (lowT ? 0.2 : 1), hl = r.m ? 30 : 10, floor = lowT ? 0 : r.m ? 1.2 : 0.5;
        const tt = t - r.t;
        const v = tt < L ? 0 : tt < L + R ? P * (tt - L) / R : floor + (P - floor) * Math.pow(0.5, (tt - L - R) / hl);
        best = Math.max(best, v);
      }
      return best;
    };
    const out = [], lp = [null, null];
    for (let i = 0, t = 0; t <= TM + 1e-9; i++, t = i * DT) {
      const row = { t, X: logA("X", t), Y: logA("Y", t), p: [null, null] };
      resp.forEach((r, k) => {
        if (t < r.t) return;
        if (lp[k] === null) lp[k] = 0;
        if (lp[k] <= -4.9) return; // 모두 제거됨
        const A = Math.pow(10, row[r.ag]);
        const rate = 1.1 - 4 * (A - 1) / (A - 1 + 10); // 병원체 증식 − 항체에 의한 제거 (ln/일)
        lp[k] = clamp(lp[k] + rate * DT, -5, 6 * Math.LN10);
        row.p[k] = lp[k] / Math.LN10;
      });
      out.push(row);
    }
    return { out, resp };
  }

  let R = null;
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size;
    if (!w || !R) return;
    ctx.clearRect(0, 0, w, h);
    const t2 = +sT2.value;
    const g = { x: 40, y: 24, w: w - 52, h: (h - 24 - 56) * 0.55 };
    const g2 = { x: 40, y: g.y + g.h + 30, w: g.w, h: h - (g.y + g.h + 30) - 30 };
    const X = (t) => g.x + t / TM * g.w;
    const Ya = (v) => g.y + (1 - v / 4) * g.h;
    NM.axes(ctx, { x0: g.x, y0: g.y, w: g.w, h: g.h, X, Y: Ya, xt: [], yt: [[0, "1"], [1, "10"], [2, "10²"], [3, "10³"], [4, "10⁴"]], ylabel: "혈장의 항체 농도 (상대값, 로그 눈금)" });
    const line = (key, Yf, col, lw, dash, gg) => {
      ctx.setLineDash(dash || []); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
      let on = false;
      R.out.forEach((r) => { const v = typeof key === "function" ? key(r) : r[key]; if (v == null) { on = false; return; } const y = Yf(clamp(v, gg[0], gg[1])); on ? ctx.lineTo(X(r.t), y) : ctx.moveTo(X(r.t), y); on = true; });
      ctx.stroke(); ctx.setLineDash([]);
    };
    line("X", Ya, XC, 2.4, [], [0, 4]);
    if (ag2 === "Y") line("Y", Ya, YC, 2.4, [6, 4], [0, 4]);
    // 노출 표시
    const mark = (t, lab, col) => { ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(t) + .5, g.y); ctx.lineTo(X(t) + .5, g2.y + g2.h); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = col; ctx.font = `600 10.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(lab, X(t) + 4, g.y + 12); };
    mark(0, "항원 X", XC);
    mark(t2, `항원 ${ag2}`, ag2 === "X" ? XC : YC);
    // 병원체
    const Yp = (v) => g2.y + (1 - v / 6) * g2.h;
    NM.axes(ctx, { x0: g2.x, y0: g2.y, w: g2.w, h: g2.h, X, Y: Yp, xt: [], yt: [[0, "1"], [3, "10³"], [6, "10⁶"]], ylabel: "몸속 병원체 수 (상대값, 로그 눈금)" });
    ctx.fillStyle = "rgba(181,83,47,.08)"; ctx.fillRect(g2.x, g2.y, g2.w, Yp(SYM) - g2.y);
    ctx.fillStyle = PC; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("이 위로 올라가면 증상", g2.x + g2.w - 3, Yp(SYM) - 4);
    line((r) => r.p[0], Yp, PC, 2, [], [0, 6]);
    line((r) => r.p[1], Yp, PC, 2, [], [0, 6]);
    ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let t = 0; t <= TM; t += 20) ctx.fillText(`${t}`, X(t), g2.y + g2.h + 13);
    ctx.textAlign = "right"; ctx.fillText("첫 노출 후 날짜 (일)", g2.x + g2.w, g2.y + g2.h + 26);
  }

  function update() {
    oT2.textContent = sT2.value;
    const t2 = +sT2.value, low = cLow.checked;
    R = run(t2, ag2 === "X", low);
    const first = (key, t0) => { const b0 = R.out.find((r) => r.t >= t0)[key]; const r = R.out.find((r) => r.t >= t0 && r[key] > b0 + 0.3); return r ? r.t - t0 : null; };
    const l1 = first("X", 0), l2 = first(ag2, t2);
    nLag1.textContent = l1 == null ? "—" : `약 ${Math.round(l1)}일`;
    nLag2.textContent = l2 == null ? "—" : `약 ${Math.round(l2)}일`;
    const pk = (key, a, b) => Math.max(...R.out.filter((r) => r.t >= a && r.t < b).map((r) => r[key]));
    const p1 = pk("X", 0, t2), p2 = pk(ag2, t2, TM + 1);
    nRatio.textContent = `${Math.round(Math.pow(10, p2 - p1))}배`;
    const sym = Math.max(...R.out.filter((r) => r.t >= t2).map((r) => r.p[1] ?? -9)) > SYM;
    nSym.textContent = sym ? "증상 있음" : "증상 없음"; nSym.className = "sym2 " + (sym ? "bad" : "good");
    msg.textContent = low ? "보조 T 림프구가 부족하면 B 림프구가 제대로 활성화되지 못합니다. 항체도 기억 세포도 거의 생기지 않아, 몇 번을 만나도 병원체를 막지 못합니다. 후천성 면역 결핍증(AIDS)에서 일어나는 일입니다."
      : ag2 === "Y" ? "처음 보는 항원 Y에는 기억 세포가 없습니다. 첫 감염과 똑같이 느리게 반응하고 증상이 나타납니다. X에 대한 기억은 Y를 막아 주지 못합니다."
      : "두 번째로 만난 항원 X에는 기억 세포가 곧바로 반응합니다. 항체가 훨씬 빨리, 훨씬 많이 만들어져 병원체가 증상을 낼 만큼 늘기 전에 제거됩니다.";
    draw();
  }
  sT2.addEventListener("input", update);
  cLow.addEventListener("change", update);
  root.querySelectorAll("[data-ag]").forEach((b) => b.addEventListener("click", () => {
    ag2 = b.dataset.ag;
    root.querySelectorAll("[data-ag]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    update();
  }));
  update();
})();
