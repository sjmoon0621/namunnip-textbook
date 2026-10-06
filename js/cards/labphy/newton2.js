/* 카드: 같은 힘으로 끌 때 질량과 가속도 — 수평 트랙, 도르래, 운동 센서 v–t 기울기, a–1/(M+m) */
(() => {
  const root = document.getElementById("card-labphy-newton2");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sM = $(".M"), sm = $(".m"), cComp = $(".comp");
  const G = 9.8, RUN = 0.7;
  let xKey = "iT", run = null, last = null;

  const tbl = L.table($(".tbl-host"), [
    { key: "M", label: "M (g)", res: 1 }, { key: "m", label: "m (g)", res: 1 },
    { key: "T", label: "M+m (g)", res: 1 }, { key: "a", label: "a (m/s²)", res: 0.001 },
  ], () => drawPlot());
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());

  // 참 가속도: 마찰(바퀴 구름 μ≈0.004, 도르래 0.004 N)은 보정하면 거의 0
  const aTrue = (M, m) => {
    const f = cComp.checked ? 0.0004 * G * M / 1000 : 0.004 * G * M / 1000 + 0.004;
    return Math.max(0, (m / 1000 * G - f) / ((M + m) / 1000 + 0.004));   // 도르래 회전 관성 ≈ 4 g
  };

  function start() {
    if (run) return;
    const M = +sM.value, m = +sm.value, a = aTrue(M, m);
    run = { M, m, a, el: 0, end: Math.sqrt(2 * RUN / a) };
  }
  function finish() {
    const r = run, pts = [];
    for (let t = 0.05 + Math.random() * 0.05; t < r.end - 0.02; t += 0.05) pts.push({ x: t, y: L.snap(r.a * t + 0.004 * L.gauss(), 0.001) });
    const f = L.linfit(pts.map((p) => p.x), pts.map((p) => p.y));
    last = { pts, f, end: r.end };
    tbl.add({ M: r.M, m: r.m, T: r.M + r.m, a: L.snap(f.a, 0.001) });
    run = null;
  }

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const M = run ? run.M : +sM.value, m = run ? run.m : +sm.value;
    const ty = 58, tx0 = 30, tx1 = w - 56, sc = (tx1 - tx0 - 100) / RUN;
    // 트랙과 탁자
    ctx.fillStyle = "#e7e6dd"; ctx.fillRect(tx0 - 10, ty + 10, tx1 - tx0 + 20, 6);
    ctx.fillStyle = C.ink2; ctx.fillRect(tx0, ty + 6, tx1 - tx0, 4);
    // 운동 센서
    ctx.fillStyle = C.ink; ctx.fillRect(tx0 - 6, ty - 18, 14, 22); ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("운동 센서", tx0 - 6, ty - 24);
    // 수레
    const s = run ? 0.5 * run.a * Math.min(run.el, run.end) ** 2 : 0, cw = 34 + M / 60, cx = tx0 + 26 + s * sc;
    ctx.fillStyle = "#3f6fa3"; ctx.fillRect(cx, ty - 12, cw, 14);
    const bars = Math.round((M - 300) / 250); ctx.fillStyle = "#8d8d92";
    for (let i = 0; i < Math.min(4, Math.max(0, bars)); i++) ctx.fillRect(cx + 4 + i * (cw - 8) / 4, ty - 20, (cw - 8) / 4 - 2, 8);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx + 7, ty + 4, 3.5, 0, Math.PI * 2); ctx.arc(cx + cw - 7, ty + 4, 3.5, 0, Math.PI * 2); ctx.fill();
    // 도르래와 추
    const px = tx1 + 8, py = ty - 2, pr = 9;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(px, py + pr, pr, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + cw, ty - 5); ctx.lineTo(px, py); ctx.arc(px, py + pr, pr, -Math.PI / 2, 0);
    const hy = py + pr + 16 + s * sc * 0.55; ctx.lineTo(px + pr, hy); ctx.stroke();
    const hw = 10 + m / 8; ctx.fillStyle = C.amber; ctx.fillRect(px + pr - hw / 2, hy, hw, 8 + m / 10);
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(`${m} g`, px + pr - hw / 2 - 4, hy + 10);
    ctx.textAlign = "center"; ctx.fillText(`M = ${M} g`, cx + cw / 2, ty + 28);
    // 센서가 잰 v–t (지난 측정)
    const box = { x0: 40, y0: 130, w: w - 56, h: h - 162 };
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(run ? "측정 중…" : last ? "운동 센서 기록 (지난 측정) — 기울기가 가속도" : "수레를 놓으면 센서 기록이 여기에 나타납니다", box.x0, box.y0 - 12);
    if (last && !run) {
      const tm = Math.max(1, Math.ceil(last.end)), vm = Math.max(0.2, Math.ceil(last.f.a * last.end * 5) / 5);
      L.plot(ctx, box, { pts: last.pts, fit: last.f, xr: [0, tm], yr: [0, vm], xlabel: "t (s)", ylabel: "" });
      ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`a = ${last.f.a.toFixed(3)} m/s²`, box.x0 + 8, box.y0 + 14);
    }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const xv = (r) => (xKey === "M" ? r.M / 1000 : xKey === "iM" ? 1000 / r.M : 1000 / r.T);
    const pts = tbl.rows.map((r) => ({ x: xv(r), y: r.a }));
    const ft = xKey !== "M" && pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y)) : null;
    const lab = { M: "M (kg)", iM: "1/M (1/kg)", iT: "1/(M+m) (1/kg)" }[xKey];
    const xr = { M: [0, 1.4], iM: [0, 3.5], iT: [0, 3.5] }[xKey];
    L.plot(ctx, { x0: 46, y0: 20, w: w - 60, h: h - 54 }, { pts, fit: ft, xr, yr: [0, Math.max(1, ...pts.map((p) => p.y * 1.15))], xlabel: lab, ylabel: "a (m/s²)" });
    $(".n-k").textContent = ft ? `${ft.a.toFixed(3)} N` : xKey === "M" ? "곡선 — 직선 맞춤 안 함" : "점 2개 이상";
    $(".n-r").textContent = ft ? `${ft.b.toFixed(3)} m/s²` : "—";
    const ms = [...new Set(tbl.rows.map((r) => r.m))];
    $(".n-f").textContent = ms.length === 1 ? `${(ms[0] / 1000 * G).toFixed(3)} N` : ms.length ? "m이 섞여 있음" : `${(+sm.value / 1000 * G).toFixed(3)} N`;
  }

  const upd = () => { $(".M-out").textContent = sM.value; $(".m-out").textContent = sm.value; draw(); if (!tbl.rows.length) drawPlot(); };
  [sM, sm].forEach((el) => el.addEventListener("input", upd));
  root.querySelectorAll(".xsel .chip").forEach((b) => b.addEventListener("click", () => {
    xKey = b.dataset.x; root.querySelectorAll(".xsel .chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  }));
  $(".meas").addEventListener("click", start);
  $(".clear").addEventListener("click", () => { tbl.clear(); last = null; draw(); });
  loop($(".cv-wide"), (dt) => { if (run) { run.el += dt; if (run.el >= run.end + 0.3) finish(); draw(); } });
  upd();
  if (L.demo) { [300, 500, 700, 900, 1100, 1300].forEach((M) => { sM.value = M; start(); finish(); }); sM.value = 500; upd(); }
})();
