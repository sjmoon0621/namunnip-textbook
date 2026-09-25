/* 카드: 해수면은 왜 오를까? — 물 위의 얼음, 땅 위의 얼음, 열팽창 */
(() => {
  const root = document.getElementById("card-is2-sea-level");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sM = $(".melt"), sT = $(".warm"), sD = $(".depth");
  const oM = $(".melt-out"), oT = $(".warm-out"), oD = $(".depth-out");
  const nSea = $(".sea"), nLand = $(".land"), nExp = $(".exp");

  const RHO_ICE = 0.917;   // 얼음 밀도 (물 = 1, 민물 기준)
  const ALPHA = 2e-4;      // 바닷물의 부피 팽창 계수 (1/°C, 표층 바닷물의 대략값)

  const { ctx, size } = fit(cv, () => draw());

  // 비커 하나: land = 얼음이 물 밖 받침대 위에 있음
  function beaker(x, y, bw, bh, land, f, title) {
    const a = bw * 0.36;                  // 처음 얼음 한 변
    const h0 = bh * 0.45;                 // 처음 물 높이 (얼음 효과 제외)
    const shelfW = land ? bw * 0.42 : 0, shelfH = bh * 0.62;
    const aw = bw - shelfW;               // 물이 차는 폭 (받침대는 바닥부터 물 위까지)
    const ice = a * Math.sqrt(1 - f);     // 남은 얼음 한 변
    let L;
    if (!land) L = (aw * h0 + RHO_ICE * a * a) / aw;                // 물 + 잠긴 얼음 = 일정
    else L = h0 + RHO_ICE * a * a * f / aw;                           // 녹은 물만 더해진다
    const L0 = land ? h0 : L;
    // 그리기
    ctx.fillStyle = "rgba(74,120,168,.28)";
    ctx.fillRect(x + shelfW, y + bh - L, aw, L);
    if (land) { ctx.fillStyle = "#b9a883"; ctx.fillRect(x, y + bh - shelfH, shelfW, shelfH); }
    if (ice > 0.5) {
      ctx.fillStyle = "rgba(235,245,252,.95)"; ctx.strokeStyle = "#7fa6c6"; ctx.lineWidth = 1;
      const ix = land ? x + (shelfW - ice) / 2 : x + shelfW + aw / 2 - ice / 2;
      const iy = land ? y + bh - shelfH - ice : y + bh - L - (1 - RHO_ICE) * ice;
      ctx.fillRect(ix, iy, ice, ice); ctx.strokeRect(ix + .5, iy + .5, ice, ice);
      // 녹은 물이 흘러내리는 줄기
      if (land && f > 0.01) { ctx.strokeStyle = "rgba(74,120,168,.6)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + shelfW - 2, y + bh - shelfH); ctx.lineTo(x + shelfW + 4, y + bh - L); ctx.stroke(); }
    }
    // 처음 수위 점선
    ctx.strokeStyle = C.ink; ctx.setLineDash([4, 3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x + shelfW, y + bh - L0); ctx.lineTo(x + bw, y + bh - L0); ctx.stroke(); ctx.setLineDash([]);
    // 비커
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + bh); ctx.lineTo(x + bw, y + bh); ctx.lineTo(x + bw, y); ctx.stroke();
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "center";
    ctx.fillText(title, x + bw / 2, y - 8);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = L - L0 > 0.5 ? C.warn : C.ink2;
    ctx.fillText(L - L0 > 0.5 ? `수위 +${((L - L0) / bh * 100).toFixed(1)}%` : "수위 그대로", x + bw / 2, y + bh + 15);
    ctx.textAlign = "left";
    return (L - L0) / bh;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const f = +sM.value / 100, dT = +sT.value, D = +sD.value;
    const stack = w / h < 1.3;
    const top = 30;
    if (!stack) {
      const bw = w * 0.25, bh = h - top - 30;
      beaker(10, top, bw, bh, false, f, "물에 뜬 얼음 (바다 얼음)");
      beaker(bw + 30, top, bw, bh, true, f, "땅 위 얼음 (빙하·빙상)");
      column(bw * 2 + 60, top, w - bw * 2 - 70, bh, dT, D);
    } else {
      const bw = w * 0.44, bh = h * 0.36;
      beaker(8, top, bw, bh, false, f, "물에 뜬 얼음");
      beaker(w - bw - 8, top, bw, bh, true, f, "땅 위 얼음");
      column(8, top + bh + 50, w - 16, h - bh - top - 70, dT, D);
    }
  }

  // 바다 기둥: 위쪽 D m가 dT만큼 데워진다
  function column(x, y, cw, ch, dT, D) {
    const dh = ALPHA * dT * D;                   // m
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "center";
    ctx.fillText("바닷물이 데워지면 (열팽창)", x + cw / 2, y - 8);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.warn;
    ctx.fillText(`위쪽 ${D} m가 +${dT.toFixed(1)} °C`, x + cw / 2, y + 7); ctx.textAlign = "left";
    const top = y + 18, colW = Math.min(46, cw * 0.3), cx = x + 4;
    const Y = (depth) => top + depth / 4000 * (y + ch - top);
    ctx.fillStyle = "rgba(74,120,168,.35)"; ctx.fillRect(cx, Y(0), colW, Y(4000) - Y(0));
    ctx.fillStyle = `rgba(181,83,47,${0.12 + dT * 0.12})`; ctx.fillRect(cx, Y(0), colW, Y(D) - Y(0));
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.strokeRect(cx + .5, Y(0) + .5, colW, Y(4000) - Y(0));
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3;
    [0, 1000, 2000, 3000, 4000].forEach((d) => ctx.fillText(`${d}`, cx + colW + 3, Y(d) + (d ? 3 : 8)));
    ctx.fillText("깊이 m", cx + colW + 3, Y(4000) - 12);
    // 확대한 자: 해수면 상승 cm
    const rx = x + cw - 30, r0 = top + 14, r1 = y + ch;
    const R = (cm) => r1 - cm / 150 * (r1 - r0);
    ctx.strokeStyle = C.ink2; ctx.beginPath(); ctx.moveTo(rx, r0); ctx.lineTo(rx, r1); ctx.stroke();
    for (let cm = 0; cm <= 150; cm += 50) { ctx.beginPath(); ctx.moveTo(rx, R(cm)); ctx.lineTo(rx + 5, R(cm)); ctx.stroke(); ctx.fillText(cm, rx + 7, R(cm) + 3); }
    ctx.fillStyle = C.warn; ctx.fillRect(rx - 10, R(dh * 100), 8, r1 - R(dh * 100));
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("상승 cm", x + cw, r0 - 16); ctx.textAlign = "left";
  }

  function update() {
    const f = +sM.value, dT = +sT.value, D = +sD.value;
    oM.textContent = f; oT.textContent = dT.toFixed(1); oD.textContent = D;
    nSea.textContent = "변화 없음";
    nLand.textContent = f > 0 ? "상승" : "—";
    nLand.classList.toggle("bad", f > 0);
    nExp.textContent = `+${(ALPHA * dT * D * 100).toFixed(1)} cm`;
    draw();
  }
  [sM, sT, sD].forEach((el) => el.addEventListener("input", update));
  update();
})();
