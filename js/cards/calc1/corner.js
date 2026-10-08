/* 카드: 왼쪽에서 본 기울기와 오른쪽에서 본 기울기가 다르면? — x = 1에서 좌우 평균변화율의 극한 비교 */
(() => {
  const root = document.getElementById("card-calc1-corner");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const st = $(".st"), cv = $("canvas");
  const FN = {
    abs: { f: (x) => Math.abs(x - 1), yr: [-1, 2.5], cont: true },
    smooth: { f: (x) => (x - 1) * Math.abs(x - 1), yr: [-2, 2], cont: true },
    jump: { f: (x) => (x < 1 ? x : x + 1), yr: [-1, 4], cont: false },
  };
  let k = "abs", g = null;
  const { ctx, size } = fit(cv, () => draw());
  const hOf = () => Math.pow(10, -st.value);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const F = FN[k], f = F.f, hh = hOf(), fa = f(1), xl = 1 - hh, xr = 1 + hh;
    g = K.frame(ctx, w, h, { xr: [-1, 3], yr: F.yr, xs: 1, ys: 1 });
    if (k === "jump") {
      K.curve(ctx, g, f, C.forest, { from: -1, to: 1 - 1e-9 });
      K.curve(ctx, g, f, C.forest, { from: 1, to: 3 });
      K.dot(ctx, g, 1, 1, C.forest, true);
    } else K.curve(ctx, g, f, C.forest);
    const ml = (f(xl) - fa) / -hh, mr = (f(xr) - fa) / hh;
    K.curve(ctx, g, (x) => fa + ml * (x - 1), C.warn, { width: 1.8 });
    K.curve(ctx, g, (x) => fa + mr * (x - 1), K.BLUE, { width: 1.8 });
    K.dot(ctx, g, xl, f(xl), C.warn); K.dot(ctx, g, xr, f(xr), K.BLUE);
    K.dot(ctx, g, 1, fa, C.ink);
    if (g.X(xr) - g.X(xl) > 40) {
      K.tag(ctx, g, "L", g.X(xl) - 8, g.Y(f(xl)) + 14, C.warn, "right");
      K.tag(ctx, g, "R", g.X(xr) + 8, g.Y(f(xr)) + 14, K.BLUE);
    }
    K.tag(ctx, g, "P", g.X(1) + 8, g.Y(fa) - 14, C.ink);
  }

  function update() {
    const F = FN[k], f = F.f, hh = hOf(), fa = f(1);
    const ml = (f(1 - hh) - fa) / -hh, mr = (f(1 + hh) - fa) / hh;
    $(".h-out").textContent = n(hh, 4);
    $(".n-l").textContent = n(ml, 4); $(".n-r").textContent = n(mr, 4);
    const c = $(".n-c"); c.textContent = F.cont ? "예" : "아니요 (끊어짐)"; c.className = `n-c ${F.cont ? "good" : "bad"}`;
    let msg;
    if (+st.value < 2) msg = "<i>h</i>를 더 줄여 보세요. 왼쪽 값과 오른쪽 값이 각각 어느 수에 다가가나요?";
    else if (Math.abs(ml - mr) < 0.02) msg = `두 값이 같은 수에 다가갑니다. <i>x</i> = 1에서 미분가능하고 f′(1) = ${n(Math.round((ml + mr) / 2 * 10) / 10, 1)}입니다.`;
    else if (Math.abs(ml) > 50 || Math.abs(mr) > 50) msg = "한쪽 값이 한없이 커집니다. 극한이 없으므로 미분가능하지 않습니다.";
    else msg = `왼쪽은 ${n(ml, 2)}, 오른쪽은 ${n(mr, 2)}로 다가가 서로 다릅니다. 미분가능하지 않습니다.`;
    $(".msg").innerHTML = msg;
    draw();
  }

  K.chips(root, ".ex .chip", (bt) => { k = bt.dataset.k; update(); });
  st.addEventListener("input", update);
  const drag = (e) => {
    if (!g) return;
    const r = cv.getBoundingClientRect(), d = clamp(Math.abs(g.ix(e.clientX - r.left) - 1), 1e-4, 1);
    st.value = Math.round(-Math.log10(d) * 10) / 10; update();
  };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  update();
})();
