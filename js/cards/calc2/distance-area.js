/* 카드: 속도 그래프만 보고 얼마나 움직였는지 알 수 있을까? — 변위 ∫v dt와 움직인 거리 ∫|v| dt, 수직선 위의 자취 */
(() => {
  const root = document.getElementById("card-calc2-distance-area");
  if (!root) return;
  const { C, clamp, loop, reduce } = NM;
  const K = NMCalc, I = NMInteg, n = K.n;
  const $ = (s) => root.querySelector(s), st = $(".st"), cv = $("canvas");
  const E = Math.exp;
  const P = [
    { v: Math.cos, x: Math.sin, T: 6.28, t0: 2, vr: [-1.3, 1.3], vs: 0.5, ts: 1, xr: [-1.2, 1.2], xs: 0.5, lab: "v = cos t" },
    { v: (t) => 2 - E(t / 2), x: (t) => 2 * t - 2 * (E(t / 2) - 1), T: 3, t0: 2, vr: [-2.7, 1.3], vs: 1, ts: 0.5, xr: [-1.2, 1], xs: 0.5, lab: "v = 2 − e^(t/2)" },
    { v: (t) => (t - 1) * E(-t), x: (t) => -t * E(-t), T: 4, t0: 1.5, vr: [-1.1, 0.3], vs: 0.25, ts: 1, xr: [-0.45, 0.1], xs: 0.1, lab: "v = (t − 1)e^(−t)" },
  ];
  let k = 0, top = null, play = -1;
  const { ctx, size } = NM.fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[k], t = +st.value, half = Math.round(h * 0.52);
    top = K.frame(ctx, w, h, { xr: [0, p.T + 0.05], yr: p.vr, xs: p.ts, ys: p.vs, T: 10, B: h - half + 8 });
    I.shade(ctx, top, p.v, 0, t);
    K.curve(ctx, top, p.v, C.forest);
    I.vline(ctx, top, t, C.ink2);
    K.dot(ctx, top, t, p.v(t), C.ink2);
    K.tag(ctx, top, p.lab, top.x0 + top.w - 4, top.y0 + 10, C.forest, "right");
    K.tag(ctx, top, "t", top.x0 + top.w - 4, top.Y(0) + 12, C.ink3, "right");
    const g = K.frame(ctx, w, h, { xr: p.xr, yr: [-p.T * 1.04, p.T * 0.2], xs: p.xs, ys: 1e9, T: half + 14, B: 22 });
    ctx.save(); ctx.beginPath(); ctx.rect(g.x0, g.y0, g.w, g.h); ctx.clip();
    ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 3]); ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i <= 300; i++) { const s = p.T * i / 300; i ? ctx.lineTo(g.X(p.x(s)), g.Y(-s)) : ctx.moveTo(g.X(p.x(s)), g.Y(-s)); }
    ctx.stroke(); ctx.setLineDash([]);
    ctx.lineWidth = 2.2; let prev = null;
    for (let i = 0; i <= 300; i++) {
      const s = t * i / 300, pt = [g.X(p.x(s)), g.Y(-s)];
      if (prev) { ctx.strokeStyle = p.v(s) >= 0 ? C.forest : C.warn; ctx.beginPath(); ctx.moveTo(...prev); ctx.lineTo(...pt); ctx.stroke(); }
      prev = pt;
    }
    ctx.restore();
    ctx.save(); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(g.x0, g.Y(0)); ctx.lineTo(g.x0 + g.w, g.Y(0)); ctx.stroke(); ctx.restore();
    K.dot(ctx, g, p.x(t), 0, C.warn, false, 6);
    K.dot(ctx, g, p.x(t), -t, C.warn, true, 3.5);
    K.dot(ctx, g, 0, 0, C.ink3, true, 3.5);
    K.tag(ctx, g, "수직선 위의 위치 x", g.x0 + 4, g.Y(0) - 12, C.ink2);
    K.tag(ctx, g, "시간 ↓", g.x0 + 4, g.y0 + g.h - 10, C.ink3);
  }

  function update() {
    const p = P[k], t = +st.value, d = I.simp(p.v, 0, t, 2000);
    const z = []; const N = 2000;
    for (let i = 1; i <= N; i++) { const a = t * (i - 1) / N, b = t * i / N; if (p.v(a) * p.v(b) < 0) z.push((a + b) / 2); }
    const xs = [0, ...z, t]; let s = 0;
    for (let i = 0; i < xs.length - 1; i++) s += Math.abs(I.simp(p.v, xs[i], xs[i + 1], 400));
    $(".t-out").textContent = n(t, 2);
    $(".n-v").textContent = n(p.v(t), 4); $(".n-x").textContent = n(p.x(t), 4);
    $(".n-d").textContent = n(d, 4); $(".n-s").textContent = n(s, 4);
    draw();
  }

  loop(cv, (dt) => {
    if (play < 0) return false;
    play = Math.min(P[k].T, play + dt * P[k].T / 5);
    st.value = play; update();
    if (play >= P[k].T) play = -1;
  });
  $(".go-play").addEventListener("click", () => {
    if (reduce) { st.value = P[k].T; update(); return; }
    play = 0; st.value = 0; update();
  });
  K.chips(root, ".fn .chip", (bt) => { k = +bt.dataset.k; play = -1; st.max = P[k].T; st.value = P[k].t0; update(); });
  st.addEventListener("input", () => { play = -1; update(); });
  const drag = (e) => { if (!top) return; play = -1; st.value = clamp(Math.round(I.px(cv, top, e) * 100) / 100, 0, P[k].T); update(); };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  update();
})();
