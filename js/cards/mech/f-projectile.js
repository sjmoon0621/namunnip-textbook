/* 카드: 비스듬히 던진 공은 몇 도에서 가장 멀리 갈까? — 포물선 운동의 성분 분해, 역학적 에너지 막대, 높이에 따른 최적 각 */
(() => {
  const root = document.getElementById("card-mech-projectile");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sA = $(".ang"), sV = $(".v"), sH = $(".h0"), sT = $(".t");
  const oA = $(".ang-out"), oV = $(".v-out"), oH = $(".h-out"), oT = $(".t-out");
  const nR = $(".n-r"), nHm = $(".n-hm"), nTf = $(".n-tf"), nBest = $(".n-best");
  const g = 9.8, m = 1;

  const flight = (v, th, h0) => { const vy = v * Math.sin(th); return (vy + Math.sqrt(vy * vy + 2 * g * h0)) / g; };
  const range = (v, th, h0) => v * Math.cos(th) * flight(v, th, h0);
  function bestAngle(v, h0) { let best = 0, bd = 0; for (let d = 1; d < 90; d += 0.1) { const r = range(v, d * Math.PI / 180, h0); if (r > bd) { bd = r; best = d; } } return best; }

  function arrow(ctx, x, y, dx, dy, col) {
    const L = Math.hypot(dx, dy); if (L < 3) return;
    const ux = dx / L, uy = dy / L, h = 7;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx - ux * h * 0.8, y + dy - uy * h * 0.8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + dx, y + dy); ctx.lineTo(x + dx - ux * h - uy * h * 0.5, y + dy - uy * h + ux * h * 0.5); ctx.lineTo(x + dx - ux * h + uy * h * 0.5, y + dy - uy * h - ux * h * 0.5); ctx.closePath(); ctx.fill();
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const th = +sA.value * Math.PI / 180, v = +sV.value, h0 = +sH.value;
    const tf = flight(v, th, h0), R = range(v, th, h0), bestTh = bestAngle(v, h0) * Math.PI / 180;
    // 눈금: 최대 속력 30, 최대 높이 30에서도 들어가도록 고정
    const Xmax = 110, Ymax = 55, barW = 70;
    const px0 = 36, py0 = h - 26, pw = w - px0 - barW - 22, ph = h - 40;
    const X = (x) => px0 + x / Xmax * pw, Y = (y) => py0 - y / Ymax * ph;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let x = 0; x <= Xmax; x += 20) { ctx.beginPath(); ctx.moveTo(X(x), py0); ctx.lineTo(X(x), py0 + 4); ctx.stroke(); ctx.fillText(`${x}`, X(x), py0 + 15); }
    ctx.textAlign = "right"; for (let y = 0; y <= Ymax; y += 10) ctx.fillText(`${y}`, px0 - 5, Y(y) + 3);
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(px0, py0); ctx.lineTo(px0 + pw, py0); ctx.stroke();
    // 던지는 곳
    if (h0 > 0) { ctx.fillStyle = "#ebece5"; ctx.fillRect(px0 - 14, Y(h0), 14, py0 - Y(h0)); ctx.strokeStyle = C.ink3; ctx.strokeRect(px0 - 14, Y(h0), 14, py0 - Y(h0)); }
    const path = (ang, col, dash, lw) => {
      const T = flight(v, ang, h0); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath();
      for (let i = 0; i <= 80; i++) { const t = T * i / 80, x = v * Math.cos(ang) * t, y = h0 + v * Math.sin(ang) * t - 0.5 * g * t * t; i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)); }
      ctx.stroke(); ctx.setLineDash([]);
    };
    if (Math.abs(bestTh - th) > 0.01) path(bestTh, "rgba(93,93,97,.55)", [4, 4], 1.4);
    path(th, "#3f6fa3", [], 2.2);
    // 현재 위치와 속도 성분
    const t = tf * +sT.value, x = v * Math.cos(th) * t, y = h0 + v * Math.sin(th) * t - 0.5 * g * t * t;
    const vx = v * Math.cos(th), vy = v * Math.sin(th) - g * t, sc = 2.2;
    arrow(ctx, X(x), Y(y), vx * sc, 0, "#3b7c2a");
    arrow(ctx, X(x), Y(y), 0, -vy * sc, "#b5532f");
    ctx.setLineDash([3, 3]); arrow(ctx, X(x), Y(y), vx * sc, -vy * sc, "rgba(35,35,38,.55)"); ctx.setLineDash([]);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(x), Y(y), 5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = "#3b7c2a"; ctx.fillText(`vₓ ${vx.toFixed(1)}`, X(x) + vx * sc + 4, Y(y) + 4);
    ctx.fillStyle = "#b5532f"; ctx.fillText(`vᵧ ${(Math.abs(vy) < 0.05 ? 0 : vy).toFixed(1)}`, X(x) + 6, Y(y) - vy * sc + (vy > 0 ? -2 : 12));
    ctx.fillStyle = C.ink3; ctx.fillText("거리 (m)", px0 + pw - 40, py0 - 6);
    // 에너지 막대
    const KE = 0.5 * m * (vx * vx + vy * vy), PE = m * g * y, E = 0.5 * m * v * v + m * g * h0;
    const bx = w - barW - 6, by0 = py0, bh = ph * 0.9, Emax = 0.5 * 30 * 30 + g * 30;
    const Hh = (e) => e / Emax * bh;
    ctx.fillStyle = "#ebece5"; ctx.fillRect(bx, by0 - Hh(E), 26, Hh(E));
    ctx.fillStyle = "#e0a02a"; ctx.fillRect(bx, by0 - Hh(KE), 26, Hh(KE));
    ctx.fillStyle = "#3f6fa3"; ctx.fillRect(bx, by0 - Hh(KE) - Hh(PE), 26, Hh(PE));
    ctx.strokeStyle = C.ink; ctx.strokeRect(bx, by0 - Hh(E), 26, Hh(E));
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = "#e0a02a"; ctx.fillText(`운동 ${KE.toFixed(0)} J`, bx + 30, by0 - Hh(KE) / 2 + 3);
    ctx.fillStyle = "#3f6fa3"; ctx.fillText(`위치 ${PE.toFixed(0)} J`, bx + 30, by0 - Hh(KE) - Hh(PE) / 2 + 3);
    ctx.fillStyle = C.ink2; ctx.fillText(`합 ${E.toFixed(0)} J`, bx - 4, by0 - Hh(E) - 6);
  }
  function update() {
    oA.textContent = sA.value; oV.textContent = (+sV.value).toFixed(1).replace(/\.0$/, ""); oH.textContent = sH.value;
    const th = +sA.value * Math.PI / 180, v = +sV.value, h0 = +sH.value, tf = flight(v, th, h0);
    oT.textContent = (tf * +sT.value).toFixed(2);
    nR.textContent = `${range(v, th, h0).toFixed(1)} m`;
    const vy = v * Math.sin(th); nHm.textContent = `${(h0 + vy * vy / (2 * g)).toFixed(1)} m`;
    nTf.textContent = `${tf.toFixed(2)} s`;
    nBest.textContent = `${bestAngle(v, h0).toFixed(1)}°`;
    root.querySelectorAll("[data-ang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.ang === sA.value)));
    draw();
  }
  [sA, sV, sH, sT].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-ang]").forEach((b) => b.addEventListener("click", () => { sA.value = b.dataset.ang; update(); }));
  update();
})();
