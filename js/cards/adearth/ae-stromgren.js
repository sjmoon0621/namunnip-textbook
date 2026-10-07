/* 카드: O형 별 하나는 얼마나 넓은 성운을 밝힐 수 있을까? — 광전리 평형과 스트룀그렌 구 (1차원 수치 적분) */
(() => {
  const root = document.getElementById("card-adearth-stromgren");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sN = $(".n"), oN = $(".n-out"), sK = $(".k"), oK = $(".k-out");
  const dRs = $(".n-rs"), dDr = $(".n-dr"), dM = $(".n-m"), dT = $(".n-t");
  const AB = 2.6e-13, SIG = 6.3e-18, PC = 3.086e18, AU = 1.496e13, MH = 1.6726e-24, MSUN = 1.989e33, YR = 3.156e7;
  let logQ = 48.63;
  const { ctx, size } = fit(cv, () => draw());
  let prof = null, Rs = 0;

  /* 중심에서 바깥으로 남은 광자 수 Q(r)를 줄여 가며 국소 평형 (1−x)σQ/(4πr²) = x² n α_B 를 푼다 */
  function solve(Q0, n) {
    Rs = Math.cbrt(3 * Q0 / (4 * Math.PI * n * n * AB));
    const out = []; let Q = Q0, r = Rs * 1e-3;
    const coarse = Rs / 4000, mfp = 1 / (n * SIG);
    while (r < 1.6 * Rs) {
      const a = Q > 0 ? SIG * Q / (4 * Math.PI * r * r * n * AB) : 0;
      const x = a > 0 ? (a > 1e6 ? 1 - 1 / a : (-a + Math.sqrt(a * a + 4 * a)) / 2) : 0;
      const neu = a > 1e6 ? Math.max(1 / a, 1e-12) : 1 - x;
      out.push([r, neu]);
      const dr = Q < 0.03 * Q0 ? Math.min(coarse, 0.05 * mfp / Math.max(neu, 1e-3)) : coarse;
      Q -= 4 * Math.PI * r * r * n * n * x * x * AB * dr;
      if (Q <= 0) { Q = 0; out.push([r, 1]); out.push([1.6 * Rs, 1]); break; }
      r += dr;
    }
    return out;
  }
  const fmt = (v) => v >= 100 ? Math.round(v).toLocaleString() : v >= 10 ? v.toFixed(1) : v >= 1 ? v.toFixed(2) : v.toPrecision(2);
  const sup = (e) => String(e).replace(/-/g, "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);

  function draw() {
    const { w, h } = size; if (!w || !prof) return;
    ctx.clearRect(0, 0, w, h);
    /* 왼쪽: 성운 그림 */
    const S = Math.min(h - 22, w * 0.46), lx = 6, ly = 4, cx = lx + S / 2, cy = ly + S / 2;
    const rspc = Rs / PC;
    let field = 10 ** Math.ceil(Math.log10(rspc * 2.6));
    if (field / 2 > rspc * 2.6) field /= 2;
    const sc = S / field;
    ctx.fillStyle = "#151714"; ctx.fillRect(lx, ly, S, S);
    ctx.save(); ctx.beginPath(); ctx.rect(lx, ly, S, S); ctx.clip();
    /* 분자운 얼룩 (모식, 고정 무늬) */
    for (let i = 0; i < 40; i++) {
      const a = i * 2.39996, rr = S * (0.15 + 0.55 * ((i * 37) % 17) / 17);
      ctx.fillStyle = "rgba(90,70,60,.10)"; ctx.beginPath(); ctx.arc(cx + rr * Math.cos(a), cy + rr * Math.sin(a), S * 0.18, 0, Math.PI * 2); ctx.fill();
    }
    const R = rspc * sc;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(R, 1));
    g.addColorStop(0, "rgba(255,170,190,.95)"); g.addColorStop(0.85, "rgba(220,60,90,.75)"); g.addColorStop(1, "rgba(200,40,70,.9)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, Math.max(R, 1), 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,210,150,.9)"; ctx.lineWidth = 1.2; ctx.stroke();
    const k = +sK.value;
    ctx.fillStyle = "#cfe6ff";
    for (let i = 0; i < k; i++) { const a = i * 2.39996, rr = k === 1 ? 0 : Math.min(R * 0.25, S * 0.04) * Math.sqrt(i / k); ctx.beginPath(); ctx.arc(cx + rr * Math.cos(a), cy + rr * Math.sin(a), 2.2, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    /* 축척 막대 */
    const bar = field / 5;
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx + 8, ly + S - 10); ctx.lineTo(lx + 8 + bar * sc, ly + S - 10); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`${fmt(bar)} pc`, lx + 8, ly + S - 15);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.fillText("성운 (모식)", lx, ly + S + 14);

    /* 오른쪽: 중성 비율 */
    const gx0 = lx + S + 46, gx1 = w - 10, gy0 = 18, gy1 = h - 30, gw = gx1 - gx0, gh = gy1 - gy0;
    const rmax = 1.6 * rspc;
    const X = (r) => gx0 + r / rmax * gw, Y = (lg) => gy0 + (0 - lg) / 7 * gh;
    const xt = []; const step = 10 ** Math.floor(Math.log10(rmax / 3)); const st = rmax / step > 12 ? step * 5 : rmax / step > 6 ? step * 2 : step;
    for (let v = 0; v <= rmax + 1e-9; v += st) xt.push([v, String(+v.toPrecision(3))]);
    NM.axes(ctx, { x0: gx0, y0: gy0, w: gw, h: gh, X, Y, xt, yt: [[0, "1"], [-2, "10⁻²"], [-4, "10⁻⁴"], [-6, "10⁻⁶"]], xlabel: "별에서의 거리 (pc)", ylabel: "중성 수소의 비율" });
    ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(rspc), gy0); ctx.lineTo(X(rspc), gy1); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("R_s", X(rspc) - 4, gy1 - 22);
    ctx.save(); ctx.beginPath(); ctx.rect(gx0, gy0 - 2, gw, gh + 4); ctx.clip();
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath();
    let lastPx = -1;
    prof.forEach(([r, f], i) => { const px = X(r / PC), py = Y(Math.max(-7, Math.log10(Math.max(f, 1e-9)))); if (i && px - lastPx < 0.3 && i < prof.length - 3) return; lastPx = px; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
    ctx.stroke(); ctx.restore();
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("전리 영역", gx0 + 6, gy1 - 8);
    ctx.textAlign = "right"; ctx.fillText("중성 기체", gx1 - 2, gy0 + 14);
  }

  function update() {
    root.querySelectorAll("[data-q]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.q === logQ)));
    const n = 10 ** +sN.value, k = +sK.value, Q = k * 10 ** logQ;
    oN.textContent = n >= 10 ? Math.round(n).toLocaleString() : n.toFixed(1); oK.textContent = k;
    prof = solve(Q, n);
    const rspc = Rs / PC;
    dRs.textContent = `${fmt(rspc)} pc`;
    /* 중성 비율이 10⁻³→0.9로 바뀌는 구간 */
    let a = null, b = null; for (const [r, f] of prof) { if (a === null && f > 0.1 && r > 0.5 * Rs) a = r; if (b === null && f > 0.9 && r > 0.5 * Rs) b = r; }
    const dr = a !== null && b !== null ? Math.max(b - a, 1 / (n * SIG) * 0.5) : 1 / (n * SIG);
    dDr.textContent = dr / AU >= 1e4 ? `${(dr / PC).toPrecision(2)} pc` : `${fmt(dr / AU)} AU`;
    const m = 4 / 3 * Math.PI * Rs ** 3 * n * MH / MSUN;
    dM.textContent = m >= 1e4 ? `${(m / 10 ** Math.floor(Math.log10(m))).toFixed(1)}×10${sup(Math.floor(Math.log10(m)))} M☉` : `${fmt(m)} M☉`;
    const t = 1 / (n * AB) / YR;
    dT.textContent = `${fmt(t)} 년`;
    draw();
  }
  root.querySelectorAll("[data-q]").forEach((b) => b.addEventListener("click", () => { logQ = +b.dataset.q; update(); }));
  sN.addEventListener("input", update); sK.addEventListener("input", update);
  update();
})();
