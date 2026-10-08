/* 카드: 속함수를 u로 바꾸면 넓이는 어디로 옮겨 갈까? — x축의 띠 8개가 u = g(x)로 옮겨 가도 넓이가 같음 */
(() => {
  const root = document.getElementById("card-calc2-substitution");
  if (!root) return;
  const { C, clamp } = NM;
  const K = NMCalc, I = NMInteg, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sb = $(".sb"), cv = $("canvas");
  const P = [
    { f: Math.cos, F: Math.sin, g: (x) => x * x, gp: (x) => 2 * x, bmax: 2, b0: 1.5,
      xr: [0, 2.1], yr: [-4, 2], ys: 1, ur: [-0.1, 4.3], uy: [-1.3, 1.3], uys: 0.5,
      xl: "y = 2x cos(x²)", ul: "y = cos u", eq: "<i>u</i> = <i>x</i><sup>2</sup>, d<i>u</i> = 2<i>x</i> d<i>x</i> → ∫cos <i>u</i> d<i>u</i> = sin <i>u</i> + C" },
    { f: (u) => 1 / u, F: Math.log, g: (x) => 1 + x * x, gp: (x) => 2 * x, bmax: 2, b0: 1.5,
      xr: [0, 2.1], yr: [-0.2, 1.2], ys: 0.5, ur: [0, 5.2], uy: [-0.2, 1.2], uys: 0.5,
      xl: "y = 2x/(1 + x²)", ul: "y = 1/u", eq: "<i>u</i> = 1 + <i>x</i><sup>2</sup>, d<i>u</i> = 2<i>x</i> d<i>x</i> → ∫1/<i>u</i> d<i>u</i> = ln |<i>u</i>| + C" },
    { f: Math.exp, F: Math.exp, g: Math.sin, gp: Math.cos, bmax: 3.14, b0: 1.2,
      xr: [0, 3.2], yr: [-1.6, 1.4], ys: 0.5, ur: [-0.1, 1.2], uy: [-0.3, 3], uys: 1,
      xl: "y = e^(sin x) cos x", ul: "y = e^u", eq: "<i>u</i> = sin <i>x</i>, d<i>u</i> = cos <i>x</i> d<i>x</i> → ∫<i>e</i><sup><i>u</i></sup> d<i>u</i> = <i>e</i><sup><i>u</i></sup> + C" },
  ];
  const COL = [C.forest, K.BLUE];
  let k = 0, top = null;
  const { ctx, size } = NM.fit(cv, () => draw());
  const hx = (p) => (x) => p.f(p.g(x)) * p.gp(x);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[k], b = +sb.value, half = Math.round(h / 2), N = 8, xs = 0.5;
    top = K.frame(ctx, w, h, { xr: p.xr, yr: p.yr, xs, ys: p.ys, T: 10, B: h - half + 10 });
    const bot = K.frame(ctx, w, h, { xr: p.ur, yr: p.uy, xs: p.ur[1] > 2 ? 1 : 0.5, ys: p.uys, T: half + 18, B: 22 });
    for (let i = 0; i < N; i++) {
      const x1 = b * i / N, x2 = b * (i + 1) / N, col = COL[i % 2];
      I.shade(ctx, top, hx(p), x1, x2, { pos: col, neg: col, alpha: 0.32, N: 30 });
      I.shade(ctx, bot, p.f, p.g(x1), p.g(x2), { pos: col, neg: col, alpha: 0.22, N: 30 });
    }
    K.curve(ctx, top, hx(p), C.forest);
    K.curve(ctx, bot, p.f, C.forest, { from: Math.max(p.ur[0], 0.02) });
    I.vline(ctx, top, b, C.warn);
    I.vline(ctx, bot, p.g(0), C.ink3); I.vline(ctx, bot, p.g(b), C.warn);
    K.tag(ctx, top, p.xl, top.x0 + top.w - 4, top.y0 + 10, C.forest, "right");
    K.tag(ctx, bot, p.ul, bot.x0 + bot.w - 4, bot.y0 + 10, C.forest, "right");
    K.tag(ctx, bot, `u: ${n(p.g(0), 2)} → ${n(p.g(b), 2)}`, bot.x0 + bot.w - 4, bot.y0 + 28, C.warn, "right");
  }

  function update() {
    const p = P[k], b = +sb.value;
    $(".b-out").textContent = n(b, 2);
    $(".eq").innerHTML = p.eq;
    $(".n-x").textContent = n(I.simp(hx(p), 0, b, 2000), 4);
    $(".n-u").textContent = n(I.simp(p.f, p.g(0), p.g(b), 2000), 4);
    $(".n-f").textContent = n(p.F(p.g(b)) - p.F(p.g(0)), 4);
    draw();
  }

  K.chips(root, ".fn .chip", (bt) => { k = +bt.dataset.k; sb.max = P[k].bmax; sb.value = P[k].b0; update(); });
  sb.addEventListener("input", update);
  const drag = (e) => { if (!top) return; sb.value = clamp(Math.round(I.px(cv, top, e) * 100) / 100, 0.05, P[k].bmax); update(); };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  update();
})();
