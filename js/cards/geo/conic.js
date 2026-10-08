/* 기하 이차곡선 카드 공용 도구 window.NMConic (js/cards/cm2/coord.js의 NMCoord 위에서 동작)
   parab/ellipse/hyper: 곡선 위 점 목록(좌표), sq: "(x − m)²" HTML, near: 점 목록에서 가장 가까운 점 */
window.NMConic = (() => {
  const K = NMCoord;
  /* 포물선. ax = "x": (y − n)² = 4p(x − m)  (축이 x축에 평행)
              ax = "y": (x − m)² = 4p(y − n)  (축이 y축에 평행) */
  function parab(ax, m, n, p, T = 14, N = 240) {
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const t = -T + 2 * T * i / N, s = t * t / (4 * p);
      pts.push(ax === "x" ? [m + s, n + t] : [m + t, n + s]);
    }
    return pts;
  }
  /* 타원 (x − m)²/h² + (y − n)²/k² = 1 */
  function ellipse(m, n, h, k, N = 240) {
    const pts = [];
    for (let i = 0; i <= N; i++) { const t = 2 * Math.PI * i / N; pts.push([m + h * Math.cos(t), n + k * Math.sin(t)]); }
    return pts;
  }
  /* 쌍곡선. ax = "x": (x − m)²/a² − (y − n)²/b² = 1,  ax = "y": … = −1. 두 가지를 [가지1, 가지2]로 */
  function hyper(ax, m, n, a, b, N = 200) {
    const U = Math.acosh(40 / Math.min(a, b)), A = [], B = [];
    for (let i = 0; i <= N; i++) {
      const u = -U + 2 * U * i / N, ch = Math.cosh(u), sh = Math.sinh(u);
      if (ax === "x") { A.push([m + a * ch, n + b * sh]); B.push([m - a * ch, n + b * sh]); }
      else { A.push([m + a * sh, n + b * ch]); B.push([m + a * sh, n - b * ch]); }
    }
    return [A, B];
  }
  const sq = (v, a) => `${K.paren(v, a)}<sup>2</sup>`;
  return { parab, ellipse, hyper, sq };
})();
