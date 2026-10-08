/* 카드: 같은 합을 서로 다른 정적분으로 읽어도 될까? — ∑(2/n)(1 + 2k/n)²의 세 가지 바른 해석과 한 가지 틀린 해석 */
(() => {
  const root = document.getElementById("card-calc2-sum-to-int");
  if (!root) return;
  const { C } = NM;
  const K = NMCalc, I = NMInteg, n = K.n;
  const $ = (s) => root.querySelector(s), sn = $(".sn");
  const R = [
    { f: (x) => x * x, a: 1, b: 3, v: 26 / 3, lab: "y = x²" },
    { f: (x) => (1 + x) ** 2, a: 0, b: 2, v: 26 / 3, lab: "y = (1 + x)²" },
    { f: (x) => 2 * (1 + 2 * x) ** 2, a: 0, b: 1, v: 26 / 3, lab: "y = 2(1 + 2x)²" },
    { f: (x) => x * x, a: 0, b: 2, v: 8 / 3, lab: "y = x²" },
  ];
  let k = 0;
  const S = (m) => { let s = 0; for (let i = 1; i <= m; i++) s += 2 / m * (1 + 2 * i / m) ** 2; return s; };
  const rect = (r, m) => { let s = 0; const d = (r.b - r.a) / m; for (let i = 1; i <= m; i++) s += r.f(r.a + i * d) * d; return s; };
  const { ctx, size } = NM.fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = R[k], m = +sn.value, d = (r.b - r.a) / m;
    const g = K.frame(ctx, w, h, { xr: [-0.1, 3.2], yr: [-0.6, 19], xs: 0.5, ys: 3 });
    for (let i = 1; i <= m; i++) I.bar(ctx, g, r.a + (i - 1) * d, r.a + i * d, r.f(r.a + i * d), i % 2 ? C.forest : K.BLUE, 0, 0.22);
    K.curve(ctx, g, r.f, C.forest, { from: r.a, to: r.b });
    K.curve(ctx, g, r.f, C.ink3, { width: 1, dash: [3, 3] });
    I.vline(ctx, g, r.a, C.ink3); I.vline(ctx, g, r.b, C.ink3);
    K.tag(ctx, g, r.lab, g.x0 + 4, g.y0 + 10, C.forest);
    K.tag(ctx, g, `[${n(r.a)}, ${n(r.b)}], 너비 ${n(r.b - r.a)}/n`, g.x0 + 4, g.y0 + 28, C.ink2);
  }

  function update() {
    const r = R[k], m = +sn.value, s = S(m), q = rect(r, m), same = Math.abs(s - q) < 1e-9;
    $(".n-out").textContent = m;
    $(".n-s").textContent = n(s, 4); $(".n-r").textContent = n(q, 4); $(".n-i").textContent = n(r.v, 4);
    const el = $(".n-ok");
    el.textContent = same ? "직사각형이 합과 똑같음" : "직사각형이 합과 다름";
    el.className = `n-ok ${same ? "good" : ""}`;
    draw();
  }

  K.chips(root, ".fn .chip", (bt) => { k = +bt.dataset.k; update(); });
  sn.addEventListener("input", update);
  update();
})();
