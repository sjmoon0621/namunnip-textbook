/* 카드: 여론조사의 '오차 범위 ±3.1%p'는 어디서 나올까? — 모비율의 신뢰구간 p̂ ± k√(p̂q̂/n) 계산기와 n에 따른 오차 한계 곡선(끌기) */
(() => {
  const root = document.getElementById("card-stat-ci-prop");
  if (!root) return;
  const { C, F, fit, axes, clamp } = NM;
  const S = NMStat;
  const $ = (s) => root.querySelector(s), sn = $(".n"), sq = $(".ph"), cv = $("canvas"), chips = [...root.querySelectorAll(".presets .chip")];
  const NMIN = 100, NMAX = 4000, EMAX = 14; // 오차 한계 축의 최댓값(%p)
  let k = 1.96, geo = null, drag = false;
  const { ctx, size } = fit(cv, () => draw());
  const err = (n, ph) => k * Math.sqrt(ph * (1 - ph) / n);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sn.value, ph = +sq.value, e = err(n, ph);
    const lx = 20, lw = w - 40, ly = 56, L = (v) => lx + v * lw;
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + lw, ly); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.textBaseline = "top";
    for (let i = 0; i <= 10; i++) {
      const x = L(i / 10); ctx.beginPath(); ctx.moveTo(x, ly - 4); ctx.lineTo(x, ly + 4); ctx.stroke();
      if (i % 2 === 0) ctx.fillText(S.short(i / 10, 1), x, ly + 8);
    }
    const a = Math.max(0, ph - e), b = Math.min(1, ph + e);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 8; ctx.lineCap = "butt";
    ctx.beginPath(); ctx.moveTo(L(a), ly); ctx.lineTo(Math.max(L(b), L(a) + 2), ly); ctx.stroke();
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(L(ph), ly, 4, 0, 7); ctx.fill();
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.mono}`; ctx.textBaseline = "alphabetic";
    const txt = `${S.fmt(a, 3)} ≤ p ≤ ${S.fmt(b, 3)}`, tw = ctx.measureText(txt).width;
    ctx.fillText(txt, clamp(L(ph), lx + tw / 2, lx + lw - tw / 2), ly - 16);

    const x0 = 44, y0 = ly + 50, gw = w - x0 - 14, gh = h - y0 - 34;
    const X = (v) => x0 + v / NMAX * gw, Y = (v) => y0 + (1 - v / EMAX) * gh;
    geo = { x0, gw, y0 };
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [0, 1000, 2000, 3000, 4000].map((v) => [v, String(v)]),
      yt: [0, 4, 8, 12].map((v) => [v, String(v)]), xlabel: "표본의 크기 n", ylabel: "오차 한계 (%p)" });
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, gw, gh); ctx.clip();
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let i = 0; i <= 200; i++) { const m = NMIN + (NMAX - NMIN) * i / 200, y = Y(100 * err(m, ph)); if (i) ctx.lineTo(X(m), y); else ctx.moveTo(X(m), y); }
    ctx.stroke(); ctx.restore();
    const px = X(n), py = Y(100 * e);
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(x0, py); ctx.lineTo(px, py); ctx.lineTo(px, y0 + gh); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(px, py, 5, 0, 7); ctx.fill();
    ctx.font = `600 11px ${F.mono}`; ctx.textBaseline = "bottom";
    const right = px > x0 + gw - 70; ctx.textAlign = right ? "right" : "left";
    ctx.fillText(`${S.fmt(100 * e, 2)}%p`, px + (right ? -7 : 7), py - 4);
  }

  function update() {
    const n = +sn.value, ph = +sq.value;
    $(".n-out").textContent = n; $(".ph-out").textContent = ph.toFixed(2);
    $(".n-y").textContent = `${Math.round(n * ph)}명`;
    $(".n-s").textContent = S.fmt(Math.sqrt(ph * (1 - ph) / n), 4);
    $(".n-e").textContent = `±${S.fmt(100 * err(n, ph), 2)}%p`;
    draw();
  }
  const setN = (ev) => {
    const b = cv.getBoundingClientRect(), v = (ev.clientX - b.left - geo.x0) / geo.gw * NMAX;
    sn.value = String(clamp(Math.round(v / 100) * 100, NMIN, NMAX)); update();
  };
  cv.addEventListener("pointerdown", (ev) => {
    if (!geo || ev.clientY - cv.getBoundingClientRect().top < geo.y0 - 12) return;
    drag = true; cv.setPointerCapture(ev.pointerId); setN(ev);
  });
  cv.addEventListener("pointermove", (ev) => { if (drag) setN(ev); });
  cv.addEventListener("pointerup", () => { drag = false; });
  cv.addEventListener("pointercancel", () => { drag = false; });
  chips.forEach((b) => b.addEventListener("click", () => {
    k = +b.dataset.k;
    chips.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    update();
  }));
  [sn, sq].forEach((x) => x.addEventListener("input", update));
  update();
})();
