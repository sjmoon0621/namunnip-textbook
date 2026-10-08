/* 카드: 곡선 밖의 점에서 접선을 몇 개 그을 수 있을까? — y = x²에 점 Q(p, q)에서 그은 접선. 접점 t는 t² − 2pt + q = 0의 해 */
(() => {
  const root = document.getElementById("card-calc1-tangent-ext");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const f = (x) => x * x;
  let p = 1, q = -3, G = null;
  const { ctx, size } = fit(cv, () => draw());
  const lineEq = (m, b) => {
    const mm = +m.toFixed(3), bb = +b.toFixed(3);
    let s = mm === 0 ? "" : (mm === 1 ? "" : mm === -1 ? "−" : n(mm, 3)) + "<i>x</i>";
    if (bb !== 0 || !s) s += s ? (bb < 0 ? " − " : " + ") + n(Math.abs(bb), 3) : n(bb, 3);
    return "<i>y</i> = " + s;
  };
  /* 접점의 x좌표: t² − 2pt + q = 0, 판별식/4 = p² − q */
  const roots = () => { const D = p * p - q; return Math.abs(D) < 1e-9 ? [p] : D < 0 ? [] : [p - Math.sqrt(D), p + Math.sqrt(D)]; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const ts = roots();
    G = K.frame(ctx, w, h, { xr: [-3.5, 3.5], yr: [-4, 6], xs: 1, ys: 1 });
    K.curve(ctx, G, f, C.forest);
    ts.forEach((t) => K.curve(ctx, G, (x) => 2 * t * x - t * t, C.warn, { width: 2 }));
    ts.forEach((t, i) => { K.dot(ctx, G, t, f(t), C.ink); K.tag(ctx, G, ts.length > 1 ? `T${i + 1}` : "T", G.X(t) + (t < p ? -10 : 10), G.Y(f(t)) - 13, C.ink, t < p ? "right" : "left"); });
    K.dot(ctx, G, p, q, K.BLUE, false, 6);
    K.tag(ctx, G, "Q", G.X(p) + 10, G.Y(q) + 14, K.BLUE);
  }

  function update() {
    const ts = roots(), D = p * p - q;
    $(".n-q").textContent = `(${n(p, 1)}, ${n(q, 1)})`;
    $(".n-d").textContent = `${n(D, 2)} ${Math.abs(D) < 1e-9 ? "(= 0, 곡선 위의 점)" : D > 0 ? "(> 0, 포물선 바깥쪽)" : "(< 0, 포물선 안쪽)"}`;
    $(".n-c").textContent = `${ts.length}개`;
    $(".n-t").textContent = ts.length ? ts.map((t) => `(${n(t, 3)}, ${n(f(t), 3)})`).join(", ") : "없음";
    const sg = (c, body) => (c === 0 ? "" : (c < 0 ? " − " : " + ") + (Math.abs(c) === 1 && body ? "" : n(Math.abs(c), 2)) + body);
    $(".eq").innerHTML = `접점 (<i>t</i>, <i>t</i><sup>2</sup>)의 접선 <i>y</i> = 2<i>tx</i> − <i>t</i><sup>2</sup>에 Q를 넣으면 <i>t</i><sup>2</sup>${sg(-2 * p, "<i>t</i>")}${sg(q, "")} = 0`
      + "<br>" + (ts.length ? ts.map((t) => lineEq(2 * t, -t * t)).join("<br>") : "실근이 없으므로 접선을 그을 수 없습니다.");
    draw();
  }

  const drag = (e) => {
    if (!G) return;
    const r = cv.getBoundingClientRect();
    p = clamp(Math.round(G.ix(e.clientX - r.left) * 2) / 2, -3, 3);
    q = clamp(Math.round(G.iy(e.clientY - r.top) * 2) / 2, -3.5, 5.5);
    root.querySelectorAll(".ex .chip").forEach((b) => b.setAttribute("aria-pressed", "false"));
    update();
  };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  K.chips(root, ".ex .chip", (bt) => { [p, q] = bt.dataset.q.split(",").map(Number); update(); });
  update();
})();
