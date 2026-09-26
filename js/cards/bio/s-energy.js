/* 카드: 더 먹은 만큼 계속 찔까? — 기초 대사량과 에너지 수지, 체중 변화 (모식 모형, 성인 기준) */
(() => {
  const root = document.getElementById("card-bio-energy");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sA = $(".age"), sH = $(".ht"), sW = $(".wt"), sI = $(".intake");
  let sex = "m", pal = 1.6;

  // Mifflin–St Jeor 식 (성인용): 남 10W + 6.25H − 5A + 5, 여 … − 161  [kcal/일]
  const cst = () => 6.25 * +sH.value - 5 * +sA.value + (sex === "m" ? 5 : -161);
  const bmr = (W) => 10 * W + cst();
  const DAYS = 3 * 365, KCAL_KG = 7700;
  function run() {
    const W0 = +sW.value, I = +sI.value;
    const dyn = [W0], lin = [W0];
    let W = W0; const bal0 = I - pal * bmr(W0);
    for (let d = 1; d <= DAYS; d++) { W += (I - pal * bmr(W)) / KCAL_KG; dyn.push(W); lin.push(W0 + bal0 * d / KCAL_KG); }
    return { dyn, lin, bal0, eq: (I / pal - cst()) / 10 };
  }

  const { ctx, size } = fit(cv, () => draw());
  let R = null;
  function draw() {
    const { w, h } = size;
    if (!w || !R) return;
    ctx.clearRect(0, 0, w, h);
    const padL = 40, padR = 14, padT = 22, padB = 30, pw = w - padL - padR, ph = h - padT - padB;
    const W0 = R.dyn[0];
    const span = Math.max(4, Math.abs(R.dyn[DAYS] - W0) * 1.6, Math.min(Math.abs(R.lin[DAYS] - W0), Math.abs(R.dyn[DAYS] - W0) * 3));
    const lo = W0 - span, hi = W0 + span;
    const X = (d) => padL + d / DAYS * pw, Y = (v) => padT + (1 - (v - lo) / (hi - lo)) * ph;
    const step = span > 20 ? 10 : span > 8 ? 5 : 2, yt = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) yt.push([v, `${v}`]);
    NM.axes(ctx, { x0: padL, y0: padT, w: pw, h: ph, X, Y, xt: [[0, "0"], [365, "1년"], [730, "2년"], [1095, "3년"]], yt, ylabel: "몸무게 (kg)" });
    ctx.save(); ctx.beginPath(); ctx.rect(padL, padT, pw, ph); ctx.clip();
    // 새 균형 체중
    ctx.setLineDash([2, 4]); ctx.strokeStyle = C.forest; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, Y(R.eq)); ctx.lineTo(padL + pw, Y(R.eq)); ctx.stroke();
    ctx.setLineDash([5, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.4;
    ctx.beginPath(); R.lin.forEach((v, d) => (d ? ctx.lineTo(X(d), Y(v)) : ctx.moveTo(X(d), Y(v)))); ctx.stroke();
    ctx.setLineDash([]); ctx.strokeStyle = C.apple; ctx.lineWidth = 2.4;
    ctx.beginPath(); R.dyn.forEach((v, d) => (d ? ctx.lineTo(X(d), Y(v)) : ctx.moveTo(X(d), Y(v)))); ctx.stroke();
    ctx.restore();
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right";
    if (Math.abs(R.eq - W0) > 0.3 && R.eq > lo && R.eq < hi) { ctx.fillStyle = C.forest; ctx.fillText("새 균형 체중", padL + pw - 2, Y(R.eq) + (R.eq > W0 ? 13 : -5)); }
    ctx.textAlign = "left";
  }

  function update() {
    $(".age-out").textContent = sA.value; $(".ht-out").textContent = sH.value; $(".wt-out").textContent = sW.value; $(".intake-out").textContent = (+sI.value).toLocaleString();
    R = run();
    const W0 = +sW.value, B = bmr(W0), T = pal * B;
    $(".bmr").textContent = `${Math.round(B).toLocaleString()} kcal`;
    $(".tdee").textContent = `${Math.round(T).toLocaleString()} kcal`;
    const bal = R.bal0;
    const bEl = $(".bal"); bEl.textContent = `${bal >= 0 ? "+" : "−"}${Math.abs(Math.round(bal))} kcal`;
    bEl.className = "bal " + (Math.abs(bal) < 30 ? "good" : "");
    const d3 = R.dyn[DAYS] - W0, l3 = R.lin[DAYS] - W0;
    const f = (v) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(1)} kg`;
    $(".d3").textContent = f(d3); $(".l3").textContent = f(l3);
    root.querySelectorAll("[data-sex]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.sex === sex));
    root.querySelectorAll("[data-pal]").forEach((b) => b.setAttribute("aria-pressed", +b.dataset.pal === pal));
    draw();
  }
  [sA, sH, sW, sI].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-sex]").forEach((b) => b.addEventListener("click", () => { sex = b.dataset.sex; update(); }));
  root.querySelectorAll("[data-pal]").forEach((b) => b.addEventListener("click", () => { pal = +b.dataset.pal; update(); }));
  update();
})();
