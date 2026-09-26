/* 카드: 공기는 왜 위로 떠오르지도, 가라앉지도 않을까? — 등온 대기 두 기둥의 기압면 높이, 정역학 평형 */
(() => {
  const root = document.getElementById("card-esys-hydro");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sA = $(".a"), oA = $(".a-out"), sB = $(".b"), oB = $(".b-out"), nH = $(".n-h"), nP = $(".n-p"), nF = $(".n-f");
  const H = (tc) => 29.27 * (tc + 273.15) / 1000; // km
  const zOf = (p, tc) => H(tc) * Math.log(1000 / p), pOf = (z, tc) => 1000 * Math.exp(-z / H(tc));
  const LV = [850, 700, 500, 300, 200];
  const mix = (tc) => { const f = (tc + 40) / 80; return `rgb(${Math.round(90 + 150 * f)},${Math.round(140 - 30 * f)},${Math.round(220 - 170 * f)})`; };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const ta = +sA.value, tb = +sB.value, x0 = 44, x1 = w * 0.66, y0 = h - 24, y1 = 14, ZM = 13, Y = (z) => y0 - z / ZM * (y0 - y1);
    const ca = x0 + (x1 - x0) * 0.22, cb = x0 + (x1 - x0) * 0.78, cw = (x1 - x0) * 0.26;
    ctx.globalAlpha = 0.25; ctx.fillStyle = mix(ta); ctx.fillRect(ca - cw / 2, y1, cw, y0 - y1); ctx.fillStyle = mix(tb); ctx.fillRect(cb - cw / 2, y1, cw, y0 - y1); ctx.globalAlpha = 1;
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; for (let z = 0; z <= 12; z += 2) ctx.fillText(`${z} km`, x0 - 4, Y(z) + 3);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    // 기압면: 기둥 사이를 선으로 잇는다
    LV.forEach((p) => {
      const za = zOf(p, ta), zb = zOf(p, tb); if (Math.max(za, zb) > ZM) return;
      ctx.strokeStyle = p === 500 ? C.warn : "#3f6fa3"; ctx.lineWidth = p === 500 ? 2.4 : 1.4; ctx.beginPath(); ctx.moveTo(ca - cw / 2, Y(za)); ctx.lineTo(ca + cw / 2, Y(za)); ctx.lineTo(cb - cw / 2, Y(zb)); ctx.lineTo(cb + cw / 2, Y(zb)); ctx.stroke();
      ctx.fillStyle = ctx.strokeStyle; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`${p} hPa`, cb + cw / 2 + 4, Y(zb) + 3);
    });
    ctx.fillStyle = C.ink2; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(`${ta} °C`, ca, y0 - 6); ctx.fillText(`${tb} °C`, cb, y0 - 6);
    // 5 km 높이의 기압 비교와 상층 흐름
    const pa = pOf(5, ta), pb = pOf(5, tb);
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(x0, Y(5)); ctx.lineTo(x1, Y(5)); ctx.stroke(); ctx.setLineDash([]);
    if (Math.abs(pa - pb) > 3) { const dir = pa > pb ? 1 : -1, xm = (ca + cb) / 2; ctx.strokeStyle = C.forest; ctx.fillStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xm - dir * 26, Y(5) - 10); ctx.lineTo(xm + dir * 26, Y(5) - 10); ctx.stroke(); ctx.beginPath(); ctx.moveTo(xm + dir * 32, Y(5) - 10); ctx.lineTo(xm + dir * 22, Y(5) - 15); ctx.lineTo(xm + dir * 22, Y(5) - 5); ctx.fill(); ctx.font = `10px ${F.sans}`; ctx.fillText("상층 공기 흐름", xm, Y(5) - 20); }
    // 오른쪽: 공기 층의 힘 균형
    const bx = w * 0.84, by = h * 0.5, bw = w * 0.14, bh = 44;
    ctx.fillStyle = "rgba(110,164,230,.25)"; ctx.fillRect(bx - bw / 2, by - bh / 2, bw, bh); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.strokeRect(bx - bw / 2, by - bh / 2, bw, bh);
    const ar = (x, ya, yb, col, t, side) => { ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, ya); ctx.lineTo(x, yb); ctx.stroke(); const d = Math.sign(yb - ya); ctx.beginPath(); ctx.moveTo(x, yb + d * 4); ctx.lineTo(x - 6, yb - d * 6); ctx.lineTo(x + 6, yb - d * 6); ctx.fill(); ctx.font = `10px ${F.sans}`; ctx.textAlign = side; ctx.fillText(t, x + (side === "left" ? 9 : -9), (ya + yb) / 2 + 3); };
    ar(bx - 12, by + bh / 2 + 44, by + bh / 2 + 4, "#3f6fa3", "기압 차", "right"); ar(bx + 12, by - bh / 2 - 44, by - bh / 2 - 4, C.warn, "무게", "left");
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("공기 층", bx, by + 4); ctx.fillText("위로 미는 힘 = 무게", bx, h - 10);
  }
  function update() {
    const ta = +sA.value, tb = +sB.value; oA.textContent = String(ta).replace("-", "−"); oB.textContent = String(tb).replace("-", "−");
    nH.textContent = `${zOf(500, ta).toFixed(2)} km · ${zOf(500, tb).toFixed(2)} km`;
    nP.textContent = `${Math.round(pOf(5, ta))} hPa · ${Math.round(pOf(5, tb))} hPa`;
    const t = (ta + tb) / 2, rho = 100000 / (287 * (t + 273.15)); nF.textContent = `지표 근처에서 약 ${Math.round(rho * 9.8 * 1000 / 100)} hPa`;
    draw();
  }
  sA.addEventListener("input", update); sB.addEventListener("input", update); update();
})();
