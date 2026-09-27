/* 카드: 10만 년 뒤 북두칠성은 어떤 모양일까? — 고유 운동으로 위치 이동, v_t = 4.74 μd */
(() => {
  const root = document.getElementById("card-space-proper-motion");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), oT = $(".t-out"), nM = $(".n-m"), nT = $(".n-t"), nR = $(".n-r"), nV = $(".n-v");
  // [이름, 적경°, 적위°, μα* mas/yr, μδ mas/yr, 거리 pc, 시선 속도 km/s, 등급] (대략값)
  const S = [
    ["두베", 165.93, 61.75, -134, -35, 37.7, -9, 1.8], ["메라크", 165.46, 56.38, 82, 34, 24.4, -12, 2.4], ["페크다", 178.46, 53.69, 108, 11, 25.5, -13, 2.4],
    ["메그레즈", 183.86, 57.03, 104, 8, 24.7, -13, 3.3], ["알리오스", 193.51, 55.96, 112, -9, 25.3, -9, 1.8], ["미자르", 200.98, 54.93, 120, -22, 25.0, -6, 2.2], ["알카이드", 206.89, 49.31, -121, -15, 31.9, -11, 1.9],
  ];
  const LINES = [[6, 5], [5, 4], [4, 3], [3, 2], [2, 1], [1, 0], [0, 3]];
  let si = 4; const RA0 = 186, DE0 = 55.5;
  const pos = (s, t) => { const cd = Math.cos(s[2] * Math.PI / 180), ra = s[1] + s[3] * t / 3.6e6 / cd, de = s[2] + s[4] * t / 3.6e6; return [-(ra - RA0) * Math.cos(DE0 * Math.PI / 180), de - DE0]; };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0c1020"; ctx.fillRect(0, 0, w, h);
    const t = +sT.value, sc = Math.min(w / 34, h / 20), cx = w / 2, cy = h / 2 + 10, P = ([x, y]) => [cx + x * sc, cy - y * sc];
    // 오늘의 모양 (희미하게)
    ctx.strokeStyle = "rgba(255,255,255,.15)"; ctx.lineWidth = 1; LINES.forEach(([a, b]) => { const [x1, y1] = P(pos(S[a], 0)), [x2, y2] = P(pos(S[b], 0)); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); });
    ctx.strokeStyle = "rgba(160,200,255,.7)"; ctx.lineWidth = 1.5; LINES.forEach(([a, b]) => { const [x1, y1] = P(pos(S[a], t)), [x2, y2] = P(pos(S[b], t)); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); });
    S.forEach((s, i) => { const [x, y] = P(pos(s, t)), [x0, y0] = P(pos(s, 0)); if (t) { ctx.strokeStyle = i === si ? "rgba(224,160,42,.8)" : "rgba(255,255,255,.25)"; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]); }
      ctx.fillStyle = i === si ? "#f5c542" : "#fff"; ctx.beginPath(); ctx.arc(x, y, 5 - s[7], 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#bbb"; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(s[0], x, y - 8); });
    ctx.fillStyle = "#aaa"; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(t === 0 ? "오늘" : `${Math.abs(t).toLocaleString()}년 ${t > 0 ? "뒤" : "전"} (흐린 선: 오늘)`, 10, 16); ctx.textAlign = "right"; ctx.fillText("↑ 북 · ← 동", w - 10, 16);
  }
  function update() {
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.s === si)));
    const t = +sT.value; oT.textContent = t === 0 ? "0 (오늘)" : `${t > 0 ? "+" : "−"}${Math.abs(t).toLocaleString()}`;
    const s = S[si], mu = Math.hypot(s[3], s[4]) / 1000, vt = 4.74 * mu * s[5];
    nM.textContent = `${mu.toFixed(3)}″/년 · ${s[5]} pc`; nT.textContent = `${vt.toFixed(1)} km/s`; nR.textContent = `${s[6]} km/s (다가오는 중)`; nV.textContent = `${Math.hypot(vt, s[6]).toFixed(1)} km/s`;
    draw();
  }
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { si = +b.dataset.s; update(); }));
  sT.addEventListener("input", update); update();
})();
