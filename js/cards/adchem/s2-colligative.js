/* 카드: 왜 어는점은 끓는점보다 크게 움직일까? — 상평형 그림으로 보는 총괄성 */
(() => {
  const root = document.getElementById("card-adchem-colligative");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sM = $(".m"), cbMeas = $(".meas");
  const R = 8.314, MW = 0.018015, HF = 6010, T0 = 273.15, PATM = 101.325;
  const SOL = { glu: { n: "포도당", i: 1, im: 1 }, nacl: { n: "NaCl", i: 2, im: 1.9 }, mgso4: { n: "MgSO₄", i: 2, im: 1.3 }, mgcl2: { n: "MgCl₂", i: 3, im: 2.7 } };
  let sol = "nacl";

  /* 물의 증기압 (kPa), t: °C — 앙투안 식 */
  const Pl = (t) => Math.pow(10, 8.07131 - 1730.63 / (233.426 + t)) * 0.133322;
  /* 얼음의 증기압: ln P_s = ln P_l − (ΔH_fus/R)(1/T − 1/T0) */
  const Ps = (t) => Pl(t) * Math.exp(-HF / R * (1 / (t + 273.15) - 1 / T0));

  function state() {
    const m = +sM.value, s = SOL[sol], i = cbMeas.checked ? s.im : s.i;
    const x = 1 / (1 + i * m * MW);
    const Tf = 1 / (1 / T0 - R * Math.log(x) / HF) - 273.15;
    let a = 99, b = 115; for (let k = 0; k < 60; k++) { const c = (a + b) / 2; if (x * Pl(c) < PATM) a = c; else b = c; }
    return { m, i, x, Tf, Tb: (a + b) / 2 };
  }

  const { ctx, size } = fit(cv, () => draw());

  function panel(o) {
    const { x0, x1, y0, y1, tx, py, log } = o;
    const X = (t) => x0 + (t - tx[0]) / (tx[1] - tx[0]) * (x1 - x0);
    const Y = log ? (p) => y0 - (Math.log10(p) - Math.log10(py[0])) / (Math.log10(py[1]) - Math.log10(py[0])) * (y0 - y1)
      : (p) => y0 - (p - py[0]) / (py[1] - py[0]) * (y0 - y1);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y1, x1 - x0, y0 - y1);
    NM.axes(ctx, { x0, y0: y1, w: x1 - x0, h: y0 - y1, xt: o.xt, yt: o.yt, X, Y, xlabel: o.xl, ylabel: o.yl });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    ctx.restore();
    return { X, Y };
  }
  function path(X, Y, f, t0, t1, box, col, lw, dash) {
    ctx.save(); ctx.beginPath(); ctx.rect(box[0], box[1], box[2] - box[0], box[3] - box[1]); ctx.clip();
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath();
    for (let k = 0; k <= 200; k++) { const t = t0 + (t1 - t0) * k / 200, px = X(t), pyv = Y(f(t)); k ? ctx.lineTo(px, pyv) : ctx.moveTo(px, pyv); }
    ctx.stroke(); ctx.restore();
  }
  const dot = (x, y, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); };
  const BLUE = "#3f6fa3", SOLC = "#b5532f", ICE = "#5aa6c8";

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = state(), solF = (t) => s.x * Pl(t);
    ctx.font = `10.5px ${F.sans}`;
    /* 위: 전체 상평형 그림 */
    const A = { x0: 46, x1: w - 12, y1: 22, y0: h * 0.5 - 22 };
    const top = panel({ ...A, tx: [-20, 120], py: [0.08, 300], log: true, xt: [[-20, "−20"], [0, "0"], [20, "20"], [40, "40"], [60, "60"], [80, "80"], [100, "100"], [120, "120"]], yt: [[0.1, "0.1"], [1, "1"], [10, "10"], [100, "100"]], xl: "온도 (°C)", yl: "압력 (kPa, 로그 눈금)" });
    const boxA = [A.x0, A.y1, A.x1, A.y0];
    ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(A.x0, top.Y(PATM)); ctx.lineTo(A.x1, top.Y(PATM)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("1 atm", A.x0 + 4, top.Y(PATM) - 4);
    path(top.X, top.Y, Ps, -20, 0, boxA, ICE, 2);
    path(top.X, top.Y, Pl, 0, 120, boxA, BLUE, 2);
    ctx.strokeStyle = ICE; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(top.X(0), top.Y(Pl(0))); ctx.lineTo(top.X(-0.05), A.y1); ctx.stroke();
    if (s.m > 0) {
      path(top.X, top.Y, solF, s.Tf, 120, boxA, SOLC, 2);
      ctx.strokeStyle = SOLC; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(top.X(s.Tf), top.Y(Ps(s.Tf))); ctx.lineTo(top.X(s.Tf), A.y1); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.fillStyle = ICE; ctx.fillText("얼음", top.X(-17), top.Y(Ps(-10)) - 30);
    ctx.fillStyle = BLUE; ctx.fillText("물(액체)", top.X(30), top.Y(30));
    ctx.fillStyle = C.ink2; ctx.fillText("수증기", top.X(60), top.Y(1.2));
    ctx.textAlign = "right"; ctx.fillStyle = BLUE; ctx.fillText("순수한 물", A.x1 - 4, A.y0 - 20);
    ctx.fillStyle = SOLC; ctx.fillText(`${SOL[sol].n} 수용액`, A.x1 - 4, A.y0 - 6);

    /* 아래 왼쪽: 어는점 확대 */
    const half = (w - 12) / 2;
    const Bf = { x0: 46, x1: half - 8, y1: h * 0.5 + 26, y0: h - 34 };
    const fz = panel({ ...Bf, tx: [-10, 1], py: [0.25, 0.66], xt: [[-10, "−10"], [-8, "−8"], [-6, "−6"], [-4, "−4"], [-2, "−2"], [0, "0"]], yt: [[0.3, "0.3"], [0.4, "0.4"], [0.5, "0.5"], [0.6, "0.6"]], xl: "°C", yl: "어는점 부근 (kPa)" });
    const boxF = [Bf.x0, Bf.y1, Bf.x1, Bf.y0];
    path(fz.X, fz.Y, Ps, -10, 1, boxF, ICE, 2);
    path(fz.X, fz.Y, Pl, -10, 1, boxF, BLUE, 1.6, [4, 3]);
    if (s.m > 0) path(fz.X, fz.Y, solF, -10, 1, boxF, SOLC, 2);
    dot(fz.X(0), fz.Y(Pl(0)), BLUE);
    if (s.Tf > -10) { dot(fz.X(s.Tf), fz.Y(Ps(s.Tf)), SOLC); ctx.fillStyle = SOLC; ctx.textAlign = "left"; ctx.fillText(`${s.Tf.toFixed(2)} °C`, Math.min(fz.X(s.Tf) + 6, Bf.x1 - 60), fz.Y(Ps(s.Tf)) + 14); }
    ctx.fillStyle = ICE; ctx.textAlign = "left"; ctx.fillText("얼음", fz.X(-5), fz.Y(Ps(-5)) + 16);

    /* 아래 오른쪽: 끓는점 확대 */
    const Bb = { x0: half + 40, x1: w - 12, y1: h * 0.5 + 26, y0: h - 34 };
    const bz = panel({ ...Bb, tx: [99, 104], py: [92, 112], xt: [[99, "99"], [100, "100"], [101, "101"], [102, "102"], [103, "103"], [104, "104"]], yt: [[95, "95"], [100, "100"], [105, "105"], [110, "110"]], xl: "°C", yl: "끓는점 부근 (kPa)" });
    const boxB = [Bb.x0, Bb.y1, Bb.x1, Bb.y0];
    ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(Bb.x0, bz.Y(PATM)); ctx.lineTo(Bb.x1, bz.Y(PATM)); ctx.stroke(); ctx.setLineDash([]);
    path(bz.X, bz.Y, Pl, 99, 104, boxB, BLUE, 2);
    if (s.m > 0) path(bz.X, bz.Y, solF, 99, 104, boxB, SOLC, 2);
    dot(bz.X(100), bz.Y(PATM), BLUE);
    if (s.Tb < 104) { dot(bz.X(s.Tb), bz.Y(PATM), SOLC); ctx.fillStyle = SOLC; ctx.textAlign = "left"; ctx.fillText(`${s.Tb.toFixed(2)} °C`, Math.min(bz.X(s.Tb) + 6, Bb.x1 - 60), bz.Y(PATM) + 16); }
  }

  function update() {
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === sol)));
    const s = state();
    $(".m-out").textContent = s.m.toFixed(2);
    $(".n-i").textContent = `${s.i} · ${s.x.toFixed(4)}`;
    $(".n-p").textContent = `${((1 - s.x) * Pl(25) * 1000).toFixed(0)} Pa (P° = ${(Pl(25) * 1000).toFixed(0)} Pa)`;
    $(".n-f").textContent = `${s.Tf.toFixed(2)} °C / ${(-1.86 * s.i * s.m).toFixed(2)} °C`;
    $(".n-b").textContent = `${s.Tb.toFixed(2)} °C / ${(100 + 0.512 * s.i * s.m).toFixed(2)} °C`;
    const pi = s.i * s.m * 0.08206 * 298.15;
    $(".n-o").textContent = `${pi.toFixed(1)} atm`;
    draw();
  }
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { sol = b.dataset.s; update(); }));
  sM.addEventListener("input", update); cbMeas.addEventListener("change", update);
  update();
})();
