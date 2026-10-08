/* 카드: 지수가 √2여도 (xʳ)′ = r xʳ⁻¹일까? — x^r = e^(r ln x)와 합성함수의 미분법 */
(() => {
  const root = document.getElementById("card-calc2-power-real");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sr = $(".sr"), sx = $(".sx"), cv = $("canvas");
  const H = 1e-5;
  let r = Math.SQRT2, rl = "√2", g = null;
  const f = (x) => Math.pow(x, r);
  const slope = (x) => (f(x + H) - f(x - H)) / (2 * H);
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = +sx.value, y0 = f(x0), m = slope(x0);
    g = K.frame(ctx, w, h, { xr: [-0.3, 4.3], yr: [-0.5, 6], xs: 1, ys: 1 });
    K.curve(ctx, g, (x) => y0 + m * (x - x0), C.warn, { width: 1.6, dash: [6, 4] });
    K.curve(ctx, g, (x) => (x > 0 ? f(x) : NaN), C.forest, { from: 0.005, to: 4.3, N: 800 });
    K.guide(ctx, g, x0, y0, C.ink3, "x");
    if (y0 < 6) K.dot(ctx, g, x0, y0, C.warn);
    K.tag(ctx, g, `y = x^${rl}`, g.x0 + 6, g.y0 + 10, C.forest);
  }

  function update() {
    const x0 = +sx.value, y0 = f(x0), m = slope(x0);
    $(".r-out").textContent = rl; $(".x-out").textContent = n(x0, 2);
    $(".n-y").textContent = n(y0, 4); $(".n-m").textContent = n(m, 4);
    $(".n-f").textContent = n(r * Math.pow(x0, r - 1), 4); $(".n-k").textContent = n(x0 * m / y0, 4);
    draw();
  }

  const SPEC = { s2: [Math.SQRT2, "√2"], pi: [Math.PI, "π"], "0.5": [0.5, "1/2"], "-1": [-1, "−1"] };
  K.chips(root, ".presets .chip", (b) => { [r, rl] = SPEC[b.dataset.r]; sr.value = r; update(); });
  sr.addEventListener("input", () => {
    r = +sr.value; rl = n(r, 2);
    root.querySelectorAll(".presets .chip").forEach((x) => x.setAttribute("aria-pressed", "false")); update();
  });
  sx.addEventListener("input", update);
  const drag = (e) => {
    if (!g) return;
    const rc = cv.getBoundingClientRect();
    sx.value = clamp(Math.round(g.ix(e.clientX - rc.left) * 20) / 20, 0.2, 4); update();
  };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  update();
})();
