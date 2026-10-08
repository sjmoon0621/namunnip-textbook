/* 카드: 8^(2/3)은 무엇을 뜻하고, 밑은 왜 양수여야 할까? — 분모 n의 유리수 지수 점 찍기, 음수 밑에서 값이 갈리는 것 */
(() => {
  const root = document.getElementById("card-alg-rational-exp");
  if (!root) return;
  const { C, fit } = NM, E = NMExp;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".presets .chip")];
  const sn = $(".n"), sm = $(".m");
  let a = 2;
  const rt = (x, n) => (x >= 0 ? Math.pow(x, 1 / n) : n % 2 ? -Math.pow(-x, 1 / n) : NaN);
  const rad = (n, inner) => (n === 1 ? inner : `${n === 2 ? "" : `<sup>${n}</sup>`}√${inner}`);
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sn.value, m = +sm.value, neg = a < 0;
    const O = neg ? { X0: -2, X1: 2, Y0: -9, Y1: 9, yt: [-9, -6, -3, 0, 3, 6, 9] } : { X0: -2, X1: 2, Y0: 0, Y1: 9, yt: [0, 3, 6, 9] };
    O.xt = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
    const g = E.frame(ctx, w, h, O);
    if (!neg) E.curve(ctx, g, (x) => a ** x, C.sprout, { lw: 1.5, dash: [5, 4] });
    for (let k = -2 * n; k <= 2 * n; k++) E.dot(ctx, g, k / n, rt(a ** k, n), C.forest, 3.6);
    const v = rt(a ** m, n);
    E.vline(ctx, g, m / n, C.warn, [3, 3], 1);
    E.dot(ctx, g, m / n, v, C.warn, 6);
    if (isFinite(v)) E.tag(ctx, g, `x = ${m}/${n}, 값 ${E.n(v, 3)}`, g.X(m / n) + 9, g.Y(v) - 12, C.warn);
    else E.tag(ctx, g, `x = ${m}/${n}: 실수 값 없음`, g.X(m / n) + 9, g.Y(0) - 14, C.warn);
    E.tag(ctx, g, neg ? "밑 −8: 곡선이 되지 않음" : `y = ${E.n(a)}ˣ 위의 점들`, g.x0 + 6, g.y0 + 10, neg ? C.warn : C.forest);
  }

  function update() {
    const n = +sn.value;
    sm.min = String(-2 * n); sm.max = String(2 * n);
    const m = +sm.value, A = a < 0 ? `(${E.n(a)})` : E.n(a);
    $(".n-out").textContent = n; $(".m-out").textContent = E.n(m);
    const v1 = rt(a ** m, n), v2 = rt(a ** (2 * m), 2 * n);
    const show = (v) => (isFinite(v) ? E.approx(v) : "실수 아님");
    $(".n-1").textContent = show(v1); $(".n-2").textContent = show(v2);
    const same = isFinite(v1) && isFinite(v2) && Math.abs(v1 - v2) < 1e-9 * Math.max(1, Math.abs(v1));
    const s = $(".n-s"); s.textContent = same ? "같음" : "다름"; s.className = `n-s ${same ? "good" : "bad"}`;
    const lhs = a < 0 ? `${A}<sup>${E.n(m)}/${n}</sup>?` : `${A}<sup>${E.n(m)}/${n}</sup>`;
    $(".eq").innerHTML = `${lhs} → ${rad(n, `${A}<sup>${E.n(m)}</sup>`)} ${isFinite(v1) ? (E.approx(v1).startsWith("≈") ? E.approx(v1) : `= ${E.approx(v1)}`) : "(실수 아님)"}`;
    draw();
  }
  chips.forEach((c) => c.addEventListener("click", () => { a = +c.dataset.a; chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c))); update(); }));
  [sn, sm].forEach((s) => s.addEventListener("input", update));
  update();
})();
