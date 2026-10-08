/* 카드: 항이 n개인 합의 극한을 넓이로 읽을 수 있을까? — 항 = 높이 × 너비로 보고 직사각형 n개의 합이 정적분으로 */
(() => {
  const root = document.getElementById("card-calc2-sum-read");
  if (!root) return;
  const { C } = NM;
  const K = NMCalc, I = NMInteg, n = K.n;
  const $ = (s) => root.querySelector(s), sn = $(".sn");
  const PI = Math.PI;
  const P = [
    { term: (k, m) => k * k / m ** 3, f: (x) => x * x, a: 0, len: 1, exact: 1 / 3, xr: [-0.05, 1.08], yr: [-0.05, 1.1], xs: 0.25, ys: 0.25,
      eq: "<i>k</i><sup>2</sup>/<i>n</i><sup>3</sup> = (1/<i>n</i>) · (<i>k</i>/<i>n</i>)<sup>2</sup> → ∫<sub>0</sub><sup>1</sup> <i>x</i><sup>2</sup> d<i>x</i> = 1/3", lab: "y = x²" },
    { term: (k, m) => 1 / (m + k), f: (x) => 1 / (1 + x), a: 0, len: 1, exact: Math.LN2, xr: [-0.05, 1.08], yr: [-0.05, 1.1], xs: 0.25, ys: 0.25,
      eq: "1/(<i>n</i> + <i>k</i>) = (1/<i>n</i>) · 1/(1 + <i>k</i>/<i>n</i>) → ∫<sub>0</sub><sup>1</sup> 1/(1 + <i>x</i>) d<i>x</i> = ln 2", lab: "y = 1/(1 + x)" },
    { term: (k, m) => PI / m * Math.sin(k * PI / m), f: Math.sin, a: 0, len: PI, exact: 2, xr: [-0.1, 3.3], yr: [-0.05, 1.1], xs: 0.5, ys: 0.25,
      eq: "(π/<i>n</i>) · sin(<i>k</i>π/<i>n</i>), <i>x</i> = <i>k</i>π/<i>n</i> → ∫<sub>0</sub><sup>π</sup> sin <i>x</i> d<i>x</i> = 2", lab: "y = sin x" },
    { term: (k, m) => Math.exp(k / m) / m, f: Math.exp, a: 0, len: 1, exact: Math.E - 1, xr: [-0.05, 1.08], yr: [-0.1, 2.9], xs: 0.25, ys: 0.5,
      eq: "(1/<i>n</i>) · <i>e</i><sup><i>k</i>/<i>n</i></sup> → ∫<sub>0</sub><sup>1</sup> <i>e</i><sup><i>x</i></sup> d<i>x</i> = <i>e</i> − 1", lab: "y = e^x" },
  ];
  let k = 0, right = 1;
  const { ctx, size } = NM.fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[k], m = +sn.value, dx = p.len / m;
    const g = K.frame(ctx, w, h, { xr: p.xr, yr: p.yr, xs: p.xs, ys: p.ys });
    for (let i = 0; i < m; i++) {
      const kk = i + right, x1 = p.a + i * dx;
      I.bar(ctx, g, x1, x1 + dx, p.term(kk, m) / dx, i % 2 ? K.BLUE : C.forest, 0, 0.22);
    }
    K.curve(ctx, g, p.f, C.forest, { from: p.a, to: p.a + p.len });
    K.tag(ctx, g, p.lab, g.x0 + g.w - 4, g.y0 + 10, C.forest, "right");
  }

  function update() {
    const p = P[k], m = +sn.value;
    let s = 0; for (let i = 0; i < m; i++) s += p.term(i + right, m);
    $(".n-out").textContent = m; $(".eq").innerHTML = p.eq;
    $(".n-s").textContent = n(s, 5); $(".n-i").textContent = n(p.exact, 5); $(".n-d").textContent = n(s - p.exact, 5);
    draw();
  }

  K.chips(root, ".fn .chip", (bt) => { k = +bt.dataset.k; update(); });
  K.chips(root, ".side .chip", (bt) => { right = +bt.dataset.s; update(); });
  sn.addEventListener("input", update);
  update();
})();
