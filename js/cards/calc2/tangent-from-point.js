/* 카드: 곡선 밖의 한 점에서 접선을 몇 개 그을 수 있을까? — y = eˣ, 접점 t가 b = eᵗ(a − t + 1)의 실근 */
(() => {
  const root = document.getElementById("card-calc2-tangent-from-point");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), mapBtn = $(".go-map");
  const XR = [-4, 3], YR = [-2.5, 7.5];
  let qa = 1, qb = 1, showMap = false, g = null, drag = false;
  const { ctx, size } = fit(cv, () => draw());
  const exp = Math.exp;
  const h = (t) => exp(t) * (qa - t + 1) - qb;
  /* h(t) = eᵗ(a − t + 1) − b는 t < a에서 증가, t > a에서 감소. 각 구간에서 부호가 바뀌면 이분법 */
  function bisect(lo, hi) {
    let flo = h(lo);
    for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2, fm = h(m); if (Math.sign(fm) === Math.sign(flo)) { lo = m; flo = fm; } else hi = m; }
    return (lo + hi) / 2;
  }
  function roots() {
    const top = exp(qa);
    if (Math.abs(qb - top) < 1e-9 * (1 + top)) return [qa];
    if (qb > top) return [];
    const r = [];
    if (qb > 0) r.push(bisect(qa - 60, qa));
    r.push(bisect(qa, qa + 60));
    return r;
  }

  function draw() {
    const { w, h: H } = size; if (!w) return;
    ctx.clearRect(0, 0, w, H);
    g = K.frame(ctx, w, H, { xr: XR, yr: YR, xs: 1, ys: 1 });
    ctx.save(); ctx.beginPath(); ctx.rect(g.x0, g.y0, g.w, g.h); ctx.clip();
    if (showMap) {
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = C.sprout; ctx.beginPath(); ctx.moveTo(g.X(XR[0]), g.Y(0));
      for (let i = 0; i <= 200; i++) { const x = XR[0] + (XR[1] - XR[0]) * i / 200; ctx.lineTo(g.X(x), g.Y(exp(x))); }
      ctx.lineTo(g.X(XR[1]), g.Y(0)); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.amber; ctx.fillRect(g.x0, g.Y(0), g.w, g.y0 + g.h - g.Y(0));
      ctx.globalAlpha = 1;
    }
    K.curve(ctx, g, exp, C.forest, { width: 2.6 });
    const rs = roots();
    rs.forEach((t) => {
      const m = exp(t);
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.setLineDash([6, 4]); ctx.beginPath();
      ctx.moveTo(g.X(XR[0]), g.Y(m * (XR[0] - t) + m)); ctx.lineTo(g.X(XR[1]), g.Y(m * (XR[1] - t) + m)); ctx.stroke();
    });
    ctx.setLineDash([]); ctx.restore();
    rs.forEach((t) => K.dot(ctx, g, t, exp(t), C.warn, false, 4));
    if (showMap) {
      K.tag(ctx, g, "0개", g.X(-3.3), g.Y(3), C.ink2);
      K.tag(ctx, g, "2개", g.X(2), g.Y(1.5), C.forest);
      K.tag(ctx, g, "1개", g.X(-3.3), g.Y(-1.4), C.ink2);
    }
    K.dot(ctx, g, qa, qb, C.ink, false, 6);
    K.tag(ctx, g, "Q", g.X(qa) + 10, g.Y(qb) - 12, C.ink);
    K.tag(ctx, g, "y = eˣ", g.X(-3.9), g.Y(0.7), C.forest);
  }

  function update() {
    $(".n-q").textContent = `(${n(qa, 2)}, ${n(qb, 2)})`;
    $(".n-e").textContent = n(exp(qa), 3);
    const rs = roots();
    $(".n-c").textContent = String(rs.length);
    $(".eq").innerHTML = rs.length
      ? rs.map((t) => { const m = exp(t), c = m * (1 - t); return `접점 (${n(t, 3)}, ${n(m, 3)}) → <i>y</i> = ${n(m, 3)}<i>x</i> ${c < 0 ? "−" : "+"} ${n(Math.abs(c), 3)}`; }).join("<br>")
      : `<i>b</i> &gt; <i>e</i><sup><i>a</i></sup>: <i>e</i><sup><i>t</i></sup>(<i>a</i> − <i>t</i> + 1) = <i>b</i>의 실근이 없어 접선을 그을 수 없습니다.`;
    draw();
  }

  const at = (e) => { const r = cv.getBoundingClientRect(); return [g.ix(e.clientX - r.left), g.iy(e.clientY - r.top)]; };
  const move = (e) => {
    if (!g) return;
    const [x, y] = at(e);
    qa = NM.clamp(Math.round(x * 20) / 20, XR[0] + 0.1, XR[1] - 0.1);
    qb = NM.clamp(Math.round(y * 20) / 20, YR[0] + 0.1, YR[1] - 0.1);
    if (Math.abs(qb - exp(qa)) < 0.06) qb = exp(qa);
    update();
  };
  cv.addEventListener("pointerdown", (e) => { drag = true; cv.setPointerCapture(e.pointerId); move(e); });
  cv.addEventListener("pointermove", (e) => { if (drag) move(e); });
  cv.addEventListener("pointerup", () => { drag = false; });
  K.chips(root, ".presets .chip:not(.go-map)", (b) => { [qa, qb] = b.dataset.q.split(",").map(Number); update(); });
  mapBtn.addEventListener("click", () => { showMap = !showMap; mapBtn.setAttribute("aria-pressed", String(showMap)); draw(); });
  update();
})();
