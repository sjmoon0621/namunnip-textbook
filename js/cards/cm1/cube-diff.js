/* 카드: a³ − b³은 왜 (a − b)(a² + ab + b²)일까? — 정육면체를 직육면체 조각으로 나눈 부피 모형 */
(() => {
  const root = document.getElementById("card-cm1-cube-diff");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s), modeBtns = [...root.querySelectorAll(".mode .chip")];
  const sa = $(".a"), sb = $(".b"), se = $(".e");
  let mode = "diff";
  const fmt = (v) => String(Math.round(v * 1000) / 1000);
  const { ctx, size } = fit($("canvas"), () => draw());

  function boxes() {
    const a = +sa.value, b = +sb.value;
    if (mode === "diff") {
      const s = a - b;
      return { L: a, list: [
        { lo: [0, 0, 0], hi: [s, a, a], col: C.leaf, name: "(a−b)a²" },
        { lo: [s, 0, 0], hi: [a, s, a], col: C.amber, name: "(a−b)ab" },
        { lo: [s, s, 0], hi: [a, a, s], col: C.apple, name: "(a−b)b²" },
        { lo: [s, s, s], hi: [a, a, a], ghost: true, name: "b³" },
      ] };
    }
    const I = [[0, a], [a, a + b]], col = [C.leaf, C.amber, C.apple, C.ink3], nm = ["a³", "a²b", "ab²", "b³"], list = [];
    for (const i of [0, 1]) for (const j of [0, 1]) for (const k of [0, 1]) {
      const nb = i + j + k;
      list.push({ lo: [I[i][0], I[j][0], I[k][0]], hi: [I[i][1], I[j][1], I[k][1]], col: col[nb], name: nm[nb] });
    }
    return { L: a + b, list };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { L, list } = boxes(), e = +se.value / 100, Lx = L * (1 + 0.7 * e);
    const k = Math.min(w / (1.732 * Lx), h / (2 * Lx)) * 0.9, c = L / 2;
    list.forEach((b) => { b.off = [0, 1, 2].map((i) => e * 0.6 * ((b.lo[i] + b.hi[i]) / 2 - c)); b.lo2 = b.lo.map((v, i) => v + b.off[i]); b.hi2 = b.hi.map((v, i) => v + b.off[i]); });
    const proj = (x, y, z) => [w / 2 + (x - y) * k * 0.866, h / 2 + ((x + y) / 2 - z) * k];
    const poly = (pts, fill, alpha) => {
      ctx.beginPath(); pts.forEach(([x, y, z], i) => { const [px, py] = proj(x, y, z); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.closePath();
      ctx.fillStyle = C.card; ctx.fill(); ctx.globalAlpha = alpha; ctx.fillStyle = fill; ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke();
    };
    const solid = list.filter((b) => !b.ghost), order = [], rest = solid.slice();
    const before = (A, B) => [0, 1, 2].some((i) => A.hi2[i] <= B.lo2[i] + 1e-9);
    while (rest.length) {
      let i = rest.findIndex((b) => !rest.some((o) => o !== b && before(o, b) && !before(b, o)));
      if (i < 0) i = 0;
      order.push(rest.splice(i, 1)[0]);
    }
    order.forEach((b) => {
      const [x0, y0, z0] = b.lo2, [x1, y1, z1] = b.hi2;
      poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], b.col, 0.6);
      poly([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], b.col, 0.42);
      poly([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], b.col, 0.26);
    });
    const g = list.find((b) => b.ghost);
    if (g) {
      const [x0, y0, z0] = g.lo2, [x1, y1, z1] = g.hi2, V = [];
      for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) V.push([x, y, z]);
      ctx.setLineDash([4, 3]); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.beginPath();
      V.forEach((p, i) => V.forEach((q, j) => { if (j > i && p.filter((v, t) => v !== q[t]).length === 1) { const A = proj(...p), B = proj(...q); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); } }));
      ctx.stroke(); ctx.setLineDash([]);
    }
    if (e >= 0.3) {
      ctx.font = `600 ${w < 380 ? 11 : 12}px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      list.forEach((b) => {
        const [px, py] = proj((b.lo2[0] + b.hi2[0]) / 2, (b.lo2[1] + b.hi2[1]) / 2, b.hi2[2]);
        const tw = ctx.measureText(b.name).width;
        ctx.fillStyle = C.card; ctx.globalAlpha = 0.85; ctx.fillRect(px - tw / 2 - 3, py - 8, tw + 6, 16); ctx.globalAlpha = 1;
        ctx.fillStyle = b.ghost ? C.ink2 : C.ink; ctx.fillText(b.name, px, py);
      });
    }
  }

  function update() {
    if (mode === "diff" && +sb.value >= +sa.value) sb.value = +sa.value - 0.5;
    const a = +sa.value, b = +sb.value;
    $(".a-out").textContent = fmt(a); $(".b-out").textContent = fmt(b); $(".e-out").textContent = se.value;
    const dl = $(".nums");
    let items, sum;
    if (mode === "diff") {
      items = [["(a−b)·a²", (a - b) * a * a], ["(a−b)·ab", (a - b) * a * b], ["(a−b)·b²", (a - b) * b * b]];
      const t = items.reduce((s, [, v]) => s + v, 0);
      sum = `세 판의 합 = ${fmt(t)} · a³ − b³ = ${fmt(a ** 3)} − ${fmt(b ** 3)} = ${fmt(a ** 3 - b ** 3)}`;
    } else {
      items = [["a³", a ** 3], ["3a²b", 3 * a * a * b], ["3ab²", 3 * a * b * b], ["b³", b ** 3]];
      const t = items.reduce((s, [, v]) => s + v, 0);
      sum = `여덟 조각의 합 = ${fmt(t)} · (a+b)³ = ${fmt(a + b)}³ = ${fmt((a + b) ** 3)}`;
    }
    dl.className = `nums${items.length === 4 ? " n4" : ""}`;
    dl.innerHTML = items.map(([n, v]) => `<div><dt>${n}</dt><dd>${fmt(v)}</dd></div>`).join("");
    $(".sum").textContent = sum;
    draw();
  }
  modeBtns.forEach((btn) => btn.addEventListener("click", () => { mode = btn.dataset.mode; modeBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === btn))); update(); }));
  [sa, sb, se].forEach((s) => s.addEventListener("input", update));
  update();
})();
