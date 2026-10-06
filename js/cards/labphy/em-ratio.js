/* 카드: 빛나는 전자 고리의 지름만 재서 전자의 e/m을 구할 수 있을까? — 헬름홀츠 코일 비전하 측정 */
(() => {
  const root = document.getElementById("card-labphy-em-ratio");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sV = $(".v"), sI = $(".i"), cE = $(".earth"), bT = $(".truth");
  const EM = 1.75882e11;                       // 전자의 비전하 (C/kg)
  const K = Math.pow(0.8, 1.5) * 4e-7 * Math.PI * 130 / 0.15;   // 헬름홀츠 코일 상수 (T/A), N = 130, R = 0.15 m
  const BE = 3.0e-5;                           // 코일 축 방향 지구 자기장 수평 성분 (T)
  const RB = 0.08, GY = 0.07;                  // 유리구 반지름, 전자총 출구의 중심 아래 거리 (m)
  let ph = 0, showTruth = false;

  const bTrue = () => K * +sI.value + (cE.checked ? BE : 0);
  const radius = (V, B) => Math.sqrt(2 * V / EM) / B;

  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "V", label: "V (V)", res: 1 }, { key: "I", label: "I (A)", res: 0.01 }, { key: "d", label: "d (cm)", res: 0.1 },
    { key: "B", label: "B (mT)", res: 0.001 }, { key: "x", label: "B²r² (10⁻⁹T²m²)", res: 0.01 }, { key: "y", label: "2V (V)", res: 1 },
  ], () => drawPlot());

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const Rb = h * 0.42, s = Rb / RB, cx = Math.min(w * 0.36, Rb + 40), cy = h * 0.5;
    const V = +sV.value, r = radius(V, bTrue());
    // 코일 (정면에서 본 모습, 크기는 모식)
    ctx.strokeStyle = "#b8743a"; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(cx, cy, Rb + 13, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#8a5426"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, Rb + 17, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, Rb + 9, 0, Math.PI * 2); ctx.stroke();
    // 유리구
    ctx.fillStyle = "#1e2326"; ctx.beginPath(); ctx.arc(cx, cy, Rb, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#9aa3a8"; ctx.lineWidth = 1.5; ctx.stroke();
    // 눈금자 (전자총 출구에서 위로)
    const gx = cx, gy = cy + GY * s;
    ctx.strokeStyle = "rgba(240,240,230,.75)"; ctx.fillStyle = "rgba(240,240,230,.8)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy - 0.145 * s); ctx.stroke();
    ctx.font = `9px ${F.mono}`; ctx.textAlign = "right";
    for (let mm = 0; mm <= 145; mm += 1) {
      const y = gy - mm / 1000 * s, len = mm % 10 === 0 ? 7 : mm % 5 === 0 ? 4.5 : 2.5;
      if (s / 1000 < 1.6 && mm % 5) continue;
      ctx.beginPath(); ctx.moveTo(gx - len, y); ctx.lineTo(gx, y); ctx.stroke();
      if (mm % 20 === 0) ctx.fillText(String(mm / 10), gx - 9, y + 3);
    }
    // 전자총
    ctx.fillStyle = "#6b6f72"; ctx.fillRect(gx - 0.03 * s, gy - 4, 0.03 * s, 8);
    ctx.fillStyle = "#c9a227"; ctx.fillRect(gx - 0.034 * s, gy - 3, 4, 6);
    // 빔
    const hit = 2 * r > GY + RB - 0.004;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, Rb - 1, 0, Math.PI * 2); ctx.clip();
    ctx.shadowColor = "#57c7e0"; ctx.shadowBlur = 10; ctx.strokeStyle = "rgba(110,205,230,.85)"; ctx.lineWidth = 2.6;
    const ccx = gx, ccy = gy - r * s;
    ctx.beginPath(); ctx.arc(ccx, ccy, r * s, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0; ctx.fillStyle = "#e8fbff";
    for (let k = 0; k < 6; k++) {
      const a = Math.PI / 2 - (ph + k / 6) * Math.PI * 2;
      ctx.beginPath(); ctx.arc(ccx + Math.cos(a) * r * s, ccy + Math.sin(a) * r * s, 1.8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // 오른쪽 계기 읽음
    const tx = cx + Rb + 34;
    ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.mono}`;
    ctx.fillText(`V = ${V} V`, tx, cy - 46);
    ctx.fillText(`I = ${(+sI.value).toFixed(2)} A`, tx, cy - 26);
    ctx.font = `12px ${F.mono}`; ctx.fillStyle = C.ink2;
    ctx.fillText(`B = kI = ${(K * +sI.value * 1e3).toFixed(3)} mT`, tx, cy - 4);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink3;
    ctx.fillText("눈금 단위: cm (1 mm 간격)", tx, cy + 20);
    ctx.fillText("자기장: 화면에 수직", tx, cy + 37);
    if (hit) { ctx.fillStyle = C.warn; ctx.font = `600 12px ${F.sans}`; ctx.fillText("빔이 유리벽에 닿아 원을 잴 수 없음", tx, cy + 62); }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const pts = tbl.rows.map((r) => ({ x: r.x, y: r.y }));
    const f = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y), true) : null;
    const xm = Math.max(4, ...pts.map((p) => p.x)) * 1.1, ym = Math.max(400, ...pts.map((p) => p.y)) * 1.1;
    L.plot(ctx, { x0: 46, y0: 18, w: w - 60, h: h - 52 }, {
      pts, fit: f, xr: [0, xm], yr: [0, ym], xlabel: "B²r² (10⁻⁹ T²·m²)", ylabel: "2V (V)",
      model: showTruth ? (x) => EM * 1e-9 * x : null,
    });
    const em = f ? f.a * 1e9 : NaN;
    const sci = (v) => { const e = Math.floor(Math.log10(v)); return `${(v / 10 ** e).toFixed(e === 11 ? 3 : 2)}×10${String(e).replace(/./g, (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹⁻"["0123456789-".indexOf(c)])}`; };
    $(".n-em").textContent = f ? sci(em) + " C/kg" : "—";
    $(".n-se").textContent = f && pts.length > 2 ? "± " + sci(f.sa * 1e9) : "—";
    const dEl = $(".n-diff");
    if (f) { const d = (em / EM - 1) * 100; dEl.textContent = (d >= 0 ? "+" : "") + d.toFixed(1) + " %"; dEl.className = "n-diff " + (Math.abs(d) < 2 ? "good" : "bad"); }
    else { dEl.textContent = "—"; dEl.className = "n-diff"; }
    if (showTruth) {
      ctx.fillStyle = C.ink3; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
      ctx.fillText("점선: e/m = 1.759×10¹¹ C/kg", 52, 32);
    }
  }

  function record() {
    const V = +sV.value, I = +sI.value, r = radius(V, bTrue());
    if (2 * r > GY + RB - 0.004) return false;
    const dm = L.measure(2 * r, { sd: 0.001, res: 0.001 });
    const rr = dm / 2, B = K * I;
    tbl.add({ V, I, d: dm * 100, B: B * 1e3, x: B * B * rr * rr * 1e9, y: 2 * V });
    return true;
  }

  loop($(".cv-wide"), (dt) => { ph = (ph + dt * 0.35) % 1; drawApp(); });
  const upd = () => { $(".v-out").textContent = sV.value; $(".i-out").textContent = (+sI.value).toFixed(2); drawApp(); };
  [sV, sI].forEach((el) => el.addEventListener("input", upd));
  cE.addEventListener("change", drawApp);
  $(".meas").addEventListener("click", record);
  $(".clear").addEventListener("click", () => tbl.clear());
  bT.addEventListener("click", () => { showTruth = !showTruth; bT.setAttribute("aria-pressed", String(showTruth)); drawPlot(); });
  upd();
  if (L.demo) {
    [[150, 1.5], [180, 1.5], [210, 1.5], [240, 1.5], [270, 1.5], [300, 1.5], [250, 1.2], [250, 1.8], [250, 2.1], [250, 2.4]]
      .forEach(([v, i]) => { sV.value = v; sI.value = i; record(); });
    sV.value = 200; sI.value = 1.5; upd();
  }
})();
