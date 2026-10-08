/* 카드: 두 함수를 더하면 기울기도 더해질까? — F(x) = k·x² + m·x³에서 F′(a)와 k·f′(a) + m·g′(a) 비교 */
(() => {
  const root = document.getElementById("card-calc1-sum-rule");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sk = $(".sk"), sm = $(".sm"), sa = $(".sa"), cv = $("canvas");
  const f = (x) => x * x, df = (x) => 2 * x, g = (x) => x ** 3, dg = (x) => 3 * x * x;
  const HH = 0.001; // 평균변화율에 쓰는 h
  let G = null;
  const { ctx, size } = fit(cv, () => draw());
  const st = () => { const k = +sk.value, m = +sm.value, a = +sa.value; return { k, m, a, F: (x) => k * f(x) + m * g(x) }; };
  /* k·x² + m·x³ 식 (0인 항은 뺀다) */
  const coef = (c, body, first) => {
    if (c === 0) return "";
    const s = c < 0 ? " − " : first ? "" : " + ", v = Math.abs(c);
    return (first && c < 0 ? "−" : s) + (v === 1 ? "" : n(v, 1)) + body;
  };
  const expr = (k, m) => { const a = coef(m, "<i>x</i><sup>3</sup>", true), b = coef(k, "<i>x</i><sup>2</sup>", !a); return a + b || "0"; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = st(), Fa = s.F(s.a), dF = s.k * df(s.a) + s.m * dg(s.a);
    G = K.frame(ctx, w, h, { xr: [-2.2, 2.2], yr: [-6, 6], xs: 1, ys: 2 });
    K.curve(ctx, G, f, C.leaf, { width: 1.6, dash: [5, 4] });
    K.curve(ctx, G, g, K.BLUE, { width: 1.6, dash: [5, 4] });
    K.curve(ctx, G, s.F, C.forest, { width: 2.8 });
    K.curve(ctx, G, (x) => Fa + dF * (x - s.a), C.warn, { from: s.a - 1, to: s.a + 1, width: 2 });
    K.dot(ctx, G, s.a, Fa, C.ink);
    K.tag(ctx, G, "f = x²", G.x0 + 6, G.y0 + 10, C.leaf);
    K.tag(ctx, G, "g = x³", G.x0 + 6, G.y0 + 28, K.BLUE);
    K.tag(ctx, G, "y = kf + mg", G.x0 + 6, G.y0 + 46, C.forest);
  }

  function update() {
    const s = st(), F = s.F, a = s.a;
    $(".k-out").textContent = n(s.k, 1); $(".m-out").textContent = n(s.m, 1); $(".a-out").textContent = n(a, 1);
    $(".eq").innerHTML = `<i>y</i> = ${expr(s.k, s.m)}`;
    $(".n-f").textContent = n(df(a), 3); $(".n-g").textContent = n(dg(a), 3);
    const p = (v) => (v < 0 ? `(${n(v, 3)})` : n(v, 3));
    $(".n-r").textContent = `${p(s.k)} × ${p(df(a))} + ${p(s.m)} × ${p(dg(a))} = ${n(s.k * df(a) + s.m * dg(a), 3)}`;
    $(".n-m").textContent = n((F(a + HH) - F(a)) / HH, 3);
    draw();
  }

  K.chips(root, ".ex .chip", (bt) => { const [k, m] = bt.dataset.p.split(",").map(Number); sk.value = k; sm.value = m; update(); });
  [sk, sm, sa].forEach((el) => el.addEventListener("input", update));
  const drag = (e) => {
    if (!G) return;
    const r = cv.getBoundingClientRect();
    sa.value = clamp(Math.round(G.ix(e.clientX - r.left) * 10) / 10, -1.5, 1.5); update();
  };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  update();
})();
