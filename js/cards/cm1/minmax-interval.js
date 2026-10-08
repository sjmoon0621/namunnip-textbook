/* 카드: 범위가 정해지면 최솟값은 언제나 꼭짓점에서 생길까? — α ≤ x ≤ β에서 꼭짓점과 양 끝 값을 비교해 최대·최소 찾기 */
(() => {
  const root = document.getElementById("card-cm1-minmax-interval");
  if (!root) return;
  const { C, fit } = NM;
  const E = NMEqPlot, P = NMPoly;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".ex .chip")];
  const slo = $(".lo"), shi = $(".hi");
  let f = [1, -4, 1];
  const { ctx, size } = fit($("canvas"), () => draw());
  const at = (x) => f[0] * x * x + f[1] * x + f[2];
  const ex = (v) => (Math.abs(v - E.r3(v)) < 1e-9 ? "" : "≈ ") + E.n(v);

  function solve() {
    const lo = Math.min(+slo.value, +shi.value), hi = Math.max(+slo.value, +shi.value), vx = -f[1] / (2 * f[0]);
    const inside = vx >= lo - 1e-9 && vx <= hi + 1e-9;
    const cand = [[lo, at(lo), "왼쪽 끝"], [hi, at(hi), "오른쪽 끝"]];
    if (inside) cand.push([vx, at(vx), "꼭짓점"]);
    const max = cand.reduce((m, c) => (c[1] > m[1] + 1e-9 ? c : m)), min = cand.reduce((m, c) => (c[1] < m[1] - 1e-9 ? c : m));
    return { lo, hi, vx, inside, max, min };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = solve();
    const fr = E.frame(ctx, { x: 30, y: 8, w: w - 40, h: h - 30 }, { X0: -3.5, X1: 6.5, Y0: -5, Y1: 10 }, { xs: 1, ys: 5, xname: "x", yname: "y" });
    const { X, Y } = fr;
    ctx.fillStyle = C.sprout; ctx.globalAlpha = 0.35; ctx.fillRect(X(s.lo), fr.box.y, Math.max(2, X(s.hi) - X(s.lo)), fr.box.h); ctx.globalAlpha = 1;
    ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(X(s.vx), fr.box.y); ctx.lineTo(X(s.vx), fr.box.y + fr.box.h); ctx.stroke(); ctx.restore();
    E.curve(ctx, fr, at, C.ink3, 1.5);
    E.curve(ctx, fr, at, C.forest, 3, null, s.lo, s.hi);
    E.dot(ctx, X(s.vx), Y(at(s.vx)), s.inside ? C.ink : C.ink3, 4.5, !s.inside);
    E.dot(ctx, X(s.max[0]), Y(s.max[1]), C.warn, 6.5);
    E.dot(ctx, X(s.min[0]), Y(s.min[1]), C.forest, 6.5);
    E.tag(ctx, `최대 ${ex(s.max[1])}`, X(s.max[0]) + 9, Y(s.max[1]) - 12, C.warn, "left", fr.box);
    E.tag(ctx, `최소 ${ex(s.min[1])}`, X(s.min[0]) + 9, Y(s.min[1]) + 13, C.forest, "left", fr.box);
    E.tag(ctx, s.inside ? "꼭짓점이 범위 안" : "꼭짓점이 범위 밖", fr.box.x + 6, fr.box.y + 12, s.inside ? C.forest : C.warn, "left", fr.box);
  }

  function update() {
    const s = solve(), [a, b, c] = f, p = -b / (2 * a), q = at(p);
    $(".lo-out").textContent = E.n(+slo.value); $(".hi-out").textContent = E.n(+shi.value);
    const sq = `${a === 1 ? "" : a === -1 ? "−" : E.n(a)}(<i>x</i> ${p < 0 ? "+" : "−"} ${E.n(Math.abs(p))})<sup>2</sup> ${q < 0 ? "−" : "+"} ${E.n(Math.abs(q))}`;
    $(".eq").innerHTML = `<i>f</i>(<i>x</i>) = ${P.fmt([c, b, a], true)} = ${sq}<br>후보: <i>f</i>(${E.n(s.lo)}) = ${ex(at(s.lo))}, <i>f</i>(${E.n(s.hi)}) = ${ex(at(s.hi))}${s.inside ? `, 꼭짓점 <i>f</i>(${E.n(p)}) = ${ex(q)}` : ""}`;
    const nv = $(".n-v"); nv.textContent = s.inside ? "안" : "밖"; nv.className = `n-v ${s.inside ? "good" : "bad"}`;
    $(".n-max").textContent = `${ex(s.max[1])} (x = ${E.n(s.max[0])})`;
    $(".n-min").textContent = `${ex(s.min[1])} (x = ${E.n(s.min[0])})`;
    draw();
  }
  chips.forEach((bt) => bt.addEventListener("click", () => {
    f = bt.dataset.p.split(",").map(Number);
    chips.forEach((x) => x.setAttribute("aria-pressed", String(x === bt))); update();
  }));
  [slo, shi].forEach((x) => x.addEventListener("input", update));
  update();
})();
