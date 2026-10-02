/* 카드: 마주 오던 두 파동이 만나면 — 펄스 중첩, 예측 그리기와 비교, 독립성 */
(() => {
  const root = document.getElementById("card-phy-superpose");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const sT = $(".t");
  const SET = { same: [[1, 0.5], [1, 0.5]], opp: [[1, 0.5], [-1, 0.5]], diff: [[1.2, 0.35], [-0.6, 0.7]] };
  let pair = "same", playing = false, drawing = false, show = false, pred = new Map();
  const pulse = (x, c, a, s) => (Math.abs(x - c) < s ? a * (1 + Math.cos(Math.PI * (x - c) / s)) / 2 : 0);   // 코사인 펄스, 줄 0~6 m
  const f1 = (x, t) => pulse(x, 1 + t, ...SET[pair][0]), f2 = (x, t) => pulse(x, 5 - t, ...SET[pair][1]);
  const { ctx, size } = fit($("canvas"), () => draw());
  const X = (x) => 20 + x / 6 * (size.w - 40), Y = (y) => size.h / 2 - y * size.h * 0.3;
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const t = +sT.value;
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(20, Y(0)); ctx.lineTo(w - 20, Y(0)); ctx.stroke();
    const line = (fn, col, wd, dash) => { ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.setLineDash(dash || []); ctx.beginPath(); for (let i = 0; i <= 300; i++) { const x = i / 50; i ? ctx.lineTo(X(x), Y(fn(x))) : ctx.moveTo(X(x), Y(fn(x))); } ctx.stroke(); ctx.setLineDash([]); };
    line((x) => f1(x, t), "#3f6fa3", 1.5, [5, 4]); line((x) => f2(x, t), "#e08a2a", 1.5, [5, 4]);
    if (pred.size) { ctx.strokeStyle = "rgba(138,95,208,.85)"; ctx.lineWidth = 2.5; ctx.beginPath(); [...pred.entries()].sort((a, b) => a[0] - b[0]).forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); ctx.stroke(); }
    const overlap = Math.abs((1 + t) - (5 - t)) < SET[pair][0][1] + SET[pair][1][1];
    if (show || !overlap || playing) line((x) => f1(x, t) + f2(x, t), C.ink, 3);
    else { ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("겹치는 동안의 실제 줄 모양은 '합성파 보기'로", w / 2, h - 10); }
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`t = ${t.toFixed(2)} s`, 24, 16);
    if (pred.size && show) {
      let err = 0, k = 0; pred.forEach((y, x) => { err += Math.abs(y - (f1(x, t) + f2(x, t))); k++; });
      const v = $(".verdict"); const e = err / k;
      v.textContent = e < 0.12 ? "예측이 합성파와 잘 맞습니다." : "예측과 합성파가 다릅니다. 같은 위치에서 두 점선의 높이를 부호까지 더해 보세요.";
      v.className = "verdict small " + (e < 0.12 ? "good" : "bad");
    }
  }
  loop($("canvas"), (dt) => { if (playing) { sT.value = Math.min(4, +sT.value + dt * 0.6); $(".t-out").textContent = (+sT.value).toFixed(1); if (+sT.value >= 4) playing = false; } draw(); });
  sT.addEventListener("input", () => { $(".t-out").textContent = (+sT.value).toFixed(1); pred.clear(); show = false; $(".verdict").textContent = ""; draw(); });
  $(".play").addEventListener("click", () => { if (+sT.value >= 4) sT.value = 0; playing = !playing; });
  $(".show").addEventListener("click", () => { show = true; draw(); });
  $(".draw").addEventListener("click", (e) => { drawing = !drawing; e.currentTarget.setAttribute("aria-pressed", String(drawing)); if (drawing) { pred.clear(); show = false; playing = false; } draw(); });
  const cv = $("canvas");
  const put = (e) => { if (!drawing || !(e.buttons & 1)) return; const r = cv.getBoundingClientRect(); const x = Math.round(((e.clientX - r.left - 20) / (size.w - 40) * 6) * 25) / 25, y = (size.h / 2 - (e.clientY - r.top)) / (size.h * 0.3); if (x >= 0 && x <= 6) pred.set(x, y); draw(); };
  cv.addEventListener("pointermove", put); cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); put(e); });
  $(".pair").addEventListener("click", (e) => { const b = e.target.closest("[data-p]"); if (!b) return; pair = b.dataset.p; root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); pred.clear(); show = false; draw(); });
  draw();
  if (/[?&]demo\b/.test(location.search)) { sT.value = 1.8; root.querySelector('[data-p="diff"]').click(); show = true; $(".t-out").textContent = "1.8"; draw(); }
})();
