/* 카드: 쌍곡선은 어떤 직선에 한없이 가까워질까? — a, b, 우변 부호, 중심을 바꾸며 점근선·꼭짓점·초점을 읽고, P를 멀리 끌어 점근선까지의 거리가 0에 가까워지는 것을 확인 */
(() => {
  const root = document.getElementById("card-geo-hyperbola-asym");
  if (!root) return;
  const { C } = NM, K = NMCoord, Q = NMConic;
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
  const sa = $(".s-a"), sb = $(".s-b");
  let a = 2, b = 1, s = 1, u = 1.2;
  const O = [0, 0];
  const P = K.plane($("canvas"), { cx: 0, cy: 0, span: 14 }, () => draw());
  const X = "<i>x</i>", Y = "<i>y</i>";
  const ax = () => (s === 1 ? "x" : "y");
  const at = () => (s === 1 ? [O[0] + a * Math.cosh(u), O[1] + b * Math.sinh(u)] : [O[0] + a * Math.sinh(u), O[1] + b * Math.cosh(u)]);
  const dist = () => {
    const [x, y] = at(), r = Math.hypot(a, b), dx = x - O[0], dy = y - O[1];
    return Math.min(Math.abs(b * dx - a * dy), Math.abs(b * dx + a * dy)) / r;
  };
  const pt = (x, y) => `(${x}, ${y})`;

  function draw() {
    if (!P.size.w) return;
    P.grid();
    const [m, n] = O;
    P.path([[m - a, n - b], [m + a, n - b], [m + a, n + b], [m - a, n + b]], C.ink3, 1.2, [3, 3], true);
    P.line(b, -a, -(b * m - a * n), C.ink2, 1.5, [7, 4]);
    P.line(b, a, -(b * m + a * n), C.ink2, 1.5, [7, 4]);
    Q.hyper(ax(), m, n, a, b).forEach((pts) => P.path(pts, C.forest, 2.5));
    const c = Math.hypot(a, b);
    const V = s === 1 ? [[m + a, n], [m - a, n]] : [[m, n + b], [m, n - b]];
    const F = s === 1 ? [[m + c, n], [m - c, n]] : [[m, n + c], [m, n - c]];
    V.forEach((q) => P.dot(q, C.forest, 4));
    F.forEach((q) => P.dot(q, C.ink, 5));
    P.text("F", F[0], C.ink, 6, 12, "left"); P.text("F'", F[1], C.ink, 6, 12, "left");
    const T = at(), [x, y] = T, dx = x - m, dy = y - n;
    const l = Math.abs(b * dx - a * dy) < Math.abs(b * dx + a * dy) ? [b, -a] : [b, a];
    const r2 = l[0] * l[0] + l[1] * l[1], t = (l[0] * dx + l[1] * dy) / r2;
    const H = [x - l[0] * t, y - l[1] * t];
    P.seg(T, H, C.warn, 2);
    P.knob(T, C.warn);
    P.text(`P`, T, C.warn, 12, -10, "left");
    P.knob(O, C.forest);
  }

  function update() {
    const [m, n] = O, A = b * b, B = a * a, c2 = a * a + b * b, sr = K.surd(c2);
    $(".a-out").textContent = String(a); $(".b-out").textContent = String(b);
    const gen = K.lin([[A, `${X}<sup>2</sup>`], [-B, `${Y}<sup>2</sup>`], [-2 * m * A, X], [2 * n * B, Y], [A * m * m - B * n * n - s * A * B, ""]]);
    $(".eq").innerHTML = `${Q.sq(X, m)}/${a * a} − ${Q.sq(Y, n)}/${b * b} = ${s === 1 ? "1" : "−1"}<br>전개하면: ${gen} = 0`;
    const f = K.frac(b, a), k = f === "1" ? "1" : f.includes("/") ? `(${f})` : f;
    $(".n-l").innerHTML = m === 0 && n === 0 ? `y = ±${k === "1" ? "" : k}x` : `${K.paren("y", n)} = ±${k === "1" ? "" : k}${K.paren("x", m)}`;
    const pm = (v, r) => `${v ? K.n(v) + " " : ""}± ${r}`;
    $(".n-v").textContent = s === 1 ? pt(pm(m, a), K.n(n)) : pt(K.n(m), pm(n, b));
    $(".n-f").textContent = s === 1 ? pt(pm(m, sr), K.n(n)) : pt(K.n(m), pm(n, sr));
    $(".n-d").textContent = dist() < 0.005 ? "0.00…" : K.n(dist(), 3);
    draw();
  }
  sa.addEventListener("input", () => { a = +sa.value; update(); });
  sb.addEventListener("input", () => { b = +sb.value; update(); });
  $$(".c-s").forEach((btn) => btn.addEventListener("click", () => {
    s = +btn.dataset.s; $$(".c-s").forEach((x) => x.setAttribute("aria-pressed", String(x === btn))); update();
  }));
  P.drag([
    { get: () => at(), set: (x, y) => { u = s === 1 ? Math.asinh((y - O[1]) / b) : Math.asinh((x - O[0]) / a); } },
    { get: () => O, set: (x, y) => { O[0] = Math.round(x); O[1] = Math.round(y); } },
  ], update);
  update();
})();
