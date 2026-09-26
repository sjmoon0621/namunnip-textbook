/* 카드: 떠오른 공기 덩어리는 어디까지 올라갈까? — 건조·습윤 단열선, 상승 응결 고도, 안정도 */
(() => {
  const root = document.getElementById("card-esys-stability");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), oT = $(".t-out"), sTd = $(".td"), oTd = $(".td-out"), sG = $(".g"), oG = $(".g-out"), nS = $(".n-s"), nB = $(".n-b"), nC = $(".n-c");
  const GD = 10, gm = (t) => 10 - 6.5 / (1 + Math.exp(-(t + 5) / 12)), ZT = 14, ZTP = 11; // ZTP: 대류권 계면 (그 위는 기온 일정)
  function calc() {
    const T0 = +sT.value, Td = Math.min(+sTd.value, T0), Ge = +sG.value, zc = (T0 - Td) / 8;
    const env = (z) => T0 - Ge * Math.min(z, ZTP);
    // 습윤 단열 감률은 기온이 낮을수록 건조 단열 감률에 가까워진다 (근사식)
    const TP = [T0]; for (let i = 1; i <= ZT * 100; i++) { const z = (i - 0.5) / 100, t = TP[i - 1]; TP.push(t - (z <= zc ? GD : gm(t)) / 100); }
    const parcel = (z) => TP[Math.max(0, Math.min(TP.length - 1, Math.round(z * 100)))];
    // 구름 꼭대기: LCL 위에서 덩어리가 주변보다 따뜻한 구간의 끝
    let top = null;
    if (zc < ZT && parcel(zc) >= env(zc) - 1e-9) { top = ZT; for (let z = zc; z <= ZT; z += 0.01) if (parcel(z) < env(z)) { top = z; break; } }
    else if (zc < ZT) { let zf = null; for (let z = zc; z <= ZTP; z += 0.01) if (parcel(z) >= env(z)) { zf = z; break; } if (zf !== null) { top = ZT; for (let z = zf + 0.01; z <= ZT; z += 0.01) if (parcel(z) < env(z)) { top = z; break; } return { T0, Td, Ge, zc, env, parcel, top, zf, gmb: gm(parcel(zc)) }; } }
    return { T0, Td, Ge, zc, env, parcel, top, zf: null, gmb: gm(parcel(Math.min(zc, ZT))) };
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = calc(), x0 = 40, x1 = w * 0.74, y0 = h - 26, y1 = 12, TL = -90, TR = 40;
    const X = (t) => x0 + (t - TL) / (TR - TL) * (x1 - x0), Y = (z) => y0 - z / ZT * (y0 - y1);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3;
    for (let t = -80; t <= 40; t += 20) { ctx.beginPath(); ctx.moveTo(X(t), y1); ctx.lineTo(X(t), y0); ctx.stroke(); ctx.textAlign = "center"; ctx.fillText(`${t}°C`, X(t), y0 + 13); }
    for (let z = 0; z <= ZT; z += 2) { ctx.textAlign = "right"; ctx.fillText(`${z} km`, x0 - 4, Y(z) + 3); }
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    // 구름
    if (r.top !== null && r.zc < ZT) { const zb = r.zf ?? r.zc; ctx.fillStyle = "rgba(141,141,146,.18)"; ctx.fillRect(x0 + 1, Y(r.top), x1 - x0 - 1, Y(zb) - Y(r.top)); }
    if (r.zc < ZT) { ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(x0, Y(r.zc)); ctx.lineTo(x1, Y(r.zc)); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.font = `10px ${F.sans}`; ctx.fillText("상승 응결 고도", x0 + 4, Y(r.zc) - 4); }
    const line = (f, z0, z1, col, lw, dash) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath(); for (let z = z0; z <= z1 + 1e-6; z += 0.05) { const t = f(z); z === z0 ? ctx.moveTo(X(t), Y(z)) : ctx.lineTo(X(t), Y(z)); } ctx.stroke(); ctx.setLineDash([]); };
    line(r.env, 0, ZT, C.ink, 2.4);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("대류권 계면", x1 - 4, Y(ZTP) - 4); ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(x0, Y(ZTP)); ctx.lineTo(x1, Y(ZTP)); ctx.stroke();
    line((z) => r.Td - 2 * z, 0, Math.min(r.zc, ZT), "#3b7c2a", 1.4, [4, 3]);
    line(r.parcel, 0, Math.min(r.zc, ZT), C.warn, 2);
    if (r.zc < ZT) line(r.parcel, r.zc, ZT, "#3f6fa3", 2);
    // 범례
    const lx = X(-88); ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.save(); ctx.translate(0, Y(9) - 20);
    [[C.ink, "주변 공기 기온"], [C.warn, "공기 덩어리 (건조 단열)"], ["#3f6fa3", "공기 덩어리 (습윤 단열)"], ["#3b7c2a", "덩어리의 이슬점"], ["rgba(141,141,146,.5)", "구름 (덩어리가 더 따뜻)"]].forEach(([c, t], i) => { ctx.fillStyle = c; ctx.fillRect(lx, 20 + i * 18, 12, 4); ctx.fillStyle = C.ink2; ctx.fillText(t, lx + 16, 25 + i * 18); }); ctx.restore();
    // 적운 그림
    if (r.top !== null && r.zc < ZT) { const zb = r.zf ?? r.zc, cx = (x1 + w) / 2, tall = Y(zb) - Y(r.top); ctx.fillStyle = "#e6e6e3"; ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.rect(cx - 22, Y(r.top), 44, tall); ctx.fill(); ctx.stroke(); for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(cx - 17 + k * 11, Y(r.top), 7, Math.PI, 0); ctx.fill(); } }
  }
  function update() {
    if (+sTd.value > +sT.value) sTd.value = sT.value;
    oT.textContent = sT.value; oTd.textContent = sTd.value; oG.textContent = (+sG.value).toFixed(1);
    const r = calc();
    nS.textContent = r.Ge < r.gmb ? "절대 안정" : r.Ge > GD ? "절대 불안정" : "조건부 불안정";
    nB.textContent = r.zc < 0.02 ? "지표 — 안개" : r.zc >= ZT ? "14 km 이상" : `약 ${(r.zc * 1000).toFixed(0)} m`;
    nC.textContent = r.top === null ? (r.zc < ZT ? "스스로 오르지 못함 — 강제 상승 시 층운형 구름" : "없음") : r.zf ? `자유 대류 고도 ${r.zf.toFixed(1)} km부터 ${r.top.toFixed(1)} km까지 적운형 구름 (그 아래까지는 강제 상승 필요)` : `적운형 구름 — 꼭대기 약 ${r.top.toFixed(1)} km`;
    draw();
  }
  [sT, sTd, sG].forEach((s) => s.addEventListener("input", update)); update();
})();
