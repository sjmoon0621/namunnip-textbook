/* 기하 공용: 좌표공간을 평행 투영으로 그리는 도구 (window.NMSpace3)
   좌표는 수학 관례(z축이 위)를 따른다. 그림을 끌면 z축 둘레로 돌고, 마우스로는 위아래 기울기도 바뀐다. */
window.NMSpace3 = (() => {
  "use strict";
  const { C, F, fit, clamp } = NM;
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const len = (a) => Math.hypot(a[0], a[1], a[2]);
  const unit = (a) => mul(a, 1 / len(a));
  const lerp = (a, b, t) => add(a, mul(sub(b, a), t));
  const deg = (r) => r * 180 / Math.PI, rad = (d) => d * Math.PI / 180;
  /* 두 직선이 이루는 각(0°~90°) */
  const lineAngle = (u, v) => deg(Math.acos(clamp(Math.abs(dot(u, v)) / (len(u) * len(v)), 0, 1)));
  /* 두 벡터 사이 각(0°~180°) */
  const vecAngle = (u, v) => deg(Math.acos(clamp(dot(u, v) / (len(u) * len(v)), -1, 1)));
  /* 화면 표시용 수: 소수 둘째 자리까지, 음수는 −로 */
  const n = (x, d = 2) => { const v = Math.round(x * 10 ** d) / 10 ** d; return (Object.is(v, -0) ? 0 : v).toString().replace("-", "−"); };

  function view(canvas, draw, o = {}) {
    const st = { yaw: o.yaw ?? -2.08, pitch: o.pitch ?? 0.42, span: o.span ?? 8, center: o.center || [0, 0, 0], cy: o.cy ?? 0.5 };
    const { ctx, size } = fit(canvas, () => draw());
    const P = (v) => {
      const s = Math.min(size.w, size.h) / st.span, c = st.center;
      const x = v[0] - c[0], y = v[1] - c[1], z = v[2] - c[2];
      const cy = Math.cos(st.yaw), sy = Math.sin(st.yaw), cp = Math.cos(st.pitch), sp = Math.sin(st.pitch);
      const x1 = x * cy - y * sy, y1 = x * sy + y * cy;
      return { x: size.w / 2 + s * x1, y: size.h * st.cy - s * (z * cp + y1 * sp), d: y1 * cp - z * sp };
    };
    /* 보는 사람 쪽을 가리키는 단위 벡터 */
    const eye = () => [-Math.sin(st.yaw) * Math.cos(st.pitch), -Math.cos(st.yaw) * Math.cos(st.pitch), Math.sin(st.pitch)];
    const scale = () => Math.min(size.w, size.h) / st.span;

    function line(a, b, col = C.ink, w = 1.5, dash) {
      const p = P(a), q = P(b);
      ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; if (dash) ctx.setLineDash(dash);
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); ctx.restore();
    }
    function poly(pts, fill, stroke, alpha = 0.18, w = 1) {
      ctx.save(); ctx.beginPath();
      pts.forEach((v, i) => { const p = P(v); i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); });
      ctx.closePath();
      if (fill) { ctx.globalAlpha = alpha; ctx.fillStyle = fill; ctx.fill(); ctx.globalAlpha = 1; }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = w; ctx.stroke(); }
      ctx.restore();
    }
    /* 중심 c, 서로 수직인 단위 방향 u, v로 펼친 평행사변형(평면 조각) */
    const quad = (c, u, v, a, b) => [add(add(c, mul(u, -a)), mul(v, -b)), add(add(c, mul(u, a)), mul(v, -b)), add(add(c, mul(u, a)), mul(v, b)), add(add(c, mul(u, -a)), mul(v, b))];
    const circle = (c, u, v, r, k = 72) => Array.from({ length: k }, (_, i) => { const t = 2 * Math.PI * i / k; return add(c, add(mul(u, r * Math.cos(t)), mul(v, r * Math.sin(t)))); });
    function path(pts, col, w = 1.5, dash, closed = true) {
      ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; if (dash) ctx.setLineDash(dash);
      ctx.beginPath(); pts.forEach((v, i) => { const p = P(v); i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); });
      if (closed) ctx.closePath(); ctx.stroke(); ctx.restore();
    }
    function dot3(v, col = C.ink, r = 4) { const p = P(v); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill(); }
    function label(v, txt, col = C.ink, dx = 6, dy = -6, align = "left", font) {
      const p = P(v);
      ctx.save(); ctx.font = font || `600 12px ${F.sans}`; ctx.textAlign = align; ctx.textBaseline = "middle";
      ctx.lineWidth = 3.5; ctx.strokeStyle = C.card; ctx.lineJoin = "round";
      ctx.strokeText(txt, p.x + dx, p.y + dy); ctx.fillStyle = col; ctx.fillText(txt, p.x + dx, p.y + dy); ctx.restore();
    }
    /* 꼭짓점 o에서 단위 방향 u, v 사이의 직각 표시 */
    function right(o, u, v, k = 0.28, col = C.ink2) {
      path([add(o, mul(u, k)), add(add(o, mul(u, k)), mul(v, k)), add(o, mul(v, k))], col, 1.2, null, false);
    }
    /* 좌표축: 음의 방향은 짧은 점선 */
    function axes3(L = 3.5, neg = 1.2, col = C.ink3) {
      [[1, 0, 0, "x"], [0, 1, 0, "y"], [0, 0, 1, "z"]].forEach(([a, b, c, nm]) => {
        const u = [a, b, c];
        line(mul(u, -neg), [0, 0, 0], col, 1, [3, 3]); line([0, 0, 0], mul(u, L), col, 1.2);
        const p = P(mul(u, L)), q = P(mul(u, L - 0.25));
        const t = Math.atan2(p.y - q.y, p.x - q.x);
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 8 * Math.cos(t - 0.35), p.y - 8 * Math.sin(t - 0.35)); ctx.lineTo(p.x - 8 * Math.cos(t + 0.35), p.y - 8 * Math.sin(t + 0.35)); ctx.fill();
        label(mul(u, L + 0.3), nm, C.ink2, 0, 0, "center", `italic 600 13px ${F.serif}`);
      });
      label([0, 0, 0], "O", C.ink2, -8, 9, "right", `italic 600 12px ${F.serif}`);
    }

    let drag = null;
    canvas.style.touchAction = "pan-y"; canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", (e) => {
      drag = { x: e.clientX, y: e.clientY, yaw: st.yaw, pitch: st.pitch, mouse: e.pointerType === "mouse" };
      canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing";
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!drag) return;
      st.yaw = drag.yaw + (e.clientX - drag.x) * 0.01;
      if (drag.mouse) st.pitch = clamp(drag.pitch + (e.clientY - drag.y) * 0.008, -0.15, 1.45);
      draw();
    });
    const end = () => { drag = null; canvas.style.cursor = "grab"; };
    canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);

    return { ctx, size, st, P, eye, scale, line, poly, quad, circle, path, dot: dot3, label, right, axes: axes3 };
  }

  return { add, sub, mul, dot, cross, len, unit, lerp, deg, rad, lineAngle, vecAngle, n, view };
})();
