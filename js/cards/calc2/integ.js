/* 미적분Ⅱ 적분법 카드 공용 도구 window.NMInteg — 수치 적분(심프슨), 부호 있는 넓이 칠하기, 두 곡선 사이 칠하기
   NMCalc(js/cards/calc1/plot.js)의 좌표판 g = {x0, y0, w, h, X, Y}를 그대로 받는다. */
window.NMInteg = (() => {
  const { C } = NM;

  /* 심프슨 공식. N은 짝수. a > b이면 부호가 바뀐다. */
  const simp = (f, a, b, N = 400) => {
    if (a === b) return 0;
    const h = (b - a) / N;
    let s = f(a) + f(b);
    for (let i = 1; i < N; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
    return s * h / 3;
  };

  const yc = (g, y) => NM.clamp(g.Y(y), g.y0 - g.h, g.y0 + 2 * g.h);

  /* y = f(x)와 y = base 사이. 위쪽은 pos 색, 아래쪽은 neg 색 */
  function shade(ctx, g, f, a, b, o = {}) {
    if (a > b) [a, b] = [b, a];
    if (b - a < 1e-9) return;
    const base = o.base ?? 0, N = o.N || 240, pos = o.pos || C.forest, neg = o.neg || C.warn;
    const p = new Path2D();
    p.moveTo(g.X(a), yc(g, base));
    for (let i = 0; i <= N; i++) { const x = a + (b - a) * i / N; p.lineTo(g.X(x), yc(g, f(x))); }
    p.lineTo(g.X(b), yc(g, base)); p.closePath();
    const yb = NM.clamp(g.Y(base), g.y0, g.y0 + g.h);
    ctx.save(); ctx.globalAlpha = o.alpha ?? 0.28;
    ctx.save(); ctx.beginPath(); ctx.rect(g.x0, g.y0, g.w, yb - g.y0); ctx.clip(); ctx.fillStyle = pos; ctx.fill(p); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(g.x0, yb, g.w, g.y0 + g.h - yb); ctx.clip(); ctx.fillStyle = neg; ctx.fill(p); ctx.restore();
    ctx.restore();
  }

  /* y = f1(x)와 y = f2(x) 사이를 한 색으로 */
  function between(ctx, g, f1, f2, a, b, color, alpha = 0.28, N = 240) {
    if (a > b) [a, b] = [b, a];
    if (b - a < 1e-9) return;
    const p = new Path2D();
    for (let i = 0; i <= N; i++) { const x = a + (b - a) * i / N; i ? p.lineTo(g.X(x), yc(g, f1(x))) : p.moveTo(g.X(x), yc(g, f1(x))); }
    for (let i = N; i >= 0; i--) { const x = a + (b - a) * i / N; p.lineTo(g.X(x), yc(g, f2(x))); }
    p.closePath();
    ctx.save(); ctx.beginPath(); ctx.rect(g.x0, g.y0, g.w, g.h); ctx.clip();
    ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.fill(p); ctx.restore();
  }

  /* 직사각형 하나 (x 구간 [a, b], 높이 base~top) */
  function bar(ctx, g, a, b, top, color, base = 0, alpha = 0.3) {
    const x1 = g.X(Math.min(a, b)), x2 = g.X(Math.max(a, b)), y1 = yc(g, Math.max(top, base)), y2 = yc(g, Math.min(top, base));
    ctx.save(); ctx.beginPath(); ctx.rect(g.x0, g.y0, g.w, g.h); ctx.clip();
    ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
    ctx.globalAlpha = 1; ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.strokeRect(x1 + .5, y1 + .5, x2 - x1 - 1, y2 - y1);
    ctx.restore();
  }

  /* 세로선 (구간 끝 표시) */
  function vline(ctx, g, x, color, dash = [4, 3]) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(g.X(x), g.y0); ctx.lineTo(g.X(x), g.y0 + g.h); ctx.stroke(); ctx.restore();
  }

  /* 캔버스 위 포인터의 좌표판 x값 */
  const px = (cv, g, e) => g.ix(e.clientX - cv.getBoundingClientRect().left);

  return { simp, shade, between, bar, vline, px };
})();
