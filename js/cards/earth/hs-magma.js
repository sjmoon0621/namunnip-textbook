/* 카드: 마그마는 어디서, 왜 만들어질까? — 깊이–온도 그래프의 용융 곡선 (모식) */
(() => {
  const root = document.getElementById("card-earth-magma");
  if (!root) return;
  const { C, F, fit, clamp, ease } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".temp"), sZ = $(".depth"), oT = $(".temp-out"), oZ = $(".depth-out");
  const wet = $(".wet"), nState = $(".nstate"), nSol = $(".nsol"), nMag = $(".nmag");

  const TMAX = 1800, ZMAX = 200, MOHO = 35;
  // 건조한 맨틀 감람암의 용융 시작 곡선: Hirschmann(2000)의 근사식, P(GPa) ≈ 깊이(km)/33
  const dryPer = (z) => { const P = z / 33; return -5.104 * P * P + 132.899 * P + 1120.661; };
  // 물로 포화된 감람암 (모식: 실험 결과의 대략적인 모양만 따름)
  const lerpPts = (pts) => (z) => {
    if (z <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) if (z <= pts[i][0]) { const [z0, t0] = pts[i - 1], [z1, t1] = pts[i]; return t0 + (t1 - t0) * (z - z0) / (z1 - z0); }
    return pts.at(-1)[1];
  };
  const wetPer = lerpPts([[0, 1080], [33, 1000], [66, 900], [100, 820], [133, 830], [166, 860], [200, 900]]);
  const wetGra = lerpPts([[0, 760], [8, 700], [20, 670], [35, 655], [50, 650]]);
  const dryGra = lerpPts([[0, 960], [50, 1050]]);
  // 지하의 평균적인 온도 분포 (대륙 아래, 모식)
  const geo = (z) => 15 + 1330 * (1 - Math.exp(-z / 70)) + 0.3 * z;

  let mat = "mantle", wf = 0; // wf: 물 영향 0~1 (애니메이션)
  let anim = null, trail = [];

  const solidus = (z) => mat === "crust" ? dryGra(z) + (wetGra(z) - dryGra(z)) * wf : dryPer(z) + (wetPer(z) - dryPer(z)) * wf;

  const { ctx, size } = fit(cv, () => draw());
  let G = null;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 46, y0 = 22, pw = w - x0 - 40, ph = h - y0 - 34;
    const X = (t) => x0 + t / TMAX * pw, Y = (z) => y0 + z / ZMAX * ph;
    G = { x0, y0, pw, ph, X, Y };
    // 녹는 영역 칠하기
    const zTop = mat === "crust" ? 0 : 0, zBot = mat === "crust" ? 50 : ZMAX;
    ctx.beginPath(); ctx.moveTo(X(solidus(zTop)), Y(zTop));
    for (let z = zTop; z <= zBot; z += 2) ctx.lineTo(X(solidus(z)), Y(z));
    ctx.lineTo(X(TMAX), Y(zBot)); ctx.lineTo(X(TMAX), Y(zTop)); ctx.closePath();
    ctx.fillStyle = "rgba(212,73,58,.09)"; ctx.fill();
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y,
      xt: [0, 300, 600, 900, 1200, 1500, 1800].map((t) => [t, String(t)]),
      yt: [0, 50, 100, 150, 200].map((z) => [z, String(z)]),
      xlabel: "온도 (°C)", ylabel: "깊이 (km)" });
    // 오른쪽 압력 눈금
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    [0, 2, 4, 6].forEach((P) => ctx.fillText(`${P}`, x0 + pw + 5, Y(P * 33) + 3));
    ctx.fillText("GPa", x0 + pw + 5, y0 - 7);
    // 모호면
    if (mat === "crust" || true) {
      ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, Y(MOHO)); ctx.lineTo(x0 + pw, Y(MOHO)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillText("대륙 지각 아래 경계 (약 35 km)", x0 + 6, Y(MOHO) - 4);
    }
    // 지온선
    ctx.beginPath();
    for (let z = 0; z <= ZMAX; z += 2) { const x = X(geo(z)), y = Y(z); z ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.6; ctx.setLineDash([6, 4]); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`;
    ctx.save(); ctx.translate(X(geo(95)) - 10, Y(95)); ctx.rotate(Math.PI / 2 - 0.35); ctx.textAlign = "center"; ctx.fillText("평소 지하 온도", 0, 0); ctx.restore();
    // 용융 곡선들
    const curve = (fn, z0, z1, col, lw, dash) => {
      ctx.beginPath();
      for (let z = z0; z <= z1; z += 2) { const x = X(fn(z)), y = Y(z); z === z0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
    };
    if (mat === "mantle") {
      curve(dryPer, 0, ZMAX, wf < 0.5 ? C.apple : "rgba(212,73,58,.3)", wf < 0.5 ? 2.2 : 1.2, wf < 0.5 ? [] : [3, 3]);
      curve(wetPer, 0, ZMAX, wf >= 0.5 ? "#3f6d8f" : "rgba(63,109,143,.35)", wf >= 0.5 ? 2.2 : 1.2, wf >= 0.5 ? [] : [3, 3]);
      if (wf > 0.02 && wf < 0.98) curve(solidus, 0, ZMAX, C.ink, 1.5);
      ctx.font = `600 11px ${F.sans}`;
      ctx.fillStyle = C.apple; ctx.textAlign = "right"; ctx.fillText("물 없는 맨틀이 녹기 시작하는 온도", X(dryPer(18)) - 8, Y(18) + 4); ctx.textAlign = "left";
      ctx.fillStyle = "#3f6d8f"; ctx.fillText("물이 있을 때", X(wetPer(120)) - 78, Y(118));
    } else {
      curve(dryGra, 0, 50, wf < 0.5 ? C.apple : "rgba(212,73,58,.3)", wf < 0.5 ? 2.2 : 1.2, wf < 0.5 ? [] : [3, 3]);
      curve(wetGra, 0, 50, wf >= 0.5 ? "#3f6d8f" : "rgba(63,109,143,.35)", wf >= 0.5 ? 2.2 : 1.2, wf >= 0.5 ? [] : [3, 3]);
      ctx.font = `600 11px ${F.sans}`;
      ctx.fillStyle = C.apple; ctx.fillText("물 없는 화강암질 암석", X(dryGra(45)) + 6, Y(46));
      ctx.fillStyle = "#3f6d8f"; ctx.textAlign = "right"; ctx.fillText("물을 품은 화강암질 암석", X(wetGra(45)) - 6, Y(46)); ctx.textAlign = "left";
      ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.fillText("지각 물질이므로 50 km까지만", X(1100), Y(80));
    }
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.warn; ctx.textAlign = "right";
    ctx.fillText("녹는 영역", X(TMAX) - 6, y0 + 14); ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("고체", x0 + 8, y0 + 14);
    // 경로
    if (trail.length > 1) {
      ctx.beginPath(); trail.forEach(([t, z], i) => i ? ctx.lineTo(X(t), Y(z)) : ctx.moveTo(X(t), Y(z)));
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.setLineDash([2, 3]); ctx.stroke(); ctx.setLineDash([]);
    }
    // 암석 덩어리
    const T = +sT.value, z = +sZ.value, melt = T >= solidus(z);
    ctx.beginPath(); ctx.arc(X(T), Y(z), 7, 0, Math.PI * 2);
    ctx.fillStyle = melt ? C.apple : C.ink; ctx.fill();
    ctx.strokeStyle = C.card; ctx.lineWidth = 2; ctx.stroke();
    if (melt) { ctx.beginPath(); ctx.arc(X(T), Y(z), 12, 0, Math.PI * 2); ctx.strokeStyle = C.apple; ctx.lineWidth = 1; ctx.stroke(); }
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.fillText("모식", x0 + 6, y0 + ph - 6);
  }

  function update() {
    const T = +sT.value, z = +sZ.value, s = solidus(z);
    oT.textContent = Math.round(T); oZ.textContent = Math.round(z);
    const melt = T >= s;
    nState.textContent = melt ? "녹기 시작함" : "고체";
    nState.className = melt ? "nstate bad" : "nstate";
    nSol.textContent = `${Math.round(s)} °C`;
    nMag.textContent = !melt ? "—" : mat === "crust" ? "유문암질(화강암질)" : "현무암질";
    draw();
  }
  function setMat(m) {
    mat = m;
    root.querySelectorAll("[data-mat]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.mat === m ? "true" : "false"));
  }
  function setWet(on, animate) {
    wet.checked = on;
    if (!animate || NM.reduce) { wf = on ? 1 : 0; update(); return; }
    const from = wf, to = on ? 1 : 0, t0 = performance.now();
    const step = (now) => { const p = clamp((now - t0) / 1400, 0, 1); wf = from + (to - from) * ease(p); update(); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  // 상황별 경로
  const PRE = {
    ridge: { mat: "mantle", wet: false, from: [1350, 150], to: [1300, 15], note: "해령 아래: 뜨거운 맨틀이 올라오면 온도는 거의 그대로인데 압력이 줄어 녹는점이 낮아집니다." },
    hot: { mat: "mantle", wet: false, from: [1500, 200], to: [1440, 50], note: "열점: 주변보다 뜨거운 맨틀이 깊은 곳에서 올라와 더 깊은 곳에서부터 녹습니다." },
    sub: { mat: "mantle", wet: false, from: [1150, 100], to: [1150, 100], water: true, note: "섭입대: 내려가는 해양판에서 빠져나온 물이 위쪽 맨틀에 들어가 녹는점을 낮춥니다. 온도는 그대로입니다." },
    crust: { mat: "crust", wet: true, from: [560, 30], to: [780, 30], note: "대륙 지각 아래: 올라온 현무암질 마그마가 지각을 데우면, 물을 품은 지각 암석이 녹아 유문암질 마그마가 됩니다." },
  };
  const noteEl = $(".pre-note");
  function run(k) {
    const p = PRE[k]; if (anim) cancelAnimationFrame(anim);
    root.querySelectorAll("[data-pre]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.pre === k ? "true" : "false"));
    setMat(p.mat); wf = p.wet ? 1 : 0; wet.checked = p.wet;
    sT.value = p.from[0]; sZ.value = p.from[1]; trail = [p.from.slice()]; update();
    noteEl.textContent = p.note;
    if (p.water) { setTimeout(() => setWet(true, true), 500); return; }
    if (NM.reduce) { sT.value = p.to[0]; sZ.value = p.to[1]; trail.push(p.to.slice()); update(); return; }
    const t0 = performance.now();
    const step = (now) => {
      const q = clamp((now - t0) / 2600, 0, 1);
      const T = p.from[0] + (p.to[0] - p.from[0]) * q, z = p.from[1] + (p.to[1] - p.from[1]) * q;
      sT.value = T; sZ.value = z; trail.push([T, z]); update();
      if (q < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }
  root.querySelectorAll("[data-pre]").forEach((b) => b.addEventListener("click", () => run(b.dataset.pre)));
  root.querySelectorAll("[data-mat]").forEach((b) => b.addEventListener("click", () => { setMat(b.dataset.mat); trail = []; noteEl.textContent = ""; if (b.dataset.mat === "crust" && +sZ.value > 50) sZ.value = 30; update(); }));
  wet.addEventListener("change", () => setWet(wet.checked, true));
  [sT, sZ].forEach((s) => s.addEventListener("input", () => { trail = []; update(); }));
  // 그래프 위에서 끌기
  const drag = (e) => {
    if (!G) return;
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    sT.value = clamp((x - G.x0) / G.pw * TMAX, 0, TMAX);
    sZ.value = clamp((y - G.y0) / G.ph * ZMAX, 0, mat === "crust" ? 50 : ZMAX);
    trail = []; update();
  };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); if (anim) cancelAnimationFrame(anim); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  setMat("mantle"); update();
})();
