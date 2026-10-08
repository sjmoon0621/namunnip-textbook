/* 카드: 수렴하는 두 수열을 더하고 곱하면 극한은 어떻게 될까? — aₙ, bₙ과 연산 결과 cₙ을 함께 찍어 α ○ β와 비교 */
(() => {
  const root = document.getElementById("card-calc2-lim-laws");
  if (!root) return;
  const { C, fit } = NM;
  const S = NMSeq, n = S.n;
  const $ = (s) => root.querySelector(s);
  const sn = $(".nn");
  const a = (k) => 2 + 1 / k, alpha = 2;
  const B = {
    up: { f: (k) => 3 - 2 / k, L: 3, txt: "3 − 2/n" },
    alt: { f: (k) => (-1) ** k / k, L: 0, txt: "(−1)ⁿ/n" },
    half: { f: (k) => (k + 1) / (2 * k), L: 0.5, txt: "(n + 1)/(2n)" },
  };
  const OP = {
    add: { f: (x, y) => x + y, L: (p, q) => p + q, s: "+" },
    sub: { f: (x, y) => x - y, L: (p, q) => p - q, s: "−" },
    mul: { f: (x, y) => x * y, L: (p, q) => p * q, s: "×" },
    div: { f: (x, y) => x / y, L: (p, q) => (q === 0 ? NaN : p / q), s: "÷" },
    scl: { f: (x) => 3 * x, L: (p) => 3 * p, s: "3·" },
  };
  let bk = "up", op = "add";
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    const b = B[bk], o = OP[op], c = (k) => o.f(a(k), b.f(k)), L = o.L(alpha, b.L), cur = +sn.value;
    const g = S.frame(ctx, w, h, { xr: [0, 31], yr: [-2, 9.5], xt: [1, 10, 20, 30], yt: [-2, 0, 2, 4, 6, 8], L: 30, B: 22 });
    if (isFinite(L)) S.hline(ctx, g, L, C.forest);
    for (let k = 1; k <= 30; k++) {
      S.dot(ctx, g, k, a(k), C.ink3, 2.4);
      if (op !== "scl") S.dot(ctx, g, k, b.f(k), C.amber, 2.4);
      S.dot(ctx, g, k, c(k), C.forest, k === cur ? 5 : 3.2, k !== cur);
    }
    ctx.save(); ctx.strokeStyle = C.ink2; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(g.X(cur), g.y0); ctx.lineTo(g.X(cur), g.y0 + g.h); ctx.stroke(); ctx.restore();
    if (isFinite(L)) S.tag(ctx, `α ${o.s} β = ${n(L)}`, g.x0 + g.w - 4, g.Y(L) - 12 < g.y0 + 8 ? g.Y(L) + 12 : g.Y(L) - 12, C.forest, "right");
  }

  function update() {
    const b = B[bk], o = OP[op], k = +sn.value, L = o.L(alpha, b.L);
    $(".nn-out").textContent = String(k);
    $(".n-a").textContent = n(a(k), 5); $(".n-b").textContent = op === "scl" ? "—" : n(b.f(k), 5);
    $(".n-c").textContent = n(o.f(a(k), b.f(k)), 5);
    const dl = $(".n-L");
    dl.textContent = isFinite(L) ? n(L, 5) : "쓸 수 없음 (β = 0)";
    dl.className = `n-L ${isFinite(L) ? "good" : "bad"}`;
    $(".d-c").textContent = op === "scl" ? "cₙ = 3aₙ" : `cₙ = aₙ ${o.s} bₙ`;
    $(".d-L").textContent = op === "scl" ? "3α" : `α ${o.s} β`;
    $(".b-eq").textContent = `bₙ = ${b.txt} → β = ${n(b.L)}`;
    draw();
  }
  S.chips(root, ".pb .chip", (x) => { bk = x.dataset.b; update(); });
  S.chips(root, ".po .chip", (x) => { op = x.dataset.o; update(); });
  sn.addEventListener("input", update);
  update();
})();
