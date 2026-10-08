/* 카드: 더하는 항이 0으로 가면 급수는 수렴할까? — 부분합 Sₙ을 n = 10⁶까지 계산해 10배 구간마다 늘어나는 양 비교 */
(() => {
  const root = document.getElementById("card-calc2-nth-term");
  if (!root) return;
  const { C, fit } = NM;
  const S = NMSeq, n = S.n;
  const $ = (s) => root.querySelector(s);
  const st = $(".t"), TOP = 1e6;
  const SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶" };
  const P = {
    hm: { a: (k) => 1 / k, j: "발산 (aₙ → 0인데도)", ok: false },
    sq: { a: (k) => 1 / (k * k), j: "수렴 (합 π²/6 ≈ 1.6449)", ok: true },
    ratio: { a: (k) => k / (k + 1), j: "발산 (aₙ → 1 ≠ 0)", ok: false },
  };
  let key = "hm", cum = null;
  const build = () => { cum = new Float64Array(TOP + 1); for (let k = 1; k <= TOP; k++) cum[k] = cum[k - 1] + P[key].a(k); };
  const Nof = () => Math.round(Math.pow(10, +st.value));
  const label = (t) => (Number.isInteger(t) ? (t === 0 ? "1" : t === 1 ? "10" : "10" + SUP[t]) : "");
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w || !cum) return;
    const N = Nof(), tN = Math.log10(N), pts = [];
    for (let i = 0; i <= 160; i++) { const m = Math.max(1, Math.round(Math.pow(10, 6 * i / 160))); pts.push([Math.log10(m), cum[m], m <= N]); }
    const hi = Math.max(...pts.map((p) => p[1])) * 1.08;
    const g = S.frame(ctx, w, h, { xr: [-0.15, 6.15], yr: [0, hi], xt: [0, 1, 2, 3, 4, 5, 6], yt: S.ticks(0, hi, 4), xf: label, L: 48, B: 34, xlab: "n (눈금은 10배씩)" });
    pts.forEach(([x, y, on]) => S.dot(ctx, g, x, y, on ? C.forest : C.rule, on ? 2.8 : 2.2));
    S.dot(ctx, g, tN, cum[N], C.warn, 5.5);
    S.tag(ctx, `Sₙ (n = ${N})`, g.X(tN) + (tN > 4.5 ? -10 : 10), g.Y(cum[N]) + (cum[N] > hi * 0.85 ? 16 : -14), C.warn, tN > 4.5 ? "right" : "left");
  }

  function update() {
    const N = Nof();
    $(".t-out").textContent = String(N);
    $(".n-a").textContent = n(P[key].a(N), 7); $(".n-s").textContent = n(cum[N], 5);
    $(".n-d").textContent = N >= 10 ? n(cum[N] - cum[Math.round(N / 10)], 5) : "—";
    const dj = $(".n-j"); dj.textContent = P[key].j; dj.className = `n-j ${P[key].ok ? "good" : "bad"}`;
    draw();
  }
  S.chips(root, ".presets .chip", (b) => { key = b.dataset.k; build(); update(); });
  st.addEventListener("input", update);
  build(); update();
})();
