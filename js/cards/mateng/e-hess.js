/* 카드: 잴 수 없는 반응의 열을 어떻게 알아낼까? — 헤스 법칙의 엔탈피 도표 (C → CO, 메테인의 생성 열) */
(() => {
  const root = document.getElementById("card-mateng-hess");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), eqs = $(".eqs"), reveal = $(".reveal");
  // 높이(kJ, 처음 = 0), 라벨; 경로들: [from, to, ΔH, 알려짐?]
  const EX = {
    co: { lv: [["C(s) + O₂(g)", 0], ["CO(g) + ½O₂(g)", -110.5], ["CO₂(g)", -393.5]],
      paths: [[0, 2, -393.5, true, "ΔH₁ (C 연소)"], [0, 1, -110.5, false, "ΔH₂ = ?"], [1, 2, -283.0, true, "ΔH₃ (CO 연소)"]],
      text: ["C(s) + O₂(g) → CO₂(g)   ΔH₁ = −393.5 kJ", "CO(g) + ½O₂(g) → CO₂(g)   ΔH₃ = −283.0 kJ", "구할 것: C(s) + ½O₂(g) → CO(g)   ΔH₂ = ΔH₁ − ΔH₃"] },
    ch4: { lv: [["C(s) + 2H₂(g) + 2O₂(g)", 0], ["CH₄(g) + 2O₂(g)", -74.8], ["CO₂(g) + 2H₂O(l)", -965.1]],
      paths: [[0, 2, -965.1, true, "C 연소 + H₂ 연소 ×2"], [0, 1, -74.8, false, "ΔH(생성) = ?"], [1, 2, -890.3, true, "CH₄ 연소"]],
      text: ["C 연소 −393.5 kJ, H₂ 연소 −285.8 kJ(×2), CH₄ 연소 −890.3 kJ", "왼쪽 경로: −393.5 + 2 × (−285.8) = −965.1 kJ", "구할 것: C(s) + 2H₂(g) → CH₄(g)   ΔH = −965.1 − (−890.3)"] },
  };
  let ex = "co", shown = false;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const E = EX[ex], top = 30, bot = h - 20, lo = Math.min(...E.lv.map((l) => l[1]));
    const Y = (v) => top + (v / lo) * (bot - top);
    const X = [w * 0.12, w * 0.5, w * 0.12];
    E.lv.forEach(([lab, v], i) => {
      const x = i === 1 ? w * 0.54 : w * 0.08, len = i === 2 ? w * 0.84 : w * 0.36;   // 마지막 상태는 두 경로가 모두 닿도록 넓게
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(x, Y(v)); ctx.lineTo(x + len, Y(v)); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `11.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(lab, x + 4, Y(v) - 7);
    });
    E.paths.forEach(([a, b, d, known, lab], i) => {
      const x = i === 0 ? w * 0.2 : i === 1 ? w * 0.62 : w * 0.84;
      const ya = Y(E.lv[a][1]), yb = Y(E.lv[b][1]);
      const col = known ? "#3f6fa3" : "#b5532f", show = known || shown;
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.2; ctx.setLineDash(show ? [] : [5, 4]);
      ctx.beginPath(); ctx.moveTo(x, ya + 2); ctx.lineTo(x, yb - 8); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(x, yb); ctx.lineTo(x - 5, yb - 10); ctx.lineTo(x + 5, yb - 10); ctx.fill();
      const right = i !== 0, lx = x + (right ? -8 : 8), ly = i === 1 ? ya + 22 : (ya + yb) / 2;
      ctx.font = `600 11px ${F.mono}`; ctx.textAlign = right ? "right" : "left";
      ctx.fillText(show ? `${d.toFixed(1)} kJ` : "? kJ", lx, ly);
      ctx.font = `10.5px ${F.sans}`; ctx.fillText(lab, lx, ly + 15);
    });
  }
  function update() {
    const E = EX[ex];
    eqs.innerHTML = E.text.map((t) => `${t}<br>`).join("") + (shown ? `<b>→ ${E.paths[1][2].toFixed(1)} kJ</b>` : "");
    reveal.textContent = shown ? "다시 가리기" : "모르는 ΔH 계산하기";
    root.querySelectorAll("[data-ex]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.ex === ex)));
    draw();
  }
  root.querySelectorAll("[data-ex]").forEach((b) => b.addEventListener("click", () => { ex = b.dataset.ex; shown = false; update(); }));
  reveal.addEventListener("click", () => { shown = !shown; update(); });
  update();
})();
