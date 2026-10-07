/* 카드: 지진 기록 몇 장으로 진앙·진원 깊이·지각 두께를 알 수 있을까? — PS시 3원법, 모호 면 굴절파 주시 곡선 */
(() => {
  const root = document.getElementById("card-labearth-epicenter");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const LAND = (window.NMEastAsia || {}).land || [];

  /* 2016년 9월 12일 경주 지진 (기상청 발표 진앙 35.76°N 129.19°E, 20:32:54 KST). 깊이는 연구마다 11~16 km → 15 km로 둔다 */
  const EQ = { lat: 35.76, lon: 129.19, z: 15, t0: 4.0 };   // t0: 기록 창 시작(20:32:50)부터 발생 시각까지
  const VP = 6.0, VS = 3.5, K = VP * VS / (VP - VS);         // 지각 평균 속도 (모식), K = 8.4 km/s
  const KX = 111.32 * Math.cos(35.8 * Math.PI / 180), KY = 111.0;
  const toXY = (lat, lon) => [(lon - EQ.lon) * KX, (lat - EQ.lat) * KY];
  const STA = [
    { name: "포항", lat: 36.02, lon: 129.37 }, { name: "대구", lat: 35.87, lon: 128.60 }, { name: "부산", lat: 35.18, lon: 129.08 },
    { name: "창원", lat: 35.23, lon: 128.68 }, { name: "안동", lat: 36.57, lon: 128.73 }, { name: "울진", lat: 36.99, lon: 129.40 },
  ].map((s, i) => {
    const [x, y] = toXY(s.lat, s.lon), R = Math.hypot(x, y, EQ.z);
    return { ...s, i, x, y, tp: EQ.t0 + R / VP, ts: EQ.t0 + R / VS };
  });

  /* 모호 면 굴절법 (모식): 지각 V1, 맨틀 V2, 두께 H */
  const V1 = 6.2, V2 = 8.0, H = 33;
  const IC = Math.asin(V1 / V2);
  const tDirect = (x) => x / V1, tHead = (x) => x / V2 + 2 * H * Math.cos(IC) / V1;
  const xCrit = 2 * H * Math.tan(IC);
  const tFirst = (x) => Math.min(tDirect(x), x >= xCrit ? tHead(x) : Infinity);

  let mode = "epi", si = 0, cur = 10, pick = { p: null, s: null }, showTrue = false;
  const WIN = 45, FS = 50;

  /* 관측소마다 고정된 잡음 (같은 기록을 여러 번 보아도 같은 모양) */
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const traces = STA.map((s) => {
    const r = rng(1000 + s.i * 77), n = WIN * FS, y = new Float32Array(n), dist = Math.hypot(s.x, s.y);
    const ap = 0.22 * 40 / (dist + 20), as = 0.85 * 40 / (dist + 20);
    for (let k = 0; k < n; k++) {
      const t = k / FS;
      let v = (r() - 0.5) * 0.05;
      if (t > s.tp) { const u = t - s.tp; v += ap * Math.exp(-u / 2.5) * Math.sin(2 * Math.PI * 6 * u) * (0.6 + 0.8 * r()); }
      if (t > s.ts) { const u = t - s.ts; v += as * Math.exp(-u / 4) * Math.sin(2 * Math.PI * 2.6 * u + r() * 0.6) * (0.5 + 0.7 * r()) * Math.min(1, u * 4 + 0.3); }
      y[k] = v;
    }
    const m = Math.max(...y.map(Math.abs)); for (let k = 0; k < n; k++) y[k] /= m;
    return y;
  });

  const top = fit($(".cv-wide"), () => drawTop());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tA = L.table($(".tbl-a"), [
    { key: "name", label: "관측소" }, { key: "tp", label: "P 도달 (s)", res: 0.01 }, { key: "ts", label: "S 도달 (s)", res: 0.01 },
    { key: "ps", label: "PS시 (s)", res: 0.01 }, { key: "R", label: "진원 거리 R (km)", res: 0.1 },
  ], () => drawPlot());
  const tB = L.table($(".tbl-b"), [{ key: "x", label: "진앙 거리 x (km)", res: 1 }, { key: "t", label: "초동 도달 시간 t (s)", res: 0.01 }], () => drawPlot());

  function drawTop() {
    const { ctx } = top, { w, h } = top.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    if (mode === "epi") drawSeis(ctx, w, h); else drawSection(ctx, w, h);
  }

  function drawSeis(ctx, w, h) {
    const s = STA[si], y = traces[si];
    const bx = { x0: 34, y0: 26, w: w - 46, h: h - 58 };
    const X = (t) => bx.x0 + t / WIN * bx.w, mid = bx.y0 + bx.h / 2;
    NM.axes(ctx, { ...bx, X, Y: (v) => v, xt: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45].map((v) => [v, String(v)]), xlabel: "20:32:50 KST 뒤 시간 (s)" });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 0.8; ctx.beginPath();
    for (let k = 0; k < y.length; k++) { const px = X(k / FS), py = mid - y[k] * bx.h * 0.46; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke();
    ctx.font = `12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText(`${s.name} 관측소 · 상하 성분 (모식 파형)`, bx.x0, 15);
    const mark = (t, lab, c) => { if (t == null) return; ctx.strokeStyle = c; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(X(t), bx.y0); ctx.lineTo(X(t), bx.y0 + bx.h); ctx.stroke(); ctx.fillStyle = c; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(lab, X(t), bx.y0 + 10); };
    mark(pick.p, "P", C.forest); mark(pick.s, "S", C.apple);
    ctx.setLineDash([3, 3]); mark(cur, "", C.warn); ctx.setLineDash([]);
  }

  function drawSection(ctx, w, h) {
    const bx = { x0: 20, y0: 22, w: w - 40, h: h - 40 };
    const X = (x) => bx.x0 + x / 320 * bx.w, Y = (z) => bx.y0 + z / 60 * bx.h;
    ctx.fillStyle = "#efe6d3"; ctx.fillRect(bx.x0, Y(0), bx.w, Y(H) - Y(0));
    ctx.fillStyle = "#e3d3c4"; ctx.fillRect(bx.x0, Y(H), bx.w, Y(60) - Y(H));
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx.x0, Y(H)); ctx.lineTo(bx.x0 + bx.w, Y(H)); ctx.stroke();
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "right";
    ctx.fillText("지각", bx.x0 + bx.w - 4, Y(H) - 6); ctx.fillText("맨틀", bx.x0 + bx.w - 4, Y(H) + 16);
    ctx.textAlign = "left"; ctx.fillText("모호로비치치 불연속면", bx.x0 + 4, Y(H) + 16);
    const x = cur;
    ctx.lineWidth = 1.6; ctx.strokeStyle = C.forest; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(x), Y(0) - 1); ctx.stroke();
    if (x >= xCrit) {
      const d = H * Math.tan(IC);
      ctx.strokeStyle = C.apple; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(d), Y(H)); ctx.lineTo(X(x - d), Y(H)); ctx.lineTo(X(x), Y(0)); ctx.stroke();
    }
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(0), Y(0), 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(X(x), Y(0)); ctx.lineTo(X(x) - 6, Y(0) - 11); ctx.lineTo(X(x) + 6, Y(0) - 11); ctx.fill();
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("발파 지점", X(0) + 8, Y(0) + 16); ctx.textAlign = "center";
    if (X(x) > X(0) + 70) ctx.fillText(`${x} km`, X(x), 14);
    ctx.textAlign = "left"; ctx.fillStyle = C.ink2;
    ctx.fillText(`초록: 직접파   빨강: 굴절파(머리파)   깊이 방향 약 ${((bx.h / 60) / (bx.w / 320)).toFixed(1)}배 과장`, bx.x0, bx.y0 + bx.h + 14);
  }

  /* 공통현(근축)들의 교점: 최소제곱 */
  function solve(rows) {
    const cs = rows.map((r) => { const s = STA.find((q) => q.name === r.name); return { x: s.x, y: s.y, R: r.R }; });
    if (cs.length < 3) return null;
    let a11 = 0, a12 = 0, a22 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) {
      const p = cs[i], q = cs[j], ax = 2 * (q.x - p.x), ay = 2 * (q.y - p.y);
      const b = p.R ** 2 - q.R ** 2 - p.x ** 2 - p.y ** 2 + q.x ** 2 + q.y ** 2;
      a11 += ax * ax; a12 += ax * ay; a22 += ay * ay; b1 += ax * b; b2 += ay * b;
    }
    const det = a11 * a22 - a12 * a12; if (Math.abs(det) < 1e-9) return null;
    const ex = (b1 * a22 - b2 * a12) / det, ey = (a11 * b2 - a12 * b1) / det;
    const hs = cs.map((c) => c.R ** 2 - (ex - c.x) ** 2 - (ey - c.y) ** 2);
    const z = Math.sqrt(Math.max(0, hs.reduce((s, v) => s + v, 0) / hs.length));
    return { ex, ey, z, cs };
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    if (mode === "epi") drawMap(ctx, w, h); else drawTT(ctx, w, h);
  }

  function drawMap(ctx, w, h) {
    const lon0 = 127.9, lon1 = 130.3, lat0 = 34.75, lat1 = 37.35;
    const sc = Math.min((w - 20) / ((lon1 - lon0) * KX), (h - 20) / ((lat1 - lat0) * KY));
    const ox = (w - (lon1 - lon0) * KX * sc) / 2, oy = (h - (lat1 - lat0) * KY * sc) / 2;
    const PX = (lon) => ox + (lon - lon0) * KX * sc, PY = (lat) => oy + (lat1 - lat) * KY * sc;
    const KXY = (x, y) => [PX(EQ.lon + x / KX), PY(EQ.lat + y / KY)];
    ctx.save(); ctx.beginPath(); ctx.rect(PX(lon0), PY(lat1), (lon1 - lon0) * KX * sc, (lat1 - lat0) * KY * sc); ctx.clip();
    ctx.fillStyle = "#dfe8ef"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#f3f1e6"; ctx.strokeStyle = C.ink3; ctx.lineWidth = 0.8;
    for (const p of LAND) {
      ctx.beginPath(); for (let k = 0; k < p.length; k += 2) { const px = PX(p[k]), py = PY(p[k + 1]); k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    const sol = solve(tA.rows);
    tA.rows.forEach((r) => {
      const s = STA.find((q) => q.name === r.name), [cx, cy] = KXY(s.x, s.y);
      ctx.strokeStyle = "rgba(59,124,42,.8)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, cy, r.R * sc, 0, Math.PI * 2); ctx.stroke();
    });
    if (sol) {
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
      for (let i = 0; i < sol.cs.length; i++) for (let j = i + 1; j < sol.cs.length; j++) {
        const p = sol.cs[i], q = sol.cs[j], dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy);
        const a = (p.R ** 2 - q.R ** 2 + d * d) / (2 * d), hh = p.R ** 2 - a * a;
        if (hh <= 0) continue;
        const mx = p.x + a * dx / d, my = p.y + a * dy / d, k = Math.sqrt(hh) / d;
        const [x1, y1] = KXY(mx - dy * k, my + dx * k), [x2, y2] = KXY(mx + dy * k, my - dx * k);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }
      ctx.setLineDash([]);
      const [ex, ey] = KXY(sol.ex, sol.ey);
      ctx.strokeStyle = C.apple; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ex - 6, ey - 6); ctx.lineTo(ex + 6, ey + 6); ctx.moveTo(ex + 6, ey - 6); ctx.lineTo(ex - 6, ey + 6); ctx.stroke();
    }
    if (showTrue) { const [tx, ty] = KXY(0, 0); ctx.fillStyle = C.amber; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(tx, ty, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    ctx.font = `11px ${F.sans}`;
    STA.forEach((s) => {
      const [x, y] = KXY(s.x, s.y);
      ctx.fillStyle = s.i === si ? C.warn : C.ink; ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x - 5, y + 4); ctx.lineTo(x + 5, y + 4); ctx.fill();
      ctx.textAlign = "left"; ctx.fillText(s.name, x + 7, y + 4);
    });
    ctx.restore();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    const bar = 50 * sc, by = PY(lat0) - 10, bxx = PX(lon0) + 10;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bxx, by); ctx.lineTo(bxx + bar, by); ctx.stroke();
    ctx.fillText("50 km", bxx, by - 5);
    $(".n-1").textContent = sol ? `${(EQ.lat + sol.ey / KY).toFixed(2)}°N ${(EQ.lon + sol.ex / KX).toFixed(2)}°E` : "관측소 3곳 이상";
    $(".n-2").textContent = sol ? sol.z.toFixed(1) + " km" : "—";
    $(".n-3").textContent = sol ? Math.hypot(sol.ex, sol.ey).toFixed(1) + " km" : "—";
  }

  function drawTT(ctx, w, h) {
    const bx = { x0: 46, y0: 20, w: w - 60, h: h - 54 };
    const brk = +$(".brk").value;
    const pts = tB.rows.map((r) => ({ x: r.x, y: r.t }));
    const d = tB.rows.filter((r) => r.x < brk), m = tB.rows.filter((r) => r.x >= brk);
    const f1 = d.length > 1 ? L.linfit(d.map((r) => r.x), d.map((r) => r.t), true) : null;
    const f2 = m.length > 1 ? L.linfit(m.map((r) => r.x), m.map((r) => r.t)) : null;
    const res = L.plot(ctx, bx, { pts, xr: [0, 320], yr: [0, 50], xlabel: "진앙 거리 x (km)", ylabel: "초동 도달 시간 t (s)" });
    ctx.save(); ctx.beginPath(); ctx.rect(bx.x0, bx.y0, bx.w, bx.h); ctx.clip();
    const line = (f, c) => { ctx.strokeStyle = c; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(res.X(0), res.Y(f.b || 0)); ctx.lineTo(res.X(320), res.Y(f.a * 320 + (f.b || 0))); ctx.stroke(); };
    if (f1) line(f1, C.forest); if (f2) line(f2, C.apple);
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(res.X(brk), bx.y0); ctx.lineTo(res.X(brk), bx.y0 + bx.h); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    if (f1 && f2) {
      const v1 = 1 / f1.a, v2 = 1 / f2.a, xc = f2.b / (f1.a - f2.a);
      const hX = xc / 2 * Math.sqrt((v2 - v1) / (v2 + v1)), hT = f2.b * v1 * v2 / (2 * Math.sqrt(v2 * v2 - v1 * v1));
      $(".n-1").textContent = `${v1.toFixed(2)} / ${v2.toFixed(2)} km/s`;
      $(".n-2").textContent = `${xc.toFixed(0)} km`;
      $(".n-3").textContent = Number.isFinite(hX) ? `${hX.toFixed(1)} km (절편법 ${hT.toFixed(1)})` : "—";
    } else { $(".n-1").textContent = "—"; $(".n-2").textContent = "—"; $(".n-3").textContent = "—"; }
  }

  function setMode(m) {
    mode = m;
    root.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === m)));
    $(".pane-a").hidden = m !== "epi"; $(".pane-b").hidden = m === "epi";
    $(".cv-plot").classList.toggle("sq", m === "epi");
    const lab = m === "epi" ? ["공통현 교점 (진앙)", "진원 깊이", "기상청 진앙과의 차이"] : ["V₁ / V₂", "교차 거리 x_c", "지각 두께 h"];
    root.querySelectorAll(".nums dt").forEach((dt, i) => { dt.textContent = lab[i]; });
    const sl = $(".cur");
    if (m === "epi") { sl.max = WIN; sl.step = 0.05; cur = Math.min(cur, WIN); } else { sl.max = 300; sl.step = 10; cur = Math.max(10, Math.round(cur / 10) * 10); }
    sl.value = cur; updCur();
    drawTop(); drawPlot();
  }
  const updCur = () => {
    $(".cur-out").textContent = mode === "epi" ? `t = ${(+cur).toFixed(2)} s` : `x = ${cur} km`;
    $(".pick-out").textContent = mode === "epi" ? `P ${pick.p == null ? "—" : pick.p.toFixed(2) + " s"} · S ${pick.s == null ? "—" : pick.s.toFixed(2) + " s"}` : "";
  };
  $(".cur").addEventListener("input", (e) => { cur = +e.target.value; updCur(); drawTop(); });
  $(".set-p").addEventListener("click", () => { pick.p = cur; updCur(); drawTop(); });
  $(".set-s").addEventListener("click", () => { pick.s = cur; updCur(); drawTop(); });
  function recA(p, s) {
    if (p == null || s == null || s <= p) return;
    const name = STA[si].name;
    const old = tA.rows.findIndex((r) => r.name === name); if (old >= 0) tA.rows.splice(old, 1);
    tA.add({ name, tp: p, ts: s, ps: s - p, R: K * (s - p) });
  }
  $(".rec-a").addEventListener("click", () => recA(pick.p, pick.s));
  function measB(x) {
    const t = L.measure(tFirst(x), { sd: 0.08, res: 0.01 });
    tB.add({ x, t });
    tB.rows.sort((a, b) => a.x - b.x); tB.add(tB.rows.pop());
  }
  $(".rec-b").addEventListener("click", () => measB(cur));
  $(".brk").addEventListener("input", (e) => { $(".brk-out").textContent = e.target.value; drawPlot(); });
  $(".truth").addEventListener("click", (e) => { showTrue = !showTrue; e.currentTarget.setAttribute("aria-pressed", String(showTrue)); drawPlot(); });
  $(".clear").addEventListener("click", () => { (mode === "epi" ? tA : tB).clear(); drawPlot(); });
  $(".modes").addEventListener("click", (e) => { const b = e.target.closest("[data-mode]"); if (b) setMode(b.dataset.mode); });
  const stBox = $(".stations");
  stBox.innerHTML = STA.map((s) => `<button class="chip" type="button" data-st="${s.i}" aria-pressed="${s.i === si}">${s.name}</button>`).join("");
  stBox.addEventListener("click", (e) => {
    const b = e.target.closest("[data-st]"); if (!b) return;
    si = +b.dataset.st; pick = { p: null, s: null };
    stBox.querySelectorAll("[data-st]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    updCur(); drawTop(); drawPlot();
  });
  if (L.demo) {
    [1, 2, 4, 0].forEach((i) => { si = i; recA(L.snap(STA[i].tp + 0.06 * L.gauss(), 0.05), L.snap(STA[i].ts + 0.08 * L.gauss(), 0.05)); });
    for (let x = 10; x <= 300; x += 20) measB(x);
    si = 3; pick = { p: L.snap(STA[3].tp + 0.05, 0.05), s: null }; cur = L.snap(STA[3].ts - 0.4, 0.05);
    stBox.querySelectorAll("[data-st]").forEach((x) => x.setAttribute("aria-pressed", String(+x.dataset.st === si)));
  }
  setMode("epi");
})();
