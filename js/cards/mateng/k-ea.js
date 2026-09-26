/* 카드: 부딪친다고 모두 반응할까? — 맥스웰–볼츠만 에너지 분포와 활성화 에너지 이상인 분자의 비율 */
(() => {
  const root = document.getElementById("card-mateng-ea");
  if (!root || !window.NMChem) return;
  const { C, F, fit } = NM, { R, pdf, above } = NMChem;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), sE = $(".e"), oT = $(".t-out"), oE = $(".e-out"), nF = $(".n-f"), n10 = $(".n-10"), nAvg = $(".n-avg");
  const fmt = (p) => p >= 0.001 ? `${(p * 100).toFixed(p >= 0.1 ? 1 : 2)} %` : `${p.toExponential(1).replace("e-", " × 10^−")}`;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const T = +sT.value, Ea = +sE.value, Emax = Math.max(Ea * 1.25, 25), x0 = 40, y0 = h - 30, pw = w - x0 - 16, ph = h - 50;
    const ymax = pdf(R * 200 / 2, 200) * 1.05;   // 가장 낮은 온도의 봉우리에 맞춘 고정 눈금
    const X = (E) => x0 + E / Emax * pw, Y = (f) => y0 - f / ymax * ph;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0 - ph); ctx.lineTo(x0, y0); ctx.lineTo(x0 + pw, y0); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    const step = Emax > 60 ? 20 : 10; for (let E = 0; E <= Emax; E += step) ctx.fillText(`${E}`, X(E), y0 + 13);
    ctx.fillText("분자의 운동 에너지 (kJ/mol)", x0 + pw / 2, y0 + 26);
    ctx.save(); ctx.translate(14, y0 - ph / 2); ctx.rotate(-Math.PI / 2); ctx.fillText("분자 수의 비율", 0, 0); ctx.restore();
    // 색칠 (Eₐ 이상)
    ctx.fillStyle = "rgba(181,83,47,.35)"; ctx.beginPath(); ctx.moveTo(X(Ea), y0);
    for (let i = 0; i <= 100; i++) { const E = Ea + (Emax - Ea) * i / 100; ctx.lineTo(X(E), Y(pdf(E, T))); } ctx.lineTo(X(Emax), y0); ctx.closePath(); ctx.fill();
    // 곡선 (지금 T와 비교용 298 K)
    const curve = (TT, col, lw, dash) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); for (let i = 1; i <= 200; i++) { const E = Emax * i / 200; i > 1 ? ctx.lineTo(X(E), Y(pdf(E, TT))) : ctx.moveTo(X(E), Y(pdf(E, TT))); } ctx.stroke(); ctx.setLineDash([]); };
    if (Math.abs(T - 298) > 2) curve(298, "rgba(93,93,97,.6)", 1.4, [4, 4]);
    curve(T, "#3f6fa3", 2.4, []);
    ctx.strokeStyle = "#b5532f"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(Ea), y0); ctx.lineTo(X(Ea), y0 - ph); ctx.stroke();
    ctx.fillStyle = "#b5532f"; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`Eₐ = ${Ea}`, X(Ea) + 5, y0 - ph + 12);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.fillText(Math.abs(T - 298) > 2 ? "점선: 298 K" : "", x0 + 8, y0 - ph + 12);
  }
  function update() {
    const T = +sT.value, Ea = +sE.value; oT.textContent = T; oE.textContent = Ea;
    const f = above(Ea, T); nF.textContent = fmt(f); n10.textContent = `${(above(Ea, T + 10) / f).toFixed(2)}배`; nAvg.textContent = `${(1.5 * R * T).toFixed(2)} kJ/mol`;
    draw();
  }
  [sT, sE].forEach((el) => el.addEventListener("input", update));
  update();
})();
