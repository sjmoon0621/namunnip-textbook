/* 카드: 그래프가 x축 아래로 내려가면 정적분은 어떻게 될까? — 끝을 끌어 위·아래 넓이와 정적분 비교 */
(() => {
  const root = document.getElementById("card-calc1-signed-area");
  if (!root) return;
  const { C, fit } = NM, K = NMCalc, I = NMInt;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sA = $(".a"), sB = $(".b");
  let p = [-1, 0, 1], g = null;
  const { ctx, size } = fit(cv, () => draw());
  const parts = (a, b) => { const { cuts } = I.absInt(p, a, b); let up = 0, dn = 0; for (let i = 0; i < cuts.length - 1; i++) { const d = I.def(p, cuts[i], cuts[i + 1]); if (d > 0) up += d; else dn -= d; } return { up, dn }; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    g = K.frame(ctx, w, h, { xr: [-3, 3], yr: [-6, 6], ys: 2 });
    const a = +sA.value, b = +sB.value;
    I.fill(ctx, g, (x) => I.at(p, x), a, b, { alpha: .3 });
    K.curve(ctx, g, (x) => I.at(p, x), C.forest, { width: 2.6 });
    [[a, "a", C.ink], [b, "b", C.warn]].forEach(([x, l, col]) => {
      K.guide(ctx, g, x, I.at(p, x), col, "x");
      I.handle(ctx, g.X(x), g.Y(0), col);
      K.tag(ctx, g, l, g.X(x) - 4, g.Y(0) + (l === "a" ? 18 : -18), col);
    });
  }

  function update() {
    const a = +sA.value, b = +sB.value, { up, dn } = parts(a, b), v = I.def(p, a, b);
    $(".a-out").textContent = K.n(a); $(".b-out").textContent = K.n(b);
    $(".n-up").textContent = I.val(up); $(".n-dn").textContent = I.val(dn); $(".n-v").textContent = I.val(v);
    $(".rel").textContent = a === b ? "a = b이면 넓이가 없으므로 정적분은 0입니다." : a < b ? `a < b: 정적분 = (위쪽 넓이) − (아래쪽 넓이) = ${I.frac(up)} − ${I.frac(dn)}` : `a > b: 거꾸로 적분하므로 −{(위쪽 넓이) − (아래쪽 넓이)} = −(${I.frac(up)} − ${I.frac(dn)})`;
    draw();
  }

  I.drag(cv, (px, py) => {
    if (!g) return null;
    const da = Math.hypot(px - g.X(+sA.value), py - g.Y(0)), db = Math.hypot(px - g.X(+sB.value), py - g.Y(0));
    return Math.min(da, db) > 18 ? null : da <= db ? "a" : "b";
  }, (id, px) => { (id === "a" ? sA : sB).value = NM.clamp(Math.round(g.ix(px) * 10) / 10, -3, 3); update(); });
  K.chips(root, ".presets .chip", (b) => { p = b.dataset.p.split(",").map(Number); update(); });
  [sA, sB].forEach((s) => s.addEventListener("input", update));
  update();
})();
