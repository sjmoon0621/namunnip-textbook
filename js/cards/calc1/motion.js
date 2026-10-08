/* 카드: 점은 언제 방향을 바꿀까? — x(t) = t³ − 6t² + 9t, 수직선 위의 점과 x–t 그래프의 접선 */
(() => {
  const root = document.getElementById("card-calc1-motion");
  if (!root) return;
  const { C, F, fit, loop, reduce } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const st = $(".st"), play = $(".go-play"), cv = $("canvas");
  const x = (t) => t ** 3 - 6 * t * t + 9 * t, v = (t) => 3 * t * t - 12 * t + 9, a = (t) => 6 * t - 12;
  const { ctx, size } = fit(cv, () => draw());
  let on = false;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const t = +st.value, top = 62, L = 34, Rr = 12;
    const XL = (p) => L + (p + 2) / 24 * (w - L - Rr);
    ctx.save();
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(L, 34); ctx.lineTo(w - Rr, 34); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let p = 0; p <= 20; p += 4) { ctx.beginPath(); ctx.moveTo(XL(p), 30); ctx.lineTo(XL(p), 38); ctx.stroke(); ctx.fillText(String(p), XL(p), 52); }
    ctx.strokeStyle = C.sprout; ctx.lineWidth = 3; ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const s = t * i / 120, yy = 22 - s * 2.4; i ? ctx.lineTo(XL(x(s)), yy) : ctx.moveTo(XL(x(s)), yy); }
    ctx.stroke();
    const vv = v(t), col = Math.abs(vv) < 0.05 ? C.ink : vv > 0 ? C.forest : C.warn;
    if (Math.abs(vv) >= 0.05) {
      const len = Math.max(-60, Math.min(60, vv * 4)), x0 = XL(x(t));
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x0, 34); ctx.lineTo(x0 + len, 34); ctx.stroke();
      const s = Math.sign(len); ctx.beginPath(); ctx.moveTo(x0 + len, 34); ctx.lineTo(x0 + len - 7 * s, 29); ctx.lineTo(x0 + len - 7 * s, 39); ctx.fill();
    }
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(XL(x(t)), 34, 6, 0, 7); ctx.fill();
    ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("P", XL(x(t)) + 8, 20);
    ctx.restore();
    ctx.save(); ctx.translate(0, top);
    const g = K.frame(ctx, w, h - top, { xr: [0, 5], yr: [-2, 22], xs: 1, ys: 4, T: 8, B: 22 });
    for (const z of [1, 3]) { K.guide(ctx, g, z, x(z), C.ink3, "x"); }
    K.curve(ctx, g, x, C.ink3, { width: 1.6 });
    K.curve(ctx, g, x, C.ink, { to: t, width: 2.6 });
    K.curve(ctx, g, (s) => x(t) + vv * (s - t), col, { from: t - 0.6, to: t + 0.6, width: 2 });
    K.dot(ctx, g, t, x(t), col);
    K.tag(ctx, g, "x(t)", g.x0 + g.w - 4, g.Y(20), C.ink2, "right");
    ctx.restore();
  }

  function update() {
    const t = +st.value;
    $(".t-out").textContent = n(t, 2);
    $(".n-x").textContent = n(x(t), 2);
    const vd = $(".n-v"), vv = v(t);
    vd.textContent = n(vv, 2); vd.className = `n-v ${Math.abs(vv) < 0.05 ? "" : vv > 0 ? "good" : "bad"}`;
    $(".n-a").textContent = n(a(t), 2);
    draw();
  }

  loop(cv, (dt) => {
    if (!on) return false;
    let t = +st.value + dt * 0.6;
    if (t >= 5) { t = 5; on = false; play.setAttribute("aria-pressed", "false"); play.textContent = "재생"; }
    st.value = t; update();
  });
  play.addEventListener("click", () => {
    if (reduce) { st.value = 5; update(); return; }
    on = !on;
    if (on && +st.value >= 5) st.value = 0;
    play.setAttribute("aria-pressed", String(on)); play.textContent = on ? "멈춤" : "재생";
  });
  st.addEventListener("input", () => { on = false; play.setAttribute("aria-pressed", "false"); play.textContent = "재생"; update(); });
  update();
})();
