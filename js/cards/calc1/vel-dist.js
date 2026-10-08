/* 카드: 속도만 알면 움직인 거리를 알 수 있을까? — v–t 그래프의 넓이로 위치·변위·이동 거리, 수직선 위 자취 */
(() => {
  const root = document.getElementById("card-calc1-vel-dist");
  if (!root) return;
  const { C, F, fit } = NM, K = NMCalc, I = NMInt;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), sX = $(".x0");
  let ex = { p: [9, -12, 3], T: 4, vr: [-4, 10, 2] }, gt = null;
  const NL = [-4, 13];   // 수직선에 보이는 범위 (처음 위치 −3~3과 세 속도의 움직임을 모두 담는다)
  const { ctx, size } = fit(cv, () => draw());
  const v = (t) => I.at(ex.p, t);
  const pos = (t) => +sX.value + I.def(ex.p, 0, t);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const t = +sT.value, topH = Math.round(h * 0.58);
    gt = K.frame(ctx, w, h, { xr: [0, ex.T], yr: ex.vr.slice(0, 2), ys: ex.vr[2], B: h - topH });
    I.fill(ctx, gt, v, 0, t, { alpha: .3 });
    K.curve(ctx, gt, v, C.forest, { width: 2.6 });
    K.guide(ctx, gt, t, v(t), C.ink, "x");
    I.handle(ctx, gt.X(t), gt.Y(v(t)), C.ink);
    K.tag(ctx, gt, "속도 v(t)", gt.x0 + 6, gt.y0 + 10, C.forest);
    K.tag(ctx, gt, "t", gt.x0 + gt.w - 10, gt.Y(0) - 10, C.ink3);

    /* 아래: 수직선과 자취 */
    const x0 = gt.x0, ww = gt.w, X = (x) => x0 + (x - NL[0]) / (NL[1] - NL[0]) * ww;
    const yLine = h - 24, yTop = topH + 34;
    ctx.save();
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, yLine); ctx.lineTo(x0 + ww, yLine); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let k = NL[0]; k <= NL[1]; k++) {
      ctx.beginPath(); ctx.moveTo(X(k), yLine - 3); ctx.lineTo(X(k), yLine + 3); ctx.stroke();
      if (k % 2 === 0) ctx.fillText(K.n(k), X(k), yLine + 15);
    }
    const Yt = (s) => yLine - 10 - s / ex.T * (yLine - 10 - yTop), N = 200;
    ctx.lineWidth = 2.2;
    for (let i = 0; i < N; i++) {
      const s0 = t * i / N, s1 = t * (i + 1) / N;
      ctx.strokeStyle = v((s0 + s1) / 2) >= 0 ? K.BLUE : C.warn;
      ctx.beginPath(); ctx.moveTo(X(pos(s0)), Yt(s0)); ctx.lineTo(X(pos(s1)), Yt(s1)); ctx.stroke();
    }
    ctx.restore();
    const xs = +sX.value, xt = pos(t);
    ctx.save(); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(X(xs), yLine - 4); ctx.lineTo(X(xs) - 4, yLine - 11); ctx.lineTo(X(xs) + 4, yLine - 11); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.save(); ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(xt), yLine, 5.5, 0, 7); ctx.fill(); ctx.restore();
    ctx.save(); ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("P의 자취 (위로 갈수록 나중 시각)", x0, topH + 20); ctx.restore();
  }

  function update() {
    const t = +sT.value, x0 = +sX.value, d = I.def(ex.p, 0, t), s = I.absInt(ex.p, 0, t).area;
    $(".t-out").textContent = K.n(t, 2); $(".x0-out").textContent = K.n(x0);
    $(".n-v").textContent = K.n(v(t), 3);
    $(".n-d").textContent = I.frac(d, 60);
    const ns = $(".n-s"); ns.textContent = I.frac(s, 60); ns.className = `n-s ${Math.abs(s - Math.abs(d)) > 1e-9 ? "bad" : ""}`;
    $(".n-x").textContent = I.frac(x0 + d, 60);
    $(".rel").innerHTML = `<i>x</i>(<i>t</i>) = <i>x</i>(0) + ∫<sub>0</sub><sup>t</sup> <i>v</i> <i>ds</i> = ${K.n(x0)} + (${I.frac(d, 60)}) = ${I.frac(x0 + d, 60)}`;
    draw();
  }

  I.drag(cv, (px, py) => (gt && px >= gt.x0 - 8 && px <= gt.x0 + gt.w + 8 && py >= gt.y0 && py <= gt.y0 + gt.h ? "t" : null), (id, px) => {
    sT.value = NM.clamp(Math.round(gt.ix(px) * 20) / 20, 0, ex.T); update();
  });
  K.chips(root, ".presets .chip", (b) => { const [p, T, vr] = JSON.parse(b.dataset.ex); ex = { p, T, vr }; sT.max = T; sT.value = T; update(); });
  [sT, sX].forEach((s) => s.addEventListener("input", update));
  update();
})();
