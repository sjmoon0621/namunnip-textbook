/* 카드: 비오–사바르 법칙을 수치로 더해 원형 고리·코일·솔레노이드의 자기장을 구하고 암페어 법칙과 비교 */
(() => {
  const root = document.getElementById("card-adphy-biot");
  if (!root) return;
  const { C: COL, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sN = $(".n"), oN = $(".n-out"), sL = $(".l"), oL = $(".l-out"), sR = $(".r"), oR = $(".r-out"), sI = $(".i"), oI = $(".i-out");
  const nB = $(".n-b"), nA = $(".n-a"), nX = $(".n-x");
  const MU0 = 4 * Math.PI * 1e-7, SEG = 36, ZW = 0.15; /* 장면의 z 반폭 (m) */
  const PRE = { loop: [1, 2, 3, 2], short: [10, 3, 4, 2], long: [40, 24, 1.5, 2] };
  const par = () => {
    const N = +sN.value, L = +sL.value / 100, R = +sR.value / 100, I = +sI.value;
    const zs = []; for (let i = 0; i < N; i++) zs.push(N === 1 ? 0 : -L / 2 + L * (i + .5) / N);
    return { N, L, R, I, zs };
  };
  /* 평면 y = 0 위의 점 (x, z)에서 B = Σ μ₀I/4π · dl × r / r³ (각 고리를 SEG개 조각으로) */
  function Bxz(x, z, p) {
    let bx = 0, bz = 0; const k = MU0 * p.I / (4 * Math.PI), dphi = 2 * Math.PI / SEG;
    for (const zc of p.zs) for (let j = 0; j < SEG; j++) {
      const ph = (j + .5) * dphi, c = Math.cos(ph), s = Math.sin(ph);
      const dlx = -p.R * s * dphi, dly = p.R * c * dphi;
      const rx = x - p.R * c, ry = -p.R * s, rz = z - zc, r2 = rx * rx + ry * ry + rz * rz, r3 = r2 * Math.sqrt(r2) + 1e-15;
      /* dl × r, dl의 z성분 = 0 */
      bx += k * (dly * rz) / r3; bz += k * (dlx * ry - dly * rx) / r3;
    }
    return [bx, bz];
  }
  /* 축 위: 고리 하나의 정확한 식 μ₀IR²/2(R²+Δz²)^(3/2)을 더함 */
  const Baxis = (z, p) => p.zs.reduce((a, zc) => a + MU0 * p.I * p.R * p.R / (2 * (p.R * p.R + (z - zc) ** 2) ** 1.5), 0);
  const fmtB = (b) => b >= 1e-3 ? `${(b * 1e3).toFixed(3)} mT` : `${(b * 1e6).toFixed(1)} μT`;

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = par(), sceneH = Math.round(h * 0.55), s = w / (2 * ZW), cx = w / 2, cy = sceneH / 2;
    const Bc = Baxis(0, p) || 1e-9;
    /* 화살표 지도 */
    for (let Y = 12; Y < sceneH - 4; Y += 17) for (let X = 10; X < w - 4; X += 17) {
      const z = (X - cx) / s, x = (cy - Y) / s;
      if (p.zs.some((zc) => Math.hypot(z - zc, Math.abs(x) - p.R) < 0.004)) continue;
      const [bx, bz] = Bxz(x, z, p), m = Math.hypot(bx, bz); if (m === 0) continue;
      const a = Math.max(0.12, Math.min(1, 0.55 + Math.log10(m / Bc) / 2.2));
      const ux = bz / m, uy = -bx / m, Lh = 6.5;
      ctx.strokeStyle = `rgba(35,35,38,${a.toFixed(2)})`; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(X - ux * Lh, Y - uy * Lh); ctx.lineTo(X + ux * Lh, Y + uy * Lh);
      ctx.moveTo(X + ux * Lh, Y + uy * Lh); ctx.lineTo(X + ux * Lh - ux * 3 - uy * 2.4, Y + uy * Lh - uy * 3 + ux * 2.4);
      ctx.moveTo(X + ux * Lh, Y + uy * Lh); ctx.lineTo(X + ux * Lh - ux * 3 + uy * 2.4, Y + uy * Lh - uy * 3 - ux * 2.4); ctx.stroke();
    }
    /* 도선 단면: 위 ⊙(나옴), 아래 ⊗(들어감) */
    p.zs.forEach((zc) => {
      const X = cx + zc * s;
      [[cy - p.R * s, 1], [cy + p.R * s, -1]].forEach(([Y, out]) => {
        ctx.fillStyle = COL.card; ctx.strokeStyle = COL.apple; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(X, Y, 4, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
        ctx.beginPath();
        if (out > 0) { ctx.fillStyle = COL.apple; ctx.arc(X, Y, 1.4, 0, 2 * Math.PI); ctx.fill(); }
        else { ctx.moveTo(X - 2.4, Y - 2.4); ctx.lineTo(X + 2.4, Y + 2.4); ctx.moveTo(X + 2.4, Y - 2.4); ctx.lineTo(X - 2.4, Y + 2.4); ctx.stroke(); }
      });
    });
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    const tag = (t, x, y, col) => { const tw = ctx.measureText(t).width; ctx.fillStyle = "rgba(251,251,248,.92)"; ctx.fillRect(x - 3, y - 11, tw + 6, 15); ctx.fillStyle = col; ctx.fillText(t, x, y); };
    tag("코일 축을 지나는 단면 · ⊙ 나오는 전류  ⊗ 들어가는 전류", 6, 14, COL.ink2);
    tag(`가로 ${ZW * 200} cm · 화살표 진하기 = 세기(로그)`, 6, sceneH - 5, COL.ink3);

    /* 축 위 B(z) */
    const x0 = 50, x1 = w - 12, y1 = sceneH + 26, y0 = h - 36;
    ctx.strokeStyle = COL.rule; ctx.beginPath(); ctx.moveTo(0, sceneH + 4); ctx.lineTo(w, sceneH + 4); ctx.stroke();
    const BA = p.N > 1 ? MU0 * p.N * p.I / p.L : 0;
    const ymax = Math.max(Bc, BA) * 1.2, X = (z) => x0 + (z + ZW) / (2 * ZW) * (x1 - x0), Y = (b) => y0 - b / ymax * (y0 - y1);
    const unit = ymax >= 1e-3 ? [1e3, "mT"] : [1e6, "μT"];
    const st = (() => { const v = ymax / 3 * unit[0], e = 10 ** Math.floor(Math.log10(v)), m = v / e; return (m < 2 ? 1 : m < 5 ? 2 : 5) * e / unit[0]; })();
    const yt = []; for (let b = 0; b <= ymax; b += st) yt.push([b, String(+(b * unit[0]).toPrecision(3))]);
    NM.axes(ctx, { x0, y0: y1, w: x1 - x0, h: y0 - y1, X, Y, xt: [[-0.15, "−15"], [-0.1, "−10"], [-0.05, "−5"], [0, "0"], [0.05, "5"], [0.1, "10"], [0.15, "15"]], yt, xlabel: "축 위치 z (cm)", ylabel: `축 위 자기장 B (${unit[1]})` });
    if (p.N > 1) {
      ctx.fillStyle = "rgba(116,171,102,.12)"; ctx.fillRect(X(-p.L / 2), y1, X(p.L / 2) - X(-p.L / 2), y0 - y1);
      ctx.strokeStyle = COL.amber; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(X(-p.L / 2), Y(BA)); ctx.lineTo(X(p.L / 2), Y(BA)); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.strokeStyle = COL.forest; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 240; i++) { const z = -ZW + 2 * ZW * i / 240, b = Baxis(z, p); i ? ctx.lineTo(X(z), Y(b)) : ctx.moveTo(X(z), Y(b)); }
    ctx.stroke();
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right";
    if (p.N > 1) { ctx.fillStyle = "#b07a10"; ctx.fillText("- - 암페어 μ₀nI", x1, y1 - 7); }
    ctx.fillStyle = COL.forest; ctx.fillText("— 비오–사바르 합", p.N > 1 ? x1 - 92 : x1, y1 - 7);
  }
  function update() {
    const p = par();
    oN.textContent = p.N; oL.textContent = (+sL.value).toFixed(1); oR.textContent = (+sR.value).toFixed(1); oI.textContent = (+sI.value).toFixed(1);
    sL.disabled = p.N === 1;
    const Bc = Baxis(0, p); nB.textContent = fmtB(Bc);
    if (p.N === 1) { nA.textContent = `μ₀I/2R = ${fmtB(MU0 * p.I / (2 * p.R))}`; nX.textContent = "—"; }
    else { const BA = MU0 * p.N * p.I / p.L; nA.textContent = fmtB(BA); nX.textContent = `${(Bc / BA * 100).toFixed(1)} %`; }
    draw();
  }
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { const [n, l, r, i] = PRE[b.dataset.p]; sN.value = n; sL.value = l; sR.value = r; sI.value = i; update(); }));
  [sN, sL, sR, sI].forEach((el) => el.addEventListener("input", update));
  if (/[?&]demo\b/.test(location.search)) { const [n, l, r, i] = PRE.short; sN.value = n; sL.value = l; sR.value = r; sI.value = i; }
  update();
})();
