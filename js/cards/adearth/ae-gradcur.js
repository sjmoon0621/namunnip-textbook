/* 카드: 해수면 경사가 같아도 소용돌이에 따라 해류가 빨라지거나 느려질까? — 지형류 균형과 경도류 균형 */
(() => {
  const root = document.getElementById("card-adearth-gradcur");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sLat = $(".sl-lat"), sR = $(".sl-r"), sD = $(".sl-d");
  const OM = 7.292e-5, G = 9.81;
  let mode = /demo/.test(location.search) ? 2 : 0, ang = 0;
  const calc = () => {
    const lat = +sLat.value, R = +sR.value * 1000, d = +sD.value, f = 2 * OM * Math.sin(lat * Math.PI / 180);
    const pgf = G * d / R, Vg = pgf / f;
    let V = Vg, ok = true;
    if (mode === 1) V = (-f + Math.sqrt(f * f + 4 * pgf / R)) * R / 2;
    if (mode === 2) { const disc = f * f - 4 * pgf / R; if (disc < 0) { ok = false; V = f * R / 2; } else V = (f - Math.sqrt(disc)) * R / 2; }
    return { lat, R, d, f, pgf, Vg, V, ok, cor: f * V, cen: mode ? V * V / R : 0 };
  };
  const arrow = (x, y, dx, dy, col, lab, dash, below) => {
    const L = Math.hypot(dx, dy); if (L < 2) return;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.4; ctx.setLineDash(dash ? [5, 4] : []);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y + dy); ctx.stroke(); ctx.setLineDash([]);
    const ux = dx / L, uy = dy / L;
    ctx.beginPath(); ctx.moveTo(x + dx, y + dy); ctx.lineTo(x + dx - 9 * ux - 5 * uy, y + dy - 9 * uy + 5 * ux); ctx.lineTo(x + dx - 9 * ux + 5 * uy, y + dy - 9 * uy - 5 * ux); ctx.fill();
    if (lab) {
      ctx.font = `11px ${F.sans}`;
      if (below) { ctx.textAlign = "right"; ctx.fillText(lab, x + dx - 12, y + dy + 4); }
      else if (Math.abs(ux) > 0.7) { ctx.textAlign = "center"; ctx.fillText(lab, x + dx / 2, y + dy / 2 + (below ? 15 : -7)); }
      else { ctx.textAlign = "left"; ctx.fillText(lab, x + dx + 8, y + dy + uy * 6 + 4); }
    }
  };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    const s = calc();
    ctx.clearRect(0, 0, w, h);
    const pw = w * 0.64, cx = pw / 2, cy = h / 2, Rpx = Math.min(pw, h) * 0.30;
    if (mode === 0) {
      /* 곧은 해류: 남쪽이 높음, 동쪽으로 흐름 */
      const g = ctx.createLinearGradient(0, h - 10, 0, 10);
      g.addColorStop(0, "rgba(212,73,58,.22)"); g.addColorStop(1, "rgba(63,111,163,.22)");
      ctx.fillStyle = g; ctx.fillRect(10, 10, pw - 20, h - 20);
      ctx.strokeStyle = "rgba(35,35,38,.25)"; ctx.lineWidth = 1;
      for (let i = 1; i < 6; i++) { const y = 10 + i * (h - 20) / 6; ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(pw - 10, y); ctx.stroke(); }
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
      ctx.fillText("해수면 낮음 (북)", 16, 24); ctx.fillText("해수면 높음 (남)", 16, h - 16);
      for (let i = 0; i < 4; i++) { const x = 20 + ((i * (pw - 40) / 4 + ang * 30) % (pw - 60)); ctx.fillStyle = "rgba(35,35,38,.35)"; ctx.fillRect(x, cy - 40 + (i % 2) * 80, 16, 2); }
    } else {
      const warm = mode === 2;
      for (let k = 5; k >= 1; k--) {
        const t = k / 5; ctx.fillStyle = warm ? `rgba(212,73,58,${0.06 + 0.05 * (5 - k)})` : `rgba(63,111,163,${0.06 + 0.05 * (5 - k)})`;
        ctx.beginPath(); ctx.arc(cx, cy, Rpx * 1.25 * t, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(35,35,38,.2)"; ctx.lineWidth = 1; ctx.stroke();
      }
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(warm ? "중심이 높음" : "중심이 낮음", cx, cy - Rpx * 0.45);
      /* 흐르는 점들 */
      const dir = warm ? 1 : -1;
      ctx.fillStyle = "rgba(35,35,38,.45)";
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + dir * ang; ctx.beginPath(); ctx.arc(cx + Rpx * 0.75 * Math.cos(a), cy + Rpx * 0.75 * Math.sin(a), 2, 0, Math.PI * 2); ctx.fill(); }
    }
    /* 물 덩어리와 힘 */
    const px = mode === 0 ? cx : cx + Rpx, py = cy;
    const big = Math.max(s.pgf, s.cor, 1e-12), sc = Rpx * 0.62 / big;
    let vx = 0, vy = 0;
    if (mode === 0) vx = 1; else vy = mode === 2 ? 1 : -1;
    /* 압력 경도력: 낮은 쪽으로. 곧은 해류는 북(위), 냉수성은 중심(왼쪽), 난수성은 바깥(오른쪽) */
    const pg = mode === 0 ? [0, -1] : mode === 1 ? [-1, 0] : [1, 0];
    /* 전향력: 속도의 오른쪽 (화면 좌표: 위가 북) → (vx,vy) 오른쪽 = (-vy, vx) 화면에서 y 아래 */
    const co = [-vy, vx];
    if (mode === 0) { co[0] = 0; co[1] = 1; }
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
    arrow(px, py, pg[0] * s.pgf * sc, pg[1] * s.pgf * sc, "#3f6fa3", "압력 경도력");
    if (s.ok) arrow(px, py, co[0] * s.cor * sc, co[1] * s.cor * sc, C.amber, "전향력");
    if (mode && s.ok) arrow(px, py + 16, -s.cen * sc, 0, C.apple, "합력 = 구심력", true, true);
    const vlen = 44;
    arrow(px, py, vx * vlen, vy * vlen, C.ink2, "속도");
    if (!s.ok) {
      ctx.fillStyle = C.warn; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText("이 기울기로는 균형이 불가능합니다", pw / 2, h - 16);
    }
    /* 오른쪽: 속력 비교 막대 */
    const bx0 = pw + 18, bx1 = w - 12, by = h - 34, top = 40, vmax = Math.max(0.5, s.Vg, s.V) * 1.15;
    const Y = (v) => by - v / vmax * (by - top);
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx0, by); ctx.lineTo(bx1, by); ctx.stroke();
    const bw = (bx1 - bx0) / 2 - 12;
    const bar = (i, v, col, lab, ghost) => {
      const x = bx0 + 6 + i * (bw + 12);
      ctx.fillStyle = col; if (ghost) ctx.globalAlpha = 0.35; ctx.fillRect(x, Y(v), bw, by - Y(v)); ctx.globalAlpha = 1;
      ctx.fillStyle = C.ink; ctx.font = `11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(`${v.toFixed(2)}`, x + bw / 2, Y(v) - 5);
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.fillText(lab, x + bw / 2, by + 14);
    };
    bar(0, s.Vg, "#8d8d92", "지형류 V_g");
    bar(1, s.V, mode === 0 ? "#8d8d92" : mode === 1 ? "#3f6fa3" : C.apple, mode === 0 ? "실제 V" : "경도류 V", !s.ok);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("속력 (m/s)", bx0, top - 18);
    ctx.textAlign = "right"; ctx.fillText("위가 북쪽 · 북반구", pw - 16, 24);
  }
  function update() {
    const s = calc();
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.m === mode)));
    $(".lat-out").textContent = s.lat; $(".r-out").textContent = sR.value; $(".d-out").textContent = s.d.toFixed(2);
    $(".r-lab").textContent = mode ? "반지름" : "흐름의 폭";
    $(".n-f").textContent = `${(s.f * 1e5).toFixed(2)}×10⁻⁵ s⁻¹`;
    $(".n-g").textContent = `${s.Vg.toFixed(2)} m/s`;
    $(".n-v").textContent = s.ok ? `${s.V.toFixed(2)} m/s` : "균형 불가";
    $(".n-v").classList.toggle("bad", !s.ok);
    $(".n-ro").textContent = s.ok ? (s.V / (s.f * s.R)).toFixed(2) : "—";
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { mode = +b.dataset.m; update(); }));
  [sLat, sR, sD].forEach((el) => el.addEventListener("input", update));
  loop(cv, (dt) => { if (NM.reduce) return false; ang += dt * 0.4; draw(); });
  update();
})();
