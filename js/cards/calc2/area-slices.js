/* 카드: 세로로 자를까, 가로로 자를까? — 같은 도형을 dx 띠와 dy 띠로 잘라 넓이 비교 */
(() => {
  const root = document.getElementById("card-calc2-area-slices");
  if (!root) return;
  const { C } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s), sn = $(".sn");
  const E = Math.E;
  const P = [
    { x: [1, E], lo: () => 0, hi: Math.log, y: [0, 1], left: Math.exp, right: () => E, exact: 1,
      xr: [-0.1, 3.2], yr: [-0.25, 1.35], xs: 0.5, ys: 0.5,
      curves: [{ f: Math.log, from: 0.25, to: 3.2, lab: "y = ln x" }], vx: [E], lab2: "x = e",
      ex: "∫<sub>1</sub><sup><i>e</i></sup> ln <i>x</i> d<i>x</i> = [<i>x</i> ln <i>x</i> − <i>x</i>]<sub>1</sub><sup><i>e</i></sup> = 1",
      ey: "∫<sub>0</sub><sup>1</sup> (<i>e</i> − <i>e</i><sup><i>y</i></sup>) d<i>y</i> = <i>e</i> − (<i>e</i> − 1) = 1" },
    { x: [0, 4], lo: (x) => Math.max(0, x - 2), hi: Math.sqrt, y: [0, 2], left: (y) => y * y, right: (y) => y + 2, exact: 10 / 3,
      xr: [-0.2, 4.4], yr: [-0.35, 2.4], xs: 1, ys: 0.5,
      curves: [{ f: Math.sqrt, from: 0, to: 4.4, lab: "y = √x" }, { f: (x) => x - 2, from: 1.65, to: 4.4, lab: "y = x − 2" }], vx: [],
      ex: "∫<sub>0</sub><sup>2</sup> √<i>x</i> d<i>x</i> + ∫<sub>2</sub><sup>4</sup> {√<i>x</i> − (<i>x</i> − 2)} d<i>x</i> = 10/3 (두 조각)",
      ey: "∫<sub>0</sub><sup>2</sup> {(<i>y</i> + 2) − <i>y</i><sup>2</sup>} d<i>y</i> = 2 + 4 − 8/3 = 10/3 (한 번에)" },
  ];
  let k = 0, dir = "x";
  const { ctx, size } = NM.fit($("canvas"), () => draw());

  function strips(p, m) {
    const out = [];
    if (dir === "x") { const d = (p.x[1] - p.x[0]) / m; for (let i = 0; i < m; i++) { const c = p.x[0] + (i + .5) * d; out.push([p.x[0] + i * d, d, p.lo(c), p.hi(c)]); } }
    else { const d = (p.y[1] - p.y[0]) / m; for (let i = 0; i < m; i++) { const c = p.y[0] + (i + .5) * d; out.push([p.y[0] + i * d, d, p.left(c), p.right(c)]); } }
    return out;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[k], m = +sn.value;
    const g = K.frame(ctx, w, h, { xr: p.xr, yr: p.yr, xs: p.xs, ys: p.ys });
    const reg = new Path2D(), N = 200;
    for (let i = 0; i <= N; i++) { const x = p.x[0] + (p.x[1] - p.x[0]) * i / N; i ? reg.lineTo(g.X(x), g.Y(p.hi(x))) : reg.moveTo(g.X(x), g.Y(p.hi(x))); }
    for (let i = N; i >= 0; i--) { const x = p.x[0] + (p.x[1] - p.x[0]) * i / N; reg.lineTo(g.X(x), g.Y(p.lo(x))); }
    reg.closePath();
    ctx.save(); ctx.globalAlpha = 0.14; ctx.fillStyle = C.forest; ctx.fill(reg); ctx.restore();
    ctx.save(); ctx.lineWidth = 1;
    strips(p, m).forEach(([s, d, a, b], i) => {
      const col = i % 2 ? K.BLUE : C.warn;
      ctx.fillStyle = col; ctx.strokeStyle = col; ctx.globalAlpha = 0.3;
      const r = dir === "x" ? [g.X(s), g.Y(b), g.X(s + d) - g.X(s), g.Y(a) - g.Y(b)] : [g.X(a), g.Y(s + d), g.X(b) - g.X(a), g.Y(s) - g.Y(s + d)];
      ctx.fillRect(...r); ctx.globalAlpha = 0.9; ctx.strokeRect(...r);
    });
    ctx.restore();
    p.curves.forEach((c, i) => {
      K.curve(ctx, g, c.f, C.forest, { from: c.from, to: c.to });
      K.tag(ctx, g, c.lab, g.X(c.to) - 4, g.Y(c.f(c.to)) + (i ? 14 : -12), C.forest, "right");
    });
    p.vx.forEach((x) => {
      ctx.save(); ctx.strokeStyle = C.forest; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(g.X(x), g.Y(p.yr[0])); ctx.lineTo(g.X(x), g.Y(p.yr[1])); ctx.stroke(); ctx.restore();
      K.tag(ctx, g, p.lab2, g.X(x) + 6, g.y0 + 12, C.forest);
    });
  }

  function update() {
    const p = P[k], m = +sn.value;
    const s = strips(p, m).reduce((t, [, d, a, b]) => t + d * (b - a), 0);
    $(".n-out").textContent = m; $(".eq").innerHTML = dir === "x" ? p.ex : p.ey;
    $(".n-s").textContent = n(s, 4); $(".n-e").textContent = n(p.exact, 4);
    draw();
  }

  K.chips(root, ".fn .chip", (bt) => { k = +bt.dataset.k; update(); });
  K.chips(root, ".dir .chip", (bt) => { dir = bt.dataset.d; update(); });
  sn.addEventListener("input", update);
  update();
})();
