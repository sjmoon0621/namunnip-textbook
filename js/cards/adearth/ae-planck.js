/* 카드: 플랑크 곡선 하나에서 빈 법칙과 T⁴ 법칙이 어떻게 함께 나올까? — 플랑크 법칙, 빈 법칙, 슈테판–볼츠만 법칙, 광도와 색지수 */
(() => {
  const root = document.getElementById("card-adearth-planck");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), sR = $(".r");
  const h = 6.62607015e-34, c = 2.99792458e8, k = 1.380649e-23, SIG = 5.670374419e-8;
  const RSUN = 6.957e8, LSUN = 3.828e26, TSUN = 5772;
  const B = (l, T) => { const x = h * c / (l * k * T); return x > 700 ? 0 : 2 * h * c * c / l ** 5 / Math.expm1(x); };
  function flux(T) {
    let s = 0; const n = 4000, a = Math.log(1e-8), b = Math.log(1e-4);
    for (let i = 0; i < n; i++) { const u = a + (i + 0.5) / n * (b - a), l = Math.exp(u); s += B(l, T) * l * (b - a) / n; }
    return Math.PI * s;
  }
  const band = (T, c0, fw) => { const sg = fw / 2.3548; let s = 0; for (let l = 300; l < 800; l++) s += B(l * 1e-9, T) * Math.exp(-0.5 * ((l - c0) / sg) ** 2); return s; };
  const bvRaw = (T) => -2.5 * Math.log10(band(T, 440, 98) / band(T, 550, 89));
  const BV0 = bvRaw(9600);
  const Tn = () => 10 ** +sT.value, Rn = () => 10 ** +sR.value;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h: H } = size; if (!w) return;
    ctx.clearRect(0, 0, w, H);
    const T = Tn();
    /* 위: B_λ — 파장 50–2500 nm */
    const x0 = 44, x1 = w - 12, ya = 22, yb = H * 0.50;
    const L0 = 50, L1 = 2500, X = (nm) => x0 + (nm - L0) / (L1 - L0) * (x1 - x0);
    let mx = 0; for (let nm = L0; nm <= L1; nm += 5) mx = Math.max(mx, B(nm * 1e-9, T), B(nm * 1e-9, TSUN));
    const Y = (v) => yb - v / mx * (yb - ya) * 0.95;
    /* 가시광 띠와 B, V 필터 */
    const vis = ctx.createLinearGradient(X(400), 0, X(700), 0);
    ["#7b3fbf", "#3f6fff", "#2fbf5f", "#e0d02a", "#ef8a2a", "#d7263d"].forEach((col, i) => vis.addColorStop(i / 5, col));
    ctx.globalAlpha = 0.18; ctx.fillStyle = vis; ctx.fillRect(X(400), ya, X(700) - X(400), yb - ya); ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(63,111,163,.6)"; ctx.setLineDash([2, 2]);
    for (const [c0, lab] of [[440, "B"], [550, "V"]]) { ctx.beginPath(); ctx.moveTo(X(c0), ya); ctx.lineTo(X(c0), yb); ctx.stroke(); ctx.fillStyle = "#3f6fa3"; ctx.font = `bold 10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(lab, X(c0), ya + 10); }
    ctx.setLineDash([]);
    NM.axes(ctx, { x0, y0: ya, w: x1 - x0, h: yb - ya, X, Y: () => yb, xt: [[500, "500"], [1000, "1000"], [1500, "1500"], [2000, "2000"]], yt: [], xlabel: "파장 λ (nm)", ylabel: "" });
    const plot = (TT, col, lw, dash) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath(); for (let nm = L0; nm <= L1; nm += 4) { const y = Math.max(ya - 4, Y(B(nm * 1e-9, TT))); nm === L0 ? ctx.moveTo(X(nm), y) : ctx.lineTo(X(nm), y); } ctx.stroke(); ctx.setLineDash([]); };
    plot(TSUN, C.amber, 1.4, [4, 3]);
    plot(T, C.apple, 2.4);
    const lm = 2.897771955e-3 / T * 1e9;
    if (lm > L0 && lm < L1) { ctx.strokeStyle = C.apple; ctx.lineWidth = 1; ctx.setLineDash([1, 3]); ctx.beginPath(); ctx.moveTo(X(lm), Y(B(lm * 1e-9, T))); ctx.lineTo(X(lm), yb); ctx.stroke(); ctx.setLineDash([]); }
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right"; ctx.fillStyle = C.apple; ctx.fillText(`${Math.round(T).toLocaleString()} K`, x1 - 4, ya + 10);
    ctx.fillStyle = C.amber; ctx.fillText("태양 5,772 K (점선)", x1 - 4, ya + 24);
    ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("Bλ (두 곡선 같은 눈금, 상대값)", x0, ya - 8);
    /* 아래: B_λ / T⁵ vs λT */
    const yc = H * 0.62, yd = H - 34, U0 = 0, U1 = 15000, XU = (u) => x0 + (u - U0) / (U1 - U0) * (x1 - x0);
    const fx = (u) => { const x = 1.438776877e-2 / (u * 1e-6); return x > 700 ? 0 : x ** 5 / Math.expm1(x); };
    const fmax = fx(2897.77);
    const YU = (v) => yd - v / fmax * (yd - yc) * 0.92;
    NM.axes(ctx, { x0, y0: yc, w: x1 - x0, h: yd - yc, X: XU, Y: () => yd, xt: [[0, "0"], [2898, "2898"], [5000, "5000"], [10000, "10000"]], yt: [], xlabel: "λT (μm·K)", ylabel: "" });
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("Bλ / T⁵: 모든 온도가 한 곡선 x⁵/(eˣ − 1)", x0, yc - 8);
    const plotU = (TT, col, lw, dash) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath(); for (let i = 1; i <= 300; i++) { const u = i / 300 * U1, nm = u / TT * 1000; const v = B(nm * 1e-9, TT) / TT ** 5 / (2 * k ** 5 / (h ** 4 * c ** 3)); i === 1 ? ctx.moveTo(XU(u), YU(v)) : ctx.lineTo(XU(u), YU(v)); } ctx.stroke(); ctx.setLineDash([]); };
    plotU(T, C.apple, 2.4); plotU(TSUN, C.amber, 1.4, [4, 3]);
    ctx.strokeStyle = C.ink2; ctx.setLineDash([1, 3]); ctx.beginPath(); ctx.moveTo(XU(2898), yc); ctx.lineTo(XU(2898), yd); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText("x = hc/λkT = 4.965", XU(2898) + 6, yc + 14);
  }
  const sci = (v, d = 2) => { const e = Math.floor(Math.log10(v)); const sup = String(e).replace(/[-0-9]/g, (ch) => "⁻⁰¹²³⁴⁵⁶⁷⁸⁹"["-0123456789".indexOf(ch)]); return `${(v / 10 ** e).toFixed(d)}×10${sup}`; };
  function update() {
    const T = Tn(), R = Rn();
    $(".t-out").textContent = Math.round(T).toLocaleString();
    $(".r-out").textContent = R < 0.1 ? R.toFixed(4) : R < 10 ? R.toFixed(2) : Math.round(R).toLocaleString();
    root.querySelectorAll("[data-t]").forEach((b) => b.setAttribute("aria-pressed", String(Math.abs(+b.dataset.t - T) / T < 0.003 && Math.abs(Math.log10(+b.dataset.r) - +sR.value) < 0.006)));
    const lm = 2.897771955e-3 / T * 1e9;
    $(".n-l").textContent = lm >= 1000 ? `${(lm / 1000).toFixed(2)} μm` : `${lm.toFixed(0)} nm`;
    const Fn = flux(T);
    $(".n-f").textContent = `${sci(Fn)} W/m² = σT⁴ × ${(Fn / (SIG * T ** 4)).toFixed(4)}`;
    const L = 4 * Math.PI * (R * RSUN) ** 2 * SIG * T ** 4 / LSUN;
    const Mb = 4.74 - 2.5 * Math.log10(L);
    $(".n-L").textContent = `${L >= 1e4 || L < 0.01 ? sci(L, 1) : L.toPrecision(3)} L☉ / ${Mb.toFixed(2)}`;
    $(".n-c").textContent = (bvRaw(T) - BV0).toFixed(2);
    draw();
  }
  [sT, sR].forEach((s) => s.addEventListener("input", update));
  root.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { sT.value = Math.log10(+b.dataset.t); sR.value = Math.log10(+b.dataset.r); update(); }));
  update();
})();
