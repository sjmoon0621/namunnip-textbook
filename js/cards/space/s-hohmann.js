/* 카드: 화성에 가려면 왜 2년 2개월마다 떠날까? — 호만 전이 궤도, 위상각, 회합 주기 */
(() => {
  const root = document.getElementById("card-space-hohmann");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), oT = $(".t-out"), nT = $(".n-t"), nA = $(".n-a"), nS = $(".n-s"), nV = $(".n-v");
  const PL = [["수성", 0.387], ["금성", 0.723], ["지구", 1], ["화성", 1.524], ["목성", 5.203], ["토성", 9.537], ["천왕성", 19.19], ["해왕성", 30.07]];
  let pi = 3;
  function calc() {
    const a2 = PL[pi][1], at = (1 + a2) / 2, tt = 0.5 * at ** 1.5, P2 = a2 ** 1.5, syn = 1 / Math.abs(1 - 1 / P2);
    const lead = ((180 - 360 * tt / P2) % 360 + 360) % 360; // 발사 때 행성이 지구보다 앞선 각
    const v1 = 29.78, dv = v1 * (Math.sqrt(2 * a2 / (1 + a2)) - 1);
    return { a2, at, tt, P2, syn, lead, dv };
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = calc(), cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.44 / Math.max(1, k.a2), f = +sT.value / 100, t = f * k.tt;
    ctx.fillStyle = "#111"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#f5c542"; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
    [[1, "#3f8fdf", "지구"], [k.a2, "#e07a4a", PL[pi][0]]].forEach(([a, col]) => { ctx.strokeStyle = col + "88"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, a * R, 0, Math.PI * 2); ctx.stroke(); });
    // 전이 궤도 (지구 위치 = 각 0에서 출발, 반 바퀴 뒤 각 180°)
    const aT = k.at, e = Math.abs(k.a2 - 1) / (k.a2 + 1), inner = k.a2 < 1;
    const pos = (M) => { let E = M; for (let i = 0; i < 20; i++) E = M + e * Math.sin(E); const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2)), r = aT * (1 - e * Math.cos(E)); return [r, nu]; };
    const pt = (r, th) => [cx + r * R * Math.cos(th), cy - r * R * Math.sin(th)];
    ctx.strokeStyle = "#8fd18f"; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5; ctx.beginPath();
    // 안쪽 행성으로 갈 때는 지구 위치가 원일점이므로 평균 근점 이각을 π만큼 옮긴다
    const at2 = (M) => { const [r, nu] = pos(inner ? M + Math.PI : M); return [r, inner ? nu - Math.PI : nu]; };
    for (let i = 0; i <= 100; i++) { const [r, th] = at2(Math.PI * i / 100), [x, y] = pt(r, th); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.setLineDash([]);
    // 현재 위치들
    const earthTh = 2 * Math.PI * t, planTh = (k.lead * Math.PI / 180) + 2 * Math.PI * t / k.P2, [r, scTh] = at2(Math.PI * f);
    const dot = (xy, col, r0, lab) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(xy[0], xy[1], r0, 0, Math.PI * 2); ctx.fill(); if (lab) { ctx.fillStyle = "#ddd"; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(lab, xy[0], xy[1] - r0 - 4); } };
    dot(pt(1, earthTh), "#3f8fdf", 5, "지구"); dot(pt(k.a2, planTh), "#e07a4a", 5, PL[pi][0]); dot(pt(r, scTh), "#fff", 3.5, "탐사선");
    ctx.fillStyle = "#aaa"; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`발사 후 ${(t * 12).toFixed(1)}개월`, 8, 16);
  }
  function update() {
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.p === pi)));
    const k = calc(); oT.textContent = sT.value;
    nT.textContent = k.tt < 2 ? `약 ${(k.tt * 12).toFixed(1)}개월` : `약 ${k.tt.toFixed(1)}년`;
    nA.textContent = `${k.lead.toFixed(0)}°`; nS.textContent = k.syn < 2 ? `약 ${(k.syn * 12).toFixed(0)}개월` : `약 ${k.syn.toFixed(2)}년`;
    nV.textContent = `${Math.abs(k.dv).toFixed(1)} km/s ${k.dv < 0 ? "감속" : "가속"} (지구 공전 속도 29.8 km/s 기준)`;
    draw();
  }
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { pi = +b.dataset.p; update(); }));
  sT.addEventListener("input", update); update();
})();
