/* 카드: 기울기가 m인 접선은 몇 개일까? — f′(x) = m의 해가 접점. 위는 y = f(x)와 접선들, 아래는 y = f′(x)와 직선 y = m */
(() => {
  const root = document.getElementById("card-calc1-tangent-slope");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sm = $(".sm");
  const XR = [-3.2, 3.2], DR = [-6, 9];
  /* roots(m): f′(x) = m의 해 */
  const FN = {
    cub3: { f: (x) => x ** 3 - 3 * x, d: (x) => 3 * x * x - 3, yr: [-5, 5], ys: 2, roots: (m) => (m < -3 ? [] : m === -3 ? [0] : [-Math.sqrt((m + 3) / 3), Math.sqrt((m + 3) / 3)]) },
    sq: { f: (x) => x * x, d: (x) => 2 * x, yr: [-2, 8], ys: 2, roots: (m) => [m / 2] },
    cube: { f: (x) => x ** 3, d: (x) => 3 * x * x, yr: [-6, 6], ys: 2, roots: (m) => (m < 0 ? [] : m === 0 ? [0] : [-Math.sqrt(m / 3), Math.sqrt(m / 3)]) },
  };
  let k = "cub3";
  const { ctx, size } = fit($("canvas"), () => draw());
  const lineEq = (m, b) => {
    const mm = +m.toFixed(3), bb = +b.toFixed(3);
    let s = mm === 0 ? "" : (mm === 1 ? "" : mm === -1 ? "−" : n(mm, 3)) + "<i>x</i>";
    if (bb !== 0 || !s) s += s ? (bb < 0 ? " − " : " + ") + n(Math.abs(bb), 3) : n(bb, 3);
    return "<i>y</i> = " + s;
  };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const P = FN[k], m = +sm.value, rs = P.roots(m), mid = Math.round(h * 0.55);
    const gT = K.frame(ctx, w, h, { xr: XR, yr: P.yr, xs: 1, ys: P.ys, T: 10, B: h - mid + 14 });
    K.curve(ctx, gT, P.f, C.forest);
    rs.forEach((t) => { K.curve(ctx, gT, (x) => P.f(t) + m * (x - t), C.warn, { width: 2 }); });
    rs.forEach((t) => K.dot(ctx, gT, t, P.f(t), C.ink));
    K.tag(ctx, gT, "y = f(x)", gT.x0 + 6, gT.y0 + 10, C.forest);
    const gB = K.frame(ctx, w, h, { xr: XR, yr: DR, xs: 1, ys: 3, T: mid + 6, B: 22 });
    K.curve(ctx, gB, P.d, C.forest, { width: 2 });
    K.curve(ctx, gB, () => m, C.warn, { width: 1.6, dash: [6, 4] });
    rs.forEach((t) => K.dot(ctx, gB, t, m, C.ink, false, 3.5));
    K.tag(ctx, gB, "y = f′(x)", gB.x0 + 6, gB.y0 + 10, C.forest);
    K.tag(ctx, gB, `y = ${n(m, 1)}`, gB.x0 + gB.w - 4, gB.Y(m) - 11, C.warn, "right");
    /* 접점에서 위아래를 잇는 점선 */
    ctx.save(); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.beginPath();
    rs.forEach((t) => { ctx.moveTo(gT.X(t), Math.min(gT.Y(P.f(t)), gT.y0 + gT.h)); ctx.lineTo(gB.X(t), gB.Y(m)); });
    ctx.stroke(); ctx.restore();
  }

  function update() {
    const P = FN[k], m = +sm.value, rs = P.roots(m);
    $(".m-out").textContent = n(m, 1);
    $(".n-c").textContent = `${rs.length}개`;
    $(".n-t").textContent = rs.length ? rs.map((t) => `(${n(t, 3)}, ${n(P.f(t), 3)})`).join(", ") : "없음";
    $(".eq").innerHTML = rs.length ? rs.map((t) => lineEq(m, P.f(t) - m * t)).join("<br>") : `f′(<i>x</i>) = ${n(m, 1)}인 <i>x</i>가 없습니다. 기울기가 ${n(m, 1)}인 접선은 없습니다.`;
    draw();
  }

  K.chips(root, ".ex .chip", (bt) => { k = bt.dataset.k; update(); });
  sm.addEventListener("input", update);
  update();
})();
