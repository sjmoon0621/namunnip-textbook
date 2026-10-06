/* 카드: 밀도를 정확하게 구하려면 어느 길이를 더 정밀하게 재야 할까? — 정확도·정밀도, 오차의 전파 */
(() => {
  const root = document.getElementById("card-labphy-precision");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  /* 참값 (화면에 직접 보이지 않음): 알루미늄 원기둥 */
  const RHO0 = 2.70, D0 = 15.02, H0 = 39.96;                    // mm
  const M0 = RHO0 * Math.PI * (D0 / 20) ** 2 * (H0 / 10);       // g
  const TOOLS = {
    ruler: { name: "강철자", res: 0.5, sd: 0.3, u: 0.5 },          // 1 mm 눈금, 0.5 mm까지 어림
    vernier: { name: "캘리퍼스", res: 0.05, sd: 0.03, u: 0.025 },
  };
  const BAL = { res: 0.01, sd: 0.006, u: 0.005 };
  const COL = { ruler: C.amber, vernier: C.forest, zero: C.apple };
  let tool = "ruler", last = null;
  const zero = $(".zero");
  const setKey = () => (tool === "vernier" && zero.checked ? "zero" : tool);
  const setName = (k) => ({ ruler: "강철자", vernier: "캘리퍼스", zero: "캘리퍼스(영점×)" }[k]);

  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "tool", label: "도구" }, { key: "dS", label: "d (mm)" }, { key: "hS", label: "h (mm)" },
    { key: "m", label: "m (g)", res: 0.01 }, { key: "rho", label: "ρ (g/cm³)", res: 0.001 }, { key: "u", label: "δρ (합)", res: 0.001 },
  ], () => { drawApp(); drawPlot(); nums(); });

  function measure() {
    const T = TOOLS[tool], k = setKey(), bias = k === "zero" ? 0.2 : 0;
    const d = L.measure(D0, { sd: T.sd, res: T.res, bias }), h = L.measure(H0, { sd: T.sd, res: T.res, bias });
    const m = L.measure(M0, { sd: BAL.sd, res: BAL.res });
    const rho = 4 * m / (Math.PI * (d / 10) ** 2 * (h / 10));
    const rm = BAL.u / m, rd = 2 * T.u / d, rh = T.u / h;
    const dg = tool === "ruler" ? 1 : 2;
    const rec = { tool: setName(k), set: k, d, h, dS: d.toFixed(dg), hS: h.toFixed(dg), m, rho, u: rho * (rm + rd + rh), rq: Math.sqrt(rm * rm + rd * rd + rh * rh), rs: rm + rd + rh, parts: [rm, rd, rh] };
    last = rec; tbl.add(rec);
  }

  /* 왼쪽: 원기둥과 도구, 오른쪽: 과녁 */
  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const lw = w * 0.5;
    // 원기둥 (옆에서 본 모습)
    const cw = Math.min(lw * 0.3, h * 0.32), ch = cw * H0 / D0 * 0.55, cx = lw * 0.36, cy = h * 0.5 - ch / 2 + 6;
    const g = ctx.createLinearGradient(cx - cw / 2, 0, cx + cw / 2, 0);
    g.addColorStop(0, "#9a9ca0"); g.addColorStop(0.45, "#e2e3e5"); g.addColorStop(1, "#8b8d91");
    ctx.fillStyle = g; ctx.fillRect(cx - cw / 2, cy, cw, ch);
    ctx.beginPath(); ctx.ellipse(cx, cy + ch, cw / 2, cw * 0.14, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = "#cfd0d3"; ctx.beginPath(); ctx.ellipse(cx, cy, cw / 2, cw * 0.14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.stroke();
    // 치수선
    ctx.strokeStyle = C.ink3; ctx.fillStyle = C.ink2; ctx.font = `11px ${F.mono}`; ctx.textAlign = "center";
    const dy = cy - cw * 0.14 - 12;
    ctx.beginPath(); ctx.moveTo(cx - cw / 2, dy); ctx.lineTo(cx + cw / 2, dy); ctx.stroke(); ctx.fillText("d", cx, dy - 4);
    const hx = cx + cw / 2 + 12;
    ctx.beginPath(); ctx.moveTo(hx, cy); ctx.lineTo(hx, cy + ch); ctx.stroke(); ctx.textAlign = "left"; ctx.fillText("h", hx + 4, cy + ch / 2 + 4);
    // 도구 표시
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(tool === "ruler" ? "강철자: 1 mm 눈금" : "버니어 캘리퍼스: 0.05 mm", 12, 18);
    if (setKey() === "zero") { ctx.fillStyle = C.apple; ctx.fillText("턱을 닫아도 +0.20 mm", 12, 34); }
    // 마지막 측정 읽음값
    ctx.font = `11.5px ${F.mono}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    const rx = 12, ry = h - 50;
    if (last) {
      ctx.fillText(`d = ${last.dS} mm   h = ${last.hS} mm`, rx, ry);
      ctx.fillText(`m = ${L.fmt(last.m, 0.01)} g`, rx, ry + 16);
      ctx.fillStyle = C.warn; ctx.fillText(`ρ = ${last.rho.toFixed(3)} g/cm³`, rx, ry + 32);
    } else { ctx.fillStyle = C.ink3; ctx.fillText("측정 버튼을 누르세요", rx, ry + 16); }
    // 과녁
    const tx = lw + (w - lw) / 2, ty = h / 2, R = Math.min((w - lw) / 2 - 10, h / 2 - 22);
    const rings = [["#f3e6dc", 1], ["#ead2c1", 0.75], ["#e1bea6", 0.5], ["#d6a688", 0.25]];
    rings.forEach(([c, f]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(tx, ty, R * f, 0, Math.PI * 2); ctx.fill(); });
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 0.8;
    [1, 0.75, 0.5, 0.25].forEach((f) => { ctx.beginPath(); ctx.arc(tx, ty, R * f, 0, Math.PI * 2); ctx.stroke(); });
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText("±4%", tx + R * 0.5, ty + 12); ctx.fillText("±8%", tx + R, ty + 12);
    ctx.fillText("밀도 결과 과녁 (가운데 = 문헌값)", tx, ty - R - 8);
    ctx.fillText("← 작게    크게 →", tx, ty + R + 16);
    // 점 찍기: 가로 = 상대 편차, 세로 = 겹침 방지용 벌림
    tbl.rows.forEach((r, i) => {
      const dev = (r.rho - RHO0) / RHO0, px = tx + NM.clamp(dev / 0.08, -1.08, 1.08) * R;
      const py = ty + (((i * 0.618) % 1) - 0.5) * R * 0.5;
      ctx.fillStyle = COL[r.set]; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    });
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows, n = Math.max(rows.length, 5);
    const lo = Math.min(2.3, ...rows.map((r) => r.rho - r.u)), hi = Math.max(3.1, ...rows.map((r) => r.rho + r.u));
    const box = { x0: 44, y0: 30, w: w - 58, h: h - 64 };
    const g = L.plot(ctx, box, { pts: [], xr: [0, n + 1], yr: [lo, hi], xlabel: "측정 회차", ylabel: "ρ (g/cm³)", model: () => RHO0 });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    rows.forEach((r, i) => {
      const x = g.X(i + 1), y = g.Y(r.rho);
      ctx.strokeStyle = COL[r.set]; ctx.fillStyle = COL[r.set]; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x, g.Y(r.rho - r.u)); ctx.lineTo(x, g.Y(r.rho + r.u));
      ctx.moveTo(x - 3, g.Y(r.rho - r.u)); ctx.lineTo(x + 3, g.Y(r.rho - r.u)); ctx.moveTo(x - 3, g.Y(r.rho + r.u)); ctx.lineTo(x + 3, g.Y(r.rho + r.u)); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
    // 범례
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    let lx = box.x0 + 70;
    [["ruler", "강철자"], ["vernier", "캘리퍼스"], ["zero", "영점 어긋남"]].forEach(([k, t]) => {
      ctx.fillStyle = COL[k]; ctx.beginPath(); ctx.arc(lx, 11, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.ink2; ctx.fillText(t, lx + 7, 15); lx += ctx.measureText(t).width + 24;
    });
    ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(lx, 11); ctx.lineTo(lx + 16, 11); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink2; ctx.fillText("문헌값", lx + 20, 15);
  }

  function nums() {
    const rows = tbl.rows.filter((r) => r.set === setKey());
    const s = L.stats(rows.map((r) => r.rho));
    const m = $(".n-m"), a = $(".n-a"), p = $(".n-p");
    if (!s.n) { m.textContent = a.textContent = p.textContent = "—"; return; }
    m.textContent = s.n > 1 ? `${s.mean.toFixed(3)} ± ${s.se.toFixed(3)}` : s.mean.toFixed(3);
    const dev = (s.mean - RHO0) / RHO0 * 100;
    a.textContent = `${dev >= 0 ? "+" : ""}${dev.toFixed(1)}%`;
    a.className = "n-a " + (s.n > 1 && Math.abs(s.mean - RHO0) > 3 * s.se && Math.abs(dev) > 1 ? "bad" : "");
    const r = rows[rows.length - 1];
    p.textContent = `${(r.rs * 100).toFixed(1)}% / ${(r.rq * 100).toFixed(1)}%`;
  }

  root.querySelector(".tool").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tool]"); if (!b) return;
    tool = b.dataset.tool;
    root.querySelectorAll("[data-tool]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    drawApp(); nums();
  });
  zero.addEventListener("change", () => { drawApp(); nums(); });
  $(".meas").addEventListener("click", measure);
  $(".meas5").addEventListener("click", () => { for (let i = 0; i < 5; i++) measure(); });
  $(".clear").addEventListener("click", () => { last = null; tbl.clear(); });

  if (L.demo) {
    for (let i = 0; i < 5; i++) measure();
    root.querySelector('[data-tool="vernier"]').click();
    for (let i = 0; i < 5; i++) measure();
    zero.checked = true;
    for (let i = 0; i < 5; i++) measure();
    zero.checked = false; nums();
  }
})();
