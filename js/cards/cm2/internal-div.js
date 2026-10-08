/* 카드: 선분을 m : n으로 나누는 점은 어디에 있을까? — 수직선과 좌표평면에서 내분점, 축 위의 발도 같은 비로 나뉨 */
(() => {
  const root = document.getElementById("card-cm2-internal-div");
  if (!root) return;
  const { C } = NM, K = NMCoord;
  const $ = (s) => root.querySelector(s), modes = [...root.querySelectorAll(".mode .chip")];
  const A = [-4, -2], B = [5, 4];
  let mode = 2;
  const P = K.plane($("canvas"), { cx: 0, cy: 1, span: 12 }, () => draw());
  const mm = () => +$(".m").value, nn = () => +$(".n").value;
  const div = () => { const m = mm(), n = nn(); return [(m * B[0] + n * A[0]) / (m + n), (m * B[1] + n * A[1]) / (m + n)]; };
  const fx = (i) => K.frac(mm() * B[i] + nn() * A[i], mm() + nn());

  function draw() {
    if (!P.size.w) return;
    const one = mode === 1;
    P.grid(one ? { noGrid: true, noY: true } : {});
    const m = mm(), n = nn(), Q = div();
    if (!one) {
      for (const p of [A, Q, B]) {
        P.seg(p, [p[0], 0], C.ink3, 1, [3, 3]); P.seg(p, [0, p[1]], C.ink3, 1, [3, 3]);
        P.dot([p[0], 0], C.ink2, 3); P.dot([0, p[1]], C.ink2, 3);
      }
    }
    P.seg(A, Q, C.forest, 5); P.seg(Q, B, C.amber, 5);
    for (let i = 1; i < m + n; i++) P.dot([A[0] + (B[0] - A[0]) * i / (m + n), A[1] + (B[1] - A[1]) * i / (m + n)], C.card, 2.2);
    P.knob(A, C.warn); P.knob(B, C.warn);
    P.dot(Q, C.ink, 5.5);
    const lab = (name, p) => (one ? `${name}(${K.n(p[0])})` : `${name}(${K.n(p[0])}, ${K.n(p[1])})`);
    const off = one ? -20 : 0;
    P.text(lab("A", A), A, C.warn, -10, one ? off : -14, "right");
    P.text(lab("B", B), B, C.warn, 10, one ? off : -14, "left");
    P.text(one ? `P(${fx(0)})` : `P(${fx(0)}, ${fx(1)})`, Q, C.ink, 0, one ? 22 : 18, "center");
  }

  function update() {
    const m = mm(), n = nn(), Q = div();
    $(".m-out").textContent = m; $(".n-out").textContent = n;
    if (mode === 1) { A[1] = 0; B[1] = 0; }
    const ap = Math.hypot(Q[0] - A[0], Q[1] - A[1]), pb = Math.hypot(B[0] - Q[0], B[1] - Q[1]);
    $(".n-p").textContent = mode === 1 ? fx(0) : `(${fx(0)}, ${fx(1)})`;
    $(".n-ap").textContent = K.n(ap); $(".n-pb").textContent = K.n(pb);
    const row = (i, v) => `${v} = (${m}·${K.pn(B[i])} + ${n}·${K.pn(A[i])}) / (${m} + ${n}) = ${fx(i)}`;
    $(".eq").innerHTML = (mode === 1 ? row(0, "<i>x</i>") : row(0, "<i>x</i>") + "<br>" + row(1, "<i>y</i>")) +
      (pb > 1e-9 ? `<br>AP : PB = ${K.n(ap)} : ${K.n(pb)} = ${K.n(ap / pb * n)} : ${n}` : "");
    draw();
  }
  modes.forEach((b) => b.addEventListener("click", () => {
    mode = +b.dataset.mode; modes.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    if (mode === 2) { A[1] = -2; B[1] = 4; }
    update();
  }));
  root.querySelectorAll("input").forEach((i) => i.addEventListener("input", update));
  const grab = (p) => ({ get: () => p, set: (x, y) => { p[0] = Math.round(x); p[1] = mode === 1 ? 0 : Math.round(y); } });
  P.drag([grab(A), grab(B)], update);
  update();
})();
