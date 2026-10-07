/* 카드: 달이 해마다 3.8 cm씩 멀어지면 지구의 하루는 어떻게 될까? — 지구 자전 + 달 공전 각운동량 보존 */
(() => {
  const root = document.getElementById("card-adearth-tidal-friction");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sA = $(".sl-a");
  const G = 6.674e-11, ME = 5.972e24, MM = 7.342e22, RE = 6.371e6, I = 0.3307 * ME * RE * RE;
  const MT = ME + MM, MU = ME * MM / MT, A0 = 3.844e8, PSID0 = 86164.1, YEAR = 365.256 * 86400, RATE = 0.038 / (365.25 * 86400);
  const Lorb = (a) => MU * Math.sqrt(G * MT * a);
  const LTOT = I * 2 * Math.PI / PSID0 + Lorb(A0);
  const state = (a) => {
    const spin = LTOT - Lorb(a), om = spin / I, psid = 2 * Math.PI / om, month = 2 * Math.PI * Math.sqrt(a ** 3 / (G * MT));
    const solar = 1 / (1 / psid - 1 / YEAR);
    /* dLOD/dt for da/dt = RATE: dω = −dLorb/I, dLorb/da = Lorb/(2a) */
    const domdt = -(Lorb(a) / (2 * a)) * RATE / I, dP = -psid * domdt / om;
    return { a, om, psid, month, solar, days: YEAR / solar, share: spin / LTOT, dP, ok: om > 0 };
  };
  /* 하루(항성일) = 한 달이 되는 거리 */
  let lo = A0, hi = 6.0e8;
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2, s = state(m); if (s.om > 0 && s.psid < s.month) lo = m; else hi = m; }
  const ASYNC = lo, SSYNC = state(ASYNC);
  let rot = 0;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    const a = +sA.value * 1e6, s = state(a);
    ctx.clearRect(0, 0, w, h);
    /* 왼쪽: 지구, 팽대부, 달 (위에서 본 그림, 북극 쪽에서) */
    const lw = w * 0.42, ex = lw * 0.36, ey = h * 0.42, Rp = Math.min(lw, h) * 0.17, lag = 14 * Math.PI / 180;
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(-lag);
    ctx.fillStyle = "rgba(63,111,163,.25)"; ctx.beginPath(); ctx.ellipse(0, 0, Rp * 1.45, Rp * 1.08, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#cfe0c4"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ex, ey, Rp, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    /* 자전 표시 */
    ctx.fillStyle = C.ink; for (let i = 0; i < 3; i++) { const t = rot + i * 2 * Math.PI / 3; ctx.beginPath(); ctx.arc(ex + Rp * 0.7 * Math.cos(t), ey - Rp * 0.7 * Math.sin(t), 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(ex, ey, Rp * 0.45, 0.3, 1.9); ctx.stroke();
    const hx = ex + Rp * 0.45 * Math.cos(0.3), hy = ey + Rp * 0.45 * Math.sin(0.3);
    ctx.fillStyle = C.ink2; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 1, hy + 7); ctx.lineTo(hx + 6, hy + 2); ctx.fill();
    /* 달 */
    const mx = lw - 18, my = ey;
    ctx.fillStyle = "#b9b9bd"; ctx.beginPath(); ctx.arc(mx, my, 8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(ex + Rp, ey); ctx.lineTo(mx - 10, my); ctx.stroke();
    /* 팽대부 축 */
    const bx = ex + Rp * 1.45 * Math.cos(lag), by = ey - Rp * 1.45 * Math.sin(lag);
    ctx.strokeStyle = "#3f6fa3"; ctx.beginPath(); ctx.moveTo(ex - Rp * 1.45 * Math.cos(lag), ey + Rp * 1.45 * Math.sin(lag)); ctx.lineTo(bx, by); ctx.stroke(); ctx.setLineDash([]);
    /* 힘: 달이 팽대부를 당김 / 팽대부가 달을 당김 */
    const arr = (x0, y0, x1, y1, col) => { const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - 8 * ux - 4 * uy, y1 - 8 * uy + 4 * ux); ctx.lineTo(x1 - 8 * ux + 4 * uy, y1 - 8 * uy - 4 * ux); ctx.fill(); };
    const dx = mx - bx, dy = my - by, dl = Math.hypot(dx, dy);
    arr(bx, by, bx + dx / dl * 34, by + dy / dl * 34, C.apple);
    arr(mx, my, mx, my - 30, C.amber);
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillStyle = C.amber; ctx.fillText("달을 앞으로", mx - 16, my - 44); ctx.fillText("→ 궤도 커짐", mx - 16, my - 31 - 0);
    ctx.fillStyle = C.apple; ctx.fillText("자전을 늦추는 당김", ex + Rp * 0.9, ey + Rp * 1.45 + 20);
    ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("북극 위에서 본 모습 · 앞선 각도 과장", 6, 14);
    ctx.fillStyle = "#3f6fa3"; ctx.fillText("팽대부가 달보다 앞섬", 6, h * 0.42 + Rp * 1.45 + 44);
    /* 오른쪽: 하루와 한 달 (시간, 로그) 대 거리 */
    const gx0 = lw + 42, gx1 = w - 12, gy0 = h - 36, gy1 = 24, amin = 250, amax = 555;
    const X = (k) => gx0 + (k - amin) / (amax - amin) * (gx1 - gx0), lmin = 0.5, lmax = 3.3, Y = (hr) => gy0 - (Math.log10(hr) - lmin) / (lmax - lmin) * (gy0 - gy1);
    NM.axes(ctx, { x0: gx0, y0: gy1, w: gx1 - gx0, h: gy0 - gy1, X, Y,
      xt: [[250, "250"], [300, "300"], [384.4, "지금"], [450, "450"], [550, "550"]],
      yt: [[5, "5시간"], [24, "1일"], [240, "10일"], [1000, "42일"]], xlabel: "지구–달 거리 (천 km)" });
    const curve = (fn, col) => { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); let st = false; for (let i = 0; i <= 300; i++) { const k = amin + i / 300 * (amax - amin), v = fn(state(k * 1e6)); if (!(v > 0) || Math.log10(v) > lmax) { st = false; continue; } st ? ctx.lineTo(X(k), Y(v)) : ctx.moveTo(X(k), Y(v)); st = true; } ctx.stroke(); };
    curve((q) => q.ok ? q.solar / 3600 : NaN, C.apple);
    curve((q) => q.month / 3600, "#8d8d92");
    /* 데본기 산호 */
    const dev = 365.25 * 24 / 400;
    ctx.strokeStyle = C.forest; ctx.setLineDash([4, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, Y(dev)); ctx.lineTo(gx1, Y(dev)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.forest; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("데본기 산호: 1년 ≈ 400일", gx1 - 2, Y(dev) + 13);
    ctx.fillStyle = C.apple; ctx.textAlign = "left"; ctx.fillText("하루", X(260), Y(state(260e6).solar / 3600) - 8);
    ctx.fillStyle = "#6d6d72"; ctx.fillText("한 달", X(260), Y(state(260e6).month / 3600) - 8);
    if (ASYNC / 1e6 < amax) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(ASYNC / 1e6), Y(SSYNC.month / 3600), 4, 0, Math.PI * 2); ctx.fill(); }
    if (s.ok) { ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(X(a / 1e6), Y(s.solar / 3600), 5.5, 0, Math.PI * 2); ctx.fill(); }
  }
  function update() {
    const a = +sA.value * 1e6, s = state(a);
    $(".a-out").textContent = (+sA.value).toFixed(1);
    if (!s.ok || s.psid > s.month) {
      $(".n-day").textContent = "한 달과 같아짐"; $(".n-yr").textContent = "—";
    } else {
      const hr = s.solar / 3600;
      $(".n-day").textContent = hr < 48 ? `${hr.toFixed(2)} 시간` : `${(hr / 24).toFixed(1)} 일`;
      $(".n-yr").textContent = `${s.days.toFixed(0)} 일`;
    }
    $(".n-mon").textContent = `${(s.month / 86400).toFixed(1)} 일`;
    const dt = (a - A0) / 0.038;
    $(".n-time").textContent = Math.abs(dt) < 1e5 ? "지금" : `${(Math.abs(dt) / 1e8).toFixed(2)}억 년 ${dt < 0 ? "전" : "후"}`;
    $(".n-rate").textContent = s.ok && s.psid < s.month ? `${(s.dP * 3.15576e9 * 1000).toFixed(1)} ms/100년` : "—";
    $(".n-share").textContent = `${(Math.max(0, s.share) * 100).toFixed(1)}%`;
    root.querySelectorAll("[data-a]").forEach((b) => b.setAttribute("aria-pressed", String(Math.abs(+b.dataset.a - +sA.value) < 0.05)));
    draw();
  }
  root.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => { sA.value = b.dataset.a; update(); }));
  sA.addEventListener("input", update);
  loop(cv, (dt) => { if (NM.reduce) return false; rot += dt * 0.8; draw(); });
  update();
})();
