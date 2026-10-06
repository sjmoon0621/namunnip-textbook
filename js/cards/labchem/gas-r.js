/* 카드: 마그네슘 리본 한 조각으로 기체 상수 R을 구할 수 있을까? — Mg + HCl, 수상 치환, 수증기압 보정, 오차 토론 */
(() => {
  const root = document.getElementById("card-labchem-gas-r");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const R = 0.082057, MG = 24.305, HPA = 1013.25;
  /* 물의 증기압 (앙투안 식, mmHg → hPa), t는 °C */
  const pw = (t) => 10 ** (8.07131 - 1730.63 / (233.426 + t)) * 1.33322;
  const sM = $(".mg"), sT = $(".tc"), sP = $(".pa");
  let anim = null, Vshow = 0, bubbles = [];

  const app = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "m", label: "m (g)", res: 0.0001 }, { key: "V", label: "V (mL)", res: 0.1 }, { key: "T", label: "t (°C)", res: 0.1 },
    { key: "P", label: "P (hPa)", res: 1 }, { key: "R", label: "R", res: 0.0001 },
  ], () => { drawPlot(); nums(); });

  function trial() {
    const mTrue = +sM.value * (1 + 0.04 * (Math.random() - 0.5)), t = +sT.value, Pa = +sP.value;
    const ox = $(".e-ox").checked, lvl = $(".e-lvl").checked, hot = $(".e-hot").checked, vap = $(".e-vap").checked;
    const n = mTrue * (ox ? 0.955 : 1) / MG;
    const tg = t + (hot ? 3 : 0), Ptube = Pa - (lvl ? 11.8 : 0);   // 12 cm 물기둥 ≈ 11.8 hPa
    const Vtrue = n * R * (tg + 273.15) / ((Ptube - pw(tg)) / HPA) * 1000;   // mL
    const rec = {
      m: L.measure(mTrue, { sd: 0.00005, res: 0.0001 }), V: L.measure(Vtrue, { sd: 0.08, res: 0.1 }),
      T: L.measure(t, { sd: 0.08, res: 0.1 }), P: L.measure(Pa, { sd: 0.5, res: 1 }), vap,
    };
    const nn = rec.m / MG, Peff = (rec.P - (vap ? 0 : pw(rec.T))) / HPA, TK = rec.T + 273.15;
    rec.x = nn * 1000; rec.y = Peff * rec.V / TK; rec.R = rec.y / rec.x;
    rec.lvl = lvl;
    return rec;
  }

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const bx0 = w * 0.08, bx1 = w * 0.5, bTop = h * 0.2, bBot = h - 12;
    const tTop = 10, tLen = h * 0.62, mlpx = tLen / 52, gasBot = tTop + 4 + Vshow * mlpx;
    const lvlOn = $(".e-lvl").checked, water = Math.max(bTop + 6, gasBot + (lvlOn ? 26 : 0));   // 바깥 수면
    // 비커와 물
    ctx.fillStyle = "rgba(120,170,215,0.22)"; ctx.fillRect(bx0, water, bx1 - bx0, bBot - water);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(bx0, bTop); ctx.lineTo(bx0, bBot); ctx.lineTo(bx1, bBot); ctx.lineTo(bx1, bTop); ctx.stroke();
    // 기체 측정관 (0 mL가 위, 50 mL 눈금이 아래)
    const tx = (bx0 + bx1) / 2, tw = 22;
    ctx.fillStyle = "rgba(120,170,215,0.30)"; ctx.fillRect(tx - tw / 2, gasBot, tw, bBot - 30 - gasBot);
    ctx.fillStyle = C.card; ctx.fillRect(tx - tw / 2, tTop, tw, gasBot - tTop);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(tx - tw / 2, bBot - 30); ctx.lineTo(tx - tw / 2, tTop); ctx.lineTo(tx + tw / 2, tTop); ctx.lineTo(tx + tw / 2, bBot - 30); ctx.stroke();
    ctx.lineWidth = 1; ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "right";
    for (let v = 0; v <= 50; v += 5) {
      const y = tTop + 4 + v * mlpx;
      ctx.beginPath(); ctx.moveTo(tx - tw / 2, y); ctx.lineTo(tx - tw / 2 + (v % 10 ? 4 : 8), y); ctx.stroke();
      if (v % 10 === 0) ctx.fillText(String(v), tx - tw / 2 - 3, y + 3);
    }
    // 안쪽 수면 표시 (수면을 맞추지 않았을 때 높이 차)
    if (lvlOn) {
      ctx.strokeStyle = C.warn; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(tx + tw / 2 + 4, water); ctx.lineTo(bx1 - 4, water); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.warn; ctx.textAlign = "left"; ctx.font = `10.5px ${F.sans}`; ctx.fillText("바깥 수면", tx + tw / 2 + 6, water - 4);
    }
    // 구리선 감은 Mg
    const my = bBot - 40;
    ctx.strokeStyle = "#b87333"; ctx.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(tx, my - i * 3, 6, 2, 0, 0, Math.PI * 2); ctx.stroke(); }
    if (!anim || anim.t < 1.8) { ctx.fillStyle = "#c9cbd0"; ctx.fillRect(tx - 2, my - 14, 4, 14 * (anim ? 1 - anim.t / 1.8 : 1)); }
    ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.strokeStyle = C.ink3;
    bubbles.forEach((b) => { ctx.beginPath(); ctx.arc(tx + b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
    // 오른쪽 계기
    const rx = w * 0.6;
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`;
    const rows = [["기체 부피", Vshow ? Vshow.toFixed(1) + " mL" : "—"], ["물 온도", (+sT.value).toFixed(1) + " °C"], ["대기압", sP.value + " hPa"], ["수증기압", pw(+sT.value).toFixed(1) + " hPa"]];
    rows.forEach(([k, v], i) => {
      const y = 26 + i * (h - 30) / 4;
      ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.fillText(k, rx, y);
      ctx.fillStyle = i === 3 ? C.ink2 : C.ink; ctx.font = `600 15px ${F.mono}`; ctx.fillText(v, rx, y + 20);
    });
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows, f = getFit();
    L.plot(ctx, { x0: 50, y0: 20, w: w - 64, h: h - 54 }, { pts: rows.map((r) => ({ x: r.x, y: r.y })), fit: f, model: (x) => 0.08206 * x, xr: [0, 2], yr: [0, 0.17], xlabel: "n(H₂) (mmol)", ylabel: "PV/T (mL·atm/K)" });
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText("점선: R = 0.08206 · 실선: 내 자료 (원점 통과)", 54, h - 4);
  }
  function getFit() { const rows = tbl.rows; return rows.length > 1 ? L.linfit(rows.map((r) => r.x), rows.map((r) => r.y), true) : null; }
  function nums() {
    const f = getFit();
    $(".n-R").textContent = f ? `${f.a.toFixed(4)} ± ${f.sa.toFixed(4)}` : "—";
    const d = f ? (f.a / 0.08206 - 1) * 100 : NaN;
    $(".n-d").textContent = f ? `${d > 0 ? "+" : ""}${d.toFixed(1)} %` : "—";
    $(".n-d").className = "n-d " + (f ? (Math.abs(d) < 1 ? "good" : "bad") : "");
  }
  const upd = () => {
    $(".m-out").textContent = (+sM.value).toFixed(3); $(".t-out").textContent = sT.value; $(".p-out").textContent = sP.value;
    $(".n-w").textContent = pw(+sT.value).toFixed(1) + " hPa"; draw();
  };

  loop($(".cv-wide"), (dt) => {
    if (!anim && !bubbles.length) return false;
    if (anim) {
      anim.t += dt; Vshow = anim.rec.V * Math.min(1, anim.t / 2);
      if (anim.t < 1.8 && Math.random() < 0.6) bubbles.push({ x: (Math.random() - 0.5) * 10, y: app.size.h - 56, r: 1.5 + Math.random() * 2 });
      if (anim.t >= 2.3) { tbl.add(anim.rec); anim = null; }
    }
    const top = 14 + Vshow * (app.size.h * 0.62 / 52);
    bubbles.forEach((b) => { b.y -= 90 * dt; }); bubbles = bubbles.filter((b) => b.y > top);
    draw();
  });

  [sM, sT, sP].forEach((s) => s.addEventListener("input", upd));
  root.querySelectorAll(".toggles input").forEach((c) => c.addEventListener("change", draw));
  $(".run").addEventListener("click", () => { if (!anim) { anim = { t: 0, rec: trial() }; Vshow = 0; } });
  $(".clear").addEventListener("click", () => { tbl.clear(); Vshow = 0; draw(); });

  upd();
  if (L.demo) {
    [0.022, 0.027, 0.031, 0.036, 0.040, 0.044].forEach((m, i) => { sM.value = m; sT.value = [21, 22, 22, 23, 22, 21][i]; tbl.add(trial()); });
    sM.value = 0.036; sT.value = 22; Vshow = tbl.rows[3].V; upd();
  }
})();
