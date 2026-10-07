/* 카드: 매일 같은 시각에 찍은 태양은 왜 8자를 그리고, 화성은 왜 뒤로 갈까? — 아날렘마와 화성의 역행 시뮬레이션 */
(() => {
  const root = document.getElementById("card-labearth-analemma");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const LAT = 37.57, LON = 126.98;
  const sDay = $(".day"), sTm = $(".tm"), sM = $(".mday"), ghost = $(".ghost");
  let mode = "ana", yKey = "h";

  const MD = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const dateLab = (doy) => { let m = 0, d = doy; while (d > MD[m]) { d -= MD[m]; m++; } return `${m + 1}월 ${d}일`; };
  const hm = (h) => { let H = Math.floor(h), M = Math.round((h - H) * 60); if (M === 60) { H++; M = 0; } return `${String(H).padStart(2, "0")}:${String(M).padStart(2, "0")}`; };

  /* NOAA 근사식: doy, KST 시각 → 적위(°), 균시차(분, 시태양시 − 평균 태양시), 고도·방위각 */
  function sun(doy, kst) {
    const g = 2 * Math.PI / 365 * (doy - 1 + (kst - 12) / 24);
    const eot = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
    const dec = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
    const tst = kst * 60 + eot + 4 * LON - 540;
    const H = (tst / 4 - 180) * D2R, p = LAT * D2R;
    const sh = Math.sin(p) * Math.sin(dec) + Math.cos(p) * Math.cos(dec) * Math.cos(H), h = Math.asin(sh);
    const A = Math.atan2(-Math.cos(dec) * Math.sin(H), Math.sin(dec) * Math.cos(p) - Math.cos(dec) * Math.cos(H) * Math.sin(p));
    return { dec: dec * R2D, eot, h: h * R2D, A: ((A * R2D) % 360 + 360) % 360 };
  }

  /* JPL 근사 궤도 요소 (Standish 1992, 1800–2050년용): a, e, I, L, 근일점 경도, 승교점 경도와 세기당 변화율 */
  const EL = {
    E: [[1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0], [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0]],
    M: [[1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891], [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343]],
  };
  function helio(k, jd) {
    const T = (jd - 2451545) / 36525, [e0, r] = EL[k], v = e0.map((x, i) => x + r[i] * T);
    const [a, e, I, Lm, wb, Om] = v, om = (wb - Om) * D2R, M = (((Lm - wb) % 360) + 540) % 360 - 180;
    let E = M * D2R + e * Math.sin(M * D2R);
    for (let i = 0; i < 8; i++) E -= (E - e * Math.sin(E) - M * D2R) / (1 - e * Math.cos(E));
    const xp = a * (Math.cos(E) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
    const cO = Math.cos(Om * D2R), sO = Math.sin(Om * D2R), cI = Math.cos(I * D2R), sI = Math.sin(I * D2R), cw = Math.cos(om), sw = Math.sin(om);
    return [(cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp, (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp, sw * sI * xp + cw * sI * yp];
  }
  const JD0 = 2460492.5;   // 2024-07-01 0h UT
  function mars(day) {
    const jd = JD0 + day, e = helio("E", jd), m = helio("M", jd);
    const x = m[0] - e[0], y = m[1] - e[1], z = m[2] - e[2];
    const lam = ((Math.atan2(y, x) * R2D) % 360 + 360) % 360, bet = Math.atan2(z, Math.hypot(x, y)) * R2D;
    const sunLam = ((Math.atan2(-e[1], -e[0]) * R2D) % 360 + 360) % 360;
    let el = lam - sunLam; el = ((el + 540) % 360) - 180;
    return { lam, bet, dist: Math.hypot(x, y, z), el };
  }
  const mDate = (day) => { const d = new Date(Date.UTC(2024, 6, 1) + day * 864e5); return d.toISOString().slice(0, 10); };
  /* 황도 근처 밝은 별 (J2000 황경·황위, °) */
  const BG = [["카스토르", 110.23, 10.10], ["폴룩스", 113.22, 6.68], ["프로키온", 115.79, -16.02], ["레굴루스", 149.83, 0.47], ["알헤나", 99.08, -6.75], ["베텔게우스", 88.79, -16.03]];

  const app = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tA = L.table($(".t-ana"), [{ key: "d", label: "날짜" }, { key: "doy", label: "일차", res: 1 }, { key: "t", label: "시각" }, { key: "h", label: "고도 (°)", res: 0.1 }, { key: "A", label: "방위각 (°)", res: 0.1 }], () => { draw(); drawPlot(); });
  const tM = L.table($(".t-mars"), [{ key: "d", label: "날짜 (UT)" }, { key: "day", label: "경과일", res: 1 }, { key: "lam", label: "황경 λ (°)", res: 0.1 }, { key: "bet", label: "황위 β (°)", res: 0.1 }], () => { draw(); drawPlot(); });

  function drawAna(ctx, w, h) {
    const box = { x0: 40, y0: 14, w: w - 54, h: h - 46 };
    const A0 = 140, A1 = 220, H0 = 0, H1 = 82;
    const X = (A) => box.x0 + (A - A0) / (A1 - A0) * box.w, Y = (v) => box.y0 + box.h - (v - H0) / (H1 - H0) * box.h;
    ctx.fillStyle = "#e8eef3"; ctx.fillRect(box.x0, box.y0, box.w, box.h);
    ctx.fillStyle = "#c9d8b8"; ctx.fillRect(box.x0, Y(0), box.w, h - Y(0));
    NM.axes(ctx, { ...box, X, Y, xt: [[150, "150°"], [165, "165°"], [180, "남 180°"], [195, "195°"], [210, "210°"]], yt: [0, 20, 40, 60, 80].map((v) => [v, v + "°"]), xlabel: "방위각", ylabel: "고도" });
    if (ghost.checked) {
      ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath();
      for (let d = 1; d <= 366; d++) { const s = sun(d > 365 ? 1 : d, +sTm.value); d > 1 ? ctx.lineTo(X(s.A), Y(s.h)) : ctx.moveTo(X(s.A), Y(s.h)); }
      ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.fillStyle = C.amber; ctx.strokeStyle = C.warn;
    tA.rows.forEach((r) => { ctx.beginPath(); ctx.arc(X(r.A), Y(r.h), 4, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 0.8; ctx.stroke(); });
    const s = sun(+sDay.value, +sTm.value);
    ctx.fillStyle = "rgba(224,160,42,0.25)"; ctx.beginPath(); ctx.arc(X(s.A), Y(s.h), 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(X(s.A), Y(s.h), 6, 0, Math.PI * 2); ctx.fill();
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText(`서울 (37.6°N, 127.0°E) · 매일 ${hm(+sTm.value)} KST`, box.x0 + 6, box.y0 + 14);
    ctx.textAlign = "right"; ctx.fillText(`기록 ${tA.rows.length}장`, box.x0 + box.w - 6, box.y0 + 14);
  }
  function marsView() {
    const pts = []; for (let d = 0; d <= 425; d += 5) pts.push(mars(d));
    return { lo: Math.floor(Math.min(...pts.map((p) => p.lam)) / 10) * 10 - 5, hi: Math.ceil(Math.max(...pts.map((p) => p.lam)) / 10) * 10 + 5 };
  }
  const MV = marsView();
  function drawMars(ctx, w, h) {
    const box = { x0: 40, y0: 14, w: w - 54, h: h - 46 };
    const X = (l) => box.x0 + (MV.hi - l) / (MV.hi - MV.lo) * box.w, Y = (b) => box.y0 + box.h / 2 - b / 20 * box.h;   // 황경은 왼쪽(동쪽)으로 증가
    ctx.fillStyle = C.night; ctx.fillRect(box.x0, box.y0, box.w, box.h);
    const xt = []; for (let v = Math.ceil(MV.lo / 20) * 20; v <= MV.hi; v += 20) xt.push([v, v + "°"]);
    NM.axes(ctx, { ...box, X, Y, xt, yt: [-8, 0, 8].map((v) => [v, v + "°"]), xlabel: "황경 λ (← 동쪽)", ylabel: "황위 β" });
    ctx.strokeStyle = "rgba(224,160,42,0.5)"; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(box.x0, Y(0)); ctx.lineTo(box.x0 + box.w, Y(0)); ctx.stroke(); ctx.setLineDash([]);
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    BG.forEach(([n, l, b]) => { const x = X(l), y = Y(b); ctx.fillStyle = "#f3f4ef"; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#b9bdb4"; ctx.fillText(n, x + 5, y - 4); });
    if (ghost.checked) {
      ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.setLineDash([3, 3]); ctx.beginPath();
      for (let d = 0; d <= 425; d += 2) { const m = mars(d); d ? ctx.lineTo(X(m.lam), Y(m.bet)) : ctx.moveTo(X(m.lam), Y(m.bet)); }
      ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.fillStyle = "#e07a5a"; tM.rows.forEach((r) => { ctx.beginPath(); ctx.arc(X(r.lam), Y(r.bet), 3.2, 0, Math.PI * 2); ctx.fill(); });
    const m = mars(+sM.value);
    ctx.fillStyle = C.apple; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(X(m.lam), Y(m.bet), 5.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = "#d9dad2"; ctx.textAlign = "left";
    ctx.fillText(`화성 · ${mDate(+sM.value)} · 점선: 황도`, box.x0 + 6, box.y0 + 14);
  }
  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    mode === "ana" ? drawAna(ctx, w, h) : drawMars(ctx, w, h);
  }
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 48, y0: 22, w: w - 62, h: h - 56 };
    if (mode === "ana") {
      const pts = tA.rows.map((r) => ({ x: r.doy, y: r[yKey] }));
      L.plot(ctx, box, { pts, xr: [0, 366], yr: yKey === "h" ? [0, 90] : null, xlabel: "1월 1일부터 지난 날 (일)", ylabel: yKey === "h" ? "고도 (°)" : "방위각 (°)" });
    } else {
      const pts = tM.rows.map((r) => ({ x: r.day, y: r.lam }));
      L.plot(ctx, box, { pts, xr: [0, 426], yr: [MV.lo, MV.hi], xlabel: "2024-07-01부터 지난 날 (일)", ylabel: "황경 λ (°)" });
      const r = tM.rows.slice().sort((a, b) => a.day - b.day);
      for (let i = 1; i < r.length; i++) if (r[i].lam < r[i - 1].lam) {
        const X = (v) => box.x0 + v / 426 * box.w;
        ctx.fillStyle = "rgba(181,83,47,0.12)"; ctx.fillRect(X(r[i - 1].day), box.y0, X(r[i].day) - X(r[i - 1].day), box.h);
      }
      ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.warn; ctx.textAlign = "right";
      ctx.fillText("붉은 띠: 황경이 줄어든 구간", box.x0 + box.w - 4, box.y0 + box.h - 8);
    }
  }
  function nums() {
    if (mode === "ana") {
      const s = sun(+sDay.value, +sTm.value);
      $(".k1").textContent = "고도"; $(".v1").textContent = s.h.toFixed(1) + "°";
      $(".k2").textContent = "방위각"; $(".v2").textContent = s.A.toFixed(1) + "°";
      $(".k3").textContent = "적위 δ"; $(".v3").textContent = (s.dec >= 0 ? "+" : "−") + Math.abs(s.dec).toFixed(1) + "°";
      $(".k4").textContent = "균시차 (시태양시 − 평균)"; $(".v4").textContent = (s.eot >= 0 ? "+" : "−") + Math.abs(s.eot).toFixed(1) + "분";
    } else {
      const m = mars(+sM.value), m2 = mars(+sM.value + 1);
      let dl = m2.lam - m.lam; dl = ((dl + 540) % 360) - 180;
      $(".k1").textContent = "황경 λ"; $(".v1").textContent = m.lam.toFixed(1) + "°";
      $(".k2").textContent = "황위 β"; $(".v2").textContent = (m.bet >= 0 ? "+" : "−") + Math.abs(m.bet).toFixed(2) + "°";
      $(".k3").textContent = "태양과의 이각"; $(".v3").textContent = Math.abs(m.el).toFixed(0) + "° " + (m.el >= 0 ? "동" : "서");
      $(".k4").textContent = "지구–화성 거리"; $(".v4").textContent = m.dist.toFixed(2) + " AU";
    }
  }
  function measure() {
    if (mode === "ana") {
      const d = +sDay.value, t = +sTm.value, s = sun(d, t);
      tA.add({ d: dateLab(d), doy: d, t: hm(t), h: L.measure(s.h, { sd: 0.1, res: 0.1 }), A: L.measure(s.A, { sd: 0.1, res: 0.1 }) });
    } else {
      const d = +sM.value, m = mars(d);
      tM.add({ d: mDate(d), day: d, lam: L.measure(m.lam, { sd: 0.1, res: 0.1 }), bet: L.measure(m.bet, { sd: 0.1, res: 0.1 }) });
    }
  }
  const upd = () => {
    $(".d-out").textContent = dateLab(+sDay.value); $(".t-out").textContent = hm(+sTm.value); $(".md-out").textContent = mDate(+sM.value);
    nums(); draw();
  };
  [sDay, sTm, sM, ghost].forEach((el) => el.addEventListener("input", upd));
  ghost.addEventListener("change", upd);
  $(".step").addEventListener("click", (e) => { const b = e.target.closest("[data-s]"); if (!b) return; sM.value = Math.min(425, +sM.value + +b.dataset.s); upd(); });
  $(".mode").addEventListener("click", (e) => {
    const b = e.target.closest("[data-m]"); if (!b) return;
    mode = b.dataset.m;
    root.querySelectorAll("[data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    $(".g-ana").hidden = $(".t-ana").hidden = $(".ysel").hidden = mode !== "ana";
    $(".g-mars").hidden = $(".t-mars").hidden = mode !== "mars";
    upd(); drawPlot();
  });
  $(".ysel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-y]"); if (!b) return;
    yKey = b.dataset.y; root.querySelectorAll("[data-y]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  $(".meas").addEventListener("click", measure);
  $(".clear").addEventListener("click", () => (mode === "ana" ? tA : tM).clear());
  upd();
  if (L.demo) {
    for (let d = 5; d <= 365; d += 14) { sDay.value = d; measure(); }
    mode = "mars";
    for (let d = 0; d <= 425; d += 14) { sM.value = d; measure(); }
    mode = "ana"; sDay.value = 80; sM.value = 200; upd();
  }
})();
