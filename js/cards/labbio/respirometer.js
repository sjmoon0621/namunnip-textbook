/* 카드: 싹 트는 콩은 얼마나 빨리 산소를 쓸까? — 호흡계(KOH, 색소 방울), 유리구슬 보정, 온도와 호흡 속도 */
(() => {
  const root = document.getElementById("card-labbio-respirometer");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sT = $(".t");
  const TUBES = [
    { k: "g", name: "발아 콩", r25: 0.018, rq: 0.97, seed: "#c9d77a" },
    { k: "d", name: "마른 콩", r25: 0.0008, rq: 0.9, seed: "#d8c27a" },
    { k: "b", name: "유리구슬", r25: 0, rq: 1, seed: null },
  ];
  const TIMES = [0, 5, 10, 15, 20];
  let view = "time", run = null, last = null;

  const rate = (tb, T) => tb.r25 * 2.2 ** ((T - 25) / 10);   // mL O₂/분 (모식, Q10 ≈ 2.2)
  const tbl = L.table($(".tbl-host"), [
    { key: "T", label: "T (°C)", res: 1 }, { key: "koh", label: "KOH" }, { key: "name", label: "관" },
    { key: "mv", label: "이동 (mL)", res: 0.01 }, { key: "cor", label: "보정 (mL)", res: 0.01 }, { key: "r", label: "속도 (mL/분)", res: 0.001 },
  ], () => drawPlot());
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());

  // 한 번의 실험: 세 관을 5분마다 읽은 값
  function experiment(T, koh) {
    const drift = 0.025 * L.gauss();   // 20분 동안 온도·기압 변화로 세 관이 함께 움직이는 양
    const reads = TUBES.map((tb) => {
      const net = rate(tb, T) * (koh ? 1 : 1 - tb.rq);
      return TIMES.map((t) => (t === 0 ? 0 : L.snap(net * t + drift * t / 20 + 0.004 * L.gauss(), 0.01)));
    });
    const bead = reads[2];
    const cor = reads.map((r) => r.map((v, i) => +(v - bead[i]).toFixed(2)));
    return { T, koh, reads, cor };
  }
  function rowsOf(ex) {
    return TUBES.map((tb, i) => {
      const mv = ex.reads[i][4];
      if (tb.k === "b") return { T: ex.T, koh: ex.koh ? "있음" : "없음", name: tb.name, k: tb.k, mv, cor: "—", r: "—" };
      const f = L.linfit(TIMES, ex.cor[i], true);
      return { T: ex.T, koh: ex.koh ? "있음" : "없음", name: tb.name, k: tb.k, mv, cor: ex.cor[i][4], r: L.snap(f.a, 0.001) };
    });
  }

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const T = run ? run.ex.T : +sT.value, koh = run ? run.ex.koh : !$(".nokoh").checked;
    const tNow = run ? Math.min(20, run.sim) : 0;
    // 수조
    const bx = 10, bw = w * 0.3, top = 34, bot = h - 12;
    const water = T <= 15 ? "rgba(170,205,240,.55)" : T >= 30 ? "rgba(240,205,185,.55)" : "rgba(195,222,242,.55)";
    ctx.fillStyle = water; ctx.fillRect(bx, top + 10, bw, bot - top - 10);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.4; ctx.strokeRect(bx, top, bw, bot - top);
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText(`수조 ${T} °C · KOH ${koh ? "있음" : "없음"}`, bx, top - 10);
    const pipeX0 = bx + bw - 6, pipeX1 = w - 16, lane = (bot - top - 10) / 3;
    TUBES.forEach((tb, i) => {
      const cy = top + 10 + lane * (i + 0.5), vx = bx + 16, vw = bw - 40, vh = Math.min(30, lane - 16);
      // 관
      ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.fillRect(vx, cy - vh / 2, vw, vh);
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.strokeRect(vx, cy - vh / 2, vw, vh);
      // KOH 솜 (왼쪽 끝)
      if (koh) { ctx.fillStyle = "#f5f2e8"; ctx.fillRect(vx + 2, cy - vh / 2 + 2, 14, vh - 4); ctx.fillStyle = "#b9b0d8"; for (let j = 0; j < 5; j++) ctx.fillRect(vx + 4 + (j % 2) * 5, cy - vh / 2 + 4 + j * (vh - 8) / 5, 3, 3); }
      // 내용물
      for (let j = 0; j < 9; j++) {
        const px = vx + 22 + j * (vw - 30) / 9, py = cy + ((j % 2) - 0.5) * vh * 0.35;
        ctx.fillStyle = tb.seed || "rgba(200,215,230,.9)"; ctx.beginPath(); ctx.arc(px, py, Math.min(6, vh * 0.2), 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = tb.seed ? "rgba(90,90,60,.5)" : C.ink3; ctx.lineWidth = 0.8; ctx.stroke();
        if (tb.k === "g" && j % 2 === 0) { ctx.strokeStyle = "#f5f0dc"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(px + 4, py); ctx.quadraticCurveTo(px + 8, py - 6, px + 10, py - 3); ctx.stroke(); }
      }
      // 피펫
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(vx + vw, cy - 2); ctx.lineTo(pipeX1, cy - 2); ctx.moveTo(vx + vw, cy + 2); ctx.lineTo(pipeX1, cy + 2); ctx.stroke();
      const sx = pipeX0 + 30, sw = pipeX1 - sx - 6;
      ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.mono}`; ctx.textAlign = "center";
      const X = (val) => sx + sw * (1 - val);   // 눈금 0은 오른쪽(처음 자리), 관 쪽으로 갈수록 커짐
      for (let m = 0; m <= 10; m++) { const x = X(m / 10); ctx.fillRect(x, cy + 3, 1, m % 5 ? 3 : 6); if (m % 5 === 0) ctx.fillText((m / 10).toFixed(1), x, cy + 18); }
      // 방울: 관 쪽(왼쪽)으로 움직인 부피만큼
      let v = 0;
      if (run) { const r = run.ex.reads[i], k = Math.min(3, Math.floor(tNow / 5)), f = (tNow - k * 5) / 5; v = r[k] + (r[Math.min(4, k + 1)] - r[k]) * f; }
      const dx = X(Math.max(-0.02, Math.min(1, v)));
      ctx.fillStyle = "#c2412f"; ctx.fillRect(dx - 4, cy - 2, 8, 4);
      ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left";
      ctx.fillText(tb.name, sx, cy - 9);
      ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "right";
      ctx.fillText(`${v.toFixed(2)} mL`, pipeX1, cy - 9);
    });
    ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillText(run ? `경과 ${tNow.toFixed(1)} 분` : "측정 대기", w - 16, 20);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 50, y0: 20, w: w - 64, h: h - 54 };
    if (view === "time") {
      const ex = last;
      const pts = (i) => (ex ? TIMES.map((t, j) => ({ x: t, y: ex.cor[i][j] })) : []);
      const ymax = ex ? Math.max(0.1, ...ex.cor[0], ...ex.cor[1]) * 1.15 : 0.5;
      const fits = ex ? [0, 1].map((i) => L.linfit(TIMES, ex.cor[i], true)) : [null, null];
      L.plot(ctx, box, { pts: pts(0), fit: fits[0], xr: [0, 21], yr: [-0.03, ymax], xlabel: "시간 (분)", ylabel: "보정한 O₂ 소비량 (mL)", color: C.forest });
      L.plot(ctx, box, { pts: pts(1), xr: [0, 21], yr: [-0.03, ymax], color: C.amber });
      ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
      if (ex) {
        ctx.fillStyle = C.forest; ctx.fillText(`발아 콩 ${fits[0].a.toFixed(4)} mL/분`, box.x0 + 8, box.y0 + 14);
        ctx.fillStyle = C.amber; ctx.fillText(`마른 콩 ${fits[1].a.toFixed(4)} mL/분`, box.x0 + 8, box.y0 + 30);
        ctx.fillStyle = C.ink3; ctx.fillText(`${ex.T} °C · KOH ${ex.koh ? "있음" : "없음"}`, box.x0 + 8, box.y0 + 46);
      } else { ctx.fillStyle = C.ink3; ctx.fillText("아직 측정하지 않았습니다", box.x0 + 8, box.y0 + 14); }
    } else {
      const rs = tbl.rows.filter((r) => r.koh === "있음" && typeof r.r === "number");
      const g = rs.filter((r) => r.k === "g").map((r) => ({ x: r.T, y: r.r })), d = rs.filter((r) => r.k === "d").map((r) => ({ x: r.T, y: r.r }));
      const ymax = Math.max(0.01, ...g.map((p) => p.y), ...d.map((p) => p.y)) * 1.15;
      L.plot(ctx, box, { pts: g, xr: [5, 40], yr: [0, ymax], xlabel: "수조 온도 (°C)", ylabel: "호흡 속도 (mL O₂/분)", color: C.forest });
      L.plot(ctx, box, { pts: d, xr: [5, 40], yr: [0, ymax], color: C.amber });
      ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
      ctx.fillStyle = C.forest; ctx.fillText("● 발아 콩", box.x0 + 8, box.y0 + 14);
      ctx.fillStyle = C.amber; ctx.fillText("● 마른 콩", box.x0 + 8, box.y0 + 30);
      ctx.fillStyle = C.ink3; ctx.fillText("(KOH 있는 기록만)", box.x0 + 8, box.y0 + 46);
    }
  }

  loop($(".cv-wide"), (dt) => {
    if (run && !run.done) {
      run.sim += dt * 4;
      if (run.sim >= 20.5) { run.done = true; last = run.ex; rowsOf(run.ex).forEach((r) => tbl.add(r)); }
    }
    drawApp();
  });
  const upd = () => { $(".t-out").textContent = sT.value; if (run && run.done) run = null; drawApp(); };
  sT.addEventListener("input", upd);
  $(".nokoh").addEventListener("change", upd);
  $(".run").addEventListener("click", () => { if (run && !run.done) return; run = { ex: experiment(+sT.value, !$(".nokoh").checked), sim: 0, done: false }; });
  $(".clear").addEventListener("click", () => { run = null; last = null; tbl.clear(); drawApp(); drawPlot(); });
  $(".view").addEventListener("click", (e) => {
    const b = e.target.closest("[data-v]"); if (!b) return;
    view = b.dataset.v; root.querySelectorAll("[data-v]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  upd();
  if (L.demo) {
    [10, 20, 30, 35].forEach((T) => { last = experiment(T, true); rowsOf(last).forEach((r) => tbl.add(r)); });
    const ex = experiment(25, true); rowsOf(ex).forEach((r) => tbl.add(r)); last = ex;
    run = { ex, sim: 20, done: true }; drawPlot();
  }
})();
