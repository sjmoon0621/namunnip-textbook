/* 카드: 도로 지도를 수의 표로 바꿀 수 있을까? — 네 마을 도로망 ↔ 4 × 4 행렬 (a_ij = i에서 j로 가는 도로 수) */
(() => {
  const root = document.getElementById("card-cm1-road-matrix");
  if (!root) return;
  const { C, F, fit } = NM;
  const X = NMMat;
  const $ = (s) => root.querySelector(s), btns = [...root.querySelectorAll(".mode .chip")], cv = $("canvas");
  const NAME = ["가", "나", "다", "라"];
  const POS = [[0.16, 0.2], [0.84, 0.16], [0.82, 0.82], [0.2, 0.84]];
  const PAIRS = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
  const START = {
    two: [[0, 1, 2, 0], [1, 0, 1, 0], [2, 1, 0, 1], [0, 0, 1, 0]],
    one: [[0, 1, 0, 0], [0, 0, 1, 0], [1, 0, 0, 1], [0, 0, 1, 0]],
  };
  const R = { two: START.two.map((r) => r.slice()), one: START.one.map((r) => r.slice()) };
  let mode = "two", sel = 2, geo = null;
  const { ctx, size } = fit(cv, () => draw());

  function arrow(x1, y1, x2, y2, off, color, head) {
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy * off, ny = ux * off;
    const ax = x1 + ux * 15 + nx, ay = y1 + uy * 15 + ny, bx = x2 - ux * 15 + nx, by = y2 - uy * 15 + ny;
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    if (head) {
      ctx.beginPath(); ctx.moveTo(bx, by);
      ctx.lineTo(bx - ux * 9 - uy * 4.5, by - uy * 9 + ux * 4.5); ctx.lineTo(bx - ux * 9 + uy * 4.5, by - uy * 9 - ux * 4.5); ctx.fill();
    }
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const A = R[mode], nw = w * (w < 420 ? 0.42 : 0.5), pad = 18;
    const P = POS.map(([x, y]) => [pad + x * (nw - 2 * pad), pad + y * (h - 2 * pad)]);
    for (const [i, j] of PAIRS) {
      const [x1, y1] = P[i], [x2, y2] = P[j];
      const hot = i === sel || j === sel;
      if (mode === "two") {
        const c = A[i][j];
        if (!c) { ctx.setLineDash([3, 4]); arrow(x1, y1, x2, y2, 0, C.rule, false); ctx.setLineDash([]); continue; }
        const col = hot ? C.forest : C.ink2;
        if (c === 1) arrow(x1, y1, x2, y2, 0, col, false);
        else { arrow(x1, y1, x2, y2, 4, col, false); arrow(x1, y1, x2, y2, -4, col, false); }
      } else {
        const f = A[i][j], b = A[j][i];
        if (!f && !b) { ctx.setLineDash([3, 4]); arrow(x1, y1, x2, y2, 0, C.rule, false); ctx.setLineDash([]); continue; }
        const both = f && b;
        if (f) arrow(x1, y1, x2, y2, both ? 4 : 0, i === sel ? C.forest : j === sel ? C.amber : C.ink2, true);
        if (b) arrow(x2, y2, x1, y1, both ? 4 : 0, j === sel ? C.forest : i === sel ? C.amber : C.ink2, true);
      }
    }
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    P.forEach(([x, y], k) => {
      ctx.fillStyle = k === sel ? C.forest : C.card; ctx.strokeStyle = k === sel ? C.forest : C.ink;
      ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y, 13, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = k === sel ? C.card : C.ink; ctx.font = `700 13px ${F.sans}`; ctx.fillText(NAME[k], x, y + 0.5);
    });

    const mx0 = nw + 8, mw = w - mx0 - 6;
    const cs = Math.min(36, (mw - 34) / 5.2, (h - 34) / 4.6);
    const gx = mx0 + 24 + (mw - 24 - cs * 5.2) / 2, gy = 24 + (h - 24 - cs * 4) / 2;
    geo = { P, gx, gy, cs };
    ctx.fillStyle = C.sprout; ctx.globalAlpha = 0.45;
    ctx.fillRect(gx, gy + sel * cs, cs * 4, cs); ctx.fillRect(gx + sel * cs, gy, cs, cs * 4);
    ctx.globalAlpha = 1;
    ctx.font = `600 11px ${F.sans}`;
    for (let k = 0; k < 4; k++) {
      ctx.fillStyle = k === sel ? C.forest : C.ink3;
      ctx.fillText(NAME[k], gx + (k + 0.5) * cs, gy - 11);
      ctx.fillText(NAME[k], gx - 14, gy + (k + 0.5) * cs);
    }
    ctx.fillStyle = C.ink3; ctx.fillText("합", gx + 4.6 * cs, gy - 11);
    ctx.font = `600 9.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("출발 ↓  도착 →", gx - 24, gy - 26 < 4 ? 4 : gy - 26);
    ctx.textAlign = "center";
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const v = A[i][j], diag = i === j;
        ctx.font = `${v ? 700 : 400} ${Math.round(Math.min(16, cs * 0.45))}px ${F.mono}`;
        ctx.fillStyle = diag ? C.ink3 : v ? C.ink : C.ink3;
        ctx.fillText(String(v), gx + (j + 0.5) * cs, gy + (i + 0.5) * cs);
      }
      ctx.font = `600 ${Math.round(Math.min(14, cs * 0.4))}px ${F.mono}`; ctx.fillStyle = i === sel ? C.forest : C.ink2;
      ctx.fillText(String(A[i].reduce((s, v) => s + v, 0)), gx + 4.6 * cs, gy + (i + 0.5) * cs);
    }
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(gx + 2, gy + 2); ctx.lineTo(gx + 4 * cs - 2, gy + 4 * cs - 2); ctx.stroke(); ctx.setLineDash([]);
    X.paren(ctx, gx - 5, gy - 1, 4 * cs + 10, 4 * cs + 2, C.ink);
  }

  function update() {
    const A = R[mode], s = A.flat().reduce((a, v) => a + v, 0);
    const sym = A.every((r, i) => r.every((v, j) => v === A[j][i]));
    $(".n-tot").textContent = mode === "two" ? `${s / 2}개 (${s} ÷ 2)` : `${s}개`;
    const f = $(".n-sym"); f.textContent = sym ? "예 (대칭)" : "아니요"; f.className = `n-sym ${sym ? "good" : "bad"}`;
    $(".d-out").textContent = `${NAME[sel]}에서 나가는 (제${sel + 1}행 합)`;
    $(".d-in").textContent = `${NAME[sel]}로 들어오는 (제${sel + 1}열 합)`;
    $(".n-out").textContent = `${A[sel].reduce((a, v) => a + v, 0)}개`;
    $(".n-in").textContent = `${A.reduce((a, r) => a + r[sel], 0)}개`;
    draw();
  }

  function segDist(px, py, [x1, y1], [x2, y2]) {
    const dx = x2 - x1, dy = y2 - y1, t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(px - x1 - t * dx, py - y1 - t * dy);
  }
  function bump(i, j) {
    const A = R[mode];
    if (mode === "two") { A[i][j] = A[j][i] = (A[i][j] + 1) % 3; return; }
    A[i][j] ^= 1;
  }
  cv.addEventListener("click", (e) => {
    if (!geo) return;
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const node = geo.P.findIndex(([nx, ny]) => Math.hypot(x - nx, y - ny) < 17);
    if (node >= 0) { sel = node; update(); return; }
    const j = Math.floor((x - geo.gx) / geo.cs), i = Math.floor((y - geo.gy) / geo.cs);
    if (i >= 0 && i < 4 && j >= 0 && j < 4) { if (i !== j) bump(i, j); sel = i; update(); return; }
    let best = null, bd = 14;
    for (const [a, b] of PAIRS) { const d = segDist(x, y, geo.P[a], geo.P[b]); if (d < bd) { bd = d; best = [a, b]; } }
    if (!best) return;
    const [a, b] = best;
    if (mode === "two") bump(a, b);
    else { const A = R.one, s = (A[a][b] + 2 * A[b][a] + 1) % 4; A[a][b] = s & 1; A[b][a] = s >> 1; }
    update();
  });
  btns.forEach((b) => b.addEventListener("click", () => {
    mode = b.dataset.k; btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update();
  }));
  update();
})();
