/* 카드: 액체마다 증기압이 다른 까닭을 압력 센서로 잴 수 있을까? — 닫힌 플라스크 증기압 측정, ln P–1/T로 증발열 */
(() => {
  const root = document.getElementById("card-labchem-vapor");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sT = $(".t"), cBias = $(".bias");
  const R = 8.314, P0 = 101.3, T0 = 293.15;

  // 앙투안 식 상수 (P: mmHg, t: °C) — 문헌값
  const LIQ = [
    { name: "물", A: 8.07131, B: 1730.63, C: 233.426, col: "#4f7fb0" },
    { name: "에탄올", A: 8.20417, B: 1642.89, C: 230.3, col: "#3b7c2a" },
    { name: "아세톤", A: 7.11714, B: 1210.595, C: 229.664, col: "#e0a02a" },
    { name: "에터", A: 6.92032, B: 1064.07, C: 228.8, col: "#b5532f" },
  ];
  const pv = (i, t) => { const q = LIQ[i]; return 10 ** (q.A - q.B / (q.C + t)) * 0.133322; };   // kPa
  const pAir = (t) => P0 * (t + 273.15) / T0;
  let li = 0, xKey = "ln", over = false, t = 0;

  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "nm", label: "액체" }, { key: "t", label: "t (°C)", res: 0.1 }, { key: "P", label: "전체 (kPa)", res: 0.1 },
    { key: "Pa", label: "공기 (kPa)", res: 0.1 }, { key: "Pv", label: "증기압 (kPa)", res: 0.1 },
  ], () => { drawPlot(); nums(); });

  const truthTotal = () => pAir(+sT.value) + pv(li, +sT.value);

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = h / 242, tc = +sT.value;
    // 물중탕
    const bx = w * 0.06, by = h * 0.42, bw = w * 0.5, bh = h * 0.52;
    ctx.fillStyle = `rgba(120,170,220,${(0.12 + tc / 45 * 0.18).toFixed(2)})`;
    ctx.fillRect(bx, by + 10 * s, bw, bh - 10 * s);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
    // 삼각 플라스크
    const fx = bx + bw * 0.42, fb = by + bh - 8 * s, fw = 50 * s, ft = by - 30 * s, nw = 9 * s;
    ctx.fillStyle = C.card; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(fx - nw, ft); ctx.lineTo(fx - nw, ft + 26 * s); ctx.lineTo(fx - fw, fb); ctx.lineTo(fx + fw, fb); ctx.lineTo(fx + nw, ft + 26 * s); ctx.lineTo(fx + nw, ft); ctx.closePath();
    ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke();
    ctx.fillStyle = LIQ[li].col; ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.moveTo(fx - fw + 4, fb - 1); ctx.lineTo(fx + fw - 4, fb - 1); ctx.lineTo(fx + fw - 9 * s, fb - 9 * s); ctx.lineTo(fx - fw + 9 * s, fb - 9 * s); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    // 증기 분자 (밀도 ∝ 증기압)
    const n = Math.round(clamp(pv(li, tc) / 2.5, 1, 60));
    ctx.fillStyle = LIQ[li].col;
    for (let k = 0; k < n; k++) {
      const u = (k * 0.618 + t * 0.07 * (1 + k % 3)) % 1, v = (k * 0.371 + Math.sin(t + k) * 0.05 + 1) % 1;
      const yy = ft + 28 * s + v * (fb - ft - 40 * s), half = nw + (fw - nw) * (yy - ft - 26 * s) / (fb - ft - 26 * s);
      ctx.beginPath(); ctx.arc(fx + (u - 0.5) * 2 * half * 0.85, yy, 1.8, 0, Math.PI * 2); ctx.fill();
    }
    // 마개, 관, 센서
    ctx.fillStyle = "#6b6b6f"; ctx.fillRect(fx - nw - 2, ft - 10 * s, 2 * nw + 4, 12 * s);
    const sx = w * 0.66, sy = h * 0.1;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(fx, ft - 10 * s); ctx.lineTo(fx, sy + 18); ctx.lineTo(sx, sy + 18); ctx.stroke();
    ctx.fillStyle = C.night; ctx.fillRect(sx, sy, 112, 40);
    const tot = truthTotal(); over = tot > 210;
    ctx.font = `600 13px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillStyle = over ? "#ff9b7a" : "#cfe8c4"; ctx.fillText(over ? "범위 초과" : tot.toFixed(1) + " kPa", sx + 104, sy + 20);
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = "#9fb59a"; ctx.fillText("기체 압력 센서", sx + 104, sy + 34);
    // 온도계
    const tx = bx + bw * 0.85;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx, by + bh - 14 * s); ctx.lineTo(tx, by - 24 * s); ctx.stroke();
    ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(tx, by + bh - 14 * s, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.night; ctx.fillRect(sx, sy + 56 * s + 20, 112, 26);
    ctx.fillStyle = "#cfe8c4"; ctx.font = `600 13px ${F.mono}`; ctx.fillText(tc.toFixed(1) + " °C", sx + 104, sy + 56 * s + 38);
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx, by - 24 * s); ctx.lineTo(sx, sy + 56 * s + 33); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(LIQ[li].name === "에터" ? "다이에틸 에터 3 mL" : LIQ[li].name + " 3 mL", fx + fw + 6, fb - 2);
    ctx.fillText("물중탕", bx + 6, by + bh - 6);
    if (over) { ctx.fillStyle = C.warn; ctx.textAlign = "left"; ctx.fillText("압력이 너무 큽니다 — 마개가 튈 수 있음", sx - 40, sy + 56 * s + 66); }
  }

  const fits = () => LIQ.map((q, i) => {
    const rr = tbl.rows.filter((r) => r.li === i && r.Pv > 0);
    return rr.length > 1 ? L.linfit(rr.map((r) => 1000 / (r.t + 273.15)), rr.map((r) => Math.log(r.Pv))) : null;
  });
  function nums() {
    fits().forEach((f, i) => { $(".n-" + i).textContent = f ? (-f.a * R).toFixed(1) + " kJ/mol" : "—"; });
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 20, w: w - 58, h: h - 54 }, rows = tbl.rows;
    const ln = xKey === "ln";
    const m = L.plot(ctx, box, ln ? { pts: [], xr: [3.1, 3.62], yr: [-0.5, 5.5], xlabel: "1000/T (K⁻¹)", ylabel: "ln (P / kPa)" }
      : { pts: [], xr: [0, 50], yr: [0, 150], xlabel: "t (°C)", ylabel: "증기압 P (kPa)" });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    const fs = fits();
    LIQ.forEach((q, i) => {
      ctx.fillStyle = q.col; ctx.strokeStyle = q.col;
      rows.filter((r) => r.li === i).forEach((r) => {
        const x = ln ? 1000 / (r.t + 273.15) : r.t, y = ln ? (r.Pv > 0 ? Math.log(r.Pv) : NaN) : r.Pv;
        if (!Number.isFinite(y)) return;
        ctx.beginPath(); ctx.arc(m.X(x), m.Y(y), 3.2, 0, Math.PI * 2); ctx.fill();
      });
      const f = fs[i]; if (!f) return;
      ctx.lineWidth = 1.4; ctx.beginPath();
      if (ln) { ctx.moveTo(m.X(3.1), m.Y(f.a * 3.1 + f.b)); ctx.lineTo(m.X(3.62), m.Y(f.a * 3.62 + f.b)); }
      else for (let k = 0; k <= 50; k++) { const x = k, y = Math.exp(f.a * 1000 / (x + 273.15) + f.b); k ? ctx.lineTo(m.X(x), m.Y(y)) : ctx.moveTo(m.X(x), m.Y(y)); }
      ctx.stroke();
    });
    ctx.restore();
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ["물", "에탄올", "아세톤", "다이에틸 에터"].forEach((nm, i) => {
      ctx.fillStyle = LIQ[i].col;
      if (ln) ctx.fillText("● " + nm, box.x0 + 8, box.y0 + box.h - 50 + i * 13);
      else ctx.fillText("● " + nm, box.x0 + 8, box.y0 + 12 + i * 13);
    });
  }

  function measure() {
    if (truthTotal() > 210) return;
    const tset = +sT.value, tTrue = tset + 0.08 * L.gauss();
    const tm = L.snap(tTrue + 0.05 * L.gauss(), 0.1);
    const P = L.measure(pAir(tTrue) + pv(li, tTrue), { sd: 0.12, res: 0.1 });
    const Pa = L.snap(cBias.checked ? P0 : pAir(tm), 0.1);
    tbl.add({ li, nm: LIQ[li].name, t: tm, P, Pa, Pv: +(P - Pa).toFixed(1) });
  }

  loop($(".cv-wide"), (dt) => { t += dt; drawApp(); });
  sT.addEventListener("input", () => { $(".t-out").textContent = sT.value; drawApp(); });
  $(".liq").addEventListener("click", (e) => {
    const b = e.target.closest("[data-l]"); if (!b) return;
    li = +b.dataset.l; root.querySelectorAll("[data-l]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawApp();
  });
  $(".xsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-x]"); if (!b) return;
    xKey = b.dataset.x; root.querySelectorAll("[data-x]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  $(".meas").addEventListener("click", measure);
  $(".clear").addEventListener("click", () => tbl.clear());
  if (L.demo) {
    [[0, [20, 25, 30, 35, 40, 45]], [1, [10, 15, 20, 25, 30, 35]], [2, [10, 15, 20, 25, 30, 35]], [3, [5, 10, 15, 20, 25, 30]]].forEach(([i, ts]) => {
      li = i; ts.forEach((tc) => { sT.value = tc; drawApp(); measure(); });
    });
    li = 0; sT.value = 25; $(".t-out").textContent = "25";
  }
  drawApp();
})();
