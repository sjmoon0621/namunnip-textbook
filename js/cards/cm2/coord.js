/* 공통수학2 도형의 방정식 카드 공용 도구 window.NMCoord
   plane(): 가로세로 축척이 같은 좌표평면(격자·축·눈금), 점 끌기, 직선·원·곡선 그리기
   수 표기: n(소수), frac(기약분수), surd(√k 간단히), over(p/√k 유리화), root(√(p/q)), lin(일차식), paren((x − a)) */
window.NMCoord = (() => {
  const M = "−";
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  const n = (v, d = 2) => { const r = Math.round(v * 10 ** d) / 10 ** d; return r === 0 ? "0" : (r < 0 ? M : "") + String(Math.abs(r)); };
  /* 정수 p/q를 기약분수로 */
  function frac(p, q) {
    if (q < 0) { p = -p; q = -q; }
    const g = gcd(p, q) || 1; p /= g; q /= g;
    return q === 1 ? n(p) : `${p < 0 ? M : ""}${Math.abs(p)}/${q}`;
  }
  /* √k = a√b (b는 제곱 인수 없음) */
  function parts(k) { let a = 1, b = k; for (let i = 2; i * i <= b; i++) while (b % (i * i) === 0) { b /= i * i; a *= i; } return [a, b]; }
  function surd(k) { if (k === 0) return "0"; const [a, b] = parts(k); return b === 1 ? String(a) : `${a === 1 ? "" : a}√${b}`; }
  /* √(p/q) = √(pq)/q, p ≥ 0, q > 0 정수 */
  function root(p, q) {
    if (p === 0) return "0";
    const [a, b] = parts(p * q), g = gcd(a, q), s = a / g, d = q / g;
    const top = b === 1 ? String(s) : `${s === 1 ? "" : s}√${b}`;
    return d === 1 ? top : `${top}/${d}`;
  }
  /* p/√k를 유리화 (p 정수, k 양의 정수) */
  function over(p, k) {
    if (p === 0) return "0";
    const [s, t] = parts(k);
    if (t === 1) return frac(p, s);
    const sign = p < 0 ? M : "", g = gcd(p, s * t), num = Math.abs(p) / g, den = s * t / g;
    const top = `${num === 1 ? "" : num}√${t}`;
    return sign + (den === 1 ? top : `${top}/${den}`);
  }
  /* 일차식: terms = [[계수, 문자(HTML)], ...], 문자가 ""이면 상수항 */
  function lin(terms) {
    let s = "";
    for (const [c, v] of terms) {
      if (Math.abs(c) < 1e-9) continue;
      const a = n(Math.abs(c)), body = v ? (a === "1" ? "" : a) + v : a;
      s += s ? (c < 0 ? ` ${M} ` : " + ") + body : (c < 0 ? M : "") + body;
    }
    return s || "0";
  }
  /* (x − a) 꼴. a = 0이면 문자만 */
  const paren = (v, a) => (Math.abs(a) < 1e-9 ? v : `(${v} ${a > 0 ? M : "+"} ${n(Math.abs(a))})`);
  /* 음수는 괄호로 감싼 수 (대입 과정 표기용) */
  const pn = (v) => (v < 0 ? `(${n(v)})` : n(v));

  function plane(canvas, view, draw) {
    const { C, F, fit, clamp } = NM;
    const { ctx, size } = fit(canvas, () => draw());
    const sc = () => size.w / view.span;
    const P = { ctx, size, view, sc };
    P.X = (x) => size.w / 2 + (x - view.cx) * sc();
    P.Y = (y) => size.h / 2 - (y - view.cy) * sc();
    P.ix = (px) => view.cx + (px - size.w / 2) / sc();
    P.iy = (py) => view.cy - (py - size.h / 2) / sc();
    P.box = () => ({ x0: P.ix(0), x1: P.ix(size.w), y0: P.iy(size.h), y1: P.iy(0) });

    /* 격자·축·눈금. o: {noGrid, noY, lab} */
    P.grid = (o = {}) => {
      const { w, h } = size, b = P.box(), s = sc();
      ctx.clearRect(0, 0, w, h);
      const lab = o.lab || (s >= 26 ? 1 : s >= 13 ? 2 : 5);
      ctx.lineWidth = 1;
      if (!o.noGrid) {
        ctx.strokeStyle = C.rule; ctx.beginPath();
        for (let x = Math.ceil(b.x0); x <= b.x1; x++) { const px = Math.round(P.X(x)) + .5; ctx.moveTo(px, 0); ctx.lineTo(px, h); }
        for (let y = Math.ceil(b.y0); y <= b.y1; y++) { const py = Math.round(P.Y(y)) + .5; ctx.moveTo(0, py); ctx.lineTo(w, py); }
        ctx.stroke();
      }
      const ox = clamp(P.X(0), 1, w - 1), oy = clamp(P.Y(0), 1, h - 1);
      ctx.strokeStyle = C.ink3; ctx.fillStyle = C.ink3; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(w - 2, oy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w - 2, oy); ctx.lineTo(w - 9, oy - 4); ctx.lineTo(w - 9, oy + 4); ctx.fill();
      if (!o.noY) {
        ctx.beginPath(); ctx.moveTo(ox, h); ctx.lineTo(ox, 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ox, 2); ctx.lineTo(ox - 4, 9); ctx.lineTo(ox + 4, 9); ctx.fill();
      }
      ctx.font = `10px ${F.mono}`; ctx.textBaseline = "alphabetic";
      ctx.textAlign = "center";
      const ty = oy + 13 > h - 3 ? oy - 5 : oy + 13;
      for (let x = Math.ceil(b.x0 / lab) * lab; x <= b.x1 - 0.4; x += lab) {
        if (Math.abs(x) < 1e-9 || P.X(x) < 8) continue;
        if (o.noY || o.noGrid) { ctx.beginPath(); ctx.moveTo(P.X(x), oy - 3); ctx.lineTo(P.X(x), oy + 3); ctx.stroke(); }
        ctx.fillText(n(x), P.X(x), ty);
      }
      if (!o.noY) {
        ctx.textAlign = "right";
        const tx = ox - 5 < 14 ? ox + 22 : ox - 5;
        for (let y = Math.ceil(b.y0 / lab) * lab; y <= b.y1 - 0.4; y += lab) {
          if (Math.abs(y) < 1e-9 || P.Y(y) > h - 6) continue;
          ctx.fillText(n(y), tx, P.Y(y) + 3.5);
        }
        ctx.fillText("O", ox - 4, oy + 13);
      }
      ctx.font = `italic 14px ${F.serif}`; ctx.fillStyle = C.ink2;
      ctx.textAlign = "right"; ctx.fillText("x", w - 6, oy - 8);
      if (!o.noY) { ctx.textAlign = "left"; ctx.fillText("y", ox + 8, 14); }
    };

    const stroke = (color, wd, dash) => { ctx.strokeStyle = color; ctx.lineWidth = wd; ctx.setLineDash(dash || []); };
    P.seg = (p, q, color, wd = 2, dash) => {
      ctx.save(); stroke(color, wd, dash); ctx.beginPath();
      ctx.moveTo(P.X(p[0]), P.Y(p[1])); ctx.lineTo(P.X(q[0]), P.Y(q[1])); ctx.stroke(); ctx.restore();
    };
    /* 직선 ax + by + c = 0 을 화면 끝까지 */
    P.line = (a, b, c, color, wd = 2, dash) => {
      const B = P.box(), m = 2;
      if (Math.abs(a) < 1e-12 && Math.abs(b) < 1e-12) return;
      if (Math.abs(b) >= Math.abs(a)) P.seg([B.x0 - m, -(a * (B.x0 - m) + c) / b], [B.x1 + m, -(a * (B.x1 + m) + c) / b], color, wd, dash);
      else P.seg([-(b * (B.y0 - m) + c) / a, B.y0 - m], [-(b * (B.y1 + m) + c) / a, B.y1 + m], color, wd, dash);
    };
    P.circle = (cx, cy, r, color, wd = 2, dash) => {
      ctx.save(); stroke(color, wd, dash); ctx.beginPath(); ctx.arc(P.X(cx), P.Y(cy), r * sc(), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    };
    /* 꺾은선 (fill이 있으면 칠한다) */
    P.path = (pts, color, wd = 2, dash, close, fill, alpha = 0.25) => {
      if (pts.length < 2) return;
      ctx.save(); ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(P.X(x), P.Y(y)) : ctx.moveTo(P.X(x), P.Y(y))));
      if (close) ctx.closePath();
      if (fill) { ctx.globalAlpha = alpha; ctx.fillStyle = fill; ctx.fill(); ctx.globalAlpha = 1; }
      if (color) { stroke(color, wd, dash); ctx.stroke(); }
      ctx.restore();
    };
    /* y = f(x) 그래프 (화면 밖으로 크게 벗어나면 끊는다) */
    P.curve = (f, color, wd = 2, dash) => {
      const B = P.box(), N = 240, pts = [];
      ctx.save(); stroke(color, wd, dash); ctx.beginPath();
      let on = false;
      for (let i = 0; i <= N; i++) {
        const x = B.x0 + (B.x1 - B.x0) * i / N, y = f(x), py = P.Y(y);
        if (!isFinite(py) || py < -size.h || py > 2 * size.h) { on = false; continue; }
        if (on) ctx.lineTo(P.X(x), py); else ctx.moveTo(P.X(x), py);
        on = true; pts.push([x, y]);
      }
      ctx.stroke(); ctx.restore();
    };
    P.dot = (p, color, r = 4) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(P.X(p[0]), P.Y(p[1]), r, 0, 7); ctx.fill(); };
    /* 끌 수 있는 점: 테두리 고리를 덧그린다 */
    P.knob = (p, color) => {
      const x = P.X(p[0]), y = P.Y(p[1]);
      ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 11, 0, 7); ctx.fill(); ctx.restore();
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 5.5, 0, 7); ctx.fill();
      ctx.fillStyle = C.card; ctx.beginPath(); ctx.arc(x, y, 2, 0, 7); ctx.fill();
    };
    /* 글자 (뒤에 카드 색 바탕). align: left|right|center. 캔버스 밖으로 나가지 않게 민다 */
    P.text = (t, p, color, dx = 8, dy = -9, align = "left", font) => {
      ctx.save(); ctx.font = font || `600 12px ${F.sans}`; ctx.textBaseline = "middle"; ctx.textAlign = "left";
      const tw = ctx.measureText(t).width;
      let x = P.X(p[0]) + dx, y = P.Y(p[1]) + dy;
      if (align === "right") x -= tw; else if (align === "center") x -= tw / 2;
      x = clamp(x, 3, size.w - tw - 3); y = clamp(y, 9, size.h - 9);
      ctx.globalAlpha = 0.85; ctx.fillStyle = C.card; ctx.fillRect(x - 2, y - 8, tw + 4, 16); ctx.globalAlpha = 1;
      ctx.fillStyle = color; ctx.fillText(t, x, y); ctx.restore();
    };
    /* 화살표 p → q */
    P.arrow = (p, q, color, wd = 1.5, dash) => {
      const x1 = P.X(p[0]), y1 = P.Y(p[1]), x2 = P.X(q[0]), y2 = P.Y(q[1]), L = Math.hypot(x2 - x1, y2 - y1);
      if (L < 4) return;
      const ux = (x2 - x1) / L, uy = (y2 - y1) / L;
      ctx.save(); stroke(color, wd, dash); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - ux * 6, y2 - uy * 6); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - ux * 9 - uy * 4, y2 - uy * 9 + ux * 4); ctx.lineTo(x2 - ux * 9 + uy * 4, y2 - uy * 9 - ux * 4); ctx.fill(); ctx.restore();
    };
    /* 직각 표시: 점 at에서 방향 u, v (좌표 벡터) */
    P.right = (at, u, v, color, s = 9) => {
      const nu = Math.hypot(u[0], u[1]), nv = Math.hypot(v[0], v[1]);
      if (!nu || !nv) return;
      const x = P.X(at[0]), y = P.Y(at[1]), a = [u[0] / nu * s, -u[1] / nu * s], b = [v[0] / nv * s, -v[1] / nv * s];
      ctx.save(); stroke(color, 1.2); ctx.beginPath();
      ctx.moveTo(x + a[0], y + a[1]); ctx.lineTo(x + a[0] + b[0], y + a[1] + b[1]); ctx.lineTo(x + b[0], y + b[1]); ctx.stroke(); ctx.restore();
    };
    /* 끌기: handles = [{get: () => [x, y], set: (x, y) => {}, off?: () => bool}] */
    P.drag = (handles, onChange) => {
      let act = null;
      canvas.style.touchAction = "none";
      const pos = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      const hit = (px, py) => {
        let best = null, bd = 24;
        for (const hd of handles) {
          if (hd.off && hd.off()) continue;
          const [x, y] = hd.get(), d = Math.hypot(P.X(x) - px, P.Y(y) - py);
          if (d < bd) { bd = d; best = hd; }
        }
        return best;
      };
      const move = (px, py) => {
        const b = P.box(), m = 0.3;
        act.set(clamp(P.ix(px), b.x0 + m, b.x1 - m), clamp(P.iy(py), b.y0 + m, b.y1 - m));
        onChange();
      };
      canvas.addEventListener("pointerdown", (e) => {
        const [px, py] = pos(e); act = hit(px, py);
        if (!act) return;
        canvas.setPointerCapture(e.pointerId); e.preventDefault(); canvas.style.cursor = "grabbing"; move(px, py);
      });
      canvas.addEventListener("pointermove", (e) => {
        const [px, py] = pos(e);
        if (act) move(px, py); else canvas.style.cursor = hit(px, py) ? "grab" : "";
      });
      const end = () => { act = null; canvas.style.cursor = ""; };
      canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);
    };
    return P;
  }

  return { M, gcd, n, frac, surd, root, over, lin, paren, pn, plane };
})();
