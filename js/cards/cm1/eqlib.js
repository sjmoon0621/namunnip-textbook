/* 공통수학1 방정식·부등식 카드 공용 도구 window.NMEq
   - 수 표기: frac(분수로 나타낼 수 있으면 분수), quadRoots(근의 공식 결과를 근호·허수로)
   - 해집합: 구간 배열 [{lo, hi, lc, hc}] (lc/hc = 끝점 포함), 일차·이차부등식 풀이, 교집합, 합집합, 문장 표기
   - 수직선 그리기 */
window.NMEq = (() => {
  const EPS = 1e-9, M = "−", INF = Infinity;
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  const near = (a, b) => Math.abs(a - b) < 1e-7;

  /* 분모 12 이하의 분수로 나타내고, 아니면 소수 둘째 자리 (≈ 표시) */
  function frac(v) {
    if (!isFinite(v)) return v > 0 ? "∞" : M + "∞";
    for (let d = 1; d <= 12; d++) {
      const n = Math.round(v * d);
      if (Math.abs(v * d - n) < 1e-7) {
        if (n === 0) return "0";
        const g = gcd(n, d), s = n < 0 ? M : "";
        return d / g === 1 ? s + Math.abs(n / g) : `${s}${Math.abs(n / g)}/${d / g}`;
      }
    }
    return "≈" + (v < 0 ? M : "") + Math.abs(v).toFixed(2);
  }
  const isNice = (v) => !frac(v).startsWith("≈");

  /* 정수 n = k²·m (m은 제곱 인수 없음) */
  function sqf(n) { let k = 1, m = n; for (let f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f; } return { k, m }; }
  /* 유리수 v ≥ 0의 양의 제곱근 √v를 k√m/d 꼴로 */
  function root(v) {
    if (v < 1e-12) return "0";
    let d = 1; while (d <= 60 && Math.abs(v * d - Math.round(v * d)) > 1e-9) d++;
    if (d > 60) return "≈" + Math.sqrt(v).toFixed(2);
    const { k, m } = sqf(Math.round(v * d) * d), g = gcd(k, d), K = k / g, Dd = d / g;
    const core = m === 1 ? String(K) : (K === 1 ? "" : K) + "√" + m;
    return Dd === 1 ? core : `${core}/${Dd}`;
  }

  /* 실수 계수 a x² + b x + c = 0의 근. 계수를 정수로 맞춘 뒤 근호 꼴 문자열을 만든다.
     반환: { D, real: [작은 근, 큰 근] (실근만), text: "x = …" 꼴 근 문자열 배열, kind: "two"|"double"|"imag" } */
  function quadRoots(a, b, c) {
    let s = 1;
    for (let d = 1; d <= 60; d++) if ([a, b, c].every((v) => Math.abs(v * d - Math.round(v * d)) < 1e-7)) { s = d; break; }
    a = Math.round(a * s); b = Math.round(b * s); c = Math.round(c * s);
    const D = b * b - 4 * a * c;
    if (D === 0) { const r = -b / (2 * a); return { D, real: [r, r], text: [frac(r)], kind: "double" }; }
    const { k, m } = sqf(Math.abs(D));
    if (D > 0 && m === 1) {
      const r1 = (-b - k) / (2 * a), r2 = (-b + k) / (2 * a), lo = Math.min(r1, r2), hi = Math.max(r1, r2);
      return { D, real: [lo, hi], text: [frac(lo), frac(hi)], kind: "two" };
    }
    let B = -b, K = k, A = 2 * a; const g = gcd(gcd(B, K), A); B /= g; K /= g; A /= g;
    if (A < 0) { A = -A; B = -B; }
    const rad = (K === 1 ? "" : K) + (m === 1 ? "" : "√" + m) + (D < 0 ? "i" : "");
    const radS = rad === "" ? "1" : rad;
    const one = (sg) => { const core = B === 0 ? (sg < 0 ? M : "") + radS : `${B < 0 ? M : ""}${Math.abs(B)} ${sg < 0 ? M : "+"} ${radS}`; return A === 1 ? core : `(${core})/${A}`; };
    const pm = (() => { const core = B === 0 ? "±" + radS : `${B < 0 ? M : ""}${Math.abs(B)} ± ${radS}`; return A === 1 ? core : `(${core})/${A}`; })();
    if (D > 0) {
      const r1 = (-b - Math.sqrt(D)) / (2 * a), r2 = (-b + Math.sqrt(D)) / (2 * a);
      const lo = Math.min(r1, r2), hi = Math.max(r1, r2), loT = one(-1), hiT = one(1);
      return { D, real: [lo, hi], text: [loT, hiT], pm, kind: "two" };
    }
    return { D, real: [], text: [one(1), one(-1)], pm, kind: "imag", re: -b / (2 * a), im: Math.sqrt(-D) / Math.abs(2 * a) };
  }

  /* ---- 구간 ---- */
  const ALL = () => [{ lo: -INF, hi: INF, lc: false, hc: false }];
  const iv = (lo, hi, lc, hc, ls, hs) => ({ lo, hi, lc: lc && isFinite(lo), hc: hc && isFinite(hi), ls, hs });
  const flip = { "<": ">", ">": "<", "≤": "≥", "≥": "≤" };

  /* s·x + t (op) k */
  function linSolve(s, t, op, k) {
    if (Math.abs(s) < EPS) { const v = t - k, ok = op === "<" ? v < -EPS : op === ">" ? v > EPS : op === "≤" ? v < EPS : v > -EPS; return ok ? ALL() : []; }
    const r = (k - t) / s, o = s < 0 ? flip[op] : op;
    return o === "<" || o === "≤" ? [iv(-INF, r, false, o === "≤")] : [iv(r, INF, o === "≥", false)];
  }

  /* a x² + b x + c (op) 0, a ≠ 0. 근 표기를 끝점 이름(ls/hs)으로 붙인다 */
  function quadSolve(a, b, c, op) {
    const R = quadRoots(a, b, c), o = a < 0 ? flip[op] : op, lt = o === "<" || o === "≤", cl = o === "≤" || o === "≥";
    if (R.kind === "imag") return { R, set: lt ? [] : ALL() };
    const [r1, r2] = R.real, t1 = R.text[0], t2 = R.text[R.text.length - 1];
    if (R.kind === "double") {
      if (lt) return { R, set: cl ? [iv(r1, r1, true, true, t1, t1)] : [] };
      return { R, set: cl ? ALL() : [iv(-INF, r1, false, false, null, t1), iv(r1, INF, false, false, t1, null)] };
    }
    if (lt) return { R, set: [iv(r1, r2, cl, cl, t1, t2)] };
    return { R, set: [iv(-INF, r1, false, cl, null, t1), iv(r2, INF, cl, false, t2, null)] };
  }

  function cap1(a, b) {
    let lo, lc, ls, hi, hc, hs;
    if (near(a.lo, b.lo) || a.lo === b.lo) { lo = a.lo; lc = a.lc && b.lc; ls = a.ls || b.ls; } else if (a.lo > b.lo) { lo = a.lo; lc = a.lc; ls = a.ls; } else { lo = b.lo; lc = b.lc; ls = b.ls; }
    if (near(a.hi, b.hi) || a.hi === b.hi) { hi = a.hi; hc = a.hc && b.hc; hs = a.hs || b.hs; } else if (a.hi < b.hi) { hi = a.hi; hc = a.hc; hs = a.hs; } else { hi = b.hi; hc = b.hc; hs = b.hs; }
    if (lo < hi - 1e-9 && !near(lo, hi)) return { lo, hi, lc, hc, ls, hs };
    if (near(lo, hi) && lc && hc) return { lo, hi: lo, lc, hc, ls, hs: ls };
    return null;
  }
  const cap = (A, B) => norm(A.flatMap((a) => B.map((b) => cap1(a, b)).filter(Boolean)));
  /* 정렬하고 겹치거나 맞닿은 구간을 합친다 */
  function norm(S) {
    const s = S.slice().sort((a, b) => (a.lo === b.lo ? 0 : a.lo - b.lo) || (b.lc - a.lc)), out = [];
    const same = (a, b) => a === b || near(a, b);
    for (const x of s) {
      const p = out[out.length - 1];
      const touch = p && (p.hi === INF || x.lo < p.hi && !same(x.lo, p.hi) || same(x.lo, p.hi) && (p.hc || x.lc));
      if (!touch) { out.push({ ...x }); continue; }
      if (same(x.lo, p.lo)) p.lc = p.lc || x.lc;
      if (same(x.hi, p.hi)) p.hc = p.hc || x.hc;
      else if (x.hi > p.hi) { p.hi = x.hi; p.hc = x.hc; p.hs = x.hs; }
    }
    return out;
  }
  const cup = (A, B) => norm(A.concat(B));

  /* 해집합 문장. v = 문자 이름 (html이면 <i>v</i>) */
  function say(S, html, v = "x") {
    const X = html ? `<i>${v}</i>` : v, L = (x, t) => t || frac(x);
    if (!S.length) return "해가 없습니다";
    if (S.length === 1 && S[0].lo === -INF && S[0].hi === INF) return "모든 실수";
    if (S.length === 2 && S[0].lo === -INF && S[1].hi === INF && near(S[0].hi, S[1].lo) && !S[0].hc && !S[1].lc)
      return `${X} ≠ ${L(S[0].hi, S[0].hs)}인 모든 실수`;
    return S.map((a) => {
      if (near(a.lo, a.hi)) return `${X} = ${L(a.lo, a.ls)}`;
      if (a.lo === -INF) return `${X} ${a.hc ? "≤" : "<"} ${L(a.hi, a.hs)}`;
      if (a.hi === INF) return `${X} ${a.lc ? "≥" : ">"} ${L(a.lo, a.ls)}`;
      return `${L(a.lo, a.ls)} ${a.lc ? "≤" : "<"} ${X} ${a.hc ? "≤" : "<"} ${L(a.hi, a.hs)}`;
    }).join(" 또는 ");
  }
  const has = (S, x) => S.some((a) => (x > a.lo || (a.lc && near(x, a.lo))) && (x < a.hi || (a.hc && near(x, a.hi))) && !(near(x, a.lo) && !a.lc) && !(near(x, a.hi) && !a.hc));

  /* 수직선 위에 해집합을 굵은 선으로. o: {X, y, x0, x1 (픽셀 범위), col, card, lw} */
  function band(ctx, S, o) {
    const lw = o.lw || 5, r = lw * 0.9 + 1.5;
    ctx.save();
    for (const a of S) {
      const pa = Math.max(o.x0, a.lo === -INF ? o.x0 : o.X(a.lo)), pb = Math.min(o.x1, a.hi === INF ? o.x1 : o.X(a.hi));
      ctx.strokeStyle = o.col; ctx.fillStyle = o.col; ctx.lineWidth = lw; ctx.lineCap = "butt";
      if (pb > pa) { ctx.beginPath(); ctx.moveTo(pa, o.y); ctx.lineTo(pb, o.y); ctx.stroke(); }
      if (a.lo === -INF) { ctx.beginPath(); ctx.moveTo(o.x0 - 4, o.y); ctx.lineTo(o.x0 + 6, o.y - 6); ctx.lineTo(o.x0 + 6, o.y + 6); ctx.closePath(); ctx.fill(); }
      if (a.hi === INF) { ctx.beginPath(); ctx.moveTo(o.x1 + 4, o.y); ctx.lineTo(o.x1 - 6, o.y - 6); ctx.lineTo(o.x1 - 6, o.y + 6); ctx.closePath(); ctx.fill(); }
      const dot = (x, closed) => { if (x < o.x0 - 1 || x > o.x1 + 1) return; ctx.beginPath(); ctx.arc(x, o.y, r, 0, 7); ctx.fillStyle = closed ? o.col : o.card; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = o.col; ctx.stroke(); };
      if (isFinite(a.lo)) dot(o.X(a.lo), a.lc);
      if (isFinite(a.hi) && !near(a.lo, a.hi)) dot(o.X(a.hi), a.hc);
    }
    ctx.restore();
  }

  return { EPS, gcd, near, frac, isNice, sqf, root, quadRoots, ALL, iv, flip, linSolve, quadSolve, cap, cup, norm, say, has, band };
})();
