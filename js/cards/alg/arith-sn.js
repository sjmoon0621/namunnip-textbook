/* 카드: 합 Sₙ을 알면 각 항도 알 수 있을까? — Sₙ = pn² + qn + r에서 aₙ = Sₙ − Sₙ₋₁ (n ≥ 2), a₁ = S₁ */
(() => {
  const root = document.getElementById("card-alg-arith-sn");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSeq;
  const $ = (s) => root.querySelector(s);
  const sl = ["p", "q", "r", "n"].map((k) => $("." + k));
  const N = 7;
  const { ctx, size } = fit($("canvas"), () => draw());
  const get = () => sl.map((s) => +s.value);
  const Sn = (k) => { const [p, q, r] = get(); return k === 0 ? 0 : p * k * k + q * k + r; };
  const an = (k) => (k === 1 ? Sn(1) : Sn(k) - Sn(k - 1));
  const it = (s) => s.replace(/n/g, "<i>n</i>").replace(/<i>n<\/i>2/g, "<i>n</i><sup>2</sup>");

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const [p, q, , n] = get(), v = Array.from({ length: N }, (_, i) => an(i + 1)), ghost = p + q;
    const lo = Math.min(0, ghost, ...v), hi = Math.max(0, ghost, ...v), pad = (hi - lo) * 0.12 || 2;
    const box = { x: 34, y: 10, w: w - 44, h: h - 32 };
    const G = S.frame(ctx, box, { x0: 0.5, x1: N + 0.5, y0: lo - pad, y1: hi + pad }, { xt: v.map((_, i) => [i + 1, String(i + 1)]), yt: S.ticks(lo - pad, hi + pad, 4) });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
    ctx.setLineDash([5, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.beginPath();
    const L = (x) => 2 * p * x - p + q;
    ctx.moveTo(G.X(0.6), G.Y(L(0.6))); ctx.lineTo(G.X(N + 0.4), G.Y(L(N + 0.4))); ctx.stroke(); ctx.setLineDash([]);
    const off = v[0] !== ghost;
    if (off) {
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(G.X(1), G.Y(ghost)); ctx.lineTo(G.X(1), G.Y(v[0])); ctx.stroke();
      S.dot(ctx, G.X(1), G.Y(ghost), 5, C.ink2, true);
    }
    v.forEach((y, i) => S.dot(ctx, G.X(i + 1), G.Y(y), i + 1 === n ? 6.5 : 4.5, i === 0 ? C.warn : i + 1 === n ? S.BLUE : C.forest));
    ctx.restore();
    if (off) S.tag(ctx, `r = ${S.n(v[0] - ghost)}만큼 어긋남`, G.X(1) + 10, G.Y((ghost + v[0]) / 2), C.warn, "left", 11);
    const up = v[n - 1] < (lo + hi) / 2;
    if (n > 1) S.tag(ctx, `a_${n} = ${S.n(v[n - 1])}`, G.X(n) + (n > 5 ? -10 : 10), G.Y(v[n - 1]) + (up ? -14 : 14), S.BLUE, n > 5 ? "right" : "left", 11);
  }

  function update() {
    const [p, q, r, n] = get();
    ["p", "q", "r", "n"].forEach((k, i) => { $(`.${k}-out`).textContent = S.n(+sl[i].value); });
    let s = (p === 0 ? "" : (p === 1 ? "" : p === -1 ? "−" : S.n(p)) + "n2");
    if (q !== 0) s += s ? ` ${q < 0 ? "−" : "+"} ${Math.abs(q) === 1 ? "" : Math.abs(q)}n` : (q === 1 ? "" : q === -1 ? "−" : S.n(q)) + "n";
    if (r !== 0 || !s) s += s ? ` ${r < 0 ? "−" : "+"} ${Math.abs(r)}` : S.n(r);
    $(".sn").innerHTML = `<i>S</i><sub><i>n</i></sub> = ${it(s)}`;
    $(".an").innerHTML = n === 1 ? `<i>a</i><sub>1</sub> = <i>S</i><sub>1</sub> = ${S.n(Sn(1))}`
      : `<i>a</i><sub>${n}</sub> = <i>S</i><sub>${n}</sub> − <i>S</i><sub>${n - 1}</sub> = ${S.n(Sn(n))} − ${Sn(n - 1) < 0 ? `(${S.n(Sn(n - 1))})` : S.n(Sn(n - 1))} = ${S.n(an(n))}`;
    $(".v-1").textContent = S.n(an(1));
    $(".v-g").innerHTML = it(S.lin(2 * p, q - p));
    const ok = $(".v-ok"); ok.textContent = r === 0 ? `예 (공차 ${S.n(2 * p)})` : "둘째항부터만"; ok.className = `v-ok ${r === 0 ? "good" : "bad"}`;
    draw();
  }
  sl.forEach((s) => s.addEventListener("input", update));
  update();
})();
