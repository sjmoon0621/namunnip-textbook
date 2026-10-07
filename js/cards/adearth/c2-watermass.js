/* 카드: 바닷속 한 지점의 물은 어디에서 온 물일까? — 수온–염분도의 혼합 삼각형과 카벨링 (EOS-80, 수면 기압) */
(() => {
  const root = document.getElementById("card-adearth-watermass");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), st = $(".wm-state"), nF = $(".n-f"), nTS = $(".n-ts"), nS = $(".n-s");
  /* UNESCO 1981 (EOS-80) 1기압 밀도 */
  function rho(t, s) {
    const rw = 999.842594 + 6.793952e-2 * t - 9.09529e-3 * t * t + 1.001685e-4 * t ** 3 - 1.120083e-6 * t ** 4 + 6.536332e-9 * t ** 5;
    const A = 0.824493 - 4.0899e-3 * t + 7.6438e-5 * t * t - 8.2467e-7 * t ** 3 + 5.3875e-9 * t ** 4;
    const B = -5.72466e-3 + 1.0227e-4 * t - 1.6546e-6 * t * t;
    return rw + A * s + B * s ** 1.5 + 4.8314e-4 * s * s;
  }
  const sig = (t, s) => rho(t, s) - 1000;
  const sAt = (t, sg) => { let lo = 0, hi = 42; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (sig(t, m) < sg) lo = m; else hi = m; } return (lo + hi) / 2; };
  const cabS = sAt(8, sig(-1, 34.0));
  const SETS = {
    mid: { m: [["남극 중층수", 4.0, 34.3, "#3f6fa3"], ["지중해수", 11.5, 36.5, C.apple], ["북대서양 심층수", 3.0, 34.95, C.forest]], S: [34.0, 36.8], T: [0, 14] },
    deep: { m: [["북대서양 심층수", 3.0, 34.95, C.forest], ["남극 저층수", -0.5, 34.66, "#8a4fb5"], ["남극 중층수", 4.0, 34.3, "#3f6fa3"]], S: [34.1, 35.1], T: [-1.5, 6] },
    cab: { m: [["차고 덜 짠 물", -1.0, 34.0, "#3f6fa3"], ["따뜻하고 짠 물", 8.0, cabS, C.apple]], S: [33.8, 35.4], T: [-2, 10] },
  };
  let key = "mid", lam = [1 / 3, 1 / 3, 1 / 3];
  const set = () => SETS[key];
  const mix = () => { const m = set().m; let t = 0, s = 0; m.forEach((q, i) => { t += lam[i] * q[1]; s += lam[i] * q[2]; }); return [t, s]; };
  const { ctx, size } = fit(cv, () => draw());
  let geo = null;
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = set(), x0 = 44, x1 = w - 14, y0 = 20, y1 = h - 36;
    const X = (s) => x0 + (s - k.S[0]) / (k.S[1] - k.S[0]) * (x1 - x0), Y = (t) => y1 - (t - k.T[0]) / (k.T[1] - k.T[0]) * (y1 - y0);
    geo = { X, Y, x0, x1, y0, y1, k };
    const sstep = k.S[1] - k.S[0] > 2 ? 0.5 : 0.2, tstep = k.T[1] - k.T[0] > 10 ? 2 : 1, xt = [], yt = [];
    for (let s = Math.ceil(k.S[0] / sstep) * sstep; s <= k.S[1] + 1e-9; s += sstep) xt.push([s, s.toFixed(1)]);
    for (let t = Math.ceil(k.T[0] / tstep) * tstep; t <= k.T[1] + 1e-9; t += tstep) yt.push([t, `${t}`.replace("-", "−")]);
    NM.axes(ctx, { x0, y0, w: x1 - x0, h: y1 - y0, X, Y, xt, yt, xlabel: "염분 (psu)", ylabel: "온위 θ (°C)" });
    /* 등밀도선 */
    const smin = sig(k.T[1], k.S[0]), smax = sig(k.T[0], k.S[1]), dsg = smax - smin > 3 ? 0.5 : 0.1;
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
    for (let sg = Math.ceil(smin / dsg) * dsg; sg <= smax; sg += dsg) {
      ctx.strokeStyle = "rgba(141,141,146,.75)"; ctx.lineWidth = 1; ctx.beginPath(); let last = null;
      for (let i = 0; i <= 80; i++) { const t = k.T[0] + (k.T[1] - k.T[0]) * i / 80, s = sAt(t, sg); i ? ctx.lineTo(X(s), Y(t)) : ctx.moveTo(X(s), Y(t)); if (s >= k.S[0] && s <= k.S[1]) last = [s, t]; }
      ctx.stroke();
      if (last && Math.round(sg / dsg) % (dsg < 0.2 ? 2 : 1) === 0) { ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.mono}`; ctx.textAlign = "left"; const [ls, lt] = last; ctx.fillText(sg.toFixed(dsg < 0.2 ? 1 : 1), Math.min(X(ls) + 3, x1 - 26), Math.max(y0 + 10, Y(lt) + 10)); }
    }
    ctx.restore();
    /* 삼각형·선분 */
    const m = k.m;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.4; ctx.fillStyle = "rgba(116,171,102,.12)"; ctx.beginPath();
    m.forEach((q, i) => (i ? ctx.lineTo(X(q[2]), Y(q[1])) : ctx.moveTo(X(q[2]), Y(q[1])))); ctx.closePath(); if (m.length === 3) ctx.fill(); ctx.stroke();
    m.forEach((q) => {
      ctx.fillStyle = q[3]; ctx.beginPath(); ctx.arc(X(q[2]), Y(q[1]), 6, 0, Math.PI * 2); ctx.fill();
      ctx.font = `600 11px ${F.sans}`; const right = X(q[2]) > (x0 + x1) / 2; ctx.textAlign = right ? "right" : "left";
      ctx.fillText(q[0], X(q[2]) + (right ? -9 : 9), Y(q[1]) + (Y(q[1]) < y0 + 14 ? 14 : -7));
    });
    const [tm, sm] = mix();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(sm), Y(tm), 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
  }
  function update() {
    root.querySelectorAll("[data-k]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.k === key)));
    const k = set(), [t, s] = mix(), sg = sig(t, s);
    nF.innerHTML = k.m.map((q, i) => `${Math.round(lam[i] * 100)}`).join(" : ") + " %";
    nTS.textContent = `${t.toFixed(1).replace("-", "−")} °C · ${s.toFixed(2)}`;
    nS.textContent = sg.toFixed(2);
    const ms = k.m.map((q) => sig(q[1], q[2]));
    if (key === "cab") st.textContent = `두 물의 σθ는 모두 ${ms[0].toFixed(2)}입니다. 섞은 물은 ${sg.toFixed(2)}로 ${(sg - ms[0]).toFixed(3)} kg/m³ 무거워, 원래 두 물보다 아래로 가라앉습니다.`;
    else st.textContent = `순서대로 ${k.m.map((q, i) => `${q[0]} σθ ${ms[i].toFixed(2)}`).join(", ")}. 섞인 물(검은 점)의 σθ는 ${sg.toFixed(2)}입니다.`;
    draw();
  }
  function pick(ev) {
    if (!geo) return; const r = cv.getBoundingClientRect(), px = ev.clientX - r.left, py = ev.clientY - r.top, k = geo.k;
    const s = k.S[0] + (px - geo.x0) / (geo.x1 - geo.x0) * (k.S[1] - k.S[0]), t = k.T[0] + (geo.y1 - py) / (geo.y1 - geo.y0) * (k.T[1] - k.T[0]);
    const m = k.m, nx = (q) => (q[2] - k.S[0]) / (k.S[1] - k.S[0]), ny = (q) => (q[1] - k.T[0]) / (k.T[1] - k.T[0]), ps = (s - k.S[0]) / (k.S[1] - k.S[0]), pt = (t - k.T[0]) / (k.T[1] - k.T[0]);
    if (m.length === 2) {
      const ax = nx(m[0]), ay = ny(m[0]), bx = nx(m[1]), by = ny(m[1]);
      const u = clamp(((ps - ax) * (bx - ax) + (pt - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2), 0, 1); lam = [1 - u, u];
    } else {
      const [a, b, c] = m.map((q) => [nx(q), ny(q)]), d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
      let l1 = ((b[1] - c[1]) * (ps - c[0]) + (c[0] - b[0]) * (pt - c[1])) / d, l2 = ((c[1] - a[1]) * (ps - c[0]) + (a[0] - c[0]) * (pt - c[1])) / d;
      l1 = Math.max(0, l1); l2 = Math.max(0, l2); let l3 = Math.max(0, 1 - l1 - l2); const sum = l1 + l2 + l3; lam = [l1 / sum, l2 / sum, l3 / sum];
    }
    update();
  }
  let down = false;
  cv.addEventListener("pointerdown", (e) => { down = true; cv.setPointerCapture(e.pointerId); pick(e); });
  cv.addEventListener("pointermove", (e) => { if (down) pick(e); });
  cv.addEventListener("pointerup", () => { down = false; });
  root.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => { key = b.dataset.k; lam = set().m.length === 3 ? [1 / 3, 1 / 3, 1 / 3] : [0.5, 0.5]; update(); }));
  update();
})();
