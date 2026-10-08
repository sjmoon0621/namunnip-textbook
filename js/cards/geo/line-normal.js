/* 카드: 방향 대신 수직인 벡터로 직선을? — n·(p − a) = 0, ax + by + c = 0의 계수가 법선벡터, 시험점의 부호 */
(() => {
  const root = document.getElementById("card-geo-line-normal");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const V = NMGeoVec;
  const $ = (s) => root.querySelector(s), cv = $("canvas");
  let A = [1, 1], n = [1, 2], Q = [4, 3], view = null;
  const { ctx, size } = fit(cv, () => draw());
  const vs = (c) => `<span class="vec"><i>${c}</i></span>`;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    view = V.plane(w, h, [-7, 7], [-4.6, 4.6]);
    V.grid(ctx, view);
    const P = view.P, L = V.norm(n), N = V.add(A, n);
    if (L > 0) {
      const d = [n[1] / L, -n[0] / L], e = V.mul(30, d);
      // n 쪽 반평면을 옅게
      ctx.save(); ctx.globalAlpha = .08; ctx.fillStyle = C.forest; ctx.beginPath();
      const far = V.mul(30 / L, n);
      [V.sub(A, e), V.add(A, e), V.add(V.add(A, e), far), V.add(V.sub(A, e), far)].forEach((q, i) => i ? ctx.lineTo(...P(q)) : ctx.moveTo(...P(q)));
      ctx.fill(); ctx.restore();
      V.line(ctx, ...P(V.sub(A, e)), ...P(V.add(A, e)), C.ink, 2.4);
      // Q에서 직선으로 내린 수선
      const s = V.dotp(n, V.sub(Q, A)), foot = V.sub(Q, V.mul(s / (L * L), n));
      V.line(ctx, ...P(Q), ...P(foot), s === 0 ? C.forest : C.ink3, 1.4, [3, 3]);
      V.arrow(ctx, ...P(A), ...P(Q), C.ink2, 1.4, 8);
    }
    V.arrow(ctx, ...P(A), ...P(N), C.apple, 3);
    V.dot(ctx, ...P(A), C.ink, 6, true); V.dot(ctx, ...P(N), C.apple, 6, true);
    const s = V.dotp(n, V.sub(Q, A));
    V.dot(ctx, ...P(Q), s === 0 ? C.forest : C.amber, 6, true);
    const tag = (q, txt, col, dy = -13) => { const [x, y] = P(q), r = x > w - 80; V.text(ctx, txt, clamp(r ? x - 10 : x + 10, 4, w - 4), clamp(y + dy, 10, h - 10), col, { align: r ? "right" : "left" }); };
    tag(A, `A${V.tup(A, 0)}`, C.ink, 15); tag(Q, `Q${V.tup(Q, 0)}`, s === 0 ? C.forest : C.amber);
    const [nx, ny] = P(N); V.vlabel(ctx, "{n}", nx + 14, ny - 12, C.apple);
  }

  function update() {
    const L = V.norm(n), s = V.dotp(n, V.sub(Q, A));
    const nd = $(".n-d"); nd.textContent = V.n(s); nd.className = `n-d ${s === 0 ? "good" : ""}`;
    $(".n-s").textContent = !L ? "—" : s === 0 ? "직선 위" : s > 0 ? "n이 가리키는 쪽" : "반대쪽";
    $(".n-h").textContent = L ? V.n(Math.abs(s) / L) : "—";
    const c = -V.dotp(n, A);
    $(".eq").innerHTML = !L ? "법선벡터는 영벡터가 아니어야 합니다." :
      `${vs("n")}·(${vs("p")} − ${vs("a")}) = 0<br>${n[0] ? `${n[0] === 1 ? "" : n[0] === -1 ? "−" : V.n(n[0])}${V.shift("x", A[0])}` : ""}${n[0] && n[1] ? (n[1] < 0 ? " − " : " + ") : n[1] < 0 ? "−" : ""}${n[1] ? `${Math.abs(n[1]) === 1 ? "" : V.n(Math.abs(n[1]))}${V.shift("y", A[1])}` : ""} = 0<br>${V.lin(n, ["x", "y"], c)} = 0`;
    draw();
  }

  V.drag(cv, () => view ? [["A", A], ["N", V.add(A, n)], ["Q", Q]].map(([id, q]) => { const [x, y] = view.P(q); return { id, x, y }; }) : [], (id, px, py) => {
    const q = [clamp(Math.round(view.ix(px)), -6, 6), clamp(Math.round(view.iy(py)), -4, 4)];
    if (id === "A") A = q; else if (id === "N") n = V.sub(q, A); else Q = q;
    update();
  });
  update();
})();
