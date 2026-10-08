/* 카드: 위끝을 움직이면 넓이는 얼마나 빨리 늘어날까? — S(x) = ∫ₐˣ f(t)dt의 변화율과 f(x) 비교 */
(() => {
  const root = document.getElementById("card-calc1-area-function");
  if (!root) return;
  const { C, fit } = NM, K = NMCalc, I = NMInt;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sA = $(".a"), sX = $(".x"), sH = $(".h");
  let p = [-1, 0, 1], gt = null;
  const { ctx, size } = fit(cv, () => draw());
  const S = (x) => I.def(p, +sA.value, x);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const mid = h / 2, a = +sA.value, x = +sX.value, dh = +sH.value, f = (t) => I.at(p, t);
    gt = K.frame(ctx, w, h, { xr: [-2.5, 2.5], yr: [-3, 5], ys: 2, B: h - mid + 14 });
    I.fill(ctx, gt, f, a, x, { alpha: .3 });
    I.fill(ctx, gt, f, x, x + dh, { split: false, pos: C.amber, alpha: .55 });
    K.curve(ctx, gt, f, C.forest, { width: 2.4 });
    K.guide(ctx, gt, a, f(a), C.ink, "x");
    K.tag(ctx, gt, "y = f(t)", gt.x0 + 6, gt.y0 + 10, C.forest);
    K.tag(ctx, gt, "a", gt.X(a) - 4, gt.Y(0) + 14, C.ink);
    I.handle(ctx, gt.X(x), gt.Y(f(x)), C.warn);
    const gb = K.frame(ctx, w, h, { xr: [-2.5, 2.5], yr: [-4, 4], ys: 2, T: mid + 6 });
    K.curve(ctx, gb, S, K.BLUE, { width: 2.4 });
    K.tag(ctx, gb, "y = S(x)", gb.x0 + 6, gb.y0 + 10, K.BLUE);
    const m = f(x), sx = gb.X(1) - gb.X(0), sy = gb.Y(0) - gb.Y(1), r = 40 / Math.hypot(sx, m * sy);
    ctx.save(); ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.beginPath();
    ctx.moveTo(gb.X(x) - sx * r, gb.Y(S(x)) + m * sy * r); ctx.lineTo(gb.X(x) + sx * r, gb.Y(S(x)) - m * sy * r); ctx.stroke();
    ctx.setLineDash([4, 3]); ctx.strokeStyle = C.amber; ctx.beginPath(); ctx.moveTo(gb.X(x), gb.Y(S(x))); ctx.lineTo(gb.X(x + dh), gb.Y(S(x + dh))); ctx.stroke(); ctx.restore();
    K.dot(ctx, gb, a, 0, C.ink); K.dot(ctx, gb, x, S(x), C.warn);
  }

  function update() {
    const a = +sA.value, x = +sX.value, dh = +sH.value;
    $(".a-out").textContent = K.n(a); $(".x-out").textContent = K.n(x, 2); $(".h-out").textContent = K.n(dh, 2);
    $(".n-s").textContent = K.n(S(x), 3);
    $(".n-q").textContent = K.n((S(x + dh) - S(x)) / dh, 3);
    $(".n-f").textContent = K.n(I.at(p, x), 3);
    draw();
  }

  I.drag(cv, (px, py) => (gt && Math.hypot(px - gt.X(+sX.value), py - gt.Y(I.at(p, +sX.value))) < 18 ? "x" : null), (id, px) => { sX.value = NM.clamp(Math.round(gt.ix(px) * 20) / 20, -2.5, 2.5); update(); });
  K.chips(root, ".presets .chip", (b) => { p = b.dataset.p.split(",").map(Number); update(); });
  [sA, sX, sH].forEach((s) => s.addEventListener("input", update));
  update();
})();
