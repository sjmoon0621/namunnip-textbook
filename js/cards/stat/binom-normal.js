/* 카드: 시행 횟수가 많아지면 이항분포는 어떤 모양에 가까워질까? — B(n, p) 막대와 N(np, npq) 곡선, P(X ≤ k)의 정확한 값과 정규근사 */
(() => {
  const root = document.getElementById("card-stat-binom-normal");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const S = NMStat;
  const $ = (s) => root.querySelector(s), sn = $(".n"), sp = $(".p");
  const { ctx, size } = fit($("canvas"), () => draw());
  const nice = (span, steps, max) => steps.find((s) => span / s <= max) || steps[steps.length - 1];

  function state() {
    const n = +sn.value, p = +sp.value, m = n * p, s = Math.sqrt(n * p * (1 - p));
    return { n, p, m, s, d: S.binom(n, p), k: Math.floor(m + s + 1e-9) };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { n, m, s, d, k } = state();
    let lo = Math.max(0, Math.floor(m - 4 * s)), hi = Math.min(n, Math.ceil(m + 4 * s));
    while (hi - lo < 8 && (lo > 0 || hi < n)) { if (lo > 0) lo--; if (hi < n) hi++; }
    const ym = Math.max(...d, S.npdf(m, m, s)) * 1.12;
    const x0 = 42, y0 = 12, gw = w - x0 - 12, gh = h - y0 - 34;
    const X = (x) => x0 + (x - lo + 0.5) / (hi - lo + 1) * gw, Y = (y) => y0 + (ym - y) / ym * gh;
    const xs = nice(hi - lo, [1, 2, 5, 10, 20, 25, 50], 8), ys = nice(ym, [0.02, 0.05, 0.1, 0.2], 5);
    const xt = []; for (let v = Math.ceil(lo / xs) * xs; v <= hi; v += xs) xt.push([v, String(v)]);
    const yt = []; for (let v = 0; v <= ym + 1e-9; v += ys) yt.push([v, S.short(v, 2)]);
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt, yt, xlabel: "X" });
    const bw = Math.max(1, gw / (hi - lo + 1) * 0.78);
    for (let x = lo; x <= hi; x++) {
      ctx.fillStyle = x <= k ? C.leaf : C.sprout;
      ctx.fillRect(X(x) - bw / 2, Y(d[x]), bw, Y(0) - Y(d[x]));
    }
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let i = 0; i <= 240; i++) {
      const x = lo - 0.5 + (hi - lo + 1) * i / 240, y = Y(S.npdf(x, m, s));
      if (i) ctx.lineTo(X(x), y); else ctx.moveTo(X(x), y);
    }
    ctx.stroke();
    const kx = X(k);
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(kx, y0); ctx.lineTo(kx, y0 + gh); ctx.stroke(); ctx.setLineDash([]);
    const right = kx > x0 + gw - 50;
    ctx.fillStyle = C.warn; ctx.font = `600 11px ${F.mono}`; ctx.textBaseline = "top"; ctx.textAlign = right ? "right" : "left";
    ctx.fillText(`k = ${k}`, kx + (right ? -4 : 4), y0 + 2);
  }

  function update() {
    const { n, p, m, s, d, k } = state();
    $(".n-out").textContent = n; $(".p-out").textContent = p.toFixed(2);
    let ex = 0; for (let x = 0; x <= k; x++) ex += d[x];
    $(".n-m").textContent = S.short(m, 2);
    $(".n-s").textContent = S.fmt(s, 3);
    $(".d-ex").textContent = `P(X ≤ ${k})`;
    $(".n-ex").textContent = S.fmt(ex, 4);
    $(".n-ap").textContent = S.fmt(S.ncdf((k - m) / s), 4);
    draw();
  }
  [sn, sp].forEach((x) => x.addEventListener("input", update));
  update();
})();
