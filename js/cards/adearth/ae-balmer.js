/* 카드: 수소가 가장 많은 태양에서 왜 칼슘 흡수선이 수소선보다 진할까? — 볼츠만 분포와 사하 식으로 본 분광형 */
(() => {
  const root = document.getElementById("card-adearth-balmer");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), sP = $(".p");
  const k = 1.380649e-23, me = 9.1093837e-31, h = 6.62607015e-34, eV = 1.602176634e-19, ACA = 2.2e-6;
  const saha = (T, Pe, chi, Zi, Zj) => 2 * k * T * Zj / (Pe * Zi) * (2 * Math.PI * me * k * T / (h * h)) ** 1.5 * Math.exp(-chi * eV / (k * T));
  const H2 = (T, Pe) => { const r = saha(T, Pe, 13.6, 2, 1), b = 4 * Math.exp(-10.2 * eV / (k * T)); return b / (1 + b) / (1 + r); };
  const Ca = (T, Pe) => { const r1 = saha(T, Pe, 6.11, 1.32, 2.30), r2 = saha(T, Pe, 11.87, 2.30, 1.0); return r1 / (1 + r1 + r1 * r2) * (2 / 2.30) * ACA; };
  const SP = [[30000, "B0"], [15500, "B5"], [9800, "A0"], [7300, "F0"], [5940, "G0"], [5150, "K0"], [3840, "M0"]];
  const peakT = (Pe) => { let best = 0, bt = 0; for (let lt = 3.55; lt <= 4.45; lt += 0.001) { const v = H2(10 ** lt, Pe); if (v > best) { best = v; bt = 10 ** lt; } } return bt; };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h: H } = size; if (!w) return;
    ctx.clearRect(0, 0, w, H);
    const Pe = 10 ** +sP.value, T = 10 ** +sT.value;
    const x0 = 50, x1 = w - 12, y0 = 40, y1 = H - 36;
    const X = (lt) => x0 + (4.45 - lt) / 0.9 * (x1 - x0), Y = (lv) => y1 - (lv + 12) / 9 * (y1 - y0);
    NM.axes(ctx, { x0, y0, w: x1 - x0, h: y1 - y0, X, Y,
      xt: [[Math.log10(25000), "25000"], [4, "10000"], [Math.log10(7000), "7000"], [Math.log10(5000), "5000"], [Math.log10(4000), "4000"]],
      yt: [[-12, "10⁻¹²"], [-10, "10⁻¹⁰"], [-8, "10⁻⁸"], [-6, "10⁻⁶"], [-4, "10⁻⁴"]],
      xlabel: "표면 온도 T (K) — 왼쪽이 뜨거움", ylabel: "" });
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("수소 원자 1개당 흡수자 수", x0, y0 - 24);
    /* 분광형 눈금 */
    ctx.font = `bold 10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillStyle = C.forest;
    for (const [t, s] of SP) { const x = X(Math.log10(t)); if (x > x0 + 8 && x < x1 - 8) { ctx.fillText(s, x, y0 - 6); ctx.fillRect(x - 0.5, y0 - 3, 1, 3); } }
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
    const curve = (f, col, lw, dash) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath(); for (let i = 0; i <= 300; i++) { const lt = 3.55 + i / 300 * 0.9, v = f(10 ** lt); const y = Y(Math.log10(Math.max(v, 1e-30))); i === 0 ? ctx.moveTo(X(lt), y) : ctx.lineTo(X(lt), y); } ctx.stroke(); ctx.setLineDash([]); };
    /* 비교용: 주계열 기준 곡선(흐리게) */
    if (Math.abs(Pe - 20) / 20 > 0.02) { ctx.globalAlpha = 0.35; curve((t) => H2(t, 20), "#d7263d", 1.2, [4, 3]); curve((t) => Ca(t, 20), "#3f6fa3", 1.2, [4, 3]); ctx.globalAlpha = 1; }
    curve((t) => H2(t, Pe), "#d7263d", 2.4);
    curve((t) => Ca(t, Pe), "#3f6fa3", 2.4);
    const lt = Math.log10(T);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(lt), y0); ctx.lineTo(X(lt), y1); ctx.stroke();
    for (const [v, col] of [[H2(T, Pe), "#d7263d"], [Ca(T, Pe), "#3f6fa3"]]) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(lt), Y(Math.log10(v)), 4.5, 0, 2 * Math.PI); ctx.fill(); }
    const pt = peakT(Pe); ctx.strokeStyle = "#d7263d"; ctx.setLineDash([1, 3]); ctx.beginPath(); ctx.moveTo(X(Math.log10(pt)), y0); ctx.lineTo(X(Math.log10(pt)), y1); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = "#d7263d"; ctx.fillText("— H, n = 2 (발머선 흡수자)", x0 + 8, y0 + 16);
    ctx.fillStyle = "#3f6fa3"; ctx.fillText("— Ca II 바닥 상태 (K선 흡수자)", x0 + 8, y0 + 31);
    if (Math.abs(Pe - 20) / 20 > 0.02) { ctx.fillStyle = C.ink3; ctx.fillText("흐린 점선: Pe = 20 Pa (주계열)", x0 + 8, y0 + 46); }
  }
  const sci = (v) => { const e = Math.floor(Math.log10(v)); const sup = String(e).replace(/[-0-9]/g, (ch) => "⁻⁰¹²³⁴⁵⁶⁷⁸⁹"["-0123456789".indexOf(ch)]); return `${(v / 10 ** e).toFixed(1)}×10${sup}`; };
  const spec = (T) => { let best = SP[0]; for (const s of SP) if (Math.abs(Math.log(s[0] / T)) < Math.abs(Math.log(best[0] / T))) best = s; return best[1]; };
  function update() {
    const Pe = 10 ** +sP.value, T = 10 ** +sT.value;
    $(".t-out").textContent = Math.round(T).toLocaleString();
    $(".p-out").textContent = Pe < 1 ? Pe.toFixed(2) : Pe < 10 ? Pe.toFixed(1) : Math.round(Pe);
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(Math.abs(Math.log10(+b.dataset.p) - +sP.value) < 0.01)));
    const a = H2(T, Pe), c = Ca(T, Pe);
    $(".n-h").textContent = sci(a); $(".n-c").textContent = sci(c);
    const r = c / a; $(".n-r").textContent = r >= 100 ? `${Math.round(r).toLocaleString()} 배` : r >= 1 ? `${r.toFixed(1)} 배` : `${r.toFixed(3)} 배`;
    const pt = peakT(Pe); $(".n-pk").textContent = `${Math.round(pt / 10) * 10} K (${spec(pt)} 근처)`;
    draw();
  }
  [sT, sP].forEach((s) => s.addEventListener("input", update));
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { sP.value = Math.log10(+b.dataset.p); update(); }));
  update();
})();
