/* 카드: 바닷가마다 물때의 모양이 다른 까닭은? — NOAA 실제 조위 자료로 조석 유형(형태수 F), 사리·조금, 회귀조 비교 */
(() => {
  const root = document.getElementById("card-labearth-tide");
  if (!root || !window.NMTide) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const D = window.NMTide;
  const $ = (s) => root.querySelector(s);
  const T0 = Date.parse(D.start);
  const hrs = (iso) => (Date.parse(iso) - T0) / 3.6e6;
  const NH = D.st[0].v.length;
  const phases = D.phases.map(([p, t]) => ({ p, h: hrs(t) })).filter((x) => x.h > -400);
  const news = phases.filter((x) => x.p === "New Moon").map((x) => x.h);
  const aps = D.apsides.map(([p, t]) => ({ p, h: hrs(t) }));
  /* 평형 조석 진폭(m, 기조력 퍼텐셜/g): 반일주는 cos²φ, 일주는 sin2φ에 비례 */
  const EQ = { M2: 0.2423, S2: 0.1128, K1: 0.1416, O1: 0.1005 };
  let si = 0, xKey = "d";
  const sDay = $(".td-day");

  const host = $(".ssel");
  D.st.forEach((s, i) => {
    const b = document.createElement("button");
    b.className = "chip"; b.dataset.s = i; b.setAttribute("aria-pressed", String(i === si)); b.textContent = s.ko;
    host.appendChild(b);
  });

  const cv = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "st", label: "검조소" }, { key: "d", label: "3월 (일)", res: 1 }, { key: "n", label: "고조 (회)", res: 1 },
    { key: "R", label: "조차 (m)", res: 0.01 }, { key: "age", label: "월령 (일)", res: 0.1 }, { key: "dec", label: "적위 (°)", res: 0.1 },
  ], () => drawPlot());

  const decAt = (h) => { const i = L.snap(h / 6, 1); return D.decl6h[Math.max(0, Math.min(D.decl6h.length - 1, i))]; };
  const ageAt = (h) => { const prev = news.filter((n) => n <= h).pop(); return (h - prev) / 24; };

  /* 고조: 앞뒤 3시간 중 가장 높고, 앞뒤 6시간 최저보다 3 cm 넘게 높은 점 */
  function highs(v, a, b) {
    const out = [];
    for (let i = Math.max(3, a); i < Math.min(v.length - 3, b); i++) {
      let ok = true;
      for (let k = -3; k <= 3; k++) if ((k && v[i + k] > v[i]) || (k > 0 && v[i + k] === v[i])) ok = false;
      if (!ok) continue;
      let lo = Infinity;
      for (let k = -6; k <= 6; k++) { const j = i + k; if (j >= 0 && j < v.length) lo = Math.min(lo, v[j]); }
      if (v[i] - lo > 0.03) out.push(i);
    }
    return out;
  }
  function dayStats(s, d) {
    const a = (d - 1) * 24, w = s.v.slice(a, Math.min(NH, a + 25));
    return { n: highs(s.v, a, a + 24).length, R: Math.max(...w) - Math.min(...w) };
  }

  function moonIcon(ctx, x, y, p, r) {
    ctx.save(); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.fillStyle = C.ink2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (p === "New Moon") ctx.fill(); else { ctx.fillStyle = C.card; ctx.fill(); }
    ctx.stroke();
    if (p === "First Quarter" || p === "Last Quarter") {
      ctx.fillStyle = C.ink2; ctx.beginPath();
      const s0 = p === "First Quarter" ? Math.PI / 2 : -Math.PI / 2;
      ctx.arc(x, y, r, s0, s0 + Math.PI); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = D.st[si], v = s.v, d = +sDay.value;
    const x0 = 40, x1 = w - 10;
    const vmax = Math.max(...v.map(Math.abs)) * 1.05;
    /* 위: 한 달 */
    const ty0 = 30, ty1 = h * 0.50;
    const X = (hh) => x0 + hh / NH * (x1 - x0);
    const Y = (z) => (ty0 + ty1) / 2 - z / vmax * (ty1 - ty0) / 2;
    ctx.fillStyle = "rgba(116,171,102,.16)"; ctx.fillRect(X((d - 2) * 24), ty0, X((d + 1) * 24) - X((d - 2) * 24), ty1 - ty0);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(x0 + .5, ty0 + .5, x1 - x0, ty1 - ty0);
    ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x1, Y(0)); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    const tk = L.ticks(-vmax, vmax, 2).filter((t) => Math.abs(t) < vmax);
    tk.forEach((t) => ctx.fillText(String(t), x0 - 4, Y(t) + 3));
    ctx.textAlign = "left"; ctx.fillText("조위(m)", 2, 12);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1; ctx.beginPath();
    v.forEach((z, i) => (i ? ctx.lineTo(X(i), Y(z)) : ctx.moveTo(X(i), Y(z)))); ctx.stroke();
    /* 달의 위상, 근지점·원지점 */
    phases.forEach((p) => { if (p.h >= 0 && p.h <= NH) moonIcon(ctx, X(p.h), 9, p.p, 4.5); });
    ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillStyle = C.warn;
    aps.forEach((a) => ctx.fillText(a.p, Math.min(x1 - 14, Math.max(x0 + 14, X(a.h))), 25));
    /* 날짜 눈금 */
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    [1, 8, 15, 22, 29].forEach((dd) => ctx.fillText(dd + "일", X((dd - 1) * 24 + 12), ty1 + 12));
    /* 가운데: 달의 적위 */
    const dy0 = ty1 + 20, dy1 = h * 0.66;
    const YD = (dg) => (dy0 + dy1) / 2 - dg / 30 * (dy1 - dy0) / 2;
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(x0, YD(0)); ctx.lineTo(x1, YD(0)); ctx.stroke();
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.4; ctx.beginPath();
    D.decl6h.forEach((dg, i) => { const xx = X(i * 6); if (xx > x1) return; i ? ctx.lineTo(xx, YD(dg)) : ctx.moveTo(xx, YD(dg)); }); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.font = `9.5px ${F.mono}`;
    ctx.fillText("+29°", x0 - 4, YD(29) + 4); ctx.fillText("−29°", x0 - 4, YD(-29) + 2);
    ctx.textAlign = "right"; ctx.fillStyle = "#a87412"; ctx.font = `10px ${F.sans}`; ctx.fillText("달의 적위", x1 - 2, dy0 - 3);
    /* 아래: 사흘 확대 */
    const zy0 = h * 0.72, zy1 = h - 16, a = Math.max(0, (d - 2) * 24), b = Math.min(NH - 1, (d + 1) * 24);
    const ZX = (hh) => x0 + (hh - a) / (b - a) * (x1 - x0);
    const seg = v.slice(a, b + 1), zmax = Math.max(...seg.map(Math.abs)) * 1.15 || 1;
    const ZY = (z) => (zy0 + zy1) / 2 - z / zmax * (zy1 - zy0) / 2;
    ctx.fillStyle = "rgba(116,171,102,.16)"; ctx.fillRect(ZX((d - 1) * 24), zy0, ZX(d * 24) - ZX((d - 1) * 24), zy1 - zy0);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(x0 + .5, zy0 + .5, x1 - x0, zy1 - zy0);
    ctx.beginPath(); ctx.moveTo(x0, ZY(0)); ctx.lineTo(x1, ZY(0)); ctx.stroke();
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = a; i <= b; i++) (i === a ? ctx.moveTo(ZX(i), ZY(v[i])) : ctx.lineTo(ZX(i), ZY(v[i]))); ctx.stroke();
    ctx.fillStyle = C.forest;
    for (let i = a; i <= b; i++) { ctx.beginPath(); ctx.arc(ZX(i), ZY(v[i]), 1.4, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = C.warn;
    highs(v, (d - 1) * 24, d * 24).forEach((i) => { const xx = ZX(i), yy = ZY(v[i]) - 5; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx - 4, yy - 6); ctx.lineTo(xx + 4, yy - 6); ctx.closePath(); ctx.fill(); });
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.font = `10px ${F.mono}`;
    const zt = L.ticks(-zmax, zmax, 2).filter((t) => Math.abs(t) < zmax);
    zt.forEach((t) => ctx.fillText(String(t), x0 - 4, ZY(t) + 3));
    ctx.textAlign = "center";
    for (let dd = d - 1; dd <= d + 1; dd++) { const c0 = (dd - 1) * 24 + 12; if (c0 > a && c0 < b) ctx.fillText(dd + "일", ZX(c0), zy1 + 12); }
    ctx.textAlign = "left"; ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`;
    ctx.fillText(`${s.ko} · ${d - 1}–${d + 1}일 확대 (▼ 고른 날의 고조)`, x0 + 4, zy0 - 5);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = D.st[si], rows = tbl.rows.filter((r) => r.st === s.ko);
    const xv = (r) => (xKey === "dec" ? Math.abs(r.dec) : r[xKey]);
    const pts = rows.map((r) => ({ x: xv(r), y: r.R }));
    const xr = { d: [0, 32], age: [0, 30], dec: [0, 30] }[xKey];
    const lab = { d: "3월 날짜 (일)", age: "월령 (일, 삭 = 0)", dec: "|달의 적위| (°)" }[xKey];
    const rmax = Math.max(...s.v) - Math.min(...s.v);
    const box = { x0: 44, y0: 20, w: w - 58, h: h - 54 };
    const P = L.plot(ctx, box, { pts, xr, yr: [0, Math.max(0.1, rmax * 1.05)], xlabel: lab, ylabel: `${s.ko} 하루 조차 (m)` });
    ctx.save(); ctx.font = `10px ${F.sans}`; ctx.textAlign = "center";
    if (xKey === "d") phases.forEach((p) => { const dd = p.h / 24 + 1; if (dd < 0 || dd > 32) return; ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(P.X(dd), box.y0); ctx.lineTo(P.X(dd), box.y0 + box.h); ctx.stroke(); ctx.setLineDash([]); moonIcon(ctx, P.X(dd), box.y0 + 8, p.p, 4); });
    if (xKey === "age") [[0, "삭"], [7.4, "상현"], [14.8, "망"], [22.1, "하현"]].forEach(([g, t]) => { ctx.fillStyle = C.ink3; ctx.fillText(t, P.X(g + (g ? 0 : 1)), box.y0 + 10); });
    ctx.restore();
  }

  function updNums() {
    const s = D.st[si], hh = s.h, phi = s.lat * Math.PI / 180;
    const semi = hh.M2 + hh.S2, diur = hh.K1 + hh.O1, Fo = diur / semi;
    const Fe = (EQ.K1 + EQ.O1) * Math.sin(2 * phi) / ((EQ.M2 + EQ.S2) * Math.cos(phi) ** 2);
    $(".hsemi").textContent = semi.toFixed(3); $(".hdiur").textContent = diur.toFixed(3);
    $(".fobs").textContent = Fo.toFixed(2); $(".feq").textContent = Fe.toFixed(2);
    const type = Fo < 0.25 ? "반일주조" : Fo < 1.5 ? "혼합조(주로 반일주)" : Fo < 3 ? "혼합조(주로 일주)" : "일주조";
    $(".td-type").textContent = `${s.ko} (${s.en}, 북위 ${s.lat.toFixed(1)}°) — 형태수로 본 유형: ${type}`;
  }
  function measure() {
    const s = D.st[si], d = +sDay.value, st = dayStats(s, d), hc = (d - 1) * 24 + 12;
    return { st: s.ko, d, n: st.n, R: L.snap(st.R, 0.01), age: L.snap(ageAt(hc), 0.1), dec: L.snap(decAt(hc), 0.1) };
  }

  sDay.addEventListener("input", () => { $(".d-out").textContent = sDay.value; draw(); });
  host.addEventListener("click", (e) => {
    const b = e.target.closest("[data-s]"); if (!b) return;
    si = +b.dataset.s; host.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    updNums(); draw(); drawPlot();
  });
  $(".meas").addEventListener("click", () => tbl.add(measure()));
  $(".clear").addEventListener("click", () => tbl.clear());
  $(".xsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-x]"); if (!b) return;
    xKey = b.dataset.x; root.querySelectorAll("[data-x]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  updNums();
  if (L.demo) {
    [0, 4].forEach((k) => { si = k; [1, 4, 8, 11, 15, 18, 22, 25, 29].forEach((d) => { sDay.value = d; tbl.add(measure()); }); });
    si = 4; sDay.value = 22; $(".d-out").textContent = "22";
    host.querySelector('[data-s="4"]').click(); root.querySelector('[data-x="dec"]').click();
  }
})();
