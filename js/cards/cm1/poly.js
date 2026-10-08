/* 공통수학1 다항식 카드 공용 도구 window.NMPoly
   다항식은 계수 배열로 다룬다: p[k] = x^k의 계수 (낮은 차수부터). */
window.NMPoly = (() => {
  const EPS = 1e-9;
  const trim = (p) => { const q = p.slice(); while (q.length > 1 && Math.abs(q[q.length - 1]) < EPS) q.pop(); return q; };
  const deg = (p) => { const q = trim(p); return q.length === 1 && Math.abs(q[0]) < EPS ? -Infinity : q.length - 1; };
  const add = (a, b) => trim(Array.from({ length: Math.max(a.length, b.length) }, (_, i) => (a[i] || 0) + (b[i] || 0)));
  const scale = (a, k) => a.map((v) => v * k);
  const sub = (a, b) => add(a, scale(b, -1));
  const mul = (a, b) => { const r = new Array(a.length + b.length - 1).fill(0); a.forEach((x, i) => b.forEach((y, j) => { r[i + j] += x * y; })); return trim(r); };
  const at = (p, x) => p.reduceRight((s, c) => s * x + c, 0);
  /* 긴 나눗셈: a = b·q + r, r의 차수 < b의 차수 */
  function div(a, b) {
    b = trim(b); let r = trim(a).slice();
    const db = b.length - 1, q = new Array(Math.max(1, r.length - db)).fill(0);
    for (let k = r.length - 1 - db; k >= 0; k--) { const c = r[k + db] / b[db]; q[k] = c; for (let j = 0; j <= db; j++) r[k + j] -= c * b[j]; }
    r = trim(r.slice(0, Math.max(1, db)).map((v) => (Math.abs(v) < EPS ? 0 : v)));
    return { q: trim(q), r };
  }

  const M = "−";
  const num = (v) => String(Math.round(Math.abs(v) * 1000) / 1000);
  const SUP = ["", "", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸"];
  /* 부호 없는 단항식 |c|·x^k. html이면 <i>x</i><sup>k</sup> */
  function mono(c, k, html, v = "x") {
    const a = num(c);
    if (k === 0) return a;
    const x = html ? `<i>${v}</i>` : v, p = k > 1 ? (html ? `<sup>${k}</sup>` : SUP[k]) : "";
    return (a === "1" ? "" : a) + x + p;
  }
  /* 부호를 붙인 단항식 하나 (식의 첫 항처럼) */
  const term = (c, k, html, v) => (c < 0 ? M : "") + mono(c, k, html, v);
  /* 내림차순 다항식 문자열 */
  function fmt(p, html, v) {
    const t = [];
    for (let k = p.length - 1; k >= 0; k--) {
      if (Math.abs(p[k]) < EPS) continue;
      const s = mono(p[k], k, html, v);
      t.push(t.length ? (p[k] < 0 ? ` ${M} ` : " + ") + s : (p[k] < 0 ? M : "") + s);
    }
    return t.length ? t.join("") : "0";
  }
  /* 수 하나 (음수는 −) */
  const n = (v) => (v < -EPS ? M : "") + num(v);

  /* 그래프 한 줄: 상자 안으로 잘라서 그린다 */
  function curve(ctx, f, X, Y, x0, x1, box, color, width = 2, dash) {
    ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
    ctx.strokeStyle = color; ctx.lineWidth = width; if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    const N = 240;
    for (let i = 0; i <= N; i++) { const x = x0 + (x1 - x0) * i / N, y = Y(f(x)); i ? ctx.lineTo(X(x), y) : ctx.moveTo(X(x), y); }
    ctx.stroke(); ctx.restore();
  }

  return { EPS, trim, deg, add, sub, scale, mul, at, div, mono, term, fmt, n, curve };
})();
