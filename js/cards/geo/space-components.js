/* 카드: 공간의 화살표는 수 몇 개로 정해질까? — 공간벡터 (a1, a2, a3)와 직육면체, 크기 √(a1² + a2² + a3²) */
(() => {
  const root = document.getElementById("card-geo-space-components");
  if (!root) return;
  const { C, fit } = NM;
  const V = NMGeoVec;
  const $ = (s) => root.querySelector(s), cv = $("canvas");
  const sl = [$(".s1"), $(".s2"), $(".s3")];
  const view = V.view3();
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    V.fit3(view, w, h, 3.6);
    V.axes3(ctx, view, 3.6, { grid: 3 });
    const a = sl.map((s) => +s.value), [x, y, z] = a;
    // 직육면체 모서리
    const corners = [];
    for (const i of [0, x]) for (const j of [0, y]) for (const k of [0, z]) corners.push([i, j, k]);
    for (let p = 0; p < 8; p++) for (let q = p + 1; q < 8; q++) {
      const d = corners[p].reduce((s, v, i) => s + (v !== corners[q][i] ? 1 : 0), 0);
      if (d === 1) V.line3(ctx, view, corners[p], corners[q], C.ink3, 1, [3, 3]);
    }
    // 성분을 따라가는 길: x → y → z
    V.line3(ctx, view, [0, 0, 0], [x, 0, 0], C.apple, 3);
    V.line3(ctx, view, [x, 0, 0], [x, y, 0], C.amber, 3);
    V.line3(ctx, view, [x, y, 0], [x, y, z], C.ink2, 3);
    V.line3(ctx, view, [0, 0, 0], [x, y, 0], C.leaf, 1.8, [6, 4]);
    V.arrow3(ctx, view, [0, 0, 0], a, C.forest, 3.2, 12);
    const [px, py] = view.P(a), r = px > w - 110;
    V.text(ctx, `P${V.tup(a, 0)}`, r ? px - 10 : px + 10, py - 12, C.forest, { align: r ? "right" : "left" });
    const mid = (p, q) => view.P(p.map((v, i) => (v + q[i]) / 2));
    if (x) V.text(ctx, `a₁ = ${V.n(x)}`, ...mid([0, 0, 0], [x, 0, 0]).map((v, i) => v + (i ? 12 : -16)), C.apple, { font: `600 11px ${NM.F.mono}` });
    if (y) V.text(ctx, `a₂ = ${V.n(y)}`, ...mid([x, 0, 0], [x, y, 0]).map((v, i) => v + (i ? 13 : 0)), C.amber, { font: `600 11px ${NM.F.mono}` });
    if (z) V.text(ctx, `a₃ = ${V.n(z)}`, ...mid([x, y, 0], [x, y, z]).map((v, i) => v + (i ? 0 : 34)), C.ink2, { font: `600 11px ${NM.F.mono}` });
  }

  function update() {
    const a = sl.map((s) => +s.value);
    a.forEach((v, i) => { root.querySelector(`.o${i + 1}`).textContent = V.n(v); });
    $(".n-v").textContent = V.tup(a, 0);
    $(".n-f").textContent = V.len(a[0] ** 2 + a[1] ** 2);
    $(".n-l").textContent = V.len(a[0] ** 2 + a[1] ** 2 + a[2] ** 2);
    draw();
  }
  V.orbit(cv, view, draw);
  sl.forEach((s) => s.addEventListener("input", update));
  update();
})();
