/* 카드: 그래프를 그리지 않고 오르막을 알 수 있을까? — 위 칸 y = f(x)와 접선, 아래 칸 y = f′(x)의 부호 띠 */
(() => {
  const root = document.getElementById("card-calc1-incdec");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const px = $(".px"), cv = $("canvas");
  const FS = [
    { f: (x) => x ** 3 - 3 * x, d: (x) => 3 * x * x - 3, xr: [-2.5, 2.5], yf: [-4, 4], yd: [-4, 8], z: [-1, 1] },
    { f: (x) => -(x ** 3) + 3 * x * x, d: (x) => -3 * x * x + 6 * x, xr: [-1.5, 3.5], yf: [-3, 6], yd: [-8, 4], z: [0, 2] },
    { f: (x) => x ** 3, d: (x) => 3 * x * x, xr: [-2, 2], yf: [-4, 4], yd: [-2, 6], z: [0] },
  ];
  let F = FS[0], gd = null;
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x = +px.value, h1 = Math.round(h * 0.56);
    const gf = K.frame(ctx, w, h1, { xr: F.xr, yr: F.yf, ys: 2, B: 18 });
    ctx.save(); ctx.translate(0, h1);
    gd = K.frame(ctx, w, h - h1, { xr: F.xr, yr: F.yd, ys: 2, T: 8, B: 20 });
    const N = 200, bandY = gd.y0 + gd.h - 6;
    for (let i = 0; i < N; i++) {
      const a = F.xr[0] + (F.xr[1] - F.xr[0]) * i / N, b = F.xr[0] + (F.xr[1] - F.xr[0]) * (i + 1) / N;
      const s = F.d((a + b) / 2);
      ctx.fillStyle = s > 0 ? C.forest : C.warn; ctx.globalAlpha = .55;
      ctx.fillRect(gd.X(a), bandY, gd.X(b) - gd.X(a) + .5, 6);
    }
    ctx.globalAlpha = 1;
    K.curve(ctx, gd, F.d, K.BLUE);
    for (const z of F.z) K.dot(ctx, gd, z, 0, C.ink, true, 4);
    const s = F.d(x), col = Math.abs(s) < 1e-9 ? C.ink : s > 0 ? C.forest : C.warn;
    K.guide(ctx, gd, x, s, col, "x"); K.dot(ctx, gd, x, s, col);
    K.tag(ctx, gd, "y = f′(x)", gd.x0 + 4, gd.y0 + 10, K.BLUE);
    ctx.restore();
    K.curve(ctx, gf, F.f, C.ink2);
    for (let i = 0; i < N; i++) {
      const a = F.xr[0] + (F.xr[1] - F.xr[0]) * i / N, b = a + (F.xr[1] - F.xr[0]) / N;
      if (b > x + 1e-9) break;
      K.curve(ctx, gf, F.f, F.d((a + b) / 2) > 0 ? C.forest : C.warn, { from: a, to: b, N: 2, width: 3.2 });
    }
    K.curve(ctx, gf, (t) => F.f(x) + s * (t - x), col, { from: x - 0.7, to: x + 0.7, width: 1.8 });
    K.dot(ctx, gf, x, F.f(x), col);
    K.tag(ctx, gf, "y = f(x)", gf.x0 + 4, gf.y0 + 10, C.ink2);
  }

  function update() {
    const x = +px.value, s = F.d(x), zero = Math.abs(s) < 1e-9;
    $(".x-out").textContent = n(x, 2); $(".n-d").textContent = n(s, 2);
    const sg = $(".n-s"), fd = $(".n-f");
    sg.textContent = zero ? "0" : s > 0 ? "+" : "−"; sg.className = `n-s ${zero ? "" : s > 0 ? "good" : "bad"}`;
    const l = F.d(x - 0.05), r = F.d(x + 0.05);
    fd.textContent = zero ? (l > 0 && r > 0 ? "증가 (멈추지 않음)" : l > 0 ? "증가→감소" : l < 0 && r > 0 ? "감소→증가" : "감소") : s > 0 ? "증가" : "감소";
    fd.className = `n-f ${zero ? "" : s > 0 ? "good" : "bad"}`;
    draw();
  }

  const drag = (e) => { if (!gd) return; const r = cv.getBoundingClientRect(); px.value = gd.ix(e.clientX - r.left); update(); };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  K.chips(root, ".presets .chip", (b) => { F = FS[+b.dataset.k]; px.min = F.xr[0]; px.max = F.xr[1]; px.value = F.xr[0] + 0.5; update(); });
  px.addEventListener("input", update);
  update();
})();
