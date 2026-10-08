/* 카드: 곡선이 휘는 방향을 무엇으로 알 수 있을까? — f″의 부호, 접선과 곡선의 위치, f′의 극값과 변곡점 */
(() => {
  const root = document.getElementById("card-calc2-concavity");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sa = $(".sa"), ipBtn = $(".go-ip");
  const E = Math.exp, PI = Math.PI;
  const piLab = (v) => { const k = Math.round(v / (PI / 2)); return ["0", "π/2", "π", "3π/2", "2π"][k] ?? n(v); };
  const P = {
    gauss: { f: (x) => E(-x * x / 2), f1: (x) => -x * E(-x * x / 2), f2: (x) => (x * x - 1) * E(-x * x / 2),
      xr: [-3.5, 3.5], yr: [-0.25, 1.25], ys: 0.5, y1: [-0.8, 0.8], ys1: 0.5, a0: -1.6, ip: [-1, 1] },
    xexp: { f: (x) => x * E(-x), f1: (x) => (1 - x) * E(-x), f2: (x) => (x - 2) * E(-x),
      xr: [0, 6], yr: [-0.05, 0.45], ys: 0.1, y1: [-0.3, 1.1], ys1: 0.5, a0: 0.6, ip: [2] },
    sin: { f: Math.sin, f1: Math.cos, f2: (x) => -Math.sin(x),
      xr: [0, 2 * PI], yr: [-1.3, 1.3], ys: 1, y1: [-1.3, 1.3], ys1: 1, xs: PI / 2, xf: piLab, a0: 1, ip: [PI] },
  };
  let key = "gauss", showIp = false;
  const { ctx, size } = fit($("canvas"), () => draw());
  const conc = (v) => (Math.abs(v) < 1e-9 ? 0 : Math.sign(v));

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[key], a = +sa.value, hb = Math.round(h * 0.38);
    const o = { xr: p.xr, xs: p.xs || 1, xf: p.xf };
    const g2 = K.frame(ctx, w, h, { ...o, yr: p.y1, ys: p.ys1, T: h - hb + 10, B: 22 });
    ctx.save(); ctx.beginPath(); ctx.rect(g2.x0, g2.y0, g2.w, g2.h); ctx.clip();
    const N = 240;
    for (let i = 0; i < N; i++) {
      const x = p.xr[0] + (p.xr[1] - p.xr[0]) * (i + 0.5) / N, s = conc(p.f2(x));
      if (!s) continue;
      ctx.globalAlpha = 0.22; ctx.fillStyle = s > 0 ? C.sprout : C.amber;
      ctx.fillRect(g2.X(p.xr[0] + (p.xr[1] - p.xr[0]) * i / N), g2.y0, g2.w / N + 1, g2.h);
    }
    ctx.globalAlpha = 1; ctx.restore();
    K.curve(ctx, g2, p.f1, K.BLUE, { width: 2 });
    K.dot(ctx, g2, a, p.f1(a), C.warn, false, 4);
    K.tag(ctx, g2, "y = f′(x)", g2.x0 + 4, g2.y0 + 10, K.BLUE);

    const g = K.frame(ctx, w, h, { ...o, yr: p.yr, ys: p.ys, T: 10, B: hb + 14 });
    const fa = p.f(a), m = p.f1(a);
    ctx.save(); ctx.beginPath(); ctx.rect(g.x0, g.y0, g.w, g.h); ctx.clip();
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.setLineDash([6, 4]); ctx.beginPath();
    ctx.moveTo(g.X(p.xr[0]), g.Y(fa + m * (p.xr[0] - a))); ctx.lineTo(g.X(p.xr[1]), g.Y(fa + m * (p.xr[1] - a))); ctx.stroke();
    ctx.setLineDash([]); ctx.restore();
    K.curve(ctx, g, p.f, C.forest, { width: 2.6 });
    if (showIp) p.ip.forEach((x) => { K.dot(ctx, g, x, p.f(x), C.ink, true, 5); K.tag(ctx, g, "변곡점", g.X(x) + 8, g.Y(p.f(x)) + 14, C.ink); });
    K.dot(ctx, g, a, fa, C.warn, false, 4.5);
    K.tag(ctx, g, "P", g.X(a) - 6, g.Y(fa) - 14, C.warn, "center");
  }

  function update() {
    const p = P[key], a = +sa.value, s = conc(p.f2(a));
    $(".a-out").textContent = n(a, 2);
    $(".n-1").textContent = n(p.f1(a), 3);
    const d2 = $(".n-2"); d2.textContent = n(p.f2(a), 3);
    $(".n-c").textContent = s > 0 ? "아래로 볼록" : s < 0 ? "위로 볼록" : "f″ = 0";
    const dl = p.f(a - 0.2) - (p.f(a) - 0.2 * p.f1(a)), dr = p.f(a + 0.2) - (p.f(a) + 0.2 * p.f1(a));
    const t = $(".n-t");
    t.textContent = dl > 0 && dr > 0 ? "접선보다 위" : dl < 0 && dr < 0 ? "접선보다 아래" : "접선을 가로지름";
    t.className = `n-t ${dl * dr < 0 ? "bad" : ""}`;
    draw();
  }

  K.chips(root, ".presets .chip:not(.go-ip)", (b) => {
    key = b.dataset.k; const p = P[key];
    sa.min = p.xr[0]; sa.max = p.xr[1]; sa.value = p.a0; update();
  });
  ipBtn.addEventListener("click", () => { showIp = !showIp; ipBtn.setAttribute("aria-pressed", String(showIp)); draw(); });
  sa.addEventListener("input", update);
  sa.min = P.gauss.xr[0]; sa.max = P.gauss.xr[1]; sa.value = P.gauss.a0;
  update();
})();
