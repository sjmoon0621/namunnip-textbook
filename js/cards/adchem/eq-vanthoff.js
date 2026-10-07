/* 카드: 온도를 바꾸면 평형 상수는 왜, 얼마나 변할까? — ΔG° = ΔH° − TΔS° = −RT ln K, 반트호프 그래프 */
(() => {
  const root = document.getElementById("card-adchem-vanthoff");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const R = 8.314;
  /* ΔH° (kJ/mol), ΔS° (J/(mol·K)) — 25 °C 표준값(NBS 표)으로 계산, 온도 무관 근사 */
  const RX = {
    nh3: { h: -91.8, s: -198.1, lab: "NH₃ 합성", col: "#3f6fa3" },
    no2: { h: 57.2, s: 175.9, lab: "N₂O₄ 분해", col: C.warn },
    caco3: { h: 178.3, s: 160.6, lab: "CaCO₃ 분해", col: C.forest },
    h2o: { h: 44.0, s: 118.9, lab: "물의 증발", col: "#8a5aa8" },
  };
  let r = "nh3", view = "lnk";
  const cv = $("canvas"), sT = $(".t"), oT = $(".t-out"), oC = $(".tc-out");
  const nH = $(".n-h"), nG = $(".n-g"), nK = $(".n-k"), nT1 = $(".n-t1");
  const sup = (n) => String(n).replace(/-/g, "⁻").replace(/[0-9]/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
  const sci = (v) => {
    if (!isFinite(v)) return "∞";
    if (v >= 0.01 && v < 1000) return v.toPrecision(3);
    const e = Math.floor(Math.log10(v)), m = v / 10 ** e;
    return `${m.toFixed(1)} × 10${sup(e)}`;
  };
  const dG = (k, T) => RX[k].h - T * RX[k].s / 1000;          /* kJ/mol */
  const lnK = (k, T) => -dG(k, T) * 1000 / (R * T);
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const T = +sT.value;
    const x0 = 46, x1 = w - 14, y0 = 24, y1 = h - 34;
    let X, Y, xv, ymin, ymax, ylab, xlab, xt, f;
    if (view === "lnk") {
      ymin = -30; ymax = 30; xlab = "1000 / T (K⁻¹) →"; ylab = "ln K";
      const a = 1000 / 1400, b = 1000 / 250; X = (u) => x0 + (u - a) / (b - a) * (x1 - x0);
      xv = (TT) => 1000 / TT; f = lnK;
      xt = [1, 2, 3, 4].filter((u) => u >= a && u <= b).map((u) => [u, String(u)]);
    } else {
      ymin = -150; ymax = 150; xlab = "T (K) →"; ylab = "ΔG° (kJ/mol)";
      X = (TT) => x0 + (TT - 250) / 1150 * (x1 - x0); xv = (TT) => TT; f = dG;
      xt = [400, 600, 800, 1000, 1200].map((u) => [u, String(u)]);
    }
    Y = (v) => y1 - (clamp(v, ymin, ymax) - ymin) / (ymax - ymin) * (y1 - y0);
    NM.axes(ctx, { x0, y0, w: x1 - x0, h: y1 - y0, X, Y, xt, yt: (view === "lnk" ? [-30, -20, -10, 0, 10, 20, 30] : [-150, -100, -50, 0, 50, 100, 150]).map((v) => [v, String(v).replace("-", "−")]), xlabel: xlab, ylabel: ylab });
    /* 기준선: ln K = 0 (K = 1) 또는 ΔG° = 0 */
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x1, Y(0)); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillText(view === "lnk" ? "K = 1 (ΔG° = 0)" : "ΔG° = 0 (K = 1)", x1 - 4, Y(0) + 13);
    ctx.fillText(view === "lnk" ? "↑ K > 1, 생성물 쪽" : "↓ ΔG° < 0, K > 1", x1 - 4, view === "lnk" ? y0 + 27 : y1 - 6);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
    Object.keys(RX).forEach((k) => {
      const on = k === r; ctx.strokeStyle = RX[k].col; ctx.globalAlpha = on ? 1 : 0.28; ctx.lineWidth = on ? 2.4 : 1.4;
      ctx.beginPath(); for (let i = 0; i <= 200; i++) { const TT = 250 + 1150 * i / 200, px = X(xv(TT)), py = Y(f(k, TT)); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke();
    });
    ctx.globalAlpha = 1; ctx.restore();
    /* 선 이름표: 오른쪽 끝(고온 쪽) 근처에서 겹치지 않게 */
    const labs = Object.keys(RX).map((k) => { const TT = view === "lnk" ? 1150 : 1300; return { k, x: X(xv(TT)), y: Y(f(k, TT)) }; }).sort((a, b) => a.y - b.y);
    for (let i = 1; i < labs.length; i++) if (labs[i].y - labs[i - 1].y < 13) labs[i].y = labs[i - 1].y + 13;
    ctx.font = `600 10.5px ${F.sans}`;
    labs.forEach(({ k, x, y }) => { ctx.fillStyle = RX[k].col; ctx.globalAlpha = k === r ? 1 : 0.6; ctx.textAlign = view === "lnk" ? "left" : "right"; ctx.fillText(RX[k].lab, view === "lnk" ? x + 6 : x - 6, clamp(y - 5, y0 + 10, y1 - 4)); });
    ctx.globalAlpha = 1;
    /* 지금 온도의 점과 K = 1 온도 */
    const px = X(xv(T)), py = Y(f(r, T));
    ctx.strokeStyle = C.rule; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(px, y0); ctx.lineTo(px, y1); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
    const T1 = RX[r].h * 1000 / RX[r].s;
    if (T1 > 250 && T1 < 1400) { const qx = X(xv(T1)); ctx.strokeStyle = RX[r].col; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(qx, Y(0), 6, 0, Math.PI * 2); ctx.stroke(); }
    /* 기울기 안내 */
    ctx.fillStyle = RX[r].col; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "right";
    const slope = view === "lnk" ? `기울기 = −ΔH°/R = ${(-RX[r].h * 1000 / R / 1000).toFixed(1)} × 10³ K` : `기울기 = −ΔS° = ${(-RX[r].s).toFixed(1)} J/(mol·K)`;
    ctx.fillText(slope.replace(/-/g, "−"), x1 - 4, y0 + 12);
  }
  function update() {
    const T = +sT.value, k = RX[r];
    oT.textContent = T; oC.textContent = (T - 273.15).toFixed(0);
    nH.textContent = (k.h > 0 ? "+" : "−") + Math.abs(k.h).toFixed(1);
    const g = dG(r, T); nG.textContent = `${g > 0 ? "+" : "−"}${Math.abs(g).toFixed(1)} kJ`;
    nK.textContent = sci(Math.exp(lnK(r, T)));
    const T1 = k.h * 1000 / k.s; nT1.textContent = `${T1.toFixed(0)} K`; nT1.title = `${(T1 - 273.15).toFixed(0)} °C`;
    root.querySelectorAll("[data-r]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.r === r)));
    root.querySelectorAll("[data-v]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === view)));
    draw();
  }
  root.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => { r = b.dataset.r; update(); }));
  root.querySelectorAll("[data-v]").forEach((b) => b.addEventListener("click", () => { view = b.dataset.v; update(); }));
  sT.addEventListener("input", update);
  update();
})();
