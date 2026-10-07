/* 카드: 바람이 1년 내내 불면 바닷물은 얼마나, 어느 쪽으로 옮겨질까? — 에크만 나선, D = π√(2Az/f), M = τ/(ρf) */
(() => {
  const root = document.getElementById("card-adearth-ekman-spiral");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sU = $(".sl-u"), sLat = $(".sl-lat"), sA = $(".sl-a");
  const OM = 7.292e-5, RHO = 1025;
  let hs = 1;
  const calc = () => {
    const U = +sU.value, lat = +sLat.value, Az = 10 ** +sA.value;
    const f = 2 * OM * Math.sin(lat * Math.PI / 180), tau = 1.2 * 1.3e-3 * U * U;
    const D = Math.PI * Math.sqrt(2 * Az / f), V0 = tau / (RHO * Math.sqrt(Az * f)), M = tau / (RHO * f);
    return { U, lat, Az, f, tau, D, V0, M };
  };
  /* 깊이 z(양수, m)에서 속도: 크기 V0 e^{-πz/D}, 바람(북쪽) 기준 시계 방향 각 hs·(45° + πz/D) */
  const vel = (s, z) => { const a = hs * (Math.PI / 4 + Math.PI * z / s.D), m = s.V0 * Math.exp(-Math.PI * z / s.D); return [m * Math.sin(a), m * Math.cos(a)]; };
  const arrowHead = (x0, y0, x1, y1, col, wdt) => {
    const L = Math.hypot(x1 - x0, y1 - y0); if (L < 1.5) return;
    const ux = (x1 - x0) / L, uy = (y1 - y0) / L, hd = Math.min(8, L * 0.5);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = wdt || 1.6;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - hd * ux - hd * 0.55 * uy, y1 - hd * uy + hd * 0.55 * ux); ctx.lineTo(x1 - hd * ux + hd * 0.55 * uy, y1 - hd * uy - hd * 0.55 * ux); ctx.fill();
  };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    const s = calc();
    ctx.clearRect(0, 0, w, h);
    /* 왼쪽: 비스듬히 본 나선 */
    const lw = w * 0.5, ax = lw * 0.5, top = 84, bot = h - 18, zmax = 1.1 * s.D;
    const Zp = (z) => top + z / zmax * (bot - top);
    const sc = (lw * 0.36) / s.V0;
    /* 투영: 동(x) → 오른쪽, 북(y) → 오른쪽 위 비스듬히 */
    const P = (vx, vy) => [vx * sc + vy * sc * 0.55, -vy * sc * 0.32];
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(ax, top); ctx.lineTo(ax, bot); ctx.stroke(); ctx.setLineDash([]);
    /* 해수면 평행사변형 */
    const q = (x, y) => { const [px, py] = P(x, y); return [ax + px, top + py]; };
    const r = s.V0 * 1.05;
    ctx.fillStyle = "rgba(63,111,163,.10)"; ctx.beginPath();
    [[-r, -r], [r, -r], [r, r], [-r, r]].forEach(([x, y], i) => { const [px, py] = q(x, y); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
    ctx.closePath(); ctx.fill();
    /* 바람 */
    const [wx0, wy0] = q(0, -r * 0.2), [wx1, wy1] = q(0, r * 1.15);
    arrowHead(wx0, wy0 - 14, wx1, wy1 - 14, C.ink2, 2.2);
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("바람 (북쪽으로)", wx1 + 4, wy1 - 18);
    const nz = 14;
    for (let i = 0; i <= nz; i++) {
      const z = i / nz * zmax, [vx, vy] = vel(s, z), [px, py] = P(vx, vy), y0 = Zp(z);
      arrowHead(ax, y0, ax + px, y0 + py, i === 0 ? C.apple : `rgba(212,73,58,${Math.max(0.25, 1 - i / nz)})`, i === 0 ? 2.2 : 1.4);
    }
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right";
    [0, 0.5, 1].forEach((k) => { ctx.fillText(k === 0 ? "0 m" : `${(k * s.D).toFixed(0)} m`, ax - 8, Zp(k * s.D) + 3); });
    ctx.textAlign = "left"; ctx.fillText("깊이 ↓", 4, Zp(0.25 * s.D));
    ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(ax - 5, Zp(s.D)); ctx.lineTo(ax + 5, Zp(s.D)); ctx.stroke();
    ctx.font = `10px ${F.sans}`; ctx.fillText("← D", ax + 8, Zp(s.D) + 3);
    /* 오른쪽: 위에서 본 호도그래프 */
    const cx = w * 0.74, cy = h * 0.55, R = Math.min(w * 0.19, h * 0.36), hsc = R / s.V0;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx - R * 1.15, cy); ctx.lineTo(cx + R * 1.15, cy); ctx.moveTo(cx, cy - R * 1.15); ctx.lineTo(cx, cy + R * 1.15); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("북", cx, cy - R * 1.15 - 4); ctx.fillText("위에서 본 모습", cx, 14);
    ctx.textAlign = "left"; ctx.fillText("동", cx + R * 1.15 + 2, cy + 3);
    ctx.strokeStyle = "rgba(212,73,58,.8)"; ctx.lineWidth = 1.6; ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const z = i / 120 * 1.5 * s.D, [vx, vy] = vel(s, z), x = cx + vx * hsc, y = cy - vy * hsc; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    for (let i = 0; i <= 6; i++) { const z = i / 6 * s.D, [vx, vy] = vel(s, z); arrowHead(cx, cy, cx + vx * hsc, cy - vy * hsc, `rgba(212,73,58,${i ? 0.45 : 1})`, i ? 1 : 2); }
    arrowHead(cx, cy, cx, cy - R * 1.05, C.ink2, 2);
    /* 순수송: 바람의 오른쪽(북반구) 90° */
    arrowHead(cx, cy, cx + hs * R * 0.9, cy, "#3f6fa3", 3);
    ctx.fillStyle = "#3f6fa3"; ctx.font = `11px ${F.sans}`; ctx.textAlign = hs > 0 ? "right" : "left";
    ctx.fillText("에크만 수송", cx + hs * R * 0.9, cy + 16);
    ctx.fillStyle = C.apple; ctx.textAlign = hs > 0 ? "left" : "right";
    const [sx, sy] = vel(s, 0); ctx.fillText("표면 45°", cx + sx * hsc + hs * 6, cy - sy * hsc - 4);
  }
  function update() {
    const s = calc();
    $(".u-out").textContent = s.U; $(".lat-out").textContent = s.lat; $(".a-out").textContent = s.Az.toFixed(3);
    $(".n-d").textContent = `${s.D.toFixed(0)} m`;
    $(".n-v").textContent = `${(s.V0 * 100).toFixed(1)} cm/s`;
    $(".n-m").textContent = `${s.M.toFixed(2)} m²/s`;
    $(".n-sv").textContent = `${(s.M * 1e6 / 1e6).toFixed(2)} Sv`;
    root.querySelectorAll("[data-hs]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.hs === hs)));
    draw();
  }
  root.querySelectorAll("[data-hs]").forEach((b) => b.addEventListener("click", () => { hs = +b.dataset.hs; update(); }));
  [sU, sLat, sA].forEach((el) => el.addEventListener("input", update));
  update();
})();
