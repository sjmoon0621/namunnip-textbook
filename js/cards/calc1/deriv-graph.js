/* 카드: 접선의 기울기를 모으면 어떤 그래프가 될까? — 점마다 미분계수 f′(a)를 찍어 도함수 y = f′(x)의 그래프를 만든다 */
(() => {
  const root = document.getElementById("card-calc1-deriv-graph");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sa = $(".sa"), cv = $("canvas"), tg = $(".go-show");
  const XR = [-2.2, 2.2];
  /* 식마다: 원함수, 도함수, 위·아래 그림의 세로 범위와 눈금, 도함수 식 */
  const FN = {
    sq: { f: (x) => x * x, d: (x) => 2 * x, yr: [-1, 5], ys: 1, dr: [-5, 5], ds: 2, eq: "<i>y</i> = 2<i>x</i>" },
    cube: { f: (x) => x ** 3, d: (x) => 3 * x * x, yr: [-6, 6], ys: 2, dr: [-2, 14], ds: 4, eq: "<i>y</i> = 3<i>x</i><sup>2</sup>" },
    cub3: { f: (x) => x ** 3 - 3 * x, d: (x) => 3 * x * x - 3, yr: [-4.5, 4.5], ys: 2, dr: [-4, 12], ds: 4, eq: "<i>y</i> = 3<i>x</i><sup>2</sup> − 3" },
    con: { f: () => 2, d: () => 0, yr: [-1, 3], ys: 1, dr: [-2, 2], ds: 1, eq: "<i>y</i> = 0" },
  };
  let k = "sq", pts = new Set(), gT = null;
  const { ctx, size } = fit(cv, () => draw());
  const key = (a) => Math.round(a * 10) / 10;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const F = FN[k], a = +sa.value, fa = F.f(a), m = F.d(a), mid = Math.round(h / 2);
    /* 위: y = f(x)와 점 P의 접선 */
    gT = K.frame(ctx, w, h, { xr: XR, yr: F.yr, xs: 1, ys: F.ys, T: 10, B: h - mid + 14 });
    K.curve(ctx, gT, F.f, C.forest);
    K.curve(ctx, gT, (x) => fa + m * (x - a), K.BLUE, { from: a - 0.9, to: a + 0.9, width: 2 });
    K.dot(ctx, gT, a, fa, C.ink);
    K.tag(ctx, gT, "y = f(x)", gT.x0 + 6, gT.y0 + 10, C.forest);
    K.tag(ctx, gT, `기울기 ${n(m, 2)}`, gT.X(a) + 10, gT.Y(fa) - 16, K.BLUE);
    /* 아래: 찍은 점 (a, f′(a))들 */
    const gB = K.frame(ctx, w, h, { xr: XR, yr: F.dr, xs: 1, ys: F.ds, T: mid + 6, B: 22 });
    if (tg.getAttribute("aria-pressed") === "true") K.curve(ctx, gB, F.d, C.ink3, { width: 1.6, dash: [6, 4] });
    pts.forEach((x) => K.dot(ctx, gB, x, F.d(x), C.warn, false, 3.5));
    K.dot(ctx, gB, a, m, K.BLUE, true);
    K.tag(ctx, gB, "y = f′(x)", gB.x0 + 6, gB.y0 + 10, C.warn);
    /* 두 그림을 잇는 세로 점선 */
    ctx.save(); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(gT.X(a), clamp(gT.Y(fa), gT.y0, gT.y0 + gT.h)); ctx.lineTo(gB.X(a), clamp(gB.Y(m), gB.y0, gB.y0 + gB.h)); ctx.stroke(); ctx.restore();
  }

  function update() {
    const F = FN[k], a = +sa.value;
    $(".a-out").textContent = n(a, 1);
    $(".n-f").textContent = n(F.f(a), 3); $(".n-d").textContent = n(F.d(a), 3); $(".n-c").textContent = `${pts.size}개`;
    tg.textContent = tg.getAttribute("aria-pressed") === "true" ? "도함수 숨기기" : "도함수 그래프 겹쳐 보기";
    $(".eq").innerHTML = tg.getAttribute("aria-pressed") === "true" ? `찍은 점들이 놓인 그래프: ${F.eq}` : "점을 여러 개 찍은 뒤, 점들이 어떤 그래프 위에 놓이는지 짐작해 보세요.";
    draw();
  }

  const stamp = (a) => { pts.add(key(a)); };
  $(".go-stamp").addEventListener("click", () => { stamp(+sa.value); update(); });
  $(".go-all").addEventListener("click", () => { for (let x = -2; x <= 2.001; x += 0.5) stamp(x); update(); });
  $(".go-clear").addEventListener("click", () => { pts.clear(); update(); });
  tg.addEventListener("click", () => { tg.setAttribute("aria-pressed", String(tg.getAttribute("aria-pressed") !== "true")); update(); });
  sa.addEventListener("input", update);
  K.chips(root, ".ex .chip", (bt) => { k = bt.dataset.k; pts.clear(); update(); });
  const drag = (e) => {
    if (!gT) return;
    const r = cv.getBoundingClientRect(), a = clamp(key(gT.ix(e.clientX - r.left)), -2, 2);
    sa.value = a; stamp(a); update();
  };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  update();
})();
