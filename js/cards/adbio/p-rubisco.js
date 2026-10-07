/* 카드: 루비스코의 산소 첨가와 광호흡 — Γ*(T) 측정식으로 C3·C4의 순 CO₂당 ATP 비교 (추정값 기반 모형) */
(() => {
  const root = document.getElementById("card-adbio-rubisco");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), sC = $(".c"), sO = $(".o"), oT = $(".t-out"), oC = $(".c-out"), oO = $(".o-out");
  const nPhi = $(".n-phi"), nLoss = $(".n-loss"), nAtp = $(".n-atp");
  const CBS = 2000;
  /* Bernacchi 등(2001): Γ* (μmol/mol), O₂ 21 % 기준 */
  const gstar = (T, O) => Math.exp(19.02 - 37.83 / (0.008314 * (T + 273.15))) * O / 21;
  const phi = (T, O, Cc) => 2 * gstar(T, O) / Cc;
  const atp = (p, extra) => (p >= 2 ? Infinity : (3 + extra + 3.5 * p) / (1 - 0.5 * p));
  const atp3 = (T, O, Cc) => atp(phi(T, O, Cc), 0);
  const atp4 = (T, O) => atp(phi(T, O, CBS), 2);

  const { ctx, size } = fit(cv, () => draw());
  function txt(s, x, y, col, font, al) { ctx.fillStyle = col; ctx.font = font; ctx.textAlign = al || "center"; ctx.fillText(s, x, y); }
  const blue = "#3f6fa3";

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const T = +sT.value, Cc = +sC.value, O = +sO.value;
    /* 왼쪽: 루비스코 반응 100번 */
    const lw = w * 0.34;
    txt("루비스코 반응 100번 가운데", lw / 2, 16, C.ink2, `600 11.5px ${F.sans}`);
    const rows = [["C3 엽육 세포", phi(T, O, Cc)], ["C4 다발초 세포", phi(T, O, CBS)]];
    rows.forEach(([name, p], i) => {
      const y = 46 + i * ((h - 70) / 2), bw = lw - 24, x = 12;
      const fo = p / (1 + p);
      txt(name, x, y, C.ink, `600 11.5px ${F.sans}`, "left");
      ctx.fillStyle = C.forest; ctx.fillRect(x, y + 8, bw * (1 - fo), 22);
      ctx.fillStyle = C.apple; ctx.fillRect(x + bw * (1 - fo), y + 8, bw * fo, 22);
      txt(`CO₂ ${(100 * (1 - fo)).toFixed(0)}`, x + 4, y + 23, "#fff", `600 11px ${F.mono}`, "left");
      if (fo > 0.12) txt(`O₂ ${(100 * fo).toFixed(0)}`, x + bw - 4, y + 23, "#fff", `600 11px ${F.mono}`, "right");
      else txt(`O₂ ${(100 * fo).toFixed(0)}`, x + bw, y, C.apple, `600 11px ${F.mono}`, "right");
      txt(`광호흡으로 잃는 탄소: 고정량의 ${Math.min(100, 100 * p / 2).toFixed(0)} %`, x, y + 46, C.ink2, `10.5px ${F.sans}`, "left");
    });
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lw, 10); ctx.lineTo(lw, h - 20); ctx.stroke();
    /* 오른쪽: 온도에 따른 ATP / 순 CO₂ */
    const gx = lw + 40, gw = w - gx - 12, gy = 26, gh = h - 62;
    const X = (t) => gx + (t - 10) / 30 * gw, Y = (a) => gy + gh * (1 - (a - 3) / 6);
    NM.axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [[10, "10"], [20, "20"], [30, "30"], [40, "40"]], yt: [[3, "3"], [5, "5"], [7, "7"], [9, "9"]], xlabel: "잎의 온도 (°C)", ylabel: "" });
    txt("순 CO₂ 1분자를 고정하는 데 드는 ATP", gx, 16, C.ink2, `600 11.5px ${F.sans}`, "left");
    ctx.save(); ctx.beginPath(); ctx.rect(gx, gy, gw, gh); ctx.clip();
    const curve = (f, col) => { ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); for (let t = 10; t <= 40.01; t += 0.25) { const y = Y(Math.min(20, f(t))); t === 10 ? ctx.moveTo(X(t), y) : ctx.lineTo(X(t), y); } ctx.stroke(); };
    curve((t) => atp3(t, O, Cc), C.forest); curve((t) => atp4(t, O), blue);
    ctx.restore();
    /* 교차점 */
    let cross = null;
    for (let t = 10; t < 40; t += 0.05) { if ((atp3(t, O, Cc) - atp4(t, O)) * (atp3(t + 0.05, O, Cc) - atp4(t + 0.05, O)) <= 0) { cross = t; break; } }
    if (cross !== null) {
      ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(cross), gy); ctx.lineTo(X(cross), gy + gh); ctx.stroke(); ctx.setLineDash([]);
      txt(`교차 ${cross.toFixed(0)} °C`, X(cross) + (cross > 33 ? -4 : 4), gy + 12, C.ink2, `10.5px ${F.mono}`, cross > 33 ? "right" : "left");
    }
    const a3 = atp3(T, O, Cc), a4 = atp4(T, O);
    [[a3, C.forest], [a4, blue]].forEach(([a, col]) => { if (a < 9) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(T), Y(Math.max(3, a)), 4.5, 0, Math.PI * 2); ctx.fill(); } });
    txt("C3", gx + 6, Y(Math.min(8.6, atp3(10, O, Cc))) - 6, C.forest, `600 11px ${F.sans}`, "left");
    txt("C4", gx + 6, Y(atp4(10, O)) + 15, blue, `600 11px ${F.sans}`, "left");
  }
  function update() {
    const T = +sT.value, Cc = +sC.value, O = +sO.value;
    oT.textContent = T; oC.textContent = Cc; oO.textContent = O;
    const p = phi(T, O, Cc);
    nPhi.textContent = p.toFixed(2);
    nLoss.textContent = `${Math.min(100, 50 * p).toFixed(0)} %`;
    const a3 = atp3(T, O, Cc), a4 = atp4(T, O);
    nAtp.textContent = `${isFinite(a3) ? a3.toFixed(1) : "∞"} / ${a4.toFixed(1)}`;
    draw();
  }
  [sT, sC, sO].forEach((s) => s.addEventListener("input", update));
  update();
})();
