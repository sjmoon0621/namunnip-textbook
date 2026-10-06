/* 카드: 음극선은 빛일까, 전하를 띤 알갱이일까? — 음극선관 그림자·바람개비·전기장/자기장 편향 */
(() => {
  const root = document.getElementById("card-labphy-cathode");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sVa = $(".va"), sVd = $(".vd"), sI = $(".ic"), cE = $(".earth");
  const EM = 1.75882e11;   // e/m (C/kg)
  const l = 0.04, d = 0.01, D = 0.15, KB = 0.5e-3, BE = 2.5e-5, LT = 0.2, YMAX = 40;
  let obj = "none", xKey = "vd", reading = NaN, tick = 0, wheelX = 0, wheelA = 0;

  const speed = (Va) => Math.sqrt(2 * EM * Va * 1000);
  // 화면 위 점의 위치 (mm, 위가 +). 전자(음전하): 위판 + → 위로, B ⊗ (I>0) → F = −e v×B 가 아래로
  function yTrue(Va, Vd, I, earth) {
    const v = speed(Va);
    const yE = Vd * l * D / (2 * d * Va * 1000);
    const yB = -EM * KB * I * l * D / v;
    const yG = earth ? EM * BE * LT * LT / (2 * v) : 0;
    return (yE + yB + yG) * 1000;
  }
  const yNow = () => yTrue(+sVa.value, +sVd.value, +sI.value, cE.checked);
  const read = (y) => (Math.abs(y) > YMAX ? NaN : L.measure(y, { sd: 0.4, res: 1 }));

  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "Va", label: "Va (kV)", res: 0.1 }, { key: "Vd", label: "Vd (V)", res: 1 },
    { key: "I", label: "I (A)", res: 0.01 }, { key: "y", label: "y (mm)", res: 1 },
  ], () => drawPlot());

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const cy = h * 0.5, x0 = w * 0.04, xn = w * 0.4, xs = w * 0.7, nh = h * 0.1, sh = h * 0.38;
    const xp1 = w * 0.22, xp2 = w * 0.32, xc = (xp1 + xp2) / 2, sc = sh * 0.92 / YMAX;
    // 유리관 외곽
    const tube = new Path2D();
    tube.moveTo(x0, cy - nh); tube.lineTo(xn, cy - nh); tube.lineTo(xs, cy - sh); tube.lineTo(xs, cy + sh); tube.lineTo(xn, cy + nh); tube.lineTo(x0, cy + nh);
    tube.arc(x0, cy, nh, Math.PI / 2, -Math.PI / 2); tube.closePath();
    ctx.fillStyle = "rgba(200,215,225,0.18)"; ctx.fill(tube); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.4; ctx.stroke(tube);
    // 형광 화면
    ctx.strokeStyle = "#3b8f2a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xs - 2, cy - sh + 2); ctx.lineTo(xs - 2, cy + sh - 2); ctx.stroke();
    // 음극·양극
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x0 + 6, cy - nh * 0.6); ctx.lineTo(x0 + 6, cy + nh * 0.6); ctx.stroke();
    const xa = x0 + w * 0.08;
    ctx.beginPath(); ctx.moveTo(xa, cy - nh * 0.8); ctx.lineTo(xa, cy - 3); ctx.moveTo(xa, cy + 3); ctx.lineTo(xa, cy + nh * 0.8); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("음극 −", x0 + 6, cy + nh + 16); ctx.fillText("양극 +", xa, cy + nh + 16);
    // 코일 (옆에서 본 원) + B 방향
    const I = +sI.value, Vd = +sVd.value;
    ctx.setLineDash([4, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(xc, cy, h * 0.22, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink2; ctx.fillText("코일", xc, cy - h * 0.22 - 6);
    if (Math.abs(I) >= 0.01) {
      ctx.fillStyle = "#2f62c9"; ctx.font = `600 13px ${F.sans}`;
      ctx.fillText(I > 0 ? "⊗ B" : "⊙ B", xc + h * 0.22 + 4, cy + h * 0.22);
    }
    // 편향판
    ctx.lineWidth = 3;
    ctx.strokeStyle = Vd > 0 ? C.apple : Vd < 0 ? "#2f62c9" : C.ink2; ctx.beginPath(); ctx.moveTo(xp1, cy - nh * 0.7); ctx.lineTo(xp2, cy - nh * 0.7); ctx.stroke();
    ctx.strokeStyle = Vd < 0 ? C.apple : Vd > 0 ? "#2f62c9" : C.ink2; ctx.beginPath(); ctx.moveTo(xp1, cy + nh * 0.7); ctx.lineTo(xp2, cy + nh * 0.7); ctx.stroke();
    ctx.font = `600 11px ${F.mono}`; ctx.fillStyle = C.ink2;
    if (Vd) { ctx.fillText(Vd > 0 ? "+" : "−", xp2 + 8, cy - nh * 0.7 + 4); ctx.fillText(Vd > 0 ? "−" : "+", xp2 + 8, cy + nh * 0.7 + 4); }
    // 빔: 화면에서의 변위(픽셀) → 판 구간에서 포물선, 그 뒤 직선
    const y = yNow(), ys = -y * sc, k = ys / (xs - xc), lp = xp2 - xp1;
    const by = (x) => (x < xp1 ? 0 : x < xp2 ? k * (x - xp1) ** 2 / (2 * lp) : k * (x - xc));
    ctx.save(); ctx.clip(tube);
    const xob = w * 0.52;
    if (obj === "cross") {
      ctx.fillStyle = "rgba(90,200,90,0.16)";
      ctx.beginPath(); ctx.moveTo(xa, cy - 3); ctx.lineTo(xs, cy + by(xs) - sh * 0.8); ctx.lineTo(xs, cy + by(xs) + sh * 0.8); ctx.lineTo(xa, cy + 3); ctx.fill();
      ctx.fillStyle = "rgba(35,35,38,0.25)";
      const f = (xs - xa) / (xob - xa);
      ctx.beginPath(); ctx.moveTo(xob, cy + by(xob) - 12); ctx.lineTo(xs, cy + by(xs) - 12 * f); ctx.lineTo(xs, cy + by(xs) + 12 * f); ctx.lineTo(xob, cy + by(xob) + 12); ctx.fill();
    }
    const xend = obj === "wheel" ? Math.min(xs, xob - 20 + wheelX * (xs - xob - 10)) : xs;
    ctx.strokeStyle = "rgba(90,190,90,0.9)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 + 8, cy);
    for (let x = xa; x <= xend; x += 2) ctx.lineTo(x, cy + (obj === "wheel" ? 0 : by(x)));
    ctx.stroke();
    ctx.restore();
    if (obj === "cross") {
      ctx.fillStyle = "#a9873a"; const s = 12;
      ctx.fillRect(xob - 2, cy + by(xob) - s, 4, 2 * s);
      ctx.strokeStyle = "#a9873a"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(xob, cy + by(xob) + s); ctx.lineTo(xob, cy + sh * 0.55); ctx.stroke();
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.fillText("십자", xob, cy + sh * 0.55 + 14);
    }
    if (obj === "wheel") {
      const wx = xob - 20 + wheelX * (xs - xob - 10) + 12, R = 12;
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(xn - 10, cy + R + 1); ctx.lineTo(xs - 6, cy + R + 1); ctx.stroke();
      ctx.strokeStyle = "#a9873a"; ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) { const a = wheelA + i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(wx, cy); ctx.lineTo(wx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke(); }
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.fillText("바람개비 →", wx, cy + R + 16);
    }
    // 화면 정면 (오른쪽)
    const fx = (xs + w) / 2 + 4, fr = Math.min((w - xs) / 2 - 10, h * 0.36), fs = fr / 45;
    ctx.fillStyle = "#14201a"; ctx.beginPath(); ctx.arc(fx, cy, fr, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(fx, cy, fr, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = "rgba(180,220,180,0.25)"; ctx.lineWidth = 1;
    for (let m = -40; m <= 40; m += 10) { ctx.beginPath(); ctx.moveTo(fx - fr, cy - m * fs); ctx.lineTo(fx + fr, cy - m * fs); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(fx, cy - fr); ctx.lineTo(fx, cy + fr); ctx.stroke();
    const py = cy - y * fs;
    if (obj === "cross") {
      ctx.fillStyle = "rgba(110,230,110,0.55)"; ctx.beginPath(); ctx.arc(fx, py, 30 * fs, 0, Math.PI * 2); ctx.fill();
      const f = (xs - xa) / (xob - xa), a = 4 * fs * f, b = 14 * fs * f;
      ctx.fillStyle = "#14201a"; ctx.fillRect(fx - a, py - b, 2 * a, 2 * b); ctx.fillRect(fx - b, py - a, 2 * b, 2 * a);
    } else if (obj === "none" && Math.abs(y) <= YMAX) {
      const g = ctx.createRadialGradient(fx, py, 0, fx, py, 5);
      g.addColorStop(0, "rgba(190,255,190,1)"); g.addColorStop(1, "rgba(90,220,90,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx, py, 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(fx, cy, fr, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("화면 정면 (눈금 10 mm)", fx, cy + fr + 16);
    if (obj === "none" && Math.abs(y) > YMAX) { ctx.fillStyle = C.warn; ctx.fillText("점이 화면 밖", fx, cy - fr - 8); }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const useE = xKey === "vd" || xKey === "vdva";
    const rows = tbl.rows.filter((r) => Number.isFinite(r.y) && (useE ? r.I === 0 : r.Vd === 0));
    const xv = { vd: (r) => r.Vd, vdva: (r) => r.Vd / (r.Va * 1000), ic: (r) => r.I, icva: (r) => r.I / Math.sqrt(r.Va * 1000) }[xKey];
    const pts = rows.map((r) => ({ x: xv(r), y: r.y, ey: 0.5 }));
    const f = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y)) : null;
    const lab = { vd: "Vd (V)", vdva: "Vd/Va", ic: "I (A)", icva: "I/√Va (A/√V)" }[xKey];
    const xr = { vd: [-200, 200], vdva: [-0.1, 0.1], ic: [-1, 1], icva: [-0.03, 0.03] }[xKey];
    L.plot(ctx, { x0: 44, y0: 18, w: w - 58, h: h - 52 }, { pts, fit: f, xr, yr: [-45, 45], xlabel: lab, ylabel: "y (mm)" });
    if (f) {
      ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
      const sl = xKey === "vdva" ? `기울기 ${(f.a / 1000).toFixed(3)} m (이론 lD/2d = 0.300 m)` : `기울기 ${f.a.toPrecision(3)} mm/${{ vd: "V", ic: "A", icva: "(A/√V)" }[xKey]}`;
      ctx.fillText(sl, 52, 32); ctx.fillText(`절편 ${f.b.toFixed(1)} mm`, 52, 47);
    }
  }

  const refresh = () => {
    reading = read(yNow());
    $(".n-y").textContent = obj === "wheel" ? "—" : Number.isFinite(reading) ? (reading > 0 ? "+" : "") + reading.toFixed(0) + " mm" : "화면 밖";
  };
  const upd = () => {
    $(".va-out").textContent = (+sVa.value).toFixed(1); $(".vd-out").textContent = sVd.value; $(".ic-out").textContent = (+sI.value).toFixed(2);
    $(".n-e").textContent = (+sVd.value / d / 1000).toFixed(1) + " kV/m";
    $(".n-b").textContent = (KB * +sI.value * 1000).toFixed(3) + " mT";
    refresh(); drawApp();
  };
  loop($(".cv-wide"), (dt) => {
    tick += dt; if (tick > 0.6) { tick = 0; refresh(); }
    if (obj === "wheel" && wheelX < 1) { const s = 0.04 * Math.sqrt(+sVa.value); wheelX = Math.min(1, wheelX + s * dt); wheelA += s * dt * 25; }
    drawApp();
  });
  [sVa, sVd, sI, cE].forEach((el) => el.addEventListener("input", upd));
  $(".meas").addEventListener("click", () => {
    if (obj === "wheel") return;
    refresh(); if (!Number.isFinite(reading)) return;
    tbl.add({ Va: +sVa.value, Vd: +sVd.value, I: +sI.value, y: reading });
  });
  $(".zero").addEventListener("click", () => { sVd.value = 0; sI.value = 0; upd(); });
  $(".clear").addEventListener("click", () => tbl.clear());
  $(".osel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-o]"); if (!b) return;
    obj = b.dataset.o; wheelX = 0; root.querySelectorAll("[data-o]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    $(".meas").disabled = obj === "wheel"; upd();
  });
  $(".xsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-x]"); if (!b) return;
    xKey = b.dataset.x; root.querySelectorAll("[data-x]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  upd();
  if (L.demo) {
    const rec = (Va, Vd, I) => tbl.add({ Va, Vd, I, y: read(yTrue(Va, Vd, I, true)) });
    [-150, -100, -50, 0, 50, 100, 150].forEach((v) => rec(2, v, 0));
    [100, 150, 200].forEach((v) => { rec(3, v, 0); rec(4, v, 0); });
    [-0.6, -0.3, 0.3, 0.6].forEach((i) => rec(2, 0, i));
    sVd.value = 100; sI.value = 0.75; upd();
    root.querySelector('[data-x="vdva"]').click();
  }
})();
