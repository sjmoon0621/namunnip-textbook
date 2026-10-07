/* 카드: 같은 부피만큼 팽창해도 필요한 열은 왜 다를까? — 이상 기체 1 mol의 등압·등온·단열·등적 과정, W = ∫P dV, Q = ΔU + W */
(() => {
  const root = document.getElementById("card-adphy-process");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sR = $(".r"), oR = $(".r-out");
  const nW = $(".n-w"), nU = $(".n-u"), nQ = $(".n-q"), nT = $(".n-t");
  const R = 8.314, n = 1, T0 = 300, V0 = 24.94e-3, P0 = n * R * T0 / V0;
  const COL = { isobar: "#3f6fa3", isotherm: "#3b7c2a", adiabat: "#b5532f", isochor: "#7a5aa6" };
  const NAME = { isobar: "등압", isotherm: "등온", adiabat: "단열", isochor: "등적" };
  let proc = "isobar", gas = 1;

  function calc(p, r) {
    const Cv = gas === 1 ? 1.5 * R : 2.5 * R, g = (Cv + R) / Cv;
    let Tf, W, path;
    if (p === "isobar") { Tf = T0 * r; W = n * R * T0 * (r - 1); path = (s) => [V0 * (1 + (r - 1) * s), P0]; }
    else if (p === "isotherm") { Tf = T0; W = n * R * T0 * Math.log(r); path = (s) => { const V = V0 * (1 + (r - 1) * s); return [V, P0 * V0 / V]; }; }
    else if (p === "adiabat") { Tf = T0 * r ** (1 - g); W = n * Cv * (T0 - Tf); path = (s) => { const V = V0 * (1 + (r - 1) * s); return [V, P0 * (V0 / V) ** g]; }; }
    else { Tf = T0 * r; W = 0; path = (s) => [V0, P0 * (1 + (r - 1) * s)]; }
    const dU = n * Cv * (Tf - T0);
    return { Tf, W, dU, Q: dU + W, path, g };
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = +sR.value;
    const gx0 = 44, gx1 = w * 0.64, gy0 = h - 34, gy1 = 22, VM = 80e-3, PM = 500e3;
    const X = (V) => gx0 + V / VM * (gx1 - gx0), Y = (P) => gy0 - P / PM * (gy0 - gy1);
    NM.axes(ctx, { x0: gx0, y0: gy1, w: gx1 - gx0, h: gy0 - gy1, X, Y,
      xt: [0, 20, 40, 60, 80].map((v) => [v * 1e-3, `${v}`]), yt: [0, 100, 200, 300, 400, 500].map((v) => [v * 1e3, `${v}`]),
      xlabel: "V (L)", ylabel: "P (kPa)" });
    const sel = calc(proc, r);
    /* 선택한 과정 아래 넓이 */
    if (proc !== "isochor") {
      ctx.fillStyle = sel.W >= 0 ? "rgba(63,111,163,.16)" : "rgba(181,83,47,.16)";
      ctx.beginPath(); ctx.moveTo(X(V0), Y(0));
      for (let i = 0; i <= 80; i++) { const [V, P] = sel.path(i / 80); ctx.lineTo(X(V), Y(Math.min(P, PM))); }
      ctx.lineTo(X(V0 * r), Y(0)); ctx.closePath(); ctx.fill();
    }
    ctx.save(); ctx.beginPath(); ctx.rect(gx0, gy1, gx1 - gx0, gy0 - gy1); ctx.clip();
    ["isobar", "isotherm", "adiabat", "isochor"].forEach((p) => {
      const c = calc(p, r), on = p === proc;
      ctx.strokeStyle = COL[p]; ctx.lineWidth = on ? 2.6 : 1.2; ctx.globalAlpha = on ? 1 : 0.45; ctx.beginPath();
      for (let i = 0; i <= 80; i++) { const [V, P] = c.path(i / 80); if (i) ctx.lineTo(X(V), Y(P)); else ctx.moveTo(X(V), Y(P)); }
      ctx.stroke(); ctx.globalAlpha = 1;
      const [Ve, Pe] = c.path(1);
      ctx.fillStyle = COL[p]; ctx.globalAlpha = on ? 1 : 0.6; ctx.beginPath(); ctx.arc(X(Ve), Y(Pe), on ? 4 : 2.5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    });
    ctx.restore();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(V0), Y(P0), 4, 0, Math.PI * 2); ctx.fill();
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("처음 300 K", X(V0) - 6, Y(P0) - 6);
    /* 범례 */
    ctx.textAlign = "right"; ctx.font = `10.5px ${F.sans}`;
    ["isobar", "isotherm", "adiabat", "isochor"].forEach((p, i) => { ctx.fillStyle = COL[p]; ctx.globalAlpha = p === proc ? 1 : 0.6; ctx.fillText(NAME[p], gx1 - 4, gy1 + 14 + i * 14); });
    ctx.globalAlpha = 1;
    /* 오른쪽: 막대 */
    const all = ["isobar", "isotherm", "adiabat", "isochor"].map((p) => calc(p, r));
    const M = Math.max(1000, ...all.flatMap((c) => [Math.abs(c.Q), Math.abs(c.dU), Math.abs(c.W)]));
    const bx0 = w * 0.7, bx1 = w - 8, zy = (gy0 + gy1) / 2 + 10, half = (gy0 - gy1) / 2 - 8;
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx0, zy); ctx.lineTo(bx1, zy); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`${NAME[proc]} 과정의 에너지`, bx0, 14);
    const items = [["Q", sel.Q, "#d4493a"], ["ΔU", sel.dU, "#e0a02a"], ["W", sel.W, "#3f6fa3"]];
    const bw = (bx1 - bx0) / 3;
    items.forEach(([lab, v, col], i) => {
      const x = bx0 + bw * i + bw * 0.18, ww = bw * 0.64, hh = v / M * half;
      ctx.fillStyle = col; ctx.fillRect(x, hh >= 0 ? zy - hh : zy, ww, Math.abs(hh));
      ctx.fillStyle = C.ink; ctx.font = `11px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText(lab, x + ww / 2, zy + (v >= 0 ? 13 : -5));
      ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`;
      ctx.fillText(`${(v / 1000).toFixed(2)}`, x + ww / 2, hh >= 0 ? zy - hh - 4 : zy - hh + 12);
    });
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("단위 kJ", bx1, gy0 + 14);
  }
  const kJ = (v) => `${(v / 1000).toFixed(2)} kJ`;
  function update() {
    const r = +sR.value, c = calc(proc, r);
    oR.textContent = r.toFixed(2);
    nW.textContent = kJ(c.W); nU.textContent = kJ(c.dU); nQ.textContent = kJ(c.Q);
    nT.textContent = `${c.Tf.toFixed(0)} K`;
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === proc)));
    root.querySelectorAll("[data-gas]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.gas === gas)));
    draw();
  }
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { proc = b.dataset.p; update(); }));
  root.querySelectorAll("[data-gas]").forEach((b) => b.addEventListener("click", () => { gas = +b.dataset.gas; update(); }));
  sR.addEventListener("input", update);
  update();
})();
