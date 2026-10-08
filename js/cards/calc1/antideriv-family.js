/* 카드: 도함수가 같은 함수는 몇 개일까? — F(x) + C 곡선 가족과 같은 x에서 평행한 접선 */
(() => {
  const root = document.getElementById("card-calc1-antideriv-family");
  if (!root) return;
  const { C, fit } = NM, K = NMCalc, I = NMInt;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sC = $(".c"), sX = $(".x0");
  let f = [0, 2], g = null;
  const { ctx, size } = fit(cv, () => draw());
  const snap = (v, s) => Math.round(v / s) * s;

  function seg(x, y, m, color, width) {
    const sx = g.X(1) - g.X(0), sy = g.Y(0) - g.Y(1), dx = sx, dy = -m * sy, L = Math.hypot(dx, dy), r = 20 / L;
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath();
    ctx.moveTo(g.X(x) - dx * r, g.Y(y) - dy * r); ctx.lineTo(g.X(x) + dx * r, g.Y(y) + dy * r); ctx.stroke(); ctx.restore();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    g = K.frame(ctx, w, h, { xr: [-3, 3], yr: [-6, 8], ys: 2 });
    const P = I.integ(f), c = +sC.value, x0 = +sX.value, m = I.at(f, x0);
    ctx.save(); ctx.globalAlpha = .45;
    for (let k = -8; k <= 8; k++) if (k !== c) K.curve(ctx, g, (x) => I.at(P, x) + k, C.ink3, { width: 1.2 });
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .7;
    for (let k = -8; k <= 8; k++) { const y = I.at(P, x0) + k; if (k !== c && y > -6 && y < 8) seg(x0, y, m, C.ink2, 1.5); }
    ctx.restore();
    K.curve(ctx, g, (x) => I.at(P, x) + c, C.forest, { width: 2.6 });
    const y0 = I.at(P, x0) + c;
    seg(x0, y0, m, C.warn, 2.5);
    I.handle(ctx, g.X(x0), g.Y(y0), C.forest);
    K.tag(ctx, g, `x = ${K.n(x0, 2)}에서 기울기 모두 ${K.n(m, 2)}`, g.X(x0) + 12, g.y0 + 10, C.warn);
  }

  function update() {
    const P = I.integ(f), c = +sC.value, x0 = +sX.value;
    $(".c-out").textContent = K.n(c); $(".x0-out").textContent = K.n(x0, 2);
    $(".n-F").innerHTML = I.fmt([c, ...P.slice(1)]);
    const e = 1e-4, slope = (I.at(P, x0 + e) - I.at(P, x0 - e)) / (2 * e);
    $(".n-s").textContent = K.n(slope, 2); $(".n-f").textContent = K.n(I.at(f, x0), 2);
    draw();
  }

  I.drag(cv, (px, py) => {
    if (!g) return null;
    const x0 = +sX.value, y0 = I.at(I.integ(f), x0) + +sC.value;
    return Math.hypot(px - g.X(x0), py - g.Y(y0)) < 16 ? "p" : null;
  }, (id, px, py) => {
    const x0 = NM.clamp(snap(g.ix(px), 0.1), -2.5, 2.5);
    sX.value = x0; sC.value = NM.clamp(snap(g.iy(py) - I.at(I.integ(f), x0), 0.5), -4, 4); update();
  });
  K.chips(root, ".presets .chip", (b) => { f = b.dataset.p.split(",").map(Number); update(); });
  [sC, sX].forEach((s) => s.addEventListener("input", update));
  update();
})();
