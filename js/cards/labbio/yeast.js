/* 카드: 효모는 어떤 당을, 몇 도에서 가장 잘 발효할까? — 발효관(퀴네관), 당 종류·농도·온도, KOH로 CO₂ 확인 */
(() => {
  const root = document.getElementById("card-labbio-yeast");
  if (!root) return;
  const { C, F, fit, loop, axes } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sC = $(".c"), sT = $(".t");
  const CONC = [0, 2.5, 5, 10, 15, 20];
  const KINDS = ["water", "glc", "suc", "mal", "lac", "sta"];
  const NAME = { water: "증류수", glc: "포도당", suc: "설탕", mal: "엿당", lac: "젖당", sta: "녹말" };
  const FS = { water: 0, glc: 1, suc: 0.9, mal: 0.65, lac: 0.02, sta: 0.03 };   // 상대 발효 능력 (모식)
  const LAG = { water: 3, glc: 3, suc: 4, mal: 12, lac: 3, sta: 3 };          // 기체가 모이기 시작할 때까지 (분)
  const CAP = 12, TIMES = [10, 20, 30];
  let kind = "glc", xKey = "kind", run = null, last = null;

  const fT = (T) => 2 ** ((T - 35) / 10) / (1 + Math.exp((T - 43) / 2.5)) * (1 + Math.exp(-8 / 2.5));
  function vol(c, t, act) {
    if (c.boil) return 0;
    const S = c.kind === "water" ? 0 : c.c;
    const r = 0.5 * act * (FS[c.kind] * S / (S + 1.5) * 40 / (40 + S) + 0.02) * fT(c.T);   // mL/분
    return Math.min(CAP, r * Math.max(0, t - LAG[c.kind]));
  }
  const cur = () => ({ kind, c: CONC[+sC.value], T: +sT.value, boil: $(".boil").checked });

  const tbl = L.table($(".tbl-host"), [
    { key: "name", label: "당" }, { key: "c", label: "농도 (%)", res: 0.1 }, { key: "T", label: "T (°C)", res: 1 },
    { key: "v10", label: "10분", res: 0.5 }, { key: "v20", label: "20분", res: 0.5 }, { key: "v30", label: "30분 (mL)", res: 0.5 }, { key: "koh", label: "KOH 뒤" },
  ], () => drawPlot());
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());

  function experiment(c) {
    const act = 1 + 0.1 * L.gauss();
    const v = TIMES.map((t) => { const x = vol(c, t, act); return x > 0 ? L.snap(Math.max(0, x + 0.15 * L.gauss()), 0.5) : 0; });
    for (let i = 1; i < 3; i++) v[i] = Math.max(v[i], v[i - 1]);
    const curve = Array.from({ length: 31 }, (_, t) => vol(c, t, act));
    return { c, act, v, curve, name: NAME[c.kind] + (c.boil ? " (끓인 효모)" : ""), koh: null };
  }
  const rowOf = (ex) => ({ name: ex.name, kind: ex.c.kind, boil: ex.c.boil, c: ex.c.c, T: ex.c.T, v10: ex.v[0], v20: ex.v[1], v30: ex.v[2], koh: "—" });

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const c = run ? run.ex.c : cur();
    const t = run ? Math.min(30, run.sim) : 0;
    let gas = run ? run.ex.curve[Math.floor(t)] + (run.ex.curve[Math.min(30, Math.floor(t) + 1)] - run.ex.curve[Math.floor(t)]) * (t % 1) : 0;
    if (run && run.kohT != null) gas *= Math.max(0.02, 1 - Math.min(1, run.kohT / 1.5));
    // 발효관: 닫힌 관(왼쪽) + U자 아래 + 열린 공 모양(오른쪽)
    const ax = w * 0.18, aw = 22, top = 20, abot = h - 52, ux = w * 0.42, by = h * 0.5, R = Math.min(48, h * 0.2);
    const liq = "rgba(232,214,160,.75)";
    const gasH = (abot - top - 6) * gas / CAP;
    // 액체
    ctx.fillStyle = liq; ctx.fillRect(ax, top + gasH, aw, abot - top - gasH);
    ctx.lineWidth = aw; ctx.strokeStyle = liq; ctx.beginPath(); ctx.moveTo(ax + aw / 2, abot); ctx.quadraticCurveTo(ax + aw / 2, h - 18, (ax + ux) / 2, h - 18); ctx.quadraticCurveTo(ux, h - 18, ux, by + R * 0.6); ctx.stroke();
    const fillTo = by + R * 0.2 - (R * 0.9) * Math.min(1, gas / CAP);
    ctx.save(); ctx.beginPath(); ctx.arc(ux, by, R, 0, Math.PI * 2); ctx.clip(); ctx.fillStyle = liq; ctx.fillRect(ux - R, fillTo, 2 * R, 2 * R); ctx.restore();
    // 유리 윤곽
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(ax, abot); ctx.lineTo(ax, top + 6); ctx.arc(ax + aw / 2, top + 6, aw / 2, Math.PI, 0); ctx.lineTo(ax + aw, abot); ctx.stroke();
    ctx.beginPath(); ctx.arc(ux, by, R, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ux - 9, by - R + 1); ctx.lineTo(ux - 9, top); ctx.moveTo(ux + 9, by - R + 1); ctx.lineTo(ux + 9, top); ctx.stroke();
    ctx.fillStyle = "#f3eee0"; ctx.fillRect(ux - 9, top - 4, 18, 14);
    // 눈금
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right";
    for (let m = 0; m <= CAP; m += 1) { const y = top + 6 + (abot - top - 6) * m / CAP; ctx.fillRect(ax - (m % 2 ? 4 : 8), y, m % 2 ? 4 : 8, 1); if (m % 2 === 0) ctx.fillText(m, ax - 10, y + 3); }
    // 기포
    if (run && !run.done && gas > 0.05) { ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 1; for (let i = 0; i < 6; i++) { const yy = abot - ((run.sim * 30 + i * 37) % Math.max(10, abot - top - gasH - 8)); ctx.beginPath(); ctx.arc(ax + 6 + (i * 5) % 12, yy, 1.6, 0, Math.PI * 2); ctx.stroke(); } }
    // 정보
    const ix = w * 0.6;
    ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.sans}`;
    ctx.fillText(`${NAME[c.kind]}${c.kind === "water" ? "" : " " + c.c + "%"} · ${c.T} °C${c.boil ? " · 끓인 효모" : ""}`, ix, 36);
    ctx.font = `12px ${F.mono}`; ctx.fillStyle = C.ink2;
    ctx.fillText(run ? `경과 ${t.toFixed(0)} 분` : "관찰 대기", ix, 60);
    ctx.fillText(`모인 기체 ${L.snap(gas, 0.5).toFixed(1)} mL`, ix, 80);
    if (run && run.kohT != null) { ctx.fillStyle = C.warn; ctx.fillText("KOH: 기체가 흡수되어 줄어듦", ix, 100); }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const c = cur(), box = { x0: 44, y0: 18, w: w - 58, h: h - 56 };
    const rows = tbl.rows.filter((r) => !r.boil);
    if (xKey === "time") {
      const ex = last, pts = ex ? [{ x: 0, y: 0 }, ...TIMES.map((t, i) => ({ x: t, y: ex.v[i] }))] : [];
      L.plot(ctx, box, { pts, xr: [0, 32], yr: [0, CAP + 1], xlabel: "시간 (분)", ylabel: "모인 기체 (mL)" });
      ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
      ctx.fillText(ex ? `${ex.name}${ex.c.kind === "water" ? "" : " " + ex.c.c + "%"} · ${ex.c.T} °C` : "아직 관찰하지 않았습니다", box.x0 + 8, box.y0 + 14);
      return;
    }
    if (xKey === "kind") {
      const sel = rows.filter((r) => r.c === c.c && r.T === c.T);
      const X = (i) => box.x0 + box.w * (i + 0.5) / KINDS.length, Y = (v) => box.y0 + box.h - v / (CAP + 1) * box.h;
      axes(ctx, { ...box, X, Y, xt: KINDS.map((k, i) => [i, NAME[k]]), yt: L.ticks(0, CAP, 4).map((v) => [v, String(v)]), ylabel: "30분 동안 모인 기체 (mL)" });
      KINDS.forEach((k, i) => {
        const vs = sel.filter((r) => r.kind === k).map((r) => r.v30);
        if (!vs.length) return;
        const s = L.stats(vs), bw = box.w / KINDS.length * 0.5;
        ctx.fillStyle = C.sprout; ctx.fillRect(X(i) - bw / 2, Y(s.mean), bw, Y(0) - Y(s.mean));
        ctx.strokeStyle = C.forest; ctx.lineWidth = 1; ctx.strokeRect(X(i) - bw / 2 + 0.5, Y(s.mean) + 0.5, bw - 1, Y(0) - Y(s.mean) - 1);
        ctx.fillStyle = C.forest; vs.forEach((v, j) => { ctx.beginPath(); ctx.arc(X(i) - 6 + (j % 3) * 6, Y(v), 2.6, 0, Math.PI * 2); ctx.fill(); });
      });
      ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right";
      ctx.fillText(`농도 ${c.c}% · ${c.T} °C`, box.x0 + box.w, box.y0 + 12);
      return;
    }
    const keep = xKey === "c" ? (r) => r.kind === c.kind && r.T === c.T : (r) => r.kind === c.kind && r.c === c.c;
    const pts = rows.filter(keep).map((r) => ({ x: xKey === "c" ? r.c : r.T, y: r.v30 }));
    L.plot(ctx, box, { pts, xr: xKey === "c" ? [0, 21] : [10, 60], yr: [0, CAP + 1], xlabel: xKey === "c" ? "당 농도 (%)" : "온도 (°C)", ylabel: "30분 동안 모인 기체 (mL)" });
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillText(xKey === "c" ? `${NAME[c.kind]} · ${c.T} °C` : `${NAME[c.kind]} ${c.c}%`, box.x0 + box.w, box.y0 + 12);
  }

  loop($(".cv-wide"), (dt) => {
    if (run && !run.done) {
      run.sim += dt * 5;
      if (run.sim >= 30.5) { run.done = true; last = run.ex; tbl.add(rowOf(run.ex)); }
    }
    if (run && run.kohT != null) run.kohT += dt;
    drawApp();
  });
  const upd = () => { $(".c-out").textContent = CONC[+sC.value].toFixed(1); $(".t-out").textContent = sT.value; if (run && run.done) run = null; drawApp(); drawPlot(); };
  [sC, sT].forEach((el) => el.addEventListener("input", upd));
  $(".boil").addEventListener("change", upd);
  $(".sugar").addEventListener("click", (e) => {
    const b = e.target.closest("[data-s]"); if (!b) return;
    kind = b.dataset.s; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); upd();
  });
  $(".run").addEventListener("click", () => { if (run && !run.done) return; run = { ex: experiment(cur()), sim: 0, done: false, kohT: null }; });
  $(".koh").addEventListener("click", () => {
    if (!run || !run.done || run.kohT != null) return;
    run.kohT = 0;
    const r = tbl.rows[tbl.rows.length - 1];
    if (r && r.koh === "—") { r.koh = L.fmt(L.snap(Math.min(0.5, r.v30), 0.5), 0.5); tbl.add(tbl.rows.pop()); }
  });
  $(".clear").addEventListener("click", () => { run = null; last = null; tbl.clear(); drawApp(); });
  $(".xsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-x]"); if (!b) return;
    xKey = b.dataset.x; root.querySelectorAll("[data-x]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  upd();
  if (L.demo) {
    KINDS.forEach((k) => [1, 2].forEach(() => tbl.add(rowOf(experiment({ kind: k, c: 10, T: 35, boil: false })))));
    [15, 25, 45, 55].forEach((T) => tbl.add(rowOf(experiment({ kind: "glc", c: 10, T, boil: false }))));
    tbl.add(rowOf(experiment({ kind: "glc", c: 10, T: 35, boil: true })));
    const ex = experiment({ kind: "glc", c: 10, T: 35, boil: false }); tbl.add(rowOf(ex)); last = ex;
    run = { ex, sim: 30, done: true, kohT: null }; drawPlot();
  }
})();
