/* 카드: 투석막 주머니 삼투 실험 설계 — 농도·온도·막 넓이·용질 종류, 설계 점검, 초기 속도 비교 */
(() => {
  const root = document.getElementById("card-labbio-osmosis-design");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  /* 용질: 몰질량 g/mol, 입자 수 i(삼투 계수 포함), 투석막 통과 시간 상수 τ (10 cm 주머니, 25 °C, 분) */
  const SOL = {
    suc: { name: "설탕", M: 342, i: 1, tau: 160 },
    glu: { name: "포도당", M: 180, i: 1, tau: 60 },
    nacl: { name: "염화 나트륨", M: 58.4, i: 1.85, tau: 22 },
    starch: { name: "녹말", M: 1e5, i: 1, tau: Infinity },
  };
  const V0 = 5, KW = 0.004, BAG = 1.2;   // 처음 부피 mL, 수분 투과 계수 mL/(min·cm²·osmol/L), 투석막+실 질량 g
  const COLORS = [C.forest, C.warn, "#3f6fa3", C.amber, "#7a4fa0", C.ink2, "#2a8a8a", C.apple];
  let sol = "suc", len = 10, view = "vt", anim = null;
  const runs = [];
  const tbl = L.table($(".tbl-host"), [{ key: "k", label: "실행" }, { key: "u", label: "용질" }, { key: "p", label: "농도 (%)" }, { key: "T", label: "온도 (°C)" }, { key: "l", label: "길이 (cm)" }, { key: "m0", label: "처음 (g)", res: 0.01 }, { key: "dm", label: "60분 변화 (g)", res: 0.01 }, { key: "r", label: "초기 속도 (g/10분)", res: 0.01 }], (rows) => { syncRuns(rows); drawPlot(); });
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());
  const cond = () => ({ u: sol, p: +$(".pc").value, T: +$(".tc").value, l: len });

  function simulate(c) {
    const S = SOL[c.u], A = 5 * c.l, Vmax = Math.PI * 0.8 * 0.8 * (c.l - 3);
    const kT = Math.exp(0.024 * (c.T - 25)) * (c.T + 273) / 298;
    let V = V0, n = (c.p * 10 * V0 / 1000) / S.M * S.i, ms = c.p * 10 * V0 / 1000;   // osmol, 용질 질량 g
    const P = S.tau === Infinity ? 0 : V0 / (S.tau * 50);   // 막 투과도 (mL/(min·cm²))
    const out = [];
    for (let t = 0, dt = 0.25; t <= 60.001; t += dt) {
      if (Math.abs(t / 10 - Math.round(t / 10)) < 1e-6) out.push({ t: Math.round(t), m: BAG + V * 1.0 + ms * 0.38 });
      const cin = n / (V / 1000);
      const wall = 1.5 * Math.max(0, (V - 0.8 * Vmax) / (0.2 * Vmax)) ** 2;   // 주머니가 팽팽해지며 생기는 압력 (osmol/L로 환산)
      const dV = KW * kT * A * (cin - wall) * dt;
      const leak = P * kT * A * (n / V) * dt;
      V = Math.min(Vmax, Math.max(0.5, V + dV)); n -= leak; ms -= leak / S.i * S.M;
    }
    return { out, tight: V >= 0.85 * Vmax };
  }

  function syncRuns(rows) { for (let i = runs.length - 1; i >= 0; i--) if (!rows.includes(runs[i].row)) runs.splice(i, 1); }

  function run(instant) {
    const c = cond(), sim = simulate(c);
    const blot = () => 0.03 * L.gauss();
    const off = 0.15 * L.gauss();   // 투석막 조각마다 처음 질량이 조금 다름
    const pts = sim.out.map((p) => ({ t: p.t, m: L.measure(p.m + off + blot(), { res: 0.01 }) }));
    const ft = L.linfit(pts.slice(0, 3).map((p) => p.t), pts.slice(0, 3).map((p) => p.m));
    const k = runs.length ? Math.max(...runs.map((r) => r.k)) + 1 : 1;
    const row = { k, u: SOL[c.u].name, p: c.p, T: c.T, l: c.l, m0: pts[0].m, dm: pts[6].m - pts[0].m, r: ft.a * 10 };
    checkDesign(c);
    runs.push({ k, c, pts, row, col: COLORS[(k - 1) % COLORS.length], tight: sim.tight });
    tbl.add(row);
    $(".n-r").textContent = `${(ft.a * 10).toFixed(2)} g/10분`;
    $(".n-m").textContent = `${(pts[6].m - pts[0].m >= 0 ? "+" : "")}${(pts[6].m - pts[0].m).toFixed(2)} g${sim.tight ? " (주머니가 팽팽함)" : ""}`;
    anim = instant ? null : { t: 0, run: runs[runs.length - 1] };
  }

  function checkDesign(now) {
    const el = $(".dcheck"); el.classList.remove("good", "bad");
    if (!runs.length) { el.textContent = "설계 점검: 첫 실행입니다. 다음 실행에서는 요인 하나만 바꾸세요."; return; }
    const prev = runs[runs.length - 1].c, diff = [];
    if (prev.u !== now.u) diff.push("용질 종류"); if (prev.p !== now.p) diff.push("농도"); if (prev.T !== now.T) diff.push("온도"); if (prev.l !== now.l) diff.push("막 넓이");
    if (!diff.length) { el.textContent = "설계 점검: 앞 실행과 조건이 같습니다 → 반복 측정"; el.classList.add("good"); }
    else if (diff.length === 1) { el.textContent = `설계 점검: 앞 실행과 달라진 변인은 ${diff[0]} 하나입니다`; el.classList.add("good"); }
    else { el.textContent = `설계 점검: ${diff.join("·")}이(가) 함께 바뀌었습니다 → 앞 실행과 비교하면 원인을 가릴 수 없습니다`; el.classList.add("bad"); }
  }

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const c = cond(), T = c.T;
    const bx = w * 0.08, bw = w * 0.5, by = 24, bh = h - 40;
    ctx.fillStyle = `rgba(${150 + T * 2},${200 - T},${230 - T * 2},.25)`; ctx.fillRect(bx, by + 20, bw, bh - 20);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.6; ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("항온 수조 · 증류수", bx + 6, by + 14);
    /* 주머니 */
    let frac = 0, showRun = anim ? anim.run : runs[runs.length - 1];
    const l = showRun && anim ? showRun.c.l : c.l;
    if (anim) { const i = Math.min(6, Math.floor(anim.t / 0.6)); frac = (showRun.pts[i].m - showRun.pts[0].m); }
    const bagL = (bh - 50) * l / 22, cx = bx + bw / 2, top = by + 30;
    const wid = 18 + clamp(frac, -2, 8) * 2.2;
    const tint = clamp((anim ? showRun.c.p : c.p) / 30, 0, 1);
    ctx.fillStyle = `rgba(230,220,170,${0.35 + 0.4 * tint})`; ctx.strokeStyle = "#8a8060"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(cx - 6, top); ctx.quadraticCurveTo(cx - wid, top + 12, cx - wid, top + bagL / 2); ctx.quadraticCurveTo(cx - wid, top + bagL - 12, cx - 6, top + bagL); ctx.lineTo(cx + 6, top + bagL); ctx.quadraticCurveTo(cx + wid, top + bagL - 12, cx + wid, top + bagL / 2); ctx.quadraticCurveTo(cx + wid, top + 12, cx + 6, top); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 7, top); ctx.lineTo(cx + 7, top); ctx.moveTo(cx - 7, top + bagL); ctx.lineTo(cx + 7, top + bagL); ctx.stroke();
    ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx, 6); ctx.stroke();
    /* 온도계 */
    const tx = bx + bw - 22; ctx.fillStyle = "#fff"; ctx.strokeStyle = C.ink3; ctx.fillRect(tx - 4, by - 10, 8, bh - 10); ctx.strokeRect(tx - 4, by - 10, 8, bh - 10);
    const fill = (T - 0) / 50 * (bh - 30); ctx.fillStyle = C.apple; ctx.fillRect(tx - 2, by + bh - 22 - fill, 4, fill); ctx.beginPath(); ctx.arc(tx, by + bh - 18, 6, 0, Math.PI * 2); ctx.fill();
    /* 오른쪽 정보 */
    const ix = bx + bw + 18; ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.sans}`;
    const cc = anim ? showRun.c : c;
    ctx.fillText(`${SOL[cc.u].name} ${cc.p}% · ${cc.T} °C`, ix, 44);
    ctx.font = `12px ${F.mono}`; ctx.fillStyle = C.ink2;
    ctx.fillText(`주머니 ${cc.l} cm, 막 ${5 * cc.l} cm²`, ix, 66);
    const osm = cc.p * 10 / SOL[cc.u].M * SOL[cc.u].i;
    ctx.fillText(`처음 삼투 농도 ${osm < 0.01 && cc.p ? "<0.01" : osm.toFixed(2)} osmol/L`, ix, 86);
    if (anim) {
      const i = Math.min(6, Math.floor(anim.t / 0.6));
      ctx.fillText(`${showRun.pts[i].t}분: ${showRun.pts[i].m.toFixed(2)} g`, ix, 112);
    } else if (showRun) ctx.fillText(`실행 ${showRun.k}: 60분 ${showRun.row.dm >= 0 ? "+" : ""}${showRun.row.dm.toFixed(2)} g`, ix, 112);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 46, y0: 18, w: w - 60, h: h - 52 };
    if (view === "vt") {
      const all = runs.flatMap((r) => r.pts.map((p) => ({ x: p.t, y: p.m - r.pts[0].m })));
      const res = L.plot(ctx, box, { pts: [], xr: [0, 60], yr: all.length ? [Math.min(-0.5, ...all.map((p) => p.y)) - 0.2, Math.max(1, ...all.map((p) => p.y)) + 0.3] : [-1, 4], xlabel: "시간 (분)", ylabel: "질량 변화 (g)" });
      runs.forEach((r) => {
        ctx.strokeStyle = r.col; ctx.fillStyle = r.col; ctx.lineWidth = 1.5; ctx.beginPath();
        r.pts.forEach((p, i) => { const x = res.X(p.t), y = res.Y(p.m - r.pts[0].m); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
        r.pts.forEach((p) => { ctx.beginPath(); ctx.arc(res.X(p.t), res.Y(p.m - r.pts[0].m), 2.6, 0, Math.PI * 2); ctx.fill(); });
      });
      ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
      runs.slice(-8).forEach((r, i) => { ctx.fillStyle = r.col; ctx.fillText(`● ${r.k}`, box.x0 + 8 + (i % 4) * 44, box.y0 + 12 + Math.floor(i / 4) * 14); });
      $(".n-n").textContent = "—";
      return;
    }
    const key = { p: "p", t: "T", a: "l" }[view], lastC = runs.length ? runs[runs.length - 1].c : null;
    const use = lastC ? runs.filter((r) => ["u", "p", "T", "l"].every((k) => k === key || r.c[k] === lastC[k])) : [];
    const pts = use.map((r) => ({ x: key === "l" ? 5 * r.c.l : r.c[key], y: r.row.r }));
    const ft = pts.length > 1 && new Set(pts.map((p) => p.x)).size > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y)) : null;
    L.plot(ctx, box, { pts, fit: ft, xr: { p: [0, 32], t: [5, 42], a: [0, 110] }[view], xlabel: { p: "농도 (%)", t: "온도 (°C)", a: "막 넓이 (cm²)" }[view], ylabel: "초기 속도 (g/10분)" });
    $(".n-n").textContent = `${pts.length}개`;
  }

  $(".sol").addEventListener("click", (e) => { const b = e.target.closest("[data-u]"); if (!b) return; sol = b.dataset.u; root.querySelectorAll("[data-u]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); anim = null; draw(); });
  $(".len").addEventListener("click", (e) => { const b = e.target.closest("[data-l]"); if (!b) return; len = +b.dataset.l; root.querySelectorAll("[data-l]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); anim = null; draw(); });
  $(".view").addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (!b) return; view = b.dataset.v; root.querySelectorAll("[data-v]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot(); });
  $(".pc").addEventListener("input", (e) => { $(".p-out").textContent = e.target.value; anim = null; draw(); });
  $(".tc").addEventListener("input", (e) => { $(".t-out").textContent = e.target.value; anim = null; draw(); });
  $(".run").addEventListener("click", () => run(false));
  $(".clear").addEventListener("click", () => { tbl.clear(); runs.length = 0; anim = null; drawPlot(); draw(); });
  loop($(".cv-wide"), (dt) => { if (anim) { anim.t += dt; if (anim.t > 4.5) anim = null; } draw(); });
  draw();

  if (L.demo) {
    const set = (p, T, l, u) => { $(".pc").value = p; $(".tc").value = T; len = l; sol = u; };
    [[0, 25], [10, 25], [20, 25], [30, 25], [20, 25]].forEach(([p, T]) => { set(p, T, 10, "suc"); run(true); });
    [["glu"], ["nacl"], ["starch"]].forEach(([u]) => { set(10, 25, 10, u); run(true); });
    set(20, 25, 10, "suc"); $(".p-out").textContent = "20";
    root.querySelectorAll("[data-u]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.u === "suc")));
    view = "vt"; drawPlot(); draw();
  }
})();
