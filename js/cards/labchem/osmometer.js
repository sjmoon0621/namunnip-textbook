/* 카드: 반투막 위로 올라온 용액 기둥으로 고분자의 몰질량을 잴 수 있을까? — 삼투압계, π/c–c 외삽으로 M */
(() => {
  const root = document.getElementById("card-labchem-osmometer");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sC = $(".c"), sT = $(".t"), cBias = $(".bias");
  const RT = 8.314 * 298.15, RHO = 997, G = 9.8, TAU = 2.5, CAP = 10;

  // 수업용 예시값: 수 평균 몰질량 M (g/mol), 제2 비리얼 계수 A2 (mol·mL/g²)
  const POLY = [
    { name: "폴리비닐알코올", M: 45000, A2: 4e-4, col: "#3b7c2a" },
    { name: "소 혈청 알부민", M: 66500, A2: 1e-4, col: "#e0a02a" },
    { name: "미지 고분자 X", M: 120000, A2: 2.5e-4, col: "#4f7fb0" },
  ];
  let pi = 0, t = 0;
  const piTrue = (p, c) => 1000 * RT * c * (1 / POLY[p].M + POLY[p].A2 * c / 1000);   // Pa, c in g/L
  const hEq = (p, c) => piTrue(p, c) / (RHO * G) * 1000;   // mm
  const hAt = (p, c, hr) => hEq(p, c) * (1 - Math.exp(-hr / TAU));

  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "nm", label: "고분자" }, { key: "c", label: "c (g/L)", res: 1 }, { key: "hr", label: "시간 (h)", res: 0.1 },
    { key: "h", label: "h (mm)", res: 1 }, { key: "pi", label: "π (Pa)", res: 1 }, { key: "pc", label: "π/c (Pa·L/g)", res: 0.1 },
  ], () => { drawPlot(); });

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = h / 242, c = +sC.value, hr = +sT.value;
    const bx = w * 0.12, bw = w * 0.4, bb = h - 10 * s, wl = h * 0.62;
    // 비커와 맹물
    ctx.fillStyle = "rgba(120,170,220,0.25)"; ctx.fillRect(bx, wl, bw, bb - wl);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, h * 0.5); ctx.lineTo(bx, bb); ctx.lineTo(bx + bw, bb); ctx.lineTo(bx + bw, h * 0.5); ctx.stroke();
    // 삼투압계: 깔때기 + 막 + 가는 관
    const cx = bx + bw / 2, fw = 34 * s, fb = bb - 18 * s, ft = fb - 30 * s, tw = 3.5 * s;
    const pxPerMm = (wl - 18 * s) / 200, hh = hAt(pi, c, hr) + CAP, colTop = wl - hh * pxPerMm;
    const solCol = `rgba(224,190,120,${(0.3 + c / 60).toFixed(2)})`;
    ctx.fillStyle = solCol;
    ctx.beginPath(); ctx.moveTo(cx - fw, fb); ctx.lineTo(cx - tw, ft); ctx.lineTo(cx - tw, colTop); ctx.lineTo(cx + tw, colTop); ctx.lineTo(cx + tw, ft); ctx.lineTo(cx + fw, fb); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; ctx.beginPath();
    ctx.moveTo(cx - fw, fb); ctx.lineTo(cx - tw, ft); ctx.lineTo(cx - tw, 8 * s); ctx.moveTo(cx + fw, fb); ctx.lineTo(cx + tw, ft); ctx.lineTo(cx + tw, 8 * s); ctx.stroke();
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.setLineDash([3, 2]); ctx.beginPath(); ctx.moveTo(cx - fw, fb); ctx.lineTo(cx + fw, fb); ctx.stroke(); ctx.setLineDash([]);
    // 막을 지나는 물 (평형에 가까울수록 드묾)
    const rate = Math.exp(-hr / TAU);
    ctx.fillStyle = "#4f7fb0";
    const nArrow = Math.max(1, Math.round(6 * rate + 0.5));
    for (let k = 0; k < nArrow; k++) { const ph = (t * 0.7 + k / nArrow) % 1, x = cx - fw * 0.7 + k * (1.4 * fw / Math.max(1, nArrow - 1 || 1)), y = fb + 10 * s - ph * 20 * s; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill(); }
    // 자 (비커 수면 = 0)
    const rx = cx + 22 * s;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.fillStyle = C.card; ctx.fillRect(rx, wl - 200 * pxPerMm, 18 * s, 200 * pxPerMm); ctx.strokeRect(rx, wl - 200 * pxPerMm, 18 * s, 200 * pxPerMm);
    ctx.font = `9.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    for (let mm = 0; mm <= 200; mm += 10) {
      const y = wl - mm * pxPerMm; ctx.beginPath(); ctx.moveTo(rx, y); ctx.lineTo(rx + (mm % 50 ? 5 : 10) * s, y); ctx.stroke();
      if (mm % 50 === 0) ctx.fillText(mm + " mm", rx + 20 * s, y + 3);
    }
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.moveTo(cx - tw - 6, colTop); ctx.lineTo(rx + 18 * s, colTop); ctx.stroke(); ctx.setLineDash([]);
    // 설명 글
    const lx = w * 0.62;
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`;
    ctx.fillText("가는 유리관 (안지름 3 mm)", lx, h * 0.14);
    ctx.fillText(`${POLY[pi].name} ${c} g/L`, lx, h * 0.14 + 16);
    ctx.fillText("반투막 (셀로판)", lx, fb + 4);
    ctx.fillText("순수한 물", lx, wl + 16 * s);
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(lx - 4, fb); ctx.lineTo(cx + fw + 3, fb); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.fillText(`${hr} h 경과`, lx, h * 0.14 + 32);
  }

  function fitLine() {
    const rr = tbl.rows.filter((r) => r.p === pi);
    return rr.length > 1 ? L.linfit(rr.map((r) => r.c), rr.map((r) => r.pc)) : null;
  }
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 20, w: w - 58, h: h - 54 };
    const f = fitLine();
    const m = L.plot(ctx, box, { pts: [], xr: [0, 22], yr: [0, 90], xlabel: "농도 c (g/L)", ylabel: "π/c (Pa·L/g)" });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    POLY.forEach((q, i) => {
      ctx.fillStyle = q.col; ctx.globalAlpha = i === pi ? 1 : 0.35;
      tbl.rows.filter((r) => r.p === i).forEach((r) => { ctx.beginPath(); ctx.arc(m.X(r.c), m.Y(r.pc), 3.2, 0, Math.PI * 2); ctx.fill(); });
    });
    ctx.globalAlpha = 1;
    if (f) {
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(m.X(0), m.Y(f.b)); ctx.lineTo(m.X(22), m.Y(f.a * 22 + f.b)); ctx.stroke();
      ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(m.X(0), m.Y(f.b), 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    POLY.forEach((q, i) => { ctx.fillStyle = q.col; ctx.globalAlpha = i === pi ? 1 : 0.5; ctx.fillText("● " + q.name, box.x0 + 8, box.y0 + 12 + i * 13); });
    ctx.globalAlpha = 1;
    if (f) { ctx.fillStyle = C.warn; ctx.fillText("c → 0 외삽 절편", m.X(0) + 8, m.Y(f.b) + 16); }
    $(".n-i").textContent = f ? f.b.toFixed(1) + " Pa·L/g" : "—";
    const M = f && f.b > 0 ? 1000 * RT / f.b : NaN;
    $(".n-m").textContent = Number.isFinite(M) ? Math.round(M / 100) * 100 + " g/mol" : "—";
    $(".n-f").textContent = Number.isFinite(M) ? (1.86 * 10 / M).toExponential(1).replace("e-", "×10⁻").replace(/⁻(\d)/, (a, d) => "⁻" + "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]) + " °C" : "—";
  }

  function measure() {
    const c = +sC.value, hr = +sT.value;
    const hRead = L.measure(hAt(pi, c, hr) + CAP, { sd: 0.7, res: 1 });
    const hc = cBias.checked ? hRead : hRead - CAP;
    const p = RHO * G * hc / 1000;
    tbl.add({ p: pi, nm: POLY[pi].name, c, hr, h: hc, pi: p, pc: p / c });
  }
  const upd = () => { $(".c-out").textContent = sC.value; $(".t-out").textContent = (+sT.value).toFixed(1).replace(".0", ""); drawApp(); };
  loop($(".cv-wide"), (dt) => { t += dt; drawApp(); });
  [sC, sT].forEach((el) => el.addEventListener("input", upd));
  $(".poly").addEventListener("click", (e) => {
    const b = e.target.closest("[data-p]"); if (!b) return;
    pi = +b.dataset.p; root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); upd(); drawPlot();
  });
  $(".meas").addEventListener("click", measure);
  $(".clear").addEventListener("click", () => tbl.clear());
  if (L.demo) {
    sT.value = 12;
    [2, 4, 6, 8, 10, 12, 14, 16, 18, 20].forEach((c) => { sC.value = c; measure(); });
    pi = 1; [4, 8, 12, 16, 20].forEach((c) => { sC.value = c; measure(); });
    pi = 0; sC.value = 10;
  }
  upd();
})();
