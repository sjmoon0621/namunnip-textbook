/* 카드: 인공위성의 높이와 주기만으로 지구의 질량을 잴 수 있을까? — log T–log a 맞춤으로 중심 천체의 질량 구하기 */
(() => {
  const root = document.getElementById("card-labearth-orbit-mass");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const DAT = window.LE_ORBIT; if (!DAT) return;
  const G = 6.674e-11, AU = 1.495978707e8, DIST = 4.20, RJ = 71492;
  const M_TRUE = { earth: 5.972e24, jupiter: 1.898e27 };
  let sys = "earth", cur = null, ang = 0, timing = null, showTruth = false;

  const items = { earth: DAT.earth.map((s) => ({ ...s, a: s.a || DAT.RE + (s.apo + s.peri) / 2, Tmin: s.T })), jupiter: DAT.jupiter.map((s) => ({ ...s, Tmin: s.T * 1440 })) };
  const sats = $(".sats");
  function chips() {
    cur = items[sys][sys === "earth" ? 1 : 0];
    sats.innerHTML = items[sys].map((s) => `<button type="button" class="chip" data-k="${s.id}" aria-pressed="${s === cur}">${s.name}</button>`).join("");
  }

  const app = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbls = {
    earth: [{ key: "n", label: "위성" }, { key: "a", label: "a (km)", res: 1 }, { key: "T", label: "T (분)", res: 0.01 }, { key: "la", label: "log a (m)", res: 0.001 }, { key: "lt", label: "log T (s)", res: 0.001 }],
    jupiter: [{ key: "n", label: "위성" }, { key: "th", label: "최대 이각 (″)", res: 0.1 }, { key: "a", label: "a (km)", res: 1000 }, { key: "T", label: "T (일)", res: 0.01 }, { key: "la", label: "log a (m)", res: 0.001 }, { key: "lt", label: "log T (s)", res: 0.001 }],
  };
  const T = {};
  ["earth", "jupiter"].forEach((k) => { T[k] = L.table($(".t-" + k), tbls[k], () => { drawPlot(); nums(); }); });
  let tbl = T.earth;
  const rpx = (a, R0) => (sys === "earth" ? R0 * Math.pow(a / DAT.RE, 0.4) : R0 * Math.pow(a / RJ, 0.6));
  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h);
    const cx = w * 0.36, cy = h * 0.5;
    const maxA = Math.max(...items[sys].map((s) => s.a));
    const R0 = sys === "earth" ? (h * 0.46) / Math.pow(maxA / DAT.RE, 0.4) : (h * 0.46) / Math.pow(maxA / RJ, 0.6);
    items[sys].forEach((s) => {
      ctx.strokeStyle = s === cur ? "rgba(224,160,42,0.9)" : "rgba(255,255,255,0.18)"; ctx.lineWidth = s === cur ? 1.6 : 1;
      ctx.beginPath(); ctx.arc(cx, cy, rpx(s.a, R0), 0, Math.PI * 2); ctx.stroke();
    });
    if (sys === "earth") {
      const g = ctx.createRadialGradient(cx - R0 * 0.3, cy - R0 * 0.3, 2, cx, cy, R0);
      g.addColorStop(0, "#7fb4e0"); g.addColorStop(1, "#2a5d8f"); ctx.fillStyle = g;
    } else {
      const g = ctx.createLinearGradient(0, cy - R0, 0, cy + R0);
      ["#d9c3a0", "#b88a5c", "#e6d6b8", "#a87b52", "#dcc7a5"].forEach((c, i) => g.addColorStop(i / 4, c)); ctx.fillStyle = g;
    }
    ctx.beginPath(); ctx.arc(cx, cy, R0, 0, Math.PI * 2); ctx.fill();
    const r = rpx(cur.a, R0), x = cx + r * Math.cos(ang), y = cy - r * Math.sin(ang);
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill();
    // 지상국 / 관측 기준선
    ctx.strokeStyle = "rgba(212,73,58,0.8)"; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + h * 0.48, cy); ctx.stroke(); ctx.setLineDash([]);
    // 오른쪽 안내
    const tx = w * 0.70; let ty = 30;
    ctx.textAlign = "left"; ctx.fillStyle = "#f3f4ef"; ctx.font = `600 13px ${F.sans}`; ctx.fillText(cur.name, tx, ty); ty += 20;
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = "#b9bdb4";
    if (sys === "earth") {
      if (cur.apo) { ctx.fillText(`원지점 고도 ${cur.apo} km`, tx, ty); ty += 16; ctx.fillText(`근지점 고도 ${cur.peri} km`, tx, ty); ty += 16; }
      else { ctx.fillText(`지구 중심 거리 ${cur.a.toLocaleString()} km`, tx, ty); ty += 16; }
    } else { ctx.fillText(`목성까지 거리 ${DIST.toFixed(2)} AU`, tx, ty); ty += 16; }
    ty += 8; ctx.fillStyle = "#f3f4ef";
    if (timing) {
      const lab = sys === "earth" ? `통과 ${Math.min(3, Math.floor(timing.el / timing.per))}/3 회` : `관측 ${Math.min(3, Math.floor(timing.el / timing.per))}/3 주기`;
      ctx.fillText(lab, tx, ty); ty += 16;
      ctx.fillStyle = C.amber; ctx.font = `600 14px ${F.mono}`;
      ctx.fillText(sys === "earth" ? `${(timing.el / timing.per * timing.T).toFixed(1)} 분` : `${(timing.el / timing.per * timing.T / 1440).toFixed(2)} 일`, tx, ty + 4);
    } else { ctx.fillText("붉은 점선을 지날 때마다", tx, ty); ty += 16; ctx.fillText("시각을 기록합니다", tx, ty); }
    ctx.fillStyle = "#8d8d92"; ctx.font = `10.5px ${F.sans}`;
    ctx.fillText(sys === "earth" ? "거리: a^0.4 눈금 (모식)" : "거리: a^0.6 눈금 (모식)", tx, h - 14);
  }

  function fitRes() {
    const r = tbl.rows; if (r.length < 2) return null;
    const f = L.linfit(r.map((x) => x.la), r.map((x) => x.lt)); if (!f) return null;
    const f15 = r.reduce((s, x) => s + (x.lt - 1.5 * x.la), 0) / r.length;
    return { ...f, M: 4 * Math.PI ** 2 / (G * 10 ** (2 * f.b)), M15: 4 * Math.PI ** 2 / (G * 10 ** (2 * f15)) };
  }
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const pts = tbl.rows.map((r) => ({ x: r.la, y: r.lt })), f = fitRes();
    const xr = sys === "earth" ? [6.7, 8.8] : [8.5, 9.4], yr = sys === "earth" ? [3.6, 6.6] : [5.0, 6.3];
    const box = { x0: 46, y0: 22, w: w - 60, h: h - 56 };
    L.plot(ctx, box, { pts, fit: f, xr, yr, xlabel: "log a (a: m)", ylabel: "log T (T: s)", model: showTruth ? (x) => 1.5 * x + 0.5 * Math.log10(4 * Math.PI ** 2 / (G * M_TRUE[sys])) : null });
    ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillStyle = C.warn;
    if (f) { ctx.fillText(`log T = ${f.a.toFixed(3)} log a ${f.b < 0 ? "−" : "+"} ${Math.abs(f.b).toFixed(3)}`, box.x0 + 6, box.y0 + 14); ctx.fillText(`r² = ${f.r2.toFixed(5)}`, box.x0 + 6, box.y0 + 29); }
    if (showTruth) { ctx.fillStyle = C.ink3; ctx.fillText(`점선: 참 질량 ${sci(M_TRUE[sys])}의 이론선`, box.x0 + 6, box.y0 + 44); }
  }
  const sci = (x) => { const e = Math.floor(Math.log10(x)); return `${(x / 10 ** e).toFixed(2)}×10${String(e).split("").map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+c]).join("")} kg`; };
  function nums() {
    $(".n-a").textContent = `${Math.round(cur.a).toLocaleString()} km`;
    $(".k-a").textContent = sys === "earth" ? "궤도 긴반지름 a (제원표)" : "궤도 긴반지름 a (참값)";
    const f = fitRes();
    $(".n-s").textContent = f ? f.a.toFixed(4) : "—";
    $(".n-m15").textContent = f ? sci(f.M15) : "—";
    $(".n-m").textContent = f ? sci(f.M) : "—";
  }

  function record(s) {
    if (sys === "earth") {
      const T = L.measure(s.Tmin * 3, { sd: 0.09, res: 0.01 }) / 3;
      return { n: s.name, a: s.a, T, la: Math.log10(s.a * 1e3), lt: Math.log10(T * 60) };
    }
    const th = L.measure(s.a / (DIST * AU) * 206265, { sd: 1.5, res: 0.1 }), a = th / 206265 * DIST * AU;
    const T = L.measure(s.T, { sd: 0.01, res: 0.001 });
    return { n: s.name, th, a, T, la: Math.log10(a * 1e3), lt: Math.log10(T * 86400) };
  }
  loop($(".cv-wide"), (dt) => {
    const per = 2.2 * Math.pow(cur.Tmin / items[sys][0].Tmin, 0.35);   // 화면에서 한 바퀴 도는 시간 (모식)
    ang += dt * 2 * Math.PI / per;
    if (timing) { timing.el += dt; timing.per = per; if (timing.el >= per * 3 + 0.3) { tbl.add(timing.rec); timing = null; } }
    draw();
  });
  sats.addEventListener("click", (e) => {
    const b = e.target.closest("[data-k]"); if (!b || timing) return;
    cur = items[sys].find((s) => s.id === b.dataset.k);
    sats.querySelectorAll("[data-k]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); nums(); draw();
  });
  $(".sys").addEventListener("click", (e) => {
    const b = e.target.closest("[data-s]"); if (!b || timing) return;
    sys = b.dataset.s; tbl = T[sys];
    $(".t-earth").hidden = sys !== "earth"; $(".t-jupiter").hidden = sys !== "jupiter";
    root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    chips(); nums(); draw(); drawPlot();
  });
  $(".meas").addEventListener("click", () => { if (timing) return; ang = 0; timing = { el: 0, per: 1, T: cur.Tmin, rec: record(cur) }; });
  $(".clear").addEventListener("click", () => { timing = null; tbl.clear(); });
  $(".truth").addEventListener("click", (e) => { showTruth = !showTruth; e.currentTarget.setAttribute("aria-pressed", String(showTruth)); nums(); drawPlot(); });
  chips(); nums();
  if (L.demo) {
    sys = "jupiter"; items.jupiter.forEach((s) => T.jupiter.add(record(s)));
    sys = "earth";
    items.earth.forEach((s) => tbl.add(record(s)));
    nums();
  }
})();
