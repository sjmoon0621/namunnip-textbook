/* 카드: y = aˣ가 함수가 되려면 밑은 어때야 할까? — 0.25 간격 입력의 출력을 찍어 밑의 조건 찾기 */
(() => {
  const root = document.getElementById("card-alg-exp-func-def");
  if (!root) return;
  const { C, fit } = NM, E = NMExp;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".presets .chip")];
  const sx = $(".x"), cv = $("canvas");
  let a = 2, g = null;
  const XS = Array.from({ length: 33 }, (_, i) => -4 + i * 0.25);
  /* 음수 밑: 0.25 간격 입력은 기약분수의 분모가 2나 4(짝수)이므로 정수일 때만 실수 값이 있다 */
  const pow = (b, x) => (b > 0 || Number.isInteger(x) ? b ** x : NaN);
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const neg = a < 0, x = +sx.value, y = pow(a, x);
    const O = neg ? { X0: -4, X1: 4, Y0: -17, Y1: 17, yt: [-16, -8, 0, 8, 16] } : { X0: -4, X1: 4, Y0: -1, Y1: 17, yt: [0, 4, 8, 12, 16] };
    O.xt = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
    g = E.frame(ctx, w, h, O);
    if (!neg) E.curve(ctx, g, (t) => a ** t, C.sprout, { lw: 1.5, dash: [5, 4] });
    XS.forEach((t) => E.dot(ctx, g, t, pow(a, t), C.forest, 3.4));
    E.vline(ctx, g, x, C.warn, [3, 3], 1.2);
    if (isFinite(y)) { E.dot(ctx, g, x, y, C.warn, 6.5); E.tag(ctx, g, `(${E.n(x)}, ${E.n(y, 3)})`, g.X(x) + 10, g.Y(y) - 12, C.warn); }
    else E.tag(ctx, g, `x = ${E.n(x)}: 실수 값 없음`, g.X(x) + 10, g.Y(0) - 14, C.warn);
    E.tag(ctx, g, neg ? `밑 −2: 정수 x에서만 점` : a === 1 ? "밑 1: 모든 출력이 1" : `y = ${E.n(a)}ˣ`, g.x0 + 6, g.y0 + 10, neg ? C.warn : C.forest);
  }

  function update() {
    const x = +sx.value, y = pow(a, x), A = a < 0 ? `(${E.n(a)})` : a === 0.5 ? "(1/2)" : E.n(a);
    $(".x-out").textContent = E.n(x);
    $(".eq").innerHTML = `${A}<sup>${E.n(x)}</sup> ${isFinite(y) ? (E.approx(y).startsWith("≈") ? E.approx(y) : `= ${E.approx(y)}`) : "→ 실수 아님"}`;
    $(".n-y").textContent = isFinite(y) ? E.n(y, 4) : "실수 아님";
    const cnt = XS.filter((t) => isFinite(pow(a, t))).length;
    $(".n-c").textContent = `${cnt} / ${XS.length}`;
    const v = $(".n-v");
    v.textContent = a < 0 ? "실수 전체에서 정의 안 됨" : a === 1 ? "상수함수 (제외)" : "지수함수";
    v.className = `n-v ${a > 0 && a !== 1 ? "good" : "bad"}`;
    draw();
  }
  E.drag(cv, (px) => { if (!g) return; sx.value = String(g.IX(px)); update(); });
  chips.forEach((c) => c.addEventListener("click", () => { a = +c.dataset.a; chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c))); update(); }));
  sx.addEventListener("input", update);
  update();
})();
