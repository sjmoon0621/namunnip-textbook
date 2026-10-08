/* 카드: 행렬을 더하고 실수배하면 성분은 어떻게 바뀔까? — 2 × 3 행렬의 열을 삼각형 꼭짓점으로 보고 kA ± B 확인 */
(() => {
  const root = document.getElementById("card-cm1-matrix-add");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const X = NMMat;
  const $ = (s) => root.querySelector(s), btns = [...root.querySelectorAll(".op .chip")], cv = $("canvas");
  const sk = $(".k"), sp = $(".p"), sq = $(".q");
  const pts = [[1, 1], [3, 1], [1, 2]];
  const XR = 10, YR = 6.25;
  let sgn = 1, drag = -1, map = null;
  const { ctx, size } = fit(cv, () => draw());

  const A = () => [pts.map((p) => p[0]), pts.map((p) => p[1])];
  const B = () => [[+sp.value, +sp.value, +sp.value], [+sq.value, +sq.value, +sq.value]];
  const res = () => X.add(X.scale(A(), +sk.value), X.scale(B(), sgn));
  const cols = (M) => M[0].map((_, j) => [M[0][j], M[1][j]]);
  const area = (P) => Math.abs((P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (P[1][1] - P[0][1])) / 2;

  function tri(P, fill, stroke, dash) {
    ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(map.X(x), map.Y(y)) : ctx.moveTo(map.X(x), map.Y(y)))); ctx.closePath();
    if (fill) { ctx.globalAlpha = 0.28; ctx.fillStyle = fill; ctx.fill(); ctx.globalAlpha = 1; }
    ctx.setLineDash(dash || []); ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const u = Math.min((w - 8) / (2 * XR), (h - 8) / (2 * YR)), cx = w / 2, cy = h / 2;
    map = { u, X: (x) => cx + x * u, Y: (y) => cy - y * u, ix: (px) => (px - cx) / u, iy: (py) => (cy - py) / u };
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    for (let x = -XR; x <= XR; x++) { ctx.beginPath(); ctx.moveTo(map.X(x), 0); ctx.lineTo(map.X(x), h); ctx.stroke(); }
    for (let y = -6; y <= 6; y++) { ctx.beginPath(); ctx.moveTo(0, map.Y(y)); ctx.lineTo(w, map.Y(y)); ctx.stroke(); }
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText("O", cx + 3, cy + 2); ctx.fillText("5", map.X(5) + 2, cy + 2); ctx.fillText("5", cx + 3, map.Y(5) + 1);
    const k = +sk.value, kA = cols(X.scale(A(), k)), Rp = cols(res()), Ap = cols(A());
    tri(Ap, null, C.ink3);
    if (k !== 1) tri(kA, null, C.amber, [5, 4]);
    tri(Rp, C.leaf, C.forest);
    const [kx, ky] = kA[0], [rx, ry] = Rp[0];
    if (Math.hypot(rx - kx, ry - ky) > 0.4) {
      const x1 = map.X(kx), y1 = map.Y(ky), x2 = map.X(rx), y2 = map.Y(ry), a = Math.atan2(y2 - y1, x2 - x1);
      ctx.strokeStyle = C.forest; ctx.fillStyle = C.forest; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 8 * Math.cos(a - 0.4), y2 - 8 * Math.sin(a - 0.4)); ctx.lineTo(x2 - 8 * Math.cos(a + 0.4), y2 - 8 * Math.sin(a + 0.4)); ctx.fill();
    }
    ctx.font = `600 11px ${F.sans}`; ctx.textBaseline = "middle";
    Ap.forEach(([x, y], j) => {
      ctx.fillStyle = j === drag ? C.ink : C.ink2; ctx.beginPath(); ctx.arc(map.X(x), map.Y(y), j === drag ? 7 : 5.5, 0, 7); ctx.fill();
    });
    Rp.forEach(([x, y], j) => {
      ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(map.X(x), map.Y(y), 4, 0, 7); ctx.fill();
      ctx.textAlign = "left"; ctx.fillText(`${j + 1}열`, map.X(x) + 6, map.Y(y) - 9);
    });
    ctx.restore();
  }

  function update() {
    const k = +sk.value, p = +sp.value, q = +sq.value;
    $(".k-out").textContent = X.n(k); $(".p-out").textContent = X.n(p); $(".q-out").textContent = X.n(q);
    const op = sgn > 0 ? "+" : "−", kt = k === 1 ? "" : k === -1 ? "−" : X.n(k);
    $(".eq").innerHTML = `A = ${X.html(A())}, B = ${X.html(B())}<br><span class="res">${kt}A ${op} B = ${X.html(res())}</span>`;
    const a11 = A()[0][0], pb = sgn * p;
    $(".n-11").textContent = `${X.n(k)}·${X.n(a11)} ${pb < 0 ? "−" : "+"} ${X.n(Math.abs(pb))} = ${X.n(k * a11 + pb)}`;
    const a0 = area(cols(A()));
    $(".n-area").textContent = a0 < 1e-9 ? "A가 한 직선 위" : `${X.n(area(cols(res())) / a0)} (k² = ${X.n(k * k)})`;
    $(".n-dir").textContent = k > 0 ? "그대로" : k < 0 ? "원점 대칭으로 뒤집힘" : "한 점으로 모임";
    draw();
  }

  const at = (e) => { const r = cv.getBoundingClientRect(); return [map.ix(e.clientX - r.left), map.iy(e.clientY - r.top)]; };
  cv.addEventListener("pointerdown", (e) => {
    if (!map) return;
    const [x, y] = at(e);
    let best = -1, bd = 18 / map.u;
    pts.forEach(([px, py], j) => { const d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; best = j; } });
    if (best < 0) return;
    drag = best; cv.setPointerCapture(e.pointerId); cv.style.cursor = "grabbing"; draw();
  });
  cv.addEventListener("pointermove", (e) => {
    if (drag < 0) return;
    const [x, y] = at(e), nx = clamp(Math.round(x), -5, 5), ny = clamp(Math.round(y), -3, 3);
    if (nx === pts[drag][0] && ny === pts[drag][1]) return;
    pts[drag] = [nx, ny]; update();
  });
  const end = () => { if (drag < 0) return; drag = -1; cv.style.cursor = ""; draw(); };
  cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
  btns.forEach((b) => b.addEventListener("click", () => {
    sgn = +b.dataset.s; btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update();
  }));
  [sk, sp, sq].forEach((s) => s.addEventListener("input", update));
  update();
})();
