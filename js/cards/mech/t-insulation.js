/* 카드: 단열재를 두껍게 하면 빠져나가는 열이 얼마나 줄까? — 층상 벽의 열저항을 직렬로 더해 열 흐름과 벽 속 온도 분포를 구한다 */
(() => {
  const root = document.getElementById("card-mech-insulation");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), sOut = $(".out"), oT = $(".t-out"), oOut = $(".out-out");
  const nQ = $(".n-q"), nU = $(".n-u"), nDay = $(".n-day");
  const MAT = { none: { n: "없음", k: 1 }, eps: { n: "스티로폼", k: 0.035, col: "#f1f1ee" }, pur: { n: "우레탄 폼", k: 0.023, col: "#f3e3a6" }, wool: { n: "유리섬유", k: 0.040, col: "#f2cf97" } };
  let mat = "eps", phase = 0;
  const TIN = 20, RSI = 0.13, RSE = 0.04;

  function layers() {
    const L = [{ n: "석고보드", t: 0.0125, k: 0.25, col: "#e8e4dc" }];
    if (mat !== "none" && +sT.value > 0) L.push({ n: MAT[mat].n, t: +sT.value / 1000, k: MAT[mat].k, col: MAT[mat].col });
    L.push({ n: "콘크리트", t: 0.2, k: 1.6, col: "#c9c9c4" });
    return L;
  }
  function solve() {
    const L = layers(), Tout = +sOut.value, R = RSI + RSE + L.reduce((s, l) => s + l.t / l.k, 0), q = (TIN - Tout) / R;
    // 각 경계의 온도
    let T = TIN - q * RSI; const temps = [TIN, T];
    L.forEach((l) => { T -= q * l.t / l.k; temps.push(T); });
    temps.push(Tout);
    return { L, R, q, U: 1 / R, temps, Tout };
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = solve();
    // 벽 폭: 실제 두께 비율 (최소 폭 보장), 양쪽에 공기
    const air = w * 0.16, wallW = w - 2 * air - 20, tot = s.L.reduce((a, l) => a + l.t, 0);
    const widths = s.L.map((l) => Math.max(10, l.t / Math.max(tot, 0.25) * wallW));
    const x0 = air + 10, top = 30, bot = h - 34;
    const Tmin = -20, Tmax = 25, Y = (T) => bot - (T - Tmin) / (Tmax - Tmin) * (bot - top);
    let x = x0; const xs = [x0];
    s.L.forEach((l, i) => {
      ctx.fillStyle = l.col; ctx.fillRect(x, top, widths[i], bot - top);
      ctx.strokeStyle = C.ink3; ctx.strokeRect(x, top, widths[i], bot - top);
      ctx.save(); ctx.translate(x + widths[i] / 2, bot + 14); ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(widths[i] > 34 ? `${l.n} ${Math.round(l.t * 1000)}mm` : l.n.slice(0, 2), 0, 0); ctx.restore();
      x += widths[i]; xs.push(x);
    });
    ctx.fillStyle = "#b5532f"; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(`실내 ${TIN} °C`, air / 2 + 5, top + 14);
    ctx.fillStyle = "#3f6fa3"; ctx.fillText(`바깥 ${s.Tout} °C`, w - air / 2 - 5, top + 14);
    // 온도 선: 실내 공기 → 표면 → 층 경계 → 바깥
    ctx.strokeStyle = "#b5532f"; ctx.lineWidth = 2.4; ctx.beginPath();
    ctx.moveTo(8, Y(TIN)); ctx.lineTo(x0 - 12, Y(TIN)); ctx.lineTo(xs[0], Y(s.temps[1]));
    for (let i = 1; i < xs.length; i++) ctx.lineTo(xs[i], Y(s.temps[i + 1]));
    ctx.lineTo(xs[xs.length - 1] + 12, Y(s.Tout)); ctx.lineTo(w - 8, Y(s.Tout)); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left";
    [20, 10, 0, -10, -20].forEach((T) => ctx.fillText(`${T}°`, 2, Y(T) - 2));
    // 흐르는 열 (점들이 흐르는 속도 ∝ q)
    const n = 7; ctx.fillStyle = "rgba(224,160,42,.85)";
    for (let i = 0; i < n; i++) {
      const f = (phase * Math.min(3, s.q / 20) * 0.15 + i / n) % 1, px = 12 + f * (w - 24), py = top + (bot - top) * (0.25 + 0.5 * ((i * 37) % 7) / 7);
      ctx.beginPath(); ctx.arc(px, py, 3.2, 0, Math.PI * 2); ctx.fill();
    }
  }
  function update() {
    oT.textContent = sT.value; oOut.textContent = (+sOut.value).toString().replace("-", "−");
    sT.disabled = mat === "none";
    const s = solve();
    nQ.textContent = `${s.q.toFixed(1)} W`;
    nU.textContent = `${s.U.toFixed(2)} W/(m²·K)`;
    nDay.textContent = `${(s.q * 30 * 86400 / 3.6e6).toFixed(1)} kWh`;
    root.querySelectorAll("[data-mat]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mat === mat)));
    draw();
  }
  [sT, sOut].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-mat]").forEach((b) => b.addEventListener("click", () => { mat = b.dataset.mat; update(); }));
  loop(cv, (dt) => { phase += dt; draw(); });
  update();
})();
