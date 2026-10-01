/* 카드: 큰 달걀은 얼마나 더 오래 삶아야 할까? — 구 열전도 수치 계산, 노른자 가운데 63 °C 도달 시간, t ∝ d² */
(() => {
  const root = document.getElementById("card-sie2-egg");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sD = $(".d"), sW = $(".tw"), cold = $(".cold");
  const ALPHA = 1.4e-7, SET = 63, N = 24;
  let useD2 = false, cook = null;

  /* 구 열전도 (양함수 차분). 반환: 반지름 방향 온도 배열을 시간마다 담은 기록과 63 °C 도달 시간 */
  function simulate(dmm, tw, t0) {
    const R = dmm / 2000, dr = R / N, dt = 0.2 * dr * dr / ALPHA;
    let T = new Array(N + 1).fill(t0); T[N] = tw;
    const frames = [{ t: 0, T: T.slice() }];
    let t = 0, hit = null, next = 10;
    while (t < 3600) {
      const U = T.slice();
      U[0] = T[0] + ALPHA * dt * 6 * (T[1] - T[0]) / (dr * dr);   // 중심 (대칭)
      for (let i = 1; i < N; i++) {
        const r = i * dr;
        U[i] = T[i] + ALPHA * dt * ((T[i + 1] - 2 * T[i] + T[i - 1]) / (dr * dr) + (T[i + 1] - T[i - 1]) / (r * dr));
      }
      U[N] = tw; T = U; t += dt;
      if (hit === null && T[0] >= SET) hit = t;
      if (t >= next) { frames.push({ t, T: T.slice() }); next += 10; }
      if (hit !== null && t > hit + 30) break;
    }
    return { frames, hit };
  }

  const tbl = L.table($(".tbl-host"), [
    { key: "d", label: "d (mm)", res: 1 }, { key: "t0", label: "처음 (°C)", res: 1 }, { key: "tw", label: "물 (°C)", res: 1 }, { key: "min", label: "t (분)", res: 0.01 },
  ], () => drawPlot());
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const col = (T) => { const u = Math.max(0, Math.min(1, (T - 4) / 96)); return `rgb(${Math.round(70 + 185 * u)},${Math.round(120 + 40 * Math.sin(u * Math.PI))},${Math.round(220 - 190 * u)})`; };

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const d = +sD.value, t0 = cold.checked ? 4 : 20, tw = +sW.value;
    const fr = cook ? cook.sim.frames[Math.min(cook.sim.frames.length - 1, Math.floor(cook.t / 10))] : { t: 0, T: new Array(N + 1).fill(t0) };
    // 냄비 물
    const cx = w * 0.24, cy = h * 0.52, Rp = Math.min(w * 0.2, h * 0.42) * d / 52;
    ctx.fillStyle = "rgba(110,164,230,.18)"; ctx.fillRect(10, cy - h * 0.45, w * 0.46, h * 0.9);
    // 단면: 바깥 고리부터 칠하기
    for (let i = N; i >= 0; i--) { ctx.fillStyle = col(fr.T[i]); ctx.beginPath(); ctx.arc(cx, cy, Rp * (i + 0.5) / (N + 0.5), 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = "#f2e6c9"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([3, 3]); ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, Rp * 0.55, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillStyle = C.ink2; ctx.fillText("점선: 노른자 경계 · 점: 탐침", cx, h - 6);
    // 가운데 온도–시간
    const gx = w * 0.56, gy = 18, gw = w - gx - 12, gh = h - 46;
    const X = (t) => gx + t / 1200 * gw, Y = (T) => gy + gh - (T - 0) / 105 * gh;
    NM.axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [0, 5, 10, 15, 20].map((m) => [m * 60, String(m)]), yt: [0, 50, 100].map((v) => [v, String(v)]), xlabel: "분", ylabel: "가운데 온도 (°C)" });
    ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(gx, Y(SET)); ctx.lineTo(gx + gw, Y(SET)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.textAlign = "left"; ctx.fillText("63 °C", gx + 4, Y(SET) - 4);
    if (cook) {
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1.8; ctx.beginPath();
      cook.sim.frames.forEach((f, i) => { if (f.t > cook.t) return; i ? ctx.lineTo(X(f.t), Y(f.T[0])) : ctx.moveTo(X(f.t), Y(f.T[0])); }); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.mono}`; ctx.textAlign = "right";
      ctx.fillText(`${Math.floor(cook.t / 60)}분 ${String(Math.floor(cook.t % 60)).padStart(2, "0")}초 · ${fr.T[0].toFixed(1)} °C`, gx + gw, gy - 6);
    }
  }
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const t0 = cold.checked ? 4 : 20, tw = +sW.value;
    const same = tbl.rows.filter((r) => r.t0 === t0 && r.tw === tw);
    const xv = (r) => (useD2 ? r.d * r.d : r.d);
    const pts = tbl.rows.map((r) => ({ x: xv(r), y: r.min }));
    const f = useD2 && same.length > 1 ? L.linfit(same.map(xv), same.map((r) => r.min), true) : null;
    L.plot(ctx, { x0: 44, y0: 18, w: w - 58, h: h - 52 }, { pts, fit: f, xr: useD2 ? [0, 2800] : [30, 55], yr: [0, 20], xlabel: useD2 ? "d² (mm²)" : "d (mm)", ylabel: "t (분)" });
    if (f) { ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`지금 조건의 기울기 ${(f.a * 1000).toFixed(2)} 분/1000 mm²`, 50, 30); }
  }
  function start() {
    const d = +sD.value, t0 = cold.checked ? 4 : 20, tw = +sW.value;
    const sim = simulate(d, tw, t0);
    const meas = L.snap(sim.hit * (1 + 0.025 * L.gauss()) / 60, 0.01);   // 달걀마다 모양·노른자 위치 차이
    cook = { sim, t: 0, rec: { d, t0, tw, min: meas }, done: false };
  }
  loop($(".cv-wide"), (dt) => {
    if (cook && !cook.done) { cook.t += dt * 90; if (cook.t >= cook.sim.hit) { cook.t = cook.sim.hit; cook.done = true; tbl.add(cook.rec); } }
    drawApp();
  });
  const upd = () => { $(".d-out").textContent = sD.value; $(".w-out").textContent = sW.value; drawApp(); drawPlot(); };
  [sD, sW].forEach((el) => el.addEventListener("input", upd)); cold.addEventListener("change", upd);
  $(".cook").addEventListener("click", start);
  $(".clear").addEventListener("click", () => { cook = null; tbl.clear(); drawApp(); });
  $(".axis").addEventListener("click", (e) => { useD2 = !useD2; e.currentTarget.setAttribute("aria-pressed", String(useD2)); drawPlot(); });
  upd();
  if (L.demo) { [36, 40, 44, 48, 52].forEach((d) => { sD.value = d; start(); tbl.add(cook.rec); }); cook.t = cook.sim.hit; cook.done = true; sD.value = 43; $(".d-out").textContent = 43; $(".axis").click(); }
})();
