/* 카드: 두 초점까지 거리의 차가 일정한 점은 어떤 곡선을 이룰까? — 점 P를 쌍곡선의 두 가지를 따라 끌어 |PF − PF'| = 2a와 x²/a² − y²/b² = 1 확인 */
(() => {
  const root = document.getElementById("card-geo-hyperbola-def");
  if (!root) return;
  const { C } = NM, K = NMCoord, Q = NMConic;
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
  const sa = $(".s-a"), sc = $(".s-c");
  let ax = "x", a = 2, c = 3, br = 1, u = 0.6, show = false;
  const trail = [];
  const P = K.plane($("canvas"), { cx: 0, cy: 0, span: 14 }, () => draw());
  const X = "<i>x</i>", Y = "<i>y</i>";

  const b = () => Math.sqrt(c * c - a * a);
  const atU = (v) => (ax === "x" ? [br * a * Math.cosh(v), b() * Math.sinh(v)] : [b() * Math.sinh(v), br * a * Math.cosh(v)]);
  const at = () => atU(u);
  const foci = () => (ax === "x" ? [[c, 0], [-c, 0]] : [[0, c], [0, -c]]);

  function draw() {
    if (!P.size.w) return;
    P.grid();
    const [F1, F2] = foci(), T = at();
    if (show) Q.hyper(ax, 0, 0, a, b()).forEach((pts) => P.path(pts, C.forest, 2.5));
    for (let i = 1; i < trail.length; i++) {
      const p = trail[i - 1], q = trail[i];
      if (p[2] === q[2] && Math.abs(p[3] - q[3]) < 0.05) P.seg(p, q, C.forest, 3.5);
    }
    const V = ax === "x" ? [[a, 0], [-a, 0]] : [[0, a], [0, -a]];
    P.seg(V[0], V[1], C.ink3, 1.2, [3, 3]);
    P.text("2a", [0, 0], C.ink3, ax === "x" ? 0 : 6, ax === "x" ? -10 : 0, ax === "x" ? "center" : "left", `italic 13px ${NM.F.serif}`);
    P.seg(F1, T, C.amber, 2.2); P.seg(F2, T, C.warn, 2.2, [6, 3]);
    P.dot(F1, C.ink, 5); P.dot(F2, C.ink, 5);
    V.forEach((q) => P.dot(q, C.ink2, 3.5));
    P.text("F", F1, C.ink, ax === "x" ? 4 : 8, ax === "x" ? 14 : 0, "left");
    P.text("F'", F2, C.ink, ax === "x" ? -4 : 8, ax === "x" ? 14 : 0, ax === "x" ? "right" : "left");
    P.knob(T, C.warn);
    P.text("P", T, C.warn, T[0] >= 0 ? 12 : -12, T[1] >= 0 ? -10 : 10, T[0] >= 0 ? "left" : "right");
  }

  function update() {
    const [F1, F2] = foci(), T = at(), d1 = Math.hypot(T[0] - F1[0], T[1] - F1[1]), d2 = Math.hypot(T[0] - F2[0], T[1] - F2[1]);
    const last = trail[trail.length - 1];
    const push = (v) => trail.push([...atU(v), br, v]);
    if (last && last[2] === br) { const n = Math.ceil(Math.abs(u - last[3]) / 0.04); for (let i = 1; i <= n; i++) push(last[3] + (u - last[3]) * i / n); }
    else push(u);
    while (trail.length > 3000) trail.shift();
    $(".a-out").textContent = K.n(2 * a); $(".c-out").textContent = K.n(c);
    $(".n-1").textContent = K.n(d1); $(".n-2").textContent = K.n(d2); $(".n-d").textContent = K.n(Math.abs(d1 - d2)); $(".n-b").textContent = K.n(b());
    const bb = c * c - a * a;
    $(".eq").innerHTML = `F(${ax === "x" ? `${K.n(c)}, 0` : `0, ${K.n(c)}`}), F'(${ax === "x" ? `${K.n(-c)}, 0` : `0, ${K.n(-c)}`}), <i>b</i><sup>2</sup> = <i>c</i><sup>2</sup> − <i>a</i><sup>2</sup> = ${K.n(c * c)} − ${K.n(a * a)} = ${K.n(bb)}<br>` +
      (show ? `자취: ${ax === "x" ? `${X}<sup>2</sup>/${K.n(a * a)} − ${Y}<sup>2</sup>/${K.n(bb)} = 1` : `${X}<sup>2</sup>/${K.n(bb)} − ${Y}<sup>2</sup>/${K.n(a * a)} = −1`}` : "두 가지를 모두 따라 그린 뒤 '곡선 보기'를 누르세요.");
    draw();
  }
  const clear = () => { trail.length = 0; };
  const fix = () => { if (c <= a) { c = a + 0.5; sc.value = c; } };
  sa.addEventListener("input", () => { a = +sa.value; fix(); clear(); update(); });
  sc.addEventListener("input", () => { c = +sc.value; if (c <= a) { a = c - 0.5; sa.value = a; } clear(); update(); });
  $$(".c-ax").forEach((btn) => btn.addEventListener("click", () => {
    ax = btn.dataset.ax; $$(".c-ax").forEach((x) => x.setAttribute("aria-pressed", String(x === btn))); clear(); update();
  }));
  $(".go-show").addEventListener("click", (e) => { show = !show; e.currentTarget.setAttribute("aria-pressed", String(show)); update(); });
  $(".go-clear").addEventListener("click", () => { clear(); update(); });
  P.drag([{ get: () => at(), set: (x, y) => {
    if (ax === "x") { br = x >= 0 ? 1 : -1; u = Math.asinh(y / b()); }
    else { br = y >= 0 ? 1 : -1; u = Math.asinh(x / b()); }
  } }], update);
  update();
})();
