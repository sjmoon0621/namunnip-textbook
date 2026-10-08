/* 카드: 얇게 썬 조각을 모으면 부피를 구할 수 있을까? — 단면 넓이 S(x)와 조각 부피 합 ∑S(xₖ)Δx → ∫S(x)dx */
(() => {
  const root = document.getElementById("card-calc2-cross-section");
  if (!root) return;
  const { C } = NM;
  const K = NMCalc, I = NMInteg, n = K.n;
  const $ = (s) => root.querySelector(s), sn = $(".sn"), sx = $(".sx");
  const PI = Math.PI, R3 = Math.sqrt(3);
  const P = [
    { a: 0, b: 4, shape: "sq", s: Math.sqrt, S: (x) => x, V: 8, half: 1, sr: [-0.3, 4.6], ss: 1, lab: "S(x) = x" },
    { a: 0, b: 4, shape: "circ", s: Math.sqrt, S: (x) => PI * x, V: 8 * PI, half: 2, sr: [-1, 14], ss: 4, lab: "S(x) = πx" },
    { a: 0, b: PI, shape: "tri", s: Math.sin, S: (x) => R3 / 4 * Math.sin(x) ** 2, V: R3 * PI / 8, half: 0.6, sr: [-0.04, 0.5], ss: 0.1, lab: "S(x) = (√3/4) sin²x" },
  ];
  let k = 0;
  const { ctx, size } = NM.fit($("canvas"), () => draw());

  function outline(p, s) {
    if (p.shape === "sq") return [[-s / 2, -s / 2], [s / 2, -s / 2], [s / 2, s / 2], [-s / 2, s / 2]];
    if (p.shape === "tri") { const hh = s * R3 / 2; return [[-s / 2, -hh / 3], [s / 2, -hh / 3], [0, 2 * hh / 3]]; }
    const pts = []; for (let i = 0; i < 36; i++) { const t = i / 36 * 2 * PI; pts.push([s * Math.cos(t), s * Math.sin(t)]); } return pts;
  }

  function face(X, ym, sc, x, p, fill, alpha, stroke) {
    const pts = outline(p, p.s(x));
    ctx.beginPath();
    pts.forEach(([z, y], i) => { const px = X(x) + 0.45 * sc * z, py = ym - sc * y - 0.25 * sc * z; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
    ctx.closePath();
    ctx.globalAlpha = alpha; ctx.fillStyle = fill; ctx.fill();
    ctx.globalAlpha = 1; ctx.strokeStyle = stroke; ctx.stroke();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[k], m = +sn.value, cut = +sx.value, half = Math.round(h * 0.52), dx = (p.b - p.a) / m;
    const L = 34, Rm = 16 + (p.half * 0.45 * ((half - 30) / 2 / p.half));
    const X = (x) => L + (x - p.a) / (p.b - p.a) * (w - L - Rm);
    const ym = half / 2 + 4, sc = (half / 2 - 14) / (p.half * 1.25);
    ctx.save(); ctx.lineWidth = 1;
    ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(L - 10, ym); ctx.lineTo(w - 8, ym); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < m; i++) {
      const x = p.a + (i + 0.5) * dx;
      face(X, ym, sc, x, p, i % 2 ? K.BLUE : C.forest, 0.16, i % 2 ? K.BLUE : C.forest);
    }
    ctx.lineWidth = 2; face(X, ym, sc, cut, p, C.warn, 0.45, C.warn);
    ctx.restore();
    ctx.save(); ctx.font = `600 11px ${NM.F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("x", w - 8, ym - 6); ctx.restore();
    const g = K.frame(ctx, w, h, { xr: [p.a - 0.05, p.b + 0.05], yr: p.sr, xs: p.b > 3.5 ? 1 : 0.5, ys: p.ss, T: half + 12, B: 22, L: 38 });
    for (let i = 0; i < m; i++) { const x1 = p.a + i * dx; I.bar(ctx, g, x1, x1 + dx, p.S(x1 + dx / 2), i % 2 ? K.BLUE : C.forest, 0, 0.22); }
    K.curve(ctx, g, p.S, C.forest, { from: p.a, to: p.b });
    K.dot(ctx, g, cut, p.S(cut), C.warn);
    K.tag(ctx, g, p.lab, g.x0 + 4, g.y0 + 10, C.forest);
  }

  function update() {
    const p = P[k], m = +sn.value, cut = +sx.value, dx = (p.b - p.a) / m;
    let s = 0; for (let i = 0; i < m; i++) s += p.S(p.a + (i + 0.5) * dx) * dx;
    $(".n-out").textContent = m; $(".x-out").textContent = n(cut, 2);
    $(".n-a").textContent = n(p.S(cut), 4); $(".n-s").textContent = n(s, 4); $(".n-v").textContent = n(p.V, 4);
    draw();
  }

  K.chips(root, ".fn .chip", (bt) => { k = +bt.dataset.k; const p = P[k]; sx.min = p.a; sx.max = p.b; sx.value = (p.a + p.b) / 2; update(); });
  sn.addEventListener("input", update); sx.addEventListener("input", update);
  update();
})();
