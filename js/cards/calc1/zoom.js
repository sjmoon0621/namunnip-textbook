/* 카드: 곡선을 계속 확대하면 무엇이 보일까? — 한 점 근처를 2배씩 확대하면 곡선이 기울기 f′(a)인 직선에 다가간다 */
(() => {
  const root = document.getElementById("card-calc1-zoom");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sa = $(".sa"), sz = $(".sz"), tg = $(".go-tan");
  const XR = [-2.5, 2.5];
  const PR = { "0,0,1,0": [-0.5, 4.5], "0,-3,0,1": [-2.5, 2.5], "0,0,0,1": [-8, 8] };
  let p = [0, 0, 1, 0], yr = PR["0,0,1,0"];
  const f = (x) => ((p[3] * x + p[2]) * x + p[1]) * x + p[0];
  const d = (x) => (3 * p[3] * x + 2 * p[2]) * x + p[1];
  /* 두 그림의 가로:세로 비를 같게 두려고, 확대 창의 세로 반폭 = W × ky */
  const ky = () => (yr[1] - yr[0]) / (XR[1] - XR[0]);
  const A = fit($(".cv-all"), () => draw()), B = fit($(".cv-in"), () => draw());

  function state() {
    const a = +sa.value, W = Math.pow(2, -sz.value), H = W * ky(), fa = f(a);
    const m = (f(a + W) - f(a - W)) / (2 * W);
    let e = 0;
    for (let i = 0; i <= 80; i++) { const x = a - W + 2 * W * i / 80; e = Math.max(e, Math.abs(f(x) - (f(a - W) + m * (x - a + W)))); }
    return { a, W, H, fa, m, e: e / H * 100 };
  }

  function draw() {
    const s = state();
    if (A.size.w) {
      const { ctx } = A, { w, h } = A.size;
      ctx.clearRect(0, 0, w, h);
      const g = K.frame(ctx, w, h, { xr: XR, yr, xs: 1, ys: yr[1] - yr[0] > 10 ? 4 : 1, L: 28 });
      K.curve(ctx, g, f, C.forest);
      ctx.save(); ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6;
      const bw = Math.max(6, g.X(s.a + s.W) - g.X(s.a - s.W)), bh = Math.max(6, g.Y(s.fa - s.H) - g.Y(s.fa + s.H));
      ctx.strokeRect(g.X(s.a) - bw / 2, g.Y(s.fa) - bh / 2, bw, bh); ctx.restore();
      K.dot(ctx, g, s.a, s.fa, C.ink, false, 3.5);
    }
    if (B.size.w) {
      const { ctx } = B, { w, h } = B.size;
      ctx.clearRect(0, 0, w, h);
      const none = () => "";
      const g = K.frame(ctx, w, h, { xr: [s.a - s.W, s.a + s.W], yr: [s.fa - s.H, s.fa + s.H], xs: s.W / 2, ys: s.H / 2, xf: none, yf: none, L: 6, T: 6, R: 6, B: 6 });
      ctx.save(); ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.strokeRect(g.x0, g.y0, g.w, g.h); ctx.restore();
      if (tg.getAttribute("aria-pressed") === "true") K.curve(ctx, g, (x) => s.fa + d(s.a) * (x - s.a), C.ink2, { width: 1.6, dash: [6, 4] });
      K.curve(ctx, g, f, C.forest, { width: 2.6 });
      K.dot(ctx, g, s.a, s.fa, C.ink);
      K.tag(ctx, g, "P", g.X(s.a) + 8, g.Y(s.fa) + 14, C.ink);
    }
  }

  function update() {
    const s = state();
    $(".a-out").textContent = n(s.a, 1); $(".z-out").textContent = String(2 ** +sz.value);
    $(".n-w").textContent = n(2 * s.W, 6); $(".n-m").textContent = n(s.m, 6); $(".n-e").textContent = `${n(s.e, s.e < 0.01 ? 6 : 2)} %`;
    tg.textContent = tg.getAttribute("aria-pressed") === "true" ? `f′(${n(s.a, 1)}) = ${n(d(s.a), 3)}인 직선 숨기기` : "기울기 f′(a)인 직선 겹쳐 보기";
    draw();
  }

  K.chips(root, ".ex .chip", (bt) => { p = bt.dataset.p.split(",").map(Number); yr = PR[bt.dataset.p]; update(); });
  tg.addEventListener("click", () => { tg.setAttribute("aria-pressed", String(tg.getAttribute("aria-pressed") !== "true")); update(); });
  [sa, sz].forEach((el) => el.addEventListener("input", update));
  update();
})();
