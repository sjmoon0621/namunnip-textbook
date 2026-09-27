/* 카드: 혈액의 pH는 어떻게 7.4에 머물까? — 헨더슨–하셀바흐, 닫힌 계 vs 호흡(CO₂ 일정) */
(() => {
  const root = document.getElementById("card-rxn-buffer");
  if (!root || !window.NMAcid) return;
  const { C, F, fit } = NM, A = NMAcid;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sX = $(".x"), oX = $(".x-out"), nW = $(".n-w"), nB = $(".n-b"), nR = $(".n-r");
  const B = { ac: [4.74, 100, 100, "아세트산 완충 용액"], blood: [6.1, 24, 1.2, "혈액 (닫힌 계)"], lung: [6.1, 24, 1.2, "혈액 + 호흡"] }; // pKa, 짝염기 mM, 약산 mM
  let b = "blood";
  const water = (x) => x < 0 ? A.pH({ strongA: -x / 1000 }) : A.pH({ strongB: x / 1000 });
  function buf(x) { // x: mmol/L, 음수 = 강산
    const [pKa, base, acid] = B[b]; let bb = base + x, aa = b === "lung" ? acid : acid - x;
    if (bb <= 0) return water(x + base); if (aa <= 0 && b !== "lung") return water(x - acid);
    return pKa + Math.log10(bb / aa);
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 36, x1 = w - 14, y0 = h - 24, y1 = 12, X = (x) => x0 + (x + 20) / 40 * (x1 - x0), Y = (p) => y0 - p / 14 * (y0 - y1);
    if (b !== "ac") { ctx.fillStyle = "rgba(59,124,42,.14)"; ctx.fillRect(x0, Y(7.45), x1 - x0, Y(7.35) - Y(7.45)); ctx.fillStyle = C.forest; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("정상 혈액 7.35~7.45", x1 - 2, Y(7.45) - 3); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(X(0), y0); ctx.lineTo(X(0), y0 + 4); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; [0, 7, 14].forEach((p) => ctx.fillText(p, x0 - 4, Y(p) + 3)); ctx.textAlign = "center"; [-20, -10, 0, 10, 20].forEach((x) => ctx.fillText(x, X(x), y0 + 13));
    const curve = (f, col, lab) => { ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); for (let x = -20; x <= 20; x += 0.1) { const y = Y(Math.max(0, Math.min(14, f(x)))); x === -20 ? ctx.moveTo(X(x), y) : ctx.lineTo(X(x), y); } ctx.stroke(); const x = +sX.value; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(x), Y(f(x)), 4.5, 0, Math.PI * 2); ctx.fill(); ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(lab, X(-19.5), Y(f(-19.5)) - 8); };
    curve(water, C.warn, "순수한 물"); curve(buf, "#3f6fa3", B[b][3]);
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("← 강산 넣음", x0 + 4, y0 - 4); ctx.textAlign = "right"; ctx.fillText("강염기 넣음 →", x1, y0 - 4);
  }
  function update() {
    root.querySelectorAll("[data-b]").forEach((q) => q.setAttribute("aria-pressed", String(q.dataset.b === b)));
    const x = +sX.value; oX.textContent = String(x).replace("-", "−");
    nW.textContent = water(x).toFixed(2); nB.textContent = buf(x).toFixed(2);
    const [, base, acid] = B[b], bb = base + x, aa = b === "lung" ? acid : acid - x; nR.textContent = bb > 0 && aa > 0 ? `${bb.toFixed(1)} : ${aa.toFixed(1)} (mM)${b === "lung" ? " — 늘어난 CO₂는 숨으로 배출" : ""}` : "완충 능력을 넘어섬";
    draw();
  }
  root.querySelectorAll("[data-b]").forEach((q) => q.addEventListener("click", () => { b = q.dataset.b; update(); }));
  sX.addEventListener("input", update); update();
})();
