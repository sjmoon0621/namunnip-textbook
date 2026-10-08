/* 카드: 왼쪽과 오른쪽에서 다가간 값이 다르면 극한은 있을까? — x + 1 (x < 1), −x + k (x ≥ 1)의 좌극한·우극한 */
(() => {
  const root = document.getElementById("card-calc1-one-sided");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sk = $(".sk"), sx = $(".sx"), cv = $("canvas");
  const f = (x) => (x < 1 ? x + 1 : -x + +sk.value);
  let g = null;
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = +sk.value, R = k - 1, x = +sx.value, same = Math.abs(R - 2) < 1e-9;
    g = K.frame(ctx, w, h, { xr: [-1, 3], yr: [-3, 5], xs: 1, ys: 1 });
    K.curve(ctx, g, f, C.warn, { from: -1, to: 1 - 1e-9 });
    K.curve(ctx, g, f, K.BLUE, { from: 1, to: 3 });
    if (!same) K.dot(ctx, g, 1, 2, C.warn, true);
    K.dot(ctx, g, 1, R, K.BLUE, false);
    K.guide(ctx, g, 1, Math.max(2, R), C.ink3, "x");
    K.tag(ctx, g, "좌극한 2", g.X(1) - 10, g.Y(2) - 14, C.warn, "right");
    K.tag(ctx, g, `우극한 ${n(R)}`, g.X(1) + 10, g.Y(R) + (R > 2 ? -14 : 14), K.BLUE, "left");
    const c = x < 1 ? C.warn : K.BLUE;
    K.guide(ctx, g, x, f(x), c, "y");
    K.dot(ctx, g, x, f(x), c, false, 6.5);
  }

  function update() {
    const k = +sk.value, R = k - 1, x = +sx.value, same = Math.abs(R - 2) < 1e-9;
    $(".k-out").textContent = n(k, 1);
    $(".x-out").textContent = n(x, 3);
    $(".n-r").textContent = n(R, 1);
    const L = $(".n-lim"); L.textContent = same ? "2" : "존재하지 않음"; L.className = `n-lim ${same ? "good" : "bad"}`;
    $(".st").textContent = `f(${n(x, 3)}) = ${n(f(x), 3)}. ` + (same
      ? "좌극한과 우극한이 모두 2이므로 극한값은 2입니다."
      : `좌극한 2와 우극한 ${n(R, 1)}이 달라 x → 1일 때의 극한은 없습니다.`);
    draw();
  }

  const drag = (e) => {
    if (!g) return;
    const r = cv.getBoundingClientRect();
    sx.value = clamp(g.ix(e.clientX - r.left), -1, 3).toFixed(3);
    update();
  };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (cv.hasPointerCapture(e.pointerId)) drag(e); });
  [sk, sx].forEach((el) => el.addEventListener("input", update));
  update();
})();
