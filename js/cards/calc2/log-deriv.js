/* 카드: y = ln x의 접선의 기울기는 왜 1/x일까? — (ln x)′ = 1/x, (log_a x)′ = 1/(x ln a), (ln|x|)′ = 1/x */
(() => {
  const root = document.getElementById("card-calc2-log-deriv");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sx = $(".sx"), cv = $("canvas");
  const P = {
    ln: { f: (x) => Math.log(x), lab: "y = ln x", lo: 0.2, xr: [-0.6, 6.2], ok: "1/x" },
    log2: { f: (x) => Math.log2(x), lab: "y = log₂ x", lo: 0.2, xr: [-0.6, 6.2], ok: "1/(x ln 2)" },
    abs: { f: (x) => Math.log(Math.abs(x)), lab: "y = ln|x|", lo: -6, xr: [-6.2, 6.2], ok: "1/x" },
  };
  let key = "ln", g = null;
  const H = 1e-5;
  const { ctx, size } = fit(cv, () => draw());
  const slope = (x) => (P[key].f(x + H) - P[key].f(x - H)) / (2 * H);
  const xval = () => { const x = +sx.value; return Math.abs(x) < 0.2 ? (x < 0 ? -0.2 : 0.2) : x; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[key], x0 = xval(), y0 = p.f(x0), m = slope(x0);
    g = K.frame(ctx, w, h, { xr: p.xr, yr: [-3, 3], xs: 1, ys: 1 });
    K.curve(ctx, g, (x) => y0 + m * (x - x0), C.warn, { width: 1.6, dash: [6, 4] });
    if (key === "abs") { K.curve(ctx, g, p.f, C.forest, { from: -6.2, to: -0.01 }); K.curve(ctx, g, p.f, C.forest, { from: 0.01, to: 6.2 }); }
    else K.curve(ctx, g, p.f, C.forest, { from: 0.005, to: 6.2, N: 800 });
    K.guide(ctx, g, x0, y0, C.ink3, "x");
    K.dot(ctx, g, x0, y0, C.warn);
    K.tag(ctx, g, p.lab, g.x0 + g.w - 6, g.y0 + g.h - 12, C.forest, "right");
    K.tag(ctx, g, `기울기 ${n(m, 4)}`, g.X(x0) + (x0 > 3 ? -10 : 10), g.Y(y0) - 16, C.warn, x0 > 3 ? "right" : "left");
  }

  function update() {
    const p = P[key], x0 = xval(), m = slope(x0);
    $(".x-out").textContent = n(x0, 2);
    $(".n-x").textContent = n(x0, 2); $(".n-y").textContent = n(p.f(x0), 4);
    $(".n-m").textContent = n(m, 4); $(".n-xm").textContent = n(x0 * m, 4);
    const exact = key === "log2" ? 1 / (x0 * Math.LN2) : 1 / x0;
    $(".eq").innerHTML = `공식 ${p.ok} 에 <i>x</i> = ${n(x0, 2)}을 넣으면 ${n(exact, 4)}`;
    draw();
  }

  K.chips(root, ".presets .chip", (b) => {
    key = b.dataset.k; const p = P[key];
    sx.min = p.lo; sx.value = clamp(+sx.value, p.lo, 6); update();
  });
  sx.addEventListener("input", update);
  const drag = (e) => {
    if (!g) return;
    const r = cv.getBoundingClientRect();
    sx.value = clamp(Math.round(g.ix(e.clientX - r.left) * 20) / 20, P[key].lo, 6); update();
  };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  update();
})();
