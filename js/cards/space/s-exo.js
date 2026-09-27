/* 카드: 외계 행성을 어떻게 찾을까? — 통과 깊이 (Rp/Rs)², 시선 속도 진폭, 거주 가능 영역 */
(() => {
  const root = document.getElementById("card-space-exoplanet");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sR = $(".r"), oR = $(".r-out"), oM = $(".m-out"), sA = $(".a"), oA = $(".a-out"), nD = $(".n-d"), nK = $(".n-k"), nP = $(".n-p"), nH = $(".n-h");
  // [반지름(태양), 질량(태양), 광도(태양), 색]
  const ST = { M: [0.3, 0.3, 0.012, "#e0603a"], G: [1, 1, 1, "#f5c542"], F: [1.4, 1.3, 3.2, "#f3f0c0"] };
  let st = "G"; const RE_RS = 1 / 109.1;
  const massOf = (r) => r < 1.6 ? r ** 3 : r < 4 ? 2.7 * r ** 1.3 : Math.min(318 * (r / 11.2) ** 0.5 * (r > 8 ? 1 : 0.3), 1000);
  function calc() {
    const [Rs, Ms, L] = ST[st], rp = +sR.value, a = 10 ** +sA.value, mp = massOf(rp);
    const depth = (rp * RE_RS / Rs) ** 2, P = Math.sqrt(a ** 3 / Ms), K = 28.43 * (mp / 317.8) * Ms ** (-2 / 3) * P ** (-1 / 3);
    const Teq = 255 * L ** 0.25 / Math.sqrt(a), hz = [0.95 * Math.sqrt(L), 1.67 * Math.sqrt(L)];
    return { Rs, Ms, L, rp, a, mp, depth, P, K, Teq, hz };
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = calc(), col = ST[st][3];
    // 통과 광도 곡선
    const x0 = 50, x1 = w - 12, ty0 = 16, ty1 = h * 0.42, dmax = Math.max(k.depth * 1.6, 0.0003), Yl = (f) => ty0 + (1 - f) / dmax * (ty1 - ty0);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, ty0); ctx.lineTo(x0, ty1); ctx.stroke();
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 200; i++) { const u = i / 200, x = x0 + u * (x1 - x0), inT = Math.abs(u - 0.5) < 0.12, ing = Math.max(0, Math.min(1, (0.12 - Math.abs(u - 0.5)) / 0.02)); const f = 1 - k.depth * (inT ? ing : 0); i ? ctx.lineTo(x, Yl(f)) : ctx.moveTo(x, Yl(f)); }
    ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("1", x0 - 4, ty0 + 4); ctx.fillText(`${(1 - dmax).toFixed(dmax < 0.001 ? 4 : 3)}`, x0 - 4, ty1);
    ctx.textAlign = "left"; ctx.font = `10px ${F.sans}`; ctx.fillText("별의 밝기 (통과할 때)", x0 + 6, ty0 + 10);
    // 별과 행성 그림 (가운데)
    const sx = w * 0.84, sy = (ty0 + ty1) / 2, SR = Math.min(26, h * 0.11) * Math.sqrt(k.Rs); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(sx, sy, SR, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(sx, sy, Math.max(1.2, SR * k.rp * RE_RS / k.Rs), 0, Math.PI * 2); ctx.fill();
    // 시선 속도 곡선
    const ry0 = h * 0.5, ry1 = h * 0.72, Kmax = Math.max(k.K * 1.3, 0.2), Yv = (v) => (ry0 + ry1) / 2 - v / Kmax * (ry1 - ry0) / 2;
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(x0, Yv(0)); ctx.lineTo(x1, Yv(0)); ctx.stroke();
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 200; i++) { const u = i / 200, x = x0 + u * (x1 - x0), v = k.K * Math.sin(2 * Math.PI * u * 2); i ? ctx.lineTo(x, Yv(v)) : ctx.moveTo(x, Yv(v)); } ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`별의 시선 속도 (±${k.K < 1 ? k.K.toFixed(2) : k.K.toFixed(1)} m/s)`, x0 + 6, ry0 - 2);
    // 거주 가능 영역 막대
    const hy = h - 20, X = (au) => x0 + (Math.log10(au) + 2) / 3 * (x1 - x0);
    ctx.fillStyle = "rgba(59,124,42,.25)"; ctx.fillRect(X(k.hz[0]), hy - 8, X(k.hz[1]) - X(k.hz[0]), 16);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, hy); ctx.lineTo(x1, hy); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x0, hy, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#3f8fdf"; ctx.beginPath(); ctx.arc(X(k.a), hy, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.mono}`; ctx.textAlign = "center"; [0.01, 0.1, 1, 10].forEach((au) => ctx.fillText(`${au} AU`, X(au), hy + 16)); ctx.fillStyle = C.forest; ctx.font = `10px ${F.sans}`; ctx.fillText("거주 가능 영역", (X(k.hz[0]) + X(k.hz[1])) / 2, hy - 12);
  }
  function update() {
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === st)));
    const k = calc(); oR.textContent = k.rp.toFixed(1); oM.textContent = k.mp < 10 ? k.mp.toFixed(1) : Math.round(k.mp); oA.textContent = k.a.toFixed(k.a < 0.1 ? 3 : 2);
    nD.textContent = `${(k.depth * 100).toFixed(k.depth < 0.001 ? 4 : 2)} %`; nK.textContent = `${k.K < 1 ? k.K.toFixed(2) : k.K.toFixed(1)} m/s`;
    nP.textContent = `${k.P < 0.1 ? (k.P * 365.25).toFixed(1) + "일" : k.P < 2 ? (k.P * 365.25).toFixed(0) + "일" : k.P.toFixed(1) + "년"} · 약 ${Math.round(k.Teq)} K (${Math.round(k.Teq - 273)} °C)`;
    nH.textContent = `${k.hz[0].toFixed(2)}~${k.hz[1].toFixed(2)} AU → 이 행성은 ${k.a < k.hz[0] ? "안쪽 (너무 뜨거움)" : k.a > k.hz[1] ? "바깥 (너무 차가움)" : "영역 안"}`;
    draw();
  }
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { st = b.dataset.s; update(); }));
  sR.addEventListener("input", update); sA.addEventListener("input", update); update();
})();
