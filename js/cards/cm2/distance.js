/* 카드: 두 점 사이의 거리는 어떻게 잴까? — 두 점을 끌어 가로·세로 차이와 피타고라스 정리로 거리 구하기 */
(() => {
  const root = document.getElementById("card-cm2-distance");
  if (!root) return;
  const { C } = NM, K = NMCoord;
  const $ = (s) => root.querySelector(s);
  const A = [-3, -1], B = [3, 3];
  const P = K.plane($("canvas"), { cx: 0, cy: 1, span: 12 }, () => draw());
  const pt = (name, p) => `${name}(${K.n(p[0])}, ${K.n(p[1])})`;

  function draw() {
    if (!P.size.w) return;
    P.grid();
    const R = [B[0], A[1]], dx = Math.abs(B[0] - A[0]), dy = Math.abs(B[1] - A[1]);
    if (dx && dy) {
      P.path([A, R, B], null, 0, null, true, C.sprout, 0.35);
      P.seg(A, R, C.ink2, 1.5, [5, 4]); P.seg(R, B, C.ink2, 1.5, [5, 4]);
      P.right(R, [A[0] - R[0], 0], [0, B[1] - R[1]], C.ink2);
    }
    P.seg(A, B, C.forest, 3);
    if (dx) P.text(`가로 ${dx}`, [(A[0] + B[0]) / 2, A[1]], C.ink2, 0, B[1] >= A[1] ? 14 : -14, "center");
    if (dy) P.text(`세로 ${dy}`, [B[0], (A[1] + B[1]) / 2], C.ink2, B[0] >= A[0] ? 8 : -8, 0, B[0] >= A[0] ? "left" : "right");
    P.knob(A, C.warn); P.knob(B, C.warn);
    const up = A[1] >= B[1];
    P.text(pt("A", A), A, C.warn, 0, up ? -18 : 18, "center");
    P.text(pt("B", B), B, C.warn, 0, up ? 18 : -18, "center");
  }

  function update() {
    const dx = Math.abs(B[0] - A[0]), dy = Math.abs(B[1] - A[1]), k = dx * dx + dy * dy;
    $(".n-dx").textContent = dx; $(".n-dy").textContent = dy;
    const ab = K.surd(k), exact = Number.isInteger(Math.sqrt(k));
    $(".n-ab").textContent = exact ? ab : `${ab} ≈ ${K.n(Math.sqrt(k))}`;
    $(".eq").innerHTML = k === 0 ? "두 점이 겹쳤습니다. 거리는 0입니다."
      : `AB = √(${dx}<sup>2</sup> + ${dy}<sup>2</sup>) = √${k}${exact || ab !== "√" + k ? " = " + ab : ""}`;
    draw();
  }
  const grab = (p) => ({ get: () => p, set: (x, y) => { p[0] = Math.round(x); p[1] = Math.round(y); } });
  P.drag([grab(A), grab(B)], update);
  update();
})();
