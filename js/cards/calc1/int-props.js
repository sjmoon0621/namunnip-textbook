/* 카드: 구간을 나누어 적분해도 될까? — 가운데 점 c를 끌어 구간 나누기와 실수배 성질 확인 */
(() => {
  const root = document.getElementById("card-calc1-int-props");
  if (!root) return;
  const { C, fit } = NM, K = NMCalc, I = NMInt;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sA = $(".a"), sB = $(".b"), sC = $(".c"), sK = $(".k");
  let p = [0, -2, 1], g = null;
  const { ctx, size } = fit(cv, () => draw());
  const kp = () => p.map((c) => c * +sK.value);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    g = K.frame(ctx, w, h, { xr: [-3, 3], yr: [-6, 6], ys: 2 });
    const a = +sA.value, b = +sB.value, c = +sC.value, q = kp(), f = (x) => I.at(q, x);
    I.fill(ctx, g, f, a, c, { split: false, pos: K.BLUE, alpha: .28 });
    I.fill(ctx, g, f, c, b, { split: false, pos: C.amber, alpha: .32 });
    K.curve(ctx, g, (x) => I.at(p, x), C.ink3, { width: 1.4, dash: [4, 4] });
    K.curve(ctx, g, f, C.forest, { width: 2.6 });
    [[a, "a", C.ink], [b, "b", C.ink]].forEach(([x, l, col]) => { K.guide(ctx, g, x, f(x), col, "x"); K.tag(ctx, g, l, g.X(x) - 4, g.Y(0) + 16, col); });
    K.guide(ctx, g, c, f(c), C.warn, "x");
    I.handle(ctx, g.X(c), g.Y(0), C.warn);
    K.tag(ctx, g, "c", g.X(c) - 4, g.Y(0) - 18, C.warn);
  }

  function update() {
    const a = +sA.value, b = +sB.value, c = +sC.value, k = +sK.value, q = kp();
    [["a", a], ["b", b], ["c", c], ["k", k]].forEach(([n, v]) => ($(`.${n}-out`).textContent = K.n(v)));
    const ac = I.def(q, a, c), cb = I.def(q, c, b), ab = I.def(q, a, b);
    $(".n-ac").textContent = I.frac(ac, 60); $(".n-cb").textContent = I.frac(cb, 60);
    $(".n-sum").textContent = I.frac(ac + cb, 60); $(".n-ab").textContent = I.frac(ab, 60);
    $(".kline").innerHTML = `∫<sub>a</sub><sup>b</sup> ${K.n(k)}·<i>f</i>(<i>x</i>)<i>dx</i> = ${I.frac(ab, 60)} &nbsp; ${K.n(k)} × ∫<sub>a</sub><sup>b</sup> <i>f</i>(<i>x</i>)<i>dx</i> = ${K.n(k)} × ${I.frac(I.def(p, a, b), 60)} = ${I.frac(k * I.def(p, a, b), 60)}`;
    draw();
  }

  I.drag(cv, (px, py) => (g && Math.hypot(px - g.X(+sC.value), py - g.Y(0)) < 18 ? "c" : null), (id, px) => { sC.value = NM.clamp(Math.round(g.ix(px) * 2) / 2, -3, 3); update(); });
  K.chips(root, ".presets .chip", (b) => { p = b.dataset.p.split(",").map(Number); update(); });
  [sA, sB, sC, sK].forEach((s) => s.addEventListener("input", update));
  update();
})();
