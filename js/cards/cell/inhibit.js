/* 카드: 기질을 더 넣으면 저해제를 이길 수 있을까? — 미하엘리스–멘텐 + 경쟁적(Km 증가)·비경쟁적(Vmax 감소) 저해 */
(() => {
  const root = document.getElementById("card-cell-inhibit");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sS = $(".s"), sI = $(".i"), oS = $(".s-out"), oKm = $(".s-km"), oI = $(".i-out");
  const nV = $(".n-v"), nR = $(".n-r"), nES = $(".n-es");
  const KM = 2, KI = 1;
  let mode = "comp";
  function st(m, S, I) {
    if (m === "none" || I === 0) { const es = S / (KM + S); return { v: es, es, ei: 0 }; }
    if (m === "comp") { const d = 1 + S / KM + I / KI; return { v: (S / KM) / d, es: (S / KM) / d, ei: (I / KI) / d }; }
    const fi = (I / KI) / (1 + I / KI), fs = S / (KM + S);
    return { v: (1 - fi) * fs, es: fs, ei: fi };   // es: 기질이 붙은 비율(저해제가 함께 붙은 것 포함)
  }
  const COL = { S: "#3b7c2a", Ic: "#b5532f", In: "#8a4fb0", E: "#d8d2bf" };

  function enzyme(ctx, x, y, r, hasS, hasI) {
    // 효소: 원에 삼각형 홈(활성 부위, 위쪽). 비경쟁적 저해제가 붙으면 홈이 비틀림
    const twist = hasI === "non" ? 0.35 : 0;
    ctx.fillStyle = COL.E; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2;
    ctx.beginPath();
    const a0 = -Math.PI / 2 - 0.42 + twist, a1 = -Math.PI / 2 + 0.42 + twist;
    ctx.arc(x, y, r, a1, a0 + Math.PI * 2);
    ctx.lineTo(x + Math.cos(-Math.PI / 2 + twist) * r * 0.35, y + Math.sin(-Math.PI / 2 + twist) * r * 0.35);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // 알로스테릭 자리 (아래)
    ctx.fillStyle = C.paper; ctx.beginPath(); ctx.rect(x - r * 0.22, y + r * 0.72, r * 0.44, r * 0.3); ctx.fill();
    if (hasI === "non") { ctx.fillStyle = COL.In; ctx.fillRect(x - r * 0.2, y + r * 0.74, r * 0.4, r * 0.36); }
    const tip = [x, y - r * 0.35], L = r * 0.72;
    const tri = (col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(tip[0], tip[1] - 2); ctx.lineTo(tip[0] - L * 0.42, tip[1] - L); ctx.lineTo(tip[0] + L * 0.42, tip[1] - L); ctx.closePath(); ctx.fill(); };
    if (hasS) tri(COL.S);
    if (hasI === "comp") { tri(COL.Ic); ctx.fillStyle = COL.Ic; ctx.fillRect(tip[0] - 3, tip[1] - L - 7, 6, 7); }
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const S = +sS.value, I = mode === "none" ? 0 : +sI.value, s = st(mode, S, I);
    // 효소 8개
    const n = 8, r = Math.min(20, (w - 40) / n / 2.6), y = 58;
    let nS, nI;
    if (mode === "non") { nI = Math.round(s.ei * n); nS = Math.round(s.es * n); }
    else { nI = Math.round(s.ei * n); nS = Math.min(n - nI, Math.round(s.es * n)); }
    for (let i = 0; i < n; i++) {
      const x = 24 + r + i * (w - 48 - 2 * r) / (n - 1);
      let hasI = null, hasS = false;
      if (mode === "comp") { if (i < nI) hasI = "comp"; else if (i < nI + nS) hasS = true; }
      else if (mode === "non") { hasI = i < nI ? "non" : null; hasS = ((i * 5) % n) < nS; }
      else hasS = i < nS;
      enzyme(ctx, x, y, r, hasS, hasI);
      if (hasS && hasI !== "non") { ctx.fillStyle = C.forest; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("반응", x, y + r + 26); }
      if (hasI === "non" && hasS) { ctx.fillStyle = C.warn; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("못 함", x, y + r + 26); }
    }
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    [["기질", COL.S], ["경쟁적 저해제", COL.Ic], ["비경쟁적 저해제", COL.In]].forEach(([t, c], i) => { const lx = 14 + i * 110; ctx.fillStyle = c; ctx.fillRect(lx, 8, 10, 10); ctx.fillStyle = C.ink2; ctx.fillText(t, lx + 14, 17); });
    // 그래프
    const gx = 44, gy = y + r + 58, gw = w - gx - 14, gh = h - gy - 34;
    const X = (v) => gx + v / 40 * gw, Y = (v) => gy + gh - v * gh / 1.1;
    axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [0, 10, 20, 30, 40].map((v) => [v, v]), yt: [[0, "0"], [0.5, "50%"], [1, "100%"]], xlabel: "기질 농도", ylabel: "반응 속도 (최대 속도 대비)" });
    const curve = (m, ii, col, lw, dash) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath(); for (let v = 0; v <= 40.001; v += 0.25) { const yy = Y(st(m, v, ii).v); v ? ctx.lineTo(X(v), yy) : ctx.moveTo(X(v), yy); } ctx.stroke(); ctx.setLineDash([]); };
    curve("none", 0, C.ink3, 1.6, [5, 4]);
    if (mode !== "none") curve(mode, I, mode === "comp" ? COL.Ic : COL.In, 2.6);
    else curve("none", 0, C.ink, 2.6);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(S), Y(s.v), 5, 0, 6.29); ctx.fill();
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("점선: 저해제 없음", gx + gw - 4, Y(st("none", 40, 0).v) - 8);
  }
  function update() {
    const S = +sS.value, I = mode === "none" ? 0 : +sI.value, s = st(mode, S, I), s0 = st("none", S, 0);
    oS.textContent = S; oKm.textContent = (S / KM).toFixed(S / KM < 10 ? 1 : 0); oI.textContent = sI.value;
    nV.textContent = `${(s.v * 100).toFixed(0)} %`;
    nR.textContent = S === 0 ? "—" : `${(s.v / s0.v * 100).toFixed(0)} %`;
    nES.textContent = `${(s.es * 100).toFixed(0)} %`;
    sI.disabled = mode === "none";
    root.querySelectorAll("[data-i]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.i === mode ? "true" : "false"));
    draw();
  }
  root.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.i; update(); }));
  [sS, sI].forEach((el) => el.addEventListener("input", update));
  update();
})();
