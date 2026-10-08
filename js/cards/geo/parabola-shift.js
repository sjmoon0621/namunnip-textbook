/* 카드: 꼭짓점을 옮기면 초점과 준선은 어디로 갈까? — 꼭짓점을 끌어 평행이동한 포물선의 표준형·일반형과 초점·준선·축 비교 */
(() => {
  const root = document.getElementById("card-geo-parabola-shift");
  if (!root) return;
  const { C } = NM, K = NMCoord, Q = NMConic;
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
  const sp = $(".s-p");
  let ax = "x", p = 1, prevP = 1;
  const V = [2, 1];
  const P = K.plane($("canvas"), { cx: 0, cy: 0, span: 16 }, () => draw());
  const X = "<i>x</i>", Y = "<i>y</i>";
  const pt = (q) => `(${K.n(q[0])}, ${K.n(q[1])})`;
  const F = () => (ax === "x" ? [V[0] + p, V[1]] : [V[0], V[1] + p]);

  function draw() {
    if (!P.size.w) return;
    P.grid();
    const [m, n] = V, f = F();
    P.path(Q.parab(ax, 0, 0, p), C.ink3, 1.5, [4, 4]);
    if (ax === "x") { P.line(0, 1, -n, C.sprout, 1.5, [2, 4]); P.line(1, 0, -(m - p), C.ink2, 2, [6, 4]); }
    else { P.line(1, 0, -m, C.sprout, 1.5, [2, 4]); P.line(0, 1, -(n - p), C.ink2, 2, [6, 4]); }
    P.path(Q.parab(ax, m, n, p), C.forest, 2.5);
    if (m || n) P.arrow([0, 0], V, C.ink3, 1.3, [3, 3]);
    P.dot(f, C.amber, 6);
    P.text(`F${pt(f)}`, f, C.ink, 8, 13, "left");
    P.knob(V, C.forest);
    P.text(`꼭짓점${pt(V)}`, V, C.forest, -10, -13, "right");
  }

  function update() {
    const [m, n] = V, f = F();
    $(".p-out").textContent = K.n(p);
    $(".n-v").textContent = pt(V);
    $(".n-f").textContent = pt(f);
    $(".n-d").textContent = ax === "x" ? `x = ${K.n(m - p)}` : `y = ${K.n(n - p)}`;
    $(".n-a").textContent = ax === "x" ? `y = ${K.n(n)}` : `x = ${K.n(m)}`;
    const std = ax === "x" ? `${Q.sq(Y, n)} = ${K.n(4 * p)}${K.paren(X, m)}` : `${Q.sq(X, m)} = ${K.n(4 * p)}${K.paren(Y, n)}`;
    const gen = ax === "x"
      ? K.lin([[1, `${Y}<sup>2</sup>`], [-2 * n, Y], [-4 * p, X], [n * n + 4 * p * m, ""]])
      : K.lin([[1, `${X}<sup>2</sup>`], [-2 * m, X], [-4 * p, Y], [m * m + 4 * p * n, ""]]);
    $(".eq").innerHTML = `표준형: ${std}<br>전개하면: ${gen} = 0`;
    draw();
  }

  $$(".c-ax").forEach((b) => b.addEventListener("click", () => {
    ax = b.dataset.ax; $$(".c-ax").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update();
  }));
  sp.addEventListener("input", () => {
    let v = +sp.value;
    if (v === 0) { v = prevP > 0 ? -0.5 : 0.5; sp.value = v; }
    p = prevP = v; update();
  });
  P.drag([{ get: () => V, set: (x, y) => { V[0] = Math.round(x); V[1] = Math.round(y); } }], update);
  update();
})();
