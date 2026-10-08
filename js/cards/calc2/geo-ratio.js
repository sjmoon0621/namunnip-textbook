/* 카드: 공비 r에 따라 rⁿ은 어디로 갈까? — r을 바꾸며 rⁿ의 항을 찍고, 해 본 r을 수직선 위에 판정 색으로 남기기 */
(() => {
  const root = document.getElementById("card-calc2-geo-ratio");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSeq, n = S.n;
  const $ = (s) => root.querySelector(s);
  const sr = $(".r");
  const R0 = -1.6, R1 = 1.6, STRIP = 64;
  const visited = new Map();
  const getR = () => Math.round(+sr.value * 100) / 100;
  const kind = (r) => (r > 1 ? "pinf" : r === 1 ? "one" : r > -1 ? "zero" : "osc");
  const COL = { pinf: C.warn, one: C.amber, zero: C.forest, osc: C.ink2 };
  const TXT = { pinf: "양의 무한대로 발산", one: "1에 수렴", zero: "0에 수렴", osc: "진동 (발산)" };
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    const r = getR(), col = COL[kind(r)];
    const g = S.frame(ctx, w, h, { xr: [0, 31], yr: [-3, 3], xt: [1, 10, 20, 30], yt: [-3, -2, -1, 0, 1, 2, 3], L: 30, B: 22 + STRIP });
    for (let k = 1; k <= 30; k++) S.dot(ctx, g, k, r ** k, col, 3.2);
    S.tag(ctx, `r = ${n(r)}: ${TXT[kind(r)]}`, g.x0 + g.w - 4, g.y0 + 10, col, "right");
    const yl = h - 26, X = (v) => g.x0 + (v - R0) / (R1 - R0) * g.w;
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(g.x0, yl); ctx.lineTo(g.x0 + g.w, yl); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (const v of [-1.5, -1, -0.5, 0, 0.5, 1, 1.5]) {
      ctx.beginPath(); ctx.moveTo(X(v), yl - 4); ctx.lineTo(X(v), yl + 4); ctx.stroke();
      ctx.fillText(n(v), X(v), yl + 16);
    }
    ctx.textAlign = "left"; ctx.fillText("지금까지 해 본 r", g.x0, yl - 18);
    visited.forEach((kd, v) => { ctx.fillStyle = COL[kd]; ctx.beginPath(); ctx.arc(X(v), yl, 4, 0, 7); ctx.fill(); });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(r), yl, 7, 0, 7); ctx.stroke();
  }

  function update() {
    const r = getR(), kd = kind(r);
    visited.set(r, kd);
    $(".r-out").textContent = n(r);
    $(".n-10").textContent = n(r ** 10, 5); $(".n-30").textContent = n(r ** 30, 5);
    const dj = $(".n-j"); dj.textContent = TXT[kd]; dj.className = `n-j ${kd === "zero" || kd === "one" ? "good" : "bad"}`;
    draw();
  }
  root.querySelectorAll(".presets .chip").forEach((b) => b.addEventListener("click", () => { sr.value = b.dataset.r; update(); }));
  sr.addEventListener("input", update);
  update();
})();
