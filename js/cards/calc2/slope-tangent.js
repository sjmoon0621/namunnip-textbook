/* 카드: 기울기가 정해진 접선은 곡선의 어디에 닿을까? — f′(t) = m을 풀어 접점 찾기 (ln x, sin x, 타원) */
(() => {
  const root = document.getElementById("card-calc2-slope-tangent");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sm = $(".sm"), TAU = 2 * Math.PI;
  const piLab = (v) => { const k = Math.round(v / (Math.PI / 2)); return ["0", "π/2", "π", "3π/2", "2π"][k] ?? n(v); };
  /* pts(m): 기울기가 m인 접점 [x, y] 목록 */
  const P = {
    ln: { cond: "1/x = m", range: "1/x > 0", xr: [0, 5], yr: [-3, 2.5],
      draw: (ctx, g) => K.curve(ctx, g, (x) => (x > 0 ? Math.log(x) : NaN), C.forest, { from: 0.005 }),
      pts: (m) => (m > 0 ? [[1 / m, -Math.log(m)]] : []) },
    sin: { cond: "cos x = m", range: "−1 ≤ cos x ≤ 1", xr: [0, TAU], yr: [-2, 2], xs: Math.PI / 2, xf: piLab,
      draw: (ctx, g) => K.curve(ctx, g, Math.sin, C.forest),
      pts: (m) => {
        if (Math.abs(m) > 1) return [];
        const a = Math.acos(m), b = TAU - a;
        return Math.abs(a - b) < 1e-12 ? [[a, Math.sin(a)]] : [[a, Math.sin(a)], [b, Math.sin(b)]];
      } },
    ell: { cond: "−x/(4y) = m", range: "모든 실수", round: true, yr: [-2.4, 2.4],
      draw: (ctx, g) => {
        ctx.save(); ctx.strokeStyle = C.forest; ctx.lineWidth = 2.4; ctx.beginPath();
        for (let i = 0; i <= 360; i++) { const t = TAU * i / 360, x = g.X(2 * Math.cos(t)), y = g.Y(Math.sin(t)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke(); ctx.restore();
      },
      pts: (m) => { const y = 1 / Math.sqrt(4 * m * m + 1); return [[-4 * m * y, y], [4 * m * y, -y]]; } },
  };
  let key = "ln";
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[key], m = +sm.value;
    const xr = p.round ? [-p.yr[1] * (w - 44) / (h - 32), p.yr[1] * (w - 44) / (h - 32)] : p.xr;
    const g = K.frame(ctx, w, h, { xr, yr: p.yr, xs: p.xs || 1, ys: 1, xf: p.xf });
    p.draw(ctx, g);
    const pts = p.pts(m);
    ctx.save(); ctx.beginPath(); ctx.rect(g.x0, g.y0, g.w, g.h); ctx.clip();
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.setLineDash([6, 4]);
    pts.forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(g.X(xr[0]), g.Y(y + m * (xr[0] - x))); ctx.lineTo(g.X(xr[1]), g.Y(y + m * (xr[1] - x))); ctx.stroke(); });
    ctx.restore();
    pts.forEach(([x, y]) => K.dot(ctx, g, x, y, C.warn, false, 4.5));
    if (!pts.length) K.tag(ctx, g, `기울기 ${n(m, 2)}인 접선 없음`, g.x0 + g.w / 2, g.y0 + 14, C.warn, "center");
  }

  function update() {
    const p = P[key], m = +sm.value, pts = p.pts(m);
    $(".m-out").textContent = n(m, 2);
    $(".n-c").textContent = p.cond.replace("m", n(m, 2));
    $(".n-k").textContent = String(pts.length);
    $(".n-r").textContent = p.range;
    $(".eq").innerHTML = pts.length
      ? pts.map(([x, y]) => { const c = y - m * x; const mx = m === 0 ? "" : `${m === 1 ? "" : m === -1 ? "−" : n(m, 2)}<i>x</i> `;
        return `접점 (${n(x, 3)}, ${n(y, 3)}) → <i>y</i> = ${mx}${mx ? (c < 0 ? "− " : "+ ") + n(Math.abs(c), 3) : n(c, 3)}`; }).join("<br>")
      : `${p.cond.replace("m", n(m, 2))}을 만족하는 접점이 없습니다.`;
    draw();
  }

  K.chips(root, ".presets .chip", (b) => { key = b.dataset.k; update(); });
  sm.addEventListener("input", update);
  update();
})();
