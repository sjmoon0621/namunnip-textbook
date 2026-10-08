/* 카드: ∞/∞ 꼴의 수열은 어디로 갈까? — aₙ = (p·nᵏ − 5)/(q·nᵐ + 2)의 차수와 계수를 바꾸며 분모의 최고차항으로 나누기 */
(() => {
  const root = document.getElementById("card-calc2-rational-seq");
  if (!root) return;
  const { C, fit } = NM;
  const S = NMSeq, n = S.n;
  const $ = (s) => root.querySelector(s);
  const sk = $(".k"), sm = $(".m"), sp = $(".p"), sq = $(".q"), st = $(".t");
  const PS = [-3, -2, -1, 1, 2, 3];
  const SUP = ["", "", "²", "³"];
  const gcd = (x, y) => (y ? gcd(y, x % y) : Math.abs(x));
  const get = () => ({ k: +sk.value, m: +sm.value, p: PS[+sp.value], q: +sq.value });
  const term = (v) => { const { k, m, p, q } = get(); return (p * v ** k - 5) / (q * v ** m + 2); };
  const nOf = () => Math.round(Math.pow(10, +st.value));
  const { ctx, size } = fit($("canvas"), () => draw());

  function limit() {
    const { k, m, p, q } = get();
    if (k < m) return 0;
    if (k > m) return p > 0 ? Infinity : -Infinity;
    return p / q;
  }
  const mono = (c, e, v = "n") => {
    const cs = c === 1 ? "" : c === -1 ? "−" : n(c);
    return e === 0 ? n(c) : `${cs}${v}${SUP[e]}`;
  };
  const overN = (c, e) => (e > 0 ? mono(c, e) : e === 0 ? n(c) : `${n(c)}/n${SUP[-e]}`);
  const fracTxt = (p, q) => { const d = gcd(p, q), a = p / d, b = q / d; return b === 1 ? n(a) : `${n(a)}/${b}`; };

  function draw() {
    const { w, h } = size; if (!w) return;
    const L = limit(), cur = nOf();
    const g = S.frame(ctx, w, h, { xr: [0, 41], yr: [-4, 4], xt: [1, 10, 20, 30, 40], yt: [-4, -2, 0, 2, 4], L: 30, B: 22 });
    if (isFinite(L)) S.hline(ctx, g, L, C.forest);
    for (let v = 1; v <= 40; v++) S.dot(ctx, g, v, term(v), C.forest, v === cur ? 5 : 3, v !== cur && cur <= 40);
    if (isFinite(L)) S.tag(ctx, `극한값 ${n(L)}`, g.x0 + g.w - 4, L > 3 ? g.Y(L) + 12 : g.Y(L) - 12, C.forest, "right");
    else S.tag(ctx, L > 0 ? "→ ∞ (위로 빠져나감)" : "→ −∞ (아래로 빠져나감)", g.x0 + g.w - 4, L > 0 ? g.y0 + 22 : g.y0 + g.h - 22, C.warn, "right");
  }

  function update() {
    const { k, m, p, q } = get(), L = limit(), v = nOf();
    $(".k-out").textContent = String(k); $(".m-out").textContent = String(m);
    $(".p-out").textContent = n(p); $(".q-out").textContent = String(q); $(".t-out").textContent = String(v);
    $(".eq1").textContent = `aₙ = (${mono(p, k)} − 5)/(${mono(q, m)} + 2)`;
    $(".eq2").textContent = `분자·분모를 n${SUP[m]}으로 나누면 (${overN(p, k - m)} − 5/n${SUP[m]})/(${n(q)} + 2/n${SUP[m]})`;
    $(".n-a").textContent = n(term(v), 6);
    const dl = $(".n-L");
    dl.textContent = isFinite(L) ? (k === m ? `${fracTxt(p, q)}` : "0") : n(L);
    dl.className = `n-L ${isFinite(L) ? "good" : "bad"}`;
    $(".n-r").textContent = k > m ? "분자 차수가 큼" : k < m ? "분모 차수가 큼" : "차수가 같음";
    draw();
  }
  [sk, sm, sp, sq, st].forEach((s) => s.addEventListener("input", update));
  update();
})();
