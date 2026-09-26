/* 카드: 온실 효과는 나쁜 것일까? — 한 층 대기 복사 평형 모형 */
(() => {
  const root = document.getElementById("card-is2-greenhouse");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sA = $(".albedo"), sE = $(".eps"), oA = $(".albedo-out"), oE = $(".eps-out");
  const nT = $(".ts"), nU = $(".up"), nB = $(".back"), msg = $(".g-msg");

  const S = 1361, SIG = 5.670374e-8;     // 태양 상수 (W/m²), 슈테판–볼츠만 상수
  function solve() {
    const a = +sA.value, e = +sE.value;
    const In = S / 4, Ref = a * In, Sa = In - Ref;
    const U = Sa / (1 - e / 2);          // 지표 방출 σTs⁴
    const Ts = Math.pow(U / SIG, 0.25);
    const A = e * U / 2;                 // 대기가 위·아래로 각각 내보내는 양
    return { a, e, In, Ref, Sa, U, Ts, A, pass: (1 - e) * U, abs: e * U, out: (1 - e) * U + A };
  }

  const { ctx, size } = fit(cv, () => draw());

  function arrow(x, y0, y1, flux, col, label, dash, side = 1) {
    const wd = clamp(flux / 14, 1.2, 30);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = wd; ctx.setLineDash(dash ? [6, 4] : []);
    const dir = Math.sign(y1 - y0), head = Math.min(12, Math.abs(y1 - y0) / 3);
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1 - dir * head); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x - wd / 2 - 5, y1 - dir * head); ctx.lineTo(x + wd / 2 + 5, y1 - dir * head); ctx.lineTo(x, y1); ctx.closePath(); ctx.fill();
    if (label) {
      ctx.font = `600 11px ${F.mono}`; ctx.textAlign = side > 0 ? "left" : "right";
      ctx.fillText(Math.round(flux), x + side * (wd / 2 + 5), (y0 + y1) / 2 + 4);
      ctx.textAlign = "left";
    }
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    const r = solve();
    ctx.clearRect(0, 0, w, h);
    const topY = 26, atm0 = h * 0.36, atm1 = h * 0.5, gY = h - 30;
    const tw = Math.min(70, w * 0.15), dw = w - tw;
    // 우주, 대기, 땅
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, dw, topY + 6);
    ctx.fillStyle = `rgba(116,171,102,${0.08 + r.e * 0.35})`; ctx.fillRect(0, atm0, dw, atm1 - atm0);
    ctx.fillStyle = "#cdbf9f"; ctx.fillRect(0, gY, dw, h - gY);
    ctx.font = `10.5px ${F.mono}`;
    ctx.fillStyle = "rgba(243,244,239,.75)"; ctx.fillText("우주", 6, 18);
    const atmLab = `온실 기체 층 · 흡수율 ${r.e.toFixed(2)}`;
    ctx.fillStyle = C.ink2; ctx.fillText("지표", 6, h - 10);
    const col = (f) => f * dw;
    // 햇빛
    arrow(col(0.1), topY, gY, r.Sa, C.amber, true, false);
    arrow(col(0.2), atm0 + 6, topY, r.Ref, "#b9b9b3", true, false);
    // 지표 적외선: 통과분은 우주까지, 흡수분은 대기에서 멈춘다
    arrow(col(0.42), gY, topY, r.pass, C.warn, r.pass > 1, false);
    if (r.abs > 1) arrow(col(0.53), gY, atm1, r.abs, "rgba(181,83,47,.55)", true, false);
    // 대기의 방출
    if (r.A > 1) { arrow(col(0.72), atm1, gY, r.A, C.warn, true, true); arrow(col(0.86), atm0, topY, r.A, C.warn, true, true); }
    ctx.font = `10.5px ${F.mono}`; const lw = ctx.measureText(atmLab).width;
    ctx.fillStyle = "rgba(251,251,248,.9)"; ctx.fillRect(dw - lw - 12, atm0 + 3, lw + 8, 15);
    ctx.fillStyle = C.forest; ctx.fillText(atmLab, dw - lw - 8, atm0 + 14);
    // 온도계
    const tx = dw + tw / 2, t0 = topY + 10, t1 = gY - 6;
    const Y = (T) => t1 - (T + 40) / 80 * (t1 - t0);
    const Tc = r.Ts - 273.15;
    ctx.fillStyle = "#fff"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
    ctx.fillRect(tx - 5, t0, 10, t1 - t0); ctx.strokeRect(tx - 5 + .5, t0 + .5, 10, t1 - t0);
    ctx.fillStyle = Tc > 0 ? C.warn : "#4a78a8";
    const ty = clamp(Y(Tc), t0, t1);
    ctx.fillRect(tx - 4, ty, 8, t1 - ty);
    ctx.beginPath(); ctx.arc(tx, t1 + 4, 8, 0, 7); ctx.fill();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    [-40, -18, 0, 15, 40].forEach((T) => { ctx.fillText(T, tx - 9, Y(T) + 3); });
    ctx.textAlign = "center"; ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.mono}`;
    ctx.fillText(`${Tc.toFixed(1)}°C`, tx, t0 - 6 < 12 ? 12 : t0 - 6);
    ctx.textAlign = "left";
  }

  function update() {
    const r = solve(), Tc = r.Ts - 273.15;
    oA.textContent = r.a.toFixed(2); oE.textContent = r.e.toFixed(2);
    nT.textContent = `${Tc.toFixed(1)} °C`;
    nU.textContent = `${Math.round(r.out)} W/m²`;
    nB.textContent = `${Math.round(r.A)} W/m²`;
    msg.textContent = r.e < 0.05 ? "온실 기체가 없으면 지표는 흡수한 햇빛만큼만 적외선으로 내보내며 평형을 이룹니다. 이 온도에서는 바다가 얼어붙습니다."
      : `우주로 나가는 에너지(${Math.round(r.out)} W/m²)는 흡수한 햇빛(${Math.round(r.Sa)} W/m²)과 같습니다. 달라진 것은 지표가 받는 에너지에 대기의 역복사가 더해진 것입니다.`;
    root.querySelectorAll("[data-set]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.set === `${sA.value},${sE.value}`));
    draw();
  }
  [sA, sE].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-set]").forEach((b) => b.addEventListener("click", () => {
    const [a, e] = b.dataset.set.split(","); sA.value = a; sE.value = e; update();
  }));
  update();
})();
