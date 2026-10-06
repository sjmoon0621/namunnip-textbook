/* 카드: 진동수를 바꾸면 RLC 회로의 전류는 어디에서 가장 클까? — 직렬 RLC 공진 곡선, 반전력 폭과 Q, 위상차 */
(() => {
  const root = document.getElementById("card-labphy-rlc");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sF = $(".f");
  /* 부품: [표시값, 실제값]. 코일 L = 10 mH (실제 10.3 mH, 도선 저항 8.4 Ω) — 실제값은 화면에 나오지 않음 */
  const RS = [[10, 10.0], [47, 46.8], [100, 99.6]], CS = [[0.47e-6, 0.462e-6], [1.0e-6, 0.985e-6], [2.2e-6, 2.24e-6]];
  const LN = 0.010, LT = 0.0103, RL = 8.4, V0 = 2.0;
  let ri = 0, ci = 1, view = "i", fset = null;
  const tbl = L.table($(".tbl-host"), [
    { key: "rn", label: "R (Ω)", res: 1 }, { key: "cn", label: "C (μF)", res: 0.01 }, { key: "f", label: "f (Hz)", res: 1 },
    { key: "vr", label: "V_R (V)", res: 0.001 }, { key: "i", label: "I (mA)", res: 0.1 }, { key: "ph", label: "φ (°)", res: 1 },
  ], () => { drawPlot(); analyse(); });
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());
  const vdivOf = (a) => [0.02, 0.05, 0.1, 0.2, 0.5, 1].find((d) => a <= 3.2 * d) || 1;
  const freq = () => fset || Math.round(200 * Math.pow(50, +sF.value));
  function resp(f) {
    const w = 2 * Math.PI * f, R = RS[ri][1], X = w * LT - 1 / (w * CS[ci][1]), Z = Math.hypot(R + RL, X);
    return { i: V0 / Z, vr: V0 / Z * R, ph: -Math.atan2(X, R + RL) * 180 / Math.PI };
  }
  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const f = freq(), r = resp(f);
    /* 회로: 왼쪽 위에서 시계 방향으로 R, L, C */
    const x0 = 28, x1 = w * 0.33, y0 = 40, y1 = h - 44, my = (y0 + y1) / 2;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    ctx.fillStyle = C.card;
    ctx.beginPath(); ctx.arc(x0, my, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); for (let k = 0; k <= 20; k++) { const xx = x0 - 7 + k * 0.7, yy = my - 5 * Math.sin(k / 20 * Math.PI * 2); k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke();
    const rx = (x0 + x1) / 2; ctx.fillRect(rx - 16, y0 - 7, 32, 14); ctx.strokeRect(rx - 16, y0 - 7, 32, 14);
    ctx.fillRect(x1 - 6, my - 18, 12, 36); ctx.beginPath(); ctx.moveTo(x1, my - 18); for (let k = 0; k < 4; k++) ctx.arc(x1, my - 13.5 + k * 9, 4.5, -Math.PI / 2, Math.PI / 2); ctx.lineTo(x1, my + 18); ctx.stroke();
    ctx.fillRect(rx - 6, y1 - 12, 12, 24); ctx.beginPath(); ctx.moveTo(rx - 3, y1 - 11); ctx.lineTo(rx - 3, y1 + 11); ctx.moveTo(rx + 3, y1 - 11); ctx.lineTo(rx + 3, y1 + 11); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(`${RS[ri][0]} Ω`, rx, y0 - 12); ctx.fillText(`${CS[ci][0] * 1e6} μF`, rx, y1 + 24);
    ctx.textAlign = "left"; ctx.fillText("10 mH", x1 + 9, my + 4);
    ctx.fillStyle = C.amber; ctx.textAlign = "left"; ctx.fillText("CH1", x0 + 16, my + 4);
    ctx.fillStyle = C.forest; ctx.fillText("CH2", rx + 32, y0 + 14);
    /* 오실로스코프 화면 (가로 10칸 · 두 주기) */
    const gx = w * 0.42, gy = 10, gw = w - gx - 10, gh = h - 34;
    ctx.fillStyle = C.night; ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.lineWidth = 1;
    for (let k = 1; k < 10; k++) { const x = gx + gw * k / 10; ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, gy + gh); ctx.stroke(); }
    for (let k = 1; k < 8; k++) { const y = gy + gh * k / 8; ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx + gw, y); ctx.stroke(); }
    const v2 = vdivOf(r.vr), Y = (v) => gy + gh / 2 - v * gh / 8;
    const tr = (amp, ph, col) => {
      ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath();
      for (let k = 0; k <= 200; k++) { const th = k / 200 * 4 * Math.PI, y = Y(amp * Math.sin(th + ph * Math.PI / 180)); k ? ctx.lineTo(gx + gw * k / 200, y) : ctx.moveTo(gx, y); }
      ctx.stroke();
    };
    tr(V0 / 1, 0, C.amber); tr(r.vr / v2, r.ph, "#7fd36a");
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left";
    const per = 1 / f * 2 / 10, tdiv = per >= 1e-3 ? `${+(per * 1e3).toPrecision(2)} ms` : `${+(per * 1e6).toPrecision(2)} μs`;
    ctx.fillText(`CH1 1 V/칸  CH2 ${v2} V/칸  ${tdiv}/칸`, gx, gy + gh + 14);
    $(".f-out").textContent = f;
  }
  function rowsNow() { return tbl.rows.filter((r) => r.rn === RS[ri][0] && Math.abs(r.cn - CS[ci][0] * 1e6) < 1e-6).sort((a, b) => a.f - b.f); }
  function analyse() {
    const rs = rowsNow(), th = 1 / (2 * Math.PI * Math.sqrt(LN * CS[ci][0]));
    $(".n-th").textContent = `${Math.round(th)} Hz`;
    const set = (a, b, c) => { $(".n-f0").textContent = a; $(".n-df").textContent = b; $(".n-q").textContent = c; };
    if (rs.length < 3) { set("기록 3개 이상", "—", "—"); return; }
    let k = 0; rs.forEach((r, j) => { if (r.i > rs[k].i) k = j; });
    let f0 = rs[k].f, imax = rs[k].i;
    if (k > 0 && k < rs.length - 1) {
      const [a, b, c] = [rs[k - 1], rs[k], rs[k + 1]], d = (a.f - b.f) * (a.f - c.f) * (b.f - c.f);
      const A = (c.f * (b.i - a.i) + b.f * (a.i - c.i) + a.f * (c.i - b.i)) / d, B = (c.f * c.f * (a.i - b.i) + b.f * b.f * (c.i - a.i) + a.f * a.f * (b.i - c.i)) / d;
      if (A < 0) { const fv = -B / (2 * A); if (fv > a.f && fv < c.f) { f0 = fv; imax = Math.max(imax, A * (fv * fv - b.f * b.f) + B * (fv - b.f) + b.i); } }
    }
    const ih = imax / Math.SQRT2;
    let fl = NaN, fh = NaN;
    for (let j = k; j > 0; j--) if (rs[j - 1].i < ih) { fl = rs[j - 1].f + (ih - rs[j - 1].i) / (rs[j].i - rs[j - 1].i) * (rs[j].f - rs[j - 1].f); break; }
    for (let j = k; j < rs.length - 1; j++) if (rs[j + 1].i < ih) { fh = rs[j].f + (rs[j].i - ih) / (rs[j].i - rs[j + 1].i) * (rs[j + 1].f - rs[j].f); break; }
    const df = fh - fl;
    set(`${Math.round(f0)} Hz`, Number.isFinite(df) ? `${Math.round(df)} Hz` : "양쪽을 더 재세요", Number.isFinite(df) ? (f0 / df).toFixed(1) : "—");
  }
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const now = new Set(rowsNow()), key = view === "i" ? "i" : "ph";
    const all = tbl.rows.map((r) => ({ x: r.f / 1000, y: r[key] }));
    const xs = all.map((p) => p.x), ys = all.map((p) => p.y);
    const xr = [0, Math.max(2, ...xs) * 1.05], yr = view === "i" ? [0, Math.max(10, ...ys) * 1.1] : [-90, 90];
    const box = { x0: 50, y0: 18, w: w - 64, h: h - 52 }, lab = { xr, yr, xlabel: "f (kHz)", ylabel: view === "i" ? "I (mA)" : "φ (°)" };
    L.plot(ctx, box, { ...lab, pts: tbl.rows.filter((r) => !now.has(r)).map((r) => ({ x: r.f / 1000, y: r[key] })), color: "#b9bbbf" });
    L.plot(ctx, box, { ...lab, pts: [...now].map((r) => ({ x: r.f / 1000, y: r[key] })) });
  }
  function record() {
    const f = freq(), r = resp(f), vr = L.measure(r.vr, { rel: 0.012, res: vdivOf(r.vr) / 25 });
    tbl.add({ rn: RS[ri][0], cn: CS[ci][0] * 1e6, f, vr, i: vr / RS[ri][0] * 1000, ph: L.measure(r.ph, { sd: 2, res: 1 }) });
  }
  const group = (sel, cb) => root.querySelectorAll(`${sel} .chip`).forEach((b) => b.addEventListener("click", () => {
    cb(+b.dataset.i); root.querySelectorAll(`${sel} .chip`).forEach((c) => c.setAttribute("aria-pressed", String(c === b))); draw(); drawPlot(); analyse();
  }));
  group(".rr", (i) => { ri = i; }); group(".cc", (i) => { ci = i; });
  root.querySelectorAll(".view .chip").forEach((b) => b.addEventListener("click", () => {
    view = b.dataset.v; root.querySelectorAll(".view .chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b))); drawPlot();
  }));
  sF.addEventListener("input", () => { fset = null; draw(); });
  $(".rec").addEventListener("click", record);
  $(".clear").addEventListener("click", () => tbl.clear());
  const setF = (f) => { sF.value = Math.log(f / 200) / Math.log(50); fset = f; };
  draw(); analyse();
  if (L.demo) {
    ri = 2; [600, 1000, 1300, 1500, 1600, 1700, 2000, 2600, 3500].forEach((f) => { setF(f); record(); });
    ri = 0; [500, 800, 1000, 1200, 1350, 1450, 1500, 1540, 1580, 1620, 1660, 1720, 1800, 2000, 2400, 3000, 4000, 6000].forEach((f) => { setF(f); record(); });
    setF(1450); draw(); drawPlot(); analyse();
  }
})();
