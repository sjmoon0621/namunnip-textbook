/* 카드: 같은 농도의 산인데 pH는 왜 다를까? — Ka, 정확한 pH와 근사, 이온화도 */
(() => {
  const root = document.getElementById("card-rxn-weak-acid");
  if (!root || !window.NMAcid) return;
  const { C, F, fit } = NM, A = NMAcid;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sC = $(".c"), oC = $(".c-out"), nK = $(".n-k"), nPh = $(".n-ph"), nAp = $(".n-ap"), nA = $(".n-a");
  const D = { HCl: ["HCl", null, "Cl⁻"], HF: ["HF", 6.8e-4, "F⁻"], AcOH: ["CH₃COOH", 1.8e-5, "CH₃COO⁻"], HCN: ["HCN", 6.2e-10, "CN⁻"], NH3: ["NH₃", 1.8e-5, "NH₄⁺", true] };
  let k = "AcOH";
  const sup = (x) => { const e = Math.floor(Math.log10(x)), m = x / 10 ** e; return `${m.toFixed(1)} × 10${String(e).replace("-", "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d])}`; };
  function calc() {
    const c = 10 ** +sC.value, [, K, , base] = D[k];
    if (base) { const ph = A.pHbase({ C: c, Kb: K }), oh = 10 ** (ph - 14), x = oh - 1e-14 / oh; return { ph, alpha: Math.max(0, x) / c, approx: 14 + Math.log10(Math.sqrt(K * c)) }; }
    const ph = K === null ? A.pH({ strongA: c }) : A.pH({ Ca: c, Ka: K }), h = 10 ** -ph, x = K === null ? c : c * K / (K + h);
    return { ph, alpha: x / c, approx: K === null ? -Math.log10(c) : -Math.log10(Math.sqrt(K * c)) };
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = calc(), [name, , ion, base] = D[k], nIon = Math.round(r.alpha * 100), gw = w * 0.52, cell = Math.min(gw / 10, (h - 40) / 10);
    for (let i = 0; i < 100; i++) { const x = 16 + (i % 10) * cell + cell / 2, y = 26 + Math.floor(i / 10) * cell + cell / 2, on = i < nIon; ctx.fillStyle = on ? (base ? "#3f6fa3" : C.warn) : "#d9dad2"; ctx.beginPath(); ctx.arc(x, y, cell * 0.36, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`${name} 100개 중 ${base ? "양성자를 받은" : "이온화한"} 것 ${r.alpha * 100 < 1 ? (r.alpha * 100).toFixed(2) : nIon}개 (색칠: ${ion} 생성)`, 16, 16);
    // pH 눈금
    const x0 = w * 0.62, x1 = w - 16, yb = h * 0.5, X = (p) => x0 + p / 14 * (x1 - x0);
    const grad = ctx.createLinearGradient(x0, 0, x1, 0); grad.addColorStop(0, "#d4493a"); grad.addColorStop(0.5, "#74ab66"); grad.addColorStop(1, "#3b5bd9"); ctx.fillStyle = grad; ctx.fillRect(x0, yb - 8, x1 - x0, 16);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; [0, 7, 14].forEach((p) => ctx.fillText(p, X(p), yb + 24));
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(X(r.ph), yb - 10); ctx.lineTo(X(r.ph) - 6, yb - 20); ctx.lineTo(X(r.ph) + 6, yb - 20); ctx.fill(); ctx.font = `600 13px ${F.mono}`; ctx.fillText(`pH ${r.ph.toFixed(2)}`, X(r.ph), yb - 26);
  }
  function update() {
    root.querySelectorAll("[data-k]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.k === k)));
    const c = 10 ** +sC.value; oC.textContent = c >= 0.01 ? c.toFixed(2) : c.toFixed(4);
    const [, K, , base] = D[k], r = calc(); nK.textContent = K === null ? "매우 큼 (거의 100 % 이온화)" : `${base ? "Kb" : "Ka"} = ${sup(K)} (p${base ? "Kb" : "Ka"} ${(-Math.log10(K)).toFixed(2)})`;
    nPh.textContent = r.ph.toFixed(2); nAp.textContent = `${r.approx.toFixed(2)}${Math.abs(r.approx - r.ph) > 0.05 ? " (오차가 큼)" : ""}`; nA.textContent = `${(r.alpha * 100).toFixed(r.alpha < 0.01 ? 3 : 1)} %`;
    draw();
  }
  root.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => { k = b.dataset.k; update(); }));
  sC.addEventListener("input", update); update();
})();
