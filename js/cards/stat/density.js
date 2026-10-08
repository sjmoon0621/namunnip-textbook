/* 카드: 정확히 3분을 기다릴 확률은 얼마일까? — 확률밀도함수 아래 넓이 = 구간의 확률, 폭 0이면 확률 0 */
(() => {
  const root = document.getElementById("card-stat-density");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const S = NMStat;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".presets .chip")];
  const sa = $(".a"), sd = $(".d");
  const SHAPES = [
    { f: () => 0.1, F: (x) => x / 10 },
    { f: (x) => (10 - x) / 50, F: (x) => x / 5 - x * x / 100 },
  ];
  let k = 0;
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 40, y0 = 14, gw = w - x0 - 14, gh = h - y0 - 34;
    const X = (x) => x0 + x / 10 * gw, Y = (y) => y0 + (0.25 - y) / 0.25 * gh;
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [0, 2, 4, 6, 8, 10].map((v) => [v, String(v)]), yt: [0, 0.1, 0.2].map((v) => [v, S.short(v)]), xlabel: "기다리는 시간 x (분)" });
    const { f } = SHAPES[k], a = +sa.value, b = Math.min(10, a + +sd.value);
    ctx.fillStyle = C.sprout; ctx.beginPath(); ctx.moveTo(X(a), Y(0));
    for (let i = 0; i <= 60; i++) { const x = a + (b - a) * i / 60; ctx.lineTo(X(x), Y(f(x))); }
    ctx.lineTo(X(b), Y(0)); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.5; ctx.beginPath();
    ctx.moveTo(X(0), Y(0)); for (let i = 0; i <= 100; i++) ctx.lineTo(X(i / 10), Y(f(i / 10))); ctx.lineTo(X(10), Y(0)); ctx.stroke();
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2;
    [a, b].forEach((x) => { ctx.beginPath(); ctx.moveTo(X(x), Y(0)); ctx.lineTo(X(x), Y(f(x)) - 6); ctx.stroke(); });
    const p = SHAPES[k].F(b) - SHAPES[k].F(a), txt = `넓이 ${S.fmt(p, 3)}`;
    ctx.font = `600 12px ${F.sans}`; ctx.textBaseline = "middle";
    const tw = ctx.measureText(txt).width, cx = NM.clamp((X(a) + X(b)) / 2, x0 + tw / 2 + 2, x0 + gw - tw / 2 - 2), cy = Y(0.215);
    ctx.fillStyle = C.card; ctx.fillRect(cx - tw / 2 - 4, cy - 9, tw + 8, 18);
    ctx.fillStyle = C.warn; ctx.textAlign = "center"; ctx.fillText(txt, cx, cy);
    ctx.fillStyle = C.forest; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("y = f(x)", x0 + gw - 4, Y(f(9)) - 12);
  }

  function update() {
    const a = +sa.value, b = Math.min(10, a + +sd.value);
    $(".a-out").textContent = a.toFixed(1); $(".d-out").textContent = (b - a).toFixed(1);
    const p = SHAPES[k].F(b) - SHAPES[k].F(a);
    $(".d-p").textContent = `P(${S.short(a, 1)} ≤ X ≤ ${S.short(b, 1)})`;
    $(".n-p").textContent = S.fmt(p, 3);
    $(".n-f").textContent = S.fmt(SHAPES[k].f(a), 3);
    draw();
  }
  chips.forEach((b) => b.addEventListener("click", () => { k = +b.dataset.k; chips.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  [sa, sd].forEach((s) => s.addEventListener("input", update));
  update();
})();
