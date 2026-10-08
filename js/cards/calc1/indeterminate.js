/* 카드: 대입하면 0/0이 나오는 식의 극한값은 어떻게 구할까? — 약분·유리화·최고차항으로 나누기를 단계별로 */
(() => {
  const root = document.getElementById("card-calc1-indeterminate");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sl = $(".sl"), work = [...root.querySelectorAll(".work li")];
  const P = {
    fac: {
      a: 2, f: (x) => (x * x - x - 2) / (x - 2), s: (x) => x + 1, L: 3, xr: [0, 4], yr: [0, 5], xs: 1, ys: 1,
      goal: "lim x→2 (x² − x − 2)/(x − 2)",
      work: ["x = 2를 넣으면 분자 4 − 2 − 2 = 0, 분모 0: 0/0 꼴입니다.", "분자를 인수분해합니다: (x − 2)(x + 1)/(x − 2)", "x ≠ 2이므로 x − 2로 약분합니다: x + 1", "lim x→2 (x + 1) = 3"],
    },
    root: {
      a: 0, f: (x) => (Math.sqrt(x + 1) - 1) / x, s: (x) => 1 / (Math.sqrt(x + 1) + 1), L: 0.5, xr: [-1, 3], yr: [0, 1.2], xs: 1, ys: 0.2,
      goal: "lim x→0 (√(x + 1) − 1)/x",
      work: ["x = 0을 넣으면 (1 − 1)/0: 0/0 꼴입니다.", "분자와 분모에 √(x + 1) + 1을 곱합니다: (x + 1 − 1)/{x(√(x + 1) + 1)}", "x ≠ 0이므로 x로 약분합니다: 1/(√(x + 1) + 1)", "lim x→0 1/(√(x + 1) + 1) = 1/(1 + 1) = 1/2"],
    },
    inf: {
      a: Infinity, f: (x) => (3 * x * x + x) / (x * x - 4), s: (x) => (3 + 1 / x) / (1 - 4 / (x * x)), L: 3, xr: [0, 40], yr: [0, 6], xs: 10, ys: 1,
      goal: "lim x→∞ (3x² + x)/(x² − 4)",
      work: ["x → ∞이면 분자와 분모가 모두 한없이 커집니다: ∞/∞ 꼴입니다.", "분모의 최고차항 x²으로 분자와 분모를 나눕니다: (3 + 1/x)/(1 − 4/x²)", "x → ∞이면 1/x → 0, 4/x² → 0입니다.", "lim x→∞ (3 + 1/x)/(1 − 4/x²) = 3/1 = 3"],
    },
    diff: {
      a: Infinity, f: (x) => Math.sqrt(x * x + 2 * x) - x, s: (x) => 2 / (Math.sqrt(1 + 2 / x) + 1), L: 1, xr: [0, 40], yr: [0, 1.5], xs: 10, ys: 0.5,
      goal: "lim x→∞ {√(x² + 2x) − x}",
      work: ["x → ∞이면 √(x² + 2x)도 x도 한없이 커집니다: ∞ − ∞ 꼴입니다.", "√(x² + 2x) + x를 곱하고 나눕니다: 2x/(√(x² + 2x) + x)", "x > 0이므로 분자와 분모를 x로 나눕니다: 2/(√(1 + 2/x) + 1)", "lim x→∞ 2/(√(1 + 2/x) + 1) = 2/(1 + 1) = 1"],
    },
  };
  let k = "fac", step = 0;
  const { ctx, size } = fit($("canvas"), () => draw());
  const far = () => P[k].a === Infinity;
  const xOf = () => (far() ? Math.pow(10, +sl.value) : P[k].a + Math.pow(10, -sl.value));

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[k], x = xOf();
    const g = K.frame(ctx, w, h, { xr: p.xr, yr: p.yr, xs: p.xs, ys: p.ys, L: 38 });
    const from = k === "inf" ? 2.05 : p.xr[0];
    K.curve(ctx, g, (t) => (!far() && Math.abs(t - p.a) < 1e-9 ? NaN : p.f(t)), C.forest, { from, N: 800 });
    if (k === "inf") K.curve(ctx, g, p.f, C.forest, { from: 0, to: 1.95 });
    if (!far()) K.dot(ctx, g, p.a, p.L, C.forest, step < 2);
    if (step >= 2) K.curve(ctx, g, p.s, K.BLUE, { from: k === "inf" ? 2.05 : from + 1e-6, width: 1.6, dash: [6, 4], N: 800 });
    if (step >= 3) {
      K.curve(ctx, g, () => p.L, C.warn, { width: 1.2, dash: [3, 3] });
      K.tag(ctx, g, `극한값 ${n(p.L)}`, g.x0 + g.w - 4, g.Y(p.L) - 12, C.warn, "right");
    }
    if (x <= p.xr[1]) { K.guide(ctx, g, x, p.f(x), C.ink2, "x"); K.dot(ctx, g, x, p.f(x), C.ink, false, 5); }
    else K.tag(ctx, g, `→ x = ${n(x)} (그림 밖)`, g.x0 + g.w - 4, g.Y(p.f(x)) + 14, C.ink2, "right");
  }

  function update() {
    const p = P[k], x = xOf();
    $(".goal").textContent = p.goal;
    work.forEach((li, i) => { li.textContent = p.work[i]; li.className = i < step + 1 ? "on" : "hide"; });
    $(".go-step").disabled = step >= 3;
    $(".t-lab").textContent = far() ? `x = 10^${sl.value}` : `x = ${n(p.a)} + 10^${K.M}${sl.value}`;
    $(".n-x").textContent = n(x, 7);
    $(".n-f").textContent = n(p.f(x), 7);
    $(".n-s").textContent = step >= 2 ? n(p.s(x), 7) : "—";
    draw();
  }
  K.chips(root, ".presets .chip", (b) => { k = b.dataset.k; step = 0; update(); });
  $(".go-step").addEventListener("click", () => { step = Math.min(3, step + 1); update(); });
  $(".go-reset").addEventListener("click", () => { step = 0; update(); });
  sl.addEventListener("input", update);
  update();
})();
