/* 공통수학1 방정식 카드 공용 도구 window.NMEqPlot
   좌표 틀(축·눈금·원점선), 같은 축척 맞춤, 캔버스 끌기, 복소수 표기, 이차방정식의 근. */
window.NMEqPlot = (() => {
  const { C, F, axes } = NM;
  const EPS = 1e-9;
  const M = "−";
  const r3 = (v) => Math.round(v * 1000) / 1000;
  const n = (v) => (r3(v) < 0 ? M : "") + String(Math.abs(r3(v)));
  const lab = (v) => n(v);

  function step(span, px) {
    const raw = span / Math.max(2, px / 46);
    return [0.25, 0.5, 1, 2, 5, 10, 20, 50, 100].find((s) => s >= raw) || 100;
  }
  const ticks = (a, b, s) => { const t = []; for (let v = Math.ceil(a / s - EPS) * s; v <= b + EPS; v += s) t.push(r3(v)); return t; };

  /* 상자 box={x,y,w,h} 안에 범위 r={X0,X1,Y0,Y1}을 그린다.
     o.eq: 가로세로 같은 축척(상자를 채우도록 범위를 넓힌다). o.xs, o.ys: 눈금 간격. */
  function frame(ctx, box, r, o = {}) {
    let { X0, X1, Y0, Y1 } = r;
    const { x, y, w, h } = box;
    if (o.eq) {
      const s = Math.min(w / (X1 - X0), h / (Y1 - Y0)), cx = (X0 + X1) / 2, cy = (Y0 + Y1) / 2;
      X0 = cx - w / s / 2; X1 = cx + w / s / 2; Y0 = cy - h / s / 2; Y1 = cy + h / s / 2;
    }
    const X = (v) => x + (v - X0) / (X1 - X0) * w, Y = (v) => y + (Y1 - v) / (Y1 - Y0) * h;
    const xs = o.xs || step(X1 - X0, w), ys = o.ys || step(Y1 - Y0, h);
    axes(ctx, { x0: x, y0: y, w, h, X, Y, xt: ticks(X0, X1, xs).map((v) => [v, lab(v)]), yt: ticks(Y0, Y1, ys).map((v) => [v, lab(v)]) });
    ctx.save(); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath();
    if (Y0 <= 0 && Y1 >= 0) { ctx.moveTo(x, Y(0)); ctx.lineTo(x + w, Y(0)); }
    if (X0 <= 0 && X1 >= 0) { ctx.moveTo(X(0), y); ctx.lineTo(X(0), y + h); }
    ctx.stroke();
    ctx.font = `italic 11px ${F.serif}`; ctx.fillStyle = C.ink2; ctx.textBaseline = "alphabetic";
    if (o.xname && Y0 <= 0 && Y1 >= 0) { ctx.textAlign = "right"; ctx.fillText(o.xname, x + w - 3, Y(0) - 5); }
    if (o.yname && X0 <= 0 && X1 >= 0) { ctx.textAlign = "left"; ctx.fillText(o.yname, X(0) + 5, y + 10); }
    ctx.restore();
    return { X, Y, X0, X1, Y0, Y1, box, inv: (px, py) => [X0 + (px - x) / w * (X1 - X0), Y1 - (py - y) / h * (Y1 - Y0)] };
  }

  /* 상자 안으로 잘라서 함수 그래프 그리기 */
  function curve(ctx, fr, f, color, width = 2.2, dash, from, to) {
    const { box, X, Y } = fr, a = from ?? fr.X0, b = to ?? fr.X1;
    ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
    ctx.strokeStyle = color; ctx.lineWidth = width; if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    const N = 240;
    for (let i = 0; i <= N; i++) { const t = a + (b - a) * i / N, py = Math.max(-1e4, Math.min(1e4, Y(f(t)))); i ? ctx.lineTo(X(t), py) : ctx.moveTo(X(t), py); }
    ctx.stroke(); ctx.restore();
  }

  const dot = (ctx, px, py, color, r = 5, ring) => {
    ctx.beginPath(); ctx.arc(px, py, r, 0, 7);
    if (ring) { ctx.lineWidth = 2; ctx.strokeStyle = color; ctx.fillStyle = C.card; ctx.fill(); ctx.stroke(); }
    else { ctx.fillStyle = color; ctx.fill(); }
  };

  /* 배경을 깐 글자. 상자 box 안으로 밀어 넣는다 */
  function tag(ctx, text, px, py, color, align = "left", box) {
    ctx.save(); ctx.font = `600 11.5px ${F.sans}`; ctx.textBaseline = "middle";
    const tw = ctx.measureText(text).width;
    let left = align === "left" ? px : align === "right" ? px - tw : px - tw / 2;
    if (box) { left = Math.max(box.x + 2, Math.min(box.x + box.w - tw - 2, left)); py = Math.max(box.y + 9, Math.min(box.y + box.h - 9, py)); }
    ctx.fillStyle = C.card; ctx.globalAlpha = 0.88; ctx.fillRect(left - 3, py - 8, tw + 6, 16); ctx.globalAlpha = 1;
    ctx.fillStyle = color; ctx.textAlign = "left"; ctx.fillText(text, left, py);
    ctx.restore();
  }

  /* 캔버스 끌기. pick(px,py) → 잡은 대상(없으면 null), move(대상, px, py) */
  function drag(canvas, pick, move) {
    canvas.style.touchAction = "none";
    let on = null;
    const pos = (e) => { const b = canvas.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    canvas.addEventListener("pointerdown", (e) => {
      const p = pos(e); on = pick(p[0], p[1]);
      if (on == null) return;
      canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing"; move(on, p[0], p[1]); e.preventDefault();
    });
    canvas.addEventListener("pointermove", (e) => {
      const p = pos(e);
      if (on != null) move(on, p[0], p[1]);
      else canvas.style.cursor = pick(p[0], p[1]) != null ? "grab" : "";
    });
    const up = () => { on = null; canvas.style.cursor = ""; };
    canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
  }

  /* 복소수 a + bi 표기. html이면 i를 기울인다 */
  function cx(re, im, html) {
    const i = html ? "<i>i</i>" : "i", a = r3(re), b = r3(im);
    const bi = (v) => (Math.abs(v) === 1 ? "" : String(Math.abs(v))) + i;
    if (b === 0) return n(a);
    if (a === 0) return (b < 0 ? M : "") + bi(b);
    return `${n(a)} ${b < 0 ? M : "+"} ${bi(b)}`;
  }

  /* ax² + bx + c = 0의 근: {D, kind(2·0·−1), xs:[실근] 또는 p, q (허근 p ± qi)} */
  function roots(a, b, c) {
    const D = b * b - 4 * a * c;
    if (Math.abs(D) < EPS) return { D: 0, kind: 0, xs: [-b / (2 * a)] };
    if (D > 0) { const s = Math.sqrt(D); return { D, kind: 2, xs: [(-b - s) / (2 * a), (-b + s) / (2 * a)].sort((u, v) => u - v) }; }
    return { D, kind: -1, p: -b / (2 * a), q: Math.sqrt(-D) / (2 * Math.abs(a)) };
  }

  return { EPS, n, r3, frame, curve, dot, tag, drag, cx, roots, step, ticks };
})();
