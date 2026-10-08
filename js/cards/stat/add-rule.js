/* 카드: 'A 또는 B'의 확률은 두 확률의 합일까? — A(합 ≥ s), B(차 = d)를 36칸에 표시하고 덧셈정리와 직접 센 값 비교 */
(() => {
  const root = document.getElementById("card-stat-add-rule");
  if (!root) return;
  const { C, fit } = NM;
  const D = NMDice;
  const $ = (s) => root.querySelector(s), ss = $(".s"), sd = $(".d");
  const inA = (a, b) => a + b >= +ss.value, inB = (a, b) => Math.abs(a - b) === +sd.value;
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    D.legend(ctx, 8, 10, [["fill", `A: 합 ≥ ${ss.value}`], ["dot", `B: 차 = ${sd.value}`], ["ring", "A∩B"]]);
    const L = D.layout(w, h - 4, 18);
    D.draw(ctx, L, (a, b) => {
      const A = inA(a, b), B = inB(a, b);
      return { fill: A ? C.sprout : null, dot: B, ring: A && B, dim: !A && !B };
    });
  }

  function update() {
    $(".s-out").textContent = ss.value; $(".d-out").textContent = sd.value;
    let nA = 0, nB = 0, nAB = 0, nU = 0;
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) {
      const A = inA(a, b), B = inB(a, b);
      nA += A; nB += B; nAB += A && B; nU += A || B;
    }
    $(".eq").textContent = `P(A) + P(B) − P(A∩B) = ${nA}/36 + ${nB}/36 − ${nAB}/36 = ${nA + nB - nAB}/36` +
      (nAB === 0 ? "  →  A∩B = ∅, A와 B는 배반사건" : "");
    $(".n-a").textContent = `${nA}/36`; $(".n-b").textContent = `${nB}/36`;
    $(".n-ab").textContent = `${nAB}/36`; $(".n-u").textContent = `${nU}/36`;
    draw();
  }
  ss.addEventListener("input", update); sd.addEventListener("input", update);
  update();
})();
