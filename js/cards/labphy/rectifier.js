/* 카드: 교류를 매끈한 직류로 바꾸려면? — 반파·브리지 전파 정류, 평활 축전기, 리플 ΔV ≈ V_p/(f_r R_L C) */
(() => {
  const root = document.getElementById("card-labphy-rectifier");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const VP = 6.0 * Math.SQRT2, FQ = 60, VD = 0.7, RS = 1.0, NS = 400;
  let ckt = "full", cap = 100, rl = 1000, zoom = false, wave = null;
  const tbl = L.table($(".tbl-host"), [
    { key: "k", label: "회로" }, { key: "c", label: "C (μF)", res: 1 }, { key: "r", label: "R_L (Ω)", res: 1 },
    { key: "vp", label: "V_p (V)", res: 0.01 }, { key: "dc", label: "평균 (V)", res: 0.01 }, { key: "rp", label: "ΔV (V)", res: 0.01 }, { key: "ap", label: "근사 (V)", res: 0.01 },
  ], () => drawPlot());
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());
  /* 시간 영역 계산: 10주기 돌려 정상 상태를 만든 뒤 3주기를 저장 */
  function simulate() {
    const dt = 1 / FQ / NS, Cf = cap * 1e-6, full = ckt === "full", drop = full ? 2 * VD : VD;
    let vc = 0;
    const ts = [], vin = [], vout = [];
    for (let n = 0; n < NS * 13; n++) {
      const t = n * dt, vs = VP * Math.sin(2 * Math.PI * FQ * t), vr = Math.max(0, (full ? Math.abs(vs) : vs) - drop);
      if (!cap) vc = vr * rl / (rl + RS);
      else {
        vc *= Math.exp(-dt / (rl * Cf));
        if (vr > vc) vc += (vr - vc) * (1 - Math.exp(-dt / (RS * Cf)));
      }
      if (n >= NS * 10) { ts.push((n - NS * 10) * dt * 1000); vin.push(vs); vout.push(vc); }
    }
    const mx = Math.max(...vout), mn = Math.min(...vout.slice(NS)), mean = vout.reduce((s, v) => s + v, 0) / vout.length;
    return { ts, vin, vout, mx, mn, mean };
  }
  function diode(ctx, ax, ay, bx, by) {
    const mx = (ax + bx) / 2, my = (ay + by) / 2, d = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / d, uy = (by - ay) / d, nx = -uy, ny = ux, s = 6;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath();
    ctx.moveTo(mx + ux * s, my + uy * s); ctx.lineTo(mx - ux * s + nx * s, my - uy * s + ny * s); ctx.lineTo(mx - ux * s - nx * s, my - uy * s - ny * s); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(mx + ux * s + nx * s, my + uy * s + ny * s); ctx.lineTo(mx + ux * s - nx * s, my + uy * s - ny * s); ctx.stroke();
  }
  function circuit(ctx, x0, x1, y0, y1) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
    const my = (y0 + y1) / 2, xc = x1 - 44, xr = x1;
    /* 변압기 2차 코일 (왼쪽) */
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, my - 20);
    for (let k = 0; k < 4; k++) ctx.arc(x0, my - 15 + k * 10, 5, -Math.PI / 2, Math.PI / 2);
    ctx.moveTo(x0, my + 20); ctx.lineTo(x0, y1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0 - 10, my - 22); ctx.lineTo(x0 - 10, my + 22); ctx.moveTo(x0 - 13, my - 22); ctx.lineTo(x0 - 13, my + 22); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("6 V~ 60 Hz", x0 - 16, y1 + 14);
    if (ckt === "half") {
      diode(ctx, x0, y0, xc, y0);
      ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(xr, y1); ctx.moveTo(xc, y0); ctx.lineTo(xr, y0); ctx.stroke();
    } else {
      const dx = (x0 + xc) / 2 + 4, s = Math.min(34, (y1 - y0) / 2 - 6), T = [dx, my - s], B = [dx, my + s], Lf = [dx - s, my], Rt = [dx + s, my];
      diode(ctx, ...Lf, ...T); diode(ctx, ...T, ...Rt); diode(ctx, ...Lf, ...B); diode(ctx, ...B, ...Rt);
      ctx.beginPath();
      ctx.moveTo(x0, y0); ctx.lineTo(dx, y0); ctx.lineTo(...T);
      ctx.moveTo(x0, y1); ctx.lineTo(x0 + 8, y1); ctx.lineTo(x0 + 8, B[1] + 14); ctx.lineTo(dx, B[1] + 14); ctx.lineTo(...B);
      ctx.moveTo(...Rt); ctx.lineTo(Rt[0] + 8, my); ctx.lineTo(Rt[0] + 8, y0 + 0); ctx.lineTo(xr, y0);
      ctx.moveTo(...Lf); ctx.lineTo(Lf[0], y1); ctx.lineTo(xr, y1);
      ctx.stroke();
      ctx.fillStyle = C.warn; ctx.fillText("+", Rt[0] + 11, my - 4);
    }
    /* 평활 축전기와 부하 */
    ctx.strokeStyle = C.ink;
    ctx.beginPath(); ctx.moveTo(xr, y0); ctx.lineTo(xr, my - 14); ctx.moveTo(xr, my + 14); ctx.lineTo(xr, y1); ctx.stroke();
    ctx.fillStyle = C.card; ctx.fillRect(xr - 6, my - 14, 12, 28); ctx.strokeRect(xr - 6, my - 14, 12, 28);
    if (cap) {
      ctx.beginPath(); ctx.moveTo(xc, y0); ctx.lineTo(xc, my - 3); ctx.moveTo(xc - 10, my - 3); ctx.lineTo(xc + 10, my - 3); ctx.moveTo(xc - 10, my + 3); ctx.lineTo(xc + 10, my + 3); ctx.moveTo(xc, my + 3); ctx.lineTo(xc, y1); ctx.stroke();
    }
    ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText(cap ? `${cap}μF` : "C 없음", xc, y1 + 14); ctx.fillText(rl >= 1000 ? `${rl / 1000}kΩ` : `${rl}Ω`, xr, y1 + 26);
  }
  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    circuit(ctx, 26, w * 0.4, 30, h - 46);
    const gx = w * 0.46 + 24, gy = 16, gw = w - gx - 10, gh = h - 46;
    const X = (t) => gx + t / 50 * gw;
    let y0v = -10, y1v = 10;
    if (zoom) { const half = Math.max(0.1, (wave.mx - wave.mn) * 0.7); y0v = -half; y1v = half; }
    const Y = (v) => gy + gh - (v - y0v) / (y1v - y0v) * gh;
    NM.axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [0, 10, 20, 30, 40, 50].map((v) => [v, String(v)]), yt: L.ticks(y0v, y1v, 4).map((v) => [v, String(+v.toPrecision(3))]), xlabel: "t (ms)", ylabel: zoom ? "출력 − 평균 (V)" : "V (V)" });
    ctx.save(); ctx.beginPath(); ctx.rect(gx, gy, gw, gh); ctx.clip();
    const line = (arr, off, col, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); wave.ts.forEach((t, i) => (i ? ctx.lineTo(X(t), Y(arr[i] - off)) : ctx.moveTo(X(t), Y(arr[i] - off)))); ctx.stroke(); };
    const mid = (wave.mx + wave.mn) / 2;
    if (!zoom) line(wave.vin, 0, C.amber, 1.2);
    line(wave.vout, zoom ? mid : 0, C.forest, 1.8);
    ctx.restore();
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillStyle = C.forest; ctx.fillText(zoom ? "출력 리플 (AC 결합)" : "출력", gx + gw, gy - 5);
    if (!zoom) { ctx.fillStyle = C.amber; ctx.fillText("입력", gx + gw - 34, gy - 5); }
  }
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const pts = tbl.rows.filter((r) => r.c > 0).map((r) => ({ x: r.ap, y: r.rp }));
    const mx = Math.min(15, Math.max(1, ...pts.map((p) => Math.max(p.x, p.y))) * 1.1);
    L.plot(ctx, { x0: 50, y0: 18, w: w - 64, h: h - 52 }, { pts, model: (x) => x, xr: [0, mx], yr: [0, mx], xlabel: "근사 V_p/(f_r R_L C) (V)", ylabel: "잰 ΔV (V)" });
  }
  function update() {
    wave = simulate();
    $(".n-fr").textContent = cap ? `${ckt === "full" ? 120 : 60} Hz` : "—";
    draw();
  }
  function record() {
    const vp = L.measure(wave.mx, { sd: 0.02, res: 0.01 }), rp = L.measure(wave.mx - wave.mn, { sd: 0.01, rel: 0.02, res: 0.01 }), dc = L.measure(wave.mean, { sd: 0.005, res: 0.01 });
    const fr = ckt === "full" ? 120 : 60;
    tbl.add({ k: ckt === "full" ? "전파" : "반파", c: cap, r: rl, vp, dc, rp, ap: cap ? vp / (fr * rl * cap * 1e-6) : NaN });
    $(".n-dc").textContent = `${dc.toFixed(2)} V`; $(".n-rp").textContent = `${rp.toFixed(2)} V`;
  }
  const group = (sel, attr, cb) => root.querySelectorAll(`${sel} .chip`).forEach((b) => b.addEventListener("click", () => {
    cb(b.dataset[attr]); root.querySelectorAll(`${sel} .chip`).forEach((c) => c.setAttribute("aria-pressed", String(c === b))); update();
  }));
  group(".ckt", "k", (v) => { ckt = v; }); group(".cap", "c", (v) => { cap = +v; }); group(".load", "r", (v) => { rl = +v; });
  $(".zoom").addEventListener("click", (e) => { zoom = !zoom; e.currentTarget.setAttribute("aria-pressed", String(zoom)); draw(); });
  $(".rec").addEventListener("click", record);
  $(".clear").addEventListener("click", () => tbl.clear());
  update();
  if (L.demo) {
    rl = 1000;
    ["half", "full"].forEach((k) => { ckt = k; [0, 10, 47, 100, 470].forEach((c) => { cap = c; update(); record(); }); });
    cap = 100; [220, 470, 2200, 4700].forEach((r) => { rl = r; update(); record(); });
    ckt = "full"; cap = 100; rl = 1000; update(); record();
  }
})();
