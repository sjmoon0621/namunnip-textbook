/* 카드: 흑체 복사 — 플랑크 곡선, 레일리–진스, 모드당 평균 에너지 */
(() => {
  const root = document.getElementById("card-adphy-planck");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), oT = $(".t-out"), cRJ = $(".rj"), cW = $(".wien");
  const nPeak = $(".n-peak"), nTot = $(".n-tot"), nRatio = $(".n-ratio");
  const HCK = 0.014388; /* hc/k (m·K) */
  /* 상대 단위: B(λ) ∝ 1/λ⁵ · 1/(e^x − 1), x = hc/λkT. λ는 μm. */
  const x = (lum, T) => HCK / (lum * 1e-6 * T);
  const planck = (l, T) => 1 / (l ** 5 * Math.expm1(x(l, T)));
  const rj = (l, T) => 1 / (l ** 5 * x(l, T));
  const wien = (l, T) => Math.exp(-x(l, T)) / l ** 5;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    const T = +sT.value;
    ctx.clearRect(0, 0, w, h);
    /* 위 그래프 */
    const x0 = 46, x1 = w - 14, y0 = 26, y1 = h * 0.56, LMAX = 3;
    const X = (l) => x0 + l / LMAX * (x1 - x0);
    const lp = 2.898e3 / T, bmax = planck(lp, T) * 1.18;
    const Y = (b) => y1 - Math.min(b / bmax, 1.02) * (y1 - y0);
    /* 가시광선 무지개 띠 */
    const g = ctx.createLinearGradient(X(0.4), 0, X(0.7), 0);
    ["#7a3cff", "#2f6bff", "#18b04a", "#e8d020", "#ff8a1a", "#e3261f"].forEach((c, i) => g.addColorStop(i / 5, c));
    ctx.globalAlpha = 0.18; ctx.fillStyle = g; ctx.fillRect(X(0.4), y0, X(0.7) - X(0.4), y1 - y0); ctx.globalAlpha = 1;
    NM.axes(ctx, { x0, y0, w: x1 - x0, h: y1 - y0, X, Y: () => 0, xt: [0, 0.5, 1, 1.5, 2, 2.5, 3].map((v) => [v, String(v)]), xlabel: "", ylabel: "" });
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("파장 (μm)", x1, y1 + 28);
    ctx.textAlign = "left"; ctx.font = `11px ${F.sans}`; ctx.fillText("복사 세기 B_λ (상대값)", x0, y0 - 9);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
    const curve = (f, col, dash) => {
      ctx.save(); ctx.beginPath(); ctx.rect(x0, y0 - 4, x1 - x0, y1 - y0 + 4); ctx.clip();
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash(dash || []); ctx.beginPath();
      for (let i = 1; i <= 400; i++) { const l = i / 400 * LMAX; const yy = Y(f(l, T)); i === 1 ? ctx.moveTo(X(l), yy) : ctx.lineTo(X(l), yy); }
      ctx.stroke(); ctx.restore();
    };
    if (cRJ.checked) curve(rj, "#d7263d", [5, 4]);
    if (cW.checked) curve(wien, "#3f6fa3", [2, 3]);
    curve(planck, C.ink);
    ctx.strokeStyle = C.amber; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(lp), y0); ctx.lineTo(X(lp), y1); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.mono}`;
    const lx = X(lp) + 5 > x1 - 90 ? X(lp) - 5 : X(lp) + 5; ctx.textAlign = X(lp) + 5 > x1 - 90 ? "right" : "left";
    ctx.fillText(`λmax = ${(lp * 1000).toFixed(0)} nm`, lx, y0 + 10);
    if (cRJ.checked) {
      let lc = 0.05; while (lc < LMAX && Y(rj(lc, T)) <= y0 + 1) lc += 0.01;
      ctx.fillStyle = "#d7263d"; ctx.textAlign = "left"; ctx.font = `10.5px ${F.sans}`; ctx.fillText("← 고전 예측: 짧은 파장에서 ∞", Math.min(X(lc) + 6, x1 - 150), y0 + 26);
    }
    /* 아래 그래프: 모드당 평균 에너지 / kT */
    const u0 = h * 0.68, u1 = h - 30, XMAX = 10;
    const XX = (v) => x0 + v / XMAX * (x1 - x0), YY = (v) => u1 - v / 1.15 * (u1 - u0);
    const xa = x(0.7, T), xb = x(0.4, T);
    if (xa < XMAX) { ctx.fillStyle = "rgba(224,160,42,.25)"; ctx.fillRect(XX(xa), u0, XX(Math.min(xb, XMAX)) - XX(xa), u1 - u0); }
    NM.axes(ctx, { x0, y0: u0, w: x1 - x0, h: u1 - u0, X: XX, Y: YY, xt: [0, 2, 4, 6, 8, 10].map((v) => [v, String(v)]), yt: [[0, "0"], [0.5, "0.5"], [1, "1"]] });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, u0); ctx.lineTo(x0, u1); ctx.lineTo(x1, u1); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("hf / kT", x1, u1 + 26);
    ctx.textAlign = "left"; ctx.font = `11px ${F.sans}`; ctx.fillText("모드 하나의 평균 에너지 ÷ kT", x0, u0 - 9);
    ctx.strokeStyle = "#d7263d"; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, YY(1)); ctx.lineTo(x1, YY(1)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.ink; ctx.beginPath();
    for (let i = 0; i <= 300; i++) { const v = i / 300 * XMAX, e = v < 1e-6 ? 1 : v / Math.expm1(v); i ? ctx.lineTo(XX(v), YY(e)) : ctx.moveTo(XX(v), YY(e)); }
    ctx.stroke();
    const x5 = x(0.5, T);
    if (x5 < XMAX) { const e5 = x5 / Math.expm1(x5); ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(XX(x5), YY(e5), 4.5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = x5 > 7 ? "right" : "left"; ctx.fillText(`500 nm: ${e5 < 0.01 ? e5.toExponential(1) : e5.toFixed(2)} kT`, XX(x5) + (x5 > 7 ? -8 : 8), YY(e5) - 8); }
    else { ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(`500 nm: hf/kT = ${x5.toFixed(1)} → 그래프 밖`, x1, u0 + 12); }
  }
  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const sci = (v) => { const e = Math.floor(Math.log10(v)); return `${(v / 10 ** e).toFixed(1)}×10${String(e).split("").map((d) => SUP[+d]).join("")}`; };
  function update() {
    const T = +sT.value; oT.textContent = T;
    root.querySelectorAll("[data-t]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.t === T)));
    nPeak.textContent = `${(2.898e6 / T).toFixed(0)} nm`;
    const M = 5.670e-8 * T ** 4; nTot.textContent = `${(M / 1e6).toPrecision(3)} MW/m²`;
    const r = rj(0.5, T) / planck(0.5, T); nRatio.textContent = r < 1000 ? `${r.toFixed(1)}배` : sci(r) + "배";
    draw();
  }
  root.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { sT.value = b.dataset.t; update(); }));
  [sT, cRJ, cW].forEach((el) => el.addEventListener("input", update));
  update();
})();
