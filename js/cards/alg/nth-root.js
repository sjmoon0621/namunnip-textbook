/* 카드: a의 n제곱근 가운데 실수는 몇 개일까? — y = xⁿ과 y = a의 교점 세기 */
(() => {
  const root = document.getElementById("card-alg-nth-root");
  if (!root) return;
  const { C, fit } = NM, E = NMExp;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".presets .chip")];
  const sn = $(".n"), sa = $(".a"), cv = $("canvas");
  const O = { X0: -3, X1: 3, Y0: -10, Y1: 10, xt: [-3, -2, -1, 0, 1, 2, 3], yt: [-10, -5, 0, 5, 10] };
  let g = null;
  const { ctx, size } = fit(cv, () => draw());

  function roots(n, a) {
    if (a === 0) return [0];
    const r = Math.pow(Math.abs(a), 1 / n);
    if (n % 2) return [a > 0 ? r : -r];
    return a > 0 ? [-r, r] : [];
  }
  const rad = (n, inner) => `${n === 2 ? "" : `<sup>${n}</sup>`}√${inner}`;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sn.value, a = +sa.value, rs = roots(n, a);
    g = E.frame(ctx, w, h, O);
    E.curve(ctx, g, (x) => x ** n, C.forest, { lw: 2.5 });
    E.hline(ctx, g, a, C.warn, [], 2);
    rs.forEach((x) => { E.vline(ctx, g, x, C.ink3); E.dot(ctx, g, x, a, C.warn, 5.5); E.tag(ctx, g, `x = ${E.n(x, 2)}`, g.X(x), g.Y(0) + (a >= 0 ? 12 : -12), C.warn, "center", 11); });
    const xl = Math.pow(9, 1 / n);
    E.tag(ctx, g, `y = x${E.sup(n)}`, g.X(xl) + 8, g.Y(9), C.forest);
    E.tag(ctx, g, `y = ${E.n(a)}`, g.x0 + 4, g.Y(a) + (a > 7 ? 13 : -12), C.warn);
    E.tag(ctx, g, `교점 ${rs.length}개`, g.x0 + g.gw - 4, g.y0 + g.gh - 10, rs.length ? C.ink : C.warn, "right", 12.5);
  }

  function update() {
    const n = +sn.value, a = +sa.value, rs = roots(n, a);
    $(".n-out").textContent = n; $(".a-out").textContent = E.n(a);
    $(".n-cnt").textContent = `${rs.length}개`;
    $(".n-odd").textContent = n % 2 ? "홀수" : "짝수";
    $(".n-sgn").textContent = a > 0 ? "양수" : a < 0 ? "음수" : "0";
    const A = a < 0 ? `(${E.n(a)})` : E.n(a);
    const eq = (v) => { const t = E.approx(v); return t.startsWith("≈") ? ` ${t}` : ` = ${t}`; };
    let s;
    if (a === 0) s = `${rad(n, "0")} = 0 하나`;
    else if (n % 2) s = `${rad(n, A)}${eq(rs[0])} 하나`;
    else if (a > 0) s = `${rad(n, A)}${eq(rs[1])}, −${rad(n, A)}${eq(rs[0])}`;
    else s = "없음 (짝수 제곱은 음수가 될 수 없음)";
    $(".n-sym").innerHTML = s;
    draw();
  }

  E.drag(cv, (px, py) => { if (!g) return; sa.value = String(g.IY(py)); chips.forEach((c) => c.setAttribute("aria-pressed", "false")); update(); });
  chips.forEach((b) => b.addEventListener("click", () => {
    sn.value = b.dataset.n; sa.value = b.dataset.a;
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c === b))); update();
  }));
  [sn, sa].forEach((s) => s.addEventListener("input", () => { chips.forEach((c) => c.setAttribute("aria-pressed", "false")); update(); }));
  update();
})();
