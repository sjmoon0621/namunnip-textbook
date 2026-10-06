/* 카드: 추의 무게만큼 당기면 고무마개는 얼마나 빨리 돌까? — 고무마개 원운동, 10바퀴 주기, Mg = m·4π²L/T² */
(() => {
  const root = document.getElementById("card-labphy-centripetal");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const G = 9.8, KNOT = 0.015;   // 매듭에서 마개 중심까지 1.5 cm (모식값)
  const sL = $(".l"), sM = $(".m"), sW = $(".M"), cF = $(".fric"), cK = $(".knot");
  let xKey = "F", th = 0, watch = null;

  const period = (len, m, M, k = 1) => 2 * Math.PI * Math.sqrt(m * len / (M * G * k));
  const app = fit($(".cv-wide"), () => drawApp()), pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "L", label: "L (m)", res: 0.001 }, { key: "m", label: "m (g)", res: 1 }, { key: "M", label: "M (g)", res: 1 },
    { key: "t10", label: "10T (s)", res: 0.01 }, { key: "T", label: "T (s)", res: 0.001 },
    { key: "Fc", label: "m·4π²L/T² (N)", res: 0.001 }, { key: "Mg", label: "Mg (N)", res: 0.001 },
  ], () => drawPlot());

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const len = +sL.value, m = +sM.value / 1000, M = +sW.value / 1000;
    const phi = Math.asin(Math.min(0.95, m / M)), tx = w * 0.5, s = tx - 18;
    const ty = 34, r = len * Math.cos(phi) * s, cy = ty + len * Math.sin(phi) * s * 0.9;
    const ex = Math.cos(th) * r, ey = Math.sin(th) * r * 0.22;
    const sx = tx + ex, sy = cy + ey, rm = 4 + Math.sqrt(m * 1000) * 0.9;
    // 궤도 (뒤쪽 반은 점선)
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.ellipse(tx, cy, r, r * 0.22, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    const back = Math.sin(th) < 0;
    const stopper = () => { ctx.fillStyle = "#a0522d"; ctx.beginPath(); ctx.ellipse(sx, sy, rm, rm * 0.8, 0, 0, Math.PI * 2); ctx.fill(); };
    const string = () => { ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(sx, sy); ctx.stroke(); };
    if (back) { stopper(); string(); }
    // 유리관과 손
    const tb = ty + 80;
    ctx.fillStyle = "rgba(170,205,235,.45)"; ctx.strokeStyle = "#6c8fb3"; ctx.lineWidth = 1.2;
    ctx.fillRect(tx - 4, ty, 8, tb - ty); ctx.strokeRect(tx - 4, ty, 8, tb - ty);
    ctx.fillStyle = "#e8c9a8"; ctx.beginPath(); ctx.roundRect(tx - 12, ty + 30, 24, 26, 8); ctx.fill();
    if (!back) { string(); stopper(); }
    // 아래 줄, 클립, 추
    const clipY = tb + 10, my = clipY + 30;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(tx, tb); ctx.lineTo(tx, my); ctx.stroke();
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx - 6, clipY); ctx.lineTo(tx + 6, clipY); ctx.stroke();
    const mh = 10 + M * 40;
    ctx.fillStyle = "#6f7378"; ctx.fillRect(tx - 11, my, 22, mh);
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("클립", tx + 10, clipY + 4); ctx.fillText(`추 ${Math.round(M * 1000)} g`, tx + 16, my + mh / 2 + 4);
    ctx.fillText(`줄 처짐 φ = ${(phi * 180 / Math.PI).toFixed(0)}°`, 14, h - 14);
    // 초시계
    const R = Math.min(32, h * 0.14), cx = w - R - 14, wy = h - R - 44;
    ctx.fillStyle = C.card; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, wy, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const shown = watch ? Math.min(watch.el, watch.shown) : 0;
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, wy);
    ctx.lineTo(cx + Math.sin(shown / 60 * 2 * Math.PI) * R * 0.8, wy - Math.cos(shown / 60 * 2 * Math.PI) * R * 0.8); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `600 14px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(shown.toFixed(2) + " s", cx, wy + R + 20);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink3;
    ctx.fillText(watch ? `${Math.min(10, Math.floor(watch.el / watch.T))} / 10바퀴` : "초시계", cx, wy + R + 36);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows;
    let pts, xlabel, ylabel, exp = "—", expT = "기대 기울기";
    if (xKey === "F") { pts = rows.map((r) => ({ x: r.Fc, y: r.Mg })); xlabel = "m·4π²L/T² (N)"; ylabel = "Mg (N)"; exp = "1"; }
    else if (xKey === "TL") {
      pts = rows.map((r) => ({ x: r.L, y: r.T * r.T })); xlabel = "L (m)"; ylabel = "T² (s²)";
      const ms = new Set(rows.map((r) => `${r.m}/${r.M}`));
      expT = "4π²m/(Mg)"; exp = ms.size === 1 && rows.length ? `${(4 * Math.PI ** 2 * rows[0].m / (rows[0].M * G)).toFixed(4)} s²/m` : "m, M 섞임";
    } else {
      pts = rows.map((r) => ({ x: 1000 / r.M, y: r.T * r.T })); xlabel = "1/M (1/kg)"; ylabel = "T² (s²)";
      const ms = new Set(rows.map((r) => `${r.m}/${r.L}`));
      expT = "4π²mL/g"; exp = ms.size === 1 && rows.length ? `${(4 * Math.PI ** 2 * rows[0].m / 1000 * rows[0].L / G).toFixed(4)} s²·kg` : "m, L 섞임";
    }
    const ft = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y), true) : null;
    const o = xKey === "F" ? { model: (x) => x } : {};
    L.plot(ctx, { x0: 50, y0: 18, w: w - 64, h: h - 52 }, { pts, fit: ft, xlabel, ylabel, ...o });
    $(".n-a").textContent = ft ? `${ft.a.toFixed(xKey === "F" ? 3 : 4)} ± ${ft.sa.toFixed(xKey === "F" ? 3 : 4)}` : "점 2개 이상";
    $(".n-2t").textContent = expT; $(".n-2").textContent = exp;
    const last = rows[rows.length - 1];
    $(".n-v").textContent = last ? `${(2 * Math.PI * last.L / last.T).toFixed(2)} m/s` : "—";
  }

  function measure() {
    const len = +sL.value, m = +sM.value, M = +sW.value;
    const k = cF.checked ? 1 + 0.24 * (Math.random() - 0.5) : 1;          // 마찰: 시행마다 장력이 ±12% 안에서 달라짐
    const T = period(len + (cK.checked ? KNOT : 0), m, M, k);              // 매듭까지 재면 실제 반지름은 1.5 cm 더 김
    const t10 = L.snap(10 * T + 0.08 * L.gauss() + 0.08 * L.gauss(), 0.01);
    const Tm = t10 / 10, Lr = L.snap(len + 0.002 * L.gauss(), 0.001);
    watch = { el: 0, T, shown: t10, rec: { L: Lr, m, M, t10, T: Tm, Fc: m / 1000 * 4 * Math.PI ** 2 * Lr / (Tm * Tm), Mg: M / 1000 * G } };
  }
  loop($(".cv-wide"), (dt) => {
    const T = watch ? watch.T : period(+sL.value, +sM.value, +sW.value);
    th += dt * 2 * Math.PI / T * 0.5;   // 화면은 절반 속도
    if (watch) { watch.el += dt * 4; if (watch.el >= watch.shown + 0.6) { tbl.add(watch.rec); watch = null; } }
    drawApp();
  });
  const upd = () => { $(".l-out").textContent = (+sL.value).toFixed(2); $(".m-out").textContent = sM.value; $(".M-out").textContent = sW.value; drawApp(); };
  [sL, sM, sW].forEach((el) => el.addEventListener("input", upd));
  $(".meas").addEventListener("click", () => { if (!watch) measure(); });
  $(".clear").addEventListener("click", () => { watch = null; tbl.clear(); });
  $(".xsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-x]"); if (!b) return;
    xKey = b.dataset.x; root.querySelectorAll("[data-x]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  upd();
  if (L.demo) {
    [[0.3, 20, 200], [0.45, 20, 200], [0.6, 20, 200], [0.8, 20, 200], [1.0, 20, 200], [0.6, 20, 100], [0.6, 20, 150], [0.6, 20, 300], [0.6, 30, 200], [0.6, 40, 200]]
      .forEach(([l, m, M]) => { sL.value = l; sM.value = m; sW.value = M; measure(); tbl.add(watch.rec); });
    watch = null; sL.value = 0.6; sM.value = 20; sW.value = 200; upd();
  }
})();
