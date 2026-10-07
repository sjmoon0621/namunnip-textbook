/* 카드: 세페이드 변광성 — δ Cep 밤마다 관측 → 주기 찾기(위상 접기) → 주기–광도 관계로 거리, 대마젤란은하 OGLE 세페이드로 외부 은하 거리 */
(() => {
  const root = document.getElementById("card-labearth-cepheid");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sP = $(".per"), cbExt = $(".ext");
  const P_TRUE = 5.366249, T0 = 0.37, VMAX = 3.48, AMP = 0.89;
  const AV = { dcep: 0.23, lmc: 0.3 };
  const ML = (P) => -2.43 * (Math.log10(P) - 1) - 4.05;
  const LMC = window.NMLmcCepheids || [];
  let tg = "dcep", tNow = 0, obs = [], used = new Set();

  /* 광도 곡선 모양(모식): 빠르게 밝아지고 천천히 어두워진다. φ = 0이 최대 밝기 */
  const shape = (ph) => (ph < 0.72 ? 0.5 - 0.5 * Math.cos(Math.PI * ph / 0.72) : 0.5 + 0.5 * Math.cos(Math.PI * (ph - 0.72) / 0.28));
  const vTrue = (t) => { const ph = (((t - T0) / P_TRUE) % 1 + 1) % 1; return VMAX + AMP * shape(ph); };

  const main = fit($(".cp-main"), () => drawMain());
  const pl = fit($(".cp-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "name", label: "대상" }, { key: "P", label: "P (일)", res: 0.001 }, { key: "V", label: "⟨V⟩", res: 0.01 },
    { key: "M", label: "M_V", res: 0.01 }, { key: "mu", label: "m−M", res: 0.01 }, { key: "d", label: "d (kpc)", res: 0.01 },
  ], () => { drawMain(); drawPlot(); nums(); });

  function scatter(ctx, box, pts, xr, yr, xl, yl, o = {}) {
    const X = (v) => box.x0 + (v - xr[0]) / (xr[1] - xr[0]) * box.w;
    const Y = (v) => box.y0 + (v - yr[0]) / (yr[1] - yr[0]) * box.h;   // yr[0]이 위 (밝은 등급)
    const lo = Math.min(...yr), hi = Math.max(...yr);
    axes(ctx, { ...box, X, Y, xt: L.ticks(xr[0], xr[1], o.nx || 6).map((v) => [v, String(+v.toFixed(3))]), yt: L.ticks(lo, hi, 4).map((v) => [v, String(+v.toFixed(2))]), xlabel: xl, ylabel: yl });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    ctx.fillStyle = o.color || C.forest;
    for (const p of pts) { ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), o.r || 3, 0, 7); ctx.fill(); }
    ctx.restore();
    return { X, Y };
  }

  /* 위상 접기: 시험 주기 P로 접어 10칸 평균, 이웃 점 차이로 흩어짐 */
  function fold(P) {
    if (obs.length < 3) return null;
    const ph = obs.map((o) => ({ x: (((o.t - T0) / P) % 1 + 1) % 1, y: o.V })).sort((a, b) => a.x - b.x);
    let s = 0; for (let i = 1; i < ph.length; i++) s += (ph[i].y - ph[i - 1].y) ** 2;
    const bins = Array.from({ length: 10 }, () => []);
    ph.forEach((p) => bins[Math.min(9, Math.floor(p.x * 10))].push(p.y));
    const fl = bins.filter((b) => b.length).map((b) => 10 ** (-0.4 * b.reduce((a, c) => a + c, 0) / b.length));
    const Vm = -2.5 * Math.log10(fl.reduce((a, c) => a + c, 0) / fl.length);   // 광도로 평균한 등급
    return { ph, scat: Math.sqrt(s / (2 * (ph.length - 1))), Vm };
  }

  function drawMain() {
    const { ctx } = main, { w, h } = main.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 20, w: w - 58, h: h - 54 };
    if (tg === "dcep") {
      const t1 = Math.max(10, Math.ceil(tNow / 5) * 5);
      scatter(ctx, box, obs.map((o) => ({ x: o.t, y: o.V })), [0, t1], [3.3, 4.55], "관측 날짜 (일)", "V 등급 (위가 밝음)", { r: 3 });
      if (!obs.length) { ctx.fillStyle = C.ink3; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("'하룻밤 관측'을 눌러 δ Cep의 밝기를 재세요", box.x0 + box.w / 2, box.y0 + box.h / 2); }
    } else {
      const rows = tbl.rows.filter((r) => r.kind === "lmc");
      const o = scatter(ctx, box, rows.map((r) => ({ x: Math.log10(r.P), y: r.V })), [0, 1.6], [12.5, 17.5], "log P (P: 일)", "평균 V 등급", { r: 2.8 });
      const f = rows.length > 2 ? L.linfit(rows.map((r) => Math.log10(r.P)), rows.map((r) => r.V)) : null;
      if (f) {
        ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
        ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(o.X(0), o.Y(f.b)); ctx.lineTo(o.X(1.6), o.Y(f.a * 1.6 + f.b)); ctx.stroke(); ctx.restore();
        ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "right";
        ctx.fillText(`맞춤 기울기 ${f.a.toFixed(2)} ± ${f.sa.toFixed(2)} (보정식 −2.43)`, box.x0 + box.w - 4, box.y0 + box.h - 8);
      }
      if (!rows.length) { ctx.fillStyle = C.ink3; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("'세페이드 1개 측정'을 누르세요", box.x0 + box.w / 2, box.y0 + box.h / 2); }
    }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 20, w: w - 58, h: h - 54 };
    if (tg === "dcep") {
      const f = fold(+sP.value), pts = f ? f.ph.flatMap((p) => [p, { x: p.x + 1, y: p.y }]) : [];
      scatter(ctx, box, pts, [0, 2], [3.3, 4.55], "위상 (시험 주기로 접음)", "V 등급", { r: 2.6, nx: 4, color: C.forest });
      if (f) { ctx.fillStyle = C.ink2; ctx.font = `11px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(`P = ${(+sP.value).toFixed(3)} 일 · ⟨V⟩ ≈ ${f.Vm.toFixed(2)}`, box.x0 + box.w - 4, box.y0 + box.h - 8); }
    } else {
      const ds = tbl.rows.filter((r) => r.kind === "lmc").map((r) => r.d);
      L.hist(ctx, box, ds, { xr: [30, 80], bins: 10, xlabel: "d (kpc)" });
      const s = L.stats(ds);
      if (s.n) { ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(`평균 ${s.mean.toFixed(1)} kpc` + (s.n > 1 ? ` ± ${s.se.toFixed(1)} (표준오차)` : ""), box.x0 + box.w - 4, box.y0 + 12); }
    }
  }

  function nums() {
    if (tg === "dcep") {
      const f = fold(+sP.value);
      $(".n1t").textContent = "관측한 밤"; $(".n1").textContent = obs.length;
      $(".n2t").textContent = "평균 등급 ⟨V⟩"; $(".n2").textContent = f ? f.Vm.toFixed(2) : "—";
      $(".n3t").textContent = "흩어짐 (접은 곡선)"; $(".n3").textContent = f ? f.scat.toFixed(3) + " 등급" : "—";
    } else {
      const s = L.stats(tbl.rows.filter((r) => r.kind === "lmc").map((r) => r.d));
      $(".n1t").textContent = "측정한 세페이드"; $(".n1").textContent = s.n;
      $(".n2t").textContent = "평균 거리"; $(".n2").textContent = s.n ? s.mean.toFixed(1) + " kpc" : "—";
      $(".n3t").textContent = "표준오차"; $(".n3").textContent = s.n > 1 ? s.se.toFixed(1) + " kpc" : "—";
    }
  }

  function observe() {
    tNow += 1 + (Math.random() < 0.35 ? 1 + Math.floor(Math.random() * 2) : 0);   // 흐린 날은 건너뜀
    const t = tNow + 0.05 + Math.random() * 0.2;   // 밤 9시~새벽 2시쯤
    obs.push({ t, V: L.measure(vTrue(t), { sd: 0.02, res: 0.01 }) });
  }
  const row = (name, kind, P, V) => {
    const M = ML(P), mu = V - M - (cbExt.checked ? AV[kind] : 0);
    return { name, kind, P, V, M, mu, d: 10 ** ((mu + 5) / 5) / 1000 };
  };
  function measureLmc() {
    if (used.size >= LMC.length) return;
    let i; do { i = Math.floor(Math.random() * LMC.length); } while (used.has(i));
    used.add(i);
    const [id, P, V] = LMC[i];
    tbl.add(row("LMC-" + id, "lmc", P, V));
  }
  function recDcep() {
    const f = fold(+sP.value); if (!f) return;
    tbl.add(row("δ Cep", "dcep", +sP.value, f.Vm));
  }
  function setTg(t) {
    tg = t;
    root.querySelectorAll("[data-t]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.t === t)));
    $(".cp-dcep").hidden = t !== "dcep"; $(".cp-lmc").hidden = t !== "lmc"; $(".rec").hidden = t !== "dcep";
    drawMain(); drawPlot(); nums();
  }
  const upd = () => { $(".p-out").textContent = (+sP.value).toFixed(3); drawPlot(); nums(); };
  sP.addEventListener("input", upd);
  $(".obs1").addEventListener("click", () => { observe(); drawMain(); drawPlot(); nums(); });
  $(".obs5").addEventListener("click", () => { for (let i = 0; i < 5; i++) observe(); drawMain(); drawPlot(); nums(); });
  $(".lm1").addEventListener("click", measureLmc);
  $(".lm10").addEventListener("click", () => { for (let i = 0; i < 10; i++) measureLmc(); });
  $(".rec").addEventListener("click", recDcep);
  $(".clear").addEventListener("click", () => { tbl.clear(); used.clear(); if (tg === "dcep") { obs = []; tNow = 0; } drawMain(); drawPlot(); nums(); });
  $(".cp-tg").addEventListener("click", (e) => { const b = e.target.closest("[data-t]"); if (b) setTg(b.dataset.t); });
  upd();
  if (L.demo) {
    for (let i = 0; i < 18; i++) observe();
    [5.2, 5.366, 5.5].forEach((p) => { sP.value = p; recDcep(); });
    for (let i = 0; i < 25; i++) measureLmc();
    sP.value = 5.366; upd(); drawMain();
  }
})();
