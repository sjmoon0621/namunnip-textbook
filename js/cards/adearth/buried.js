/* 카드: 중력 이상 곡선으로 매몰 물체의 깊이와 초과 질량 구하기 — 구·수평 원통 모형, 가상 탐사 자료 */
(() => {
  const root = document.getElementById("card-adearth-buried");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sZ = $(".z"), sR = $(".r"), sP = $(".p");
  const G = 6.674e-11;
  /* 가상 자료의 참값(화면에는 나오지 않음)과 측선 범위·슬라이더 범위 */
  const CASES = {
    ore: { shape: "sphere", z: 350, R: 120, dr: 2.0, X: 1500, dx: 75, zr: [50, 1000, 5], rr: [10, 400, 5], z0: 600, r0: 150 },
    salt: { shape: "sphere", z: 1000, R: 700, dr: -0.25, X: 4000, dx: 200, zr: [200, 3000, 10], rr: [50, 1500, 10], z0: 1800, r0: 600 },
    cave: { shape: "cyl", z: 60, R: 15, dr: -2.6, X: 300, dx: 10, zr: [10, 200, 1], rr: [2, 80, 1], z0: 120, r0: 20 },
  };
  const SD = 0.02;
  let cs = "ore", shape = "sphere", data = [];
  /* mGal 단위의 이상. dr은 g/cm³ */
  function dg(sh, z, R, dr, x) {
    const d = dr * 1000;
    if (sh === "sphere") { const M = 4 / 3 * Math.PI * R ** 3 * d; return G * M * z / (x * x + z * z) ** 1.5 * 1e5; }
    const lam = Math.PI * R * R * d; return 2 * G * lam * z / (x * x + z * z) * 1e5;
  }
  function makeData() {
    const c = CASES[cs]; let seed = cs.length * 7919 + 13;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());
    data = [];
    for (let x = -c.X; x <= c.X + 1e-9; x += c.dx) data.push([x, dg(c.shape, c.z, c.R, c.dr, x) + SD * gauss()]);
  }
  function setCase(k) {
    cs = k; const c = CASES[k];
    [[sZ, c.zr, c.z0], [sR, c.rr, c.r0]].forEach(([el, [a, b, st], v]) => { el.min = a; el.max = b; el.step = st; el.value = v; });
    sP.value = 1; makeData();
  }
  const { ctx, size } = fit(cv, () => draw());
  function model() { return { z: +sZ.value, R: Math.min(+sR.value, +sZ.value - 1), dr: +sP.value }; }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const c = CASES[cs], m = model();
    const x0 = 48, x1 = w - 12, gy0 = 22, gy1 = h * 0.52, sy0 = gy1 + 30, sy1 = h - 8;
    const X = (x) => x0 + (x + c.X) / (2 * c.X) * (x1 - x0);
    let lo = 0, hi = 0;
    data.forEach(([, v]) => { lo = Math.min(lo, v); hi = Math.max(hi, v); });
    for (let i = 0; i <= 100; i++) { const v = dg(shape, m.z, m.R, m.dr, -c.X + i / 50 * c.X); lo = Math.min(lo, v); hi = Math.max(hi, v); }
    const pad = (hi - lo) * 0.12 + 0.05; lo -= pad; hi += pad;
    const Y = (v) => gy1 - (v - lo) / (hi - lo) * (gy1 - gy0);
    const span = hi - lo, stp = span > 8 ? 2 : span > 4 ? 1 : span > 2 ? 0.5 : span > 0.8 ? 0.2 : 0.1;
    const yt = []; for (let v = Math.ceil(lo / stp) * stp; v <= hi; v += stp) yt.push([v, (Math.abs(v) < 1e-9 ? 0 : v).toFixed(stp < 0.5 ? 1 : stp < 1 ? 1 : 0)]);
    const xs = c.X >= 3000 ? 1000 : c.X >= 1000 ? 500 : 100, xt = [];
    for (let x = -c.X; x <= c.X; x += xs) xt.push([x, String(x)]);
    NM.axes(ctx, { x0, y0: gy0, w: x1 - x0, h: gy1 - gy0, X, Y, xt: [], yt, ylabel: "부게 이상 (mGal)" });
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x1, Y(0)); ctx.stroke();
    /* 자료 점 */
    ctx.fillStyle = C.ink;
    data.forEach(([x, v]) => { ctx.beginPath(); ctx.arc(X(x), Y(v), 2.6, 0, Math.PI * 2); ctx.fill(); });
    /* 모형 곡선 */
    ctx.strokeStyle = C.apple; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 300; i++) { const x = -c.X + i / 150 * c.X, v = dg(shape, m.z, m.R, m.dr, x); if (i) ctx.lineTo(X(x), Y(v)); else ctx.moveTo(X(x), Y(v)); }
    ctx.stroke();
    /* 반값 너비 표시 */
    const pk = dg(shape, m.z, m.R, m.dr, 0), xh = (shape === "sphere" ? 0.766 : 1) * m.z;
    if (Math.abs(pk) > 0.02 && xh < c.X) {
      ctx.strokeStyle = C.apple; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X(-xh), Y(pk / 2)); ctx.lineTo(X(xh), Y(pk / 2)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.apple; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left";
      ctx.fillText("반값 너비", X(xh) + 4, Y(pk / 2) + 3);
    }
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right"; ctx.fillStyle = C.ink2;
    const dpk = data.reduce((a, [, v]) => (Math.abs(v) > Math.abs(a) ? v : a), 0), ly = dpk >= 0 ? gy0 + 10 : gy1 - 22;
    ctx.fillText("● 측정값", x1 - 64, ly); ctx.fillStyle = C.apple; ctx.fillText("— 모형", x1 - 4, ly);
    /* 단면 */
    const sc = (x1 - x0) / (2 * c.X), D = (sy1 - sy0) / sc;
    ctx.fillStyle = "#ece6da"; ctx.fillRect(x0, sy0, x1 - x0, sy1 - sy0);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, sy0); ctx.lineTo(x1, sy0); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    xt.forEach(([x, lab]) => { ctx.fillText(lab, X(x), sy0 - 6); ctx.fillRect(X(x) - 0.5, sy0, 1, 4); });
    ctx.textAlign = "right";
    const dstep = D > 2000 ? 1000 : D > 800 ? 500 : D > 300 ? 100 : 50;
    for (let d = dstep; d < D; d += dstep) { const y = sy0 + d * sc; ctx.fillText(String(d), x0 - 5, y + 3); ctx.fillRect(x0, y, 4, 1); }
    ctx.save(); ctx.beginPath(); ctx.rect(x0, sy0, x1 - x0, sy1 - sy0); ctx.clip();
    const col = m.dr >= 0 ? "rgba(90,60,40,.75)" : "rgba(120,170,220,.75)";
    ctx.fillStyle = col; ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(X(0), sy0 + m.z * sc, Math.max(1.5, m.R * sc), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(0), sy0 + m.z * sc, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(shape === "sphere" ? "모형: 구 (단면)" : "모형: 측선에 수직으로 누운 원통 (단면)", x0 + 6, sy1 - 6);
    ctx.textAlign = "right"; ctx.fillText("가로: 수평 거리 (m) · 세로: 깊이 (m)", x1 - 6, sy1 - 6);
  }
  function update() {
    const c = CASES[cs], m = model();
    root.querySelectorAll("[data-c]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.c === cs)));
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === shape)));
    $(".z-out").textContent = String(m.z); $(".r-out").textContent = String(m.R); $(".p-out").textContent = (m.dr > 0 ? "+" : "") + m.dr.toFixed(2);
    const pk = dg(shape, m.z, m.R, m.dr, 0);
    $(".n-a").textContent = `${pk.toFixed(2)} mGal`;
    $(".n-h").textContent = `${Math.round((shape === "sphere" ? 0.766 : 1) * m.z)} m`;
    let s2 = 0; data.forEach(([x, v]) => { s2 += (v - dg(shape, m.z, m.R, m.dr, x)) ** 2; });
    const rms = Math.sqrt(s2 / data.length);
    $(".n-e").textContent = `${rms.toFixed(3)} mGal`;
    const d = m.dr * 1000;
    if (shape === "sphere") { const M = 4 / 3 * Math.PI * m.R ** 3 * d; $(".n-m").textContent = `${(M / 1e9).toPrecision(3)} × 10⁹ kg`; $(".n-k").textContent = (m.dr * (m.R / 100) ** 3).toPrecision(3); $(".k-dt").textContent = "Δρ·R³ [g/cm³·(100 m)³]"; }
    else { const lam = Math.PI * m.R * m.R * d; $(".n-m").textContent = `${(lam / 1e6).toPrecision(3)} × 10⁶ kg/m`; $(".n-k").textContent = (m.dr * (m.R / 10) ** 2).toPrecision(3); $(".k-dt").textContent = "Δρ·R² [g/cm³·(10 m)²]"; }
    const j = $(".n-j"), good = rms < 2.2 * SD;
    j.textContent = good ? "잘 맞음" : rms < 6 * SD ? "거의 맞음" : "어긋남";
    j.className = good ? "n-j good" : "n-j";
    draw();
  }
  root.querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => { setCase(b.dataset.c); update(); }));
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { shape = b.dataset.s; update(); }));
  [sZ, sR, sP].forEach((el) => el.addEventListener("input", update));
  setCase("ore"); update();
})();
