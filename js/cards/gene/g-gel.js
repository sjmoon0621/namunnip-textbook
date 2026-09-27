/* 카드: 머리카락 한 올의 DNA로 사람을 가려낼 수 있을까? — STR 전기 영동 모식 */
(() => {
  const root = document.getElementById("card-gene-gel");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), oT = $(".t-out"), nM = $(".n-m"), nP = $(".n-p");
  let K = 3;
  // 각 사람: 부위 3곳의 대립유전자 크기(bp)
  const P = [
    ["현장 시료", [[180, 220], [310, 340], [140, 160]]],
    ["용의자 1", [[180, 220], [300, 340], [150, 160]]],
    ["용의자 2", [[180, 220], [310, 340], [140, 160]]],
    ["용의자 3", [[200, 220], [310, 320], [140, 170]]],
    ["용의자 4", [[180, 220], [310, 350], [130, 160]]],
  ];
  const LADDER = [100, 150, 200, 250, 300, 350, 400];
  const COL = ["#3f6fa3", "#b5532f", "#3b7c2a"];
  const match = (a, b) => a.slice(0, K).every((loc, i) => loc.join() === b[1][i].join());
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const t = +sT.value, lanes = P.length + 1, lw = (w - 30) / lanes, top = 48, bot = h - 16, dist = (bp) => (bot - top - 10) * (t / 60) * (Math.log(450) - Math.log(bp)) / (Math.log(450) - Math.log(90));
    ctx.fillStyle = "#1e2433"; ctx.fillRect(10, top - 12, w - 20, bot - top + 12);
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("(−) 시료 넣는 곳 ↓", 12, 12); ctx.textAlign = "right"; ctx.fillText("아래쪽 (+)극으로 · 작은 조각일수록 멀리", w - 12, 12);
    for (let L = 0; L < lanes; L++) {
      const cx = 15 + lw * (L + 0.5); ctx.fillStyle = "#0b0e16"; ctx.fillRect(cx - lw * 0.35, top - 10, lw * 0.7, 6);
      ctx.fillStyle = L === 1 ? C.warn : C.ink; ctx.font = `600 10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(L === 0 ? "크기 표준" : P[L - 1][0], cx, 30);
      const bands = L === 0 ? LADDER.map((bp) => [bp, "#ccc"]) : P[L - 1][1].slice(0, K).flatMap((loc, i) => loc.map((bp) => [bp, COL[i]]));
      bands.forEach(([bp, col]) => { const y = top + dist(bp); ctx.fillStyle = col; ctx.globalAlpha = 0.9; ctx.fillRect(cx - lw * 0.33, y, lw * 0.66, 4); ctx.globalAlpha = 1; if (L === 0 && t > 10) { ctx.fillStyle = "#aaa"; ctx.font = `8.5px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(bp, cx - lw * 0.36, y + 4); } });
      if (L > 1 && match(P[0][1], P[L - 1])) { ctx.strokeStyle = "#e0a02a"; ctx.lineWidth = 2; ctx.strokeRect(cx - lw * 0.42, top - 12, lw * 0.84, bot - top + 12); }
    }
  }
  function update() {
    root.querySelectorAll("[data-k]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.k === K)));
    oT.textContent = sT.value;
    const m = P.slice(1).filter((p) => match(P[0][1], p)).map((p) => p[0]); nM.textContent = m.length ? m.join(", ") : "없음";
    const pr = [0.05, 0.03, 0.04].slice(0, K).reduce((a, b) => a * b, 1); nP.textContent = `약 ${pr >= 0.001 ? pr.toString() : pr.toExponential(0).replace("e-", " × 10⁻").replace(/(\d)$/, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d])} (부위별 확률의 곱, 설명용 값)`;
    draw();
  }
  root.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => { K = +b.dataset.k; update(); }));
  sT.addEventListener("input", update); update();
})();
