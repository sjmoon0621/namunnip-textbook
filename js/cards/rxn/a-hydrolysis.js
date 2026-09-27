/* 카드: 중화로 만든 염의 수용액은 왜 중성이 아닐 수 있을까? — 가수 분해, Kb = Kw/Ka */
(() => {
  const root = document.getElementById("card-rxn-hydrolysis");
  if (!root || !window.NMAcid) return;
  const { C, F, fit } = NM, A = NMAcid;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sC = $(".c"), oC = $(".c-out"), nO = $(".n-o"), nK = $(".n-k"), nPh = $(".n-ph");
  const sup = (x) => { const e = Math.floor(Math.log10(x)), m = x / 10 ** e; return `${m.toFixed(1)} × 10${String(e).replace("-", "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d])}`; };
  // [이름, 양이온, 음이온, 만든 산, 만든 염기, 반응하는 이온 설명, pH 계산]
  const S = {
    nacl: ["NaCl", "Na⁺", "Cl⁻", "HCl (강산)", "NaOH (강염기)", "없음 — Na⁺, Cl⁻ 모두 거의 반응하지 않음", () => 7, 0],
    naac: ["CH₃COONa", "Na⁺", "CH₃COO⁻", "CH₃COOH (약산)", "NaOH (강염기)", `CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻, Kb = Kw/Ka = ${sup(1e-14 / 1.8e-5)}`, (c) => A.pH({ Cb: c, Ka: 1.8e-5 }), 1],
    nh4cl: ["NH₄Cl", "NH₄⁺", "Cl⁻", "HCl (강산)", "NH₃ (약염기)", `NH₄⁺ + H₂O ⇌ NH₃ + H₃O⁺, Ka = Kw/Kb = ${sup(1e-14 / 1.8e-5)}`, (c) => A.pHbase({ C: 0, Kb: 1.8e-5, Cacid: c }), -1],
    nacn: ["NaCN", "Na⁺", "CN⁻", "HCN (매우 약한 산)", "NaOH (강염기)", `CN⁻ + H₂O ⇌ HCN + OH⁻, Kb = Kw/Ka = ${sup(1e-14 / 6.2e-10)}`, (c) => A.pH({ Cb: c, Ka: 6.2e-10 }), 1],
    nahco3: ["NaHCO₃", "Na⁺", "HCO₃⁻", "H₂CO₃ (약산)", "NaOH (강염기)", "HCO₃⁻는 산(Ka₂)으로도 염기(Kw/Ka₁)로도 반응 — 염기 쪽이 조금 더 셈", () => (6.37 + 10.33) / 2, 1],
  };
  let s = "naac";
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const [name, cat, an, , , , f, dir] = S[s], c = 10 ** +sC.value, ph = f(c);
    // 비커
    const bx = 20, bw = w * 0.5, by = 20, bh = h - 50;
    ctx.fillStyle = "rgba(110,164,230,.12)"; ctx.fillRect(bx, by + 20, bw, bh - 20); ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
    const ion = (x, y, t, col) => { ctx.font = `600 10px ${F.sans}`; const rr = Math.max(15, ctx.measureText(t).width / 2 + 5); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = `600 10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(t, x, y + 3.5); };
    const catReact = s === "nh4cl", anReact = dir === 1;
    [[0.25, 0.4], [0.7, 0.6]].forEach(([fx, fy], i) => { ion(bx + bw * fx, by + bh * fy, cat, catReact ? C.warn : "#9a9aa0"); ion(bx + bw * (fx + 0.15), by + bh * (fy + 0.22), an, anReact ? "#3f6fa3" : "#9a9aa0"); });
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`${name} 수용액`, bx + 6, by + 14);
    if (dir !== 0) { const t = dir > 0 ? `${an} + H₂O → … + OH⁻` : `${cat} + H₂O → … + H₃O⁺`; ctx.fillStyle = dir > 0 ? "#3f6fa3" : C.warn; ctx.font = `600 11px ${F.sans}`; ctx.fillText(t, bx + 6, by + bh - 8); }
    else { ctx.fillStyle = C.ink3; ctx.fillText("어느 이온도 물과 거의 반응하지 않음", bx + 6, by + bh - 8); }
    // pH 눈금
    const x0 = w * 0.6, x1 = w - 16, yb = h * 0.5, X = (p) => x0 + p / 14 * (x1 - x0);
    const grad = ctx.createLinearGradient(x0, 0, x1, 0); grad.addColorStop(0, "#d4493a"); grad.addColorStop(0.5, "#74ab66"); grad.addColorStop(1, "#3b5bd9"); ctx.fillStyle = grad; ctx.fillRect(x0, yb - 8, x1 - x0, 16);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; [0, 7, 14].forEach((p) => ctx.fillText(p, X(p), yb + 24));
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(X(ph), yb - 10); ctx.lineTo(X(ph) - 6, yb - 20); ctx.lineTo(X(ph) + 6, yb - 20); ctx.fill(); ctx.font = `600 13px ${F.mono}`; ctx.fillText(`pH ${ph.toFixed(2)}`, X(ph), yb - 26);
    ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = ph < 6.8 ? C.warn : ph > 7.2 ? "#3f6fa3" : C.forest; ctx.fillText(ph < 6.8 ? "산성" : ph > 7.2 ? "염기성" : "중성", X(ph), yb + 42);
  }
  function update() {
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === s)));
    const c = 10 ** +sC.value; oC.textContent = c >= 0.01 ? c.toFixed(2) : c.toFixed(3);
    const [, , , a, b, t, f] = S[s]; nO.textContent = `${a} + ${b}`; nK.textContent = t; nPh.textContent = f(c).toFixed(2);
    draw();
  }
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { s = b.dataset.s; update(); }));
  sC.addEventListener("input", update); update();
})();
