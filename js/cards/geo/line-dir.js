/* 카드: 한 점과 방향만으로 직선 위의 모든 점을? — p = a + t u, 매개변수 방정식과 대칭형, P의 자취 */
(() => {
  const root = document.getElementById("card-geo-line-dir");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const V = NMGeoVec;
  const $ = (s) => root.querySelector(s), cv = $("canvas"), st = $(".t");
  let A = [1, 2], u = [2, 1], view = null, trail = new Set();
  const { ctx, size } = fit(cv, () => draw());
  const vs = (c) => `<span class="vec"><i>${c}</i></span>`;
  const term = (c, k) => k === 0 ? "" : ` ${k < 0 ? "−" : "+"} ${Math.abs(k) === 1 ? "" : V.n(Math.abs(k))}<i>t</i>`;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    view = V.plane(w, h, [-7, 7], [-4.6, 4.6]);
    V.grid(ctx, view);
    const P = view.P, t = +st.value, L = V.norm(u);
    if (L > 0) { const e = V.mul(30 / L, u); V.line(ctx, ...P(V.sub(A, e)), ...P(V.add(A, e)), C.ink3, 1, [4, 5]); }
    for (const k of trail) { const q = P(V.add(A, V.mul(k / 10, u))); V.dot(ctx, q[0], q[1], C.leaf, 2.6); }
    const p = V.add(A, V.mul(t, u));
    V.arrow(ctx, ...P(A), ...P(p), C.forest, 4.5, 12);
    V.arrow(ctx, ...P(A), ...P(V.add(A, u)), C.amber, 2.6);
    V.dot(ctx, ...P(A), C.apple, 6, true);
    V.dot(ctx, ...P(V.add(A, u)), C.amber, 6, true);
    V.dot(ctx, ...P(p), C.forest, 5);
    const tag = (q, s, col, dy = -13) => { const [x, y] = P(q), r = x > w - 90; V.text(ctx, s, clamp(r ? x - 10 : x + 10, 4, w - 4), clamp(y + dy, 10, h - 10), col, { align: r ? "right" : "left" }); };
    tag(A, `A${V.tup(A, 0)}`, C.apple, 15);
    const [ax, ay] = P(A), [ux, uy] = P(V.add(A, V.mul(0.5, u))), dl = Math.hypot(ux - ax, uy - ay) || 1; V.vlabel(ctx, "{u}", ux + (uy - ay) / dl * 16, uy - (ux - ax) / dl * 16, C.amber);
    tag(p, `P${V.tup(p)}`, C.forest);
  }

  function update() {
    const t = +st.value;
    $(".t-out").textContent = V.n(t, 1);
    trail.add(Math.round(t * 10));
    const p = V.add(A, V.mul(t, u));
    $(".n-p").textContent = V.tup(p); $(".n-ap").textContent = V.tup(V.mul(t, u)); $(".n-tr").textContent = `점 ${trail.size}개`;
    let eq;
    if (!u[0] && !u[1]) eq = "방향벡터는 영벡터가 아니어야 합니다.";
    else {
      eq = `${vs("p")} = ${V.tup(A, 0)} + <i>t</i>${V.tup(u, 0)}<br><i>x</i> = ${V.n(A[0])}${term("x", u[0])}, <i>y</i> = ${V.n(A[1])}${term("y", u[1])}<br>`;
      if (u[0] && u[1]) eq += `${V.shift("x", A[0])}${u[0] === 1 ? "" : ` / ${u[0] < 0 ? `(${V.n(u[0])})` : V.n(u[0])}`} = ${V.shift("y", A[1])}${u[1] === 1 ? "" : ` / ${u[1] < 0 ? `(${V.n(u[1])})` : V.n(u[1])}`}`;
      else eq += u[0] ? `<i>y</i> = ${V.n(A[1])} (가로 직선)` : `<i>x</i> = ${V.n(A[0])} (세로 직선)`;
    }
    $(".eq").innerHTML = eq;
    draw();
  }

  V.drag(cv, () => view ? [["A", A], ["U", V.add(A, u)]].map(([id, q]) => { const [x, y] = view.P(q); return { id, x, y }; }) : [], (id, px, py) => {
    const q = [clamp(Math.round(view.ix(px)), -6, 6), clamp(Math.round(view.iy(py)), -4, 4)];
    if (id === "A") A = q;
    else u = V.sub(q, A);
    trail = new Set(); update();
  });
  st.addEventListener("input", update);
  update();
})();
