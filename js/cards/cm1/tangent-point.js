/* 카드: 한 점에서 포물선에 그을 수 있는 접선은 몇 개일까? — P(s, t)를 지나는 직선의 판별식 m² − 4sm + 4t와 접선의 기울기 */
(() => {
  const root = document.getElementById("card-cm1-tangent-point");
  if (!root) return;
  const { C, fit } = NM;
  const E = NMEqPlot;
  const $ = (s) => root.querySelector(s);
  const sm = $(".m"), cv = $("canvas");
  let s = 0, t = -1, fr = null;
  const { ctx, size } = fit(cv, () => draw());
  const ex = (v) => (Math.abs(v - E.r3(v)) < 1e-9 ? "" : "≈ ") + E.n(v);
  const par = (v) => (v < 0 ? `(${E.n(v)})` : E.n(v));
  const tangents = () => { const r = E.roots(1, -4 * s, 4 * t); return r.kind > 0 ? r.xs : r.kind === 0 ? r.xs : []; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = +sm.value, D = m * m - 4 * s * m + 4 * t;
    fr = E.frame(ctx, { x: 30, y: 8, w: w - 40, h: h - 30 }, { X0: -5, X1: 5, Y0: -4, Y1: 9 }, { xs: 1, ys: 2, xname: "x", yname: "y" });
    const { X, Y } = fr;
    E.curve(ctx, fr, (x) => x * x, C.forest, 2.5);
    tangents().forEach((k) => {
      E.curve(ctx, fr, (x) => k * (x - s) + t, C.ink3, 1.5, [5, 4]);
      const xt = k / 2; E.dot(ctx, X(xt), Y(xt * xt), C.ink3, 4.5, true);
    });
    const col = D > 1e-9 ? C.forest : Math.abs(D) < 1e-9 ? C.amber : C.warn;
    E.curve(ctx, fr, (x) => m * (x - s) + t, col, 2);
    const r = E.roots(1, -m, m * s - t);
    if (r.kind >= 0) r.xs.forEach((x) => E.dot(ctx, X(x), Y(x * x), col, 5.5));
    E.dot(ctx, X(s), Y(t), C.ink, 6.5);
    E.tag(ctx, `P(${E.n(s)}, ${E.n(t)})`, X(s) + 10, Y(t) + 12, C.ink, "left", fr.box);
    const n = tangents().length, where = t < s * s ? "포물선 아래쪽" : t === s * s ? "포물선 위의 점" : "포물선 안쪽";
    E.tag(ctx, `${where}: 접선 ${n}개`, fr.box.x + 6, fr.box.y + 12, n ? C.forest : C.warn, "left", fr.box);
  }

  function update() {
    const m = +sm.value, D = m * m - 4 * s * m + 4 * t, tg = tangents();
    $(".m-out").textContent = E.n(m);
    $(".eq").innerHTML = `<i>x</i><sup>2</sup> = ${E.n(m)}(<i>x</i> − ${par(s)}) + ${par(t)}<br>D = <i>m</i><sup>2</sup> − 4 × ${par(s)} × <i>m</i> + 4 × ${par(t)} = ${E.n(D)}`;
    const nd = $(".n-d"); nd.textContent = E.n(D); nd.className = `n-d ${D < -1e-9 ? "bad" : "good"}`;
    const nk = $(".n-k"); nk.textContent = D > 1e-9 ? "두 점에서 만남" : Math.abs(D) < 1e-9 ? "접함" : "만나지 않음"; nk.className = `n-k ${D < -1e-9 ? "bad" : "good"}`;
    $(".n-t").textContent = tg.length ? tg.map(ex).join(", ") : "없음";
    draw();
  }

  E.drag(cv, (px, py) => (fr && Math.hypot(px - fr.X(s), py - fr.Y(t)) < 18 ? "P" : null), (_, px, py) => {
    const [x, y] = fr.inv(px, py);
    s = Math.max(-3, Math.min(3, Math.round(x * 2) / 2)); t = Math.max(-3.5, Math.min(8, Math.round(y * 2) / 2));
    update();
  });
  sm.addEventListener("input", update);
  update();
})();
