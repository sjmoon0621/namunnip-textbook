/* 카드: 두 함수를 더하고 곱하면 극한값도 더하고 곱하면 될까? — f = x + 1, g = x² − 1의 합·차·실수배·곱·몫의 극한 */
(() => {
  const root = document.getElementById("card-calc1-lim-laws");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sa = $(".sa"), sd = $(".sd");
  const f = (x) => x + 1, g = (x) => x * x - 1;
  const OP = {
    add: { h: (x) => f(x) + g(x), law: (A, B) => A + B, s: "lim f + lim g" },
    sub: { h: (x) => f(x) - g(x), law: (A, B) => A - B, s: "lim f − lim g" },
    k: { h: (x) => 3 * f(x), law: (A) => 3 * A, s: "3 × lim f" },
    mul: { h: (x) => f(x) * g(x), law: (A, B) => A * B, s: "lim f × lim g" },
    div: { h: (x) => f(x) / g(x), law: (A, B) => (B === 0 ? NaN : A / B), s: "lim f ÷ lim g" },
  };
  let op = "add";
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = +sa.value, H = OP[op].h;
    const gr = K.frame(ctx, w, h, { xr: [-2.5, 2.5], yr: [-4, 10.5], xs: 0.5, ys: 2, xf: (v) => (Number.isInteger(v) ? n(v) : "") });
    K.curve(ctx, gr, f, C.warn, { width: 1.5, dash: [5, 4] });
    K.curve(ctx, gr, g, K.BLUE, { width: 1.5, dash: [5, 4] });
    K.curve(ctx, gr, (x) => (op === "div" && Math.abs(x + 1) < 1e-9 ? NaN : H(x)), C.forest, { N: 800 });
    if (op === "div") K.dot(ctx, gr, -1, -0.5, C.forest, true);
    const ya = H(a);
    if (isFinite(ya)) { K.guide(ctx, gr, a, ya, C.forest, "x"); K.dot(ctx, gr, a, ya, C.forest, false, 5); }
    else K.guide(ctx, gr, a, 0, C.forest, "x");
    K.tag(ctx, gr, "f", gr.X(2.3), gr.Y(f(2.3)) + 12, C.warn, "center");
    K.tag(ctx, gr, "g", gr.X(-2.2), gr.Y(g(-2.2)), K.BLUE, "left");
    K.tag(ctx, gr, root.querySelector(`[data-op="${op}"]`).textContent, gr.X(0) + 6, gr.y0 + 10, C.forest, "left");
  }

  function update() {
    const a = +sa.value, d = Math.pow(10, -sd.value), O = OP[op];
    const A = f(a), B = g(a);
    $(".a-out").textContent = n(a, 1);
    $(".d-out").textContent = n(d, 5);
    $(".n-fg").textContent = `${n(A)} / ${n(B)}`;
    $(".n-v").textContent = `${n(O.h(a - d), 5)} / ${n(O.h(a + d), 5)}`;
    const P = O.law(A, B), p = $(".n-p");
    p.textContent = isFinite(P) ? n(P, 5) : `${n(A)} ÷ 0 → 쓸 수 없음`;
    p.className = `n-p ${isFinite(P) ? "good" : "bad"}`;
    let s = `${O.s} = ${isFinite(P) ? n(P, 5) : "계산 불가"}. `;
    if (isFinite(P)) s += "a 양쪽의 값이 이 값으로 모입니다.";
    else if (A === 0) s += "0/0 꼴입니다. 실제 값은 −0.5 근처로 모입니다. f/g = 1/(x − 1) (x ≠ ±1)";
    else s += "분자는 2로, 분모는 0으로 갑니다. 실제 값은 양쪽에서 ±∞로 발산합니다.";
    $(".st").textContent = s;
    draw();
  }
  K.chips(root, ".presets .chip", (b) => { op = b.dataset.op; update(); });
  [sa, sd].forEach((el) => el.addEventListener("input", update));
  update();
})();
