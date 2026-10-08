/* 카드: 밑이 다른 거듭제곱이 섞이면 어느 쪽이 극한을 정할까? — aₙ = (aⁿ⁺¹ + bⁿ)/(aⁿ + bⁿ)를 큰 밑의 거듭제곱으로 나누기 */
(() => {
  const root = document.getElementById("card-calc2-geo-compare");
  if (!root) return;
  const { C, fit } = NM;
  const S = NMSeq, n = S.n;
  const $ = (s) => root.querySelector(s);
  const sa = $(".a"), sb = $(".b"), sn = $(".nn");
  const SUPN = "ⁿ";
  const term = (a, b, k) => (a ** (k + 1) + b ** k) / (a ** k + b ** k);
  const limit = (a, b) => (a > b ? a : a < b ? 1 : (a + 1) / 2);
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    const a = +sa.value, b = +sb.value, cur = +sn.value, L = limit(a, b);
    const g = S.frame(ctx, w, h, { xr: [0, 31], yr: [0, 5.5], xt: [1, 10, 20, 30], yt: [0, 1, 2, 3, 4, 5], L: 26, B: 22 });
    S.hline(ctx, g, L, C.forest);
    for (let k = 1; k <= 30; k++) S.dot(ctx, g, k, term(a, b, k), C.forest, k === cur ? 5 : 3.2, k !== cur);
    S.tag(ctx, `극한 ${n(L)}`, g.x0 + g.w - 4, L > 4.6 ? g.Y(L) + 13 : g.Y(L) - 13, C.forest, "right");
  }

  function update() {
    const a = +sa.value, b = +sb.value, k = +sn.value, L = limit(a, b);
    $(".a-out").textContent = String(a); $(".b-out").textContent = String(b); $(".nn-out").textContent = String(k);
    $(".eq1").textContent = `aₙ = (${a}${SUPN}⁺¹ + ${b}${SUPN})/(${a}${SUPN} + ${b}${SUPN})`;
    let eq2;
    if (a > b) eq2 = `${a}${SUPN}으로 나누면 (${a} + (${b}/${a})${SUPN})/(1 + (${b}/${a})${SUPN}) → ${a}/1`;
    else if (a < b) eq2 = `${b}${SUPN}으로 나누면 (${a}·(${a}/${b})${SUPN} + 1)/((${a}/${b})${SUPN} + 1) → 1/1`;
    else eq2 = `밑이 같으면 (${a}${SUPN}⁺¹ + ${a}${SUPN})/(2·${a}${SUPN}) = (${a} + 1)/2`;
    $(".eq2").textContent = eq2;
    $(".n-a").textContent = n(term(a, b, k), 6);
    $(".n-r").textContent = a === b ? "1 (같은 밑)" : n((Math.min(a, b) / Math.max(a, b)) ** k, 6);
    $(".n-L").textContent = n(L, 4);
    draw();
  }
  [sa, sb, sn].forEach((s) => s.addEventListener("input", update));
  update();
})();
