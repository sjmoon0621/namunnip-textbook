/* 카드: 정규분포표 하나로 모든 정규분포의 확률을 구할 수 있을까? — X ~ N(m, σ²)와 Z = (X − m)/σ의 넓이 대응 */
(() => {
  const root = document.getElementById("card-stat-standardize");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMStat;
  const $ = (s) => root.querySelector(s), sm = $(".m"), ss = $(".s"), sa = $(".a");
  const XL = 140, XH = 200, ZL = -4, ZH = 4;
  const { ctx, size } = fit($("canvas"), () => draw());

  function panel(x0, gw, base, ht, lo, hi, pdf, peak, cut, ticks, name) {
    const X = (x) => x0 + (x - lo) / (hi - lo) * gw, Y = (y) => base - y / peak * ht;
    ctx.fillStyle = C.sprout; ctx.beginPath(); ctx.moveTo(X(lo), base);
    const c = Math.max(lo, Math.min(hi, cut));
    for (let i = 0; i <= 160; i++) { const x = lo + (c - lo) * i / 160; ctx.lineTo(X(x), Y(pdf(x))); }
    ctx.lineTo(X(c), base); ctx.fill();
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let i = 0; i <= 240; i++) { const x = lo + (hi - lo) * i / 240; if (i) ctx.lineTo(X(x), Y(pdf(x))); else ctx.moveTo(X(x), Y(pdf(x))); }
    ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, base); ctx.lineTo(x0 + gw, base); ctx.stroke();
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(c), base); ctx.lineTo(X(c), base - ht - 2); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ticks.forEach(([v, l]) => ctx.fillText(l, X(v), base + 13));
    ctx.font = `600 11.5px ${F.sans}`; ctx.fillStyle = C.forest; ctx.textAlign = "left"; ctx.fillText(name, x0, base - ht + 4);
    return X;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = +sm.value, s = +ss.value, a = +sa.value, z = (a - m) / s;
    const x0 = 12, gw = w - 24, ht = h * 0.27, b1 = Math.round(h * 0.36), b2 = Math.round(h * 0.88);
    const peakX = S.npdf(0, 0, 3), peakZ = S.npdf(0, 0, 1);
    const X1 = panel(x0, gw, b1, ht, XL, XH, (x) => S.npdf(x, m, s), peakX, a, [140, 150, 160, 170, 180, 190, 200].map((v) => [v, String(v)]), `X ~ N(${m}, ${S.short(s, 1)}²)`);
    const X2 = panel(x0, gw, b2, ht, ZL, ZH, (x) => S.npdf(x, 0, 1), peakZ, z, [-3, -2, -1, 0, 1, 2, 3].map((v) => [v, String(v).replace("-", "−")]), "Z ~ N(0, 1)");
    ctx.setLineDash([3, 3]); ctx.lineWidth = 1.2;
    [[m, 0, C.ink3], [a, z, C.warn]].forEach(([xv, zv, col]) => {
      ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(X1(Math.max(XL, Math.min(XH, xv))), b1 + 16); ctx.lineTo(X2(Math.max(ZL, Math.min(ZH, zv))), b2 - ht - 4); ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.font = `600 11px ${F.mono}`; ctx.fillStyle = C.warn; ctx.textAlign = "right";
    ctx.fillText(`z = ${S.fmt(z, 2)}`, x0 + gw, b2 - ht + 4);
  }

  function update() {
    const m = +sm.value, s = +ss.value, a = +sa.value, z = (a - m) / s, zr = Math.round(Math.abs(z) * 100) / 100;
    $(".m-out").textContent = m; $(".s-out").textContent = s.toFixed(1); $(".a-out").textContent = a.toFixed(1);
    $(".n-z").textContent = S.fmt(z, 2);
    $(".d-t").textContent = `P(0 ≤ Z ≤ ${S.fmt(zr, 2)})`;
    $(".n-t").textContent = S.fmt(S.ncdf(zr) - 0.5, 4);
    $(".n-l").textContent = S.fmt(S.ncdf(z), 4); $(".n-g").textContent = S.fmt(1 - S.ncdf(z), 4);
    draw();
  }
  [sm, ss, sa].forEach((x) => x.addEventListener("input", update));
  update();
})();
