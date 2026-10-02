/* 카드: X선이 전자에 부딪혀 튕겨 나오면 왜 파장이 바뀔까? — 콤프턴 산란, 운동량 삼각형, Δλ–θ 그래프 */
(() => {
  const root = document.getElementById("card-phy-compton");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const LC = 2.426, HC = 1239.84e3;   // pm, eV·pm
  const { ctx, size } = fit($("canvas"), () => draw());
  const wave = (x0, y0, ang, len, lam, col) => {   // 파장에 비례한 물결 화살표
    ctx.save(); ctx.translate(x0, y0); ctx.rotate(ang); ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.beginPath();
    const k = 2 * Math.PI / (6 + lam * 0.25); for (let x = 0; x <= len; x += 1) { const y = Math.sin(x * k) * 6; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(len + 8, 0); ctx.lineTo(len, -5); ctx.lineTo(len, 5); ctx.fill(); ctx.restore();
  };
  const arrow = (x0, y0, dx, dy, col, lab) => { ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + dx, y0 + dy); ctx.stroke(); const a = Math.atan2(dy, dx); ctx.beginPath(); ctx.moveTo(x0 + dx, y0 + dy); ctx.lineTo(x0 + dx - 9 * Math.cos(a - 0.4), y0 + dy - 9 * Math.sin(a - 0.4)); ctx.lineTo(x0 + dx - 9 * Math.cos(a + 0.4), y0 + dy - 9 * Math.sin(a + 0.4)); ctx.fill(); ctx.font = `10.5px ${F.sans}`; ctx.fillText(lab, x0 + dx * 0.5 + 6, y0 + dy * 0.5 - 6); };
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const th = +$(".th").value * Math.PI / 180, l0 = +$(".l").value, dl = LC * (1 - Math.cos(th)), l1 = l0 + dl;
    // 운동량: p = h/λ. 전자 운동량 = p0 − p1 (벡터)
    const p0 = 1 / l0, p1 = 1 / l1, pex = p0 - p1 * Math.cos(th), pey = -p1 * Math.sin(th);
    const cx = w * 0.27, cy = h * 0.62, L1 = Math.min(110, cy - 24);
    wave(cx - L1 - 12, cy, 0, L1, l0, "#8a5fd0");
    ctx.fillStyle = C.ink3; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill(); ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("충돌 지점", cx, cy + 22);
    wave(cx + 8, cy, -th, L1, l1, "#c0587e");
    // 물리 좌표(위가 +y) → 캔버스(아래가 +y)로 바꿔 그림. 광자는 θ만큼 위로, 전자는 아래로 튕김
    const ea = Math.atan2(pey, pex), ex = cx + Math.cos(ea) * 60, ey = cy - Math.sin(ea) * 60;
    ctx.strokeStyle = "#3f6fa3"; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#3f6fa3"; ctx.beginPath(); ctx.arc(ex, ey, 5, 0, Math.PI * 2); ctx.fill(); ctx.textAlign = "left"; ctx.fillText("전자", ex + 8, ey + 4);
    ctx.fillStyle = "#c0587e"; ctx.fillText(`λ' = ${l1.toFixed(1)} pm`, Math.min(cx + 8 + L1 * Math.cos(th) + 10, w * 0.42), Math.max(14, cy - L1 * Math.sin(th) - 6));
    ctx.fillStyle = "#8a5fd0"; ctx.fillText(`λ = ${l0} pm`, Math.max(4, cx - L1 - 12), cy - 14);
    // 운동량 삼각형: p = p' + pₑ
    const K = Math.min(w * 0.2, h * 0.34) / p0, tx = w * 0.58, ty = h * 0.44;
    ctx.fillStyle = C.ink2; ctx.font = `600 11px ${F.sans}`; ctx.fillText("운동량 보존: p = p' + pₑ", tx, 16);
    arrow(tx, ty, p0 * K, 0, "#8a5fd0", "p");
    const qx = p1 * Math.cos(th) * K, qy = -p1 * Math.sin(th) * K;
    arrow(tx, ty, qx, qy, "#c0587e", "p'");
    arrow(tx + qx, ty + qy, pex * K, -pey * K, "#3f6fa3", "pₑ");
    // Δλ–θ 그래프
    const gx = w * 0.58, gy = h * 0.58, gw = w - gx - 14, gh = h - gy - 28;
    const X = (d) => gx + d / 180 * gw, Y = (v) => gy + gh - v / 5 * gh;
    axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [0, 90, 180].map((d) => [d, d + "°"]), yt: [0, 2.43, 4.86].map((v) => [v, v.toFixed(2)]), ylabel: "Δλ (pm)" });
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.8; ctx.beginPath(); for (let d = 0; d <= 180; d += 2) { const v = LC * (1 - Math.cos(d * Math.PI / 180)); d ? ctx.lineTo(X(d), Y(v)) : ctx.moveTo(X(d), Y(v)); } ctx.stroke();
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(+$(".th").value), Y(dl), 4, 0, Math.PI * 2); ctx.fill();
    const Ee = HC / l0 - HC / l1;
    $(".n-d").textContent = `${dl.toFixed(2)} pm`; $(".n-l").textContent = `${l1.toFixed(2)} pm`; $(".n-e").textContent = Ee > 1000 ? `${(Ee / 1000).toFixed(1)} keV` : `${Ee.toFixed(0)} eV`;
  }
  root.querySelectorAll("input").forEach((el) => el.addEventListener("input", () => { $(".th-out").textContent = $(".th").value; $(".l-out").textContent = $(".l").value; draw(); }));
  draw();
})();
