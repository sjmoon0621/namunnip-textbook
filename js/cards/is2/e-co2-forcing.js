/* 카드: CO₂가 조금 늘었을 뿐인데 왜 기온이 오를까? — 공기 조성과 복사 강제력 */
(() => {
  const root = document.getElementById("card-is2-co2");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sC = $(".ppm"), oC = $(".ppm-out");
  const nF = $(".dF"), nT = $(".dT"), nR = $(".rng"), msg = $(".c-msg");

  const C0 = 280;                                   // 산업화 이전 (ppm)
  const dF = (c) => 5.35 * Math.log(c / C0);        // 복사 강제력 (W/m²), Myhre 외(1998) 근사식
  const F2 = dF(560);                               // 약 3.7 W/m²
  const dT = (c, s) => s * dF(c) / F2;              // s: CO₂ 2배일 때 평형 기온 상승 (°C)
  const MARK = [[280, "산업화 이전"], [423, "2024년"], [560, "2배"]];

  // 공기 분자 1만 개 칸: 고정된 무작위 순서로 CO₂ 자리를 고른다
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const ORDER = Array.from({ length: 10000 }, (_, i) => i);
  for (let i = ORDER.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [ORDER[i], ORDER[j]] = [ORDER[j], ORDER[i]]; }

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const c = +sC.value;
    const stack = w / h < 1.3;
    // ── 왼쪽: 공기 1만 분자
    const gsz = stack ? Math.min(w * 0.5, h * 0.36) : Math.min(w * 0.36, h - 56);
    const gx = stack ? 8 : 8, gy = 22, cell = gsz / 100;
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText("공기 분자 1만 개", gx, 14);
    // N₂ 7808, O₂ 2095, Ar 93, 나머지(CO₂ 포함)
    ctx.fillStyle = "#dfe3ea"; ctx.fillRect(gx, gy, gsz, gsz * 0.7808);
    ctx.fillStyle = "#cfe1c7"; ctx.fillRect(gx, gy + gsz * 0.7808, gsz, gsz * 0.2095);
    ctx.fillStyle = "#c9c9c2"; ctx.fillRect(gx, gy + gsz * 0.9903, gsz, gsz * 0.0093);
    const n = Math.round(c / 100);
    ctx.fillStyle = C.warn;
    for (let i = 0; i < n; i++) {
      const k = ORDER[i], x = gx + (k % 100) * cell, y = gy + Math.floor(k / 100) * cell;
      ctx.beginPath(); ctx.arc(x + cell / 2, y + cell / 2, Math.max(2.5, cell * 1.2), 0, 7); ctx.fill();
    }
    const lx = stack ? gx + gsz + 10 : gx, ly = stack ? gy + 10 : gy + gsz + 14;
    ctx.font = `10px ${F.mono}`;
    const leg = [["#dfe3ea", "N₂ 78%"], ["#cfe1c7", "O₂ 21%"], ["#c9c9c2", "Ar 0.9%"], [C.warn, `CO₂ ${(c / 1e4).toFixed(3)}%`]];
    leg.forEach(([col, t], i) => {
      const xx = stack ? lx : lx + (i % 2) * (gsz / 2), yy = stack ? ly + i * 15 : ly + Math.floor(i / 2) * 14;
      ctx.fillStyle = col; ctx.fillRect(xx, yy - 8, 9, 9); ctx.fillStyle = C.ink2; ctx.fillText(t, xx + 13, yy);
    });

    // ── 오른쪽: 평형 기온 상승
    const px = stack ? 40 : gx + gsz + 52, py = stack ? gy + gsz + 30 : 22;
    const pw = w - px - 12, ph = (stack ? h - py : h - py) - 34;
    const LX0 = Math.log10(200), LX1 = Math.log10(1200);
    const X = (v) => px + (Math.log10(v) - LX0) / (LX1 - LX0) * pw, Y = (t) => py + (1 - (t + 2) / 10) * ph;
    NM.axes(ctx, { x0: px, y0: py, w: pw, h: ph, X, Y,
      xt: [[200, "200"], [280, "280"], [400, "400"], [560, "560"], [800, "800"], [1120, "1120"]],
      yt: [[0, "0"], [2, "2"], [4, "4"], [6, "6"], [8, "8"]],
      ylabel: "평형 기온 상승 (°C)", xlabel: "CO₂ (ppm, 로그 눈금)" });
    // 범위 띠 (2배일 때 2.5~4 °C)
    ctx.beginPath();
    for (let e = LX0; e <= LX1 + 1e-9; e += 0.01) ctx.lineTo(X(10 ** e), Y(dT(10 ** e, 4)));
    for (let e = LX1; e >= LX0 - 1e-9; e -= 0.01) ctx.lineTo(X(10 ** e), Y(dT(10 ** e, 2.5)));
    ctx.closePath(); ctx.fillStyle = "rgba(181,83,47,.13)"; ctx.fill();
    ctx.beginPath();
    for (let e = LX0; e <= LX1 + 1e-9; e += 0.01) ctx.lineTo(X(10 ** e), Y(dT(10 ** e, 3)));
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px, Y(0) + .5); ctx.lineTo(px + pw, Y(0) + .5); ctx.stroke();
    ctx.font = `10px ${F.mono}`;
    MARK.forEach(([v, t], i) => {
      const x = X(v), y = Y(dT(v, 3));
      ctx.beginPath(); ctx.arc(x, y, 3.5, 0, 7); ctx.fillStyle = C.card; ctx.fill(); ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText(t, x + 6, y + 14);
    });
    const x = X(c), y = Y(dT(c, 3));
    ctx.strokeStyle = C.ink; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x, py + ph); ctx.lineTo(x, y); ctx.lineTo(px, y); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fillStyle = C.ink; ctx.fill();
    ctx.textAlign = "left";
  }

  function update() {
    const c = +sC.value;
    oC.textContent = c;
    nF.textContent = `${dF(c) >= 0 ? "+" : ""}${dF(c).toFixed(2)} W/m²`;
    nT.textContent = `${dT(c, 3) >= 0 ? "+" : ""}${dT(c, 3).toFixed(1)} °C`;
    nR.textContent = `${dT(c, 2.5).toFixed(1)} ~ ${dT(c, 4).toFixed(1)} °C`;
    msg.textContent = `공기 1만 분자 가운데 CO₂는 ${(c / 100).toFixed(1)}개입니다. 그래도 99%를 차지하는 N₂와 O₂는 적외선을 거의 흡수하지 못하므로, 적외선을 붙잡는 일은 이 적은 기체들이 맡습니다.`;
    root.querySelectorAll("[data-ppm]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.ppm === sC.value));
    draw();
  }
  sC.addEventListener("input", update);
  root.querySelectorAll("[data-ppm]").forEach((b) => b.addEventListener("click", () => { sC.value = b.dataset.ppm; update(); }));
  update();
})();
