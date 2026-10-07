/* 카드: 지질도의 구불구불한 지층 경계선에서 지층의 기울기와 두께를 읽을 수 있을까? — 클리노미터, 구조 등고선, V자 법칙, t = w·sin δ (모식 지형) */
(() => {
  const root = document.getElementById("card-labearth-strike-dip");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const D2R = Math.PI / 180;
  const W = 1000, H = 625, AX = 312, T = 40, DECL = 8;

  /* 지형: 동쪽으로 흐르는 골짜기, 동쪽 끝은 평평한 범람원(약 75 m) */
  const ramp = (E) => Math.min(1, Math.max(0, (800 - E) / 40));
  const zf = (E) => 130 - 0.07 * Math.min(E, 780);
  const topo = (E, N) => zf(E) + (0.28 * Math.abs(N - AX) + 4 * Math.sin(E / 70) * Math.min(1, Math.abs(N - AX) / 120)) * ramp(E);

  /* 지질 상황: 아래 경계면이 지나는 점 (E0, N0, z0), 경사 방향 dd(°), 경사 δ(°) */
  const PRE = [
    { dd: 100, dip: 15, p0: [810, AX, 75.4] },
    { dd: 280, dip: 15, p0: [520, AX, zf(520)] },
    { dd: 0, dip: 0, p0: [0, 0, 95] },
    { dd: 100, dip: 90, p0: [520, AX, 0] },
  ];
  let pre = 0, pts = [], fitRes = null, marks = [];
  const nvec = () => { const p = PRE[pre], d = p.dip * D2R, a = p.dd * D2R; return [Math.sin(d) * Math.sin(a), Math.sin(d) * Math.cos(a), Math.cos(d)]; };
  const sdist = (E, N, z) => { const n = nvec(), p = PRE[pre].p0; return n[0] * (E - p[0]) + n[1] * (N - p[1]) + n[2] * (z - p[2]); };
  const sAt = (E, N) => sdist(E, N, topo(E, N));

  /* 표기 */
  const norm = (a) => ((a % 360) + 360) % 360;
  const strikeTxt = (s) => { s = norm(s) % 180; const r = Math.round(s); return r === 0 ? "N0°E" : r <= 90 ? `N${r}°E` : `N${180 - r}°W`; };
  const quad = (a) => { a = norm(a); return a < 22.5 || a >= 337.5 ? "N" : a < 67.5 ? "NE" : a < 112.5 ? "E" : a < 157.5 ? "SE" : a < 202.5 ? "S" : a < 247.5 ? "SW" : a < 292.5 ? "W" : "NW"; };
  const dipQuad = (strike, dd) => {
    const s = norm(strike) % 180;
    const two = s <= 90 ? ["SE", "NW"] : ["NE", "SW"];
    const q = quad(dd);
    return two.find((t) => q.includes(t[0]) && q.includes(t[1])) || (two.find((t) => t.includes(q)) || q);
  };
  const attitude = (strike, dip, dd) => dip < 0.5 ? "수평" : `${strikeTxt(strike)}/${Math.round(dip)}°${dip > 89.5 ? "" : dipQuad(strike, dd)}`;

  /* ── 지도 ── */
  const mv = fit($(".sd-map"), () => draw());
  let off = null, offKey = "";
  const geo = () => { const { w, h } = mv.size; const s = Math.min(w / W, h / H); return { s, ox: (w - W * s) / 2, oy: (h - H * s) / 2 }; };
  function draw() {
    const { ctx } = mv, { w, h } = mv.size; if (!w) return;
    const { s, ox, oy } = geo();
    const X = (E) => ox + E * s, Y = (N) => oy + (H - N) * s;
    const key = `${w}x${h}|${pre}`;
    if (offKey !== key) {
      offKey = key;
      off = document.createElement("canvas"); const dpr = Math.min(devicePixelRatio || 1, 2);
      off.width = Math.round(w * dpr); off.height = Math.round(h * dpr);
      const o = off.getContext("2d"); o.scale(dpr, dpr);
      const cell = 2;
      for (let py = oy; py < oy + H * s; py += cell) for (let px = ox; px < ox + W * s; px += cell) {
        const E = (px - ox) / s, N = H - (py - oy) / s, d = sAt(E, N);
        o.fillStyle = d < 0 ? "#dfe5d6" : d < T ? "#e8b26a" : "#f1e7cf";
        o.fillRect(px, py, cell + 0.4, cell + 0.4);
      }
      /* 등고선 (10 m), 지층 경계선: 마칭 스퀘어 */
      const g = 4, nx = Math.ceil(W * s / g), ny = Math.ceil(H * s / g);
      const grid = (f) => { const a = []; for (let j = 0; j <= ny; j++) { const r = []; for (let i = 0; i <= nx; i++) { const E = i * g / s, N = H - j * g / s; r.push(f(E, N)); } a.push(r); } return a; };
      const iso = (a, lev, col, lw) => {
        o.strokeStyle = col; o.lineWidth = lw; o.beginPath();
        for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
          const v = [a[j][i] - lev, a[j][i + 1] - lev, a[j + 1][i + 1] - lev, a[j + 1][i] - lev];
          const P = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]], e = [];
          for (let k = 0; k < 4; k++) { const k2 = (k + 1) % 4; if ((v[k] < 0) !== (v[k2] < 0)) { const t = v[k] / (v[k] - v[k2]); e.push([P[k][0] + t * (P[k2][0] - P[k][0]), P[k][1] + t * (P[k2][1] - P[k][1])]); } }
          for (let k = 0; k + 1 < e.length; k += 2) { o.moveTo(ox + e[k][0] * g, oy + e[k][1] * g); o.lineTo(ox + e[k + 1][0] * g, oy + e[k + 1][1] * g); }
        }
        o.stroke();
      };
      const tg = grid(topo);
      for (let z = 80; z <= 240; z += 10) iso(tg, z, z % 50 ? "rgba(120,90,60,.45)" : "rgba(120,90,60,.8)", z % 50 ? 0.7 : 1.2);
      const sg = grid(sAt);
      iso(sg, 0, "#5b3a17", 1.8); iso(sg, T, "#8a5a24", 1.2);
      /* 등고선 높이 글자 */
      o.font = `9.5px ${F.mono}`; o.fillStyle = "rgba(110,80,50,.95)"; o.textAlign = "center";
      [100, 150].forEach((z) => { const E = 300; for (const side of [1, -1]) { let N = AX; for (let k = 0; k < 400 && topo(E, N) < z; k++) N += side; if (topo(E, N) >= z) { o.fillStyle = "rgba(255,255,255,.75)"; o.fillRect(X(E) - 10, Y(N) - 7, 20, 11); o.fillStyle = "rgba(110,80,50,.95)"; o.fillText(z, X(E), Y(N) + 2); } } });
      /* 하천 */
      o.strokeStyle = "#4f86b8"; o.lineWidth = 2; o.beginPath();
      for (let E = 0; E <= W; E += 5) { const N = AX + 3 * Math.sin(E / 40); E ? o.lineTo(X(E), Y(N)) : o.moveTo(X(E), Y(N)); }
      o.stroke();
    }
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(off, 0, 0, w, h);
    /* 구조 등고선 */
    if (fitRes) {
      ctx.save(); ctx.beginPath(); ctx.rect(ox, oy, W * s, H * s); ctx.clip();
      ctx.strokeStyle = C.night; ctx.lineWidth = 1; ctx.setLineDash([6, 4]); ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.night;
      const { a, b, c } = fitRes, gm = Math.hypot(a, b);
      if (gm > 1e-4) for (let z = 40; z <= 280; z += 40) {
        /* aE + bN + c = z 인 직선 */
        const P = [];
        [[0, null], [W, null], [null, 0], [null, H]].forEach(([E, N]) => { if (E != null && Math.abs(b) > 1e-9) { const n = (z - c - a * E) / b; if (n >= 0 && n <= H) P.push([E, n]); } if (N != null && Math.abs(a) > 1e-9) { const e = (z - c - b * N) / a; if (e >= 0 && e <= W) P.push([e, N]); } });
        if (P.length >= 2) { ctx.beginPath(); ctx.moveTo(X(P[0][0]), Y(P[0][1])); ctx.lineTo(X(P[1][0]), Y(P[1][1])); ctx.stroke(); const m = P[0][1] > P[1][1] ? P[0] : P[1]; ctx.fillText(z + " m", X(m[0]) + 14, Y(m[1]) + 10); }
      }
      ctx.restore(); ctx.setLineDash([]);
    }
    /* 찍은 점 */
    pts.forEach((p) => { ctx.fillStyle = C.night; ctx.beginPath(); ctx.arc(X(p.E), Y(p.N), 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(X(p.E), Y(p.N), 1.6, 0, Math.PI * 2); ctx.fill(); });
    /* 주향·경사 기호 */
    marks.forEach((m) => {
      const a = m.strike * D2R, dx = Math.sin(a), dy = -Math.cos(a), cx = X(m.E), cy = Y(m.N);
      ctx.strokeStyle = C.night; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - dx * 11, cy - dy * 11); ctx.lineTo(cx + dx * 11, cy + dy * 11);
      const d = m.dd * D2R; if (m.dip > 0.5 && m.dip < 89.5) { ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(d) * 6, cy - Math.cos(d) * 6); }
      ctx.stroke();
      ctx.font = `600 10px ${F.mono}`; ctx.fillStyle = C.night; ctx.textAlign = "left"; ctx.fillText(Math.round(m.dip), cx + Math.sin(d) * 8 + 2, cy - Math.cos(d) * 8 + 4);
    });
    /* 방위, 축척 */
    ctx.fillStyle = "rgba(251,251,248,.85)"; ctx.fillRect(ox + 4, oy + 4, 28, 34); ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.moveTo(ox + 18, oy + 8); ctx.lineTo(ox + 13, oy + 22); ctx.lineTo(ox + 23, oy + 22); ctx.closePath(); ctx.fill();
    ctx.font = `600 10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("N", ox + 18, oy + 34);
    ctx.fillStyle = "rgba(251,251,248,.85)"; ctx.fillRect(ox + W * s - 120, oy + H * s - 22, 116, 18);
    ctx.fillStyle = C.ink; ctx.fillRect(ox + W * s - 114, oy + H * s - 12, 100 * s, 3);
    ctx.textAlign = "left"; ctx.font = `10px ${F.mono}`; ctx.fillText("100 m", ox + W * s - 108 + 100 * s, oy + H * s - 8);
    ctx.fillStyle = "rgba(251,251,248,.85)"; ctx.fillRect(ox + W * s - 76, oy + 4, 72, 16); ctx.fillStyle = "#4f86b8"; ctx.fillText("하천 → 동", ox + W * s - 70, oy + 16);
  }

  /* ── 기록 ── */
  const tbl = L.table($(".tbl-host"), [
    { key: "m", label: "방법" }, { key: "att", label: "주향/경사" }, { key: "w", label: "폭 w (m)", res: 0.5 }, { key: "t", label: "두께 t (m)", res: 0.1 },
  ], () => drawPlot());
  const verdict = (t) => { $(".n-t").textContent = t; };
  function clino() {
    const p = PRE[pre];
    /* 아래 경계선 근처의 노두 한 곳 */
    let best = null;
    for (let k = 0; k < 400 && !best; k++) {
      const E = 60 + Math.random() * 880, N = 60 + Math.random() * 505;
      const d = sAt(E, N); if (d > 3 && d < T - 3) best = { E, N };
    }
    if (!best) return;
    const bias = $(".decl").checked ? DECL : 0;
    const strike = norm(L.measure(p.dd - 90, { sd: 3, bias, res: 1 }));
    const dip = Math.min(90, Math.max(0, L.measure(p.dip, { sd: 2, res: 1 })));
    const dd = strike + 90;
    marks.push({ ...best, strike, dip, dd });
    tbl.add({ m: "클리노미터", att: attitude(strike, dip, dd), w: "—", t: "—", _s: norm(strike) % 180, _d: dip, _dd: dd });
    draw();
  }
  function fitPlane() {
    if (pts.length < 3) { $(".n-f").textContent = "점 3개 이상"; return; }
    const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], B = [0, 0, 0];
    pts.forEach((p) => { const r = [p.E, p.N, 1]; for (let i = 0; i < 3; i++) { B[i] += r[i] * p.z; for (let j = 0; j < 3; j++) A[i][j] += r[i] * r[j]; } });
    const det = (M) => M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
    const D = det(A); if (Math.abs(D) < 1e-6) { $(".n-f").textContent = "점이 한 줄에 있음"; return; }
    const sol = [0, 1, 2].map((k) => det(A.map((row, i) => row.map((v, j) => (j === k ? B[i] : v)))) / D);
    const [a, b, c] = sol; fitRes = { a, b, c };
    const dip = Math.atan(Math.hypot(a, b)) / D2R, dd = norm(Math.atan2(-a, -b) / D2R), strike = norm(dd - 90);
    $(".n-f").textContent = attitude(strike, dip, dd);
    tbl.add({ m: `구조 등고선 (${pts.length}점)`, att: attitude(strike, dip, dd), w: "—", t: "—", _s: strike % 180, _d: dip, _dd: dd });
    draw();
  }
  function width() {
    const p = PRE[pre];
    if (p.dip < 0.5) { verdict("수평층은 평지에 띠로 드러나지 않습니다. 두께 = 위·아래 경계의 높이 차"); return; }
    /* 평지(E > 800)를 지나는 주향에 수직인 선 위에서 두 경계 찾기 */
    const a = p.dd * D2R, ux = Math.sin(a), uy = Math.cos(a);
    let found = null;
    for (const N0 of [AX, AX - 80, AX + 80]) {
      const xs = [];
      let prev = null;
      for (let t = -1200; t <= 1200; t += 0.5) {
        const E = 900 + ux * t, N = N0 + uy * t;
        if (E < 790 || E > 1000 || N < 0 || N > H) { prev = null; continue; }
        const d = sAt(E, N);
        if (prev != null && ((prev < 0) !== (d < 0) || (prev < T) !== (d < T))) xs.push(t);
        prev = d;
      }
      if (xs.length >= 2) { found = Math.abs(xs[xs.length - 1] - xs[0]); break; }
    }
    if (found == null) { verdict("평지에 두 경계가 모두 드러나지 않습니다"); return; }
    const w = L.measure(found, { sd: 1.5, res: 0.5 });
    const last = [...tbl.rows].reverse().find((r) => Number.isFinite(r._d));
    const dip = last ? last._d : NaN;
    const t = Number.isFinite(dip) ? w * Math.sin(dip * D2R) : NaN;
    tbl.add({ m: "노출 폭", att: last ? `δ = ${Math.round(dip)}° 사용` : "경사 먼저", w, t: Number.isFinite(t) ? t : "—" });
    verdict(Number.isFinite(t) ? `${t.toFixed(1)} m` : "경사를 먼저 재세요");
  }

  const pv = fit($(".sd-plot"), () => drawPlot());
  function drawPlot() {
    const { ctx } = pv, { w, h } = pv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const b = { x0: 44, y0: 22, w: w - 58, h: h - 56 };
    const rows = tbl.rows.filter((r) => Number.isFinite(r._d));
    const r = L.plot(ctx, b, { pts: rows.filter((x) => x.m === "클리노미터").map((x) => ({ x: x._s, y: x._d })), xr: rows.length ? [Math.max(0, Math.min(...rows.map((x) => x._s)) - 25), Math.min(180, Math.max(...rows.map((x) => x._s)) + 25)] : [0, 180], yr: [0, rows.length ? Math.min(95, Math.max(...rows.map((x) => x._d)) + 15) : 95], xlabel: "주향 (북에서 시계 방향, °)", ylabel: "경사 (°)" });
    rows.filter((x) => x.m !== "클리노미터").forEach((x) => { ctx.strokeStyle = C.warn; ctx.lineWidth = 2; const px = r.X(x._s), py = r.Y(x._d); ctx.beginPath(); ctx.moveTo(px - 5, py - 5); ctx.lineTo(px + 5, py + 5); ctx.moveTo(px + 5, py - 5); ctx.lineTo(px - 5, py + 5); ctx.stroke(); });
    ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; ctx.fillStyle = C.forest; ctx.fillText("● 클리노미터", b.x0 + b.w - 4, b.y0 + 12); ctx.fillStyle = C.warn; ctx.fillText("× 구조 등고선", b.x0 + b.w - 4, b.y0 + 26);
  }

  /* ── 조작 ── */
  $(".sd-map").addEventListener("click", (e) => {
    const rc = e.currentTarget.getBoundingClientRect(), { s, ox, oy } = geo();
    const mx = e.clientX - rc.left, my = e.clientY - rc.top;
    let best = null, bd = 1e9;
    for (let dy = -8; dy <= 8; dy += 1) for (let dx = -8; dx <= 8; dx += 1) {
      const E = (mx + dx - ox) / s, N = H - (my + dy - oy) / s;
      if (E < 0 || E > W || N < 0 || N > H) continue;
      const v = Math.abs(sAt(E, N)) + 0.02 * (dx * dx + dy * dy);
      if (v < bd) { bd = v; best = { E, N }; }
    }
    if (!best || Math.abs(sAt(best.E, best.N)) > 2.5) { $(".n-p").textContent = `${pts.length} (경계선 위를 누르세요)`; return; }
    pts.push({ ...best, z: L.measure(topo(best.E, best.N), { sd: 2, res: 1 }) });
    $(".n-p").textContent = `${pts.length}점 · 마지막 높이 ${pts[pts.length - 1].z} m`;
    draw();
  });
  $(".sd-pre").addEventListener("click", (e) => {
    const b = e.target.closest("[data-p]"); if (!b) return;
    pre = +b.dataset.p; pts = []; fitRes = null; marks = [];
    root.querySelectorAll(".sd-pre [data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    $(".n-p").textContent = "0"; $(".n-f").textContent = "—"; verdict("—");
    draw();
  });
  $(".clino").addEventListener("click", clino);
  $(".fitp").addEventListener("click", fitPlane);
  $(".width").addEventListener("click", width);
  $(".clear").addEventListener("click", () => { tbl.clear(); pts = []; fitRes = null; marks = []; $(".n-p").textContent = "0"; $(".n-f").textContent = "—"; verdict("—"); draw(); });

  draw();
  if (L.demo) {
    for (let i = 0; i < 3; i++) clino();
    /* 아래 경계선 위의 세 점 (높이가 다르게) */
    const want = [[540, 1], [620, -1], [700, 1], [760, -1]];
    want.forEach(([E, side]) => {
      let N = AX, prev = sAt(E, N);
      for (let k = 0; k < 300; k++) { N += side; const d = sAt(E, N); if ((prev < 0) !== (d < 0)) { pts.push({ E, N, z: L.measure(topo(E, N), { sd: 2, res: 1 }) }); break; } prev = d; }
    });
    $(".n-p").textContent = `${pts.length}점`;
    fitPlane(); width();
  }
})();
