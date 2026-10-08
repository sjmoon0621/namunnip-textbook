/* 카드: 할선의 기울기는 h가 0에 가까워지면 어디로 갈까? — 평균변화율 (f(a+h) − f(a))/h와 미분계수 f′(a) */
(() => {
  const root = document.getElementById("card-calc1-secant");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sa = $(".sa"), sh = $(".sh"), tg = $(".go-tan"), cv = $("canvas");
  /* 식마다 그림 범위 (계수는 낮은 차수부터) */
  const PR = {
    "0,0,1,0": { yr: [-1, 7], ys: 1 },
    "0,-2,0,1": { yr: [-4, 6], ys: 2 },
    "0,4,-1,0": { yr: [-6, 5], ys: 2 },
  };
  let p = [0, 0, 1, 0], o = PR["0,0,1,0"], hv = 1, g = null, hist = [];
  const f = (x) => ((p[3] * x + p[2]) * x + p[1]) * x + p[0];
  const d = (x) => (3 * p[3] * x + 2 * p[2]) * x + p[1];
  const zero = () => Math.abs(hv) < 1e-12;
  const par = (v) => (v < 0 ? `(${n(v, 6)})` : n(v, 6));
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = +sa.value, b = a + hv, fa = f(a), fb = f(b), side = hv >= 0 ? 1 : -1;
    g = K.frame(ctx, w, h, { xr: [-3, 3.5], yr: o.yr, xs: 1, ys: o.ys });
    K.curve(ctx, g, f, C.forest);
    if (tg.getAttribute("aria-pressed") === "true") K.curve(ctx, g, (x) => fa + d(a) * (x - a), C.ink2, { width: 1.6, dash: [6, 4] });
    if (!zero()) {
      const m = (fb - fa) / hv;
      K.curve(ctx, g, (x) => fa + m * (x - a), K.BLUE, { width: 2 });
      ctx.save(); ctx.beginPath(); ctx.rect(g.x0, g.y0, g.w, g.h); ctx.clip();
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(g.X(a), g.Y(fa)); ctx.lineTo(g.X(b), g.Y(fa)); ctx.lineTo(g.X(b), g.Y(fb)); ctx.stroke(); ctx.restore();
      if (Math.abs(g.X(b) - g.X(a)) > 34) {
        K.tag(ctx, g, "Δx", (g.X(a) + g.X(b)) / 2, g.Y(fa) + (fb >= fa ? 12 : -12), C.warn, "center");
        K.tag(ctx, g, "Δy", g.X(b) + 6 * side, (g.Y(fa) + g.Y(fb)) / 2, C.warn, side > 0 ? "left" : "right");
        K.tag(ctx, g, "Q", g.X(b) + 9 * side, g.Y(fb) - 13, K.BLUE, side > 0 ? "left" : "right");
      }
      K.dot(ctx, g, b, fb, K.BLUE);
    }
    K.dot(ctx, g, a, fa, C.ink);
    K.tag(ctx, g, "P", g.X(a) - 9 * side, g.Y(fa) - 13, C.ink, side > 0 ? "right" : "left");
  }

  function update(rec) {
    const a = +sa.value;
    $(".a-out").textContent = n(a, 1); $(".h-out").textContent = n(hv, 6);
    if (zero()) {
      $(".eq").innerHTML = "<i>h</i> = 0이면 Q가 P와 겹쳐 분모가 0이 됩니다. 평균변화율은 정의되지 않습니다.";
      ["n-dx", "n-dy", "n-m"].forEach((c) => { $("." + c).textContent = "—"; });
    } else {
      const dy = f(a + hv) - f(a), m = dy / hv;
      $(".eq").innerHTML = `(f(${n(a, 1)} + <i>h</i>) − f(${n(a, 1)}))/<i>h</i> = (${n(f(a + hv), 6)} − ${par(f(a))})/${par(hv)} = ${n(m, 6)}`;
      $(".n-dx").textContent = n(hv, 6); $(".n-dy").textContent = n(dy, 6); $(".n-m").textContent = n(m, 6);
      if (rec) { hist.push([hv, m]); if (hist.length > 6) hist.shift(); }
    }
    $(".hist").innerHTML = hist.length
      ? "기록 " + hist.map(([x, m]) => `<i>h</i> = ${n(x, 6)} → ${n(m, 6)}`).join(" · ")
      : "'h ÷ 10'을 누르면 <i>h</i>와 평균변화율이 여기에 차례로 쌓입니다.";
    draw();
  }

  const setH = (v, rec) => { hv = v; sh.value = clamp(v, -1.5, 1.5); update(rec); };
  $(".go-div").addEventListener("click", () => {
    if (zero()) hv = 1;
    if (!hist.length) update(true);
    if (Math.abs(hv) > 2e-5) setH(+(hv / 10).toPrecision(6), true);
  });
  $(".go-neg").addEventListener("click", () => { hist = []; setH(-hv, true); });
  $(".go-one").addEventListener("click", () => { hist = []; setH(1); });
  tg.addEventListener("click", () => { tg.setAttribute("aria-pressed", String(tg.getAttribute("aria-pressed") !== "true")); draw(); });
  sh.addEventListener("input", () => { hv = +sh.value; hist = []; update(); });
  sa.addEventListener("input", () => { hist = []; update(); });
  K.chips(root, ".ex .chip", (bt) => { p = bt.dataset.p.split(",").map(Number); o = PR[bt.dataset.p]; hist = []; update(); });
  const drag = (e) => {
    if (!g) return;
    const r = cv.getBoundingClientRect(), x = g.ix(e.clientX - r.left);
    hv = clamp(Math.round((x - +sa.value) * 100) / 100, -1.5, 1.5); sh.value = hv; hist = []; update();
  };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  update();
})();
