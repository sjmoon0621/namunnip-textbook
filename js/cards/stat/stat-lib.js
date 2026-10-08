/* 확률과 통계 공용 도구: 씨앗 난수, 이항·정규분포 계산, 수 표기, 막대·곡선 그리기 → window.NMStat */
window.NMStat = (() => {
  "use strict";
  /* 씨앗이 같으면 같은 난수열 (mulberry32) — 첫 화면을 늘 같게 그리려고 쓴다 */
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  /* 표준정규분포를 따르는 값 하나 (박스–뮬러) */
  const gauss = (r) => { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); };

  /* 이항분포 B(n, p)의 확률 전체 [P(X=0) … P(X=n)] */
  function binom(n, p) {
    const out = new Array(n + 1).fill(0);
    if (p <= 0) { out[0] = 1; return out; }
    if (p >= 1) { out[n] = 1; return out; }
    let lc = 0; // log C(n, k)
    for (let k = 0; k <= n; k++) {
      if (k > 0) lc += Math.log(n - k + 1) - Math.log(k);
      out[k] = Math.exp(lc + k * Math.log(p) + (n - k) * Math.log(1 - p));
    }
    return out;
  }
  /* 정규분포 N(m, s²)의 확률밀도함수 */
  const npdf = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));
  /* 오차함수 (Abramowitz–Stegun 7.1.26, 오차 1.5×10⁻⁷ 이하) */
  function erf(x) {
    const s = Math.sign(x), a = Math.abs(x), t = 1 / (1 + 0.3275911 * a);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a);
    return s * y;
  }
  /* 표준정규분포의 누적확률 P(Z ≤ z) */
  const ncdf = (z) => 0.5 * (1 + erf(z / Math.SQRT2));

  /* 수 표기: 음수 부호는 '−', 소수 d자리, 끝의 0은 남긴다 */
  const fmt = (x, d = 2) => {
    const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
    return v.toFixed(d).replace("-", "−");
  };
  /* 끝의 0을 지운 짧은 표기 */
  const short = (x, d = 3) => fmt(x, d).replace(/\.?0+$/, "");

  /* 가로 막대 히스토그램용 구간 세기 */
  function counts(vals, lo, hi, bins) {
    const c = new Array(bins).fill(0), wd = (hi - lo) / bins;
    for (const v of vals) { const i = Math.floor((v - lo) / wd); if (i >= 0 && i < bins) c[i]++; }
    return c;
  }

  return { rng, gauss, binom, npdf, erf, ncdf, fmt, short, counts };
})();
