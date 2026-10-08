/* 카드: 몫 f/g의 도함수는 f′/g′일까? — 접선의 기울기와 f′/g′, (f′g − fg′)/g² 비교 */
(() => {
  const root = document.getElementById("card-calc2-quotient");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sx = $(".sx"), cv = $("canvas");
  const g1 = (x) => x * x + 1, g1p = (x) => 2 * x;
  const P = {
    a: { f: (x) => x, fp: () => 1, lab: "y = x/(x²+1)", xr: [-3.2, 3.2], yr: [-0.75, 0.75], ys: 0.25 },
    b: { f: () => 1, fp: () => 0, lab: "y = 1/(x²+1)", xr: [-3.2, 3.2], yr: [-0.2, 1.2], ys: 0.5 },
    c: { f: Math.exp, fp: Math.exp, lab: "y = eˣ/(x²+1)", xr: [-3.2, 3.2], yr: [-0.2, 2.2], ys: 0.5 },
  };
  let key = "a", g = null;
  const H = 1e-5;
  const q = (x) => P[key].f(x) / g1(x);
  const slope = (x) => (q(x + H) - q(x - H)) / (2 * H);
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[key], x0 = +sx.value, y0 = q(x0), m = slope(x0);
    g = K.frame(ctx, w, h, { xr: p.xr, yr: p.yr, xs: 1, ys: p.ys });
    K.curve(ctx, g, (x) => y0 + m * (x - x0), C.warn, { width: 1.6, dash: [6, 4] });
    K.curve(ctx, g, q, C.forest);
    K.guide(ctx, g, x0, y0, C.ink3, "x");
    K.dot(ctx, g, x0, y0, C.warn);
    K.tag(ctx, g, p.lab, g.x0 + 6, g.y0 + 10, C.forest);
  }

  function update() {
    const p = P[key], x0 = +sx.value;
    const f = p.f(x0), fp = p.fp(x0), gv = g1(x0), gp = g1p(x0);
    $(".x-out").textContent = n(x0, 2);
    $(".n-f").textContent = n(f, 4); $(".n-fp").textContent = n(fp, 4);
    $(".n-g").textContent = n(gv, 4); $(".n-gp").textContent = n(gp, 4);
    $(".n-m").textContent = n(slope(x0), 4);
    $(".n-w").textContent = Math.abs(gp) < 1e-12 ? "0으로 나눔" : n(fp / gp, 4);
    $(".n-q").textContent = n((fp * gv - f * gp) / (gv * gv), 4);
    draw();
  }

  K.chips(root, ".presets .chip", (b) => { key = b.dataset.k; update(); });
  sx.addEventListener("input", update);
  const drag = (e) => {
    if (!g) return;
    const r = cv.getBoundingClientRect();
    sx.value = clamp(Math.round(g.ix(e.clientX - r.left) * 20) / 20, -3, 3); update();
  };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  update();
})();
