/* 카드: 강가에 들렀다 가는 가장 짧은 길은 어디일까? — A를 x축에 대해 대칭이동해 AP + PB ≥ A′B 발견 (거리 단위 km, 모식) */
(() => {
  const root = document.getElementById("card-cm2-shortest-path");
  if (!root) return;
  const { C, clamp } = NM, K = NMCoord;
  const $ = (s) => root.querySelector(s), hide = $(".go-hide");
  const A = [-3, 2], B = [4, 4], Pp = [2, 0];
  let show = false;
  const P = K.plane($("canvas"), { cx: 0.5, cy: 1, span: 14 }, () => draw());
  const best = () => (A[0] * B[1] + B[0] * A[1]) / (A[1] + B[1]);
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);

  function draw() {
    if (!P.size.w) return;
    P.grid();
    const B0 = P.box();
    P.path([[B0.x0, 0], [B0.x1, 0], [B0.x1, B0.y0], [B0.x0, B0.y0]], null, 0, null, true, C.sprout, 0.3);
    P.line(0, 1, 0, C.forest, 3);
    P.text("강가", [B0.x0, 0], C.forest, 6, 12, "left");
    const A2 = [A[0], -A[1]];
    if (show) {
      P.seg(A, A2, C.ink3, 1, [3, 3]); P.seg(A2, B, C.ink3, 1.5, [6, 4]); P.seg(A2, Pp, C.amber, 2, [5, 4]);
      P.dot(A2, C.amber, 5); P.text(`A′(${K.n(A2[0])}, ${K.n(A2[1])})`, A2, C.amber, 10, 10, "left");
    }
    P.seg(A, Pp, C.warn, 3); P.seg(Pp, B, C.warn, 3);
    P.knob(A, C.ink2); P.knob(B, C.ink2); P.knob(Pp, C.warn);
    P.text(`A(${K.n(A[0])}, ${K.n(A[1])})`, A, C.ink2, -10, -12, "right");
    P.text(`B(${K.n(B[0])}, ${K.n(B[1])})`, B, C.ink2, 10, -12, "left");
    P.text("P", Pp, C.warn, 0, -16, "center");
  }

  function update() {
    const A2 = [A[0], -A[1]], s = d(A, Pp) + d(Pp, B), m = d(A2, B), k = (B[0] - A[0]) ** 2 + (B[1] + A[1]) ** 2;
    $(".n-s").textContent = K.n(s); $(".n-m").textContent = `${K.surd(k)} ≈ ${K.n(m)}`;
    const e = $(".n-d"), z = s - m < 0.005; e.textContent = K.n(s - m); e.className = `n-d ${z ? "good" : ""}`;
    $(".eq").innerHTML = `P(${K.n(Pp[0])}, 0): AP + PB = ${K.n(d(A, Pp))} + ${K.n(d(Pp, B))} = ${K.n(s)}<br>가장 짧은 지점 <i>x</i> = (${K.pn(A[0])}·${B[1]} + ${K.pn(B[0])}·${A[1]}) / (${A[1]} + ${B[1]}) = ${K.frac(A[0] * B[1] + B[0] * A[1], A[1] + B[1])}`;
    hide.setAttribute("aria-pressed", String(show));
    draw();
  }
  $(".go-best").addEventListener("click", () => { Pp[0] = best(); update(); });
  hide.addEventListener("click", () => { show = !show; update(); });
  P.drag([
    { get: () => A, set: (x, y) => { A[0] = Math.round(x); A[1] = clamp(Math.round(y), 1, 4); } },
    { get: () => B, set: (x, y) => { B[0] = Math.round(x); B[1] = clamp(Math.round(y), 1, 4); } },
    { get: () => Pp, set: (x) => { Pp[0] = Math.round(x * 10) / 10; } },
  ], update);
  update();
})();
