/* 카드: 심해파와 천해파의 속도 공식은 어디까지 맞을까? — 분산 관계 ω² = gk tanh(kh), 입자 궤도, 군속도 */
(() => {
  const root = document.getElementById("card-adearth-dispersion");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sL = $(".sl-l"), sH = $(".sl-h");
  const g = 9.81;
  let phase = 0;
  const fmtLen = (x) => x >= 10000 ? `${(x / 1000).toFixed(0)} km` : x >= 1000 ? `${(x / 1000).toFixed(1)} km` : x >= 10 ? `${x.toFixed(0)} m` : `${x.toFixed(1)} m`;
  const fmtV = (v) => v >= 100 ? `${v.toFixed(0)} m/s` : v >= 10 ? `${v.toFixed(1)} m/s` : `${v.toFixed(2)} m/s`;
  const fmtT = (t) => t >= 120 ? `${(t / 60).toFixed(1)} min` : `${t.toFixed(1)} s`;
  const state = () => {
    const L = 10 ** +sL.value, h = 10 ** +sH.value, k = 2 * Math.PI / L, kh = k * h;
    const th = Math.tanh(kh), c = Math.sqrt(g / k * th), cd = Math.sqrt(g / k), cs = Math.sqrt(g * h);
    const n = kh > 30 ? 0.5 : 0.5 * (1 + 2 * kh / Math.sinh(2 * kh));
    return { L, h, k, kh, c, cd, cs, n, T: L / c };
  };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h: H } = size; if (!w) return;
    const s = state();
    ctx.clearRect(0, 0, w, H);
    /* 위: 입자 궤도 */
    const top = 22, bot = H * 0.47, x0 = 14, x1 = w - 14;
    const deepView = s.h > 0.6 * s.L;
    const D = deepView ? 0.6 * s.L : s.h;
    ctx.fillStyle = "rgba(63,111,163,.10)"; ctx.fillRect(x0, top + 10, x1 - x0, bot - top - 10);
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(`한 파장(${fmtLen(s.L)}) 구간 · 세로 ${fmtLen(D)} (가로·세로 축척 다름)`, x0, top - 6);
    /* 해수면 */
    const amp = 8, Xp = (f) => x0 + f * (x1 - x0), surfY = top + 22;
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const f = i / 120, y = surfY - amp * Math.cos(2 * Math.PI * f - phase); i ? ctx.lineTo(Xp(f), y) : ctx.moveTo(Xp(f), y); }
    ctx.stroke();
    /* 바닥 */
    const floorY = bot - 4;
    if (!deepView) { ctx.fillStyle = "#c9b48a"; ctx.fillRect(x0, floorY, x1 - x0, 6); }
    else { ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("바닥은 훨씬 아래", x1 - 4, floorY - 4); }
    /* 궤도 */
    const rows = 5, cols = 6, R0 = Math.min(14, (x1 - x0) / cols / 2.4);
    const sh = Math.sinh(Math.min(s.kh, 30)), deep = s.kh > 15;
    for (let r = 0; r < rows; r++) {
      const zf = r / (rows - 1) * 0.92;
      const z = -zf * D, y = surfY + 12 + zf * (floorY - surfY - 26);
      let a, b;
      if (deep) { a = b = Math.exp(s.k * z); }
      else { a = Math.cosh(s.k * (z + s.h)) / sh; b = Math.sinh(s.k * (z + s.h)) / sh; const a0 = Math.cosh(s.kh) / sh; a /= a0; b /= a0; }
      for (let c = 0; c < cols; c++) {
        const f = (c + 0.5) / cols, cx = 52 + f * (x1 - 52), th = 2 * Math.PI * f - phase;
        ctx.strokeStyle = "rgba(35,35,38,.35)"; ctx.lineWidth = 1; ctx.beginPath();
        ctx.ellipse(cx, y, Math.max(a * R0, 0.6), Math.max(b * R0, 0.3), 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(cx + a * R0 * Math.sin(th), y - b * R0 * Math.cos(th), 2.4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left";
      ctx.fillText(`−${fmtLen(zf * D)}`, x0 + 2, y + 3);
    }
    /* 아래: c / √(gL/2π) 대 h/L */
    const gx0 = 46, gx1 = w - 14, gy0 = H - 34, gy1 = bot + 40;
    const lmin = -3, lmax = 2, X = (r) => gx0 + (Math.log10(r) - lmin) / (lmax - lmin) * (gx1 - gx0), Y = (v) => gy0 - v / 1.2 * (gy0 - gy1);
    ctx.fillStyle = "rgba(224,160,42,.10)"; ctx.fillRect(X(0.05), gy1, X(0.5) - X(0.05), gy0 - gy1);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("천해파", (gx0 + X(0.05)) / 2, gy1 - 6); ctx.fillText("중간 수심파", (X(0.05) + X(0.5)) / 2, gy1 - 6); ctx.fillText("심해파", (X(0.5) + gx1) / 2, gy1 - 6);
    NM.axes(ctx, { x0: gx0, y0: gy1, w: gx1 - gx0, h: gy0 - gy1, X, Y,
      xt: [[0.001, "0.001"], [0.01, "0.01"], [0.05, "1/20"], [0.5, "1/2"], [10, "10"], [100, "100"]],
      yt: [[0, "0"], [0.5, "0.5"], [1, "1"]], xlabel: "수심 / 파장  h/L" });
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("c ÷ √(gL/2π)", gx0 + 4, gy1 + 12);
    const curve = (fn, col, dash) => {
      ctx.strokeStyle = col; ctx.lineWidth = dash ? 1.4 : 2.2; ctx.setLineDash(dash ? [5, 4] : []); ctx.beginPath(); let first = true;
      for (let i = 0; i <= 200; i++) { const r = 10 ** (lmin + i / 200 * (lmax - lmin)), v = fn(2 * Math.PI * r); if (v > 1.2) { first = true; continue; } const px = X(r), py = Y(v); first ? ctx.moveTo(px, py) : ctx.lineTo(px, py); first = false; }
      ctx.stroke(); ctx.setLineDash([]);
    };
    curve(() => 1, C.amber, true);
    curve((kh) => Math.sqrt(kh), C.forest, true);
    curve((kh) => Math.sqrt(Math.tanh(kh)), "#3f6fa3", false);
    const r = s.h / s.L;
    if (r >= 10 ** lmin && r <= 10 ** lmax) {
      ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(X(r), Y(Math.sqrt(Math.tanh(s.kh))), 5, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = C.apple; ctx.textAlign = r < 1 ? "left" : "right"; ctx.font = `10.5px ${F.sans}`;
      ctx.fillText(r < 1 ? "◀ 범위 밖" : "범위 밖 ▶", r < 1 ? gx0 + 4 : gx1 - 4, gy0 - 8);
    }
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = "#3f6fa3"; ctx.fillText("— 정확한 값", X(1.2), Y(0.82));
    ctx.fillStyle = C.forest; ctx.fillText("- - 천해파 근사", X(1.2), Y(0.70));
    ctx.fillStyle = "#b07a10"; ctx.fillText("- - 심해파 근사", X(1.2), Y(0.58));
  }
  function update() {
    const s = state();
    $(".l-out").textContent = fmtLen(s.L); $(".h-out").textContent = fmtLen(s.h);
    const err = (v) => { const e = (v / s.c - 1) * 100; if (Math.abs(e) < 0.05) return ""; if (e >= 100) return ` (${(v / s.c).toFixed(1)}배)`; return ` (${e > 0 ? "+" : ""}${e.toFixed(1)}%)`; };
    $(".n-c").textContent = fmtV(s.c);
    $(".n-d").textContent = fmtV(s.cd) + err(s.cd);
    $(".n-s").textContent = fmtV(s.cs) + err(s.cs);
    $(".n-t").textContent = fmtT(s.T);
    const r = s.h / s.L;
    $(".n-r").textContent = r >= 0.01 ? r.toFixed(3) : r.toExponential(1);
    $(".n-k").textContent = r > 0.5 ? "심해파" : r < 0.05 ? "천해파" : "중간 수심파";
    $(".n-g").textContent = s.n.toFixed(2);
    draw();
  }
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => {
    const [L, h] = b.dataset.p.split(",").map(Number);
    sL.value = Math.log10(L); sH.value = Math.log10(h);
    root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    update();
  }));
  [sL, sH].forEach((el) => el.addEventListener("input", () => { root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", "false")); update(); }));
  loop(cv, (dt) => { if (NM.reduce) return false; phase += dt * Math.PI; draw(); });
  update();
})();
