/* 카드: 전동기는 어떻게 계속 돌까? — 코일의 돌림힘, 정류자, 역기전력 (장난감 전동기 크기의 모식) */
(() => {
  const root = document.getElementById("card-phy-motor");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), vIn = $(".mv"), vOut = $(".mv-out");
  const nW = $(".n-w"), nI = $(".n-i"), nE = $(".n-emf");
  const BLUE = "#2f6fa3";

  // 코일 50회, 4 cm × 4 cm, B = 0.2 T → k = NBA = 0.016 N·m/A.  저항 2 Ω, 관성 모멘트 2×10⁻⁵ kg·m²
  const K = 50 * 0.2 * 0.04 * 0.04, R = 2, J = 2e-5, TF = 0.004, BV = 2e-6; // 정지·운동 마찰 돌림힘, 점성
  const SLOW = 20;                       // 화면에는 20배 느리게
  let mode = "comm", a = Math.PI / 2, w = 0, on = false;

  // 코일 면이 자기장(→)과 이루는 각 a. 돌림힘 ∝ i·cos a (a = 90°: 코일 면이 자기장에 수직, 돌림힘 0)
  function coil(ang, om) {
    const c = Math.cos(ang), V = on ? +vIn.value : 0;
    if (mode === "slip") { const i = (V - K * om * c) / R; return { i, tau: K * i * c, emf: K * om * c }; }
    const i = (V - K * om * Math.abs(c)) / R;
    return { i: i * Math.sign(c || 1), tau: K * i * Math.abs(c), emf: K * om * Math.abs(c), iext: i };
  }
  function torque(ang, om) {
    let t = coil(ang, om).tau;
    if (mode === "two") t += coil(ang + Math.PI / 2, om).tau;
    return t;
  }
  function step(dt) {
    const t = torque(a, w);
    if (Math.abs(w) < 1e-3 && Math.abs(t) <= TF) { w = 0; return; }        // 정지 마찰을 못 이김
    const fr = -Math.sign(w || t) * TF - BV * w;
    const wn = w + (t + fr) / J * dt;
    if (w !== 0 && Math.sign(wn) !== Math.sign(w) && Math.abs(t) <= TF) w = 0; else w = wn;
    a += w * dt;
  }

  const P = fit(cv, () => draw());
  function draw() {
    const { ctx, size: { w: W, h: H } } = P;
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    const narrow = W < 520, lw = narrow ? W * 0.5 : W * 0.48;
    const cx = lw / 2, cy = H / 2, rr = Math.min(lw * 0.3, H * 0.34);
    // 자석
    const mw = Math.max(18, lw * 0.1);
    ctx.fillStyle = C.warn; ctx.fillRect(4, cy - rr * 1.1, mw, rr * 2.2);
    ctx.fillStyle = BLUE; ctx.fillRect(lw - mw - 4, cy - rr * 1.1, mw, rr * 2.2);
    ctx.fillStyle = "#fff"; ctx.font = `600 13px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText("N", 4 + mw / 2, cy + 5); ctx.fillText("S", lw - mw / 2 - 4, cy + 5);
    ctx.strokeStyle = "rgba(35,35,38,.12)"; ctx.lineWidth = 1;
    for (let k = -2; k <= 2; k++) { const y = cy + k * rr * 0.45; ctx.beginPath(); ctx.moveTo(mw + 8, y); ctx.lineTo(lw - mw - 8, y); ctx.stroke(); }
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.fillText("B →", cx, cy - rr * 1.1 - 6);
    const drawCoil = (ang, info, faint) => {
      const ux = Math.cos(ang), uy = -Math.sin(ang);
      const p1 = [cx + ux * rr, cy + uy * rr], p2 = [cx - ux * rr, cy - uy * rr];
      ctx.strokeStyle = faint ? "rgba(35,35,38,.45)" : C.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(...p1); ctx.lineTo(...p2); ctx.stroke();
      const i = info.i;
      [[p1, i], [p2, -i]].forEach(([p, ii]) => {
        ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0, Math.PI * 2); ctx.fillStyle = C.card; ctx.fill();
        ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke();
        if (ii > 0.02) { ctx.beginPath(); ctx.arc(p[0], p[1], 2.8, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); }
        else if (ii < -0.02) { ctx.beginPath(); ctx.moveTo(p[0] - 4.5, p[1] - 4.5); ctx.lineTo(p[0] + 4.5, p[1] + 4.5); ctx.moveTo(p[0] + 4.5, p[1] - 4.5); ctx.lineTo(p[0] - 4.5, p[1] + 4.5); ctx.stroke(); }
        // 힘: 나오는 전류(⊙)는 위로, 들어가는 전류(⊗)는 아래로 (F = IL × B)
        if (Math.abs(ii) > 0.02) {
          const L = clamp(Math.abs(ii) * 12, 8, 34), d = ii > 0 ? -1 : 1;
          ctx.strokeStyle = C.forest; ctx.fillStyle = C.forest; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(p[0], p[1] + d * 11); ctx.lineTo(p[0], p[1] + d * (11 + L)); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(p[0], p[1] + d * (17 + L)); ctx.lineTo(p[0] - 4.5, p[1] + d * (10 + L)); ctx.lineTo(p[0] + 4.5, p[1] + d * (10 + L)); ctx.fill();
        }
      });
    };
    if (mode === "two") drawCoil(a + Math.PI / 2, coil(a + Math.PI / 2, w), true);
    drawCoil(a, coil(a, w), false);
    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText("축 방향에서 본 모습", 4, H - 6);
    ctx.textAlign = "center";
    ctx.fillText(`${SLOW}배 느리게`, cx, H - 20 < cy + rr + 12 ? H - 20 : cy + rr * 1.1 + 18);

    // 그래프: 출발할 때(정지 상태)의 돌림힘 vs 코일 각
    const gx = lw + (narrow ? 26 : 40), gw = W - gx - 10, gy = 24, gh = H - gy - 34;
    const tmax = K * 6 / R * (mode === "two" ? 1.5 : 1.05);
    const X = (deg) => gx + deg / 360 * gw, Y = (t) => gy + (1 - (t + tmax) / (2 * tmax)) * gh;
    NM.axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y,
      xt: [[0, "0°"], [90, "90°"], [180, "180°"], [270, "270°"], [360, ""]],
      yt: [[-tmax, ""], [0, "0"], [tmax, ""]], ylabel: "출발 돌림힘 (정지 상태)", xlabel: "코일 각" });
    ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.lineWidth = 1;
    [TF, -TF].forEach((t) => { ctx.beginPath(); ctx.moveTo(gx, Y(t)); ctx.lineTo(gx + gw, Y(t)); ctx.stroke(); });
    ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.textAlign = "right"; ctx.fillText("정지 마찰", gx + gw - 2, Y(TF) - 4);
    const onSave = on; on = true;
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath();
    for (let d = 0; d <= 360; d += 2) { const t = torque(d * Math.PI / 180, 0); d ? ctx.lineTo(X(d), Y(t)) : ctx.moveTo(X(d), Y(t)); }
    ctx.stroke();
    const deg = ((a * 180 / Math.PI) % 360 + 360) % 360;
    ctx.beginPath(); ctx.arc(X(deg), Y(torque(a, 0)), 5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    on = onSave;
    ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("+ : 시계 반대 방향", gx, gy + gh + 28);
    ctx.textAlign = "left";
  }

  function update() {
    vOut.textContent = (+vIn.value).toFixed(1);
    const c1 = coil(a, w);
    nW.textContent = `${(Math.abs(w) / (2 * Math.PI)).toFixed(1)} 회/s`;
    const iTot = mode === "two" ? Math.abs(c1.iext ?? c1.i) + Math.abs(coil(a + Math.PI / 2, w).iext) : Math.abs(c1.iext ?? c1.i);
    nI.textContent = on ? `${iTot.toFixed(2)} A` : "0 A";
    nE.textContent = `${(mode === "two" ? Math.max(c1.emf, coil(a + Math.PI / 2, w).emf) : Math.abs(c1.emf)).toFixed(2)} V`;
    root.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
    $(".power").textContent = on ? "전원 끄기" : "전원 켜기";
    draw();
  }
  const place = (deg) => { a = deg * Math.PI / 180; w = 0; };
  root.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.mode; w = 0; update(); }));
  root.querySelectorAll("[data-start]").forEach((b) => b.addEventListener("click", () => { place(+b.dataset.start); update(); }));
  $(".power").addEventListener("click", () => { on = !on; update(); });
  vIn.addEventListener("input", update);
  loop(cv, (dt) => {
    const sdt = dt / SLOW, n = 40;
    for (let i = 0; i < n; i++) step(sdt / n);
    update();
  });
  update();
})();
