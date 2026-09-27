/* 카드: 전자를 하나씩 쏘아도 간섭무늬가 생길까? — |ψ1+ψ2|² 에서 무작위 표본 */
(() => {
  const root = document.getElementById("card-emq-single-photon");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sN = $(".n"), oN = $(".n-out"), nK = $(".n-k");
  let mode = "both";
  const M = 400;
  function pdf(x) { // x: -1..1 (스크린 위치)
    const env = Math.exp(-(x * x) / 0.35), k = 26, a = Math.cos(k * x / 2);
    const s1 = Math.exp(-((x - 0.06) ** 2) / 0.33), s2 = Math.exp(-((x + 0.06) ** 2) / 0.33);
    if (mode === "both") return env * a * a;
    if (mode === "which") return (s1 + s2) / 2 * 0.5;
    return s1 * 0.5;
  }
  let seed = 3; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  function samples(n) { seed = 11 + (mode === "which" ? 5 : mode === "one" ? 9 : 0); const cdf = [], xs = []; let s = 0; for (let i = 0; i < M; i++) { const x = -1 + 2 * (i + 0.5) / M; s += pdf(x); cdf.push(s); xs.push(x); } const out = []; for (let j = 0; j < n; j++) { const u = rnd() * s; let lo = 0, hi = M - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (cdf[m] < u) lo = m + 1; else hi = m; } out.push([xs[lo] + (rnd() - 0.5) * 2 / M, rnd()]); } return out; }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = Math.round(10 ** +sN.value) - 1, pts = samples(Math.max(0, n)), x0 = 14, x1 = w - 14, X = (x) => x0 + (x + 1) / 2 * (x1 - x0);
    // 스크린
    const sy0 = 10, sy1 = h * 0.52; ctx.fillStyle = "#101418"; ctx.fillRect(x0, sy0, x1 - x0, sy1 - sy0);
    const r = n > 2000 ? 1 : n > 300 ? 1.4 : 2.2; ctx.fillStyle = "rgba(160,230,140,.85)";
    pts.forEach(([x, v]) => { ctx.beginPath(); ctx.arc(X(x), sy0 + 4 + v * (sy1 - sy0 - 8), r, 0, Math.PI * 2); ctx.fill(); });
    // 막대그래프
    const B = 60, hist = new Array(B).fill(0); pts.forEach(([x]) => { const b = Math.min(B - 1, Math.max(0, Math.floor((x + 1) / 2 * B))); hist[b]++; });
    const gy0 = h - 20, gy1 = sy1 + 16, mx = Math.max(1, ...hist); const bw = (x1 - x0) / B;
    ctx.fillStyle = "rgba(63,111,163,.55)"; hist.forEach((c, i) => { const hh = c / mx * (gy0 - gy1); ctx.fillRect(x0 + i * bw + 0.5, gy0 - hh, bw - 1, hh); });
    // 확률 곡선
    let pm = 0; for (let i = 0; i < M; i++) pm = Math.max(pm, pdf(-1 + 2 * i / M));
    if (n > 30) { ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.beginPath(); for (let i = 0; i <= M; i++) { const x = -1 + 2 * i / M, y = gy0 - pdf(x) / pm * (gy0 - gy1) * (Math.max(...hist) / mx); i ? ctx.lineTo(X(x), y) : ctx.moveTo(X(x), y); } ctx.stroke(); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, gy0); ctx.lineTo(x1, gy0); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("위치별로 센 전자 수" + (n > 30 ? " · 빨간 선: 확률 분포" : ""), x0, gy0 + 13);
  }
  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === mode)));
    const n = Math.round(10 ** +sN.value) - 1; oN.textContent = Math.max(0, n).toLocaleString();
    nK.textContent = n < 50 ? "아직 무작위 점처럼 보임" : mode === "both" ? "간섭무늬 (밝고 어두운 줄)" : mode === "which" ? "간섭무늬 사라짐 — 두 봉우리를 더한 넓은 분포" : "한 슬릿의 회절 무늬 하나";
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; update(); }));
  sN.addEventListener("input", update); update();
})();
