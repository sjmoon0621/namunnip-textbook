/* 카드: 수직인 두 직선의 기울기는 어떤 관계일까? — 점 Q를 90° 돌려 합동인 기울기 삼각형으로 m₁m₂ = −1 발견 */
(() => {
  const root = document.getElementById("card-cm2-perp");
  if (!root) return;
  const { C } = NM, K = NMCoord;
  const $ = (s) => root.querySelector(s);
  const Q = [3, 1];
  const P = K.plane($("canvas"), { cx: 0, cy: 0.5, span: 11 }, () => draw());
  const X = "<i>x</i>", Y = "<i>y</i>";

  function draw() {
    if (!P.size.w) return;
    P.grid();
    const [p, q] = Q, R = [-q, p], O = [0, 0];
    P.path([O, [p, 0], Q], C.forest, 1.5, [4, 3], true, C.forest, 0.18);
    P.path([O, [-q, 0], R], C.warn, 1.5, [4, 3], true, C.warn, 0.18);
    P.line(q, -p, 0, C.forest, 3); P.line(p, q, 0, C.warn, 3);
    P.right(O, Q, R, C.ink, 12);
    if (p && q) {
      P.text(`가로 ${K.n(p)}`, [p / 2, 0], C.forest, 0, q > 0 ? 13 : -13, "center", `600 11px ${NM.F.sans}`);
      P.text(`세로 ${K.n(q)}`, [p, q / 2], C.forest, p > 0 ? 6 : -6, 0, p > 0 ? "left" : "right", `600 11px ${NM.F.sans}`);
      P.text(`가로 ${K.n(-q)}`, [-q / 2, 0], C.warn, 0, p > 0 ? 13 : -13, "center", `600 11px ${NM.F.sans}`);
      P.text(`세로 ${K.n(p)}`, [-q, p / 2], C.warn, -q > 0 ? 6 : -6, 0, -q > 0 ? "left" : "right", `600 11px ${NM.F.sans}`);
    }
    P.dot(R, C.warn, 5);
    P.knob(Q, C.forest);
    P.text(`Q(${K.n(p)}, ${K.n(q)})`, Q, C.forest, 10, -12, "left");
    P.text(`Q′(${K.n(-q)}, ${K.n(p)})`, R, C.warn, -10, -12, "right");
    P.text("ℓ₁", [-Q[0] * 1.6, -Q[1] * 1.6], C.forest, 8, 10, "left");
    P.text("ℓ₂", [-R[0] * 1.6, -R[1] * 1.6], C.warn, 8, 10, "left");
  }

  function update() {
    const [p, q] = Q;
    const m1 = p ? K.frac(q, p) : "없음", m2 = q ? K.frac(-p, q) : "없음";
    $(".n-m1").textContent = m1; $(".n-m2").textContent = m2;
    const pr = $(".n-pr");
    pr.textContent = p && q ? K.frac(-q * p, p * q) : "곱할 수 없음";
    pr.className = `n-pr ${p && q ? "good" : ""}`;
    $(".eq").innerHTML = `ℓ₁: ${K.lin([[q, X], [-p, Y]])} = 0, ℓ₂: ${K.lin([[p, X], [q, Y]])} = 0<br><i>aa</i>′ + <i>bb</i>′ = ${K.pn(q)}·${K.pn(p)} + ${K.pn(-p)}·${K.pn(q)} = 0`;
    draw();
  }
  P.drag([{ get: () => Q, set: (x, y) => { const a = NM.clamp(Math.round(x), -3, 3), b = NM.clamp(Math.round(y), -3, 3); if (a || b) { Q[0] = a; Q[1] = b; } } }], update);
  update();
})();
