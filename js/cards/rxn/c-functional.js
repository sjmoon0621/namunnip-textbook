/* 카드: 원자 몇 개가 바뀌면 술이 식초가 될까? — 작용기 강조 구조식과 끓는점 */
(() => {
  const root = document.getElementById("card-rxn-functional");
  if (!root || !window.NMMol) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), nG = $(".n-g"), nP = $(".n-p"), nU = $(".n-u");
  const z = 0.5;
  // [이름, 분자, 작용기, 끓는점, 분자량, 물, 쓰임]
  const M = {
    meoh: ["메탄올", { n: [["CH₃", 0, 0], ["O", 1, z, 1], ["H", 2, z, 1]], b: [[0, 1, 1], [1, 2, 1]] }, "하이드록시기 −OH (알코올)", 65, 32, "잘 섞임", "연료, 포름알데하이드 원료 (독성 있음)"],
    etoh: ["에탄올", { n: [["CH₃", 0, 0], ["CH₂", 1, z], ["O", 2, 0, 1], ["H", 3, z, 1]], b: [[0, 1, 1], [1, 2, 1], [2, 3, 1]] }, "하이드록시기 −OH (알코올)", 78, 46, "잘 섞임", "술, 소독용 알코올, 바이오 연료"],
    hcho: ["폼알데하이드", { n: [["H", 0, 0, 1], ["C", 1, z, 1], ["O", 1, z + 1, 1], ["H", 2, 0, 1]], b: [[0, 1, 1], [1, 2, 2], [1, 3, 1]] }, "폼일기 −CHO (알데하이드)", -19, 30, "잘 녹음 (수용액이 포르말린)", "접착제·수지 원료, 표본 보존 (발암 물질)"],
    acoh: ["아세트산", { n: [["CH₃", 0, 0], ["C", 1, z, 1], ["O", 1, z + 1, 1], ["O", 2, 0, 1], ["H", 3, z, 1]], b: [[0, 1, 1], [1, 2, 2], [1, 3, 1], [3, 4, 1]] }, "카복실기 −COOH (카복실산)", 118, 60, "잘 섞임 (약산)", "식초(약 4~5 %), 아세트산 에틸·섬유 원료"],
    acetone: ["아세톤", { n: [["CH₃", 0, 0], ["C", 1, z, 1], ["O", 1, z + 1, 1], ["CH₃", 2, 0]], b: [[0, 1, 1], [1, 2, 2], [1, 3, 1]] }, "카보닐기 C=O (케톤)", 56, 58, "잘 섞임", "용매, 매니큐어 제거제"],
    etac: ["아세트산 에틸", { n: [["CH₃", 0, 0], ["C", 1, z, 1], ["O", 1, z + 1, 1], ["O", 2, 0, 1], ["CH₂", 3, z], ["CH₃", 4, 0]], b: [[0, 1, 1], [1, 2, 2], [1, 3, 1], [3, 4, 1], [4, 5, 1]] }, "에스터 결합 −COO− (에스터)", 77, 88, "조금 녹음", "과일 향, 접착제·페인트 용매"],
    mena: ["메틸아민", { n: [["CH₃", 0, 0], ["N", 1, z, 1], ["H", 2, z + 0.1, 1], ["H", 1, z + 1, 1]], b: [[0, 1, 1], [1, 2, 1], [1, 3, 1]] }, "아미노기 −NH₂ (아민)", -6, 31, "잘 녹음 (약염기)", "의약품·농약 원료, 생선 비린내 성분의 친척"],
    propane: ["프로페인", { n: [["CH₃", 0, 0], ["CH₂", 1, z], ["CH₃", 2, 0]], b: [[0, 1, 1], [1, 2, 1]] }, "없음 (탄화수소)", -42, 44, "거의 녹지 않음", "LPG 연료"],
  };
  let m = "etoh";
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const [name, mol] = M[m], xs = mol.n.map((n) => n[1]), ys = mol.n.map((n) => n[2]), sc = Math.min((w * 0.52) / (Math.max(...xs) - Math.min(...xs) + 1.4), (h * 0.7) / (Math.max(...ys) - Math.min(...ys) + 1.4), 70);
    const cx = w * 0.3 - (Math.max(...xs) + Math.min(...xs)) / 2 * sc, cy = h * 0.52 + (Math.max(...ys) + Math.min(...ys)) / 2 * sc;
    NMMol.draw(ctx, mol, cx, cy, sc, F, "rgba(224,160,42,.3)");
    ctx.fillStyle = C.ink; ctx.font = `600 14px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(name, 14, 22);
    // 끓는점 막대
    const keys = ["propane", "hcho", "mena", "meoh", "etoh", "acetone", "etac", "acoh"], gx0 = w * 0.64, gx1 = w - 14, t0 = -60, t1 = 130, X = (t) => gx0 + (t - t0) / (t1 - t0) * (gx1 - gx0), rh = (h - 40) / keys.length;
    ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(X(0), 16); ctx.lineTo(X(0), h - 18); ctx.stroke(); ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(25), 16); ctx.lineTo(X(25), h - 18); ctx.stroke(); ctx.setLineDash([]);
    keys.forEach((k, i) => { const [nm, , , bp, mw] = M[k], y = 20 + i * rh; ctx.fillStyle = k === m ? C.warn : "rgba(63,111,163,.5)"; const xa = X(Math.min(0, bp)), xb = X(Math.max(0, bp)); ctx.fillRect(xa, y, xb - xa, rh * 0.6); ctx.fillStyle = k === m ? C.ink : C.ink2; ctx.font = `${k === m ? "600 " : ""}10px ${F.sans}`; ctx.textAlign = bp < 0 ? "left" : "right"; ctx.fillText(`${nm} (${mw}) ${bp}°C`, bp < 0 ? X(0) + 3 : X(0) - 3, y + rh * 0.5); });
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("끓는점 · 점선 25 °C (실온)", (gx0 + gx1) / 2, h - 4);
  }
  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === m)));
    const [, , g, bp, , wtr, use] = M[m]; nG.textContent = g; nP.textContent = `${bp} °C · 물에 ${wtr}`; nU.textContent = use; draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { m = b.dataset.m; update(); }));
  update();
})();
