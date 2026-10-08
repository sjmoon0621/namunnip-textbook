/* 카드: sin x의 접선의 기울기를 모으면 어떤 그래프가 될까? — 기울기 점으로 (sin x)′ = cos x, (cos x)′ = −sin x 발견 */
(() => {
  const root = document.getElementById("card-calc2-sin-deriv");
  if (!root) return;
  const { C, fit, loop, reduce, clamp } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sx = $(".sx"), cv = $("canvas"), guess = $(".go-guess");
  const PI = Math.PI, H = 1e-5;
  const P = {
    sin: { f: Math.sin, g: Math.cos, lab: "y = sin x", glab: "cos x" },
    cos: { f: Math.cos, g: (x) => -Math.sin(x), lab: "y = cos x", glab: "−sin x" },
  };
  let key = "sin", marks = new Map(), sweep = -1, top = null;
  const piLab = (v) => { const k = Math.round(v / (PI / 2)); return ["0", "π/2", "π", "3π/2", "2π"][k] ?? ""; };
  const slope = (x) => (P[key].f(x + H) - P[key].f(x - H)) / (2 * H);
  const record = (x) => marks.set(Math.round(x * 50) / 50, slope(x));
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[key], x0 = +sx.value, y0 = p.f(x0), m = slope(x0), half = Math.round(h / 2);
    const o = { xr: [-0.15, 2 * PI + 0.15], yr: [-1.4, 1.4], xs: PI / 2, ys: 1, xf: piLab };
    top = K.frame(ctx, w, h, { ...o, T: 10, B: h - half + 10 });
    K.curve(ctx, top, (x) => y0 + m * (x - x0), C.warn, { width: 1.5, dash: [6, 4] });
    K.curve(ctx, top, p.f, C.forest);
    K.dot(ctx, top, x0, y0, C.warn);
    K.tag(ctx, top, p.lab, top.x0 + top.w - 4, top.y0 + 10, C.forest, "right");
    const bot = K.frame(ctx, w, h, { ...o, T: half + 18, B: 22 });
    if (guess.getAttribute("aria-pressed") === "true") K.curve(ctx, bot, p.g, C.ink3, { width: 1.6, dash: [5, 4] });
    for (const [x, v] of marks) K.dot(ctx, bot, x, v, K.BLUE, false, 2.4);
    K.dot(ctx, bot, x0, m, C.warn);
    K.tag(ctx, bot, "접선의 기울기", bot.x0 + bot.w - 4, bot.y0 + 10, K.BLUE, "right");
    ctx.save(); ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 3]); ctx.beginPath();
    ctx.moveTo(top.X(x0), top.Y(y0)); ctx.lineTo(bot.X(x0), bot.Y(m)); ctx.stroke(); ctx.restore();
  }

  function update() {
    const p = P[key], x0 = +sx.value;
    record(x0);
    $(".x-out").textContent = n(x0, 2);
    $(".n-y").textContent = n(p.f(x0), 4); $(".n-m").textContent = n(slope(x0), 4);
    $(".d-g").textContent = p.glab; $(".n-g").textContent = n(p.g(x0), 4);
    draw();
  }

  loop(cv, (dt) => {
    if (sweep < 0) return false;
    sweep = Math.min(2 * PI, sweep + dt * 2.2);
    for (let x = +sx.value; x <= sweep; x += 0.02) record(x);
    sx.value = sweep; update();
    if (sweep >= 2 * PI) sweep = -1;
  });
  $(".go-sweep").addEventListener("click", () => {
    marks.clear();
    if (reduce) { for (let x = 0; x <= 2 * PI; x += 0.02) record(x); update(); return; }
    sx.value = 0; sweep = 0; update();
  });
  $(".go-clear").addEventListener("click", () => { marks.clear(); update(); });
  guess.addEventListener("click", () => { guess.setAttribute("aria-pressed", String(guess.getAttribute("aria-pressed") !== "true")); draw(); });
  K.chips(root, ".fn .chip", (b) => { key = b.dataset.k; marks.clear(); sweep = -1; update(); });
  sx.addEventListener("input", () => { sweep = -1; update(); });
  const drag = (e) => {
    if (!top) return;
    const r = cv.getBoundingClientRect();
    sweep = -1; sx.value = clamp(Math.round(top.ix(e.clientX - r.left) * 50) / 50, 0, 6.28); update();
  };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  update();
})();
