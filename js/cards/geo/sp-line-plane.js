/* 카드: 평면 위의 직선 몇 개에 수직이면 평면에 수직일까? — 기울인 직선 l과 평면 위 직선 m, n, k가 이루는 각 */
(() => {
  const root = document.getElementById("card-geo-line-plane");
  if (!root) return;
  const { C } = NM;
  const S = NMSpace3, { mul, unit, rad } = S;
  const $ = (s) => root.querySelector(s);
  const sa = $(".a"), sb = $(".b"), sk = $(".k");
  const vw = S.view($("canvas"), () => draw(), { center: [0, 0, 0.75], span: 5.4, yaw: -0.5, pitch: 0.45 });
  const M = [1, 0, 0], N = [Math.cos(rad(60)), Math.sin(rad(60)), 0];
  const kdir = () => [Math.cos(rad(+sk.value)), Math.sin(rad(+sk.value)), 0];
  const ldir = () => unit([Math.tan(rad(+sa.value)), Math.tan(rad(+sb.value)), 1]);
  const ang = (u) => S.lineAngle(ldir(), u);
  const is90 = (x) => Math.abs(x - 90) < 1e-6;

  function draw() {
    const { ctx, size } = vw; if (!size.w) return;
    ctx.clearRect(0, 0, size.w, size.h);
    const O = [0, 0, 0], d = ldir();
    vw.poly(vw.quad(O, [1, 0, 0], [0, 1, 0], 2.6, 2.2), C.leaf, C.ink3, 0.16);
    vw.label([2.6, 2.2, 0], "α", C.ink2, -10, 10, "right", `italic 600 14px ${NM.F.serif}`);
    vw.line(mul(d, -1.1), O, C.forest, 2, [5, 4]);
    const lines = [[M, "m", C.ink, ang(M)], [N, "n", C.ink, ang(N)], [kdir(), "k", C.warn, ang(kdir())]];
    lines.forEach(([u, nm, col]) => { vw.line(mul(u, -2.3), mul(u, 2.3), col, nm === "k" ? 2.2 : 1.6); vw.label(mul(u, 2.3), nm, col, 8, 0, "left", `italic 600 13px ${NM.F.serif}`); });
    lines.forEach(([u, , col, a]) => { if (is90(a)) vw.right(O, u, d, 0.32, col); });
    vw.line(O, mul(d, 3), C.forest, 3);
    vw.label(mul(d, 3), "l", C.forest, 8, 0, "left", `italic 600 14px ${NM.F.serif}`);
    vw.dot(O, C.ink, 4.5); vw.label(O, "O", C.ink2, -8, 12, "right");
  }

  function update() {
    $(".a-out").textContent = `${S.n(+sa.value)}°`; $(".b-out").textContent = `${S.n(+sb.value)}°`; $(".k-out").textContent = `${sk.value}°`;
    [["n-m", M], ["n-n", N], ["n-k", kdir()]].forEach(([c, u]) => {
      const a = ang(u), el = $("." + c);
      el.textContent = `${S.n(a, 1)}°`; el.className = `${c} ${is90(a) ? "good" : ""}`;
    });
    draw();
  }
  [sa, sb, sk].forEach((s) => s.addEventListener("input", update));
  update();
})();
