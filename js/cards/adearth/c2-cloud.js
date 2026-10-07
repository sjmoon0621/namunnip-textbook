/* 카드: 안개와 구름은 어떤 길로 포화에 이를까? — e–T 그래프 위의 냉각·혼합·증발·단열 상승 경로와 빙정 과정 */
(() => {
  const root = document.getElementById("card-adearth-cloud");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), sD = $(".d"), sB = $(".b"), sS = $(".s");
  const oT = $(".t-out"), oD = $(".d-out"), oB = $(".b-out"), oS = $(".s-out"), st = $(".cl-state");
  const nRH = $(".n-rh"), nZ = $(".n-z"), nCC = $(".n-cc");
  let mode = "cool";
  const L = 2.5e6, RV = 461.5, RD = 287.04, CP = 1005, G = 9.81, EPS = 0.622;
  const esw = (t) => 6.112 * Math.exp(17.67 * t / (t + 243.5));
  const esi = (t) => 6.112 * Math.exp(22.46 * t / (t + 272.62));
  const ecc = (t) => 6.112 * Math.exp((L / RV) * (1 / 273.15 - 1 / (t + 273.15)));
  const fmt = (x, d = 1) => x.toFixed(d).replace("-", "−");
  function moistLapse(t, p) {
    const T = t + 273.15, es = esw(t), w = EPS * es / (p - es);
    return G * (1 + L * w / (RD * T)) / (CP + L * L * w * EPS / (RD * T * T));
  }
  /* 경로: [{t, e, z, p}] 목록과 포화가 시작되는 지점 */
  function path() {
    const t0 = +sT.value, td = Math.min(+sD.value, t0), e0 = esw(td), pts = [];
    if (mode === "cool") {
      const t1 = td - 6;
      for (let i = 0; i <= 200; i++) { const t = t0 + (t1 - t0) * i / 200; pts.push({ t, e: Math.min(e0, esw(t)), sup: 0 }); }
    } else if (mode === "evap") {
      const k = CP * 1000 / (EPS * L);
      let tw = t0; while (tw > -40 && e0 + k * (t0 - tw) < esw(tw)) tw -= 0.01;
      for (let i = 0; i <= 200; i++) { const t = t0 + (tw - t0) * i / 200; pts.push({ t, e: e0 + k * (t0 - t), sup: 0 }); }
      pts.tw = tw;
    } else if (mode === "mix") {
      const tb = +sB.value, eb = esw(tb);
      for (let i = 0; i <= 200; i++) { const f = i / 200; pts.push({ t: t0 + (tb - t0) * f, e: e0 + (eb - e0) * f, f }); }
    } else {
      let t = t0, z = 0, p = 1000, sat = false, zl = 0;
      const dz = 10;
      for (let i = 0; i < 2000; i++) {
        const e = sat ? esw(t) : e0 * p / 1000;
        pts.push({ t, e, z, p });
        if (!sat && e >= esw(t)) { sat = true; zl = z; }
        if (sat && z > zl + 1500) break;
        if (!sat && z > 6000) break;
        const lap = sat ? moistLapse(t, p) : G / CP;
        const T = t + 273.15; p *= Math.exp(-G * dz / (RD * T)); t -= lap * dz; z += dz;
      }
      pts.zl = sat ? zl : NaN;
    }
    return pts;
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 42, x1 = w - 12, y0 = 18, y1 = h * 0.64, TMIN = -25, TMAX = 35, EMAX = 60;
    const X = (t) => x0 + (t - TMIN) / (TMAX - TMIN) * (x1 - x0), Y = (e) => y1 - e / EMAX * (y1 - y0);
    NM.axes(ctx, { x0, y0, w: x1 - x0, h: y1 - y0, X, Y, xt: [-20, -10, 0, 10, 20, 30].map((v) => [v, fmt(v, 0)]), yt: [0, 10, 20, 30, 40, 50, 60].map((v) => [v, `${v}`]), xlabel: "기온 (°C)", ylabel: "수증기압 e (hPa)" });
    const curve = (fn, a, b, col, lw, dash) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath(); for (let i = 0; i <= 200; i++) { const t = a + (b - a) * i / 200, e = fn(t); if (e > EMAX) break; i ? ctx.lineTo(X(t), Y(e)) : ctx.moveTo(X(t), Y(e)); } ctx.stroke(); ctx.setLineDash([]); };
    /* 포화 위쪽(과포화) 영역 옅게 칠하기 */
    ctx.fillStyle = "rgba(63,111,163,.07)"; ctx.beginPath(); ctx.moveTo(X(TMIN), Y(EMAX));
    for (let i = 0; i <= 200; i++) { const t = TMIN + (TMAX - TMIN) * i / 200; ctx.lineTo(X(t), Y(Math.min(EMAX, esw(t)))); }
    ctx.lineTo(X(TMAX), Y(EMAX)); ctx.fill();
    curve(esi, TMIN, 0, "#58b4d8", 1.6);
    curve(ecc, TMIN, TMAX, "#8d8d92", 1.3, [4, 3]);
    curve(esw, TMIN, TMAX, "#3f6fa3", 2.2);
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = "#3f6fa3"; ctx.textAlign = "right"; ctx.fillText("물에 대한 포화 곡선 (위쪽은 과포화)", X(17), Y(esw(17)) - 26);
    ctx.fillStyle = "#3f6fa3"; ctx.textAlign = "left"; ctx.fillText("불포화", X(22), Y(8));
    const pts = path(), s = +sS.value / 100, k = Math.round(s * (pts.length - 1)), cur = pts[k];
    /* 전체 경로(점선)와 진행한 부분(실선) */
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]); ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(X(q.t), Y(q.e)) : ctx.moveTo(X(q.t), Y(q.e)))); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.6; ctx.beginPath(); for (let i = 0; i <= k; i++) { const q = pts[i]; i ? ctx.lineTo(X(q.t), Y(q.e)) : ctx.moveTo(X(q.t), Y(q.e)); } ctx.stroke();
    const dot = (t, e, col, lab, dx = 6, dy = -6, al = "left") => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(t), Y(e), 4.5, 0, Math.PI * 2); ctx.fill(); if (lab) { ctx.font = `600 11px ${F.sans}`; ctx.textAlign = al; ctx.fillText(lab, X(t) + dx, Y(e) + dy); } };
    dot(pts[0].t, pts[0].e, C.ink, "A", 7, -7);
    if (mode === "mix") dot(+sB.value, esw(+sB.value), "#58b4d8", "B", -8, -7, "right");
    const rh = cur.e / esw(cur.t);
    dot(cur.t, cur.e, rh > 1.0005 ? C.warn : C.forest, "");
    /* 아래: 물과 얼음의 포화 수증기압 차 */
    const by0 = h * 0.75, by1 = h - 24, bx0 = x0, bx1 = x1, BT0 = -40, BT1 = 0, BD = 0.3;
    const BX = (t) => bx0 + (t - BT0) / (BT1 - BT0) * (bx1 - bx0), BY = (d) => by1 - d / BD * (by1 - by0);
    NM.axes(ctx, { x0: bx0, y0: by0, w: bx1 - bx0, h: by1 - by0, X: BX, Y: BY, xt: [-40, -30, -20, -10, 0].map((v) => [v, fmt(v, 0)]), yt: [[0, "0"], [0.1, "0.1"], [0.2, "0.2"], [0.3, "0.3"]], ylabel: "e_s(물) − e_s(얼음) (hPa)" });
    ctx.strokeStyle = "#58b4d8"; ctx.lineWidth = 2; ctx.beginPath(); let best = -1, tb = 0;
    for (let i = 0; i <= 200; i++) { const t = BT0 + (BT1 - BT0) * i / 200, d = esw(t) - esi(t); if (d > best) { best = d; tb = t; } i ? ctx.lineTo(BX(t), BY(d)) : ctx.moveTo(BX(t), BY(d)); }
    ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(BX(tb), by0); ctx.lineTo(BX(tb), by1); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`최대 ${fmt(tb, 0)} °C`, BX(tb) + 4, by0 + 10);
    if (cur.t < 0 && cur.t > BT0) { const d = esw(cur.t) - esi(cur.t); ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(BX(cur.t), BY(d), 4, 0, Math.PI * 2); ctx.fill(); }
  }
  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === mode)));
    root.querySelectorAll(".x-mix").forEach((e) => (e.hidden = mode !== "mix"));
    if (+sD.value > +sT.value) sD.value = sT.value;
    oT.textContent = fmt(+sT.value); oD.textContent = fmt(+sD.value); oB.textContent = fmt(+sB.value); oS.textContent = sS.value;
    const pts = path(), cur = pts[Math.round(+sS.value / 100 * (pts.length - 1))], rh = cur.e / esw(cur.t);
    nRH.textContent = `${(rh * 100).toFixed(0)} %`; nRH.className = rh > 1.0005 ? "n-rh bad" : "n-rh";
    nZ.textContent = mode === "lift" ? `${(cur.z / 1000).toFixed(2)} km · ${fmt(cur.t)} °C` : `지표 · ${fmt(cur.t)} °C`;
    const T = cur.t + 273.15; nCC.textContent = `${(100 * L / (RV * T * T)).toFixed(1)} %`;
    const t0 = +sT.value, td = Math.min(+sD.value, t0);
    let msg = "";
    if (mode === "cool") msg = `수증기압은 그대로이고 기온만 내려갑니다. 이슬점 ${fmt(td)} °C에서 포화되며, 더 식으면 남는 수증기가 응결해 곡선을 따라 내려갑니다. 밤의 복사 냉각이면 복사 안개, 찬 바다 위로 옮겨 간 공기라면 이류 안개입니다.`;
    else if (mode === "evap") msg = `빗방울이 증발하면 수증기는 늘지만 증발열 때문에 공기는 식습니다(기울기 −c<sub>p</sub>p/(εL) ≈ −0.65 hPa/K). 습구 온도 ${fmt(pts.tw)} °C에서 포화되며, 전선 아래에서 생기는 전선 안개가 이 경로입니다.`;
    else if (mode === "mix") { let mx = 0; pts.forEach((q) => (mx = Math.max(mx, q.e / esw(q.t)))); msg = mx > 1.0005 ? `직선(혼합선)이 아래로 볼록한 포화 곡선 위로 올라갑니다. 섞는 도중 상대 습도가 최대 ${(mx * 100).toFixed(0)} %가 되어 남는 수증기가 응결합니다. 찬 공기가 따뜻한 수면 위 습한 공기와 섞이는 증기 안개, 추운 날 입김이 이 경우입니다.` : "이 두 공기는 어떤 비율로 섞어도 포화되지 않습니다. A를 더 습하게 하거나 두 공기의 기온 차를 키워 보세요."; }
    else msg = isFinite(pts.zl) ? `건조 단열 감률(9.8 K/km)로 식는 동안 기압이 낮아져 e도 줄어듭니다. ${(pts.zl / 1000).toFixed(2)} km(125 m × ${fmt(t0 - td)} = ${(0.125 * (t0 - td)).toFixed(2)} km와 비교)에서 포화되어 구름 밑면이 되고, 그 위에서는 숨은열 때문에 습윤 단열 감률로 천천히 식습니다.` : "6 km까지 올라가도 포화되지 않습니다.";
    st.innerHTML = msg;
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; sS.value = mode === "mix" ? 50 : 70; update(); }));
  [sT, sD, sB, sS].forEach((x) => x.addEventListener("input", update));
  update();
})();
