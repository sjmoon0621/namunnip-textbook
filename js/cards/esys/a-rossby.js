/* 카드: 굽이치는 편서풍 아래에서 저기압은 어디에 생길까? — 극 투영 편서풍 파동, c = U − β/k², 수렴·발산 */
(() => {
  const root = document.getElementById("card-esys-rossby");
  if (!root) return;
  const { C, F, fit, loop, reduce } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sK = $(".k"), oK = $(".k-out"), sU = $(".u"), oU = $(".u-out"), sA = $(".a"), oA = $(".a-out"), nL = $(".n-l"), nC = $(".n-c"), nS = $(".n-s");
  const RE = 6.371e6, LAT = 45 * Math.PI / 180, BETA = 2 * 7.292e-5 * Math.cos(LAT) / RE, CIRC = 2 * Math.PI * RE * Math.cos(LAT);
  let ph = 0;
  const phase = () => { const n = +sK.value, k = 2 * Math.PI * n / CIRC, U = +sU.value; return { n, k, U, c: U - BETA / (k * k), L: CIRC / n }; };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { n } = phase(), amp = +sA.value, cx = w / 2, cy = h / 2, Rm = Math.min(w, h) * 0.46, rOf = (lat) => (90 - lat) / 80 * Rm;
    ctx.fillStyle = "#eef2ea"; ctx.beginPath(); ctx.arc(cx, cy, Rm, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; [30, 45, 60, 75].forEach((lat) => { ctx.beginPath(); ctx.arc(cx, cy, rOf(lat), 0, Math.PI * 2); ctx.stroke(); });
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; [30, 45, 60].forEach((lat) => ctx.fillText(`${lat}°N`, cx + 3, cy - rOf(lat) + 11));
    // 경도 λ (반시계 = 동쪽, 북극 위에서 본 모습)
    const latOf = (lam) => 45 - amp * Math.cos(n * lam - ph); // 극 쪽이 +, 남쪽으로 처진 곳이 골
    const P = (lam, lat) => [cx + rOf(lat) * Math.cos(lam), cy - rOf(lat) * Math.sin(lam)];
    // 따뜻한 쪽 / 찬 쪽 채색
    ctx.fillStyle = "rgba(110,164,230,.28)"; ctx.beginPath(); for (let i = 0; i <= 360; i++) { const l = i * Math.PI / 180, [x, y] = P(l, latOf(l)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
    // 흐름 방향 화살촉 (서→동 = 반시계)
    for (let j = 0; j < n * 2; j++) { const l = (j + 0.25) / (n * 2) * 2 * Math.PI, [x, y] = P(l, latOf(l)), [x2, y2] = P(l + 0.02, latOf(l + 0.02)), a = Math.atan2(y2 - y, x2 - x); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 7, y + Math.sin(a) * 7); ctx.lineTo(x - Math.cos(a) * 5 - Math.sin(a) * 5, y - Math.sin(a) * 5 + Math.cos(a) * 5); ctx.lineTo(x - Math.cos(a) * 5 + Math.sin(a) * 5, y - Math.sin(a) * 5 - Math.cos(a) * 5); ctx.fill(); }
    if (amp > 2) for (let j = 0; j < n; j++) {
      const trough = (ph + 2 * Math.PI * j) / n, // 골: cos = 1 → 위도 최저
        ridge = trough + Math.PI / n, q = Math.PI / (2 * n);
      const lab = (lam, lat, t, col, font) => { const [x, y] = P(lam, lat); ctx.fillStyle = col; ctx.font = font; ctx.textAlign = "center"; ctx.fillText(t, x, y + 4); };
      lab(trough, 45 - amp - 6, "골", "#3f6fa3", `600 11px ${F.sans}`); lab(ridge, 45 + amp + 6, "마루", C.warn, `600 11px ${F.sans}`);
      lab(trough + q, 45 - 4, "L", "#d7263d", `700 15px ${F.sans}`); lab(trough - q, 45 + 4, "H", "#3f6fa3", `700 15px ${F.sans}`);
    }
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("북극", cx, cy + 4);
    ctx.textAlign = "left"; ctx.fillText("L: 골 동쪽(상층 발산) → 지상 저기압", 8, h - 20); ctx.fillText("H: 골 서쪽(상층 수렴) → 지상 고기압", 8, h - 6);
    ctx.textAlign = "right"; ctx.fillText("반시계 방향 = 동쪽", w - 8, 14);
  }
  function update() {
    const p = phase(); oK.textContent = p.n; oU.textContent = p.U; oA.textContent = sA.value;
    nL.textContent = `약 ${Math.round(p.L / 1000 / 100) * 100} km`;
    nC.textContent = Math.abs(p.c) < 0.5 ? "거의 멈춤 (정체파)" : `${p.c > 0 ? "동쪽" : "서쪽"}으로 ${Math.abs(p.c).toFixed(1)} m/s`;
    nS.textContent = `${(BETA / (p.k * p.k)).toFixed(1)} m/s`;
    draw();
  }
  [sK, sU, sA].forEach((s) => s.addEventListener("input", update)); update();
  // 파동 이동: 위상 속도 c를 각속도로 (시간 과장)
  loop(cv, (dt) => { if (reduce) return false; const p = phase(); ph += p.n * p.c / (CIRC / (2 * Math.PI)) * dt * 20000; draw(); });
})();
