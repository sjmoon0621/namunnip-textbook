/* 공통수학1 행렬 카드 공용 도구 window.NMMat
   행렬은 행의 배열로 다룬다: [[a11, a12], [a21, a22]] */
window.NMMat = (() => {
  const M = "−";
  /* 수 하나 (음수는 −, 소수 셋째 자리까지) */
  const n = (v) => { const r = Math.round(v * 1000) / 1000; return (r < 0 ? M : "") + String(Math.abs(r)); };
  const add = (A, B) => A.map((r, i) => r.map((v, j) => v + B[i][j]));
  const scale = (A, k) => A.map((r) => r.map((v) => v * k));
  /* 곱 AB. A의 열의 수와 B의 행의 수가 다르면 null */
  const mul = (A, B) => (A[0].length !== B.length ? null
    : A.map((r) => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0))));
  const eq = (A, B) => A.length === B.length && A[0].length === B[0].length && A.every((r, i) => r.every((v, j) => Math.abs(v - B[i][j]) < 1e-9));
  const size = (A) => `${A.length} × ${A[0].length}`;
  /* 본문·수치 칸에 넣는 괄호 친 행렬 (스타일은 블록의 .mx) */
  const html = (A) => `<span class="mx" style="grid-template-columns:repeat(${A[0].length},auto)">${A.flat().map((v) => `<span>${n(v)}</span>`).join("")}</span>`;
  /* 캔버스에 둥근 괄호 한 쌍: (x, y)부터 너비 w, 높이 h를 감싼다 */
  function paren(ctx, x, y, w, h, color) {
    const b = Math.min(7, h * 0.12);
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.6; ctx.beginPath();
    ctx.moveTo(x + b, y); ctx.quadraticCurveTo(x - b * 0.6, y + h / 2, x + b, y + h);
    ctx.moveTo(x + w - b, y); ctx.quadraticCurveTo(x + w + b * 0.6, y + h / 2, x + w - b, y + h);
    ctx.stroke(); ctx.restore();
  }
  return { n, add, scale, mul, eq, size, html, paren };
})();
