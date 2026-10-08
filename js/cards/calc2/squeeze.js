/* 카드: 위아래에서 조이면 가운데 수열의 극한도 정해질까? — aₙ ≤ cₙ ≤ bₙ에서 두 경계의 간격과 극한 비교 */
(() => {
  const root = document.getElementById("card-calc2-squeeze");
  if (!root) return;
  const { C, fit } = NM;
  const S = NMSeq, n = S.n;
  const $ = (s) => root.querySelector(s);
  const sn = $(".nn");
  const P = {
    alt: { lo: (k) => -1 / k, c: (k) => (-1) ** k / k, hi: (k) => 1 / k, La: 0, Lb: 0, yr: [-1.2, 1.2], yt: [-1, -0.5, 0, 0.5, 1] },
    three: { lo: (k) => (3 * k - 1) / (k + 1), c: (k) => (3 * k + (-1) ** k) / (k + 1), hi: (k) => (3 * k + 1) / (k + 1), La: 3, Lb: 3, yr: [0.5, 3.6], yt: [1, 2, 3] },
    mod: { lo: () => 2, c: (k) => 2 + (k % 3) / k, hi: (k) => 2 + 2 / k, La: 2, Lb: 2, yr: [1.8, 4.2], yt: [2, 3, 4] },
    fail: { lo: () => 0.5, c: (k) => 1 + (-1) ** k / 2, hi: () => 1.5, La: 0.5, Lb: 1.5, yr: [0, 2], yt: [0, 0.5, 1, 1.5, 2] },
  };
  let key = "alt";
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    const p = P[key], cur = +sn.value;
    const g = S.frame(ctx, w, h, { xr: [0, 41], yr: p.yr, xt: [1, 10, 20, 30, 40], yt: p.yt, L: 34, B: 22 });
    ctx.save(); ctx.globalAlpha = 0.16; ctx.fillStyle = C.leaf; ctx.beginPath();
    for (let k = 1; k <= 40; k++) ctx.lineTo(g.X(k), g.Y(Math.min(p.hi(k), p.yr[1])));
    for (let k = 40; k >= 1; k--) ctx.lineTo(g.X(k), g.Y(Math.max(p.lo(k), p.yr[0])));
    ctx.closePath(); ctx.fill(); ctx.restore();
    for (let k = 1; k <= 40; k++) {
      S.dot(ctx, g, k, p.lo(k), C.ink3, 2.2); S.dot(ctx, g, k, p.hi(k), C.amber, 2.2);
      S.dot(ctx, g, k, p.c(k), C.forest, k === cur ? 5 : 3.2);
    }
    ctx.save(); ctx.strokeStyle = C.ink2; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(g.X(cur), g.y0); ctx.lineTo(g.X(cur), g.y0 + g.h); ctx.stroke(); ctx.restore();
    S.hline(ctx, g, p.La, C.ink2, [4, 4], 1);
    if (p.Lb !== p.La) S.hline(ctx, g, p.Lb, C.amber, [4, 4], 1);
  }

  function update() {
    const p = P[key], k = +sn.value;
    $(".nn-out").textContent = String(k);
    $(".n-lo").textContent = n(p.lo(k), 5); $(".n-c").textContent = n(p.c(k), 5); $(".n-hi").textContent = n(p.hi(k), 5);
    $(".n-gap").textContent = n(p.hi(k) - p.lo(k), 5);
    const dj = $(".n-j");
    if (p.La === p.Lb) { dj.textContent = `lim cₙ = ${n(p.La)}`; dj.className = "n-j good"; }
    else { dj.textContent = `경계의 극한 ${n(p.La)} ≠ ${n(p.Lb)}: 결론 없음`; dj.className = "n-j bad"; }
    draw();
  }
  S.chips(root, ".presets .chip", (b) => { key = b.dataset.k; update(); });
  sn.addEventListener("input", update);
  update();
})();
