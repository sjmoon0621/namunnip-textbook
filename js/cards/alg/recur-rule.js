/* 카드: 첫째항과 규칙만으로 수열이 정해질까? — a₁과 aₙ₊₁ = p·aₙ + q로 항을 하나씩 만든다 */
(() => {
  const root = document.getElementById("card-alg-recur-rule");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSeq;
  const $ = (s) => root.querySelector(s), ex = [...root.querySelectorAll(".ex .chip")];
  const sa = $(".a"), sp = $(".p"), sq = $(".q"), N = 8;
  let shown = 1;
  const { ctx, size } = fit($("canvas"), () => draw());
  const seq = () => { const p = +sp.value, q = +sq.value, v = [+sa.value]; for (let i = 1; i < N; i++) v.push(p * v[i - 1] + q); return v; };
  const sub = (k) => `<i>a</i><sub>${k}</sub>`;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const v = seq(), p = +sp.value, q = +sq.value, vis = v.slice(0, shown);
    let lo = Math.min(-1, ...v), hi = Math.max(1, ...v); const pad = (hi - lo) * 0.12;
    const box = { x: 36, y: 12, w: w - 46, h: h - 34 };
    const G = S.frame(ctx, box, { x0: 0.5, x1: N + 0.5, y0: lo - pad, y1: hi + pad }, { xt: v.map((_, i) => [i + 1, String(i + 1)]), yt: S.ticks(lo - pad, hi + pad, 4) });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
    for (let i = 1; i < shown; i++) {
      const x1 = G.X(i), y1 = G.Y(v[i - 1]), x2 = G.X(i + 1), y2 = G.Y(v[i]);
      ctx.strokeStyle = C.sprout; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x1 + 4, y1 - 4);
      ctx.quadraticCurveTo((x1 + x2) / 2, Math.min(y1, y2) - 20, x2 - 4, y2 - 5); ctx.stroke();
      S.arrow(ctx, x2 - 9, y2 - 9, x2 - 4, y2 - 5, C.leaf, 1.5);
    }
    vis.forEach((y, i) => S.dot(ctx, G.X(i + 1), G.Y(y), i === shown - 1 ? 6.5 : 4.5, i === 0 ? C.warn : i === shown - 1 ? S.BLUE : C.forest));
    for (let i = shown; i < N; i++) { ctx.fillStyle = C.ink3; ctx.font = `12px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("?", G.X(i + 1), G.Y((lo + hi) / 2)); }
    ctx.restore();
    if (shown > 1) {
      const i = shown - 1, op = `×${S.n(p)}${q ? (q > 0 ? " +" : " −") + S.n(Math.abs(q)) : ""}`;
      S.tag(ctx, op, (G.X(i) + G.X(i + 1)) / 2, Math.max(box.y + 10, Math.min(G.Y(v[i - 1]), G.Y(v[i])) - 22), C.forest, "center", 11);
    }
  }

  function update() {
    const v = seq(), p = +sp.value, q = +sq.value, a = +sa.value;
    $(".a-out").textContent = S.n(a); $(".p-out").textContent = S.n(p); $(".q-out").textContent = S.n(q);
    const pq = `${p === 1 ? "" : p === -1 ? "−" : S.n(p)}${sub("<i>n</i>")}${q ? ` ${q > 0 ? "+" : "−"} ${S.n(Math.abs(q))}` : ""}`;
    $(".rule").innerHTML = `${sub(1)} = ${S.n(a)},  ${sub("<i>n</i>+1")} = ${p === 0 ? S.n(q) : pq}`;
    $(".v-c").textContent = `${shown} / ${N}`;
    $(".v-l").innerHTML = shown > 1 ? `${sub(shown)} = ${S.n(p)} × ${v[shown - 2] < 0 ? `(${S.n(v[shown - 2])})` : S.n(v[shown - 2])} ${q < 0 ? "−" : "+"} ${S.n(Math.abs(q))} = ${S.n(v[shown - 1])}` : `${sub(1)} = ${S.n(a)}`;
    $(".v-k").textContent = p === 1 ? `등차수열 (공차 ${S.n(q)})` : q === 0 && p !== 0 && a !== 0 ? `등비수열 (공비 ${S.n(p)})` : p === 0 ? "둘째항부터 상수" : "등차도 등비도 아님";
    $(".msg").textContent = shown === 1 ? "첫째항만 있습니다. 관계식을 한 번 쓰면 둘째항이 생깁니다." : shown === N ? "관계식을 7번 써서 제8항까지 모두 정해졌습니다." : `관계식을 ${shown - 1}번 썼습니다.`;
    $(".go-step").disabled = $(".go-all").disabled = shown >= N;
    draw();
  }
  $(".go-step").addEventListener("click", () => { shown = Math.min(N, shown + 1); update(); });
  $(".go-all").addEventListener("click", () => { shown = N; update(); });
  $(".go-reset").addEventListener("click", () => { shown = 1; update(); });
  ex.forEach((b) => b.addEventListener("click", () => {
    const [a, p, q] = b.dataset.s.split(",").map(Number); sa.value = a; sp.value = p; sq.value = q; shown = 1;
    ex.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update();
  }));
  [sa, sp, sq].forEach((s) => s.addEventListener("input", () => { ex.forEach((x) => x.setAttribute("aria-pressed", "false")); update(); }));
  update();
})();
