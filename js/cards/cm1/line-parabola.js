/* 카드: 포물선과 직선이 만나는지 그림 없이 알 수 있을까? — f(x) = mx + n을 정리한 이차방정식의 판별식과 교점 */
(() => {
  const root = document.getElementById("card-cm1-line-parabola");
  if (!root) return;
  const { C, fit } = NM;
  const E = NMEqPlot, P = NMPoly;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".ex .chip")];
  const sm = $(".m"), sn = $(".n");
  let f = [1, 0, 0];
  const { ctx, size } = fit($("canvas"), () => draw());
  const ex = (v) => (Math.abs(v - E.r3(v)) < 1e-9 ? "" : "≈ ") + E.n(v);
  const at = (x) => f[0] * x * x + f[1] * x + f[2];
  const sys = () => { const m = +sm.value, n = +sn.value; return { m, n, a: f[0], b: f[1] - m, c: f[2] - n }; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = sys(), r = E.roots(s.a, s.b, s.c);
    const fr = E.frame(ctx, { x: 30, y: 8, w: w - 40, h: h - 30 }, { X0: -5, X1: 5, Y0: -4, Y1: 10 }, { xs: 1, ys: 2, xname: "x", yname: "y" });
    const { X, Y } = fr;
    E.curve(ctx, fr, at, C.forest, 2.5);
    const col = r.kind === 2 ? C.forest : r.kind === 0 ? C.amber : C.warn;
    E.curve(ctx, fr, (x) => s.m * x + s.n, C.ink2, 2);
    if (r.kind >= 0) r.xs.forEach((x) => E.dot(ctx, X(x), Y(at(x)), col, r.kind ? 6 : 7.5));
    const txt = r.kind === 2 ? "두 점에서 만남" : r.kind === 0 ? `접함: 접점 (${E.n(r.xs[0])}, ${E.n(at(r.xs[0]))})` : "만나지 않음";
    E.tag(ctx, txt, fr.box.x + 6, fr.box.y + 12, col, "left", fr.box);
  }

  function update() {
    const s = sys(), r = E.roots(s.a, s.b, s.c), D = s.b * s.b - 4 * s.a * s.c;
    $(".m-out").textContent = E.n(s.m); $(".n-out").textContent = E.n(s.n);
    $(".eq").innerHTML = `${P.fmt([f[2], f[1], f[0]], true)} = ${P.fmt([s.n, s.m], true)}<br>⇔ ${P.fmt([s.c, s.b, s.a], true)} = 0`;
    const nd = $(".n-d"); nd.textContent = E.n(D); nd.className = `n-d ${D < 0 ? "bad" : "good"}`;
    const nk = $(".n-k"); nk.textContent = r.kind === 2 ? "두 점에서 만남" : r.kind === 0 ? "접함" : "만나지 않음"; nk.className = `n-k ${r.kind < 0 ? "bad" : "good"}`;
    $(".n-r").textContent = r.kind === 2 ? `${ex(r.xs[0])}, ${ex(r.xs[1])}` : r.kind === 0 ? `${ex(r.xs[0])} (접점)` : "없음";
    draw();
  }
  chips.forEach((bt) => bt.addEventListener("click", () => {
    f = bt.dataset.p.split(",").map(Number);
    chips.forEach((x) => x.setAttribute("aria-pressed", String(x === bt))); update();
  }));
  [sm, sn].forEach((x) => x.addEventListener("input", update));
  update();
})();
