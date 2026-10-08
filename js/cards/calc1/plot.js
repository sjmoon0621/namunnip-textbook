/* 미적분Ⅰ 카드 공용 도구 window.NMCalc — 좌표판, 끊어 그리는 곡선, 열린·닫힌 점, 수 표기 */
window.NMCalc = (() => {
  const { C, F, axes } = NM;
  const M = "−";
  /* 수 하나: 음수는 −, 소수 d자리에서 끝의 0을 지운다 */
  const n = (v, d = 3) => {
    if (v === Infinity) return "∞";
    if (v === -Infinity) return M + "∞";
    if (!isFinite(v)) return "—";
    const s = String(+v.toFixed(d));
    return s === "-0" ? "0" : s.replace("-", M);
  };
  const ticks = (a, b, step) => { const t = []; for (let v = Math.ceil(a / step - 1e-9) * step; v <= b + 1e-9; v += step) t.push(+v.toFixed(6)); return t; };

  /* 좌표판: o = {xr:[x0,x1], yr:[y0,y1], xs, ys(눈금 간격), L, T, R, B(여백)} */
  function frame(ctx, w, h, o) {
    const L = o.L ?? 34, T = o.T ?? 10, Rr = o.R ?? 10, B = o.B ?? 22;
    const g = { x0: L, y0: T, w: w - L - Rr, h: h - T - B, xr: o.xr, yr: o.yr };
    g.X = (x) => g.x0 + (x - o.xr[0]) / (o.xr[1] - o.xr[0]) * g.w;
    g.Y = (y) => g.y0 + (o.yr[1] - y) / (o.yr[1] - o.yr[0]) * g.h;
    g.ix = (px) => o.xr[0] + (px - g.x0) / g.w * (o.xr[1] - o.xr[0]);
    g.iy = (py) => o.yr[1] - (py - g.y0) / g.h * (o.yr[1] - o.yr[0]);
    const fx = o.xf || n, fy = o.yf || n;
    axes(ctx, { x0: g.x0, y0: g.y0, w: g.w, h: g.h, X: g.X, Y: g.Y,
      xt: ticks(o.xr[0], o.xr[1], o.xs || 1).map((v) => [v, fx(v)]),
      yt: ticks(o.yr[0], o.yr[1], o.ys || 1).map((v) => [v, fy(v)]) });
    ctx.save(); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath();
    if (o.yr[0] <= 0 && o.yr[1] >= 0) { ctx.moveTo(g.x0, g.Y(0)); ctx.lineTo(g.x0 + g.w, g.Y(0)); }
    if (o.xr[0] <= 0 && o.xr[1] >= 0) { ctx.moveTo(g.X(0), g.y0); ctx.lineTo(g.X(0), g.y0 + g.h); }
    ctx.stroke(); ctx.restore();
    return g;
  }

  /* 곡선: [from, to]에서 그리되 값이 없거나(NaN) 화면 높이보다 크게 튀면 끊는다 */
  function curve(ctx, g, f, color, o = {}) {
    const a = o.from ?? g.xr[0], b = o.to ?? g.xr[1], N = o.N || 400;
    ctx.save(); ctx.beginPath(); ctx.rect(g.x0, g.y0, g.w, g.h); ctx.clip();
    ctx.strokeStyle = color; ctx.lineWidth = o.width || 2.4; if (o.dash) ctx.setLineDash(o.dash);
    ctx.beginPath(); let pen = false, py = 0;
    for (let i = 0; i <= N; i++) {
      const x = a + (b - a) * i / N, y = f(x);
      if (!isFinite(y)) { pen = false; continue; }
      const Y = NM.clamp(g.Y(y), g.y0 - g.h, g.y0 + 2 * g.h);
      if (pen && Math.abs(Y - py) < g.h) ctx.lineTo(g.X(x), Y); else ctx.moveTo(g.X(x), Y);
      pen = true; py = Y;
    }
    ctx.stroke(); ctx.restore();
  }

  /* 점: open이면 속이 빈 점 (그 값은 함숫값이 아님) */
  function dot(ctx, g, x, y, color, open, r = 4.5) {
    ctx.save(); ctx.lineWidth = 2; ctx.strokeStyle = color; ctx.fillStyle = open ? C.card : color;
    ctx.beginPath(); ctx.arc(g.X(x), g.Y(y), r, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
  }

  /* 점에서 축으로 내리는 점선 */
  function guide(ctx, g, x, y, color, which = "xy") {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath();
    const Y0 = NM.clamp(g.Y(0), g.y0, g.y0 + g.h), X0 = NM.clamp(g.X(0), g.x0, g.x0 + g.w);
    if (which.includes("x")) { ctx.moveTo(g.X(x), g.Y(y)); ctx.lineTo(g.X(x), Y0); }
    if (which.includes("y")) { ctx.moveTo(g.X(x), g.Y(y)); ctx.lineTo(X0, g.Y(y)); }
    ctx.stroke(); ctx.restore();
  }

  /* 바탕을 깐 글자. 그림 안쪽으로 밀어 넣는다 */
  function tag(ctx, g, text, px, py, color, align = "left", size = 11) {
    ctx.save(); ctx.font = `600 ${size}px ${F.sans}`; ctx.textBaseline = "middle";
    const tw = ctx.measureText(text).width;
    let x = align === "left" ? px : align === "right" ? px - tw : px - tw / 2;
    x = NM.clamp(x, g.x0 + 2, g.x0 + g.w - tw - 2);
    const y = NM.clamp(py, g.y0 + 9, g.y0 + g.h - 9);
    ctx.fillStyle = C.card; ctx.globalAlpha = .9; ctx.fillRect(x - 3, y - 8, tw + 6, 16); ctx.globalAlpha = 1;
    ctx.fillStyle = color; ctx.textAlign = "left"; ctx.fillText(text, x, y); ctx.restore();
  }

  /* 프리셋 칩 묶음: 누르면 aria-pressed를 옮기고 cb(칩) */
  function chips(root, sel, cb) {
    const bs = [...root.querySelectorAll(sel)];
    bs.forEach((b) => b.addEventListener("click", () => { bs.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); cb(b); }));
    return bs;
  }

  return { n, M, ticks, frame, curve, dot, guide, tag, chips, BLUE: "#3f6fa3" };
})();
