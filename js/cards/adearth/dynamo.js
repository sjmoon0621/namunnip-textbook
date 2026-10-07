/* 카드: 지구 자기장은 왜 사라지지 않을까 — ① 지온과 퀴리 온도 ② 자유 감쇠와 다이너모(모식) ③ 중심 쌍극자와 복각 */
(() => {
  const root = document.getElementById("card-adearth-dynamo");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sG = $(".g"), sS = $(".s"), sL = $(".l"), cD = $(".dyn");
  let mode = "1";
  const T = (z, g) => 1330 * (1 - Math.exp(-g * z / 1330)) + 0.4 * z;
  const curieDepth = (Tc, g) => { let a = 0, b = 400; for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (T(m, g) < Tc) a = m; else b = m; } return (a + b) / 2; };
  const MU0 = 4 * Math.PI * 1e-7, RC = 3.48e6, YR = 3.156e7;
  const tauYr = (sig) => MU0 * sig * RC * RC / (Math.PI * Math.PI) / YR;
  /* 모식 다이너모: 요동하는 쌍극자 세기, 약 330천 년에 한 번 역전 */
  const dyn = (t) => {
    const wob = 0.8 + 0.12 * Math.sin(t / 23) + 0.08 * Math.sin(t / 7.3 + 1) + 0.05 * Math.sin(t / 2.9 + 2);
    const tr = 330, wd = 4, sgn = Math.tanh((tr - t) / wd), dip = 1 - 0.75 * Math.exp(-(((t - tr) / 9) ** 2));
    return wob * dip * sgn;
  };
  const { ctx, size } = fit(cv, () => draw());
  function txt(s, x, y, al = "left", col = C.ink3, f = `10px ${F.mono}`) { ctx.fillStyle = col; ctx.font = f; ctx.textAlign = al; ctx.fillText(s, x, y); }
  function draw1(w, h) {
    const g = +sG.value, x0 = 48, x1 = w - 14, y0 = 30, y1 = h - 30, ZM = 150, TM = 1600;
    const X = (t) => x0 + t / TM * (x1 - x0), Y = (z) => y0 + z / ZM * (y1 - y0);
    const zc = curieDepth(580, g), zf = curieDepth(770, g);
    ctx.fillStyle = "rgba(63,111,163,.13)"; ctx.fillRect(x0, y0, x1 - x0, Y(zc) - y0);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.font = `10px ${F.mono}`;
    for (let t = 0; t <= TM; t += 400) { const x = Math.round(X(t)) + 0.5; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); txt(String(t), x, y0 - 6, "center"); }
    for (let z = 0; z <= ZM; z += 50) { const y = Math.round(Y(z)) + 0.5; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); txt(String(z), x0 - 5, y + 3, "right"); }
    txt("온도 (°C)", x1, y0 - 18, "right"); txt("깊이 (km)", x0 - 40, y0 - 18, "left");
    [[580, "#3f6fa3", "자철석 퀴리 온도 580 °C"], [770, "#7a5ea8", "철 770 °C"]].forEach(([t, col, lab], i) => {
      ctx.strokeStyle = col; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(t), y0); ctx.lineTo(X(t), y1); ctx.stroke(); ctx.setLineDash([]);
      txt(lab, i ? X(t) + 4 : X(t) - 4, y1 - 8, i ? "left" : "right", col, `10px ${F.sans}`);
    });
    ctx.strokeStyle = C.apple; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let z = 0; z <= ZM; z += 1) { const x = X(T(z, g)), y = Y(z); if (z) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.stroke();
    ctx.fillStyle = "#3f6fa3"; ctx.beginPath(); ctx.arc(X(580), Y(zc), 4, 0, Math.PI * 2); ctx.fill();
    txt("영구 자화가 가능한 껍질", X(TM) - 4, Math.max(y0 + 12, Math.min(Y(zc) - 6, y0 + 12)), "right", "#3f6fa3", `10.5px ${F.sans}`);
    txt("지온 곡선(모식)", X(T(110, g)) + 6, Y(110), "left", C.apple, `10.5px ${F.sans}`);
    txt("↓ 2891 km 아래 핵: 약 3500~5500 °C", x0 + 4, y1 + 20, "left", C.ink2, `10.5px ${F.sans}`);
    return { zc, zf };
  }
  function draw2(w, h) {
    const sig = 10 ** +sS.value, tau = tauYr(sig) / 1000, x0 = 44, x1 = w - 14, y0 = 26, y1 = h - 34, TM = 500;
    const X = (t) => x0 + t / TM * (x1 - x0), Y = (b) => y0 + (1.15 - b) / 2.3 * (y1 - y0);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    for (let t = 0; t <= TM; t += 100) { const x = Math.round(X(t)) + 0.5; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); txt(String(t), x, y1 + 14, "center"); }
    for (const b of [-1, -0.5, 0, 0.5, 1]) { const y = Math.round(Y(b)) + 0.5; ctx.strokeStyle = b === 0 ? C.ink3 : C.rule; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); txt(b.toFixed(1), x0 - 5, y + 3, "right"); }
    txt("시간 (천 년)", x1, y1 + 28, "right"); txt("쌍극자 세기 (처음 = 1, 음수는 역전)", x0, y0 - 10);
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let i = 0; i <= 400; i++) { const t = i / 400 * TM, v = Math.exp(-t / tau); if (i) ctx.lineTo(X(t), Y(v)); else ctx.moveTo(X(t), Y(v)); }
    ctx.stroke();
    const tl = Math.min(TM * 0.55, tau * 1.1);
    txt("다이너모 없음: e^(−t/τ)", X(tl) + 6, Y(Math.exp(-tl / tau)) - 6, "left", "#3f6fa3", `10.5px ${F.sans}`);
    ctx.strokeStyle = "rgba(63,111,163,.6)"; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    if (tau < TM) { ctx.beginPath(); ctx.moveTo(X(tau), Y(1 / Math.E)); ctx.lineTo(X(tau), Y(0)); ctx.stroke(); txt("τ", X(tau) + 3, Y(0) - 4, "left", "#3f6fa3"); }
    ctx.setLineDash([]);
    if (cD.checked) {
      ctx.strokeStyle = C.apple; ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i <= 600; i++) { const t = i / 600 * TM, v = dyn(t); if (i) ctx.lineTo(X(t), Y(v)); else ctx.moveTo(X(t), Y(v)); }
      ctx.stroke();
      txt("다이너모 있음(모식): 요동하며 유지, 가끔 역전", X(20), Y(1.07), "left", C.apple, `10.5px ${F.sans}`);
      txt("역전", X(330) + 6, Y(-0.15), "left", C.apple, `10.5px ${F.sans}`);
    }
    return { tau };
  }
  function draw3(w, h) {
    const lam = +sL.value * Math.PI / 180, cx = w * 0.27, cy = h * 0.5, R = Math.min(w * 0.13, h * 0.22);
    /* 자기력선 r = L cos²φ (지구 반지름 단위) */
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w * 0.56, h); ctx.clip();
    ctx.strokeStyle = "rgba(122,94,168,.55)"; ctx.lineWidth = 1.1;
    for (const Lr of [1.2, 1.5, 1.9, 2.5, 3.4]) for (const s of [1, -1]) {
      ctx.beginPath(); let first = true;
      for (let i = -200; i <= 200; i++) {
        const ph = i / 200 * Math.PI / 2, r = Lr * Math.cos(ph) ** 2;
        if (r < 1) { first = true; continue; }
        const x = cx + s * r * R * Math.cos(ph), y = cy - r * R * Math.sin(ph);
        if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
      }
      ctx.stroke();
      const xe = cx + s * Lr * R, ye = cy;
      ctx.fillStyle = "rgba(122,94,168,.8)"; ctx.beginPath(); ctx.moveTo(xe, ye - 5); ctx.lineTo(xe - 3.5, ye + 2); ctx.lineTo(xe + 3.5, ye + 2); ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = "#f2d7a6"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#efc98d"; ctx.beginPath(); ctx.arc(cx, cy, R * 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(cx, cy - R * 1.25); ctx.lineTo(cx, cy + R * 1.25); ctx.stroke(); ctx.setLineDash([]);
    txt("N", cx, cy - R * 1.25 - 4, "center", C.ink, `bold 11px ${F.mono}`); txt("S", cx, cy + R * 1.25 + 12, "center", C.ink, `bold 11px ${F.mono}`);
    /* 관측 지점 */
    const px = cx + R * Math.cos(lam), py = cy - R * Math.sin(lam), out = [Math.cos(lam), -Math.sin(lam)], north = [-Math.sin(lam), -Math.cos(lam)];
    const bh = Math.cos(lam), bv = -2 * Math.sin(lam), bn = Math.hypot(bh, bv), L = 34;
    const fx = (bh * north[0] + bv * out[0]) / bn, fy = (bh * north[1] + bv * out[1]) / bn;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px - north[0] * 30, py - north[1] * 30); ctx.lineTo(px + north[0] * 30, py + north[1] * 30); ctx.stroke();
    ctx.strokeStyle = C.apple; ctx.fillStyle = C.apple; ctx.lineWidth = 2.4;
    const ex = px + fx * L, ey = py + fy * L;
    ctx.beginPath(); ctx.moveTo(px - fx * L * 0.3, py - fy * L * 0.3); ctx.lineTo(ex, ey); ctx.stroke();
    const an = Math.atan2(fy, fx); ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 8 * Math.cos(an - 0.4), ey - 8 * Math.sin(an - 0.4)); ctx.lineTo(ex - 8 * Math.cos(an + 0.4), ey - 8 * Math.sin(an + 0.4)); ctx.fill();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
    txt("수평선", px + north[0] * 32 + 4, py + north[1] * 32, "left", C.ink2, `10px ${F.sans}`);
    /* 오른쪽 그래프: 복각–위도 */
    const g0 = w * 0.62, g1 = w - 12, gy0 = 30, gy1 = h - 34;
    const X = (d) => g0 + (d + 90) / 180 * (g1 - g0), Y = (d) => gy0 + (90 - d) / 180 * (gy1 - gy0);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    for (const d of [-90, -45, 0, 45, 90]) {
      const x = Math.round(X(d)) + 0.5, y = Math.round(Y(d)) + 0.5;
      ctx.beginPath(); ctx.moveTo(x, gy0); ctx.lineTo(x, gy1); ctx.stroke(); ctx.beginPath(); ctx.moveTo(g0, y); ctx.lineTo(g1, y); ctx.stroke();
      txt(String(d), x, gy1 + 13, "center"); txt(String(d), g0 - 4, y + 3, "right");
    }
    txt("자기 위도 λ (°)", g1, gy1 + 27, "right"); txt("복각 I (°)", g0 - 22, gy0 - 10);
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(-90), Y(-90)); ctx.lineTo(X(90), Y(90)); ctx.stroke(); ctx.setLineDash([]);
    txt("I = λ", X(48), Y(38), "left", C.ink3, `10px ${F.sans}`);
    ctx.strokeStyle = C.apple; ctx.lineWidth = 2; ctx.beginPath();
    for (let d = -90; d <= 90; d += 1) { const I = Math.atan(2 * Math.tan(d * Math.PI / 180)) * 180 / Math.PI; if (d > -90) ctx.lineTo(X(d), Y(I)); else ctx.moveTo(X(d), Y(-90)); }
    ctx.stroke();
    const Id = Math.atan(2 * Math.tan(lam)) * 180 / Math.PI;
    ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(X(+sL.value), Y(Id), 4.5, 0, Math.PI * 2); ctx.fill();
    txt("tan I = 2 tan λ", X(-85), Y(70), "left", C.apple, `10.5px ${F.sans}`);
    return { Id };
  }
  let res = {};
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    res = mode === "1" ? draw1(w, h) : mode === "2" ? draw2(w, h) : draw3(w, h);
  }
  function setNums(a) { a.forEach(([dt, dd], i) => { $(".d" + (i + 1)).textContent = dt; $(".n" + (i + 1)).textContent = dd; }); }
  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === mode)));
    root.querySelectorAll(".dy-pane").forEach((p) => { p.hidden = p.dataset.p !== mode; });
    $(".g-out").textContent = sG.value;
    const sig = 10 ** +sS.value; $(".s-out").textContent = `${(sig / 1e6).toPrecision(2)} × 10⁶`;
    $(".l-out").textContent = sL.value;
    draw();
    if (mode === "1") setNums([["자철석이 자성을 잃는 깊이", `${res.zc.toFixed(0)} km`], ["철이 자성을 잃는 깊이", `${res.zf.toFixed(0)} km`], ["지구 반지름에 대한 비율", `${(res.zc / 6371 * 100).toFixed(1)} %`]]);
    else if (mode === "2") {
      const tau = res.tau, lg = -(3.5e6 / tau) / Math.LN10;
      setNums([["자유 감쇠 시간 τ", `${tau.toFixed(0)}천 년`], ["10만 년 뒤 남는 세기", Math.exp(-100 / tau) < 1e-3 ? Math.exp(-100 / tau).toExponential(1) : Math.exp(-100 / tau).toFixed(3)], ["35억 년 뒤 남는 세기", `10^(${lg.toFixed(0)})`]]);
    } else {
      const lam = +sL.value * Math.PI / 180, B = 30 * Math.sqrt(1 + 3 * Math.sin(lam) ** 2);
      setNums([["복각 I (아래로 +)", `${res.Id.toFixed(1)}°`], ["자기장 세기 B", `${B.toFixed(1)} μT`], ["수평 성분 B₀cos λ", `${(30 * Math.cos(lam)).toFixed(1)} μT`]]);
    }
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; update(); }));
  [sG, sS, sL].forEach((el) => el.addEventListener("input", update)); cD.addEventListener("change", update);
  update();
})();
