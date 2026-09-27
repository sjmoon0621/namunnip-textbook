/* 카드: 별까지의 거리는 어떤 사다리를 타고 잴까? — d = 1/p, 거리 지수, 거리 사다리 */
(() => {
  const root = document.getElementById("card-space-distance");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sP = $(".p"), oP = $(".p-out"), sM = $(".m"), oM = $(".m-out"), nD = $(".n-d"), nMM = $(".n-M"), nE = $(".n-e");
  let sig = 0.00002;
  // [방법, 최소 pc, 최대 pc, 색]
  const LAD = [["연주 시차 (히파르코스)", 1, 100, "#3f6fa3"], ["연주 시차 (가이아)", 1, 5000, "#3f6fa3"], ["주계열 맞추기 (성단)", 10, 1e5, "#3b7c2a"], ["세페이드 변광성", 1e3, 4e7, "#8a4fb5"], ["Ia형 초신성", 1e6, 3e9, "#b5532f"], ["허블 법칙 (적색 편이)", 1e7, 1e10, "#e0a02a"]];
  const fd = (d) => d < 1000 ? `${d.toFixed(d < 10 ? 2 : 0)} pc (${(d * 3.26).toFixed(d < 10 ? 1 : 0)}광년)` : d < 1e6 ? `${(d / 1000).toFixed(1)} kpc` : `${(d / 1e6).toFixed(1)} Mpc`;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = 10 ** +sP.value, d = 1 / p;
    // 위: 시차 그림
    const sx = w * 0.18, sy = h * 0.26, ro = Math.min(38, h * 0.13), starY = 14, ang = Math.atan2(ro, sy - starY);
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.ellipse(sx, sy, ro, ro * 0.35, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#f5c542"; ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.fill();
    [-1, 1].forEach((k) => { ctx.fillStyle = "#3f8fdf"; ctx.beginPath(); ctx.arc(sx + k * ro, sy, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "rgba(63,111,163,.5)"; ctx.beginPath(); ctx.moveTo(sx + k * ro, sy); ctx.lineTo(sx, starY); ctx.stroke(); });
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(sx, starY, 3, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.ink2; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("별", sx + 6, starY + 3); ctx.fillText("지구 (1월, 7월)", sx + ro + 6, sy + 3); ctx.fillText("p", sx + 3, starY + 22);
    ctx.fillStyle = C.ink3; ctx.fillText("각을 크게 과장한 그림", sx - ro, sy + ro * 0.35 + 14);
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.fillText(`p = ${p >= 0.01 ? p.toFixed(3) : (p * 1000).toFixed(2) + " mas"}  →  d = ${fd(d)}`, w * 0.42, sy - 10);
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink2; const err = sig / p; ctx.fillText(`시차 측정 오차 ${sig * 1000} mas → 거리 오차 약 ${err > 1 ? "100 % 이상 (측정 불가)" : (err < 0.01 ? (err * 100).toFixed(2) : Math.round(err * 100)) + " %"}`, w * 0.42, sy + 10);
    // 아래: 거리 사다리
    const x0 = 14, x1 = w - 14, L0 = 0, L1 = 10, X = (pc) => x0 + (Math.log10(pc) - L0) / (L1 - L0) * (x1 - x0), y0 = h * 0.5, rh = (h - y0 - 24) / LAD.length;
    LAD.forEach(([n, a, b, col], i) => { const y = y0 + i * rh; ctx.fillStyle = col; ctx.globalAlpha = (i === 0 && sig === 0.00002) || (i === 1 && sig === 0.001) ? 0.25 : 0.7; ctx.fillRect(X(a), y, X(b) - X(a), rh * 0.62); ctx.globalAlpha = 1; ctx.fillStyle = C.ink; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = X(b) > w * 0.75 ? "right" : "left"; ctx.fillText(n, X(b) > w * 0.75 ? X(a) - 4 : X(b) + 4, y + rh * 0.5); });
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.mono}`; ctx.textAlign = "center"; [[1, "1 pc"], [1e3, "1 kpc"], [1e6, "1 Mpc"], [1e9, "1 Gpc"]].forEach(([v, t]) => ctx.fillText(t, X(v), h - 8));
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(d), y0 - 6); ctx.lineTo(X(d), h - 20); ctx.stroke();
  }
  function update() {
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.s === sig)));
    const p = 10 ** +sP.value, d = 1 / p, m = +sM.value, M = m + 5 - 5 * Math.log10(d); oP.textContent = p >= 0.01 ? p.toFixed(3) : p.toPrecision(2); oM.textContent = m.toFixed(1);
    nD.textContent = fd(d); nMM.textContent = `${M.toFixed(2)} (태양은 +4.8)`; const e = sig / p; nE.textContent = e > 1 ? "측정 오차보다 시차가 작아 거리를 정할 수 없음" : `약 ±${e < 0.01 ? (e * 100).toFixed(2) : Math.round(e * 100)} % (10 % 이내로 잴 수 있는 한계 약 ${fd(0.1 / sig)})`;
    draw();
  }
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { sig = +b.dataset.s; update(); }));
  sP.addEventListener("input", update); sM.addEventListener("input", update); update();
})();
