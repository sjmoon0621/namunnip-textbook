/* 카드: 두 속도 그래프가 만나는 순간, 두 물체도 만날까? — 속도 그래프 사이 넓이로 간격, 가장 멀 때와 따라잡는 때 */
(() => {
  const root = document.getElementById("card-calc1-chase");
  if (!root) return;
  const { C, F, fit } = NM, K = NMCalc, I = NMInt;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sA = $(".a"), sK = $(".k"), sD = $(".d"), sT = $(".t");
  const T = 10;   // 보이는 시간 범위 0 ≤ t ≤ 10
  let gt = null;
  const { ctx, size } = fit(cv, () => draw());
  const par = () => ({ a: +sA.value, k: +sK.value, d: +sD.value });
  const xA = (t) => par().a * t * t / 2, xB = (t) => par().d + par().k * t;
  const meet = () => { const { a, k, d } = par(); return (k + Math.sqrt(k * k + 2 * a * d)) / a; };
  const nice = (span) => [1, 2, 5, 10, 20, 25, 50].find((s) => span / s <= 7) || 100;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { a, k } = par(), t = +sT.value, ts = k / a, topH = Math.round(h * 0.56);
    const vTop = Math.ceil(Math.max(a * T, k) / 5) * 5 + 2;
    gt = K.frame(ctx, w, h, { xr: [0, T], yr: [0, vTop], ys: vTop > 20 ? 10 : 5, B: h - topH });
    const vA = (s) => a * s, vB = () => k;
    I.fill(ctx, gt, vA, 0, Math.min(t, ts), { base: vB, split: false, pos: C.amber, alpha: .45 });
    if (t > ts) I.fill(ctx, gt, vA, ts, t, { base: vB, split: false, pos: K.BLUE, alpha: .32 });
    K.curve(ctx, gt, vA, C.forest, { width: 2.6 });
    K.curve(ctx, gt, vB, C.warn, { width: 2.4 });
    if (ts <= T) K.dot(ctx, gt, ts, k, C.ink);
    K.guide(ctx, gt, t, Math.max(vA(t), k), C.ink, "x");
    I.handle(ctx, gt.X(t), gt.Y(vA(t)), C.forest);
    K.tag(ctx, gt, "A: v = at", gt.x0 + 6, gt.y0 + 10, C.forest);
    K.tag(ctx, gt, "B: v = k", gt.x0 + 6, gt.y0 + 28, C.warn);

    /* 아래: 같은 직선 위의 두 물체 */
    const xMax = Math.max(a * T * T / 2, xB(T)), step = nice(xMax);
    const L = gt.x0, W = gt.w, X = (x) => L + x / xMax * W;
    const yAx = h - 24, yB = topH + 40, yA = topH + 40 + (yAx - topH - 40) * 0.55;
    ctx.save();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.textAlign = "center";
    for (let v = 0; v <= xMax + 1e-9; v += step) { ctx.beginPath(); ctx.moveTo(X(v), yB - 8); ctx.lineTo(X(v), yAx); ctx.stroke(); ctx.fillText(K.n(v), X(v), yAx + 14); }
    ctx.strokeStyle = C.ink3; [yB, yA].forEach((y) => { ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(L + W, y); ctx.stroke(); });
    ctx.restore();
    const pa = xA(t), pb = xB(t);
    ctx.save(); ctx.strokeStyle = C.ink2; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(pa), yA); ctx.lineTo(X(pa), yAx); ctx.moveTo(X(pb), yB); ctx.lineTo(X(pb), yAx); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(X(pa), yA, 6, 0, 7); ctx.fill();
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(pb), yB, 6, 0, 7); ctx.fill(); ctx.restore();
    ctx.save(); ctx.font = `600 11px ${F.sans}`; ctx.textBaseline = "middle"; ctx.textAlign = "right";
    ctx.fillStyle = C.warn; ctx.fillText("B", L - 6, yB); ctx.fillStyle = C.forest; ctx.fillText("A", L - 6, yA);
    ctx.textAlign = "left"; ctx.fillStyle = C.ink2; ctx.fillText("위치", L, topH + 20); ctx.restore();
  }

  function update() {
    const { a, k, d } = par(), t = +sT.value, ts = k / a, m = Math.min(t, ts);
    $(".a-out").textContent = K.n(a); $(".k-out").textContent = K.n(k); $(".d-out").textContent = K.n(d); $(".t-out").textContent = K.n(t, 2);
    const pa = xA(t), pb = xB(t), gap = pb - pa;
    $(".n-xa").textContent = K.n(pa, 3); $(".n-xb").textContent = K.n(pb, 3);
    const ng = $(".n-g"); ng.textContent = K.n(gap, 3); ng.className = `n-g ${Math.abs(gap) < 0.05 ? "good" : gap < 0 ? "bad" : ""}`;
    const tm = meet(); $(".n-m").textContent = tm <= T ? `t = ${K.n(tm, 3)}` : "10 안에 없음";
    const yel = k * m - a * m * m / 2, blu = t > ts ? a * (t * t - ts * ts) / 2 - k * (t - ts) : 0;
    $(".rel").innerHTML = `간격 = <i>d</i> + 노랑 − 파랑 = ${K.n(d)} + ${K.n(yel, 3)} − ${K.n(blu, 3)} = ${K.n(d + yel - blu, 3)}<br>속도가 같아지는 때 <i>t</i> = <i>k</i>/<i>a</i> = ${K.n(ts, 3)}, 그때 간격 ${K.n(d + k * k / (2 * a), 3)} (가장 큼)`;
    draw();
  }

  I.drag(cv, (px, py) => (gt && px >= gt.x0 - 8 && px <= gt.x0 + gt.w + 8 && py >= gt.y0 && py <= gt.y0 + gt.h ? "t" : null), (id, px) => {
    sT.value = NM.clamp(Math.round(gt.ix(px) * 20) / 20, 0, T); update();
  });
  [sA, sK, sD, sT].forEach((s) => s.addEventListener("input", update));
  update();
})();
