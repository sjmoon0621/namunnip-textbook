/* 카드: 지금의 온난화는 태양 때문일 수 있을까? — 요인별 복사 강제력 막대와 높이별 기온 변화의 '지문' (모식) */
(() => {
  const root = document.getElementById("card-earth-forcing");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sC = $(".co2"), oC = $(".c-out"), sS = $(".sun"), oS = $(".s-out"), cV = $(".volc");
  const nF = $(".n-f"), nT = $(".n-t"), nS = $(".n-s");
  const LAMBDA = 3 / (5.35 * Math.log(2));   // °C per W/m² (CO₂ 2배에 3 °C)
  const COL = { co2: C.warn, sun: C.amber, volc: "#6b7fa6", sum: C.ink };

  const forcing = () => {
    const co2 = 5.35 * Math.log(+sC.value / 280);
    const sun = 1361 * (+sS.value / 100) * 0.7 / 4;
    const volc = cV.checked ? -3 : 0;
    return { co2, sun, volc, sum: co2 + sun + volc };
  };

  // 높이 z(km)에 따른 기온 변화의 모양 (단위 강제력당, 모식). 대류권 계면 약 12 km
  const TP = 12;
  const shape = {
    co2: (z) => z < TP ? 1 + 0.3 * z / TP : Math.max(-2, 1.3 - 2.8 * Math.min(1, (z - TP) / 10) - 0.5 * Math.max(0, z - 22) / 28),
    sun: (z) => 0.9 + 0.5 * z / 50,
    volc: (z) => z < 10 ? -1 : z < 16 ? -1 + 2.2 * (z - 10) / 6 : 1.2 - 0.9 * Math.max(0, z - 28) / 22,
  };
  // 화산의 모양은 크기(3 W/m²)에 곱한다: 대류권은 식고(−) 성층권은 에어로졸이 햇빛을 흡수해 데워진다(+)
  const total = (f, z) => LAMBDA * (f.co2 * shape.co2(z) + f.sun * shape.sun(z) + (f.volc ? 3 * shape.volc(z) : 0));

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const f = forcing();
    const narrow = w < 700;
    // 왼쪽: 강제력 막대
    const bw = narrow ? w : w * 0.56, bh = narrow ? h * 0.52 : h;
    const x0 = 44, y0 = 26, pw = bw - x0 - 14, ph = bh - y0 - 34;
    const FMIN = -4, FMAX = 6;
    const Y = (v) => y0 + (FMAX - v) / (FMAX - FMIN) * ph;
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("복사 강제력 (W/m², 산업화 이전 기준)", 8, 14);
    ctx.font = `10px ${F.mono}`; ctx.textAlign = "right";
    for (let v = FMIN; v <= FMAX; v += 2) {
      ctx.strokeStyle = v === 0 ? C.ink3 : C.rule; ctx.lineWidth = v === 0 ? 1.2 : 1;
      ctx.beginPath(); ctx.moveTo(x0, Y(v)); ctx.lineTo(x0 + pw, Y(v)); ctx.stroke();
      ctx.fillStyle = C.ink3; ctx.fillText(`${v > 0 ? "+" : ""}${v}`, x0 - 6, Y(v) + 3.5);
    }
    const bars = [["CO₂", f.co2, COL.co2], ["태양", f.sun, COL.sun], ["화산", f.volc, COL.volc], ["합계", f.sum, COL.sum]];
    const slot = pw / bars.length, bwid = Math.min(46, slot * 0.55);
    bars.forEach(([name, v, col], i) => {
      const cx = x0 + slot * (i + 0.5), ya = Y(Math.max(0, v)), yb = Y(Math.min(0, v));
      ctx.fillStyle = col; ctx.globalAlpha = i === 3 ? 0.85 : 1;
      ctx.fillRect(cx - bwid / 2, ya, bwid, Math.max(1.5, yb - ya)); ctx.globalAlpha = 1;
      ctx.font = `600 10.5px ${F.mono}`; ctx.fillStyle = col; ctx.textAlign = "center";
      ctx.fillText(`${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(2)}`, cx, v >= 0 ? ya - 5 : yb + 13);
      ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.fillText(name, cx, y0 + ph + 20);
    });

    // 오른쪽(좁으면 아래): 높이별 기온 변화의 모양
    const rx = narrow ? 44 : bw + 30, ry = narrow ? bh + 26 : 26;
    const rw = (narrow ? w : w - bw) - (narrow ? 58 : 44), rh = (narrow ? h - bh : h) - (narrow ? 44 : 60);
    const ZMAX = 45;
    const ZY = (z) => ry + (1 - z / ZMAX) * rh;
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("높이에 따른 기온 변화 (모양만)", rx - (narrow ? 36 : 0), ry - 12);
    // 성층권 배경
    ctx.fillStyle = "rgba(107,127,166,.08)"; ctx.fillRect(rx, ZY(ZMAX), rw, ZY(TP) - ZY(ZMAX));
    ctx.strokeStyle = C.rule; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(rx, ZY(TP)); ctx.lineTo(rx + rw, ZY(TP)); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText("성층권", rx + rw - 4, ZY(TP) - 6); ctx.fillText("대류권", rx + rw - 4, ZY(TP) + 14);
    ctx.font = `10px ${F.mono}`;
    [0, 12, 30, 45].forEach((z) => ctx.fillText(`${z}`, rx - 5, ZY(z) + 3.5));
    ctx.save(); ctx.translate(rx - 30, ry + rh / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.font = `10px ${F.sans}`; ctx.fillText("높이 (km)", 0, 0); ctx.restore();
    // 0 축
    const xm = rx + rw / 2;
    ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(xm, ZY(0)); ctx.lineTo(xm, ZY(ZMAX)); ctx.stroke();
    ctx.textAlign = "center"; ctx.font = `10px ${F.sans}`; ctx.fillStyle = "#3f6fa3"; ctx.fillText("← 식음", rx + rw * 0.2, ZY(0) + 16);
    ctx.fillStyle = C.warn; ctx.fillText("데워짐 →", rx + rw * 0.8, ZY(0) + 16);
    // 요인별 곡선(얇게)과 합계(굵게). 가로 눈금은 고정: 합계가 커지면 곡선도 커진다
    const XS = (rw / 2) / (LAMBDA * 7.5);
    const curve = (fn, col, lw, dash) => {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath();
      for (let z = 0; z <= ZMAX; z += 0.5) { const x = xm + NM.clamp(fn(z) * XS, -rw / 2, rw / 2); z ? ctx.lineTo(x, ZY(z)) : ctx.moveTo(x, ZY(z)); }
      ctx.stroke(); ctx.setLineDash([]);
    };
    if (Math.abs(f.co2) > 0.01) curve((z) => LAMBDA * f.co2 * shape.co2(z), COL.co2, 1.2, [3, 3]);
    if (Math.abs(f.sun) > 0.01) curve((z) => LAMBDA * f.sun * shape.sun(z), COL.sun, 1.2, [3, 3]);
    if (f.volc) curve((z) => LAMBDA * 3 * shape.volc(z), COL.volc, 1.2, [3, 3]);
    curve((z) => total(f, z), COL.sum, 2.4);
  }

  function update() {
    const f = forcing();
    oC.textContent = sC.value;
    oS.textContent = `${+sS.value >= 0 ? "+" : ""}${(+sS.value).toFixed(2)}`;
    nF.textContent = `${f.sum >= 0 ? "+" : "−"}${Math.abs(f.sum).toFixed(2)} W/m²`;
    const dT = LAMBDA * (f.co2 + f.sun);
    nT.textContent = `${dT >= 0 ? "+" : "−"}${Math.abs(dT).toFixed(1)} °C`;
    const s = total(f, 30);
    nS.textContent = Math.abs(s) < 0.15 ? "거의 그대로" : s > 0 ? "데워짐" : "식음";
    nS.classList.toggle("bad", s < -0.15);
    root.querySelectorAll("[data-co2]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.co2 === sC.value));
    draw();
  }
  [sC, sS].forEach((el) => el.addEventListener("input", update));
  cV.addEventListener("change", update);
  root.querySelectorAll("[data-co2]").forEach((b) => b.addEventListener("click", () => { sC.value = b.dataset.co2; update(); }));
  update();
})();
