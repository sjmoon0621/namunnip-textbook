/* 카드: 풀 수 없는 방정식의 근은 몇 개일까? — ln x = kx ⇔ (ln x)/x = k, 가로선과 교점 세기 */
(() => {
  const root = document.getElementById("card-calc2-root-count");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sk = $(".sk"), IE = 1 / Math.E, LN = Math.log;
  let k = 0.2;
  const { ctx, size } = fit($("canvas"), () => draw());
  const gq = (x) => (x > 0 ? LN(x) / x : NaN);
  /* g(x) = ln x / x는 (0, e)에서 증가, (e, ∞)에서 감소. 구간마다 이분법 */
  function bisect(lo, hi) {
    const s = Math.sign(gq(lo) - k);
    for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (Math.sign(gq(m) - k) === s) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  function roots() {
    if (Math.abs(k - IE) < 1e-12) return [Math.E];
    if (k > IE) return [];
    const r = [bisect(1e-12, Math.E)];
    if (k > 0) r.push(bisect(Math.E, 1e9));
    return r;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const hb = Math.round(h * 0.42), rs = roots();
    const g = K.frame(ctx, w, h, { xr: [0, 10], yr: [-2.5, 3], xs: 1, ys: 1, T: 10, B: hb + 14 });
    K.curve(ctx, g, (x) => (x > 0 ? LN(x) : NaN), C.forest, { from: 0.001 });
    K.curve(ctx, g, (x) => k * x, C.warn, { width: 1.8 });
    rs.filter((x) => x <= 10).forEach((x) => K.dot(ctx, g, x, LN(x), C.ink, false, 4.5));
    K.tag(ctx, g, "y = ln x", g.X(3.5), g.Y(LN(3.5)) - 16, C.forest, "right");
    K.tag(ctx, g, `y = ${k === 0 ? "0" : n(k, 3) + "x"}`, g.x0 + g.w - 4, NM.clamp(g.Y(k * 9.6), g.y0 + 9, g.y0 + g.h - 9) + 14, C.warn, "right");

    const g2 = K.frame(ctx, w, h, { xr: [0, 10], yr: [-1, 0.6], xs: 1, ys: 0.5, T: h - hb + 10, B: 22 });
    K.curve(ctx, g2, gq, K.BLUE, { from: 0.001, N: 800 });
    ctx.save(); ctx.strokeStyle = C.warn; ctx.lineWidth = 1.8; ctx.beginPath();
    ctx.moveTo(g2.x0, g2.Y(k)); ctx.lineTo(g2.x0 + g2.w, g2.Y(k)); ctx.stroke(); ctx.restore();
    rs.filter((x) => x <= 10).forEach((x) => { K.dot(ctx, g2, x, k, C.ink, false, 4.5); K.guide(ctx, g2, x, k, C.ink3, "x"); });
    K.tag(ctx, g2, "y = (ln x)/x", g2.X(6.5), g2.Y(gq(6.5)) - 14, K.BLUE);
    K.tag(ctx, g2, `y = ${n(k, 3)}`, g2.x0 + 4, g2.Y(k) - 12, C.warn);
  }

  function update() {
    $(".k-out").textContent = n(k, 4);
    $(".n-k").textContent = n(k, 4);
    const rs = roots(), c = $(".n-c");
    c.textContent = String(rs.length); c.className = `n-c ${rs.length ? "good" : "bad"}`;
    $(".eq").innerHTML = rs.length
      ? rs.map((x) => `<i>x</i> ≈ ${n(x, 4)}${x > 10 ? " (그림 밖)" : ""}`).join(", ") + (Math.abs(k - IE) < 1e-12 ? " — 직선이 곡선에 접합니다." : "")
      : `<i>k</i> &gt; 1/<i>e</i>: 가로선이 (ln <i>x</i>)/<i>x</i>의 최댓값보다 높아 교점이 없습니다.`;
    draw();
  }

  K.chips(root, ".presets .chip", (b) => { k = b.dataset.k === "e" ? IE : +b.dataset.k; sk.value = k; update(); });
  sk.addEventListener("input", () => { k = +sk.value; root.querySelectorAll(".presets .chip").forEach((b) => b.setAttribute("aria-pressed", "false")); update(); });
  update();
})();
