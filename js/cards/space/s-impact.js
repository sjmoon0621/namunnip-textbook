/* 카드: 작은 소행성 하나가 도시를 흔들 수 있을까? — ½mv², 알려진 사건 비교, 빈도 */
(() => {
  const root = document.getElementById("card-space-impact");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sD = $(".d"), oD = $(".d-out"), sV = $(".v"), oV = $(".v-out"), nE = $(".n-e"), nH = $(".n-h"), nF = $(".n-f"), nK = $(".n-k");
  let rho = 3000; const MT = 4.184e15;
  const EV = [["히로시마", 0.015], ["첼랴빈스크 2013", 0.5], ["퉁구스카 1908", 12], ["최대 수소 폭탄", 50], ["칙술루브 (공룡 멸종)", 1e8]];
  // 지름(m)별 평균 충돌 간격(년): 대략
  const FREQ = [[1, 0.04], [4, 1], [20, 60], [50, 1000], [140, 2e4], [1000, 5e5], [10000, 1e8]];
  const interval = (d) => { if (d <= FREQ[0][0]) return FREQ[0][1]; for (let i = 1; i < FREQ.length; i++) if (d <= FREQ[i][0]) { const [a, ya] = FREQ[i - 1], [b, yb] = FREQ[i], t = Math.log(d / a) / Math.log(b / a); return ya * (yb / ya) ** t; } return FREQ[FREQ.length - 1][1]; };
  const energy = () => { const d = 10 ** +sD.value, v = +sV.value * 1000, m = rho * Math.PI / 6 * d ** 3; return 0.5 * m * v * v / MT; };
  const fmtMt = (e) => e < 0.001 ? `${Math.round(e * 1e6).toLocaleString()} t` : e < 1 ? `${Math.round(e * 1000).toLocaleString()} kt` : e < 1e5 ? `${e < 10 ? e.toFixed(1) : Math.round(e).toLocaleString()} Mt` : `${e.toExponential(1).replace("e+", " × 10^")} Mt`;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const e = energy(), x0 = 20, x1 = w - 20, L0 = -6, L1 = 9, X = (v) => x0 + (Math.log10(v) - L0) / (L1 - L0) * (x1 - x0), yb = h * 0.55;
    const grad = ctx.createLinearGradient(x0, 0, x1, 0); grad.addColorStop(0, "#e9efe3"); grad.addColorStop(0.5, "#f2d9a8"); grad.addColorStop(1, "#d4493a"); ctx.fillStyle = grad; ctx.fillRect(x0, yb - 8, x1 - x0, 16);
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.mono}`; ctx.textAlign = "center"; for (let k = L0; k <= L1; k += 3) ctx.fillText(`10${String(k).replace("-", "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d])}`, X(10 ** k), yb + 24); ctx.fillText("Mt", x1, yb + 36);
    EV.forEach(([n, v], i) => { const x = X(v), dy = 28 + (i % 3) * 20; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, yb - 10); ctx.lineTo(x, yb - dy); ctx.stroke(); ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = x > w * 0.8 ? "right" : x < w * 0.2 ? "left" : "center"; ctx.fillText(n, x, yb - dy - 4); });
    const x = X(e); ctx.fillStyle = C.warn; ctx.beginPath(); ctx.moveTo(x, yb + 10); ctx.lineTo(x - 7, yb + 22); ctx.lineTo(x + 7, yb + 22); ctx.fill(); ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(fmtMt(e), Math.min(x1 - 30, Math.max(x0 + 30, x)), yb + 52);
    // 크기 비교 그림
    const d = 10 ** +sD.value, s = Math.max(2, Math.min(40, Math.log10(d + 1) * 10)); ctx.fillStyle = rho > 5000 ? "#7a7a80" : rho < 2000 ? "#bcd6e8" : "#8a6d57"; ctx.beginPath(); ctx.arc(w - 40, 30, s / 2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(`지름 ${d < 1000 ? d.toFixed(0) + " m" : (d / 1000).toFixed(1) + " km"}`, w - 60, 34);
  }
  function update() {
    root.querySelectorAll("[data-r]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.r === rho)));
    const d = 10 ** +sD.value, e = energy(); oD.textContent = d < 1000 ? d.toFixed(0) : `${(d / 1000).toFixed(1)} k`; oV.textContent = sV.value;
    nE.textContent = fmtMt(e); const hr = e / 0.015; nH.textContent = hr < 1 ? `${hr.toFixed(2)}배` : hr < 1e4 ? `약 ${Math.round(hr).toLocaleString()}배` : `약 ${hr.toExponential(0).replace("e+", " × 10^")}배`;
    const iv = interval(d); nF.textContent = iv < 1 ? `약 ${Math.max(1, Math.round(iv * 365))}일에 한 번` : iv < 1e6 ? `약 ${Math.round(iv).toLocaleString()}년에 한 번` : `약 ${(iv / 1e6).toFixed(0)}백만 년에 한 번`;
    nK.textContent = d < 25 && rho < 5000 ? "대기에서 타거나 공중 폭발 (섬광·충격파)" : d < 60 && rho < 5000 ? "공중 폭발, 넓은 숲이 쓰러질 정도 (퉁구스카형)" : d < 1000 ? `지상 충돌 · 지름 약 ${(d * 20 / 1000).toFixed(1)} km 운석 구덩이 · 지역 재난` : "전 지구적 기후 변화, 대멸종 가능";
    draw();
  }
  root.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => { rho = +b.dataset.r; update(); }));
  sD.addEventListener("input", update); sV.addEventListener("input", update); update();
})();
