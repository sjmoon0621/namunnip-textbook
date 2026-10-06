/* 카드: 검정말이 내는 기포 수로 광합성 속도를 비교할 수 있을까? — 빛의 세기(역제곱), CO₂, 온도, 빛의 색, 제한 요인 */
(() => {
  const root = document.getElementById("card-labbio-photosynthesis");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sD = $(".d"), sC = $(".c"), sT = $(".t");
  const CO2 = [0, 0.05, 0.1, 0.2, 0.5, 1.0];
  const COLN = { w: "없음", r: "빨강", g: "초록", b: "파랑" };
  const EFF = { w: 1, r: 0.9, g: 0.25, b: 0.8 };   // 필터 투과 × 엽록체 흡수 효율 (모식)
  const FILL = { w: "rgba(255,240,170,.0)", r: "rgba(220,60,50,.55)", g: "rgba(60,170,80,.55)", b: "rgba(60,100,220,.55)" };
  const SER = ["#8d8d92", "#b5532f", "#e0a02a", "#74ab66", "#3b7c2a", "#1f4e8c"];
  let col = "w", xKey = "i", run = null, t = 0;

  const rel = (d) => 100 * (10 / d) ** 2;
  const heat = (d, noShield) => (noShield ? 9 * (10 / d) ** 2 : 0.6 * (10 / d) ** 2);
  const fT = (T) => 2 ** ((T - 25) / 10) / (1 + Math.exp((T - 37) / 3)) * (1 + Math.exp(-4));
  // 1분당 기포 수 (모식): 비직각 쌍곡선 광반응 곡선 − 호흡
  function net(c) {
    const I = rel(c.d) / 100 * EFF[c.col], Tw = c.T + heat(c.d, c.ns);
    const Pm = 50 * (c.co2 + 0.01) / (c.co2 + 0.13) * fT(Tw), aI = 150 * I, th = 0.9;
    const P = Pm > 0 ? (aI + Pm - Math.sqrt((aI + Pm) ** 2 - 4 * th * aI * Pm)) / (2 * th) : 0;
    const R = 2 * 2 ** ((Tw - 25) / 10);
    return { n: P - R, Tw };
  }
  const cur = () => ({ d: +sD.value, co2: CO2[+sC.value], T: +sT.value, col, ns: $(".noshield").checked });

  const tbl = L.table($(".tbl-host"), [
    { key: "d", label: "d (cm)", res: 1 }, { key: "co2", label: "NaHCO₃ (%)", res: 0.01 }, { key: "tw", label: "수온 (°C)", res: 0.5 },
    { key: "cn", label: "필터" }, { key: "n", label: "기포 (개/분)", res: 1 },
  ], () => drawPlot());
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());

  function record(c) {
    const { n, Tw } = net(c);
    const m = Math.max(0, n);
    const cnt = Math.max(0, Math.round(m + (0.5 + 0.07 * m) * L.gauss()));
    return { d: c.d, co2: c.co2, T: c.T, col: c.col, ns: c.ns, tw: L.measure(Tw, { sd: 0.2, res: 0.5 }), cn: COLN[c.col], n: cnt };
  }

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const c = run ? run.c : cur();
    const bx = w * 0.62, bw = w * 0.22, top = 30, bot = h - 34;
    const scale = (w * 0.5) / 60;   // 60 cm가 화면 폭 절반
    const lx = bx - c.d * scale, ly = (top + bot) / 2 + 10;
    // 자
    ctx.strokeStyle = C.ink3; ctx.fillStyle = C.ink3; ctx.lineWidth = 1; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    ctx.beginPath(); ctx.moveTo(bx - 60 * scale, bot + 14); ctx.lineTo(bx, bot + 14); ctx.stroke();
    for (let cm = 0; cm <= 60; cm += 10) { const x = bx - cm * scale; ctx.fillRect(x, bot + 10, 1, 8); ctx.fillText(cm, x, bot + 28); }
    // 빛줄기
    const I = rel(c.d) / 100;
    ctx.fillStyle = `rgba(255,214,90,${0.12 + 0.3 * Math.min(1, I)})`;
    ctx.beginPath(); ctx.moveTo(lx + 10, ly - 6); ctx.lineTo(bx + bw, top + 30); ctx.lineTo(bx + bw, bot); ctx.lineTo(lx + 10, ly + 6); ctx.fill();
    // 전등
    ctx.fillStyle = "#ffd25a"; ctx.beginPath(); ctx.arc(lx, ly, 11, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(lx, ly, 11, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.fillRect(lx - 2, ly + 11, 4, bot - ly - 11); ctx.fillRect(lx - 12, bot - 2, 24, 4);
    // 열 차단 수조
    const sx = bx - 30;
    if (!c.ns && c.d >= 15) { ctx.fillStyle = "rgba(160,200,235,.45)"; ctx.fillRect(sx - 14, top + 40, 12, bot - top - 40); ctx.strokeStyle = C.ink3; ctx.strokeRect(sx - 14, top + 40, 12, bot - top - 40); }
    // 필터
    if (c.col !== "w") { ctx.fillStyle = FILL[c.col]; ctx.fillRect(bx - 10, top + 30, 6, bot - top - 30); }
    // 비커
    ctx.fillStyle = "rgba(200,225,245,.55)"; ctx.fillRect(bx, top + 24, bw, bot - top - 24);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(bx, top + 6); ctx.lineTo(bx, bot); ctx.lineTo(bx + bw, bot); ctx.lineTo(bx + bw, top + 6); ctx.stroke();
    // 검정말 (자른 끝이 위)
    const sxm = bx + bw / 2, cutY = top + 50;
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sxm, bot - 6); ctx.lineTo(sxm, cutY); ctx.stroke();
    ctx.fillStyle = C.leaf;
    for (let y = cutY + 8; y < bot - 8; y += 9) for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sxm + s * 7, y, 7, 2.2, s * 0.5, 0, Math.PI * 2); ctx.fill(); }
    // 기포
    if (run) {
      ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 1.2;
      for (const b of run.bub) { const age = run.sim - b; if (age < 0 || age > 3) continue; const y = cutY - age * (cutY - top - 26) / 3; ctx.beginPath(); ctx.arc(sxm + Math.sin(b * 7) * 2, y, 2.4, 0, Math.PI * 2); ctx.stroke(); }
    }
    // 정보
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left";
    const { Tw } = net(c);
    ctx.fillText(`빛의 세기 ${rel(c.d).toFixed(0)} (상대)`, 12, 18);
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink2;
    ctx.fillText(`수온 ${Tw.toFixed(1)} °C`, 12, 34);
    ctx.textAlign = "right"; ctx.fillStyle = C.ink;
    ctx.font = `600 13px ${F.mono}`;
    ctx.fillText(run ? `${Math.min(60, run.sim).toFixed(0)} s · ${run.bub.filter((b) => b <= run.sim).length}개` : "1분 계수 대기", w - 10, 18);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const c = cur(), box = { x0: 44, y0: 18, w: w - 58, h: h - 52 };
    const ymax = Math.max(10, ...tbl.rows.map((r) => r.n)) * 1.12;
    if (xKey === "i") {
      const rows = tbl.rows.filter((r) => r.T === c.T && r.col === c.col);
      const xr = [0, 105];
      L.plot(ctx, box, { pts: [], xr, yr: [0, ymax], xlabel: "빛의 세기 100×(10/d)²", ylabel: "기포 (개/분)" });
      const used = [];
      CO2.forEach((q, i) => {
        const pts = rows.filter((r) => r.co2 === q).map((r) => ({ x: rel(r.d), y: r.n }));
        if (!pts.length) return;
        used.push(i);
        L.plot(ctx, box, { pts, xr, yr: [0, ymax], color: SER[i] });
      });
      ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
      used.forEach((i, k) => { ctx.fillStyle = SER[i]; ctx.fillRect(box.x0 + box.w - 120, box.y0 + 6 + k * 15, 8, 8); ctx.fillStyle = C.ink2; ctx.fillText(`NaHCO₃ ${CO2[i].toFixed(2)}%`, box.x0 + box.w - 108, box.y0 + 14 + k * 15); });
    } else {
      const keep = xKey === "c" ? (r) => r.d === c.d && r.T === c.T && r.col === c.col : (r) => r.d === c.d && r.co2 === c.co2 && r.col === c.col;
      const pts = tbl.rows.filter(keep).map((r) => ({ x: xKey === "c" ? r.co2 : r.tw, y: r.n }));
      L.plot(ctx, box, { pts, xr: xKey === "c" ? [0, 1.05] : [5, 50], yr: [0, ymax], xlabel: xKey === "c" ? "NaHCO₃ (%)" : "측정 수온 (°C)", ylabel: "기포 (개/분)" });
    }
  }

  loop($(".cv-wide"), (dt) => {
    t += dt;
    if (run && !run.done) {
      run.sim += dt * 15;
      if (run.sim >= 63) { run.done = true; tbl.add(run.rec); }
    }
    drawApp();
  });
  const upd = () => {
    $(".d-out").textContent = sD.value; $(".c-out").textContent = CO2[+sC.value].toFixed(2); $(".t-out").textContent = sT.value;
    if (run && run.done) run = null;
    drawApp(); drawPlot();
  };
  [sD, sC, sT].forEach((el) => el.addEventListener("input", upd));
  $(".noshield").addEventListener("change", upd);
  $(".col").addEventListener("click", (e) => {
    const b = e.target.closest("[data-col]"); if (!b) return;
    col = b.dataset.col; root.querySelectorAll("[data-col]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); upd();
  });
  function start() {
    const c = cur(), rec = record(c);
    const bub = Array.from({ length: rec.n }, (_, i) => (i + 0.5 + 0.35 * L.gauss()) * 60 / Math.max(rec.n, 1)).sort((a, b) => a - b);
    run = { c, rec, bub, sim: 0, done: false };
  }
  $(".count").addEventListener("click", () => { if (!run || run.done) start(); });
  $(".clear").addEventListener("click", () => { run = null; tbl.clear(); });
  $(".xsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-x]"); if (!b) return;
    xKey = b.dataset.x; root.querySelectorAll("[data-x]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  upd();
  if (L.demo) {
    [0.05, 1.0].forEach((q) => [10, 15, 20, 30, 40, 60].forEach((d) => tbl.add(record({ d, co2: q, T: 25, col: "w", ns: false }))));
    [10, 15, 20, 30, 40, 60].forEach((d) => tbl.add(record({ d, co2: 0.2, T: 25, col: "w", ns: false })));
    sD.value = 20; sC.value = 3; upd(); start(); run.sim = 40;
  }
})();
