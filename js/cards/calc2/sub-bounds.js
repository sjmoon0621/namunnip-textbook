/* 카드: 치환할 때 적분 구간도 바꾸어야 할까? — 네 단계 풀이와 새 끝·옛 끝으로 잰 u 넓이 비교 */
(() => {
  const root = document.getElementById("card-calc2-sub-bounds");
  if (!root) return;
  const { C } = NM;
  const K = NMCalc, I = NMInteg, n = K.n;
  const $ = (s) => root.querySelector(s);
  const PI = Math.PI;
  const P = [
    { h: (x) => Math.sin(x) ** 3 * Math.cos(x), a: 0, b: PI / 2, g: Math.sin, fu: (u) => u ** 3,
      xr: [-0.05, 1.7], yr: [-0.05, 0.4], xs: 0.5, ys: 0.1, ur: [-0.1, 1.7], uy: [-0.3, 4.2], uxs: 0.5, uys: 1,
      xl: "y = sin³x cos x", ul: "y = u³",
      walk: ["<i>u</i> = sin <i>x</i>로 놓습니다.", "d<i>u</i> = cos <i>x</i> d<i>x</i>이므로 sin<sup>3</sup><i>x</i> cos <i>x</i> d<i>x</i> = <i>u</i><sup>3</sup> d<i>u</i>", "<i>x</i> = 0 → <i>u</i> = 0, <i>x</i> = π/2 → <i>u</i> = 1", "∫<sub>0</sub><sup>1</sup> <i>u</i><sup>3</sup> d<i>u</i> = 1/4"] },
    { h: (x) => Math.log(x) ** 2 / x, a: 1, b: Math.E, g: Math.log, fu: (u) => u * u,
      xr: [0.8, 2.9], yr: [-0.05, 0.45], xs: 0.5, ys: 0.1, ur: [-0.1, 2.9], uy: [-0.5, 8], uxs: 0.5, uys: 2,
      xl: "y = (ln x)²/x", ul: "y = u²",
      walk: ["<i>u</i> = ln <i>x</i>로 놓습니다.", "d<i>u</i> = (1/<i>x</i>) d<i>x</i>이므로 (ln <i>x</i>)<sup>2</sup>/<i>x</i> d<i>x</i> = <i>u</i><sup>2</sup> d<i>u</i>", "<i>x</i> = 1 → <i>u</i> = 0, <i>x</i> = <i>e</i> → <i>u</i> = 1", "∫<sub>0</sub><sup>1</sup> <i>u</i><sup>2</sup> d<i>u</i> = 1/3"] },
    { h: (x) => x / (x * x + 1), a: 0, b: 1, g: (x) => x * x + 1, fu: (u) => 1 / (2 * u),
      xr: [-0.05, 1.2], yr: [-0.05, 0.6], xs: 0.25, ys: 0.1, ur: [-0.1, 2.2], uy: [-0.1, 2], uxs: 0.5, uys: 0.5,
      xl: "y = x/(x² + 1)", ul: "y = 1/(2u)",
      walk: ["<i>u</i> = <i>x</i><sup>2</sup> + 1로 놓습니다.", "d<i>u</i> = 2<i>x</i> d<i>x</i>이므로 <i>x</i>/(<i>x</i><sup>2</sup> + 1) d<i>x</i> = 1/(2<i>u</i>) d<i>u</i>", "<i>x</i> = 0 → <i>u</i> = 1, <i>x</i> = 1 → <i>u</i> = 2", "∫<sub>1</sub><sup>2</sup> 1/(2<i>u</i>) d<i>u</i> = (ln 2)/2"] },
    { h: (x) => Math.cos(x) ** 2 * Math.sin(x), a: 0, b: PI / 2, g: Math.cos, fu: (u) => -u * u,
      xr: [-0.05, 1.7], yr: [-0.05, 0.45], xs: 0.5, ys: 0.1, ur: [-0.1, 1.7], uy: [-2.7, 0.3], uxs: 0.5, uys: 0.5,
      xl: "y = cos²x sin x", ul: "y = −u²",
      walk: ["<i>u</i> = cos <i>x</i>로 놓습니다.", "d<i>u</i> = −sin <i>x</i> d<i>x</i>이므로 cos<sup>2</sup><i>x</i> sin <i>x</i> d<i>x</i> = −<i>u</i><sup>2</sup> d<i>u</i>", "<i>x</i> = 0 → <i>u</i> = 1, <i>x</i> = π/2 → <i>u</i> = 0 (위아래가 바뀜)", "∫<sub>1</sub><sup>0</sup> (−<i>u</i><sup>2</sup>) d<i>u</i> = ∫<sub>0</sub><sup>1</sup> <i>u</i><sup>2</sup> d<i>u</i> = 1/3"] },
  ];
  let k = 0, step = 0;
  const { ctx, size } = NM.fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[k], half = Math.round(h / 2);
    const top = K.frame(ctx, w, h, { xr: p.xr, yr: p.yr, xs: p.xs, ys: p.ys, T: 10, B: h - half + 10 });
    I.shade(ctx, top, p.h, p.a, p.b);
    K.curve(ctx, top, p.h, C.forest);
    I.vline(ctx, top, p.a, C.ink3); I.vline(ctx, top, p.b, C.ink3);
    K.tag(ctx, top, p.xl, top.x0 + top.w - 4, top.y0 + 10, C.forest, "right");
    const bot = K.frame(ctx, w, h, { xr: p.ur, yr: p.uy, xs: p.uxs, ys: p.uys, T: half + 18, B: 22 });
    if (step < 3) {
      K.tag(ctx, bot, "셋째 단계에서 u의 함수가 나타납니다", bot.x0 + bot.w / 2, bot.y0 + bot.h / 2, C.ink3, "center");
      return;
    }
    const ua = p.g(p.a), ub = p.g(p.b);
    I.shade(ctx, bot, p.fu, ua, ub, { pos: C.forest, neg: C.forest, alpha: 0.3 });
    K.curve(ctx, bot, p.fu, C.forest, { from: 0.01 });
    I.vline(ctx, bot, ua, C.forest, [1, 0]); I.vline(ctx, bot, ub, C.forest, [1, 0]);
    I.vline(ctx, bot, p.a, C.warn); I.vline(ctx, bot, p.b, C.warn);
    K.tag(ctx, bot, p.ul, bot.x0 + bot.w - 4, bot.y0 + 10, C.forest, "right");
    K.tag(ctx, bot, `새 끝 ${n(ua, 3)} → ${n(ub, 3)}`, bot.x0 + bot.w - 4, bot.y0 + 28, C.forest, "right");
    K.tag(ctx, bot, `x의 끝 ${n(p.a, 3)} → ${n(p.b, 3)}`, bot.x0 + bot.w - 4, bot.y0 + 46, C.warn, "right");
  }

  function update() {
    const p = P[k];
    root.querySelectorAll(".walk li").forEach((li, i) => { li.innerHTML = i < step ? p.walk[i] : "…"; li.classList.toggle("off", i >= step); });
    $(".go-step").disabled = step >= 4;
    $(".n-x").textContent = n(I.simp(p.h, p.a, p.b, 2000), 4);
    if (step < 4) { $(".n-new").textContent = "—"; $(".n-old").textContent = "—"; }
    else {
      $(".n-new").textContent = n(I.simp(p.fu, p.g(p.a), p.g(p.b), 2000), 4);
      $(".n-old").textContent = p.a <= 0 && k === 2 ? "구할 수 없음 (u = 0에서 끝없이 커짐)" : n(I.simp(p.fu, p.a, p.b, 2000), 4);
    }
    draw();
  }

  K.chips(root, ".fn .chip", (bt) => { k = +bt.dataset.k; step = 0; update(); });
  $(".go-step").addEventListener("click", () => { step = Math.min(4, step + 1); update(); });
  $(".go-reset").addEventListener("click", () => { step = 0; update(); });
  update();
})();
