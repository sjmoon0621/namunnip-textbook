/* 카드: x² − 4x + 1 = k의 실근은 k에 따라 몇 개일까? — y = f(x)와 수평선 y = k의 교점 수와 판별식 비교 */
(() => {
  const root = document.getElementById("card-cm1-level-line");
  if (!root) return;
  const { C, fit } = NM;
  const E = NMEqPlot, P = NMPoly;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".ex .chip")];
  const sk = $(".k");
  let f = [1, -4, 1];
  const { ctx, size } = fit($("canvas"), () => draw());
  const ex = (v) => (Math.abs(v - E.r3(v)) < 1e-9 ? "" : "≈ ") + E.n(v);
  const at = (x) => f[0] * x * x + f[1] * x + f[2];

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = +sk.value, [a, b, c] = f, r = E.roots(a, b, c - k), vx = -b / (2 * a), vy = at(vx);
    const fr = E.frame(ctx, { x: 30, y: 8, w: w - 40, h: h - 30 }, { X0: -5, X1: 7, Y0: -7, Y1: 9 }, { xs: 1, ys: 2, xname: "x", yname: "y" });
    const { X, Y } = fr;
    E.curve(ctx, fr, at, C.forest, 2.5);
    ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(fr.box.x, Y(vy)); ctx.lineTo(fr.box.x + fr.box.w, Y(vy)); ctx.stroke(); ctx.restore();
    E.tag(ctx, `꼭짓점의 높이 ${ex(vy)}`, fr.box.x + fr.box.w - 4, Y(vy) + (a > 0 ? 11 : -11), C.ink2, "right", fr.box);
    const col = r.kind === 2 ? C.forest : r.kind === 0 ? C.amber : C.warn;
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fr.box.x, Y(k)); ctx.lineTo(fr.box.x + fr.box.w, Y(k)); ctx.stroke();
    E.tag(ctx, `y = ${E.n(k)}`, fr.box.x + 4, Y(k) - 11, col, "left", fr.box);
    if (r.kind >= 0) r.xs.forEach((x) => {
      ctx.save(); ctx.setLineDash([2, 3]); ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(x), Y(k)); ctx.lineTo(X(x), Y(Math.min(0, 9))); ctx.stroke(); ctx.restore();
      E.dot(ctx, X(x), Y(k), col, 6);
    });
  }

  function update() {
    const k = +sk.value, [a, b, c] = f, r = E.roots(a, b, c - k), D = b * b - 4 * a * (c - k);
    $(".k-out").textContent = E.n(k);
    $(".eq").innerHTML = `${P.fmt([c, b, a], true)} = ${E.n(k)}<br>⇔ ${P.fmt([c - k, b, a], true)} = 0`;
    const nd = $(".n-d"); nd.textContent = E.n(D); nd.className = `n-d ${D < 0 ? "bad" : "good"}`;
    const nk = $(".n-k"); nk.textContent = r.kind === 2 ? "2개" : r.kind === 0 ? "1개 (중근)" : "0개"; nk.className = `n-k ${r.kind < 0 ? "bad" : "good"}`;
    $(".n-r").textContent = r.kind === 2 ? `${ex(r.xs[0])}, ${ex(r.xs[1])}` : r.kind === 0 ? ex(r.xs[0]) : "없음 (허근)";
    draw();
  }
  chips.forEach((bt) => bt.addEventListener("click", () => {
    f = bt.dataset.p.split(",").map(Number);
    chips.forEach((x) => x.setAttribute("aria-pressed", String(x === bt))); update();
  }));
  sk.addEventListener("input", update);
  update();
})();
