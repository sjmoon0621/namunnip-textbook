/* 카드: 거름종이 원판이 떠오르는 시간으로 효소의 반응 속도를 잴 수 있을까? — 카탈레이스 원판 부상법 (기질·효소 농도, 온도, pH) */
(() => {
  const root = document.getElementById("card-labbio-enzyme-rate");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sl = { s: $(".s"), e: $(".e"), t: $(".t"), p: $(".p") };
  const KM = 0.8, Q10 = 1.8, TD = 50, TW = 3.5, PW = 2.2, TMAX = 300;
  let xKey = "s", run = null;

  // 상대 활성 (모식): 미카엘리스–멘텐 × 온도(Q10과 열 변성) × pH 봉우리
  const fT = (T) => Q10 ** ((T - 25) / 10) / (1 + Math.exp((T - TD) / TW));
  const fP = (p) => Math.exp(-(((p - 7) / PW) ** 2));
  const v = (c) => (c.e / 100) * (c.s / (c.s + KM)) * fT(c.t) * fP(c.p);
  const K = 9 * v({ s: 3, e: 100, t: 25, p: 7 });   // 기준 조건에서 9 s
  const tTrue = (c) => { const r = v(c); return r > 0 ? K / r : Infinity; };
  const cur = () => ({ s: +sl.s.value, e: +sl.e.value, t: +sl.t.value, p: +sl.p.value });

  const tbl = L.table($(".tbl-host"), [
    { key: "s", label: "H₂O₂ (%)", res: 0.01 }, { key: "e", label: "효소액 (%)", res: 1 }, { key: "t", label: "T (°C)", res: 1 },
    { key: "p", label: "pH", res: 1 }, { key: "tm", label: "t (s)", res: 0.01 }, { key: "r", label: "1/t (s⁻¹)", res: 0.001 },
  ], () => drawPlot());
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());

  function record(c) {
    const tt = tTrue(c);
    if (tt > TMAX) return { ...c, tm: `> ${TMAX}`, r: 0 };
    const late = $(".late").checked ? 0.6 : 0;
    const tm = Math.max(0.5, L.snap(tt * (1 + 0.08 * L.gauss()) + 0.15 * L.gauss() + late, 0.01));
    return { ...c, tm, r: L.snap(1 / tm, 0.001) };
  }

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const c = run ? run.c : cur();
    const bx = w * 0.12, bw = w * 0.36, top = 26, bot = h - 18, liq = top + 34;
    // 비커와 용액
    const tint = c.t >= 45 ? "rgba(240,200,180,.45)" : c.t <= 10 ? "rgba(190,215,245,.55)" : "rgba(200,225,245,.5)";
    ctx.fillStyle = tint; ctx.fillRect(bx, liq, bw, bot - liq);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(bx - 4, top); ctx.lineTo(bx, top + 4); ctx.lineTo(bx, bot); ctx.lineTo(bx + bw, bot); ctx.lineTo(bx + bw, top); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText(`H₂O₂ ${c.s.toFixed(2)}% · pH ${c.p} · ${c.t} °C`, bx, top - 8);
    // 원판
    let dy = bot - 8, bub = 0;
    if (run) {
      const el = run.el;
      const fall = Math.min(1, el / 0.4);
      const floatF = run.tt <= TMAX ? Math.max(0, Math.min(1, (run.simT - run.tt) / 1.5)) : 0;
      bub = Math.min(1, run.simT / Math.min(run.tt, TMAX));
      dy = liq + 6 + (bot - 14 - liq) * fall * (1 - floatF);
    }
    const dx = bx + bw * 0.5;
    if (run) {
      for (let i = 0; i < Math.round(bub * 14); i++) { ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(dx - 18 + (i * 37 % 36), dy - 3 - (i % 3) * 2.5, 1.6 + (i % 2), 0, Math.PI * 2); ctx.stroke(); }
      ctx.fillStyle = "#f2ead2"; ctx.fillRect(dx - 20, dy - 2, 40, 4); ctx.strokeStyle = C.ink3; ctx.strokeRect(dx - 20, dy - 2, 40, 4);
    } else {
      ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("원판 대기 중", dx, liq + 24);
    }
    // 초시계
    const cx = w * 0.74, cy = h * 0.42, R = Math.min(46, h * 0.26);
    ctx.fillStyle = C.card; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillRect(cx - 6, cy - R - 9, 12, 8); ctx.strokeRect(cx - 6, cy - R - 9, 12, 8);
    const shown = run ? (run.done ? (typeof run.rec.tm === "number" ? run.rec.tm : TMAX) : Math.min(run.simT, TMAX)) : 0;
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.sin(shown / 60 * 2 * Math.PI) * R * 0.8, cy - Math.cos(shown / 60 * 2 * Math.PI) * R * 0.8); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `600 15px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(run && run.done && typeof run.rec.tm !== "number" ? "> 300 s" : shown.toFixed(2) + " s", cx, cy + R + 22);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink3;
    ctx.fillText(!run ? "초시계" : run.done ? (typeof run.rec.tm === "number" ? "떠오름 → 멈춤" : "5분 동안 뜨지 않음") : "기포가 붙는 중", cx, cy + R + 38);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const c = cur();
    const keys = ["s", "e", "t", "p"].filter((k) => k !== xKey);
    const rows = tbl.rows.filter((r) => keys.every((k) => Math.abs(r[k] - c[k]) < 1e-9));
    const pts = rows.map((r) => ({ x: r[xKey], y: r.r }));
    const xr = { s: [0, 3.2], e: [0, 105], t: [0, 70], p: [2, 12] }[xKey];
    const lab = { s: "H₂O₂ 농도 (%)", e: "효소액 농도 (%)", t: "온도 (°C)", p: "pH" }[xKey];
    const model = $(".truth").checked ? (x) => { const q = { ...c, [xKey]: x }; return 1 / tTrue(q); } : null;
    const mpk = model ? Math.max(...Array.from({ length: 41 }, (_, i) => model(xr[0] + (xr[1] - xr[0]) * i / 40))) : 0;
    const ymax = Math.max(0.05, ...pts.map((p) => p.y), mpk) * 1.15;
    L.plot(ctx, { x0: 46, y0: 18, w: w - 60, h: h - 52 }, { pts, model, xr, yr: [0, ymax], xlabel: lab, ylabel: "반응 속도 1/t (s⁻¹)" });
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right";
    const fixed = keys.map((k) => ({ s: `H₂O₂ ${c.s}%`, e: `효소 ${c.e}%`, t: `${c.t} °C`, p: `pH ${c.p}` }[k])).join(" · ");
    ctx.fillText(`고정: ${fixed}  (점 ${pts.length}개)`, w - 14, 30);
  }

  loop($(".cv-wide"), (dt) => {
    if (run && !run.done) {
      run.el += dt;
      const speed = Math.max(1, Math.min(run.tt, TMAX) / 4);
      run.simT += dt * speed;
      if (run.simT >= Math.min(run.tt, TMAX) + (run.tt <= TMAX ? 1.5 : 0)) { run.done = true; tbl.add(run.rec); }
    }
    drawApp();
  });
  const upd = () => {
    $(".s-out").textContent = (+sl.s.value).toFixed(2); $(".e-out").textContent = sl.e.value;
    $(".t-out").textContent = sl.t.value; $(".p-out").textContent = sl.p.value;
    if (run && run.done) run = null;
    drawApp(); drawPlot();
  };
  Object.values(sl).forEach((el) => el.addEventListener("input", upd));
  $(".truth").addEventListener("change", drawPlot);
  $(".drop").addEventListener("click", () => {
    if (run && !run.done) return;
    const c = cur();
    run = { c, tt: tTrue(c), el: 0, simT: 0, done: false, rec: record(c) };
  });
  $(".clear").addEventListener("click", () => { run = null; tbl.clear(); drawApp(); });
  $(".xsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-x]"); if (!b) return;
    xKey = b.dataset.x; root.querySelectorAll("[data-x]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  upd();
  if (L.demo) {
    const set = (s, e, t, p) => { sl.s.value = s; sl.e.value = e; sl.t.value = t; sl.p.value = p; };
    [0, 0.5, 1, 1.5, 2, 3].forEach((s) => [1, 2].forEach(() => tbl.add(record({ s, e: 100, t: 25, p: 7 }))));
    [10, 25, 40, 55].forEach((t) => tbl.add(record({ s: 3, e: 100, t, p: 7 })));
    [4, 7, 10].forEach((p) => tbl.add(record({ s: 3, e: 100, t: 25, p })));
    set(3, 100, 25, 7); $(".truth").checked = true; upd();
    run = { c: cur(), tt: tTrue(cur()), el: 1, simT: 11, done: false, rec: record(cur()) }; run.done = true; run.rec.tm = 9.12;
  }
})();
