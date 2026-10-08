/* 카드: xⁿ을 적분하면 왜 n + 1로 나눌까? — 후보 함수를 미분해 피적분함수와 견주기 */
(() => {
  const root = document.getElementById("card-calc1-power-int");
  if (!root) return;
  const { C, fit } = NM, K = NMCalc, I = NMInt;
  const $ = (s) => root.querySelector(s);
  const sN = $(".n"), sX = $(".x");
  let mode = "raw";
  const { ctx, size } = fit($("canvas"), () => draw());
  const mono = (k, c = 1) => { const p = Array(k + 1).fill(0); p[k] = c; return p; };
  const cand = () => { const n = +sN.value; return mono(n + 1, mode === "div" ? 1 / (n + 1) : 1); };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const g = K.frame(ctx, w, h, { xr: [-2, 2], yr: [-4, 4] });
    const n = +sN.value, f = mono(n), F = cand(), dF = I.der(F), x = +sX.value;
    K.curve(ctx, g, (t) => I.at(F, t), C.forest, { width: 2.2 });
    K.curve(ctx, g, (t) => I.at(f, t), K.BLUE, { width: 2.6 });
    K.curve(ctx, g, (t) => I.at(dF, t), C.warn, { width: 2, dash: [6, 4] });
    const y = I.at(F, x), m = I.at(dF, x), sx = g.X(1) - g.X(0), sy = g.Y(0) - g.Y(1), r = 26 / Math.hypot(sx, m * sy);
    ctx.save(); ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(g.X(x) - sx * r, g.Y(y) + m * sy * r); ctx.lineTo(g.X(x) + sx * r, g.Y(y) - m * sy * r); ctx.stroke(); ctx.restore();
    K.dot(ctx, g, x, y, C.forest); K.dot(ctx, g, x, I.at(f, x), K.BLUE); K.dot(ctx, g, x, m, C.warn, true);
  }

  function update() {
    const n = +sN.value, x = +sX.value, F = cand(), fx = I.at(mono(n), x), m = I.at(I.der(F), x);
    $(".n-out").textContent = n; $(".x-out").textContent = K.n(x, 2);
    $(".f-lab").innerHTML = `<i>f</i>(<i>x</i>) = ${I.fmt(mono(n))}`;
    $(".n-F").innerHTML = I.fmt(F); $(".n-d").innerHTML = I.fmt(I.der(F));
    const ok = $(".n-r"); const r = Math.abs(fx) < 1e-9 ? null : m / fx;
    ok.textContent = r === null ? "— (f(x) = 0)" : `${K.n(r, 3)}배`; ok.className = `n-r ${r !== null && Math.abs(r - 1) < 1e-9 ? "good" : ""}`;
    draw();
  }
  K.chips(root, ".presets .chip", (b) => { mode = b.dataset.g; update(); });
  [sN, sX].forEach((s) => s.addEventListener("input", update));
  update();
})();
