/* 카드: 양안 시차와 가상 현실 — 수렴각, 거리별 시차 변화, 초점–수렴 불일치 */
(() => {
  const root = document.getElementById("card-hist-stereo");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sD = $(".d"), sI = $(".i"), cH = $(".hmd");
  const SCR = 1.5;
  const D = () => 10 ** +sD.value, IPD = () => +sI.value / 1000;
  const verg = (d) => 2 * Math.atan(IPD() / 2 / d);
  const deg = (r) => r * 180 / Math.PI;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const d = D(), hmd = cH.checked;
    // 왼쪽: 위에서 본 모습 (세로: 로그 거리)
    const cx = w * 0.27, yb = h - 26, yt = 18, l0 = Math.log10(0.2), l1 = Math.log10(40);
    const Y = (z) => yb - (Math.log10(z) - l0) / (l1 - l0) * (yb - yt);
    const ex = 34;
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    [0.3, 1, 3, 10, 30].forEach((z) => { ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(cx - ex - 40, Y(z)); ctx.lineTo(cx + ex + 40, Y(z)); ctx.stroke(); ctx.fillText(`${z} m`, cx - ex - 44, Y(z) + 3); });
    if (hmd) {
      ctx.strokeStyle = "#3f6fa3"; ctx.setLineDash([5, 3]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx - ex - 40, Y(SCR)); ctx.lineTo(cx + ex + 40, Y(SCR)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#3f6fa3"; ctx.textAlign = "left"; ctx.font = `10px ${F.sans}`; ctx.fillText("가상 화면 (초점)", cx + ex + 6, Y(SCR) - 5);
    }
    const oy = Y(d);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5;
    [-1, 1].forEach((s) => { ctx.beginPath(); ctx.moveTo(cx + s * ex, yb); ctx.lineTo(cx, oy); ctx.stroke(); });
    ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(cx, oy, 6, 0, Math.PI * 2); ctx.fill();
    [-1, 1].forEach((s) => { ctx.fillStyle = C.card; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(cx + s * ex, yb + 4, 11, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx + s * ex, yb + 1, 3, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("왼눈", cx - ex, yb + 22); ctx.fillText("오른눈", cx + ex, yb + 22);
    // 오른쪽: 두 눈의 화면 (먼 배경 기준, 1° = k px)
    const pw = w * 0.2, ph = h * 0.5, py = h * 0.2, k = Math.min(9, pw / 14);
    const th = deg(verg(d)) / 2;
    [["왼눈 화면", w * 0.54, 1], ["오른눈 화면", w * 0.78, -1]].forEach(([lab, x, s]) => {
      ctx.fillStyle = "#14171b"; ctx.fillRect(x, py, pw, ph);
      ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(x + pw / 2, py + 4); ctx.lineTo(x + pw / 2, py + ph - 4); ctx.stroke(); ctx.setLineDash([]);
      const ox = x + pw / 2 + s * th * k;
      ctx.save(); ctx.beginPath(); ctx.rect(x, py, pw, ph); ctx.clip();
      ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(ox, py + ph / 2, 7, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.font = `10.5px ${F.sans}`; ctx.fillText(lab, x + pw / 2, py - 7);
    });
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("점선 = 아주 먼 배경의 자리", w * 0.54, py + ph + 16);
    ctx.fillText(`두 화면의 위치 차이 = ${deg(verg(d)).toFixed(2)}°`, w * 0.54, py + ph + 31);
  }
  function update() {
    const d = D();
    $(".d-out").textContent = d < 1 ? d.toFixed(2) : d < 10 ? d.toFixed(1) : Math.round(d);
    $(".i-out").textContent = sI.value;
    $(".n-v").textContent = `${deg(verg(d)).toFixed(2)}°`;
    const dd = (verg(d) - verg(d + 1)) * 180 / Math.PI * 60;
    $(".n-dd").textContent = dd >= 10 ? `${dd.toFixed(0)} 분` : dd >= 1 ? `${dd.toFixed(1)} 분` : `${(dd * 60).toFixed(0)} 초`;
    if (cH.checked) {
      const c = Math.abs(1 / d - 1 / SCR);
      $(".n-c").textContent = `${c.toFixed(2)} D`;
      $(".n-c").className = "n-c" + (c > 1 ? " bad" : "");
    } else { $(".n-c").textContent = "0 (현실)"; $(".n-c").className = "n-c good"; }
    draw();
  }
  [sD, sI].forEach((s) => s.addEventListener("input", update)); cH.addEventListener("change", update);
  update();
})();
