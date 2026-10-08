/* 카드: y를 x의 식으로 풀지 않고 접선의 기울기를 구할 수 있을까? — 음함수의 미분 y′ = −Fx/Fy, 가지와 세로 접선 */
(() => {
  const root = document.getElementById("card-calc2-implicit-slope");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const st = $(".st");
  const cos = Math.cos, sin = Math.sin, RAD = Math.PI / 180;
  /* pt(θ): 곡선 위의 점, Fx·Fy: 관계식을 x, y로 미분한 값 (y′ = −Fx/Fy) */
  const P = {
    circle: { pt: (t) => [5 * cos(t), 5 * sin(t)], Fx: (x) => 2 * x, Fy: (x, y) => 2 * y, yr: 6.2,
      d: "2<i>x</i> + 2<i>y</i>·<i>y</i>′ = 0", f: "−<i>x</i>/<i>y</i>", t0: 53 },
    ellipse: { pt: (t) => [3 * cos(t), 2 * sin(t)], Fx: (x) => 2 * x / 9, Fy: (x, y) => y / 2, yr: 2.6,
      d: "2<i>x</i>/9 + (<i>y</i>/2)·<i>y</i>′ = 0", f: "−4<i>x</i>/(9<i>y</i>)", t0: 40 },
    tilt: { pt: (t) => { const r = Math.sqrt(3 / (1 + sin(2 * t) / 2)); return [r * cos(t), r * sin(t)]; },
      Fx: (x, y) => 2 * x + y, Fy: (x, y) => x + 2 * y, yr: 2.8,
      d: "2<i>x</i> + <i>y</i> + <i>x</i><i>y</i>′ + 2<i>y</i><i>y</i>′ = 0", f: "−(2<i>x</i> + <i>y</i>)/(<i>x</i> + 2<i>y</i>)", t0: 60 },
  };
  let key = "circle";
  const { ctx, size } = fit($("canvas"), () => draw());
  const slope = (p, x, y) => -p.Fx(x, y) / p.Fy(x, y);
  const vert = (p, x, y) => Math.abs(p.Fy(x, y)) < 1e-9 * (1 + Math.abs(p.Fx(x, y)));

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[key], th = +st.value * RAD, [x0, y0] = p.pt(th);
    const half = p.yr * (w - 44) / (h - 32);
    const g = K.frame(ctx, w, h, { xr: [-half, half], yr: [-p.yr, p.yr], xs: 1, ys: 1 });
    ctx.save(); ctx.beginPath(); ctx.rect(g.x0, g.y0, g.w, g.h); ctx.clip();
    /* 점 P와 Fy의 부호가 같은 부분 = P 근처에서 y가 x의 함수인 가지 */
    const s0 = Math.sign(p.Fy(x0, y0)), N = 720;
    let prev = p.pt(0);
    for (let i = 1; i <= N; i++) {
      const q = p.pt(2 * Math.PI * i / N), mx = (q[0] + prev[0]) / 2, my = (q[1] + prev[1]) / 2;
      const same = s0 !== 0 && Math.sign(p.Fy(mx, my)) === s0;
      ctx.strokeStyle = same ? C.forest : C.ink3; ctx.lineWidth = same ? 2.8 : 1.6;
      ctx.beginPath(); ctx.moveTo(g.X(prev[0]), g.Y(prev[1])); ctx.lineTo(g.X(q[0]), g.Y(q[1])); ctx.stroke();
      prev = q;
    }
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.setLineDash([6, 4]); ctx.beginPath();
    if (vert(p, x0, y0)) { ctx.moveTo(g.X(x0), g.y0); ctx.lineTo(g.X(x0), g.y0 + g.h); }
    else { const m = slope(p, x0, y0); ctx.moveTo(g.X(-half), g.Y(y0 + m * (-half - x0))); ctx.lineTo(g.X(half), g.Y(y0 + m * (half - x0))); }
    ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    K.dot(ctx, g, x0, y0, C.ink, false, 4.5);
    const r = Math.hypot(g.X(x0) - g.X(0), g.Y(y0) - g.Y(0)) || 1;
    K.tag(ctx, g, "P", g.X(x0) + (g.X(x0) - g.X(0)) / r * 16, g.Y(y0) + (g.Y(y0) - g.Y(0)) / r * 16, C.ink, "center");
  }

  function update() {
    const p = P[key], th = +st.value * RAD, [x, y] = p.pt(th);
    $(".t-out").textContent = n(+st.value, 1);
    $(".n-p").textContent = `(${n(x, 2)}, ${n(y, 2)})`;
    const d = 1e-5, [x2, y2] = p.pt(th + d), [x1, y1] = p.pt(th - d), dx = x2 - x1;
    const m = $(".n-m");
    if (vert(p, x, y)) {
      m.textContent = "세로 접선"; m.className = "n-m bad";
      $(".n-l").textContent = `x = ${n(x, 3)}`;
      $(".eq").innerHTML = `${p.d}에서 <i>y</i>′ = ${p.f}의 분모가 0입니다. 접선은 세로선 <i>x</i> = ${n(x, 3)}이고 기울기가 없습니다.`;
    } else {
      const s = slope(p, x, y), b = y - s * x;
      m.textContent = n(s, 4); m.className = "n-m good";
      $(".n-l").textContent = `y = ${n(s, 3)}x ${b < 0 ? "−" : "+"} ${n(Math.abs(b), 3)}`;
      $(".eq").innerHTML = `양변을 <i>x</i>로 미분: ${p.d} → <i>y</i>′ = ${p.f} = ${n(s, 4)}`;
    }
    $(".n-d").textContent = Math.abs(dx) < 1e-12 ? "—" : n((y2 - y1) / dx, 4);
    draw();
  }

  K.chips(root, ".presets .chip", (b) => { key = b.dataset.k; st.value = P[key].t0; update(); });
  st.addEventListener("input", update);
  update();
})();
