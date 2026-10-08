/* 카드: 4의 배수와 6의 배수는 어디에서 겹칠까? — 1~100 수 판에서 a의 배수, b의 배수, 최소공배수의 배수와 덧셈정리 */
(() => {
  const root = document.getElementById("card-stat-add-multiples");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s), sa = $(".a"), sb = $(".b");
  const gcd = (x, y) => (y ? gcd(y, x % y) : x);
  const fr = (p, q) => { if (p === 0) return "0"; const g = gcd(p, q); return q / g === 1 ? String(p / g) : `${p / g}/${q / g}`; };
  const { ctx, size } = fit($("canvas"), () => draw());

  function legend(x, y, items) {
    ctx.font = `500 11.5px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    for (const [k, t] of items) {
      if (k === "fill") { ctx.fillStyle = C.sprout; ctx.fillRect(x, y - 6, 12, 12); }
      if (k === "dot") { ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(x + 6, y, 4.5, 0, 7); ctx.fill(); }
      if (k === "ring") { ctx.strokeStyle = C.forest; ctx.lineWidth = 2.2; ctx.strokeRect(x + 1, y - 5, 10, 10); }
      ctx.fillStyle = C.ink2; ctx.fillText(t, x + 17, y);
      x += 31 + ctx.measureText(t).width;
    }
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = +sa.value, b = +sb.value;
    legend(8, 10, [["fill", `${a}의 배수`], ["dot", `${b}의 배수`], ["ring", "공배수"]]);
    const c = Math.floor(Math.min((w - 8) / 10, (h - 28) / 10)), x0 = Math.floor((w - 10 * c) / 2), y0 = 24;
    const fs = Math.max(9.5, Math.min(13, c * 0.32));
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let k = 1; k <= 100; k++) {
      const x = x0 + ((k - 1) % 10) * c, y = y0 + Math.floor((k - 1) / 10) * c, A = k % a === 0, B = k % b === 0;
      ctx.fillStyle = A ? C.sprout : C.card; ctx.fillRect(x + 1, y + 1, c - 2, c - 2);
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(x + 1.5, y + 1.5, c - 3, c - 3);
      if (A && B) { ctx.strokeStyle = C.forest; ctx.lineWidth = 2.5; ctx.strokeRect(x + 3, y + 3, c - 6, c - 6); }
      if (B) { ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(x + c * 0.78, y + c * 0.24, Math.max(2.5, c * 0.1), 0, 7); ctx.fill(); }
      ctx.fillStyle = A || B ? C.ink : C.ink3; ctx.font = `${A && B ? 700 : 500} ${fs}px ${F.mono}`;
      ctx.fillText(k, x + c * 0.45, y + c * 0.56);
    }
  }

  function update() {
    const a = +sa.value, b = +sb.value, L = a * b / gcd(a, b);
    $(".a-out").textContent = a; $(".b-out").textContent = b;
    const nA = Math.floor(100 / a), nB = Math.floor(100 / b), nAB = Math.floor(100 / L), nU = nA + nB - nAB;
    $(".eq").textContent = `A∩B = 최소공배수 ${L}의 배수 → n(A∪B) = ${nA} + ${nB} − ${nAB} = ${nU}, P(A∪B) = ${nU}/100` +
      (fr(nU, 100) !== `${nU}/100` ? ` = ${fr(nU, 100)}` : "");
    $(".n-a").textContent = nA; $(".n-b").textContent = nB; $(".n-ab").textContent = nAB;
    $(".n-u").textContent = fr(nU, 100);
    draw();
  }
  sa.addEventListener("input", update); sb.addEventListener("input", update);
  update();
})();
