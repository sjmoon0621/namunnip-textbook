/* 카드: 곡선 위의 한 점에서 그은 접선의 방정식은? — 점 P를 끌면 y − f(a) = f′(a)(x − a)와 접선이 곡선과 다시 만나는 점이 바뀐다 */
(() => {
  const root = document.getElementById("card-calc1-tangent-line");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sa = $(".sa"), cv = $("canvas");
  /* again: 접선이 곡선과 다시 만나는 x (삼차함수는 (x − a)²(x + 2a) = 0에서 x = −2a) */
  const FN = {
    cub3: { f: (x) => x ** 3 - 3 * x, d: (x) => 3 * x * x - 3, yr: [-4, 4], ys: 2, again: (a) => -2 * a },
    sq: { f: (x) => x * x, d: (x) => 2 * x, yr: [-2, 5], ys: 1, again: null },
    cube: { f: (x) => x ** 3, d: (x) => 3 * x * x, yr: [-5, 5], ys: 1, again: (a) => -2 * a },
  };
  let k = "cub3", G = null;
  const { ctx, size } = fit(cv, () => draw());
  const lineEq = (m, b) => {
    const mm = +m.toFixed(3), bb = +b.toFixed(3);
    let s = mm === 0 ? "" : (mm === 1 ? "" : mm === -1 ? "−" : n(mm, 3)) + "<i>x</i>";
    if (bb !== 0 || !s) s += s ? (bb < 0 ? " − " : " + ") + n(Math.abs(bb), 3) : n(bb, 3);
    return "<i>y</i> = " + s;
  };
  const par = (v) => (v < 0 ? `(${n(v, 3)})` : n(v, 3));

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const P = FN[k], a = +sa.value, fa = P.f(a), m = P.d(a);
    G = K.frame(ctx, w, h, { xr: [-2.5, 2.5], yr: P.yr, xs: 1, ys: P.ys });
    K.curve(ctx, G, P.f, C.forest);
    K.curve(ctx, G, (x) => fa + m * (x - a), C.warn, { width: 2 });
    if (P.again && Math.abs(a) > 1e-9) {
      const q = P.again(a);
      if (q >= -2.5 && q <= 2.5) { K.dot(ctx, G, q, P.f(q), K.BLUE); K.tag(ctx, G, "Q", G.X(q) + 9, G.Y(P.f(q)) + 14, K.BLUE); }
    }
    K.dot(ctx, G, a, fa, C.ink);
    K.tag(ctx, G, "P", G.X(a) - 9, G.Y(fa) - 14, C.ink, "right");
  }

  function update() {
    const P = FN[k], a = +sa.value, fa = P.f(a), m = P.d(a);
    $(".a-out").textContent = n(a, 1);
    $(".n-p").textContent = `(${n(a, 1)}, ${n(fa, 3)})`;
    $(".n-m").textContent = n(m, 3);
    $(".n-q").textContent = !P.again ? "없음" : Math.abs(a) < 1e-9 ? "없음 (P에서 뚫고 지나감)" : `x = ${n(P.again(a), 2)}`;
    $(".eq").innerHTML = `<i>y</i> − ${par(fa)} = ${par(m)}(<i>x</i> − ${par(a)}) &nbsp;→&nbsp; ${lineEq(m, fa - m * a)}`;
    draw();
  }

  K.chips(root, ".ex .chip", (bt) => { k = bt.dataset.k; update(); });
  sa.addEventListener("input", update);
  const drag = (e) => {
    if (!G) return;
    const r = cv.getBoundingClientRect();
    sa.value = clamp(Math.round(G.ix(e.clientX - r.left) * 10) / 10, -2, 2); update();
  };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  update();
})();
