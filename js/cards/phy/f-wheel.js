/* 카드: 이 영구 기관은 왜 돌지 않을까? — 추가 달린 팔이 한쪽으로 펼쳐지는 바퀴의 돌림힘 계산과 놓아 보기 */
(() => {
  const root = document.getElementById("card-phy-wheel");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const [cvW, cvG] = root.querySelectorAll("canvas");
  const sN = $(".wn"), sL = $(".wl"), sA = $(".wa");
  const oN = $(".wn-out"), oL = $(".wl-out"), oA = $(".wa-out");
  const nR = $(".w-right"), nLf = $(".w-left"), nT = $(".w-net");

  const R = 1, K = 60; // 팔 각도 탐색 칸 수
  let phi = 0, om = 0, running = false, tRun = 0;

  // 팔은 바퀴 테두리의 경첩에 달려 있고, 바퀴에 대해 δ ∈ [0°, 90°] 범위에서만 움직인다.
  // 그 범위 안에서 추가 가장 낮은 자리에 놓인다고 본다(천천히 돌 때).
  function conf(p) {
    const N = +sN.value, l = +sL.value, out = [];
    for (let i = 0; i < N; i++) {
      const a = -p + 2 * Math.PI * i / N; // 경첩의 각 (반시계 기준), p: 시계 방향 회전각
      let best = null;
      for (let k = 0; k <= K; k++) {
        const b = a + k / K * Math.PI / 2;
        const x = R * Math.cos(a) + l * Math.cos(b), y = R * Math.sin(a) + l * Math.sin(b);
        if (!best || y < best.y - 1e-12) best = { hx: R * Math.cos(a), hy: R * Math.sin(a), x, y };
      }
      out.push(best);
    }
    return out;
  }
  // 시계 방향 돌림힘 (단위: 추 하나의 무게 × 바퀴 반지름)
  const torque = (c) => c.reduce((s, q) => s + q.x, 0);

  function numbers() {
    const c = conf(phi);
    const r = c.filter((q) => q.x > 1e-9), lft = c.filter((q) => q.x < -1e-9);
    nR.textContent = `${r.length}개 · ${torque(r).toFixed(2)}`;
    nLf.textContent = `${lft.length}개 · ${(-torque(lft)).toFixed(2)}`;
    const t = torque(c);
    nT.textContent = `${t >= 0 ? "+" : ""}${t.toFixed(2)} ${Math.abs(t) < 0.005 ? "" : t > 0 ? "(시계)" : "(반시계)"}`;
  }
  function sync() {
    oN.textContent = sN.value; oL.textContent = (+sL.value).toFixed(2);
    oA.textContent = Math.round(((phi * 180 / Math.PI) % 360 + 360) % 360);
  }

  const A = fit(cvW, () => drawW());
  const B = fit(cvG, () => drawG());

  function drawW() {
    const { ctx, size: { w, h } } = A; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const l = +sL.value, s = Math.min(w, h) / (2 * (R + l) + 0.5), cx = w / 2, cy = h / 2;
    const X = (x) => cx + x * s, Y = (y) => cy - y * s;
    // 가운데 세로선 (왼쪽 · 오른쪽 구분)
    ctx.setLineDash([3, 4]); ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, 6); ctx.lineTo(cx, h - 6); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, R * s, 0, Math.PI * 2); ctx.stroke();
    const c = conf(phi);
    c.forEach((q) => {
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(X(q.hx), Y(q.hy)); ctx.stroke();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X(q.hx), Y(q.hy)); ctx.lineTo(X(q.x), Y(q.y)); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(q.x), Y(q.y), 6, 0, Math.PI * 2);
      ctx.fillStyle = q.x > 1e-9 ? C.forest : q.x < -1e-9 ? C.amber : C.ink3; ctx.fill();
    });
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.forest; ctx.textAlign = "right"; ctx.fillText("오른쪽: 멀리, 적게", w - 6, 14);
    ctx.fillStyle = C.amber; ctx.textAlign = "left"; ctx.fillText("왼쪽: 가까이, 많이", 6, 14);
    if (running) { ctx.fillStyle = C.ink3; ctx.fillText(`ω = ${om.toFixed(2)} rad/s`, 6, h - 8); }
  }

  function drawG() {
    const { ctx, size: { w, h } } = B; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const N = +sN.value, P = 2 * Math.PI / N, M = 120;
    const vals = []; let sum = 0;
    for (let j = 0; j < M; j++) { const t = torque(conf(j / M * P)); vals.push(t); sum += t; }
    const mean = sum / M, tm = Math.max(0.5, ...vals.map(Math.abs)) * 1.15;
    const x0 = 36, y0 = 24, pw = w - x0 - 10, ph = h - y0 - 34;
    const X = (a) => x0 + a / P * pw, Y = (t) => y0 + (1 - (t + tm) / (2 * tm)) * ph;
    const deg = 360 / N;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [[0, "0°"], [P / 2, `${(deg / 2).toFixed(0)}°`], [P, `${deg.toFixed(0)}°`]],
      yt: [[-tm / 1.15, (-tm / 1.15).toFixed(1)], [0, "0"], [tm / 1.15, (tm / 1.15).toFixed(1)]], ylabel: "알짜 돌림힘 (+ 시계 방향)", xlabel: "바퀴 회전각 (한 주기)" });
    ctx.fillStyle = "rgba(59,124,42,.14)";
    ctx.beginPath(); ctx.moveTo(X(0), Y(0));
    vals.forEach((t, j) => ctx.lineTo(X(j / M * P), Y(t))); ctx.lineTo(X(P), Y(0)); ctx.closePath(); ctx.fill();
    ctx.beginPath(); vals.forEach((t, j) => j ? ctx.lineTo(X(j / M * P), Y(t)) : ctx.moveTo(X(0), Y(t)));
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
    ctx.setLineDash([4, 3]); ctx.strokeStyle = C.warn; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(X(0), Y(mean)); ctx.lineTo(X(P), Y(mean)); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.warn; ctx.textAlign = "right";
    ctx.fillText(`평균 ${Math.abs(mean) < 0.005 ? "0.00" : mean.toFixed(2)}`, X(P), Y(mean) - 5);
    const pm = ((phi % P) + P) % P;
    ctx.beginPath(); ctx.arc(X(pm), Y(torque(conf(phi))), 5, 0, Math.PI * 2); ctx.fillStyle = C.forest; ctx.fill();
    ctx.textAlign = "left";
  }

  function all() { sync(); numbers(); drawW(); drawG(); }
  sN.addEventListener("input", () => { running = false; all(); });
  sL.addEventListener("input", () => { running = false; all(); });
  sA.addEventListener("input", () => { running = false; phi = +sA.value * Math.PI / 180; all(); });
  $(".w-go").addEventListener("click", () => { running = true; om = 1.5; tRun = 0; });
  all();

  // 놓아 보기: I φ'' = τ(φ) − bφ'. 팔이 넘어갈 때 추가 받침에 부딪히며 에너지를 잃는다(모식: 작은 감쇠).
  loop(cvW, (dt) => {
    if (!running) return;
    const I = +sN.value * (R + +sL.value * 0.7) ** 2 / 9.81; // 단위를 맞춘 관성 모멘트(모식)
    for (let i = 0; i < 8; i++) {
      const h = dt / 8, tq = torque(conf(phi));
      om += (tq / I - 0.35 * om) * h; phi += om * h;
    }
    tRun += dt;
    if (tRun > 25 || (Math.abs(om) < 0.01 && Math.abs(torque(conf(phi))) < 0.08)) { running = false; om = 0; }
    sA.value = Math.round(((phi * 180 / Math.PI) % 360 + 360) % 360);
    all();
  });
})();
