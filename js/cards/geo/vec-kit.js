/* 기하 벡터 단원 공용 도구 (window.NMGeoVec): 수 표기, 화살표, 벡터 이름표, 같은 축척 좌표평면, 3차원 투영, 끌기 */
window.NMGeoVec = (() => {
  const { C, F, clamp } = NM;

  /* 수 표기: 소수 d자리까지, 음수 기호는 −, −0은 0 */
  const n = (v, d = 2) => { const r = +(+v).toFixed(d); return (r === 0 ? "0" : String(r)).replace("-", "−"); };
  const tup = (a, d = 2) => `(${a.map((x) => n(x, d)).join(", ")})`;
  /* 음이 아닌 정수 q의 제곱근을 k√m 꼴로 */
  function surd(q) {
    q = Math.round(q); if (q <= 0) return "0";
    let k = 1, m = q;
    for (let i = Math.floor(Math.sqrt(q)); i > 1; i--) if (q % (i * i) === 0) { k = i; m = q / (i * i); break; }
    return m === 1 ? String(k) : `${k > 1 ? k : ""}√${m}`;
  }
  /* 정수 제곱의 합 q → "√13 ≈ 3.61" 또는 "5" */
  const len = (q) => { const s = surd(q); return s.includes("√") ? `${s} ≈ ${n(Math.sqrt(q))}` : s; };
  /* 일차식 HTML: lin([2,-1,0],["x","y","z"],3) → 2x − y + 3 */
  function lin(cs, vars, k = 0) {
    let s = "";
    cs.forEach((c, i) => {
      if (Math.abs(c) < 1e-9) return;
      const a = Math.abs(c), coef = Math.abs(a - 1) < 1e-9 ? "" : n(a), v = `<i>${vars[i]}</i>`;
      s += s ? ` ${c < 0 ? "−" : "+"} ${coef}${v}` : `${c < 0 ? "−" : ""}${coef}${v}`;
    });
    if (Math.abs(k) > 1e-9) s += s ? ` ${k < 0 ? "−" : "+"} ${n(Math.abs(k))}` : n(k);
    return s || "0";
  }
  /* (x − a) 꼴 HTML */
  const shift = (v, a) => Math.abs(a) < 1e-9 ? `<i>${v}</i>` : `(<i>${v}</i> ${a < 0 ? "+" : "−"} ${n(Math.abs(a))})`;

  function line(ctx, x0, y0, x1, y1, col, lw = 1.5, dash) {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
  }
  function arrow(ctx, x0, y0, x1, y1, col, lw = 2.5, head = 10, dash) {
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy);
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = "round";
    if (L < 2) { ctx.beginPath(); ctx.arc(x0, y0, 3.5, 0, 7); ctx.fill(); ctx.restore(); return; }
    const ux = dx / L, uy = dy / L, hl = Math.min(head, L * 0.5), hw = hl * 0.45;
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * hl * 0.8, y1 - uy * hl * 0.8); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - ux * hl - uy * hw, y1 - uy * hl + ux * hw); ctx.lineTo(x1 - ux * hl + uy * hw, y1 - uy * hl - ux * hw);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function dot(ctx, x, y, col, r = 4.5, ring) {
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    if (ring) { ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.globalAlpha = .45; ctx.beginPath(); ctx.arc(x, y, r + 5, 0, 7); ctx.stroke(); }
    ctx.restore();
  }
  /* 일반 글자표 (배경 깔고) */
  function text(ctx, s, x, y, col, o = {}) {
    ctx.save(); ctx.font = o.font || `600 12px ${F.sans}`; ctx.textAlign = o.align || "center"; ctx.textBaseline = "middle";
    const tw = ctx.measureText(s).width, lx = ctx.textAlign === "center" ? x - tw / 2 : ctx.textAlign === "left" ? x : x - tw;
    if (o.bg !== false) { ctx.fillStyle = C.card; ctx.globalAlpha = .85; ctx.fillRect(lx - 3, y - 8, tw + 6, 16); ctx.globalAlpha = 1; }
    ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore();
    return tw;
  }
  /* 벡터 이름표: "{a}+{b}", "{AB}", "k{a}" — 중괄호 안 글자 위에 화살표 */
  function vlabel(ctx, src, x, y, col, o = {}) {
    const parts = [];
    src.replace(/\{([^}]*)\}|([^{]+)/g, (_, v, p) => { parts.push(v != null ? [v, 1] : [p, 0]); return ""; });
    const fv = o.size || 14, fontV = `italic 600 ${fv}px ${F.serif}`, fontP = `500 ${fv}px ${F.serif}`;
    ctx.save();
    const ws = parts.map(([t, v]) => { ctx.font = v ? fontV : fontP; return ctx.measureText(t).width; });
    const tw = ws.reduce((a, b) => a + b, 0);
    let x0 = o.align === "left" ? x : o.align === "right" ? x - tw : x - tw / 2;
    if (o.bg !== false) { ctx.fillStyle = C.card; ctx.globalAlpha = .85; ctx.fillRect(x0 - 3, y - fv * 0.95, tw + 7, fv * 1.65); ctx.globalAlpha = 1; }
    ctx.textBaseline = "alphabetic"; ctx.textAlign = "left"; ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 1.2;
    const base = y + fv * 0.38, ty = y - fv * 0.6;
    parts.forEach(([t, v], i) => {
      ctx.font = v ? fontV : fontP; ctx.fillText(t, x0, base);
      if (v) {
        const a = x0 + 1.5, b = x0 + ws[i] + 2;
        ctx.beginPath(); ctx.moveTo(a, ty); ctx.lineTo(b - 2, ty); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(b + 0.5, ty); ctx.lineTo(b - 3.5, ty - 2.6); ctx.lineTo(b - 3.5, ty + 2.6); ctx.closePath(); ctx.fill();
      }
      x0 += ws[i];
    });
    ctx.restore();
    return tw;
  }

  /* 같은 축척 좌표평면: xr, yr 범위가 모두 보이도록 축척을 정한다 */
  function plane(w, h, xr, yr, pad = 14) {
    const s = Math.min((w - 2 * pad) / (xr[1] - xr[0]), (h - 2 * pad) / (yr[1] - yr[0]));
    const cx = w / 2 - s * (xr[0] + xr[1]) / 2, cy = h / 2 + s * (yr[0] + yr[1]) / 2;
    const v = { s, w, h, X: (x) => cx + s * x, Y: (y) => cy - s * y, ix: (px) => (px - cx) / s, iy: (py) => (cy - py) / s };
    v.x0 = v.ix(0); v.x1 = v.ix(w); v.y0 = v.iy(h); v.y1 = v.iy(0);
    v.P = (p) => [v.X(p[0]), v.Y(p[1])];
    return v;
  }
  function grid(ctx, v, o = {}) {
    const { w, h } = v;
    ctx.save(); ctx.lineWidth = 1; ctx.strokeStyle = C.rule;
    for (let i = Math.ceil(v.x0); i <= v.x1; i++) { const x = Math.round(v.X(i)) + .5; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let j = Math.ceil(v.y0); j <= v.y1; j++) { const y = Math.round(v.Y(j)) + .5; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    if (o.axes !== false) {
      ctx.strokeStyle = C.ink3; ctx.beginPath();
      ctx.moveTo(0, Math.round(v.Y(0)) + .5); ctx.lineTo(w, Math.round(v.Y(0)) + .5);
      ctx.moveTo(Math.round(v.X(0)) + .5, 0); ctx.lineTo(Math.round(v.X(0)) + .5, h); ctx.stroke();
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
      for (let i = Math.ceil(v.x0); i <= v.x1; i++) if (i && i % 2 === 0) ctx.fillText(n(i), v.X(i), v.Y(0) + 3);
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      for (let j = Math.ceil(v.y0); j <= v.y1; j++) if (j && j % 2 === 0) ctx.fillText(n(j), v.X(0) - 4, v.Y(j));
      ctx.font = `italic 12px ${F.serif}`; ctx.textAlign = "right"; ctx.textBaseline = "bottom";
      ctx.fillText("x", w - 4, v.Y(0) - 2); ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillText("y", v.X(0) + 5, 3);
      ctx.font = `italic 11px ${F.serif}`; ctx.textAlign = "right"; ctx.fillText("O", v.X(0) - 3, v.Y(0) + 2);
    }
    ctx.restore();
  }

  /* 끌기: pts() → [{id, x, y}] (화면 좌표), move(id, px, py) */
  function drag(canvas, pts, move, done) {
    let on = null;
    const pos = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const pick = (x, y) => { let best = null, bd = 24; for (const p of pts()) { const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = p.id; } } return best; };
    canvas.addEventListener("pointerdown", (e) => {
      const [x, y] = pos(e); on = pick(x, y);
      if (on == null) return;
      canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing"; move(on, x, y); e.preventDefault();
    });
    canvas.addEventListener("pointermove", (e) => {
      const [x, y] = pos(e);
      if (on != null) move(on, x, y);
      else canvas.style.cursor = pick(x, y) != null ? "grab" : "";
    });
    const up = () => { if (on != null && done) done(); on = null; canvas.style.cursor = ""; };
    canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
  }

  /* 3차원 투영(평행투영): x축은 앞 왼쪽, y축은 오른쪽, z축은 위 */
  function view3(o = {}) {
    const v = { yaw: o.yaw ?? -0.4, pitch: o.pitch ?? 0.38, s: 30, cx: 0, cy: 0 };
    const rot = (p) => {
      const c = Math.cos(v.yaw), s = Math.sin(v.yaw), cp = Math.cos(v.pitch), sp = Math.sin(v.pitch);
      const x1 = p[0] * c - p[1] * s, y1 = p[0] * s + p[1] * c;
      return [y1, p[2] * cp - x1 * sp, x1 * cp + p[2] * sp];
    };
    v.P = (p) => { const r = rot(p); return [v.cx + v.s * r[0], v.cy - v.s * r[1]]; };
    v.depth = (p) => rot(p)[2];
    return v;
  }
  /* 축과 xy평면 격자 */
  function axes3(ctx, v, L = 4, o = {}) {
    ctx.save();
    if (o.grid) {
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
      const G = o.grid;
      for (let i = -G; i <= G; i++) {
        let a = v.P([i, -G, 0]), b = v.P([i, G, 0]); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
        a = v.P([-G, i, 0]); b = v.P([G, i, 0]); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
      }
    }
    const names = ["x", "y", "z"];
    for (let k = 0; k < 3; k++) {
      const e = [0, 0, 0]; e[k] = L; const m = [0, 0, 0]; m[k] = -L * (o.neg ?? 0.6);
      const O = v.P([0, 0, 0]), A = v.P(e), M = v.P(m);
      line(ctx, O[0], O[1], M[0], M[1], C.ink3, 1, [3, 3]);
      arrow(ctx, O[0], O[1], A[0], A[1], C.ink3, 1.2, 7);
      const t = [0, 0, 0]; t[k] = L * 1.09; const T = v.P(t);
      ctx.fillStyle = C.ink2; ctx.font = `italic 13px ${F.serif}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(names[k], T[0], T[1]);
      ctx.fillStyle = C.ink3;
      for (let i = 1; i < L; i++) { const q = [0, 0, 0]; q[k] = i; const Q = v.P(q); ctx.beginPath(); ctx.arc(Q[0], Q[1], 1.6, 0, 7); ctx.fill(); }
    }
    const O = v.P([0, 0, 0]);
    ctx.fillStyle = C.ink3; ctx.font = `italic 11px ${F.serif}`; ctx.textAlign = "right"; ctx.textBaseline = "top"; ctx.fillText("O", O[0] - 4, O[1] + 2);
    ctx.restore();
  }
  /* 3차원 선분·화살표 */
  const line3 = (ctx, v, a, b, col, lw, dash) => { const A = v.P(a), B = v.P(b); line(ctx, A[0], A[1], B[0], B[1], col, lw, dash); };
  const arrow3 = (ctx, v, a, b, col, lw, head, dash) => { const A = v.P(a), B = v.P(b); arrow(ctx, A[0], A[1], B[0], B[1], col, lw, head, dash); };
  /* 끌어서 돌리기 */
  function orbit(canvas, v, redraw) {
    let last = null;
    canvas.addEventListener("pointerdown", (e) => { last = [e.clientX, e.clientY]; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing"; e.preventDefault(); });
    canvas.addEventListener("pointermove", (e) => {
      if (!last) return;
      v.yaw += (e.clientX - last[0]) * 0.01; v.pitch = clamp(v.pitch + (e.clientY - last[1]) * 0.008, -0.15, 1.45);
      last = [e.clientX, e.clientY]; redraw();
    });
    const up = () => { last = null; canvas.style.cursor = ""; };
    canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
  }

  /* 벡터 계산 */
  const add = (a, b) => a.map((x, i) => x + b[i]), sub = (a, b) => a.map((x, i) => x - b[i]);
  const mul = (k, a) => a.map((x) => k * x), dotp = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
  const norm = (a) => Math.sqrt(dotp(a, a));
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const deg = (r) => r * 180 / Math.PI;
  const angle = (a, b) => { const d = norm(a) * norm(b); return d ? Math.acos(clamp(dotp(a, b) / d, -1, 1)) : NaN; };

  return { n, tup, surd, len, lin, shift, line, arrow, dot, text, vlabel, plane, grid, drag, view3, axes3, line3, arrow3, orbit, add, sub, mul, dotp, norm, cross, deg, angle };
})();
