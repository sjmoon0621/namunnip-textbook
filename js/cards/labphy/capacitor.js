/* 카드: 포일·종이 평행판 축전기 — 장수(d)와 넓이(A)를 바꿔 용량 측정, C–1/d·C–A 직선 맞춤으로 비유전율 구하기 */
(() => {
  const root = document.getElementById("card-labphy-capacitor");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sN = $(".n"), sS = $(".s");
  const E0 = 8.854e-12, T = 0.100e-3, CLEAD = 22e-12;
  const DIEL = { paper: { er: 2.6, name: "복사 용지", col: "#f4f1e6" }, pet: { er: 3.1, name: "OHP 필름", col: "#d9e9f2" } };
  let diel = "paper", pressed = true, mode = "d", last = null;

  /* 참값 (F). 공기 틈 g는 직렬로 더해지고, 가장자리 효과는 같은 넓이 원판의 키르히호프 근사로 더한다 */
  function capTrue(n, s, gap) {
    const A = (s / 100) ** 2, d = n * T, R = (s / 100) / Math.sqrt(Math.PI);
    const main = E0 * A / (d / DIEL[diel].er + gap);
    const edge = E0 * R * (Math.log(16 * Math.PI * R / d) - 1);
    return main + edge + CLEAD;
  }
  const gapNow = () => Math.max(0.0005e-3, (pressed ? 0.0015e-3 : 0.020e-3) * (1 + 0.35 * L.gauss()));
  function meter(c) {
    const nF = c * 1e9, res = nF < 2 ? 0.001 : nF < 20 ? 0.01 : 0.1;
    return L.measure(nF, { rel: 0.004, res });
  }

  const tbl = L.table($(".tbl-host"), [{ key: "dn", label: "유전체" }, { key: "n", label: "n (장)", res: 1 }, { key: "d", label: "d (mm)", res: 0.01 }, { key: "A", label: "A (cm²)", res: 1 }, { key: "c", label: "C (nF)", res: 0.001 }], () => { drawPlot(); });
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sN.value, s = +sS.value;
    // 위 모습: 종이(34 cm)와 포일(s cm)
    const box = Math.min(h - 40, w * 0.42), k = box / 34, cx = 14 + box / 2, cy = 16 + box / 2;
    ctx.fillStyle = DIEL[diel].col; ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    ctx.fillRect(cx - 16 * k, cy - 16 * k, 32 * k, 32 * k); ctx.strokeRect(cx - 16 * k, cy - 16 * k, 32 * k, 32 * k);
    const g = ctx.createLinearGradient(cx - s / 2 * k, cy - s / 2 * k, cx + s / 2 * k, cy + s / 2 * k);
    g.addColorStop(0, "#d8dadc"); g.addColorStop(0.5, "#f3f4f5"); g.addColorStop(1, "#babec2");
    ctx.fillStyle = g; ctx.fillRect(cx - s / 2 * k, cy - s / 2 * k, s * k, s * k); ctx.strokeStyle = "#8f959a"; ctx.strokeRect(cx - s / 2 * k, cy - s / 2 * k, s * k, s * k);
    ctx.strokeStyle = "rgba(120,125,130,.35)"; ctx.beginPath();
    for (let i = 1; i < 4; i++) { const x = cx - s / 2 * k + s * k * i / 4; ctx.moveTo(x, cy - s / 2 * k); ctx.lineTo(x + 6, cy + s / 2 * k); }
    ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(`위에서 본 모습 · 포일 ${s} cm × ${s} cm`, cx, cy + 16 * k + 14);

    // 단면 (두께 과장)
    const x0 = 14 + box + 26, x1 = w - 12, sy = 26, lay = Math.min(9, 70 / n);
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3; ctx.fillText("옆에서 본 단면 (두께 과장)", x0, sy - 10);
    let y = sy;
    if (pressed) { ctx.fillStyle = "#7d5a44"; ctx.fillRect(x0 + 18, y, x1 - x0 - 36, 14); ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.fillText("책", (x0 + x1) / 2, y + 11); y += 16; }
    const air = pressed ? 0 : 2;
    ctx.fillStyle = "#b9bec3"; ctx.fillRect(x0 + 6, y, x1 - x0 - 12, 3); y += 3 + air;
    for (let i = 0; i < n; i++) { ctx.fillStyle = DIEL[diel].col; ctx.strokeStyle = C.ink3; ctx.fillRect(x0, y, x1 - x0, lay - 1); ctx.strokeRect(x0 + 0.5, y + 0.5, x1 - x0 - 1, lay - 2); y += lay + (pressed ? 0 : 0.6); }
    y += air; ctx.fillStyle = "#b9bec3"; ctx.fillRect(x0 + 6, y, x1 - x0 - 12, 3); y += 3;
    ctx.strokeStyle = C.apple; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0 + 8, sy + (pressed ? 17 : 1)); ctx.lineTo(x0 - 6, sy + 40); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(x1 - 8, y - 1); ctx.lineTo(x1 - 2, y + 18); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText(`d = ${n} × 0.100 mm = ${(n * 0.1).toFixed(1)} mm`, x0, y + 16);

    // 전기 용량계
    const mw = Math.min(150, x1 - x0), mx = x1 - mw, my = h - 58;
    ctx.fillStyle = "#e9c63c"; ctx.fillRect(mx, my, mw, 50); ctx.strokeStyle = "#a88a17"; ctx.strokeRect(mx + 0.5, my + 0.5, mw - 1, 49);
    ctx.fillStyle = "#c7d3b8"; ctx.fillRect(mx + 8, my + 8, mw - 16, 26);
    ctx.fillStyle = "#1d2a14"; ctx.font = `600 16px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillText(last == null ? "- - -" : `${L.fmt(last, last < 2 ? 0.001 : last < 20 ? 0.01 : 0.1)} nF`, mx + mw - 14, my + 27);
    ctx.fillStyle = "#3f3410"; ctx.font = `9px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("CAPACITANCE", mx + 8, my + 45);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sN.value, s = +sS.value, A = s * s;
    const rows = tbl.rows.filter((r) => r.dn === DIEL[diel].name && (mode === "d" ? r.A === A : r.n === n));
    const pts = rows.map((r) => ({ x: mode === "d" ? 1 / r.d : r.A, y: r.c }));
    const ft = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y)) : null;
    L.plot(ctx, { x0: 46, y0: 18, w: w - 60, h: h - 52 }, { pts, fit: ft, xr: mode === "d" ? [0, 10.5] : [0, 1000], xlabel: mode === "d" ? `1/d (1/mm) · A = ${A} cm²` : `A (cm²) · n = ${n}장`, ylabel: "C (nF)" });
    if (!ft) { ["n-a", "n-b", "n-e"].forEach((c) => ($("." + c).textContent = "—")); $(".n-e").textContent = "같은 조건 점 2개 이상"; return; }
    let eps;
    if (mode === "d") { $(".n-a").textContent = `${ft.a.toFixed(3)} nF·mm`; eps = ft.a * 1e-9 * 1e-3 / (A * 1e-4); }
    else { $(".n-a").textContent = `${(ft.a * 1000).toFixed(2)} pF/cm²`; eps = ft.a * 1e-9 / 1e-4 * (n * T); }
    $(".n-b").textContent = `${ft.b.toFixed(3)} nF`;
    $(".n-e").textContent = `${(eps / E0).toFixed(2)} ± ${(eps / E0 * ft.sa / Math.abs(ft.a)).toFixed(2)}`;
  }

  function record(n, s) {
    const c = meter(capTrue(n, s, gapNow())); last = c;
    tbl.add({ dn: DIEL[diel].name, n, d: n * 0.1, A: s * s, c });
  }
  const upd = () => { $(".n-out").textContent = sN.value; $(".s-out").textContent = sS.value; draw(); drawPlot(); };
  [sN, sS].forEach((el) => el.addEventListener("input", () => { last = null; upd(); }));
  $(".rec").addEventListener("click", () => { record(+sN.value, +sS.value); draw(); });
  $(".clear").addEventListener("click", () => { tbl.clear(); last = null; draw(); });
  $(".press").addEventListener("click", (e) => { pressed = !pressed; e.currentTarget.setAttribute("aria-pressed", String(pressed)); last = null; draw(); });
  root.querySelectorAll(".diel [data-d]").forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll(".diel [data-d]").forEach((o) => o.setAttribute("aria-pressed", String(o === b))); diel = b.dataset.d; last = null; upd();
  }));
  root.querySelectorAll(".diel [data-m]").forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll(".diel [data-m]").forEach((o) => o.setAttribute("aria-pressed", String(o === b))); mode = b.dataset.m; drawPlot();
  }));
  upd();
  if (L.demo) {
    [1, 2, 3, 4, 5, 6, 8].forEach((n) => record(n, 20));
    [10, 15, 25, 30].forEach((s) => record(2, s));
    sN.value = 2; sS.value = 20; record(2, 20); upd();
  }
})();
