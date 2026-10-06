/* 카드: 센서가 1초에 몇 번 재야 진자의 운동을 제대로 기록할까? — 운동 센서, 표본화 빈도(에일리어싱), ADC 분해능 */
(() => {
  const root = document.getElementById("card-labphy-logger");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sM = $(".m"), cTruth = $(".truth");
  const K = 12.0, A0 = 0.06, TAU = 20, D0 = 0.50, RMIN = 0.15, RMAX = 4.0, DUR = 10, SPEED = 2.5;   // K: 숨은 용수철 상수 (N/m)
  let fs = 10, bits = 10, run = null, last = null, tFree = 0;

  const freq = () => Math.sqrt(K / (+sM.value / 1000)) / (2 * Math.PI);
  const lsb = () => (RMAX - RMIN) / 2 ** bits;
  const pos = (t, f) => D0 + A0 * Math.exp(-t / TAU) * Math.cos(2 * Math.PI * f * t);
  const sample = (t, f) => RMIN + L.snap(pos(t, f) + 0.001 * L.gauss() - RMIN, lsb());

  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "m", label: "m (g)", res: 1 }, { key: "fs", label: "fs (Hz)", res: 0.1 }, { key: "bits", label: "비트", res: 1 }, { key: "lsb", label: "LSB (mm)", res: 0.1 },
    { key: "T", label: "겉보기 T (s)", res: 0.01 }, { key: "f", label: "겉보기 f (Hz)", res: 0.01 }, { key: "amp", label: "진폭 (mm)", res: 1 },
  ], () => drawPlot());

  // 기록된 점들이 평균선을 위로 지나는 시각 (히스테리시스로 잡음 무시)
  function analyse(pts) {
    const ys = pts.map((p) => p.y), m = ys.reduce((s, y) => s + y, 0) / ys.length;
    const sd = Math.sqrt(ys.reduce((s, y) => s + (y - m) ** 2, 0) / ys.length), hy = Math.max(0.25 * sd, 1e-6);
    const ups = []; let armed = false;
    for (let i = 1; i < pts.length; i++) {
      if (pts[i - 1].y < m - hy) armed = true;
      if (armed && pts[i - 1].y < m && pts[i].y >= m) {
        const a = pts[i - 1], b = pts[i]; ups.push(a.t + (m - a.y) / (b.y - a.y) * (b.t - a.t)); armed = false;
      }
    }
    const T = ups.length >= 2 ? (ups[ups.length - 1] - ups[0]) / (ups.length - 1) : NaN;
    return { T, f: 1 / T, amp: (Math.max(...ys) - Math.min(...ys)) / 2 };
  }

  function record(instant) {
    const f = freq(), dt = 1 / fs, pts = [];
    for (let t = 0; t <= DUR + 1e-9; t += dt) pts.push({ t, y: sample(t, f) });
    run = { pts, f, fs, bits, el: instant ? DUR + 1 : 0, m: +sM.value };
    if (instant) finish();
  }
  function finish() {
    const a = analyse(run.pts);
    tbl.add({ m: run.m, fs: run.fs, bits: run.bits, lsb: (RMAX - RMIN) / 2 ** run.bits * 1000, T: a.T, f: a.f, amp: a.amp * 1000 });
    last = run; run = null;
  }

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const f = freq(), cur = run || last;
    const tNow = run ? Math.min(run.el, DUR) : null;
    const d = run ? pos(tNow, run.f) : D0 + A0 * 0.6 * Math.cos(2 * Math.PI * f * tFree);
    // 장치: 천장 – 용수철 – 추 – (거리) – 센서
    const ax = 46, top = 12, floor = h - 26, sc = (floor - top - 30) / 0.8;   // 0.8 m 높이를 줄여 그린다
    const my = floor - 10 - d * sc;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ax - 32, top); ctx.lineTo(ax + 32, top); ctx.stroke();
    ctx.lineWidth = 1.3; ctx.strokeStyle = C.ink2; ctx.beginPath(); ctx.moveTo(ax, top);
    const coils = 12, sy = top + 6, ey = my - 16;
    ctx.lineTo(ax, sy);
    for (let i = 1; i <= coils * 2; i++) ctx.lineTo(ax + (i % 2 ? 9 : -9), sy + (ey - sy) * i / (coils * 2));
    ctx.lineTo(ax, ey); ctx.lineTo(ax, my - 12); ctx.stroke();
    ctx.fillStyle = "#8d8d92"; ctx.fillRect(ax - 13, my - 12, 26, 12);
    ctx.fillStyle = C.ink; ctx.fillRect(ax - 22, floor - 10, 44, 10);
    ctx.fillStyle = C.amber; ctx.fillRect(ax - 10, floor - 13, 20, 3);
    ctx.setLineDash([2, 4]); ctx.strokeStyle = C.amber; ctx.beginPath(); ctx.moveTo(ax, floor - 14); ctx.lineTo(ax, my + 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    ctx.fillText("운동 센서", ax, floor + 14);

    // 기록 그래프
    const box = { x0: 132, y0: 18, w: w - 144, h: h - 50 };
    const g = L.plot(ctx, box, { pts: [], xr: [0, DUR], yr: [0.42, 0.58], xlabel: "t (s)", ylabel: "거리 (m)" });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    if (cur && cTruth.checked) {
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath();
      const tEnd = run ? tNow : DUR;
      for (let i = 0; i <= 1200; i++) { const t = tEnd * i / 1200, y = pos(t, cur.f); i ? ctx.lineTo(g.X(t), g.Y(y)) : ctx.moveTo(g.X(t), g.Y(y)); }
      ctx.stroke(); ctx.setLineDash([]);
    }
    if (cur) {
      const shown = cur.pts.filter((p) => !run || p.t <= tNow);
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1.4; ctx.beginPath();
      shown.forEach((p, i) => (i ? ctx.lineTo(g.X(p.t), g.Y(p.y)) : ctx.moveTo(g.X(p.t), g.Y(p.y))));
      ctx.stroke();
      ctx.fillStyle = C.forest;
      if (shown.length < 120) shown.forEach((p) => { ctx.beginPath(); ctx.arc(g.X(p.t), g.Y(p.y), 2.4, 0, Math.PI * 2); ctx.fill(); });
      if (run) { ctx.strokeStyle = C.warn; ctx.beginPath(); ctx.moveTo(g.X(tNow), box.y0); ctx.lineTo(g.X(tNow), box.y0 + box.h); ctx.stroke(); }
    }
    ctx.restore();
    if (cur) {
      ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "right";
      ctx.fillText(`${cur.fs} Hz · ${cur.bits}비트${run ? " · 기록 중" : ""}`, box.x0 + box.w, 12);
    }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const pts = tbl.rows.filter((r) => Number.isFinite(r.f)).map((r) => ({ x: r.fs, y: r.f }));
    L.plot(ctx, { x0: 44, y0: 22, w: w - 58, h: h - 56 }, { pts, xr: [0, 10.5], yr: [0, 2.5], model: (x) => x / 2, xlabel: "표본화 빈도 fs (Hz)", ylabel: "겉보기 진동수 (Hz)" });
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText("점선: fs/2 (나이퀴스트 진동수)", w - 14, 14);
  }

  const nums = () => {
    const l = lsb() * 1000;
    $(".n-lsb").textContent = l >= 10 ? `${l.toFixed(0)} mm` : `${l.toFixed(1)} mm`;
    $(".n-n").textContent = String(Math.floor(DUR * fs + 1e-9) + 1);
    $(".n-ny").textContent = `${(fs / 2).toFixed(2)} Hz`;
  };
  loop($(".cv-wide"), (dt) => {
    tFree += dt;
    if (run) { run.el += dt * SPEED; if (run.el >= DUR + 0.3) finish(); }
    drawApp();
  });
  const group = (sel, attr, set) => $(sel).addEventListener("click", (e) => {
    const b = e.target.closest(`[${attr}]`); if (!b) return;
    root.querySelectorAll(`${sel} [${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); set(+b.getAttribute(attr)); nums(); drawApp();
  });
  group(".fs", "data-fs", (v) => { fs = v; });
  group(".bits", "data-b", (v) => { bits = v; });
  sM.addEventListener("input", () => { $(".m-out").textContent = sM.value; drawApp(); });
  cTruth.addEventListener("change", drawApp);
  $(".rec").addEventListener("click", () => { if (!run) record(false); });
  $(".clear").addEventListener("click", () => { run = null; last = null; tbl.clear(); drawApp(); });
  nums();
  if (L.demo) {
    const pick = (v, b) => { fs = v; bits = b; record(true); };
    [[10, 10], [5, 10], [4, 10], [3, 10], [2.5, 10], [2, 10], [1, 10], [10, 6], [1.5, 10]].forEach(([v, b]) => pick(v, b));
    root.querySelectorAll(".fs [data-fs]").forEach((x) => x.setAttribute("aria-pressed", String(+x.dataset.fs === 1.5)));
    cTruth.checked = true; nums(); drawApp();
  }
})();
