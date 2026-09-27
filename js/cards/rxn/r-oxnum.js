/* 카드: 복잡한 산화·환원 반응식의 계수는 어떻게 맞출까? — 산화수 표시와 반쪽 반응식 단계 */
(() => {
  const root = document.getElementById("card-rxn-oxnum");
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  const box = $(".eqs"), nS = $(".n-s"), nE = $(".n-e");
  // 식 표기: [종, 산화수] → "Cu<sup>0</sup>"
  const o = (sp, n) => `${sp}<sup class="on">${n > 0 ? "+" + n : n}</sup>`;
  const R = [
    { e: 2, steps: [
      ["반응물과 생성물", `Cu + Ag⁺ → Cu²⁺ + Ag`],
      ["산화수 표시", `${o("Cu", 0)} + ${o("Ag⁺", 1)} → ${o("Cu²⁺", 2)} + ${o("Ag", 0)}`],
      ["반쪽 반응식", `<span class="lab">산화</span><span class="ox">Cu → Cu²⁺ + 2e⁻</span><br><span class="lab">환원</span><span class="red">Ag⁺ + e⁻ → Ag</span>`],
      ["전자 수 맞추기", `<span class="lab">산화 ×1</span><span class="ox">Cu → Cu²⁺ + 2e⁻</span><br><span class="lab">환원 ×2</span><span class="red">2Ag⁺ + 2e⁻ → 2Ag</span>`],
      ["더해서 완성", `Cu + 2Ag⁺ → Cu²⁺ + 2Ag &nbsp;(전하: +2 = +2 ✓)`],
    ] },
    { e: 5, steps: [
      ["반응물과 생성물", `MnO₄⁻ + Fe²⁺ → Mn²⁺ + Fe³⁺ &nbsp;(산성 용액)`],
      ["산화수 표시", `${o("Mn", 7)}${o("O₄⁻", -2)} + ${o("Fe²⁺", 2)} → ${o("Mn²⁺", 2)} + ${o("Fe³⁺", 3)}`],
      ["반쪽 반응식 (O는 H₂O로, H는 H⁺로 맞춤)", `<span class="lab">산화</span><span class="ox">Fe²⁺ → Fe³⁺ + e⁻</span><br><span class="lab">환원</span><span class="red">MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O</span>`],
      ["전자 수 맞추기", `<span class="lab">산화 ×5</span><span class="ox">5Fe²⁺ → 5Fe³⁺ + 5e⁻</span><br><span class="lab">환원 ×1</span><span class="red">MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O</span>`],
      ["더해서 완성", `MnO₄⁻ + 5Fe²⁺ + 8H⁺ → Mn²⁺ + 5Fe³⁺ + 4H₂O &nbsp;(전하: +17 = +17 ✓)`],
    ] },
    { e: 6, steps: [
      ["반응물과 생성물", `Cr₂O₇²⁻ + I⁻ → Cr³⁺ + I₂ &nbsp;(산성 용액)`],
      ["산화수 표시", `${o("Cr₂", 6)}${o("O₇²⁻", -2)} + ${o("I⁻", -1)} → ${o("Cr³⁺", 3)} + ${o("I₂", 0)}`],
      ["반쪽 반응식", `<span class="lab">산화</span><span class="ox">2I⁻ → I₂ + 2e⁻</span><br><span class="lab">환원</span><span class="red">Cr₂O₇²⁻ + 14H⁺ + 6e⁻ → 2Cr³⁺ + 7H₂O</span>`],
      ["전자 수 맞추기", `<span class="lab">산화 ×3</span><span class="ox">6I⁻ → 3I₂ + 6e⁻</span><br><span class="lab">환원 ×1</span><span class="red">Cr₂O₇²⁻ + 14H⁺ + 6e⁻ → 2Cr³⁺ + 7H₂O</span>`],
      ["더해서 완성", `Cr₂O₇²⁻ + 6I⁻ + 14H⁺ → 2Cr³⁺ + 3I₂ + 7H₂O &nbsp;(전하: +6 = +6 ✓)`],
    ] },
    { e: 2, steps: [
      ["반응물과 생성물", `H₂O₂ + Fe²⁺ → H₂O + Fe³⁺ &nbsp;(산성 용액)`],
      ["산화수 표시", `${o("H₂", 1)}${o("O₂", -1)} + ${o("Fe²⁺", 2)} → ${o("H₂", 1)}${o("O", -2)} + ${o("Fe³⁺", 3)}`],
      ["반쪽 반응식", `<span class="lab">산화</span><span class="ox">Fe²⁺ → Fe³⁺ + e⁻</span><br><span class="lab">환원</span><span class="red">H₂O₂ + 2H⁺ + 2e⁻ → 2H₂O</span>`],
      ["전자 수 맞추기", `<span class="lab">산화 ×2</span><span class="ox">2Fe²⁺ → 2Fe³⁺ + 2e⁻</span><br><span class="lab">환원 ×1</span><span class="red">H₂O₂ + 2H⁺ + 2e⁻ → 2H₂O</span>`],
      ["더해서 완성", `H₂O₂ + 2Fe²⁺ + 2H⁺ → 2H₂O + 2Fe³⁺ &nbsp;(전하: +6 = +6 ✓)`],
    ] },
  ];
  let r = 0, st = 0;
  function update() {
    root.querySelectorAll("[data-r]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.r === r)));
    const S = R[r].steps; box.innerHTML = S.slice(0, st + 1).map(([lab, eq], i) => `<p><span class="lab">${i + 1}. ${lab}</span><br>${eq}</p>`).join("");
    nS.textContent = `${st + 1} / ${S.length} · ${S[st][0]}`; nE.textContent = st >= 3 ? `${R[r].e}개` : "—";
  }
  root.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => { r = +b.dataset.r; st = 0; update(); }));
  $(".st-next").addEventListener("click", () => { st = Math.min(R[r].steps.length - 1, st + 1); update(); });
  $(".st-prev").addEventListener("click", () => { st = Math.max(0, st - 1); update(); });
  update();
})();
