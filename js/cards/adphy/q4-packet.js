/* 카드: 파동 묶음 — 파수 분포의 폭과 위치의 폭, Δx·Δk ≥ 1/2 */
(() => {
  const root = document.getElementById("card-adphy-packet");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sS = $(".s"), oS = $(".s-out");
  const nX = $(".n-x"), nK = $(".n-k"), nP = $(".n-p"), nV = $(".n-v"), nN = $(".n-n");
  const K0 = 2 * Math.PI / 0.5, XW = 8, NX = 1601;
  let mode = "g", res = null;
  /* 성분 목록: [k, 진폭] */
  function comps() {
    const s = +sS.value, out = [];
    if (mode === "two") return [[K0 - s, 1], [K0 + s, 1]];
    const half = mode === "g" ? 4 * s : Math.sqrt(6) * s * 1.0, M = 241;
    for (let i = 0; i < M; i++) {
      const k = K0 - half + 2 * half * i / (M - 1);
      const a = mode === "g" ? Math.exp(-((k - K0) ** 2) / (4 * s * s)) : Math.max(0, 1 - Math.abs(k - K0) / half);
      out.push([k, a]);
    }
    return out;
  }
  function compute() {
    const cs = comps(), re = new Float64Array(NX), im = new Float64Array(NX);
    for (let j = 0; j < NX; j++) {
      const x = -XW + 2 * XW * j / (NX - 1); let r = 0, q = 0;
      for (const [k, a] of cs) { r += a * Math.cos(k * x); q += a * Math.sin(k * x); }
      re[j] = r; im[j] = q;
    }
    let n = 0, m1 = 0, m2 = 0, amax = 0;
    for (let j = 0; j < NX; j++) { const x = -XW + 2 * XW * j / (NX - 1), p = re[j] ** 2 + im[j] ** 2; n += p; m1 += p * x; m2 += p * x * x; amax = Math.max(amax, Math.sqrt(p)); }
    const dx = Math.sqrt(Math.max(0, m2 / n - (m1 / n) ** 2));
    let wn = 0, k1 = 0, k2 = 0; for (const [k, a] of cs) { wn += a * a; k1 += a * a * k; k2 += a * a * k * k; }
    const dk = Math.sqrt(Math.max(0, k2 / wn - (k1 / wn) ** 2));
    res = { cs, re, im, dx, dk, amax };
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w || !res) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 34, x1 = w - 12, X = (x) => x0 + (x + XW) / (2 * XW) * (x1 - x0);
    /* 위: 파동 묶음 */
    const ay = h * 0.24, aH = h * 0.18;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, ay); ctx.lineTo(x1, ay); ctx.stroke();
    const A = res.amax;
    ctx.fillStyle = "rgba(116,171,102,.25)"; ctx.beginPath(); ctx.moveTo(X(-XW), ay);
    for (let j = 0; j < NX; j += 2) { const x = -XW + 2 * XW * j / (NX - 1); ctx.lineTo(X(x), ay - Math.hypot(res.re[j], res.im[j]) / A * aH); }
    for (let j = NX - 1; j >= 0; j -= 2) { const x = -XW + 2 * XW * j / (NX - 1); ctx.lineTo(X(x), ay + Math.hypot(res.re[j], res.im[j]) / A * aH); }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let j = 0; j < NX; j++) { const x = -XW + 2 * XW * j / (NX - 1), y = ay - res.re[j] / A * aH; j ? ctx.lineTo(X(x), y) : ctx.moveTo(X(x), y); }
    ctx.stroke();
    if (mode !== "two") {
      ctx.strokeStyle = C.amber; ctx.lineWidth = 2; const yb = ay + aH + 8;
      ctx.beginPath(); ctx.moveTo(X(-res.dx), yb); ctx.lineTo(X(res.dx), yb); ctx.stroke();
      ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("±Δx", X(res.dx) + 5, yb + 4);
    }
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("파동 묶음 Re ψ(x)와 |ψ| (초록) · x 단위 nm", x0, 14);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    for (let x = -8; x <= 8; x += 4) ctx.fillText(`${x}`, X(x), ay + aH + 26);
    /* 가운데: 성분 파동 몇 개 */
    const by = h * 0.6, cs = res.cs, pick = cs.length <= 2 ? cs : [0.3, 0.42, 0.5, 0.58, 0.7].map((f) => cs[Math.round(f * (cs.length - 1))]);
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(cs.length <= 2 ? "더한 성분 파동 2개" : `더한 성분 ${cs.length}개 중 5개`, x0, by - 46);
    pick.forEach(([k, a], i) => {
      const yy = by - 30 + i * (cs.length <= 2 ? 30 : 14), amp = 6 * a / Math.max(...cs.map((c) => c[1]));
      ctx.strokeStyle = ["#3f6fa3", "#5b8cc0", "#232326", "#c06b5b", "#d7263d"][cs.length <= 2 ? i * 4 : i]; ctx.globalAlpha = 0.75; ctx.lineWidth = 1; ctx.beginPath();
      for (let j = 0; j <= 600; j++) { const x = -XW + 2 * XW * j / 600, y = yy - amp * Math.cos(k * x); j ? ctx.lineTo(X(x), y) : ctx.moveTo(X(x), y); }
      ctx.stroke(); ctx.globalAlpha = 1;
    });
    /* 아래: 파수 분포 */
    const cy0 = h * 0.74, cy1 = h - 26, kx0 = x0, kx1 = x1, KR = 14;
    const KX = (k) => kx0 + (k - K0 + KR) / (2 * KR) * (kx1 - kx0);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(kx0, cy1); ctx.lineTo(kx1, cy1); ctx.stroke();
    const amax = Math.max(...cs.map((c) => c[1] * c[1]));
    ctx.fillStyle = "#3f6fa3";
    const bw = cs.length <= 2 ? 4 : Math.max(1, (KX(cs[1][0]) - KX(cs[0][0])) * 0.8);
    cs.forEach(([k, a]) => { const hh = a * a / amax * (cy1 - cy0); if (k > K0 - KR && k < K0 + KR) ctx.fillRect(KX(k) - bw / 2, cy1 - hh, bw, hh); });
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("파수 분포 |φ(k)|² · k 단위 nm⁻¹, p = ħk", x0, cy0 - 8);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    for (let d = -12; d <= 12; d += 6) ctx.fillText(d ? `k₀${d > 0 ? "+" : "−"}${Math.abs(d)}` : "k₀", KX(K0 + d), cy1 + 14);
  }
  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === mode)));
    oS.textContent = (+sS.value).toFixed(2);
    compute();
    nK.textContent = `${res.dk.toFixed(2)} nm⁻¹`; nN.textContent = res.cs.length;
    if (mode === "two") { nX.textContent = "정해지지 않음"; nP.textContent = "—"; }
    else { nX.textContent = `${res.dx.toFixed(3)} nm`; nP.textContent = (res.dx * res.dk).toFixed(2); }
    nV.textContent = `${(1.158e5 * res.dk / 1000).toFixed(0)} km/s`;
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; update(); }));
  sS.addEventListener("input", update);
  update();
})();
