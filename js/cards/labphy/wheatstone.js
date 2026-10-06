/* 카드: 미터 브리지 — 접점을 옮기며 검류계 전류 측정, Ig–L₁ 직선의 영점으로 평형점, Rx = R·L₁/L₂, 좌우 바꾸기로 끝 보정 */
(() => {
  const root = document.getElementById("card-labphy-wheatstone");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sL = $(".l");
  const E = 2.0, RS = 8, RHO = 0.02, END1 = 0.012, END2 = 0.006, RG = 50, RP = 1000, GMAX = 50;
  const XS = [{ name: "X₁", R: 27.4 }, { name: "X₂", R: 6.80 }, { name: "X₃", R: 152 }];
  const RBOX = [2, 5, 10, 20, 50, 100, 200];
  let xi = 0, R = 20, swap = false, prot = true, mmText = "";

  const rh = $(".rs");
  RBOX.forEach((v) => rh.insertAdjacentHTML("beforeend", `<button class="chip" type="button" data-r="${v}" aria-pressed="${v === R}">${v} Ω</button>`));

  /* 마디 해석: A(왼쪽 끝), B(틈 사이 단자), D(접점), C(오른쪽 끝, 0 V). 검류계 전류 B→D (μA) */
  function ig(L1) {
    const Rx = XS[xi].R, rl = swap ? R : Rx, rr = swap ? Rx : R;
    const gAB = 1 / rl, gBC = 1 / rr, gAD = 1 / (END1 + RHO * L1), gDC = 1 / (END2 + RHO * (100 - L1)), gBD = 1 / (RG + (prot ? RP : 0)), gs = 1 / RS;
    const M = [[gs + gAB + gAD, -gAB, -gAD], [-gAB, gAB + gBC + gBD, -gBD], [-gAD, -gBD, gAD + gBD + gDC]], b = [E * gs, 0, 0];
    for (let c = 0; c < 3; c++) for (let r = c + 1; r < 3; r++) { const f = M[r][c] / M[c][c]; for (let k = c; k < 3; k++) M[r][k] -= f * M[c][k]; b[r] -= f * b[c]; }
    const v = [0, 0, 0];
    for (let r = 2; r >= 0; r--) { let s = b[r]; for (let k = r + 1; k < 3; k++) s -= M[r][k] * v[k]; v[r] = s / M[r][r]; }
    return (v[1] - v[2]) * gBD * 1e6;
  }
  const readG = (L1) => { const t = ig(L1); return Math.abs(t) > GMAX ? Math.sign(t) * GMAX : L.measure(t, { sd: 0.3, res: 1 }); };
  const balance = () => { let lo = 0.5, hi = 99.5; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (Math.sign(ig(m)) === Math.sign(ig(lo))) lo = m; else hi = m; } return (lo + hi) / 2; };
  const cond = () => `${XS[xi].name}|${R}|${swap}|${prot}`;

  const tbl = L.table($(".tbl-host"), [{ key: "x", label: "미지" }, { key: "R", label: "R (Ω)", res: 1 }, { key: "pos", label: "Rx 위치" }, { key: "pr", label: "보호" }, { key: "l", label: "L₁ (cm)", res: 0.1 }, { key: "g", label: "Ig (μA)", res: 1 }], () => { draw(); drawPlot(); });
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());
  let gNow = 0;

  function resistor(ctx, x0, x1, y, label, col) {
    ctx.fillStyle = col; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
    const xm = (x0 + x1) / 2; ctx.fillRect(xm - 16, y - 6, 32, 12); ctx.strokeRect(xm - 16, y - 6, 32, 12);
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(xm - 16, y); ctx.moveTo(xm + 16, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(label, xm, y - 12);
  }
  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 28, x1 = w - 28, yw = h * 0.6, ys = h * 0.2, X = (c) => x0 + (x1 - x0) * c / 100, L1 = +sL.value, xd = X(L1);
    ctx.fillStyle = "#e6d3b3"; ctx.fillRect(x0 - 14, ys - 18, x1 - x0 + 28, yw - ys + 46);
    // 구리판
    const g1 = [x0 + (x1 - x0) * 0.16, x0 + (x1 - x0) * 0.38], g2 = [x0 + (x1 - x0) * 0.62, x0 + (x1 - x0) * 0.84];
    ctx.fillStyle = "#c27c3e";
    ctx.fillRect(x0 - 6, ys - 4, g1[0] - x0 + 6, 8); ctx.fillRect(x0 - 6, ys - 4, 8, yw - ys + 4);
    ctx.fillRect(g1[1], ys - 4, g2[0] - g1[1], 8);
    ctx.fillRect(g2[1], ys - 4, x1 + 6 - g2[1], 8); ctx.fillRect(x1 - 2, ys - 4, 8, yw - ys + 4);
    const Rx = XS[xi].name;
    resistor(ctx, g1[0], g1[1], ys, swap ? `R = ${R} Ω` : `Rx (${Rx})`, swap ? "#d8c49a" : "#b7d0e6");
    resistor(ctx, g2[0], g2[1], ys, swap ? `Rx (${Rx})` : `R = ${R} Ω`, swap ? "#b7d0e6" : "#d8c49a");
    // 저항선과 눈금
    ctx.strokeStyle = "#6d6f72"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, yw); ctx.lineTo(x1, yw); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `9px ${F.mono}`; ctx.textAlign = "center";
    for (let c = 0; c <= 100; c += 5) { const x = X(c); ctx.fillRect(x, yw + 4, 1, c % 10 ? 3 : 6); if (c % 20 === 0 && c && c < 100) ctx.fillText(c, x, yw + 18); }
    // 검류계: B(가운데 구리판) — G — 접점 D
    const xb = (g1[1] + g2[0]) / 2, gy = (ys + yw) / 2 + 2;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(xb, ys + 4); ctx.lineTo(xb, gy - 15); ctx.moveTo(xb, gy + 15); ctx.lineTo(xd, yw - 12); ctx.stroke();
    ctx.fillStyle = "#3a3c3b"; ctx.beginPath(); ctx.moveTo(xd - 4, yw - 14); ctx.lineTo(xd + 4, yw - 14); ctx.lineTo(xd, yw - 1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.card; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(xb, gy, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const a = clamp(gNow / GMAX, -1, 1) * 1.0;
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(xb, gy + 6, 13, -Math.PI / 2 - 1, -Math.PI / 2 + 1); ctx.stroke();
    ctx.strokeStyle = C.apple; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xb, gy + 6); ctx.lineTo(xb + 13 * Math.sin(a), gy + 6 - 13 * Math.cos(a)); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `600 9px ${F.sans}`; ctx.fillText("G", xb, gy + 13);
    if (prot) { ctx.fillStyle = C.warn; ctx.font = `9px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("보호 1 kΩ", xb + 20, gy - 4); }
    // L1, L2 화살표
    const ya = yw + 30; ctx.strokeStyle = C.forest; ctx.fillStyle = C.forest; ctx.lineWidth = 1;
    const arrow = (xa, xb2, lab) => { ctx.beginPath(); ctx.moveTo(xa, ya); ctx.lineTo(xb2, ya); ctx.stroke(); [xa, xb2].forEach((x) => { ctx.beginPath(); ctx.moveTo(x, ya - 4); ctx.lineTo(x, ya + 4); ctx.stroke(); }); if (xb2 - xa > 50) { ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillStyle = C.card; const tw = ctx.measureText(lab).width; ctx.fillRect((xa + xb2) / 2 - tw / 2 - 3, ya - 7, tw + 6, 13); ctx.fillStyle = C.forest; ctx.fillText(lab, (xa + xb2) / 2, ya + 4); } };
    arrow(X(0), xd, `L₁ = ${L1.toFixed(1)}`); arrow(xd, X(100), `L₂ = ${(100 - L1).toFixed(1)}`);
    // 전원
    const yb = h - 12, xm = (x0 + x1) / 2;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(x0 - 6, yw); ctx.lineTo(x0 - 6, yb); ctx.lineTo(xm - 8, yb); ctx.moveTo(xm + 8, yb); ctx.lineTo(x1 + 6, yb); ctx.lineTo(x1 + 6, yw); ctx.stroke();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xm - 4, yb - 8); ctx.lineTo(xm - 4, yb + 8); ctx.stroke(); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(xm + 4, yb - 4); ctx.lineTo(xm + 4, yb + 4); ctx.stroke();
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = cond(), rows = tbl.rows.filter((r) => r.k === k && Math.abs(r.g) < GMAX);
    const pts = rows.map((r) => ({ x: r.l, y: r.g }));
    const ft = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y)) : null;
    const xs = pts.map((p) => p.x), xr = xs.length ? [Math.floor(Math.min(...xs)) - 1, Math.ceil(Math.max(...xs)) + 1] : [0, 100];
    L.plot(ctx, { x0: 44, y0: 18, w: w - 58, h: h - 52 }, { pts, fit: ft, xr, yr: [-GMAX, GMAX], xlabel: "L₁ (cm)", ylabel: "Ig (μA)" });
    const v = $(".verdict");
    if (!ft || !ft.a) { $(".n-l0").textContent = $(".n-rx").textContent = $(".n-s").textContent = "—"; v.textContent = "같은 조건에서 바늘이 끝에 붙지 않은 점을 2개 이상 기록하세요."; return; }
    const L0 = -ft.b / ft.a, rx = swap ? R * (100 - L0) / L0 : R * L0 / (100 - L0);
    $(".n-l0").textContent = `${L0.toFixed(2)} cm`;
    $(".n-rx").textContent = L0 > 0 && L0 < 100 ? `${rx.toPrecision(4)} Ω` : "—";
    $(".n-s").textContent = `${Math.abs(ft.a).toFixed(1)} μA/cm`;
    const rel = 0.1 * (1 / L0 + 1 / (100 - L0)) * 100;
    v.textContent = `L₁ 읽기 오차 0.1 cm가 Rx에 주는 상대 오차 ≈ ${rel.toFixed(2)} %` + (mmText ? ` · ${mmText}` : "");
  }

  function upd() {
    const L1 = +sL.value; $(".l-out").textContent = L1.toFixed(1); $(".l2-out").textContent = (100 - L1).toFixed(1);
    gNow = readG(L1);
    $(".n-g").textContent = Math.abs(gNow) >= GMAX ? (gNow > 0 ? "+50 넘음" : "−50 넘음") : `${gNow > 0 ? "+" : ""}${gNow.toFixed(0)} μA`;
    draw();
  }
  function record() {
    const L1 = +sL.value; gNow = readG(L1);
    tbl.add({ k: cond(), x: XS[xi].name, R, pos: swap ? "오른쪽" : "왼쪽", pr: prot ? "켬" : "끔", l: L1, g: gNow });
  }
  const press = (sel, fn) => root.querySelectorAll(sel).forEach((b) => b.addEventListener("click", () => fn(b)));
  sL.addEventListener("input", upd);
  press(".mv", (b) => { sL.value = clamp(+sL.value + +b.dataset.d, 1, 99).toFixed(1); upd(); });
  $(".rec").addEventListener("click", record);
  $(".clear").addEventListener("click", () => tbl.clear());
  $(".mm").addEventListener("click", () => {
    const t = XS[xi].R + 0.3, res = t < 200 ? 0.1 : 1;
    mmText = `멀티미터(${XS[xi].name}): ${L.fmt(L.measure(t, { rel: 0.002, res }), res)} Ω`; drawPlot();
  });
  press(".ux [data-x]", (b) => { root.querySelectorAll(".ux [data-x]").forEach((o) => o.setAttribute("aria-pressed", String(o === b))); xi = +b.dataset.x; mmText = ""; upd(); drawPlot(); });
  press(".swap", (b) => { swap = !swap; b.setAttribute("aria-pressed", String(swap)); upd(); drawPlot(); });
  press(".prot", (b) => { prot = !prot; b.setAttribute("aria-pressed", String(prot)); upd(); drawPlot(); });
  rh.addEventListener("click", (e) => { const b = e.target.closest("[data-r]"); if (!b) return; rh.querySelectorAll("[data-r]").forEach((o) => o.setAttribute("aria-pressed", String(o === b))); R = +b.dataset.r; upd(); drawPlot(); });
  upd();
  if (L.demo) {
    prot = false; $(".prot").setAttribute("aria-pressed", "false");
    [true, false].forEach((s) => {
      swap = s; const b0 = balance();
      [-0.6, -0.4, -0.2, 0.1, 0.3, 0.5].forEach((d) => { sL.value = L.snap(b0 + d, 0.1).toFixed(1); record(); });
    });
    $(".swap").setAttribute("aria-pressed", "false");
    sL.value = L.snap(balance() + 0.3, 0.1).toFixed(1);
    mmText = `멀티미터(X₁): ${L.fmt(L.measure(XS[0].R + 0.3, { rel: 0.002, res: 0.1 }), 0.1)} Ω`;
    upd(); drawPlot();
  }
})();
