/* 카드: 도형을 옮기면 방정식의 부호는 왜 반대로 바뀔까? — 원·포물선·직선을 a, b만큼 옮기고 f(x − a, y − b) = 0 확인 */
(() => {
  const root = document.getElementById("card-cm2-translate-graph");
  if (!root) return;
  const { C, clamp } = NM, K = NMCoord;
  const $ = (s) => root.querySelector(s), shapes = [...root.querySelectorAll(".shape .chip")];
  let kind = "c", t = 0.6;
  const P = K.plane($("canvas"), { cx: 0, cy: 0, span: 18 }, () => draw());
  const X = "<i>x</i>", Y = "<i>y</i>";
  const ab = () => [+$(".a").value, +$(".b").value];
  /* 원래 도형 위의 매개변수 t인 점 */
  const at = (u) => (kind === "c" ? [2 * Math.cos(u), 2 * Math.sin(u)] : kind === "p" ? [u, u * u] : [u, u / 2]);
  const sub = (v, a) => (Math.abs(a) < 1e-9 ? v : `${v} ${a > 0 ? "−" : "+"} ${Math.abs(a)}`);

  function draw() {
    if (!P.size.w) return;
    P.grid();
    const [a, b] = ab(), q = at(t), q2 = [q[0] + a, q[1] + b];
    if (kind === "c") { P.circle(0, 0, 2, C.ink3, 2, [6, 4]); P.circle(a, b, 2, C.forest, 3); P.dot([a, b], C.forest, 3.5); }
    else if (kind === "p") { P.curve((x) => x * x, C.ink3, 2, [6, 4]); P.curve((x) => (x - a) ** 2 + b, C.forest, 3); }
    else { P.line(1, -2, 0, C.ink3, 2, [6, 4]); P.line(1, -2, 2 * b - a, C.forest, 3); }
    P.arrow(q, q2, C.warn, 1.8);
    P.knob(q, C.ink2); P.dot(q2, C.warn, 5);
    P.text("Q", q, C.ink2, -10, -12, "right"); P.text("Q′", q2, C.warn, 10, -12, "left");
  }

  function update() {
    const [a, b] = ab(), q = at(t), q2 = [q[0] + a, q[1] + b];
    $(".o-a").textContent = K.n(a); $(".o-b").textContent = K.n(b);
    $(".n-q").textContent = `(${K.n(q[0])}, ${K.n(q[1])})`; $(".n-q2").textContent = `(${K.n(q2[0])}, ${K.n(q2[1])})`;
    let eq, chk;
    if (kind === "c") {
      eq = `${K.paren(X, a)}<sup>2</sup> + ${K.paren(Y, b)}<sup>2</sup> = 4`;
      chk = `${K.n((q2[0] - a) ** 2 + (q2[1] - b) ** 2)} = 4`;
    } else if (kind === "p") {
      eq = `${sub(Y, b)} = ${K.paren(X, a)}<sup>2</sup>${b ? `, 곧 <i>y</i> = ${K.paren(X, a)}<sup>2</sup> ${b < 0 ? "−" : "+"} ${Math.abs(b)}` : ""}`;
      chk = `${K.n(q2[1] - b)} = ${K.n((q2[0] - a) ** 2)}`;
    } else {
      eq = `${sub(Y, b)} = ${K.paren(X, a)}/2, 곧 <i>y</i> = ${K.lin([[0.5, X], [b - a / 2, ""]])}`;
      chk = `${K.n(q2[1] - b)} = ${K.n((q2[0] - a) / 2)}`;
    }
    $(".eq").innerHTML = `<i>x</i> 대신 ${K.paren(X, a)}, <i>y</i> 대신 ${K.paren(Y, b)}<br>→ ${eq}`;
    $(".n-c").textContent = `${chk} 성립`;
    draw();
  }
  shapes.forEach((s) => s.addEventListener("click", () => {
    kind = s.dataset.s; t = kind === "c" ? 0.6 : 1; shapes.forEach((x) => x.setAttribute("aria-pressed", String(x === s))); update();
  }));
  root.querySelectorAll("input").forEach((i) => i.addEventListener("input", update));
  P.drag([{ get: () => at(t), set: (x, y) => { t = kind === "c" ? Math.atan2(y, x) : clamp(Math.round(x * 2) / 2, kind === "p" ? -2.5 : -6, kind === "p" ? 2.5 : 6); } }], update);
  update();
})();
