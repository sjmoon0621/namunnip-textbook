/* 카드: 작은 분자를 이으면 어떻게 비닐과 나일론이 될까? — 첨가·축합 중합, 반복 단위, 분자량 */
(() => {
  const root = document.getElementById("card-rxn-polymer");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sN = $(".n"), oN = $(".n-out"), nU = $(".n-u"), nK = $(".n-k"), nM = $(".n-m"), nX = $(".n-x");
  // [이름, 단위체들, 반복 단위, 반복 단위 식량, 축합?, 부산물, 쓰임, 구슬 색들]
  const P = {
    pe: ["폴리에틸렌", "에틸렌 CH₂=CH₂", "−CH₂−CH₂−", 28, false, "", "비닐봉지, 병, 전선 피복", ["#8d8d92"]],
    pvc: ["PVC", "염화 바이닐 CH₂=CHCl", "−CH₂−CHCl−", 62.5, false, "", "수도관, 창틀, 전선 피복", ["#3b7c2a"]],
    ps: ["폴리스타이렌", "스타이렌 CH₂=CH(C₆H₅)", "−CH₂−CH(C₆H₅)−", 104, false, "", "일회용 컵, 스티로폼 단열재", ["#8a4fb5"]],
    nylon: ["나일론 6,6", "헥사메틸렌다이아민 H₂N(CH₂)₆NH₂ + 아디프산 HOOC(CH₂)₄COOH", "−NH(CH₂)₆NH−CO(CH₂)₄CO−", 226, true, "H₂O", "옷감, 밧줄, 칫솔모", ["#3f6fa3", "#b5532f"]],
    pet: ["PET", "에틸렌 글라이콜 HOCH₂CH₂OH + 테레프탈산 HOOC−C₆H₄−COOH", "−OCH₂CH₂O−CO−C₆H₄−CO−", 192, true, "H₂O", "페트병, 폴리에스터 섬유", ["#e0a02a", "#3f6fa3"]],
  };
  let p = "pe";
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const [name, , ru, , cond, by, , cols] = P[p], n = Math.max(1, Math.round(10 ** +sN.value));
    // 위: 흩어진 단위체
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("단위체", 14, 16);
    for (let i = 0; i < 10; i++) { const x = 30 + i * (w - 60) / 9, y = 40 + (i % 2) * 14, col = cols[i % cols.length]; ctx.fillStyle = col; if (cond) { ctx.beginPath(); ctx.arc(x - 7, y, 8, 0, Math.PI * 2); ctx.arc(x + 7, y, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = `8px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(col === cols[0] && p === "nylon" ? "NH₂" : col === cols[0] ? "OH" : "COOH", x - 14, y - 10); } else { ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 5, y - 2); ctx.lineTo(x + 5, y - 2); ctx.moveTo(x - 5, y + 2); ctx.lineTo(x + 5, y + 2); ctx.stroke(); } }
    // 화살표
    ctx.fillStyle = C.ink3; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(cond ? `축합 중합 ↓ (${by} 빠져나옴)` : "첨가 중합 ↓ (이중 결합이 열림)", w / 2, h * 0.36);
    // 아래: 사슬
    const cy = h * 0.6, k = Math.min(n, 14), step = (w - 60) / 14;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(24, cy); ctx.lineTo(30 + (k - 1) * step + 14, cy); ctx.stroke();
    for (let i = 0; i < k; i++) { const x = 30 + i * step, col = cols[i % cols.length]; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, cy + (i % 2 ? -6 : 6), 10, 0, Math.PI * 2); ctx.fill(); if (cond && i > 0) { ctx.fillStyle = "#3f6fa3"; ctx.font = `9px ${F.sans}`; ctx.fillText("H₂O", x - step / 2, cy - 24 - (i % 2) * 8); } }
    if (n > 14) { ctx.fillStyle = C.ink2; ctx.font = `600 14px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(`… 모두 ${n.toLocaleString()}개가 이어짐`, w - 14, cy + 34); }
    // 반복 단위
    ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5; const ruW = cond ? step * 2 : step; ctx.strokeRect(30 + step - 16, cy - 22, ruW + 2, 44); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`반복 단위 [ ${ru} ]ₙ`, 14, h - 12);
    ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(name, w - 14, h - 12);
  }
  function update() {
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === p)));
    const [, mono, ru, mw, cond, by, use] = P[p], n = Math.max(1, Math.round(10 ** +sN.value)); oN.textContent = n.toLocaleString();
    nU.textContent = `${mono} → ${ru}`; nK.textContent = cond ? `축합 중합 · 반복 단위 하나마다 ${by} 2개 (모두 약 ${(2 * n).toLocaleString()}개)` : "첨가 중합 · 빠져나오는 분자 없음";
    const M = mw * n; nM.textContent = M >= 1e4 ? `약 ${Math.round(M / 1000).toLocaleString()},000` : `약 ${Math.round(M).toLocaleString()}`; nX.textContent = use; draw();
  }
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { p = b.dataset.p; update(); }));
  sN.addEventListener("input", update); update();
})();
