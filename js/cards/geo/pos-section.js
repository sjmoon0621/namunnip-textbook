/* 카드: 두 점의 위치벡터로 선분을 나누는 점을 어떻게 나타낼까? — p = (mb + na)/(m + n), 외분 p = (mb − na)/(m − n) */
(() => {
  const root = document.getElementById("card-geo-pos-section");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const V = NMGeoVec;
  const $ = (s) => root.querySelector(s), btns = [...root.querySelectorAll(".presets .chip")];
  const cv = $("canvas"), sm = $(".m"), sn = $(".nn");
  const vs = (c) => `<span class="vec"><i>${c}</i></span>`;
  let A = [-3, -2], B = [3, 2], ext = false, view = null;
  const { ctx, size } = fit(cv, () => draw());

  const point = () => {
    const m = +sm.value, n = +sn.value;
    if (!ext) return V.mul(1 / (m + n), V.add(V.mul(m, B), V.mul(n, A)));
    if (m === n) return null;
    return V.mul(1 / (m - n), V.sub(V.mul(m, B), V.mul(n, A)));
  };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    view = V.plane(w, h, [-7, 7], [-4.6, 4.6]);
    V.grid(ctx, view);
    const P = view.P, O = [0, 0], p = point();
    // 직선 AB (점선)과 선분 AB
    const d = V.sub(B, A), L = V.norm(d);
    if (L > 0) { const u = V.mul(30 / L, d); V.line(ctx, ...P(V.sub(A, u)), ...P(V.add(A, u)), C.ink3, 1, [4, 5]); }
    V.line(ctx, ...P(A), ...P(B), C.ink2, 2.5);
    V.arrow(ctx, ...P(O), ...P(A), C.apple, 2);
    V.arrow(ctx, ...P(O), ...P(B), C.amber, 2);
    if (p) V.arrow(ctx, ...P(O), ...P(p), C.forest, 3);
    V.dot(ctx, ...P(A), C.apple, 6, true); V.dot(ctx, ...P(B), C.amber, 6, true);
    const tag = (q, s, col) => {
      const [x, y] = P(q), r = x > w - 70;
      V.text(ctx, s, r ? x - 10 : x + 10, y - 13, col, { align: r ? "right" : "left" });
    };
    tag(A, `A${V.tup(A, 0)}`, C.apple); tag(B, `B${V.tup(B, 0)}`, C.amber);
    if (p) {
      const [x, y] = P(p);
      if (x > 0 && x < w && y > 0 && y < h) { V.dot(ctx, x, y, C.forest, 5.5); tag(p, `P${V.tup(p)}`, C.forest); }
      else V.text(ctx, "P는 그림 밖에 있습니다", w - 8, h - 12, C.forest, { align: "right" });
    } else V.text(ctx, "m = n이면 외분점이 없습니다", w - 8, h - 12, C.warn, { align: "right" });
  }

  function update() {
    const m = +sm.value, n = +sn.value, p = point();
    $(".m-out").textContent = m; $(".n-out").textContent = n;
    $(".n-a").textContent = V.tup(A, 0); $(".n-b").textContent = V.tup(B, 0); $(".n-p").textContent = p ? V.tup(p) : "없음";
    const k = (c, v) => c === 1 ? vs(v) : `${c}${vs(v)}`;
    $(".eq").innerHTML = ext
      ? (p ? `${vs("p")} = (${k(m, "b")} − ${k(n, "a")}) / (${m} − ${n}) = ${V.tup(p)}` : `${m} − ${n} = 0이므로 나눌 수 없습니다`)
      : `${vs("p")} = (${k(m, "b")} + ${k(n, "a")}) / (${m} + ${n}) = ${V.tup(p)}`;
    draw();
  }

  V.drag(cv, () => view ? [["A", A], ["B", B]].map(([id, q]) => { const [x, y] = view.P(q); return { id, x, y }; }) : [], (id, px, py) => {
    const q = [clamp(Math.round(view.ix(px)), -6, 6), clamp(Math.round(view.iy(py)), -4, 4)];
    if (id === "A") A = q; else B = q;
    update();
  });
  btns.forEach((x) => x.addEventListener("click", () => { ext = x.dataset.e === "1"; btns.forEach((y) => y.setAttribute("aria-pressed", String(y === x))); update(); }));
  sm.addEventListener("input", update); sn.addEventListener("input", update);
  update();
})();
