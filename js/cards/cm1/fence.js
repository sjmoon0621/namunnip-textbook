/* 카드: 벽에 붙여 울타리를 칠 때 가장 넓은 땅은 언제 생길까? — A = x(L − 2x), (L − W)/2 ≤ x < L/2에서 최댓값 */
(() => {
  const root = document.getElementById("card-cm1-fence");
  if (!root) return;
  const { C, F, fit } = NM;
  const E = NMEqPlot;
  const $ = (s) => root.querySelector(s);
  const sl = $(".l"), sw = $(".w"), sx = $(".x");
  const { ctx, size } = fit($("canvas"), () => draw());

  function state() {
    const L = +sl.value, W = +sw.value, lo = Math.max(0, (L - W) / 2), hi = L / 2;
    const x = Math.max(lo, Math.min(hi - 0.5, +sx.value)), vx = L / 4;
    const best = vx >= lo ? vx : lo;
    return { L, W, lo, hi, x, vx, best, A: (t) => t * (L - 2 * t) };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = state(), par = s.L - 2 * s.x, top = 22, bh = h - top - 24, lw = (w - 16) * 0.4;
    ctx.font = `600 11.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillText("위에서 본 텃밭 (m)", 6, 13);
    const u = Math.min((lw - 16) / 30, (bh - 30) / 24), ox = 8, wy = top + 14;
    ctx.fillStyle = C.ink2; ctx.fillRect(ox, wy - 6, s.W * u, 6);
    E.tag(ctx, `벽 ${s.W}`, ox + s.W * u / 2, wy - 14 < top ? wy + 10 : wy - 14, C.ink2, "center", { x: 0, y: top - 12, w: lw, h: bh + 12 });
    ctx.fillStyle = C.sprout; ctx.globalAlpha = 0.6; ctx.fillRect(ox, wy, par * u, s.x * u); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.5; ctx.beginPath();
    ctx.moveTo(ox, wy); ctx.lineTo(ox, wy + s.x * u); ctx.lineTo(ox + par * u, wy + s.x * u); ctx.lineTo(ox + par * u, wy); ctx.stroke();
    const lbox = { x: 0, y: top, w: lw, h: bh };
    E.tag(ctx, `x = ${E.n(s.x)}`, ox + par * u + 5, wy + s.x * u / 2, C.forest, "left", lbox);
    E.tag(ctx, `${E.n(par)}`, ox + par * u / 2, wy + s.x * u + 11, C.forest, "center", lbox);
    const rx = lw + 16 + 30, Amax = s.L * s.L / 8;
    ctx.fillStyle = C.ink2; ctx.fillText("넓이 A (m²)", rx, 13);
    const fr = E.frame(ctx, { x: rx, y: top, w: w - rx - 8, h: bh }, { X0: 0, X1: s.L / 2, Y0: 0, Y1: Amax * 1.12 }, { xname: "x" });
    const { X, Y } = fr;
    ctx.fillStyle = C.sprout; ctx.globalAlpha = 0.35; ctx.fillRect(X(s.lo), fr.box.y, X(s.hi) - X(s.lo), fr.box.h); ctx.globalAlpha = 1;
    E.curve(ctx, fr, s.A, C.ink3, 1.5, [4, 4]);
    E.curve(ctx, fr, s.A, C.forest, 3, null, s.lo, s.hi);
    E.dot(ctx, X(s.vx), Y(Amax), s.vx >= s.lo ? C.ink : C.ink3, 4.5, s.vx < s.lo);
    E.tag(ctx, `꼭짓점 ${E.n(Amax)}`, X(s.vx), Y(Amax) - 10, C.ink3, "center", fr.box);
    E.dot(ctx, X(s.best), Y(s.A(s.best)), C.warn, 6);
    E.dot(ctx, X(s.x), Y(s.A(s.x)), C.forest, 5.5);
    E.tag(ctx, "가능한 범위", X(s.lo) + 4, fr.box.y + fr.box.h - 10, C.forest, "left", fr.box);
  }

  function update() {
    const s = state();
    sx.min = 0; sx.max = s.L / 2;
    if (+sx.value !== s.x) sx.value = s.x;
    $(".l-out").textContent = s.L; $(".w-out").textContent = s.W; $(".x-out").textContent = E.n(s.x);
    $(".eq").innerHTML = `<i>A</i> = <i>x</i>(${s.L} − 2<i>x</i>) = −2(<i>x</i> − ${E.n(s.vx)})<sup>2</sup> + ${E.n(s.L * s.L / 8)}<br>조건 0 &lt; ${s.L} − 2<i>x</i> ≤ ${s.W} → ${E.n(s.lo)} ≤ <i>x</i> &lt; ${E.n(s.hi)}`;
    $(".n-dom").textContent = `${E.n(s.lo)} ≤ x < ${E.n(s.hi)}`;
    $(".n-a").textContent = `${E.n(s.A(s.x))} m²`;
    const nm = $(".n-max"); nm.textContent = `${E.n(s.A(s.best))} (x = ${E.n(s.best)}, ${s.vx >= s.lo ? "꼭짓점" : "범위 끝"})`;
    nm.className = `n-max ${s.vx >= s.lo ? "good" : "bad"}`;
    draw();
  }
  [sl, sw, sx].forEach((x) => x.addEventListener("input", update));
  update();
})();
