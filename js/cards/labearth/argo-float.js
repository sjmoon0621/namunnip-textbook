/* 카드: 플로트 한 대의 7년 기록에서 무엇을 읽어 낼 수 있을까? — Argo 2902533 궤적, 프로파일, QC 플래그, 염분 센서 표류 */
(() => {
  const root = document.getElementById("card-labearth-argo-float");
  if (!root || !window.NMArgoFloat) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const A = window.NMArgoFloat, TR = A.traj;
  const LAND = (window.NMEastAsia && window.NMEastAsia.land) || [];
  const $ = (s) => root.querySelector(s);
  const sC = $(".af-cyc");
  const PC = Object.keys(A.prof).map(Number).sort((a, b) => a - b);
  let pc = 101, vKey = "T", xKey = "dist";
  const LON0 = 121, LON1 = 161, LAT0 = 15, LAT1 = 33;
  const day = (s) => Date.parse(s.replace(" ", "T") + ":00Z") / 864e5;
  const hav = (a, b, c, d) => {
    const r = Math.PI / 180, x = Math.sin((c - a) * r / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin((d - b) * r / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.sqrt(x));
  };

  const host = $(".psel");
  PC.forEach((c) => {
    const b = document.createElement("button");
    b.className = "chip"; b.dataset.c = c; b.setAttribute("aria-pressed", String(c === pc)); b.textContent = c;
    host.appendChild(b);
  });

  const cv = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "c", label: "주기", res: 1 }, { key: "date", label: "날짜" }, { key: "lat", label: "위도", res: 0.001 }, { key: "lon", label: "경도", res: 0.001 },
    { key: "km", label: "거리 (km)", res: 1 }, { key: "sr", label: "S 원시", res: 0.001 }, { key: "sa", label: "S 보정", res: 0.001 },
  ], () => drawPlot());

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    /* 왼쪽: 지도 */
    const mx0 = 4, mx1 = w * 0.6, my0 = 6, my1 = h - 18;
    const cl = Math.cos(24 * Math.PI / 180), sc = Math.min((mx1 - mx0) / ((LON1 - LON0) * cl), (my1 - my0) / (LAT1 - LAT0));
    const myB = my1 - Math.max(0, ((my1 - my0) - (LAT1 - LAT0) * sc) / 2);
    const MX = (lo) => mx0 + (lo - LON0) * cl * sc, MY = (la) => myB - (la - LAT0) * sc;
    const mxR = MX(LON1), myT = MY(LAT1);
    ctx.save(); ctx.beginPath(); ctx.rect(mx0, myT, mxR - mx0, myB - myT); ctx.clip();
    ctx.fillStyle = "#e7eef2"; ctx.fillRect(mx0, myT, mxR - mx0, myB - myT);
    ctx.fillStyle = "#d8d6c8"; ctx.strokeStyle = "#b9b6a4"; ctx.lineWidth = 0.6;
    LAND.forEach((p) => {
      let lo = 999, hi = -999, la = 999, lh = -999;
      for (let i = 0; i < p.length; i += 2) { lo = Math.min(lo, p[i]); hi = Math.max(hi, p[i]); la = Math.min(la, p[i + 1]); lh = Math.max(lh, p[i + 1]); }
      if (hi < LON0 || lo > LON1 || lh < LAT0 || la > LAT1) return;
      ctx.beginPath(); for (let i = 0; i < p.length; i += 2) (i ? ctx.lineTo(MX(p[i]), MY(p[i + 1])) : ctx.moveTo(MX(p[i]), MY(p[i + 1])));
      ctx.closePath(); ctx.fill(); ctx.stroke();
    });
    ctx.strokeStyle = "rgba(141,141,146,.35)"; ctx.lineWidth = 0.6; ctx.font = `9.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    for (let lo = 125; lo <= 160; lo += 10) { ctx.beginPath(); ctx.moveTo(MX(lo), myT); ctx.lineTo(MX(lo), myB); ctx.stroke(); }
    for (let la = 20; la <= 30; la += 5) { ctx.beginPath(); ctx.moveTo(mx0, MY(la)); ctx.lineTo(mxR, MY(la)); ctx.stroke(); ctx.textAlign = "left"; ctx.fillText(la + "°N", mx0 + 2, MY(la) - 2); }
    /* 궤적 (시간에 따라 색이 진해짐) */
    for (let i = 1; i < TR.length; i++) {
      const u = i / TR.length;
      ctx.strokeStyle = `rgba(59,124,42,${0.3 + 0.6 * u})`; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(MX(TR[i - 1][3]), MY(TR[i - 1][2])); ctx.lineTo(MX(TR[i][3]), MY(TR[i][2])); ctx.stroke();
    }
    TR.forEach((r) => { ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(MX(r[3]), MY(r[2]), 1.3, 0, Math.PI * 2); ctx.fill(); });
    tbl.rows.forEach((r) => { ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(MX(r.lon), MY(r.lat), 3.2, 0, Math.PI * 2); ctx.stroke(); });
    const pr = TR.find((r) => r[0] === pc);
    if (pr) { ctx.fillStyle = "#2c4e8a"; ctx.beginPath(); ctx.rect(MX(pr[3]) - 4, MY(pr[2]) - 4, 8, 8); ctx.fill(); }
    const cur = TR[+sC.value];
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(MX(cur[3]), MY(cur[2]), 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("2015 시작", MX(TR[0][3]) - 18, MY(TR[0][2]) - 7);
    ctx.restore();
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.mono}`; ctx.textAlign = "center";
    for (let lo = 125; lo <= 155; lo += 10) ctx.fillText(lo + "°E", MX(lo), myB + 12);
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(mx0 + .5, myT + .5, mxR - mx0 - 1, myB - myT - 1);
    /* 오른쪽: 연직 분포 */
    const px0 = Math.max(mxR, w * 0.6) + 40, px1 = w - 8, py0 = 22, py1 = h - 18;
    const P = A.prof[pc], pmax = 2050;
    const vals = P.flatMap((q) => (vKey === "T" ? [q[1]] : [q[2], q[3]])).filter((x) => x != null);
    let vlo = Math.min(...vals), vhi = Math.max(...vals);
    if (vKey === "S") { vlo = Math.floor(vlo * 10) / 10; vhi = Math.ceil(vhi * 10) / 10; } else { vlo = 0; vhi = 32; }
    const PX = (v) => px0 + (v - vlo) / (vhi - vlo) * (px1 - px0), PY = (p) => py0 + p / pmax * (py1 - py0);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(px0 + .5, py0 + .5, px1 - px0, py1 - py0);
    ctx.font = `9.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    [0, 500, 1000, 1500, 2000].forEach((p) => { ctx.fillText(String(p), px0 - 3, PY(p) + 3); ctx.beginPath(); ctx.moveTo(px0, PY(p) + .5); ctx.lineTo(px1, PY(p) + .5); ctx.stroke(); });
    ctx.textAlign = "center";
    L.ticks(vlo, vhi, 3).forEach((v) => ctx.fillText(String(v), PX(v), py1 + 12));
    ctx.textAlign = "left"; ctx.fillText("dbar", px0 - 34, py0 - 8);
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillText(`주기 ${pc} · ${vKey === "T" ? "수온 (°C)" : "염분"}`, px1, py0 - 8);
    const series = vKey === "T" ? [[1, 4, C.warn]] : [[2, 5, C.ink3], [3, 5, "#2c4e8a"]];
    series.forEach(([vi, qi, col]) => {
      ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.beginPath(); let on = false;
      P.forEach((q) => { if (q[vi] == null || q[qi] === 4) return; on ? ctx.lineTo(PX(q[vi]), PY(q[0])) : ctx.moveTo(PX(q[vi]), PY(q[0])); on = true; });
      ctx.stroke();
    });
    const vi0 = vKey === "T" ? 1 : 2, qi0 = vKey === "T" ? 4 : 5;
    P.forEach((q) => {
      if (q[qi0] !== 4 || q[vi0] == null) return;
      const x = PX(q[vi0]), y = PY(q[0]);
      ctx.strokeStyle = C.apple; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4); ctx.stroke();
    });
    if (vKey === "S") {
      ctx.font = `10px ${F.sans}`; ctx.textAlign = "right";
      ctx.fillStyle = C.ink3; ctx.fillText("원시", px1 - 4, py1 - 18); ctx.fillStyle = "#2c4e8a"; ctx.fillText("보정", px1 - 4, py1 - 6);
    }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 52, y0: 20, w: w - 66, h: h - 54 };
    const rows = tbl.rows;
    if (xKey === "dist") {
      const d0 = rows.length ? Math.min(...rows.map((r) => r.day)) : 0;
      const pts = rows.map((r) => ({ x: r.day - d0, y: r.km }));
      const f = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y)) : null;
      L.plot(ctx, box, { pts, fit: f, xlabel: "처음 기록한 주기부터 경과 일수 (일)", ylabel: "처음 기록 지점에서 직선 거리 (km)" });
      if (f) { ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`기울기 ${f.a.toFixed(2)} km/일 = ${(f.a * 1e5 / 86400).toFixed(2)} cm/s`, box.x0 + 6, box.y0 + 12); }
    } else {
      const ok = rows.filter((r) => Number.isFinite(r.sr));
      const yr = (r) => 2015 + (r.day - day("2015-01-01 00:00")) / 365.25;
      const pts = ok.map((r) => ({ x: yr(r), y: r.sr }));
      const P = L.plot(ctx, box, { pts, color: C.ink3, xr: [2015, 2022.5], yr: [34.58, 34.68], xlabel: "연도", ylabel: "1950–2010 dbar 평균 염분" });
      ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
      ctx.fillStyle = "#2c4e8a";
      ok.forEach((r) => { if (!Number.isFinite(r.sa)) return; const x = P.X(yr(r)), y = P.Y(r.sa); ctx.fillRect(x - 3, y - 3, 6, 6); });
      ctx.restore();
      ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink3; ctx.fillText("● 원시 (보정값과 같으면 가려짐)", box.x0 + 6, box.y0 + 12);
      ctx.fillStyle = "#2c4e8a"; ctx.fillText("■ 지연 모드 보정", box.x0 + 6, box.y0 + 26);
    }
  }

  function info() {
    const r = TR[+sC.value];
    $(".c-out").textContent = r[0];
    $(".af-info").textContent = `주기 ${r[0]} · ${r[1]} UTC · 북위 ${r[2].toFixed(2)}°, 동경 ${r[3].toFixed(2)}° · 가장 깊이 잰 압력 ${r[4]} dbar` + (r[5] == null ? " (2000 dbar까지 내려가지 않음)" : "");
  }
  function measure(i) {
    const r = TR[i];
    const first = tbl.rows.length ? tbl.rows.reduce((a, b) => (a.day < b.day ? a : b)) : null;
    return { c: r[0], date: r[1].slice(0, 10), lat: r[2], lon: r[3], day: day(r[1]), km: first ? hav(first.lat, first.lon, r[2], r[3]) : 0, sr: r[5] ?? "—", sa: r[6] ?? "—" };
  }

  sC.addEventListener("input", () => { info(); draw(); });
  host.addEventListener("click", (e) => {
    const b = e.target.closest("[data-c]"); if (!b) return;
    pc = +b.dataset.c; host.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    const i = TR.findIndex((r) => r[0] === pc); if (i >= 0) { sC.value = i; info(); }
    draw();
  });
  $(".vsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-v]"); if (!b) return;
    vKey = b.dataset.v; root.querySelectorAll("[data-v]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw();
  });
  $(".meas").addEventListener("click", () => { tbl.add(measure(+sC.value)); draw(); });
  $(".clear").addEventListener("click", () => { tbl.clear(); draw(); });
  $(".xsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-x]"); if (!b) return;
    xKey = b.dataset.x; root.querySelectorAll("[data-x]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  info();
  if (L.demo) {
    const idx = (c) => TR.findIndex((r) => r[0] === c);
    [1, 16, 31, 46, 61, 76, 91, 106, 121, 137, 151, 166, 223, 242, 270, 280, 286].forEach((c) => tbl.add(measure(idx(c))));
    root.querySelector('[data-x="sal"]').click();
    sC.value = idx(166); info(); draw();
  }
})();
