/* 카드: 양 끝 높이가 같으면 기울기가 0인 곳이 반드시 있을까? — 롤의 정리와 조건(연속·미분가능)이 깨진 반례 */
(() => {
  const root = document.getElementById("card-calc1-rolle");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sx = $(".px"), cv = $("canvas");
  /* 세 함수 모두 구간 [0, 3]에서 f(0) = f(3) */
  const FS = [
    { f: (x) => x ** 3 - 6 * x * x + 9 * x + 1, d: (x) => 3 * x * x - 12 * x + 9, cont: "예", diff: "예" },
    { f: (x) => 2 * Math.abs(x - 1.5) + 1, d: (x) => (Math.abs(x - 1.5) < 1e-9 ? NaN : x > 1.5 ? 2 : -2), cont: "예", diff: "아니요 (x = 1.5)" },
    { f: (x) => (x < 3 ? x + 1 : 1), d: () => 1, cont: "아니요 (x = 3)", diff: "예", jump: true },
  ];
  let k = 0, g = null;
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const P = FS[k], f = P.f;
    g = K.frame(ctx, w, h, { xr: [-0.5, 3.5], yr: [-0.5, 5.5], xs: 0.5, ys: 1, xf: (v) => (Number.isInteger(v) ? n(v) : "") });
    ctx.save(); ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(g.X(0), g.Y(f(0))); ctx.lineTo(g.X(3), g.Y(f(3))); ctx.stroke(); ctx.restore();
    if (P.jump) {
      K.curve(ctx, g, f, C.forest, { from: 0, to: 2.999 });
      K.dot(ctx, g, 3, 4, C.forest, true);
    } else K.curve(ctx, g, f, C.forest, { from: 0, to: 3 });
    K.dot(ctx, g, 0, f(0), C.forest); K.dot(ctx, g, 3, f(3), C.forest);
    K.tag(ctx, g, "a = 0", g.X(0) + 6, g.Y(f(0)) + 14, C.ink2); K.tag(ctx, g, "b = 3", g.X(3) - 6, g.Y(f(3)) + 14, C.ink2, "right");
    const x = +sx.value, y = f(x), s = P.d(x), zero = Math.abs(s) < 1e-9;
    if (isFinite(s)) {
      const col = zero ? C.forest : K.BLUE;
      K.curve(ctx, g, (t) => y + s * (t - x), col, { from: x - 0.9, to: x + 0.9, width: zero ? 3 : 2 });
      K.dot(ctx, g, x, y, col);
      K.tag(ctx, g, zero ? `f′(${n(x)}) = 0, 수평 접선` : `기울기 ${n(s)}`, g.X(x) + 10, g.Y(y) - 16, col);
    } else {
      K.dot(ctx, g, x, y, C.warn);
      K.tag(ctx, g, "뾰족점: 접선을 하나로 정할 수 없음", g.X(x), g.Y(y) - 18, C.warn, "center");
    }
  }

  function update() {
    const P = FS[k], x = +sx.value, s = P.d(x);
    $(".x-out").textContent = n(x);
    $(".n-ab").textContent = `${n(P.f(0))}, ${n(P.f(3))}`;
    const c = $(".n-c"); c.textContent = P.cont; c.className = `n-c ${P.cont === "예" ? "" : "bad"}`;
    const d = $(".n-d"); d.textContent = P.diff; d.className = `n-d ${P.diff === "예" ? "" : "bad"}`;
    const e = $(".n-s"); e.textContent = isFinite(s) ? n(s) : "없음"; e.className = `n-s ${Math.abs(s) < 1e-9 ? "good" : isFinite(s) ? "" : "bad"}`;
    draw();
  }

  const drag = (e) => { if (!g) return; const r = cv.getBoundingClientRect(); sx.value = clamp(g.ix(e.clientX - r.left), 0.05, 2.95); update(); };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  K.chips(root, ".presets .chip", (b) => { k = +b.dataset.k; update(); });
  sx.addEventListener("input", update);
  update();
})();
