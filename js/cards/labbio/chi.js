/* 생명과학 실험 공용: 카이제곱 검정 도구 window.LBChi
   chi2(obs, exp) → { x2, df, p, bad }   (기댓값이 0인 칸에 관찰값이 있으면 bad = true, x2 = Infinity)
   crit[df] = 유의 수준 0.05의 임곗값 */
window.LBChi = window.LBChi || (() => {
  "use strict";
  function erfc(x) {
    const t = 1 / (1 + 0.3275911 * x);
    const y = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
    return y * Math.exp(-x * x);
  }
  /* 자유도 k인 카이제곱 분포의 위쪽 꼬리 확률 */
  function pval(x, k) {
    if (!Number.isFinite(x)) return 0;
    if (x <= 0) return 1;
    if (k % 2 === 0) {
      let s = 0, term = 1;
      for (let i = 0; i < k / 2; i++) { if (i) term *= (x / 2) / i; s += term; }
      return Math.min(1, Math.exp(-x / 2) * s);
    }
    let s = 0, term = 0;
    for (let i = 1; i <= (k - 1) / 2; i++) { term = i === 1 ? Math.sqrt(x) : term * x / (2 * i - 1); s += term; }
    return Math.min(1, erfc(Math.sqrt(x / 2)) + Math.sqrt(2 / Math.PI) * Math.exp(-x / 2) * s);
  }
  function chi2(obs, exp) {
    let x2 = 0, bad = false, k = 0;
    obs.forEach((o, i) => {
      const e = exp[i];
      if (e > 0) { x2 += (o - e) ** 2 / e; k++; }
      else if (o > 0) bad = true;
    });
    const df = Math.max(1, k - 1);
    if (bad) return { x2: Infinity, df, p: 0, bad };
    return { x2, df, p: pval(x2, df), bad };
  }
  const crit = { 1: 3.84, 2: 5.99, 3: 7.81, 4: 9.49 };
  return { chi2, pval, crit };
})();
