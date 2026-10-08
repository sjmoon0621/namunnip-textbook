/* 카드: x와 y가 모두 t의 함수일 때 접선의 기울기는? — dy/dx = (dy/dt)/(dx/dt), 속도 성분과 접선 */
(() => {
  const root = document.getElementById("card-calc2-param-tangent");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const st = $(".st");
  const sin = Math.sin, cos = Math.cos, S = 0.4, D = 0.001;
  const P = {
    circle: { x: (t) => 2 * cos(t), y: (t) => 2 * sin(t), dx: (t) => -2 * sin(t), dy: (t) => 2 * cos(t), t: [0, 6.28], t0: 0.8, yr: [-2.6, 2.6], round: true,
      f: "2cos <i>t</i>/(−2sin <i>t</i>) = −cot <i>t</i>" },
    cyc: { x: (t) => t - sin(t), y: (t) => 1 - cos(t), dx: (t) => 1 - cos(t), dy: (t) => sin(t), t: [0, 6.28], t0: 1.5, xr: [-0.4, 6.7], yr: [-0.4, 2.6],
      f: "sin <i>t</i>/(1 − cos <i>t</i>)" },
    cusp: { x: (t) => t * t, y: (t) => t ** 3, dx: (t) => 2 * t, dy: (t) => 3 * t * t, t: [-1.5, 1.5], t0: 1, xr: [-0.4, 2.6], yr: [-3.6, 3.6],
      f: "3<i>t</i><sup>2</sup>/(2<i>t</i>) = 3<i>t</i>/2 (<i>t</i> ≠ 0)" },
  };
  let key = "circle";
  const { ctx, size } = fit($("canvas"), () => draw());

  function arrow(x1, y1, x2, y2, col) {
    const L = Math.hypot(x2 - x1, y2 - y1);
    if (L < 2) return;
    const ux = (x2 - x1) / L, uy = (y2 - y1) / L, k = Math.min(8, L * 0.5);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - ux * k * 0.6, y2 - uy * k * 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - ux * k - uy * k * 0.5, y2 - uy * k + ux * k * 0.5);
    ctx.lineTo(x2 - ux * k + uy * k * 0.5, y2 - uy * k - ux * k * 0.5); ctx.closePath(); ctx.fill();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[key], t = +st.value, x0 = p.x(t), y0 = p.y(t), vx = p.dx(t), vy = p.dy(t);
    const half = p.round ? 2.6 * (w - 44) / (h - 32) : 0;
    const g = K.frame(ctx, w, h, { xr: p.round ? [-half, half] : p.xr, yr: p.yr, xs: 1, ys: 1 });
    ctx.save(); ctx.beginPath(); ctx.rect(g.x0, g.y0, g.w, g.h); ctx.clip();
    const px = g.X(x0), py = g.Y(y0);
    const ex = vx * g.w / (g.xr[1] - g.xr[0]), ey = -vy * g.h / (g.yr[1] - g.yr[0]), el = Math.hypot(ex, ey);
    if (el > 1e-6) {
      const k = 2000 / el;
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(px - ex * k, py - ey * k); ctx.lineTo(px + ex * k, py + ey * k); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.4; ctx.beginPath();
    for (let i = 0; i <= 600; i++) {
      const s = p.t[0] + (p.t[1] - p.t[0]) * i / 600;
      if (i) ctx.lineTo(g.X(p.x(s)), g.Y(p.y(s))); else ctx.moveTo(g.X(p.x(s)), g.Y(p.y(s)));
    }
    ctx.stroke();
    const hx = g.X(x0 + S * vx), hy = g.Y(y0 + S * vy);
    arrow(px, py, hx, py, K.BLUE);
    arrow(hx, py, hx, hy, C.amber);
    arrow(px, py, hx, hy, C.warn);
    ctx.restore();
    K.dot(ctx, g, x0, y0, C.ink, false, 4);
    const nx = el > 1e-6 ? -ey / el : 0, ny = el > 1e-6 ? ex / el : -1;
    K.tag(ctx, g, "P", px + nx * 16, py + ny * 16, C.ink, "center");
  }

  function update() {
    const p = P[key], t = +st.value, vx = p.dx(t), vy = p.dy(t);
    $(".t-out").textContent = n(t, 2);
    $(".n-x").textContent = n(vx, 4); $(".n-y").textContent = n(vy, 4);
    const zx = Math.abs(vx) < 1e-9, zy = Math.abs(vy) < 1e-9, m = $(".n-m");
    m.textContent = zx ? (zy ? "0/0" : "세로 접선") : n(vy / vx, 4);
    m.className = `n-m ${zx ? "bad" : "good"}`;
    const ddx = p.x(t + D) - p.x(t), ddy = p.y(t + D) - p.y(t);
    $(".n-d").textContent = Math.abs(ddx) < 1e-15 ? "—" : n(ddy / ddx, 4);
    $(".eq").innerHTML = zx
      ? (zy ? "<i>dx</i>/<i>dt</i> = <i>dy</i>/<i>dt</i> = 0 → 공식이 0/0. 넷째 칸처럼 가까운 <i>t</i>에서의 값을 봅니다."
        : "<i>dx</i>/<i>dt</i> = 0, <i>dy</i>/<i>dt</i> ≠ 0 → 접선은 세로선이고 기울기가 없습니다.")
      : `<i>dy</i>/<i>dx</i> = ${p.f} = ${n(vy, 4)} ÷ ${n(vx, 4)} = ${n(vy / vx, 4)}`;
    draw();
  }

  K.chips(root, ".presets .chip", (b) => {
    key = b.dataset.k; const p = P[key];
    st.min = p.t[0]; st.max = p.t[1]; st.value = p.t0; update();
  });
  st.addEventListener("input", update);
  update();
})();
