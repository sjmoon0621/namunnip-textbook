/* 카드: (1 + h)^(1/h)는 h가 0에 가까워지면 어디로 갈까? — 자연상수 e, ln(1+h)/h와 (e^h − 1)/h의 극한 */
(() => {
  const root = document.getElementById("card-calc2-e-limit");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sh = $(".sh"), cv = $("canvas");
  const E = Math.E, H0 = -0.7, H1 = 3;
  const f = (x) => Math.pow(1 + x, 1 / x);
  let hv = 1, g = null, hist = [];
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    g = K.frame(ctx, w, h, { xr: [-0.8, 3.1], yr: [0, 6], xs: 0.5, ys: 1 });
    K.curve(ctx, g, () => E, C.ink3, { width: 1.2, dash: [5, 4] });
    K.tag(ctx, g, "y = e", g.x0 + g.w - 4, g.Y(E) - 11, C.ink2, "right");
    K.curve(ctx, g, f, C.forest, { N: 700 });
    K.dot(ctx, g, 0, E, C.forest, true);
    if (Math.abs(hv) > 1e-12) {
      const v = f(hv);
      K.guide(ctx, g, hv, v, C.warn, "x");
      K.dot(ctx, g, hv, v, C.warn);
      K.tag(ctx, g, `h = ${n(hv, 7)}`, g.X(hv) + (hv > 2 ? -10 : 10), g.Y(v) + (v > E ? -14 : 14), C.warn, hv > 2 ? "right" : "left");
    }
  }

  function update(rec) {
    $(".h-out").textContent = n(hv, 7);
    const v = f(hv);
    $(".n-v").textContent = n(v, 7);
    $(".n-gap").textContent = n(E - v, 7);
    $(".n-ln").textContent = n(Math.log1p(hv) / hv, 7);
    $(".n-ex").textContent = n(Math.expm1(hv) / hv, 7);
    if (rec) { hist.push([hv, E - v]); if (hist.length > 5) hist.shift(); }
    $(".hist").innerHTML = hist.length
      ? "기록 " + hist.map(([x, d]) => `<i>h</i> = ${n(x, 7)} → 차이 ${n(d, 7)}`).join(" · ")
      : "'h ÷ 10'을 누르면 <i>h</i>와 e와의 차이가 여기에 차례로 쌓입니다.";
    draw();
  }

  const setH = (v, rec) => { hv = v; sh.value = clamp(v, H0, H1); update(rec); };
  $(".go-div").addEventListener("click", () => {
    if (!hist.length) update(true);
    if (Math.abs(hv) > 2e-6) setH(+(hv / 10).toPrecision(6), true);
  });
  $(".go-neg").addEventListener("click", () => { hist = []; setH(clamp(-hv, H0, H1), true); });
  $(".go-one").addEventListener("click", () => { hist = []; setH(1); });
  sh.addEventListener("input", () => { hv = +sh.value || 0.001; hist = []; update(); });
  const drag = (e) => {
    if (!g) return;
    const r = cv.getBoundingClientRect();
    let x = clamp(Math.round(g.ix(e.clientX - r.left) * 100) / 100, H0, H1);
    if (Math.abs(x) < 0.01) x = x < 0 ? -0.01 : 0.01;
    hist = []; setH(x);
  };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  update();
})();
