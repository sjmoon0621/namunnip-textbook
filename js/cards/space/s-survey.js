/* 카드: 하늘 사진 vs 적색 편이 지도 — 가상의 은하 분포(은하단·필라멘트·보이드, 신의 손가락) */
(() => {
  const root = document.getElementById("card-space-redshift-survey");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sN = $(".n"), oN = $(".n-out"), nS = $(".n-s");
  let view = "z";
  let seed = 21; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }, gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());
  // 부채꼴 좌표: 각 θ (−0.6 ~ 0.6 rad), 거리 r (0 ~ 1). 먼저 평면 x, y로 만든 뒤 변환
  const CL = Array.from({ length: 16 }, () => { const th = (rnd() - 0.5) * 1.1, r = 0.15 + rnd() * 0.8; return [r * Math.sin(th), r * Math.cos(th), 20 + Math.floor(rnd() * 60)]; });
  const VOIDS = Array.from({ length: 7 }, () => { const th = (rnd() - 0.5) * 1.1, r = 0.2 + rnd() * 0.75; return [r * Math.sin(th), r * Math.cos(th), 0.07 + rnd() * 0.08]; });
  const GAL = [];
  CL.forEach(([x, y, n]) => { for (let i = 0; i < n; i++) GAL.push([x + gauss() * 0.008, y + gauss() * 0.008, 1, rnd()]); });            // 은하단 (속도 분산 표시용 표시 1)
  for (let k = 0; k < CL.length; k++) { const a = CL[k], b = CL[(k * 5 + 3) % CL.length]; if (Math.hypot(a[0] - b[0], a[1] - b[1]) > 0.45) continue; for (let i = 0; i < 90; i++) { const t = rnd(); GAL.push([a[0] + (b[0] - a[0]) * t + gauss() * 0.012, a[1] + (b[1] - a[1]) * t + gauss() * 0.012, 0, rnd()]); } }
  for (let i = 0; i < 900; i++) { const th = (rnd() - 0.5) * 1.2, r = Math.sqrt(rnd()), x = r * Math.sin(th), y = r * Math.cos(th); if (VOIDS.some(([vx, vy, vr]) => Math.hypot(x - vx, y - vy) < vr)) continue; if (rnd() < 0.5) GAL.push([x, y, 0, rnd()]); }
  // 무작위 순서 (밝은 것부터 관측된다고 두고 rnd 키로 정렬)
  GAL.sort((p, q) => p[3] - q[3]);
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#07080d"; ctx.fillRect(0, 0, w, h);
    const n = +sN.value, list = GAL.slice(0, n);
    if (view === "z") {
      const ox = w / 2, oy = h - 10, R = Math.min(h - 20, w * 0.8);
      ctx.strokeStyle = "rgba(255,255,255,.15)"; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + R * Math.sin(-0.6), oy - R * Math.cos(-0.6)); ctx.moveTo(ox, oy); ctx.lineTo(ox + R * Math.sin(0.6), oy - R * Math.cos(0.6)); ctx.stroke();
      [0.25, 0.5, 0.75, 1].forEach((f) => { ctx.beginPath(); ctx.arc(ox, oy, R * f, -Math.PI / 2 - 0.6, -Math.PI / 2 + 0.6); ctx.stroke(); ctx.fillStyle = "#777"; ctx.font = `9px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`z=${(0.05 * f).toFixed(3)}`, ox + R * f * Math.sin(0.6) + 3, oy - R * f * Math.cos(0.6)); });
      list.forEach(([x, y, cl, k]) => { let r = Math.hypot(x, y), th = Math.atan2(x, y); if (cl) r += (k - 0.5) * 0.06; if (Math.abs(th) > 0.6 || r > 1) return; ctx.fillStyle = "rgba(220,230,255,.85)"; ctx.fillRect(ox + R * r * Math.sin(th), oy - R * r * Math.cos(th), 1.6, 1.6); });
      ctx.fillStyle = "#f5c542"; ctx.beginPath(); ctx.arc(ox, oy, 3, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#aaa"; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("우리은하 (관측자)", ox, oy - 8);
    } else {
      // 하늘 투영: 각 θ → 가로, 세로는 두께 방향의 무작위 (깊이 정보 사라짐)
      seed = 99; list.forEach(([x, y]) => { const th = Math.atan2(x, y); if (Math.abs(th) > 0.6) return; const u = (th + 0.6) / 1.2, vv = rnd(), r = Math.hypot(x, y); ctx.fillStyle = `rgba(220,230,255,${0.9 - 0.6 * r})`; const s = 2.6 - 1.8 * r; ctx.beginPath(); ctx.arc(10 + u * (w - 20), 10 + vv * (h - 20), Math.max(0.6, s / 1.5), 0, Math.PI * 2); ctx.fill(); });
      // 같은 방향의 앞뒤(다른 깊이·다른 띠)에 있는 은하들도 사진에 함께 겹쳐 찍힘
      for (let i = 0; i < n * 1.2; i++) { const r = rnd(); ctx.fillStyle = `rgba(220,230,255,${0.7 - 0.5 * r})`; ctx.beginPath(); ctx.arc(10 + rnd() * (w - 20), 10 + rnd() * (h - 20), Math.max(0.6, (2.6 - 1.8 * r) / 1.5), 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = "#aaa"; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("하늘의 좁은 띠를 찍은 사진처럼 (가까운 은하는 크고 밝게)", 10, h - 8);
    }
  }
  function update() {
    root.querySelectorAll("[data-v]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === view)));
    oN.textContent = (+sN.value).toLocaleString();
    nS.textContent = view === "sky" ? "은하가 거의 고르게 흩어진 것처럼 보임 — 깊이 정보가 없음" : +sN.value < 400 ? "은하 수가 적어 구조가 흐릿함" : "벽과 실(필라멘트), 빈 공간(보이드), 관측자를 향한 길쭉한 무늬(은하단)";
    draw();
  }
  root.querySelectorAll("[data-v]").forEach((b) => b.addEventListener("click", () => { view = b.dataset.v; update(); }));
  sN.addEventListener("input", update); update();
})();
