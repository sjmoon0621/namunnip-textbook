/* 카드: 곡선 아래 넓이를 직사각형으로 잴 수 있을까? — 직사각형 개수와 높이 잡는 곳을 바꾸며 넓이에 다가가기 */
(() => {
  const root = document.getElementById("card-calc1-riemann");
  if (!root) return;
  const { C, fit } = NM, K = NMCalc, I = NMInt;
  const $ = (s) => root.querySelector(s);
  const sN = $(".n");
  let ex = { p: [0, 0, 1], a: 0, b: 2, top: 4.5 }, mode = "right";
  const { ctx, size } = fit($("canvas"), () => draw());
  const sample = (x, d) => (mode === "left" ? x : mode === "right" ? x + d : x + d / 2);
  const sum = () => { const n = +sN.value, d = (ex.b - ex.a) / n; let s = 0; for (let i = 0; i < n; i++) s += I.at(ex.p, sample(ex.a + i * d, d)) * d; return s; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const g = K.frame(ctx, w, h, { xr: [ex.a - 0.25, ex.b + 0.25], yr: [0, ex.top], xs: 0.5 });
    const n = +sN.value, d = (ex.b - ex.a) / n;
    I.fill(ctx, g, (x) => I.at(ex.p, x), ex.a, ex.b, { split: false, alpha: .12 });
    ctx.save(); ctx.strokeStyle = K.BLUE; ctx.lineWidth = n > 30 ? .6 : 1;
    for (let i = 0; i < n; i++) {
      const x = ex.a + i * d, y = I.at(ex.p, sample(x, d)), px = g.X(x), pw = g.X(x + d) - px, py = g.Y(y);
      ctx.fillStyle = "rgba(63,111,163,.28)"; ctx.fillRect(px, py, pw, g.Y(0) - py); ctx.strokeRect(px, py, pw, g.Y(0) - py);
    }
    ctx.restore();
    K.curve(ctx, g, (x) => I.at(ex.p, x), C.forest, { width: 2.6 });
  }

  function update() {
    const n = +sN.value, s = sum(), A = I.def(ex.p, ex.a, ex.b);
    $(".n-out").textContent = n;
    $(".n-s").textContent = K.n(s, 4); $(".n-a").textContent = I.val(A);
    const e = $(".n-e"); e.textContent = `${s - A >= 0 ? "+" : K.M}${K.n(Math.abs(s - A), 4)}`; e.className = `n-e ${Math.abs(s - A) < 0.01 ? "good" : ""}`;
    draw();
  }
  K.chips(root, ".fx .chip", (b) => { const [p, a, bb, top] = JSON.parse(b.dataset.ex); ex = { p, a, b: bb, top }; update(); });
  K.chips(root, ".mode .chip", (b) => { mode = b.dataset.m; update(); });
  sN.addEventListener("input", update);
  update();
})();
