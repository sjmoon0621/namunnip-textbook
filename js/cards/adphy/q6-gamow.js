/* 카드: 가모프 봉우리 — 맥스웰–볼츠만 인자 × 터널링 확률, 반응률의 온도 민감도 */
(() => {
  const root = document.getElementById("card-adphy-gamow");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), oT = $(".t-out");
  const out = (c) => $(c);
  const K_KEV = 8.617e-8; /* 볼츠만 상수 (keV/K) */
  /* E_G (keV) = 2 m_r c² (π α Z1 Z2)², 쿨롱 장벽 (keV) */
  const RX = {
    pp: { eg: 493, ec: 600, col: "#3f6fa3", name: "p + p" },
    cno: { eg: 45080, ec: 2460, col: "#d7263d", name: "p + ¹⁴N" },
    dt: { eg: 1182, ec: 444, col: "#3b7c2a", name: "²H + ³H" },
  };
  let rx = "pp";
  const TSUN = 15.7e6;
  const Tof = () => 1e6 * 10 ** +sT.value;
  /* ln ⟨σv⟩ (상수 제외) */
  function lnRate(eg, T) {
    const kT = K_KEV * T, e0 = Math.cbrt(eg * kT * kT / 4), f = (E) => -E / kT - Math.sqrt(eg / E);
    const fm = f(e0), lo = Math.max(1e-6, e0 * 0.05), hi = e0 * 4 + 20 * kT, n = 800;
    let s = 0; for (let i = 0; i < n; i++) { const E = lo + (hi - lo) * (i + 0.5) / n; s += Math.exp(f(E) - fm); }
    return -1.5 * Math.log(kT) + fm + Math.log(s * (hi - lo) / n);
  }
  const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const sci10 = (lg) => { const e = Math.floor(lg), m = 10 ** (lg - e); return `${m.toFixed(1)}×10${String(e).split("").map((c) => SUP[c]).join("")}`; };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const T = Tof(), kT = K_KEV * T, R = RX[rx], e0 = Math.cbrt(R.eg * kT * kT / 4), dE = 4 / Math.sqrt(3) * Math.sqrt(e0 * kT);
    /* 위 그래프 */
    const x0 = 46, x1 = w - 14, y0 = 26, y1 = h * 0.5, Emax = e0 + 3.2 * dE;
    const X = (E) => x0 + E / Emax * (x1 - x0), Y = (v) => y1 - v * (y1 - y0) * 0.92;
    const step = Emax > 200 ? 50 : Emax > 80 ? 20 : Emax > 40 ? 10 : Emax > 16 ? 5 : 2;
    const xt = []; for (let v = 0; v <= Emax; v += step) xt.push([v, String(v)]);
    NM.axes(ctx, { x0, y0, w: x1 - x0, h: y1 - y0, X, Y: () => 0, xt });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("원자핵의 에너지 E (keV)", x1, y1 + 28);
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`${R.name} · 세 곡선 모두 최댓값 = 1 (상대값)`, x0, y0 - 10);
    const N = 400, mb = (E) => Math.exp(-E / kT), tu = (E) => Math.exp(-Math.sqrt(R.eg / E));
    const tuMax = tu(Emax), prod = (E) => Math.exp(-E / kT - Math.sqrt(R.eg / E) + 3 * e0 / kT);
    const curve = (f, col, dash, fill) => {
      ctx.beginPath(); for (let i = 0; i <= N; i++) { const E = Math.max(1e-6, Emax * i / N), y = Y(Math.min(f(E), 1.05)); i ? ctx.lineTo(X(E), y) : ctx.moveTo(X(E), y); }
      if (fill) { ctx.lineTo(X(Emax), y1); ctx.lineTo(x0, y1); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
      else { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]); }
    };
    curve(prod, null, null, "rgba(116,171,102,.35)");
    curve(prod, C.forest);
    curve(mb, "#d7263d", [5, 4]);
    curve((E) => tu(E) / tuMax, "#3f6fa3", [2, 3]);
    ctx.strokeStyle = C.amber; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(e0), y0); ctx.lineTo(X(e0), y1); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = "#d7263d"; ctx.fillText("입자 수 e^(−E/kT)", X(e0 + 0.9 * dE), Y(0.62));
    ctx.fillStyle = "#3f6fa3"; ctx.textAlign = "right"; ctx.fillText("터널링 확률", x1 - 4, Y(1.0) - 6);
    ctx.fillStyle = C.forest; ctx.textAlign = "left"; ctx.fillText(`곱 → 봉우리 E₀ = ${e0.toFixed(1)} keV`, X(e0 + 0.9 * dE), Y(0.75));
    ctx.fillStyle = C.warn; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`쿨롱 장벽 ${R.ec >= 1000 ? (R.ec / 1000).toFixed(1) + " MeV" : R.ec + " keV"}: 이 그래프 폭의 ${Math.round(R.ec / Emax)}배 오른쪽`, x0, y1 + 28);
    /* 아래: 반응률–온도 */
    const u0 = h * 0.64, u1 = h - 30, LT0 = 0.5, LT1 = 2.5, LY = 12;
    const XT = (lt) => x0 + (lt - LT0) / (LT1 - LT0) * (x1 - x0), YR = (lr) => u1 - (lr + LY) / (2 * LY) * (u1 - u0);
    NM.axes(ctx, { x0, y0: u0, w: x1 - x0, h: u1 - u0, X: XT, Y: YR, xt: [[0.5, "3"], [1, "10"], [1.5, "30"], [2, "100"], [2.5, "300"]], yt: [[-12, "10⁻¹²"], [-6, "10⁻⁶"], [0, "1"], [6, "10⁶"], [12, "10¹²"]] });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, u0); ctx.lineTo(x0, u1); ctx.lineTo(x1, u1); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("온도 (백만 K)", x1, u1 + 28);
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("반응률 (태양 중심 온도에서 = 1)", x0, u0 - 10);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, u0, x1 - x0, u1 - u0); ctx.clip();
    for (const k of Object.keys(RX)) {
      const ref = lnRate(RX[k].eg, TSUN);
      ctx.strokeStyle = RX[k].col; ctx.lineWidth = k === rx ? 2.4 : 1.2; ctx.globalAlpha = k === rx ? 1 : 0.45; ctx.beginPath();
      for (let i = 0; i <= 160; i++) { const lt = LT0 + (LT1 - LT0) * i / 160, lr = (lnRate(RX[k].eg, 1e6 * 10 ** lt) - ref) / Math.LN10; i ? ctx.lineTo(XT(lt), YR(lr)) : ctx.moveTo(XT(lt), YR(lr)); }
      ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.restore();
    const ltS = Math.log10(TSUN / 1e6); ctx.strokeStyle = C.rule; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(XT(ltS), u0); ctx.lineTo(XT(ltS), u1); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("태양 중심", XT(ltS) + 4, u1 - 6);
    const lt = +sT.value, lr = (lnRate(R.eg, T) - lnRate(R.eg, TSUN)) / Math.LN10;
    if (lr > -LY && lr < LY) { ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(XT(lt), YR(lr), 5, 0, Math.PI * 2); ctx.fill(); }
    let lx = x1 - 96; ctx.font = `10.5px ${F.sans}`;
    Object.keys(RX).forEach((k, i) => { ctx.fillStyle = RX[k].col; ctx.fillRect(lx, u1 - 50 + i * 15, 12, 3); ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText(RX[k].name, lx + 18, u1 - 45 + i * 15); });
  }
  function update() {
    root.querySelectorAll("[data-r]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.r === rx)));
    const T = Tof(), kT = K_KEV * T, R = RX[rx], e0 = Math.cbrt(R.eg * kT * kT / 4);
    oT.textContent = T / 1e6 >= 100 ? (T / 1e6).toFixed(0) : (T / 1e6).toFixed(1);
    out(".n-kt").textContent = `${kT.toFixed(2)} keV`;
    out(".n-e0").textContent = `${e0.toFixed(1)} keV`;
    out(".n-ec").textContent = R.ec >= 1000 ? `${(R.ec / 1000).toFixed(1)} MeV` : `${R.ec} keV`;
    out(".n-cl").textContent = `${sci10(-R.ec / kT / Math.LN10)}`;
    const d = 0.01, nu = (lnRate(R.eg, T * (1 + d)) - lnRate(R.eg, T * (1 - d))) / (Math.log(1 + d) - Math.log(1 - d));
    out(".n-nu").textContent = `ν ≈ ${nu.toFixed(1)}`;
    out(".n-tp").textContent = sci10(-Math.sqrt(R.eg / e0) / Math.LN10);
    out(".n-eg").textContent = R.eg >= 1000 ? `${(R.eg / 1000).toFixed(1)} MeV` : `${R.eg} keV`;
    draw();
  }
  root.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => {
    rx = b.dataset.r;
    if (rx === "dt" && +sT.value < 1.8) sT.value = 2.0;
    else if (rx !== "dt" && +sT.value > 1.6) sT.value = 1.196;
    update();
  }));
  sT.addEventListener("input", update);
  update();
})();
