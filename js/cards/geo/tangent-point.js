/* 카드: 곡선 위의 점에서 그은 접선은 어떤 식일까? — 곡선 위 점 P의 접선 공식과, Q를 P에 다가가게 할 때 할선 PQ의 기울기 비교 */
(() => {
  const root = document.getElementById("card-geo-tangent-point");
  if (!root) return;
  const { C } = NM, K = NMCoord, Q = NMConic;
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
  /* 포물선 y² = 8x (p = 2), 타원 x²/9 + y²/4 = 1, 쌍곡선 x²/4 − y² = 1. 점은 매개변수 {t, br}로 기억한다 */
  const p = 2, EA = 3, EB = 2, HA = 2, HB = 1;
  let cur = "ell";
  const S = { par: [{ t: 2 }, { t: -2 }], ell: [{ t: 0.85 }, { t: 2.4 }], hyp: [{ t: 0.8, br: 1 }, { t: -0.6, br: 1 }] };
  const pos = (q) => {
    if (cur === "par") return [q.t * q.t / (4 * p), q.t];
    if (cur === "ell") return [EA * Math.cos(q.t), EB * Math.sin(q.t)];
    return [q.br * HA * Math.cosh(q.t), HB * Math.sinh(q.t)];
  };
  const setFrom = (q, x, y) => {
    if (cur === "par") q.t = y;
    else if (cur === "ell") q.t = Math.atan2(y / EB, x / EA);
    else { q.br = x >= 0 ? 1 : -1; q.t = Math.asinh(y / HB); }
  };
  const P = K.plane($("canvas"), { cx: 0, cy: 0, span: 14 }, () => draw());
  const X = "<i>x</i>", Y = "<i>y</i>";
  /* 접선 ax + by + c = 0 */
  function tan([x1, y1]) {
    if (cur === "par") return [-2 * p, y1, -2 * p * x1];
    if (cur === "ell") return [x1 / (EA * EA), y1 / (EB * EB), -1];
    return [x1 / (HA * HA), -y1 / (HB * HB), -1];
  }
  const slope = ([a, b]) => (Math.abs(b) < 1e-12 ? Infinity : -a / b);
  const fmtS = (s) => (isFinite(s) ? K.n(s) : "없음 (세로)");

  function draw() {
    if (!P.size.w) return;
    P.grid();
    const pts = cur === "par" ? [Q.parab("x", 0, 0, p)] : cur === "ell" ? [Q.ellipse(0, 0, EA, EB)] : Q.hyper("x", 0, 0, HA, HB);
    pts.forEach((q) => P.path(q, C.forest, 2.5));
    const [A, B] = S[cur], a = pos(A), b = pos(B), [l1, l2, l3] = tan(a);
    if (Math.hypot(a[0] - b[0], a[1] - b[1]) > 1e-6) {
      const dx = b[0] - a[0], dy = b[1] - a[1];
      P.line(dy, -dx, dx * a[1] - dy * a[0], C.ink2, 1.6, [6, 4]);
    }
    P.line(l1, l2, l3, C.amber, 2.4);
    P.knob(b, C.ink2); P.text("Q", b, C.ink2, 12, -10, "left");
    P.knob(a, C.warn); P.text(`P(${K.n(a[0])}, ${K.n(a[1])})`, a, C.warn, 12, 12, "left");
  }

  function update() {
    const [A, B] = S[cur], a = pos(A), b = pos(B), [x1, y1] = a;
    let rule, num;
    if (cur === "par") { rule = `${Y}<sup>2</sup> = 8${X} → <i>y</i><sub>1</sub>${Y} = 4(${X} + <i>x</i><sub>1</sub>)`; num = `${K.pn(y1)}${Y} = 4(${X} + ${K.pn(x1)})`; }
    else if (cur === "ell") { rule = `${X}<sup>2</sup>/9 + ${Y}<sup>2</sup>/4 = 1 → <i>x</i><sub>1</sub>${X}/9 + <i>y</i><sub>1</sub>${Y}/4 = 1`; num = `${K.pn(x1)}${X}/9 + ${K.pn(y1)}${Y}/4 = 1`; }
    else { rule = `${X}<sup>2</sup>/4 − ${Y}<sup>2</sup> = 1 → <i>x</i><sub>1</sub>${X}/4 − <i>y</i><sub>1</sub>${Y} = 1`; num = `${K.pn(x1)}${X}/4 − ${K.pn(y1)}${Y} = 1`; }
    const L = tan(a), m = slope(L);
    const yi = isFinite(m) ? `, 곧 ${Y} = ${K.lin([[m, X], [-L[2] / L[1], ""]])}` : `, 곧 ${X} = ${K.n(-L[2] / L[0])}`;
    $(".eq").innerHTML = `${rule}<br>P에서: ${num}${yi}`;
    $(".n-t").textContent = fmtS(m);
    const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    $(".n-q").textContent = d < 1e-6 ? "P와 같은 점" : fmtS(Math.abs(b[0] - a[0]) < 1e-12 ? Infinity : (b[1] - a[1]) / (b[0] - a[0]));
    $(".n-d").textContent = K.n(d, 3);
    draw();
  }
  $$(".c-cur").forEach((btn) => btn.addEventListener("click", () => {
    cur = btn.dataset.c; $$(".c-cur").forEach((x) => x.setAttribute("aria-pressed", String(x === btn))); update();
  }));
  $(".go-near").addEventListener("click", () => {
    const [A, B] = S[cur];
    if (cur === "ell") { let d = A.t - B.t; d -= 2 * Math.PI * Math.round(d / (2 * Math.PI)); B.t += d / 2; }
    else { if (cur === "hyp") B.br = A.br; B.t = (A.t + B.t) / 2; }
    update();
  });
  P.drag([
    { get: () => pos(S[cur][0]), set: (x, y) => setFrom(S[cur][0], x, y) },
    { get: () => pos(S[cur][1]), set: (x, y) => setFrom(S[cur][1], x, y) },
  ], update);
  update();
})();
