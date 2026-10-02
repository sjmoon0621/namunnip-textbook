/* 카드: 다이오드는 왜 한쪽으로만 전류를 흘릴까? — 보호 저항 직렬 회로 풀이, I–V 기록, 반파 정류 */
(() => {
  const root = document.getElementById("card-phy-diode-iv");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const RS = 100, VT = 0.02585, D = { si: [1e-9, 1.8, "실리콘", "#3f6fa3"], ge: [2e-6, 1.6, "저마늄", "#2f8f6a"], led: [1e-19, 2.0, "LED", "#c8463a"] };
  let kind = "si", ac = false, t = 0;
  const id = (v, k = kind) => D[k][0] * (Math.exp(v / (D[k][1] * VT)) - 1);
  function solve(vs, k = kind) {   // vs = vd + I·R 를 이분법으로
    let lo = Math.min(0, vs) - 0.01, hi = Math.max(0, vs) + 0.01;
    for (let n = 0; n < 60; n++) { const m = (lo + hi) / 2; (m + id(m, k) * RS - vs > 0) ? (hi = m) : (lo = m); }
    const vd = (lo + hi) / 2; return { vd, i: id(vd, k) };
  }
  const tbl = { rows: [] };
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());
  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const vs = ac ? 4 * Math.sin(t * 2) : +$(".v").value, r = solve(vs);
    // 회로
    const x0 = 30, x1 = w * 0.45, y0 = 40, y1 = h - 30;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    ctx.fillStyle = "#f4f1e8"; ctx.fillRect(x0 - 14, (y0 + y1) / 2 - 18, 28, 36); ctx.strokeRect(x0 - 14, (y0 + y1) / 2 - 18, 28, 36);
    ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(ac ? "~" : (vs >= 0 ? "+" : "−"), x0, (y0 + y1) / 2 - 4); ctx.fillText(`${vs.toFixed(1)}V`, x0, (y0 + y1) / 2 + 12);
    // 저항 (위)
    const rx = x0 + (x1 - x0) * 0.25; ctx.fillStyle = "#f4f1e8"; ctx.fillRect(rx, y0 - 7, 50, 14); ctx.strokeRect(rx, y0 - 7, 50, 14); ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.fillText("100 Ω", rx + 25, y0 - 12);
    // 다이오드 (오른쪽 세로, 위→아래 순방향)
    const dx = x1, dy = (y0 + y1) / 2; ctx.fillStyle = D[kind][3]; ctx.beginPath(); ctx.moveTo(dx - 12, dy - 10); ctx.lineTo(dx + 12, dy - 10); ctx.lineTo(dx, dy + 10); ctx.closePath(); ctx.fill(); ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(dx - 12, dy + 10); ctx.lineTo(dx + 12, dy + 10); ctx.stroke();
    if (kind === "led" && r.i > 1e-4) { ctx.fillStyle = `rgba(255,60,40,${Math.min(0.8, r.i * 80)})`; ctx.beginPath(); ctx.arc(dx, dy, 22, 0, Math.PI * 2); ctx.fill(); }
    // 전류 흐름 점
    const sp = Math.sign(r.i) * Math.min(1, Math.abs(r.i) * 200);
    if (Math.abs(sp) > 0.01) { ctx.fillStyle = C.warn; const per = 2 * (x1 - x0 + y1 - y0); for (let k = 0; k < 12; k++) { let s = ((k / 12 + t * sp * 0.3) % 1 + 1) % 1 * per; let px, py; if (s < x1 - x0) { px = x0 + s; py = y0; } else if ((s -= x1 - x0) < y1 - y0) { px = x1; py = y0 + s; } else if ((s -= y1 - y0) < x1 - x0) { px = x1 - s; py = y1; } else { s -= x1 - x0; px = x0; py = y1 - s; } ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill(); } }
    // 오른쪽: 파형 (교류일 때)
    const gx = w * 0.55, gw = w - gx - 10, gy = 16, gh = h - 40;
    ctx.strokeStyle = C.rule; ctx.strokeRect(gx, gy, gw, gh); ctx.beginPath(); ctx.moveTo(gx, gy + gh / 2); ctx.lineTo(gx + gw, gy + gh / 2); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(ac ? "회색: 입력 교류 · 빨강: 저항 양 끝 (출력)" : "‘교류 넣어 보기’를 누르면 파형이 나옵니다", gx + 4, gy + 12);
    if (ac) {
      const Y = (v) => gy + gh / 2 - v / 4.5 * gh / 2;
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.beginPath(); for (let k = 0; k <= 200; k++) { const tt = t - 6 + 6 * k / 200, v = 4 * Math.sin(tt * 2); k ? ctx.lineTo(gx + gw * k / 200, Y(v)) : ctx.moveTo(gx, Y(v)); } ctx.stroke();
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); for (let k = 0; k <= 200; k++) { const tt = t - 6 + 6 * k / 200, v = solve(4 * Math.sin(tt * 2)).i * RS; k ? ctx.lineTo(gx + gw * k / 200, Y(v)) : ctx.moveTo(gx, Y(v)); } ctx.stroke();
    }
    $(".n-vd").textContent = `${r.vd.toFixed(3)} V`; $(".n-i").textContent = Math.abs(r.i) < 1e-6 ? "≈ 0 mA" : `${(r.i * 1000).toFixed(2)} mA`;
    $(".n-dir").textContent = vs > 0 ? "순방향" : vs < 0 ? "역방향" : "—";
  }
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = L.plot(ctx, { x0: 50, y0: 18, w: w - 64, h: h - 52 }, { pts: [], xr: [-5, 2.5], yr: [-5, 45], xlabel: "다이오드 전압 (V)", ylabel: "전류 (mA)" });
    Object.keys(D).forEach((k) => { const pts = tbl.rows.filter((p) => p.k === k); ctx.fillStyle = D[k][3]; pts.forEach((p) => { ctx.beginPath(); ctx.arc(r.X(p.vd), r.Y(p.i * 1000), 3, 0, Math.PI * 2); ctx.fill(); }); if (pts.length) { const last = pts.reduce((a, b) => (b.vd > a.vd ? b : a)); ctx.font = `10.5px ${F.sans}`; ctx.fillText(D[k][2], r.X(last.vd) + 6, r.Y(last.i * 1000) + 4); } });
  }
  const rec = (vs) => { const s = solve(vs); tbl.rows.push({ k: kind, vd: L.measure(s.vd, { res: 0.001, sd: 0.001 }), i: L.measure(s.i, { rel: 0.01, res: 1e-5 }) }); };
  loop($(".cv-wide"), (dt) => { t += dt; draw(); });
  $(".v").addEventListener("input", () => { $(".v-out").textContent = (+$(".v").value).toFixed(1); draw(); });
  $(".rec").addEventListener("click", () => { rec(+$(".v").value); drawPlot(); });
  $(".sweep").addEventListener("click", () => { for (let v = -5; v <= 5.001; v += 0.25) rec(v); drawPlot(); });
  $(".clear").addEventListener("click", () => { tbl.rows.length = 0; drawPlot(); });
  $(".ac").addEventListener("click", (e) => { ac = !ac; e.currentTarget.setAttribute("aria-pressed", String(ac)); });
  $(".kind").addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b) return; kind = b.dataset.k; root.querySelectorAll("[data-k]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); });
  drawPlot();
  if (L.demo) { ["si", "ge", "led"].forEach((k) => { kind = k; for (let v = -5; v <= 5.001; v += 0.25) rec(v); }); kind = "si"; ac = true; t = 4; drawPlot(); }
})();
