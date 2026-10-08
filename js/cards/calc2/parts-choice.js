/* 카드: 어느 쪽을 미분하고 어느 쪽을 적분해야 할까? — u, v′을 바꾸어 고를 때 새 적분 ∫u′v의 모양 비교 */
(() => {
  const root = document.getElementById("card-calc2-parts-choice");
  if (!root) return;
  const { C } = NM;
  const K = NMCalc, I = NMInteg, n = K.n;
  const $ = (s) => root.querySelector(s), sb = $(".sb");
  const E = Math.exp, L = Math.log;
  const P = [
    { a: 0, bmin: 0.1, bmax: 2, b0: 1.5, lab: "y = x e^x", c: [
      { u: (x) => x, v: E, du: () => 1, dv: E, nl: "새: y = e^x",
        h: "<i>u</i> = <i>x</i>, d<i>v</i> = <i>e</i><sup><i>x</i></sup> d<i>x</i> → d<i>u</i> = d<i>x</i>, <i>v</i> = <i>e</i><sup><i>x</i></sup><br>∫<i>x</i> <i>e</i><sup><i>x</i></sup> d<i>x</i> = <i>x</i> <i>e</i><sup><i>x</i></sup> − ∫<i>e</i><sup><i>x</i></sup> d<i>x</i>" },
      { u: E, v: (x) => x * x / 2, du: E, dv: (x) => x, nl: "새: y = (x²/2) e^x",
        h: "<i>u</i> = <i>e</i><sup><i>x</i></sup>, d<i>v</i> = <i>x</i> d<i>x</i> → d<i>u</i> = <i>e</i><sup><i>x</i></sup> d<i>x</i>, <i>v</i> = <i>x</i><sup>2</sup>/2<br>∫<i>x</i> <i>e</i><sup><i>x</i></sup> d<i>x</i> = (<i>x</i><sup>2</sup>/2)<i>e</i><sup><i>x</i></sup> − ∫(<i>x</i><sup>2</sup>/2)<i>e</i><sup><i>x</i></sup> d<i>x</i>" }] },
    { a: 0, bmin: 0.1, bmax: 3.14, b0: 2, lab: "y = x sin x", c: [
      { u: (x) => x, v: (x) => -Math.cos(x), du: () => 1, dv: Math.sin, nl: "새: y = −cos x",
        h: "<i>u</i> = <i>x</i>, d<i>v</i> = sin <i>x</i> d<i>x</i> → d<i>u</i> = d<i>x</i>, <i>v</i> = −cos <i>x</i><br>∫<i>x</i> sin <i>x</i> d<i>x</i> = −<i>x</i> cos <i>x</i> + ∫cos <i>x</i> d<i>x</i>" },
      { u: Math.sin, v: (x) => x * x / 2, du: Math.cos, dv: (x) => x, nl: "새: y = (x²/2) cos x",
        h: "<i>u</i> = sin <i>x</i>, d<i>v</i> = <i>x</i> d<i>x</i> → d<i>u</i> = cos <i>x</i> d<i>x</i>, <i>v</i> = <i>x</i><sup>2</sup>/2<br>∫<i>x</i> sin <i>x</i> d<i>x</i> = (<i>x</i><sup>2</sup>/2) sin <i>x</i> − ∫(<i>x</i><sup>2</sup>/2) cos <i>x</i> d<i>x</i>" }] },
    { a: 1, bmin: 1.1, bmax: 3, b0: 2.5, lab: "y = x ln x", c: [
      { u: L, v: (x) => x * x / 2, du: (x) => 1 / x, dv: (x) => x, nl: "새: y = x/2",
        h: "<i>u</i> = ln <i>x</i>, d<i>v</i> = <i>x</i> d<i>x</i> → d<i>u</i> = (1/<i>x</i>) d<i>x</i>, <i>v</i> = <i>x</i><sup>2</sup>/2<br>∫<i>x</i> ln <i>x</i> d<i>x</i> = (<i>x</i><sup>2</sup>/2) ln <i>x</i> − ∫<i>x</i>/2 d<i>x</i>" },
      { u: (x) => x, v: (x) => x * L(x) - x, du: () => 1, dv: L, nl: "새: y = x ln x − x",
        h: "<i>u</i> = <i>x</i>, d<i>v</i> = ln <i>x</i> d<i>x</i> → d<i>u</i> = d<i>x</i>, <i>v</i> = <i>x</i> ln <i>x</i> − <i>x</i><br>∫<i>x</i> ln <i>x</i> d<i>x</i> = <i>x</i>(<i>x</i> ln <i>x</i> − <i>x</i>) − ∫(<i>x</i> ln <i>x</i> − <i>x</i>) d<i>x</i>" }] },
  ];
  let k = 0, ci = 0;
  const { ctx, size } = NM.fit($("canvas"), () => draw());
  const step = (span) => [0.25, 0.5, 1, 2, 5, 10].find((s) => span / s <= 6) || 20;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[k], c = p.c[ci], b = +sb.value;
    const f = (x) => c.u(x) * c.dv(x), q = (x) => c.du(x) * c.v(x);
    let lo = 0, hi = 0;
    for (let i = 0; i <= 100; i++) { const x = p.a + (p.bmax - p.a) * i / 100; lo = Math.min(lo, f(x), q(x)); hi = Math.max(hi, f(x), q(x)); }
    const pad = (hi - lo) * 0.08, ys = step(hi - lo);
    const g = K.frame(ctx, w, h, { xr: [p.a - 0.05, p.bmax + 0.05], yr: [lo - pad, hi + pad], xs: 0.5, ys, L: 38 });
    I.shade(ctx, g, f, p.a, b, { pos: C.forest, neg: C.forest, alpha: 0.25 });
    I.shade(ctx, g, q, p.a, b, { pos: K.BLUE, neg: K.BLUE, alpha: 0.15 });
    K.curve(ctx, g, q, K.BLUE, { width: 2, dash: [6, 4] });
    K.curve(ctx, g, f, C.forest);
    I.vline(ctx, g, b, C.warn);
    K.tag(ctx, g, p.lab, g.x0 + 4, g.y0 + 10, C.forest);
    K.tag(ctx, g, c.nl, g.x0 + 4, g.y0 + 28, K.BLUE);
  }

  function update() {
    const p = P[k], c = p.c[ci], b = +sb.value;
    $(".b-out").textContent = n(b, 2);
    $(".eq").innerHTML = c.h;
    const o = I.simp((x) => c.u(x) * c.dv(x), p.a, b, 2000), r = c.u(b) * c.v(b) - c.u(p.a) * c.v(p.a), q = I.simp((x) => c.du(x) * c.v(x), p.a, b, 2000);
    $(".n-o").textContent = n(o, 4); $(".n-r").textContent = n(r, 4); $(".n-n").textContent = n(q, 4); $(".n-d").textContent = n(r - q, 4);
    draw();
  }

  K.chips(root, ".fn .chip", (bt) => { k = +bt.dataset.k; const p = P[k]; sb.min = p.bmin; sb.max = p.bmax; sb.value = p.b0; update(); });
  K.chips(root, ".pick .chip", (bt) => { ci = +bt.dataset.c; update(); });
  sb.addEventListener("input", update);
  update();
})();
