/* 카드: 탄산 칼슘 + 염산 — 줄어든 질량으로 양적 관계 확인, 한정 반응물 꺾임점, 튐·용해 오차 */
(() => {
  const root = document.getElementById("card-chem-caco3");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sM = $(".m"), sV = $(".v");
  let run = null;
  const loss = (m, v, cap) => { const nC = m / 100.09, nH = v / 1000 * 1.0, n = Math.min(nC, nH / 2), co2 = n * 44.01; return co2 * 0.97 + (cap ? 0 : 0.03 + co2 * 0.04); };   // 3%는 용액에 녹아 남음, 솜이 없으면 물방울이 튐
  const tbl = L.table($(".tbl-host"), [{ key: "m", label: "CaCO₃ (g)", res: 0.01 }, { key: "v", label: "염산 (mL)", res: 1 }, { key: "d", label: "줄어든 질량 (g)", res: 0.01 }, { key: "c", label: "솜" }], () => drawPlot());
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());
  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const bx = w * 0.15, bw = w * 0.38, by = h - 36;
    ctx.fillStyle = "#d9dad2"; ctx.fillRect(bx, by, bw, 26); ctx.fillStyle = "#1c1e1b"; ctx.fillRect(bx + bw * 0.22, by + 5, bw * 0.56, 16);
    const base = 120 + +sV.value * 1.02 + +sM.value, shown = run ? base - run.d * Math.min(1, run.t / 4) : base;
    ctx.fillStyle = "#8fd16f"; ctx.font = `600 13px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(`${shown.toFixed(2)} g`, bx + bw / 2, by + 18);
    // 플라스크
    const cx = bx + bw / 2, fy = by - 4, fw = 90, fh = h * 0.55;
    ctx.fillStyle = "rgba(220,235,245,.7)"; ctx.beginPath(); ctx.moveTo(cx - 12, fy - fh); ctx.lineTo(cx - 12, fy - fh * 0.55); ctx.lineTo(cx - fw / 2, fy); ctx.lineTo(cx + fw / 2, fy); ctx.lineTo(cx + 12, fy - fh * 0.55); ctx.lineTo(cx + 12, fy - fh); ctx.fill();
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.stroke();
    if ($(".cap").checked) { ctx.fillStyle = "#f4f1e8"; ctx.fillRect(cx - 12, fy - fh - 10, 24, 12); }
    const active = run && run.t < 4;
    if (active) for (let k = 0; k < 20; k++) { const ph = (run.t * 1.5 + k / 20) % 1; ctx.strokeStyle = "rgba(90,90,100,.6)"; ctx.beginPath(); ctx.arc(cx - 25 + (k * 13) % 50, fy - 6 - ph * fh * 0.4, 2.5, 0, Math.PI * 2); ctx.stroke(); }
    if (active) { ctx.fillStyle = "rgba(160,160,170,.35)"; for (let k = 0; k < 6; k++) { const ph = (run.t + k / 6) % 1; ctx.beginPath(); ctx.arc(cx + Math.sin(k * 2 + run.t) * 10, fy - fh - 14 - ph * 40, 6 + ph * 6, 0, Math.PI * 2); ctx.fill(); } }
    const left = run ? run.leftC * (1 - Math.min(1, run.t / 4)) + run.extra : +sM.value;
    ctx.fillStyle = "#eeeae0"; ctx.fillRect(cx - 18, fy - 6, 36 * Math.min(1, Math.max(0.05, left / 2)), 5);
    ctx.textAlign = "left"; ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`;
    const tx = w * 0.58; ctx.fillText("CaCO₃ + 2HCl →", tx, 30); ctx.fillText("  CaCl₂ + H₂O + CO₂↑", tx, 46);
    const nC = +sM.value / 100.09, nH = +sV.value / 1000;
    ctx.fillText(`CaCO₃ ${nC.toFixed(4)} mol`, tx, 72); ctx.fillText(`HCl ${nH.toFixed(4)} mol`, tx, 90); ctx.fillText(`→ CaCO₃ ${(nH / 2).toFixed(4)} mol까지`, tx, 106);
    ctx.fillStyle = nC < nH / 2 ? C.forest : C.warn; ctx.fillText(`한정 반응물: ${nC < nH / 2 ? "탄산 칼슘" : "염산"}`, tx, 130);
  }
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const v = +sV.value, model = (m) => Math.min(m / 100.09, v / 2000) * 44.01;
    L.plot(ctx, { x0: 46, y0: 18, w: w - 60, h: h - 52 }, { pts: tbl.rows.filter((r) => r.v === v).map((r) => ({ x: r.m, y: r.d })), model, xr: [0, 4.2], yr: [0, 2.4], xlabel: "탄산 칼슘 (g)", ylabel: "줄어든 질량 (g)" });
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`점선: 반응식으로 예측 (염산 ${v} mL)`, 52, 30);
  }
  function measure() { const m = +sM.value, v = +sV.value, cap = $(".cap").checked, d = L.measure(loss(m, v, cap), { sd: 0.01, res: 0.01 }); return { m, v, d, c: cap ? "예" : "아니요" }; }
  loop($(".cv-wide"), (dt) => { if (run) { run.t += dt; if (run.t >= 4 && !run.done) { run.done = true; tbl.add(run.rec); } } draw(); });
  const upd = () => { $(".m-out").textContent = (+sM.value).toFixed(2); $(".v-out").textContent = sV.value; run = null; draw(); drawPlot(); };
  [sM, sV].forEach((el) => el.addEventListener("input", upd)); $(".cap").addEventListener("change", upd);
  $(".run").addEventListener("click", () => { const rec = measure(), nC = rec.m / 100.09, nr = Math.min(nC, rec.v / 2000); run = { t: 0, d: rec.d, rec, leftC: nr * 100.09, extra: rec.m - nr * 100.09 }; });
  $(".sweep").addEventListener("click", () => { const keep = sM.value; for (let m = 0.25; m <= 4.001; m += 0.25) { sM.value = m; tbl.add(measure()); } sM.value = keep; upd(); });
  $(".clear").addEventListener("click", () => tbl.clear());
  upd();
  if (L.demo) { $(".cap").checked = true; $(".sweep").click(); }
})();
