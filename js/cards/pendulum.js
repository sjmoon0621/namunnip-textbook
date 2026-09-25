/* 카드: 진자 공식은 언제 틀릴까? — 실제 진자(RK4) vs 작은 각 근사 */
(() => {
  const root = document.getElementById("card-pendulum");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const [cv, pv] = root.querySelectorAll("canvas");
  const amp = $(".amp"), ampOut = $(".amp-out");
  const t0El = $(".t0"), texEl = $(".tex"), errEl = $(".terr");

  const g = 9.81, L = 1.0, w0 = Math.sqrt(g / L), T0 = 2 * Math.PI / w0;
  const agm = (a, b) => { for (let i = 0; i < 20; i++) [a, b] = [(a + b) / 2, Math.sqrt(a * b)]; return a; };
  const Tex = (th0) => T0 / agm(1, Math.cos(th0 / 2)); // 완전 타원적분으로 구한 정확한 주기
  const errPct = (deg) => (Tex(deg * Math.PI / 180) / T0 - 1) * 100;

  let th0, th, om, t;
  function reset() {
    th0 = +amp.value * Math.PI / 180; th = th0; om = 0; t = 0;
    ampOut.textContent = amp.value;
    const te = Tex(th0), e = (te / T0 - 1) * 100;
    t0El.textContent = `${T0.toFixed(3)} s`;
    texEl.textContent = `${te.toFixed(3)} s`;
    errEl.textContent = `+${e < 10 ? e.toFixed(2) : e.toFixed(1)}%`;
    errEl.classList.toggle("bad", e >= 1);
    drawPlot(); drawPend();
  }

  function step(dt) { // θ'' = -(g/L) sin θ, RK4
    const f = (a) => -w0 * w0 * Math.sin(a);
    const k1t = om, k1o = f(th);
    const k2t = om + k1o * dt / 2, k2o = f(th + k1t * dt / 2);
    const k3t = om + k2o * dt / 2, k3o = f(th + k2t * dt / 2);
    const k4t = om + k3o * dt, k4o = f(th + k3t * dt);
    th += dt / 6 * (k1t + 2 * k2t + 2 * k3t + k4t);
    om += dt / 6 * (k1o + 2 * k2o + 2 * k3o + k4o);
    t += dt;
  }

  const P = fit(cv, () => drawPend());
  const Q = fit(pv, () => drawPlot());

  function drawPend() {
    const { ctx, size: { w, h } } = P;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const px = w / 2, py = h * 0.44, len = Math.min(w, h) * 0.38;
    const thLin = th0 * Math.cos(w0 * t);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
    ctx.beginPath(); ctx.arc(px, py, len, Math.PI / 2 - th0, Math.PI / 2 + th0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + len + 10); ctx.stroke();
    ctx.setLineDash([]);
    const bob = (a, ghost) => {
      const x = px + len * Math.sin(a), y = py + len * Math.cos(a);
      ctx.strokeStyle = ghost ? C.forest : C.ink; ctx.lineWidth = ghost ? 1.5 : 2;
      ctx.setLineDash(ghost ? [4, 4] : []);
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
      ctx.setLineDash(ghost ? [3, 3] : []);
      ctx.beginPath(); ctx.arc(x, y, ghost ? 10 : 11, 0, Math.PI * 2);
      if (ghost) ctx.stroke(); else { ctx.fillStyle = C.ink; ctx.fill(); }
      ctx.setLineDash([]);
    };
    bob(thLin, true); bob(th, false);
    ctx.fillStyle = C.ink; ctx.fillRect(px - 16, py - 3, 32, 3);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText(`t = ${t.toFixed(1)} s`, 8, 14);
    ctx.fillText("L = 1 m", 8, 28);
  }

  function drawPlot() {
    const { ctx, size: { w, h } } = Q;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const padL = 34, padB = 22, padT = 22, padR = 8;
    const pw = w - padL - padR, ph = h - padT - padB, ymax = 100;
    const X = (d) => padL + d / 170 * pw, Y = (e) => padT + (1 - Math.min(e, ymax) / ymax) * ph;
    NM.axes(ctx, { x0: padL, y0: padT, w: pw, h: ph, X, Y,
      xt: [[0, "0°"], [45, "45°"], [90, "90°"], [135, "135°"]],
      yt: [[0, "0%"], [25, "25%"], [50, "50%"], [75, "75%"], [100, "100%"]], ylabel: "주기 오차" });
    let d1 = 0;
    ctx.beginPath();
    for (let d = 0.5; d <= 170; d += 0.5) { const e = errPct(d); if (e < 1) d1 = d; d === 0.5 ? ctx.moveTo(X(d), Y(e)) : ctx.lineTo(X(d), Y(e)); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = "rgba(116,171,102,.16)"; ctx.fillRect(padL, padT, X(d1) - padL, ph);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.forest;
    ctx.fillText(`← ${Math.round(d1)}°까지 1% 미만`, X(d1) + 5, padT + 14);
    const d = +amp.value, e = errPct(d);
    ctx.beginPath(); ctx.arc(X(d), Y(e), 5, 0, Math.PI * 2);
    ctx.fillStyle = e >= 1 ? C.warn : C.forest; ctx.fill();
  }

  amp.addEventListener("input", reset);
  root.querySelectorAll("[data-amp]").forEach((b) => b.addEventListener("click", () => { amp.value = b.dataset.amp; reset(); }));
  reset();
  loop(cv, (dt) => { for (let i = 0; i < 8; i++) step(dt / 8); drawPend(); });
})();
