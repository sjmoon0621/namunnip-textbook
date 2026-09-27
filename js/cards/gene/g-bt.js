/* 카드: 해충을 죽이는 옥수수를 심으면 해충은 결국 이겨 낼까? — 저항성 대립유전자 빈도, 피난처 */
(() => {
  const root = document.getElementById("card-gene-bt");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sR = $(".r"), oR = $(".r-out"), nY = $(".n-y"), nF = $(".n-f");
  let hdom = 0.01; const Y = 40, Q0 = 0.001, S0 = 0.05; // S0: Bt 옥수수에서 감수성 해충(SS)의 생존율
  function run(ref, h) { const qs = [Q0]; let q = Q0; for (let t = 0; t < Y; t++) { const p = 1 - q, wSS = ref + (1 - ref) * S0, wSR = ref + (1 - ref) * (S0 + (1 - S0) * h), wRR = 1, wbar = p * p * wSS + 2 * p * q * wSR + q * q * wRR; q = (p * q * wSR + q * q * wRR) / wbar; qs.push(q); } return qs; }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 40, x1 = w - 12, y0 = h - 24, y1 = 14, X = (t) => x0 + t / Y * (x1 - x0), Yq = (q) => y0 - q * (y0 - y1);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; [0.5].forEach((q) => { ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x0, Yq(q)); ctx.lineTo(x1, Yq(q)); ctx.stroke(); ctx.setLineDash([]); });
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; [0, 0.5, 1].forEach((q) => ctx.fillText(q, x0 - 4, Yq(q) + 3)); ctx.textAlign = "center"; [0, 10, 20, 30, 40].forEach((t) => ctx.fillText(`${t}년`, X(t), y0 + 13));
    // 비교 곡선 (피난처 0 %) 과 현재
    [[0, "rgba(141,141,146,.7)", "피난처 없음"], [+sR.value / 100, C.warn, `피난처 ${sR.value}%`]].forEach(([ref, col, lab], k) => { const qs = run(ref, hdom); ctx.strokeStyle = col; ctx.lineWidth = k ? 2.6 : 1.6; ctx.beginPath(); qs.forEach((q, t) => (t ? ctx.lineTo(X(t), Yq(q)) : ctx.moveTo(X(t), Yq(q)))); ctx.stroke(); const t50 = qs.findIndex((q) => q > 0.5); ctx.fillStyle = col; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(lab, t50 > 0 ? X(t50) + 4 : X(Y) - 70, t50 > 0 ? Yq(0.5) - 6 - k * 12 : Yq(qs[Y]) - 6); });
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("저항성 대립유전자(R)의 빈도", x0 + 4, y1 + 4);
  }
  function update() {
    root.querySelectorAll("[data-d]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.d === hdom)));
    oR.textContent = sR.value; const qs = run(+sR.value / 100, hdom), t50 = qs.findIndex((q) => q > 0.5);
    nY.textContent = t50 > 0 ? `약 ${t50}년째` : `${Y}년 안에는 넘지 않음`; nF.textContent = `${(qs[20] ** 2 * 100).toFixed(qs[20] ** 2 < 0.01 ? 4 : 1)} %`; draw();
  }
  root.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => { hdom = +b.dataset.d; update(); }));
  sR.addEventListener("input", update); update();
})();
