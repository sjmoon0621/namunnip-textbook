/* 카드: 1, 2, 4, 8 다음은 꼭 16일까? — 다섯째 항을 끌면 다섯 점을 지나는 다항식 규칙과 여섯째 항이 바뀐다
   규칙: a_n = (n³ − 3n² + 8n)/6 + c(n−1)(n−2)(n−3)(n−4)/24, c = a₅ − 15 (a₁…a₄ = 1, 2, 4, 8은 그대로) */
(() => {
  const root = document.getElementById("card-alg-seq-guess");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const S = NMSeq;
  const $ = (s) => root.querySelector(s), btns = [...root.querySelectorAll(".presets .chip")];
  const sa = $(".a5"), cv = $("canvas");
  const R = { x0: 0.4, x1: 7.6, y0: -20, y1: 80 };
  const cubic = (x) => (x ** 3 - 3 * x * x + 8 * x) / 6;
  const rule = (x, c) => cubic(x) + c * (x - 1) * (x - 2) * (x - 3) * (x - 4) / 24;
  let G = null, drag = false;
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a5 = +sa.value, c = a5 - 15;
    const box = { x: 34, y: 10, w: w - 44, h: h - 34 };
    G = S.frame(ctx, box, R, { xt: [1, 2, 3, 4, 5, 6, 7].map((v) => [v, String(v)]), yt: S.ticks(R.y0, R.y1, 5) });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]); ctx.beginPath();
    for (let i = 0; i <= 240; i++) { const x = 0.7 + i / 240 * 6.6; (i ? ctx.lineTo : ctx.moveTo).call(ctx, G.X(x), G.Y(rule(x, c))); }
    ctx.stroke(); ctx.setLineDash([]);
    for (let k = 1; k <= 7; k++) { const v = 2 ** (k - 1); if (v <= R.y1) S.dot(ctx, G.X(k) + (k <= 4 ? 0 : 0), G.Y(v), 3.5, C.amber); }
    [1, 2, 4, 8].forEach((v, i) => S.dot(ctx, G.X(i + 1), G.Y(v), 5, C.forest));
    S.dot(ctx, G.X(5), G.Y(a5), drag ? 8 : 7, C.warn);
    [6, 7].forEach((k) => { const v = rule(k, c); if (v >= R.y0 && v <= R.y1) S.dot(ctx, G.X(k), G.Y(v), 5, C.ink2, true); });
    ctx.restore();
    S.tag(ctx, `a_5 = ${a5}`, G.X(5) - 10, G.Y(a5), C.warn, "right");
    const v6 = rule(6, c);
    if (v6 >= R.y0 && v6 <= R.y1) S.tag(ctx, `a_6 = ${S.n(v6)}`, G.X(6) - 10, G.Y(v6) + (v6 > 32 ? -12 : 12), C.ink2, "right");
    else S.tag(ctx, `a_6 = ${S.n(v6)} (그림 밖)`, box.x + box.w - 4, box.y + 10, C.ink2, "right");
  }

  function update() {
    const a5 = +sa.value, c = a5 - 15;
    $(".a5-out").textContent = a5;
    btns.forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.v === a5)));
    const cs = c === 0 ? "" : ` ${c < 0 ? "−" : "+"} ${Math.abs(c) === 1 ? "" : Math.abs(c)}(<i>n</i>−1)(<i>n</i>−2)(<i>n</i>−3)(<i>n</i>−4)/24`;
    $(".rule").innerHTML = `<i>a</i><sub><i>n</i></sub> = (<i>n</i><sup>3</sup> − 3<i>n</i><sup>2</sup> + 8<i>n</i>)/6${cs}`;
    $(".v-6").textContent = S.n(rule(6, c)); $(".v-7").textContent = S.n(rule(7, c));
    draw();
  }
  const setFrom = (e) => { const [, py] = S.local(cv, e); sa.value = clamp(Math.round(G.inY(py)), 8, 24); update(); };
  cv.addEventListener("pointerdown", (e) => {
    if (!G) return; const [px] = S.local(cv, e);
    if (Math.abs(px - G.X(5)) > 34) return;
    drag = true; cv.setPointerCapture(e.pointerId); setFrom(e);
  });
  cv.addEventListener("pointermove", (e) => { if (drag) setFrom(e); });
  const end = () => { if (drag) { drag = false; draw(); } };
  cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
  btns.forEach((b) => b.addEventListener("click", () => { sa.value = b.dataset.v; update(); }));
  sa.addEventListener("input", update);
  update();
})();
