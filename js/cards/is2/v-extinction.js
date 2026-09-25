/* 카드: 대멸종 뒤에는 무슨 일이 일어났을까? — 빈자리 채우기 모식 모형 */
(() => {
  const root = document.getElementById("card-is2-extinction");
  if (!root) return;
  const { C, F, clamp, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), fS = $(".kill"), fO = $(".kill-out"), again = $(".again");
  const nLeft = $(".left"), nRec = $(".rec"), nB = $(".bshare"), msg = $(".msg");

  // 모식 모형: 생태적 자리(총 100)를 두 집단이 나눠 차지한다.
  // 대멸종 전에는 자리가 꽉 차 있어 비율이 그대로 유지되고, 멸종 뒤에는 각 집단이 자기 크기에 비례해 빈자리를 채운다.
  const K = 100, A0 = 80, B0 = 20, r = 0.5; // r: 1백만 년당 (가정)
  const T1 = -6, T2 = 30;
  const COL = { A: "#c98a5a", B: C.forest };
  let sel = "A", prog = 1;

  const WTS = { none: [1, 1], A: [0.15, 1.6], B: [1.6, 0.15] };
  function survivors(f) {
    const s = 1 - f, [wa, wb] = WTS[sel];
    const tot = (l) => A0 * Math.min(1, l * wa * s) + B0 * Math.min(1, l * wb * s);
    let lo = 0, hi = 1e4;
    for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; tot(m) < s * K ? lo = m : hi = m; }
    return [A0 * Math.min(1, lo * wa * s), B0 * Math.min(1, lo * wb * s)];
  }
  function simulate() {
    const f = +fS.value / 100, [a0, b0] = survivors(f);
    const pts = [];
    for (let t = T1; t < 0; t += 0.5) pts.push([t, A0, B0]);
    let a = a0, b = b0, t = 0, rec = null;
    const dt = 0.02;
    pts.push([-1e-6, A0, B0]); pts.push([0, a, b]);
    while (t < T2) {
      const E = (K - a - b) / K;
      a += r * a * E * dt; b += r * b * E * dt; t += dt;
      if (rec === null && a + b >= 0.9 * K) rec = t;
      if (Math.round(t / dt) % 10 === 0) pts.push([t, a, b]);
    }
    return { pts, a0, b0, rec: a0 + b0 >= 0.9 * K ? 0 : rec, aEnd: a, bEnd: b };
  }

  let S = simulate();
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 34, y0 = 20, pw = w - x0 - 12, ph = h - y0 - 36;
    const X = (t) => x0 + (t - T1) / (T2 - T1) * pw, Y = (v) => y0 + (1 - v / K) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y,
      xt: [[0, "0"], [10, "1천만"], [20, "2천만"], [30, "3천만"]],
      yt: [[0, "0"], [50, "50"], [100, "100"]], ylabel: "다양성 (상대값)", xlabel: "멸종 뒤 흐른 시간 (년)" });
    const tNow = T1 + (T2 - T1) * prog;
    const vis = S.pts.filter((p) => p[0] <= tNow);
    if (vis.length > 1) {
      // B(아래) 위에 A를 쌓는다
      ctx.beginPath(); ctx.moveTo(X(vis[0][0]), Y(0));
      for (const [t, , b] of vis) ctx.lineTo(X(t), Y(b));
      ctx.lineTo(X(vis.at(-1)[0]), Y(0)); ctx.closePath(); ctx.fillStyle = COL.B; ctx.globalAlpha = .75; ctx.fill();
      ctx.beginPath(); ctx.moveTo(X(vis[0][0]), Y(vis[0][2]));
      for (const [t, , b] of vis) ctx.lineTo(X(t), Y(b));
      for (let i = vis.length - 1; i >= 0; i--) ctx.lineTo(X(vis[i][0]), Y(vis[i][1] + vis[i][2]));
      ctx.closePath(); ctx.fillStyle = COL.A; ctx.fill(); ctx.globalAlpha = 1;
    }
    // 멸종 시점
    ctx.strokeStyle = C.warn; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(X(0) + .5, y0); ctx.lineTo(X(0) + .5, y0 + ph); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.warn; ctx.textAlign = "left"; ctx.fillText("대멸종", X(0) + 4, y0 + 11);
    if (S.rec && prog >= (S.rec - T1) / (T2 - T1)) {
      ctx.strokeStyle = C.ink2; ctx.beginPath(); ctx.moveTo(X(S.rec) + .5, Y(90)); ctx.lineTo(X(S.rec) + .5, y0 + ph); ctx.stroke();
      ctx.fillStyle = C.ink2; ctx.fillText("90% 회복", Math.min(X(S.rec) + 4, x0 + pw - 52), Y(90) - 5);
    }
    // 범례
    ctx.textAlign = "left"; ctx.font = `11px ${F.sans}`;
    const lx = x0 + pw * 0.42, ly = y0 + 12;
    ctx.fillStyle = COL.A; ctx.fillRect(lx, ly - 9, 10, 10); ctx.fillStyle = C.ink2; ctx.fillText("우세하던 집단", lx + 14, ly);
    const lx2 = lx + 14 + ctx.measureText("우세하던 집단").width + 14;
    ctx.fillStyle = COL.B; ctx.fillRect(lx2, ly - 9, 10, 10); ctx.fillStyle = C.ink2; ctx.fillText("작은 집단", lx2 + 14, ly);
  }

  function update() {
    fO.textContent = fS.value;
    S = simulate();
    const left = S.a0 + S.b0;
    nLeft.textContent = `${left.toFixed(left < 10 ? 1 : 0)}%`;
    nRec.textContent = S.rec === 0 ? "곧바로" : S.rec ? `약 ${(Math.round(S.rec * 10) * 10).toLocaleString()}만 년` : "3천만 년 넘게";
    const bs = 100 * S.bEnd / (S.aEnd + S.bEnd);
    nB.textContent = `${B0}% → ${Math.round(bs)}%`;
    msg.textContent = sel === "none"
      ? "무차별 멸종에서는 살아남은 비율이 전과 같아서, 회복한 뒤의 구성도 전과 같습니다."
      : sel === "A" ? "우세하던 집단이 더 크게 사라지면, 작은 집단이 빈자리를 먼저 차지해 주인공이 바뀝니다."
      : "작은 집단이 더 크게 사라지면 기존 구도가 더 굳어집니다.";
    root.querySelectorAll("[data-sel]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.sel === sel)));
    prog = NM.reduce ? 1 : 0;
    draw();
  }
  fS.addEventListener("input", update);
  root.querySelectorAll("[data-sel]").forEach((b) => b.addEventListener("click", () => { sel = b.dataset.sel; update(); }));
  root.querySelectorAll("[data-kill]").forEach((b) => b.addEventListener("click", () => { fS.value = b.dataset.kill; update(); }));
  again.addEventListener("click", () => { prog = 0; });
  update();
  loop(cv, (dt) => {
    if (prog >= 1) return;
    prog = clamp(prog + dt / 3, 0, 1); draw();
  });
})();
