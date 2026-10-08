/* 카드: 2^√2처럼 지수가 무리수인 수는 어떻게 정할까? — 소수 자릿수를 늘려 유리수 지수로 감싸고 확대하기 */
(() => {
  const root = document.getElementById("card-alg-real-exp");
  if (!root) return;
  const { C, fit } = NM, E = NMExp;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".presets .chip[data-t]")];
  const sa = $(".a");
  const T = { sqrt2: [Math.SQRT2, "√2"], sqrt3: [Math.sqrt(3), "√3"], pi: [Math.PI, "π"] };
  let key = "sqrt2", k = 0;
  const KMAX = 6;
  const { ctx, size } = fit($("canvas"), () => draw());

  function box() {
    const t = T[key][0], s = 10 ** k, lo = Math.floor(t * s) / s, hi = lo + 1 / s, a = +sa.value;
    const ya = a ** lo, yb = a ** hi;
    return { t, lo, hi, a, ylo: Math.min(ya, yb), yhi: Math.max(ya, yb) };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const b = box(), d = b.hi - b.lo, dy = Math.max(b.yhi - b.ylo, 1e-12), mid = (b.yhi + b.ylo) / 2;
    const O = { X0: b.lo - d, X1: b.hi + d, Y0: mid - 1.6 * dy, Y1: mid + 1.6 * dy, l: 76, b: 24,
      xt: [[b.lo, b.lo.toFixed(k)], [b.hi, b.hi.toFixed(k)]],
      yt: b.yhi - b.ylo > 1e-12 ? [[b.ylo, E.n(b.ylo, k + 3)], [b.yhi, E.n(b.yhi, k + 3)]] : [[b.ylo, E.n(b.ylo)]] };
    if (b.yhi - b.ylo < 1e-12) { O.Y0 = mid - 1; O.Y1 = mid + 1; }
    const g = E.frame(ctx, w, h, O);
    ctx.fillStyle = C.sprout; ctx.globalAlpha = 0.45;
    ctx.fillRect(g.X(b.lo), g.Y(b.yhi), g.X(b.hi) - g.X(b.lo), Math.max(2, g.Y(b.ylo) - g.Y(b.yhi)));
    ctx.globalAlpha = 1;
    E.curve(ctx, g, (x) => b.a ** x, C.forest, { lw: 2.4 });
    E.vline(ctx, g, b.t, C.warn, [3, 3], 1.2);
    E.dot(ctx, g, b.t, b.a ** b.t, C.warn, 5.5);
    E.tag(ctx, g, `x = ${T[key][1]}에서 높이 ≈ ${(b.a ** b.t).toFixed(Math.min(k + 3, 8))}`, g.X(b.t) + 10, g.Y(b.a ** b.t) + 16, C.warn);
    E.tag(ctx, g, `확대 ×${E.n(10 ** k)}`, g.x0 + g.gw - 4, g.y0 + 10, C.ink3, "right", 11);
  }

  function update() {
    const b = box();
    $(".a-out").textContent = E.n(b.a);
    $(".n-x").textContent = `${b.lo.toFixed(k)} < ${T[key][1]} < ${b.hi.toFixed(k)}`;
    $(".n-dx").textContent = E.n(b.hi - b.lo, 6);
    const A = E.n(b.a), yl = (b.a ** b.lo).toFixed(k + 3), yh = (b.a ** b.hi).toFixed(k + 3);
    const P = `${A}<sup>${T[key][1]}</sup>`;
    $(".n-y").innerHTML = b.a === 1 ? `${P} = 1` : b.a > 1 ? `${yl} &lt; ${P} &lt; ${yh}` : `${yh} &lt; ${P} &lt; ${yl}`;
    $(".n-dy").textContent = String(Number((b.yhi - b.ylo).toPrecision(3)));
    $(".go-next").disabled = k >= KMAX;
    draw();
  }
  chips.forEach((c) => c.addEventListener("click", () => { key = c.dataset.t; k = 0; chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c))); update(); }));
  $(".go-next").addEventListener("click", () => { if (k < KMAX) k++; update(); });
  $(".go-reset").addEventListener("click", () => { k = 0; update(); });
  sa.addEventListener("input", update);
  update();
})();
