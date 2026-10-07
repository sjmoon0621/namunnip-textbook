/* 카드: 가는 유리관 속 물은 왜 저절로 올라가고, 수은은 내려갈까? — 모세관 현상 */
(() => {
  const root = document.getElementById("card-adchem-capillary");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sR = $(".r");
  /* γ (N/m), ρ (kg/m³), θ (도), 증기압 (kPa, 20 °C), 끓는점 (°C) */
  const L = {
    water: { n: "물", g: 0.0728, rho: 998, th: 0, pv: "2.34 kPa", bp: 100.0, f: "수소 결합 (분자당 여러 개)", col: "#3f6fa3" },
    eg: { n: "에틸렌 글리콜", g: 0.0477, rho: 1113, th: 0, pv: "약 0.008 kPa", bp: 197.3, f: "수소 결합 (OH 2개)", col: "#2f8f8a" },
    etoh: { n: "에탄올", g: 0.0224, rho: 789, th: 0, pv: "5.95 kPa", bp: 78.4, f: "수소 결합 (OH 1개) + 분산력", col: "#3b7c2a" },
    acetone: { n: "아세톤", g: 0.0237, rho: 790, th: 0, pv: "24.6 kPa", bp: 56.1, f: "쌍극자–쌍극자 힘 + 분산력", col: "#7a5ea8" },
    hexane: { n: "헥세인", g: 0.0184, rho: 659, th: 0, pv: "16 kPa", bp: 68.7, f: "런던 분산력", col: "#b08a1a" },
    hg: { n: "수은", g: 0.486, rho: 13546, th: 140, pv: "0.00017 kPa", bp: 356.7, f: "금속 결합", col: "#6d717a" },
  };
  let liq = "water";
  const hcm = (k, rmm) => { const l = L[k]; return 2 * l.g * Math.cos(l.th * Math.PI / 180) / (l.rho * 9.81 * rmm * 1e-3) * 100; };
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = +sR.value, H = hcm(liq, r), l = L[liq];
    /* 왼쪽: 관 */
    const lw = w * 0.36, top = 26, bot = h - 16;
    const span = [2, 5, 10, 20, 30, 40].find((s) => s >= Math.abs(H) * 1.15) || 40;
    const neg = H < 0, ys = neg ? top + (bot - top) * 0.32 : top + (bot - top) * 0.78;
    const pxcm = neg ? (bot - 24 - ys) / span : (ys - top - 8) / span;
    const cx = lw * 0.55, tw = 8 + r * 18;
    /* 그릇 */
    ctx.fillStyle = l.col; ctx.globalAlpha = 0.28; ctx.fillRect(10, ys, lw - 14, bot - ys); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(10, ys - 14); ctx.lineTo(10, bot); ctx.lineTo(lw - 4, bot); ctx.lineTo(lw - 4, ys - 14); ctx.stroke();
    /* 관 속 액체 */
    const yc = ys - H * pxcm, x0 = cx - tw / 2, x1 = cx + tw / 2;
    ctx.fillStyle = "#fbfbf8"; ctx.fillRect(x0, top - 6, tw, bot - 4 - (top - 6));
    ctx.fillStyle = l.col; ctx.globalAlpha = 0.55;
    ctx.beginPath();
    const cu = (l.th > 90 ? -1 : 1) * Math.min(tw * 0.45, 9);
    ctx.moveTo(x0, bot - 4); ctx.lineTo(x0, yc - cu); ctx.quadraticCurveTo(cx, yc + cu * 1.2, x1, yc - cu); ctx.lineTo(x1, bot - 4); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, top - 6); ctx.lineTo(x0, bot - 4); ctx.moveTo(x1, top - 6); ctx.lineTo(x1, bot - 4); ctx.stroke();
    /* 수면 기준선과 자 */
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(14, ys); ctx.lineTo(lw - 8, ys); ctx.stroke(); ctx.setLineDash([]);
    const rx = 22, st = span <= 2 ? 0.5 : span <= 5 ? 1 : span <= 10 ? 2 : span <= 20 ? 5 : 10;
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.strokeStyle = C.ink2; ctx.textAlign = "left";
    for (let v = 0; v <= span + 1e-9; v += st) {
      const y = neg ? ys + v * pxcm : ys - v * pxcm;
      ctx.beginPath(); ctx.moveTo(rx - 6, y); ctx.lineTo(rx, y); ctx.stroke();
      ctx.fillText(`${neg && v ? "−" : ""}${v}`, rx + 3, y + 3);
    }
    ctx.fillText("cm", rx - 6, neg ? ys + span * pxcm + 16 : top + 2);
    ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1 + 6, ys); ctx.lineTo(x1 + 6, yc); ctx.stroke();
    ctx.fillStyle = "#9a6a10"; ctx.font = `11px ${F.mono}`; ctx.fillText(`h = ${H.toFixed(1)} cm`, Math.min(x1 + 10, lw - 74), (ys + yc) / 2 + 4);

    /* 오른쪽: h – 1/r */
    const gx0 = lw + 38, gx1 = w - 10, gy1 = 22, gy0 = h - 34, IX = 20, HMIN = -15, HMAX = 30;
    const X = (q) => gx0 + q / IX * (gx1 - gx0), Y = (v) => gy0 - (Math.max(HMIN, Math.min(HMAX, v)) - HMIN) / (HMAX - HMIN) * (gy0 - gy1);
    NM.axes(ctx, { x0: gx0, y0: gy1, w: gx1 - gx0, h: gy0 - gy1, xt: [[0, "0"], [5, "5"], [10, "10"], [15, "15"], [20, "20"]], yt: [[-10, "−10"], [0, "0"], [10, "10"], [20, "20"], [30, "30"]], X, Y, xlabel: "1/r (mm⁻¹)", ylabel: "h (cm)" });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, gy1); ctx.lineTo(gx0, gy0); ctx.lineTo(gx1, gy0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(gx0, Y(0)); ctx.lineTo(gx1, Y(0)); ctx.stroke();
    const line = (k, sel) => {
      const s = hcm(k, 1); /* cm per (1/mm) */
      ctx.strokeStyle = L[k].col; ctx.globalAlpha = sel ? 1 : 0.35; ctx.lineWidth = sel ? 2.4 : 1.4;
      ctx.beginPath(); let qEnd = IX;
      if (s * IX > HMAX) qEnd = HMAX / s; if (s * IX < HMIN) qEnd = HMIN / s;
      ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(qEnd), Y(s * qEnd)); ctx.stroke(); ctx.globalAlpha = 1;
      return [qEnd, s * qEnd];
    };
    Object.keys(L).forEach((k) => { if (k !== liq) line(k, false); });
    const [qe, he] = line(liq, true);
    ctx.fillStyle = l.col; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillText(l.n, Math.min(X(qe), gx1 - 2), Y(he) + (he >= 0 ? -6 : 14));
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(X(1 / r), Y(H), 5, 0, Math.PI * 2); ctx.fill();
  }

  function update() {
    root.querySelectorAll("[data-l]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.l === liq)));
    const r = +sR.value, l = L[liq], H = hcm(liq, r);
    $(".r-out").textContent = r.toFixed(2);
    $(".n-g").textContent = `${(l.g * 1000).toFixed(1)} mN/m`;
    $(".n-h").textContent = `${H.toFixed(1)} cm${H < 0 ? " (내려감)" : ""}`;
    $(".n-c").textContent = `${l.th}° · ${(l.rho / 1000).toFixed(3)} g/cm³`;
    $(".n-v").textContent = `${l.pv} · ${l.bp} °C`;
    $(".n-f").textContent = l.f;
    draw();
  }
  root.querySelectorAll("[data-l]").forEach((b) => b.addEventListener("click", () => { liq = b.dataset.l; update(); }));
  sR.addEventListener("input", update);
  if (/[?&]demo\b/.test(location.search)) { liq = "hg"; sR.value = 0.15; }
  update();
})();
