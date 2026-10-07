/* 카드: 같은 온도의 기체 분자는 모두 같은 속력으로 움직일까? — 맥스웰–볼츠만 속력 분포 */
(() => {
  const root = document.getElementById("card-adchem-maxwell");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), sV = $(".v"), pinB = $(".pin");
  const R = 8.314, NA = 6.02214e23, KB = 1.380649e-23;
  const GAS = {
    H2: { M: 2.016e-3, name: "H₂", col: "#3f6fa3" },
    He: { M: 4.003e-3, name: "He", col: "#7a5ea8" },
    N2: { M: 28.01e-3, name: "N₂", col: "#3b7c2a" },
    CO2: { M: 44.01e-3, name: "CO₂", col: "#5d5d61" },
    Xe: { M: 131.29e-3, name: "Xe", col: "#b5532f" },
  };
  let gas = "N2", pin = null;
  const vp = (M, T) => Math.sqrt(2 * R * T / M);
  const f = (v, M, T) => { const a = M / (2 * R * T); return 4 * Math.PI * Math.pow(a / Math.PI, 1.5) * v * v * Math.exp(-a * v * v); };
  /* erfc: Abramowitz–Stegun 7.1.26 */
  const erfc = (x) => { const t = 1 / (1 + 0.3275911 * x); const y = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))); return y * Math.exp(-x * x); };
  const above = (v, M, T) => { const x = v / vp(M, T); return erfc(x) + 2 / Math.sqrt(Math.PI) * x * Math.exp(-x * x); };

  /* 분자: 3차원 표준 정규 성분을 저장해 두고 σ = √(RT/M)을 곱한다 */
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());
  const P = []; for (let i = 0; i < 150; i++) P.push({ x: rnd(), y: rnd(), g: [gauss(), gauss(), gauss()] });

  const { ctx, size } = fit(cv, () => draw());
  const fmt = (x) => x >= 0.995 ? "≈ 100 %" : x >= 0.01 ? `${(x * 100).toFixed(1)} %` : x >= 1e-6 ? `${(x * 100).toPrecision(2)} %` : "< 0.0001 %";

  function axisMax(T) {
    let m = vp(GAS[gas].M, T);
    if (pin) m = Math.max(m, vp(GAS[pin.g].M, pin.T));
    const need = Math.max(m * 3.3, +sV.value * 1.15);
    return [1000, 1500, 2000, 3000, 4000, 5000, 6000, 8000, 10000, 12000].find((n) => n >= need) || 12000;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const T = +sT.value, M = GAS[gas].M, vs = +sV.value, sig = Math.sqrt(R * T / M);
    /* 위: 상자 */
    const bx = 8, by = 8, bw = w - 16, bh = h * 0.36;
    ctx.fillStyle = "#f7f8f3"; ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.strokeRect(bx, by, bw, bh);
    for (const p of P) {
      const v = sig * Math.hypot(p.g[0], p.g[1], p.g[2]);
      const fast = v > vs;
      ctx.fillStyle = fast ? C.amber : GAS[gas].col;
      ctx.beginPath(); ctx.arc(bx + 4 + p.x * (bw - 8), by + 4 + p.y * (bh - 8), fast ? 3.4 : 2.8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink2;
    let nf = 0; for (const p of P) if (sig * Math.hypot(p.g[0], p.g[1], p.g[2]) > vs) nf++;
    const lab = `${GAS[gas].name} · ${T} K · v*보다 빠른 분자 ${nf}/150개`;
    ctx.fillStyle = "rgba(251,251,248,.9)"; ctx.fillRect(bx + 4, by + 4, ctx.measureText(lab).width + 8, 17);
    ctx.fillStyle = C.ink2; ctx.fillText(lab, bx + 8, by + 16);

    /* 아래: 분포 */
    const gx0 = 40, gx1 = w - 14, gy1 = bh + 40, gy0 = h - 30;
    const VM = axisMax(T), X = (v) => gx0 + v / VM * (gx1 - gx0);
    let fm = 1 / vp(M, T); if (pin) fm = Math.max(fm, 1 / vp(GAS[pin.g].M, pin.T));
    fm *= 4 / Math.sqrt(Math.PI) * Math.exp(-1) * 1.12;
    const Y = (y) => gy0 - y / fm * (gy0 - gy1);
    const step = VM <= 1500 ? 250 : VM <= 3000 ? 500 : VM <= 6000 ? 1000 : 2000;
    const xt = []; for (let v = 0; v <= VM + 1; v += step) xt.push([v, `${v}`]);
    NM.axes(ctx, { x0: gx0, y0: gy1, w: gx1 - gx0, h: gy0 - gy1, xt, yt: [], X, Y, xlabel: "속력 v (m/s)", ylabel: "f(v)" });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, gy1); ctx.lineTo(gx0, gy0); ctx.lineTo(gx1, gy0); ctx.stroke();
    const N = 260;
    /* 꼬리 칠하기 */
    ctx.fillStyle = "rgba(224,160,42,.45)"; ctx.beginPath(); ctx.moveTo(X(vs), gy0);
    for (let i = 0; i <= N; i++) { const v = vs + (VM - vs) * i / N; ctx.lineTo(X(v), Y(f(v, M, T))); }
    ctx.lineTo(X(VM), gy0); ctx.closePath(); ctx.fill();
    if (pin) {
      ctx.strokeStyle = GAS[pin.g].col; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.6; ctx.beginPath();
      for (let i = 0; i <= N; i++) { const v = VM * i / N; const y = Y(f(v, GAS[pin.g].M, pin.T)); i ? ctx.lineTo(X(v), y) : ctx.moveTo(X(v), y); }
      ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.strokeStyle = GAS[gas].col; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let i = 0; i <= N; i++) { const v = VM * i / N; const y = Y(f(v, M, T)); i ? ctx.lineTo(X(v), y) : ctx.moveTo(X(v), y); }
    ctx.stroke();
    /* 대표 속력 */
    const a = vp(M, T), marks = [[a, "p"], [a * 1.1284, "v̄"], [a * 1.2247, "rms"]];
    ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    marks.forEach(([v, lab], k) => {
      const x = X(v); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, Y(f(v, M, T))); ctx.lineTo(x, gy0); ctx.stroke();
      ctx.fillStyle = C.ink2; ctx.fillText(lab, x + (k - 1) * 16, gy1 - 4);
    });
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(vs), gy1 + 8); ctx.lineTo(X(vs), gy0); ctx.stroke();
    ctx.fillStyle = "#9a6a10"; ctx.textAlign = "left"; ctx.fillText("v*", X(vs) + 4, gy1 + 18);
    /* 범례 */
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right"; ctx.fillStyle = GAS[gas].col;
    ctx.fillText(`실선: ${GAS[gas].name} ${T} K`, gx1, gy1 + 18);
    if (pin) { ctx.fillStyle = GAS[pin.g].col; ctx.fillText(`점선: ${GAS[pin.g].name} ${pin.T} K`, gx1, gy1 + 33); }
  }

  function update() {
    root.querySelectorAll("[data-g]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.g === gas)));
    const T = +sT.value, M = GAS[gas].M, a = vp(M, T);
    $(".t-out").textContent = T; $(".v-out").textContent = sV.value;
    $(".n-p").textContent = `${Math.round(a)} m/s`;
    $(".n-a").textContent = `${Math.round(a * 1.1284)} m/s`;
    $(".n-r").textContent = `${Math.round(a * 1.2247)} m/s`;
    $(".n-e").textContent = `${(1.5 * KB * T).toExponential(2)} J (몰당 ${(1.5 * R * T / 1000).toFixed(2)} kJ)`;
    $(".n-f").textContent = fmt(above(+sV.value, M, T));
    draw();
  }

  root.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => { gas = b.dataset.g; update(); }));
  sT.addEventListener("input", update); sV.addEventListener("input", update);
  pinB.addEventListener("click", () => {
    if (pin) { pin = null; pinB.textContent = "지금 곡선을 점선으로 남기기"; pinB.setAttribute("aria-pressed", "false"); }
    else { pin = { g: gas, T: +sT.value }; pinB.textContent = `점선 지우기 (${GAS[gas].name} ${sT.value} K)`; pinB.setAttribute("aria-pressed", "true"); }
    draw();
  });

  /* 상자 속 분자 움직임 (화면 속도 = 실제 속력 × 0.13 px/(m/s), 모식) */
  const reduce = NM.reduce;
  loop(cv, (dt) => {
    if (reduce || !size.w) return;
    const T = +sT.value, sig = Math.sqrt(R * T / GAS[gas].M), bw = size.w - 24, bh = size.h * 0.36 - 8;
    const k = 0.13 * Math.min(dt, 0.04);
    for (const p of P) {
      p.x += sig * p.g[0] * k / bw; p.y += sig * p.g[1] * k / bh;
      if (p.x < 0) { p.x = -p.x; p.g[0] = Math.abs(p.g[0]); } if (p.x > 1) { p.x = 2 - p.x; p.g[0] = -Math.abs(p.g[0]); }
      if (p.y < 0) { p.y = -p.y; p.g[1] = Math.abs(p.g[1]); } if (p.y > 1) { p.y = 2 - p.y; p.g[1] = -Math.abs(p.g[1]); }
      p.x = Math.min(1, Math.max(0, p.x)); p.y = Math.min(1, Math.max(0, p.y));
    }
    draw();
  });

  if (/[?&]demo\b/.test(location.search)) { pin = { g: "N2", T: 300 }; pinB.textContent = "점선 지우기 (N₂ 300 K)"; pinB.setAttribute("aria-pressed", "true"); sT.value = 600; }
  update();
})();
