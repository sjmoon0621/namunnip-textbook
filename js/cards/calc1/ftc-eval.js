/* 카드: 넓이를 재지 않고 정적분을 구할 수 있을까? — F(b) − F(a)와 직사각형 합, 적분상수가 지워지는 모습 */
(() => {
  const root = document.getElementById("card-calc1-ftc-eval");
  if (!root) return;
  const { C, fit } = NM, K = NMCalc, I = NMInt;
  const $ = (s) => root.querySelector(s);
  const sA = $(".a"), sB = $(".b"), sC = $(".c");
  let ex = { p: [0, -2, 3], top: [-2, 14, 4], bot: [-9, 13, 4] };
  const { ctx, size } = fit($("canvas"), () => draw());
  const F = (x) => I.at(I.integ(ex.p), x) + +sC.value;
  const riemann = (a, b, n = 2000) => { const d = (b - a) / n; let s = 0; for (let i = 0; i < n; i++) s += I.at(ex.p, a + (i + .5) * d) * d; return s; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const mid = h / 2, a = +sA.value, b = +sB.value, f = (x) => I.at(ex.p, x);
    const gt = K.frame(ctx, w, h, { xr: [-1.5, 2.5], yr: ex.top.slice(0, 2), ys: ex.top[2], xs: 0.5, B: h - mid + 14 });
    I.fill(ctx, gt, f, a, b, { alpha: .3 });
    K.curve(ctx, gt, f, C.forest, { width: 2.4 });
    K.tag(ctx, gt, "y = f(x)", gt.x0 + 6, gt.y0 + 10, C.forest);
    const gb = K.frame(ctx, w, h, { xr: [-1.5, 2.5], yr: ex.bot.slice(0, 2), ys: ex.bot[2], xs: 0.5, T: mid + 6 });
    K.curve(ctx, gb, F, K.BLUE, { width: 2.4 });
    K.tag(ctx, gb, "y = F(x) + C", gb.x0 + 6, gb.y0 + 10, K.BLUE);
    K.guide(ctx, gb, a, F(a), C.ink3, "y");
    ctx.save(); ctx.strokeStyle = C.warn; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(gb.X(b), gb.Y(F(a))); ctx.lineTo(gb.X(b), gb.Y(F(b))); ctx.stroke(); ctx.restore();
    K.dot(ctx, gb, a, F(a), C.ink); K.dot(ctx, gb, b, F(b), C.warn);
    K.tag(ctx, gb, `높이 차 ${K.n(F(b) - F(a), 3)}`, gb.X(b) + 8, gb.Y((F(a) + F(b)) / 2), C.warn);
  }

  function update() {
    const a = +sA.value, b = +sB.value, c = +sC.value, P = I.integ(ex.p);
    $(".a-out").textContent = K.n(a); $(".b-out").textContent = K.n(b); $(".c-out").textContent = K.n(c);
    $(".F-eq").innerHTML = `F(<i>x</i>) + <i>C</i> = ${I.fmt([c, ...P.slice(1)])}`;
    $(".n-fb").textContent = K.n(F(b), 3); $(".n-fa").textContent = K.n(F(a), 3);
    $(".n-d").textContent = I.val(F(b) - F(a)); $(".n-r").textContent = K.n(riemann(a, b), 4);
    draw();
  }
  K.chips(root, ".presets .chip", (b) => { const [p, top, bot] = JSON.parse(b.dataset.ex); ex = { p, top, bot }; update(); });
  [sA, sB, sC].forEach((s) => s.addEventListener("input", update));
  update();
})();
