/* 카드: 함숫값이 한없이 커지는 것도 극한이라고 할까? — 1/x², 1/x (x → 0)와 (2x + 1)/x (x → ±∞) */
(() => {
  const root = document.getElementById("card-calc1-infinity");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sl = $(".st-t");
  const FN = {
    sq: { f: (x) => 1 / (x * x), xr: [-2, 2], yr: [-1, 7], xs: 0.5, ys: 1, far: false },
    inv: { f: (x) => 1 / x, xr: [-2, 2], yr: [-6, 6], xs: 0.5, ys: 2, far: false },
    far: { f: (x) => (2 * x + 1) / x, xr: [-10, 10], yr: [-2, 6], xs: 2, ys: 1, far: true },
  };
  let k = "sq", side = 1;
  const { ctx, size } = fit($("canvas"), () => draw());
  /* x → 0이면 x = ±10^(−t), x → ±∞이면 x = ±2·10^t */
  const xOf = () => (FN[k].far ? side * 2 * Math.pow(10, +sl.value) : side * Math.pow(10, -sl.value));
  const big = (v) => (Math.abs(v) >= 1e5 ? `${v < 0 ? K.M : ""}${n(Math.abs(v) / Math.pow(10, Math.floor(Math.log10(Math.abs(v)))), 2)}×10^${Math.floor(Math.log10(Math.abs(v)))}` : n(v, 6));

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const F = FN[k], x = xOf(), y = F.f(x);
    const g = K.frame(ctx, w, h, { xr: F.xr, yr: F.yr, xs: F.xs, ys: F.ys });
    K.curve(ctx, g, F.f, C.forest, { from: F.xr[0], to: -1e-6, N: 600 });
    K.curve(ctx, g, F.f, C.forest, { from: 1e-6, to: F.xr[1], N: 600 });
    if (F.far) {
      K.curve(ctx, g, () => 2, C.ink3, { width: 1.2, dash: [5, 4] });
      K.tag(ctx, g, "y = 2", g.x0 + g.w - 4, g.Y(2) + 12, C.ink2, "right");
    }
    const inX = x >= F.xr[0] && x <= F.xr[1], inY = y >= F.yr[0] && y <= F.yr[1];
    if (inX && inY) {
      K.guide(ctx, g, x, y, C.warn);
      K.dot(ctx, g, x, y, C.warn, false, 5.5);
    } else {
      const px = inX ? g.X(x) : x > 0 ? g.x0 + g.w : g.x0, py = inY ? g.Y(y) : y > 0 ? g.y0 : g.y0 + g.h;
      const arrow = !inX ? (x > 0 ? "→" : "←") : y > 0 ? "↑" : "↓";
      K.tag(ctx, g, `${arrow} 점이 그림 밖 (${n(x, 4)}, ${big(y)})`, px, py + (py <= g.y0 ? 12 : -12), C.warn, x > 0 ? "right" : "left");
    }
  }

  function update() {
    const F = FN[k], x = xOf(), y = F.f(x);
    $(".t-out").textContent = n(+sl.value, 2);
    $(".t-note").textContent = F.far ? `(x = ${side > 0 ? "" : K.M}2×10^t)` : `(x = ${side > 0 ? "" : K.M}10^${K.M}t)`;
    root.querySelector('.side [data-s="1"]').textContent = F.far ? "x → ∞" : "오른쪽(+)에서";
    root.querySelector('.side [data-s="-1"]').textContent = F.far ? "x → −∞" : "왼쪽(−)에서";
    $(".n-x").textContent = big(x);
    $(".n-f").textContent = big(y);
    const v = $(".n-v");
    if (k === "sq") { v.textContent = "∞로 발산"; $(".st").textContent = "양쪽 모두 높이가 어떤 수보다도 커집니다. lim x→0 1/x² = ∞ (수렴하지 않음)"; }
    else if (k === "inv") {
      v.textContent = side > 0 ? "∞로 발산" : `${K.M}∞로 발산`;
      $(".st").textContent = `lim x→0${side > 0 ? "+" : K.M} 1/x = ${side > 0 ? "" : K.M}∞. 두 방향이 달라 lim x→0 1/x는 쓸 수 없습니다.`;
    } else { v.textContent = "2로 수렴"; $(".st").textContent = `f(x) − 2 = 1/x = ${big(1 / x)}. |x|가 커질수록 차이가 0으로 갑니다.`; }
    draw();
  }
  K.chips(root, ".fn .chip", (b) => { k = b.dataset.k; update(); });
  K.chips(root, ".side .chip", (b) => { side = +b.dataset.s; update(); });
  sl.addEventListener("input", update);
  update();
})();
