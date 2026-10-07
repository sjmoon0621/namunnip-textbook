/* 카드: 움직임–화면 지연 — 머리 회전 θ(t), 지연된 렌더링, 선형 예측 보정 */
(() => {
  const root = document.getElementById("card-hist-latency");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), sW = $(".w"), cP = $(".pred");
  const FR = 0.5, PXD = 20;
  let t = 0.5;
  const amp = () => +sW.value / (2 * Math.PI * FR);
  const th = (s) => amp() * Math.sin(2 * Math.PI * FR * s);
  const om = (s) => amp() * 2 * Math.PI * FR * Math.cos(2 * Math.PI * FR * s);
  function shown(s) {
    const tau = +sT.value / 1000, s0 = s - tau;
    return cP.checked ? th(s0) + om(s0) * tau : th(s0);
  }
  // 한 주기 동안의 최대 오차
  function maxErr() { let m = 0; for (let i = 0; i < 400; i++) { const s = i / 400 / FR; m = Math.max(m, Math.abs(th(s) - shown(s))); } return m; }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = th(t), ad = shown(t);
    // 왼쪽: 머리 위에서 보기
    const cx = w * 0.18, cy = h * 0.56, r = Math.min(w * 0.08, h * 0.15);
    const dir = (deg) => -Math.PI / 2 + deg * Math.PI / 180;
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("위에서 본 머리", cx, 14);
    // 가상 상자 방향 (정면 0°)
    ctx.strokeStyle = C.rule; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - r * 2.6); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.amber; ctx.fillRect(cx - 7, cy - r * 2.6 - 7, 14, 14);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.fillStyle = C.card;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const nd = dir(a); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(cx + Math.cos(nd) * (r + 9), cy + Math.sin(nd) * (r + 9)); ctx.lineTo(cx + Math.cos(nd + 0.35) * r, cy + Math.sin(nd + 0.35) * r); ctx.lineTo(cx + Math.cos(nd - 0.35) * r, cy + Math.sin(nd - 0.35) * r); ctx.fill();
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(nd) * r * 2.2, cy + Math.sin(nd) * r * 2.2); ctx.stroke();
    ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(cx, cy); const dd = dir(ad); ctx.lineTo(cx + Math.cos(dd) * r * 2.2, cy + Math.sin(dd) * r * 2.2); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.forest; ctx.fillText("실제 방향", 8, h - 24); ctx.fillStyle = C.warn; ctx.fillText("화면이 쓴 방향", 8, h - 10);
    // 오른쪽: 헤드셋 화면 (시야 90°)
    const vx = w * 0.38, vw = w - vx - 8, vy = 26, vh = h - 54, k = vw / 90;
    ctx.fillStyle = "#14171b"; ctx.fillRect(vx, vy, vw, vh);
    ctx.save(); ctx.beginPath(); ctx.rect(vx, vy, vw, vh); ctx.clip();
    // 실제 세계에 고정된 눈금 (실제 머리 방향 기준) — 현실/패스스루 배경
    ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = 1;
    for (let g = -90; g <= 90; g += 15) { const x = vx + vw / 2 + (g - a) * k; ctx.beginPath(); ctx.moveTo(x, vy); ctx.lineTo(x, vy + vh); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(vx, vy + vh * 0.7); ctx.lineTo(vx + vw, vy + vh * 0.7); ctx.stroke();
    const bs = vh * 0.28, by = vy + vh * 0.7 - bs;
    const xTrue = vx + vw / 2 + (0 - a) * k, xDraw = vx + vw / 2 + (0 - ad) * k;
    ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5; ctx.strokeRect(xTrue - bs / 2, by, bs, bs); ctx.setLineDash([]);
    ctx.fillStyle = C.amber; ctx.fillRect(xDraw - bs / 2, by, bs, bs);
    ctx.restore();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("헤드셋 화면 (시야 90°)", vx, 16);
    ctx.textAlign = "right"; ctx.fillStyle = Math.abs(a - ad) > 1 ? C.warn : C.forest; ctx.font = `10.5px ${F.mono}`;
    ctx.fillText(`어긋남 ${(Math.abs(a - ad)).toFixed(1)}°`, vx + vw, h - 12);
  }
  function update() {
    $(".t-out").textContent = sT.value; $(".w-out").textContent = sW.value;
    const m = maxErr();
    $(".n-a").textContent = `${m.toFixed(2)}°`; $(".n-a").className = "n-a" + (m > 1 ? " bad" : " good");
    $(".n-p").textContent = `약 ${Math.round(m * PXD)} 화소`;
    draw();
  }
  let acc = 0;
  loop(cv, (dt) => {
    if (NM.reduce) return false;
    t += dt; acc += dt;
    if (acc > 0.1) { acc = 0; $(".n-n").textContent = `${Math.abs(th(t) - shown(t)).toFixed(2)}°`; }
    draw();
  });
  [sT, sW].forEach((s) => s.addEventListener("input", update)); cP.addEventListener("change", update);
  update();
  $(".n-n").textContent = `${Math.abs(th(t) - shown(t)).toFixed(2)}°`;
})();
