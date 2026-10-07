/* 카드: 캘빈의 ¹⁴C 펄스 실험 — 노출 시간에 따른 표지 분포 (3구획 모식 모형, 실측값 아님) */
(() => {
  const root = document.getElementById("card-adbio-benson");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), oT = $(".t-out"), nA = $(".n-a"), nB = $(".n-b"), nC = $(".n-c");
  const TMAX = 120, k1 = 0.2, k2 = 0.025;
  const tOf = (u) => Math.pow(10, u * Math.log10(TMAX));
  const uOf = (t) => Math.log10(t) / Math.log10(TMAX);
  /* ¹⁴CO₂ 일정 공급 J = 1: 3PG(A) → 당인산(B) → 설탕(S). 해석해 */
  function pools(t) {
    const A = (1 - Math.exp(-k1 * t)) / k1;
    const B = (1 - Math.exp(-k2 * t)) / k2 + (Math.exp(-k1 * t) - Math.exp(-k2 * t)) / (k1 - k2);
    const S = t - A - B;
    return { A, B, S: Math.max(0, S), tot: t };
  }
  const { ctx, size } = fit(cv, () => draw());
  function txt(s, x, y, col, font, al) { ctx.fillStyle = col; ctx.font = font; ctx.textAlign = al || "center"; ctx.fillText(s, x, y); }
  const blue = "#3f6fa3";
  const COL = { A: C.warn, B: blue, S: C.forest };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const t = tOf(+sT.value), p = pools(t);
    /* 왼쪽: 2차원 크로마토그램 */
    const side = Math.min(w * 0.42, h - 40), x0 = 22, y0 = 26;
    ctx.fillStyle = "#f6f1e3"; ctx.fillRect(x0, y0, side, side);
    ctx.strokeStyle = C.rule; ctx.strokeRect(x0 + .5, y0 + .5, side, side);
    txt("2차원 종이 크로마토그램 (X선 필름)", x0 + side / 2, 16, C.ink2, `600 11.5px ${F.sans}`);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x0 + 12, y0 + side - 12, 3, 0, Math.PI * 2); ctx.fill();
    txt("출발점", x0 + 16, y0 + side - 4, C.ink3, `9.5px ${F.sans}`, "left");
    txt("용매 1 →", x0 + side - 4, y0 + side + 13, C.ink3, `9.5px ${F.sans}`, "right");
    ctx.save(); ctx.translate(x0 - 7, y0 + 6); ctx.rotate(-Math.PI / 2); txt("용매 2 →", 0, 0, C.ink3, `9.5px ${F.sans}`, "right"); ctx.restore();
    const spots = [
      ["3PG", 0.62, 0.38, p.A, "A"],
      ["트라이오스 인산", 0.78, 0.6, p.B * 0.25, "B"],
      ["헥소스 인산", 0.3, 0.52, p.B * 0.45, "B"],
      ["RuBP", 0.22, 0.75, p.B * 0.3, "B"],
      ["설탕", 0.5, 0.18, p.S, "S"],
    ];
    const ref = Math.max(p.A, p.B * 0.45, p.S, 1e-9);
    for (const [name, u, v, amt, k] of spots) {
      const x = x0 + u * side, y = y0 + v * side, a = Math.min(1, amt / ref);
      const r = 7 + 9 * Math.sqrt(a);
      ctx.fillStyle = `rgba(35,35,38,${(0.06 + 0.85 * a).toFixed(3)})`;
      ctx.beginPath(); ctx.ellipse(x, y, r * 1.2, r, 0.3, 0, Math.PI * 2); ctx.fill();
      txt(name, x, y + r + 12, COL[k], `600 10.5px ${F.sans}`);
    }
    /* 오른쪽: 비율 곡선 */
    const gx = x0 + side + 46, gw = w - gx - 14, gy = 26, gh = h - 62;
    const X = (tt) => gx + uOf(tt) * gw, Y = (f) => gy + gh * (1 - f);
    NM.axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [[1, "1"], [2, "2"], [5, "5"], [10, "10"], [30, "30"], [100, "100"]], yt: [[0, "0"], [0.5, "50"], [1, "100 %"]], xlabel: "노출 시간 (초, 로그 눈금)", ylabel: "" });
    txt("전체 방사성 중 비율", gx, 16, C.ink2, `600 11.5px ${F.sans}`, "left");
    const curve = (key) => {
      ctx.strokeStyle = COL[key]; ctx.lineWidth = 2.2; ctx.beginPath();
      for (let i = 0; i <= 200; i++) { const tt = tOf(i / 200), q = pools(tt); const y = Y(q[key] / q.tot); i ? ctx.lineTo(X(tt), y) : ctx.moveTo(X(tt), y); }
      ctx.stroke();
    };
    curve("A"); curve("B"); curve("S");
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(t), gy); ctx.lineTo(X(t), gy + gh); ctx.stroke(); ctx.setLineDash([]);
    for (const k of ["A", "B", "S"]) { ctx.fillStyle = COL[k]; ctx.beginPath(); ctx.arc(X(t), Y(p[k] / p.tot), 4.5, 0, Math.PI * 2); ctx.fill(); }
    const lx = gx + gw - 4;
    txt("3PG", lx, gy + 14, COL.A, `600 11px ${F.sans}`, "right");
    txt("당인산", lx, gy + 28, COL.B, `600 11px ${F.sans}`, "right");
    txt("설탕", lx, gy + 42, COL.S, `600 11px ${F.sans}`, "right");
  }
  function update() {
    const t = tOf(+sT.value), p = pools(t);
    oT.textContent = t < 10 ? t.toFixed(1) : t.toFixed(0);
    nA.textContent = `${(100 * p.A / p.tot).toFixed(0)} %`;
    nB.textContent = `${(100 * p.B / p.tot).toFixed(0)} %`;
    nC.textContent = `${(100 * p.S / p.tot).toFixed(0)} %`;
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(Math.abs(+b.dataset.s - t) / t < 0.03)));
    draw();
  }
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { sT.value = uOf(+b.dataset.s); update(); }));
  sT.addEventListener("input", update);
  update();
})();
