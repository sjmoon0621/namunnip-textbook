/* 카드: 지수가 소수여도 높이를 곱하면 지수가 더해질까? — y = aˣ에서 x, y, x + y의 높이 비교 */
(() => {
  const root = document.getElementById("card-alg-exp-law-graph");
  if (!root) return;
  const { C, fit } = NM, E = NMExp;
  const $ = (s) => root.querySelector(s);
  const sa = $(".a"), sx = $(".x"), sy = $(".y"), cv = $("canvas");
  let g = null;
  const { ctx, size } = fit(cv, () => draw());

  function bar(x, v, col, lab) {
    const px = g.X(x), top = Math.max(g.y0, g.Y(v)), base = g.Y(0);
    ctx.fillStyle = col; ctx.globalAlpha = 0.85; ctx.fillRect(px - 3, top, 6, base - top); ctx.globalAlpha = 1;
    E.dot(ctx, g, x, v, col, 5);
    E.tag(ctx, g, lab, px, Math.max(g.y0 + 9, top - 12), col, "center", 11);
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = +sa.value, x = +sx.value, y = +sy.value, s = x + y, top = Math.ceil(Math.max(4, a ** Math.max(x, y, s)) * 1.3);
    g = E.frame(ctx, w, h, { X0: -3, X1: 4, Y0: 0, Y1: top, xt: [-3, -2, -1, 0, 1, 2, 3, 4], yt: [0, Math.round(top / 2), top] });
    E.curve(ctx, g, (t) => a ** t, C.ink3, { lw: 1.6 });
    bar(x, a ** x, C.forest, `aˣ = ${E.n(a ** x, 2)}`);
    bar(y, a ** y, E.BLUE, `aʸ = ${E.n(a ** y, 2)}`);
    bar(s, a ** s, C.warn, `aˣ⁺ʸ = ${E.n(a ** s, 2)}`);
    E.tag(ctx, g, `y = ${E.n(a)}ˣ`, g.x0 + 6, g.y0 + 10, C.ink3);
  }

  function update() {
    const a = +sa.value, x = +sx.value, y = +sy.value;
    $(".a-out").textContent = E.n(a); $(".x-out").textContent = E.n(x); $(".y-out").textContent = E.n(y);
    $(".n-p").textContent = E.n(a ** x * a ** y, 3);
    $(".n-s").textContent = E.n(a ** (x + y), 3);
    const sum = a ** x + a ** y, d = $(".n-a");
    d.textContent = E.n(sum, 3); d.className = `n-a ${Math.abs(sum - a ** (x + y)) < 5e-4 ? "" : "bad"}`;
    draw();
  }
  E.drag(cv, (px) => { if (!g) return; sx.value = String(g.IX(px)); update(); });
  [sa, sx, sy].forEach((s) => s.addEventListener("input", update));
  update();
})();
