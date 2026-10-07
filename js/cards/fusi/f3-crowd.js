/* 카드: 전문가가 아닌 사람 여럿이 모이면 믿을 만한 과학 자료가 될까? — 시민 분류의 다수결과 가중 합의 (모식) */
(() => {
  const root = document.getElementById("card-fusi-crowd");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sP = $(".p"), sQ = $(".q"), sK = $(".k"), cB = $(".bias");
  const HARD = 0.15, PH = 0.35, KMAX = 41;
  let wmode = 0;
  const kOf = (v) => 2 * v + 1;
  const lgam = (n) => { let s = 0; for (let i = 2; i <= n; i++) s += Math.log(i); return s; };
  const binom = (n, j, p) => Math.exp(lgam(n) - lgam(j) - lgam(n - j) + j * Math.log(Math.max(p, 1e-12)) + (n - j) * Math.log(Math.max(1 - p, 1e-12)));
  const maj = (n, p) => { if (n === 0) return 0.5; let s = 0; for (let j = 0; j <= n; j++) { const b = binom(n, j, p); if (2 * j > n) s += b; else if (2 * j === n) s += b / 2; } return s; };
  function acc(k, p, q, w) {
    if (!w) return maj(k, (1 - q) * p + q * 0.5);
    let s = 0; for (let m = 0; m <= k; m++) s += binom(k, m, 1 - q) * maj(m, p); return s;
  }
  const total = (k, p, q, w, bias) => bias ? (1 - HARD) * acc(k, p, q, w) + HARD * acc(k, PH, q, w) : acc(k, p, q, w);
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = +sP.value / 100, q = +sQ.value / 100, k = kOf(+sK.value), bias = cB.checked;
    /* 왼쪽: 은하 100개 시뮬레이션 */
    let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const gs = Math.min((w * 0.42) / 10, (h - 30) / 10), gx0 = 8, gy0 = 22;
    let wrong = 0;
    ctx.fillStyle = C.ink; ctx.font = `bold 11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("은하 100개의 합의 결과", gx0, 13);
    for (let i = 0; i < 100; i++) {
      const spiral = rnd() < 0.5, hard = bias && rnd() < HARD, pp = hard ? PH : p;
      let v = 0;
      for (let j = 0; j < k; j++) {
        const careless = rnd() < q, ok = careless ? rnd() < 0.5 : rnd() < pp;
        if (wmode && careless) continue;
        v += ok ? 1 : -1;
      }
      const right = v > 0 || (v === 0 && rnd() < 0.5);
      if (!right) wrong++;
      const cx = gx0 + (i % 10 + 0.5) * gs, cy = gy0 + (Math.floor(i / 10) + 0.5) * gs, r = gs * 0.36;
      ctx.fillStyle = right ? "#1c1e1b" : "#5a1f14"; ctx.fillRect(cx - gs / 2 + 1, cy - gs / 2 + 1, gs - 2, gs - 2);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(i * 0.7);
      if (spiral) {
        ctx.strokeStyle = "rgba(160,200,255,.9)"; ctx.lineWidth = 1.2;
        for (const s of [0, Math.PI]) { ctx.beginPath(); for (let t = 0; t <= 1; t += 0.05) { const a = s + t * 3.2, rr = r * (0.15 + 0.85 * t); t ? ctx.lineTo(rr * Math.cos(a), rr * Math.sin(a)) : ctx.moveTo(rr * Math.cos(a), rr * Math.sin(a)); } ctx.stroke(); }
        ctx.fillStyle = "#fff6d8"; ctx.beginPath(); ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2); ctx.fill();
      } else {
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, "rgba(255,236,190,1)"); g.addColorStop(1, "rgba(255,200,140,0)");
        ctx.fillStyle = g; ctx.scale(1, 0.65); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      if (!right) { ctx.strokeStyle = "#ff6b4a"; ctx.lineWidth = 2; ctx.strokeRect(cx - gs / 2 + 2, cy - gs / 2 + 2, gs - 4, gs - 4); }
    }
    ctx.fillStyle = C.warn; ctx.font = `11px ${F.sans}`; ctx.fillText(`빨간 테두리: 틀린 합의 ${wrong}개`, gx0, gy0 + 10 * gs + 14);
    /* 오른쪽: 분류 횟수에 따른 정확도 */
    const x0 = gx0 + 10 * gs + 44, x1 = w - 12, y0 = 22, y1 = h - 34;
    if (x1 - x0 < 80) return;
    const X = (n) => x0 + (n - 1) / (KMAX - 1) * (x1 - x0), Y = (a) => y1 - (a - 0.5) / 0.5 * (y1 - y0);
    NM.axes(ctx, { x0, y0, w: x1 - x0, h: y1 - y0, X, Y, xt: [1, 11, 21, 31, 41].map((n) => [n, String(n)]), yt: [0.5, 0.6, 0.7, 0.8, 0.9, 1].map((a) => [a, `${Math.round(a * 100)}%`]), xlabel: "은하 한 개를 분류한 사람 수", ylabel: "합의 정확도" });
    const curve = (wm, col, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); for (let n = 1; n <= KMAX; n += 2) { const px = X(n), py = Y(total(n, p, q, wm, bias)); n === 1 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); } ctx.stroke(); };
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x0, Y(0.95)); ctx.lineTo(x1, Y(0.95)); ctx.stroke(); ctx.setLineDash([]);
    curve(0, wmode ? "rgba(63,111,163,.35)" : "#3f6fa3", wmode ? 1.4 : 2.4);
    curve(1, wmode ? C.forest : "rgba(59,124,42,.35)", wmode ? 2.4 : 1.4);
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(k), Y(total(k, p, q, wmode, bias)), 5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillStyle = "#3f6fa3"; ctx.fillText("━ 단순 다수결", x1 - 4, y1 - 22);
    ctx.fillStyle = C.forest; ctx.fillText("━ 신뢰도 가중", x1 - 4, y1 - 8);
    ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("95 %", x0 + 4, Y(0.95) - 4);
  }
  function update() {
    root.querySelectorAll("[data-w]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.w === wmode)));
    const p = +sP.value / 100, q = +sQ.value / 100, k = kOf(+sK.value), bias = cB.checked;
    $(".p-out").textContent = sP.value; $(".q-out").textContent = sQ.value; $(".k-out").textContent = k;
    $(".n-a").textContent = `${(total(k, p, q, wmode, bias) * 100).toFixed(1)} %`;
    const one = (1 - q) * p + q * 0.5;
    $(".n-1").textContent = `${((bias ? (1 - HARD) * one + HARD * ((1 - q) * PH + q * 0.5) : one) * 100).toFixed(1)} %`;
    $(".n-n").textContent = `${(0.9 * k).toFixed(1)}백만 번`;
    draw();
  }
  root.querySelectorAll("[data-w]").forEach((b) => b.addEventListener("click", () => { wmode = +b.dataset.w; update(); }));
  [sP, sQ, sK].forEach((s) => s.addEventListener("input", update)); cB.addEventListener("change", update);
  if (NMLab.demo) sK.value = 2;
  update();
})();
