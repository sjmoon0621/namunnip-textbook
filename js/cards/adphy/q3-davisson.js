/* 카드: 데이비슨–거머 전자 회절 — 표면 원자 줄을 반사 격자로 본 모식 */
(() => {
  const root = document.getElementById("card-adphy-davisson");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sV = $(".v"), oV = $(".v-out"), sP = $(".p"), oP = $(".p-out");
  const nI = $(".n-i"), nL = $(".n-l"), nA = $(".n-a"), nX = $(".n-x");
  const D = 0.215;
  const lam = (V) => 1.2264 / Math.sqrt(V); /* nm */
  /* 상대 세기: 격자 인자 × 완만한 원자 산란 인자 + 배경 */
  function inten(phi, V) {
    /* 경로차/파장 = d sinφ / λ 가 정수 n(≥1)에 가까울 때 보강. 봉우리 폭은 실험 수준(약 ±7°)으로 둔 모식 */
    const q = D * Math.sin(phi) / lam(V);
    let g = 0; for (let n = 1; n <= 3; n++) g += Math.exp(-(((q - n) / 0.09) ** 2));
    return 0.12 + 0.88 * Math.min(g, 1) * (0.55 + 0.45 * Math.cos(phi));
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    const V = +sV.value, ph = +sP.value * Math.PI / 180;
    ctx.clearRect(0, 0, w, h);
    /* 왼쪽: 장치 */
    const cx = w * 0.25, sy = h * 0.72, R = Math.min(w * 0.2, h * 0.55);
    ctx.fillStyle = "#e6e8e1"; ctx.fillRect(cx - R - 10, sy, 2 * R + 20, h - sy - 8);
    const sp = 2 * R / 10;
    for (let k = -5; k <= 5; k++) for (let r = 0; r < 3; r++) { ctx.fillStyle = r ? "#9aa39a" : "#5f6b60"; ctx.beginPath(); ctx.arc(cx + k * sp + (r % 2) * sp / 2, sy + 6 + r * 11, 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("니켈 결정", cx - R - 6, h - 12);
    /* 전자총과 입사선 */
    ctx.fillStyle = C.ink; ctx.fillRect(cx - 7, 8, 14, 22);
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, 30); ctx.lineTo(cx, sy); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText(`전자총 ${V} V`, cx + 12, 22);
    /* 각도 눈금 호 */
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, sy, R, -Math.PI / 2, 0); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`;
    for (let a = 0; a <= 90; a += 30) { const t = a * Math.PI / 180; if (a === 0) continue; ctx.textAlign = "left"; ctx.fillText(`${a}°`, cx + (R + 16) * Math.sin(t), sy - (R + 16) * Math.cos(t) + (a === 90 ? -4 : 3)); }
    /* 산란 세기를 왼쪽에도 부채꼴로 */
    ctx.fillStyle = "rgba(63,111,163,.16)"; ctx.beginPath(); ctx.moveTo(cx, sy);
    for (let i = 0; i <= 180; i++) { const t = i / 180 * Math.PI / 2, r = R * 0.9 * inten(t, V); ctx.lineTo(cx + r * Math.sin(t), sy - r * Math.cos(t)); }
    ctx.closePath(); ctx.fill();
    /* 검출기 */
    const dx = cx + R * Math.sin(ph), dy = sy - R * Math.cos(ph);
    ctx.strokeStyle = C.amber; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(cx, sy); ctx.lineTo(dx, dy); ctx.stroke(); ctx.setLineDash([]);
    ctx.save(); ctx.translate(dx, dy); ctx.rotate(ph); ctx.fillStyle = C.amber; ctx.fillRect(-9, -12, 18, 12); ctx.restore();
    /* 오른쪽: 극좌표 그래프 */
    const px = w * 0.56, py = h - 26, PR = Math.min(w * 0.4, h - 50);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    for (const f of [0.25, 0.5, 0.75, 1]) { ctx.beginPath(); ctx.arc(px, py, PR * f, -Math.PI / 2, 0); ctx.stroke(); }
    for (let a = 0; a <= 90; a += 15) { const t = a * Math.PI / 180; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + PR * Math.sin(t), py - PR * Math.cos(t)); ctx.stroke(); }
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    for (let a = 0; a <= 90; a += 15) { const t = a * Math.PI / 180; ctx.fillText(`${a}°`, px + (PR + 12) * Math.sin(t), py - (PR + 8) * Math.cos(t) + 3); }
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 360; i++) { const t = i / 360 * Math.PI / 2, r = PR * inten(t, V); i ? ctx.lineTo(px + r * Math.sin(t), py - r * Math.cos(t)) : ctx.moveTo(px + r * Math.sin(t), py - r * Math.cos(t)); }
    ctx.stroke();
    const ri = PR * inten(ph, V); ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(px + ri * Math.sin(ph), py - ri * Math.cos(ph), 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("각도별 검출 전류 (상대값)", px - 4, 14);
  }
  function update() {
    const V = +sV.value, ph = +sP.value * Math.PI / 180, l = lam(V);
    oV.textContent = V; oP.textContent = sP.value;
    nI.textContent = (inten(ph, V) * 100).toFixed(0);
    nL.textContent = `${l.toFixed(3)} nm`;
    const s1 = l / D; nA.textContent = s1 <= 1 ? `${(Math.asin(s1) * 180 / Math.PI).toFixed(1)}°` : "없음";
    nX.textContent = `${(1.23984 / l).toFixed(1)} keV`;
    draw();
  }
  [sV, sP].forEach((el) => el.addEventListener("input", update));
  update();
})();
