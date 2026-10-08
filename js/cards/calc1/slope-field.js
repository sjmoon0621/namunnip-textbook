/* 카드: 한 점을 지나라는 조건이면 적분상수가 정해질까? — 기울기장과 점 하나를 지나는 부정적분 */
(() => {
  const root = document.getElementById("card-calc1-slope-field");
  if (!root) return;
  const { C, fit } = NM, K = NMCalc, I = NMInt;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sX = $(".px"), sY = $(".py");
  let f = [0, 2], g = null;
  const { ctx, size } = fit(cv, () => draw());
  const snap = (v, s) => Math.round(v / s) * s;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    g = K.frame(ctx, w, h, { xr: [-3, 3], yr: [-5, 5] });
    const sx = g.X(1) - g.X(0), sy = g.Y(0) - g.Y(1);
    ctx.save(); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.3;
    for (let x = -2.75; x <= 2.76; x += 0.5) for (let y = -4.5; y <= 4.6; y += 1) {
      const m = I.at(f, x), dx = sx, dy = -m * sy, r = 7 / Math.hypot(dx, dy);
      ctx.beginPath(); ctx.moveTo(g.X(x) - dx * r, g.Y(y) - dy * r); ctx.lineTo(g.X(x) + dx * r, g.Y(y) + dy * r); ctx.stroke();
    }
    ctx.restore();
    const P = I.integ(f), x0 = +sX.value, y0 = +sY.value, c = y0 - I.at(P, x0);
    K.curve(ctx, g, (x) => I.at(P, x) + c, C.forest, { width: 2.6 });
    I.handle(ctx, g.X(x0), g.Y(y0), C.warn);
    K.tag(ctx, g, `(${K.n(x0)}, ${K.n(y0)})`, g.X(x0) + 12, g.Y(y0) - 12, C.warn);
  }

  function update() {
    const P = I.integ(f), x0 = +sX.value, y0 = +sY.value, c = y0 - I.at(P, x0);
    $(".px-out").textContent = K.n(x0); $(".py-out").textContent = K.n(y0);
    $(".n-c").textContent = I.frac(c, 8);
    $(".n-F").innerHTML = I.fmt([c, ...P.slice(1)]);
    $(".n-p").textContent = `F(${K.n(x0)}) = ${K.n(y0)}`;
    draw();
  }

  I.drag(cv, (px, py) => (g && Math.hypot(px - g.X(+sX.value), py - g.Y(+sY.value)) < 16 ? "p" : null), (id, px, py) => {
    sX.value = NM.clamp(snap(g.ix(px), 0.5), -2.5, 2.5); sY.value = NM.clamp(snap(g.iy(py), 0.5), -4.5, 4.5); update();
  });
  K.chips(root, ".presets .chip", (b) => { f = b.dataset.p.split(",").map(Number); update(); });
  [sX, sY].forEach((s) => s.addEventListener("input", update));
  update();
})();
