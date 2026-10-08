/* 카드: 조건 p가 q에 대해 넉넉한지, 꼭 필요한지 어떻게 가릴까? — 수직선의 닫힌구간 P, Q의 포함관계로 충분·필요조건 판정 */
(() => {
  const root = document.getElementById("card-cm2-suff-nec");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSets, n = S.n;
  const $ = (s) => root.querySelector(s);
  const sl = ["a", "b", "c", "d"].map((k) => $(`.${k}`)), ex = [...root.querySelectorAll(".ex .chip")];
  const { ctx, size } = fit($("canvas"), () => draw());
  const val = () => sl.map((s) => +s.value);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const [a, b, c, d] = val(), x0 = 34, x1 = w - 20;
    const X = S.line(ctx, { x0, x1, y: h - 24, lo: -5, hi: 5, step: 1 });
    const yP = h * 0.18, yQ = h * 0.46;
    ctx.font = `600 13px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillStyle = C.forest; ctx.fillText("P", 8, yP); ctx.fillStyle = C.amber; ctx.fillText("Q", 8, yQ);
    ctx.fillStyle = C.warn; ctx.globalAlpha = 0.14;
    /* 한쪽 구간에만 있는 부분 = 반례가 사는 곳 */
    let run = null;
    for (let k = -100; k <= 100; k++) {
      const x = (k + 0.5) / 20, inP = x >= a && x <= b, inQ = x >= c && x <= d, odd = k < 100 && inP !== inQ;
      if (odd && run === null) run = k;
      if (!odd && run !== null) { ctx.fillRect(X(run / 20), yP - 10, X(k / 20) - X(run / 20), yQ - yP + 20); run = null; }
    }
    ctx.globalAlpha = 1;
    S.seg(ctx, X, yP, a, b, C.forest, 1, 1, [0, w]);
    S.seg(ctx, X, yQ, c, d, C.amber, 1, 1, [0, w]);
  }
  function update(moved) {
    const [a, b, c, d] = val();
    if (moved === 0 && a > b) sl[1].value = a; if (moved === 1 && b < a) sl[0].value = b;
    if (moved === 2 && c > d) sl[3].value = c; if (moved === 3 && d < c) sl[2].value = d;
    const [A, B, Cc, D] = val();
    ["a", "b", "c", "d"].forEach((k, i) => { $(`.${k}-out`).textContent = n([A, B, Cc, D][i]); });
    const pq = Cc <= A && B <= D, qp = A <= Cc && D <= B;
    const s1 = $(".n-pq"), s2 = $(".n-qp");
    s1.textContent = pq ? "참" : `거짓, 반례 x = ${n(A < Cc ? A : B)}`; s1.className = `n-pq ${pq ? "good" : "bad"}`;
    s2.textContent = qp ? "참" : `거짓, 반례 x = ${n(Cc < A ? Cc : D)}`; s2.className = `n-qp ${qp ? "good" : "bad"}`;
    $(".eq").innerHTML = pq && qp ? "<b>p ⇔ q</b>: p는 q이기 위한 필요충분조건입니다."
      : pq ? "<b>p ⇒ q</b>: p는 q이기 위한 충분조건, q는 p이기 위한 필요조건입니다."
      : qp ? "<b>q ⇒ p</b>: p는 q이기 위한 필요조건, q는 p이기 위한 충분조건입니다."
      : "어느 쪽 화살표도 성립하지 않습니다. p는 q이기 위한 충분조건도 필요조건도 아닙니다.";
    draw();
  }
  sl.forEach((s, i) => s.addEventListener("input", () => update(i)));
  ex.forEach((bt) => bt.addEventListener("click", () => { bt.dataset.v.split(",").forEach((v, i) => { sl[i].value = v; }); update(-1); }));
  update(-1);
})();
