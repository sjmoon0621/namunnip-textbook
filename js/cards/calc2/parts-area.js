/* 카드: 넓이 두 조각을 합치면 왜 직사각형이 될까? — (v, u) 평면에서 ∫u dv + ∫v du = [uv] */
(() => {
  const root = document.getElementById("card-calc2-parts-area");
  if (!root) return;
  const { C } = NM;
  const K = NMCalc, I = NMInteg, n = K.n;
  const $ = (s) => root.querySelector(s), sb = $(".sb");
  const P = [
    { a: 1, bmin: 1.05, bmax: 4, b0: 3, u: Math.log, v: (x) => x, du: (x) => 1 / x, dv: () => 1,
      vr: [0, 4.3], ur: [-0.15, 1.6], vs: 1, us: 0.5, lab: "u = ln x, v = x",
      eq: "∫<sub>1</sub><sup><i>b</i></sup> ln <i>x</i> d<i>x</i> = <i>b</i> ln <i>b</i> − ∫<sub>1</sub><sup><i>b</i></sup> <i>x</i> · (1/<i>x</i>) d<i>x</i> = <i>b</i> ln <i>b</i> − <i>b</i> + 1" },
    { a: 0, bmin: 0.05, bmax: 1.5, b0: 1, u: (x) => x, v: Math.exp, du: () => 1, dv: Math.exp,
      vr: [0, 4.7], ur: [-0.15, 1.7], vs: 1, us: 0.5, lab: "u = x, v = e^x",
      eq: "∫<sub>0</sub><sup><i>b</i></sup> <i>x</i> <i>e</i><sup><i>x</i></sup> d<i>x</i> = <i>b</i> <i>e</i><sup><i>b</i></sup> − ∫<sub>0</sub><sup><i>b</i></sup> <i>e</i><sup><i>x</i></sup> d<i>x</i> = <i>b</i> <i>e</i><sup><i>b</i></sup> − <i>e</i><sup><i>b</i></sup> + 1" },
    { a: 0, bmin: 0.05, bmax: 1.55, b0: 1.2, u: (x) => x, v: Math.sin, du: () => 1, dv: Math.cos,
      vr: [0, 1.15], ur: [-0.15, 1.7], vs: 0.25, us: 0.5, lab: "u = x, v = sin x",
      eq: "∫<sub>0</sub><sup><i>b</i></sup> <i>x</i> cos <i>x</i> d<i>x</i> = <i>b</i> sin <i>b</i> − ∫<sub>0</sub><sup><i>b</i></sup> sin <i>x</i> d<i>x</i> = <i>b</i> sin <i>b</i> + cos <i>b</i> − 1" },
  ];
  let k = 0;
  const { ctx, size } = NM.fit($("canvas"), () => draw());

  function region(g, p, b, side) {
    const N = 200, path = new Path2D();
    if (side === "under") path.moveTo(g.X(p.v(p.a)), g.Y(0)); else path.moveTo(g.X(0), g.Y(p.u(p.a)));
    for (let i = 0; i <= N; i++) { const x = p.a + (b - p.a) * i / N; path.lineTo(g.X(p.v(x)), g.Y(p.u(x))); }
    if (side === "under") path.lineTo(g.X(p.v(b)), g.Y(0)); else path.lineTo(g.X(0), g.Y(p.u(b)));
    path.closePath();
    return path;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[k], b = +sb.value;
    const g = K.frame(ctx, w, h, { xr: p.vr, yr: p.ur, xs: p.vs, ys: p.us });
    ctx.save(); ctx.beginPath(); ctx.rect(g.x0, g.y0, g.w, g.h); ctx.clip();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = C.forest; ctx.fill(region(g, p, b, "under"));
    ctx.fillStyle = K.BLUE; ctx.fill(region(g, p, b, "left"));
    ctx.globalAlpha = 1; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]);
    ctx.strokeRect(g.X(0), g.Y(p.u(b)), g.X(p.v(b)) - g.X(0), g.Y(0) - g.Y(p.u(b)));
    ctx.restore();
    ctx.save(); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.5; ctx.setLineDash([2, 3]); ctx.beginPath();
    for (let i = 0; i <= 200; i++) { const x = p.a + (p.bmax - p.a) * i / 200; i ? ctx.lineTo(g.X(p.v(x)), g.Y(p.u(x))) : ctx.moveTo(g.X(p.v(x)), g.Y(p.u(x))); }
    ctx.stroke(); ctx.setLineDash([]); ctx.strokeStyle = C.forest; ctx.lineWidth = 2.4; ctx.beginPath();
    for (let i = 0; i <= 200; i++) { const x = p.a + (b - p.a) * i / 200; i ? ctx.lineTo(g.X(p.v(x)), g.Y(p.u(x))) : ctx.moveTo(g.X(p.v(x)), g.Y(p.u(x))); }
    ctx.stroke(); ctx.restore();
    K.dot(ctx, g, p.v(b), p.u(b), C.warn);
    const vb = p.v(b), ub = p.u(b);
    K.tag(ctx, g, "∫u dv", g.X(vb * 0.72), g.Y(ub * 0.2), C.forest, "center");
    K.tag(ctx, g, "∫v du", g.X(vb * 0.2), g.Y(ub * 0.8), K.BLUE, "center");
    K.tag(ctx, g, p.lab, g.x0 + g.w - 4, g.y0 + 10, C.ink2, "right");
    K.tag(ctx, g, "v →", g.x0 + g.w - 4, g.Y(0) - 10, C.ink3, "right");
    K.tag(ctx, g, "u ↑", g.X(0) + 4, g.y0 + 10, C.ink3);
  }

  function update() {
    const p = P[k], b = +sb.value;
    $(".b-out").textContent = n(b, 2);
    $(".eq").innerHTML = p.eq;
    const A = I.simp((x) => p.u(x) * p.dv(x), p.a, b, 2000), B = I.simp((x) => p.v(x) * p.du(x), p.a, b, 2000);
    $(".n-a").textContent = n(A, 4); $(".n-b").textContent = n(B, 4); $(".n-s").textContent = n(A + B, 4);
    $(".n-r").textContent = n(p.u(b) * p.v(b) - p.u(p.a) * p.v(p.a), 4);
    draw();
  }

  K.chips(root, ".fn .chip", (bt) => { k = +bt.dataset.k; const p = P[k]; sb.min = p.bmin; sb.max = p.bmax; sb.value = p.b0; update(); });
  sb.addEventListener("input", update);
  update();
})();
