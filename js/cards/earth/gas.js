/* 카드: 차가운 바다에 산소가 더 많이 녹는 까닭은? — O₂·CO₂ 용해도(Weiss 식), 탄산계 pH, 산소 최소층과 생물 펌프 모식 */
(() => {
  const root = document.getElementById("card-earth-gas");
  if (!root) return;
  const { C, F, fit, axes, loop, clamp, reduce } = NM;
  const $ = (s) => root.querySelector(s);
  const K = 273.15;

  /* 산소 포화량 (mg/L): Weiss (1970), 습한 공기 1기압과 평형. ml/L × 1.42905 */
  function o2sat(T, S) {
    const t = (T + K) / 100;
    return Math.exp(-173.4292 + 249.6339 / t + 143.3483 * Math.log(t) - 21.8492 * t + S * (-0.033096 + 0.014259 * t - 0.0017 * t * t)) * 1.42905;
  }
  /* CO₂ 용해도 상수 K0 (mol/kg/atm): Weiss (1974) */
  function k0(T, S) {
    const t = (T + K) / 100;
    return Math.exp(-60.2409 + 93.4517 / t + 23.3585 * Math.log(t) + S * (0.023517 - 0.023656 * t + 0.0047036 * t * t));
  }
  /* 탄산계: 대기 CO₂(ppm)와 평형, 총알칼리도 2300 × S/35 µmol/kg일 때 pH(전체 척도)와 탄산 이온.
     K1·K2: Lueker 등 (2000), KB: Dickson (1990), Kw: Millero (1995). 염분 20 미만에서는 쓰지 않는다 */
  function carb(T, S, ppm) {
    if (S < 20) return null;
    const Tk = T + K, lnT = Math.log(Tk), sq = Math.sqrt(S);
    const K1 = 10 ** -(3633.86 / Tk - 61.2172 + 9.6777 * lnT - 0.011555 * S + 0.0001152 * S * S);
    const K2 = 10 ** -(471.78 / Tk + 25.929 - 3.16967 * lnT - 0.01781 * S + 0.0001122 * S * S);
    const KB = Math.exp((-8966.9 - 2890.53 * sq - 77.942 * S + 1.728 * S * sq - 0.0996 * S * S) / Tk + 148.0248 + 137.1942 * sq + 1.62142 * S + (-24.4344 - 25.085 * sq - 0.2474 * S) * lnT + 0.053105 * sq * Tk);
    const Kw = Math.exp(148.9652 - 13847.26 / Tk - 23.6521 * lnT + (118.67 / Tk - 5.977 + 1.0495 * lnT) * sq - 0.01615 * S);
    const BT = 0.0004157 * S / 35, TA = 2300e-6 * S / 35, co2 = k0(T, S) * ppm * 1e-6;
    const f = (h) => { const a = K1 * co2 / h; return a + 2 * K2 * a / h + BT * KB / (KB + h) + Kw / h - h - TA; };
    let lo = 1e-10, hi = 1e-6;
    for (let i = 0; i < 70; i++) { const m = Math.sqrt(lo * hi); f(m) > 0 ? (lo = m) : (hi = m); }
    const h = Math.sqrt(lo * hi), hco3 = K1 * co2 / h;
    return { pH: -Math.log10(h), co3: K2 * hco3 / h * 1e6 };
  }

  let gas = "o2";
  const val = () => ({ T: +$(".t").value, S: +$(".s").value, ppm: +$(".c").value, P: +$(".p").value / 100 });
  const c1 = fit($(".g-sol"), () => draw1()), c2 = fit($(".g-col"), () => draw2());

  function draw1() {
    const { ctx } = c1, { w, h } = c1.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { T, S, ppm } = val();
    const box = { x0: 44, y0: 24, w: w - 60, h: h - 58 };
    const fO = (t, s) => o2sat(t, s), fC = (t, s) => k0(t, s) * ppm;   // µmol/kg = mol/kg/atm × ppm(µatm)
    const f = gas === "o2" ? fO : fC, ymax = gas === "o2" ? 16 : Math.max(20, Math.ceil(fC(0, 0) * 1.15 / 10) * 10);
    const X = (t) => box.x0 + t / 30 * box.w, Y = (v) => box.y0 + box.h - v / ymax * box.h;
    const yt = []; const st = gas === "o2" ? 4 : ymax > 60 ? 20 : 10; for (let v = 0; v <= ymax; v += st) yt.push([v, String(v)]);
    axes(ctx, { ...box, X, Y, xt: [0, 5, 10, 15, 20, 25, 30].map((t) => [t, String(t)]), yt, xlabel: "수온 (°C)", ylabel: gas === "o2" ? "산소 포화량 (mg/L)" : `녹은 CO₂ (µmol/kg, 대기 ${ppm} ppm)` });
    const curve = (s, col, dash, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); for (let t = 0; t <= 30.001; t += 0.5) { const x = X(t), y = Y(f(t, s)); t ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.setLineDash([]); };
    const col = gas === "o2" ? "#3a62b0" : C.warn;
    curve(0, C.ink3, [5, 4], 1.4);
    curve(35, col, [], 1.2);
    if (Math.abs(S - 35) > 0.4 && S > 0.4) curve(S, col, [], 2.4);
    // 이름표 (오른쪽 끝)
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillStyle = C.ink3; ctx.fillText("담수", X(30) - 2, Y(f(30, 0)) - 6);
    ctx.fillStyle = col; ctx.fillText("바닷물 35 psu", X(30) - 2, Y(f(30, 35)) + 14);
    // 지금 조건
    const v = f(T, S), x = X(T), y = Y(v);
    ctx.strokeStyle = C.ink; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, Y(0)); ctx.lineTo(x, y); ctx.lineTo(box.x0, y); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.textAlign = T > 20 ? "right" : "left"; ctx.font = `600 11.5px ${F.mono}`;
    ctx.fillText(gas === "o2" ? `${v.toFixed(1)} mg/L` : `${v.toFixed(1)} µmol/kg`, x + (T > 20 ? -8 : 8), y - 12);
  }

  /* 깊이 0–1500 m 모식: 수온 → 포화량, 광합성 → 산소 극대, 호흡·분해 → 산소 최소층 */
  const Tz = (Ts, z) => 3 + (Ts - 3) * (z < 50 ? 1 : Math.exp(-(z - 50) / 260));
  function col(z) {
    const { T, P } = val();
    const sat = o2sat(Tz(T, z), 35);
    const prod = P * 1.3 * Math.exp(-(((z - 45) / 28) ** 2));
    const use = P * (5.2 * Math.exp(-(((z - 650) / 380) ** 2)) + 1.6 * (1 - Math.exp(-z / 500))) * (1 - Math.exp(-z / 120));
    const o2 = Math.max(0.05, sat + prod - use);
    const aou = Math.max(0, sat - o2);                          // 겉보기 산소 소비량 (mg/L)
    const dco2 = aou / 32 * 1000 / 1.025 * 117 / 170;            // 레드필드 비 C:O₂ = 117:170 으로 늘어난 CO₂ (µmol/kg)
    return { sat, o2, dco2 };
  }
  const parts = Array.from({ length: 34 }, (_, i) => ({ x: (i * 0.618) % 1, z: (i * 0.377 % 1) * 1500 }));
  function draw2() {
    const { ctx } = c2, { w, h } = c2.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { P } = val();
    const gap = 26, pw = (w - 52 - gap - 14) / 2;
    const A = { x0: 52, y0: 26, w: pw, h: h - 60 }, B = { x0: 52 + pw + gap, y0: 26, w: pw, h: h - 60 };
    const Y = (z) => A.y0 + z / 1500 * A.h;
    // 바다 배경: 빛이 드는 층
    const g = ctx.createLinearGradient(0, A.y0, 0, A.y0 + A.h);
    g.addColorStop(0, "rgba(116,171,102,.22)"); g.addColorStop(0.1, "rgba(58,98,176,.08)"); g.addColorStop(1, "rgba(28,30,27,.10)");
    ctx.fillStyle = g; ctx.fillRect(A.x0, A.y0, A.w, A.h); ctx.fillRect(B.x0, B.y0, B.w, B.h);
    // 가라앉는 입자 (생물 펌프)
    ctx.fillStyle = "rgba(138,90,43,.55)";
    const n = Math.round(parts.length * Math.min(1, P / 1.2));
    for (let i = 0; i < n; i++) { const p = parts[i], x = p.x < 0.5 ? A.x0 + p.x * 2 * A.w : B.x0 + (p.x - 0.5) * 2 * B.w, y = Y(p.z); ctx.beginPath(); ctx.arc(x, y, 1.6 + (i % 3) * 0.5, 0, Math.PI * 2); ctx.fill(); }
    const XA = (v) => A.x0 + v / 14 * A.w, XB = (v) => B.x0 + v / 250 * B.w;
    const yt = [0, 500, 1000, 1500].map((z) => [z, String(z)]);
    axes(ctx, { ...A, X: XA, Y, xt: [0, 4, 8, 12].map((v) => [v, String(v)]), yt, xlabel: "", ylabel: "깊이 (m)" });
    axes(ctx, { ...B, X: XB, Y, xt: [0, 100, 200].map((v) => [v, String(v)]), yt: [], xlabel: "", ylabel: "" });
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText("용존 산소 (mg/L)", A.x0 + A.w / 2, A.y0 + A.h + 28);
    ctx.fillText("호흡으로 늘어난 CO₂ (µmol/kg)", B.x0 + B.w / 2, B.y0 + B.h + 28);
    const zs = []; for (let z = 0; z <= 1500; z += 10) zs.push([z, col(z)]);
    const line = (X, k, colr, dash, lw) => { ctx.strokeStyle = colr; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); zs.forEach(([z, c], i) => (i ? ctx.lineTo(X(c[k]), Y(z)) : ctx.moveTo(X(c[k]), Y(z)))); ctx.stroke(); ctx.setLineDash([]); };
    line(XA, "sat", C.ink3, [4, 4], 1.3);
    line(XA, "o2", "#3a62b0", [], 2.4);
    line(XB, "dco2", C.warn, [], 2.4);
    // 극대·최소 표시
    let zmax = 0, zmin = 0;
    zs.forEach(([z, c]) => { if (z <= 200 && c.o2 > col(zmax).o2) zmax = z; if (c.o2 < col(zmin).o2) zmin = z; });
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink2;
    const cmax = col(zmax), cmin = col(zmin);
    if (P > 0.15) {
      ctx.fillText("산소 극대", Math.min(XA(cmax.o2) + 6, A.x0 + A.w - 50), Y(zmax) + 4);
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(XA(cmin.o2), Y(zmin), 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillText(`산소 최소층 ${zmin} m`, Math.min(XA(cmin.o2) + 7, A.x0 + A.w - 92), Y(zmin) + 16);
    }
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("점선: 포화량", A.x0 + A.w - 3, Y(300));
    $(".n-min").textContent = P > 0.15 ? `${cmin.o2.toFixed(1)} mg/L` : "없음";
    $(".n-zmin").textContent = P > 0.15 ? `${zmin} m` : "—";
    $(".n-dc").textContent = `${Math.round(col(1000).dco2)} µmol/kg`;
  }

  function nums() {
    const { T, S, ppm } = val(), cb = carb(T, S, ppm);
    $(".t-out").textContent = T; $(".s-out").textContent = S; $(".c-out").textContent = ppm; $(".p-out").textContent = $(".p").value;
    $(".n-o2").textContent = `${o2sat(T, S).toFixed(1)} mg/L`;
    $(".n-co2").textContent = `${(k0(T, S) * ppm).toFixed(1)} µmol/kg`;
    $(".n-ph").textContent = cb ? cb.pH.toFixed(2) : "— (담수)";
    $(".n-co3").textContent = cb ? `${Math.round(cb.co3)} µmol/kg` : "—";
  }
  const all = () => { nums(); draw1(); draw2(); };
  root.querySelectorAll(".t, .s, .c, .p").forEach((el) => el.addEventListener("input", () => { root.querySelectorAll("[data-pre]").forEach((x) => x.setAttribute("aria-pressed", "false")); all(); }));
  $(".gas").addEventListener("click", (e) => { const b = e.target.closest("[data-g]"); if (!b) return; gas = b.dataset.g; root.querySelectorAll("[data-g]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw1(); });
  const PRE = { trop: { t: 28, s: 35 }, polar: { t: 0, s: 34 }, pre: { c: 280 }, high: { c: 850 } };
  $(".pre").addEventListener("click", (e) => {
    const b = e.target.closest("[data-pre]"); if (!b) return; const p = PRE[b.dataset.pre];
    if (p.t != null) $(".t").value = p.t; if (p.s != null) $(".s").value = p.s; if (p.c != null) $(".c").value = p.c;
    root.querySelectorAll("[data-pre]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); all();
  });
  if (!reduce) loop($(".g-col"), (dt) => { const { P } = val(); parts.forEach((p) => { p.z += dt * (40 + 30 * P); if (p.z > 1500) { p.z = 0; p.x = Math.random(); } }); draw2(); });
  all();
  if (/[?&]demo\b/.test(location.search)) { $(".t").value = 22; $(".p").value = 130; root.querySelector('[data-g="co2"]').click(); all(); }
})();
