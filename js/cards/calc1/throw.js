/* 카드: 위로 던진 공은 언제 가장 높이 올라갈까? — h(t) = v0·t − 4.9t², 접선 기울기 = 속도 */
(() => {
  const root = document.getElementById("card-calc1-throw");
  if (!root) return;
  const { C, F, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sv = $(".sv"), st = $(".st");
  const G = 9.8; // m/s², 중력 가속도
  const { ctx, size } = fit($("canvas"), () => draw());
  const v0 = () => +sv.value, land = () => 2 * v0() / G;
  const h = (t) => v0() * t - G / 2 * t * t, v = (t) => v0() - G * t;
  const tNow = () => Math.min(+st.value, land());

  function draw() {
    const { w, h: H } = size; if (!w) return;
    ctx.clearRect(0, 0, w, H);
    const t = tNow(), tTop = v0() / G, hTop = h(tTop);
    const g = K.frame(ctx, w, H, { xr: [0, 5], yr: [0, 32], xs: 1, ys: 5, L: 64 });
    ctx.save();
    const px = 26;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(px, g.Y(0)); ctx.lineTo(px, g.Y(32)); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("공", px, g.Y(0) + 14);
    ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(px, g.Y(h(t)), 6, 0, 7); ctx.fill();
    ctx.restore();
    K.curve(ctx, g, () => hTop, C.ink3, { width: 1, dash: [4, 4] });
    K.curve(ctx, g, h, C.ink3, { to: land(), width: 1.6 });
    K.curve(ctx, g, h, C.ink, { to: t, width: 2.6 });
    const vv = v(t), col = Math.abs(vv) < 0.05 ? C.forest : vv > 0 ? K.BLUE : C.warn;
    K.curve(ctx, g, (s) => h(t) + vv * (s - t), col, { from: t - 0.7, to: t + 0.7, width: 2 });
    K.dot(ctx, g, tTop, hTop, C.forest, true, 5);
    K.dot(ctx, g, t, h(t), col);
    K.tag(ctx, g, `기울기 ${n(vv, 2)}`, g.X(t) + 10, g.Y(h(t)) - 14, col);
  }

  function update() {
    const t = tNow(), tTop = v0() / G;
    $(".v-out").textContent = n(v0(), 1); $(".t-out").textContent = n(+st.value, 2);
    $(".n-h").textContent = n(h(t), 2);
    const vd = $(".n-v"), vv = v(t);
    vd.textContent = n(vv, 2); vd.className = `n-v ${Math.abs(vv) < 0.05 ? "good" : ""}`;
    $(".n-top").textContent = `${n(tTop, 2)} s, ${n(h(tTop), 2)} m`;
    draw();
  }
  [sv, st].forEach((s) => s.addEventListener("input", update));
  update();
})();
