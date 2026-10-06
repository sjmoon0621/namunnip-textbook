/* 카드: 손잡이를 돌린 일과 데워진 물로 1 cal가 몇 J인지 잴 수 있을까? — 마찰 원통(캘린더형) 열의 일당량 장치, W–Q 직선, 럼퍼드 보정 */
(() => {
  const root = document.getElementById("card-labphy-joule");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sM = $(".m"), sN = $(".n"), sD = $(".d"), bLoss = $(".loss");
  const G = 9.8, D = 0.046, HC = 50 * 1 + 200 * 0.092, JT = 4.186, TR = 20, RPS = 2, HLOSS = 0.06, SPEED = 12;
  let loss = true, run = null, clock = 0, ang = 0;

  const tbl = L.table($(".tbl-host"), [
    { key: "M", label: "M (kg)", res: 0.1 }, { key: "Fs", label: "F_s (N)", res: 0.1 }, { key: "N", label: "N", res: 1 },
    { key: "T1", label: "T₁ (°C)", res: 0.1 }, { key: "T2", label: "T₂ (°C)", res: 0.1 },
    { key: "W", label: "W (J)", res: 1 }, { key: "Q", label: "Q (cal)", res: 1 }, { key: "J", label: "W/Q", res: 0.01 },
  ], () => drawPlot());
  const app = fit($(".cv-wide"), () => drawApp()), pl = fit($(".cv-plot"), () => drawPlot());

  function start() {
    const M = +sM.value, N = +sN.value, T0 = TR + +sD.value;
    const fsTrue = 0.04 * M * G + 0.6;
    const Ffr = M * G - fsTrue, Pcal = Ffr * Math.PI * D * RPS / JT;   // cal/s
    const dur = N / RPS, dt = 0.25, trace = [];
    let T = T0;
    for (let t = 0; t <= dur + 1e-9; t += dt) { trace.push({ t, T }); T += (Pcal - (loss ? HLOSS * (T - TR) : 0)) * dt / HC; }
    const T1 = L.measure(T0, { sd: 0.04, res: 0.1 }), T2 = L.measure(T, { sd: 0.04, res: 0.1 });
    const Fs = L.measure(fsTrue, { sd: 0.25, res: 0.1 });   // 돌리는 동안 흔들리는 눈금을 눈으로 평균
    const W = (M * G - Fs) * Math.PI * D * N, Q = HC * (T2 - T1);
    run = { trace, dur, row: { M, Fs, N, T1, T2, W, Q, J: Q > 0 ? W / Q : NaN }, fsTrue, done: false };
    clock = 0;
  }
  function finish() {
    if (!run || run.done) return;
    run.done = true; clock = run.dur; tbl.add(run.row);
    $(".n-t").textContent = `${(run.row.T2 - run.row.T1).toFixed(1)} °C`;
  }

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const cx = w * 0.3, cy = h * 0.4, R = Math.min(52, h * 0.2), M = run ? run.row.M : +sM.value;
    // 받침대
    ctx.fillStyle = C.ink2; ctx.fillRect(cx - 4, 8, 8, h - 24); ctx.fillRect(cx - 70, h - 18, 140, 6);
    ctx.fillRect(cx - 4, 8, R + 22, 5);
    // 원통 (옆에서 본 원)
    const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.2, cx, cy, R);
    g.addColorStop(0, "#e6a77b"); g.addColorStop(1, "#b5683a");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,.25)"; ctx.lineWidth = 1;
    for (let k = 0; k < 6; k++) { const a = ang + k * Math.PI / 3; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * R * 0.35, cy + Math.sin(a) * R * 0.35); ctx.lineTo(cx + Math.cos(a) * R * 0.85, cy + Math.sin(a) * R * 0.85); ctx.stroke(); }
    // 손잡이
    const hx = cx + Math.cos(ang) * R * 0.7, hy = cy + Math.sin(ang) * R * 0.7;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(hx, hy, 5, 0, Math.PI * 2); ctx.fill();
    // 나일론 띠: 왼쪽은 추, 오른쪽은 용수철저울
    const bandY = cy + R * 1.9;
    ctx.strokeStyle = "#f3f0e0"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, R + 2, Math.PI, 0); ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R + 4, Math.PI, 0); ctx.stroke();
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx - R - 2, cy); ctx.lineTo(cx - R - 2, bandY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + R + 2, cy); ctx.lineTo(cx + R + 2, 64); ctx.stroke();
    // 용수철저울
    const sx = cx + R + 2;
    ctx.fillStyle = C.card; ctx.strokeStyle = C.ink2; ctx.fillRect(sx - 7, 22, 14, 42); ctx.strokeRect(sx - 7, 22, 14, 42);
    ctx.beginPath(); ctx.moveTo(sx, 13); ctx.lineTo(sx, 22); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("용수철저울", sx + 12, 44);
    // 추
    const mw = 42 + M * 4, mh = 18 + M * 3, jig = run && !run.done ? Math.sin(clock * 9) * 1.5 : 0;
    ctx.fillStyle = "#6f7177"; ctx.fillRect(cx - R - 2 - mw / 2, bandY + jig, mw, mh);
    ctx.fillStyle = "#fff"; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(`${M.toFixed(1)} kg`, cx - R - 2, bandY + jig + mh / 2 + 4);
    ctx.fillStyle = C.rule; ctx.fillRect(cx - R - 2 - mw, bandY + mh + 6, mw * 2, 3);
    // 읽음값
    const tNow = run ? Math.min(clock, run.dur) : 0;
    const Tn = run ? run.trace[Math.min(run.trace.length - 1, Math.round(tNow / 0.25))].T : TR + +sD.value;
    const px = w * 0.62, py = h * 0.1, bw = w * 0.34;
    ctx.fillStyle = C.card; ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.fillRect(px, py, bw, h * 0.78); ctx.strokeRect(px, py, bw, h * 0.78);
    ctx.textAlign = "left";
    const rowTxt = (lab, val, y) => { ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.fillText(lab, px + 12, y); ctx.fillStyle = C.ink; ctx.font = `600 17px ${F.mono}`; ctx.fillText(val, px + 12, y + 22); };
    rowTxt("회전 계수기", `${Math.floor(tNow * RPS)} / ${run ? run.row.N : +sN.value}`, py + 20);
    rowTxt("온도계", `${L.snap(Tn, 0.1).toFixed(1)} °C`, py + 70);
    rowTxt("용수철저울", run ? `${run.row.Fs.toFixed(1)} N` : "—", py + 120);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const pts = tbl.rows.map((r) => ({ x: r.Q, y: r.W }));
    const f = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y), true) : null;
    const qMax = Math.max(200, ...pts.map((p) => p.x)) * 1.1;
    L.plot(ctx, { x0: 52, y0: 18, w: w - 66, h: h - 52 }, { pts, fit: f, model: (q) => JT * q, xr: [0, qMax], yr: [0, qMax * 4.6], xlabel: "Q (cal)", ylabel: "W (J)" });
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("점선: 4.186 J/cal", 60, 34);
    $(".n-j").textContent = f ? `${f.a.toFixed(2)} ± ${f.sa.toFixed(2)} J/cal` : "점 2개 이상";
    $(".n-e").textContent = f ? `${((f.a / JT - 1) * 100).toFixed(1)} %` : "—";
  }

  loop($(".cv-wide"), (dt) => {
    if (!run || run.done) return;
    clock += dt * SPEED; ang += dt * SPEED * RPS * 2 * Math.PI * 0.05;
    if (clock >= run.dur) finish();
    drawApp();
  });
  const upd = () => { $(".m-out").textContent = (+sM.value).toFixed(1); $(".n-out").textContent = sN.value; $(".d-out").textContent = (+sD.value > 0 ? "+" : +sD.value < 0 ? "−" : "") + Math.abs(+sD.value).toFixed(1); if (run && run.done) run = null; drawApp(); };
  [sM, sN, sD].forEach((el) => el.addEventListener("input", upd));
  $(".run").addEventListener("click", () => { if (!run || run.done) { start(); drawApp(); } });
  bLoss.addEventListener("click", () => { loss = !loss; bLoss.setAttribute("aria-pressed", String(loss)); });
  $(".clear").addEventListener("click", () => { run = null; tbl.clear(); $(".n-t").textContent = "—"; drawApp(); });
  upd();
  if (L.demo) {
    [[5, 100, -1], [5, 200, -2.5], [5, 300, -3.5], [5, 400, -4.5], [3, 300, -2], [4, 200, -2]].forEach(([m, n, d]) => { sM.value = m; sN.value = n; sD.value = d; start(); finish(); });
    $(".m-out").textContent = (+sM.value).toFixed(1); $(".n-out").textContent = sN.value; $(".d-out").textContent = "−2.0";
    drawApp(); drawPlot();
  }
})();
