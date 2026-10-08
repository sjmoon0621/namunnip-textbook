/* 카드: xⁿ의 적분 공식은 n = −1에서 왜 멈출까? — ∫₁ᵇ xⁿ dx와 (bⁿ⁺¹ − 1)/(n + 1), ln b 비교 */
(() => {
  const root = document.getElementById("card-calc2-xn-integral");
  if (!root) return;
  const { C, clamp } = NM;
  const K = NMCalc, I = NMInteg, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sn = $(".sn"), sb = $(".sb"), cv = $("canvas");
  let g = null;
  const { ctx, size } = NM.fit(cv, () => draw());
  const pw = (x) => Math.pow(x, +sn.value);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const b = +sb.value;
    g = K.frame(ctx, w, h, { xr: [0, 4.2], yr: [-0.3, 4], xs: 1, ys: 1 });
    I.shade(ctx, g, pw, 1, b, { pos: b >= 1 ? C.forest : C.warn, neg: C.warn });
    K.curve(ctx, g, pw, C.forest, { from: 0.02 });
    I.vline(ctx, g, 1, C.ink3); I.vline(ctx, g, b, C.warn);
    K.dot(ctx, g, b, pw(b), C.warn);
    K.tag(ctx, g, `y = x^${n(+sn.value, 2)}`, g.x0 + g.w - 4, g.y0 + 10, C.forest, "right");
    K.tag(ctx, g, `b = ${n(b, 2)}`, g.X(b) + 6, g.Y(0) - 12, C.warn);
  }

  function update() {
    const p = +sn.value, b = +sb.value;
    $(".n-out").textContent = n(p, 2); $(".b-out").textContent = n(b, 2);
    $(".n-i").textContent = n(I.simp(pw, 1, b, 2000), 4);
    $(".n-f").textContent = Math.abs(p + 1) < 1e-9 ? "0으로 나누게 되어 정의되지 않음" : n((Math.pow(b, p + 1) - 1) / (p + 1), 4);
    $(".n-l").textContent = n(Math.log(b), 4);
    root.querySelectorAll(".presets .chip").forEach((c) => c.setAttribute("aria-pressed", String(Math.abs(+c.dataset.n - p) < 1e-9)));
    draw();
  }

  root.querySelectorAll(".presets .chip").forEach((c) => c.addEventListener("click", () => { sn.value = c.dataset.n; update(); }));
  sn.addEventListener("input", update); sb.addEventListener("input", update);
  const drag = (e) => { if (!g) return; sb.value = clamp(Math.round(I.px(cv, g, e) * 20) / 20, 0.2, 4); update(); };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  update();
})();
