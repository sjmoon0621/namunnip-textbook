/* 카드: 두 곡선이 엇갈리면 넓이는 어떻게 구할까? — 교점에서 나눈 ∫|f − g|와 부호 있는 ∫(f − g) 비교 */
(() => {
  const root = document.getElementById("card-calc2-area-cross");
  if (!root) return;
  const { C, clamp } = NM;
  const K = NMCalc, I = NMInteg, n = K.n;
  const $ = (s) => root.querySelector(s), sb = $(".sb"), cv = $("canvas");
  const PI = Math.PI;
  const P = [
    { f: Math.sin, g: Math.cos, max: 6.28, fl: "y = sin x", gl: "y = cos x" },
    { f: Math.sin, g: (x) => Math.sin(2 * x), max: 3.14, fl: "y = sin x", gl: "y = sin 2x" },
  ];
  let k = 0, gr = null;
  const piLab = (v) => { const q = Math.round(v / (PI / 4)); return ["0", "π/4", "π/2", "3π/4", "π", "5π/4", "3π/2", "7π/4", "2π"][q] ?? ""; };
  const { ctx, size } = NM.fit(cv, () => draw());

  function cuts(p, b) {
    const d = (x) => p.f(x) - p.g(x), out = [], N = 2000;
    for (let i = 1; i <= N; i++) {
      let a = b * (i - 1) / N, c = b * i / N;
      if (d(a) === 0 && a > 1e-9) { out.push(a); continue; }
      if (d(a) * d(c) < 0) { for (let j = 0; j < 50; j++) { const m = (a + c) / 2; if (d(a) * d(m) <= 0) c = m; else a = m; } out.push((a + c) / 2); }
    }
    return out;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[k], b = +sb.value;
    gr = K.frame(ctx, w, h, { xr: [-0.1, p.max + 0.1], yr: [-1.3, 1.3], xs: PI / 4, ys: 0.5, xf: piLab });
    const xs = [0, ...cuts(p, b), b];
    for (let i = 0; i < xs.length - 1; i++) {
      const m = (xs[i] + xs[i + 1]) / 2;
      I.between(ctx, gr, p.f, p.g, xs[i], xs[i + 1], p.f(m) >= p.g(m) ? C.forest : K.BLUE, 0.3);
    }
    K.curve(ctx, gr, p.g, K.BLUE);
    K.curve(ctx, gr, p.f, C.forest);
    xs.slice(1, -1).forEach((x) => K.dot(ctx, gr, x, p.f(x), C.warn, false, 4));
    I.vline(ctx, gr, b, C.warn);
    K.tag(ctx, gr, p.fl, gr.x0 + 8, gr.y0 + gr.h - 28, C.forest);
    K.tag(ctx, gr, p.gl, gr.x0 + 8, gr.y0 + gr.h - 10, K.BLUE);
  }

  function update() {
    const p = P[k], b = +sb.value, d = (x) => p.f(x) - p.g(x);
    const xs = [0, ...cuts(p, b), b];
    let area = 0;
    for (let i = 0; i < xs.length - 1; i++) area += Math.abs(I.simp(d, xs[i], xs[i + 1], 400));
    $(".b-out").textContent = n(b, 2);
    $(".n-s").textContent = n(I.simp(d, 0, b, 2000), 4);
    $(".n-a").textContent = n(area, 4);
    const c = xs.slice(1, -1);
    $(".n-c").textContent = c.length ? c.map((x) => `x ≈ ${n(x, 3)}`).join(", ") : "없음";
    draw();
  }

  K.chips(root, ".fn .chip", (bt) => { k = +bt.dataset.k; sb.max = P[k].max; sb.value = Math.min(+sb.value, P[k].max); update(); });
  sb.addEventListener("input", update);
  const drag = (e) => { if (!gr) return; sb.value = clamp(Math.round(I.px(cv, gr, e) * 100) / 100, 0.05, P[k].max); update(); };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  update();
})();
