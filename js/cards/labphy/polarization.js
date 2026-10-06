/* 카드: 편광판을 돌리면 빛의 세기는 어떤 규칙으로 줄어들까? — 말뤼스 법칙 cos²θ 직선, 편광판 3장, 유리 반사광과 브루스터 각 */
(() => {
  const root = document.getElementById("card-labphy-polarization");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sT = $(".t"), sP = $(".p"), sI = $(".i"), cA = $(".amb");
  const D = Math.PI / 180, LAMP = 2000, K1 = 0.8, K2 = 0.001, NG = 1.52;   // 광원 조도(예시), 편광판 주투과율, 유리 굴절률
  const NAME = { two: "2장", three: "3장", refl: "반사" };
  let mode = "two";
  const T = (deg) => { const c = Math.cos(deg * D) ** 2; return K1 * c + K2 * (1 - c); };
  function fresnel(iDeg) {
    const i = iDeg * D, r = Math.asin(Math.sin(i) / NG), ci = Math.cos(i), cr = Math.cos(r);
    const rs = (ci - NG * cr) / (ci + NG * cr), rp = (NG * ci - cr) / (NG * ci + cr);
    return { Rs: rs * rs, Rp: rp * rp };
  }
  const bg = () => (cA.checked ? 35 : 2);
  function Itrue() {
    const th = +sT.value, ph = +sP.value;
    if (mode === "two") return LAMP * (K1 + K2) / 2 * T(th) + bg();
    if (mode === "three") return LAMP * (K1 + K2) / 2 * T(ph) * T(th - ph) + bg();
    const { Rs, Rp } = fresnel(+sI.value);
    return LAMP / 2 * (Rs * T(th) + Rp * T(90 - th)) + bg();
  }
  const tbl = L.table($(".tbl-host"), [{ key: "mn", label: "실험" }, { key: "th", label: "θ (°)", res: 1 }, { key: "ph", label: "φ (°)", res: 1 }, { key: "i", label: "i (°)", res: 1 }, { key: "I", label: "I (lx)", res: 1 }], () => drawPlot());
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());

  function disc(ctx, x, y, r, deg, label) {
    ctx.fillStyle = "rgba(90,90,100,.12)"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const dx = Math.sin(deg * D) * r * 0.85, dy = -Math.cos(deg * D) * r * 0.85;
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - dx, y - dy); ctx.lineTo(x + dx, y + dy); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(label, x, y + r + 14);
  }
  function meter(ctx, x, y, val) {
    ctx.fillStyle = C.ink; ctx.fillRect(x - 34, y - 20, 68, 40); ctx.fillStyle = "#cfe3c4"; ctx.fillRect(x - 28, y - 14, 56, 20);
    ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(String(val), x + 24, y + 1);
    ctx.fillStyle = "#fff"; ctx.font = `9px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("lx", x, y + 16);
  }
  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const I = Math.round(Itrue()), y = h * 0.45, r = Math.min(30, h * 0.14), beam = (x1, y1, x2, y2, s) => { ctx.strokeStyle = `rgba(224,160,42,${Math.max(0.06, Math.min(0.9, s))})`; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
    if (mode !== "refl") {
      const xs = mode === "two" ? [w * 0.1, w * 0.36, w * 0.62, w * 0.86] : [w * 0.08, w * 0.3, w * 0.48, w * 0.66, w * 0.87];
      const I1 = (K1 + K2) / 2, I2 = mode === "three" ? I1 * T(+sP.value) : I1, I3 = (I - bg()) / LAMP;
      const lv = mode === "two" ? [1, I1, I3] : [1, I1, I2, I3];
      for (let k = 0; k < xs.length - 1; k++) beam(xs[k] + (k ? r : 14), y, xs[k + 1] - r, y, lv[k] * 1.1);
      ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(xs[0], y, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("광원", xs[0], y + r + 14);
      disc(ctx, xs[1], y, r, 0, "P₁ 0°");
      if (mode === "three") disc(ctx, xs[2], y, r, +sP.value, `가운데 ${sP.value}°`);
      disc(ctx, xs[xs.length - 2], y, r, +sT.value, `검광판 ${sT.value}°`);
      meter(ctx, xs[xs.length - 1], y, I);
    } else {
      const cx = w * 0.4, yp = h * 0.82, Rr = Math.min(h * 0.62, w * 0.3), i = +sI.value * D;
      ctx.fillStyle = "rgba(110,164,230,.35)"; ctx.fillRect(cx - 70, yp, 140, 8); ctx.fillStyle = C.ink; ctx.fillRect(cx - 70, yp + 8, 140, 3);
      ctx.setLineDash([3, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, yp); ctx.lineTo(cx, yp - Rr * 0.6); ctx.stroke(); ctx.setLineDash([]);
      const sx = cx - Rr * Math.sin(i), sy = yp - Rr * Math.cos(i), ax = cx + Rr * 0.62 * Math.sin(i), ay = yp - Rr * 0.62 * Math.cos(i), mx = cx + Rr * 1.05 * Math.sin(i), my = yp - Rr * 1.05 * Math.cos(i);
      const { Rs, Rp } = fresnel(+sI.value);
      beam(sx, sy, cx, yp, 1); beam(cx, yp, ax, ay, (Rs + Rp) * 3); beam(ax, ay, mx, my, (I - bg()) / LAMP * 6);
      ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(sx, sy, 13, 0, Math.PI * 2); ctx.fill();
      disc(ctx, ax, ay, r * 0.8, +sT.value, `검광판 ${sT.value}°`);
      meter(ctx, Math.min(w - 40, mx + 20), Math.max(24, my - 10), I);
      ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(`i = ${sI.value}°`, cx - 26, yp - 14);
      ctx.font = `10px ${F.sans}`; ctx.fillText("검은 종이를 댄 유리판", cx, yp + 24);
    }
    $(".n-i").textContent = `${I} lx`;
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows.filter((r) => r.m === mode), box = { x0: 48, y0: 18, w: w - 62, h: h - 52 };
    const two = tbl.rows.filter((r) => r.m === "two"), f2 = two.length > 1 ? L.linfit(two.map((r) => Math.cos(r.th * D) ** 2), two.map((r) => r.I)) : null;
    const d2 = $(".d2"), d3 = $(".d3"), n2 = $(".n-2"), n3 = $(".n-3");
    if (mode === "two") {
      L.plot(ctx, box, { pts: rows.map((r) => ({ x: Math.cos(r.th * D) ** 2, y: r.I })), fit: f2, xr: [0, 1], yr: [0, 720], xlabel: "cos²θ", ylabel: "I (lx)" });
      d2.textContent = "기울기 → I₀"; n2.textContent = f2 ? `${f2.a.toFixed(0)} lx` : "점 2개 이상";
      d3.textContent = "절편 → 배경 빛"; n3.textContent = f2 ? `${f2.b.toFixed(0)} lx` : "—";
    } else if (mode === "three") {
      const model = f2 ? (x) => f2.a / 4 * Math.sin(2 * x * D) ** 2 + f2.b : null;
      L.plot(ctx, box, { pts: rows.map((r) => ({ x: r.ph, y: r.I })), model, xr: [0, 90], yr: [0, 200], xlabel: "가운데 판 φ (°) · 검광판 90°", ylabel: "I (lx)" });
      const top = rows.reduce((b, r) => (!b || r.I > b.I ? r : b), null);
      d2.textContent = "가장 밝았던 φ"; n2.textContent = top ? `${top.ph}°` : "—";
      d3.textContent = "점선 (2장 I₀로 예측)"; n3.textContent = f2 ? "I₀/4 · sin²2φ" : "2장 기록 먼저";
    } else {
      L.plot(ctx, box, { pts: rows.map((r) => ({ x: r.i, y: r.I })), xr: [20, 90], xlabel: "입사각 i (°)", ylabel: "I (lx) · 반사광" });
      const low = rows.filter((r) => r.th === 90).reduce((b, r) => (!b || r.I < b.I ? r : b), null);
      d2.textContent = "θ=90°에서 가장 어두운 i"; n2.textContent = low ? `${low.i}°` : "—";
      d3.textContent = "tan i → 굴절률"; n3.textContent = low ? Math.tan(low.i * D).toFixed(2) : "—";
    }
  }

  function record() {
    const I = Math.max(0, L.measure(Itrue(), { sd: 0.8, rel: 0.01, res: 1 }));
    tbl.add({ m: mode, mn: NAME[mode], th: +sT.value, ph: mode === "three" ? +sP.value : "—", i: mode === "refl" ? +sI.value : "—", I });
  }
  const show = () => { $(".row-phi").style.display = mode === "three" ? "" : "none"; $(".row-i").style.display = mode === "refl" ? "" : "none"; };
  const upd = () => { $(".t-out").textContent = sT.value; $(".p-out").textContent = sP.value; $(".i-out").textContent = sI.value; draw(); };
  [sT, sP, sI].forEach((el) => el.addEventListener("input", upd));
  cA.addEventListener("change", upd);
  $(".rec").addEventListener("click", record);
  $(".clear").addEventListener("click", () => tbl.clear());
  $(".psel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-p]"); if (!b) return;
    mode = b.dataset.p; root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    if (mode !== "two") sT.value = 90;
    show(); upd(); drawPlot();
  });
  show(); upd();
  if (L.demo) {
    for (let t = 0; t <= 180; t += 15) { sT.value = t; record(); }
    mode = "three"; sT.value = 90; for (let p = 0; p <= 90; p += 15) { sP.value = p; record(); }
    mode = "refl"; for (let a = 30; a <= 80; a += 5) { sI.value = a; record(); } sI.value = 57; record();
    root.querySelector('[data-p="two"]').click(); sT.value = 30; upd();
  }
})();
