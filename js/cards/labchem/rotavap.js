/* 카드: 40 °C 물중탕으로 물을 끓여 날려 보낼 수 있을까? — 회전 증발 농축기 (앙투안 식 + 대략 증발 모형) */
(() => {
  const root = document.getElementById("card-labchem-rotavap");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const R = 8.314, MB = 1.33322;   /* 1 mmHg = 1.33322 mbar */

  /* 앙투안 상수 (log10 P/mmHg = A − B/(C + T/°C)), 증발열 (J/g, 상온 근처), 밀도 (g/mL) */
  const SV = {
    acetone: { name: "아세톤", A: 7.02447, B: 1161.0, C: 224.0, dh: 535, rho: 0.784 },
    hexane: { name: "헥세인", A: 6.87601, B: 1171.17, C: 224.41, dh: 366, rho: 0.655 },
    ethanol: { name: "에탄올", A: 8.20417, B: 1642.89, C: 230.3, dh: 905, rho: 0.789 },
    water: { name: "물", A: 8.07131, B: 1730.63, C: 233.426, dh: 2410, rho: 0.998 },
  };
  let sk = "ethanol", gk = "cc", run = null, t = 0, ang = 0;
  const sTb = $(".tb"), sP = $(".p"), sR = $(".r"), sTc = $(".tc");
  const P = () => 10 * Math.pow(101.3, +sP.value / 100);   /* 10 – 1013 mbar */
  const setP = (mbar) => { sP.value = clamp(100 * Math.log(mbar / 10) / Math.log(101.3), 0, 100); };
  const bp = (s, mbar) => s.B / (s.A - Math.log10(mbar / MB)) - s.C;
  const psat = (s, T) => MB * Math.pow(10, s.A - s.B / (s.C + T));

  function model() {
    const s = SV[sk], Tb = +sTb.value, p = P(), rpm = +sR.value, Tc = +sTc.value;
    const Tbp = bp(s, p), dT = Tb - Tbp, boil = dT > 1.5;
    const UA = 4 * (0.35 + 0.65 * Math.min(rpm, 150) / 150);   /* W/K, 회전이 액막 면적을 넓힘 */
    let evap;   /* 2분 동안 증발한 mL */
    if (boil) evap = UA * dT * 120 / s.dh / s.rho;
    else evap = 0.3 * Math.min(1, psat(s, Tb) / p);   /* 끓지 않으면 표면 증발만 */
    const cond = boil ? clamp((Tbp - Tc) / 15, 0, 1) : 1;
    const bump = boil && (dT > 40 || (rpm < 30 && dT > 15));
    const notes = [];
    if (!boil) notes.push(`지금 압력에서 끓는점이 ${Tbp.toFixed(1)} °C라 중탕(${Tb} °C)에서 <b>끓지 않습니다</b>.`);
    else notes.push(`끓는점 ${Tbp.toFixed(1)} °C · 중탕과의 차이 ${dT.toFixed(1)} °C · 냉각수와의 차이 ${(Tbp - Tc).toFixed(1)} °C`);
    if (bump) notes.push("<b>범핑 위험</b>: 액체가 갑자기 끓어올라 시료가 트랩으로 튑니다.");
    if (boil && cond < 0.99) notes.push(`<b>응축 불완전</b>: 증기의 약 ${Math.round((1 - cond) * 100)}%가 냉각기를 지나 펌프로 갑니다.`);
    let got = Math.min(95, evap) * cond;
    if (bump) got *= 0.85;
    return { Tbp, dT, boil, got, bump, cond, notes };
  }

  const cv = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "s", label: "용매" }, { key: "tb", label: "중탕(°C)", res: 1 }, { key: "p", label: "P(mbar)", res: 1 }, { key: "r", label: "rpm", res: 1 },
    { key: "tv", label: "증기 T(°C)", res: 0.1 }, { key: "v", label: "회수(mL)", res: 1 }, { key: "x", label: "비고" },
  ], () => drawPlot());

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = model(), p = P(), Tb = +sTb.value;
    ctx.lineWidth = 1.4; ctx.strokeStyle = C.ink; ctx.font = `11px ${F.sans}`;
    const lab = (s, x, y, al = "left", col = C.ink2) => { ctx.fillStyle = col; ctx.textAlign = al; ctx.fillText(s, x, y); };
    /* 물중탕 */
    const bx = w * 0.06, bw = w * 0.34, by = h * 0.58, bh = h * 0.34;
    const hot = clamp((Tb - 20) / 60, 0, 1);
    ctx.fillStyle = `rgba(${Math.round(120 + 100 * hot)},${Math.round(170 - 60 * hot)},${Math.round(220 - 140 * hot)},.35)`;
    ctx.fillRect(bx, by + 10, bw, bh - 10); ctx.strokeRect(bx, by, bw, bh);
    lab(`물중탕 ${Tb} °C`, bx + 4, by + bh - 6);
    /* 회전 플라스크 (기울어진 둥근 플라스크) */
    const fx = bx + bw * 0.45, fy = by + 6, fr = Math.min(bh * 0.55, bw * 0.3);
    const prog = run ? Math.min(1, run.el / run.dur) : 0;
    const left = 100 - (run ? run.m.got * prog / 0.95 : 0);
    ctx.save(); ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.clip();
    const lv = fy + fr - (fr * 1.6) * Math.pow(left / 100, 0.7) * 0.5;
    ctx.fillStyle = "rgba(200,180,120,.45)"; ctx.fillRect(fx - fr, lv, fr * 2, fr * 2);
    ctx.restore();
    ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.stroke();
    /* 회전 표시 줄무늬 */
    ctx.strokeStyle = "rgba(93,93,97,.35)";
    for (let k = 0; k < 3; k++) { const a = ang + k * 2.1; ctx.beginPath(); ctx.ellipse(fx, fy, fr * Math.abs(Math.cos(a)), fr, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.strokeStyle = C.ink;
    if (run && m.boil) {
      ctx.fillStyle = "rgba(255,255,255,.8)";
      for (let k = 0; k < (m.bump ? 14 : 6); k++) { const yy = lv + ((t * 40 + k * 13) % 30), xx = fx - fr * 0.6 + ((k * 37) % (fr * 1.2)); if (yy < fy + fr - 4) { ctx.beginPath(); ctx.arc(xx, yy, m.bump ? 3 : 1.6, 0, Math.PI * 2); ctx.fill(); } }
    }
    /* 증기관 → 냉각기 */
    const ax = fx + fr * 0.7, ay = fy - fr * 0.7, cx = w * 0.62, cyt = h * 0.08, cyb = h * 0.62;
    ctx.lineWidth = 6; ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(cx - 10, h * 0.32); ctx.stroke();
    ctx.lineWidth = 1.4; ctx.strokeStyle = C.ink;
    ctx.beginPath(); ctx.moveTo(ax - 4, ay - 3); ctx.lineTo(cx - 14, h * 0.32 - 4); ctx.moveTo(ax + 4, ay + 3); ctx.lineTo(cx - 14, h * 0.32 + 4); ctx.stroke();
    /* 회전 모터 */
    ctx.fillStyle = C.ink2; ctx.fillRect(ax + (cx - ax) * 0.45 - 14, ay + (h * 0.32 - ay) * 0.45 - 12, 28, 18);
    lab(`${sR.value} rpm`, ax + (cx - ax) * 0.45, ay + (h * 0.32 - ay) * 0.45 - 16, "center", C.ink3);
    /* 냉각기 */
    ctx.strokeRect(cx - 14, cyt, 28, cyb - cyt);
    ctx.strokeStyle = "rgba(120,170,220,.9)"; ctx.beginPath();
    for (let y = cyt + 8; y < cyb - 8; y += 2) ctx.lineTo(cx + Math.sin(y * 0.35) * 9, y);
    ctx.stroke(); ctx.strokeStyle = C.ink;
    lab(`냉각수 ${sTc.value} °C`, cx + 20, cyt + 12);
    /* 증기 온도계 */
    lab(`증기 ${run && m.boil ? m.Tbp.toFixed(1) + " °C" : "—"}`, cx + 20, h * 0.32 + 4, "left", C.warn);
    /* 받는 플라스크 */
    const rx = cx, ry = cyb + 6, rr = Math.min(h * 0.14, 30);
    ctx.beginPath(); ctx.moveTo(rx - 5, cyb); ctx.lineTo(rx - 5, ry); ctx.moveTo(rx + 5, cyb); ctx.lineTo(rx + 5, ry); ctx.stroke();
    const got = run ? run.m.got * prog : 0;
    ctx.save(); ctx.beginPath(); ctx.arc(rx, ry + rr, rr, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = "rgba(120,170,220,.45)"; const gh = rr * 2 * Math.min(1, got / 100); ctx.fillRect(rx - rr, ry + 2 * rr - gh, rr * 2, gh); ctx.restore();
    ctx.beginPath(); ctx.arc(rx, ry + rr, rr, 0, Math.PI * 2); ctx.stroke();
    if (run && m.boil && m.cond > 0.05) { ctx.fillStyle = "#78aadc"; const dy = (t * 60) % 14; ctx.beginPath(); ctx.arc(rx, cyb + dy - 4, 2, 0, Math.PI * 2); ctx.fill(); }
    lab(`받는 플라스크 ${got.toFixed(0)} mL`, rx + rr + 6, ry + rr + 4);
    /* 진공 줄과 압력계 */
    const gx = w * 0.86, gy = h * 0.16;
    ctx.strokeStyle = "#8a6d4a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx + 14, cyt + 26); ctx.quadraticCurveTo(gx - 20, cyt + 30, gx, gy + 22); ctx.stroke();
    ctx.lineWidth = 1.4; ctx.strokeStyle = C.ink;
    ctx.fillStyle = C.card; ctx.fillRect(gx - 30, gy - 12, 60, 34); ctx.strokeRect(gx - 30, gy - 12, 60, 34);
    ctx.font = `600 13px ${F.mono}`; lab(p.toFixed(0), gx, gy + 8, "center", C.ink);
    ctx.font = `10px ${F.sans}`; lab("mbar", gx, gy + 19, "center", C.ink3);
    lab("진공 펌프로", gx, gy + 42, "center", C.ink3);
    if (run && m.bump) { ctx.font = `600 12px ${F.sans}`; lab("범핑!", fx, fy - fr - 8, "center", C.warn); }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 18, w: w - 58, h: h - 52 }, s = SV[sk];
    ctx.font = `10.5px ${F.mono}`;
    if (gk === "cc") {
      const rows = tbl.rows.filter((r) => Number.isFinite(r.tv));
      const mine = rows.filter((r) => r.s === s.name).map((r) => ({ x: 1000 / (r.tv + 273.15), y: Math.log(r.p) }));
      const f = mine.length > 1 ? L.linfit(mine.map((q) => q.x), mine.map((q) => q.y)) : null;
      const res = L.plot(ctx, box, { pts: mine, fit: f, model: (x) => Math.log(psat(s, 1000 / x - 273.15)), xr: [2.75, 3.6], yr: [2, 7.2], xlabel: "1000 / T (1/K)", ylabel: "ln (P / mbar)" });
      ctx.fillStyle = C.ink3;
      rows.filter((r) => r.s !== s.name).forEach((r) => { const X = res.X(1000 / (r.tv + 273.15)), Y = res.Y(Math.log(r.p)); if (X > box.x0 && X < box.x0 + box.w) { ctx.beginPath(); ctx.arc(X, Y, 2.6, 0, Math.PI * 2); ctx.fill(); } });
      ctx.textAlign = "right"; ctx.fillStyle = C.warn;
      if (f) ctx.fillText(`${s.name}: 기울기 ${f.a.toFixed(2)} → ΔH증발 ≈ ${(-f.a * R).toFixed(1)} kJ/mol`, box.x0 + box.w - 4, box.y0 + 14);
      ctx.fillStyle = C.ink3; ctx.fillText(`점선: ${s.name}의 앙투안 식 · 회색 점: 다른 용매`, box.x0 + box.w - 4, box.y0 + 29);
    } else {
      const pts = tbl.rows.filter((r) => Number.isFinite(r.tv)).map((r) => ({ x: r.tb - r.tv, y: r.v }));
      const res = L.plot(ctx, box, { pts, xr: [0, 60], yr: [0, 100], xlabel: "중탕 − 증기 온도 (°C)", ylabel: "2분 회수량 (mL)" });
      ctx.textAlign = "left"; ctx.fillStyle = C.ink2;
      tbl.rows.forEach((r, i) => { if (Number.isFinite(r.tv)) ctx.fillText(String(i + 1), res.X(r.tb - r.tv) + 5, res.Y(r.v) - 4); });
      ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("점 옆 숫자 = 기록 번호", box.x0 + box.w - 4, box.y0 + 14);
    }
  }

  function record(m) {
    const tv = m.boil ? L.measure(m.Tbp, { sd: 0.4, res: 0.1 }) : NaN;
    const v = Math.max(0, L.measure(m.got, { sd: 0.8, rel: 0.03, res: 1 }));
    const x = !m.boil ? "끓지 않음" : m.bump ? "범핑" : m.cond < 0.99 ? "응축 불량" : "—";
    tbl.add({ s: SV[sk].name, tb: +sTb.value, p: Math.round(P()), r: +sR.value, tv: m.boil ? tv : "—", v, x });
  }
  const info = () => { $(".rv-msg").innerHTML = model().notes.join(" "); };
  function upd() {
    $(".tb-out").textContent = sTb.value; $(".p-out").textContent = P().toFixed(0);
    $(".r-out").textContent = sR.value; $(".tc-out").textContent = sTc.value;
    info(); draw();
  }
  loop($(".cv-wide"), (dt) => {
    t += dt; ang += dt * (+sR.value) / 60 * Math.PI * 2 * 0.25;
    if (run) { run.el += dt; if (run.el >= run.dur + 0.3) { record(run.m); run = null; } }
    draw();
  });
  [sTb, sP, sR, sTc].forEach((el) => el.addEventListener("input", () => { if (!run) upd(); }));
  $(".sol").addEventListener("click", (e) => {
    const b = e.target.closest("[data-s]"); if (!b || run) return;
    sk = b.dataset.s; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); upd(); drawPlot();
  });
  $(".gsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-g]"); if (!b) return;
    gk = b.dataset.g; root.querySelectorAll("[data-g]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  $(".d20").addEventListener("click", () => { if (run) return; setP(psat(SV[sk], +sTb.value - 20)); upd(); });
  $(".meas").addEventListener("click", () => { if (!run) run = { m: model(), el: 0, dur: 2.4 }; });
  $(".clear").addEventListener("click", () => { run = null; tbl.clear(); });
  upd();
  if (L.demo) {
    const set = (s, tb, p, r, tc) => { sk = s; sTb.value = tb; setP(p); sR.value = r; sTc.value = tc; record(model()); };
    [80, 120, 180, 260, 350].forEach((p) => set("ethanol", 60, p, 120, 5));
    set("ethanol", 40, 1013, 120, 5);
    set("water", 40, psat(SV.water, 20), 120, 0);
    set("acetone", 40, psat(SV.acetone, 20), 120, 0);
    set("hexane", 40, psat(SV.hexane, 20), 120, 0);
    set("hexane", 60, 100, 120, 0);
    set("water", 40, psat(SV.water, 20), 120, 18);
    sk = "ethanol"; sTb.value = 60; setP(180); sR.value = 120; sTc.value = 5; upd(); drawPlot();
  }
})();
