/* 카드: 물이 얕아지면 파도는 왜 느려지고 높아질까? — 조파 수조, 분산 관계 ω² = gk·tanh(kh), 해일 모형, 천수 효과 */
(() => {
  const root = document.getElementById("card-labearth-wave-tank");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sH = $(".h"), sT = $(".t");
  const G = 9.8, LEN = 3.4, P1 = 0.6, P2 = 1.6, DX = P2 - P1, A0 = 0.008, NX = 240;
  let mode = "wave", xKey = "sh", t = 0;
  const trace = [];

  /* 분산 관계를 뉴턴법으로 풀어 파수 k */
  function waveK(T, h) {
    const w = 2 * Math.PI / T;
    let k = Math.max(w * w / G, w / Math.sqrt(G * h));
    for (let i = 0; i < 40; i++) {
      const th = Math.tanh(k * h), f = G * k * th - w * w, df = G * th + G * k * h * (1 - th * th);
      k -= f / df;
    }
    return k;
  }
  const cg = (k, h) => { const c = Math.sqrt(G / k * Math.tanh(k * h)); return c / 2 * (1 + 2 * k * h / Math.sinh(2 * k * h)); };
  const depth = (x, h) => { const xs = LEN - 4 * h; return x < xs ? h : Math.max(0, h - (x - xs) / 4); };

  /* 수조 위 격자: 위상(∫k dx), 진폭, 해일 혹의 도착 시각 */
  let grid = null;
  function build() {
    const h = +sH.value / 100, T = +sT.value, k0 = waveK(T, h), cg0 = cg(k0, h);
    const xs = [], ph = [], amp = [], arr = [];
    let p = 0, ta = 0;
    for (let i = 0; i <= NX; i++) {
      const x = i / NX * LEN, d = depth(x, h);
      if (i) {
        const dx = LEN / NX, dm = Math.max(depth(x - dx / 2, h), 1e-4);
        p += waveK(T, dm) * dx; ta += dx / Math.sqrt(G * dm);
      }
      xs.push(x); ph.push(p); arr.push(ta);
      if (d < 0.003) { amp.push(0); continue; }
      const k = waveK(T, d);
      amp.push(Math.min(A0 * Math.sqrt(cg0 / cg(k, d)), 0.4 * d));
    }
    grid = { h, T, xs, ph, amp, arr, k0, c0: 2 * Math.PI / T / k0 };
  }
  function eta(i, tt) {
    const g = grid, d = depth(g.xs[i], g.h);
    if (d < 0.003) return 0;
    if (mode === "wave") return g.amp[i] * Math.sin(g.ph[i] - 2 * Math.PI / g.T * tt) * Math.min(1, tt / 2);
    const per = g.arr[NX - 1] + 1.5, tc = (tt % per);
    const lag = tc - g.arr[i], sig = 0.16 / Math.sqrt(G * g.h);
    return A0 * 1.5 * Math.pow(g.h / Math.max(d, 0.004), 0.25) * Math.exp(-((lag / sig) ** 2));
  }

  const cv = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "m", label: "조파" }, { key: "h", label: "h (cm)", res: 1 }, { key: "T", label: "T (s)", res: 0.1 },
    { key: "dt", label: "Δt (s)", res: 0.001 }, { key: "c", label: "c (m/s)", res: 0.01 }, { key: "lam", label: "λ = cT (m)", res: 0.01 },
  ], () => drawPlot());

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w || !grid) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 34, x1 = w - 10, sx = (x1 - x0) / LEN;
    const sy = sx * 2.5, top = 18, still = top + 0.06 * sy, bot = still + 0.30 * sy;
    const X = (x) => x0 + x * sx;
    const hh = grid.h, yb = (x) => still + depth(x, hh) * sy;
    /* 물 */
    ctx.fillStyle = "rgba(111,160,196,.35)"; ctx.beginPath();
    ctx.moveTo(X(0), still + hh * sy);
    for (let i = 0; i <= NX; i++) ctx.lineTo(X(grid.xs[i]), still - eta(i, t) * sy * 3);
    for (let i = NX; i >= 0; i--) ctx.lineTo(X(grid.xs[i]), yb(grid.xs[i]));
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#2c4e8a"; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = 0; i <= NX; i++) { if (depth(grid.xs[i], hh) < 0.003) break; const y = still - eta(i, t) * sy * 3; i ? ctx.lineTo(X(grid.xs[i]), y) : ctx.moveTo(X(grid.xs[i]), y); }
    ctx.stroke();
    /* 바닥·벽·경사 해빈 */
    ctx.fillStyle = "#cfc6b0"; ctx.beginPath(); ctx.moveTo(X(0), bot); ctx.lineTo(X(0), still + hh * sy);
    for (let i = 0; i <= NX; i++) ctx.lineTo(X(grid.xs[i]), yb(grid.xs[i]));
    ctx.lineTo(X(LEN), bot); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(X(0), top, LEN * sx, bot - top);
    /* 조파판 */
    const px = mode === "wave" ? X(0.03) + Math.sin(-2 * Math.PI / grid.T * t) * 3 : X(0.03);
    ctx.fillStyle = C.ink2; ctx.fillRect(px - 2, top + 2, 4, still + hh * sy - top - 2);
    if (mode === "pulse") { ctx.fillStyle = C.warn; ctx.fillRect(X(0.08), still + hh * sy - 3, 0.3 * sx, 3); }
    /* 파고계 */
    ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    [[P1, "1"], [P2, "2"]].forEach(([x, n]) => {
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(x), top - 4); ctx.lineTo(X(x), still + hh * sy * 0.6); ctx.stroke();
      ctx.fillStyle = C.warn; ctx.fillText("파고계 " + n, X(x), top - 7 < 9 ? 10 : top - 7);
    });
    ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText(`h = ${(hh * 100).toFixed(0)} cm`, X(0.12), bot - 6);
    ctx.textAlign = "right"; ctx.fillText("경사 해빈 →", X(LEN) - 4, bot - 6);
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(P1), bot + 8); ctx.lineTo(X(P2), bot + 8); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign = "center"; ctx.fillText("1.00 m", X((P1 + P2) / 2), bot + 19);
    /* 파고계 기록 */
    const gy0 = bot + 30, gy1 = h - 8, gm = (gy0 + gy1) / 2, span = 4;
    ctx.strokeStyle = C.rule; ctx.strokeRect(x0 + .5, gy0 + .5, x1 - x0, gy1 - gy0);
    ctx.beginPath(); ctx.moveTo(x0, gm); ctx.lineTo(x1, gm); ctx.stroke();
    const amax = Math.max(A0 * 1.6, ...trace.map((p) => Math.max(Math.abs(p[1]), Math.abs(p[2]))));
    const GY = (v) => gm - v / amax * (gy1 - gy0) / 2 * 0.9, GX = (tt) => x1 - (t - tt) / span * (x1 - x0);
    [[1, C.warn], [2, "#2c4e8a"]].forEach(([k, col]) => {
      ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.beginPath();
      trace.forEach((p, i) => (i ? ctx.lineTo(GX(p[0]), GY(p[k])) : ctx.moveTo(GX(p[0]), GY(p[k]))));
      ctx.stroke();
    });
    ctx.textAlign = "left"; ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.warn; ctx.fillText("파고계 1", x0 + 4, gy0 + 12);
    ctx.fillStyle = "#2c4e8a"; ctx.fillText("파고계 2", x0 + 56, gy0 + 12);
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("최근 4초 →", x1 - 4, gy0 + 12);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 46, y0: 20, w: w - 60, h: h - 54 };
    if (xKey === "sh") {
      const pts = tbl.rows.map((r) => ({ x: Math.sqrt(r.h / 100), y: r.c }));
      const fl = tbl.rows.filter((r) => r.m === "혹" || r.T >= 2);
      const f = fl.length > 1 ? L.linfit(fl.map((r) => Math.sqrt(r.h / 100)), fl.map((r) => r.c), true) : null;
      L.plot(ctx, box, { pts, fit: f, model: (x) => Math.sqrt(G) * x, xr: [0, 0.6], yr: [0, 2], xlabel: "√h (√m)", ylabel: "c (m/s)" });
      if (f) { ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`T ≥ 2 s·혹만 맞춤: 기울기 ${f.a.toFixed(2)} → g ≈ ${(f.a * f.a).toFixed(1)} m/s²`, box.x0 + 6, box.y0 + 12); }
    } else {
      const hc = +sH.value;
      const pts = tbl.rows.filter((r) => r.h === hc && r.m === "파").map((r) => ({ x: r.T, y: r.c }));
      const P = L.plot(ctx, box, { pts, model: () => Math.sqrt(G * hc / 100), xr: [0, 3.2], yr: [0, 2], xlabel: `주기 T (s) · 지금 수심 ${hc} cm의 기록만`, ylabel: "c (m/s)" });
      ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
      ctx.strokeStyle = C.leaf; ctx.lineWidth = 1.4; ctx.setLineDash([7, 4]); ctx.beginPath();
      for (let i = 0; i <= 50; i++) { const T = 3.2 * i / 50, y = G * T / 2 / Math.PI; i ? ctx.lineTo(P.X(T), P.Y(y)) : ctx.moveTo(P.X(T), P.Y(y)); } ctx.stroke();
      ctx.setLineDash([]); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath();
      for (let i = 1; i <= 50; i++) { const T = 0.3 + 2.9 * i / 50, k = waveK(T, hc / 100), y = 2 * Math.PI / T / k; i > 1 ? ctx.lineTo(P.X(T), P.Y(y)) : ctx.moveTo(P.X(T), P.Y(y)); } ctx.stroke();
      ctx.restore();
      ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillStyle = C.ink3;
      ctx.fillText("점선 √(gh) · 초록 파선 gT/2π · 실선 분산 관계", box.x0 + box.w - 4, box.y0 + 12);
    }
  }

  function measure() {
    const h = +sH.value / 100, T = +sT.value;
    let c;
    if (mode === "wave") c = grid.c0;
    else c = Math.sqrt(G * h * (1 + A0 * 1.5 / h));
    const dt = L.snap(DX / c + 0.015 * L.gauss(), 1 / 30);
    const cm = DX / dt;
    return { m: mode === "wave" ? "파" : "혹", h: +sH.value, T: mode === "wave" ? T : "—", dt, c: cm, lam: mode === "wave" ? cm * T : "—" };
  }

  const upd = () => { $(".h-out").textContent = sH.value; $(".t-out").textContent = (+sT.value).toFixed(1); build(); trace.length = 0; draw(); drawPlot(); };
  [sH, sT].forEach((el) => el.addEventListener("input", upd));
  $(".mode").addEventListener("click", (e) => {
    const b = e.target.closest("[data-m]"); if (!b) return;
    mode = b.dataset.m; root.querySelectorAll("[data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    $(".t-wrap").style.opacity = mode === "wave" ? "1" : "0.4"; t = 0; trace.length = 0; draw();
  });
  $(".meas").addEventListener("click", () => tbl.add(measure()));
  $(".clear").addEventListener("click", () => tbl.clear());
  $(".xsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-x]"); if (!b) return;
    xKey = b.dataset.x; root.querySelectorAll("[data-x]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  function step(dt) {
    t += dt;
    trace.push([t, eta(Math.round(P1 / LEN * NX), t), eta(Math.round(P2 / LEN * NX), t)]);
    while (trace.length && trace[0][0] < t - 4) trace.shift();
  }
  loop($(".cv-wide"), (dt) => { step(dt); draw(); });
  build(); upd();
  if (L.demo) {
    sT.value = 2.5; [4, 8, 12, 16, 20, 25].forEach((hc) => { sH.value = hc; build(); tbl.add(measure()); });
    sH.value = 30; [0.5, 0.8, 1.2, 2.0, 3.0].forEach((T) => { sT.value = T; build(); tbl.add(measure()); });
    mode = "pulse"; [5, 15].forEach((hc) => { sH.value = hc; build(); tbl.add(measure()); });
    mode = "wave"; sH.value = 10; sT.value = 1.0; upd();
    for (let i = 0; i < 240; i++) step(1 / 60);
    draw();
  }
})();
