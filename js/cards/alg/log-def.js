/* 카드: 2를 몇 제곱하면 5가 될까? — y = aˣ와 y = N의 교점에서 log_a N 읽기, 밑·진수의 조건 */
(() => {
  const root = document.getElementById("card-alg-log-def");
  if (!root) return;
  const { C, fit } = NM, E = NMExp;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".presets .chip")];
  const sa = $(".a"), sn = $(".n"), cv = $("canvas");
  const O = { X0: -4, X1: 4, Y0: -3, Y1: 12, xt: [-4, -3, -2, -1, 0, 1, 2, 3, 4], yt: [0, 4, 8, 12] };
  let g = null;
  const { ctx, size } = fit(cv, () => draw());
  const solve = (a, N) => (a === 1 ? (N === 1 ? "all" : null) : N > 0 ? Math.log(N) / Math.log(a) : null);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = +sa.value, N = +sn.value, x = solve(a, N);
    g = E.frame(ctx, w, h, O);
    E.curve(ctx, g, (t) => a ** t, C.forest, { lw: 2.5 });
    E.hline(ctx, g, N, C.warn, [], 2);
    E.tag(ctx, g, `y = ${E.n(a)}ˣ`, g.x0 + 6, g.y0 + 10, C.forest);
    if (typeof x === "number") {
      E.vline(ctx, g, x, C.warn, [3, 3], 1.2);
      E.dot(ctx, g, x, N, C.warn, 6);
      E.dot(ctx, g, x, 0, C.warn, 4.5, true);
      E.tag(ctx, g, `x = log ${E.n(N)} (밑 ${E.n(a)}) ${Math.abs(x - Math.round(x)) < 1e-9 ? "=" : "≈"} ${E.n(x, 3)}`, g.X(x), g.Y(0) + 14, C.warn, "center");
    } else {
      E.tag(ctx, g, x === "all" ? "모든 점이 겹침: x가 하나로 정해지지 않음" : "교점 없음", g.x0 + g.gw - 4, g.Y(Math.max(-2, Math.min(11, N))) - 14, C.warn, "right");
    }
    E.tag(ctx, g, `y = ${E.n(N)}`, g.x0 + g.gw - 4, g.Y(N) + (N > 10 ? 14 : -12) + (typeof x === "number" ? 0 : 28), C.warn, "right");
  }

  function update() {
    const a = +sa.value, N = +sn.value, x = solve(a, N);
    $(".a-out").textContent = E.n(a); $(".n-out").textContent = E.n(N);
    const A = E.n(a), Ns = N < 0 ? `(${E.n(N)})` : E.n(N);
    let eq, cnt, lv, ck;
    if (a === 1) { eq = `밑이 1: 1<sup><i>x</i></sup>는 언제나 1이므로 log<sub>1</sub> ${Ns}은 정의하지 않습니다.`; cnt = N === 1 ? "무수히 많음" : "0개"; lv = "정의 안 됨"; ck = "—"; }
    else if (N <= 0) { eq = `${A}<sup><i>x</i></sup>는 언제나 양수이므로 ${A}<sup><i>x</i></sup> = ${E.n(N)}인 <i>x</i>는 없습니다. 진수는 양수여야 합니다.`; cnt = "0개"; lv = "정의 안 됨"; ck = "—"; }
    else { eq = `${A}<sup><i>x</i></sup> = ${E.n(N)} ⇔ <i>x</i> = log<sub>${A}</sub> ${E.n(N)} ${E.approx(x).startsWith("≈") ? E.approx(x) : `= ${E.approx(x)}`}`; cnt = "1개"; lv = E.approx(x); ck = E.n(a ** x, 4); }
    $(".eq").innerHTML = eq; $(".n-c").textContent = cnt; $(".n-l").textContent = lv; $(".n-k").textContent = ck;
    draw();
  }
  const clear = () => chips.forEach((c) => c.setAttribute("aria-pressed", "false"));
  E.drag(cv, (px, py) => { if (!g) return; sn.value = String(g.IY(py)); clear(); update(); });
  chips.forEach((b) => b.addEventListener("click", () => { sa.value = b.dataset.a; sn.value = b.dataset.n; chips.forEach((c) => c.setAttribute("aria-pressed", String(c === b))); update(); }));
  [sa, sn].forEach((s) => s.addEventListener("input", () => { clear(); update(); }));
  update();
})();
