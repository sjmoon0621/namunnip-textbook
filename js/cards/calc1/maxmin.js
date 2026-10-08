/* 카드: 극댓값이 곧 최댓값일까? — 닫힌 구간 [a, b]에서 극값과 끝값을 비교 */
(() => {
  const root = document.getElementById("card-calc1-maxmin");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sa = $(".sa"), sb = $(".sb");
  const FS = [
    { f: (x) => x ** 3 - 3 * x, z: [-1, 1], yr: [-4, 10], ys: 2 },
    { f: (x) => x ** 4 - 2 * x * x, z: [-1, 0, 1], yr: [-2, 12], ys: 2 },
  ];
  let F = FS[0];
  const { ctx, size } = fit($("canvas"), () => draw());

  function cands() {
    let a = +sa.value, b = +sb.value;
    if (b - a < 0.3) { if (document.activeElement === sb) a = b - 0.3; else b = a + 0.3; sa.value = a; sb.value = b; a = +sa.value; b = +sb.value; }
    const list = [{ x: a, t: "끝점" }, ...F.z.filter((z) => z > a + 1e-9 && z < b - 1e-9).map((z) => ({ x: z, t: "극점" })), { x: b, t: "끝점" }];
    list.forEach((c) => { c.y = F.f(c.x); });
    const hi = Math.max(...list.map((c) => c.y)), lo = Math.min(...list.map((c) => c.y));
    return { a, b, list, hi, lo };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { a, b, list, hi, lo } = cands();
    const g = K.frame(ctx, w, h, { xr: [-2.7, 2.7], yr: F.yr, ys: F.ys });
    ctx.fillStyle = C.sprout; ctx.globalAlpha = .25; ctx.fillRect(g.X(a), g.y0, g.X(b) - g.X(a), g.h); ctx.globalAlpha = 1;
    K.curve(ctx, g, F.f, C.ink3, { width: 1.6 });
    K.curve(ctx, g, F.f, C.ink, { from: a, to: b, width: 2.8 });
    for (const [v, col] of [[hi, C.forest], [lo, C.warn]]) K.curve(ctx, g, () => v, col, { width: 1.2, dash: [5, 4] });
    for (const c of list) {
      const col = Math.abs(c.y - hi) < 1e-9 ? C.forest : Math.abs(c.y - lo) < 1e-9 ? C.warn : C.ink2;
      K.dot(ctx, g, c.x, c.y, col, c.t === "극점", 5);
    }
    K.tag(ctx, g, `최댓값 ${n(hi)}`, g.x0 + g.w - 4, g.Y(hi) - 12, C.forest, "right");
    K.tag(ctx, g, `최솟값 ${n(lo)}`, g.x0 + g.w - 4, g.Y(lo) + 12, C.warn, "right");
  }

  function update() {
    const { a, b, list, hi, lo } = cands();
    $(".a-out").textContent = n(a, 1); $(".b-out").textContent = n(b, 1);
    $(".cand").innerHTML = "후보: " + list.map((c) => {
      const cls = Math.abs(c.y - hi) < 1e-9 ? "hi" : Math.abs(c.y - lo) < 1e-9 ? "lo" : "";
      return `<b class="${cls}">f(${n(c.x, 1)}) = ${n(c.y, 3)}</b> (${c.t})`;
    }).join(" · ");
    $(".n-hi").textContent = n(hi, 3); $(".n-lo").textContent = n(lo, 3);
    const where = [...new Set(list.filter((c) => Math.abs(c.y - hi) < 1e-9).map((c) => c.t))];
    $(".n-w").textContent = where.join("·");
    draw();
  }
  K.chips(root, ".presets .chip", (bt) => { F = FS[+bt.dataset.k]; update(); });
  [sa, sb].forEach((s) => s.addEventListener("input", update));
  update();
})();
