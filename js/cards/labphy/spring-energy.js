/* 카드: 오르내리는 추의 에너지를 모두 더하면 정말 일정할까? — 용수철 진자, 운동 센서, KE·탄성·중력 퍼텐셜 에너지 */
(() => {
  const root = document.getElementById("card-labphy-spring-energy");
  if (!root) return;
  const { C, F, fit, loop, axes } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sM = $(".m"), sA = $(".a"), bDamp = $(".damp");
  const G = 9.8, K = 20.6, TOP = 0.95, L0 = 0.15, BLK = 0.04, DT = 0.02, DUR = 3;
  let ref = "all", run = null, tAnim = 0, damp = false;

  const tk = L.table($(".tbl-k"), [{ key: "m", label: "m (g)", res: 1 }, { key: "F", label: "mg (N)", res: 0.01 }, { key: "x", label: "늘어난 길이 x (cm)", res: 0.1 }], () => showK());
  const tr = L.table($(".tbl-run"), [{ key: "m", label: "m (g)", res: 1 }, { key: "A", label: "진폭 (cm)", res: 0.1 }, { key: "d", label: "날개" }, { key: "e0", label: "E 처음 (mJ)", res: 0.1 }, { key: "e1", label: "E 끝 (mJ)", res: 0.1 }, { key: "de", label: "변화 (%)", res: 0.1 }]);
  const app = fit($(".cv-wide"), () => drawApp()), pl = fit($(".cv-plot"), () => drawPlot());

  const kFit = () => (tk.rows.length > 1 ? L.linfit(tk.col("x").map((x) => x / 100), tk.col("F"), true) : null);
  const hEq = (m) => TOP - L0 - BLK - m * G / K;
  const gamma = () => (damp ? 0.12 : 0.003);
  function showK() { const f = kFit(); $(".n-k").textContent = f ? `${f.a.toFixed(2)} ± ${f.sa.toFixed(2)} N/m` : "점 2개 이상"; }

  function trueH(r, t) {
    const w0 = Math.sqrt(K / r.m), g = r.g, wd = Math.sqrt(w0 * w0 - g * g);
    return r.h0 - r.A * Math.exp(-g * t) * (Math.cos(wd * t) + g / wd * Math.sin(wd * t));
  }

  function record() {
    const f = kFit(); if (!f) { $(".n-e").textContent = "k를 먼저 재세요"; return; }
    const m = +sM.value / 1000, A = +sA.value / 100, k = f.a;
    const r = { m, A, h0: hEq(m), g: gamma(), k, damp };
    r.h0m = L.snap(r.h0 + 0.0003 * L.gauss(), 0.0005);   // 놓기 전 정지 위치를 여러 번 재어 평균
    const hs = [];
    for (let i = 0; i <= DUR / DT + 1; i++) hs.push(L.measure(trueH(r, i * DT), { sd: 0.0003, res: 0.001 }));
    const x0 = m * G / k;
    r.s = [];
    for (let i = 1; i < hs.length - 1; i++) {
      const t = i * DT, h = hs[i], v = (hs[i + 1] - hs[i - 1]) / (2 * DT), y = h - r.h0m;
      const KE = 0.5 * m * v * v, Us = 0.5 * k * (x0 - y) ** 2, Ug = m * G * y, Uy = 0.5 * k * y * y;
      r.s.push({ t, h, KE, Us, Ug, E: KE + Us + Ug, Uy, Eq: KE + Uy });
    }
    const Tn = 2 * Math.PI / Math.sqrt(k / m), nP = Math.round(Tn / DT);
    const avg = (arr) => arr.reduce((s, p) => s + p.Eq, 0) / arr.length;
    const e0 = avg(r.s.slice(0, nP)), e1 = avg(r.s.slice(-nP));
    const hsSlice = hs.slice(0, nP + 2);
    r.T = Tn;
    tr.add({ m: m * 1000, A: (Math.max(...hsSlice) - Math.min(...hsSlice)) / 2 * 100, d: damp ? "있음" : "없음", e0: e0 * 1000, e1: e1 * 1000, de: (e1 - e0) / e0 * 100 });
    // 주기: 센서 자료에서 아래로 내려가며 평형점을 지나는 시각들의 간격
    const cross = [];
    for (let i = 1; i < r.s.length; i++) if (r.s[i - 1].h > r.h0m && r.s[i].h <= r.h0m) cross.push(r.s[i].t);
    $(".n-t").textContent = cross.length > 1 ? `${((cross[cross.length - 1] - cross[0]) / (cross.length - 1)).toFixed(2)} s` : "—";
    $(".n-e").textContent = `${((e1 - e0) / e0 * 100).toFixed(1)} % (3초)`;
    run = r; tAnim = 0;
  }

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = run ? run.m : +sM.value / 1000;
    const hh = run ? trueH(run, tAnim) : hEq(m);
    const base = h - 22, sc = (h - 40) / 1.0, Y = (v) => base - v * sc, cx = w * 0.36;
    // 바닥, 스탠드
    ctx.fillStyle = C.rule; ctx.fillRect(20, base, w - 40, 3);
    ctx.fillStyle = C.ink2; ctx.fillRect(cx - 110, Y(TOP) - 4, 6, base - Y(TOP) + 4); ctx.fillRect(cx - 110, Y(TOP) - 6, 130, 6); ctx.fillRect(cx - 140, base - 6, 70, 6);
    // 용수철
    const yTop = Y(TOP), yBot = Y(hh + BLK), n = 16;
    ctx.strokeStyle = "#7d7f86"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx, yTop); ctx.lineTo(cx, yTop + 6);
    for (let i = 1; i < n; i++) ctx.lineTo(cx + (i % 2 ? 9 : -9), yTop + 6 + (yBot - yTop - 12) * i / n);
    ctx.lineTo(cx, yBot - 6); ctx.lineTo(cx, yBot); ctx.stroke();
    // 추
    const bw = 18 + m * 40;
    ctx.fillStyle = "#8d8d92"; ctx.fillRect(cx - bw / 2, yBot, bw, Y(hh) - yBot);
    if (run && run.damp || (!run && damp)) { ctx.fillStyle = "rgba(240,236,220,.9)"; ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.fillRect(cx - 48, Y(hh) - 3, 96, 3); ctx.strokeRect(cx - 48, Y(hh) - 3, 96, 3); }
    // 평형 위치 점선
    ctx.setLineDash([3, 4]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(cx - 60, Y(hEq(m))); ctx.lineTo(cx + 70, Y(hEq(m))); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("평형 위치", cx + 74, Y(hEq(m)) + 3);
    // 운동 센서와 초음파
    ctx.fillStyle = C.ink; ctx.fillRect(cx - 18, base - 14, 36, 14);
    ctx.strokeStyle = "rgba(59,124,42,.45)"; ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(cx, base - 14, 10 * i, Math.PI * 1.3, Math.PI * 1.7); ctx.stroke(); }
    ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("운동 센서", cx + 24, base - 4);
    // 거리 화살표와 읽음값
    const ax = cx + bw / 2 + 14;
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(ax, base - 14); ctx.lineTo(ax, Y(hh)); ctx.stroke();
    const rd = L.snap(hh, 0.001);
    const px = w * 0.66, py = h * 0.18;
    ctx.fillStyle = C.card; ctx.strokeStyle = C.rule; ctx.fillRect(px, py, w * 0.3, 74); ctx.strokeRect(px, py, w * 0.3, 74);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.fillText("센서 읽음값 h", px + 10, py + 18);
    ctx.fillStyle = C.ink; ctx.font = `600 18px ${F.mono}`; ctx.fillText(`${rd.toFixed(3)} m`, px + 10, py + 44);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`;
    ctx.fillText(run && tAnim < DUR ? `기록 중 t = ${tAnim.toFixed(2)} s` : "대기", px + 10, py + 64);
  }

  const SER = [["KE", "운동 E", "#3f6fa3"], ["Us", "탄성 E", "#b5532f"], ["Ug", "중력 E (평형점=0)", "#e0a02a"], ["E", "합", "#232326"]];
  const SEQ = [["KE", "운동 E", "#3f6fa3"], ["Uy", "½ky²", "#b5532f"], ["Eq", "합", "#232326"]];
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const ser = ref === "all" ? SER : SEQ;
    $(".se-legend").innerHTML = ser.map(([, n, c]) => `<span><i style="background:${c}"></i>${n}</span>`).join("");
    const box = { x0: 48, y0: 18, w: w - 62, h: h - 52 };
    const pts = run ? run.s.filter((p) => p.t <= tAnim) : [];
    let lo = 0, hi = 0.05;
    if (run) { const all = run.s.flatMap((p) => ser.map(([k]) => p[k])); lo = Math.min(0, ...all); hi = Math.max(...all); }
    const pad = (hi - lo) * 0.08; lo = lo < 0 ? lo - pad : 0; hi += pad;
    const X = (t) => box.x0 + t / DUR * box.w, Yv = (v) => box.y0 + box.h - (v - lo) / (hi - lo) * box.h;
    const tl = (v) => String(+(v * 1000).toPrecision(3));
    axes(ctx, { ...box, X, Y: Yv, xt: L.ticks(0, DUR).map((v) => [v, String(v)]), yt: L.ticks(lo, hi, 4).map((v) => [v, tl(v)]), xlabel: "t (s)", ylabel: "에너지 (mJ)" });
    if (!pts.length) { ctx.fillStyle = C.ink3; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(tk.rows.length > 1 ? "② 기록을 누르세요" : "먼저 ①로 k를 재세요", box.x0 + box.w / 2, box.y0 + box.h / 2); return; }
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    for (const [k, , c] of ser) {
      ctx.strokeStyle = c; ctx.lineWidth = k === "E" || k === "Eq" ? 2 : 1.3; ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(X(p.t), Yv(p[k])) : ctx.moveTo(X(p.t), Yv(p[k]))));
      ctx.stroke();
    }
    ctx.restore();
  }

  loop($(".cv-wide"), () => {
    if (!run) return;
    const was = tAnim; tAnim += 1 / 60; drawApp(); if (was <= DUR) drawPlot();
  });
  const upd = () => { $(".m-out").textContent = sM.value; $(".a-out").textContent = (+sA.value).toFixed(1); run = null; drawApp(); drawPlot(); };
  [sM, sA].forEach((el) => el.addEventListener("input", upd));
  $(".kmeas").addEventListener("click", () => {
    const m = +sM.value; tk.add({ m, F: m / 1000 * G, x: L.measure(m / 1000 * G / K * 100, { sd: 0.07, res: 0.1 }) });
  });
  $(".run").addEventListener("click", () => { record(); drawApp(); drawPlot(); });
  bDamp.addEventListener("click", () => { damp = !damp; bDamp.setAttribute("aria-pressed", String(damp)); drawApp(); });
  $(".clear").addEventListener("click", () => { tk.clear(); tr.clear(); run = null; $(".n-t").textContent = "—"; $(".n-e").textContent = "—"; drawApp(); drawPlot(); });
  root.querySelectorAll(".ref .chip").forEach((b) => b.addEventListener("click", () => {
    ref = b.dataset.r; root.querySelectorAll(".ref .chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  }));
  showK();
  if (L.demo) {
    [100, 200, 300, 400, 500].forEach((m) => { sM.value = m; $(".kmeas").click(); });
    sM.value = 300; damp = true; record(); damp = false; record();
    $(".m-out").textContent = sM.value; tAnim = DUR; drawApp(); drawPlot();
  }
})();
