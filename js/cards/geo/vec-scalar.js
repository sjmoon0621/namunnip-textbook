/* 카드: 벡터에 음수를 곱하면 무엇이 바뀔까? — 실수배 ka의 크기와 방향, 단위벡터, 평행한 직선 */
(() => {
  const root = document.getElementById("card-geo-vec-scalar");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const V = NMGeoVec;
  const $ = (s) => root.querySelector(s), sk = $(".k"), cv = $("canvas");
  let a = [2, 1], view = null;
  const S = [0, 0];
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    view = V.plane(w, h, [-6, 6], [-4.2, 4.2]);
    V.grid(ctx, view, { axes: false });
    const P = view.P, k = +sk.value, ka = V.mul(k, a), L = V.norm(a);
    if (L > 0) {   // a와 평행한 직선
      const u = V.mul(30 / L, a);
      V.line(ctx, ...P(V.sub(S, u)), ...P(V.add(S, u)), C.ink3, 1, [4, 5]);
    }
    const kc = k > 0 ? C.forest : k < 0 ? C.warn : C.ink3;
    ctx.save(); ctx.globalAlpha = .55; V.arrow(ctx, ...P(S), ...P(ka), kc, 8, 16); ctx.restore();
    V.arrow(ctx, ...P(S), ...P(a), C.apple, 2.6);
    if (L > 0) V.arrow(ctx, ...P(S), ...P(V.mul(1 / L, a)), C.ink, 1.6, 7);
    V.dot(ctx, ...P(S), C.ink, 3.5);
    V.dot(ctx, ...P(a), C.apple, 6, true);
    // 이름표: a는 화살표 옆, ka는 끝 바깥쪽
    const [x0, y0] = P(S), [xa, ya] = P(a), nl = Math.hypot(xa - x0, ya - y0) || 1;
    V.vlabel(ctx, "{a}", (x0 + xa) / 2 - (ya - y0) / nl * 15, (y0 + ya) / 2 + (xa - x0) / nl * 15, C.apple);
    if (Math.abs(k) > 0.05 && L > 0) {
      const [xk, yk] = P(ka), dl = Math.hypot(xk - x0, yk - y0) || 1;
      const tx = clamp(xk + (xk - x0) / dl * 22, 30, w - 30), ty = clamp(yk + (yk - y0) / dl * 16, 14, h - 12);
      V.vlabel(ctx, `${V.n(k, 1)}{a}`, tx, ty, kc);
    }
  }

  function update() {
    const k = +sk.value, q = a[0] ** 2 + a[1] ** 2, L = Math.sqrt(q);
    $(".k-out").textContent = V.n(k, 1);
    $(".n-a").textContent = V.len(q);
    $(".n-ka").textContent = V.n(Math.abs(k) * L);
    $(".n-p").textContent = `${V.n(Math.abs(k), 1)} × ${V.n(L)}`;
    const d = $(".n-d");
    d.textContent = L === 0 || Math.abs(k) < 1e-9 ? "영벡터" : k > 0 ? "같은 방향" : "반대 방향";
    d.className = `n-d ${k < 0 && L > 0 ? "bad" : k > 0 && L > 0 ? "good" : ""}`;
    draw();
  }
  V.drag(cv, () => view ? [{ id: "a", ...(([x, y]) => ({ x, y }))(view.P(a)) }] : [], (id, px, py) => {
    a = [clamp(Math.round(view.ix(px)), -3, 3), clamp(Math.round(view.iy(py)), -2, 2)];
    update();
  });
  sk.addEventListener("input", update);
  update();
})();
