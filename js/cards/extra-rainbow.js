/* 카드: 물방울 어디에 들어간 빛이 무지개를 만들까? — 빛의 길과 되돌아 나오는 각 */
(() => {
  const root = document.getElementById("card-extra-rainbow");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const [cvDrop, cvPlot] = root.querySelectorAll("canvas");
  const sB = $(".b"), oB = $(".b-out"), dI = $(".ii"), dR = $(".rr"), dA = $(".aa");
  let n = 1.331, many = false;
  const deg = (x) => x * 180 / Math.PI;
  // 높이 b에서 들어간 빛이 되돌아 나오는 각 (= 180° − 편향각)
  function back(b, nn) { const i = Math.asin(b), r = Math.asin(b / nn); return 180 - deg(Math.PI + 2 * i - 4 * r); }
  // 물방울 안의 빛의 길: 들어간 점, 반사점, 나간 점, 나간 방향
  function path(b, nn) {
    const i = Math.asin(b), r = Math.asin(b / nn), arc = Math.PI - 2 * r;
    const f1 = Math.PI - i, f2 = f1 - arc, f3 = f2 - arc;
    const P = (f) => [Math.cos(f), Math.sin(f)];
    const D = Math.PI + 2 * i - 4 * r; // 시계 방향으로 돈 각
    return { p1: P(f1), p2: P(f2), p3: P(f3), dir: [Math.cos(-D), Math.sin(-D)] };
  }
  const VD = fit(cvDrop, () => drawDrop());
  const VP = fit(cvPlot, () => drawPlot());
  function ray(ctx, b, X, Y, alpha) {
    const { p1, p2, p3, dir } = path(b, n);
    ctx.strokeStyle = n < 1.337 ? `rgba(200,50,40,${alpha})` : `rgba(110,60,200,${alpha})`;
    ctx.beginPath(); ctx.moveTo(X(-1.9), Y(b)); ctx.lineTo(X(p1[0]), Y(p1[1]));
    ctx.lineTo(X(p2[0]), Y(p2[1])); ctx.lineTo(X(p3[0]), Y(p3[1]));
    ctx.lineTo(X(p3[0] + 2.2 * dir[0]), Y(p3[1] + 2.2 * dir[1])); ctx.stroke();
  }
  function drawDrop() {
    const { ctx, size: { w, h } } = VD; if (!w) return;
    const s = Math.min(w, h) / 4.4, cx = w * 0.55, cy = h * 0.42;
    const X = (x) => cx + x * s, Y = (y) => cy - y * s;
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath(); ctx.arc(cx, cy, s, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(47,109,176,.12)"; ctx.fill(); ctx.strokeStyle = C.ink3; ctx.stroke();
    ctx.lineWidth = 1;
    if (many) for (let b = 0.04; b < 1; b += 0.04) ray(ctx, b, X, Y, 0.35);
    ctx.lineWidth = 2; ray(ctx, +sB.value, X, Y, 1); ctx.lineWidth = 1;
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("햇빛 →", 4, Y(+sB.value) - 5);
  }
  function drawPlot() {
    const { ctx, size: { w, h } } = VP; if (!w) return;
    const padL = 34, padR = 8, padT = 14, padB = 30, pw = w - padL - padR, ph = h - padT - padB;
    const X = (b) => padL + b * pw, Y = (a) => padT + (1 - a / 45) * ph;
    ctx.clearRect(0, 0, w, h);
    NM.axes(ctx, { x0: padL, y0: padT, w: pw, h: ph, X, Y,
      xt: [[0, "0"], [0.5, "0.5"], [1, "1"]], yt: [[0, "0°"], [20, "20°"], [40, "40°"]],
      xlabel: "들어간 높이", ylabel: "되돌아 나오는 각" });
    for (const [nn, col] of [[1.331, "rgba(200,50,40,.9)"], [1.343, "rgba(110,60,200,.9)"]]) {
      ctx.beginPath();
      for (let k = 0; k <= 200; k++) { const b = k / 200 * 0.999, a = back(b, nn); k ? ctx.lineTo(X(b), Y(a)) : ctx.moveTo(X(b), Y(a)); }
      ctx.strokeStyle = col; ctx.lineWidth = nn === n ? 2 : 1; ctx.stroke(); ctx.lineWidth = 1;
    }
    const b = +sB.value;
    ctx.beginPath(); ctx.arc(X(b), Y(back(b, n)), 5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
  }
  function update() {
    const b = +sB.value; oB.textContent = b.toFixed(2);
    dI.textContent = `${deg(Math.asin(b)).toFixed(1)}°`;
    dR.textContent = `${deg(Math.asin(b / n)).toFixed(1)}°`;
    const a = back(b, n);
    let best = 0; for (let k = 0; k < 1000; k++) best = Math.max(best, back(k / 1000, n));
    dA.textContent = `${a.toFixed(1)}°`;
    dA.classList.toggle("good", best - a < 0.3);
    drawDrop(); drawPlot();
  }
  sB.addEventListener("input", update);
  root.querySelectorAll("[data-n]").forEach((bt) => bt.addEventListener("click", () => {
    n = +bt.dataset.n;
    root.querySelectorAll("[data-n]").forEach((x) => x.setAttribute("aria-pressed", x === bt ? "true" : "false"));
    update();
  }));
  $("[data-act=many]").addEventListener("click", (e) => {
    many = !many; e.currentTarget.setAttribute("aria-pressed", many ? "true" : "false"); drawDrop();
  });
  update();
})();
