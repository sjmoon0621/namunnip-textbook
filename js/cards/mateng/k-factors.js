/* 카드: 냉장고, 잘게 썬 장작, 촉매 장치는 각각 무엇을 바꿀까? — 농도·온도·촉매와 반응 속도, 에너지 도표 */
(() => {
  const root = document.getElementById("card-mateng-rate-factors");
  if (!root || !window.NMChem) return;
  const { C, F, fit } = NM, { above } = NMChem;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sC = $(".c"), sT = $(".t"), cat = $(".cat"), oC = $(".c-out"), oT = $(".t-out"), nR = $(".n-r"), nCol = $(".n-col"), nFr = $(".n-fr");
  const EA = 60, EAC = 40, DH = -30;
  const rel = () => { const T = +sT.value + 273.15, Ea = cat.checked ? EAC : EA; return +sC.value * Math.sqrt(T / 298.15) * above(Ea, T) / above(EA, 298.15); };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const gw = w * 0.62, x0 = 34, y0 = h - 26, ph = h - 50, E = (e) => y0 - (e + 40) / 110 * ph;
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0 - ph); ctx.lineTo(x0, y0); ctx.lineTo(gw, y0); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("반응 진행 →", (x0 + gw) / 2, y0 + 14);
    ctx.save(); ctx.translate(14, y0 - ph / 2); ctx.rotate(-Math.PI / 2); ctx.fillText("에너지", 0, 0); ctx.restore();
    const path = (Ea, col, lw, dash) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); for (let i = 0; i <= 100; i++) { const s = i / 100, xx = x0 + 10 + s * (gw - x0 - 20); let e; if (s < 0.2) e = 0; else if (s > 0.8) e = DH; else { const u = (s - 0.2) / 0.6; e = Ea * Math.sin(Math.PI * u) ** 2 * (u < 0.5 ? 1 : 1) + DH * (u > 0.5 ? (u - 0.5) * 2 : 0) * (1 - Math.sin(Math.PI * u) ** 2 * 0); } i ? ctx.lineTo(xx, E(e)) : ctx.moveTo(xx, E(e)); } ctx.stroke(); ctx.setLineDash([]); };
    path(EA, cat.checked ? "rgba(93,93,97,.5)" : C.ink, cat.checked ? 1.4 : 2.4, cat.checked ? [4, 4] : []);
    if (cat.checked) path(EAC, "#3b7c2a", 2.4, []);
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink2; ctx.fillText("반응물 A", x0 + 10, E(0) - 6); ctx.textAlign = "right"; ctx.fillText("생성물 B", gw - 10, E(DH) + 14);
    const xm = x0 + 10 + 0.5 * (gw - x0 - 20);
    ctx.strokeStyle = "#b5532f"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(xm + 20, E(0)); ctx.lineTo(xm + 20, E(cat.checked ? EAC : EA)); ctx.stroke();
    ctx.fillStyle = "#b5532f"; ctx.textAlign = "left"; ctx.fillText(`Eₐ = ${cat.checked ? EAC : EA} kJ/mol`, xm + 26, (E(0) + E(cat.checked ? EAC : EA)) / 2);
    // 오른쪽: 속도 막대 (로그 눈금)
    const bx = w * 0.7, bw = w * 0.22, r = rel(), L = (v) => Math.log10(Math.max(v, 1e-3));
    const Yb = (v) => y0 - (L(v) + 1) / 5 * ph;
    ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(bx, y0); ctx.lineTo(bx, y0 - ph); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; [0.1, 1, 10, 100, 1000, 10000].forEach((v) => { if (Yb(v) >= y0 - ph - 2) ctx.fillText(v >= 1000 ? `${v / 1000}천` : `${v}`, bx - 4, Yb(v) + 3); });
    ctx.fillStyle = "rgba(128,128,133,.5)"; ctx.fillRect(bx + 6, Yb(1), bw * 0.35, y0 - Yb(1));
    ctx.fillStyle = "#e0a02a"; ctx.fillRect(bx + 10 + bw * 0.4, Math.max(y0 - ph, Yb(r)), bw * 0.35, y0 - Math.max(y0 - ph, Yb(r)));
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("처음", bx + 6 + bw * 0.17, y0 + 12); ctx.fillText("지금", bx + 10 + bw * 0.57, y0 + 12);
    ctx.fillText("상대 속도 (로그 눈금)", bx + bw / 2, y0 - ph - 4 < 12 ? 12 : y0 - ph - 4);
  }
  function update() {
    oC.textContent = (+sC.value).toFixed(2).replace(/0$/, ""); oT.textContent = sT.value;
    const T = +sT.value + 273.15, r = rel();
    nR.textContent = r >= 100 ? `${Math.round(r).toLocaleString("ko-KR")}배` : `${r.toFixed(2)}배`;
    nCol.textContent = `${(+sC.value * Math.sqrt(T / 298.15)).toFixed(2)}배`;
    const f = above(cat.checked ? EAC : EA, T); nFr.textContent = f.toExponential(1).replace("e-", " × 10^−");
    draw();
  }
  [sC, sT].forEach((el) => el.addEventListener("input", update)); cat.addEventListener("change", update);
  update();
})();
