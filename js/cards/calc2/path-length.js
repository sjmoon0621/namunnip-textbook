/* 카드: 평면 위를 움직인 점은 얼마나 먼 길을 갔을까? — 꺾은선의 길이가 속력의 적분 ∫√(x′² + y′²) dt로 */
(() => {
  const root = document.getElementById("card-calc2-path-length");
  if (!root) return;
  const { C, F } = NM;
  const K = NMCalc, I = NMInteg, n = K.n;
  const $ = (s) => root.querySelector(s), sn = $(".sn"), st = $(".st");
  const PI = Math.PI;
  const P = [
    { x: Math.cos, y: Math.sin, dx: (t) => -Math.sin(t), dy: Math.cos, T: 6.28, box: [-1.1, 1.1, -1.1, 1.1] },
    { x: (t) => t - Math.sin(t), y: (t) => 1 - Math.cos(t), dx: (t) => 1 - Math.cos(t), dy: Math.sin, T: 6.28, box: [-0.1, 6.5, -0.1, 2.2] },
    { x: (t) => t, y: (t) => t * t / 2, dx: () => 1, dy: (t) => t, T: 2, box: [-0.1, 2.2, -0.1, 2.2] },
  ];
  let k = 0;
  const { ctx, size } = NM.fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[k], m = +sn.value, t = +st.value, [x0, x1, y0, y1] = p.box, pad = 14;
    const sc = Math.min((w - 2 * pad) / (x1 - x0), (h - 2 * pad) / (y1 - y0));
    const ox = (w - sc * (x1 - x0)) / 2, oy = (h - sc * (y1 - y0)) / 2;
    const X = (x) => ox + (x - x0) * sc, Y = (y) => h - oy - (y - y0) * sc;
    ctx.save(); ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath();
    ctx.moveTo(X(x0), Y(0)); ctx.lineTo(X(x1), Y(0)); ctx.moveTo(X(0), Y(y0)); ctx.lineTo(X(0), Y(y1)); ctx.stroke();
    const path = (a, b, N) => { ctx.beginPath(); for (let i = 0; i <= N; i++) { const s = a + (b - a) * i / N; i ? ctx.lineTo(X(p.x(s)), Y(p.y(s))) : ctx.moveTo(X(p.x(s)), Y(p.y(s))); } };
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); path(0, p.T, 300); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.6; path(0, t, 300); ctx.stroke();
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; path(0, t, m); ctx.stroke();
    ctx.fillStyle = C.warn;
    for (let i = 0; i <= m; i++) { const s = t * i / m; ctx.beginPath(); ctx.arc(X(p.x(s)), Y(p.y(s)), 3, 0, 7); ctx.fill(); }
    const px = X(p.x(t)), py = Y(p.y(t)), vx = p.dx(t), vy = p.dy(t), L = 0.45 * sc;
    const ex = px + vx * L, ey = py - vy * L, ang = Math.atan2(ey - py, ex - px);
    ctx.strokeStyle = K.BLUE; ctx.fillStyle = K.BLUE; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ex, ey); ctx.stroke();
    if (Math.hypot(ex - px, ey - py) > 6) { ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 8 * Math.cos(ang - 0.4), ey - 8 * Math.sin(ang - 0.4)); ctx.lineTo(ex - 8 * Math.cos(ang + 0.4), ey - 8 * Math.sin(ang + 0.4)); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(px, py, 5, 0, 7); ctx.fill();
    ctx.font = `600 11.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText("P", px + 8, py - 8);
    ctx.restore();
  }

  function update() {
    const p = P[k], m = +sn.value, t = +st.value;
    let poly = 0;
    for (let i = 1; i <= m; i++) { const a = t * (i - 1) / m, b = t * i / m; poly += Math.hypot(p.x(b) - p.x(a), p.y(b) - p.y(a)); }
    const speed = (s) => Math.hypot(p.dx(s), p.dy(s));
    $(".n-out").textContent = m; $(".t-out").textContent = n(t, 2);
    $(".n-v").textContent = `(${n(p.dx(t), 3)}, ${n(p.dy(t), 3)})`; $(".n-sp").textContent = n(speed(t), 4);
    $(".n-p").textContent = n(poly, 4); $(".n-i").textContent = n(I.simp(speed, 0, t, 2000), 4);
    draw();
  }

  K.chips(root, ".fn .chip", (bt) => { k = +bt.dataset.k; st.max = P[k].T; st.value = P[k].T; update(); });
  sn.addEventListener("input", update); st.addEventListener("input", update);
  update();
})();
