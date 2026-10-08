/* 카드: 같은 비율로 줄어드는 수를 끝없이 더하면 얼마일까? — 첫째항 a, 공비 r을 바꾸며 부분합 Sₙ과 a/(1 − r), 남은 차이 비교 */
(() => {
  const root = document.getElementById("card-calc2-geo-series");
  if (!root) return;
  const { C, fit } = NM;
  const S = NMSeq, n = S.n;
  const $ = (s) => root.querySelector(s);
  const sa = $(".a"), sr = $(".r"), sn = $(".nn"), MAX = 30;
  const getR = () => Math.round(+sr.value * 100) / 100;
  const Sn = (a, r, k) => (r === 1 ? a * k : a * (1 - r ** k) / (1 - r));
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    const a = +sa.value, r = getR(), cur = +sn.value, conv = Math.abs(r) < 1, L = a / (1 - r);
    const vals = []; for (let k = 1; k <= MAX; k++) vals.push(Sn(a, r, k));
    let lo = Math.min(0, ...vals, conv ? L : 0), hi = Math.max(0, ...vals, conv ? L : 0);
    lo = Math.max(lo, -12); hi = Math.min(hi, 12);
    const pad = (hi - lo) * 0.08 || 1; lo -= pad; hi += pad;
    const g = S.frame(ctx, w, h, { xr: [0, MAX + 1], yr: [lo, hi], xt: [1, 10, 20, 30], yt: S.ticks(lo, hi, 4), L: 34, B: 22 });
    if (conv) {
      S.hline(ctx, g, L, C.forest);
      S.tag(ctx, `점선: a/(1 − r) = ${n(L, 4)}`, g.x0 + g.w - 4, g.y0 + g.h - 10, C.forest, "right");
      const s = Sn(a, r, cur);
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(g.X(cur), g.Y(s)); ctx.lineTo(g.X(cur), g.Y(L)); ctx.stroke();
    }
    vals.forEach((v, i) => S.dot(ctx, g, i + 1, v, conv ? C.forest : C.warn, i + 1 === cur ? 5 : 3, i + 1 !== cur));
  }

  function update() {
    const a = +sa.value, r = getR(), k = +sn.value, conv = Math.abs(r) < 1;
    $(".a-out").textContent = n(a); $(".r-out").textContent = n(r); $(".nn-out").textContent = String(k);
    $(".n-s").textContent = n(Sn(a, r, k), 6);
    const dl = $(".n-L"), dd = $(".n-d");
    if (conv) {
      dl.textContent = n(a / (1 - r), 6); dl.className = "n-L good";
      dd.textContent = n(Math.abs(a * r ** k / (1 - r)), 6);
    } else {
      dl.textContent = r >= 1 ? "발산 (∞)" : "발산 (진동)"; dl.className = "n-L bad"; dd.textContent = "—";
    }
    draw();
  }
  root.querySelectorAll(".presets .chip").forEach((b) => b.addEventListener("click", () => {
    const [a, r] = b.dataset.p.split(",");
    sa.value = a; sr.value = r; update();
  }));
  [sa, sr, sn].forEach((s) => s.addEventListener("input", update));
  update();
})();
