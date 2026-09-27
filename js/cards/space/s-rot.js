/* 카드: 은하의 바깥쪽 별은 왜 느려지지 않을까? — 팽대부 + 원반 + 헤일로의 회전 곡선 */
(() => {
  const root = document.getElementById("card-space-rotation");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sH = $(".h"), oH = $(".h-out"), nV = $(".n-v"), nT = $(".n-t"), nE = $(".n-e");
  const G = 4.30e-6, MB = 1.5e10, AB = 0.6, MD = 6e10, RD = 3, RC = 4, R = 30; // kpc, 태양 질량, km/s
  const mB = (r) => MB * r ** 3 / (r * r + AB * AB) ** 1.5, mD = (r) => MD * (1 - (1 + r / RD) * Math.exp(-r / RD));
  const mH = (r, vh) => vh * vh * r / G * (1 - RC / r * Math.atan(r / RC));
  const vOf = (m, r) => Math.sqrt(G * m / r);
  const VH = () => 2.3 * +sH.value; // 0 ~ 230 km/s
  // 가상의 관측 자료 (헤일로 v_h ≈ 170일 때와 비슷하게)
  let seed = 9; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const OBS = Array.from({ length: 26 }, (_, i) => { const r = 1 + i * 1.1, v = vOf(mB(r) + mD(r) + mH(r, 170), r); return [r, v + (rnd() - 0.5) * 16]; });
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const vh = VH(), x0 = 44, x1 = w - 14, y0 = h - 26, y1 = 14, X = (r) => x0 + r / R * (x1 - x0), Y = (v) => y0 - v / 300 * (y0 - y1);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.mono}`; ctx.textAlign = "right"; [0, 100, 200, 300].forEach((v) => ctx.fillText(v, x0 - 4, Y(v) + 3)); ctx.textAlign = "center"; [0, 10, 20, 30].forEach((r) => ctx.fillText(`${r} kpc`, X(r), y0 + 12));
    ctx.save(); ctx.translate(11, (y0 + y1) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText("회전 속도 (km/s)", 0, 0); ctx.restore();
    const line = (f, col, lw, dash) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath(); for (let r = 0.2; r <= R; r += 0.2) { const y = Y(f(r)); r === 0.2 ? ctx.moveTo(X(r), y) : ctx.lineTo(X(r), y); } ctx.stroke(); ctx.setLineDash([]); };
    line((r) => vOf(mB(r), r), "rgba(224,160,42,.8)", 1.2, [3, 3]); line((r) => vOf(mD(r), r), "rgba(63,111,163,.8)", 1.2, [3, 3]);
    if (vh > 0) line((r) => vOf(mH(r, vh), r), "rgba(138,79,181,.8)", 1.2, [3, 3]);
    line((r) => vOf(mB(r) + mD(r), r), "#3b7c2a", 2);
    line((r) => vOf(mB(r) + mD(r) + mH(r, vh), r), C.warn, 2.6);
    OBS.forEach(([r, v]) => { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(r), Y(v), 3, 0, Math.PI * 2); ctx.fill(); });
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; let ly = y1 + 2;
    [["● 관측 (가상 자료)", C.ink], ["━ 보이는 물질만", "#3b7c2a"], ["━ 보이는 물질 + 암흑 물질", C.warn]].forEach(([t, col]) => { ctx.fillStyle = col; ctx.fillText(t, X(4), ly + 8); ly += 13; });
    let lx = X(4); [["┄ 팽대부", "rgba(224,160,42,1)"], ["┄ 원반", "rgba(63,111,163,1)"], ["┄ 헤일로", "rgba(138,79,181,1)"]].forEach(([t, col]) => { ctx.fillStyle = col; ctx.fillText(t, lx, ly + 8); lx += ctx.measureText(t).width + 10; });
  }
  function update() {
    const vh = VH(); oH.textContent = vh === 0 ? "없음" : `헤일로만의 회전 속도 약 ${Math.round(vh)} km/s 수준`;
    const r = 25, vis = mB(r) + mD(r), tot = vis + mH(r, vh), f = (m) => `${(m / 1e10).toFixed(1)} × 10¹⁰ 태양 질량`;
    nV.textContent = f(vis); nT.textContent = `${f(tot)} (보이는 물질 ${Math.round(vis / tot * 100)} %)`;
    const err = OBS.reduce((a, [rr, v]) => a + Math.abs(vOf(mB(rr) + mD(rr) + mH(rr, vh), rr) - v), 0) / OBS.length; nE.textContent = `${err.toFixed(0)} km/s ${err < 12 ? "— 관측과 잘 맞음" : ""}`;
    draw();
  }
  sH.addEventListener("input", update); update();
})();
