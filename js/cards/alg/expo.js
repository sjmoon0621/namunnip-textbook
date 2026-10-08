/* 대수 지수·로그 카드 공용 도구 window.NMExp — 좌표 틀, 곡선, 점, 글상자, 끌기, 수 표기
   좌표는 수학 좌표(x, y)로 넘기고, 틀(frame)이 돌려주는 X·Y로 화면 좌표로 바꾼다. */
window.NMExp = (() => {
  const { C, F, clamp } = NM;
  const BLUE = "#3f6fa3";
  /* 수 표기: 소수 d자리까지 반올림, 끝의 0은 지우고 음수 기호는 − */
  function n(v, d = 3) {
    if (!isFinite(v)) return "—";
    let s = (Math.round(v * 10 ** d) / 10 ** d).toFixed(d);
    if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
    if (s === "-0") s = "0";
    return s.replace("-", "−");
  }
  /* 정수에 가까우면 그대로, 아니면 ≈를 붙인다 */
  const approx = (v, d = 3) => (Math.abs(v - Math.round(v)) < 1e-9 ? n(v) : `≈ ${n(v, d)}`);
  const SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", "-": "⁻", "−": "⁻", x: "ˣ", n: "ⁿ" };
  const sup = (s) => String(s).split("").map((c) => SUP[c] ?? c).join("");

  /* 그래프 틀: o = {X0, X1, Y0, Y1, xt, yt, l, r, t, b}. xt·yt 항목은 수 또는 [수, 글자] */
  function frame(ctx, w, h, o) {
    const x0 = o.l ?? 34, y0 = o.t ?? 10, gw = w - x0 - (o.r ?? 10), gh = h - y0 - (o.b ?? 22);
    const X = (x) => x0 + (x - o.X0) / (o.X1 - o.X0) * gw, Y = (y) => y0 + (o.Y1 - y) / (o.Y1 - o.Y0) * gh;
    const IX = (px) => o.X0 + (px - x0) / gw * (o.X1 - o.X0), IY = (py) => o.Y1 - (py - y0) / gh * (o.Y1 - o.Y0);
    const tk = (a) => (a || []).map((v) => (Array.isArray(v) ? v : [v, n(v)]));
    NM.axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: tk(o.xt), yt: tk(o.yt) });
    ctx.save(); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.beginPath();
    if (o.Y0 <= 0 && o.Y1 >= 0) { ctx.moveTo(x0, Y(0)); ctx.lineTo(x0 + gw, Y(0)); }
    if (o.X0 <= 0 && o.X1 >= 0) { ctx.moveTo(X(0), y0); ctx.lineTo(X(0), y0 + gh); }
    ctx.stroke(); ctx.restore();
    return { x0, y0, gw, gh, X, Y, IX, IY, o };
  }
  /* 점 목록을 이어 그린다. 값이 없는 점에서는 선을 끊는다 */
  function path(ctx, g, pts, col, o = {}) {
    ctx.save(); ctx.beginPath(); ctx.rect(g.x0, g.y0, g.gw, g.gh); ctx.clip();
    ctx.strokeStyle = col; ctx.lineWidth = o.lw || 2.2; if (o.dash) ctx.setLineDash(o.dash);
    ctx.beginPath(); let pen = false;
    for (const [x, y] of pts) {
      if (!isFinite(x) || !isFinite(y)) { pen = false; continue; }
      const px = g.X(x), py = clamp(g.Y(y), g.y0 - 1e4, g.y0 + g.gh + 1e4);
      if (pen) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      pen = true;
    }
    ctx.stroke(); ctx.restore();
  }
  const curve = (ctx, g, f, col, o = {}) => {
    const a = o.from ?? g.o.X0, b = o.to ?? g.o.X1, N = 600;
    path(ctx, g, Array.from({ length: N + 1 }, (_, i) => { const x = a + (b - a) * i / N; return [x, f(x)]; }), col, o);
  };
  /* 매개변수 곡선 (x(t), y(t)) — 로그 곡선은 (aᵗ, t)로 그리면 0 근처까지 매끄럽다 */
  const param = (ctx, g, fx, fy, t0, t1, col, o = {}) => {
    const N = 600;
    path(ctx, g, Array.from({ length: N + 1 }, (_, i) => { const t = t0 + (t1 - t0) * i / N; return [fx(t), fy(t)]; }), col, o);
  };
  function inside(g, px, py) { return px >= g.x0 - 1 && px <= g.x0 + g.gw + 1 && py >= g.y0 - 1 && py <= g.y0 + g.gh + 1; }
  function dot(ctx, g, x, y, col, r = 4.5, hollow = false) {
    if (!isFinite(x) || !isFinite(y)) return;
    const px = g.X(x), py = g.Y(y);
    if (!inside(g, px, py)) return;
    ctx.beginPath(); ctx.arc(px, py, r, 0, 7);
    if (hollow) { ctx.fillStyle = C.card; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke(); }
    else { ctx.fillStyle = col; ctx.fill(); }
  }
  function hline(ctx, g, y, col, dash = [4, 4], lw = 1.4) {
    const py = g.Y(y); if (py < g.y0 - 1 || py > g.y0 + g.gh + 1) return;
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(g.x0, py); ctx.lineTo(g.x0 + g.gw, py); ctx.stroke(); ctx.restore();
  }
  function vline(ctx, g, x, col, dash = [4, 4], lw = 1.4) {
    const px = g.X(x); if (px < g.x0 - 1 || px > g.x0 + g.gw + 1) return;
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(px, g.y0); ctx.lineTo(px, g.y0 + g.gh); ctx.stroke(); ctx.restore();
  }
  /* 글상자: 화면 좌표 (px, py)에 바탕을 깔고 쓴다. 틀 밖으로 나가지 않게 밀어 넣는다 */
  function tag(ctx, g, txt, px, py, col, align = "left", size = 11.5) {
    ctx.save(); ctx.font = `600 ${size}px ${F.sans}`; ctx.textBaseline = "middle";
    const tw = ctx.measureText(txt).width;
    let lx = align === "left" ? px : align === "right" ? px - tw : px - tw / 2;
    lx = clamp(lx, g.x0 + 3, g.x0 + g.gw - tw - 3);
    const ly = clamp(py, g.y0 + 9, g.y0 + g.gh - 9);
    ctx.fillStyle = C.card; ctx.globalAlpha = 0.88; ctx.fillRect(lx - 3, ly - 8, tw + 6, 16); ctx.globalAlpha = 1;
    ctx.fillStyle = col; ctx.textAlign = "left"; ctx.fillText(txt, lx, ly); ctx.restore();
  }
  /* 캔버스 끌기: cb(px, py, 단계) — 단계는 "down" 또는 "move" */
  function drag(cv, cb) {
    cv.style.touchAction = "none"; cv.style.cursor = "pointer";
    let on = false;
    const at = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.addEventListener("pointerdown", (e) => { on = true; cv.setPointerCapture(e.pointerId); cb(...at(e), "down"); });
    cv.addEventListener("pointermove", (e) => { if (on) cb(...at(e), "move"); });
    const up = () => { on = false; };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  }
  return { BLUE, n, approx, sup, frame, path, curve, param, dot, hline, vline, tag, drag };
})();
