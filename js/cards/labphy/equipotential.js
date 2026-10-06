/* 카드: 전압계 탐침으로 등전위선 그리기 — 전도성 종이(라플라스 방정식 수치 풀이), 탐침 측정, 등전위선 잇기, 전기력선 */
(() => {
  const root = document.getElementById("card-labphy-equipotential");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  const PW = 32, PH = 18, H = 0.25, NX = Math.round(PW / H) + 1, NY = Math.round(PH / H) + 1, V0 = 10;
  const disk = (cx, cy, r, v) => ({ kind: "disk", cx, cy, r, v, hit: (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r });
  const bar = (cx, y0, y1, v) => ({ kind: "bar", cx, y0, y1, v, hit: (x, y) => Math.abs(x - cx) <= 0.25 && y >= y0 && y <= y1 });
  const CFG = {
    pts: { els: [disk(10, 9, 0.6, V0), disk(22, 9, 0.6, 0)], ax: [10.6, 21.4] },
    pl: { els: [bar(12, 3, 15, V0), bar(20, 3, 15, 0)], ax: [12.25, 19.75] },
    pp: { els: [disk(11, 9, 0.6, V0), bar(21, 3, 15, 0)], ax: [11.6, 20.75] },
  };
  const cache = {};
  function solve(key) {
    if (cache[key]) return cache[key];
    const els = CFG[key].els, n = NX * NY, V = new Float32Array(n), fix = new Int8Array(n);
    const hi = els[0], lo = els[1];
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const x = i * H, y = j * H, k = j * NX + i;
      V[k] = clamp(V0 * (lo.cx - x) / (lo.cx - hi.cx), 0, V0);
      for (const e of els) if (e.hit(x, y)) { V[k] = e.v; fix[k] = 1; }
    }
    const w = 1.94;
    for (let it = 0; it < 900; it++) {
      for (let j = 0; j < NY; j++) {
        const jm = j ? j - 1 : 1, jp = j < NY - 1 ? j + 1 : NY - 2;
        for (let i = 0; i < NX; i++) {
          const k = j * NX + i; if (fix[k]) continue;
          const im = i ? i - 1 : 1, ip = i < NX - 1 ? i + 1 : NX - 2;
          const g = 0.25 * (V[j * NX + im] + V[j * NX + ip] + V[jm * NX + i] + V[jp * NX + i]);
          V[k] += w * (g - V[k]);
        }
      }
    }
    return (cache[key] = { V, fix });
  }
  let cfg = "pts", sol = solve(cfg);
  function pot(x, y) {
    const fx = clamp(x / H, 0, NX - 1.0001), fy = clamp(y / H, 0, NY - 1.0001), i = Math.floor(fx), j = Math.floor(fy), u = fx - i, v = fy - j, V = sol.V;
    for (const e of CFG[cfg].els) if (e.hit(x, y)) return e.v;
    return (1 - u) * (1 - v) * V[j * NX + i] + u * (1 - v) * V[j * NX + i + 1] + (1 - u) * v * V[(j + 1) * NX + i] + u * v * V[(j + 1) * NX + i + 1];
  }
  const onEl = (x, y) => CFG[cfg].els.some((e) => e.hit(x, y));
  const read = (x, y) => L.measure(pot(x, y), { sd: onEl(x, y) ? 0.003 : 0.015, res: 0.01 });

  let probe = { x: 16, y: 6 }, reading = read(16, 6);
  const show = { join: false, field: false, truth: false };
  const tbl = L.table($(".tbl-host"), [{ key: "x", label: "x (cm)", res: 0.1 }, { key: "y", label: "y (cm)", res: 0.1 }, { key: "v", label: "V (V)", res: 0.01 }], () => { draw(); drawPlot(); });
  const cv = $(".paper"), app = fit(cv, () => draw()), pl = fit($(".cv-plot"), () => drawPlot());
  const col = (v) => `hsl(${((360 + 240 - 27 * clamp(v, 0, 10)) % 360).toFixed(0)}, 78%, 62%)`;

  function geom() { const { w, h } = app.size, sc = Math.min((w - 12) / PW, (h - 12) / PH); return { sc, ox: (w - PW * sc) / 2, oy: (h - PH * sc) / 2 }; }

  function contour(ctx, P, lev) {
    const X = (i) => P.ox + i * H * P.sc, Y = (j) => P.oy + j * H * P.sc, V = sol.V;
    ctx.beginPath();
    for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NX - 1; i++) {
      const a = V[j * NX + i] - lev, b = V[j * NX + i + 1] - lev, c = V[(j + 1) * NX + i + 1] - lev, d = V[(j + 1) * NX + i] - lev, pts = [];
      if ((a > 0) !== (b > 0)) pts.push([X(i + a / (a - b)), Y(j)]);
      if ((b > 0) !== (c > 0)) pts.push([X(i + 1), Y(j + b / (b - c))]);
      if ((d > 0) !== (c > 0)) pts.push([X(i + d / (d - c)), Y(j + 1)]);
      if ((a > 0) !== (d > 0)) pts.push([X(i), Y(j + a / (a - d))]);
      if (pts.length >= 2) { ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); }
      if (pts.length === 4) { ctx.moveTo(pts[2][0], pts[2][1]); ctx.lineTo(pts[3][0], pts[3][1]); }
    }
    ctx.stroke();
  }

  function fieldStarts() {
    const e = CFG[cfg].els[0], out = [];
    if (e.kind === "disk") for (let k = 0; k < 14; k++) { const t = (k + 0.5) / 14 * Math.PI * 2; out.push([e.cx + (e.r + 0.15) * Math.cos(t), e.cy + (e.r + 0.15) * Math.sin(t)]); }
    else {
      for (let y = 3.5; y <= 14.6; y += 1.5) out.push([e.cx + 0.4, y]);
      [3.6, 14.4].forEach((y) => out.push([e.cx - 0.4, y]));
      out.push([e.cx, e.y0 - 0.35], [e.cx, e.y1 + 0.35]);
    }
    return out;
  }
  function trace(x, y) {
    const path = [[x, y]], d = 0.12;
    for (let s = 0; s < 900; s++) {
      const ex = -(pot(x + d, y) - pot(x - d, y)), ey = -(pot(x, y + d) - pot(x, y - d)), m = Math.hypot(ex, ey);
      if (m < 1e-6) break;
      x += 0.1 * ex / m; y += 0.1 * ey / m;
      if (x < 0 || x > PW || y < 0 || y > PH) break;
      path.push([x, y]);
      if (CFG[cfg].els[1].hit(x, y)) break;
    }
    return path;
  }
  let fieldCache = null;

  function groups() {
    const g = {};
    tbl.rows.forEach((r) => { const k = Math.round(r.v); if (Math.abs(r.v - k) <= 0.1 && k > 0 && k < V0) (g[k] = g[k] || []).push(r); });
    return g;
  }
  function anchor(k) {
    const [hi, lo] = CFG[cfg].els, e = k >= 5 ? hi : lo, other = e === hi ? lo : hi, s = Math.sign(other.cx - e.cx) || 1;
    return { x: e.kind === "bar" ? e.cx - 30 * s : e.cx, y: e.kind === "bar" ? 9 : e.cy, s };
  }

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const P = geom(), X = (x) => P.ox + x * P.sc, Y = (y) => P.oy + y * P.sc;
    ctx.fillStyle = "#2f3130"; ctx.fillRect(X(0), Y(0), PW * P.sc, PH * P.sc);
    ctx.strokeStyle = "rgba(255,255,255,.10)"; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 1; x < PW; x++) { ctx.moveTo(Math.round(X(x)) + 0.5, Y(0)); ctx.lineTo(Math.round(X(x)) + 0.5, Y(PH)); }
    for (let y = 1; y < PH; y++) { ctx.moveTo(X(0), Math.round(Y(y)) + 0.5); ctx.lineTo(X(PW), Math.round(Y(y)) + 0.5); }
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.22)"; ctx.beginPath();
    for (let x = 5; x < PW; x += 5) { ctx.moveTo(Math.round(X(x)) + 0.5, Y(0)); ctx.lineTo(Math.round(X(x)) + 0.5, Y(PH)); }
    for (let y = 5; y < PH; y += 5) { ctx.moveTo(X(0), Math.round(Y(y)) + 0.5); ctx.lineTo(X(PW), Math.round(Y(y)) + 0.5); }
    ctx.stroke();

    if (show.truth) { ctx.lineWidth = 1; for (let lev = 1; lev < V0; lev++) { ctx.strokeStyle = col(lev).replace("62%)", "62%, .55)").replace("hsl", "hsla"); contour(ctx, P, lev); } }
    if (show.field) {
      if (!fieldCache) fieldCache = fieldStarts().map(([x, y]) => trace(x, y));
      ctx.strokeStyle = "rgba(240,190,80,.85)"; ctx.fillStyle = "rgba(240,190,80,.95)"; ctx.lineWidth = 1.2;
      fieldCache.forEach((p) => {
        if (p.length < 3) return;
        ctx.beginPath(); p.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); ctx.stroke();
        const m = Math.min(p.length - 2, 30), [ax, ay] = p[m], [bx, by] = p[m + 1], t = Math.atan2(by - ay, bx - ax);
        ctx.save(); ctx.translate(X(bx), Y(by)); ctx.rotate(t); ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-4, -3); ctx.lineTo(-4, 3); ctx.closePath(); ctx.fill(); ctx.restore();
      });
    }
    if (show.join) {
      const g = groups();
      Object.keys(g).forEach((k) => {
        const pts = g[k]; if (pts.length < 2) return;
        const a = anchor(+k), ang = (r) => Math.atan2(r.y - a.y, (r.x - a.x) * a.s);
        const s = pts.slice().sort((p, q) => ang(p) - ang(q)), span = ang(s[s.length - 1]) - ang(s[0]);
        ctx.strokeStyle = col(+k); ctx.lineWidth = 1.6; ctx.setLineDash([5, 3]);
        ctx.beginPath(); s.forEach((r, i) => (i ? ctx.lineTo(X(r.x), Y(r.y)) : ctx.moveTo(X(r.x), Y(r.y))));
        if (span > Math.PI * 1.7 && s.length > 4) ctx.closePath();
        ctx.stroke(); ctx.setLineDash([]);
      });
    }
    CFG[cfg].els.forEach((e) => {
      ctx.fillStyle = "#cfd2d4"; ctx.strokeStyle = "#8a8f93"; ctx.lineWidth = 1;
      if (e.kind === "disk") { ctx.beginPath(); ctx.arc(X(e.cx), Y(e.cy), e.r * P.sc, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      else { ctx.fillRect(X(e.cx - 0.25), Y(e.y0), 0.5 * P.sc, (e.y1 - e.y0) * P.sc); ctx.strokeRect(X(e.cx - 0.25), Y(e.y0), 0.5 * P.sc, (e.y1 - e.y0) * P.sc); }
      ctx.font = `600 10px ${F.mono}`; ctx.textAlign = "center";
      const ty = e.kind === "disk" ? Y(e.cy - e.r) - 6 : Y(e.y0) - 6, lab = e.v ? "+10 V" : "0 V", tw = ctx.measureText(lab).width;
      ctx.fillStyle = "rgba(30,32,31,.85)"; ctx.fillRect(X(e.cx) - tw / 2 - 3, ty - 10, tw + 6, 14);
      ctx.fillStyle = "#f2f2ee"; ctx.fillText(lab, X(e.cx), ty);
    });
    tbl.rows.forEach((r) => { ctx.fillStyle = col(r.v); ctx.beginPath(); ctx.arc(X(r.x), Y(r.y), 3, 0, Math.PI * 2); ctx.fill(); });
    const px = X(probe.x), py = Y(probe.y);
    ctx.strokeStyle = C.apple; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.moveTo(px - 10, py); ctx.lineTo(px - 3, py); ctx.moveTo(px + 3, py); ctx.lineTo(px + 10, py); ctx.moveTo(px, py - 10); ctx.lineTo(px, py - 3); ctx.moveTo(px, py + 3); ctx.lineTo(px, py + 10); ctx.stroke();
    $(".n-p").textContent = `${probe.x.toFixed(1)}, ${probe.y.toFixed(1)} cm`;
    $(".n-v").textContent = `${reading.toFixed(2)} V`;
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const ax = CFG[cfg].ax, on = tbl.rows.filter((r) => Math.abs(r.y - 9) <= 1);
    const pts = on.map((r) => ({ x: r.x, y: r.v })), mid = on.filter((r) => r.x > ax[0] + 0.3 && r.x < ax[1] - 0.3);
    const ft = mid.length > 1 ? L.linfit(mid.map((r) => r.x), mid.map((r) => r.v)) : null;
    L.plot(ctx, { x0: 44, y0: 18, w: w - 58, h: h - 52 }, { pts, fit: cfg === "pl" ? ft : null, xr: [0, PW], yr: [0, 10], xlabel: "x (cm)", ylabel: "V (V)" });
    $(".n-e").textContent = ft ? `${Math.abs(ft.a).toFixed(2)} V/cm` : "축 위 점 2개 이상";
  }

  function moveTo(x, y) { probe = { x: L.snap(clamp(x, 0, PW), 0.1), y: L.snap(clamp(y, 0, PH), 0.1) }; reading = read(probe.x, probe.y); draw(); }
  let drag = false;
  const pick = (e) => { const r = cv.getBoundingClientRect(), P = geom(); moveTo((e.clientX - r.left - P.ox) / P.sc, (e.clientY - r.top - P.oy) / P.sc); };
  cv.addEventListener("pointerdown", (e) => { drag = true; cv.setPointerCapture(e.pointerId); pick(e); });
  cv.addEventListener("pointermove", (e) => { if (drag) pick(e); });
  cv.addEventListener("pointerup", () => { drag = false; });
  cv.addEventListener("pointercancel", () => { drag = false; });
  cv.addEventListener("keydown", (e) => {
    const d = { ArrowLeft: [-0.1, 0], ArrowRight: [0.1, 0], ArrowUp: [0, -0.1], ArrowDown: [0, 0.1] }[e.key];
    if (d) { e.preventDefault(); moveTo(probe.x + d[0], probe.y + d[1]); }
    else if (e.key === "Enter") { e.preventDefault(); record(); }
  });
  function record() { tbl.add({ x: probe.x, y: probe.y, v: reading }); }
  $(".rec").addEventListener("click", record);
  $(".clear").addEventListener("click", () => tbl.clear());
  [["join", ".t-join"], ["field", ".t-field"], ["truth", ".t-true"]].forEach(([k, s]) => $(s).addEventListener("click", (e) => { show[k] = !show[k]; e.currentTarget.setAttribute("aria-pressed", String(show[k])); draw(); }));
  root.querySelectorAll(".cfg .chip").forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll(".cfg .chip").forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
    cfg = b.dataset.c; sol = solve(cfg); fieldCache = null; tbl.clear(); moveTo(probe.x, probe.y); drawPlot();
  }));

  if (L.demo) {
    const rows = [];
    [2, 4, 5, 6, 8].forEach((lev) => {
      [-6, -4, -2.5, -1, 0, 1, 2.5, 4, 6].forEach((dy) => {
        const y = 9 + dy; let prev = pot(0, y);
        for (let x = 0.1; x <= PW; x += 0.1) {
          const v = pot(x, y);
          if ((prev - lev) * (v - lev) < 0 && !onEl(x, y)) rows.push({ x: L.snap(x - 0.1 * (v - lev) / (v - prev), 0.1), y });
          prev = v;
        }
      });
    });
    rows.forEach((r) => tbl.add({ x: r.x, y: r.y, v: read(r.x, r.y) }));
    show.join = show.field = true;
    $(".t-join").setAttribute("aria-pressed", "true"); $(".t-field").setAttribute("aria-pressed", "true");
    probe = { x: 16, y: 13 }; reading = read(16, 13);
  }
  draw(); drawPlot();
})();
