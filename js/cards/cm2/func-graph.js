/* 카드: 그래프만 보고 함수인지 알 수 있을까? — 세로선 x = a, 가로선 y = b를 끌며 곡선과 만나는 점의 수를 센다 */
(() => {
  const root = document.getElementById("card-cm2-func-graph");
  if (!root) return;
  const { C, clamp } = NM, K = NMCoord;
  const $ = (s) => root.querySelector(s), btns = [...root.querySelectorAll(".presets .chip")];
  const sq = (v) => (v < -1e-9 ? [] : v < 1e-9 ? [0] : [Math.sqrt(v), -Math.sqrt(v)]);
  const CURVES = {
    line: { name: "y = x/2 + 1", ys: (x) => [x / 2 + 1], xs: (y) => [2 * (y - 1)], fn: true, inj: true },
    para: { name: "y = x²/2 − 2", ys: (x) => [x * x / 2 - 2], xs: (y) => sq(2 * (y + 2)), fn: true, inj: false },
    cube: { name: "y = x³/8", ys: (x) => [x ** 3 / 8], xs: (y) => [Math.cbrt(8 * y)], fn: true, inj: true },
    circ: { name: "x² + y² = 9", ys: (x) => sq(9 - x * x), xs: (y) => sq(9 - y * y), fn: false, inj: false },
    side: { name: "x = y²/2 − 2", ys: (x) => sq(2 * (x + 2)), xs: (y) => [y * y / 2 - 2], fn: false, inj: false },
  };
  let cur = CURVES.para, a = 1, b = 1;
  const P = K.plane($("canvas"), { cx: 0, cy: 0, span: 13 }, () => draw());

  function drawCurve() {
    if (cur === CURVES.circ) { P.circle(0, 0, 3, C.forest, 3); return; }
    if (cur === CURVES.side) {
      const pts = []; for (let y = -6; y <= 6.001; y += 0.05) pts.push([y * y / 2 - 2, y]);
      P.path(pts, C.forest, 3); return;
    }
    P.curve((x) => cur.ys(x)[0], C.forest, 3);
  }

  function draw() {
    if (!P.size.w) return;
    P.grid();
    drawCurve();
    const B = P.box(), ya = cur.ys(a), xb = cur.xs(b);
    const ca = ya.length === 1 ? C.forest : C.warn, cb = xb.length <= 1 ? C.amber : C.warn;
    P.seg([a, B.y0], [a, B.y1], ca, 2, [6, 4]);
    P.seg([B.x0, b], [B.x1, b], cb, 2, [2, 4]);
    ya.forEach((y) => P.dot([a, y], ca, 5.5));
    xb.forEach((x) => P.dot([x, b], cb, 4.5));
    P.knob([a, B.y0 + 0.55], ca); P.knob([B.x0 + 0.55, b], cb);
    P.text(`x = ${K.n(a)}`, [a, B.y0 + 0.55], ca, 14, 0);
    P.text(`y = ${K.n(b)}`, [B.x0 + 0.55, b], cb, 0, -16);
    if (cur.fn && ya.length === 1) P.text(`(${K.n(a)}, ${K.n(ya[0])})`, [a, ya[0]], ca, 10, -12);
  }

  function update() {
    const ya = cur.ys(a), xb = cur.xs(b);
    $(".n-a").textContent = `${ya.length}개`; $(".n-a").className = `n-a ${ya.length === 1 ? "good" : ya.length > 1 ? "bad" : ""}`;
    $(".n-b").textContent = `${xb.length}개`; $(".n-b").className = `n-b ${xb.length > 1 ? "bad" : ""}`;
    $(".n-v").textContent = cur.fn ? (cur.inj ? "함수 · 일대일" : "함수 · 일대일 아님") : "함수가 아님";
    $(".n-v").className = `n-v ${cur.fn ? "good" : "bad"}`;
    const xs = (v) => `<i>x</i> = ${K.n(v)}`;
    $(".eq").innerHTML = `곡선 ${cur.name.replace(/x/g, "<i>x</i>").replace(/y/g, "<i>y</i>")}<br>` +
      (ya.length === 0 ? `${xs(a)}에 대응하는 <i>y</i>가 없습니다.`
        : ya.length === 1 ? `${xs(a)}에 대응하는 <i>y</i>는 ${K.n(ya[0])} 하나입니다.`
        : `${xs(a)}에 대응하는 <i>y</i>가 ${ya.map((v) => K.n(v)).join(", ")} 두 개입니다.`);
    draw();
  }

  btns.forEach((bt) => bt.addEventListener("click", () => {
    cur = CURVES[bt.dataset.c];
    btns.forEach((x) => x.setAttribute("aria-pressed", String(x === bt)));
    update();
  }));
  P.drag([
    { get: () => [a, P.box().y0 + 0.55], set: (x) => { a = clamp(Math.round(x * 2) / 2, -6, 6); } },
    { get: () => [P.box().x0 + 0.55, b], set: (x, y) => { b = clamp(Math.round(y * 2) / 2, -6, 6); } },
  ], update);
  update();
})();
