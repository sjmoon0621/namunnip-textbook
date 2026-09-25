/* 카드: 등압선만 보고 바람을 알 수 있을까? — 등압선, 기압 경도, 지상풍 (모식 기압장) */
(() => {
  const root = document.getElementById("card-earth-isobar");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sK = $(".k"), oK = $(".k-out"), cbFric = $(".nofric");
  const nP = $(".n-p"), nG = $(".n-g"), nV = $(".n-v"), nD = $(".n-d");

  const WKM = 2400;                      // 가로 폭 (km)
  let hemi = 1;
  // 위치는 km 단위, 원점은 그림 중앙 (x 동쪽, y 북쪽)
  const H = { x: -600, y: 80 }, L = { x: 560, y: -60 }, P = { x: 60, y: -300 };
  const RHO = 1.2, FCOR = 2 * 7.292e-5 * Math.sin(37 * Math.PI / 180);

  const pres = (x, y) => {
    const k = +sK.value;
    return 1013 + 14 * k * Math.exp(-((x - H.x) ** 2 + (y - H.y) ** 2) / (2 * 420 ** 2))
      - 18 * k * Math.exp(-((x - L.x) ** 2 + (y - L.y) ** 2) / (2 * 360 ** 2));
  };
  // 바람 (m/s): 지균풍을 저기압 쪽으로 30° 돌리고 0.7배 (마찰 없으면 그대로)
  function wind(x, y) {
    const e = 2, gx = (pres(x + e, y) - pres(x - e, y)) / (2 * e), gy = (pres(x, y + e) - pres(x, y - e)) / (2 * e); // hPa/km
    const G = Math.hypot(gx, gy) * 100 / 1000;   // Pa/m
    let Vg = G / (RHO * FCOR);
    // 지균풍 방향: 북반구 k×∇p (∇p를 시계 반대로 90°), 남반구는 반대
    let ux = -gy * hemi, uy = gx * hemi;
    const n = Math.hypot(ux, uy) || 1; ux /= n; uy /= n;
    const fric = !cbFric.checked;
    if (fric) {
      const a = 30 * Math.PI / 180 * hemi; // 북반구: 시계 반대로 돌려 저기압 쪽으로
      const rx = ux * Math.cos(a) - uy * Math.sin(a), ry = ux * Math.sin(a) + uy * Math.cos(a);
      ux = rx; uy = ry; Vg *= 0.7;
    }
    return { ux, uy, V: Vg, grad: Math.hypot(gx, gy) * 100 };
  }
  const DIRS = ["북", "북북동", "북동", "동북동", "동", "동남동", "남동", "남남동", "남", "남남서", "남서", "서남서", "서", "서북서", "북서", "북북서"];
  const fromDir = (ux, uy) => { const b = (Math.atan2(-ux, -uy) * 180 / Math.PI + 360) % 360; return DIRS[Math.round(b / 22.5) % 16] + "풍"; };

  // 마칭 스퀘어로 등압선 선분 만들기
  function contour(grid, nx, ny, lev) {
    const segs = [];
    const it = (a, b) => (lev - a) / (b - a);
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const a = grid[j][i], b = grid[j][i + 1], c = grid[j + 1][i + 1], d = grid[j + 1][i];
      const idx = (a > lev) | ((b > lev) << 1) | ((c > lev) << 2) | ((d > lev) << 3);
      if (idx === 0 || idx === 15) continue;
      const T = [i + it(a, b), j], R = [i + 1, j + it(b, c)], B = [i + it(d, c), j + 1], Lf = [i, j + it(a, d)];
      const map = { 1: [[Lf, T]], 2: [[T, R]], 3: [[Lf, R]], 4: [[R, B]], 5: [[Lf, T], [R, B]], 6: [[T, B]], 7: [[Lf, B]], 8: [[B, Lf]], 9: [[B, T]], 10: [[T, R], [B, Lf]], 11: [[B, R]], 12: [[R, Lf]], 13: [[R, T]], 14: [[T, Lf]] };
      map[idx].forEach((s) => segs.push(s));
    }
    return segs;
  }

  const { ctx, size } = fit(cv, () => draw());
  let S = 1; // px per km
  const toPx = (x, y) => [size.w / 2 + x * S, size.h / 2 - y * S];
  const toKm = (px, py) => [(px - size.w / 2) / S, -(py - size.h / 2) / S];

  function arrow(x1, y1, x2, y2, col, lw) {
    const a = Math.atan2(y2 - y1, x2 - x1), hl = 4 + lw * 1.5;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hl * Math.cos(a - .5), y2 - hl * Math.sin(a - .5)); ctx.lineTo(x2 - hl * Math.cos(a + .5), y2 - hl * Math.sin(a + .5)); ctx.closePath(); ctx.fill();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    S = w / WKM;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#f7f8f4"; ctx.fillRect(0, 0, w, h);
    // 격자에서 기압 계산
    const step = w < 480 ? 9 : 12, nx = Math.ceil(w / step) + 1, ny = Math.ceil(h / step) + 1;
    const grid = [];
    let pmin = 1e9, pmax = -1e9;
    for (let j = 0; j < ny; j++) { const row = []; for (let i = 0; i < nx; i++) { const [x, y] = toKm(i * step, j * step); const p = pres(x, y); row.push(p); pmin = Math.min(pmin, p); pmax = Math.max(pmax, p); } grid.push(row); }
    ctx.font = `10px ${F.mono}`;
    for (let lev = Math.ceil(pmin / 4) * 4; lev <= pmax; lev += 4) {
      const segs = contour(grid, nx, ny, lev);
      ctx.strokeStyle = lev === 1012 ? C.ink2 : "rgba(93,93,97,.55)"; ctx.lineWidth = lev % 20 === 0 ? 1.6 : 1;
      ctx.beginPath();
      let best = null;
      segs.forEach(([a, b]) => {
        const ax = a[0] * step, ay = a[1] * step, bx = b[0] * step, by = b[1] * step;
        ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
        const my = (ay + by) / 2, mx = (ax + bx) / 2;
        if (mx > 20 && mx < w - 30 && my > 14 && my < h - 8 && (!best || my > best[1])) best = [mx, my];
      });
      ctx.stroke();
      if (best) { ctx.fillStyle = "#f7f8f4"; ctx.fillRect(best[0] - 14, best[1] - 7, 28, 12); ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.fillText(String(lev), best[0], best[1] + 3); }
    }
    // 바람 화살표
    const gs = w < 480 ? 46 : 62;
    for (let py = gs / 2; py < h; py += gs) for (let px = gs / 2; px < w; px += gs) {
      const [x, y] = toKm(px, py), wd = wind(x, y);
      if (wd.V < 1.5) continue;
      const len = clamp(6 + wd.V * 1.2, 8, gs * .8);
      arrow(px - wd.ux * len / 2, py + wd.uy * len / 2, px + wd.ux * len / 2, py - wd.uy * len / 2, "rgba(59,124,42,.75)", 1.4);
    }
    // H, L
    const mark = (o, t, col) => {
      const [x, y] = toPx(o.x, o.y);
      ctx.font = `800 ${w < 480 ? 20 : 26}px ${F.sans}`; ctx.fillStyle = col; ctx.textAlign = "center"; ctx.fillText(t, x, y + 9);
      ctx.font = `10px ${F.sans}`; ctx.fillText(t === "H" ? "고기압" : "저기압", x, y + 24);
    };
    mark(H, "H", "#3f6fa3"); mark(L, "L", C.warn);
    // 관측점
    const wd = wind(P.x, P.y), [qx, qy] = toPx(P.x, P.y);
    ctx.beginPath(); ctx.arc(qx, qy, 7, 0, Math.PI * 2); ctx.fillStyle = C.forest; ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
    if (wd.V > 0.3) { const len = clamp(14 + wd.V * 2, 18, 70); arrow(qx, qy, qx + wd.ux * len, qy - wd.uy * len, C.ink, 2.2); }
    // 축척과 방위
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; const sb = 500 * S;
    ctx.beginPath(); ctx.moveTo(10, h - 10); ctx.lineTo(10 + sb, h - 10); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText("500 km", 12, h - 14);
    ctx.textAlign = "right"; ctx.fillText("↑ 북", w - 8, 14);
    ctx.fillText(hemi > 0 ? "북반구" : "남반구", w - 8, 28);
  }

  function update() {
    oK.textContent = (+sK.value).toFixed(1);
    const wd = wind(P.x, P.y);
    nP.textContent = `${pres(P.x, P.y).toFixed(1)} hPa`;
    nG.textContent = `${wd.grad.toFixed(1)} hPa/100 km`;
    nV.textContent = wd.V < 0.5 ? "거의 0" : `${wd.V.toFixed(0)} m/s`;
    nD.textContent = wd.V < 0.5 ? "—" : fromDir(wd.ux, wd.uy);
    draw();
  }
  sK.addEventListener("input", update); cbFric.addEventListener("change", update);
  root.querySelectorAll(".hemi").forEach((b) => b.addEventListener("click", () => {
    hemi = +b.dataset.h; root.querySelectorAll(".hemi").forEach((c) => c.setAttribute("aria-pressed", String(c === b))); update();
  }));
  // 끌기
  let drag = null;
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener("pointerdown", (e) => {
    const [px, py] = pos(e);
    const cand = [P, H, L].map((o) => { const [x, y] = toPx(o.x, o.y); return [o, Math.hypot(x - px, y - py)]; }).sort((a, b) => a[1] - b[1])[0];
    drag = cand[1] < 28 ? cand[0] : P;
    cv.setPointerCapture(e.pointerId); move(e);
  });
  const move = (e) => {
    if (!drag) return;
    const [px, py] = pos(e), [x, y] = toKm(clamp(px, 4, size.w - 4), clamp(py, 4, size.h - 4));
    drag.x = x; drag.y = y; update();
  };
  cv.addEventListener("pointermove", move);
  cv.addEventListener("pointerup", () => (drag = null));
  update();
})();
