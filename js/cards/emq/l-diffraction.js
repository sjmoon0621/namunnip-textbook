/* 카드: 틈이 많아질수록 무늬는 왜 더 날카로워질까? — 단일 슬릿 포락선 × 다중 슬릿 간섭 */
(() => {
  const root = document.getElementById("card-emq-diffraction");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sL = $(".l"), oL = $(".l-out"), sN = $(".n"), oN = $(".n-out"), sD = $(".d"), oD = $(".d-out"), sA = $(".a"), oA = $(".a-out"), nM = $(".n-m"), nS = $(".n-s");
  // 파장 → RGB (근사)
  function rgb(l) {
    let r = 0, g = 0, b = 0;
    if (l < 440) { r = (440 - l) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; } else if (l < 510) { g = 1; b = (510 - l) / 20; } else if (l < 580) { r = (l - 510) / 70; g = 1; } else if (l < 645) { r = 1; g = (645 - l) / 65; } else r = 1;
    return [r, g, b].map((v) => Math.round(255 * v));
  }
  const inten = (th, lam, N, d, a) => { const s = Math.sin(th), be = Math.PI * a * s / lam, ph = 2 * Math.PI * d * s / lam; const sinc = Math.abs(be) < 1e-6 ? 1 : Math.sin(be) / be; const sh = Math.sin(ph / 2); const arr = Math.abs(sh) < 1e-6 ? 1 : Math.sin(N * ph / 2) / (N * sh); return sinc * sinc * arr * arr; };
  const TH = 0.6; // ±0.6 rad
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const lam = +sL.value * 1e-3, N = +sN.value, d = +sD.value, a = Math.min(+sA.value, d * 0.95), [r, g, b] = rgb(+sL.value);
    const x0 = 14, x1 = w - 14, X = (th) => x0 + (th + TH) / (2 * TH) * (x1 - x0), M = 600;
    // 스크린 띠
    const sy = 10, sh = h * 0.22; ctx.fillStyle = "#050505"; ctx.fillRect(x0, sy, x1 - x0, sh);
    for (let i = 0; i < M; i++) { const th = -TH + 2 * TH * (i + 0.5) / M, I = Math.pow(inten(th, lam, N, d, a), 0.6); ctx.fillStyle = `rgba(${r},${g},${b},${I})`; ctx.fillRect(x0 + (x1 - x0) * i / M, sy, (x1 - x0) / M + 1, sh); }
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("스크린에 보이는 무늬 (밝기는 보기 좋게 조정)", x0, sy + sh + 13);
    // 그래프
    const gy0 = h - 22, gy1 = sy + sh + 26, Y = (I) => gy0 - I * (gy0 - gy1);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, gy0); ctx.lineTo(x1, gy0); ctx.stroke();
    // 단일 슬릿 포락선
    ctx.setLineDash([4, 3]); ctx.strokeStyle = C.ink3; ctx.beginPath(); for (let i = 0; i <= M; i++) { const th = -TH + 2 * TH * i / M, be = Math.PI * a * Math.sin(th) / lam, s = Math.abs(be) < 1e-6 ? 1 : (Math.sin(be) / be) ** 2; i ? ctx.lineTo(X(th), Y(s)) : ctx.moveTo(X(th), Y(s)); } ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = `rgb(${Math.round(r * 0.8)},${Math.round(g * 0.8)},${Math.round(b * 0.8)})`; ctx.lineWidth = 1.8; ctx.beginPath(); for (let i = 0; i <= M * 2; i++) { const th = -TH + 2 * TH * i / (M * 2); i ? ctx.lineTo(X(th), Y(inten(th, lam, N, d, a))) : ctx.moveTo(X(th), Y(inten(th, lam, N, d, a))); } ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; [-30, -15, 0, 15, 30].forEach((deg) => ctx.fillText(`${deg}°`, X(deg * Math.PI / 180), gy0 + 13));
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("점선: 틈 하나의 회절 무늬", x1, gy1 + 4);
  }
  function update() {
    if (+sA.value > +sD.value * 0.95) sA.value = (+sD.value * 0.95).toFixed(2);
    const lam = +sL.value * 1e-3, d = +sD.value, a = +sA.value; oL.textContent = sL.value; oN.textContent = sN.value; oD.textContent = d.toFixed(1); oA.textContent = a.toFixed(2);
    const ms = []; for (let m = 1; m <= 3; m++) { const s = m * lam / d; if (s < 1) ms.push(`${m}차 ${(Math.asin(s) * 180 / Math.PI).toFixed(1)}°`); } nM.textContent = +sN.value === 1 ? "틈이 하나라 주극대 없음" : `0차 0° · ${ms.join(" · ")}`;
    const s1 = lam / a; nS.textContent = s1 < 1 ? `${(Math.asin(s1) * 180 / Math.PI).toFixed(1)}°` : "없음 (틈이 파장보다 좁음)";
    draw();
  }
  [sL, sN, sD, sA].forEach((s) => s.addEventListener("input", update)); update();
})();
