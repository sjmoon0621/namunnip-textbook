/* 대수 수열 카드 공용 도구 window.NMSeq — 수 표기, 눈금, 좌표 틀, 점, 글상자, 화살표
   좌표는 수학 좌표로 넘기고, frame이 돌려주는 X·Y로 화면 좌표로 바꾼다. */
window.NMSeq = (() => {
  const { C, F, axes } = NM;
  /* 수 표기: 소수 d자리까지 반올림, 끝의 0은 지우고 음수 기호는 − */
  function n(v, d = 3) {
    if (!isFinite(v)) return "—";
    let s = (Math.round(v * 10 ** d) / 10 ** d).toFixed(d);
    if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
    if (s === "-0") s = "0";
    return s.replace("-", "−");
  }
  /* a에서 b까지 1·2·5 단위의 눈금, 많아야 max개 남짓 */
  function ticks(a, b, max = 6) {
    const raw = (b - a) / max, mag = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw);
    const out = [];
    for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push([v, n(v)]);
    return out;
  }
  /* box {x, y, w, h}, r {x0, x1, y0, y1}, o {xt, yt, xlabel, ylabel} */
  function frame(ctx, box, r, o = {}) {
    const X = (x) => box.x + (x - r.x0) / (r.x1 - r.x0) * box.w, Y = (y) => box.y + (r.y1 - y) / (r.y1 - r.y0) * box.h;
    axes(ctx, { x0: box.x, y0: box.y, w: box.w, h: box.h, X, Y, xt: o.xt, yt: o.yt, xlabel: o.xlabel, ylabel: o.ylabel });
    if (r.y0 < 0 && r.y1 > 0) {
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath();
      ctx.moveTo(box.x, Math.round(Y(0)) + .5); ctx.lineTo(box.x + box.w, Math.round(Y(0)) + .5); ctx.stroke();
    }
    return {
      X, Y,
      inX: (px) => r.x0 + (px - box.x) / box.w * (r.x1 - r.x0),
      inY: (py) => r.y1 - (py - box.y) / box.h * (r.y1 - r.y0),
    };
  }
  function dot(ctx, x, y, r, col, hollow) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7);
    if (hollow) { ctx.fillStyle = C.card; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.stroke(); }
    else { ctx.fillStyle = col; ctx.fill(); }
  }
  /* 첨자 표기를 조각으로: "a_{n+1} = 2^{n−1}", 한 글자면 a_5, 2^n처럼 괄호 없이 */
  function parts(str) {
    const out = []; let i = 0, buf = "";
    while (i < str.length) {
      const ch = str[i];
      if ((ch === "_" || ch === "^") && i + 1 < str.length) {
        if (buf) { out.push([buf, 0]); buf = ""; }
        let t;
        if (str[i + 1] === "{") { const j = str.indexOf("}", i); t = str.slice(i + 2, j); i = j + 1; }
        else { t = str[i + 1]; i += 2; }
        out.push([t, ch === "_" ? 1 : -1]);
      } else { buf += ch; i++; }
    }
    if (buf) out.push([buf, 0]);
    return out;
  }
  /* 첨자가 있는 글자를 그린다. o: {size, weight, family, align, col}. 너비를 돌려준다 */
  function rich(ctx, str, x, y, o = {}) {
    const size = o.size || 12, fam = o.family || F.sans, wt = o.weight || 400, ps = parts(str);
    const fnt = (lv) => `${wt} ${lv ? Math.round(size * 0.72) : size}px ${fam}`;
    let tw = 0; ps.forEach(([t, lv]) => { ctx.font = fnt(lv); tw += ctx.measureText(t).width; });
    if (o.measure) return tw;
    let cx = o.align === "right" ? x - tw : o.align === "center" ? x - tw / 2 : x;
    ctx.save(); ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = o.col || C.ink;
    ps.forEach(([t, lv]) => { ctx.font = fnt(lv); ctx.fillText(t, cx, y + lv * size * 0.32); cx += ctx.measureText(t).width; });
    ctx.restore();
    return tw;
  }
  /* 바탕을 깐 글자(첨자 표기 가능). align: left | right | center */
  function tag(ctx, txt, x, y, col, align = "left", size = 11.5) {
    const o = { size, weight: 600, col }, tw = rich(ctx, txt, 0, 0, { ...o, measure: true });
    const lx = align === "left" ? x : align === "right" ? x - tw : x - tw / 2;
    ctx.save(); ctx.fillStyle = C.card; ctx.globalAlpha = 0.9; ctx.fillRect(lx - 3, y - 9, tw + 6, 18); ctx.restore();
    rich(ctx, txt, lx, y, o);
    return tw;
  }
  function arrow(ctx, x1, y1, x2, y2, col, lw = 1.5) {
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const t = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 6 * Math.cos(t - 0.45), y2 - 6 * Math.sin(t - 0.45));
    ctx.lineTo(x2 - 6 * Math.cos(t + 0.45), y2 - 6 * Math.sin(t + 0.45)); ctx.closePath(); ctx.fill();
  }
  /* 캔버스 안의 포인터 위치 (CSS 픽셀) */
  const local = (cv, e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  /* 일차식 m·v + c를 "2n + 1", "−n", "3" 꼴로 */
  function lin(m, c, v = "n") {
    let s = m === 0 ? "" : (m === 1 ? "" : m === -1 ? "−" : n(m)) + v;
    if (c !== 0 || !s) s += s ? ` ${c < 0 ? "−" : "+"} ${n(Math.abs(c))}` : n(c);
    return s;
  }
  /* 기약분수 문자열: 정수면 정수만 */
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  function fr(p, q) {
    if (q < 0) { p = -p; q = -q; }
    const g = gcd(Math.abs(p), q) || 1; p /= g; q /= g;
    return q === 1 ? n(p) : `${p < 0 ? "−" : ""}${Math.abs(p)}/${q}`;
  }
  const BLUE = "#3f6fa3";
  return { n, lin, fr, gcd, ticks, frame, dot, rich, tag, arrow, local, BLUE };
})();
