/* 카드: 한 바퀴를 넘는 각도 있을까? — 동경을 끌어 돌리며 회전한 양(일반각)과 360°×n + α를 읽는다 */
(() => {
  const root = document.getElementById("card-alg-general-angle");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".presets .chip")];
  const M = "−", sg = (v) => (v < 0 ? M + Math.abs(v) : String(v));
  const cv = $("canvas"), sl = $(".th");
  let raw = 30;   // 시초선에서 출발해 회전한 양(도). 시계 반대 방향이 +
  const th = () => Math.round(raw / 5) * 5;
  const alpha = (t) => ((t % 360) + 360) % 360;
  const { ctx, size } = fit(cv, () => draw());
  const geo = () => ({ cx: size.w / 2, cy: size.h / 2, R: Math.min(size.w, size.h) * 0.36 });
  const quad = (a) => (a % 90 === 0 ? 0 : Math.floor(a / 90) + 1);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { cx, cy, R } = geo(), t = th(), al = alpha(t), q = quad(al), rad = (d) => d * Math.PI / 180;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    [[1, 1, -1], [2, -1, -1], [3, -1, 1], [4, 1, 1]].forEach(([k, sx, sy]) => {
      ctx.font = `${k === q ? "600 " : ""}11px ${F.sans}`; ctx.fillStyle = k === q ? C.forest : C.ink3;
      ctx.fillText(`제${k}사분면`, cx + sx * R * 0.92, cy + sy * R * 0.92);
    });
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(8, cy); ctx.lineTo(w - 8, cy); ctx.moveTo(cx, 8); ctx.lineTo(cx, h - 8); ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R * 1.28, cy); ctx.stroke();
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "right"; ctx.textBaseline = "top";
    ctx.fillText("시초선 OX", cx + R * 1.28, cy + 5);
    if (t !== 0) {
      const col = t > 0 ? C.forest : C.warn, sp = (s) => R * (0.2 + 0.14 * Math.abs(s) / 360);
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
      const step = t > 0 ? 2 : -2;
      for (let s = 0; Math.abs(s) <= Math.abs(t); s += step) {
        const x = cx + sp(s) * Math.cos(rad(s)), y = cy - sp(s) * Math.sin(rad(s));
        s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      const r1 = sp(t), ex = cx + r1 * Math.cos(rad(t)), ey = cy - r1 * Math.sin(rad(t));
      const dir = rad(t) + (t > 0 ? Math.PI / 2 : -Math.PI / 2), dx = Math.cos(dir), dy = -Math.sin(dir);
      ctx.fillStyle = col; ctx.beginPath();
      ctx.moveTo(ex + dx * 7, ey + dy * 7); ctx.lineTo(ex - dx * 2 - dy * 5, ey - dy * 2 + dx * 5); ctx.lineTo(ex - dx * 2 + dy * 5, ey - dy * 2 - dx * 5); ctx.fill();
    }
    const px = cx + R * Math.cos(rad(al)), py = cy - R * Math.sin(rad(al));
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(px, py, 8, 0, 7); ctx.fill();
    ctx.fillStyle = C.card; ctx.beginPath(); ctx.arc(px, py, 3, 0, 7); ctx.fill();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, 7); ctx.fill();
    ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("P", cx + (R + 18) * Math.cos(rad(al)), cy - (R + 18) * Math.sin(rad(al)));
    ctx.fillText("O", cx - 10, cy + 11);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2;
    const mx = cx + R * 0.62 * Math.cos(rad(al)) - 14 * Math.sin(rad(al)), my = cy - R * 0.62 * Math.sin(rad(al)) - 14 * Math.cos(rad(al));
    ctx.fillText("동경", mx, my);
  }

  function update() {
    const t = th(), al = alpha(t), n = Math.round((t - al) / 360), q = quad(al);
    sl.value = t; $(".th-out").textContent = sg(t);
    $(".n-t").textContent = `${sg(t)}°`;
    $(".n-g").textContent = `360°×${n < 0 ? `(${M}${-n})` : n} + ${al}°`;
    $(".n-q").textContent = q ? `제${q}사분면` : "축 위 (없음)";
    $(".eq").textContent = `같은 동경: …, ${[-720, -360, 0, 360, 720].map((k) => sg(al + k) + "°").join(", ")}, …`;
    chips.forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.t === t)));
    draw();
  }

  // 동경 끝을 끌면 손가락이 돈 만큼 각이 누적된다(여러 바퀴, 음의 방향 포함)
  let prev = null;
  const ang = (e) => {
    const r = cv.getBoundingClientRect(), { cx, cy } = geo();
    const x = e.clientX - r.left - cx, y = cy - (e.clientY - r.top);
    return Math.hypot(x, y) < 12 ? null : Math.atan2(y, x) * 180 / Math.PI;
  };
  const wrap = (d) => ((d + 540) % 360) - 180;
  cv.addEventListener("pointerdown", (e) => {
    const a = ang(e); if (a === null) return;
    cv.setPointerCapture(e.pointerId);
    raw = clamp(raw + wrap(a - alpha(raw)), -720, 720); prev = a; update();
  });
  cv.addEventListener("pointermove", (e) => {
    if (prev === null) return;
    const a = ang(e); if (a === null) return;
    raw = clamp(raw + wrap(a - prev), -720, 720); prev = a; update();
  });
  const end = () => { prev = null; raw = th(); };
  cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
  sl.addEventListener("input", () => { raw = +sl.value; update(); });
  chips.forEach((b) => b.addEventListener("click", () => { raw = +b.dataset.t; update(); }));
  update();
})();
