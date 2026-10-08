/* 카드: 공간에서 수직인 벡터 하나는 무엇을 정할까? — n·(p − a) = 0, ax + by + cz + d = 0, 평면 위를 도는 점 P */
(() => {
  const root = document.getElementById("card-geo-plane-normal");
  if (!root) return;
  const { C, fit } = NM;
  const V = NMGeoVec;
  const $ = (s) => root.querySelector(s), cv = $("canvas"), st = $(".t");
  const sl = [$(".s1"), $(".s2"), $(".s3")];
  const A = [1, 1, 1], X = ["x", "y", "z"];
  const view = V.view3();
  const { ctx, size } = fit(cv, () => draw());
  const getN = () => sl.map((s) => +s.value);
  const vs = (c) => `<span class="vec">${c}</span>`;

  /* n에 수직인 정규직교 두 벡터 */
  function basis(n) {
    const L = V.norm(n), u = V.mul(1 / L, n);
    const k = [0, 1, 2].reduce((m, i) => Math.abs(u[i]) < Math.abs(u[m]) ? i : m, 0), hv = [0, 0, 0]; hv[k] = 1;
    let e1 = V.cross(u, hv); e1 = V.mul(1 / V.norm(e1), e1);
    return [e1, V.cross(u, e1)];
  }
  const pointP = (n) => { const [e1, e2] = basis(n), f = +st.value * Math.PI / 180; return V.add(A, V.add(V.mul(1.8 * Math.cos(f), e1), V.mul(1.8 * Math.sin(f), e2))); };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    V.fit3(view, w, h, 3.6);
    V.axes3(ctx, view, 3.6, { grid: 3 });
    const n = getN();
    if (!n.some(Boolean)) { V.text(ctx, "법선벡터는 영벡터가 아니어야 합니다", w / 2, h - 14, C.warn); return; }
    const [e1, e2] = basis(n), R = 2.6;
    const at = (s, t) => V.add(A, V.add(V.mul(s, e1), V.mul(t, e2)));
    ctx.save(); ctx.globalAlpha = .16; ctx.fillStyle = C.leaf; ctx.beginPath();
    [[-R, -R], [R, -R], [R, R], [-R, R]].forEach(([s, t], i) => i ? ctx.lineTo(...view.P(at(s, t))) : ctx.moveTo(...view.P(at(s, t))));
    ctx.closePath(); ctx.fill(); ctx.restore();
    for (let i = -2; i <= 2; i++) {
      V.line3(ctx, view, at(i * R / 2, -R), at(i * R / 2, R), C.leaf, i ? 0.8 : 1.2);
      V.line3(ctx, view, at(-R, i * R / 2), at(R, i * R / 2), C.leaf, i ? 0.8 : 1.2);
    }
    // 좌표축과 만나는 점
    const d = V.dotp(n, A);
    for (let i = 0; i < 3; i++) if (n[i] && Math.abs(d / n[i]) <= 5) { const q = [0, 0, 0]; q[i] = d / n[i]; const [x, y] = view.P(q); V.dot(ctx, x, y, C.amber, 4.5, true); }
    const P = pointP(n);
    V.line3(ctx, view, A, P, C.ink2, 2.2);
    V.arrow3(ctx, view, A, V.add(A, n), C.apple, 3.2, 12);
    const [ax, ay] = view.P(A), [px, py] = view.P(P), [nx, ny] = view.P(V.add(A, n));
    V.dot(ctx, ax, ay, C.ink, 5); V.dot(ctx, px, py, C.forest, 6, true);
    V.text(ctx, "A", ax - 12, ay + 4, C.ink); V.text(ctx, "P", px + 12, py - 10, C.forest);
    V.vlabel(ctx, "{n}", nx + 14, ny - 10, C.apple);
  }

  function update() {
    const n = getN();
    n.forEach((v, i) => { root.querySelector(`.o${i + 1}`).textContent = V.n(v); });
    $(".t-out").textContent = st.value;
    if (!n.some(Boolean)) { $(".eq").innerHTML = "법선벡터는 영벡터가 아니어야 합니다."; ["d", "p", "x"].forEach((k) => { $(`.n-${k}`).textContent = "—"; }); draw(); return; }
    const P = pointP(n), d = V.dotp(n, A);
    const nd = $(".n-d"); nd.textContent = V.n(V.dotp(n, V.sub(P, A)), 3); nd.className = "n-d good";
    $(".n-p").textContent = V.tup(P);
    $(".n-x").textContent = n.map((v, i) => v ? `${X[i]} = ${V.n(d / v)}` : null).filter(Boolean).join(", ") || "—";
    let mid = "";
    n.forEach((v, i) => {
      if (!v) return;
      const a = Math.abs(v), c = a === 1 ? "" : V.n(a);
      mid += mid ? ` ${v < 0 ? "−" : "+"} ${c}${V.shift(X[i], A[i])}` : `${v < 0 ? "−" : ""}${c}${V.shift(X[i], A[i])}`;
    });
    $(".eq").innerHTML = `${vs("<i>n</i>")}·(${vs("<i>p</i>")} − ${vs("<i>a</i>")}) = 0<br>${mid} = 0<br>${V.lin(n, X, -d)} = 0`;
    draw();
  }
  V.orbit(cv, view, draw);
  sl.forEach((s) => s.addEventListener("input", update)); st.addEventListener("input", update);
  update();
})();
