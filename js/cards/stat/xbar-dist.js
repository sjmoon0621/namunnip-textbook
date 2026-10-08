/* 카드: 표본을 크게 뽑으면 표본평균은 덜 흔들릴까? — N(300, 20²) 모집단에서 x̄를 쌓은 히스토그램과 N(m, σ²/n) 곡선 */
(() => {
  const root = document.getElementById("card-stat-xbar-dist");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const S = NMStat;
  const $ = (s) => root.querySelector(s), sn = $(".n");
  const M = 300, SG = 20, LO = 230, HI = 370; // g
  let r = S.rng(17), xs = [];
  const { ctx, size } = fit($("canvas"), () => draw());
  const nice = (span, steps, max) => steps.find((s) => span / s <= max) || steps[steps.length - 1];

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sn.value, se = SG / Math.sqrt(n);
    const bins = Math.round((HI - LO) / (se / 2.5)), bw = (HI - LO) / bins;
    const dens = S.counts(xs, LO, HI, bins).map((c) => (xs.length ? c / (xs.length * bw) : 0));
    const ym = Math.max(S.npdf(M, M, se), ...dens) * 1.12;
    const x0 = 46, y0 = 12, gw = w - x0 - 12, gh = h - y0 - 34;
    const X = (x) => x0 + (x - LO) / (HI - LO) * gw, Y = (y) => y0 + (ym - y) / ym * gh;
    const ys = nice(ym, [0.005, 0.01, 0.02, 0.05, 0.1], 4), yt = [];
    for (let v = 0; v <= ym + 1e-12; v += ys) yt.push([v, S.short(v, 3)]);
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [240, 270, 300, 330, 360].map((v) => [v, String(v)]), yt, xlabel: "x̄ (g)" });
    ctx.fillStyle = C.sprout;
    dens.forEach((d, i) => { if (d) ctx.fillRect(X(LO + i * bw) + 0.5, Y(d), Math.max(1, gw * bw / (HI - LO) - 1), Y(0) - Y(d)); });
    const curve = (sd) => {
      ctx.beginPath();
      for (let i = 0; i <= 300; i++) { const x = LO + (HI - LO) * i / 300, y = Y(S.npdf(x, M, sd)); if (i) ctx.lineTo(X(x), y); else ctx.moveTo(X(x), y); }
      ctx.stroke();
    };
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]); curve(SG); ctx.setLineDash([]);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.5; curve(se);
    if (xs.length) {
      const lx = X(Math.min(HI, Math.max(LO, xs[xs.length - 1]))), by = Y(0);
      ctx.fillStyle = C.warn; ctx.beginPath(); ctx.moveTo(lx, by - 1); ctx.lineTo(lx - 5, by - 10); ctx.lineTo(lx + 5, by - 10); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = C.forest; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(`N(300, ${S.short(SG * SG / n, 2)})`, x0 + 6, y0 + 2);
  }

  function update() {
    const n = +sn.value, c = xs.length, a = c ? xs.reduce((s, v) => s + v, 0) / c : 0;
    const sd = c ? Math.sqrt(xs.reduce((s, v) => s + (v - a) ** 2, 0) / c) : 0;
    $(".n-out").textContent = n;
    $(".n-c").textContent = c;
    $(".n-a").textContent = c ? S.fmt(a, 2) : "—";
    $(".n-s").textContent = c > 1 ? S.fmt(sd, 2) : "—";
    $(".n-t").textContent = S.fmt(SG / Math.sqrt(n), 2);
    draw();
  }
  const run = (k) => {
    const n = +sn.value;
    for (let j = 0; j < k; j++) { let s = 0; for (let i = 0; i < n; i++) s += M + SG * S.gauss(r); xs.push(s / n); }
    update();
  };
  $(".go-one").addEventListener("click", () => run(1));
  $(".go-100").addEventListener("click", () => run(100));
  $(".go-reset").addEventListener("click", () => { xs = []; update(); });
  sn.addEventListener("input", () => { xs = []; run(200); });
  run(200);
})();
