/* 카드: 공간의 직선도 같은 식으로? — p = a + t u (좌표공간), 대칭형 방정식, xy평면과의 교점 */
(() => {
  const root = document.getElementById("card-geo-line-space");
  if (!root) return;
  const { C, fit } = NM;
  const V = NMGeoVec;
  const $ = (s) => root.querySelector(s), cv = $("canvas"), st = $(".t");
  const sl = [$(".s1"), $(".s2"), $(".s3")];
  const A = [1, 2, 1], X = ["x", "y", "z"];
  const view = V.view3();
  const { ctx, size } = fit(cv, () => draw());
  const getU = () => sl.map((s) => +s.value);
  const term = (k) => k === 0 ? "" : ` ${k < 0 ? "−" : "+"} ${Math.abs(k) === 1 ? "" : V.n(Math.abs(k))}<i>t</i>`;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    V.fit3(view, w, h, 3.6);
    V.axes3(ctx, view, 3.6, { grid: 3 });
    const u = getU(), t = +st.value, zero = !u.some(Boolean);
    if (!zero) {
      V.line3(ctx, view, V.add(A, V.mul(-3, u)), V.add(A, V.mul(3, u)), C.ink2, 2);
      if (u[2]) {
        const t0 = -A[2] / u[2], X0 = V.add(A, V.mul(t0, u));
        const [x, y] = view.P(X0); V.dot(ctx, x, y, C.apple, 5, true);
      }
    }
    const p = V.add(A, V.mul(t, u));
    V.line3(ctx, view, p, [p[0], p[1], 0], C.ink3, 1, [2, 3]);
    V.line3(ctx, view, A, [A[0], A[1], 0], C.ink3, 1, [2, 3]);
    V.arrow3(ctx, view, [0, 0, 0], A, C.ink3, 1.2, 8, [4, 3]);
    if (!zero) V.arrow3(ctx, view, A, V.add(A, u), C.amber, 3, 11);
    const [ax, ay] = view.P(A), [px, py] = view.P(p);
    V.dot(ctx, ax, ay, C.ink, 5);
    V.dot(ctx, px, py, C.forest, 6, true);
    V.text(ctx, "A", ax - 12, ay + 2, C.ink);
    const r = px > w - 110;
    V.text(ctx, `P${V.tup(p)}`, r ? px - 12 : px + 12, py - 12, C.forest, { align: r ? "right" : "left" });
    if (!zero) { const [ux, uy] = view.P(V.add(A, V.mul(0.5, u))), d = Math.hypot(ux - ax, uy - ay) || 1; V.vlabel(ctx, "{u}", ux + (uy - ay) / d * 16, uy - (ux - ax) / d * 16, C.amber); }
  }

  function update() {
    const u = getU(), t = +st.value, zero = !u.some(Boolean);
    u.forEach((v, i) => { root.querySelector(`.o${i + 1}`).textContent = V.n(v); });
    $(".t-out").textContent = V.n(t, 1);
    $(".n-p").textContent = V.tup(V.add(A, V.mul(t, u)));
    $(".n-u").textContent = V.len(u[0] ** 2 + u[1] ** 2 + u[2] ** 2);
    $(".n-xy").textContent = u[2] ? `${V.tup(V.add(A, V.mul(-A[2] / u[2], u)))}, t = ${V.n(-A[2] / u[2])}` : "없음 (평행)";
    if (zero) { $(".eq").innerHTML = "방향벡터는 영벡터가 아니어야 합니다."; draw(); return; }
    const par = X.map((v, i) => `<i>${v}</i> = ${V.n(A[i])}${term(u[i])}`).join(", ");
    const fr = [], fixed = [];
    X.forEach((v, i) => {
      if (u[i]) fr.push(`${V.shift(v, A[i])}${u[i] === 1 ? "" : ` / ${u[i] < 0 ? `(${V.n(u[i])})` : V.n(u[i])}`}`);
      else fixed.push(`<i>${v}</i> = ${V.n(A[i])}`);
    });
    $(".eq").innerHTML = `${par}<br>${[fr.length > 1 ? fr.join(" = ") : "", ...fixed].filter(Boolean).join(", ")}`;
    draw();
  }
  V.orbit(cv, view, draw);
  sl.forEach((s) => s.addEventListener("input", update)); st.addEventListener("input", update);
  update();
})();
