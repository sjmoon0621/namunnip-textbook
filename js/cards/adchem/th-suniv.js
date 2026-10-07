/* 카드: 물이 얼면 질서가 생기는데, 왜 저절로 얼까? — ΔS계, ΔS주위 = −ΔH/T, ΔS우주 */
(() => {
  const root = document.getElementById("card-adchem-suniv");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t");
  /* dH: kJ, dS: J/K (반응식 몰수 기준), T 범위: K. S° 값은 CRC Handbook(25 °C, 1 bar) */
  const RX = {
    ice: { eq: "H₂O(l) → H₂O(s)", dH: -6.01, dS: -22.0, T: [253, 293], tbl: "융해 엔탈피 6.01 kJ/mol (0 °C) → ΔS = −6010 / 273.15 K" },
    vap: { eq: "H₂O(l) → H₂O(g)", dH: 44.0, dS: 118.8, T: [320, 420], tbl: "S° (J/mol·K): H₂O(l) 70.0, H₂O(g) 188.8" },
    nh3: { eq: "N₂(g) + 3H₂(g) → 2NH₃(g)", dH: -91.8, dS: -198.1, T: [250, 800], tbl: "S°: N₂ 191.6, H₂ 130.7, NH₃ 192.8" },
    caco3: { eq: "CaCO₃(s) → CaO(s) + CO₂(g)", dH: 179.2, dS: 160.2, T: [800, 1400], tbl: "S°: CaCO₃ 91.7, CaO 38.1, CO₂ 213.8" },
    nh4: { eq: "NH₄NO₃(s) → NH₄⁺(aq) + NO₃⁻(aq)", dH: 25.7, dS: 108.7, T: [200, 350], tbl: "S°: NH₄NO₃(s) 151.1, NH₄⁺(aq) 113.4, NO₃⁻(aq) 146.4" },
  };
  let r = "ice";
  const curT = () => { const [a, b] = RX[r].T; return a + (b - a) * +sT.value; };
  const surr = (T) => -RX[r].dH * 1000 / T;
  const fmt = (x, d = 1) => (x > 0 ? "+" : "") + x.toFixed(d).replace("-", "−");

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const R = RX[r], T = curT(), sS = R.dS, sO = surr(T), sU = sS + sO;
    const [Ta, Tb] = R.T;
    /* y 범위: 그래프 전체에서 공통 */
    let m = Math.max(Math.abs(sS), Math.abs(surr(Ta)), Math.abs(surr(Tb)), Math.abs(sS + surr(Ta)), Math.abs(sS + surr(Tb)));
    m *= 1.12;
    const top = 22, bot = h - 30, mid = (top + bot) / 2, Yv = (v) => mid - v / m * (bot - top) / 2;
    /* 왼쪽: 막대 */
    const lx0 = 44, lx1 = w * 0.38;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lx0, mid); ctx.lineTo(lx1, mid); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right";
    [m, 0, -m].forEach((v) => ctx.fillText(fmt(v, 0), lx0 - 4, Yv(v) + 3));
    ctx.textAlign = "left"; ctx.fillText("J/K", 4, 12);
    const bw = (lx1 - lx0) / 3;
    [[sS, "계", "#3f6fa3"], [sO, "주위", C.amber], [sU, "우주", sU >= 0 ? C.forest : C.warn]].forEach(([v, lab, col], i) => {
      const x = lx0 + bw * i + bw * 0.2, ww = bw * 0.6;
      ctx.fillStyle = col; ctx.fillRect(x, Math.min(Yv(v), mid), ww, Math.max(Math.abs(Yv(v) - mid), 1));
      ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(lab, x + ww / 2, h - 10);
    });
    /* 오른쪽: 온도에 따른 ΔS우주 (자체 눈금) */
    const rx0 = w * 0.47 + 30, rx1 = w - 10;
    const X = (t) => rx0 + (t - Ta) / (Tb - Ta) * (rx1 - rx0);
    const fU = (t) => sS + surr(t);
    const mu = Math.max(Math.abs(fU(Ta)), Math.abs(fU(Tb)), 0.5) * 1.15;
    const Yu = (v) => mid - v / mu * (bot - top) / 2;
    ctx.fillStyle = "rgba(59,124,42,.08)"; ctx.fillRect(rx0, top, rx1 - rx0, mid - top);
    ctx.fillStyle = "rgba(181,83,47,.07)"; ctx.fillRect(rx0, mid, rx1 - rx0, bot - mid);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(rx0, top); ctx.lineTo(rx0, bot); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(rx0, mid); ctx.lineTo(rx1, mid); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right";
    [mu, 0, -mu].forEach((v) => ctx.fillText(fmt(v, mu < 10 ? 1 : 0), rx0 - 4, Yu(v) + 3));
    ctx.textAlign = "left"; ctx.fillStyle = C.ink2; ctx.font = `600 11px ${F.sans}`;
    ctx.fillText("ΔS우주 (J/K) — 막대와 눈금이 다릅니다", rx0, top - 8);
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.forest; ctx.fillText("자발적", rx0 + 5, top + 13);
    ctx.fillStyle = C.warn; ctx.fillText("비자발적", rx0 + 5, bot - 5);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.4; ctx.beginPath();
    for (let i = 0; i <= 100; i++) { const t = Ta + (Tb - Ta) * i / 100, y = Yu(fU(t)); i ? ctx.lineTo(X(t), y) : ctx.moveTo(X(t), y); }
    ctx.stroke();
    const Tx = R.dH / R.dS * 1000;
    if (Tx > Ta && Tx < Tb) {
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(X(Tx), top); ctx.lineTo(X(Tx), bot); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`;
      const right = X(Tx) > (rx0 + rx1) / 2;
      ctx.textAlign = right ? "right" : "left";
      ctx.fillText(`ΔH/ΔS = ${Tx.toFixed(0)} K`, X(Tx) + (right ? -5 : 5), fU(Ta) > 0 ? bot - 20 : top + 30);
    }
    ctx.fillStyle = sU >= 0 ? C.forest : C.warn; ctx.beginPath(); ctx.arc(X(T), Yu(sU), 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`${Ta} K`, rx0, bot + 14);
    ctx.textAlign = "right"; ctx.fillText(`${Tb} K`, rx1, bot + 14);
    ctx.textAlign = "center"; ctx.fillText("T", (rx0 + rx1) / 2, bot + 14);
  }

  function update() {
    root.querySelectorAll("[data-r]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.r === r)));
    const R = RX[r], T = curT(), sO = surr(T), sU = R.dS + sO;
    $(".eq").textContent = `${R.eq}   ΔH° = ${fmt(R.dH, Math.round(Math.abs(R.dH) * 100) % 10 ? 2 : 1)} kJ`;
    $(".s-tbl").textContent = R.tbl;
    $(".t-out").textContent = `${T.toFixed(0)} K (${(T - 273.15).toFixed(0).replace("-", "−")} °C)`;
    $(".n-s").textContent = fmt(R.dS); $(".n-o").textContent = fmt(sO);
    const u = $(".n-u"); u.textContent = fmt(sU) + (sU > 0 ? " 자발적" : " 비자발적");
    u.className = "n-u " + (sU > 0 ? "good" : "bad");
    draw();
  }
  root.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => { r = b.dataset.r; update(); }));
  sT.addEventListener("input", update);
  update();
})();
