/* 카드: 곱의 미분은 왜 f′g + fg′일까? — 가로 f(x), 세로 g(x)인 직사각형이 x + h로 커질 때 늘어난 넓이 = fΔg + gΔf + ΔfΔg */
(() => {
  const root = document.getElementById("card-calc1-product-rule");
  if (!root) return;
  const { C, F, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sx = $(".sx"), st = $(".st");
  const FN = {
    a: { f: (x) => x, df: () => 1, g: (x) => x * x, dg: (x) => 2 * x },
    b: { f: (x) => x + 1, df: () => 1, g: (x) => x * x + 1, dg: (x) => 2 * x },
    c: { f: (x) => 2 * x, df: () => 2, g: (x) => x + 1, dg: () => 1 },
  };
  let k = "a";
  const { ctx, size } = fit($("canvas"), () => draw());
  const state = () => {
    const P = FN[k], x = +sx.value, h = Math.pow(10, -st.value);
    const f = P.f(x), g = P.g(x), Df = P.f(x + h) - f, Dg = P.g(x + h) - g;
    return { x, h, f, g, Df, Dg, df: P.df(x), dg: P.dg(x) };
  };

  function rect(x, y, w, h, fill, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); ctx.restore();
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
  }
  function label(t, x, y, color, align = "center") {
    ctx.font = `600 12px ${F.sans}`; ctx.textAlign = align; ctx.textBaseline = "middle"; ctx.fillStyle = color; ctx.fillText(t, x, y);
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = state(), L = 34, B = 26, T = 22, R = 46;
    const sxs = (w - L - R) / (s.f + s.Df), sys = (h - T - B) / (s.g + s.Dg);
    const x0 = L, y0 = h - B, W = s.f * sxs, H = s.g * sys, dW = s.Df * sxs, dH = s.Dg * sys;
    rect(x0, y0 - H, W, H, C.sprout, 0.55);            // f·g
    rect(x0 + W, y0 - H, dW, H, K.BLUE, 0.35);         // Δf·g
    rect(x0, y0 - H - dH, W, dH, C.leaf, 0.45);        // f·Δg
    rect(x0 + W, y0 - H - dH, dW, dH, C.warn, 0.6);    // Δf·Δg
    label("f(x)·g(x)", x0 + W / 2, y0 - H / 2, C.ink);
    label(`f(x) = ${n(s.f, 2)}`, x0 + W / 2, y0 + 13, C.ink2);
    if (dW > 14) label("Δf", x0 + W + dW / 2, y0 + 13, K.BLUE);
    ctx.save(); ctx.translate(x0 - 14, y0 - H / 2); ctx.rotate(-Math.PI / 2); label(`g(x) = ${n(s.g, 2)}`, 0, 0, C.ink2); ctx.restore();
    if (dH > 12) label("Δg", x0 - 14, y0 - H - dH / 2, C.forest);
    if (dW > 26 && H > 30) label("gΔf", x0 + W + dW / 2, y0 - H / 2, K.BLUE);
    if (dH > 14) label("fΔg", x0 + W / 2, y0 - H - dH / 2, C.forest);
    if (dW < 26 || dH < 14) label("ΔfΔg", x0 + W + dW + 4, y0 - H - dH - 10 < 8 ? 10 : y0 - H - dH - 4, C.warn, "left");
  }

  function update() {
    const s = state(), p = (v) => (v < 0 ? `(${n(v, 4)})` : n(v, 4));
    $(".x-out").textContent = n(s.x, 1); $(".h-out").textContent = n(s.h, 4);
    $(".n-avg").textContent = n((s.Df * s.g + s.f * s.Dg + s.Df * s.Dg) / s.h, 4);
    $(".n-sq").textContent = n(s.Df * s.Dg / s.h, 4);
    $(".n-rule").textContent = `${p(s.df)} × ${p(s.g)} + ${p(s.f)} × ${p(s.dg)} = ${n(s.df * s.g + s.f * s.dg, 4)}`;
    $(".n-bad").textContent = n(s.df * s.dg, 4);
    draw();
  }

  K.chips(root, ".ex .chip", (bt) => { k = bt.dataset.k; update(); });
  [sx, st].forEach((el) => el.addEventListener("input", update));
  update();
})();
