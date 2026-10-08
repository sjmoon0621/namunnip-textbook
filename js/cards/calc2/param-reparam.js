/* 카드: 같은 곡선을 다른 매개변수로 나타내면 기울기도 달라질까? — y = x²의 세 매개변수 A, B, C 비교 */
(() => {
  const root = document.getElementById("card-calc2-param-reparam");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sx = $(".sx"), cv = $("canvas"), S = 0.15;
  const R = [
    { row: ".r-a", t: (x) => x, dx: () => 1, dy: (t) => 2 * t, col: () => K.BLUE },
    { row: ".r-b", t: (x) => x / 2, dx: () => 2, dy: (t) => 8 * t, col: () => C.amber },
    { row: ".r-c", t: (x) => Math.cbrt(x), dx: (t) => 3 * t * t, dy: (t) => 6 * t ** 5, col: () => C.warn },
  ];
  let g = null;
  const { ctx, size } = fit(cv, () => draw());

  function arrow(x1, y1, x2, y2, col) {
    const L = Math.hypot(x2 - x1, y2 - y1);
    if (L < 2) return;
    const ux = (x2 - x1) / L, uy = (y2 - y1) / L, k = Math.min(8, L * 0.5);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - ux * k * 0.6, y2 - uy * k * 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - ux * k - uy * k * 0.5, y2 - uy * k + ux * k * 0.5);
    ctx.lineTo(x2 - ux * k + uy * k * 0.5, y2 - uy * k - ux * k * 0.5); ctx.closePath(); ctx.fill();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = +sx.value, y0 = x0 * x0;
    g = K.frame(ctx, w, h, { xr: [-2.4, 2.4], yr: [-0.6, 4.6], xs: 1, ys: 1 });
    K.curve(ctx, g, (x) => y0 + 2 * x0 * (x - x0), C.ink2, { width: 1.5, dash: [6, 4] });
    K.curve(ctx, g, (x) => x * x, C.forest);
    ctx.save(); ctx.beginPath(); ctx.rect(g.x0, g.y0, g.w, g.h); ctx.clip();
    [...R].reverse().forEach((r) => {
      const t = r.t(x0);
      arrow(g.X(x0), g.Y(y0), g.X(x0 + S * r.dx(t)), g.Y(y0 + S * r.dy(t)), r.col());
    });
    ctx.restore();
    K.dot(ctx, g, x0, y0, C.ink, false, 4);
    K.tag(ctx, g, "y = x²", g.x0 + 6, g.y0 + 10, C.forest);
  }

  function update() {
    const x0 = +sx.value;
    $(".x-out").textContent = n(x0, 2);
    R.forEach((r) => {
      const t = r.t(x0), vx = r.dx(t), vy = r.dy(t), td = root.querySelectorAll(`${r.row} td`);
      td[1].textContent = n(t, 3); td[2].textContent = n(vx, 3); td[3].textContent = n(vy, 3);
      const z = Math.abs(vx) < 1e-9;
      td[4].textContent = z ? "0/0" : n(vy / vx, 3); td[4].className = `m ${z ? "bad" : ""}`;
    });
    draw();
  }

  sx.addEventListener("input", update);
  const drag = (e) => {
    if (!g) return;
    const rc = cv.getBoundingClientRect();
    sx.value = clamp(Math.round(g.ix(e.clientX - rc.left) * 20) / 20, -2, 2); update();
  };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  update();
})();
