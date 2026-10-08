/* 카드: ∑끼리 더하고 곱해도 될까? — aₖ = k, bₖ = k 막대로 합·상수배·상수·곱의 성질 비교 */
(() => {
  const root = document.getElementById("card-alg-sigma-rules");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSeq;
  const $ = (s) => root.querySelector(s), btns = [...root.querySelectorAll(".presets .chip")];
  const sn = $(".n"), sc = $(".c");
  let mode = "add";
  const { ctx, size } = fit($("canvas"), () => draw());
  const sum = (f, n) => { let s = 0; for (let k = 1; k <= n; k++) s += f(k); return s; };
  const BL = "rgba(63,111,163,.3)", GR = "rgba(116,171,102,.35)";

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sn.value, c = +sc.value;
    /* 막대마다 [아래, 위, 색] 조각들 */
    const segs = (k) => mode === "add" ? [[0, k, GR, C.forest], [k, 2 * k, BL, S.BLUE]]
      : mode === "mul" ? [[0, c * k, GR, C.forest]]
      : mode === "const" ? [[0, c, BL, S.BLUE]]
      : [[0, k * k, GR, C.forest]];
    const all = []; for (let k = 1; k <= n; k++) segs(k).forEach((s) => all.push(s[0], s[1]));
    const lo = Math.min(0, ...all), hi = Math.max(1, ...all), pad = (hi - lo) * 0.1;
    const box = { x: 34, y: 12, w: w - 44, h: h - 36 };
    const G = S.frame(ctx, box, { x0: 0.5, x1: 6.5, y0: lo - (lo < 0 ? pad : 0), y1: hi + pad },
      { xt: [1, 2, 3, 4, 5, 6].map((k) => [k, `k=${k}`]), yt: S.ticks(lo, hi + pad, 4) });
    const bw = box.w / 6 * 0.6;
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = `600 11px ${F.mono}`;
    for (let k = 1; k <= n; k++) segs(k).forEach(([a, b, fill, line]) => {
      if (a === b) return;
      const y1 = G.Y(Math.max(a, b)), y2 = G.Y(Math.min(a, b));
      ctx.fillStyle = fill; ctx.fillRect(G.X(k) - bw / 2, y1, bw, y2 - y1);
      ctx.strokeStyle = line; ctx.lineWidth = 1.2; ctx.strokeRect(G.X(k) - bw / 2 + .5, y1 + .5, bw - 1, y2 - y1 - 1);
      if (y2 - y1 > 15) { ctx.fillStyle = C.ink; ctx.fillText(S.n(b - a), G.X(k), (y1 + y2) / 2); }
    });
    if (mode === "prod") {
      /* 곱의 막대 위에 (∑a)(∑b) 전체 넓이와 비교하는 글 */
      S.tag(ctx, `막대 합 ${sum((k) => k * k, n)}  vs  ${sum((k) => k, n)} × ${sum((k) => k, n)} = ${sum((k) => k, n) ** 2}`, box.x + 6, box.y + 10, C.warn, "left", 11);
    }
  }

  function update() {
    const n = +sn.value, c = +sc.value, A = sum((k) => k, n);
    $(".n-out").textContent = n; $(".c-out").textContent = S.n(c);
    sc.disabled = mode === "add" || mode === "prod";
    let law, dl, dr, L, Rv;
    const sg = "∑<sub><i>k</i>=1</sub><sup>" + n + "</sup>";
    if (mode === "add") { law = `${sg}(<i>k</i> + <i>k</i>) = ${sg}<i>k</i> + ${sg}<i>k</i>`; dl = "막대를 쌓은 전체"; dr = "∑a + ∑b"; L = sum((k) => 2 * k, n); Rv = A + A; }
    else if (mode === "mul") { law = `${sg}${c < 0 ? `(${S.n(c)})` : S.n(c)}<i>k</i> = ${S.n(c)} × ${sg}<i>k</i>`; dl = "∑ca"; dr = "c × ∑a"; L = sum((k) => c * k, n); Rv = c * A; }
    else if (mode === "const") { law = `${sg}${S.n(c)} = ${S.n(c)} × ${n}`; dl = "∑c"; dr = "c × n"; L = sum(() => c, n); Rv = c * n; }
    else { law = `${sg}<i>k</i> · <i>k</i> 와 (${sg}<i>k</i>)(${sg}<i>k</i>)`; dl = "∑ab"; dr = "(∑a)(∑b)"; L = sum((k) => k * k, n); Rv = A * A; }
    $(".law").innerHTML = law; $(".d-l").textContent = dl; $(".d-r").textContent = dr;
    $(".v-l").textContent = S.n(L); $(".v-r").textContent = S.n(Rv);
    const eq = $(".v-eq"); eq.textContent = L === Rv ? "같음" : "다름"; eq.className = `v-eq ${L === Rv ? "good" : "bad"}`;
    draw();
  }
  btns.forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  [sn, sc].forEach((s) => s.addEventListener("input", update));
  update();
})();
