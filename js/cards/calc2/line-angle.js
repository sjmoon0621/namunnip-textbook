/* 카드: 두 직선이 이루는 각을 기울기만으로 구할 수 있을까? — tan θ = |(m₁ − m₂)/(1 + m₁m₂)| */
(() => {
  const root = document.getElementById("card-calc2-line-angle");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const s1 = $(".s1"), s2 = $(".s2"), cv = $("canvas");
  const DEG = 180 / Math.PI;
  let g = null, which = 1;
  const { ctx, size } = fit(cv, () => draw());

  const angles = () => {
    const a = Math.atan(+s1.value), b = Math.atan(+s2.value);
    let b2 = b;
    if (a - b > Math.PI / 2) b2 = b + Math.PI; else if (b - a > Math.PI / 2) b2 = b - Math.PI;
    return { a, b, b2, th: Math.abs(a - b2) };
  };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    g = K.frame(ctx, w, h, { xr: [-3.2, 3.2], yr: [-2, 2], xs: 1, ys: 1 });
    const m1 = +s1.value, m2 = +s2.value, { a, b, b2, th } = angles();
    const ox = g.X(0), oy = g.Y(0);
    ctx.save(); ctx.beginPath(); ctx.rect(g.x0, g.y0, g.w, g.h); ctx.clip();
    if (th > 1e-6) {
      ctx.globalAlpha = 0.28; ctx.fillStyle = C.amber; ctx.beginPath(); ctx.moveTo(ox, oy);
      ctx.arc(ox, oy, 62, Math.min(-a, -b2), Math.max(-a, -b2)); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    }
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = C.forest; ctx.beginPath(); ctx.arc(ox, oy, 30, Math.min(0, -a), Math.max(0, -a)); ctx.stroke();
    ctx.strokeStyle = K.BLUE; ctx.beginPath(); ctx.arc(ox, oy, 42, Math.min(0, -b), Math.max(0, -b)); ctx.stroke();
    ctx.restore();
    K.curve(ctx, g, (x) => m1 * x, C.forest, { N: 400 });
    K.curve(ctx, g, (x) => m2 * x, K.BLUE, { N: 400 });
    const end = (t) => { const r = 1.85, x = r * Math.cos(t), y = r * Math.sin(t); return [g.X(x), g.Y(y)]; };
    K.tag(ctx, g, "①", ...end(a), C.forest, "center", 12);
    K.tag(ctx, g, "②", ...end(b), K.BLUE, "center", 12);
    const mid = (a + b2) / 2;
    K.tag(ctx, g, `θ ${n(th * DEG, 1)}°`, ox + 82 * Math.cos(mid), oy - 82 * Math.sin(mid), C.warn, "center");
  }

  function update() {
    const m1 = +s1.value, m2 = +s2.value, { a, b, th } = angles();
    $(".m1-out").textContent = n(m1, 1); $(".m2-out").textContent = n(m2, 1);
    $(".n-a").textContent = n(a * DEG, 2) + "°"; $(".n-b").textContent = n(b * DEG, 2) + "°";
    $(".n-t").textContent = n(th * DEG, 2) + "°"; $(".n-d").textContent = n(m1 - m2, 1);
    const num = m1 - m2, den = 1 + m1 * m2;
    $(".eq").innerHTML = Math.abs(den) < 1e-9
      ? `1 + <i>m</i><sub>1</sub><i>m</i><sub>2</sub> = 0 → tan θ가 정의되지 않음, 두 직선은 수직 (θ = 90°)`
      : `tan θ = |${n(num, 2)}/${n(den, 2)}| = ${n(Math.abs(num / den), 4)} → θ = ${n(Math.atan(Math.abs(num / den)) * DEG, 2)}°`;
    draw();
  }

  K.chips(root, ".presets .chip", (bt) => { const [p, q] = bt.dataset.m.split(",").map(Number); s1.value = p; s2.value = q; update(); });
  const clear = () => root.querySelectorAll(".presets .chip").forEach((x) => x.setAttribute("aria-pressed", "false"));
  [s1, s2].forEach((s) => s.addEventListener("input", () => { clear(); update(); }));
  const drag = (e, pick) => {
    if (!g) return;
    const r = cv.getBoundingClientRect(), x = g.ix(e.clientX - r.left), y = g.iy(e.clientY - r.top);
    if (Math.abs(x) < 0.08) return;
    const m = clamp(Math.round(y / x * 10) / 10, -12, 12), t = Math.atan(y / x);
    if (pick) {
      const d = (u) => { const k = Math.abs(t - Math.atan(+u.value)); return Math.min(k, Math.PI - k); };
      which = d(s1) <= d(s2) ? 1 : 2;
    }
    (which === 1 ? s1 : s2).value = m; clear(); update();
  };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e, true); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e, false); });
  update();
})();
