/* 카드: 밑이 다른 로그는 서로 어떤 관계일까? — log_a x와 log_b x의 높이 비가 늘 1/log_a b */
(() => {
  const root = document.getElementById("card-alg-log-base-change");
  if (!root) return;
  const { C, fit } = NM, E = NMExp;
  const $ = (s) => root.querySelector(s);
  const sa = $(".a"), sb = $(".b"), sx = $(".x"), cv = $("canvas");
  const O = { X0: 0, X1: 12, Y0: -3, Y1: 4, xt: [0, 2, 4, 6, 8, 10, 12], yt: [-3, -2, -1, 0, 1, 2, 3, 4] };
  let g = null;
  const { ctx, size } = fit(cv, () => draw());
  const lg = (b, x) => Math.log(x) / Math.log(b);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = +sa.value, b = +sb.value, x = +sx.value;
    g = E.frame(ctx, w, h, O);
    E.param(ctx, g, (t) => a ** t, (t) => t, -3.2, 4.2, C.forest, { lw: 2.4 });
    E.param(ctx, g, (t) => b ** t, (t) => t, -3.2, 4.2, E.BLUE, { lw: 2.4 });
    E.vline(ctx, g, x, C.ink3, [3, 3], 1);
    const ya = lg(a, x), yb = lg(b, x);
    E.dot(ctx, g, x, ya, C.forest, 5.5); E.dot(ctx, g, x, yb, E.BLUE, 5.5);
    const up = lg(a, 11.2) >= lg(b, 11.2);
    E.tag(ctx, g, `밑 ${E.n(a)}`, g.X(11.6), g.Y(lg(a, 11.6)) + (up ? -12 : 13), C.forest, "right");
    E.tag(ctx, g, `밑 ${E.n(b)}`, g.X(11.6), g.Y(lg(b, 11.6)) + (up ? 13 : -12), E.BLUE, "right");
  }

  function update() {
    const a = +sa.value, b = +sb.value, x = +sx.value, ya = lg(a, x), yb = lg(b, x);
    $(".a-out").textContent = E.n(a); $(".b-out").textContent = E.n(b); $(".x-out").textContent = E.n(x);
    $(".n-a").textContent = E.n(ya, 4); $(".n-b").textContent = E.n(yb, 4);
    $(".n-r").textContent = Math.abs(ya) < 1e-12 ? "정할 수 없음" : E.n(yb / ya, 4);
    $(".n-c").textContent = E.n(1 / lg(a, b), 4);
    draw();
  }
  E.drag(cv, (px) => { if (!g) return; sx.value = String(g.IX(px)); update(); });
  [sa, sb, sx].forEach((s) => s.addEventListener("input", update));
  update();
})();
