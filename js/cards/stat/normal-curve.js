/* 카드: 평균과 표준편차만으로 종 모양이 정해질까? — N(m, σ²) 곡선, 최댓값 1/(σ√2π), m ± kσ 안의 넓이 */
(() => {
  const root = document.getElementById("card-stat-normal-curve");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const S = NMStat;
  const $ = (s) => root.querySelector(s), sm = $(".m"), ss = $(".s"), chips = [...root.querySelectorAll(".presets .chip")];
  const LO = 10, HI = 110, YM = 0.105;
  let k = 1;
  const { ctx, size } = fit($("canvas"), () => draw());
  const area = (a, b, m, s) => { let t = 0; const N = 400, dx = (b - a) / N; for (let i = 0; i < N; i++) t += S.npdf(a + (i + 0.5) * dx, m, s) * dx; return t; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = +sm.value, s = +ss.value, x0 = 44, y0 = 12, gw = w - x0 - 12, gh = h - y0 - 24;
    const X = (x) => x0 + (x - LO) / (HI - LO) * gw, Y = (y) => y0 + (YM - y) / YM * gh;
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [20, 40, 60, 80, 100].map((v) => [v, String(v)]), yt: [0, 0.05, 0.1].map((v) => [v, S.short(v, 2)]) });
    const a = Math.max(LO, m - k * s), b = Math.min(HI, m + k * s);
    ctx.fillStyle = C.sprout; ctx.beginPath(); ctx.moveTo(X(a), Y(0));
    for (let i = 0; i <= 120; i++) { const x = a + (b - a) * i / 120; ctx.lineTo(X(x), Y(S.npdf(x, m, s))); }
    ctx.lineTo(X(b), Y(0)); ctx.fill();
    const curve = (mm, sd) => { ctx.beginPath(); for (let i = 0; i <= 300; i++) { const x = LO + (HI - LO) * i / 300, y = Y(S.npdf(x, mm, sd)); if (i) ctx.lineTo(X(x), y); else ctx.moveTo(X(x), y); } ctx.stroke(); };
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]); curve(60, 10); ctx.setLineDash([]);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.5; curve(m, s);
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(m), Y(0)); ctx.lineTo(X(m), Y(S.npdf(m, m, s))); ctx.stroke();
    ctx.font = `600 11.5px ${F.sans}`; ctx.textBaseline = "middle"; ctx.textAlign = "center";
    const p = area(m - k * s, m + k * s, m, s), txt = S.fmt(p, 4), tw = ctx.measureText(txt).width, ty = Y(S.npdf(m, m, s) * 0.35);
    ctx.fillStyle = C.card; ctx.fillRect(X(m) - tw / 2 - 4, ty - 9, tw + 8, 18);
    ctx.fillStyle = C.ink; ctx.fillText(txt, X(m), ty);
    ctx.fillStyle = C.warn; ctx.font = `600 11px ${F.mono}`; ctx.fillText(`m = ${m}`, X(m), Math.max(y0 + 6, Y(S.npdf(m, m, s)) - 10));
  }

  function update() {
    const m = +sm.value, s = +ss.value;
    $(".m-out").textContent = m; $(".s-out").textContent = s.toFixed(1);
    $(".n-h").textContent = S.fmt(1 / (s * Math.sqrt(2 * Math.PI)), 4);
    $(".d-p").textContent = `P(m − ${k === 1 ? "" : k}σ ≤ X ≤ m + ${k === 1 ? "" : k}σ)`;
    $(".n-p").textContent = S.fmt(area(m - k * s, m + k * s, m, s), 4);
    draw();
  }
  chips.forEach((b) => b.addEventListener("click", () => { k = +b.dataset.k; chips.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  [sm, ss].forEach((x) => x.addEventListener("input", update));
  update();
})();
