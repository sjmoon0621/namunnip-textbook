/* 카드: 차갑거나 짠 물은 수조 바닥을 얼마나 빨리 퍼져 나갈까? — 칸막이 수조(lock exchange) 밀도류, EOS-80 밀도 */
(() => {
  const root = document.getElementById("card-labearth-thermohaline");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sTL = $(".tl"), sSL = $(".sl"), sTR = $(".tr"), sSR = $(".sr");
  const G = 9.8, H = 0.15, LEN = 0.60, GATE = 0.15, MARK = 0.45, FR = 0.45, SPEED = 5;
  let xKey = "g", run = null;

  /* UNESCO EOS-80, 대기압(수압 0)에서의 밀도 kg/m³ */
  function rho(S, T) {
    const a0 = 999.842594 + 6.793952e-2 * T - 9.095290e-3 * T * T + 1.001685e-4 * T ** 3 - 1.120083e-6 * T ** 4 + 6.536332e-9 * T ** 5;
    return a0 + S * (8.24493e-1 - 4.0899e-3 * T + 7.6438e-5 * T * T - 8.2467e-7 * T ** 3 + 5.3875e-9 * T ** 4)
      + S ** 1.5 * (-5.72466e-3 + 1.0227e-4 * T - 1.6546e-6 * T * T) + 4.8314e-4 * S * S;
  }
  const state = () => {
    const rl = rho(+sSL.value, +sTL.value), rr = rho(+sSR.value, +sTR.value), d = rl - rr;
    const gp = G * Math.abs(d) / ((rl + rr) / 2);
    return { rl, rr, d, gp, u: FR * Math.sqrt(gp * H) };
  };

  const cv = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "tl", label: "왼 T (°C)", res: 1 }, { key: "sl", label: "왼 S", res: 1 }, { key: "tr", label: "오 T (°C)", res: 1 }, { key: "sr", label: "오 S", res: 1 },
    { key: "dr", label: "Δρ (kg/m³)", res: 0.1 }, { key: "t", label: "t (s)", res: 0.01 }, { key: "u", label: "u (cm/s)", res: 0.01 },
  ], () => drawPlot());

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const st = state(), x0 = 20, x1 = w - 20, sx = (x1 - x0) / LEN, top = 34, bot = h - 40, sy = (bot - top) / (H + 0.03);
    const X = (x) => x0 + x * sx, Y = (z) => bot - z * sy;
    const dye = "rgba(54,92,170,.62)", clear = "rgba(111,160,196,.14)";
    /* 물 */
    ctx.fillStyle = clear; ctx.fillRect(X(0), Y(H), LEN * sx, H * sy);
    const tt = run ? run.t : 0, released = !!run;
    const dense = st.d > 0, still = Math.abs(st.d) < 0.05;
    if (!released || still) {
      ctx.fillStyle = dye; ctx.fillRect(X(0), Y(H), GATE * sx, H * sy);
    } else {
      const xf = Math.min(LEN, GATE + st.u * tt), xb = Math.max(0, GATE - st.u * tt);
      const half = H / 2;
      ctx.fillStyle = dye; ctx.beginPath();
      if (dense) {
        /* 색 물: 바닥을 따라 오른쪽으로, 왼쪽 칸 위쪽은 맑은 물이 파고듦 */
        ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(0), Y(H));
        ctx.lineTo(X(xb), Y(H));
        for (let i = 0; i <= 40; i++) { const x = xb + (xf - xb) * i / 40, z = half + 0.004 * Math.sin(x * 90 - tt * 3) * (i > 0 && i < 40 ? 1 : 0); ctx.lineTo(X(x), Y(i === 0 ? H : z)); }
        ctx.quadraticCurveTo(X(xf + 0.012), Y(half * 0.6), X(xf + 0.008), Y(0));
      } else {
        ctx.moveTo(X(0), Y(H)); ctx.lineTo(X(0), Y(0)); ctx.lineTo(X(xb), Y(0));
        for (let i = 0; i <= 40; i++) { const x = xb + (xf - xb) * i / 40, z = half + 0.004 * Math.sin(x * 90 - tt * 3) * (i > 0 && i < 40 ? 1 : 0); ctx.lineTo(X(x), Y(i === 0 ? 0 : z)); }
        ctx.quadraticCurveTo(X(xf + 0.012), Y(half * 1.4), X(xf + 0.008), Y(H));
      }
      ctx.closePath(); ctx.fill();
    }
    /* 수조, 칸막이, 표시선 */
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.beginPath();
    ctx.moveTo(X(0), Y(H + 0.03)); ctx.lineTo(X(0), Y(0)); ctx.lineTo(X(LEN), Y(0)); ctx.lineTo(X(LEN), Y(H + 0.03)); ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(0), Y(H)); ctx.lineTo(X(LEN), Y(H)); ctx.stroke();
    if (!released) { ctx.fillStyle = C.ink2; ctx.fillRect(X(GATE) - 2, Y(H + 0.025), 4, (H + 0.025) * sy); }
    else { ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(GATE), Y(H + 0.03)); ctx.lineTo(X(GATE), Y(0)); ctx.stroke(); ctx.setLineDash([]); }
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(MARK), Y(H + 0.03)); ctx.lineTo(X(MARK), Y(0)); ctx.stroke();
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillStyle = C.ink2;
    ctx.fillText(released ? "칸막이 뺌" : "칸막이", X(GATE), 14);
    ctx.fillStyle = C.warn; ctx.fillText("표시선 (30 cm)", X(MARK), 14);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`;
    ctx.textAlign = "left"; ctx.fillText(`ρ = ${st.rl.toFixed(1)}`, X(0.005), bot + 14);
    ctx.textAlign = "right"; ctx.fillText(`ρ = ${st.rr.toFixed(1)} kg/m³`, X(LEN) - 2, bot + 14);
    /* 초시계 */
    ctx.textAlign = "right"; ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.mono}`;
    ctx.fillText((run ? run.shown : 0).toFixed(2) + " s", X(LEN) - 2, 28);
    if (run && run.msg) { ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.warn; ctx.textAlign = "left"; ctx.fillText(run.msg, X(0) + 4, 28); }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 46, y0: 20, w: w - 60, h: h - 54 };
    const rows = tbl.rows.filter((r) => Number.isFinite(r.u));
    if (xKey === "g") {
      const pts = rows.map((r) => ({ x: 100 * Math.sqrt(G * Math.abs(r.dr) / 1010 * H), y: r.u }));
      const f = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y), true) : null;
      L.plot(ctx, box, { pts, fit: f, xr: [0, 22], yr: [0, 10], xlabel: "√(g′H) (cm/s)", ylabel: "앞머리 속도 u (cm/s)" });
      if (f) { ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`기울기(프루드 수) = ${f.a.toFixed(2)}`, box.x0 + 6, box.y0 + 12); }
    } else {
      const pts = rows.map((r) => ({ x: Math.abs(r.dr), y: r.u }));
      L.plot(ctx, box, { pts, model: (x) => 100 * FR * Math.sqrt(G * x / 1010 * H), xr: [0, 32], yr: [0, 10], xlabel: "|Δρ| (kg/m³)", ylabel: "앞머리 속도 u (cm/s)" });
    }
  }

  function updState() {
    $(".tl-out").textContent = sTL.value; $(".sl-out").textContent = sSL.value; $(".tr-out").textContent = sTR.value; $(".sr-out").textContent = sSR.value;
    const st = state();
    $(".th-state").textContent = Math.abs(st.d) < 0.05 ? "두 물의 밀도가 거의 같습니다. 칸막이를 빼도 흐름이 거의 생기지 않을 것입니다."
      : st.d > 0 ? "왼쪽 색 물이 더 무겁습니다. 칸막이를 빼면 어느 쪽으로 퍼질지 먼저 예상해 보세요."
        : "왼쪽 색 물이 더 가볍습니다. 칸막이를 빼면 어느 쪽으로 퍼질지 먼저 예상해 보세요.";
    run = null; draw();
  }
  function record(st, t) {
    const dr = L.measure(st.rl, { sd: 0.05, res: 0.1 }) - L.measure(st.rr, { sd: 0.05, res: 0.1 });
    return { tl: +sTL.value, sl: +sSL.value, tr: +sTR.value, sr: +sSR.value, dr, t, u: Number.isFinite(t) ? 30 / t : "—" };
  }
  function trueTime(st) { return (MARK - GATE) / st.u; }

  const presets = { cold: [5, 0, 20, 0], salt: [20, 10, 20, 0], melt: [0, 0, 20, 35], bal: [30, 10, 18, 7] };
  $(".pre").addEventListener("click", (e) => {
    const b = e.target.closest("[data-p]"); if (!b) return;
    root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    [sTL.value, sSL.value, sTR.value, sSR.value] = presets[b.dataset.p]; updState();
  });
  [sTL, sSL, sTR, sSR].forEach((el) => el.addEventListener("input", () => { root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", "false")); updState(); }));
  $(".meas").addEventListener("click", () => {
    const st = state();
    run = { t: 0, shown: 0, st, T: Math.abs(st.d) < 0.05 ? Infinity : trueTime(st), msg: "" };
  });
  $(".clear").addEventListener("click", () => tbl.clear());
  $(".xsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-x]"); if (!b) return;
    xKey = b.dataset.x; root.querySelectorAll("[data-x]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  loop($(".cv-wide"), (dt) => {
    if (run && !run.done) {
      run.t += dt * SPEED; run.shown = run.t;
      if (run.t >= run.T) {
        const tm = L.snap(run.T + 0.14 * L.gauss() + 0.14 * L.gauss(), 0.01);
        run.shown = tm; run.done = true; run.msg = "표시선 도달"; tbl.add(record(run.st, tm));
      } else if (run.t > 120) { run.done = true; run.msg = "2분이 지나도 앞머리가 움직이지 않음"; tbl.add(record(run.st, NaN)); }
    }
    draw();
  });
  updState();
  if (L.demo) {
    [[20, 2, 20, 0], [20, 5, 20, 0], [20, 10, 20, 0], [20, 20, 20, 0], [20, 35, 20, 0], [5, 0, 20, 0], [10, 0, 20, 0], [0, 0, 20, 35]].forEach((p) => {
      [sTL.value, sSL.value, sTR.value, sSR.value] = p; const st = state();
      tbl.add(record(st, L.snap(trueTime(st) + 0.2 * L.gauss(), 0.01)));
    });
    [sTL.value, sSL.value, sTR.value, sSR.value] = [20, 10, 20, 0]; updState();
    const st = state(); run = { t: trueTime(st) * 0.6, shown: trueTime(st) * 0.6, st, T: trueTime(st), done: true, msg: "" };
    draw();
  }
})();
