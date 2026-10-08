/* 카드: 100명에게 물으면 찬성 비율은 얼마나 흔들릴까? — 표본비율 p̂의 히스토그램과 N(p, pq/n) 곡선 */
(() => {
  const root = document.getElementById("card-stat-phat-dist");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const S = NMStat;
  const $ = (s) => root.querySelector(s), sp = $(".p"), chips = [...root.querySelectorAll(".presets .chip")];
  let n = 100, r = S.rng(29), ph = [];
  const { ctx, size } = fit($("canvas"), () => draw());
  const nice = (span, steps, max) => steps.find((s) => span / s <= max) || steps[steps.length - 1];

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = +sp.value, sd = Math.sqrt(p * (1 - p) / n);
    const cnt = new Array(n + 1).fill(0); ph.forEach((v) => { cnt[Math.round(v * n)]++; });
    const dens = cnt.map((c) => (ph.length ? c * n / ph.length : 0));
    const ym = Math.max(S.npdf(p, p, sd), ...dens) * 1.12;
    const x0 = 40, y0 = 12, gw = w - x0 - 12, gh = h - y0 - 34;
    const X = (v) => x0 + v * gw, Y = (v) => y0 + (ym - v) / ym * gh;
    const ys = nice(ym, [1, 2, 5, 10], 4), yt = [];
    for (let v = 0; v <= ym + 1e-9; v += ys) yt.push([v, String(v)]);
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [0, 0.2, 0.4, 0.6, 0.8, 1].map((v) => [v, S.short(v, 1)]), yt, xlabel: "p̂" });
    const bw = Math.max(1, gw / n * 0.8);
    ctx.fillStyle = C.sprout;
    cnt.forEach((c, i) => { if (c) ctx.fillRect(X(i / n) - bw / 2, Y(dens[i]), bw, Y(0) - Y(dens[i])); });
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let i = 0; i <= 400; i++) { const x = i / 400, y = Y(S.npdf(x, p, sd)); if (i) ctx.lineTo(X(x), y); else ctx.moveTo(X(x), y); }
    ctx.stroke();
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(X(p), y0); ctx.lineTo(X(p), y0 + gh); ctx.stroke(); ctx.setLineDash([]);
    const right = X(p) > x0 + gw - 60;
    ctx.fillStyle = C.warn; ctx.font = `600 11px ${F.mono}`; ctx.textBaseline = "top"; ctx.textAlign = right ? "right" : "left";
    ctx.fillText(`p = ${p.toFixed(2)}`, X(p) + (right ? -4 : 4), y0 + 2);
  }

  function update() {
    const p = +sp.value, c = ph.length, a = c ? ph.reduce((s, v) => s + v, 0) / c : 0;
    const sd = c ? Math.sqrt(ph.reduce((s, v) => s + (v - a) ** 2, 0) / c) : 0;
    $(".p-out").textContent = p.toFixed(2);
    $(".n-c").textContent = c;
    $(".n-a").textContent = c ? S.fmt(a, 4) : "—";
    $(".n-s").textContent = c > 1 ? S.fmt(sd, 4) : "—";
    $(".n-t").textContent = S.fmt(Math.sqrt(p * (1 - p) / n), 4);
    draw();
  }
  const run = (k) => {
    const p = +sp.value;
    for (let j = 0; j < k; j++) { let x = 0; for (let i = 0; i < n; i++) if (r() < p) x++; ph.push(x / n); }
    update();
  };
  chips.forEach((b) => b.addEventListener("click", () => {
    n = +b.dataset.n; ph = [];
    chips.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    run(200);
  }));
  $(".go-one").addEventListener("click", () => run(1));
  $(".go-100").addEventListener("click", () => run(100));
  $(".go-reset").addEventListener("click", () => { ph = []; update(); });
  sp.addEventListener("input", () => { ph = []; run(200); });
  run(200);
})();
