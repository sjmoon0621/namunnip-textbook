/* 카드: 많이 던질수록 비율은 확률에 다가갈까? — 상대도수 X/n의 경로(로그 눈금)와 P(|X/n − p| < 0.05)의 정확한 값 */
(() => {
  const root = document.getElementById("card-stat-large-numbers");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const S = NMStat;
  const $ = (s) => root.querySelector(s), sp = $(".p");
  const H = 0.05, MAXN = 20000;
  let r = S.rng(31), path = [], x = 0;
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = +sp.value, n = path.length, top = Math.max(2, Math.ceil(Math.log10(Math.max(n, 10))));
    const x0 = 38, y0 = 12, gw = w - x0 - 14, gh = h - y0 - 34;
    const X = (k) => x0 + Math.log10(k) / top * gw, Y = (v) => y0 + (1 - v) * gh;
    const xt = []; for (let e = 0; e <= top; e++) xt.push([Math.pow(10, e), e < 4 ? String(Math.pow(10, e)) : `10^${e}`]);
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt, yt: [0, 0.25, 0.5, 0.75, 1].map((v) => [v, S.short(v, 2)]), xlabel: "시행 횟수 n" });
    ctx.globalAlpha = 0.55; ctx.fillStyle = C.sprout; ctx.fillRect(x0, Y(Math.min(1, p + H)), gw, Y(Math.max(0, p - H)) - Y(Math.min(1, p + H))); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5; ctx.setLineDash([5, 3]); ctx.beginPath(); ctx.moveTo(x0, Y(p)); ctx.lineTo(x0 + gw, Y(p)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.forest; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillText(`p ± ${H}`, x0 + 6, Y(Math.min(1, p + H)) - 4 < y0 + 10 ? Y(Math.max(0, p - H)) + 13 : Y(Math.min(1, p + H)) - 4);
    if (!n) return;
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.8; ctx.beginPath();
    let last = 0;
    for (let k = 1; k <= n; k++) {
      const px = X(k);
      if (k !== n && k > 30 && px - last < 0.8) continue;
      const py = Y(path[k - 1]);
      if (k === 1) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      last = px;
    }
    ctx.stroke();
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(n), Y(path[n - 1]), 4, 0, 7); ctx.fill();
  }

  function inBand(n, p) {
    const d = S.binom(n, p); let s = 0;
    d.forEach((v, k) => { if (Math.abs(k / n - p) < H - 1e-12) s += v; });
    return s;
  }
  function update() {
    const p = +sp.value, n = path.length;
    $(".p-out").textContent = p.toFixed(2);
    $(".n-n").textContent = n;
    $(".n-f").textContent = n ? S.fmt(path[n - 1], 4) : "—";
    $(".n-d").textContent = n ? S.fmt(Math.abs(path[n - 1] - p), 4) : "—";
    $(".n-q").textContent = n ? S.fmt(inBand(n, p), 4) : "—";
    draw();
  }
  const run = (k) => {
    const p = +sp.value;
    for (let i = 0; i < k && path.length < MAXN; i++) { if (r() < p) x++; path.push(x / (path.length + 1)); }
    update();
  };
  const reset = () => { path = []; x = 0; };
  $(".go-10").addEventListener("click", () => run(10));
  $(".go-100").addEventListener("click", () => run(100));
  $(".go-1000").addEventListener("click", () => run(1000));
  $(".go-reset").addEventListener("click", () => { reset(); update(); });
  sp.addEventListener("input", () => { reset(); run(200); });
  run(200);
})();
