/* 카드: 그래프만 보고 이차방정식의 실근이 몇 개인지 알 수 있을까? — 꼭짓점 (p, q)를 끌어 x축과의 교점과 D = −4aq 비교 */
(() => {
  const root = document.getElementById("card-cm1-parabola-xaxis");
  if (!root) return;
  const { C, fit } = NM;
  const E = NMEqPlot, P = NMPoly;
  const $ = (s) => root.querySelector(s);
  const sa = $(".a"), cv = $("canvas");
  let p = 1, q = -4, lastA = 1, fr = null;
  const { ctx, size } = fit(cv, () => draw());
  const I = "<i>i</i>";
  const ex = (v) => (Math.abs(v - E.r3(v)) < 1e-9 ? "" : "≈ ") + E.n(v);
  const coef = () => { const a = +sa.value; return [a * p * p + q, -2 * a * p, a]; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = +sa.value, [c, b] = coef(), r = E.roots(a, b, c);
    fr = E.frame(ctx, { x: 30, y: 8, w: w - 40, h: h - 30 }, { X0: -6, X1: 6, Y0: -10, Y1: 10 }, { xs: 1, ys: 5, xname: "x", yname: "y" });
    const { X, Y } = fr;
    ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(X(p), fr.box.y); ctx.lineTo(X(p), fr.box.y + fr.box.h); ctx.stroke(); ctx.restore();
    E.curve(ctx, fr, (x) => a * (x - p) ** 2 + q, C.forest, 2.5);
    if (r.kind >= 0) r.xs.forEach((x) => E.dot(ctx, X(x), Y(0), r.kind ? C.forest : C.amber, r.kind ? 6 : 7.5));
    E.dot(ctx, X(p), Y(q), C.ink, 6.5);
    E.tag(ctx, `꼭짓점 (${E.n(p)}, ${E.n(q)})`, X(p) + 10, Y(q) + (a > 0 ? 14 : -14), C.ink, "left", fr.box);
    const txt = r.kind === 2 ? "두 점에서 만남: D > 0" : r.kind === 0 ? "한 점에서 접함: D = 0" : "만나지 않음: D < 0";
    E.tag(ctx, txt, fr.box.x + 6, fr.box.y + 12, r.kind < 0 ? C.warn : C.forest, "left", fr.box);
  }

  function update() {
    const a = +sa.value, [c, b] = coef(), r = E.roots(a, b, c), D = b * b - 4 * a * c;
    $(".a-out").textContent = E.n(a);
    $(".eq").innerHTML = `<i>y</i> = ${E.n(a) === "1" ? "" : E.n(a) === "−1" ? "−" : E.n(a)}(<i>x</i> ${p < 0 ? "+" : "−"} ${E.n(Math.abs(p))})<sup>2</sup> ${q < 0 ? "−" : "+"} ${E.n(Math.abs(q))} = ${P.fmt([c, b, a], true)}<br>D = −4<i>aq</i> = −4 × ${E.n(a)} × ${q < 0 ? "(" + E.n(q) + ")" : E.n(q)} = ${E.n(D)}`;
    const nd = $(".n-d"); nd.textContent = E.n(D); nd.className = `n-d ${D < 0 ? "bad" : "good"}`;
    const nk = $(".n-k"); nk.textContent = r.kind === 2 ? "2개" : r.kind === 0 ? "1개 (접함)" : "0개"; nk.className = `n-k ${r.kind < 0 ? "bad" : "good"}`;
    $(".n-r").innerHTML = r.kind === 2 ? `${ex(r.xs[0])}, ${ex(r.xs[1])}` : r.kind === 0 ? `${ex(r.xs[0])} (중근)` : `허근 ${E.n(r.p) === "0" ? "" : E.n(r.p) + " "}± ${ex(r.q)}${I}`;
    draw();
  }

  E.drag(cv, (px, py) => (fr && Math.hypot(px - fr.X(p), py - fr.Y(q)) < 18 ? "v" : null), (_, px, py) => {
    const [x, y] = fr.inv(px, py);
    p = Math.max(-5, Math.min(5, Math.round(x * 2) / 2)); q = Math.max(-9, Math.min(9, Math.round(y * 2) / 2));
    update();
  });
  sa.addEventListener("input", () => { if (+sa.value === 0) sa.value = lastA > 0 ? -0.5 : 0.5; lastA = +sa.value; update(); });
  update();
})();
