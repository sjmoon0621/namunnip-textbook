/* 카드: 공기를 압축하면 수증기량은 늘어날까? — 건습구 습도계로 수증기압·혼합비·비습 구하기, 기압의 효과 */
(() => {
  const root = document.getElementById("card-labearth-humidity");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab, T = LEThermo;
  const $ = (s) => root.querySelector(s);
  const sP = $(".p"), vent = $(".vent-off");
  const A_VENT = 6.62e-4, A_STILL = 8.0e-4;
  /* 공기 시료: 기온 t, 이슬점 td, 원래 기압 p0. 포항 두 시료는 IGRA2 지상 관측값 */
  const CASES = {
    room: { name: "여름 교실", short: "여름", t: 28.0, td: 20.0, p0: 1010 },
    winter: { name: "겨울 난방 교실", short: "겨울", t: 22.0, td: 3.0, p0: 1020 },
    ph7: { name: "포항 2026-07-27 15시", short: "포항7", t: 33.0, td: 24.0, p0: 1010 },
    ph1: { name: "포항 2026-01-17 09시", short: "포항1", t: 4.0, td: -2.0, p0: 1018 },
  };
  let cur = "room", yKey = "e", wetNow = null, fanA = 0, flash = 0;

  /* 기압실 속 시료의 참 상태: 기온 일정, 응결 전까지 혼합비 보존 */
  function state() {
    const c = CASES[cur], p = +sP.value, w0 = T.wOf(T.es(c.td), c.p0);
    let e = T.eOfW(w0, p), cond = false;
    if (e > T.es(c.t)) { e = T.es(c.t); cond = true; }
    return { t: c.t, p, e, cond };
  }
  /* 습구 온도: es(t′) − A·p·(t − t′) = e 를 이분법으로 */
  function wetBulb(t, e, p, A) {
    let lo = -40, hi = t;
    for (let i = 0; i < 60; i++) {
      const m = (lo + hi) / 2;
      if (T.es(m) - A * p * (t - m) > e) hi = m; else lo = m;
    }
    return (lo + hi) / 2;
  }
  /* 읽은 값으로 계산 (학생은 언제나 통풍 상수를 쓴다) */
  function calc(p, td, tw) {
    const e = Math.max(0.01, T.es(tw) - A_VENT * p * (td - tw));
    return { e, rh: 100 * e / T.es(td), w: 1000 * T.wOf(e, p), q: 1000 * T.qOf(e, p), rv: T.rhoV(e, td) };
  }

  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "lab", label: "시료" }, { key: "p", label: "p (hPa)", res: 1 },
    { key: "td", label: "건구 (°C)", res: 0.1 }, { key: "tw", label: "습구 (°C)", res: 0.1 },
    { key: "e", label: "e (hPa)", res: 0.1 }, { key: "rh", label: "RH (%)", res: 1 },
    { key: "w", label: "w (g/kg)", res: 0.1 }, { key: "q", label: "q (g/kg)", res: 0.1 }, { key: "rv", label: "ρv (g/m³)", res: 0.1 },
  ], () => { drawPlot(); nums(); });

  function thermo(ctx, x, top, bot, val, wet, lab) {
    const lo = -10, hi = 40, Y = (v) => bot - (v - lo) / (hi - lo) * (bot - top);
    ctx.fillStyle = C.card; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.roundRect(x - 5, top - 6, 10, bot - top + 8, 5); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, bot + 9, 9, 0, Math.PI * 2); ctx.fillStyle = C.apple; ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.apple; ctx.fillRect(x - 2, Y(val), 4, bot + 2 - Y(val));
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.font = `9.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    for (let v = lo; v <= hi; v += 2) {
      const y = Math.round(Y(v)) + 0.5, big = v % 10 === 0;
      ctx.beginPath(); ctx.moveTo(x - 5 - (big ? 6 : 3), y); ctx.lineTo(x - 5, y); ctx.stroke();
      if (big) ctx.fillText(String(v), x - 13, y + 3);
    }
    if (wet) {   // 젖은 거즈와 물통
      ctx.fillStyle = "rgba(120,160,200,.55)"; ctx.beginPath(); ctx.ellipse(x, bot + 9, 12, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(90,130,180,.8)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, bot + 21); ctx.lineTo(x, bot + 34); ctx.stroke();
      ctx.fillStyle = "rgba(120,160,200,.35)"; ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
      ctx.fillRect(x - 13, bot + 30, 26, 12); ctx.strokeRect(x - 13, bot + 30, 26, 12);
    }
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(val.toFixed(1) + " °C", x, top - 12);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.fillText(lab, x, top - 27);
  }

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = state(), top = 50, bot = h - 52;
    if (wetNow == null) wetNow = wetTarget();
    thermo(ctx, w * 0.14, top, bot, s.t, false, "건구");
    thermo(ctx, w * 0.32, top, bot, wetNow, true, "습구");
    /* 환기팬 */
    const fx = w * 0.43, fy = h * 0.42, on = !vent.checked;
    ctx.save(); ctx.translate(fx, fy); ctx.rotate(fanA);
    ctx.fillStyle = on ? C.ink2 : C.ink3;
    for (let i = 0; i < 3; i++) { ctx.rotate(2 * Math.PI / 3); ctx.beginPath(); ctx.ellipse(0, -5, 2.6, 5, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    ctx.fillText("환기팬", fx, fy + 22); ctx.fillText(on ? "켜짐" : "꺼짐", fx, fy + 36);
    if (flash > 0) { ctx.fillStyle = C.forest; ctx.font = `600 11px ${F.sans}`; ctx.fillText("기록함", w * 0.23, h - 6); }
    /* 기압실과 기압계 */
    const bx = w * 0.5, bw = w * 0.46, by = 16, bh = h - 34;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
    ctx.strokeRect(bx, by, bw, bh); ctx.setLineDash([]);
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("기압실 (온도 일정)", bx + 8, by + 16);
    ctx.fillText("시료: " + CASES[cur].name, bx + 8, by + 32);
    const cx = bx + bw / 2, cy = by + bh * 0.6, R = Math.min(bw * 0.3, bh * 0.3);
    ctx.fillStyle = C.card; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const ang = (p) => Math.PI * (0.75 + 1.5 * (p - 500) / 1500);
    ctx.font = `9px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    for (let p = 500; p <= 2000; p += 100) {
      const a = ang(p), big = p % 500 === 0;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * R * 0.86, cy + Math.sin(a) * R * 0.86); ctx.lineTo(cx + Math.cos(a) * R * (big ? 0.72 : 0.79), cy + Math.sin(a) * R * (big ? 0.72 : 0.79)); ctx.stroke();
      if (big && R > 40) ctx.fillText(String(p), cx + Math.cos(a) * R * 0.56, cy + Math.sin(a) * R * 0.56 + 3);
    }
    const a = ang(s.p);
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R * 0.8, cy + Math.sin(a) * R * 0.8); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.mono}`; ctx.fillText(s.p + " hPa", cx, cy + R + 16);
    if (s.cond) {   // 김 서림
      ctx.fillStyle = "rgba(150,170,190,.18)"; ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
      ctx.fillStyle = C.warn; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left";
      ctx.fillText("벽에 이슬이 맺힘", bx + 8, by + bh - 8);
    }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const lab = CASES[cur].short;
    const rows = tbl.rows.filter((r) => r.lab === lab);
    const pts = rows.map((r) => ({ x: r.p, y: r[yKey] }));
    const unsat = rows.filter((r) => r.rh < 97);
    const f = yKey === "e" && unsat.length > 1 ? L.linfit(unsat.map((r) => r.p), unsat.map((r) => r.e), true) : null;
    const yl = { e: "e (hPa)", w: "w (g/kg)", q: "q (g/kg)", rh: "상대 습도 (%)" }[yKey];
    const ys = pts.map((p) => p.y), ymax = { rh: 110 }[yKey] || Math.max(5, ...ys) * 1.25;
    L.plot(ctx, { x0: 46, y0: 22, w: w - 60, h: h - 56 }, { pts, fit: f, xr: [0, 2000], yr: [0, ymax], xlabel: "기압실의 기압 p (hPa)", ylabel: yl });
    ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink3;
    ctx.fillText(`시료: ${CASES[cur].name} (${rows.length}개)`, 52, 36);
    if (f) { ctx.fillStyle = C.warn; ctx.fillText(`불포화 점만 맞춤: e = ${f.a.toFixed(4)} × p`, 52, 52); }
  }

  function nums() {
    const r = tbl.rows[tbl.rows.length - 1];
    if (!r) { ["es", "ws", "td"].forEach((k) => ($(".n-" + k).textContent = "—")); return; }
    $(".n-es").textContent = T.es(r.td).toFixed(1) + " hPa";
    $(".n-ws").textContent = (1000 * T.ws(r.td, r.p)).toFixed(1) + " g/kg";
    $(".n-td").textContent = T.tdOf(r.e).toFixed(1) + " °C";
  }

  /* 습구가 지금 조건에서 도달할 온도 */
  function wetTarget() { const s = state(); return wetBulb(s.t, s.e, s.p, vent.checked ? A_STILL : A_VENT); }
  /* 지금 습구가 가리키는 값을 읽는다 (아직 덜 내려갔으면 그 값 그대로) */
  function measure() {
    const s = state();
    const td = L.measure(s.t, { sd: 0.15, res: 0.1 }), tw = Math.min(td, L.measure(wetNow, { sd: 0.15, res: 0.1 }));
    tbl.add({ lab: CASES[cur].short, p: s.p, td, tw, ...calc(s.p, td, tw) });
    flash = 1;
  }

  loop($(".cv-wide"), (dt) => {
    if (!vent.checked) fanA += dt * 18;
    const tg = wetTarget(); if (wetNow == null) wetNow = tg;
    wetNow += (tg - wetNow) * Math.min(1, dt / (vent.checked ? 4 : 1.5));   // 습구가 천천히 새 평형으로
    flash = Math.max(0, flash - dt);
    drawApp();
  });

  const upd = () => {
    $(".p-out").textContent = sP.value;
    const s = state();
    $(".hm-state").textContent = s.cond ? "시료가 포화되어 수증기 일부가 응결했습니다. 이제부터 혼합비는 보존되지 않습니다." : "";
    drawApp();
  };
  sP.addEventListener("input", upd);
  vent.addEventListener("change", () => drawApp());
  $(".cases").addEventListener("click", (e) => {
    const b = e.target.closest("[data-c]"); if (!b) return;
    cur = b.dataset.c; sP.value = CASES[cur].p0; wetNow = CASES[cur].t;
    root.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    upd(); drawPlot();
  });
  $(".ysel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-y]"); if (!b) return;
    yKey = b.dataset.y; root.querySelectorAll("[data-y]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  $(".meas").addEventListener("click", measure);
  $(".clear").addEventListener("click", () => tbl.clear());
  upd();
  if (L.demo) {
    [["winter", 1020], ["ph7", 1010], ["ph1", 1018]].forEach(([c, p]) => { cur = c; sP.value = p; wetNow = wetTarget(); measure(); });
    cur = "room";
    [1010, 900, 800, 700, 600, 1200, 1400, 1600, 1800, 2000].forEach((p) => { sP.value = p; wetNow = wetTarget(); measure(); });
    sP.value = 1010; wetNow = wetTarget(); upd(); drawPlot();
  }
})();
