/* 카드: 분모가 0으로 가는데 극한값이 있다면 분자는? — (x² + ax + b)/(x − 1)의 극한이 존재할 조건 */
(() => {
  const root = document.getElementById("card-calc1-lim-coef");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sa = $(".sa"), sb = $(".sb");
  const st = () => {
    const a = +sa.value, b = +sb.value, N = 1 + a + b, ok = Math.abs(N) < 1e-9;
    return { a, b, N, ok, L: 2 + a, f: (x) => (x * x + a * x + b) / (x - 1) };
  };
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = st();
    const g = K.frame(ctx, w, h, { xr: [-2, 4], yr: [-6, 10], xs: 1, ys: 2 });
    K.curve(ctx, g, () => 3, C.ink3, { width: 1.2, dash: [5, 4] });
    K.tag(ctx, g, "y = 3", g.x0 + 4, g.Y(3) - 11, C.ink2, "left");
    K.curve(ctx, g, s.f, s.ok ? C.forest : K.BLUE, { from: -2, to: 1 - 1e-6, N: 600 });
    K.curve(ctx, g, s.f, s.ok ? C.forest : K.BLUE, { from: 1 + 1e-6, to: 4, N: 600 });
    if (s.ok) {
      K.dot(ctx, g, 1, s.L, C.forest, true);
      K.tag(ctx, g, `(1, ${n(s.L)}) 구멍`, g.X(1) + 10, g.Y(s.L) + 14, C.forest, "left");
    } else {
      ctx.save(); ctx.strokeStyle = C.warn; ctx.setLineDash([3, 3]); ctx.beginPath();
      ctx.moveTo(g.X(1), g.y0); ctx.lineTo(g.X(1), g.y0 + g.h); ctx.stroke(); ctx.restore();
      K.tag(ctx, g, "x = 1 양쪽으로 발산", g.X(1) + 8, g.y0 + 12, C.warn, "left");
    }
  }

  function update() {
    const s = st();
    $(".a-out").textContent = n(s.a, 1); $(".b-out").textContent = n(s.b, 1);
    const nn = $(".n-n"); nn.textContent = n(s.N, 1); nn.className = `n-n ${s.ok ? "good" : "bad"}`;
    $(".n-v").textContent = `${n(s.f(0.999), 3)} / ${n(s.f(1.001), 3)}`;
    const l = $(".n-l"); l.textContent = s.ok ? n(s.L, 1) : "없음 (발산)";
    l.className = `n-l ${s.ok && Math.abs(s.L - 3) < 1e-9 ? "good" : s.ok ? "" : "bad"}`;
    $(".st").textContent = !s.ok
      ? `분자가 ${n(s.N, 1)}(으)로, 분모가 0으로 가므로 몫은 발산합니다.`
      : Math.abs(s.L - 3) < 1e-9
        ? `분자 = (x − 1)(x + ${n(1 + s.a, 1)}). 약분하면 극한값 3입니다. a = 1, b = −2`
        : `분자 = (x − 1)(x ${1 + s.a < 0 ? "−" : "+"} ${n(Math.abs(1 + s.a), 1)}). 극한값은 2 + a = ${n(s.L, 1)}로 3이 아닙니다.`;
    draw();
  }
  [sa, sb].forEach((el) => el.addEventListener("input", update));
  update();
})();
