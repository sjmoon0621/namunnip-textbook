/* 카드: 반응식만 보고 생기는 기체의 부피를 예측할 수 있을까? — 질량 → 몰 → 계수비 → 부피 */
(() => {
  const root = document.getElementById("card-chem-gasvol");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sM = $(".mass"), oM = $(".mass-out"), go = $(".run"), eq = $(".rx-eq");
  const dN = $(".v-n"), dG = $(".v-gas"), dV = $(".v-vol");

  const RX = {
    mg: { eq: "Mg(s) + 2HCl(aq) → MgCl₂(aq) + H₂(g)", name: "마그네슘", sol: "Mg", M: 24.31, k: 1, gas: "H₂", max: 0.14, step: 0.005, def: 0.1, solid: "#b8b8bd" },
    caco3: { eq: "CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)", name: "탄산 칼슘", sol: "CaCO₃", M: 100.09, k: 1, gas: "CO₂", max: 0.6, step: 0.02, def: 0.4, solid: "#ecebe4" },
    h2o2: { eq: "2H₂O₂(aq) → 2H₂O(l) + O₂(g)   (촉매: 이산화 망가니즈)", name: "과산화 수소", sol: "H₂O₂", M: 34.01, k: 0.5, gas: "O₂", max: 0.4, step: 0.01, def: 0.28, solid: null },
  };
  const VM = { 0: 22.4, 25: 24.5 };
  let rx = "mg", T = 25, prog = 1, running = false, bubbles = [];

  const target = (m) => m / RX[rx].M * RX[rx].k * VM[T] * 1000; // mL

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = RX[rx], m = +sM.value, V = target(m) * prog, small = w < 520;
    // ── 왼쪽: 플라스크와 기체 주사기
    const lw = w * 0.47;
    const fx = lw * 0.2, fb = h - 26, fr = Math.min(lw * 0.17, h * 0.2), neck = fr * 0.38, ft = fb - fr * 2.6;
    // 액체
    ctx.save();
    ctx.beginPath(); ctx.arc(fx, fb - fr, fr, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = "rgba(63,111,181,.14)"; ctx.fillRect(fx - fr, fb - fr * 1.25, fr * 2, fr * 1.3);
    if (r.solid && prog < 1) {                       // 녹아 사라지는 고체
      const s = fr * 0.34 * Math.cbrt(1 - prog) * Math.cbrt(m / r.max + 0.05);
      ctx.fillStyle = r.solid; ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
      ctx.fillRect(fx - s, fb - 2 - s * 1.2, s * 2, s * 1.2); ctx.strokeRect(fx - s, fb - 2 - s * 1.2, s * 2, s * 1.2);
    }
    if (!r.solid) { ctx.fillStyle = "#3a3a3a"; ctx.beginPath(); ctx.ellipse(fx, fb - 3, fr * 0.35, 3, 0, 0, Math.PI * 2); ctx.fill(); }
    for (const b of bubbles) { ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.strokeStyle = "rgba(63,111,181,.7)"; ctx.lineWidth = 1; ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(fx, fb - fr, fr, -Math.PI / 2 + 0.38, -Math.PI / 2 - 0.38 + Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(fx - neck, fb - fr - Math.sqrt(fr * fr - neck * neck)); ctx.lineTo(fx - neck, ft);
    ctx.moveTo(fx + neck, fb - fr - Math.sqrt(fr * fr - neck * neck)); ctx.lineTo(fx + neck, ft); ctx.stroke();
    // 관
    const sy = ft - 12, sx0 = fx + fr * 1.3, sL = lw - sx0 - 10, sH = Math.max(18, fr * 0.55);
    ctx.fillStyle = "#6b6b70"; ctx.fillRect(fx - neck - 2, ft - 6, neck * 2 + 4, 8);
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(fx, ft - 6); ctx.lineTo(fx, sy); ctx.lineTo(sx0, sy); ctx.stroke();
    // 주사기 (0~150 mL)
    const cap = 150, X = (v) => sx0 + v / cap * sL;
    ctx.fillStyle = "rgba(63,111,181,.16)"; ctx.fillRect(sx0, sy - sH / 2, X(V) - sx0, sH);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.strokeRect(sx0, sy - sH / 2, sL, sH);
    ctx.fillStyle = C.ink2; ctx.fillRect(X(V) - 2, sy - sH / 2 - 3, 4, sH + 6);
    ctx.fillRect(X(V), sy - 1.5, sx0 + sL + 6 - X(V), 3);
    ctx.font = `${small ? 9 : 10}px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    for (let v = 0; v <= cap; v += 25) {
      ctx.beginPath(); ctx.moveTo(X(v), sy + sH / 2); ctx.lineTo(X(v), sy + sH / 2 + (v % 50 ? 3 : 6)); ctx.stroke();
      if (v % 50 === 0) ctx.fillText(`${v}`, X(v), sy + sH / 2 + 16);
    }
    ctx.textAlign = "left"; ctx.fillText("mL", X(cap) - 10, sy - sH / 2 - 8);
    ctx.fillStyle = C.ink; ctx.font = `500 ${small ? 12 : 14}px ${F.mono}`;
    ctx.fillText(`${r.gas} ${V.toFixed(0)} mL`, sx0, sy + sH / 2 + (small ? 34 : 40));
    ctx.fillStyle = C.ink3; ctx.font = `${small ? 9.5 : 11}px ${F.sans}`;
    ctx.fillText(`${r.name} ${m.toFixed(r.step < 0.01 ? 3 : 2)} g${rx === "h2o2" ? " (수용액 속)" : ""}`, 6, fb + 18);

    // ── 오른쪽: 넣은 질량 – 기체 부피 그래프
    const x0 = lw + (small ? 30 : 42), y0 = 22, pw = w - x0 - 12, ph = h - y0 - 36;
    const GX = (q) => x0 + q / r.max * pw, GY = (v) => y0 + (1 - v / 160) * ph;
    const xs = r.max <= 0.15 ? 0.05 : 0.1, xt = [];
    for (let q = 0; q <= r.max + 1e-9; q += xs) xt.push([q, q.toFixed(2)]);
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X: GX, Y: GY, xt, yt: [[0, "0"], [50, "50"], [100, "100"], [150, "150"]], xlabel: `넣은 ${r.sol} (g)`, ylabel: `${r.gas} 부피 (mL)` });
    for (const t of [0, 25]) {
      ctx.beginPath(); ctx.moveTo(GX(0), GY(0)); ctx.lineTo(GX(r.max), GY(r.max / r.M * r.k * VM[t] * 1000));
      ctx.strokeStyle = t === T ? C.forest : C.ink3; ctx.lineWidth = t === T ? 2 : 1; ctx.setLineDash(t === T ? [] : [4, 4]); ctx.stroke(); ctx.setLineDash([]);
      const ly = GY(r.max / r.M * r.k * VM[t] * 1000);
      ctx.fillStyle = t === T ? C.forest : C.ink3; ctx.font = `${small ? 9.5 : 10.5}px ${F.mono}`; ctx.textAlign = "right";
      ctx.fillText(`${t} °C`, GX(r.max) - 2, ly + (t === 25 ? -6 : 14));
    }
    ctx.beginPath(); ctx.arc(GX(m), GY(V), 5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
  }

  function numbers() {
    const r = RX[rx], m = +sM.value, n = m / r.M;
    oM.textContent = m.toFixed(r.step < 0.01 ? 3 : 2);
    dN.textContent = `${(n * 1000).toFixed(2)} mmol`;
    dG.textContent = `${(n * r.k * 1000).toFixed(2)} mmol`;
    dV.textContent = `${target(m).toFixed(0)} mL`;
  }
  function setRx(k) {
    rx = k; const r = RX[k];
    sM.max = r.max; sM.step = r.step; sM.value = r.def; eq.textContent = r.eq;
    root.querySelectorAll("[data-rx]").forEach((x) => x.setAttribute("aria-pressed", x.dataset.rx === k ? "true" : "false"));
    prog = 1; bubbles = []; numbers(); draw();
  }
  root.querySelectorAll("[data-rx]").forEach((b) => b.addEventListener("click", () => setRx(b.dataset.rx)));
  root.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => {
    T = +b.dataset.t;
    root.querySelectorAll("[data-t]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    numbers(); draw();
  }));
  sM.addEventListener("input", () => { prog = 1; numbers(); draw(); });
  go.addEventListener("click", () => { prog = 0; running = true; });
  setRx("mg");

  loop(cv, (dt) => {
    if (!running) return;
    prog = Math.min(1, prog + dt / 3.5);
    const { w, h } = size, lw = w * 0.47, fx = lw * 0.2, fr = Math.min(lw * 0.17, h * 0.2), fb = h - 26;
    if (prog < 1 && Math.random() < 0.6) bubbles.push({ x: fx + (Math.random() - .5) * fr * 0.7, y: fb - 6, r: 1.5 + Math.random() * 2 });
    for (const b of bubbles) b.y -= 40 * dt;
    bubbles = bubbles.filter((b) => b.y > fb - fr * 1.2);
    if (prog >= 1 && !bubbles.length) running = false;
    draw();
  });
})();
