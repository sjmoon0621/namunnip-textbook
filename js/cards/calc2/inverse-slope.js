/* 카드: 식을 모르는 역함수의 기울기를 구할 수 있을까? — g′(b) = 1/f′(a), y = x에 대칭인 기울기 삼각형 */
(() => {
  const root = document.getElementById("card-calc2-inverse-slope");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sa = $(".sa");
  const P = {
    cub: { f: (x) => x ** 3 + x, fp: (x) => 3 * x * x + 1, a: [-1.2, 1.2], a0: 1 },
    exp: { f: Math.exp, fp: Math.exp, a: [-2.5, 1.05], a0: 0.5 },
    cube: { f: (x) => x ** 3, fp: (x) => 3 * x * x, a: [-1.4, 1.4], a0: 0.8 },
  };
  let key = "cub";
  const R = 3.2;
  const { ctx, size } = fit($("canvas"), () => draw());
  /* 증가함수 f의 역함수 값: f(x) = y를 이분법으로 푼다 */
  const inv = (p, y) => { let lo = -30, hi = 5; for (let i = 0; i < 90; i++) { const m = (lo + hi) / 2; if (p.f(m) < y) lo = m; else hi = m; } return (lo + hi) / 2; };

  function tri(g, x, y, dx, dy, col) {
    ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(g.X(x), g.Y(y)); ctx.lineTo(g.X(x + dx), g.Y(y)); ctx.lineTo(g.X(x + dx), g.Y(y + dy)); ctx.stroke();
  }
  function line(g, x, y, m, col) {
    ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]); ctx.beginPath();
    if (!isFinite(m)) { ctx.moveTo(g.X(x), g.y0); ctx.lineTo(g.X(x), g.y0 + g.h); }
    else { ctx.moveTo(g.X(x - 10), g.Y(y - 10 * m)); ctx.lineTo(g.X(x + 10), g.Y(y + 10 * m)); }
    ctx.stroke(); ctx.setLineDash([]);
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[key], a = +sa.value, b = p.f(a), fp = p.fp(a), T = 0.5 / Math.max(1, Math.abs(fp));
    const half = R * (w - 44) / (h - 32);
    const g = K.frame(ctx, w, h, { xr: [-half, half], yr: [-R, R], xs: 1, ys: 1 });
    ctx.save(); ctx.beginPath(); ctx.rect(g.x0, g.y0, g.w, g.h); ctx.clip();
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
    ctx.beginPath(); ctx.moveTo(g.X(-R * 2), g.Y(-R * 2)); ctx.lineTo(g.X(R * 2), g.Y(R * 2)); ctx.stroke(); ctx.setLineDash([]);
    const N = 500, s0 = key === "exp" ? -6 : -2, s1 = key === "exp" ? 1.3 : 2;
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = C.forest; ctx.beginPath();
    for (let i = 0; i <= N; i++) { const s = s0 + (s1 - s0) * i / N; i ? ctx.lineTo(g.X(s), g.Y(p.f(s))) : ctx.moveTo(g.X(s), g.Y(p.f(s))); }
    ctx.stroke();
    ctx.strokeStyle = K.BLUE; ctx.beginPath();
    for (let i = 0; i <= N; i++) { const s = s0 + (s1 - s0) * i / N; i ? ctx.lineTo(g.X(p.f(s)), g.Y(s)) : ctx.moveTo(g.X(p.f(s)), g.Y(s)); }
    ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(g.X(a), g.Y(b)); ctx.lineTo(g.X(b), g.Y(a)); ctx.stroke(); ctx.setLineDash([]);
    line(g, a, b, fp, C.forest);
    line(g, b, a, fp === 0 ? Infinity : 1 / fp, K.BLUE);
    tri(g, a, b, T, T * fp, C.amber);
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.6; ctx.beginPath();
    ctx.moveTo(g.X(b), g.Y(a)); ctx.lineTo(g.X(b), g.Y(a + T)); ctx.lineTo(g.X(b + T * fp), g.Y(a + T)); ctx.stroke();
    ctx.restore();
    K.dot(ctx, g, a, b, C.forest, false, 4.5);
    K.dot(ctx, g, b, a, K.BLUE, false, 4.5);
    K.tag(ctx, g, "A", g.X(a) - 14, g.Y(b) - 12, C.forest, "center");
    K.tag(ctx, g, "B", g.X(b) + 14, g.Y(a) + 12, K.BLUE, "center");
    K.tag(ctx, g, "y = f(x)", g.x0 + 6, g.y0 + 10, C.forest);
    K.tag(ctx, g, "y = f⁻¹(x)", g.x0 + 6, g.y0 + 28, K.BLUE);
  }

  function update() {
    const p = P[key], a = +sa.value, b = p.f(a), fp = p.fp(a);
    $(".a-out").textContent = n(a, 2);
    $(".n-b").textContent = n(b, 4); $(".n-f").textContent = n(fp, 4);
    const r = $(".n-r"), d = 1e-4, zero = Math.abs(fp) < 1e-9;
    r.textContent = zero ? "정의 안 됨" : n(1 / fp, 4); r.className = `n-r ${zero ? "bad" : "good"}`;
    $(".n-d").textContent = n((inv(p, b + d) - inv(p, b - d)) / (2 * d), 4);
    $(".eq").innerHTML = zero
      ? `<i>f</i>′(${n(a, 2)}) = 0 → B에서 역함수의 접선은 세로선입니다. 역함수는 <i>x</i> = ${n(b, 4)}에서 미분가능하지 않습니다.`
      : `(<i>f</i><sup>−1</sup>)′(${n(b, 4)}) = 1/<i>f</i>′(${n(a, 2)}) = 1/${n(fp, 4)} = ${n(1 / fp, 4)}`;
    draw();
  }

  K.chips(root, ".presets .chip", (b) => {
    key = b.dataset.k; const p = P[key];
    sa.min = p.a[0]; sa.max = p.a[1]; sa.value = p.a0; update();
  });
  sa.addEventListener("input", update);
  update();
})();
