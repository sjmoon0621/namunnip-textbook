/* 카드: 몇 번을 관찰해야 규칙을 믿을 수 있을까? — 진자 주기 귀납 탐구 (길이·질량·각도) */
(() => {
  const root = document.getElementById("card-sie1-pendulum");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sL = $(".l"), sM = $(".m"), sA = $(".a");
  const G = 9.8;
  let xKey = "L", t = 0, watch = null;

  // 큰 각도 보정을 넣은 참주기 (타원 적분 급수)
  const period = (len, deg) => {
    const k = Math.sin(deg * Math.PI / 360), k2 = k * k;
    return 2 * Math.PI * Math.sqrt(len / G) * (1 + k2 / 4 + 9 * k2 * k2 / 64 + 25 * k2 ** 3 / 256);
  };
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "L", label: "L (m)", res: 0.1 }, { key: "m", label: "m (g)", res: 1 }, { key: "a", label: "θ (°)", res: 1 },
    { key: "t10", label: "10T (s)", res: 0.01 }, { key: "T", label: "T (s)", res: 0.001 },
  ], () => drawPlot());

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const len = +sL.value, A = +sA.value * Math.PI / 180, m = +sM.value;
    const T = period(len, +sA.value), ph = Math.cos(2 * Math.PI * t / T) * A;
    const px = w * 0.38, py = 14, rl = (h - 40) * len / 1.6;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px - 60, py); ctx.lineTo(px + 60, py); ctx.stroke();
    ctx.setLineDash([3, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + rl + 10); ctx.stroke();
    ctx.beginPath(); ctx.arc(px, py, rl, Math.PI / 2 - A, Math.PI / 2 + A); ctx.stroke(); ctx.setLineDash([]);
    const bx = px + Math.sin(ph) * rl, by = py + Math.cos(ph) * rl, r = 5 + Math.cbrt(m) * 1.1;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();
    ctx.fillStyle = "#8d8d92"; ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill();
    // 초시계
    const cx = w * 0.8, cy = h * 0.42, R = Math.min(48, h * 0.26);
    ctx.fillStyle = C.card; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillRect(cx - 6, cy - R - 9, 12, 8); ctx.strokeRect(cx - 6, cy - R - 9, 12, 8);
    const shown = watch ? Math.min(watch.el, watch.shown) : 0;
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.sin(shown / 60 * 2 * Math.PI) * R * 0.8, cy - Math.cos(shown / 60 * 2 * Math.PI) * R * 0.8); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `600 15px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(shown.toFixed(2) + " s", cx, cy + R + 22);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink3;
    ctx.fillText(watch ? `왕복 ${Math.min(10, Math.floor(watch.el / watch.T))} / 10` : "초시계", cx, cy + R + 38);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const xv = (r) => (xKey === "sL" ? Math.sqrt(r.L) : r[xKey]);
    const pts = tbl.rows.map((r) => ({ x: xv(r), y: r.T }));
    const f = xKey === "sL" && pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y), true) : null;
    const lab = { L: "L (m)", sL: "√L (√m)", m: "m (g)", a: "θ (°)" }[xKey];
    const xr = { L: [0, 1.7], sL: [0, 1.3], m: [0, 550], a: [0, 65] }[xKey];
    L.plot(ctx, { x0: 44, y0: 18, w: w - 58, h: h - 52 }, { pts, fit: f, xr, yr: [0, 2.8], xlabel: lab, ylabel: "T (s)" });
    if (f) {
      ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
      ctx.fillText(`기울기 ${f.a.toFixed(3)} → g = (2π/기울기)² = ${((2 * Math.PI / f.a) ** 2).toFixed(2)} m/s²`, 50, 30);
    }
  }

  function measure() {
    const len = +sL.value, deg = +sA.value, T = period(len, deg);
    const t10 = L.snap(10 * T + 0.08 * L.gauss() + 0.08 * L.gauss(), 0.01);   // 시작·멈춤 반응 시간
    watch = { el: 0, T, shown: t10, rec: { L: len, m: +sM.value, a: deg, t10, T: t10 / 10 } };
    t = 0;
  }
  loop($(".cv-wide"), (dt) => {
    t += dt;
    if (watch) { watch.el += dt * 6; if (watch.el >= watch.shown + 0.6) { tbl.add(watch.rec); watch = null; } }   // 6배속
    drawApp();
  });
  const upd = () => { $(".l-out").textContent = (+sL.value).toFixed(2); $(".m-out").textContent = sM.value; $(".a-out").textContent = sA.value; drawApp(); };
  [sL, sM, sA].forEach((el) => el.addEventListener("input", upd));
  $(".meas").addEventListener("click", () => { if (!watch) measure(); });
  $(".clear").addEventListener("click", () => { watch = null; tbl.clear(); });
  $(".xsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-x]"); if (!b) return;
    xKey = b.dataset.x; root.querySelectorAll("[data-x]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  upd();
  if (L.demo) {
    [[0.3, 100, 10], [0.6, 100, 10], [0.9, 100, 10], [1.2, 100, 10], [1.5, 100, 10], [0.6, 300, 10], [0.6, 500, 10], [0.6, 100, 30], [0.6, 100, 60]]
      .forEach(([l, m, a]) => { sL.value = l; sM.value = m; sA.value = a; measure(); tbl.add(watch.rec); });
    watch = null; sL.value = 0.5; sM.value = 100; sA.value = 10; upd(); root.querySelector('[data-x="sL"]').click();
  }
})();
