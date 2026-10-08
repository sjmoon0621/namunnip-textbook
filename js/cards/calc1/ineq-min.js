/* 카드: 모든 x에서 성립한다는 것을 어떻게 보일까? — x ≥ 0에서 x³ − 3x + a의 최솟값과 부등식 */
(() => {
  const root = document.getElementById("card-calc1-ineq-min");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n, M = K.M;
  const $ = (s) => root.querySelector(s);
  const sa = $(".sa");
  const { ctx, size } = fit($("canvas"), () => draw());
  const f = (x) => x ** 3 - 3 * x + +sa.value;

  /* x ≥ 0에서 f(x) < 0인 구간: f는 [0, 1]에서 감소, [1, ∞)에서 증가하므로 각 쪽에서 이분법으로 0점을 찾는다 */
  function negRange() {
    if (f(1) >= 0) return null;
    const bis = (a, b) => { for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if ((f(a) < 0) === (f(m) < 0)) a = m; else b = m; } return (a + b) / 2; };
    const left = f(0) < 0 ? 0 : bis(0, 1), right = bis(1, 3);
    return [left, right];
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const g = K.frame(ctx, w, h, { xr: [-1, 2.6], yr: [-3, 6], xs: 0.5, ys: 1 });
    ctx.fillStyle = C.ink3; ctx.globalAlpha = .12; ctx.fillRect(g.x0, g.y0, g.X(0) - g.x0, g.h); ctx.globalAlpha = 1;
    K.curve(ctx, g, f, C.ink3, { to: 0, width: 1.4, dash: [4, 3] });
    K.curve(ctx, g, f, C.forest, { from: 0, width: 2.6 });
    const r = negRange();
    if (r) K.curve(ctx, g, f, C.warn, { from: r[0], to: r[1], width: 3.4 });
    const m = f(1), col = m >= -1e-9 ? C.forest : C.warn;
    K.guide(ctx, g, 1, m, col, "x"); K.dot(ctx, g, 1, m, col, false, 5);
    K.tag(ctx, g, `최솟값 f(1) = ${n(m, 2)}`, g.X(1) + 10, g.Y(m) + 16, col);
    K.dot(ctx, g, 0, f(0), C.ink2, false, 4);
    K.tag(ctx, g, `f(0) = ${n(f(0), 2)}`, g.X(0) + 8, g.Y(f(0)) - 12, C.ink2);
  }

  function update() {
    const a = +sa.value, m = a - 2, r = negRange(), ok = m >= -1e-9;
    $(".a-out").textContent = n(a, 1);
    $(".eq").innerHTML = `f(<i>x</i>) = <i>x</i><sup>3</sup> − 3<i>x</i> ${a < 0 ? M : "+"} ${n(Math.abs(a), 1)}, &nbsp;<i>x</i> ≥ 0`;
    $(".n-m").textContent = n(m, 2);
    $(".n-x").textContent = r ? `${n(r[0], 2)} ${r[0] === 0 ? "≤" : "<"} x < ${n(r[1], 2)}` : "없음";
    const o = $(".n-ok"); o.textContent = ok ? "성립" : "성립하지 않음"; o.className = `n-ok ${ok ? "good" : "bad"}`;
    draw();
  }
  sa.addEventListener("input", update);
  update();
})();
