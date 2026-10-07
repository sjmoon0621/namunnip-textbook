/* 카드: 회전 곡선과 은하의 질량 — SPARC 실제 회전 곡선에서 M(r) = v²r/G를 구해 보이는 물질의 질량과 비교 */
(() => {
  const root = document.getElementById("card-labearth-rotation-mass");
  if (!root || !window.NMRotCurves) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sR = $(".ri"), sU = $(".ups");
  const G = 4.30091e-6;
  const NAME = { NGC3198: "NGC 3198", NGC2403: "NGC 2403", NGC2841: "NGC 2841", DDO154: "DDO 154" };
  let gx = "NGC3198";
  const D = () => NMRotCurves[gx];
  const vbar2 = (i) => { const d = D(), u = +sU.value; return d.gas[i] * Math.abs(d.gas[i]) + u * d.disk[i] * Math.abs(d.disk[i]) + 1.4 * u * d.bul[i] * Math.abs(d.bul[i]); };
  const row = (i) => {
    const d = D(), r = d.r[i], v = d.v[i], vb = Math.max(0, vbar2(i));
    const Md = v * v * r / G, Mb = vb * r / G;
    return { gx, i, name: NAME[gx], r, v, ev: d.ev[i], Md: Md / 1e10, Mb: Mb / 1e10, q: Mb ? Md / Mb : NaN };
  };

  const main = fit($(".rm-main"), () => drawMain());
  const pl = fit($(".rm-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "name", label: "은하" }, { key: "r", label: "r (kpc)", res: 0.01 }, { key: "v", label: "v (km/s)", res: 0.1 }, { key: "ev", label: "±", res: 0.1 },
    { key: "Md", label: "M_역학 (10¹⁰M☉)", res: 0.01 }, { key: "Mb", label: "M_보임", res: 0.01 }, { key: "q", label: "비", res: 0.1 },
  ], () => { drawMain(); drawPlot(); nums(); });
  const mine = () => tbl.rows.filter((r) => r.gx === gx).sort((a, b) => a.r - b.r);

  function drawMain() {
    const { ctx } = main, { w, h } = main.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const d = D(), rmax = d.r[d.r.length - 1] * 1.05, vmax = Math.max(...d.v.map((v, i) => v + d.ev[i]), ...d.disk.map((v) => Math.sqrt(1.2) * v)) * 1.1;
    const b = { x0: 44, y0: 20, w: w - 58, h: h - 54 };
    const o = L.plot(ctx, b, { pts: mine().map((r) => ({ x: r.r, y: r.v, ey: r.ev })), xr: [0, rmax], yr: [0, vmax], xlabel: "중심에서의 거리 r (kpc)", ylabel: "회전 속도 v (km/s)" });
    ctx.save(); ctx.beginPath(); ctx.rect(b.x0, b.y0, b.w, b.h); ctx.clip();
    ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.beginPath();
    d.r.forEach((r, i) => { const y = o.Y(Math.sqrt(Math.max(0, vbar2(i)))); i ? ctx.lineTo(o.X(r), y) : ctx.moveTo(o.X(r), y); }); ctx.stroke(); ctx.setLineDash([]);
    const x = o.X(d.r[+sR.value]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, b.y0); ctx.lineTo(x, b.y0 + b.h); ctx.stroke();
    ctx.restore();
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillStyle = C.forest; ctx.fillText("● 측정한 회전 속도", b.x0 + b.w - 4, b.y0 + b.h - 24);
    ctx.fillStyle = C.amber; ctx.fillText("- - 보이는 별·가스만으로 예상한 속도", b.x0 + b.w - 4, b.y0 + b.h - 9);
  }
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const d = D(), rmax = d.r[d.r.length - 1] * 1.05, Mmax = d.v[d.v.length - 1] ** 2 * d.r[d.r.length - 1] / G / 1e10 * 1.15;
    const b = { x0: 48, y0: 20, w: w - 62, h: h - 54 };
    const o = L.plot(ctx, b, { pts: mine().map((r) => ({ x: r.r, y: r.Md })), xr: [0, rmax], yr: [0, Mmax], xlabel: "r (kpc)", ylabel: "M(r) (10¹⁰ 태양 질량)" });
    ctx.save(); ctx.beginPath(); ctx.rect(b.x0, b.y0, b.w, b.h); ctx.clip();
    ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.beginPath();
    d.r.forEach((r, i) => { const y = o.Y(Math.max(0, vbar2(i)) * r / G / 1e10); i ? ctx.lineTo(o.X(r), y) : ctx.moveTo(o.X(r), y); }); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = C.forest; ctx.fillText("● M_역학 = v²r/G", b.x0 + 6, b.y0 + 12);
    ctx.fillStyle = C.amber; ctx.fillText("- - M_보임 (별 + 가스)", b.x0 + 6, b.y0 + 27);
  }
  function nums() {
    const d = D(), m = mine(), last = m[m.length - 1];
    $(".n-d").textContent = d.D + " Mpc";
    $(".n-m").textContent = last ? (last.Md / 10).toFixed(2) + " × 10¹¹ M☉" : "—";
    $(".n-r").textContent = last && Number.isFinite(last.q) ? last.q.toFixed(1) + " 배" : "—";
  }
  const upd = () => {
    sR.max = D().r.length - 1; if (+sR.value > +sR.max) sR.value = sR.max;
    $(".r-out").textContent = D().r[+sR.value].toFixed(2); $(".u-out").textContent = (+sU.value).toFixed(2);
    drawMain();
  };
  function measure(i) { if (!tbl.rows.some((r) => r.gx === gx && r.i === i)) tbl.add(row(i)); }
  sR.addEventListener("input", upd);
  sU.addEventListener("input", () => { tbl.rows.forEach((r) => { if (r.gx === gx) Object.assign(r, row(r.i)); }); if (tbl.rows.length) tbl.add(tbl.rows.pop()); upd(); drawPlot(); nums(); });
  $(".m1").addEventListener("click", () => measure(+sR.value));
  $(".mall").addEventListener("click", () => D().r.forEach((_, i) => measure(i)));
  $(".clear").addEventListener("click", () => tbl.clear());
  $(".rm-gx").addEventListener("click", (e) => {
    const b = e.target.closest("[data-g]"); if (!b) return;
    gx = b.dataset.g; root.querySelectorAll("[data-g]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    sR.value = Math.floor(D().r.length / 3); upd(); drawPlot(); nums();
  });
  upd(); nums();
  if (L.demo) { [1, 4, 8, 12, 16, 20, 24, 28, 34, 40, 42].forEach(measure); sR.value = 42; upd(); }
})();
