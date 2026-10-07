/* 카드: 밀려 올라간 공기 덩어리는 되돌아올까? — 건조·습윤 단열 감률과 부력 진동수 N */
(() => {
  const root = document.getElementById("card-adearth-lapse");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sG = $(".g"), sT = $(".t"), sP = $(".p"), oG = $(".g-out"), oT = $(".t-out"), oP = $(".p-out"), st = $(".lp-state");
  const nGp = $(".n-gp"), nTh = $(".n-th"), nN2 = $(".n-n2"), nPer = $(".n-per");
  const G = 9.81, CP = 1005, RD = 287.04, L = 2.5e6, EPS = 0.622, GD = G / CP * 1000;
  let mode = "dry", t = 0, dz = 300;
  const fmt = (x, d = 1) => x.toFixed(d).replace("-", "−");
  const sci = (x) => { if (Math.abs(x) < 1e-9) return "0"; const e = Math.floor(Math.log10(Math.abs(x))), m = x / 10 ** e; return `${fmt(m)}×10<sup>${String(e).replace("-", "−")}</sup>`; };
  const esw = (tc) => 6.112 * Math.exp(17.67 * tc / (tc + 243.5));
  function gm(tc, p) {
    const T = tc + 273.15, es = esw(tc), w = EPS * es / (p - es);
    return 1000 * G * (1 + L * w / (RD * T)) / (CP + L * L * w * EPS / (RD * T * T));
  }
  function state() {
    const g = +sG.value, tc = +sT.value, p = +sP.value, gp = mode === "dry" ? GD : gm(tc, p);
    const n2 = G / (tc + 273.15) * (gp - g) / 1000;
    return { g, tc, p, gp, n2 };
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = state();
    /* 왼쪽: 덩어리 */
    const lx0 = 34, lx1 = w * 0.43, y0 = 22, y1 = h - 34, DT = 8, DZ = 1000;
    const X = (dT) => lx0 + (dT + DT) / (2 * DT) * (lx1 - lx0), Y = (z) => (y0 + y1) / 2 - z / DZ * ((y1 - y0) / 2);
    NM.axes(ctx, { x0: lx0, y0, w: lx1 - lx0, h: y1 - y0, X, Y, xt: [-8, -4, 0, 4, 8].map((v) => [v, v > 0 ? `+${v}` : fmt(v, 0)]), yt: [-1000, -500, 0, 500, 1000].map((v) => [v, `${v > 0 ? "+" : ""}${(v / 1000).toFixed(1)}`]), xlabel: "기온 − T₀ (K)", ylabel: "높이 변화 (km)" });
    const seg = (gam, col, lw, dash) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath(); let on = false; for (let z = -DZ; z <= DZ; z += 20) { const dT = -gam * z / 1000; if (Math.abs(dT) > DT) { on = false; continue; } on ? ctx.lineTo(X(dT), Y(z)) : ctx.moveTo(X(dT), Y(z)); on = true; } ctx.stroke(); ctx.setLineDash([]); };
    seg(s.g, C.ink, 2.2);
    seg(s.gp, mode === "dry" ? C.amber : "#2f8f6a", 1.6, [5, 3]);
    const z = dz, tp = -s.gp * z / 1000, te = -s.g * z / 1000;
    if (Math.abs(z) <= DZ) {
      const warm = tp > te;
      ctx.fillStyle = warm ? C.apple : "#3f6fa3"; ctx.beginPath(); ctx.arc(X(Math.max(-DT, Math.min(DT, tp))), Y(z), 7, 0, Math.PI * 2); ctx.fill();
      const ax = X(Math.max(-DT, Math.min(DT, tp))) + 16, len = Math.min(40, Math.abs(tp - te) * 18);
      if (len > 3) { const dir = warm ? -1 : 1; ctx.strokeStyle = C.ink2; ctx.fillStyle = C.ink2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax, Y(z)); ctx.lineTo(ax, Y(z) + dir * len); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ax, Y(z) + dir * (len + 6)); ctx.lineTo(ax - 4, Y(z) + dir * len); ctx.lineTo(ax + 4, Y(z) + dir * len); ctx.fill(); }
      ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(te), Y(z)); ctx.lineTo(X(Math.max(-DT, Math.min(DT, tp))), Y(z)); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.fillText("주변", X(-s.g * 0.9) + 4 > lx1 - 30 ? lx1 - 30 : Math.max(lx0 + 2, X(-s.g * 0.9) + 4), Y(900));
    ctx.fillStyle = mode === "dry" ? C.amber : "#2f8f6a"; ctx.textAlign = "right"; ctx.fillText(mode === "dry" ? "건조 단열" : "습윤 단열", Math.min(lx1 - 2, X(s.gp * 0.9) - 4), Y(-900));
    /* 오른쪽: 습윤 단열 감률 */
    const rx0 = w * 0.55, rx1 = w - 12, T0 = -40, T1 = 30, G0 = 0, G1 = 12;
    const RX = (tc) => rx0 + (tc - T0) / (T1 - T0) * (rx1 - rx0), RY = (g) => y1 - (g - G0) / (G1 - G0) * (y1 - y0);
    NM.axes(ctx, { x0: rx0, y0, w: rx1 - rx0, h: y1 - y0, X: RX, Y: RY, xt: [-40, -20, 0, 20].map((v) => [v, fmt(v, 0)]), yt: [0, 2, 4, 6, 8, 10, 12].map((v) => [v, `${v}`]), xlabel: "기온 (°C)", ylabel: "감률 (K/km)" });
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(RX(T0), RY(GD)); ctx.lineTo(RX(T1), RY(GD)); ctx.stroke();
    ctx.fillStyle = C.amber; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("Γd = g/cp = 9.8", RX(T0) + 4, RY(GD) - 5);
    [[1000, 0.35], [700, 0.6], [500, 0.85]].forEach(([p, a]) => {
      ctx.strokeStyle = `rgba(47,143,106,${a})`; ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 0; i <= 140; i++) { const tc = T0 + (T1 - T0) * i / 140; i ? ctx.lineTo(RX(tc), RY(gm(tc, p))) : ctx.moveTo(RX(tc), RY(gm(tc, p))); } ctx.stroke();
    });
    ctx.strokeStyle = "#2f8f6a"; ctx.lineWidth = 2.4; ctx.beginPath(); for (let i = 0; i <= 140; i++) { const tc = T0 + (T1 - T0) * i / 140; i ? ctx.lineTo(RX(tc), RY(gm(tc, s.p))) : ctx.moveTo(RX(tc), RY(gm(tc, s.p))); } ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.3; const gy = RY(Math.max(G0, Math.min(G1, s.g))); ctx.beginPath(); ctx.moveTo(rx0, gy); ctx.lineTo(rx1, gy); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.font = `10.5px ${F.sans}`; ctx.fillText("주변 Γ", rx0 + 4, gy + (s.g > 10.5 ? 13 : -5));
    ctx.fillStyle = "#2f8f6a"; ctx.beginPath(); ctx.arc(RX(s.tc), RY(gm(s.tc, s.p)), 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("가는 초록: Γm (위부터 1000·700·500 hPa)", rx0 + 4, RY(1.6)); ctx.fillText(`굵은 초록: 지금 기압 ${s.p} hPa`, rx0 + 4, RY(0.6));
  }
  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === mode)));
    oG.textContent = fmt(+sG.value); oT.textContent = fmt(+sT.value, 0); oP.textContent = sP.value;
    const s = state(), th = (s.tc + 273.15) * (1000 / s.p) ** (RD / CP);
    nGp.textContent = `${s.gp.toFixed(1)} K/km`; nTh.textContent = `${th.toFixed(1)} K`;
    nN2.innerHTML = sci(s.n2);
    const n2 = s.n2;
    if (Math.abs(n2) < 1e-7) nPer.textContent = "중립";
    else if (n2 > 0) nPer.textContent = `주기 ${(2 * Math.PI / Math.sqrt(n2) / 60).toFixed(1)}분`;
    else nPer.textContent = `e배 ${(1 / Math.sqrt(-n2) / 60).toFixed(1)}분`;
    nPer.className = n2 < -1e-7 ? "n-per bad" : "n-per";
    const verdict = n2 > 1e-7 ? "덩어리가 주변보다 빨리 식으므로 위로 밀리면 주변보다 차가워져 되돌아옵니다. 안정합니다." : n2 < -1e-7 ? "덩어리가 주변보다 천천히 식으므로 위로 밀리면 주변보다 따뜻해져 계속 올라갑니다. 불안정합니다." : "덩어리와 주변이 같은 비율로 식어 어디에 두어도 그 자리에 머뭅니다. 중립입니다.";
    const cond = s.g > gm(s.tc, s.p) && s.g < GD ? " 주변 감률이 Γm과 Γd 사이이므로 조건부 불안정입니다." : "";
    st.textContent = verdict + cond;
    t = 0; dz = 300; draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; update(); }));
  [sG, sT, sP].forEach((x) => x.addEventListener("input", update));
  loop(cv, (dt) => {
    const n2 = state().n2, tt = dt * 100; t += tt;
    if (n2 > 1e-7) dz = 300 * Math.cos(Math.sqrt(n2) * t);
    else if (n2 < -1e-7) { dz = 300 * Math.cosh(Math.sqrt(-n2) * t); if (dz > 1100) { t = 0; dz = 300; } }
    else dz = 300;
    draw();
  });
  update();
})();
