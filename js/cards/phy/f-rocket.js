/* 카드: 로켓은 무엇을 밀고 나아갈까? — 연료를 n번에 나눠 뿜을 때 운동량 보존으로 속력 계산 */
(() => {
  const root = document.getElementById("card-phy-rocket");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const [cvA, cvB] = root.querySelectorAll("canvas");
  const sF = $(".fuel"), sU = $(".ue"), oF = $(".fuel-out"), oU = $(".ue-out");
  const nV = $(".vfin"), nLim = $(".vlim"), nP = $(".psum");

  let n = 5;
  // 질량은 처음 전체 질량을 1로 둔 상대값. 속력은 km/s.
  function plan(nn = n) {
    const f = +sF.value, u = +sU.value, dm = f / nn;
    let M = 1, v = 0; const shots = [];
    for (let i = 0; i < nn; i++) {
      v = v + u * dm / M;               // M v = (M − dm) v' + dm (v' − u)
      M -= dm;
      shots.push({ v, M, gas: v - u, dm });
    }
    return { f, u, dm, shots, vf: v, lim: u * Math.log(1 / (1 - f)) };
  }

  let P, clock = 0;
  const T0 = 0.4, BURN = 2.4, HOLD = 1.6;
  const tShot = (i) => T0 + (P.shots.length === 1 ? 0 : i * BURN / (P.shots.length - 1));
  function reset() {
    P = plan(); clock = 0;
    oF.textContent = Math.round(P.f * 100); oU.textContent = P.u.toFixed(1);
    nV.textContent = `${P.vf.toFixed(2)} km/s`; nLim.textContent = `${P.lim.toFixed(2)} km/s`;
    drawB();
  }

  const A = fit(cvA, () => drawA());
  const B = fit(cvB, () => drawB());

  // 시각 t에서 로켓과 기체 덩어리의 위치(연료 분사 전 정지 좌표계). k: km/s → px/s
  function scene(t, k) {
    let x = 0, vr = 0, M = 1, last = 0;
    const gas = [];
    P.shots.forEach((s, i) => {
      const ts = tShot(i); if (t < ts) return;
      x += vr * (ts - last) * k; last = ts;
      gas.push({ x0: x, t0: ts, v: s.gas, dm: s.dm });
      vr = s.v; M = s.M;
    });
    x += vr * (t - last) * k;
    return { x, vr, M, gas: gas.map((g) => ({ ...g, x: g.x0 + g.v * (t - g.t0) * k })) };
  }

  function drawA() {
    const { ctx, size: { w, h } } = A; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(243,244,239,.5)";
    for (let i = 0; i < 40; i++) { const sx = (i * 97.3) % w, sy = (i * 57.1) % h; ctx.fillRect(sx, sy, 1.2, 1.2); }
    const k = w * 0.05 / P.u, x0 = w * 0.36, y = h * 0.5;
    const S = scene(clock, k);
    // 기체
    for (const g of S.gas) {
      const r = 2 + 10 * Math.sqrt(g.dm);
      ctx.beginPath(); ctx.arc(x0 + g.x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(224,160,42,.8)"; ctx.fill();
    }
    // 로켓 (크기는 남은 질량에 따라)
    const rx = x0 + S.x, L = 26 + 20 * S.M;
    ctx.fillStyle = C.paper;
    ctx.beginPath(); ctx.moveTo(rx + L / 2 + 10, y); ctx.lineTo(rx + L / 2, y - 7); ctx.lineTo(rx - L / 2, y - 7); ctx.lineTo(rx - L / 2, y + 7); ctx.lineTo(rx + L / 2, y + 7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(224,160,42,.9)"; ctx.fillRect(rx - L / 2, y - 7, L * 0.8 * (S.M - (1 - P.f)) / P.f, 3);
    // 질량 중심 (처음 위치에 그대로)
    let cm = S.M * S.x; for (const g of S.gas) cm += g.dm * g.x;
    const cmx = x0 + cm;
    ctx.strokeStyle = C.sprout; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(cmx, y + 22); ctx.lineTo(cmx, h - 26); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.sprout; ctx.textAlign = "center";
    ctx.fillText("전체의 질량 중심", cmx, h - 12);
    ctx.textAlign = "left"; ctx.fillStyle = "rgba(243,244,239,.75)";
    ctx.fillText(`로켓 ${S.vr.toFixed(2)} km/s`, 8, 16);
    ctx.fillStyle = "rgba(243,244,239,.45)";
    ctx.fillText("우주 공간 · 모식", 8, 31);
  }

  function drawB() {
    const { ctx, size: { w, h } } = B; if (!w || !P) return;
    ctx.clearRect(0, 0, w, h);
    const S = scene(clock, 1);
    // 운동량 막대 (처음 질량 1 × km/s)
    const pr = S.M * S.vr, pg = S.gas.reduce((a, g) => a + g.dm * g.v, 0);
    const pmax = Math.max(0.3, P.u * P.f);
    const cx = w / 2, bw = w * 0.42 / pmax, y1 = 30, y2 = 52;
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("운동량 (처음 질량 × km/s)", 6, 12);
    ctx.fillStyle = C.ink; ctx.fillRect(cx, y1 - 7, pr * bw, 12);
    ctx.fillStyle = C.amber; ctx.fillRect(cx, y2 - 7, pg * bw, 12);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + .5, y1 - 12); ctx.lineTo(cx + .5, y2 + 10); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.textAlign = "right"; ctx.fillText("로켓", cx - 6, y1 + 3);
    ctx.textAlign = "left"; ctx.fillText("기체", cx + 6, y2 + 3);
    ctx.fillStyle = C.forest; ctx.textAlign = "center"; const tot = Math.abs(pr + pg) < 5e-4 ? 0 : pr + pg;
    ctx.fillText(`합 = ${tot.toFixed(3)}`, cx, y2 + 24);
    nP.textContent = tot.toFixed(3);
    // 나눠 뿜는 횟수에 따른 최종 속력
    const x0 = 34, gy0 = y2 + 52, pw = w - x0 - 10, ph = h - gy0 - 30;
    const NMAX = 50, vmax = P.lim * 1.15;
    const X = (nn) => x0 + Math.log(nn) / Math.log(NMAX) * pw, Y = (v) => gy0 + (1 - v / vmax) * ph;
    const ys = vmax > 6 ? 2 : vmax > 3 ? 1 : 0.5, yt = []; for (let v = 0; v <= vmax; v += ys) yt.push([v, `${v}`]);
    NM.axes(ctx, { x0, y0: gy0, w: pw, h: ph, X, Y, xt: [[1, "1"], [2, "2"], [5, "5"], [10, "10"], [50, "50"]], yt, ylabel: "최종 속력 (km/s)", xlabel: "나눠 뿜는 횟수" });
    ctx.setLineDash([4, 3]); ctx.strokeStyle = C.forest; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x0, Y(P.lim)); ctx.lineTo(x0 + pw, Y(P.lim)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.forest; ctx.textAlign = "right"; ctx.fillText("u ln(m₀/m)", x0 + pw, Y(P.lim) - 5);
    ctx.beginPath();
    for (let nn = 1; nn <= NMAX; nn++) { const v = plan(nn).vf; nn === 1 ? ctx.moveTo(X(nn), Y(v)) : ctx.lineTo(X(nn), Y(v)); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.8; ctx.stroke();
    ctx.beginPath(); ctx.arc(X(n), Y(P.vf), 5, 0, Math.PI * 2); ctx.fillStyle = C.warn; ctx.fill();
    ctx.textAlign = "left";
  }

  [sF, sU].forEach((el) => el.addEventListener("input", reset));
  root.querySelectorAll("[data-n]").forEach((b) => b.addEventListener("click", () => {
    n = +b.dataset.n;
    root.querySelectorAll("[data-n]").forEach((c) => c.setAttribute("aria-pressed", c === b ? "true" : "false"));
    reset();
  }));
  reset();
  loop(cvA, (dt) => {
    if (NM.reduce) { clock = T0 + BURN + 0.8; drawA(); drawB(); return; }
    clock += dt; if (clock > T0 + BURN + HOLD) clock = 0;
    drawA(); drawB();
  });
})();
