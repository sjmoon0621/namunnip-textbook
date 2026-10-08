/* 카드: 밑이 바뀌면 지수함수의 그래프는 어떻게 달라질까? — y = a^(x−p) + q, 점근선, y축 대칭 */
(() => {
  const root = document.getElementById("card-alg-exp-graph");
  if (!root) return;
  const { C, fit } = NM, E = NMExp;
  const $ = (s) => root.querySelector(s);
  const sa = $(".a"), sp = $(".p"), sq = $(".q"), mir = $(".mirror");
  const O = { X0: -5, X1: 5, Y0: -4, Y1: 8, xt: [-4, -2, 0, 2, 4], yt: [-4, -2, 0, 2, 4, 6, 8] };
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = +sa.value, p = +sp.value, q = +sq.value, f = (x) => a ** (x - p) + q;
    const g = E.frame(ctx, w, h, O);
    E.hline(ctx, g, q, C.warn, [5, 4], 1.4);
    E.tag(ctx, g, `점근선 y = ${E.n(q)}`, g.x0 + g.gw - 4, g.Y(q) + 12, C.warn, "right", 11);
    if (mir.getAttribute("aria-pressed") === "true") {
      E.curve(ctx, g, (x) => f(-x), E.BLUE, { lw: 2, dash: [6, 4] });
      E.tag(ctx, g, "y축 대칭", g.X(-4.2), g.Y(Math.min(7.5, f(4.2))) + 12, E.BLUE, "left", 11);
    }
    E.curve(ctx, g, f, C.forest, { lw: 2.6 });
    E.dot(ctx, g, p, 1 + q, C.ink, 5); E.dot(ctx, g, p + 1, a + q, C.ink, 5);
    E.tag(ctx, g, `(${E.n(p)}, ${E.n(1 + q)})`, g.X(p) + 8, g.Y(1 + q) + 13, C.ink, "left", 11);
    E.tag(ctx, g, `(${E.n(p + 1)}, ${E.n(a + q)})`, g.X(p + 1) + 8, g.Y(a + q) - 12, C.ink, "left", 11);
  }

  function update() {
    const a = +sa.value, p = +sp.value, q = +sq.value;
    $(".a-out").textContent = E.n(a); $(".p-out").textContent = E.n(p); $(".q-out").textContent = E.n(q);
    const ex = p === 0 ? "<i>x</i>" : `<i>x</i> ${p > 0 ? "−" : "+"} ${E.n(Math.abs(p))}`;
    $(".eq").innerHTML = `<i>y</i> = ${E.n(a)}<sup>${ex}</sup>${q === 0 ? "" : ` ${q > 0 ? "+" : "−"} ${E.n(Math.abs(q))}`}`;
    const m = $(".n-m");
    m.textContent = a > 1 ? "증가" : a < 1 ? "감소" : "상수 (지수함수 아님)"; m.className = `n-m ${a === 1 ? "bad" : ""}`;
    $(".n-as").textContent = `y = ${E.n(q)}`;
    $(".n-r").textContent = a === 1 ? `y = ${E.n(1 + q)}` : `y > ${E.n(q)}`;
    $(".n-y").textContent = E.n(a ** -p + q, 3);
    draw();
  }
  mir.addEventListener("click", () => { mir.setAttribute("aria-pressed", String(mir.getAttribute("aria-pressed") !== "true")); draw(); });
  $(".go-reset").addEventListener("click", () => { sp.value = 0; sq.value = 0; update(); });
  [sa, sp, sq].forEach((s) => s.addEventListener("input", update));
  update();
})();
