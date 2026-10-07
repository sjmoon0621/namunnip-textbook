/* 카드: 온도를 올리면 왜 어떤 염은 더 녹고 어떤 염은 덜 녹을까? — 용해도와 농도 단위 */
(() => {
  const root = document.getElementById("card-adchem-solubility");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t");
  const R = 8.314, MW = 18.015;
  /* 용해도: [°C, g / 물 100 g] — CRC 편람 등의 값을 반올림 */
  const D = {
    kno3: { n: "KNO₃", M: 101.10, col: "#3f6fa3", d: [[0, 13.3], [10, 20.9], [20, 31.6], [30, 45.8], [40, 63.9], [50, 85.5], [60, 110], [70, 138], [80, 169], [90, 202], [100, 246]] },
    nacl: { n: "NaCl", M: 58.44, col: "#3b7c2a", d: [[0, 35.7], [10, 35.8], [20, 36.0], [30, 36.3], [40, 36.6], [50, 37.0], [60, 37.3], [70, 37.8], [80, 38.4], [90, 39.0], [100, 39.8]] },
    li2co3: { n: "Li₂CO₃", M: 73.89, col: "#b5532f", d: [[0, 1.54], [10, 1.43], [20, 1.33], [30, 1.25], [40, 1.17], [50, 1.08], [60, 1.01], [80, 0.85], [100, 0.72]] },
  };
  let sol = "kno3", view = "curve";
  const S = (k, t) => { const d = D[k].d; for (let i = 1; i < d.length; i++) if (t <= d[i][0]) { const [t0, s0] = d[i - 1], [t1, s1] = d[i]; return s0 + (s1 - s0) * (t - t0) / (t1 - t0); } return d[d.length - 1][1]; };
  const xfrac = (k, s) => { const n = s / D[k].M; return n / (n + 100 / MW); };
  const lnx = (k, t) => Math.log(xfrac(k, S(k, t)));
  /* 겉보기 ΔH: t ± 10 °C 사이의 기울기 */
  const dH = (k, t) => { const a = Math.max(0, t - 10), b = Math.min(100, t + 10); return -R * (lnx(k, b) - lnx(k, a)) / (1 / (b + 273.15) - 1 / (a + 273.15)) / 1000; };

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const t = +sT.value, x0 = 48, x1 = w - 14, y1 = 22, y0 = h - 34;
    ctx.font = `10.5px ${F.sans}`;
    if (view === "curve") {
      const YM = 260, X = (v) => x0 + v / 100 * (x1 - x0), Y = (v) => y0 - v / YM * (y0 - y1);
      const xt = []; for (let v = 0; v <= 100; v += 20) xt.push([v, `${v}`]);
      NM.axes(ctx, { x0, y0: y1, w: x1 - x0, h: y0 - y1, xt, yt: [[0, "0"], [50, "50"], [100, "100"], [150, "150"], [200, "200"], [250, "250"]], X, Y, xlabel: "온도 (°C)", ylabel: "용해도 (g / 물 100 g)" });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
      for (const k of Object.keys(D)) {
        const sel = k === sol; ctx.strokeStyle = D[k].col; ctx.lineWidth = sel ? 2.4 : 1.3; ctx.globalAlpha = sel ? 1 : 0.5;
        ctx.beginPath(); D[k].d.forEach(([tt, s], i) => (i ? ctx.lineTo(X(tt), Y(s)) : ctx.moveTo(X(tt), Y(s)))); ctx.stroke();
        ctx.fillStyle = D[k].col; D[k].d.forEach(([tt, s]) => { ctx.beginPath(); ctx.arc(X(tt), Y(s), sel ? 2.6 : 1.8, 0, Math.PI * 2); ctx.fill(); });
        ctx.globalAlpha = 1;
        const last = D[k].d[D[k].d.length - 1]; ctx.textAlign = "right"; ctx.fillText(D[k].n, X(last[0]) - 4, Y(last[1]) - (k === "li2co3" ? 6 : k === "nacl" ? 7 : -14));
      }
      /* Li₂CO₃ 확대 상자 */
      const bx = x0 + 12, by = y1 + 8, bw = (x1 - x0) * 0.42, bh = (y0 - y1) * 0.3;
      ctx.fillStyle = "rgba(251,251,248,.95)"; ctx.fillRect(bx, by, bw, bh); ctx.strokeStyle = C.rule; ctx.strokeRect(bx, by, bw, bh);
      const Xi = (v) => bx + 6 + v / 100 * (bw - 12), Yi = (v) => by + bh - 8 - (v - 0.6) / 1.0 * (bh - 22);
      ctx.strokeStyle = D.li2co3.col; ctx.lineWidth = sol === "li2co3" ? 2 : 1.2; ctx.beginPath(); D.li2co3.d.forEach(([tt, s], i) => (i ? ctx.lineTo(Xi(tt), Yi(s)) : ctx.moveTo(Xi(tt), Yi(s)))); ctx.stroke();
      ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.font = `10px ${F.sans}`; ctx.fillText("Li₂CO₃ 확대 (0.6–1.6 g)", bx + 6, by + 12);
      if (sol === "li2co3") { ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(Xi(t), Yi(S(sol, t)), 4, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = C.amber; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(t), y1 + bh + 10); ctx.lineTo(X(t), y0); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(X(t), Y(S(sol, t)), 5, 0, Math.PI * 2); ctx.fill();
    } else {
      const ux0 = 2.65, ux1 = 3.70, uy0 = -7, uy1 = -0.5;
      const X = (u) => x0 + (u - ux0) / (ux1 - ux0) * (x1 - x0), Y = (v) => y0 - (v - uy0) / (uy1 - uy0) * (y0 - y1);
      const xt = []; for (let u = 2.7; u <= 3.71; u += 0.2) xt.push([u, u.toFixed(1)]);
      const yt = []; for (let v = -7; v <= -1; v += 1) yt.push([v, `${v}`]);
      NM.axes(ctx, { x0, y0: y1, w: x1 - x0, h: y0 - y1, xt, yt, X, Y, xlabel: "1000/T (K⁻¹)", ylabel: "ln x (용질의 몰 분율)" });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
      for (const k of Object.keys(D)) {
        const sel = k === sol; ctx.strokeStyle = D[k].col; ctx.fillStyle = D[k].col; ctx.lineWidth = sel ? 2.4 : 1.3; ctx.globalAlpha = sel ? 1 : 0.5;
        ctx.beginPath(); D[k].d.forEach(([tt, s], i) => { const px = X(1000 / (tt + 273.15)), py = Y(Math.log(xfrac(k, s))); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.stroke();
        D[k].d.forEach(([tt, s]) => { ctx.beginPath(); ctx.arc(X(1000 / (tt + 273.15)), Y(Math.log(xfrac(k, s))), sel ? 2.6 : 1.8, 0, Math.PI * 2); ctx.fill(); });
        ctx.globalAlpha = 1; ctx.textAlign = "left";
        const f = D[k].d[0]; ctx.fillText(D[k].n, X(1000 / (f[0] + 273.15)) - 40, Y(Math.log(xfrac(k, f[1]))) - 8);
      }
      /* 접선 */
      const u = 1000 / (t + 273.15), v = lnx(sol, t), sl = -dH(sol, t) * 1000 / R / 1000;
      ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5; ctx.setLineDash([5, 3]); ctx.beginPath(); ctx.moveTo(X(u - 0.25), Y(v - 0.25 * sl)); ctx.lineTo(X(u + 0.25), Y(v + 0.25 * sl)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(X(u), Y(v), 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.ink2; ctx.textAlign = "right"; ctx.fillText("기울기 = −ΔH/R  (오른쪽 = 낮은 온도)", x1 - 2, y0 - 8);
    }
  }

  function update() {
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === sol)));
    root.querySelectorAll("[data-v]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === view)));
    const t = +sT.value, s = S(sol, t), M = D[sol].M;
    $(".t-out").textContent = t;
    $(".n-s").textContent = `${s.toFixed(s < 10 ? 2 : 1)} g`;
    $(".n-w").textContent = `${(s / (100 + s) * 100).toFixed(1)} %`;
    $(".n-m").textContent = `${(s / M / 0.1).toFixed(2)} mol/kg`;
    $(".n-x").textContent = xfrac(sol, s).toFixed(4);
    const H = dH(sol, t); $(".n-h").textContent = `${H > 0 ? "+" : "−"}${Math.abs(H).toFixed(1)} kJ/mol (${H > 0 ? "흡열" : "발열"})`;
    draw();
  }
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { sol = b.dataset.s; update(); }));
  root.querySelectorAll("[data-v]").forEach((b) => b.addEventListener("click", () => { view = b.dataset.v; update(); }));
  sT.addEventListener("input", update);
  if (/[?&]demo\b/.test(location.search)) view = "vh";
  update();
})();
