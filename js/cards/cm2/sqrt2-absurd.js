/* 카드: √2가 분수가 아니라는 것을 어떻게 증명할까? — 격자점 (q, p)에서 p² − 2q²을 보고, 귀류법 단계를 따라간다 */
(() => {
  const root = document.getElementById("card-cm2-sqrt2-absurd");
  if (!root) return;
  const { C, F, fit, axes, clamp } = NM;
  const $ = (s) => root.querySelector(s), cv = $("canvas"), sp = $(".p"), sq = $(".q");
  const PM = 17, QM = 12, R2 = Math.SQRT2;
  const STEPS = [
    "가정: √2가 유리수라고 가정합니다. 그러면 √2 = p/q (p, q는 서로소인 자연수)로 쓸 수 있습니다.",
    "양변을 제곱하면 2 = p²/q², 곧 p² = 2q²입니다. 그림에서 이 등식을 만족하는 점을 찾아보세요.",
    "p² = 2q²이므로 p²은 짝수이고, 'n²이 짝수이면 n은 짝수'에 따라 p도 짝수입니다. p = 2m으로 놓습니다.",
    "(2m)² = 2q²에서 4m² = 2q², 곧 q² = 2m²입니다. q²이 짝수이므로 q도 짝수입니다.",
    "p, q가 모두 짝수이면 2가 공약수가 되어 'p, q는 서로소'라는 가정과 모순입니다. 따라서 가정이 틀렸고, √2는 유리수가 아닌 무리수입니다.",
  ];
  let step = 0, map = null, drag = false;
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 30, y0 = 10, gw = w - x0 - 12, gh = h - y0 - 30;
    const X = (q) => x0 + q / (QM + 0.5) * gw, Y = (p) => y0 + gh - p / (PM + 0.5) * gh;
    map = { x0, y0, gw, gh, X, Y };
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [2, 4, 6, 8, 10, 12].map((v) => [v, String(v)]), yt: [5, 10, 15].map((v) => [v, String(v)]), xlabel: "q", ylabel: "p" });
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, gw, gh); ctx.clip();
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(QM + 0.5), Y(R2 * (QM + 0.5))); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    for (let q = 1; q <= QM; q++) for (let p = 1; p <= PM; p++) {
      const d = p * p - 2 * q * q, near = Math.abs(d) === 1;
      ctx.beginPath(); ctx.arc(X(q), Y(p), near ? 4 : 2.2, 0, Math.PI * 2);
      ctx.fillStyle = d > 0 ? C.amber : C.forest; ctx.globalAlpha = near ? 1 : 0.55; ctx.fill(); ctx.globalAlpha = 1;
      if (near) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.stroke(); }
    }
    const p = +sp.value, q = +sq.value;
    ctx.beginPath(); ctx.arc(X(q), Y(p), 7.5, 0, Math.PI * 2); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.font = `600 11.5px ${F.sans}`; ctx.fillStyle = C.warn; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    const lt = "p = √2 q", lw = ctx.measureText(lt).width, lx = X(8.5) - lw - 10, ly = Y(R2 * 8.5) - 4;
    ctx.fillStyle = C.card; ctx.fillRect(lx - 3, ly - 9, lw + 6, 18); ctx.fillStyle = C.warn; ctx.fillText(lt, lx, ly);
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "right";
    const gt = "주황: p² > 2q²   초록: p² < 2q²", gw2 = ctx.measureText(gt).width;
    ctx.fillStyle = C.card; ctx.fillRect(x0 + gw - gw2 - 10, y0 + gh - 22, gw2 + 8, 16);
    ctx.fillStyle = C.ink2; ctx.fillText(gt, x0 + gw - 6, y0 + gh - 14);
  }
  function update() {
    const p = +sp.value, q = +sq.value, d = p * p - 2 * q * q;
    $(".p-out").textContent = p; $(".q-out").textContent = q;
    $(".eq").textContent = `p/q = ${p}/${q} ≈ ${(p / q).toFixed(5)},  √2 ≈ ${R2.toFixed(5)}`;
    $(".n-p2").textContent = p * p; $(".n-q2").textContent = 2 * q * q;
    const dd = $(".n-d"); dd.textContent = d < 0 ? "−" + -d : String(d); dd.className = `n-d ${Math.abs(d) === 1 ? "good" : ""}`;
    $(".msg").textContent = `${step + 1}/5  ${STEPS[step]}`;
    draw();
  }
  const pick = (e) => {
    if (!map) return;
    const r = cv.getBoundingClientRect(), { x0, y0, gw, gh } = map;
    sq.value = clamp(Math.round((e.clientX - r.left - x0) / gw * (QM + 0.5)), 1, QM);
    sp.value = clamp(Math.round((y0 + gh - (e.clientY - r.top)) / gh * (PM + 0.5)), 1, PM);
    update();
  };
  cv.addEventListener("pointerdown", (e) => { drag = true; cv.setPointerCapture(e.pointerId); pick(e); });
  cv.addEventListener("pointermove", (e) => { if (drag) pick(e); });
  cv.addEventListener("pointerup", () => { drag = false; });
  cv.addEventListener("pointercancel", () => { drag = false; });
  [sp, sq].forEach((s) => s.addEventListener("input", update));
  $(".go-next").addEventListener("click", () => { step = Math.min(4, step + 1); update(); });
  $(".go-reset").addEventListener("click", () => { step = 0; update(); });
  update();
})();
