/* 카드: 같은 태풍인데 왜 어떤 해안에서만 해일이 클까? — 역기압 효과 + 바람의 해수 밀림 Δη = τW/(ρgh) */
(() => {
  const root = document.getElementById("card-adearth-surge");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sP = $(".sl-p"), sU = $(".sl-u"), sH = $(".sl-h"), sW = $(".sl-w");
  const RHO = 1025, G = 9.81, RHOA = 1.2, CD = 2.0e-3, P0 = 1013, TIDE = 1.0;
  let tide = 0;
  const calc = () => {
    const p = +sP.value, U = +sU.value, h = +sH.value, W = +sW.value * 1000;
    const tau = RHOA * CD * U * U, baro = (P0 - p) * 100 / (RHO * G), wind = tau * W / (RHO * G * h);
    return { p, U, h, W, tau, baro, wind, tide: tide * TIDE, sum: baro + wind + tide * TIDE, tadj: W / Math.sqrt(G * h) };
  };
  const cm = (m) => Math.abs(m) < 1 ? `${(m * 100).toFixed(0)} cm` : `${m.toFixed(2)} m`;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h: H } = size; if (!w) return;
    const s = calc();
    ctx.clearRect(0, 0, w, H);
    /* 단면: 왼쪽 깊은 바다, 오른쪽 해안. 세로는 해수면 변화를 크게 과장 */
    const xL = 12, xR = w * 0.67, xShelf = xL + (xR - xL) * 0.32, yMean = H * 0.36, eta = 34;
    const Ys = (m) => yMean - m * eta;
    /* 바닥 */
    const yShelf = yMean + 18 + Math.min(1, s.h / 200) * 60, yDeep = H - 14;
    ctx.fillStyle = "#d8c7a0"; ctx.beginPath(); ctx.moveTo(xL, yDeep); ctx.lineTo(xShelf - 30, yDeep); ctx.lineTo(xShelf, yShelf); ctx.lineTo(xR, yShelf); ctx.lineTo(xR, 8); ctx.lineTo(xR + 18, 8); ctx.lineTo(xR + 18, yDeep); ctx.closePath(); ctx.fill();
    /* 해수면 */
    const surf = (x) => {
      let z = s.tide + s.baro;
      if (x > xShelf) z += s.wind * (x - xShelf) / (xR - xShelf);
      return Math.max(6, Ys(z));
    };
    ctx.fillStyle = "rgba(63,111,163,.18)"; ctx.beginPath(); ctx.moveTo(xL, yDeep);
    for (let x = xL; x <= xR; x += 2) { const yb = x < xShelf - 30 ? yDeep : x < xShelf ? yDeep + (yShelf - yDeep) * (x - xShelf + 30) / 30 : yShelf; void yb; ctx.lineTo(x, surf(x)); }
    ctx.lineTo(xR, yShelf); ctx.lineTo(xShelf, yShelf); ctx.lineTo(xShelf - 30, yDeep); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2; ctx.beginPath(); for (let x = xL; x <= xR; x += 2) { const y = surf(x); x === xL ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
    /* 평균 해면 */
    ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 4]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(xL, yMean); ctx.lineTo(xR, yMean); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("평균 해면", xL + 2, yMean + 12);
    /* 바람 화살표 */
    const nArr = Math.min(6, Math.round(s.U / 8));
    ctx.strokeStyle = C.ink2; ctx.fillStyle = C.ink2; ctx.lineWidth = 1.6;
    for (let i = 0; i < nArr; i++) {
      const x = xShelf + 10 + i * (xR - xShelf - 30) / Math.max(1, nArr), y = 26 + (i % 2) * 10, len = 14 + s.U * 0.5;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + len + 5, y); ctx.lineTo(x + len - 2, y - 4); ctx.lineTo(x + len - 2, y + 4); ctx.fill();
    }
    ctx.font = `11px ${F.sans}`; ctx.fillText(`바람 ${s.U} m/s →`, xShelf + 4, 14);
    ctx.fillStyle = C.ink2; ctx.fillText("먼바다", xL + 2, yDeep - 6);
    ctx.textAlign = "center"; ctx.fillText(`대륙붕 ${(s.W / 1000).toFixed(0)} km, 수심 ${s.h} m`, (xShelf + xR) / 2, Math.min(yDeep - 6, yShelf + 16));
    ctx.save(); ctx.translate(xR + 12, yDeep - 8); ctx.rotate(-Math.PI / 2); ctx.textAlign = "left"; ctx.fillStyle = C.ink2; ctx.fillText("육지", 0, 0); ctx.restore();
    /* 오른쪽: 해안의 성분 막대 */
    const bx = w * 0.82, bw = w * 0.11, base = H * 0.80, top4 = Math.max(4.5, s.sum + 0.6), sc = (H * 0.66) / top4;
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx - 8, base); ctx.lineTo(bx + bw + 8, base); ctx.stroke();
    let y = base;
    const seg = (v, col, lab) => {
      if (Math.abs(v) < 1e-3) return;
      const hpx = v * sc; ctx.fillStyle = col; ctx.fillRect(bx, y - Math.max(hpx, 0), bw, Math.abs(hpx));
      if (Math.abs(hpx) > 13) { ctx.fillStyle = "#fff"; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(lab, bx + bw / 2, y - hpx / 2 + 4); }
      y -= hpx;
    };
    if (s.tide < 0) { ctx.fillStyle = "rgba(141,141,146,.5)"; ctx.fillRect(bx, base, bw, -s.tide * sc); ctx.fillStyle = C.ink; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("간조", bx + bw / 2, base - s.tide * sc / 2 + 4); }
    else seg(s.tide, "#8d8d92", "조석");
    seg(s.baro, C.amber, "기압");
    seg(s.wind, "#3f6fa3", "바람");
    const top = base - s.sum * sc;
    ctx.strokeStyle = C.apple; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx - 8, top); ctx.lineTo(bx + bw + 8, top); ctx.stroke();
    ctx.fillStyle = C.apple; ctx.font = `11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(cm(s.sum), bx + bw / 2, Math.max(12, top - 6));
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.fillText("해안 해수면", bx + bw / 2, H - 10);
    ctx.textAlign = "right"; ctx.font = `10px ${F.mono}`; for (let m = 0; m <= top4; m += top4 > 12 ? 5 : top4 > 6 ? 2 : 1) { if (base - m * sc > 8) ctx.fillText(`${m} m`, bx - 10, base - m * sc + 3); }
    ctx.textAlign = "left"; ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.fillText("세로 과장", xL + 2, H * 0.36 - 44);
  }
  function update() {
    const s = calc();
    $(".p-out").textContent = s.p; $(".u-out").textContent = s.U; $(".h-out").textContent = s.h; $(".w-out").textContent = (s.W / 1000).toFixed(0);
    $(".n-b").textContent = cm(s.baro); $(".n-w").textContent = cm(s.wind); $(".n-t").textContent = s.tide > 0 ? "+1.00 m" : s.tide < 0 ? "−1.00 m" : "0 cm";
    $(".n-sum").textContent = cm(s.sum);
    const bad = s.wind > 0.2 * s.h;
    $(".n-w").classList.toggle("bad", bad); $(".n-w").title = bad ? "밀림이 수심의 20%를 넘어 선형 식이 맞지 않습니다" : "";
    $(".lin").textContent = bad ? "밀림이 수심의 20%를 넘었습니다. 이 범위에서는 수심이 일정하다고 본 선형 식이 맞지 않습니다." : "";
    draw();
  }
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => {
    const [h, W] = b.dataset.p.split(",").map(Number); sH.value = h; sW.value = W;
    root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update();
  }));
  root.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => {
    tide = +b.dataset.t; root.querySelectorAll("[data-t]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update();
  }));
  [sP, sU, sH, sW].forEach((el) => el.addEventListener("input", update));
  update();
})();
