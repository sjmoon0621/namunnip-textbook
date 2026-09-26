/* 카드: 행성의 공전 주기와 거리 사이에는 어떤 규칙이 있을까? — 실제 궤도 자료로 케플러 제3법칙, 중심 천체의 질량 구하기 */
(() => {
  const root = document.getElementById("card-mech-kepler");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), nK = $(".n-k"), nM = $(".n-m"), nReal = $(".n-real");
  const G = 6.674e-11, AU = 1.496e11, YR = 3.156e7, DAY = 86400;
  // 긴반지름, 주기 (NASA 행성 자료 / 갈릴레이 위성)
  const SETS = {
    sun: { name: "태양", unitA: "AU", unitT: "년", a2m: AU, t2s: YR, realM: 1.989e30,
      pts: [["수성", 0.387, 0.241], ["금성", 0.723, 0.615], ["지구", 1.0, 1.0], ["화성", 1.524, 1.881], ["목성", 5.203, 11.86], ["토성", 9.537, 29.46], ["천왕성", 19.19, 84.01], ["해왕성", 30.07, 164.8]] },
    jup: { name: "목성", unitA: "만 km", unitT: "일", a2m: 1e7, t2s: DAY, realM: 1.898e27,
      pts: [["이오", 42.17, 1.769], ["유로파", 67.10, 3.551], ["가니메데", 107.04, 7.155], ["칼리스토", 188.27, 16.69]] },
  };
  let set = "sun", ax = "lin";

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const S = SETS[set], pts = S.pts;
    const fx = ax === "log" ? (a) => Math.log10(a) : ax === "cube" ? (a) => a ** 3 : (a) => a;
    const fy = ax === "log" ? (t) => Math.log10(t) : ax === "cube" ? (t) => t ** 2 : (t) => t;
    const xs = pts.map((p) => fx(p[1])), ys = pts.map((p) => fy(p[2]));
    let x0 = Math.min(0, ...xs), x1 = Math.max(...xs), y0 = Math.min(0, ...ys), y1 = Math.max(...ys);
    if (ax === "log") { x0 = Math.floor(Math.min(...xs)); x1 = Math.ceil(Math.max(...xs)); y0 = Math.floor(Math.min(...ys)); y1 = Math.ceil(Math.max(...ys)); }
    const px0 = 56, py0 = h - 42, pw = w - px0 - 20, ph = h - 70;
    const X = (x) => px0 + (x - x0) / (x1 - x0 || 1) * pw, Y = (y) => py0 - (y - y0) / (y1 - y0 || 1) * ph;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px0, py0 - ph); ctx.lineTo(px0, py0); ctx.lineTo(px0 + pw, py0); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3;
    const ticks = (lo, hi) => { if (ax === "log") { const r = []; for (let k = lo; k <= hi; k++) r.push(k); return r; } const step = 10 ** Math.floor(Math.log10((hi - lo) / 4 || 1)); const n = Math.ceil((hi - lo) / step / 5) * step; const r = []; for (let v = 0; v <= hi + 1e-9; v += n) r.push(v); return r; };
    const lab = (v) => ax === "log" ? `10${["⁻²","⁻¹","⁰","¹","²","³","⁴","⁵","⁶"][v + 2] ?? v}` : v >= 1e4 ? v.toExponential(0) : `${+v.toFixed(2)}`;
    ctx.textAlign = "center"; ticks(x0, x1).forEach((v) => { ctx.fillText(lab(v), X(v), py0 + 14); ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(X(v), py0); ctx.lineTo(X(v), py0 - ph); ctx.stroke(); });
    ctx.textAlign = "right"; ticks(y0, y1).forEach((v) => { ctx.fillText(lab(v), px0 - 5, Y(v) + 3); ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(px0, Y(v)); ctx.lineTo(px0 + pw, Y(v)); ctx.stroke(); });
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "right";
    ctx.fillText(ax === "cube" ? `a³ (${S.unitA}³)` : `궤도 반지름 a (${S.unitA})`, px0 + pw, py0 + 30);
    ctx.textAlign = "left"; ctx.fillText(ax === "cube" ? `T² (${S.unitT}²)` : `공전 주기 T (${S.unitT})`, px0 + 4, py0 - ph - 8);
    // 이론 곡선: T = k a^1.5 (k는 자료 평균)
    const k = Math.sqrt(pts.reduce((s, p) => s + p[2] ** 2 / p[1] ** 3, 0) / pts.length);
    ctx.strokeStyle = "rgba(59,124,42,.7)"; ctx.lineWidth = 1.6; ctx.beginPath();
    const amin = Math.min(...pts.map((p) => p[1])) * 0.8, amax = Math.max(...pts.map((p) => p[1])) * 1.05;
    for (let i = 0; i <= 100; i++) { const a = amin * (amax / amin) ** (i / 100), t = k * a ** 1.5; const X_ = X(fx(a)), Y_ = Y(fy(t)); if (Y_ < py0 - ph - 4) break; i ? ctx.lineTo(X_, Y_) : ctx.moveTo(X_, Y_); }
    ctx.stroke();
    pts.forEach(([n, a, t]) => {
      const x = X(fx(a)), y = Y(fy(t));
      ctx.fillStyle = set === "sun" ? "#e0a02a" : "#caa47c"; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.ink; ctx.font = `11px ${F.sans}`; const right = x > w - 60; ctx.textAlign = right ? "right" : "left"; ctx.fillText(n, x + (right ? -7 : 7), y - 5);
    });
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(ax === "log" ? "초록 선: 기울기 3/2인 직선" : ax === "cube" ? "초록 선: 원점을 지나는 직선" : "초록 선: T ∝ a^(3/2)", px0 + 8, py0 - ph + 12);
  }
  function update() {
    const S = SETS[set];
    const ratio = S.pts.reduce((s, p) => s + (p[2] * S.t2s) ** 2 / (p[1] * S.a2m) ** 3, 0) / S.pts.length;   // s²/m³
    const M = 4 * Math.PI ** 2 / (G * ratio);
    const rUnits = S.pts.reduce((s, p) => s + p[2] ** 2 / p[1] ** 3, 0) / S.pts.length;
    nK.textContent = `${rUnits.toPrecision(3)} ${S.unitT}²/${S.unitA}³`;
    nM.textContent = `${(M / 10 ** Math.floor(Math.log10(M))).toFixed(2)} × 10^${Math.floor(Math.log10(M))} kg`;
    nReal.textContent = `${S.name} ${(S.realM / 10 ** Math.floor(Math.log10(S.realM))).toFixed(2)} × 10^${Math.floor(Math.log10(S.realM))} kg`;
    root.querySelectorAll("[data-set]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.set === set)));
    root.querySelectorAll("[data-ax]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.ax === ax)));
    draw();
  }
  root.querySelectorAll("[data-set]").forEach((b) => b.addEventListener("click", () => { set = b.dataset.set; update(); }));
  root.querySelectorAll("[data-ax]").forEach((b) => b.addEventListener("click", () => { ax = b.dataset.ax; update(); }));
  update();
})();
