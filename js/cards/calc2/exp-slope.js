/* 카드: 접선의 기울기가 높이와 같은 지수함수의 밑은? — (a^x)′ = a^x ln a, 기울기 ÷ 높이 = ln a */
(() => {
  const root = document.getElementById("card-calc2-exp-slope");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sa = $(".sa"), sx = $(".sx"), cv = $("canvas");
  let a = 2, g = null;
  const H = 1e-5;
  const f = (x) => Math.pow(a, x);
  const slope = (x) => (f(x + H) - f(x - H)) / (2 * H);
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    g = K.frame(ctx, w, h, { xr: [-2.6, 2], yr: [-0.5, 6], xs: 0.5, ys: 1, xf: (v) => (Number.isInteger(v) ? n(v) : "") });
    const x0 = +sx.value, y0 = f(x0), m = slope(x0);
    K.curve(ctx, g, (x) => y0 + m * (x - x0), C.warn, { width: 1.6, dash: [6, 4] });
    K.curve(ctx, g, f, C.forest);
    K.guide(ctx, g, x0, y0, C.ink3, "x");
    K.dot(ctx, g, x0, y0, C.warn);
    K.tag(ctx, g, `y = ${a === Math.E ? "e" : n(a, 2)}^x`, g.x0 + 8, g.y0 + 12, C.forest);
    K.tag(ctx, g, `기울기 ${n(m, 4)}`, g.X(x0) - 10, g.Y(y0) - 16, C.warn, "right");
  }

  function update() {
    const x0 = +sx.value, y0 = f(x0), m = slope(x0);
    $(".a-out").textContent = a === Math.E ? "e = 2.71828…" : n(a, 2);
    $(".x-out").textContent = n(x0, 2);
    $(".n-y").textContent = n(y0, 4); $(".n-m").textContent = n(m, 4);
    const r = $(".n-r"); r.textContent = n(m / y0, 4); r.className = `n-r ${Math.abs(m / y0 - 1) < 0.005 ? "good" : ""}`;
    $(".n-ln").textContent = n(Math.log(a), 4);
    $(".eq").innerHTML = `(<i>a</i><sup><i>x</i></sup>)′ = <i>a</i><sup><i>x</i></sup> · ln <i>a</i> = ${n(y0, 4)} × ${n(Math.log(a), 4)} = ${n(y0 * Math.log(a), 4)}`;
    draw();
  }

  K.chips(root, ".presets .chip", (b) => { a = b.dataset.a === "e" ? Math.E : +b.dataset.a; sa.value = a; update(); });
  const clear = () => root.querySelectorAll(".presets .chip").forEach((b) => b.setAttribute("aria-pressed", "false"));
  sa.addEventListener("input", () => { a = +sa.value; clear(); update(); });
  sx.addEventListener("input", update);
  const drag = (e) => {
    if (!g) return;
    const r = cv.getBoundingClientRect();
    sx.value = clamp(Math.round(g.ix(e.clientX - r.left) * 20) / 20, -2.5, 1.8); update();
  };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  update();
})();
