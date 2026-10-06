/* 카드: 자와 줄자만으로 빛의 파장을 잴 수 있을까? — 이중 슬릿, N칸 길이로 Δx, L/d–Δx 직선 */
(() => {
  const root = document.getElementById("card-labphy-double-slit");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sL = $(".l");
  const LAS = { r: { lam: 655e-6, rgb: [255, 50, 40], name: "빨강" }, g: { lam: 532e-6, rgb: [70, 255, 90], name: "초록" } };   // 파장 (mm)
  const A = 0.04, HALF = 40;   // 슬릿 폭, 스크린 보기 반폭 (mm)
  let col = "r", d = 0.25, last = null;
  const tbl = L.table($(".tbl-host"), [{ key: "cn", label: "색" }, { key: "d", label: "d (mm)", res: 0.001 }, { key: "L", label: "L (m)", res: 0.005 }, { key: "N", label: "N", res: 1 }, { key: "X", label: "N칸 (mm)", res: 1 }, { key: "dx", label: "Δx (mm)", res: 0.01 }, { key: "lam", label: "λ (nm)", res: 1 }], () => drawPlot());
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());
  const dxTrue = () => LAS[col].lam * (+sL.value * 1000) / d;
  const inten = (x) => { const lam = LAS[col].lam, Lm = +sL.value * 1000, u = Math.PI * A * x / (lam * Lm), c = Math.cos(Math.PI * d * x / (lam * Lm)); const s = u ? Math.sin(u) / u : 1; return c * c * s * s; };
  const nCount = () => { const dx = dxTrue(), env = LAS[col].lam * (+sL.value * 1000) / A; return Math.max(1, Math.min(10, 2 * Math.floor(Math.min(HALF - 2, 0.85 * env) / dx))); };

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const Lv = +sL.value, [R, G, B] = LAS[col].rgb;
    // 배치도
    const yb = h * 0.24, x0 = 24, xs = 96, xe = xs + (w - 40 - xs) * Lv / 3;
    ctx.fillStyle = C.ink; ctx.fillRect(x0, yb - 7, 40, 14);
    ctx.strokeStyle = `rgba(${R},${G},${B},.9)`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 + 40, yb); ctx.lineTo(xs, yb); ctx.stroke();
    ctx.strokeStyle = `rgba(${R},${G},${B},.35)`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(xs, yb); ctx.lineTo(xe, yb - 24); ctx.moveTo(xs, yb); ctx.lineTo(xe, yb + 24); ctx.moveTo(xs, yb); ctx.lineTo(xe, yb); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.fillRect(xs - 2, yb - 22, 4, 18); ctx.fillRect(xs - 2, yb + 4, 4, 18); ctx.fillRect(xs - 2, yb - 2, 4, 1.5); ctx.fillRect(xs - 2, yb + 0.5, 4, 1.5);
    ctx.fillStyle = "#fff"; ctx.strokeStyle = C.ink2; ctx.fillRect(xe - 2, yb - 34, 4, 68); ctx.strokeRect(xe - 2, yb - 34, 4, 68);
    ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(xs, yb + 44); ctx.lineTo(xe, yb + 44); ctx.moveTo(xs, yb + 40); ctx.lineTo(xs, yb + 48); ctx.moveTo(xe, yb + 40); ctx.lineTo(xe, yb + 48); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(`L = ${Lv.toFixed(2)} m`, (xs + xe) / 2, yb + 60);
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.fillText("레이저", x0 + 20, yb - 13); ctx.fillText("이중 슬릿", xs, yb - 28);
    ctx.textAlign = "right"; ctx.fillText("스크린", Math.min(w - 6, xe + 18), yb - 40);
    // 스크린 무늬 (확대)
    const bx = 20, bw = w - 40, by = h * 0.58, bh = h * 0.16, X = (mm) => bx + (mm + HALF) / (2 * HALF) * bw;
    ctx.fillStyle = "#111"; ctx.fillRect(bx, by, bw, bh);
    for (let px = 0; px < bw; px++) { const mm = (px + 0.5) / bw * 2 * HALF - HALF, I = inten(mm); ctx.fillStyle = `rgba(${R},${G},${B},${Math.min(1, Math.pow(I, 0.7) * 1.05)})`; ctx.fillRect(bx + px, by, 1, bh); }
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("스크린에 보이는 무늬 (확대)", bx, by - 6);
    // 자
    const ry = by + bh + 2; ctx.fillStyle = "#f4ecd2"; ctx.fillRect(bx, ry, bw, 22); ctx.fillStyle = C.ink2; ctx.font = `9px ${F.mono}`; ctx.textAlign = "center";
    for (let mm = -HALF; mm <= HALF; mm++) { const x = Math.round(X(mm)) + 0.5, len = mm % 10 === 0 ? 10 : mm % 5 === 0 ? 7 : 4; ctx.fillRect(x - 0.5, ry, 1, len); if (mm % 10 === 0) ctx.fillText(mm, x, ry + 20); }
    ctx.textAlign = "right"; ctx.fillText("mm", bx + bw, ry + 34);
    // 직전 측정 구간 표시
    if (last && last.c === col && last.d === d && last.L === Lv) {
      const x1 = X(-last.N / 2 * dxTrue()), x2 = X(last.N / 2 * dxTrue());
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x1, by - 2); ctx.lineTo(x1, by + bh + 6); ctx.moveTo(x2, by - 2); ctx.lineTo(x2, by + bh + 6); ctx.stroke();
      ctx.fillStyle = C.warn; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(`${last.N}칸 = ${last.X} mm`, bx + bw, by - 6);
    }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows.filter((r) => r.c === col), pts = rows.map((r) => ({ x: r.L / r.d, y: r.dx }));
    const ft = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y), true) : null;
    L.plot(ctx, { x0: 44, y0: 18, w: w - 58, h: h - 52 }, { pts, fit: ft, xr: [0, 26], yr: [0, 18], xlabel: "L/d (×10³)", ylabel: `Δx (mm) · ${LAS[col].name} 기록만`, color: col === "g" ? C.forest : C.apple });
    $(".n-l").textContent = ft ? `${(ft.a * 1000).toFixed(0)} ± ${(ft.sa * 1000).toFixed(0)} nm` : "점 2개 이상";
    const st = L.stats(rows.map((r) => r.lam));
    $(".n-m").textContent = st.n ? `${st.mean.toFixed(0)} nm` : "—";
  }

  function record() {
    const Lv = +sL.value, N = nCount(), Lm = L.measure(Lv, { sd: 0.003, res: 0.005 });
    const X = L.measure(N * dxTrue(), { sd: 0.5, res: 1 }), dx = X / N;
    last = { c: col, d, L: Lv, N, X };
    tbl.add({ c: col, cn: LAS[col].name, d, L: Lm, N, X, dx, lam: d * dx / (Lm * 1000) * 1e6 });
    $(".n-x").textContent = `${dx.toFixed(2)} mm`; draw();
  }
  const pick = (sel, attr, set) => $(sel).addEventListener("click", (e) => {
    const b = e.target.closest(`[data-${attr}]`); if (!b) return;
    set(b.dataset[attr]); root.querySelectorAll(`[data-${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); drawPlot();
  });
  pick(".csel", "c", (v) => { col = v; }); pick(".dsel", "d", (v) => { d = +v; });
  const upd = () => { $(".l-out").textContent = (+sL.value).toFixed(2); draw(); };
  sL.addEventListener("input", upd);
  $(".rec").addEventListener("click", record);
  $(".clear").addEventListener("click", () => { tbl.clear(); last = null; draw(); });
  upd();
  if (L.demo) {
    [["g", 0.25, 2], ["g", 0.5, 3], ["r", 0.5, 1], ["r", 0.5, 2], ["r", 0.5, 3], ["r", 0.25, 1.5], ["r", 0.25, 2.5], ["r", 0.125, 1], ["r", 0.125, 2]].forEach(([c, dd, l]) => { col = c; d = dd; sL.value = l; record(); });
    root.querySelector('[data-d="0.125"]').click(); upd();
  }
})();
