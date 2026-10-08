/* 카드: 화살표를 수 두 개로 바꿀 수 있을까? — AB를 원점으로 옮긴 화살표의 종점 = 성분, 크기 √(a1² + a2²) */
(() => {
  const root = document.getElementById("card-geo-components");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const V = NMGeoVec;
  const $ = (s) => root.querySelector(s), cv = $("canvas");
  const vs = (c) => `<span class="vec">${c}</span>`;
  let A = [1, -3], B = [4, 1], view = null;
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    view = V.plane(w, h, [-7, 7], [-4.6, 4.6]);
    V.grid(ctx, view);
    const P = view.P, O = [0, 0], d = V.sub(B, A);
    // 원점으로 옮긴 화살표와 가로·세로 성분
    V.line(ctx, ...P(O), ...P([d[0], 0]), C.amber, 3);
    V.line(ctx, ...P([d[0], 0]), ...P(d), C.amber, 3);
    V.arrow(ctx, ...P(O), ...P(d), C.forest, 2.2, 10, [6, 4]);
    V.line(ctx, ...P(A), ...P(O), C.ink3, 1, [2, 4]);
    V.line(ctx, ...P(B), ...P(d), C.ink3, 1, [2, 4]);
    V.arrow(ctx, ...P(A), ...P(B), C.apple, 3);
    V.dot(ctx, ...P(A), C.apple, 6, true); V.dot(ctx, ...P(B), C.apple, 6, true);
    if (d[0] || d[1]) V.dot(ctx, ...P(d), C.forest, 4.5);
    const tag = (q, s, col, dy = -13) => { const [x, y] = P(q), r = x > w - 80; V.text(ctx, s, r ? x - 10 : x + 10, y + dy, col, { align: r ? "right" : "left" }); };
    tag(A, `A${V.tup(A, 0)}`, C.apple, 14); tag(B, `B${V.tup(B, 0)}`, C.apple);
    if (d[0] || d[1]) tag(d, V.tup(d, 0), C.forest, d[1] >= 0 ? -13 : 14);
    if (d[0]) V.text(ctx, V.n(d[0]), P([d[0] / 2, 0])[0], P([0, 0])[1] + (d[1] >= 0 ? 12 : -12), C.amber);
    if (d[1]) V.text(ctx, V.n(d[1]), P([d[0], 0])[0] + (d[0] >= 0 ? 14 : -14), P([0, d[1] / 2])[1], C.amber);
  }

  function update() {
    const d = V.sub(B, A);
    $(".n-x").textContent = V.n(d[0]); $(".n-y").textContent = V.n(d[1]);
    $(".n-l").textContent = V.len(d[0] ** 2 + d[1] ** 2);
    const e = (i) => `<span class="vec"><i>e</i></span><sub>${i}</sub>`;
    $(".eq").innerHTML = `${vs("AB")} = (${V.n(B[0])} − ${V.n(A[0]).replace(/^−.*/, (s) => `(${s})`)}, ${V.n(B[1])} − ${V.n(A[1]).replace(/^−.*/, (s) => `(${s})`)}) = ${V.tup(d, 0)}<br>= ${V.n(d[0])}${e(1)} + ${V.n(d[1]).replace(/^−.*/, (s) => `(${s})`)}${e(2)}`;
    draw();
  }

  V.drag(cv, () => view ? [["A", A], ["B", B]].map(([id, q]) => { const [x, y] = view.P(q); return { id, x, y }; }) : [], (id, px, py) => {
    const q = [clamp(Math.round(view.ix(px)), -6, 6), clamp(Math.round(view.iy(py)), -4, 4)];
    if (id === "A") A = q; else B = q;
    update();
  });
  update();
})();
