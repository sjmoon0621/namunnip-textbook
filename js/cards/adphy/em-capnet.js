/* 카드: 평행판 축전기 두 개의 직렬·병렬 연결과 유전체 끼우기 (전지 연결 유지 / 분리) */
(() => {
  const root = document.getElementById("card-adphy-capnet");
  if (!root) return;
  const { C: COL, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sD1 = $(".d1"), oD1 = $(".d1-out"), sD2 = $(".d2"), oD2 = $(".d2-out"), sK = $(".k"), oK = $(".k-out"), sX = $(".x"), oX = $(".x-out");
  const nC = $(".n-c"), nQ = $(".n-q"), nV = $(".n-v"), nU = $(".n-u"), nB = $(".n-b");
  const EPS0 = 8.854e-12, AREA = 0.01, V0 = 12;
  let NET = "series", MODE = "side", LINK = true, Qhold = null;

  /* C2의 유전체: side = 옆으로 넓이 비율 x만큼 채움(병렬), slab = 두께 비율 x의 판(직렬) */
  function caps() {
    const d1 = +sD1.value / 1000, d2 = +sD2.value / 1000, k = +sK.value, x = +sX.value / 100;
    const C1 = EPS0 * AREA / d1;
    const C2 = MODE === "side" ? EPS0 * AREA / d2 * ((1 - x) + k * x) : EPS0 * AREA / (d2 * (1 - x) + d2 * x / k);
    return { d1, d2, k, x, C1, C2 };
  }
  function solve() {
    const c = caps();
    const Ceq = NET === "series" ? 1 / (1 / c.C1 + 1 / c.C2) : c.C1 + c.C2;
    let Q1, Q2, V1, V2;
    if (NET === "series") {
      const Q = LINK ? Ceq * V0 : Qhold; Q1 = Q2 = Q; V1 = Q / c.C1; V2 = Q / c.C2;
    } else {
      const Qt = LINK ? Ceq * V0 : Qhold, V = Qt / Ceq; V1 = V2 = V; Q1 = c.C1 * V; Q2 = c.C2 * V;
    }
    return { ...c, Ceq, Q1, Q2, V1, V2, U: 0.5 * (Q1 * V1 + Q2 * V2) };
  }
  const { ctx, size } = fit(cv, () => draw());

  function signs(x, y, wid, n, sgn) {
    ctx.fillStyle = sgn > 0 ? COL.apple : "#3f6fa3"; ctx.font = `bold 10px ${F.mono}`; ctx.textAlign = "center";
    for (let i = 0; i < n; i++) ctx.fillText(sgn > 0 ? "+" : "−", x + (i + .5) / n * wid, y);
  }
  /* 극판 하나를 그리고 전기력선 개수는 E에, 극판 전하 표시는 σ에 비례하게 */
  function capPic(cx, top, pw, gap, which, s, unitE) {
    const x0 = cx - pw / 2, bot = top + gap;
    const regs = [];
    if (which === 1) regs.push({ x: x0, w: pw, y: top, h: gap, E: s.V1 / s.d1, diel: false, sig: EPS0 * s.V1 / s.d1 });
    else if (MODE === "side") {
      const wx = pw * s.x, E = s.V2 / s.d2;
      if (wx > 0.5) regs.push({ x: x0, w: wx, y: top, h: gap, E: E / 1, Ein: E, diel: true, sig: s.k * EPS0 * E });
      if (pw - wx > 0.5) regs.push({ x: x0 + wx, w: pw - wx, y: top, h: gap, E, diel: false, sig: EPS0 * E });
    } else {
      const sig = s.Q2 / AREA, Ea = sig / EPS0, Ed = sig / (EPS0 * s.k), hd = gap * s.x;
      if (gap - hd > 0.5) regs.push({ x: x0, w: pw, y: top, h: gap - hd, E: Ea, diel: false, sig });
      if (hd > 0.5) regs.push({ x: x0, w: pw, y: bot - hd, h: hd, E: Ed, diel: true, sig });
    }
    regs.forEach((r) => {
      if (r.diel) { ctx.fillStyle = "rgba(224,160,42,.32)"; ctx.fillRect(r.x, r.y, r.w, r.h); }
      const n = Math.round(r.E * r.w / unitE);
      ctx.strokeStyle = "rgba(35,35,38,.55)"; ctx.lineWidth = 1;
      for (let i = 0; i < n; i++) {
        const x = r.x + (i + .5) / n * r.w;
        ctx.beginPath(); ctx.moveTo(x, r.y + 1); ctx.lineTo(x, r.y + r.h - 1); ctx.stroke();
        const ym = r.y + r.h / 2; if (r.h > 14) { ctx.beginPath(); ctx.moveTo(x - 2.5, ym - 3); ctx.lineTo(x, ym + 1); ctx.lineTo(x + 2.5, ym - 3); ctx.stroke(); }
      }
    });
    /* 자유 전하: 극판 면 위 구역별 σ */
    const sigRegs = which === 2 && MODE === "side" ? regs : [{ x: x0, w: pw, sig: regs[0] ? regs[0].sig : 0 }];
    sigRegs.forEach((r) => { const n = Math.min(Math.floor(r.w / 6), Math.round(r.sig * r.w / (unitE * EPS0) / 1.2)); signs(r.x, top - 7, r.w, n, 1); signs(r.x, bot + 15, r.w, n, -1); });
    ctx.fillStyle = COL.ink; ctx.fillRect(x0, top - 5, pw, 4); ctx.fillRect(x0, bot + 1, pw, 4);
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = solve();
    const pw = Math.min(150, w * 0.32), mmPx = Math.min(40, (h - 110) / 5.2), unitE = 90000;
    const c1x = w * 0.34, c2x = w * 0.74, top = 48, yT = 20;
    ctx.strokeStyle = COL.ink2; ctx.lineWidth = 1.5;
    const g1 = s.d1 * 1000 * mmPx, g2 = s.d2 * 1000 * mmPx, b1 = top + g1 + 6, b2 = top + g2 + 6, bx = 24;
    const mb = Math.max(b1, b2), yB = mb + 22, yBat = (yT + yB) / 2;
    const line = (pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
    line([[bx, yBat - 8], [bx, yT], [c1x, yT], [c1x, top - 5]]);
    line([[c2x, b2], [c2x, yB], [bx, yB], [bx, yBat + 8]]);
    if (NET === "series") {
      const mx = (c1x + c2x) / 2;
      line([[c1x, b1], [c1x, mb + 10], [mx, mb + 10], [mx, yT], [c2x, yT], [c2x, top - 5]]);
    } else {
      line([[c1x, yT], [c2x, yT], [c2x, top - 5]]); line([[c1x, b1], [c1x, yB]]);
    }
    if (LINK) { ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; line([[bx - 11, yBat - 6], [bx + 11, yBat - 6]]); ctx.lineWidth = 4; line([[bx - 5, yBat + 5], [bx + 5, yBat + 5]]); }
    else { ctx.strokeStyle = COL.warn; ctx.lineWidth = 1.5; line([[bx, yBat + 8], [bx + 12, yBat - 6]]); }
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = LINK ? COL.ink2 : COL.warn; ctx.textAlign = "left";
    ctx.fillText(LINK ? `${V0} V` : "분리", bx + 14, yBat + 4);
    capPic(c1x, top, pw, g1, 1, s, unitE);
    capPic(c2x, top, pw, g2, 2, s, unitE);
    /* 표 */
    const pF = (c) => `${(c * 1e12).toFixed(1)} pF`, nC_ = (q) => `${(q * 1e9).toFixed(3)} nC`;
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = COL.ink; ctx.textAlign = "center";
    [[c1x, "C₁ (공기)", s.C1, s.Q1, s.V1, b1], [c2x, "C₂ (유전체)", s.C2, s.Q2, s.V2, b2]].forEach(([x, nm, C, Q, V, b]) => {
      const y = yB + 20;
      ctx.fillStyle = COL.forest; ctx.fillText(nm, x, y);
      ctx.fillStyle = COL.ink; ctx.fillText(`${pF(C)} · ${nC_(Q)} · ${V.toFixed(2)} V`, x, y + 16);
    });
  }
  function update() {
    const s = solve();
    oD1.textContent = (+sD1.value).toFixed(1); oD2.textContent = (+sD2.value).toFixed(1); oK.textContent = (+sK.value).toFixed(1); oX.textContent = sX.value;
    nC.textContent = `${(s.Ceq * 1e12).toFixed(1)} pF`;
    nQ.textContent = `${((NET === "series" ? s.Q1 : s.Q1 + s.Q2) * 1e9).toFixed(3)} nC`;
    nV.textContent = `${(s.V1 + (NET === "series" ? s.V2 : 0)).toFixed(2)} V`;
    nU.textContent = `${(s.U * 1e9).toFixed(2)} nJ`;
    nB.textContent = LINK ? "전지가 연결되어 있어 전체 전압이 12 V로 유지됩니다." : (NET === "series" ? "전지를 떼었으므로 각 축전기의 전하량 Q가 그대로입니다." : "전지를 떼었으므로 두 축전기의 전하량 합이 그대로이고, 전압이 같아지도록 나뉩니다.");
    root.querySelectorAll("[data-net]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.net === NET)));
    root.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === MODE)));
    root.querySelectorAll("[data-link]").forEach((b) => b.setAttribute("aria-pressed", String((b.dataset.link === "on") === LINK)));
    draw();
  }
  root.querySelectorAll("[data-net]").forEach((b) => b.addEventListener("click", () => { NET = b.dataset.net; LINK = true; update(); }));
  root.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => { MODE = b.dataset.mode; update(); }));
  root.querySelectorAll("[data-link]").forEach((b) => b.addEventListener("click", () => {
    const on = b.dataset.link === "on";
    if (!on && LINK) { const s = solve(); Qhold = NET === "series" ? s.Q1 : s.Q1 + s.Q2; }
    LINK = on; update();
  }));
  [sD1, sD2, sK, sX].forEach((el) => el.addEventListener("input", update));
  if (/[?&]demo\b/.test(location.search)) { sX.value = 50; sK.value = 4; }
  update();
})();
