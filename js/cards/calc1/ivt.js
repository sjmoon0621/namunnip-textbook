/* 카드: 그래프를 보지 않고 방정식의 근이 있는 곳을 알 수 있을까? — 사잇값 정리로 f(c) = k인 c의 존재를 보고 이분법으로 좁히기 */
(() => {
  const root = document.getElementById("card-calc1-ivt");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sk = $(".sk");
  const FN = {
    cub: { f: (x) => x * x * x + x - 1, a: 0, b: 1, xr: [-0.25, 1.25], yr: [-1.5, 1.5], xs: 0.25, ys: 0.5 },
    sq: { f: (x) => x * x - 2, a: 1, b: 2, xr: [0.75, 2.25], yr: [-1.5, 2.5], xs: 0.25, ys: 0.5 },
    pole: { f: (x) => 1 / (x - 1), a: 0, b: 2, xr: [-0.25, 2.25], yr: [-4, 4], xs: 0.5, ys: 1, pole: 1 },
  };
  let k = "cub", lo = 0, hi = 1, steps = 0, log = "";
  const { ctx, size } = fit($("canvas"), () => draw());
  const G = (x) => FN[k].f(x) - +sk.value;

  /* [a, b]에서 f(x) = k의 해: 표본 사이에서 부호가 바뀌고 끊어진 점을 넘지 않는 곳만 이분법으로 다듬는다 */
  function roots() {
    const F = FN[k], N = 400, out = [];
    for (let i = 0; i < N; i++) {
      let p = F.a + (F.b - F.a) * i / N, q = F.a + (F.b - F.a) * (i + 1) / N;
      if (F.pole !== undefined && p <= F.pole && F.pole <= q) continue;
      if (G(p) === 0) { out.push(p); continue; }
      if (G(p) * G(q) > 0) continue;
      for (let j = 0; j < 60; j++) { const m = (p + q) / 2; if (G(p) * G(m) <= 0) q = m; else p = m; }
      out.push((p + q) / 2);
    }
    if (G(F.b) === 0) out.push(F.b);
    return out.filter((x) => x > F.a && x < F.b);
  }

  function reset() { const F = FN[k]; lo = F.a; hi = F.b; steps = 0; log = ""; }

  function half() {
    const m = (lo + hi) / 2, gm = G(m), gl = G(lo);
    if (gl * G(hi) > 0) { log = "양 끝에서 f − k의 부호가 같아 어느 쪽을 남길지 정할 수 없습니다."; return; }
    log = `m = ${n(m, 6)}, f(m) − k = ${n(gm, 6)} → `;
    if (gm === 0) { lo = hi = m; log += "m이 바로 해입니다."; }
    else if (gl * gm < 0) { hi = m; log += "왼쪽 절반을 남깁니다."; }
    else { lo = m; log += "오른쪽 절반을 남깁니다."; }
    steps++;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const F = FN[k], kk = +sk.value;
    const g = K.frame(ctx, w, h, { xr: F.xr, yr: F.yr, xs: F.xs, ys: F.ys, L: 36, R: 18 });
    ctx.save(); ctx.fillStyle = C.amber; ctx.globalAlpha = 0.18; ctx.fillRect(g.X(lo), g.y0, Math.max(2, g.X(hi) - g.X(lo)), g.h); ctx.restore();
    if (F.pole !== undefined) {
      K.curve(ctx, g, F.f, C.forest, { to: F.pole - 1e-6, N: 600 });
      K.curve(ctx, g, F.f, C.forest, { from: F.pole + 1e-6, N: 600 });
    } else K.curve(ctx, g, F.f, C.forest);
    K.curve(ctx, g, () => kk, K.BLUE, { width: 1.4, dash: [6, 4] });
    K.tag(ctx, g, `y = k = ${n(kk, 1)}`, g.x0 + 4, g.Y(kk) - 11, K.BLUE, "left");
    K.dot(ctx, g, F.a, F.f(F.a), C.ink2, false, 4);
    K.dot(ctx, g, F.b, F.f(F.b), C.ink2, false, 4);
    roots().forEach((c) => { K.guide(ctx, g, c, kk, C.warn, "x"); K.dot(ctx, g, c, kk, C.warn, false, 5); });
  }

  function update() {
    const F = FN[k], kk = +sk.value, fa = F.f(F.a), fb = F.f(F.b);
    $(".k-out").textContent = n(kk, 1);
    $(".n-i").textContent = `[${n(lo, 6)}, ${n(hi, 6)}]`;
    $(".n-w").textContent = `${n(hi - lo, 7)} (${steps}번)`;
    const r = roots(), c = $(".n-c");
    c.textContent = r.length ? r.map((x) => n(x, 6)).join(", ") : "없음";
    c.className = `n-c ${r.length ? "" : "bad"}`;
    const between = (kk - fa) * (kk - fb) < 0;
    $(".log").textContent = (log ? log + " " : "") + `f(${n(F.a)}) = ${n(fa, 3)}, f(${n(F.b)}) = ${n(fb, 3)}. ` +
      (!between ? "k가 두 끝 값 사이에 있지 않아 정리를 쓸 수 없습니다." : F.pole !== undefined ? "k는 사이에 있지만 f가 [0, 2]에서 연속이 아닙니다." : "f가 연속이고 k가 사이에 있으므로 c가 반드시 있습니다.");
    $(".go-half").disabled = hi - lo < 1e-9;
    draw();
  }
  K.chips(root, ".fn .chip", (b) => { k = b.dataset.k; reset(); update(); });
  sk.addEventListener("input", () => { reset(); update(); });
  $(".go-half").addEventListener("click", () => { half(); update(); });
  $(".go-reset").addEventListener("click", () => { reset(); update(); });
  reset(); update();
})();
