/* 카드: 성단 사진 한 장으로 나이와 거리를 알 수 있을까? — 합성 C–M도, 전향점, 주계열 맞추기 */
(() => {
  const root = document.getElementById("card-space-cluster");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sA = $(".a"), oA = $(".a-out"), sD = $(".d"), oD = $(".d-out"), nT = $(".n-t"), nM = $(".n-m");
  // 주계열: [B−V, M_V, 질량]
  const MS = [[-0.3, -4.0, 15], [-0.15, -1.5, 5], [0.0, 0.6, 2.5], [0.3, 2.6, 1.6], [0.6, 4.4, 1.05], [0.8, 5.9, 0.85], [1.0, 6.6, 0.75], [1.4, 9.5, 0.5], [1.6, 11.5, 0.3]];
  const interp = (arr, xi, yi, x) => { for (let i = 1; i < arr.length; i++) if ((arr[i][xi] - x) * (arr[i - 1][xi] - x) <= 0) { const t = (x - arr[i - 1][xi]) / (arr[i][xi] - arr[i - 1][xi]); return arr[i - 1][yi] + t * (arr[i][yi] - arr[i - 1][yi]); } return x < arr[0][xi] === arr[0][xi] < arr[1][xi] ? arr[0][yi] : arr[arr.length - 1][yi]; };
  const byMass = [...MS].sort((a, b) => a[2] - b[2]);
  const bvOfM = (m) => interp(byMass, 2, 0, m), mvOfM = (m) => interp(byMass, 2, 1, m);
  const life = (m) => 1e10 * m ** -2.5;
  let seed = 3; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  seed = 7; const STARS = Array.from({ length: 320 }, () => { const m = 0.35 * (1 - rnd()) ** (-1 / 1.35); return [Math.min(m, 15), (rnd() - 0.5) * 0.06, (rnd() - 0.5) * 0.25, rnd()]; });
  const PRE = { pl: [8.0, 136], hy: [8.8, 47], gc: [10.08, 7100] };
  function turnoff() { const age = 10 ** +sA.value; return (1e10 / age) ** (1 / 2.5); }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const dist = 10 ** +sD.value, mu = 5 * Math.log10(dist) - 5, mto = turnoff(), x0 = 40, x1 = w - 12, y0 = h - 26, y1 = 12, X = (bv) => x0 + (bv + 0.4) / 2.1 * (x1 - x0), top = Math.max(22, mu + 12.5), Y = (m) => y1 + (m + 6) / (top + 6) * (y0 - y1);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.mono}`; ctx.textAlign = "right"; [-5, 0, 5, 10, 15, 20, 25].filter((m) => m <= top).forEach((m) => ctx.fillText(m, x0 - 4, Y(m) + 3)); ctx.textAlign = "center"; [-0.2, 0.4, 1.0, 1.6].forEach((b) => ctx.fillText(b, X(b), y0 + 12));
    ctx.fillText("색지수 B−V (파랑 ← → 빨강)", (x0 + x1) / 2, y0 + 23 > h ? h - 2 : y0 + 23);
    ctx.save(); ctx.translate(11, (y0 + y1) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText("등급 (위로 갈수록 밝음)", 0, 0); ctx.restore();
    // 기준 주계열 (절대 등급)
    ctx.strokeStyle = "rgba(141,141,146,.8)"; ctx.setLineDash([4, 3]); ctx.beginPath(); MS.forEach(([bv, M], i) => (i ? ctx.lineTo(X(bv), Y(M)) : ctx.moveTo(X(bv), Y(M)))); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("기준 주계열 (절대 등급)", X(0.9), Y(6) - 6);
    // 별
    const bvTO = bvOfM(mto), mvTO = mvOfM(mto), old = mto < 1.2;
    STARS.forEach(([m, dbv, dmv, r]) => {
      let bv, mv;
      if (m <= mto) { bv = bvOfM(m) + dbv; mv = mvOfM(m) + dmv; }
      else if (m < mto * 1.15) { const f = (m / mto - 1) / 0.15; bv = bvTO + f * (old ? 0.9 : 1.3) + dbv; mv = mvTO - f * (old ? 4.5 : 3) + dmv; if (old && r < 0.25) { bv = 0.2 + r * 2; mv = 0.6 + dmv; } }
      else return; // 이미 진화를 마친 별 (백색 왜성 등)
      const col = bv < 0 ? "#6f9cff" : bv < 0.5 ? "#dfe6ff" : bv < 1 ? "#ffe29a" : "#ff9a5a";
      ctx.fillStyle = col; ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.arc(X(bv), Y(mv + mu), 2.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    });
    // 전향점 표시
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(bvTO), Y(mvTO + mu), 8, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = C.warn; ctx.font = `600 10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("전향점", X(bvTO) + 10, Y(mvTO + mu) - 6);
    // 거리 지수 화살표
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(1.45), Y(interp(MS, 0, 1, 1.45))); ctx.lineTo(X(1.45), Y(interp(MS, 0, 1, 1.45) + mu)); ctx.stroke(); ctx.fillStyle = C.forest; ctx.textAlign = "right"; ctx.fillText(`m − M = ${mu.toFixed(1)}`, X(1.42), Y(interp(MS, 0, 1, 1.45) + mu / 2));
  }
  function update() {
    const age = 10 ** +sA.value, dist = 10 ** +sD.value, mto = turnoff(), mu = 5 * Math.log10(dist) - 5;
    oA.textContent = age >= 1e8 ? `약 ${(age / 1e8).toFixed(age >= 1e9 ? 0 : 1)}억 년` : `약 ${Math.round(age / 1e6)}백만 년`;
    oD.textContent = dist < 1000 ? `${Math.round(dist)} pc` : `${(dist / 1000).toFixed(1)} kpc`;
    nT.textContent = `태양 질량의 약 ${mto.toFixed(mto < 10 ? 2 : 0)}배 · 색지수 ${bvOfM(mto).toFixed(2)}`; nM.textContent = `${mu.toFixed(2)} → 거리 ${dist < 1000 ? Math.round(dist) + " pc" : (dist / 1000).toFixed(1) + " kpc"}`;
    root.querySelectorAll("[data-c]").forEach((b) => { const [la, d] = PRE[b.dataset.c]; b.setAttribute("aria-pressed", String(Math.abs(+sA.value - la) < 0.01 && Math.abs(10 ** +sD.value - d) < 1)); });
    draw();
  }
  root.querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => { const [la, d] = PRE[b.dataset.c]; sA.value = la; sD.value = Math.log10(d); update(); }));
  sA.addEventListener("input", update); sD.addEventListener("input", update); update();
})();
