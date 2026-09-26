/* 카드: 바람과 직각으로 흐른 물이 어떻게 거대한 해류가 될까? — 에크만 나선, 수송, 해수면 언덕과 지형류 */
(() => {
  const root = document.getElementById("card-esys-ekman");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sP = $(".p"), oP = $(".p-out"), sW = $(".w"), oW = $(".w-out"), bN = $(".h-n"), bS = $(".h-s"), nD = $(".n-d"), nM = $(".n-m"), nG = $(".n-g");
  let hemi = 1; // 1 북반구, -1 남반구
  const OM = 7.29e-5;
  const arrow = (x, y, dx, dy, col, lw = 2) => {
    const L = Math.hypot(dx, dy); if (L < 2) return; const ux = dx / L, uy = dy / L;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx - ux * 6, y + dy - uy * 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + dx, y + dy); ctx.lineTo(x + dx - ux * 9 - uy * 4.5, y + dy - uy * 9 + ux * 4.5); ctx.lineTo(x + dx - ux * 9 + uy * 4.5, y + dy - uy * 9 - ux * 4.5); ctx.fill();
  };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    // 왼쪽: 에크만 나선 (위에서 비스듬히 본 모습). 바람은 화면 위쪽(북쪽)으로
    const lw = w * 0.46, cx = lw * 0.5, cy = h * 0.2, N = 9, dz = (h * 0.62) / N;
    ctx.fillStyle = "rgba(110,164,230,.12)"; ctx.fillRect(8, cy - 10, lw - 16, h * 0.72);
    for (let i = N - 1; i >= 0; i--) {
      const z = i / (N - 1) * 1.5, a = -Math.PI / 2 + hemi * (Math.PI / 4 + Math.PI * z / 1.5 * 0.9), m = Math.exp(-Math.PI * z / 1.5 * 0.9) * lw * 0.3, y = cy + i * dz;
      ctx.strokeStyle = "rgba(63,111,163,.25)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(cx, y, lw * 0.32, 8, 0, 0, Math.PI * 2); ctx.stroke();
      arrow(cx, y, Math.cos(a) * m, Math.sin(a) * m * 0.3, `rgba(63,111,163,${0.35 + 0.65 * (1 - i / N)})`, 2);
    }
    arrow(cx - lw * 0.36, cy - 4, 0, -34, C.ink, 3); ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("바람", cx - lw * 0.36 + 6, cy - 26);
    arrow(cx, cy + 5.5 * dz, hemi * lw * 0.32, 0, C.warn, 4); ctx.fillStyle = C.warn; ctx.textAlign = hemi > 0 ? "right" : "left"; ctx.fillText("순 수송 (에크만 수송)", cx + hemi * lw * 0.34, cy + 5.5 * dz + 18);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("표면", 14, cy + 4); ctx.fillText("마찰층 바닥", 14, cy + (N - 1) * dz + 4); ctx.fillText("화살표: 깊이별 흐름 (위에서 비스듬히 본 모습)", 14, h - 8);
    // 오른쪽: 남북 단면의 해수면 언덕
    const rx0 = w * 0.52, rx1 = w - 12, mid = (rx0 + rx1) / 2, sy = h * 0.42;
    ctx.fillStyle = "rgba(110,164,230,.28)"; ctx.beginPath(); ctx.moveTo(rx0, h - 30);
    for (let x = rx0; x <= rx1; x += 3) { const u = (x - mid) / (rx1 - rx0) * 3.2; ctx.lineTo(x, sy + 26 - 30 * Math.exp(-u * u)); }
    ctx.lineTo(rx1, h - 30); ctx.fill();
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center";
    const lab = hemi > 0 ? ["적도 쪽(남)", "극 쪽(북)"] : ["극 쪽(남)", "적도 쪽(북)"];
    ctx.fillText(lab[0], rx0 + 34, h - 14); ctx.fillText(lab[1], rx1 - 34, h - 14); ctx.fillText("해수면 언덕 (약 1 m, 세로 과장)", mid, sy - 16);
    // 바람: 적도 쪽 동풍(무역풍), 극 쪽 서풍(편서풍) — 화면 안(⊗)/밖(⊙)로 표시
    const sym = (x, y, out, col) => { ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.stroke(); if (out) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); } else { ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4); ctx.stroke(); } };
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.fillText("⊙ 화면 밖으로(동쪽) · ⊗ 화면 안으로(서쪽)", mid, 14);
    const eqL = hemi > 0; // 적도 쪽이 왼쪽인지
    sym(rx0 + 40, 36, !eqL ? true : false, C.ink); ctx.fillStyle = C.ink2; ctx.fillText(eqL ? "무역풍" : "편서풍", rx0 + 40, 58);
    sym(rx1 - 40, 36, eqL ? true : false, C.ink); ctx.fillText(eqL ? "편서풍" : "무역풍", rx1 - 40, 58);
    // 에크만 수송은 언덕 쪽으로
    arrow(rx0 + 60, sy + 10, 40, 0, C.warn, 2.4); arrow(rx1 - 60, sy + 10, -40, 0, C.warn, 2.4);
    ctx.fillStyle = C.warn; ctx.fillText("에크만 수송 → 가운데로 모임", mid, sy + 32);
    // 지형류의 힘: 수압 경도력(바깥쪽), 전향력(안쪽)
    const gy = sy + 62, xl = mid - (rx1 - rx0) * 0.3, xr = mid + (rx1 - rx0) * 0.3;
    [[xl, -1], [xr, 1]].forEach(([x, s]) => {
      arrow(x, gy, s * 26, 0, "#3f6fa3", 2.2); arrow(x, gy + 22, -s * 26, 0, "#8a4fb5", 2.2);
      // 흐름: 북반구 시계 방향 → 적도 쪽(왼쪽)은 서쪽(⊗), 극 쪽(오른쪽)은 동쪽(⊙). 남반구에서는 반대 배치지만 결과는 반시계
      const out = hemi > 0 ? s > 0 : s < 0; sym(x, gy + 48, out, C.forest);
    });
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = "#3f6fa3"; ctx.fillText("수압 경도력", mid, gy + 4); ctx.fillStyle = "#8a4fb5"; ctx.fillText("전향력", mid, gy + 26); ctx.fillStyle = C.forest; ctx.fillText("지형류", mid, gy + 52);
  }
  function update() {
    const p = +sP.value, W = +sW.value, f = 2 * OM * Math.sin(p * Math.PI / 180);
    oP.textContent = p; oW.textContent = W;
    nD.textContent = `약 ${Math.round(4.3 * W / Math.sqrt(Math.sin(p * Math.PI / 180)))} m`;
    const tau = 1.2 * 1.3e-3 * W * W, M = tau / (1025 * f) * 1000; nM.textContent = `약 ${M < 100 ? M.toFixed(0) : Math.round(M / 10) * 10} m³/s`;
    nG.textContent = `약 ${(9.8 / f * 1e-6 * 100).toFixed(0)} cm/s`;
    draw();
  }
  const setH = (v) => { hemi = v; bN.setAttribute("aria-pressed", String(v > 0)); bS.setAttribute("aria-pressed", String(v < 0)); update(); };
  bN.addEventListener("click", () => setH(1)); bS.addEventListener("click", () => setH(-1));
  sP.addEventListener("input", update); sW.addEventListener("input", update); update();
})();
