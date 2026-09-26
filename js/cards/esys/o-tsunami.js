/* 카드: 먼바다에서 1 m였던 지진 해일이 해안에서는 왜 훨씬 높아질까? — c = √(gd), 그린의 법칙 */
(() => {
  const root = document.getElementById("card-esys-tsunami");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), oT = $(".t-out"), sA = $(".a"), oA = $(".a-out"), nD = $(".n-d"), nC = $(".n-c"), nH = $(".n-h"), nArr = $(".n-arr");
  const g = 9.8, XS = 800; // km, 진원 0 → 해안 800
  const depth = (x) => x < 560 ? 4000 : x < 700 ? 4000 - 3800 * (x - 560) / 140 : x < 790 ? 200 - 190 * (x - 700) / 90 : Math.max(0.5, 10 - (x - 790));
  // 도착 시각 표 (분): dt = dx / √(gd)
  const TT = [0]; for (let i = 1; i <= 790; i++) TT.push(TT[i - 1] + 1000 / Math.sqrt(g * depth(i - 0.5)) / 60);
  const posAt = (tm) => { let i = 0; while (i < 790 && TT[i + 1] <= tm) i++; return i >= 790 ? 790 : i + (tm - TT[i]) / (TT[i + 1] - TT[i]); };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 44, x1 = w - 14, sea = h * 0.34, bot = h - 36, X = (x) => x0 + x / XS * (x1 - x0), Z = (d) => sea + d / 4000 * (bot - sea);
    // 바다와 바닥
    ctx.fillStyle = "rgba(110,164,230,.22)"; ctx.beginPath(); ctx.moveTo(X(0), sea); for (let x = 0; x <= XS; x += 4) ctx.lineTo(X(x), Z(Math.min(depth(x), 4000))); ctx.lineTo(X(XS), sea); ctx.fill();
    ctx.fillStyle = "#c9a98a"; ctx.beginPath(); ctx.moveTo(X(0), bot + 10); for (let x = 0; x <= XS; x += 4) ctx.lineTo(X(x), Z(depth(x))); ctx.lineTo(X(XS), sea - 20); ctx.lineTo(X(XS), bot + 10); ctx.fill();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; [0, 2000, 4000].forEach((d) => ctx.fillText(`${d} m`, x0 - 4, Z(d) + 3));
    ctx.textAlign = "center"; [0, 200, 400, 600, 800].forEach((x) => { ctx.textAlign = x === 800 ? "right" : "center"; ctx.fillText(`${x} km`, X(x), bot + 24); });
    ctx.fillStyle = "#d7263d"; ctx.beginPath(); ctx.arc(X(0) + 4, Z(4000) - 4, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("지진(해저 변형)", X(0) + 12, Z(4000) - 6);
    ctx.fillText("해안", X(XS) - 26, sea - 26);
    // 해일: 위치 p, 폭은 속도에 비례, 높이는 그린의 법칙 (세로 과장)
    const tm = +sT.value, p = posAt(tm), d = depth(p), H0 = +sA.value, H = H0 * (4000 / d) ** 0.25, c = Math.sqrt(g * d);
    const half = Math.max(6, c / 200 * 60), amp = Math.min(sea - 18, H * 9);
    ctx.fillStyle = "rgba(63,111,163,.8)"; ctx.beginPath(); ctx.moveTo(x0, sea);
    for (let px = x0; px <= x1; px += 2) { const u = (px - X(p)) / half; ctx.lineTo(px, sea - amp * Math.exp(-u * u)); }
    ctx.lineTo(x1, sea); ctx.fill();
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, sea); ctx.lineTo(x1, sea); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(`${H.toFixed(1)} m · ${Math.round(c * 3.6)} km/h`, Math.min(x1 - 60, Math.max(x0 + 60, X(p))), sea - amp - 8);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("물결 높이는 세로로 크게 과장, 폭은 속도에 비례해 그림", x0, 14);
  }
  function update() {
    const tm = +sT.value, p = posAt(tm), d = depth(p), H0 = +sA.value, c = Math.sqrt(g * d);
    oT.textContent = tm; oA.textContent = H0.toFixed(1);
    nD.textContent = `약 ${d >= 100 ? Math.round(d / 10) * 10 : Math.round(d)} m (진원에서 ${Math.round(p)} km)`;
    nC.textContent = `${Math.round(c)} m/s (시속 ${Math.round(c * 3.6)} km)`;
    nH.textContent = `약 ${(H0 * (4000 / d) ** 0.25).toFixed(1)} m`;
    nArr.textContent = `지진 후 약 ${Math.round(TT[790])} 분`;
    draw();
  }
  sT.addEventListener("input", update); sA.addEventListener("input", update); update();
})();
