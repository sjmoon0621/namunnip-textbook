/* 카드: GPS 위성의 시계는 왜 보정해야 할까? — 속도 효과(특수)와 중력 효과(일반) */
(() => {
  const root = document.getElementById("card-phy-lm-gps");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const aS = $(".alt"), aO = $(".alt-out");
  const srEl = $(".sr"), grEl = $(".gr"), netEl = $(".net"), dEl = $(".dist");
  const GM = 3.986004e14, R = 6.371e6, c = 2.99792458e8, DAY = 86400;
  // 원궤도 위성 시계가 지상(자전 무시) 시계보다 하루에 몇 μs 빠른가
  const sr = (r) => -GM / (2 * r * c * c) * DAY * 1e6;          // −v²/2c², v² = GM/r
  const gr = (r) => GM / (c * c) * (1 / R - 1 / r) * DAY * 1e6;   // 중력 퍼텐셜 차이 / c²
  const AMAX = 40000;

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const alt = +aS.value, r = R + alt * 1e3;
    // 1) 지구와 궤도 (실제 비율)
    const ex = Math.round(w * 0.2), ey = h / 2, maxR = Math.min(w * 0.19, h / 2 - 12), k = maxR / (R + AMAX * 1e3);
    ctx.strokeStyle = C.rule; ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(ex, ey, r * k, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#2f5f8a"; ctx.beginPath(); ctx.arc(ex, ey, R * k, 0, Math.PI * 2); ctx.fill();
    const sa = -0.7;
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(ex + r * k * Math.cos(sa), ey + r * k * Math.sin(sa), 4, 0, Math.PI * 2); ctx.fill();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    ctx.fillText("실제 비율", ex, h - 4);
    // 2) 그래프: 고도에 따른 하루 시간 차이 (μs)
    const gx0 = Math.round(w * 0.46), gx1 = w - 10, gy0 = 18, gy1 = h - 28, Y0 = -32, Y1 = 56;
    const X = (a) => gx0 + a / AMAX * (gx1 - gx0), Y = (v) => gy0 + (Y1 - v) / (Y1 - Y0) * (gy1 - gy0);
    NM.axes(ctx, { x0: gx0, y0: gy0, w: gx1 - gx0, h: gy1 - gy0, X, Y,
      xt: [[0, "0"], [10000, "1만"], [20000, "2만"], [30000, "3만"], [40000, "4만 km"]],
      yt: [[-30, "−30"], [-15, "−15"], [0, "0"], [15, "15"], [30, "30"], [45, "45"]], ylabel: "하루 동안 앞서는 시간 (μs)" });
    ctx.strokeStyle = C.ink2; ctx.beginPath(); ctx.moveTo(gx0, Y(0) + .5); ctx.lineTo(gx1, Y(0) + .5); ctx.stroke();
    const curve = (f, color, lw) => {
      ctx.beginPath();
      for (let a = 200; a <= AMAX; a += 100) { const y = Y(f(R + a * 1e3)); a === 200 ? ctx.moveTo(X(a), y) : ctx.lineTo(X(a), y); }
      ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke();
    };
    curve(gr, "#4b7fa3", 1.5); curve(sr, C.warn, 1.5); curve((q) => gr(q) + sr(q), C.ink, 2.4);
    ctx.textAlign = "right"; ctx.font = `10.5px ${F.sans}`;
    ctx.fillStyle = "#4b7fa3"; ctx.fillText("중력 효과 (+)", gx1, Y(gr(R + AMAX * 1e3)) - 6);
    ctx.fillStyle = C.ink; ctx.fillText("합", gx1, Y(gr(R + AMAX * 1e3) + sr(R + AMAX * 1e3)) + 14);
    ctx.fillStyle = C.warn; ctx.fillText("속도 효과 (−)", gx1, Y(sr(R + AMAX * 1e3)) - 6);
    ctx.strokeStyle = C.ink; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(alt) + .5, gy0); ctx.lineTo(X(alt) + .5, gy1); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(X(alt), Y(gr(r) + sr(r)), 4.5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
  }

  function update() {
    const alt = +aS.value, r = R + alt * 1e3, s = sr(r), g = gr(r), n = s + g;
    aO.textContent = alt.toLocaleString("ko-KR");
    const f = (v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(1)} μs`;
    srEl.textContent = f(s); grEl.textContent = f(g); netEl.textContent = f(n);
    const d = Math.abs(n) * 1e-6 * c / 1000;
    dEl.textContent = d >= 1 ? `약 ${d.toFixed(1)} km` : `약 ${Math.round(d * 1000)} m`;
    draw();
  }
  aS.addEventListener("input", update);
  root.querySelectorAll("[data-alt]").forEach((b) => b.addEventListener("click", () => { aS.value = b.dataset.alt; update(); }));
  update();
})();
