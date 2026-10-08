/* 카드: y = √(a(x − p)) + q의 그래프는 어디서 시작해 어디로 뻗을까? — a의 부호, 근호 앞 부호, 시작점 (p, q)를 바꾼다 */
(() => {
  const root = document.getElementById("card-cm2-sqrt-shift");
  if (!root) return;
  const { C } = NM, K = NMCoord;
  const $ = (s) => root.querySelector(s);
  const sa = $(".a"), sg = [...root.querySelectorAll(".p-sg .chip")];
  let s = 1, p = -2, q = 1;
  const P = K.plane($("canvas"), { cx: 0, cy: 0, span: 13 }, () => draw());
  const X = "<i>x</i>", Y = "<i>y</i>";
  const av = () => (+sa.value === 0 ? 1 : +sa.value);

  function branch(a, sign, px, py, color, wd, dash) {
    const b = P.box(), W = Math.sqrt(Math.abs(a) * (b.x1 - b.x0 + 2) + 1), pts = [];
    for (let i = 0; i <= 200; i++) { const w = W * i / 200; pts.push([px + w * w / a, sign * w + py]); }
    P.path(pts, color, wd, dash);
  }

  function draw() {
    if (!P.size.w) return;
    const a = av();
    P.grid();
    branch(a, s, 0, 0, C.ink3, 1.4, [3, 4]);
    branch(a, s, p, q, C.forest, 2.8);
    P.knob([p, q], C.warn);
    P.text(`(${K.n(p)}, ${K.n(q)})`, [p, q], C.warn, a > 0 ? -10 : 10, s > 0 ? 14 : -14, a > 0 ? "right" : "left");
  }

  function update() {
    const a = av();
    $(".a-out").textContent = K.n(a);
    const inner = a === 1 ? K.paren(X, p).replace(/^\(|\)$/g, "") : `${a === -1 ? "−" : K.n(a)}${K.paren(X, p)}`;
    const tail = q === 0 ? "" : q > 0 ? ` + ${K.n(q)}` : ` − ${K.n(-q)}`;
    $(".eq").innerHTML = `${Y} = ${s < 0 ? "−" : ""}√(${inner})${tail}<br>근호 안이 0 이상: ${a > 0 ? `${X} ≥ ${K.n(p)}` : `${X} ≤ ${K.n(p)}`}`;
    $(".n-d").textContent = a > 0 ? `x ≥ ${K.n(p)}` : `x ≤ ${K.n(p)}`;
    $(".n-r").textContent = s > 0 ? `y ≥ ${K.n(q)}` : `y ≤ ${K.n(q)}`;
    $(".n-w").textContent = `${a > 0 ? "오른쪽" : "왼쪽"} ${s > 0 ? "위" : "아래"}`;
    draw();
  }
  sa.addEventListener("input", () => { if (+sa.value === 0) sa.value = "1"; update(); });
  sg.forEach((b) => b.addEventListener("click", () => { s = +b.dataset.s; sg.forEach((o) => o.setAttribute("aria-pressed", String(o === b))); update(); }));
  P.drag([{ get: () => [p, q], set: (x, y) => { p = Math.round(x); q = Math.round(y); } }], update);
  update();
})();
