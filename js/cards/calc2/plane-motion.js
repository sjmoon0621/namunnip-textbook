/* 카드: 일정한 빠르기로 원을 도는 점에도 가속도가 있을까? — 속도 (x′, y′), 속력, 가속도 (x″, y″) */
(() => {
  const root = document.getElementById("card-calc2-plane-motion");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const st = $(".st");
  const sin = Math.sin, cos = Math.cos, S = 0.5;
  const P = {
    circle: { p: (t) => [2 * cos(t), 2 * sin(t)], v: (t) => [-2 * sin(t), 2 * cos(t)], a: (t) => [-2 * cos(t), -2 * sin(t)], t: [0, 6.28], t0: 0.5, yr: [-3, 3], c: [0, 0] },
    ellipse: { p: (t) => [3 * cos(t), 2 * sin(t)], v: (t) => [-3 * sin(t), 2 * cos(t)], a: (t) => [-3 * cos(t), -2 * sin(t)], t: [0, 6.28], t0: 0.5, yr: [-3, 3], c: [0, 0] },
    throw: { p: (t) => [2 * t, 4 * t - 2 * t * t], v: (t) => [2, 4 - 4 * t], a: () => [0, -4], t: [0, 2], t0: 0.3, yr: [-1, 3.6], c: [2, 1] },
  };
  let key = "circle";
  const { ctx, size } = fit($("canvas"), () => draw());

  function arrow(x1, y1, x2, y2, col) {
    const L = Math.hypot(x2 - x1, y2 - y1); if (L < 2) return;
    const ux = (x2 - x1) / L, uy = (y2 - y1) / L, k = Math.min(9, L * 0.5);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - ux * k * 0.6, y2 - uy * k * 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - ux * k - uy * k * 0.5, y2 - uy * k + ux * k * 0.5);
    ctx.lineTo(x2 - ux * k + uy * k * 0.5, y2 - uy * k - ux * k * 0.5); ctx.closePath(); ctx.fill();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[key], t = +st.value, [x, y] = p.p(t), [vx, vy] = p.v(t), [ax, ay] = p.a(t);
    const half = (p.yr[1] - p.yr[0]) / 2 * (w - 44) / (h - 32);
    const g = K.frame(ctx, w, h, { xr: [p.c[0] - half, p.c[0] + half], yr: p.yr, xs: 1, ys: 1 });
    ctx.save(); ctx.beginPath(); ctx.rect(g.x0, g.y0, g.w, g.h); ctx.clip();
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.4; ctx.beginPath();
    for (let i = 0; i <= 400; i++) { const s = p.t[0] + (p.t[1] - p.t[0]) * i / 400, [px, py] = p.p(s); i ? ctx.lineTo(g.X(px), g.Y(py)) : ctx.moveTo(g.X(px), g.Y(py)); }
    ctx.stroke();
    if (key !== "throw") { ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(g.X(0), g.Y(0)); ctx.lineTo(g.X(x), g.Y(y)); ctx.stroke(); ctx.setLineDash([]); }
    arrow(g.X(x), g.Y(y), g.X(x + S * vx), g.Y(y + S * vy), C.warn);
    arrow(g.X(x), g.Y(y), g.X(x + S * ax), g.Y(y + S * ay), K.BLUE);
    ctx.restore();
    K.dot(ctx, g, x, y, C.ink, false, 5);
    K.tag(ctx, g, "P", g.X(x) + 10, g.Y(y) + 12, C.ink);
    K.tag(ctx, g, "속도", g.X(x + S * vx) + 6, g.Y(y + S * vy) - 10, C.warn);
    K.tag(ctx, g, "가속도", g.X(x + S * ax) + 6, g.Y(y + S * ay) + 10, K.BLUE);
  }

  function update() {
    const p = P[key], t = +st.value, [vx, vy] = p.v(t), [ax, ay] = p.a(t);
    $(".t-out").textContent = n(t, 2);
    $(".n-v").textContent = `(${n(vx, 3)}, ${n(vy, 3)})`;
    $(".n-s").textContent = n(Math.hypot(vx, vy), 3);
    $(".n-a").textContent = `(${n(ax, 3)}, ${n(ay, 3)})`;
    $(".n-m").textContent = n(Math.hypot(ax, ay), 3);
    draw();
  }

  K.chips(root, ".presets .chip", (b) => { key = b.dataset.k; const p = P[key]; st.min = p.t[0]; st.max = p.t[1]; st.value = p.t0; update(); });
  st.addEventListener("input", update);
  update();
})();
