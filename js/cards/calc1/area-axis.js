/* 카드: 정적분이 0이면 넓이도 0일까? — x축과 만나는 점에서 나누어 넓이 구하기 */
(() => {
  const root = document.getElementById("card-calc1-area-axis");
  if (!root) return;
  const { C, fit } = NM, K = NMCalc, I = NMInt;
  const $ = (s) => root.querySelector(s);
  const sA = $(".a"), sB = $(".b");
  let p = [0, -2, 1], split = false;
  const { ctx, size } = fit($("canvas"), () => draw());
  const ends = () => { const a = +sA.value, b = +sB.value; return [Math.min(a, b), Math.max(a, b)]; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const g = K.frame(ctx, w, h, { xr: [-2, 3.5], yr: [-4, 4], ys: 2 });
    const [a, b] = ends(), f = (x) => I.at(p, x), { cuts } = I.absInt(p, a, b);
    I.fill(ctx, g, f, a, b, split ? { alpha: .3 } : { split: false, pos: C.ink3, alpha: .22 });
    K.curve(ctx, g, f, C.forest, { width: 2.6 });
    K.guide(ctx, g, a, f(a), C.ink, "x"); K.guide(ctx, g, b, f(b), C.ink, "x");
    if (split) {
      cuts.slice(1, -1).forEach((r) => K.dot(ctx, g, r, 0, C.ink));
      for (let i = 0; i < cuts.length - 1; i++) {
        const m = (cuts[i] + cuts[i + 1]) / 2, d = I.def(p, cuts[i], cuts[i + 1]);
        K.tag(ctx, g, I.frac(d, 60), g.X(m), g.Y(d >= 0 ? -0.6 : 0.6), d >= 0 ? K.BLUE : C.warn, "center");
      }
    } else if (b > a) K.tag(ctx, g, `∫ = ${I.frac(I.def(p, a, b), 60)}`, g.X((a + b) / 2), g.Y(f((a + b) / 2)) - 18, C.ink, "center");
  }

  function update() {
    const [a, b] = ends(), { area, cuts } = I.absInt(p, a, b), v = I.def(p, a, b);
    $(".a-out").textContent = K.n(+sA.value); $(".b-out").textContent = K.n(+sB.value);
    $(".n-r").textContent = cuts.length > 2 ? cuts.slice(1, -1).map((r) => K.n(r, 3)).join(", ") : "없음";
    $(".n-v").textContent = I.val(v, 60);
    const s = $(".n-s"); s.textContent = I.val(area, 60); s.className = `n-s ${Math.abs(area - Math.abs(v)) > 1e-9 ? "bad" : ""}`;
    const parts = []; for (let i = 0; i < cuts.length - 1; i++) parts.push(`|${I.frac(I.def(p, cuts[i], cuts[i + 1]), 60)}|`);
    $(".sum").textContent = split ? `넓이 = ${parts.join(" + ")} = ${I.frac(area, 60)}` : "‘근에서 나누기’를 눌러 조각마다 정적분을 보세요.";
    draw();
  }
  K.chips(root, ".fx .chip", (b) => { const [q, a, bb] = JSON.parse(b.dataset.ex); p = q; sA.value = a; sB.value = bb; update(); });
  K.chips(root, ".mode .chip", (b) => { split = b.dataset.m === "split"; update(); });
  [sA, sB].forEach((s) => s.addEventListener("input", update));
  update();
})();
