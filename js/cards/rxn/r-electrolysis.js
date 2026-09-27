/* 카드: 전기를 얼마나 흘리면 금속을 얼마나 얻을까? — 전극 반응과 패러데이 법칙 */
(() => {
  const root = document.getElementById("card-rxn-electrolysis");
  if (!root) return;
  const { C, F: FT, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sI = $(".i"), oI = $(".i-out"), sT = $(".t"), oT = $(".t-out"), nQ = $(".n-q"), nC = $(".n-c"), nA = $(".n-a");
  const FC = 96500, VM = 24.5;
  // [이름, 음극 반응, 음극 생성물(이름, e⁻당 mol, 몰질량, 기체?), 양극 반응, 양극 생성물, 이온 목록]
  const M = {
    melt: ["NaCl 용융액 (약 800 °C)", "Na⁺ + e⁻ → Na", ["나트륨 Na (액체 금속)", 1, 23.0, false], "2Cl⁻ → Cl₂ + 2e⁻", ["염소 Cl₂", 0.5, 70.9, true], ["Na⁺", "Cl⁻"]],
    brine: ["NaCl 수용액", "2H₂O + 2e⁻ → H₂ + 2OH⁻", ["수소 H₂ (+ 용액에 NaOH)", 0.5, 2.02, true], "2Cl⁻ → Cl₂ + 2e⁻", ["염소 Cl₂", 0.5, 70.9, true], ["Na⁺", "Cl⁻", "H₂O"]],
    cu: ["CuSO₄ 수용액, 구리 전극", "Cu²⁺ + 2e⁻ → Cu", ["순수한 구리 Cu 석출", 0.5, 63.5, false], "Cu → Cu²⁺ + 2e⁻", ["불순한 구리 전극이 녹아 나감", 0.5, 63.5, false], ["Cu²⁺", "SO₄²⁻"]],
  };
  let m = "brine";
  const amt = ([name, per, mm, gas], ne) => { const n = ne * per; return gas ? `${name}: ${n.toFixed(4)} mol = ${(n * VM * 1000).toFixed(0)} mL` : `${name}: ${n.toFixed(4)} mol = ${(n * mm).toFixed(2)} g`; };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const [name, cr, , ar, , ions] = M[m], bx = w * 0.12, bw = w * 0.76, by = h * 0.3, bh = h * 0.6;
    ctx.fillStyle = m === "melt" ? "rgba(224,160,42,.18)" : m === "cu" ? "rgba(63,111,163,.22)" : "rgba(110,164,230,.12)"; ctx.fillRect(bx, by + 10, bw, bh - 10);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
    const ex1 = bx + bw * 0.22, ex2 = bx + bw * 0.78, ew = 14;
    ctx.fillStyle = m === "cu" ? "#b87333" : "#555"; ctx.fillRect(ex1 - ew / 2, by - 24, ew, bh * 0.8); ctx.fillStyle = m === "cu" ? "#9a6a3a" : "#555"; ctx.fillRect(ex2 - ew / 2, by - 24, ew, bh * 0.8);
    // 전원
    const ty = 18; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ex1, by - 24); ctx.lineTo(ex1, ty); ctx.lineTo(w / 2 - 10, ty); ctx.moveTo(w / 2 + 10, ty); ctx.lineTo(ex2, ty); ctx.lineTo(ex2, by - 24); ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w / 2 - 10, ty - 6); ctx.lineTo(w / 2 - 10, ty + 6); ctx.stroke(); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(w / 2 + 10, ty - 10); ctx.lineTo(w / 2 + 10, ty + 10); ctx.stroke(); // 짧고 굵은 쪽 (−), 긴 쪽 (+)
    ctx.fillStyle = C.ink2; ctx.font = `10px ${FT.sans}`; ctx.textAlign = "center"; ctx.fillText("전원", w / 2, ty - 12);
    ctx.fillStyle = "#3f6fa3"; ctx.font = `600 11px ${FT.sans}`; ctx.fillText("(−)극 · 환원", ex1, by - 30); ctx.fillStyle = C.warn; ctx.fillText("(+)극 · 산화", ex2, by - 30);
    ctx.fillStyle = C.forest; ctx.fillText("e⁻ ←", (ex1 + w / 2) / 2, ty - 4); ctx.fillText("← e⁻", (ex2 + w / 2) / 2, ty - 4);
    // 이온 이동
    ctx.font = `600 11px ${FT.sans}`; ions.forEach((ion, i) => { const pos = /⁺/.test(ion), yy = by + bh * (0.35 + 0.18 * i); if (ion === "H₂O") { ctx.fillStyle = C.ink3; ctx.fillText("H₂O", w / 2, yy); return; } ctx.fillStyle = pos ? "#3f6fa3" : C.warn; ctx.fillText(pos ? `← ${ion}` : `${ion} →`, w / 2, yy); });
    ctx.font = `10.5px ${FT.mono}`; ctx.fillStyle = "#3f6fa3"; ctx.textAlign = "left"; ctx.fillText(cr, bx + 6, by + bh - 10); ctx.fillStyle = C.warn; ctx.textAlign = "right"; ctx.fillText(ar, bx + bw - 6, by + bh - 24);
    // 생성물 표시
    const [, , cp, , ap] = M[m];
    if (cp[3]) for (let k = 0; k < 6; k++) { ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ex1 + (k % 2 ? 12 : -12), by + bh * 0.6 - k * 12, 4, 0, Math.PI * 2); ctx.stroke(); }
    else { ctx.fillStyle = m === "cu" ? "#d08a4a" : "#c9cdd2"; ctx.fillRect(ex1 - ew / 2 - 4, by + 10, ew + 8, bh * 0.55); }
    if (ap[3]) for (let k = 0; k < 6; k++) { ctx.strokeStyle = C.forest; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ex2 + (k % 2 ? 12 : -12), by + bh * 0.6 - k * 12, 4, 0, Math.PI * 2); ctx.stroke(); }
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${FT.sans}`; ctx.textAlign = "left"; ctx.fillText(name, bx + 4, by + 24);
  }
  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === m)));
    const I = +sI.value, t = +sT.value * 60, Q = I * t, ne = Q / FC; oI.textContent = I.toFixed(1); oT.textContent = sT.value;
    nQ.textContent = `${Math.round(Q).toLocaleString()} C · 전자 ${ne.toFixed(4)} mol`;
    nC.textContent = amt(M[m][2], ne); nA.textContent = amt(M[m][4], ne);
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { m = b.dataset.m; update(); }));
  sI.addEventListener("input", update); sT.addEventListener("input", update); update();
})();
