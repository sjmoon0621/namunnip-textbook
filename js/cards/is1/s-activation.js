/* 카드: 효소는 반응을 어떻게 빠르게 할까? — 활성화 에너지와 충분한 에너지를 가진 충돌의 비율 (모식) */
(() => {
  const root = document.getElementById("card-is1-activation");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sEa = $(".ea"), oEa = $(".ea-out"), sDn = $(".dn"), oDn = $(".dn-out");
  const nF0 = $(".f0"), nF1 = $(".f1"), nX = $(".fx"), nT = $(".tneed");

  const R = 8.314, TB = 310.15, DH = -30; // 체온 37 °C, 반응열은 모식값 (kJ/mol)
  const frac = (ea, T = TB) => Math.exp(-ea * 1000 / (R * T));
  const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const sci = (x) => {
    if (x >= 0.01 && x < 1000) return x.toPrecision(2);
    const e = Math.floor(Math.log10(x)), m = x / 10 ** e;
    return `${m.toFixed(1)} × 10${String(e).split("").map((c) => SUP[c]).join("")}`;
  };

  const { ctx, size } = fit(cv, () => draw());
  function vals() {
    const ea = +sEa.value, dn = Math.min(+sDn.value, ea - 5);
    return { ea, dn, ea1: ea - dn };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { ea, ea1 } = vals();
    const narrow = w < 480;
    // ── 왼쪽: 에너지 그림
    const x0 = 34, x1 = w * 0.58, y0 = 22, y1 = h - 30;
    const EMAX = 130, EMIN = -45;
    const Y = (e) => y0 + (EMAX - e) / (EMAX - EMIN) * (y1 - y0);
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText("에너지 (kJ/mol)", x0 + 4, y0 + 4);
    ctx.textAlign = "right"; ctx.fillText("반응 진행 →", x1, y1 + 16); ctx.textAlign = "left";
    const curve = (peak) => {
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const s = i / 100, x = x0 + 10 + s * (x1 - x0 - 20);
        let e;
        if (s < 0.25) e = 0;
        else if (s > 0.75) e = DH;
        else { const q = (s - 0.25) / 0.5; e = q * DH + (peak - DH / 2) * Math.sin(Math.PI * q) ** 2; }
        i ? ctx.lineTo(x, Y(e)) : ctx.moveTo(x, Y(e));
      }
    };
    curve(ea); ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([]);
    curve(ea1); ctx.strokeStyle = C.forest; ctx.lineWidth = 2.4; ctx.stroke();
    // 활성화 에너지 화살표
    const xm = x0 + 10 + 0.5 * (x1 - x0 - 20);
    const peakE = (p) => p; // 곡선의 꼭대기 = 반응물보다 Ea만큼 높은 곳
    const arrowV = (x, e, col, lab) => {
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(x, Y(0)); ctx.lineTo(x, Y(e) + 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, Y(e)); ctx.lineTo(x - 4, Y(e) + 7); ctx.lineTo(x + 4, Y(e) + 7); ctx.fill();
      ctx.font = `600 11px ${F.mono}`; ctx.textAlign = col === C.forest ? "left" : "right";
      ctx.fillText(lab, x + (col === C.forest ? 6 : -6), (Y(0) + Y(e)) / 2 + 4); ctx.textAlign = "left";
    };
    ctx.setLineDash([2, 3]); ctx.strokeStyle = C.rule;
    ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x1, Y(0)); ctx.stroke(); ctx.setLineDash([]);
    arrowV(xm - (narrow ? 30 : 44), peakE(ea), C.ink2, `${ea}`);
    arrowV(xm + 8, peakE(ea1), C.forest, `${ea1}`);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2;
    ctx.fillText("반응물", x0 + 8, Y(0) - 6);
    ctx.textAlign = "right"; ctx.fillText("생성물", x1 - 6, Y(DH) - 6); ctx.textAlign = "left";

    // ── 오른쪽: 충분한 에너지를 가진 충돌의 비율 (로그)
    const bx0 = w * 0.64 + 6, bx1 = w - 12, bw = bx1 - bx0;
    const L0 = 0, L1 = -22;
    const BY = (f) => y0 + (Math.log10(f) - L0) / (L1 - L0) * (y1 - y0);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3;
    for (let e = 0; e >= -20; e -= 5) {
      const y = Math.round(BY(10 ** e)) + .5;
      ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(bx0 + 30, y); ctx.lineTo(bx1, y); ctx.stroke();
      ctx.textAlign = "right"; ctx.fillText(e === 0 ? "1" : `10${String(e).split("").map((c) => SUP[c]).join("")}`, bx0 + 26, y + 3);
    }
    ctx.textAlign = "left";
    const f0 = frac(ea), f1 = frac(ea1);
    const bar = (f, col, i, lab) => {
      const x = bx0 + 34 + i * (bw - 34) / 2 + 4, wd = (bw - 34) / 2 - 10;
      ctx.fillStyle = col; ctx.fillRect(x, BY(f), wd, y1 - BY(f));
      ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.fillText(lab, x + wd / 2, y1 + 14); ctx.textAlign = "left";
    };
    bar(f0, "#b9b9b3", 0, "효소 없음"); bar(f1, C.leaf, 1, "효소 있음");
    ctx.fillStyle = C.ink3; ctx.fillText("넘을 수 있는 비율", bx0, y0 - 8);
  }

  function update() {
    const { ea, dn, ea1 } = vals();
    if (+sDn.value !== dn) sDn.value = dn;
    oEa.textContent = ea; oDn.textContent = dn;
    const f0 = frac(ea), f1 = frac(ea1);
    nF0.textContent = sci(f0); nF1.textContent = sci(f1);
    const r = f1 / f0;
    nX.textContent = r < 1000 ? `${r.toPrecision(2)}배` : `${sci(r)}배`;
    const Tn = TB * ea / ea1 - 273.15;
    nT.textContent = dn === 0 ? "37 °C" : `약 ${Math.round(Tn).toLocaleString("ko-KR")} °C`;
    draw();
  }
  [sEa, sDn].forEach((s) => s.addEventListener("input", update));
  update();
})();
