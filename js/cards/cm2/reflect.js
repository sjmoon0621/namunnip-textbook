/* 카드: 거울에 비친 점의 좌표는 어떻게 될까? — 원점·x축·y축·y = x에 대한 점과 깃발 도형의 대칭이동 */
(() => {
  const root = document.getElementById("card-cm2-reflect");
  if (!root) return;
  const { C } = NM, K = NMCoord;
  const $ = (s) => root.querySelector(s), mirs = [...root.querySelectorAll(".mir .chip")];
  const Pt = [3, 1];
  let mir = "x";
  const FLAG = [[0, 0], [0, 2.5], [1.6, 2], [0, 1.5]];   // 깃대 아래 끝이 P
  const RF = { x: ([x, y]) => [x, -y], y: ([x, y]) => [-x, y], o: ([x, y]) => [-x, -y], d: ([x, y]) => [y, x] };
  const RULE = { x: "(<i>x</i>, <i>y</i>) → (<i>x</i>, −<i>y</i>)", y: "(<i>x</i>, <i>y</i>) → (−<i>x</i>, <i>y</i>)", o: "(<i>x</i>, <i>y</i>) → (−<i>x</i>, −<i>y</i>)", d: "(<i>x</i>, <i>y</i>) → (<i>y</i>, <i>x</i>)" };
  const P = K.plane($("canvas"), { cx: 0, cy: 0, span: 13 }, () => draw());

  function draw() {
    if (!P.size.w) return;
    P.grid();
    const f = RF[mir];
    if (mir === "x") P.line(0, 1, 0, C.forest, 3.5);
    else if (mir === "y") P.line(1, 0, 0, C.forest, 3.5);
    else if (mir === "d") P.line(1, -1, 0, C.forest, 3.5);
    else P.dot([0, 0], C.forest, 6);
    const src = FLAG.map(([x, y]) => [Pt[0] + x, Pt[1] + y]), dst = src.map(f), Q = f(Pt);
    const pole = (pts, col, alpha) => { P.seg(pts[0], pts[1], col, 2.5); P.path([pts[1], pts[2], pts[3]], col, 2, null, true, col, alpha); };
    pole(src, C.ink2, 0.2); pole(dst, C.warn, 0.3);
    const M = [(Pt[0] + Q[0]) / 2, (Pt[1] + Q[1]) / 2];
    if (Pt[0] !== Q[0] || Pt[1] !== Q[1]) {
      P.seg(Pt, Q, C.ink3, 1.5, [5, 4]);
      if (mir !== "o") P.right(M, { x: [1, 0], y: [0, 1], d: [1, 1] }[mir], [Pt[0] - M[0], Pt[1] - M[1]], C.ink2);
      P.dot(M, C.forest, 3.5);
    }
    P.knob(Pt, C.ink2); P.dot(Q, C.warn, 5.5);
    P.text(`P(${K.n(Pt[0])}, ${K.n(Pt[1])})`, Pt, C.ink2, 10, 12, "left");
    P.text(`P′(${K.n(Q[0])}, ${K.n(Q[1])})`, Q, C.warn, 10, 12, "left");
  }

  function update() {
    const Q = RF[mir](Pt);
    $(".n-p").textContent = `(${K.n(Pt[0])}, ${K.n(Pt[1])})`; $(".n-p2").textContent = `(${K.n(Q[0])}, ${K.n(Q[1])})`;
    $(".n-m").textContent = `(${K.n((Pt[0] + Q[0]) / 2)}, ${K.n((Pt[1] + Q[1]) / 2)})`;
    $(".eq").innerHTML = RULE[mir];
    draw();
  }
  mirs.forEach((b) => b.addEventListener("click", () => { mir = b.dataset.m; mirs.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  P.drag([{ get: () => Pt, set: (x, y) => { Pt[0] = NM.clamp(Math.round(x), -4, 4); Pt[1] = NM.clamp(Math.round(y), -4, 3); } }], update);
  update();
})();
