/* 카드: 평균 기울기와 같은 순간 기울기는 어디에 있을까? — 할선 AB와 점 C의 접선, f′(c) = 평균변화율인 c 찾기 */
(() => {
  const root = document.getElementById("card-calc1-mvt");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sa = $(".sa"), sb = $(".sb"), sc = $(".sc"), show = $(".go-show"), cv = $("canvas");
  const YR = { "0,-3,0,1": [-5, 5], "0,0,1,0": [-1, 7], "1,1,0,-0.5": [-5, 7] };
  let p = [0, -3, 0, 1], yr = YR["0,-3,0,1"], g = null;
  const f = (x) => p[0] + p[1] * x + p[2] * x * x + p[3] * x ** 3;
  const d = (x) => p[1] + 2 * p[2] * x + 3 * p[3] * x * x;
  const { ctx, size } = fit(cv, () => draw());

  /* f′(c) = m, 곧 3p₃c² + 2p₂c + (p₁ − m) = 0 의 해 가운데 (a, b) 안의 것 */
  function sols(a, b, m) {
    const A = 3 * p[3], B = 2 * p[2], c0 = p[1] - m;
    let r = [];
    if (Math.abs(A) < 1e-12) r = [-c0 / B];
    else { const D = B * B - 4 * A * c0; if (D >= 0) r = [(-B - Math.sqrt(D)) / (2 * A), (-B + Math.sqrt(D)) / (2 * A)]; }
    return r.filter((c, i) => c > a + 1e-9 && c < b - 1e-9 && r.indexOf(c) === i);
  }

  function state() {
    let a = +sa.value, b = +sb.value;
    if (b - a < 0.5) { if (document.activeElement === sb) a = b - 0.5; else b = a + 0.5; sa.value = a; sb.value = b; a = +sa.value; b = +sb.value; }
    const m = (f(b) - f(a)) / (b - a), c = clamp(+sc.value, a, b);
    if (+sc.value !== c) sc.value = c;
    return { a, b, m, c: +sc.value };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { a, b, m, c } = state();
    g = K.frame(ctx, w, h, { xr: [-2.7, 2.7], yr, xs: 1, ys: yr[1] - yr[0] > 10 ? 2 : 1 });
    K.curve(ctx, g, f, C.forest);
    K.curve(ctx, g, (x) => f(a) + m * (x - a), C.ink2, { from: a - 0.6, to: b + 0.6, width: 1.6 });
    K.dot(ctx, g, a, f(a), C.ink); K.dot(ctx, g, b, f(b), C.ink);
    K.tag(ctx, g, "A", g.X(a) - 16, g.Y(f(a)), C.ink); K.tag(ctx, g, "B", g.X(b) + 8, g.Y(f(b)), C.ink);
    if (show.getAttribute("aria-pressed") === "true") for (const s of sols(a, b, m)) { K.guide(ctx, g, s, f(s), C.amber, "x"); K.dot(ctx, g, s, f(s), C.amber, true, 6.5); }
    const t = d(c), ok = Math.abs(t - m) < 0.06, col = ok ? C.forest : K.BLUE;
    K.curve(ctx, g, (x) => f(c) + t * (x - c), col, { from: c - 1, to: c + 1, width: ok ? 3 : 2 });
    K.dot(ctx, g, c, f(c), col);
    K.tag(ctx, g, ok ? "C: 할선과 나란함" : "C", g.X(c) + 9, g.Y(f(c)) + 16, col);
  }

  function update() {
    const { a, b, m, c } = state(), t = d(c);
    $(".a-out").textContent = n(a, 1); $(".b-out").textContent = n(b, 1); $(".c-out").textContent = n(c, 2);
    $(".n-m").textContent = n(m, 3); $(".n-d").textContent = n(t, 3);
    const e = $(".n-e"), ok = Math.abs(t - m) < 0.06;
    e.textContent = n(t - m, 2); e.className = `n-e ${ok ? "good" : ""}`;
    if (show.getAttribute("aria-pressed") === "true") {
      const s = sols(a, b, m);
      show.textContent = s.length ? `c = ${s.map((v) => n(v, 3)).join(", ")} (${s.length}개)` : "조건을 만족하는 c 모두 보기";
    } else show.textContent = "조건을 만족하는 c 모두 보기";
    draw();
  }

  const drag = (e) => { if (!g) return; const r = cv.getBoundingClientRect(); sc.value = g.ix(e.clientX - r.left); update(); };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  K.chips(root, ".presets .chip", (bt) => { p = bt.dataset.p.split(",").map(Number); yr = YR[bt.dataset.p]; update(); });
  show.addEventListener("click", () => { show.setAttribute("aria-pressed", String(show.getAttribute("aria-pressed") !== "true")); update(); });
  [sa, sb, sc].forEach((s) => s.addEventListener("input", update));
  update();
})();
