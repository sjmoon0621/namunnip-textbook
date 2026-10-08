/* 미적분Ⅱ 수열의 극한 공용 도구 — window.NMSeq: 수 표기, 좌표 틀, 점·선·띠·글자 그리기, 프리셋 칩 */
window.NMSeq = (() => {
  const { C, F, axes } = NM;

  /* 수 표기: 음수는 '−', 큰 수는 a×10^k, 무한은 ∞ */
  const n = (v, d = 4) => {
    if (!isFinite(v)) return Number.isNaN(v) ? "—" : v > 0 ? "∞" : "−∞";
    let s;
    if (Math.abs(v) >= 1e7) s = v.toExponential(2).replace(/e\+?(-?\d+)/, "×10^$1");
    else s = String(+v.toFixed(d));
    return s.replace(/-/g, "−");
  };

  /* 좌표 틀. o: {xr, yr, xt, yt, xf(눈금 글자), L, R, T, B, xlab, ylab} */
  function frame(ctx, w, h, o) {
    ctx.clearRect(0, 0, w, h);
    const x0 = o.L ?? 40, y0 = o.T ?? 12, gw = w - x0 - (o.R ?? 12), gh = h - y0 - (o.B ?? 24);
    const X = (x) => x0 + (x - o.xr[0]) / (o.xr[1] - o.xr[0]) * gw;
    const Y = (y) => y0 + (o.yr[1] - y) / (o.yr[1] - o.yr[0]) * gh;
    axes(ctx, {
      x0, y0, w: gw, h: gh, X, Y, xlabel: o.xlab, ylabel: o.ylab,
      xt: (o.xt || []).map((v) => [v, o.xf ? o.xf(v) : n(v)]),
      yt: (o.yt || []).map((v) => [v, n(v)]),
    });
    if (o.yr[0] < 0 && o.yr[1] > 0) {
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, Math.round(Y(0)) + .5); ctx.lineTo(x0 + gw, Math.round(Y(0)) + .5); ctx.stroke();
    }
    return { x0, y0, w: gw, h: gh, X, Y, xr: o.xr, yr: o.yr };
  }

  /* 점 하나. 세로 범위를 벗어나면 가장자리에 바깥쪽을 가리키는 삼각형을 그린다 */
  function dot(ctx, g, x, y, col, r = 3.2, open = false) {
    const px = g.X(x);
    if (!isFinite(y) || y > g.yr[1] || y < g.yr[0]) {
      const up = !(y < g.yr[0]), py = up ? g.y0 + 1 : g.y0 + g.h - 1, s = up ? 1 : -1;
      ctx.fillStyle = col; ctx.beginPath();
      ctx.moveTo(px, py); ctx.lineTo(px - 4, py + 7 * s); ctx.lineTo(px + 4, py + 7 * s); ctx.closePath(); ctx.fill();
      return;
    }
    ctx.beginPath(); ctx.arc(px, g.Y(y), r, 0, 7);
    if (open) { ctx.fillStyle = C.card; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.stroke(); }
    else { ctx.fillStyle = col; ctx.fill(); }
  }

  /* 가로선 (극한값 표시) */
  function hline(ctx, g, y, col, dash = [5, 4], width = 1.4) {
    if (y > g.yr[1] || y < g.yr[0]) return;
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = width; ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(g.x0, g.Y(y)); ctx.lineTo(g.x0 + g.w, g.Y(y)); ctx.stroke(); ctx.restore();
  }

  /* 가로 띠 (L − ε, L + ε) */
  function band(ctx, g, lo, hi, col, alpha = 0.18) {
    const a = Math.max(lo, g.yr[0]), b = Math.min(hi, g.yr[1]);
    if (b <= a) return;
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = col;
    ctx.fillRect(g.x0, g.Y(b), g.w, g.Y(a) - g.Y(b)); ctx.restore();
  }

  /* 바탕을 깐 글자 */
  function tag(ctx, text, x, y, col, align = "left", size = 11.5) {
    ctx.save(); ctx.font = `600 ${size}px ${F.sans}`; ctx.textBaseline = "middle";
    const tw = ctx.measureText(text).width, lx = align === "right" ? x - tw : align === "center" ? x - tw / 2 : x;
    ctx.fillStyle = C.card; ctx.fillRect(lx - 3, y - 8, tw + 6, 16);
    ctx.fillStyle = col; ctx.textAlign = "left"; ctx.fillText(text, lx, y); ctx.restore();
  }

  /* 눈금을 보기 좋게: 범위 [a, b]를 4~6칸으로 */
  function ticks(a, b, k = 5) {
    const raw = (b - a) / k, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
    const step = (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p, out = [];
    for (let v = Math.ceil(a / step) * step; v <= b + step * 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  }

  /* 프리셋 칩: 누른 칩만 aria-pressed=true */
  function chips(root, sel, cb) {
    const bs = [...root.querySelectorAll(sel)];
    bs.forEach((b) => b.addEventListener("click", () => {
      bs.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); cb(b);
    }));
    return bs;
  }

  return { n, frame, dot, hline, band, tag, ticks, chips };
})();
