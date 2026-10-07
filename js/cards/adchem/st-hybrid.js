/* 카드: s 오비탈을 얼마나 섞으면 결합각이 109.5°, 120°, 180°가 될까? — 혼성 오비탈의 s 성격과 결합각, C–H 결합 길이 */
(() => {
  const root = document.getElementById("card-adchem-hybrid");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sF = $(".f");
  /* 기체 분자 실측 C–H 결합 길이 (pm) */
  const DATA = [[0.25, 109.4, "에테인 sp³"], [1 / 3, 108.7, "에텐 sp²"], [0.5, 106.1, "에타인 sp"]];
  const angle = (f) => Math.acos(Math.max(-1, -f / (1 - f)));
  const { ctx, size } = fit(cv, () => draw());
  function lobe(cx, cy, R, dir, f) {
    const a = Math.sqrt(f), b = Math.sqrt(3 * (1 - f)), mx = a + b;
    [1, -1].forEach((sg) => {
      ctx.beginPath(); let first = true;
      for (let i = 0; i <= 360; i++) {
        const t = i / 360 * 2 * Math.PI, v = a + b * Math.cos(t);
        if (v * sg < 0) continue;
        const r = (v * v) / (mx * mx) * R, x = cx + r * Math.cos(t + dir), y = cy - r * Math.sin(t + dir);
        if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = sg > 0 ? "rgba(212,73,58,.32)" : "rgba(63,111,163,.4)"; ctx.strokeStyle = sg > 0 ? C.apple : "#3f6fa3"; ctx.lineWidth = 1.3; ctx.fill(); ctx.stroke();
    });
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const f = +sF.value, th = angle(f);
    /* 왼쪽: 혼성 오비탈 두 개 */
    const cx = w * 0.25, cy = h * 0.62, R = Math.min(w * 0.22, h * 0.48);
    lobe(cx, cy, R, Math.PI / 2 + th / 2, f); lobe(cx, cy, R, Math.PI / 2 - th / 2, f);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, 7); ctx.fill();
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, R * 0.35, -Math.PI / 2 - th / 2, -Math.PI / 2 + th / 2); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.mono}`; ctx.textAlign = "center";
    ctx.textAlign = "left"; ctx.fillText(`사이 각 ${(th * 180 / Math.PI).toFixed(1)}°`, 6, 18);
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("혼성 오비탈 두 개의 단면 (|h|²)", cx, h - 8);
    /* 오른쪽: s 성격 – C–H 결합 길이 */
    const L = w * 0.56, Rr = w - 10, T = 22, B = h - 34;
    const X = (v) => L + (v - 0.15) / 0.37 * (Rr - L), Y = (v) => B - (v - 105) / 5.5 * (B - T);
    NM.axes(ctx, { x0: L, y0: T, w: Rr - L, h: B - T, X, Y, xt: [[0.2, "20"], [0.3, "30"], [0.4, "40"], [0.5, "50"]], yt: [[106, "106"], [108, "108"], [110, "110"]], xlabel: "s 성격 (%)", ylabel: "C–H 길이 (pm)" });
    ctx.strokeStyle = C.amber; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(f), T); ctx.lineTo(X(f), B); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); DATA.forEach(([s, v], i) => i ? ctx.lineTo(X(s), Y(v)) : ctx.moveTo(X(s), Y(v))); ctx.stroke();
    DATA.forEach(([s, v, t]) => {
      ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(X(s), Y(v), 4.5, 0, 7); ctx.fill();
      ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = s > 0.45 ? "right" : "left"; ctx.fillText(`${t} ${v}`, X(s) + (s > 0.45 ? -9 : 7), Y(v) + (s > 0.45 ? 4 : -7));
    });
  }
  function update() {
    const f = +sF.value, th = angle(f) * 180 / Math.PI;
    $(".f-out").textContent = (f * 100).toFixed(1);
    $(".n-a").textContent = `${th.toFixed(1)}°`;
    const names = [[0.25, "sp³"], [1 / 3, "sp²"], [0.5, "sp"]];
    const nb = names.reduce((b, x) => Math.abs(x[0] - f) < Math.abs(b[0] - f) ? x : b);
    $(".n-h").textContent = Math.abs(nb[0] - f) < 0.004 ? nb[1] : `${nb[1]}에 가까움`;
    $(".n-p").textContent = Math.abs(f - 0.5) < 0.004 ? "2개" : Math.abs(f - 1 / 3) < 0.004 ? "1개" : Math.abs(f - 0.25) < 0.004 ? "0개" : "—";
    root.querySelectorAll("[data-f]").forEach((b) => b.setAttribute("aria-pressed", String(Math.abs(+b.dataset.f - f) < 0.001)));
    draw();
  }
  root.querySelectorAll("[data-f]").forEach((b) => b.addEventListener("click", () => { sF.value = b.dataset.f; update(); }));
  sF.addEventListener("input", update);
  update();
})();
