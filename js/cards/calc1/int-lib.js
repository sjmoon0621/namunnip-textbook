/* 미적분Ⅰ 적분 카드 공용 도구 window.NMInt — 다항식(낮은 차수부터 계수 배열), 부정적분·정적분, 분수 표기, 넓이 칠하기, 끌기 */
window.NMInt = (() => {
  const { C } = NM;
  const M = "−";
  const at = (p, x) => p.reduceRight((s, c) => s * x + c, 0);
  const der = (p) => p.slice(1).map((c, i) => c * (i + 1));
  const integ = (p, c0 = 0) => [c0, ...p.map((c, i) => c / (i + 1))];
  const def = (p, a, b) => { const P = integ(p); return at(P, b) - at(P, a); };

  /* 분모 maxD 이하의 분수로 정확히 나타나면 "n/d", 아니면 소수 */
  function frac(v, maxD = 12) {
    if (!isFinite(v)) return "—";
    const s = v < -1e-12 ? M : "", a = Math.abs(v);
    if (Math.abs(a - Math.round(a)) < 1e-9) return Math.round(a) === 0 ? "0" : s + Math.round(a);
    for (let d = 2; d <= maxD; d++) { const n = Math.round(a * d); if (Math.abs(n / d - a) < 1e-9) return `${s}${n}/${d}`; }
    return NMCalc.n(v, 3);
  }
  /* 분수면 "13/6 (≈ 2.167)"처럼 소수도 함께 */
  const val = (v, maxD = 12) => { const f = frac(v, maxD); return f.includes("/") ? `${f} (≈ ${NMCalc.n(v, 3)})` : f; };

  const VF = { "1/2": "½", "1/3": "⅓", "2/3": "⅔", "1/4": "¼", "3/4": "¾", "1/5": "⅕", "2/5": "⅖", "3/5": "⅗", "4/5": "⅘", "1/6": "⅙", "5/6": "⅚", "1/8": "⅛", "3/8": "⅜", "5/8": "⅝", "7/8": "⅞" };
  const SUP = (k) => String(k).split("").map((d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]).join("");

  /* 다항식 표기: html이면 <i>x</i><sup>n</sup>, 아니면 x² */
  function fmt(p, o = {}) {
    const html = o.html !== false, v = o.v || "x", vx = html ? `<i>${v}</i>` : v;
    const pw = (k) => (k === 0 ? "" : k === 1 ? vx : html ? `${vx}<sup>${k}</sup>` : vx + SUP(k));
    let s = "";
    for (let k = p.length - 1; k >= 0; k--) {
      const c = p[k]; if (Math.abs(c) < 1e-12) continue;
      const a = Math.abs(c);
      let cs = Math.abs(a - 1) < 1e-12 && k > 0 ? "" : frac(a, 60);
      if (VF[cs]) cs = VF[cs]; else if (cs.includes("/")) cs = `(${cs})`;
      s += s ? ` ${c < 0 ? M : "+"} ` : c < 0 ? M : "";
      s += cs + pw(k);
    }
    return s || "0";
  }

  /* [lo, hi]에서 부호가 바뀌는 곳(근)을 이분법으로 */
  function roots(f, lo, hi, N = 600) {
    const r = []; let xa = lo, fa = f(lo);
    for (let i = 1; i <= N; i++) {
      const xb = lo + (hi - lo) * i / N, fb = f(xb);
      if (fa === 0 && i > 1) r.push(xa);
      else if (fa * fb < 0) { let p = xa, q = xb; for (let k = 0; k < 60; k++) { const m = (p + q) / 2; if (f(p) * f(m) <= 0) q = m; else p = m; } r.push((p + q) / 2); }
      xa = xb; fa = fb;
    }
    return r;
  }
  /* 다항식 p의 [a, b] 넓이 ∫|p| (근에서 나누어 정적분의 절댓값을 더한다) */
  function absInt(p, a, b) {
    const lo = Math.min(a, b), hi = Math.max(a, b);
    const cuts = [lo, ...roots((x) => at(p, x), lo, hi).filter((r) => r > lo + 1e-9 && r < hi - 1e-9), hi];
    let s = 0; for (let i = 0; i < cuts.length - 1; i++) s += Math.abs(def(p, cuts[i], cuts[i + 1]));
    return { area: s, cuts };
  }

  /* f와 base 사이를 칠한다. split이면 base 위(양)는 pos, 아래(음)는 neg 색 */
  function fill(ctx, g, f, a, b, o = {}) {
    if (a > b) [a, b] = [b, a];
    if (b - a < 1e-9) return;
    const base = o.base || (() => 0), N = 240, cy = (y) => NM.clamp(g.Y(y), g.y0 - 4, g.y0 + g.h + 4);
    const path = new Path2D();
    for (let i = 0; i <= N; i++) { const x = a + (b - a) * i / N; i ? path.lineTo(g.X(x), cy(f(x))) : path.moveTo(g.X(x), cy(f(x))); }
    for (let i = N; i >= 0; i--) { const x = a + (b - a) * i / N; path.lineTo(g.X(x), cy(base(x))); }
    path.closePath();
    ctx.save(); ctx.beginPath(); ctx.rect(g.x0, g.y0, g.w, g.h); ctx.clip(); ctx.globalAlpha = o.alpha ?? .24;
    if (o.split === false) { ctx.fillStyle = o.pos || NMCalc.BLUE; ctx.fill(path); }
    else {
      const y0 = NM.clamp(g.Y(0), g.y0, g.y0 + g.h);
      ctx.save(); ctx.beginPath(); ctx.rect(g.x0, g.y0, g.w, y0 - g.y0); ctx.clip(); ctx.fillStyle = o.pos || NMCalc.BLUE; ctx.fill(path); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(g.x0, y0, g.w, g.y0 + g.h - y0); ctx.clip(); ctx.fillStyle = o.neg || C.warn; ctx.fill(path); ctx.restore();
    }
    ctx.restore();
  }

  /* 캔버스 끌기: pick(px, py)가 손잡이 이름(없으면 null)을 돌려주면 move(이름, px, py)를 부른다 */
  function drag(cv, pick, move) {
    cv.style.touchAction = "none";
    let id = null;
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.addEventListener("pointerdown", (e) => { const [x, y] = pos(e); id = pick(x, y); if (id == null) return; cv.setPointerCapture(e.pointerId); move(id, x, y); e.preventDefault(); });
    cv.addEventListener("pointermove", (e) => { const [x, y] = pos(e); if (id != null) move(id, x, y); else cv.style.cursor = pick(x, y) != null ? "grab" : ""; });
    const up = () => { id = null; };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  }

  /* 손잡이(끌 수 있는 점) */
  function handle(ctx, px, py, color) {
    ctx.save(); ctx.fillStyle = C.card; ctx.strokeStyle = color; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(px, py, 7, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(px, py, 2.6, 0, 7); ctx.fill(); ctx.restore();
  }

  return { M, at, der, integ, def, frac, val, fmt, roots, absInt, fill, drag, handle };
})();
