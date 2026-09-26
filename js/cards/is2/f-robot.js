/* 카드: 로봇은 어떻게 선을 따라갈까? — 감지·판단·동작의 되먹임과 지연 (모식 모형) */
(() => {
  const root = document.getElementById("card-is2-robot");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sK = $(".gain"), oK = $(".gain-out"), sV = $(".speed"), oV = $(".speed-out"), sD = $(".delay"), oD = $(".delay-out");
  const bGo = $(".go"), bSet = root.querySelectorAll("[data-set]"), msg = $(".rb-msg");
  const [dErr, dMax, dState] = root.querySelectorAll(".nums dd");

  // 트랙: 가로 124 cm, 세로 60 cm 타원 (양 끝 곡률 반지름 약 14.5 cm)
  const N = 600, P = [];
  for (let i = 0; i < N; i++) { const t = i / N * 2 * Math.PI; P.push([80 + 62 * Math.cos(t), 45 + 30 * Math.sin(t)]); }
  const LOOK = 5, SENSE = 3, LOSE = 5, DT = 1 / 240;
  function nearest(x, y, hint) {
    let best = 1e9, bi = hint;
    for (let k = -60; k <= 60; k++) { const i = (hint + k + N) % N, d = (P[i][0] - x) ** 2 + (P[i][1] - y) ** 2; if (d < best) { best = d; bi = i; } }
    const a = P[bi], b = P[(bi + 1) % N], tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty);
    return { i: bi, e: ((x - a[0]) * ty - (y - a[1]) * tx) / tl };
  }

  let S;
  function start() {
    const a = P[0], b = P[1];
    S = { x: a[0], y: a[1], h: Math.atan2(b[1] - a[1], b[0] - a[0]), hint: 0, hintA: 0, om: 0, hist: [], t: 0, lostT: 0, lost: false,
      trail: [], chart: [], errs: [], maxE: 0 };
  }
  function sim(dt) {
    const K = +sK.value, v = +sV.value, delay = +sD.value;
    for (let k = 0; k < Math.round(dt / DT) && !S.lost; k++) {
      // 감지: 바퀴 축보다 LOOK cm 앞에 달린 센서가 선에서 벗어난 거리를 잰다 (±3 cm까지)
      const sx = S.x + LOOK * Math.cos(S.h), sy = S.y + LOOK * Math.sin(S.h);
      const n = nearest(sx, sy, S.hint); S.hint = n.i;
      const seen = Math.abs(n.e) <= LOSE;
      S.hist.push(seen ? Math.max(-SENSE, Math.min(SENSE, n.e)) : null);
      if (S.hist.length > 200) S.hist.shift();
      // 판단: delay초 전에 잰 값을 보고 방향을 정한다 (회전 속도 = K × 벗어난 거리)
      const m = S.hist[S.hist.length - 1 - Math.round(delay / DT)];
      if (m !== undefined && m !== null) S.om = K * m;
      S.lostT = seen ? 0 : S.lostT + DT;
      if (S.lostT > 1.2) { S.lost = true; break; }
      // 동작
      S.h += S.om * DT; S.x += v * Math.cos(S.h) * DT; S.y += v * Math.sin(S.h) * DT; S.t += DT;
      const na = nearest(S.x, S.y, S.hintA); S.hintA = na.i;
      if (S.t > 4) { S.errs.push(Math.abs(na.e)); if (S.errs.length > 240 * 12) S.errs.shift(); S.maxE = Math.max(S.maxE, Math.abs(na.e)); }
      if (k % 12 === 0) { S.trail.push([S.x, S.y]); if (S.trail.length > 500) S.trail.shift(); S.chart.push(na.e); if (S.chart.length > 120) S.chart.shift(); }
    }
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const sc = Math.min(w / 136, h / 72), ox = w / 2 - 80 * sc, oy = h / 2 - 45 * sc;
    const X = (x) => ox + x * sc, Y = (y) => oy + y * sc;
    // 트랙 (폭 2 cm)
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2 * sc; ctx.beginPath();
    P.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); ctx.closePath(); ctx.stroke();
    // 궤적
    ctx.strokeStyle = "rgba(212,73,58,.55)"; ctx.lineWidth = 1.4; ctx.beginPath();
    S.trail.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); ctx.stroke();
    // 로봇
    ctx.save(); ctx.translate(X(S.x), Y(S.y)); ctx.rotate(S.h); ctx.scale(sc, sc);
    ctx.fillStyle = C.forest; ctx.fillRect(-4, -4, 7, 8);
    ctx.fillStyle = C.ink; ctx.fillRect(-2.5, -5.2, 4, 1.4); ctx.fillRect(-2.5, 3.8, 4, 1.4);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(3, 0); ctx.lineTo(LOOK, 0); ctx.stroke();
    ctx.fillStyle = C.amber; ctx.fillRect(LOOK - .6, -SENSE, 1.2, 2 * SENSE);
    ctx.restore();
    // 오차 기록 (중앙)
    const cx = X(80) - 52 * sc / 2 * 1.6, cw = 52 * sc * 1.6, cy = Y(45) - 14 * sc, ch = 28 * sc;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(cx + .5, cy + .5, cw, ch);
    ctx.beginPath(); ctx.moveTo(cx, cy + ch / 2 + .5); ctx.lineTo(cx + cw, cy + ch / 2 + .5); ctx.stroke();
    ctx.beginPath();
    S.chart.forEach((e, i) => { const x = cx + i / 119 * cw, y = cy + ch / 2 - Math.max(-8, Math.min(8, e)) / 8 * ch / 2; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.strokeStyle = C.apple; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("벗어난 거리 · 최근 6초 · ±8 cm", cx + 4, cy + 12);
    if (S.lost) {
      ctx.fillStyle = C.warn; ctx.font = `600 14px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText("선을 놓쳤습니다", X(S.x), Y(S.y) - 14); ctx.textAlign = "left";
    }
  }

  function readout() {
    oK.textContent = (+sK.value).toFixed(1); oV.textContent = sV.value; oD.textContent = (+sD.value).toFixed(2);
    const n = S.errs.length, avg = n ? S.errs.reduce((a, b) => a + b, 0) / n : 0;
    dErr.textContent = n ? `${avg.toFixed(1)} cm` : "—";
    dMax.textContent = n ? `${S.maxE.toFixed(1)} cm` : "—";
    const st = S.lost ? "놓침" : !n ? "출발" : S.maxE > 3 ? "크게 흔들림" : S.maxE > 1.2 ? "조금 흔들림" : "잘 따라감";
    dState.textContent = st; dState.className = S.lost || S.maxE > 3 ? "bad" : st === "잘 따라감" ? "good" : "";
    msg.textContent = S.lost
      ? (+sK.value * SENSE < +sV.value / 14.5 ? "곡선에서 필요한 만큼 방향을 틀지 못했습니다. 조향 세기가 이 속력에 비해 약합니다." : "지연된 정보로 너무 세게 고치다가 선을 넘어가 버렸습니다.")
      : "";
  }

  let tick = 0;
  function restart() { start(); readout(); draw(); }
  [sK, sV, sD].forEach((el) => el.addEventListener("input", restart));
  bGo.addEventListener("click", restart);
  bSet.forEach((b) => b.addEventListener("click", () => { const [k, v, d] = b.dataset.set.split(","); sK.value = k; sV.value = v; sD.value = d; restart(); }));
  start();
  loop(cv, (dt) => {
    if (!S.lost) sim(dt);
    if (++tick % 6 === 0 || S.lost) readout();
    draw();
  });
  readout();
})();
