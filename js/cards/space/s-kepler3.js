/* 카드: 위성의 궤도만 보고 목성의 질량을 잴 수 있을까? — a³/T² = GM/4π² */
(() => {
  const root = document.getElementById("card-space-kepler3");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sA = $(".a"), oA = $(".a-out"), nK = $(".n-k"), nM = $(".n-m"), nT = $(".n-t");
  const G = 6.674e-11, AU = 1.496e11, DAY = 86400, YR = 3.156e7, KM = 1000;
  // [이름, a(m), T(s)]
  const S = {
    sun: ["태양", "#e0a02a", [["수성", 0.387 * AU, 0.241 * YR], ["금성", 0.723 * AU, 0.615 * YR], ["지구", AU, YR], ["화성", 1.524 * AU, 1.881 * YR], ["목성", 5.203 * AU, 11.86 * YR], ["토성", 9.537 * AU, 29.46 * YR], ["천왕성", 19.19 * AU, 84.0 * YR], ["해왕성", 30.07 * AU, 164.8 * YR]], [0.2 * AU, 50 * AU]],
    jup: ["목성", "#b5532f", [["이오", 421700 * KM, 1.769 * DAY], ["유로파", 671100 * KM, 3.551 * DAY], ["가니메데", 1070400 * KM, 7.155 * DAY], ["칼리스토", 1882700 * KM, 16.69 * DAY]], [2e8, 4e9]],
    earth: ["지구", "#3f6fa3", [["국제 우주 정거장", 6771 * KM, 92.7 * 60], ["GPS 위성", 26560 * KM, 11.97 * 3600], ["정지 궤도 위성", 42164 * KM, 23.93 * 3600], ["달", 384400 * KM, 27.32 * DAY]], [6.6e6, 6e8]],
  };
  let s = "sun";
  const kOf = (sys) => { const L = S[sys][2]; return L.reduce((a, [, r, t]) => a + r ** 3 / t ** 2, 0) / L.length; };
  const sci = (x) => { const e = Math.floor(Math.log10(x)), m = x / 10 ** e; return `${m.toFixed(2)} × 10${String(e).replace("-", "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d])}`; };
  const aNow = () => { const [lo, hi] = S[s][3]; return lo * (hi / lo) ** (+sA.value / 100); };
  const fa = (a) => a > 0.05 * AU ? `${(a / AU).toFixed(2)} AU` : `${Math.round(a / KM).toLocaleString()} km`;
  const ft = (t) => t > YR ? `${(t / YR).toFixed(2)}년` : t > DAY ? `${(t / DAY).toFixed(2)}일` : `${(t / 3600).toFixed(2)}시간`;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 46, x1 = w - 12, y0 = h - 26, y1 = 12, la0 = 6.5, la1 = 13, lt0 = 3.5, lt1 = 10, X = (a) => x0 + (Math.log10(a) - la0) / (la1 - la0) * (x1 - x0), Y = (t) => y0 - (Math.log10(t) - lt0) / (lt1 - lt0) * (y0 - y1);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "center"; [[1e7, "1만 km"], [1e9, "100만 km"], [AU, "1 AU"], [1e13, "70 AU"]].forEach(([a, t]) => ctx.fillText(t, X(a), y0 + 13)); ctx.textAlign = "right"; [[3600, "1시간"], [DAY, "1일"], [YR, "1년"], [100 * YR, "100년"]].forEach(([t, l]) => ctx.fillText(l, x0 - 4, Y(t) + 3));
    Object.entries(S).forEach(([key, [nm, col, L]]) => {
      const K = kOf(key), sel = key === s; ctx.strokeStyle = col; ctx.globalAlpha = sel ? 1 : 0.35; ctx.lineWidth = sel ? 2 : 1; ctx.beginPath(); for (let la = la0; la <= la1; la += 0.1) { const a = 10 ** la, t = Math.sqrt(a ** 3 / K); la === la0 ? ctx.moveTo(X(a), Y(t)) : ctx.lineTo(X(a), Y(t)); } ctx.stroke();
      L.forEach(([n, a, t]) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(a), Y(t), sel ? 4.5 : 3, 0, Math.PI * 2); ctx.fill(); if (sel) { ctx.fillStyle = C.ink2; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(n, X(a) + 6, Y(t) + 3); } });
      ctx.globalAlpha = 1;
    });
    const a = aNow(), t = Math.sqrt(a ** 3 / kOf(s)); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(a), Y(t), 6, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("로그 눈금 · 선의 기울기 1.5", x0 + 6, y1 + 8);
  }
  function update() {
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === s)));
    const K = kOf(s), M = 4 * Math.PI ** 2 * K / G, a = aNow(), t = Math.sqrt(a ** 3 / K);
    oA.textContent = fa(a); nK.textContent = `${sci(K)} m³/s²`;
    const ME = 5.97e24, MS = 1.989e30; const r = M / ME; nM.textContent = `${sci(M)} kg (지구의 ${r > 1000 ? Math.round(r).toLocaleString() : r.toPrecision(3)}배)`;
    nT.textContent = ft(t); draw();
  }
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { s = b.dataset.s; update(); }));
  sA.addEventListener("input", update); update();
})();
