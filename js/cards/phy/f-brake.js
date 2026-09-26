/* 카드: 멈춘 자동차의 운동 에너지는 어디로 갔을까? — 브레이크 원판의 온도 상승 (냉각 없음 모식) */
(() => {
  const root = document.getElementById("card-phy-brake");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sV = $(".bv"), sH = $(".bh"), sM = $(".bm");
  const oV = $(".bv-out"), oH = $(".bh-out"), oM = $(".bm-out");
  const rowV = $(".row-v"), rowH = $(".row-h");
  const nE = $(".b-e"), nT = $(".b-t"), nW = $(".b-w");

  const g = 9.81, MD = 30, CD = 460, DEC = 7, VDOWN = 60 / 3.6, GRADE = 0.08; // 원판·패드 30 kg 주철, 감속 7 m/s²
  let mode = "stop", prog = 0, hold = 0, atoms = null;

  function totals() {
    const m = +sM.value;
    if (mode === "stop") { const v = +sV.value / 3.6; return { m, Q: 0.5 * m * v * v, v0: v, T: v / DEC }; }
    const hh = +sH.value; return { m, Q: m * g * hh, h: hh, T: hh / GRADE / VDOWN };
  }
  const dT = (Q) => Q / (MD * CD);
  const fmtE = (J) => J >= 1e6 ? `${(J / 1e6).toFixed(2)} MJ` : `${(J / 1e3).toFixed(0)} kJ`;

  function update() {
    const tt = totals();
    oV.textContent = sV.value; oH.textContent = sH.value; oM.textContent = sM.value;
    rowV.hidden = mode !== "stop"; rowH.hidden = mode === "stop";
    nE.textContent = fmtE(tt.Q);
    nT.textContent = `+${dT(tt.Q).toFixed(0)} °C`;
    nT.classList.toggle("bad", dT(tt.Q) > 300);
    nW.textContent = `${(tt.Q / 4186 / 80).toFixed(1)} L`;
    prog = 0; hold = 0; draw();
  }

  const { ctx, size } = fit(cv, () => draw());

  function discColor(T) { // T: °C. 약 500 °C부터 어두운 붉은빛
    const k = clamp((T - 450) / 450, 0, 1), base = [90, 92, 96];
    const hot = [210, 70, 30];
    return `rgb(${base.map((b, i) => Math.round(b + (hot[i] - b) * k)).join(",")})`;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const tt = totals(), p = clamp(prog, 0, 1);
    // 진행에 따른 에너지 나눔
    let K, U, Q;
    if (mode === "stop") { const tm = p * tt.T, v = tt.v0 - DEC * tm; K = 0.5 * tt.m * v * v; U = 0; Q = tt.Q - K; }
    else { K = 0.5 * tt.m * VDOWN * VDOWN; U = tt.Q * (1 - p); Q = tt.Q * p; }
    const E = K + U + Q, T = 20 + dT(Q);
    // ── 왼쪽: 길과 차
    const sw = w * 0.56, gy = h * 0.62;
    ctx.save();
    if (mode === "stop") {
      const D = tt.v0 * tt.v0 / (2 * DEC), xs = 20 + (sw - 70) * (1 - (1 - p) ** 2);
      ctx.fillStyle = "#e6e6df"; ctx.fillRect(10, gy, sw - 10, 4);
      ctx.fillStyle = "rgba(181,83,47,.35)"; ctx.fillRect(20, gy + 5, xs - 20, 2);
      car(xs + 30, gy, 0);
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
      ctx.fillText(`제동 거리 ${D.toFixed(1)} m · ${tt.T.toFixed(1)} s`, 14, gy + 22);
    } else {
      const ang = Math.atan(0.3), x0 = 18, y0 = gy - (sw - 30) * 0.3, x1 = sw - 12;
      ctx.strokeStyle = "#c9c4b4"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, gy); ctx.stroke();
      const cx = x0 + 20 + (x1 - x0 - 40) * p, cy = y0 + (cx - x0) * 0.3;
      car(cx, cy - 2, ang);
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
      ctx.fillText(`높이 ${tt.h} m를 시속 60 km로 · 경사 8%`, 14, gy + 22);
      ctx.fillText(`실제 ${(tt.T / 60).toFixed(1)}분 → 빨리 감기`, 14, gy + 36);
      ctx.fillText("(그림의 기울기는 과장)", 14, gy + 50);
    }
    ctx.restore();
    // ── 오른쪽 위: 원판
    const dx = sw + (w - sw) * 0.3, dy = h * 0.3, R = Math.min((w - sw) * 0.26, h * 0.2);
    ctx.fillStyle = discColor(T); ctx.beginPath(); ctx.arc(dx, dy, R, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.card; ctx.beginPath(); ctx.arc(dx, dy, R * 0.32, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink; ctx.fillRect(dx + R * 0.55, dy - R * 0.5, R * 0.35, R);
    ctx.font = `600 13px ${F.mono}`; ctx.fillStyle = T > 300 ? C.warn : C.ink; ctx.textAlign = "center";
    ctx.fillText(`${T.toFixed(0)} °C`, dx, dy + R + 18);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.fillText("브레이크 원판", dx, dy - R - 6);
    // ── 오른쪽: 원판 속 원자 (모식) — 진동 폭 ∝ √(절대 온도)
    const ax = sw + (w - sw) * 0.76, ay = dy, aw = (w - sw) * 0.36;
    ctx.strokeStyle = C.rule; ctx.strokeRect(ax - aw / 2, ay - aw / 2, aw, aw);
    const amp = 2.2 * Math.sqrt((T + 273) / 293), n = 4, sp = aw / (n + 1);
    if (!atoms) atoms = Array.from({ length: n * n }, () => [Math.random() * 6.28, Math.random() * 6.28, 0.8 + Math.random() * 0.4]);
    const tn = performance.now() / 1000;
    ctx.fillStyle = C.ink2;
    atoms.forEach(([a, b, f], i) => {
      const px = ax - aw / 2 + sp * (1 + i % n) + amp * Math.sin(tn * 9 * f + a);
      const py = ay - aw / 2 + sp * (1 + Math.floor(i / n)) + amp * Math.cos(tn * 8 * f + b);
      ctx.beginPath(); ctx.arc(px, py, sp * 0.2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = C.ink3; ctx.fillText("원자의 떨림 (모식)", ax, ay - aw / 2 - 6);
    // ── 아래: 에너지 막대
    const bx = 10, bw = w - 20, by = h - 34, bh = 14;
    const parts = [[U, C.forest, "퍼텐셜"], [K, C.ink, "운동"], [Q, C.warn, "열"]];
    let px = bx;
    ctx.strokeStyle = C.ink3; ctx.strokeRect(bx + .5, by + .5, bw, bh);
    for (const [e, col] of parts) { const ww = e / E * bw; ctx.fillStyle = col; ctx.fillRect(px, by, ww, bh); px += ww; }
    ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; let lx = bx;
    for (const [e, col, lab] of parts) { if (mode === "stop" && lab === "퍼텐셜") continue; const tx = `${lab} ${fmtE(e)}`; ctx.fillStyle = col; ctx.fillText(tx, lx, by + bh + 13); lx += ctx.measureText(tx).width + 14; }
  }

  function car(x, y, ang) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(-34, -16, 34, 11, 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(-26, -24, 17, 9, 2); ctx.fill();
    ctx.fillStyle = "#5d5d61"; ctx.beginPath(); ctx.arc(-26, -4, 4.5, 0, Math.PI * 2); ctx.arc(-8, -4, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  [sV, sH, sM].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => {
    mode = b.dataset.mode;
    root.querySelectorAll("[data-mode]").forEach((c) => c.setAttribute("aria-pressed", c === b ? "true" : "false"));
    update();
  }));
  update();
  loop(cv, (dt) => {
    if (NM.reduce) { prog = 1; draw(); return; }
    const tt = totals(), dur = mode === "stop" ? tt.T : 6;
    if (prog < 1) prog = Math.min(1, prog + dt / dur);
    else { hold += dt; if (hold > 2.5) { prog = 0; hold = 0; } }
    draw();
  });
})();
