/* 카드: 원형질 분리 — 양파 표피 세포, 농도별 분리 비율 세기, 50% 분리 농도, 원형질 복귀 */
(() => {
  const root = document.getElementById("card-labbio-plasmolysis");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const TAU = Math.PI * 2, I = { suc: 1, nacl: 1.8 }, UN = { suc: "설탕", nacl: "NaCl" };
  const COLS = 5, ROWS = 12, B = 0.12;   // B: 물이 드나들어도 변하지 않는 부피 비율
  let solute = "suc", ext = 0, slideConc = null, slideSol = "suc", t = 0, running = false, washed = false, cells = [];
  const tbl = L.table($(".tbl-host"), [{ key: "u", label: "용질" }, { key: "c", label: "농도 (M)", res: 0.01 }, { key: "tm", label: "시간 (분)", res: 1 }, { key: "n", label: "분리 세포" }, { key: "N", label: "전체" }, { key: "p", label: "비율 (%)", res: 1 }], () => { drawPlot(); });
  const fv = fit($(".cv-sq"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());

  function newSlide() {
    cells = [];
    for (let r = 0; r < ROWS; r++) for (let c = -1; c < COLS + 1; c++) {
      const off = r % 2 ? 0.5 : 0;
      cells.push({ r, c: c + off, cin: Math.max(0.18, 0.33 + 0.045 * L.gauss()), V: 1, mark: false, shape: Math.random() });
    }
    t = 0; washed = false;
  }
  function geom() {
    const { w, h } = fv.size, R = Math.min(w, h) / 2 - 4, cx = w / 2, cy = h / 2;
    const cw = (2 * R) / COLS, ch = (2 * R) / ROWS;
    return { R, cx, cy, cw, ch, x0: cx - R, y0: cy - R };
  }
  const rect = (g, k) => ({ x: g.x0 + k.c * g.cw, y: g.y0 + k.r * g.ch, w: g.cw, h: g.ch });
  const inside = (g, b) => [[b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]].every(([x, y]) => Math.hypot(x - g.cx, y - g.cy) <= g.R);
  const target = (k) => { const co = ext * I[slideSol]; return co <= k.cin ? 1 : B + (1 - B) * k.cin / co; };
  const isPlas = (k) => k.V < 0.965;

  function draw() {
    const { ctx } = fv, { w, h } = fv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const g = geom();
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h);
    ctx.save(); ctx.beginPath(); ctx.arc(g.cx, g.cy, g.R, 0, TAU); ctx.clip();
    ctx.fillStyle = slideConc == null ? "#f2f0ea" : "#eef0f2"; ctx.fillRect(0, 0, w, h);
    for (const k of cells) {
      const b = rect(g, k), ok = inside(g, b);
      ctx.strokeStyle = "#8a8070"; ctx.lineWidth = 2.4; ctx.strokeRect(b.x + 1.2, b.y + 1.2, b.w - 2.4, b.h - 2.4);
      const s = Math.sqrt(k.V), pw = (b.w - 6) * (0.35 + 0.65 * k.V ** 0.8), ph = (b.h - 6) * Math.min(1, 0.45 + 0.55 * s);
      const px = b.x + b.w / 2 + (b.w - 6 - pw) * (k.shape - 0.5) * 0.6, py = b.y + b.h / 2;
      const col = clamp(0.55 / Math.max(k.V, 0.3), 0.5, 1);
      ctx.fillStyle = `rgba(${Math.round(150 - 40 * col)},${Math.round(60 - 20 * col)},${Math.round(140 - 10 * col)},${(0.35 + 0.45 * col).toFixed(2)})`;
      const rr = Math.min(ph / 2, (1 - k.V) * 60 + 2);
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(px - pw / 2, py - ph / 2, pw, ph, rr) : ctx.rect(px - pw / 2, py - ph / 2, pw, ph); ctx.fill();
      ctx.fillStyle = "rgba(120,110,90,.45)"; ctx.beginPath(); ctx.arc(px - pw * 0.25, py, Math.min(ph, pw) * 0.12, 0, TAU); ctx.fill();
      if (!ok) { ctx.fillStyle = "rgba(28,30,27,.25)"; ctx.fillRect(b.x, b.y, b.w, b.h); }
      if (k.mark && ok) { ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(b.x + 9, b.y + 9, 4.5, 0, TAU); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.2; ctx.stroke(); }
    }
    ctx.restore();
    ctx.strokeStyle = "#000"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(g.cx, g.cy, g.R, 0, TAU); ctx.stroke();
    ctx.fillStyle = "#e8e8e0"; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText(slideConc == null ? "표본 없음" : `${washed ? "증류수" : UN[slideSol] + " " + slideConc.toFixed(2) + " M"}`, 8, 16);
    ctx.textAlign = "right"; ctx.fillText(`${Math.floor(t / 60)}분 ${String(Math.floor(t % 60)).padStart(2, "0")}초`, w - 8, 16);
    ctx.textAlign = "left"; ctx.fillText(`${cells.filter((k) => k.mark && inside(g, rect(g, k))).length}개 표시`, 8, h - 8);
    $(".n-t").textContent = slideConc == null ? "—" : `${(t / 60).toFixed(1)}분`;
  }

  function step(dt) {
    if (!running || slideConc == null) return;
    const sim = dt * 10;
    t += sim;
    for (const k of cells) { const tau = washed ? 150 : 110; k.V += (target(k) - k.V) * (1 - Math.exp(-sim / tau)); }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows.filter((r) => r.u !== "증류수");
    const pts = rows.map((r) => ({ x: r.c * (r.u === "NaCl" ? I.nacl : 1), y: r.p }));
    const res = L.plot(ctx, { x0: 46, y0: 18, w: w - 60, h: h - 52 }, { pts, xr: [0, Math.max(1, ...pts.map((p) => p.x + 0.1))], yr: [0, 100], xlabel: "설탕 환산 농도 (M)", ylabel: "원형질 분리 세포 (%)" });
    const s = [...pts].sort((a, b) => a.x - b.x);
    let c50 = null;
    for (let i = 1; i < s.length; i++) if (s[i - 1].y < 50 && s[i].y >= 50) { c50 = s[i - 1].x + (50 - s[i - 1].y) * (s[i].x - s[i - 1].x) / (s[i].y - s[i - 1].y || 1); break; }
    if (c50 != null) {
      const X = res.X(c50);
      ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X, 18); ctx.lineTo(X, h - 34); ctx.stroke(); ctx.setLineDash([]);
      $(".n-c").textContent = `${c50.toFixed(2)} M`;
      $(".n-p").textContent = `${(-c50 * 0.00831 * 293).toFixed(2)} MPa`;
    } else { $(".n-c").textContent = "50%를 사이에 둔 두 점 필요"; $(".n-p").textContent = "—"; }
  }

  $(".sol").addEventListener("click", (e) => { const b = e.target.closest("[data-u]"); if (!b) return; solute = b.dataset.u; root.querySelectorAll("[data-u]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); });
  $(".conc").addEventListener("input", (e) => { $(".c-out").textContent = (+e.target.value).toFixed(2); });
  $(".drop").addEventListener("click", () => { newSlide(); ext = +$(".conc").value; slideConc = ext; slideSol = solute; running = true; });
  $(".water").addEventListener("click", () => { if (slideConc == null) return; ext = 0; washed = true; t = 0; });
  $(".cv-sq").addEventListener("click", (e) => {
    const r = $(".cv-sq").getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, g = geom();
    for (const k of cells) { const b = rect(g, k); if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h && inside(g, b)) { k.mark = !k.mark; break; } }
    draw();
  });
  $(".unmark").addEventListener("click", () => { cells.forEach((k) => (k.mark = false)); draw(); });
  $(".rec").addEventListener("click", () => {
    if (slideConc == null) return;
    const g = geom(), vis = cells.filter((k) => inside(g, rect(g, k))), n = vis.filter((k) => k.mark).length;
    tbl.add({ u: washed ? "증류수" : UN[slideSol], c: washed ? 0 : slideConc, tm: t / 60, n, N: vis.length, p: n / vis.length * 100 });
  });
  $(".clear").addEventListener("click", () => tbl.clear());
  newSlide(); cells.forEach((k) => (k.V = 1)); slideConc = null;
  loop($(".cv-sq"), (dt) => { step(dt); draw(); });

  if (L.demo) {
    requestAnimationFrame(() => {
      const g = geom(); if (!g.R) return;
      [0.1, 0.2, 0.3, 0.35, 0.4, 0.5, 0.6].forEach((c) => {
        newSlide(); ext = c; slideConc = c; slideSol = "suc";
        cells.forEach((k) => { k.V = target(k); k.mark = isPlas(k) ? Math.random() > 0.04 : Math.random() < 0.03; });
        t = 720; $(".rec").click();
      });
      newSlide(); ext = 0.6; slideConc = 0.6; slideSol = "nacl"; solute = "nacl";
      root.querySelectorAll("[data-u]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.u === "nacl")));
      cells.forEach((k) => { k.V = target(k); k.mark = isPlas(k); }); t = 720; $(".rec").click();
      newSlide(); ext = 0.4; slideConc = 0.4; slideSol = "suc"; solute = "suc";
      root.querySelectorAll("[data-u]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.u === "suc")));
      cells.forEach((k) => { k.V = target(k); k.mark = isPlas(k); }); t = 660; running = true;
    });
  }
})();
