/* 카드: 25 mL를 옮길 때 무엇을 써야 할까? — 부피·질량·온도·pH 측정 도구의 정밀도, 허용 오차, pH 미터 2점 보정 */
(() => {
  const root = document.getElementById("card-labchem-tools");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const U = (a) => (Math.random() * 2 - 1) * a;

  /* 도구: res 분해능, sd 우연 오차, b 개체마다 다른 눈금 어긋남(최댓값), tol 허용 오차 */
  const Q = {
    vol: {
      name: "부피", unit: "mL", truth: 25.0, dres: 0.01,
      task: "과제: 물 25 mL를 비커에서 삼각 플라스크로 옮깁니다. 기준값 25.00 mL.",
      tools: [
        { id: "beaker", name: "비커 50 mL", res: 0.01, sd: 0.9, b: 1.0, tol: 1.25, tl: "±5% (어림 눈금)" },
        { id: "cyl", name: "눈금 실린더 50 mL", res: 0.01, sd: 0.12, b: 0.18, tol: 0.25, tl: "A급 ±0.25 mL" },
        { id: "pip", name: "부피 피펫 25 mL", res: 0.01, sd: 0.012, b: 0.02, tol: 0.03, tl: "A급 ±0.03 mL" },
        { id: "bur", name: "뷰렛 50 mL", res: 0.01, sd: 0.025, b: 0.035, tol: 0.05, tl: "A급 ±0.05 mL" },
      ],
      opt: { label: "피펫 끝에 남은 마지막 방울을 불어 넣음", key: "blow" },
    },
    mass: {
      name: "질량", unit: "g", truth: 2.0, dres: 0.0001,
      task: "과제: 2 g 표준 분동(참값 2.0000 g)을 잽니다.",
      tools: [
        { id: "pan", name: "윗접시 저울", res: 0.1, sd: 0.06, b: 0.08, tol: 0.1, tl: "±0.1 g" },
        { id: "ebal", name: "전자 저울 0.01 g", res: 0.01, sd: 0.006, b: 0.008, tol: 0.02, tl: "±0.02 g" },
        { id: "abal", name: "분석 저울 0.1 mg", res: 0.0001, sd: 0.00007, b: 0.00012, tol: 0.0002, tl: "±0.2 mg" },
      ],
      opt: { label: "분석 저울의 유리문을 열어 둔 채 읽음", key: "door" },
    },
    temp: {
      name: "온도", unit: "°C", truth: 0.0, dres: 0.01,
      task: "과제: 잘게 부순 얼음과 물을 섞은 얼음물(0.0 °C)의 온도를 잽니다.",
      tools: [
        { id: "alc", name: "알코올 온도계 (1 °C 눈금)", res: 0.1, sd: 0.15, b: 0.7, tol: 1.0, tl: "±1 °C" },
        { id: "sen", name: "디지털 온도 센서", res: 0.1, sd: 0.05, b: 0.2, tol: 0.3, tl: "±0.3 °C" },
        { id: "rtd", name: "백금 저항 온도계", res: 0.01, sd: 0.01, b: 0.04, tol: 0.1, tl: "±0.1 °C" },
      ],
      opt: { label: "넣자마자 평형 전에 읽음 (실온 22 °C)", key: "rush" },
    },
    ph: {
      name: "pH", unit: "", truth: 4.38, dres: 0.01,
      task: "과제: pH 4.38인 표준 시료의 pH를 잽니다. pH 미터는 아래에서 보정합니다.",
      tools: [
        { id: "univ", name: "만능 pH 시험지", res: 1, sd: 0.35, b: 0.4, tol: 1.0, tl: "±1" },
        { id: "narrow", name: "좁은 범위 시험지 (3.8–5.4)", res: 0.3, sd: 0.12, b: 0.12, tol: 0.3, tl: "±0.3" },
        { id: "meter", name: "pH 미터 (유리 전극)", res: 0.01, sd: 0.008, b: 0, tol: 0.02, tl: "보정 후 ±0.02" },
      ],
    },
  };
  Object.values(Q).forEach((q) => q.tools.forEach((t) => { t.bias = U(t.b); }));
  /* pH 전극: E = Eoff + S·(7 − pH) (mV). 실제 기울기 95%, 영점 +25 mV (모식값) */
  const EL = { off: 25, S: 0.95 * 59.16 };
  const cal = { e7: 0, s: 59.16, pts: [] };
  const elE = (pH) => EL.off + EL.S * (7 - pH);
  const meterRead = (E) => 7 - (E - cal.e7) / cal.s;

  let qk = "vol", tk = "beaker", lastRec = null;
  const opt = { blow: false, door: false, rush: false };

  const app = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "qn", label: "양" }, { key: "tn", label: "도구" }, { key: "vs", label: "측정값" }, { key: "tl", label: "허용 오차" },
  ], () => { drawPlot(); nums(); });

  const tool = () => Q[qk].tools.find((t) => t.id === tk);
  const fmtv = (v, t) => (t.res >= 1 ? v.toFixed(0) : L.fmt(v, t.res));

  function one() {
    const q = Q[qk], t = tool();
    let v;
    if (t.id === "meter") {
      v = L.snap(meterRead(elE(q.truth) + 0.4 * L.gauss()), 0.01);
    } else {
      let bias = t.bias, sd = t.sd;
      if (qk === "vol" && opt.blow && t.id === "pip") bias += 0.045;
      if (qk === "mass" && opt.door && t.id === "abal") { sd *= 25; bias -= 0.0006; }
      if (qk === "temp" && opt.rush) bias += { alc: 2.2, sen: 0.6, rtd: 0.8 }[t.id];
      v = L.measure(q.truth, { sd, bias, res: t.res });
      if (qk === "ph" && t.id === "narrow") v = NM.clamp(v, 3.8, 5.4);
    }
    const rec = { q: qk, t: t.id, qn: q.name, tn: t.name.split(" (")[0], v, vs: fmtv(v, t) + (q.unit ? " " + q.unit : ""), tl: t.id === "meter" ? calLabel() : t.tl };
    tbl.add(rec); lastRec = rec; draw();
  }
  const calLabel = () => (cal.pts.length >= 2 ? "2점 보정" : cal.pts.length === 1 ? "1점 보정" : "보정 안 함");

  /* 도구 그림 */
  function icon(ctx, id, cx, by, H, on) {
    ctx.save();
    ctx.strokeStyle = on ? C.ink : C.ink3; ctx.lineWidth = on ? 1.8 : 1.2; ctx.fillStyle = "rgba(120,170,215,0.30)";
    const glass = (pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); };
    if (id === "beaker") {
      const w = H * 0.5, t = by - H * 0.55;
      ctx.fillRect(cx - w / 2, by - H * 0.28, w, H * 0.28);
      glass([[cx - w / 2 - 4, t - 3], [cx - w / 2, t], [cx - w / 2, by], [cx + w / 2, by], [cx + w / 2, t]]);
      for (let i = 1; i <= 3; i++) glass([[cx - w / 2, by - i * H * 0.12], [cx - w / 2 + 8, by - i * H * 0.12]]);
    } else if (id === "cyl") {
      const w = H * 0.16;
      ctx.fillRect(cx - w / 2, by - H * 0.5, w, H * 0.46);
      glass([[cx - w / 2, by - H * 0.95], [cx - w / 2, by - 4], [cx + w / 2, by - 4], [cx + w / 2, by - H * 0.95]]);
      glass([[cx - w * 1.4, by], [cx + w * 1.4, by]]);
      for (let i = 1; i <= 8; i++) glass([[cx - w / 2, by - 4 - i * H * 0.1], [cx - w / 2 + 5, by - 4 - i * H * 0.1]]);
    } else if (id === "pip") {
      glass([[cx, by - H * 0.98], [cx, by - H * 0.62]]); glass([[cx, by - H * 0.36], [cx, by]]);
      ctx.beginPath(); ctx.ellipse(cx, by - H * 0.49, H * 0.07, H * 0.13, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      glass([[cx - 5, by - H * 0.8], [cx + 5, by - H * 0.8]]);
    } else if (id === "bur") {
      const w = H * 0.07;
      ctx.fillRect(cx - w / 2, by - H * 0.8, w, H * 0.64);
      glass([[cx - w / 2, by - H], [cx - w / 2, by - H * 0.16], [cx + w / 2, by - H * 0.16], [cx + w / 2, by - H]]);
      glass([[cx - 9, by - H * 0.12], [cx + 9, by - H * 0.12]]); glass([[cx, by - H * 0.12], [cx, by]]);
    } else if (id === "pan" || id === "ebal" || id === "abal") {
      const w = H * 0.75;
      ctx.fillStyle = C.card; ctx.fillRect(cx - w / 2, by - H * 0.25, w, H * 0.25); ctx.strokeRect(cx - w / 2, by - H * 0.25, w, H * 0.25);
      if (id === "pan") {
        glass([[cx - w * 0.42, by - H * 0.45], [cx - w * 0.12, by - H * 0.45]]); glass([[cx + w * 0.12, by - H * 0.45], [cx + w * 0.42, by - H * 0.45]]);
        glass([[cx - w * 0.27, by - H * 0.45], [cx - w * 0.27, by - H * 0.25]]); glass([[cx + w * 0.27, by - H * 0.45], [cx + w * 0.27, by - H * 0.25]]);
        glass([[cx, by - H * 0.25], [cx, by - H * 0.55]]);
      } else {
        ctx.fillStyle = C.night; ctx.fillRect(cx - w * 0.3, by - H * 0.19, w * 0.6, H * 0.12);
        glass([[cx - w * 0.3, by - H * 0.32], [cx + w * 0.3, by - H * 0.32]]);
        if (id === "abal") { ctx.strokeStyle = on ? C.ink2 : C.rule; ctx.strokeRect(cx - w * 0.42, by - H * 0.85, w * 0.84, H * 0.6); }
      }
    } else if (id === "alc" || id === "rtd") {
      glass([[cx - 3, by - H], [cx - 3, by - H * 0.1]]); glass([[cx + 3, by - H], [cx + 3, by - H * 0.1]]);
      ctx.fillStyle = id === "alc" ? C.apple : C.ink3;
      ctx.beginPath(); ctx.arc(cx, by - H * 0.06, 5, 0, Math.PI * 2); ctx.fill();
      if (id === "alc") ctx.fillRect(cx - 1.5, by - H * 0.45, 3, H * 0.39);
      else { ctx.strokeStyle = on ? C.ink : C.ink3; glass([[cx, by - H], [cx + 14, by - H * 1.05]]); }
    } else if (id === "sen") {
      glass([[cx - 10, by - H * 0.1], [cx - 10, by - H * 0.7]]);
      ctx.fillStyle = C.card; ctx.fillRect(cx - 2, by - H * 0.95, H * 0.42, H * 0.3); ctx.strokeRect(cx - 2, by - H * 0.95, H * 0.42, H * 0.3);
      glass([[cx - 10, by - H * 0.7], [cx - 10, by - H * 0.8], [cx - 2, by - H * 0.8]]);
    } else if (id === "univ" || id === "narrow") {
      const cols = id === "univ" ? ["#d23b2a", "#e9862b", "#e8c93a", "#8fbf3f", "#3a8f5a", "#2f5f9e", "#5b3a8e"] : ["#e2532c", "#e9862b", "#efa53a", "#e8c93a", "#c9c43c"];
      const sw = H * 0.6 / cols.length;
      cols.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(cx - H * 0.3 + i * sw, by - H * 0.2, sw - 1, H * 0.16); });
      ctx.fillStyle = "#efe7d0"; ctx.fillRect(cx - 5, by - H * 0.9, 10, H * 0.55); ctx.strokeRect(cx - 5, by - H * 0.9, 10, H * 0.55);
    } else if (id === "meter") {
      ctx.fillStyle = C.card; ctx.fillRect(cx - H * 0.3, by - H * 0.42, H * 0.6, H * 0.42); ctx.strokeRect(cx - H * 0.3, by - H * 0.42, H * 0.6, H * 0.42);
      ctx.fillStyle = C.night; ctx.fillRect(cx - H * 0.22, by - H * 0.35, H * 0.44, H * 0.14);
      glass([[cx + H * 0.3, by - H * 0.3], [cx + H * 0.42, by - H * 0.6], [cx + H * 0.42, by - H * 0.98]]);
    }
    ctx.restore();
  }

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const q = Q[qk], n = q.tools.length, cw = w / n, H = h * 0.5, by = h * 0.62;
    q.tools.forEach((t, i) => {
      const cx = cw * (i + 0.5), on = t.id === tk;
      if (on) { ctx.fillStyle = "rgba(116,171,102,0.13)"; ctx.fillRect(cw * i + 4, 6, cw - 8, h * 0.78); }
      icon(ctx, t.id, cx, by, H, on);
      ctx.fillStyle = on ? C.ink : C.ink3; ctx.font = `${on ? 600 : 400} 11px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(t.name.split(" (")[0], cx, by + 18);
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
      ctx.fillText(t.id === "meter" ? calLabel() : t.tl, cx, by + 33);
    });
    ctx.font = `600 14px ${F.mono}`; ctx.fillStyle = C.ink; ctx.textAlign = "center";
    const lr = lastRec && lastRec.q === qk ? `최근 측정: ${lastRec.vs}  (${lastRec.tn})` : "측정 버튼을 눌러 재세요";
    ctx.fillText(lr, w / 2, h - 12);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const q = Q[qk], n = q.tools.length, rows = tbl.rows.filter((r) => r.q === qk);
    const box = { x0: 56, y0: 18, w: w - 68, h: h - 56 };
    let lo = q.truth, hi = q.truth;
    q.tools.forEach((t) => { lo = Math.min(lo, q.truth - t.tol); hi = Math.max(hi, q.truth + t.tol); });
    rows.forEach((r) => { lo = Math.min(lo, r.v); hi = Math.max(hi, r.v); });
    const pad = (hi - lo) * 0.08 || 0.1; lo -= pad; hi += pad;
    const X = (i) => box.x0 + (i + 0.5) / n * box.w, Y = (v) => box.y0 + box.h - (v - lo) / (hi - lo) * box.h;
    axes(ctx, { ...box, X: (v) => X(v), Y, xt: [], yt: L.ticks(lo, hi, 5).map((v) => [v, String(+v.toPrecision(5))]), ylabel: `${q.name}${q.unit ? " (" + q.unit + ")" : ""}` });
    q.tools.forEach((t, i) => {
      const x = X(i);
      ctx.fillStyle = "rgba(116,171,102,0.16)"; ctx.fillRect(x - box.w / n * 0.3, Y(q.truth + t.tol), box.w / n * 0.6, Y(q.truth - t.tol) - Y(q.truth + t.tol));
      ctx.fillStyle = t.id === tk ? C.ink : C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(t.name.split(" (")[0], x, box.y0 + box.h + 16);
    });
    ctx.setLineDash([4, 4]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(box.x0, Y(q.truth)); ctx.lineTo(box.x0 + box.w, Y(q.truth)); ctx.stroke(); ctx.setLineDash([]);
    const cnt = {};
    rows.forEach((r) => {
      const i = q.tools.findIndex((t) => t.id === r.t), k = (cnt[r.t] = (cnt[r.t] || 0) + 1);
      const x = X(i) + ((k % 7) - 3) * 5;
      ctx.fillStyle = r.t === "meter" && r.tl !== "2점 보정" ? C.warn : C.forest;
      ctx.beginPath(); ctx.arc(x, Y(r.v), 3.2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText(`점선: 기준값 ${q.truth.toFixed(qk === "mass" ? 4 : 2)}${q.unit ? " " + q.unit : ""}`, box.x0, h - 6);
  }

  function nums() {
    const q = Q[qk];
    $(".nums").innerHTML = q.tools.map((t) => {
      const xs = tbl.rows.filter((r) => r.q === qk && r.t === t.id && (t.id !== "meter" || r.tl === calLabel())).map((r) => r.v);
      const s = L.stats(xs), d = Math.min((t.res >= 1 ? 0 : L.fmt(0, t.res).length - 2) + 1, 5);
      const txt = s.n ? `${s.mean.toFixed(d)}${s.n > 1 ? `<br><span class="small">± ${s.sd.toFixed(d)}</span>` : ""}` : "—";
      return `<div><dt>${t.name.split(" (")[0]} (n=${s.n})</dt><dd>${txt}</dd></div>`;
    }).join("");
    $(".nums").classList.toggle("n4", q.tools.length === 4);
  }

  function setQ(k) {
    qk = k; tk = Q[k].tools[0].id;
    root.querySelectorAll("[data-q]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.q === k)));
    $(".task").textContent = Q[k].task;
    $(".tsel").innerHTML = `<span class="mono small dim">도구</span>` + Q[k].tools.map((t) => `<button class="chip" data-t="${t.id}" aria-pressed="${t.id === tk}">${t.name}</button>`).join("");
    const o = Q[k].opt;
    $(".opts").innerHTML = o ? `<label><input type="checkbox" class="sys" ${opt[o.key] ? "checked" : ""}>${o.label}</label>`
      : `<span class="mono small dim">pH 미터 보정</span><button class="chip c7" type="button">pH 7.00 완충액</button><button class="chip c4" type="button">pH 4.01 완충액</button><button class="chip c0" type="button">보정 초기화</button><span class="mono small cal-st"></span>`;
    calStatus(); draw(); drawPlot(); nums();
  }
  function calStatus() {
    const el = $(".cal-st"); if (!el) return;
    el.textContent = cal.pts.length >= 2 ? `기울기 ${(cal.s / 59.16 * 100).toFixed(1)}%` : cal.pts.length === 1 ? `영점 ${cal.e7.toFixed(0)} mV` : "출고 상태";
  }
  function calibrate(pH) {
    const E = elE(pH) + 0.3 * L.gauss();
    cal.pts = cal.pts.filter((p) => p.pH !== pH).concat([{ pH, E }]);
    const p7 = cal.pts.find((p) => p.pH === 7), p4 = cal.pts.find((p) => p.pH === 4.01);
    if (p7) cal.e7 = p7.E;
    if (p7 && p4) cal.s = (p4.E - p7.E) / (7 - 4.01);
    else if (p4 && !p7) { cal.e7 = p4.E - 59.16 * (7 - 4.01); }
    calStatus(); draw(); nums();
  }

  $(".qsel").addEventListener("click", (e) => { const b = e.target.closest("[data-q]"); if (b) setQ(b.dataset.q); });
  $(".tsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-t]"); if (!b) return;
    tk = b.dataset.t; root.querySelectorAll("[data-t]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); drawPlot();
  });
  $(".opts").addEventListener("change", (e) => { if (e.target.classList.contains("sys")) opt[Q[qk].opt.key] = e.target.checked; });
  $(".opts").addEventListener("click", (e) => {
    if (e.target.closest(".c7")) calibrate(7);
    else if (e.target.closest(".c4")) calibrate(4.01);
    else if (e.target.closest(".c0")) { cal.e7 = 0; cal.s = 59.16; cal.pts = []; calStatus(); draw(); nums(); }
  });
  $(".meas").addEventListener("click", one);
  $(".meas5").addEventListener("click", () => { for (let i = 0; i < 5; i++) one(); });
  $(".clear").addEventListener("click", () => { tbl.clear(); lastRec = null; draw(); });

  setQ("vol");
  if (L.demo) {
    ["beaker", "cyl", "pip", "bur"].forEach((id) => { tk = id; for (let i = 0; i < 5; i++) one(); });
    setQ("ph");
    ["univ", "narrow", "meter"].forEach((id) => { tk = id; for (let i = 0; i < 3; i++) one(); });
    calibrate(7); calibrate(4.01); tk = "meter"; for (let i = 0; i < 3; i++) one();
    setQ("vol"); tk = "pip"; root.querySelectorAll("[data-t]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.t === "pip"))); draw(); drawPlot();
  }
})();
