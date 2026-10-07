/* 카드: 해양 암석권의 냉각과 침강 — 반무한 냉각 모형, Parsons & Sclater(1977) 경험식, 해령 밀기 */
(() => {
  const root = document.getElementById("card-adearth-cooling");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sU = $(".u"), sT = $(".t");
  const TM = 1350, KAP = 1e-6, AL = 3e-5, RM = 3300, RW = 1000, KC = 3.3, MYR = 3.156e13, g = 9.8;
  let axis = "dist";
  /* 오차 함수(Abramowitz–Stegun 7.1.26) */
  const erf = (x) => { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x); const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; };
  const theory = (t) => 2500 + 2 * RM * AL * TM / (RM - RW) * Math.sqrt(KAP * t * MYR / Math.PI);
  const empir = (t) => (t <= 70 ? 2500 + 350 * Math.sqrt(t) : 6400 - 3200 * Math.exp(-t / 62.8));
  const temp = (zkm, t) => (t <= 0 ? TM : TM * erf(zkm * 1000 / (2 * Math.sqrt(KAP * t * MYR))));
  const lith = (t) => { let a = 0, b = 400; for (let i = 0; i < 50; i++) { const m = (a + b) / 2; if (temp(m, t) < 1200) a = m; else b = m; } return a; };
  const etaOf = (Tc) => { let a = 0, b = 4; for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (erf(m) < Tc / TM) a = m; else b = m; } return a; };
  const XMAX = 5000, SMAX = Math.sqrt(180);
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const u = +sU.value, tSel = +sT.value, x0 = 48, x1 = w - 12;
    const ty0 = 24, ty1 = h * 0.46, by0 = ty1 + 34, by1 = h - 24;
    /* 가로 좌표 → 나이(백만 년) */
    const ageAt = (px) => {
      const f = (px - x0) / (x1 - x0);
      if (axis === "dist") { const xk = (f * 2 - 1) * XMAX; return Math.abs(xk) / (u * 10); }
      const s = f * SMAX; return s * s;
    };
    const pxOfAge = (t, side) => (axis === "dist" ? x0 + ((side * t * u * 10) / XMAX + 1) / 2 * (x1 - x0) : x0 + Math.sqrt(t) / SMAX * (x1 - x0));
    /* 위: 수심 */
    const D0 = 2000, D1 = 7000, Y = (d) => ty0 + (d - D0) / (D1 - D0) * (ty1 - ty0);
    ctx.fillStyle = "rgba(63,111,163,.10)"; ctx.fillRect(x0, ty0, x1 - x0, ty1 - ty0);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    for (let d = 2000; d <= 7000; d += 1000) { const y = Math.round(Y(d)) + 0.5; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.fillText(String(d / 1000), x0 - 5, y + 3); }
    ctx.textAlign = "left"; ctx.fillText("수심 (km)", x0, ty0 - 8);
    const path = (fn, col, wd, dash) => {
      ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.setLineDash(dash || []); ctx.beginPath(); let on = false;
      for (let px = x0; px <= x1; px += 1) { const t = ageAt(px); if (t > 180) { on = false; continue; } const y = Y(fn(t)); if (on) ctx.lineTo(px, y); else { ctx.moveTo(px, y); on = true; } }
      ctx.stroke(); ctx.setLineDash([]);
    };
    /* 해저 단면 칠하기 */
    ctx.fillStyle = "#6b5a4a"; ctx.beginPath(); ctx.moveTo(x0, ty1);
    for (let px = x0; px <= x1; px += 1) { const t = Math.min(ageAt(px), 180); ctx.lineTo(px, Y(Math.min(theory(t), D1))); }
    ctx.lineTo(x1, ty1); ctx.closePath(); ctx.globalAlpha = 0.25; ctx.fill(); ctx.globalAlpha = 1;
    path(theory, C.ink, 2); path(empir, C.apple, 1.6, [5, 3]);
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right"; ctx.fillStyle = C.ink; ctx.fillText("— 반무한 냉각 모형", x1 - 4, ty0 + 12);
    ctx.fillStyle = C.apple; ctx.fillText("- - 관측 경험식", x1 - 4, ty0 + 26);
    /* 아래: 온도 단면 */
    const ZM = 150, Z = (z) => by0 + z / ZM * (by1 - by0), nx = 160, nz = 50, cw = (x1 - x0) / nx, ch = (by1 - by0) / nz;
    for (let i = 0; i < nx; i++) {
      const t = ageAt(x0 + (i + 0.5) * cw);
      for (let j = 0; j < nz; j++) {
        const T = t > 180 ? NaN : temp((j + 0.5) / nz * ZM, t), f = isNaN(T) ? 0 : T / TM;
        if (isNaN(T)) ctx.fillStyle = "#e6e6e0";
        else ctx.fillStyle = `rgb(${Math.round(60 + 190 * f)},${Math.round(110 + 40 * Math.sin(f * Math.PI))},${Math.round(200 - 170 * f)})`;
        ctx.fillRect(x0 + i * cw, by0 + j * ch, cw + 0.6, ch + 0.6);
      }
    }
    ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 1;
    [400, 800, 1200].forEach((Tc) => {
      ctx.beginPath(); let on = false;
      for (let px = x0; px <= x1; px += 2) {
        const t = ageAt(px); if (t > 180 || t < 0.05) { on = false; continue; }
        const eta = etaOf(Tc);
        const z = 2 * eta * Math.sqrt(KAP * t * MYR) / 1000; if (z > ZM) { on = false; continue; }
        if (on) ctx.lineTo(px, Z(z)); else { ctx.moveTo(px, Z(z)); on = true; }
      }
      ctx.stroke();
    });
    ctx.fillStyle = "#fff"; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left";
    [400, 800, 1200].forEach((Tc, i) => { const t = axis === "dist" ? Math.min(180, XMAX * 0.92 / (u * 10)) : 170; const eta = etaOf(Tc); const z = 2 * eta * Math.sqrt(KAP * t * MYR) / 1000; if (z < ZM - 5) ctx.fillText(`${Tc} °C`, pxOfAge(t, 1) - 44, Z(z) - 3); });
    ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    for (let z = 0; z <= ZM; z += 50) ctx.fillText(String(z), x0 - 5, Z(z) + 3);
    ctx.textAlign = "left"; ctx.fillText("깊이 (km)", x0, by0 - 6);
    /* 가로 눈금 */
    ctx.textAlign = "center";
    if (axis === "dist") { for (let xk = -4000; xk <= 4000; xk += 2000) { const px = x0 + (xk / XMAX + 1) / 2 * (x1 - x0); ctx.fillText(String(xk), px, by1 + 14); ctx.fillText(String(xk), px, ty1 + 13); } ctx.textAlign = "right"; ctx.fillText("해령에서의 거리 (km)", x1, ty1 + 26); }
    else { for (let s = 0; s <= 13; s += 2) { const px = x0 + s / SMAX * (x1 - x0); ctx.fillText(String(s), px, by1 + 14); ctx.fillText(String(s), px, ty1 + 13); } ctx.textAlign = "right"; ctx.fillText("√(나이 / 백만 년)", x1, ty1 + 26); }
    /* 선택한 나이 표시 */
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]);
    (axis === "dist" ? [1, -1] : [1]).forEach((sd) => { const px = pxOfAge(tSel, sd); if (px < x0 || px > x1) return; ctx.beginPath(); ctx.moveTo(px, ty0); ctx.lineTo(px, by1); ctx.stroke(); });
    ctx.setLineDash([]);
    const pxs = pxOfAge(tSel, 1);
    if (pxs <= x1) { ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(pxs, Y(theory(tSel)), 4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(pxs, Z(Math.min(lith(tSel), ZM)), 3.5, 0, Math.PI * 2); ctx.fill(); }
  }
  function update() {
    const u = +sU.value, t = +sT.value;
    root.querySelectorAll("[data-x]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.x === axis)));
    $(".u-out").textContent = u.toFixed(1); $(".t-out").textContent = String(t);
    $(".n-d").textContent = `${(theory(t) / 1000).toFixed(2)} km (${(empir(t) / 1000).toFixed(2)})`;
    const L = lith(t); $(".n-l").textContent = `${L.toFixed(0)} km`;
    const q = KC * TM / Math.sqrt(Math.PI * KAP * t * MYR) * 1000; $(".n-q").textContent = `${q.toFixed(0)} mW/m²`;
    $(".n-x").textContent = `${(u * 10 * t).toFixed(0)} km`;
    const frp = g * RM * AL * TM * KAP * t * MYR * (1 + 2 * RM * AL * TM / (Math.PI * (RM - RW)));
    $(".n-f").textContent = `${(frp / 1e12).toFixed(1)} × 10¹² N/m`;
    const fsp = RM * AL * TM / 2 * g * 6e5 * L * 1000; $(".n-s").textContent = `${(fsp / 1e13).toFixed(1)} × 10¹³ N/m`;
    draw();
  }
  root.querySelectorAll("[data-x]").forEach((b) => b.addEventListener("click", () => { axis = b.dataset.x; update(); }));
  [sU, sT].forEach((el) => el.addEventListener("input", update));
  update();
})();
