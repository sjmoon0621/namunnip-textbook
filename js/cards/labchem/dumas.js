/* 카드: 플라스크를 채운 증기의 질량으로 미지 액체의 분자량을 알 수 있을까? — 뒤마법, 남은 증기 보정, 미지 물질 판정 */
(() => {
  const root = document.getElementById("card-labchem-dumas");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const R = 0.082057, HPA = 1013.25, V = 0.1364, TROOM = 22, MAIR = 28.96;
  /* 후보: 몰 질량, 앙투안 상수 (mmHg, °C) */
  const CAND = [
    { k: "meoh", name: "메탄올", M: 32.04, A: [8.08097, 1582.271, 239.726] },
    { k: "etoh", name: "에탄올", M: 46.07, A: [8.20417, 1642.89, 230.3] },
    { k: "acet", name: "아세톤", M: 58.08, A: [7.11714, 1210.595, 229.664] },
    { k: "hex", name: "헥세인", M: 86.18, A: [6.87601, 1171.17, 224.408] },
  ];
  const pvap = (c, t) => 10 ** (c.A[0] - c.A[1] / (c.A[2] + t)) / 760;   // atm
  const bp = (c, Patm) => c.A[1] / (c.A[0] - Math.log10(Patm * 760)) - c.A[2];   // °C
  const U = CAND[Math.floor(Math.random() * 4)];
  const sT = $(".tb"), sP = $(".pa");
  let last = null;

  const app = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "T", label: "중탕 (°C)", res: 0.1 }, { key: "P", label: "P (hPa)", res: 1 }, { key: "dm", label: "Δm (g)", res: 0.0001 },
    { key: "cs", label: "보정" }, { key: "M", label: "M (g/mol)", res: 0.1 },
  ], () => { drawPlot(); nums(); });

  const corrMass = () => pvap(U, TROOM) * V / (R * (TROOM + 273.15)) * MAIR;

  function run() {
    const Tb = +sT.value, Pa = +sP.value, P = Pa / HPA;
    const nTot = P * V / (R * (Tb + 273.15));
    let mTrue = nTot * U.M - corrMass();
    if (Tb < bp(U, P)) mTrue += 0.35 + Math.random() * 0.5;   // 다 증발하지 못하고 남은 액체
    if ($(".e-wet").checked) mTrue += 0.05 + Math.random() * 0.1;
    const m0 = 78.2 + Math.random() * 6;
    const mA = L.measure(m0, { sd: 0.0003, res: 0.0001 }), mB = L.measure(m0 + mTrue, { sd: 0.0006, res: 0.0001 });
    const rec = { T: L.measure(Tb, { sd: 0.15, res: 0.1 }), P: L.measure(Pa, { sd: 0.5, res: 1 }), dm: +(mB - mA).toFixed(4), corr: $(".e-corr").checked, m0: mA, m1: mB };
    const mUse = rec.dm + (rec.corr ? corrMass() : 0);
    rec.cs = rec.corr ? "함" : "안 함";
    rec.M = mUse * R * (rec.T + 273.15) / (rec.P / HPA * V);
    last = rec; tbl.add(rec); draw();
  }

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const Tb = +sT.value;
    // 가열판과 물중탕
    const bx0 = w * 0.06, bx1 = w * 0.48, bTop = h * 0.32, bBot = h - 26;
    ctx.fillStyle = C.ink2; ctx.fillRect(bx0 - 8, bBot, bx1 - bx0 + 16, 12);
    ctx.fillStyle = Tb >= 99 ? "rgba(120,170,215,0.32)" : "rgba(120,170,215,0.24)"; ctx.fillRect(bx0, bTop + 8, bx1 - bx0, bBot - bTop - 8);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(bx0, bTop); ctx.lineTo(bx0, bBot); ctx.lineTo(bx1, bBot); ctx.lineTo(bx1, bTop); ctx.stroke();
    if (Tb >= 95) {
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) { const x = bx0 + 14 + i * (bx1 - bx0 - 28) / 3; ctx.beginPath(); ctx.moveTo(x, bTop + 2); ctx.quadraticCurveTo(x - 6, bTop - 8, x, bTop - 16); ctx.quadraticCurveTo(x + 6, bTop - 24, x, bTop - 30); ctx.stroke(); }
    }
    // 둥근바닥 플라스크
    const fx = (bx0 + bx1) / 2, fy = bBot - h * 0.24, r = h * 0.2;
    ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(fx, fy, r, -Math.PI / 2 + 0.28, Math.PI * 1.5 - 0.28); ctx.lineTo(fx - 8, 22); ctx.lineTo(fx + 8, 22); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#c8c9cc"; ctx.fillRect(fx - 11, 14, 22, 9); ctx.strokeStyle = C.ink3; ctx.strokeRect(fx - 11, 14, 22, 9);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(fx, 18, 1.4, 0, Math.PI * 2); ctx.fill();
    const full = Tb >= bp(U, +sP.value / HPA);
    ctx.fillStyle = "rgba(160,120,200,0.18)"; ctx.beginPath(); ctx.arc(fx, fy, r - 3, 0, Math.PI * 2); ctx.fill();
    if (!full) { ctx.fillStyle = "rgba(160,120,200,0.55)"; ctx.beginPath(); ctx.ellipse(fx, fy + r - 8, r * 0.45, 5, 0, 0, Math.PI * 2); ctx.fill(); }
    // 온도계
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx1 - 16, 26); ctx.lineTo(bx1 - 16, bBot - 18); ctx.stroke();
    ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(bx1 - 16, bBot - 16, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText(full ? "증기만 가득 (모식)" : "액체가 남음", fx, bBot + 24 - 0);
    // 오른쪽: 저울
    const rx = w * 0.58, bw = w - rx - 12;
    const box = (y, lab, v) => {
      ctx.textAlign = "left"; ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.fillText(lab, rx, y);
      ctx.fillStyle = C.night; ctx.fillRect(rx, y + 6, bw, 28);
      ctx.fillStyle = "#9be08a"; ctx.font = `600 15px ${F.mono}`; ctx.textAlign = "right";
      ctx.fillText(v == null ? "—" : v.toFixed(4) + " g", rx + bw - 8, y + 26);
    };
    box(24, "플라스크 + 포일 (빈 것)", last && last.m0);
    box(88, "식힌 뒤 (응축액 포함)", last && last.m1);
    ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.mono}`;
    ctx.fillText(last ? `Δm = ${last.dm.toFixed(4)} g` : "Δm = —", rx, 160);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`;
    ctx.fillText("V = 136.4 mL · 실온 22 °C", rx, 182);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows, hi = Math.max(100, ...rows.map((r) => Math.min(r.M, 200))) * 1.05;
    const box = { x0: 46, y0: 20, w: w - 120, h: h - 54 };
    const o = L.plot(ctx, box, { pts: rows.filter((r) => r.M <= 200).map((r, i) => ({ x: rows.indexOf(r) + 1, y: r.M })), xr: [0, Math.max(7, rows.length + 1)], yr: [0, hi], xlabel: "기록 번호", ylabel: "M (g/mol)" });
    CAND.forEach((c) => {
      const y = o.Y(c.M);
      ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 4]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(box.x0, y); ctx.lineTo(box.x0 + box.w, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`${c.name} ${c.M}`, box.x0 + box.w + 6, y + 4);
    });
    rows.forEach((r, i) => {
      if (r.M > 200) { ctx.fillStyle = C.warn; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("↑" + r.M.toFixed(0), o.X(i + 1), box.y0 + 10); return; }
      if (r.corr) { ctx.strokeStyle = C.forest; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(o.X(i + 1), o.Y(r.M), 6, 0, Math.PI * 2); ctx.stroke(); }
    });
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText("고리: 남은 증기 보정을 한 기록", 50, h - 4);
  }

  function nums() {
    const rows = tbl.rows, cur = rows.filter((r) => r.corr === $(".e-corr").checked && r.M < 200);
    const s = L.stats(cur.map((r) => r.M));
    $(".n-M").textContent = s.n ? `${s.mean.toFixed(1)}${s.n > 1 ? " ± " + s.sd.toFixed(1) : ""}` : "—";
    const best = s.n ? CAND.reduce((a, b) => (Math.abs(b.M - s.mean) < Math.abs(a.M - s.mean) ? b : a)) : null;
    $(".n-c").textContent = best ? `${best.name} (${(s.mean / best.M * 100 - 100).toFixed(0)}%)` : "—";
    $(".n-k").textContent = $(".e-corr").checked ? `+${corrMass().toFixed(4)} g` : "보정 안 함";
  }

  const upd = () => { $(".t-out").textContent = (+sT.value).toFixed(1); $(".p-out").textContent = sP.value; draw(); };
  [sT, sP].forEach((s) => s.addEventListener("input", upd));
  $(".e-corr").addEventListener("change", nums);
  $(".run").addEventListener("click", run);
  $(".truth").addEventListener("click", () => { $(".n-c").textContent = `정체: ${U.name} (${U.M})`; });
  $(".clear").addEventListener("click", () => { tbl.clear(); last = null; draw(); });

  upd(); nums();
  if (L.demo) {
    for (let i = 0; i < 3; i++) run();
    $(".e-corr").checked = true; for (let i = 0; i < 3; i++) run();
    sT.value = 60; run(); sT.value = 98; upd(); nums();
  }
})();
