/* 카드: 도형을 옮기면 각 점의 좌표는 어떻게 바뀔까? — a, b 슬라이더와 A′ 끌기로 (x, y) → (x + a, y + b) */
(() => {
  const root = document.getElementById("card-cm2-translate-point");
  if (!root) return;
  const { C, clamp } = NM, K = NMCoord;
  const $ = (s) => root.querySelector(s), sa = $(".a"), sb = $(".b");
  const A = [-6, -4];
  const SHAPE = [[0, 0], [3, 0], [3, 2], [1, 2], [1, 1], [0, 1]];   // 기역자 모양 책상(모식)
  const P = K.plane($("canvas"), { cx: 0, cy: 0, span: 16 }, () => draw());
  const ab = () => [+sa.value, +sb.value];

  function draw() {
    if (!P.size.w) return;
    P.grid();
    const [a, b] = ab(), src = SHAPE.map(([x, y]) => [A[0] + x, A[1] + y]), dst = src.map(([x, y]) => [x + a, y + b]);
    P.path(src, C.ink3, 2, [5, 4], true, C.ink3, 0.12);
    src.forEach((p, i) => P.arrow(p, dst[i], C.ink3, 1.2));
    P.path(dst, C.forest, 2.5, null, true, C.sprout, 0.45);
    P.knob(A, C.ink2); P.knob(dst[0], C.forest);
    P.text(`A(${K.n(A[0])}, ${K.n(A[1])})`, A, C.ink2, -10, 12, "right");
    P.text(`A′(${K.n(A[0] + a)}, ${K.n(A[1] + b)})`, dst[0], C.forest, -10, 12, "right");
  }

  function update() {
    const [a, b] = ab();
    $(".o-a").textContent = K.n(a); $(".o-b").textContent = K.n(b);
    $(".n-a").textContent = `(${K.n(A[0])}, ${K.n(A[1])})`;
    $(".n-a2").textContent = `(${K.n(A[0] + a)}, ${K.n(A[1] + b)})`;
    $(".n-d").textContent = K.surd(a * a + b * b);
    $(".eq").innerHTML = `(<i>x</i>, <i>y</i>) → (<i>x</i> ${a < 0 ? "−" : "+"} ${Math.abs(a)}, <i>y</i> ${b < 0 ? "−" : "+"} ${Math.abs(b)})<br>A(${K.n(A[0])}, ${K.n(A[1])}) → A′(${K.n(A[0])} ${a < 0 ? "−" : "+"} ${Math.abs(a)}, ${K.n(A[1])} ${b < 0 ? "−" : "+"} ${Math.abs(b)}) = A′(${K.n(A[0] + a)}, ${K.n(A[1] + b)})`;
    draw();
  }
  root.querySelectorAll("input").forEach((i) => i.addEventListener("input", update));
  P.drag([
    { get: () => A, set: (x, y) => { A[0] = Math.round(x); A[1] = Math.round(y); } },
    { get: () => { const [a, b] = ab(); return [A[0] + a, A[1] + b]; },
      set: (x, y) => { sa.value = clamp(Math.round(x) - A[0], -7, 7); sb.value = clamp(Math.round(y) - A[1], -5, 5); } },
  ], update);
  update();
})();
