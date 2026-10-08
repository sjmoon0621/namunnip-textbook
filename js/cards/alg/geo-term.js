/* 카드: 같은 수를 계속 곱하면 항은 어떻게 변할까? — 첫째항·공비 슬라이더, ×r 화살표, 지수함수 곡선, 등비중항 */
(() => {
  const root = document.getElementById("card-alg-geo-term");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSeq;
  const $ = (s) => root.querySelector(s);
  const sa = $(".a"), sr = $(".r"), sk = $(".k");
  const N = 7;
  const { ctx, size } = fit($("canvas"), () => draw());
  const term = (i) => +sa.value * (+sr.value) ** (i - 1);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = +sa.value, r = +sr.value, k = +sk.value, v = Array.from({ length: N }, (_, i) => term(i + 1));
    let lo = Math.min(0, ...v), hi = Math.max(0, ...v);
    if (hi - lo < 1) { lo = Math.min(lo, -1); hi = Math.max(hi, 1); }
    const pad = (hi - lo) * 0.1;
    const box = { x: 40, y: 12, w: w - 50, h: h - 34 };
    const G = S.frame(ctx, box, { x0: 0.5, x1: N + 0.5, y0: lo - pad, y1: hi + pad }, { xt: v.map((_, i) => [i + 1, String(i + 1)]), yt: S.ticks(lo - pad, hi + pad, 4) });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
    if (r > 0 && a !== 0) {
      ctx.setLineDash([5, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.beginPath();
      for (let i = 0; i <= 120; i++) { const x = 0.6 + i / 120 * (N - 0.2); (i ? ctx.lineTo : ctx.moveTo).call(ctx, G.X(x), G.Y(a * r ** (x - 1))); }
      ctx.stroke(); ctx.setLineDash([]);
    }
    if (a !== 0 && r !== 0) for (let i = 1; i < Math.min(N, 4); i++) {
      const x1 = G.X(i), y1 = G.Y(v[i - 1]), x2 = G.X(i + 1), y2 = G.Y(v[i]);
      ctx.strokeStyle = C.sprout; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x1 + 5, y1);
      ctx.quadraticCurveTo((x1 + x2) / 2, Math.min(y1, y2) - 22, x2 - 4, y2 - 6); ctx.stroke();
      S.tag(ctx, `×${S.n(r)}`, (x1 + x2) / 2, Math.min(y1, y2) - 18, C.forest, "center", 10.5);
    }
    v.forEach((y, i) => S.dot(ctx, G.X(i + 1), G.Y(y), i + 1 === k ? 6.5 : 4.5, i + 1 === k ? C.warn : i + 1 === k - 1 || i + 1 === k + 1 ? S.BLUE : C.forest));
    ctx.restore();
    if (a === 0 || r === 0) S.tag(ctx, a === 0 ? "a = 0: 비 a_{n+1}/a_n을 정할 수 없음" : "r = 0: 둘째항부터 0, 비를 정할 수 없음", box.x + box.w / 2, box.y + 14, C.warn, "center");
  }

  function update() {
    const a = +sa.value, r = +sr.value, k = +sk.value;
    $(".a-out").textContent = S.n(a); $(".r-out").textContent = S.n(r); $(".k-out").textContent = k;
    const rr = r < 0 ? `(${S.n(r)})` : S.n(r);
    $(".gen").innerHTML = `<i>a</i><sub><i>n</i></sub> = ${S.n(a)} · ${rr}<sup><i>n</i>−1</sup>`;
    $(".v-7").textContent = S.n(term(7));
    $(".v-r").textContent = a !== 0 && r !== 0 ? S.n(r) : "정할 수 없음";
    $(".d-m").innerHTML = `<i>a</i><sub>${k - 1}</sub> · <i>a</i><sub>${k + 1}</sub> 와 <i>a</i><sub>${k}</sub><sup>2</sup>`;
    $(".v-m").textContent = `${S.n(term(k - 1) * term(k + 1))} = ${S.n(term(k) ** 2)}`;
    draw();
  }
  [sa, sr, sk].forEach((s) => s.addEventListener("input", update));
  update();
})();
