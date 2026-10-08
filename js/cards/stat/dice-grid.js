/* 확률 단원 공용: 주사위 두 개의 표본공간(6×6 격자) 그리기와 칸 찾기, 분수 표기 → window.NMDice */
window.NMDice = (() => {
  "use strict";
  const { C, F } = NM;
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  /* 기약분수 표기: fr(6, 36) → "1/6", fr(0, 36) → "0", fr(36, 36) → "1" */
  const fr = (a, b) => {
    if (a === 0) return "0";
    const g = gcd(a, b);
    return b / g === 1 ? String(a / g) : `${a / g}/${b / g}`;
  };
  /* 격자 자리: 왼쪽·위에 눈 이름표 자리를 두고 너비 w, 아래 끝 bottom 안에 맞춘다 */
  function layout(w, bottom, top = 0) {
    const lx = 34, ly = top + 32;
    const c = Math.floor(Math.min((w - lx - 8) / 6, (bottom - ly - 4) / 6));
    const x0 = lx + Math.floor((w - lx - 8 - 6 * c) / 2);
    return { x0, y0: ly, c };
  }
  /* style(a, b) → { fill, dot, ring, dim } 또는 null. a = 첫째 눈(행), b = 둘째 눈(열). 칸 안의 수는 두 눈의 합. */
  function draw(ctx, L, style) {
    const { x0, y0, c } = L;
    ctx.save();
    ctx.textBaseline = "middle"; ctx.textAlign = "center";
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink3;
    ctx.fillText("둘째 눈", x0 + 3 * c, y0 - 22);
    ctx.save(); ctx.translate(x0 - 24, y0 + 3 * c); ctx.rotate(-Math.PI / 2); ctx.fillText("첫째 눈", 0, 0); ctx.restore();
    ctx.font = `500 11px ${F.mono}`;
    for (let i = 1; i <= 6; i++) {
      ctx.textAlign = "center"; ctx.fillText(i, x0 + (i - 0.5) * c, y0 - 8);
      ctx.textAlign = "right"; ctx.fillText(i, x0 - 6, y0 + (i - 0.5) * c);
    }
    ctx.textAlign = "center";
    const fs = Math.max(9, Math.min(12, Math.round(c * 0.28)));
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) {
      const x = x0 + (b - 1) * c, y = y0 + (a - 1) * c, s = style(a, b) || {};
      ctx.fillStyle = s.fill || C.card; ctx.fillRect(x + 1, y + 1, c - 2, c - 2);
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(x + 1.5, y + 1.5, c - 3, c - 3);
      if (s.ring) { ctx.strokeStyle = C.forest; ctx.lineWidth = 2.5; ctx.strokeRect(x + 3, y + 3, c - 6, c - 6); }
      if (s.dot) { ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(x + c * 0.74, y + c * 0.27, Math.max(3, c * 0.12), 0, 7); ctx.fill(); }
      ctx.fillStyle = s.dim ? C.ink3 : C.ink; ctx.font = `500 ${fs}px ${F.mono}`;
      ctx.fillText(a + b, x + c * 0.42, y + c * 0.6);
    }
    ctx.restore();
  }
  /* 캔버스 좌표 → [첫째 눈, 둘째 눈] 또는 null */
  function hit(L, x, y) {
    const b = Math.floor((x - L.x0) / L.c) + 1, a = Math.floor((y - L.y0) / L.c) + 1;
    return a >= 1 && a <= 6 && b >= 1 && b <= 6 ? [a, b] : null;
  }
  /* 범례 한 줄: items = [[모양("fill"|"dot"|"ring"), 글], ...] */
  function legend(ctx, x, y, items) {
    ctx.save(); ctx.font = `500 11.5px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    for (const [k, t] of items) {
      if (k === "fill") { ctx.fillStyle = C.sprout; ctx.fillRect(x, y - 6, 12, 12); }
      if (k === "dot") { ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(x + 6, y, 4.5, 0, 7); ctx.fill(); }
      if (k === "ring") { ctx.strokeStyle = C.forest; ctx.lineWidth = 2.2; ctx.strokeRect(x + 1, y - 5, 10, 10); }
      ctx.fillStyle = C.ink2; ctx.fillText(t, x + 17, y);
      x += 17 + ctx.measureText(t).width + 14;
    }
    ctx.restore();
  }
  return { gcd, fr, layout, draw, hit, legend };
})();
