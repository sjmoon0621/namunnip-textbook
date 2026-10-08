/* 카드: 연속인 함수는 구간에서 언제나 가장 큰 값을 가질까? — x³ − 3x의 구간·끝점·불연속을 바꾸며 최댓값과 최솟값의 존재 확인 */
(() => {
  const root = document.getElementById("card-calc1-evt");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sa = $(".sa"), sb = $(".sb"), gl = $(".go-left"), gr = $(".go-right"), gb = $(".go-break"), cv = $("canvas");
  const on = (b) => b.getAttribute("aria-pressed") === "true";
  const f0 = (x) => x * x * x - 3 * x;
  let px = 0.5, g = null;
  const { ctx, size } = fit(cv, () => draw());

  /* 구간에서 실제로 갖는 값(at)과 한없이 가까워지기만 하는 값(near)을 모아 최댓값·최솟값이 있는지 판정한다 */
  function solve() {
    const a = +sa.value, b = +sb.value, L = on(gl), R = on(gr), brk = on(gb);
    const f = (x) => (brk && x === 1 ? 0 : f0(x));
    const at = [], near = [];
    const N = 2000;
    for (let i = 1; i < N; i++) { const x = a + (b - a) * i / N; at.push([x, f(x)]); }
    [-1, 1].forEach((c) => { if (a < c && c < b) at.push([c, f(c)]); });
    if (L) at.push([a, f(a)]); else near.push(f0(a));
    if (R) at.push([b, f(b)]); else near.push(f0(b));
    if (brk && a <= 1 && 1 <= b) near.push(f0(1));
    const top = at.reduce((m, p) => (p[1] > m[1] ? p : m)), bot = at.reduce((m, p) => (p[1] < m[1] ? p : m));
    const sup = Math.max(top[1], ...near), inf = Math.min(bot[1], ...near);
    const xs = (v) => at.filter((p) => Math.abs(p[1] - v) < 1e-9).map((p) => p[0]).filter((x, i, A) => A.findIndex((y) => Math.abs(y - x) < 1e-6) === i);
    return { a, b, L, R, brk, f, sup, inf, hasMax: top[1] >= sup - 1e-9, hasMin: bot[1] <= inf + 1e-9, maxAt: xs(top[1]), minAt: xs(bot[1]) };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = solve(), thm = s.L && s.R && !s.brk;
    g = K.frame(ctx, w, h, { xr: [-2.75, 2.75], yr: [-4, 4], xs: 1, ys: 1 });
    ctx.save(); ctx.fillStyle = thm ? C.forest : C.warn; ctx.globalAlpha = 0.08; ctx.fillRect(g.X(s.a), g.y0, g.X(s.b) - g.X(s.a), g.h); ctx.restore();
    K.curve(ctx, g, f0, C.ink3, { width: 1.4 });
    K.curve(ctx, g, f0, C.forest, { from: s.a, to: s.b });
    if (s.brk) { if (s.a <= 1 && 1 <= s.b) { K.dot(ctx, g, 1, -2, C.forest, true); K.dot(ctx, g, 1, 0, C.warn, false); } }
    if (!s.L) K.dot(ctx, g, s.a, f0(s.a), C.forest, true); else K.dot(ctx, g, s.a, s.f(s.a), C.forest, false, 3.5);
    if (!s.R) K.dot(ctx, g, s.b, f0(s.b), C.forest, true); else K.dot(ctx, g, s.b, s.f(s.b), C.forest, false, 3.5);
    const line = (v, has, lab, dy) => {
      K.curve(ctx, g, () => v, has ? C.forest : C.warn, { from: s.a, to: s.b, width: 1.2, dash: [4, 4] });
      K.tag(ctx, g, has ? `${lab} ${n(v)}` : `${lab} 없음`, g.X(s.a) - 4, g.Y(v) + dy, has ? C.forest : C.warn, "right");
    };
    line(s.sup, s.hasMax, "최댓값", -10);
    line(s.inf, s.hasMin, "최솟값", 10);
    const x = clamp(px, s.a, s.b);
    K.guide(ctx, g, x, s.f(x), K.BLUE);
    K.dot(ctx, g, x, s.f(x), K.BLUE, false, 6.5);
  }

  function update() {
    const s = solve(), thm = s.L && s.R && !s.brk;
    $(".a-out").textContent = n(s.a, 2); $(".b-out").textContent = n(s.b, 2);
    const where = (A) => `x = ${A.map((x) => n(x, 3)).join(", ")}`;
    const mx = $(".n-max"), mn = $(".n-min");
    mx.textContent = s.hasMax ? `${n(s.sup, 3)} (${where(s.maxAt)})` : `없음 (${n(s.sup, 3)}에 다가가기만)`; mx.className = `n-max ${s.hasMax ? "" : "bad"}`;
    mn.textContent = s.hasMin ? `${n(s.inf, 3)} (${where(s.minAt)})` : `없음 (${n(s.inf, 3)}에 다가가기만)`; mn.className = `n-min ${s.hasMin ? "" : "bad"}`;
    const c = $(".n-c"); c.textContent = thm ? "만족" : !s.L || !s.R ? "닫힌구간 아님" : "연속 아님"; c.className = `n-c ${thm ? "good" : "bad"}`;
    const x = clamp(px, s.a, s.b);
    $(".st").textContent = `점: f(${n(x, 3)}) = ${n(s.f(x), 3)}. ` + (thm ? "정리에 의해 최댓값과 최솟값이 반드시 있습니다."
      : s.hasMax && s.hasMin ? "조건이 깨졌지만 이 경우에는 우연히 둘 다 있습니다." : "조건이 깨져 없는 값이 생겼습니다.");
    draw();
  }

  const drag = (e) => { if (!g) return; const r = cv.getBoundingClientRect(); px = g.ix(e.clientX - r.left); update(); };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (cv.hasPointerCapture(e.pointerId)) drag(e); });
  [gl, gr, gb].forEach((b) => b.addEventListener("click", () => { b.setAttribute("aria-pressed", String(!on(b))); update(); }));
  [sa, sb].forEach((el) => el.addEventListener("input", update));
  update();
})();
