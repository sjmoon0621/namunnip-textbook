/* 카드: 속도 결정 단계 — A →(k₁) I →(k₂) P 연속 1차 반응의 농도 곡선과 에너지 도표 */
(() => {
  const root = document.getElementById("card-adchem-mechanism");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const s1 = $(".k1"), s2 = $(".k2");
  const RT = 8.314e-3 * 298, LNA = Math.log(1e13), EI = -15, EP = -60;
  const k = () => [10 ** +s1.value, 10 ** +s2.value];
  function conc(t, k1, k2) {
    const a = Math.exp(-k1 * t);
    const i = Math.abs(k2 - k1) < 1e-9 * k1 ? k1 * t * Math.exp(-k1 * t) : k1 / (k2 - k1) * (Math.exp(-k1 * t) - Math.exp(-k2 * t));
    return [a, i, Math.max(0, 1 - a - i)];
  }
  function tHalfP(k1, k2) {
    let lo = 0, hi = 50 * (1 / k1 + 1 / k2);
    for (let n = 0; n < 60; n++) { const m = (lo + hi) / 2; if (conc(m, k1, k2)[2] < 0.5) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  const fmt = (x) => (x >= 100 ? x.toFixed(0) : x >= 10 ? x.toFixed(1) : x >= 1 ? x.toFixed(2) : x.toPrecision(2));
  const { ctx, size } = fit($("canvas"), () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const [k1, k2] = k();
    /* 왼쪽: 농도–시간 */
    const x0 = 34, x1 = w * 0.52, y0 = 22, y1 = h - 30;
    const tmax = Math.min(3 * (1 / k1 + 1 / k2), 1e4);
    const X = (t) => x0 + t / tmax * (x1 - x0), Y = (c) => y1 - c * (y1 - y0);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.strokeStyle = C.rule; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(x0, Y(0.5)); ctx.lineTo(x1, Y(0.5)); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    [0, 0.5, 1].forEach((c) => ctx.fillText(String(c), x0 - 4, Y(c) + 3));
    ctx.textAlign = "center";
    for (let i = 0; i <= 4; i++) ctx.fillText(fmt(tmax * i / 4), X(tmax * i / 4), y1 + 13);
    ctx.textAlign = "right"; ctx.fillText("t (s)", x1, y1 + 26);
    const cols = ["#3f6fa3", "#e0a02a", "#3b7c2a"], labs = ["A", "I", "P"];
    for (let s = 0; s < 3; s++) {
      ctx.strokeStyle = cols[s]; ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i <= 200; i++) { const t = tmax * i / 200, c = conc(t, k1, k2)[s]; i ? ctx.lineTo(X(t), Y(c)) : ctx.moveTo(X(t), Y(c)); }
      ctx.stroke();
    }
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    labs.forEach((l, s) => { ctx.fillStyle = cols[s]; ctx.fillRect(x1 - 92 + s * 32, y0 - 12, 10, 3); ctx.fillText(`[${l}]`, x1 - 80 + s * 32, y0 - 8); });
    const th = tHalfP(k1, k2);
    if (th < tmax) { ctx.fillStyle = "#3b7c2a"; ctx.beginPath(); ctx.arc(X(th), Y(0.5), 3.5, 0, 7); ctx.fill(); }
    /* 오른쪽: 에너지 도표 */
    const e1 = RT * (LNA - Math.log(k1)), e2 = RT * (LNA - Math.log(k2));
    const lv = [0, e1, EI, EI + e2, EP], emax = Math.max(...lv) + 22, emin = EP - 8;
    const ex0 = w * 0.6, ex1 = w - 10, ey0 = 24, ey1 = h - 26;
    const EY = (e) => ey0 + (emax - e) / (emax - emin) * (ey1 - ey0), xs = [0, 0.25, 0.5, 0.75, 1].map((f) => ex0 + f * (ex1 - ex0));
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ex0 - 8, ey0); ctx.lineTo(ex0 - 8, ey1); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("에너지 (kJ/mol, 모식)", ex0 - 6, ey0 - 10);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; ctx.beginPath();
    for (let s = 0; s < 4; s++) {
      const xa = xs[s], xb = xs[s + 1], ya = EY(lv[s]), yb = EY(lv[s + 1]), well = s % 2 === 0;
      if (s === 0) ctx.moveTo(xa, ya);
      /* 골짜기는 평평하게, 봉우리는 둥글게 */
      if (well) ctx.bezierCurveTo(xa + (xb - xa) * 0.55, ya, xb - (xb - xa) * 0.35, yb, xb, yb);
      else ctx.bezierCurveTo(xa + (xb - xa) * 0.35, ya, xb - (xb - xa) * 0.55, yb, xb, yb);
    }
    ctx.stroke();
    const slow = k1 < k2 ? 0 : 1, close = Math.max(k1, k2) / Math.min(k1, k2) < 3;
    [[0, 1, e1], [2, 3, e2]].forEach(([a, b, ea], i) => {
      const xx = xs[b] + (i ? -6 : -6), c = !close && i === slow ? C.warn : C.ink2;
      ctx.strokeStyle = c; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(xs[a], EY(lv[a])); ctx.lineTo(xs[b] + 4, EY(lv[a])); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(xx, EY(lv[a])); ctx.lineTo(xx, EY(lv[b]) + 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(xx - 3, EY(lv[b]) + 9); ctx.lineTo(xx, EY(lv[b]) + 3); ctx.lineTo(xx + 3, EY(lv[b]) + 9); ctx.stroke();
      ctx.fillStyle = c; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText(`Eₐ${i ? "₂" : "₁"} = ${ea.toFixed(0)}`, xs[b], EY(lv[b]) - 7);
    });
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillStyle = C.ink;
    ctx.fillText("A", xs[0] + 8, EY(0) + 15); ctx.fillText("I", xs[2], EY(EI) + 15); ctx.fillText("P", xs[4] - 8, EY(EP) + 15);
  }
  function update() {
    const [k1, k2] = k();
    $(".k1-out").textContent = fmt(k1); $(".k2-out").textContent = fmt(k2);
    const r = Math.max(k1, k2) / Math.min(k1, k2);
    $(".n-r").textContent = r < 3 ? "뚜렷하지 않음" : k1 < k2 ? "1단계 (A → I)" : "2단계 (I → P)";
    $(".n-t").textContent = `${fmt(tHalfP(k1, k2))} s`;
    $(".n-s").textContent = `${fmt(Math.LN2 / Math.min(k1, k2))} s`;
    let im = 0; const tm = 3 * (1 / k1 + 1 / k2); for (let i = 0; i <= 400; i++) im = Math.max(im, conc(tm * i / 400, k1, k2)[1]);
    $(".n-i").textContent = im.toFixed(2);
    root.querySelectorAll("[data-q]").forEach((b) => b.setAttribute("aria-pressed", "false"));
    draw();
  }
  const Q = { 1: [-1, 1], 2: [1, -1], 0: [-0.5, -0.5] };
  root.querySelectorAll("[data-q]").forEach((b) => b.addEventListener("click", () => {
    [s1.value, s2.value] = Q[b.dataset.q]; update(); b.setAttribute("aria-pressed", "true");
  }));
  [s1, s2].forEach((s) => s.addEventListener("input", update));
  update();
  root.querySelector('[data-q="1"]').setAttribute("aria-pressed", "true");
})();
