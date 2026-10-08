/* 카드: eˣ ≥ kx가 모든 x에서 성립하려면 k는 얼마까지 될까? — h(x) = eˣ − kx의 최솟값 k(1 − ln k) ≥ 0 */
(() => {
  const root = document.getElementById("card-calc2-exp-bound");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sk = $(".sk"), E = Math.exp, XR = [-3, 3];
  let k = 1;
  const { ctx, size } = fit($("canvas"), () => draw());
  const hf = (x) => E(x) - k * x;
  const ok = () => k >= 0 && k <= Math.E + 1e-12;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const hb = Math.round(h * 0.42);
    const g = K.frame(ctx, w, h, { xr: XR, yr: [-4, 8], xs: 1, ys: 2, T: 10, B: hb + 14 });
    K.curve(ctx, g, E, C.forest);
    K.curve(ctx, g, (x) => k * x, C.warn, { width: 1.8 });
    K.tag(ctx, g, "y = eˣ", g.X(1.9), g.Y(E(1.9)), C.forest, "right");
    K.tag(ctx, g, `y = ${k === 0 ? "0" : k === 1 ? "x" : n(k, 3) + "x"}`, g.x0 + g.w - 4, g.Y(NM.clamp(k * 2.8, -3.5, 7.5)) + 14, C.warn, "right");

    const g2 = K.frame(ctx, w, h, { xr: XR, yr: [-2.5, 5], xs: 1, ys: 2, T: h - hb + 10, B: 22 });
    ctx.save(); ctx.beginPath(); ctx.rect(g2.x0, g2.y0, g2.w, g2.Y(0) - g2.y0); ctx.clip();
    ctx.globalAlpha = 0.18; ctx.fillStyle = C.sprout; ctx.fillRect(g2.x0, g2.y0, g2.w, g2.h); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(g2.x0, g2.Y(0), g2.w, g2.y0 + g2.h - g2.Y(0)); ctx.clip();
    ctx.globalAlpha = 0.18; ctx.fillStyle = C.amber; ctx.fillRect(g2.x0, g2.y0, g2.w, g2.h); ctx.restore();
    K.curve(ctx, g2, hf, K.BLUE);
    K.tag(ctx, g2, "h(x) = eˣ − kx", g2.x0 + 4, g2.y0 + 10, K.BLUE);
    if (k > 0) { const x = Math.log(k); if (x >= XR[0] && x <= XR[1]) K.dot(ctx, g2, x, hf(x), C.warn, false, 5); }
  }

  function update() {
    $(".k-out").textContent = n(k, 4);
    const m = $(".n-m"), xo = $(".n-x"), o = $(".n-ok");
    if (k > 0) {
      const x = Math.log(k), v = k * (1 - x);
      m.textContent = n(v, 4); m.className = `n-m ${v < -1e-12 ? "bad" : "good"}`;
      xo.textContent = `ln k = ${n(x, 4)}`;
      $(".eq").innerHTML = `<i>h</i>′(<i>x</i>) = <i>e</i><sup><i>x</i></sup> − ${n(k, 3)} = 0 → <i>x</i> = ln ${n(k, 3)}, 최솟값 ${n(k, 3)}(1 − ln ${n(k, 3)}) = ${n(v, 4)}${Math.abs(k - Math.E) < 1e-9 ? " — 직선이 곡선에 접합니다." : ""}`;
    } else {
      m.textContent = k === 0 ? "없음 (0에 다가감)" : "없음 (−∞로 감)"; m.className = `n-m ${k < 0 ? "bad" : ""}`;
      xo.textContent = "—";
      $(".eq").innerHTML = k === 0
        ? "<i>h</i>(<i>x</i>) = <i>e</i><sup><i>x</i></sup> &gt; 0. 최솟값은 없지만 늘 양수입니다."
        : `<i>h</i>′(<i>x</i>) = <i>e</i><sup><i>x</i></sup> + ${n(-k, 3)} &gt; 0이라 극값이 없고, <i>x</i> → −∞이면 <i>h</i>(<i>x</i>) → −∞입니다.`;
    }
    o.textContent = ok() ? "예" : "아니요"; o.className = `n-ok ${ok() ? "good" : "bad"}`;
    draw();
  }

  K.chips(root, ".presets .chip", (b) => { k = b.dataset.k === "e" ? Math.E : +b.dataset.k; sk.value = k; update(); });
  sk.addEventListener("input", () => { k = +sk.value; root.querySelectorAll(".presets .chip").forEach((b) => b.setAttribute("aria-pressed", "false")); update(); });
  update();
})();
