/* 카드: 해시계의 정오와 시계의 정오는 왜 날마다 다르게 어긋날까? — 남중 시각 측정으로 균시차 구하기 */
(() => {
  const root = document.getElementById("card-labearth-equation-time");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const sDay = $(".day"), sTm = $(".tm"), sE = $(".ecc"), sO = $(".obl");
  let LON = 126.98, LAT = 37.57, city = "서울";

  const MD = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const dateLab = (doy) => { let m = 0, d = doy; while (d > MD[m]) { d -= MD[m]; m++; } return `${m + 1}월 ${d}일`; };
  const hm = (h) => { h = ((h % 24) + 24) % 24; let H = Math.floor(h), M = Math.round((h - H) * 60); if (M === 60) { H = (H + 1) % 24; M = 0; } return `${String(H).padStart(2, "0")}:${String(M).padStart(2, "0")}`; };
  const hms = (h) => { const s = Math.round(h * 3600); return `${String(Math.floor(s / 3600) % 24).padStart(2, "0")}:${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };

  /* NOAA 근사식: 적위(rad), 균시차 E(분, 시태양시 − 평균 태양시) */
  function solar(doy, kst) {
    const g = 2 * Math.PI / 365 * (doy - 1 + (kst - 12) / 24);
    const eot = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
    const dec = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
    return { eot, dec };
  }
  function pos(doy, kst) {
    const { eot, dec } = solar(doy, kst);
    const ast = kst + (4 * (LON - 135) + eot) / 60;   // 시태양시 (시)
    const H = (ast - 12) * 15 * D2R, p = LAT * D2R;
    const h = Math.asin(Math.sin(p) * Math.sin(dec) + Math.cos(p) * Math.cos(dec) * Math.cos(H));
    const A = Math.atan2(-Math.cos(dec) * Math.sin(H), Math.sin(dec) * Math.cos(p) - Math.cos(dec) * Math.cos(H) * Math.sin(p));
    return { eot, dec, ast, lmt: kst + 4 * (LON - 135) / 60, h, A };
  }
  /* 남중 시각과 해 뜨고 지는 시각 (KST, 시) — 두 번 고쳐 계산 */
  function events(doy) {
    let tr = 12 + 4 * (135 - LON) / 60;
    for (let i = 0; i < 3; i++) tr = 12 + (4 * (135 - LON) - solar(doy, tr).eot) / 60;
    const { dec } = solar(doy, tr), p = LAT * D2R;
    const c = (Math.sin(-0.833 * D2R) - Math.sin(p) * Math.sin(dec)) / (Math.cos(p) * Math.cos(dec));
    const H0 = Math.acos(Math.max(-1, Math.min(1, c))) * R2D / 15;
    return { tr, rise: tr - H0, set: tr + H0 };
  }
  /* 모형: 이심률 성분과 경사 성분 (분) */
  const Dang = (doy) => 6.24004077 + 0.01720197 * (365.25 * 26 + doy);
  const compE = (doy) => -7.659 * (+sE.value / 0.0167) * Math.sin(Dang(doy));
  const compO = (doy) => 9.863 * (Math.tan(+sO.value * D2R / 2) ** 2 / Math.tan(23.44 * D2R / 2) ** 2) * Math.sin(2 * Dang(doy) + 3.5932);

  const app = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "c", label: "장소" }, { key: "lon", label: "경도 (°E)", res: 0.01 }, { key: "d", label: "날짜" }, { key: "doy", label: "일차", res: 1 },
    { key: "tr", label: "남중 (KST)" }, { key: "E", label: "E (분)", res: 0.1 },
  ], () => drawPlot());

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const doy = +sDay.value, kst = +sTm.value, s = pos(doy, kst);
    // 왼쪽: 위에서 본 그노몬
    const gx = w * 0.30, gy = h * 0.40, sc = Math.min(w * 0.22, h * 0.34) / 2.2;
    ctx.fillStyle = "#eef0e6"; ctx.fillRect(10, 10, w * 0.58, h - 20);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    for (let r = 1; r <= 3; r++) { ctx.beginPath(); ctx.arc(gx, gy, r * sc, 0, Math.PI * 2); ctx.stroke(); }
    ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(gx, 18); ctx.lineTo(gx, h - 18); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `600 11px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText("N", gx, 24); ctx.fillText("S", gx, h - 14);
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("자오선 (남북선)", gx + 5, h - 16);
    // 그림자 끝 경로 (그날 하루)
    const tip = (t) => { const p = pos(doy, t); if (p.h <= 0.05) return null; const Lsh = 1 / Math.tan(p.h); return [gx - Math.sin(p.A) * Lsh * sc, gy + Math.cos(p.A) * Lsh * sc]; };
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.2; ctx.setLineDash([2, 3]); ctx.beginPath();
    let first = true;
    for (let t = 7; t <= 18; t += 0.05) { const q = tip(t); if (!q || Math.hypot(q[0] - gx, q[1] - gy) > sc * 3.2) { first = true; continue; } first ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]); first = false; }
    ctx.stroke(); ctx.setLineDash([]);
    const q = tip(kst);
    if (q) {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(q[0], q[1]); ctx.stroke();
      ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(q[0], q[1], 3.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(gx, gy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText(`${city} · ${dateLab(doy)}`, 18, 26); ctx.fillStyle = C.ink3; ctx.fillText("막대 1 m · 원 간격 1 m", 18, 41);
    // 오른쪽: 시계 두 개
    const clock = (cx, cy, R, t, title, col) => {
      ctx.fillStyle = C.card; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(cx + Math.sin(a) * R * 0.86, cy - Math.cos(a) * R * 0.86); ctx.lineTo(cx + Math.sin(a) * R * 0.97, cy - Math.cos(a) * R * 0.97); ctx.stroke(); }
      const hh = (t % 12) / 12 * 2 * Math.PI, mm = (t % 1) * 2 * Math.PI;
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(hh) * R * 0.5, cy - Math.cos(hh) * R * 0.5); ctx.stroke();
      ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(mm) * R * 0.8, cy - Math.cos(mm) * R * 0.8); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(hms(t), cx, cy + R + 18);
      ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.fillText(title, cx, cy - R - 8);
    };
    const R = Math.min(w * 0.075, h * 0.17);
    clock(w * 0.80, h * 0.27, R, kst, "시계 (KST, 135°E 평균시)", C.ink);
    clock(w * 0.80, h * 0.70, R, s.ast, "해시계 (시태양시)", C.warn);
  }

  function nums() {
    const doy = +sDay.value, kst = +sTm.value, s = pos(doy, kst), ev = events(doy);
    $(".n-ast").textContent = hms(s.ast); $(".n-lmt").textContent = hms(s.lmt);
    $(".n-e").textContent = (s.eot >= 0 ? "+" : "−") + Math.abs(s.eot).toFixed(1) + "분";
    $(".n-sh").textContent = s.h > 0 ? (1 / Math.tan(s.h)).toFixed(2) + " m" : "해가 짐";
    $(".n-rise").textContent = hm(ev.rise); $(".n-tr").textContent = hm(ev.tr); $(".n-set").textContent = hm(ev.set);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 24, w: w - 58, h: h - 58 };
    const pts = tbl.rows.map((r) => ({ x: r.doy, y: r.E }));
    const ax = L.plot(ctx, box, { pts, xr: [0, 366], yr: [-25, 25], xlabel: "1월 1일부터 지난 날 (일)", ylabel: "균시차 E (분) = 12:00 + 경도 보정 − 남중 시각" });
    const line = (f, col, dash) => {
      ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
      ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.setLineDash(dash); ctx.beginPath();
      for (let d = 1; d <= 365; d += 2) d > 1 ? ctx.lineTo(ax.X(d), ax.Y(f(d))) : ctx.moveTo(ax.X(d), ax.Y(f(d)));
      ctx.stroke(); ctx.restore();
    };
    if ($(".c-e").checked) line(compE, C.leaf, [5, 4]);
    if ($(".c-o").checked) line(compO, C.amber, [5, 4]);
    if ($(".c-s").checked) line((d) => compE(d) + compO(d), C.warn, []);
    ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; let y = box.y0 + 14;
    [[".c-e", C.leaf, "이심률 성분"], [".c-o", C.amber, "경사 성분"], [".c-s", C.warn, "합 (모형)"]].forEach(([k, c, t]) => { if (!$(k).checked) return; ctx.fillStyle = c; ctx.fillText("— " + t, box.x0 + 6, y); y += 14; });
  }

  function measure() {
    const doy = +sDay.value, ev = events(doy);
    const t = L.measure(ev.tr * 60, { sd: 1.0, res: 1 }) / 60;
    tbl.add({ c: city, lon: LON, d: dateLab(doy), doy, tr: hm(t), E: 12 * 60 + 4 * (135 - LON) - t * 60 });
  }
  const upd = () => {
    $(".d-out").textContent = dateLab(+sDay.value); $(".t-out").textContent = hm(+sTm.value);
    $(".e-out").textContent = (+sE.value).toFixed(4); $(".o-out").textContent = (+sO.value).toFixed(1);
    nums(); draw();
  };
  [sDay, sTm].forEach((el) => el.addEventListener("input", upd));
  [sE, sO].forEach((el) => el.addEventListener("input", () => { upd(); drawPlot(); }));
  root.querySelectorAll(".opts input").forEach((el) => el.addEventListener("change", drawPlot));
  $(".city").addEventListener("click", (e) => {
    const b = e.target.closest("[data-lon]"); if (!b) return;
    LON = +b.dataset.lon; LAT = +b.dataset.lat; city = b.textContent;
    root.querySelectorAll("[data-lon]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); upd();
  });
  $(".meas").addEventListener("click", measure);
  $(".clear").addEventListener("click", () => tbl.clear());
  upd();
  if (L.demo) {
    for (let d = 8; d <= 365; d += 15) { sDay.value = d; measure(); }
    sDay.value = 42; sTm.value = 12.5; upd();
  }
})();
