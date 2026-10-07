/* 과학과제 연구 공용 통계 도구 window.NMRsStat — t 분포, 두 집단 비교(웰치 t 검정), 효과 크기.
   쓰는 블록의 scripts에서 카드 스크립트보다 먼저 적는다. */
window.NMRsStat = (() => {
  "use strict";

  /* 로그 감마 (Lanczos 근사) */
  function lgamma(x) {
    const g = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let y = x, tmp = x + 5.5, ser = 1.000000000190015;
    tmp -= (x + 0.5) * Math.log(tmp);
    for (let j = 0; j < 6; j++) ser += g[j] / ++y;
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  }

  /* 정칙화 불완전 베타 함수 I_x(a, b) (연분수 전개) */
  function betacf(a, b, x) {
    const MAXIT = 200, EPS = 3e-12, FPMIN = 1e-300;
    let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= MAXIT; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      const del = d * c; h *= del;
      if (Math.abs(del - 1) < EPS) break;
    }
    return h;
  }
  function ibeta(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
  }

  /* 자유도 df인 t 분포에서 |T| ≥ |t|일 양측 확률 */
  function p2(t, df) {
    if (!Number.isFinite(t) || !(df > 0)) return NaN;
    return ibeta(df / (df + t * t), df / 2, 0.5);
  }

  /* 양측 확률이 alpha가 되는 t 값 (예: alpha = 0.05 → 95% 구간의 t*) */
  function tcrit(df, alpha = 0.05) {
    if (!(df > 0)) return NaN;
    let lo = 0, hi = 1000;
    for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (p2(mid, df) > alpha) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }

  const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };

  /* 두 독립 집단의 평균 차 (b − a). 웰치 t 검정, 95% 신뢰구간, 효과 크기 d(합동 표준편차 기준) */
  function welch(a, b) {
    const na = a.length, nb = b.length;
    if (na < 2 || nb < 2) return null;
    const ma = mean(a), mb = mean(b), sa = sd(a), sb = sd(b);
    const va = sa * sa / na, vb = sb * sb / nb, se = Math.sqrt(va + vb);
    const df = (va + vb) ** 2 / (va * va / (na - 1) + vb * vb / (nb - 1));
    const diff = mb - ma, t = diff / se, sp = Math.sqrt(((na - 1) * sa * sa + (nb - 1) * sb * sb) / (na + nb - 2));
    const tc = tcrit(df);
    return { ma, mb, sa, sb, na, nb, diff, se, t, df, p: p2(t, df), lo: diff - tc * se, hi: diff + tc * se, d: diff / sp };
  }

  /* 짝지은 자료 (b − a)의 일표본 t 검정 */
  function paired(a, b) {
    const dd = a.map((x, i) => b[i] - x), n = dd.length;
    if (n < 2) return null;
    const m = mean(dd), s = sd(dd), se = s / Math.sqrt(n), df = n - 1, t = m / se, tc = tcrit(df);
    return { diff: m, sd: s, se, t, df, p: p2(t, df), lo: m - tc * se, hi: m + tc * se, d: m / s, n };
  }

  /* 일표본: 평균이 0과 다른가 */
  function one(a) {
    const n = a.length;
    if (n < 2) return null;
    const m = mean(a), s = sd(a), se = s / Math.sqrt(n), df = n - 1, tc = tcrit(df);
    return { diff: m, se, t: m / se, df, p: p2(m / se, df), lo: m - tc * se, hi: m + tc * se };
  }

  const fp = (p) => (!Number.isFinite(p) ? "—" : p < 0.001 ? "< 0.001" : p.toFixed(3));

  return { p2, tcrit, mean, sd, welch, paired, one, fp };
})();
