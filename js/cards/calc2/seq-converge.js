/* 카드: 수열이 한 값에 '한없이 가까워진다'는 것은 무엇일까? — 극한값 후보 L 둘레의 띠 (L − ε, L + ε)에 끝까지 머무는지 확인 */
(() => {
  const root = document.getElementById("card-calc2-seq-converge");
  if (!root) return;
  const { C, fit } = NM;
  const S = NMSeq, n = S.n;
  const $ = (s) => root.querySelector(s);
  const sL = $(".L"), sE = $(".e");
  const EPS = [0.5, 0.2, 0.1, 0.05, 0.02, 0.01];
  const NMAX = 2000, SHOW = 40;
  const P = {
    alt: { f: (k) => 1 + (-1) ** k / k, L: 1 },
    rat: { f: (k) => (2 * k + 3) / (k + 1), L: 2 },
    osc: { f: (k) => (-1) ** k, L: 1 },
    sqrt: { f: (k) => Math.sqrt(k), L: 2 },
  };
  const inBand = (v, L, e) => Math.abs(v - L) < e - 1e-12;   // 경계 |aₙ − L| = ε를 부동소수점 오차로 띠 안에 넣지 않게
  let key = "alt";
  const { ctx, size } = fit($("canvas"), () => draw());

  function judge() {
    const f = P[key].f, L = +sL.value, e = EPS[+sE.value];
    let last = 0;
    for (let k = 1; k <= NMAX; k++) if (!inBand(f(k), L, e)) last = k;
    if (last > NMAX / 2) return { ok: false, last };
    return { ok: true, N: last + 1 };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    const f = P[key].f, L = +sL.value, e = EPS[+sE.value], J = judge();
    const g = S.frame(ctx, w, h, { xr: [0, SHOW + 1], yr: [-1.5, 3.5], xt: [1, 10, 20, 30, 40], yt: [-1, 0, 1, 2, 3], L: 30, B: 22 });
    S.band(ctx, g, L - e, L + e, C.leaf, 0.22);
    S.hline(ctx, g, L, C.forest, [5, 4], 1.4);
    if (J.ok && J.N <= SHOW) {
      ctx.save(); ctx.strokeStyle = C.forest; ctx.setLineDash([2, 3]); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(g.X(J.N - 0.5), g.y0); ctx.lineTo(g.X(J.N - 0.5), g.y0 + g.h); ctx.stroke(); ctx.restore();
    }
    for (let k = 1; k <= SHOW; k++) {
      const v = f(k), inside = inBand(v, L, e);
      S.dot(ctx, g, k, v, inside ? C.forest : C.warn, 3.2, !inside);
    }
    S.tag(ctx, `L = ${n(L)}, ε = ${n(e)}`, g.x0 + g.w - 4, g.y0 + 10, C.forest, "right");
    if (J.ok && J.N <= SHOW) S.tag(ctx, `N = ${J.N}`, g.X(J.N - 0.5) + 5, g.y0 + g.h - 10, C.forest, "left");
  }

  function update() {
    const L = +sL.value, e = EPS[+sE.value], J = judge();
    $(".L-out").textContent = n(L); $(".e-out").textContent = n(e);
    $(".n-40").textContent = n(P[key].f(SHOW), 5);
    const dn = $(".n-N"), dj = $(".n-j");
    if (J.ok) {
      dn.textContent = String(J.N);
      dj.textContent = J.N <= SHOW ? "끝까지 띠 안" : `n ≥ ${J.N}부터 띠 안`;
      dj.className = "n-j good";
    } else {
      dn.textContent = "없음";
      dj.textContent = `n = ${J.last}에도 띠 밖`;
      dj.className = "n-j bad";
    }
    draw();
  }
  S.chips(root, ".presets .chip", (b) => { key = b.dataset.k; update(); });
  sL.addEventListener("input", update); sE.addEventListener("input", update);
  update();
})();
