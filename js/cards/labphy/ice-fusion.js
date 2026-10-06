/* 카드: 따뜻한 물이 식은 만큼으로 얼음의 융해열을 잴 수 있을까? — 열량계, 온도 센서 T(t), 실온 열 교환과 물기 묻은 얼음 */
(() => {
  const root = document.getElementById("card-labphy-ice-fusion");
  if (!root) return;
  const { C, F, fit, loop, axes } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sW = $(".mw"), sT = $(".tw"), sI = $(".mi"), bHx = $(".hx"), bWet = $(".wet");
  const CW = 4.18, CCAL = 42, TR = 22, LF = 334, KAP = 14, HX = 0.25, DT = 0.5, TEND = 600, TICE = 60, SPEED = 60;
  let hx = true, wet = false, run = null, clock = 0;

  const tbl = L.table($(".tbl-host"), [
    { key: "mw", label: "물 (g)", res: 0.1 }, { key: "tw", label: "T_w (°C)", res: 0.1 }, { key: "mi", label: "얼음 (g)", res: 0.1 },
    { key: "tf", label: "T_f (°C)", res: 0.1 }, { key: "L", label: "L (J/g)", res: 1 },
  ], () => showMean());
  const app = fit($(".cv-wide"), () => drawApp()), pl = fit($(".cv-plot"), () => drawPlot());

  function simulate(mw, Tw, mAdd, f, h) {
    const ice0 = mAdd * (1 - f), out = [];
    let ice = 0, mel = 0, E = (mw * CW + CCAL) * Tw, T = Tw, tMelt = null;
    for (let i = 0; i * DT <= TEND; i++) {
      const t = i * DT;
      if (i * DT === TICE) { ice = ice0; mel = mAdd * f; }
      if (ice > 0) {
        const P = KAP * T * Math.pow(ice / ice0, 2 / 3);
        const dm = Math.min(ice, P * DT / LF);
        ice -= dm; mel += dm; E -= dm * LF;
        if (ice <= 1e-9) { ice = 0; tMelt = t; }
      }
      E += h * (TR - T) * DT;
      T = E / ((mw + mel) * CW + CCAL);
      out.push({ t, T, ice: ice / Math.max(ice0, 1e-9), added: t >= TICE });
    }
    return { out, tMelt };
  }

  function start() {
    const mw = +sW.value, Tw = +sT.value, mAdd = L.measure(+sI.value, { sd: 2.5 });
    const { out, tMelt } = simulate(mw, Tw, mAdd, wet ? 0.1 : 0, hx ? HX : 0);
    const rd = out.filter((p, i) => i % 2 === 0).map((p) => ({ t: p.t, T: L.measure(p.T, { sd: 0.03, res: 0.1 }), ice: p.ice, added: p.added }));
    const tw = rd.find((p) => p.t === TICE - 1).T;
    const after = rd.filter((p) => p.t > TICE), tf = Math.min(...after.map((p) => p.T));
    const mwM = L.measure(mw, { sd: 0.05, res: 0.1 }), miM = L.measure(mAdd, { sd: 0.07, res: 0.1 });
    const Lc = ((mwM * CW + CCAL) * (tw - tf) - miM * CW * tf) / miM;
    run = { rd, tMelt, row: { mw: mwM, tw, mi: miM, tf, L: Lc }, done: false };
    clock = 0;
  }
  function finish() {
    if (!run || run.done) return;
    run.done = true; clock = TEND; tbl.add(run.row);
    $(".n-l").textContent = `${run.row.L.toFixed(0)} J/g`;
    $(".n-t").textContent = run.tMelt ? `${((run.tMelt - TICE) / 60).toFixed(1)}분 만에` : "10분 안에 못 녹음";
  }
  function showMean() {
    const s = L.stats(tbl.col("L"));
    $(".n-m").textContent = s.n > 1 ? `${s.mean.toFixed(0)} ± ${s.se.toFixed(0)} J/g` : s.n ? `${s.mean.toFixed(0)} J/g` : "—";
    if (!s.n) $(".n-l").textContent = "—";
  }

  const cur = () => (run ? run.rd[Math.min(run.rd.length - 1, Math.floor(clock))] : null);
  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = cur(), mw = run ? run.row.mw : +sW.value;
    const cx = w * 0.3, top = h * 0.2, cwid = Math.min(150, w * 0.32), chei = h * 0.66;
    // 바깥 컵, 안쪽 컵
    ctx.fillStyle = "#f2f1ea"; ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.rect(cx - cwid / 2 - 16, top - 4, cwid + 32, chei + 14); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.card; ctx.beginPath(); ctx.rect(cx - cwid / 2, top + 6, cwid, chei - 4); ctx.fill(); ctx.stroke();
    // 물
    const lvl = (mw + (run && p && p.added ? run.row.mi : 0)) / 380 * (chei - 14);
    const wy = top + chei + 2 - lvl;
    const T = p ? p.T : +sT.value;
    const warm = Math.max(0, Math.min(1, (T - 5) / 45));
    ctx.fillStyle = `rgba(${Math.round(110 + 110 * warm)},${Math.round(164 - 40 * warm)},${Math.round(230 - 120 * warm)},.35)`;
    ctx.fillRect(cx - cwid / 2 + 1, wy, cwid - 2, top + chei + 1 - wy);
    // 얼음
    if (p && p.added && p.ice > 0) {
      const s = 26 * Math.cbrt(p.ice);
      ctx.fillStyle = "rgba(235,245,255,.95)"; ctx.strokeStyle = "#8fb3d9";
      [[-30, 0], [8, 6], [-8, 14]].forEach(([dx, dy]) => { ctx.fillRect(cx + dx, wy + dy - s * 0.3, s, s); ctx.strokeRect(cx + dx, wy + dy - s * 0.3, s, s); });
    }
    // 뚜껑, 젓개, 센서
    ctx.fillStyle = C.ink2; ctx.fillRect(cx - cwid / 2 - 20, top - 12, cwid + 40, 8);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - cwid / 4, top - 34); ctx.lineTo(cx - cwid / 4, top + chei - 10); ctx.lineTo(cx - cwid / 4 + 18, top + chei - 10); ctx.stroke();
    ctx.strokeStyle = C.forest; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx + cwid / 3, top - 40); ctx.lineTo(cx + cwid / 3, top + chei - 24); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("젓개", cx - cwid / 4, top - 40); ctx.fillText("온도 센서", cx + cwid / 3, top - 46);
    ctx.fillText("이중 스타이로폼 열량계", cx, top + chei + 26);
    // 읽음값
    const px = w * 0.6, py = h * 0.14, bw = w * 0.36;
    ctx.fillStyle = C.card; ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.fillRect(px, py, bw, h * 0.66); ctx.strokeRect(px, py, bw, h * 0.66);
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`;
    ctx.fillText("온도 센서", px + 12, py + 20);
    ctx.fillStyle = C.ink; ctx.font = `600 22px ${F.mono}`; ctx.fillText(`${T.toFixed(1)} °C`, px + 12, py + 48);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.fillText("경과 시간", px + 12, py + 76);
    ctx.fillStyle = C.ink; ctx.font = `600 16px ${F.mono}`;
    const tt = p ? p.t : 0; ctx.fillText(`${Math.floor(tt / 60)}:${String(Math.floor(tt % 60)).padStart(2, "0")}`, px + 12, py + 98);
    const stage = !run ? "대기" : !p.added ? "얼음 넣기 전" : p.ice > 0 ? "얼음이 녹는 중" : run.done ? "기록 끝" : "다 녹음, 계속 기록";
    ctx.fillStyle = C.forest; ctx.font = `12px ${F.sans}`; ctx.fillText(stage, px + 12, py + 124);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 18, w: w - 58, h: h - 52 };
    const X = (t) => box.x0 + t / TEND * box.w, Y = (v) => box.y0 + box.h - v / 60 * box.h;
    axes(ctx, { ...box, X, Y, xt: [0, 2, 4, 6, 8, 10].map((m) => [m * 60, String(m)]), yt: [0, 10, 20, 30, 40, 50, 60].map((v) => [v, String(v)]), xlabel: "t (분)", ylabel: "T (°C)" });
    ctx.setLineDash([4, 4]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(box.x0, Y(TR)); ctx.lineTo(box.x0 + box.w, Y(TR)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("실온 22 °C", box.x0 + box.w - 4, Y(TR) - 4);
    if (!run) return;
    const n = Math.min(run.rd.length, Math.floor(clock) + 1);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1.6; ctx.beginPath();
    for (let i = 0; i < n; i++) { const q = run.rd[i]; i ? ctx.lineTo(X(q.t), Y(q.T)) : ctx.moveTo(X(q.t), Y(q.T)); }
    ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("얼음 넣음", X(TICE) + 4, box.y0 + box.h - 6);
    ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(X(TICE), box.y0); ctx.lineTo(X(TICE), box.y0 + box.h); ctx.stroke();
    if (run.done) {
      const r = run.row, q = run.rd.find((s) => s.t > TICE && s.T === r.tf);
      ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(q.t), Y(q.T), 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
      ctx.fillText(`T_f = ${r.tf.toFixed(1)} °C`, Math.min(X(q.t) + 6, box.x0 + box.w - 90), Y(q.T) + 16);
      ctx.fillText(`T_w = ${r.tw.toFixed(1)} °C`, X(TICE) + 6, Y(r.tw) - 8);
    }
  }

  loop($(".cv-wide"), (dt) => {
    if (!run || run.done) return;
    clock += dt * SPEED;
    if (clock >= run.rd.length - 1) finish();
    drawApp(); drawPlot();
  });
  const upd = () => { $(".mw-out").textContent = sW.value; $(".tw-out").textContent = sT.value; $(".mi-out").textContent = sI.value; if (run && run.done) run = null; drawApp(); drawPlot(); };
  [sW, sT, sI].forEach((el) => el.addEventListener("input", upd));
  $(".run").addEventListener("click", () => { start(); drawApp(); drawPlot(); });
  bHx.addEventListener("click", () => { hx = !hx; bHx.setAttribute("aria-pressed", String(hx)); });
  bWet.addEventListener("click", () => { wet = !wet; bWet.setAttribute("aria-pressed", String(wet)); });
  $(".clear").addEventListener("click", () => { run = null; tbl.clear(); $(".n-t").textContent = "—"; drawApp(); drawPlot(); });
  if (L.demo) {
    [[200, 52, 40], [200, 30, 45], [200, 40, 50], [200, 40, 50], [200, 40, 50]].forEach(([a, b, c]) => { sW.value = a; sT.value = b; sI.value = c; start(); finish(); });
    $(".tw-out").textContent = sT.value; $(".mi-out").textContent = sI.value;
    drawApp(); drawPlot();
  }
})();
