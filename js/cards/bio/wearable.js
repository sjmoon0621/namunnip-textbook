/* 카드(실험): 스마트 워치 기록으로 항상성을 탐구할 수 있을까? — 가상 손목 센서 자료로 심박 회복 가설 검증
   참값 모형(가상): 안정 심박 → 운동 중 1차 지연 상승(+더위 표류) → 빠른·느린 두 단계 회복. 센서는 5초마다 잡음 섞인 값 */
(() => {
  const root = document.getElementById("card-bio-wearable");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const HRMAX = 196, REST = 3, RECW = 25, SMP = 5 / 60;
  const P = {
    u: { name: "운동 안 함", rest: 74, on: 0.75, fast: 1.0, ff: 0.5, slow: (I) => 3 + 8 * I, col: "#c0602a" },
    t: { name: "주 4회 달리기", rest: 58, on: 0.5, fast: 0.6, ff: 0.65, slow: (I) => 1.5 + 3.5 * I, col: C.forest },
  };
  const HYP = {
    fit: "조작 변인: 학생(평소 운동량). 운동 강도·시간·기온은 같게 두고 두 학생을 각각 두세 번 재세요.",
    int: "조작 변인: 운동 강도. 학생·운동 시간·기온은 같게 두고 강도를 세 가지 이상으로 바꿔 재세요.",
    heat: "조작 변인: 기온. 학생·운동 강도·시간은 같게 두고 기온만 바꿔 재세요.",
  };
  let hyp = "fit", who = "u", temp = 25, run = null, anim = 0;

  /* 한 번의 측정: 참값 곡선 + 센서 값 + 이동 평균 */
  function record(o) {
    const p = P[o.who], I = o.I / 100, D = o.D, hot = o.T >= 30 ? 1 : o.T <= 18 ? -1 : 0;
    const day = { rest: L.gauss() * 2.5, tau: 1 + 0.12 * L.gauss() };
    const rest = p.rest + day.rest + (hot > 0 ? 4 : 0);
    const tgt = rest + I * (HRMAX - rest);
    const drift = (hot > 0 ? 0.45 : hot < 0 ? 0.05 : 0.15) * I;
    const ff = clamp(p.ff - 0.008 * (D - 10), 0.3, 0.75);
    const t2 = p.slow(I) * day.tau * (hot > 0 ? 1.35 : hot < 0 ? 0.95 : 1) * (1 + 0.01 * (D - 10));
    const tEnd = REST + D, tMax = tEnd + RECW;
    const skin0 = o.T <= 18 ? 31 : o.T >= 30 ? 34.6 : 33.2;
    const pts = [];
    let hrEnd = rest;
    for (let t = 0; t <= tMax + 1e-9; t += SMP) {
      let hr, rr, sk;
      if (t < REST) { hr = rest; rr = 14; sk = skin0; }
      else if (t < tEnd) {
        const u = t - REST;
        hr = rest + (tgt - rest) * (1 - Math.exp(-u / p.on)) + drift * u;
        hr = Math.min(hr, HRMAX - 2); hrEnd = hr;
        rr = 14 + 32 * I * (1 - Math.exp(-u / 0.8));
        sk = skin0 - 0.5 * I * Math.exp(-u / 3) * (1 - Math.exp(-u / 0.5)) + (0.9 * I + (hot > 0 ? 0.4 : 0)) * (1 - Math.exp(-u / 8)) - (hot < 0 ? 0.5 * I * (1 - Math.exp(-u / 6)) : 0);
      } else {
        const u = t - tEnd, A = hrEnd - rest;
        hr = rest + A * (ff * Math.exp(-u / p.fast) + (1 - ff) * Math.exp(-u / t2));
        rr = 14 + (32 * I) * Math.exp(-u / 1.5);
        const skEnd = pts.length ? pts[pts.length - 1].sk : skin0;
        sk = skEnd + (skin0 + 0.2 - skEnd) * (1 - Math.exp(-SMP / 6));
      }
      const moving = t >= REST && t < tEnd;
      const sd = o.loose ? (moving ? 7 : 3) : (moving ? 2.5 : 1.2);
      let m = L.measure(hr, { sd, res: 1 });
      if (o.loose && moving && Math.random() < 0.12) m = Math.round(150 + 20 * Math.random());
      pts.push({ t, hr, m, rr: L.measure(rr, { sd: 1, res: 1 }), sk: L.measure(sk, { sd: 0.05, res: 0.1 }) });
    }
    for (let i = 0; i < pts.length; i++) {
      const a = pts.slice(Math.max(0, i - 5), i + 1);
      pts[i].s = a.reduce((s, q) => s + q.m, 0) / a.length;
    }
    const restM = L.stats(pts.filter((q) => q.t >= 1 && q.t < REST).map((q) => q.s)).mean;
    const peak = Math.max(...pts.map((q) => q.s));
    const back = pts.find((q) => q.t > tEnd + 0.3 && q.s <= restM + 10);
    return { o, pts, tEnd, tMax, restM, peak, rec: back ? back.t - tEnd : NaN, backT: back ? back.t : null };
  }

  const tbl = L.table($(".tbl-host"), [
    { key: "w", label: "학생" }, { key: "I", label: "강도 %", res: 1 }, { key: "D", label: "시간 분", res: 1 }, { key: "T", label: "기온 °C", res: 1 },
    { key: "r", label: "안정", res: 1 }, { key: "p", label: "최고", res: 1 }, { key: "rec", label: "회복 분", res: 0.1 },
  ], () => { drawPlot(); judge(); });
  const top = fit($(".cv-watch"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());

  function draw() {
    const { ctx } = top, { w, h } = top.size;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const gx = 42, gw = w - gx - 14;
    const h1 = h * 0.52, y1 = 22, y2 = y1 + h1 + 30, h2 = (h - y2 - 34 - 26) / 2, y3 = y2 + h2 + 26;
    const tMax = run ? run.tMax : REST + 10 + RECW;
    const X = (t) => gx + t / tMax * gw;
    const Yh = (v) => y1 + (1 - (clamp(v, 40, 200) - 40) / 160) * h1;
    NM.axes(ctx, { x0: gx, y0: y1, w: gw, h: h1, X, Y: Yh, xt: [], yt: [40, 80, 120, 160, 200].map((v) => [v, String(v)]), ylabel: "심박수 (회/분)" });
    const sk0 = run ? Math.min(...run.pts.map((q) => q.sk)) : 31, sk1 = run ? Math.max(...run.pts.map((q) => q.sk)) : 35;
    const sLo = Math.floor(sk0 - 0.3), sHi = Math.max(sLo + 2, Math.ceil(sk1 + 0.3));
    const Ys = (v) => y2 + (1 - (v - sLo) / (sHi - sLo)) * h2;
    NM.axes(ctx, { x0: gx, y0: y2, w: gw, h: h2, X, Y: Ys, xt: [], yt: [[sLo, String(sLo)], [sHi, String(sHi)]], ylabel: "손목 피부 온도 (°C)" });
    const Yr = (v) => y3 + (1 - clamp(v, 0, 50) / 50) * h2;
    NM.axes(ctx, { x0: gx, y0: y3, w: gw, h: h2, X, Y: Yr, xt: [], yt: [[0, "0"], [50, "50"]], ylabel: "호흡수 (회/분)" });
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
    const step = tMax > 45 ? 10 : 5;
    for (let m = 0; m <= tMax; m += step) ctx.fillText(String(m), X(m), y3 + h2 + 13);
    ctx.textAlign = "right"; ctx.fillText("시간 (분)", gx + gw, y3 + h2 + 26);
    if (!run) {
      ctx.fillStyle = C.ink3; ctx.font = `13px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText("조건을 정하고 ‘기록 시작’을 누르세요", gx + gw / 2, y1 + h1 / 2);
      return;
    }
    const n = Math.max(2, Math.floor(run.pts.length * anim));
    const shown = run.pts.slice(0, n);
    // 운동 구간
    ctx.fillStyle = "rgba(192,96,42,.08)";
    for (const [yy, hh] of [[y1, h1], [y2, h2], [y3, h2]]) ctx.fillRect(X(REST), yy, X(run.tEnd) - X(REST), hh);
    ctx.fillStyle = "#a0532c"; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("운동", X(REST) + 4, y1 + 12);
    ctx.fillStyle = C.ink3; ctx.fillText("휴식", gx + 4, y1 + 12); ctx.fillText("회복", X(run.tEnd) + 4, y1 + 12);
    // 센서 값(점)과 이동 평균(선)
    ctx.fillStyle = "rgba(141,141,146,.55)";
    for (const q of shown) { ctx.beginPath(); ctx.arc(X(q.t), Yh(q.m), 1.5, 0, Math.PI * 2); ctx.fill(); }
    const line = (key, Y, col, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); shown.forEach((q, i) => (i ? ctx.lineTo(X(q.t), Y(q[key])) : ctx.moveTo(X(q.t), Y(q[key])))); ctx.stroke(); };
    line("s", Yh, C.apple, 2);
    line("sk", Ys, C.amber, 1.6);
    line("rr", Yr, "#3f6f9f", 1.6);
    if (anim >= 1) {
      const thr = run.restM + 10;
      ctx.setLineDash([4, 4]); ctx.strokeStyle = C.forest; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(gx, Yh(thr)); ctx.lineTo(gx + gw, Yh(thr)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.forest; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(`안정 + 10 = ${Math.round(thr)}`, gx + gw - 4, Yh(thr) - 5);
      const pk = run.pts.reduce((a, q) => (q.s > a.s ? q : a));
      ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(X(pk.t), Yh(pk.s), 4, 0, Math.PI * 2); ctx.fill();
      ctx.textAlign = X(pk.t) > gx + gw - 80 ? "right" : "left"; ctx.fillText(`최고 ${Math.round(pk.s)}`, X(pk.t) + (ctx.textAlign === "left" ? 7 : -7), Yh(pk.s) - 7);
      if (run.backT) {
        const xa = X(run.tEnd), xb = X(run.backT), yy = Yh(thr) + 16;
        ctx.strokeStyle = C.forest; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(xa, yy); ctx.lineTo(xb, yy); ctx.moveTo(xa, yy - 4); ctx.lineTo(xa, yy + 4); ctx.moveTo(xb, yy - 4); ctx.lineTo(xb, yy + 4); ctx.stroke();
        ctx.fillStyle = C.forest; ctx.textAlign = "center"; ctx.fillText(`회복 ${run.rec.toFixed(1)}분`, (xa + xb) / 2, yy + 13);
      }
    }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows.filter((r) => Number.isFinite(r.rec));
    const box = { x0: 46, y0: 50, w: w - 60, h: h - 84 };
    const ymax = Math.max(15, ...rows.map((r) => r.rec + 2));
    const { X, Y } = L.plot(ctx, box, { pts: [], xr: [25, 95], yr: [0, Math.ceil(ymax / 5) * 5], xlabel: "운동 강도 (%)", ylabel: "회복 시간 (분)" });
    for (const r of rows) {
      const col = P[r.k].col, x = X(r.I), y = Y(r.rec);
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.6;
      ctx.beginPath();
      if (r.T >= 30) { ctx.moveTo(x, y - 5); ctx.lineTo(x + 5, y + 4); ctx.lineTo(x - 5, y + 4); ctx.closePath(); }
      else if (r.T <= 18) ctx.rect(x - 4, y - 4, 8, 8);
      else ctx.arc(x, y, 4, 0, Math.PI * 2);
      r.D === 10 ? ctx.fill() : ctx.stroke();
    }
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillStyle = P.t.col; ctx.fillText("● 주 4회 달리기", box.x0 + box.w, 12);
    ctx.fillStyle = P.u.col; ctx.fillText("● 운동 안 함", box.x0 + box.w - ctx.measureText("● 주 4회 달리기").width - 14, 12);
    ctx.fillStyle = C.ink3; ctx.fillText("■ 15 °C  ● 25 °C  ▲ 33 °C · 빈 점: 10분이 아닌 운동", box.x0 + box.w, 27);
  }

  /* 고른 가설에 맞는 공정한 비교가 표에 있는지 점검 */
  function judge() {
    const v = $(".verdict"), rows = tbl.rows.filter((r) => Number.isFinite(r.rec));
    const mean = (a) => L.stats(a.map((r) => r.rec));
    const key = (r, skip) => ["k", "I", "D", "T"].filter((k) => k !== skip).map((k) => r[k]).join("|");
    const skip = { fit: "k", int: "I", heat: "T" }[hyp];
    const groups = {};
    rows.forEach((r) => { (groups[key(r, skip)] = groups[key(r, skip)] || []).push(r); });
    let best = null;
    Object.values(groups).forEach((g) => { const lv = new Set(g.map((r) => r[skip])); if (lv.size >= (hyp === "int" ? 3 : 2) && (!best || g.length > best.length)) best = g; });
    if (!rows.length) { v.textContent = ""; v.className = "verdict small"; return; }
    if (!best) {
      v.textContent = rows.length < 2 ? "기록이 하나뿐입니다. 비교하려면 조작 변인만 바꾼 기록이 더 필요합니다."
        : `아직 공정한 비교가 없습니다. ${hyp === "int" ? "다른 조건은 같고 강도만 다른 기록이 세 가지 이상" : "다른 조건은 모두 같고 " + (hyp === "fit" ? "학생" : "기온") + "만 다른 기록"}이 필요합니다.`;
      v.className = "verdict small bad"; return;
    }
    const lv = [...new Set(best.map((r) => r[skip]))].sort((a, b) => a - b || String(a).localeCompare(String(b)));
    const reps = Math.min(...lv.map((x) => best.filter((r) => r[skip] === x).length));
    const repNote = reps < 2 ? " 다만 조건마다 한 번씩만 재어서, 날마다의 흔들림인지 진짜 차이인지 아직 알 수 없습니다. 반복해 보세요." : ` 조건마다 ${reps}번 이상 반복했습니다.`;
    if (hyp === "int") {
      const f = L.linfit(best.map((r) => r.I), best.map((r) => r.rec));
      v.textContent = `공정한 비교입니다. 강도 10%p마다 회복 시간이 약 ${(f.a * 10).toFixed(1)}분 ${f.a > 0 ? "늘었습니다" : "줄었습니다"} (기록 ${best.length}개).` + (f.a > 0.05 ? " 가설을 지지합니다." : " 가설과 맞지 않습니다.") + repNote;
    } else {
      const ms = lv.map((x) => ({ x, m: mean(best.filter((r) => r[skip] === x)) }));
      const nm = (x) => (hyp === "fit" ? (x === "u" ? "운동 안 함" : "달리기") : `${x} °C`);
      v.textContent = `공정한 비교입니다. 평균 회복 시간: ${ms.map((q) => `${nm(q.x)} ${q.m.mean.toFixed(1)}분`).join(", ")}.` + repNote;
    }
    v.className = "verdict small good";
  }

  function start(o, instant) {
    run = record(o);
    const add = () => {
      $(".n-rest").textContent = `${Math.round(run.restM)} 회/분`;
      $(".n-peak").textContent = `${Math.round(run.peak)} 회/분`;
      $(".n-rec").textContent = Number.isFinite(run.rec) ? `${run.rec.toFixed(1)} 분` : `${RECW}분 넘음`;
      tbl.add({ k: o.who, w: P[o.who].name, I: o.I, D: o.D, T: o.T, r: Math.round(run.restM), p: Math.round(run.peak), rec: Number.isFinite(run.rec) ? run.rec : `${RECW}+` });
    };
    if (instant || NM.reduce) { anim = 1; add(); draw(); return; }
    anim = 0; let last = performance.now();
    $(".run").disabled = true;
    const tick = (now) => {
      anim = Math.min(1, anim + (now - last) / 2200); last = now; draw();
      if (anim < 1) requestAnimationFrame(tick); else { $(".run").disabled = false; add(); }
    };
    requestAnimationFrame(tick);
  }
  const cur = () => ({ who, I: +$(".inten").value, D: +$(".dur").value, T: temp, loose: $(".loose").checked });
  const press = (sel, attr, val) => root.querySelectorAll(sel).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset[attr] === String(val))));
  root.addEventListener("click", (e) => {
    const hb = e.target.closest("[data-h]"), pb = e.target.closest("[data-p]"), tb = e.target.closest("[data-t]");
    if (hb) { hyp = hb.dataset.h; press("[data-h]", "h", hyp); $(".hyp-note").textContent = HYP[hyp]; judge(); }
    if (pb) { who = pb.dataset.p; press("[data-p]", "p", who); }
    if (tb) { temp = +tb.dataset.t; press("[data-t]", "t", temp); }
  });
  $(".inten").addEventListener("input", () => { $(".i-out").textContent = $(".inten").value; });
  $(".dur").addEventListener("input", () => { $(".d-out").textContent = $(".dur").value; });
  $(".run").addEventListener("click", () => start(cur(), false));
  $(".clear").addEventListener("click", () => { tbl.clear(); });
  $(".hyp-note").textContent = HYP[hyp];
  if (L.demo) {
    [["u", 70], ["t", 70], ["u", 70], ["t", 70], ["u", 40], ["u", 55], ["u", 85]].forEach(([k, I]) => start({ who: k, I, D: 10, T: 25, loose: false }, true));
    start({ who: "t", I: 70, D: 10, T: 25, loose: false }, true);
  }
  draw(); drawPlot(); judge();
})();
