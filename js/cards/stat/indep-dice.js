/* 카드: '합이 7'은 첫째 눈의 영향을 받을까? — 36칸에서 A, B를 골라 P(B|A)와 P(B), P(A∩B)와 P(A)P(B) 비교 */
(() => {
  const root = document.getElementById("card-stat-indep-dice");
  if (!root) return;
  const { C, fit } = NM;
  const D = NMDice;
  const $ = (s) => root.querySelector(s);
  const ca = [...root.querySelectorAll(".pa .chip")], cb = [...root.querySelectorAll(".pb .chip")];
  const AS = [["첫째 짝수", (a) => a % 2 === 0], ["첫째 = 1", (a) => a === 1], ["두 눈 같음", (a, b) => a === b]];
  const BS = [["둘째 ≥ 5", (a, b) => b >= 5], ["합 = 7", (a, b) => a + b === 7], ["합 = 8", (a, b) => a + b === 8], ["첫째 ≤ 2", (a) => a <= 2]];
  let ia = 1, ib = 1;
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const A = AS[ia][1], B = BS[ib][1];
    D.legend(ctx, 8, 10, [["fill", `A: ${AS[ia][0]}`], ["dot", `B: ${BS[ib][0]}`], ["ring", "A∩B"]]);
    D.draw(ctx, D.layout(w, h - 4, 18), (a, b) => {
      const x = A(a, b), y = B(a, b);
      return { fill: x ? C.sprout : null, dot: y, ring: x && y, dim: !x };
    });
  }

  function update() {
    const A = AS[ia][1], B = BS[ib][1];
    let nA = 0, nB = 0, nAB = 0;
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) { const x = A(a, b), y = B(a, b); nA += x; nB += y; nAB += x && y; }
    const indep = nAB * 36 === nA * nB;
    $(".eq").textContent = `P(B|A) = n(A∩B)/n(A) = ${nAB}/${nA} = ${D.fr(nAB, nA)} ${indep ? "=" : "≠"} P(B) = ${D.fr(nB, 36)}  →  ` +
      (indep ? "A와 B는 서로 독립" : nAB === 0 ? "종속 (A∩B = ∅인 배반사건)" : "A와 B는 서로 종속");
    $(".n-b").textContent = D.fr(nB, 36);
    $(".n-ba").textContent = D.fr(nAB, nA);
    $(".n-ab").textContent = D.fr(nAB, 36);
    $(".n-pp").textContent = D.fr(nA * nB, 1296);
    draw();
  }
  ca.forEach((b) => b.addEventListener("click", () => { ia = +b.dataset.a; ca.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  cb.forEach((b) => b.addEventListener("click", () => { ib = +b.dataset.b; cb.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  update();
})();
