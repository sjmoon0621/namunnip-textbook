/* 카드: 은하수의 검은 틈에는 정말 별이 없을까? — 소광 A_λ ∝ 1/λ, 적색화, 거리 오차 */
(() => {
  const root = document.getElementById("card-space-extinction");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sA = $(".a"), oA = $(".a-out"), nF = $(".n-f"), nE = $(".n-e"), nD = $(".n-d");
  let T = 6000;
  const planck = (l, t) => 1 / (l ** 5 * (Math.exp(14388 / (l * t)) - 1)); // l μm
  const trans = (l, av) => 10 ** (-0.4 * av * 0.55 / l);
  function rgbOf(t, av) { // 파장 0.45(B) 0.55(G) 0.65(R) 세 점으로 대충 색 만들기
    const vals = [0.65, 0.55, 0.45].map((l) => planck(l, t) * trans(l, av)), mx = Math.max(...vals); return vals.map((v) => Math.round(255 * Math.pow(v / mx, 0.6)));
  }
  let seed = 1; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const av = +sA.value, lw = w * 0.46;
    // 왼쪽: 별 지도와 티끌 구름
    ctx.fillStyle = "#07080d"; ctx.fillRect(0, 0, lw, h); seed = 5;
    const cx = lw / 2, cy = h / 2, cr = Math.min(lw, h) * 0.32;
    for (let i = 0; i < 260; i++) { const x = rnd() * lw, y = rnd() * h, d = Math.hypot(x - cx, y - cy), inside = Math.max(0, 1 - d / cr), a = av * inside ** 0.7, f = 10 ** (-0.4 * a), [r, g, b] = rgbOf(4000 + rnd() * 12000, a); if (f < 0.03) continue; ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(1, f * (0.4 + rnd() * 0.6))})`; ctx.beginPath(); ctx.arc(x, y, 0.8 + rnd() * 1.4, 0, Math.PI * 2); ctx.fill(); }
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr); g.addColorStop(0, `rgba(40,25,15,${Math.min(0.9, av / 6)})`); g.addColorStop(1, "rgba(40,25,15,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#aaa"; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("티끌 구름 가운데일수록 소광이 큼", 8, h - 8);
    // 오른쪽: 스펙트럼
    const x0 = lw + 34, x1 = w - 10, y0 = h * 0.62, y1 = 16, L0 = 0.3, L1 = 1.0, X = (l) => x0 + (l - L0) / (L1 - L0) * (x1 - x0);
    let mx = 0; for (let l = L0; l <= L1; l += 0.005) mx = Math.max(mx, planck(l, T));
    const Yp = (v) => y0 - v / mx * (y0 - y1);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5; ctx.beginPath(); for (let l = L0; l <= L1; l += 0.005) { const y = Yp(planck(l, T)); l === L0 ? ctx.moveTo(X(l), y) : ctx.lineTo(X(l), y); } ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2.2; ctx.beginPath(); for (let l = L0; l <= L1; l += 0.005) { const y = Yp(planck(l, T) * trans(l, av)); l === L0 ? ctx.moveTo(X(l), y) : ctx.lineTo(X(l), y); } ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.mono}`; ctx.textAlign = "center"; [0.4, 0.55, 0.7, 0.9].forEach((l) => ctx.fillText(l, X(l), y0 + 12)); ctx.fillText("파장 (μm)", (x0 + x1) / 2, y0 + 24);
    ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "right"; ctx.fillStyle = C.ink3; ctx.fillText("점선: 원래 별빛", x1, y1 + 8); ctx.fillStyle = C.warn; ctx.fillText("실선: 티끌을 지난 별빛", x1, y1 + 20);
    // 색 비교
    const [r0, g0, b0] = rgbOf(T, 0), [r1, g1, b1] = rgbOf(T, av), sy = h * 0.8;
    [[x0 + 30, `rgb(${r0},${g0},${b0})`, "원래 색"], [x0 + 120, `rgb(${r1},${g1},${b1})`, "보이는 색"]].forEach(([x, col, t], i) => { ctx.fillStyle = "#07080d"; ctx.fillRect(x - 24, sy - 16, 48, 32); ctx.fillStyle = col; ctx.globalAlpha = i ? Math.max(0.15, 10 ** (-0.4 * av)) : 1; ctx.beginPath(); ctx.arc(x, sy, 10, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.fillText(t, x, sy + 28); });
  }
  function update() {
    root.querySelectorAll("[data-t]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.t === T)));
    const av = +sA.value; oA.textContent = av.toFixed(1); nF.textContent = `${(10 ** (-0.4 * av) * 100).toFixed(av > 4 ? 1 : 0)} %`; nE.textContent = `${(av / 3.1).toFixed(2)} 등급 더 붉게`; nD.textContent = `실제의 ${(10 ** (av / 5)).toFixed(2)}배 멀게 나옴`;
    draw();
  }
  root.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { T = +b.dataset.t; update(); }));
  sA.addEventListener("input", update); update();
})();
