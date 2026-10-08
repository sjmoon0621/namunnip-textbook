/* 카드: x가 1에 다가가면 f(x)는 어디로 갈까? — 1 − d, 1 + d의 두 점으로 극한값과 함숫값 비교 */
(() => {
  const root = document.getElementById("card-calc1-lim-approach");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sd = $(".sd");
  /* 세 함수 모두 x → 1일 때 2로 수렴한다. fa는 f(1) (없으면 null) */
  const FN = {
    hole: { f: (x) => (x * x - 1) / (x - 1), fa: null },
    moved: { f: (x) => x + 1, fa: 3 },
    cont: { f: (x) => x * x - 2 * x + 3, fa: 2 },
  };
  let k = "hole";
  const { ctx, size } = fit($("canvas"), () => draw());
  const dOf = () => Math.pow(10, -sd.value);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const F = FN[k], d = dOf(), xl = 1 - d, xr = 1 + d;
    const g = K.frame(ctx, w, h, { xr: [-0.5, 3], yr: [-0.5, 4.5], xs: 0.5, ys: 1, xf: (v) => (Number.isInteger(v) ? n(v) : "") });
    K.curve(ctx, g, (x) => (Math.abs(x - 1) < 1e-12 ? NaN : F.f(x)), C.forest);
    if (F.fa !== 2) K.dot(ctx, g, 1, 2, C.forest, true);
    if (F.fa !== null) K.dot(ctx, g, 1, F.fa, C.forest, false);
    K.guide(ctx, g, xl, F.f(xl), C.warn, "y");
    K.guide(ctx, g, xr, F.f(xr), K.BLUE, "y");
    K.dot(ctx, g, xl, F.f(xl), C.warn, false, 5);
    K.dot(ctx, g, xr, F.f(xr), K.BLUE, false, 5);
    K.tag(ctx, g, "x = 1 − d", g.X(xl) - 8, g.Y(F.f(xl)) + 18, C.warn, "right");
    K.tag(ctx, g, "x = 1 + d", g.X(xr) + 8, g.Y(F.f(xr)) - 18, K.BLUE, "left");
    K.tag(ctx, g, "y = 2", g.x0 + 4, g.Y(2) - 12, C.ink2, "left");
  }

  function update() {
    const F = FN[k], d = dOf(), fl = F.f(1 - d), fr = F.f(1 + d);
    $(".d-out").textContent = n(d, 4);
    $(".n-l").textContent = n(fl, 8);
    $(".n-r").textContent = n(fr, 8);
    $(".n-a").textContent = F.fa === null ? "없음" : n(F.fa);
    const gap = Math.max(Math.abs(fl - 2), Math.abs(fr - 2));
    $(".st").textContent = `두 점과 높이 2의 차이는 많아야 ${n(gap, 8)}입니다. ` +
      (F.fa === null ? "f(1)은 없지만 극한값은 2입니다." : F.fa === 2 ? "극한값 2와 f(1) = 2가 같습니다." : "극한값은 2이고 f(1) = 3과 다릅니다.");
    draw();
  }
  K.chips(root, ".presets .chip", (b) => { k = b.dataset.k; update(); });
  sd.addEventListener("input", update);
  update();
})();
