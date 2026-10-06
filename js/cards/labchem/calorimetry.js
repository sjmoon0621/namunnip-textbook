/* 카드: 두 단계로 잰 반응열의 합은 한 번에 잰 반응열과 같을까? — 간이 열량계, 외삽, 헤스 법칙 */
(() => {
  const root = document.getElementById("card-labchem-calorimetry");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  /* 참값 (문헌값 근사, 25 °C): NaOH(s) 용해 −44.5 kJ/mol, 강산·강염기 중화 −55.8 kJ/mol */
  const DH1 = 44.5e3, DH2 = 55.8e3, CW = 4.18, CCAL = 25, TROOM = 23.0, PURE = 0.985;   // CCAL: 컵·온도계 열용량(J/°C), PURE: 흡습으로 줄어든 NaOH 순도
  const NAME = { 1: "①", 2: "②", 3: "③" };
  let rx = 1, run = null, last = null;

  const tbl = L.table($(".tbl-host"), [
    { key: "r", label: "반응" }, { key: "mw", label: "NaOH (g)", res: 0.01 }, { key: "m", label: "용액 (g)", res: 0.1 },
    { key: "T0", label: "T₀ (°C)", res: 0.1 }, { key: "dT", label: "ΔT (°C)", res: 0.01 }, { key: "q", label: "q (J)", res: 1 },
    { key: "n", label: "n (mol)", res: 0.0001 }, { key: "dH", label: "ΔH (kJ/mol)", res: 0.1 },
  ], () => { drawPlot(); nums(); });
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());

  /* 한 번의 실험을 처음부터 끝까지 계산해 둔다 (기록은 10초 간격) */
  function simulate(r, lid) {
    const mw = r === 2 ? 0 : L.snap(2.00 + 0.02 * L.gauss(), 0.01);
    const nNa = r === 2 ? 0.0500 : mw * PURE / 40.00, nH = r === 1 ? 0 : 0.0500;
    const Q = r === 1 ? nNa * DH1 : r === 2 ? nNa * DH2 : nNa * DH1 + Math.min(nNa, nH) * DH2;
    const m = r === 2 ? 100.0 : 100.0 + mw, Ct = m * CW + CCAL;
    const tau = r === 2 ? 3 : 20, k = lid ? 9e-4 : 3.2e-3;
    let T = 22.3 + 0.5 * Math.random(), Tth = T;
    const pts = [], dt = 0.5;
    for (let i = 0; i <= 720; i++) {
      const t = i * dt;
      if (i % 20 === 0) pts.push({ t, T: L.measure(Tth, { sd: 0.03, res: 0.1 }) });
      const E = t >= 60 ? Q * (Math.exp(-(t - 60) / tau) - Math.exp(-(t + dt - 60) / tau)) : 0;   // 이 구간에 나온 열 (J)
      T += E / Ct - k * (T - TROOM) * dt;
      Tth += (T - Tth) / 3 * dt;
    }
    return { r, mw, m, n: r === 2 ? 0.0500 : +(mw / 40.00).toFixed(4), pts };
  }

  /* 기록한 온도로 ΔT 구하기: 처음 온도 평균, 뒷부분 직선을 60 s로 외삽 */
  function analyse(d, noext) {
    const pre = d.pts.filter((p) => p.t <= 60), T0 = L.stats(pre.map((p) => p.T)).mean;
    let iMax = 0; d.pts.forEach((p, i) => { if (p.T > d.pts[iMax].T) iMax = i; });
    const tail = d.pts.filter((p) => p.t >= d.pts[iMax].t + 30);
    const f = tail.length >= 3 ? L.linfit(tail.map((p) => p.t), tail.map((p) => p.T)) : null;
    const Text = f ? f.a * 60 + f.b : d.pts[iMax].T;
    const dT = noext ? d.pts[iMax].T - T0 : Text - T0;
    return { T0, Tmax: d.pts[iMax].T, Text, f, dT };
  }
  function record(d) {
    const a = analyse(d, $(".noext").checked), q = d.m * CW * a.dT;
    tbl.add({ r: NAME[d.r] + ($(".nolid").checked ? " 뚜껑×" : "") + ($(".noext").checked ? " 최고" : ""), rr: d.r, mw: d.r === 2 ? "—" : d.mw, m: d.m, T0: a.T0, dT: a.dT, q, n: d.n, dH: -q / d.n / 1000 });
  }

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const cx = w * 0.19, top = h * 0.3, bot = h - 16, cw = Math.min(w * 0.22, 92);
    const shown = run ? run.d.pts.filter((p) => p.t <= run.t) : last ? last.pts : [];
    const Tnow = shown.length ? shown[shown.length - 1].T : null;
    const heat = Tnow ? Math.min(1, Math.max(0, (Tnow - 22) / 12)) : 0;
    // 컵 두 겹
    const cup = (dx, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(cx - cw / 2 - dx, top - dx); ctx.lineTo(cx + cw / 2 + dx, top - dx); ctx.lineTo(cx + cw / 2 * 0.8 + dx, bot + dx * 0.3); ctx.lineTo(cx - cw / 2 * 0.8 - dx, bot + dx * 0.3); ctx.closePath(); ctx.fill(); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.stroke(); };
    cup(6, "#f1efe6"); cup(0, "#fbfaf4");
    const ly = top + (bot - top) * 0.3;
    ctx.fillStyle = `rgba(${Math.round(190 + 60 * heat)},${Math.round(215 - 60 * heat)},${Math.round(240 - 120 * heat)},.55)`;
    ctx.beginPath(); ctx.moveTo(cx - cw / 2 * 0.93, ly); ctx.lineTo(cx + cw / 2 * 0.93, ly); ctx.lineTo(cx + cw / 2 * 0.8, bot); ctx.lineTo(cx - cw / 2 * 0.8, bot); ctx.closePath(); ctx.fill();
    if (run && run.t > 60 && run.d.r !== 2 && run.t < 140) { ctx.fillStyle = "#fff"; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(cx - 18 + i * 7, bot - 6 - (i % 2) * 4, 2.6, 0, Math.PI * 2); ctx.fill(); } }
    // 뚜껑, 온도계, 젓개
    if (!$(".nolid").checked) { ctx.fillStyle = "#e3e0d4"; ctx.fillRect(cx - cw / 2 - 10, top - 14, cw + 20, 8); }
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx + 10, top - 50); ctx.lineTo(cx + 10, bot - 12); ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 14, top - 34); ctx.lineTo(cx - 14, bot - 10); ctx.moveTo(cx - 24, bot - 10); ctx.lineTo(cx - 4, bot - 10); ctx.stroke();
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + 10, top - 50); ctx.quadraticCurveTo(cx + 30, 10, cx + 46, 16); ctx.stroke();
    // 디지털 온도계
    const dx = cx + 46, dy = 6;
    ctx.fillStyle = C.night; ctx.fillRect(dx, dy, 74, 34);
    ctx.fillStyle = "#9fe08a"; ctx.font = `600 14px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillText(Tnow != null ? Tnow.toFixed(1) + "°C" : "--.-°C", dx + 69, dy + 16);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = "#c9d9c3";
    ctx.fillText(run ? `${Math.min(360, run.t).toFixed(0)} s` : last ? "360 s" : "0 s", dx + 69, dy + 29);
    // 헤스 순환 도표 (엔탈피 높이는 문헌값 비율)
    const x0 = w * 0.43, x1 = w - 10, yA = 30, yC = h - 26, yB = yA + (yC - yA) * DH1 / (DH1 + DH2);
    ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
    const lev = (y, txt) => { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0 + 34, y); ctx.lineTo(x1, y); ctx.stroke(); let fs = 11; ctx.font = `${fs}px ${F.mono}`; while (fs > 8 && ctx.measureText(txt).width > x1 - 60 - x0 - 38) { fs -= 0.5; ctx.font = `${fs}px ${F.mono}`; } ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.fillText(txt, x0 + 38, y - 5); };
    lev(yA, "NaOH(s) + H⁺(aq)"); lev(yB, "Na⁺ + OH⁻ + H⁺ (aq)"); lev(yC, "Na⁺(aq) + H₂O(l)");
    const arr = (x, ya, yb, lab, on) => {
      ctx.strokeStyle = on ? C.warn : C.ink3; ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = on ? 2.4 : 1.4;
      ctx.beginPath(); ctx.moveTo(x, ya + 3); ctx.lineTo(x, yb - 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 4, yb - 8); ctx.lineTo(x + 4, yb - 8); ctx.lineTo(x, yb - 1); ctx.closePath(); ctx.fill();
      ctx.font = `${on ? 600 : 400} 11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(lab, x + 6, (ya + yb) / 2 + 4);
    };
    arr(x0 + 10, yA, yC, "ΔH₃", rx === 3);
    arr(x1 - 52, yA, yB, "ΔH₁", rx === 1);
    arr(x1 - 52, yB, yC, "ΔH₂", rx === 2);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("높이: 엔탈피 (문헌값 비율)", x1, h - 6);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const d = run ? run.d : last;
    const pts = d ? d.pts.filter((p) => !run || p.t <= run.t).map((p) => ({ x: p.t, y: p.T })) : [];
    const ys = pts.map((p) => p.y);
    const yr = ys.length ? [Math.floor(Math.min(...ys) - 0.5), Math.ceil(Math.max(...ys) + 2.5)] : [20, 30];
    const P = L.plot(ctx, { x0: 44, y0: 18, w: w - 58, h: h - 52 }, { pts, xr: [0, 360], yr, xlabel: "시간 t (s)", ylabel: "온도 (°C)" });
    if (d && !run) {
      const a = analyse(d, false);
      ctx.save(); ctx.beginPath(); ctx.rect(44, 18, w - 58, h - 52); ctx.clip();
      ctx.setLineDash([4, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(P.X(0), P.Y(a.T0)); ctx.lineTo(P.X(360), P.Y(a.T0)); ctx.stroke();
      if (a.f) { ctx.strokeStyle = C.warn; ctx.beginPath(); ctx.moveTo(P.X(60), P.Y(a.Text)); ctx.lineTo(P.X(360), P.Y(a.f.a * 360 + a.f.b)); ctx.stroke(); }
      ctx.setLineDash([]); ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(P.X(60), P.Y(a.T0)); ctx.lineTo(P.X(60), P.Y(a.Text)); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
      ctx.fillText(`외삽 ΔT = ${a.dT.toFixed(2)} °C  (최고 온도로는 ${(a.Tmax - a.T0).toFixed(1)} °C)`, P.X(70), 34);
    }
  }

  function nums() {
    const avg = (r) => L.stats(tbl.rows.filter((x) => x.rr === r).map((x) => x.dH)).mean;
    const a1 = avg(1), a2 = avg(2), a3 = avg(3), f = (v) => (Number.isFinite(v) ? v.toFixed(1) + " kJ/mol" : "—");
    $(".n1").textContent = f(a1); $(".n2").textContent = f(a2); $(".n12").textContent = f(a1 + a2);
    $(".n3").textContent = Number.isFinite(a3) && Number.isFinite(a1 + a2) ? `${f(a3)} (${((a3 - a1 - a2) / Math.abs(a1 + a2) * 100).toFixed(1)}%)` : f(a3);
  }

  loop($(".cv-wide"), (dt) => {
    if (run) {
      run.t += dt * 36;   // 36배속: 6분을 10초에
      if (run.t >= 360) { last = run.d; record(run.d); run = null; }
      drawPlot();
    }
    drawApp();
  });
  $(".rx").addEventListener("click", (e) => {
    const b = e.target.closest("[data-r]"); if (!b || run) return;
    rx = +b.dataset.r; root.querySelectorAll("[data-r]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawApp();
  });
  $(".run").addEventListener("click", () => { if (!run) run = { t: 0, d: simulate(rx, !$(".nolid").checked) }; });
  $(".clear").addEventListener("click", () => { tbl.clear(); last = null; drawPlot(); });
  nums();
  if (L.demo) {
    [1, 1, 2, 2, 3, 3].forEach((r) => { const d = simulate(r, true); record(d); last = d; });
    rx = 3; root.querySelector('[data-r="3"]').click();
  }
})();
