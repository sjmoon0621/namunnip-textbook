/* 카드: 보이지 않는 전기장을 어떻게 그릴까? — 점전하의 중첩으로 계산한 전기력선·등전위선 */
(() => {
  const root = document.getElementById("card-phy-field");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const showLines = $(".show-lines"), showEq = $(".show-eq");
  const nV = $(".pv"), nE = $(".pe"), nQ = $(".pq"), selOut = $(".sel-out");
  const BLUE = "#2f6fa3";

  const K = 8.99e9;               // N·m²/C²
  const WX = 16, WY = 9;          // 보이는 영역 (cm)
  const PRESETS = {
    dipole: [[5.5, 4.5, 1], [10.5, 4.5, -1]],
    same: [[5.5, 4.5, 1], [10.5, 4.5, 1]],
    unequal: [[6, 4.5, 2], [10.5, 4.5, -1]],
    single: [[8, 4.5, 1]],
  };
  let Q = [], sel = 0, probe = { x: 8, y: 2.2 };
  const load = (k) => { Q = PRESETS[k].map(([x, y, q]) => ({ x, y, q })); sel = 0; };
  load("dipole");

  // 전위 V (볼트): q는 nC, 거리는 cm → k·q·1e-9 / (r·0.01)
  const pot = (x, y) => { let v = 0; for (const c of Q) v += K * c.q * 1e-9 / (Math.hypot(x - c.x, y - c.y) * 0.01); return v; };
  // 전기장 (N/C), 화면 좌표계 그대로(y 아래 방향)
  const field = (x, y) => {
    let ex = 0, ey = 0;
    for (const c of Q) {
      const dx = (x - c.x) * 0.01, dy = (y - c.y) * 0.01, r2 = dx * dx + dy * dy, r = Math.sqrt(r2);
      const e = K * c.q * 1e-9 / r2;
      ex += e * dx / r; ey += e * dy / r;
    }
    return [ex, ey];
  };

  const P = fit(cv, () => draw());

  // 전기력선 한 가닥: 방향 dir(+1: E 방향, −1: 반대)으로 따라간다
  function trace(x, y, dir, from) {
    const pts = [[x, y]], ds = 0.04;
    const f = (px, py) => { const [ex, ey] = field(px, py); const m = Math.hypot(ex, ey) || 1; return [dir * ex / m, dir * ey / m]; };
    let end = null;
    for (let i = 0; i < 1400; i++) {
      const [k1x, k1y] = f(x, y);
      const [k2x, k2y] = f(x + k1x * ds / 2, y + k1y * ds / 2);
      const [k3x, k3y] = f(x + k2x * ds / 2, y + k2y * ds / 2);
      const [k4x, k4y] = f(x + k3x * ds, y + k3y * ds);
      x += ds / 6 * (k1x + 2 * k2x + 2 * k3x + k4x);
      y += ds / 6 * (k1y + 2 * k2y + 2 * k3y + k4y);
      pts.push([x, y]);
      const hit = Q.find((c) => c !== from && Math.hypot(x - c.x, y - c.y) < 0.18);
      if (hit) { end = hit; break; }
      if (x < -6 || x > WX + 6 || y < -6 || y > WY + 6) break;
    }
    return { pts, end };
  }

  function draw() {
    const { ctx, size: { w, h } } = P;
    if (!w) return;
    const s = w / WX, X = (x) => x * s, Y = (y) => y * s;
    ctx.clearRect(0, 0, w, h);

    // 격자 (1 cm)
    ctx.strokeStyle = "rgba(35,35,38,.05)"; ctx.lineWidth = 1;
    for (let i = 1; i < WX; i++) { ctx.beginPath(); ctx.moveTo(X(i) + .5, 0); ctx.lineTo(X(i) + .5, h); ctx.stroke(); }
    for (let j = 1; j < WY; j++) { ctx.beginPath(); ctx.moveTo(0, Y(j) + .5); ctx.lineTo(w, Y(j) + .5); ctx.stroke(); }

    // 등전위선: 격자에서 전위를 계산하고 마칭 스퀘어로 선을 찾는다
    if (showEq.checked && Q.length) {
      const cell = Math.max(4, Math.round(w / 170)), nx = Math.ceil(w / cell) + 1, ny = Math.ceil(h / cell) + 1;
      const G = new Float64Array(nx * ny);
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) G[j * nx + i] = pot(i * cell / s, j * cell / s);
      const hasPos = Q.some((c) => c.q > 0), hasNeg = Q.some((c) => c.q < 0);
      const levels = [100, 200, 400, 800, 1600].flatMap((v) => [v, -v]);
      if (hasPos && hasNeg) levels.push(0);
      ctx.lineWidth = 1.2;
      for (const L of levels) {
        ctx.strokeStyle = L > 0 ? "rgba(181,83,47,.7)" : L < 0 ? "rgba(47,111,163,.7)" : "rgba(35,35,38,.55)";
        ctx.setLineDash(L === 0 ? [4, 3] : []);
        ctx.beginPath();
        for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
          const a = G[j * nx + i] - L, b = G[j * nx + i + 1] - L, c = G[(j + 1) * nx + i + 1] - L, d = G[(j + 1) * nx + i] - L;
          const pts = [];
          const x0 = i * cell, y0 = j * cell;
          if ((a > 0) !== (b > 0)) pts.push([x0 + cell * a / (a - b), y0]);
          if ((b > 0) !== (c > 0)) pts.push([x0 + cell, y0 + cell * b / (b - c)]);
          if ((c > 0) !== (d > 0)) pts.push([x0 + cell * (1 - c / (c - d)), y0 + cell]);
          if ((d > 0) !== (a > 0)) pts.push([x0, y0 + cell * (1 - d / (d - a))]);
          if (pts.length >= 2) { ctx.moveTo(...pts[0]); ctx.lineTo(...pts[1]); }
          if (pts.length === 4) { ctx.moveTo(...pts[2]); ctx.lineTo(...pts[3]); }
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // 전기력선: 양전하에서 |q|×12가닥 출발. 음전하에서 거꾸로 따라가 양전하에 닿지 않는 선만 더한다
    if (showLines.checked) {
      const lines = [];
      for (const c of Q) {
        const n = 12 * Math.abs(c.q), dir = c.q > 0 ? 1 : -1;
        for (let k = 0; k < n; k++) {
          const a = (k + 0.5) / n * Math.PI * 2;
          const t = trace(c.x + 0.2 * Math.cos(a), c.y + 0.2 * Math.sin(a), dir, c);
          if (dir < 0 && t.end && t.end.q > 0) continue;
          lines.push({ pts: dir > 0 ? t.pts : t.pts.slice().reverse() });
        }
      }
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.1; ctx.fillStyle = C.ink;
      for (const { pts } of lines) {
        ctx.beginPath(); ctx.moveTo(X(pts[0][0]), Y(pts[0][1]));
        for (let i = 1; i < pts.length; i++) ctx.lineTo(X(pts[i][0]), Y(pts[i][1]));
        ctx.stroke();
        // 화살촉: 화면 안의 구간 중간쯤
        const vis = pts.filter(([x, y]) => x > 0.3 && x < WX - 0.3 && y > 0.3 && y < WY - 0.3);
        if (vis.length > 30) {
          const m = Math.min(vis.length - 2, Math.floor(vis.length * 0.45));
          const [x1, y1] = vis[m], [x2, y2] = vis[m + 1];
          const ang = Math.atan2(y2 - y1, x2 - x1);
          ctx.save(); ctx.translate(X(x1), Y(y1)); ctx.rotate(ang);
          ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-3.5, -3.2); ctx.lineTo(-3.5, 3.2); ctx.closePath(); ctx.fill();
          ctx.restore();
        }
      }
    }

    // 탐침: 그 자리의 전기장 화살표
    const [ex, ey] = field(probe.x, probe.y), em = Math.hypot(ex, ey);
    if (Q.length && em > 0) {
      const L = NM.clamp(10 * Math.log10(em / 1e3), 8, 46);
      const px = X(probe.x), py = Y(probe.y), ux = ex / em, uy = ey / em;
      ctx.strokeStyle = C.forest; ctx.fillStyle = C.forest; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + ux * L, py + uy * L); ctx.stroke();
      ctx.save(); ctx.translate(px + ux * L, py + uy * L); ctx.rotate(Math.atan2(uy, ux));
      ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(-4, -4.5); ctx.lineTo(-4, 4.5); ctx.closePath(); ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fillStyle = C.card; ctx.fill(); ctx.stroke();
    }

    // 전하
    Q.forEach((c, i) => {
      const x = X(c.x), y = Y(c.y), r = 9 + 2 * Math.abs(c.q);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = c.q > 0 ? C.warn : BLUE; ctx.fill();
      if (i === sel) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r + 4, 0, Math.PI * 2); ctx.stroke(); }
      ctx.fillStyle = "#fff"; ctx.font = `600 ${r > 12 ? 12 : 11}px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText((c.q > 0 ? "+" : "−") + Math.abs(c.q), x, y + 4);
    });
    ctx.textAlign = "left";

    // 눈금자
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`;
    ctx.fillRect(10, h - 12, s, 1.5); ctx.fillText("1 cm", 14 + s, h - 8);
    ctx.textAlign = "right"; ctx.fillText("전하 단위: nC", w - 8, h - 8); ctx.textAlign = "left";
  }

  const fmt = (v) => {
    const a = Math.abs(v);
    if (a >= 1e5) { const e = Math.floor(Math.log10(a)); return `${(v / 10 ** e).toFixed(2)}×10${sup(e)}`; }
    return Math.round(v).toLocaleString("ko-KR");
  };
  const sup = (n) => String(n).split("").map((d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d] || "⁻").join("");

  function update() {
    const v = pot(probe.x, probe.y), [ex, ey] = field(probe.x, probe.y);
    nV.textContent = Q.length ? `${fmt(v)} V` : "—";
    nE.textContent = Q.length ? `${fmt(Math.hypot(ex, ey))} N/C` : "—";
    const tot = Q.reduce((a, c) => a + c.q, 0);
    nQ.textContent = `${tot > 0 ? "+" : tot < 0 ? "−" : ""}${Math.abs(tot)} nC`;
    const c = Q[sel];
    selOut.textContent = c ? `${c.q > 0 ? "+" : "−"}${Math.abs(c.q)} nC` : "없음";
    root.querySelectorAll("[data-q]").forEach((b) => b.setAttribute("aria-pressed", String(!!c && +b.dataset.q === c.q)));
    draw();
  }

  // 끌기: 전하를 잡으면 옮기고, 빈 곳이면 탐침을 옮긴다
  let drag = -1;
  const toWorld = (e) => { const r = cv.getBoundingClientRect(), s = r.width / WX; return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s }; };
  cv.addEventListener("pointerdown", (e) => {
    const p = toWorld(e), s = cv.clientWidth / WX;
    drag = Q.findIndex((c) => Math.hypot(p.x - c.x, p.y - c.y) * s < 16 + 2 * Math.abs(c.q));
    if (drag >= 0) { sel = drag; cv.setPointerCapture(e.pointerId); }
    else probe = p;
    update();
  });
  cv.addEventListener("pointermove", (e) => {
    const p = toWorld(e);
    if (drag >= 0) { Q[drag].x = NM.clamp(p.x, 0.4, WX - 0.4); Q[drag].y = NM.clamp(p.y, 0.4, WY - 0.4); update(); }
    else if (e.pointerType === "mouse") { probe = p; update(); }
  });
  const up = () => { drag = -1; };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);

  root.querySelectorAll("[data-preset]").forEach((b) => b.addEventListener("click", () => { load(b.dataset.preset); update(); }));
  root.querySelectorAll("[data-q]").forEach((b) => b.addEventListener("click", () => { if (Q[sel]) { Q[sel].q = +b.dataset.q; update(); } }));
  $(".add").addEventListener("click", () => {
    if (Q.length >= 4) return;
    Q.push({ x: 3 + Math.random() * 10, y: 1.5 + Math.random() * 6, q: 1 }); sel = Q.length - 1; update();
  });
  $(".del").addEventListener("click", () => { if (Q.length > 1) { Q.splice(sel, 1); sel = 0; update(); } });
  showLines.addEventListener("change", draw); showEq.addEventListener("change", draw);
  update();
})();
