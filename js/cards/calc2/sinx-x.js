/* 카드: x가 0에 가까워질 때 sin x / x는 어디로 갈까? — 넓이 비교 sin x < x < tan x와 조임 */
(() => {
  const root = document.getElementById("card-calc2-sinx-x");
  if (!root) return;
  const { C, F, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sx = $(".sx");
  let xv = 1;
  const q = (x) => (Math.abs(x) < 1e-9 ? NaN : Math.sin(x) / x);
  const { ctx, size } = fit($("canvas"), () => draw());

  function label(t, x, y, col) {
    ctx.font = `600 11.5px ${F.sans}`; ctx.fillStyle = col; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(t, x, y);
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = Math.min(h - 26, w * 0.44), ox = 16, oy = h - 18, S = s - 8;
    const U = Math.max(S * 0.45, Math.min(S, (oy - 14) / Math.tan(xv)));
    const A = [ox + U, oy], P = [ox + U * Math.cos(xv), oy - U * Math.sin(xv)], T = [ox + U, oy - U * Math.tan(xv)];
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, ox + S + 26, h); ctx.clip();
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + S + 20, oy); ctx.moveTo(ox, oy); ctx.lineTo(ox, 4); ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.arc(ox, oy, U, -Math.PI / 2, 0); ctx.stroke();
    ctx.globalAlpha = 0.18; ctx.fillStyle = C.amber; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(...A); ctx.lineTo(...T); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.3; ctx.fillStyle = C.leaf; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.arc(ox, oy, U, -xv, 0); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.35; ctx.fillStyle = C.ink3; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(...A); ctx.lineTo(...P); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1; ctx.lineWidth = 1.8;
    ctx.strokeStyle = C.amber; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(...T); ctx.lineTo(...A); ctx.stroke();
    ctx.strokeStyle = C.forest; ctx.beginPath(); ctx.moveTo(...P); ctx.lineTo(P[0], oy); ctx.stroke();
    ctx.restore();
    label("O", ox - 8, oy + 9, C.ink2); label("A", A[0] + 8, oy + 9, C.ink2);
    if (P[1] > 14) label("P", P[0] - 9, P[1] - 7, C.forest);
    if (T[1] > 10) label("T", T[0] + 10, T[1], C.amber);

    const g = K.frame(ctx, w, h, { xr: [-3.2, 3.2], yr: [-0.25, 1.15], xs: 1, ys: 0.5, L: ox + S + 56 });
    K.curve(ctx, g, () => 1, C.amber, { width: 1.3, dash: [5, 4], N: 2 });
    K.curve(ctx, g, Math.cos, C.ink3, { width: 1.3, dash: [5, 4] });
    K.curve(ctx, g, q, C.forest);
    K.dot(ctx, g, 0, 1, C.forest, true, 4);
    K.dot(ctx, g, xv, q(xv), C.warn, false, 4); K.dot(ctx, g, -xv, q(xv), C.warn, false, 4);
    K.tag(ctx, g, "y = cos x", g.x0 + g.w - 2, g.Y(-0.1), C.ink2, "right", 10.5);
  }

  function update() {
    $(".x-out").textContent = n(xv, 6);
    const s = Math.sin(xv), t = Math.tan(xv), c = Math.cos(xv);
    $(".n-s").textContent = n(s, 6); $(".n-t").textContent = n(t, 6);
    $(".n-q").textContent = n(s / xv, 6); $(".n-c").textContent = n((1 - c) / xv, 6);
    $(".eq").innerHTML = `${n(s, 5)} &lt; ${n(xv, 5)} &lt; ${n(t, 5)} &nbsp;→&nbsp; cos <i>x</i> = ${n(c, 5)} &lt; ${n(s / xv, 5)} &lt; 1`;
    draw();
  }

  $(".go-half").addEventListener("click", () => { if (xv > 1e-4) { xv = +(xv / 2).toPrecision(6); sx.value = Math.max(0.01, xv); update(); } });
  $(".go-one").addEventListener("click", () => { xv = 1; sx.value = 1; update(); });
  sx.addEventListener("input", () => { xv = +sx.value; update(); });
  update();
})();
