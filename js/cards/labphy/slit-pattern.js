/* 카드: 줄무늬 간격과 밝기 봉우리의 폭은 각각 무엇이 정할까? — 단일 슬릿 포락선 × 이중 슬릿 줄무늬, W–1/a와 Δx–1/d */
(() => {
  const root = document.getElementById("card-labphy-slit-pattern");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const LAS = { r: { lam: 655e-6, rgb: [255, 50, 40], ink: C.apple, name: "빨강" }, g: { lam: 532e-6, rgb: [70, 255, 90], ink: C.forest, name: "초록" }, v: { lam: 405e-6, rgb: [150, 90, 255], ink: "#6a4fc9", name: "보라" } };
  const LS = 1500, HALF = 55;   // 슬릿–스크린 거리, 보기 반폭 (mm)
  let col = "r", a = 0.04, d = 0.25, xKey = "a";
  const tbl = L.table($(".tbl-host"), [{ key: "cn", label: "색" }, { key: "a", label: "a (mm)", res: 0.001 }, { key: "dd", label: "d (mm)", res: 0.01 }, { key: "W", label: "W (mm)", res: 1 }, { key: "N", label: "N", res: 1 }, { key: "dx", label: "Δx (mm)", res: 0.01 }], () => drawPlot());
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());
  const env = (x) => { const u = Math.PI * a * x / (LAS[col].lam * LS); return u ? (Math.sin(u) / u) ** 2 : 1; };
  const inten = (x) => d ? env(x) * Math.cos(Math.PI * d * x / (LAS[col].lam * LS)) ** 2 : env(x);

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const [R, G, B] = LAS[col].rgb, bx = 34, bw = w - 48, by = 18, bh = h * 0.2, X = (mm) => bx + (mm + HALF) / (2 * HALF) * bw;
    ctx.fillStyle = "#111"; ctx.fillRect(bx, by, bw, bh);
    for (let px = 0; px < bw; px++) { const I = inten((px + 0.5) / bw * 2 * HALF - HALF); ctx.fillStyle = `rgba(${R},${G},${B},${Math.min(1, Math.pow(I, 0.6) * 1.05)})`; ctx.fillRect(bx + px, by, 1, bh); }
    const ry = by + bh + 2; ctx.fillStyle = "#f4ecd2"; ctx.fillRect(bx, ry, bw, 22); ctx.fillStyle = C.ink2; ctx.font = `9px ${F.mono}`; ctx.textAlign = "center";
    for (let mm = -HALF; mm <= HALF; mm++) { const x = Math.round(X(mm)) + 0.5, len = mm % 10 === 0 ? 10 : mm % 5 === 0 ? 7 : 4; ctx.fillRect(x - 0.5, ry, 1, len); if (mm % 20 === 0) ctx.fillText(mm, x, ry + 20); }
    // 세기 분포
    const gy = ry + 40, gh = h - gy - 22;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx, gy + gh); ctx.lineTo(bx + bw, gy + gh); ctx.moveTo(bx, gy); ctx.lineTo(bx, gy + gh); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("x (mm)", bx + bw, gy + gh + 14); ctx.textAlign = "left"; ctx.fillText("세기 (상대값)", bx + 4, gy - 4);
    const curve = (f, style, dash, lw) => { ctx.strokeStyle = style; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); for (let px = 0; px <= bw; px++) { const y = gy + gh - f((px / bw) * 2 * HALF - HALF) * gh * 0.95; px ? ctx.lineTo(bx + px, y) : ctx.moveTo(bx + px, y); } ctx.stroke(); ctx.setLineDash([]); };
    curve(env, C.ink3, [4, 3], 1.2); curve(inten, LAS[col].ink, [], 1.4);
    // 첫 어두운 곳 표시
    const xm = LAS[col].lam * LS / a;
    if (xm < HALF) { ctx.strokeStyle = C.warn; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); [-xm, xm].forEach((v) => { ctx.beginPath(); ctx.moveTo(X(v), by); ctx.lineTo(X(v), gy + gh); ctx.stroke(); }); ctx.setLineDash([]); ctx.fillStyle = C.warn; ctx.textAlign = "center"; ctx.fillText("W", X(0), gy + gh + 14); ctx.beginPath(); ctx.moveTo(X(-xm), gy + gh + 4); ctx.lineTo(X(xm), gy + gh + 4); ctx.stroke(); }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows.filter((r) => r.c === col && (xKey === "a" || typeof r.dx === "number"));
    const pts = rows.map((r) => (xKey === "a" ? { x: 1 / r.a, y: r.W } : { x: 1 / r.dd, y: r.dx }));
    const ft = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y), true) : null;
    L.plot(ctx, { x0: 44, y0: 18, w: w - 58, h: h - 52 }, xKey === "a"
      ? { pts, fit: ft, xr: [0, 55], yr: [0, 110], xlabel: "1/a (1/mm)", ylabel: `W (mm) · ${LAS[col].name} 기록만`, color: LAS[col].ink }
      : { pts, fit: ft, xr: [0, 4.5], yr: [0, 4.5], xlabel: "1/d (1/mm)", ylabel: `Δx (mm) · ${LAS[col].name} 기록만`, color: LAS[col].ink });
    $(".n-l").textContent = ft ? `${(ft.a / (xKey === "a" ? 2 * LS : LS) * 1e6).toFixed(0)} nm` : "점 2개 이상";
  }

  function record() {
    const lam = LAS[col].lam, Wt = 2 * lam * LS / a;
    const W = Wt < 2 * HALF ? L.measure(Wt, { sd: 1.0, rel: 0.02, res: 1 }) : "범위 밖";
    let N = "—", dx = "—";
    if (d) { const dxt = lam * LS / d; N = Math.max(1, Math.min(10, 2 * Math.floor(Math.min(HALF - 2, 0.85 * Wt / 2) / dxt))); dx = L.measure(N * dxt, { sd: 0.5, res: 1 }) / N; }
    tbl.add({ c: col, cn: LAS[col].name, a, dd: d || "단일", W, N, dx });
    $(".n-w").textContent = typeof W === "number" ? `${W} mm` : W; $(".n-x").textContent = typeof dx === "number" ? `${dx.toFixed(2)} mm` : "—";
  }
  const pick = (sel, attr, set) => $(sel).addEventListener("click", (e) => {
    const b = e.target.closest(`[data-${attr}]`); if (!b) return;
    set(b.dataset[attr]); root.querySelectorAll(`[data-${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); drawPlot();
  });
  pick(".csel", "c", (v) => { col = v; }); pick(".asel", "a", (v) => { a = +v; }); pick(".dsel", "d", (v) => { d = +v; }); pick(".xsel", "x", (v) => { xKey = v; });
  $(".rec").addEventListener("click", record);
  $(".clear").addEventListener("click", () => tbl.clear());
  draw();
  if (L.demo) {
    [[0.02, 0.25], [0.04, 0.25], [0.08, 0.25], [0.125, 0.25], [0.04, 0], [0.04, 0.5], [0.02, 0.5], [0.08, 0.5]].forEach(([aa, dd]) => { a = aa; d = dd; record(); });
    root.querySelector('[data-d="0.25"]').click(); root.querySelector('[data-a="0.125"]').click();
  }
})();
