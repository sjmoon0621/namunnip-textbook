/* 카드: 1부터 100까지 더하는 빠른 방법은? — 등차수열 막대 n개에 거꾸로 뒤집은 한 벌을 붙여 직사각형 만들기 */
(() => {
  const root = document.getElementById("card-alg-arith-sum");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSeq;
  const $ = (s) => root.querySelector(s), flip = $(".go-flip");
  const sa = $(".a"), sd = $(".d"), sn = $(".n");
  const { ctx, size } = fit($("canvas"), () => draw());
  const vals = () => { const a = +sa.value, d = +sd.value, n = +sn.value; return Array.from({ length: n }, (_, i) => a + i * d); };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const v = vals(), n = v.length, top = v[0] + v[n - 1], on = flip.getAttribute("aria-pressed") === "true";
    const box = { x: 34, y: 26, w: w - 44, h: h - 50 };
    const G = S.frame(ctx, box, { x0: 0.5, x1: n + 0.5, y0: 0, y1: top * 1.05 }, { xt: v.map((_, i) => [i + 1, String(i + 1)]), yt: S.ticks(0, top * 1.05, 4) });
    const bw = box.w / n * 0.72, fs = bw < 26 ? 10 : 11.5;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    v.forEach((x, i) => {
      const cx = G.X(i + 1), l = cx - bw / 2;
      ctx.fillStyle = C.sprout; ctx.fillRect(l, G.Y(x), bw, G.Y(0) - G.Y(x));
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1; ctx.strokeRect(l + .5, G.Y(x) + .5, bw - 1, G.Y(0) - G.Y(x) - 1);
      ctx.font = `600 ${fs}px ${F.mono}`; ctx.fillStyle = C.ink;
      if (G.Y(0) - G.Y(x) > 16) ctx.fillText(S.n(x), cx, (G.Y(x) + G.Y(0)) / 2);
      if (on) {
        const y = v[n - 1 - i];
        ctx.fillStyle = "rgba(63,111,163,.28)"; ctx.fillRect(l, G.Y(x + y), bw, G.Y(x) - G.Y(x + y));
        ctx.strokeStyle = S.BLUE; ctx.strokeRect(l + .5, G.Y(x + y) + .5, bw - 1, G.Y(x) - G.Y(x + y) - 1);
        ctx.fillStyle = S.BLUE; if (G.Y(x) - G.Y(x + y) > 16) ctx.fillText(S.n(y), cx, (G.Y(x) + G.Y(x + y)) / 2);
      }
    });
    if (on) {
      ctx.setLineDash([5, 3]); ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6;
      ctx.strokeRect(G.X(1) - bw / 2, G.Y(top), G.X(n) - G.X(1) + bw, G.Y(0) - G.Y(top)); ctx.setLineDash([]);
      S.tag(ctx, `가로 ${n} × 세로 ${S.n(top)} = ${S.n(n * top)} = 2S_${n}`, box.x + box.w / 2, G.Y(top) - 12, C.warn, "center");
    } else S.tag(ctx, `S_${n} = ${v.map(S.n).join(" + ")}`.slice(0, 60), box.x + 2, 12, C.forest, "left", 11);
  }

  function update() {
    const a = +sa.value, d = +sd.value;
    sn.max = d < 0 ? Math.min(10, a) : 10;
    if (+sn.value > +sn.max) sn.value = sn.max;
    const v = vals(), n = v.length, s = v.reduce((p, q) => p + q, 0), top = v[0] + v[n - 1];
    $(".a-out").textContent = a; $(".d-out").textContent = S.n(d); $(".n-out").textContent = n;
    $(".v-s").textContent = S.n(s); $(".v-p").textContent = S.n(top); $(".v-f").textContent = S.n(n * top / 2);
    draw();
  }
  flip.addEventListener("click", () => { flip.setAttribute("aria-pressed", String(flip.getAttribute("aria-pressed") !== "true")); draw(); });
  [sa, sd, sn].forEach((s) => s.addEventListener("input", update));
  update();
})();
