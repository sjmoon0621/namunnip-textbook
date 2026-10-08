/* 카드: 제곱해서 −1이 되는 수에 i를 계속 곱하면 어디로 갈까? — 처음 수 z에 i를 n번 곱한 점들 */
(() => {
  const root = document.getElementById("card-cm1-imag-unit");
  if (!root) return;
  const { C, F, fit } = NM;
  const E = NMEqPlot;
  const $ = (s) => root.querySelector(s), starts = [...root.querySelectorAll(".start .chip")];
  const POW = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const mulI = ([a, b]) => [-b, a];
  let z0 = [1, 0], n = 0;
  const { ctx, size } = fit($("canvas"), () => draw());

  const pts = () => { const p = [z0]; for (let k = 1; k <= n; k++) p.push(mulI(p[k - 1])); return p; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const fr = E.frame(ctx, { x: 30, y: 8, w: w - 40, h: h - 30 }, { X0: -2.6, X1: 2.6, Y0: -2.6, Y1: 2.6 }, { eq: true, xs: 1, ys: 1, xname: "실수축", yname: "허수축" });
    const { X, Y } = fr, r = Math.hypot(z0[0], z0[1]);
    ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(X(0), Y(0), X(r) - X(0), 0, 7); ctx.stroke(); ctx.restore();
    const p = pts(), show = p.slice(Math.max(0, p.length - 5));
    ctx.strokeStyle = C.sprout; ctx.lineWidth = 2;
    for (let k = 1; k < show.length; k++) {
      const a0 = Math.atan2(-show[k - 1][1], show[k - 1][0]);
      ctx.beginPath(); ctx.arc(X(0), Y(0), (X(r) - X(0)) * 0.55, a0, a0 - Math.PI / 2, true); ctx.stroke();
    }
    show.forEach((q, k) => {
      const last = k === show.length - 1, idx = p.length - show.length + k;
      ctx.strokeStyle = last ? C.forest : C.ink3; ctx.lineWidth = last ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(q[0]), Y(q[1])); ctx.stroke();
      E.dot(ctx, X(q[0]), Y(q[1]), last ? C.forest : C.ink2, last ? 6 : 4);
      const right = q[0] >= 0;
      E.tag(ctx, `${idx === 0 ? "처음" : `×i${idx > 1 ? "^" + idx : ""}`}: ${E.cx(q[0], q[1])}`, X(q[0]) + (right ? 9 : -9), Y(q[1]) - 11, last ? C.forest : C.ink2, right ? "left" : "right", fr.box);
    });
    ctx.font = `600 11.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillText(`점선 원: 원점에서 처음 수까지의 거리 ${E.n(r)}`, fr.box.x + 6, fr.box.y + fr.box.h - 6);
  }

  function update() {
    const p = pts(), z = p[n];
    $(".n-n").textContent = n;
    $(".n-i").textContent = E.cx(...POW[n % 4]);
    $(".n-z").textContent = E.cx(z[0], z[1]);
    $(".seq").innerHTML = "지금까지: " + p.slice(-8).map((q) => E.cx(q[0], q[1], true)).join(" → ") + (n >= 4 ? ` <span class="good">· ${n % 4 === 0 ? "다시 처음 수" : `n을 4로 나눈 나머지 ${n % 4}`}</span>` : "");
    draw();
  }
  starts.forEach((b) => b.addEventListener("click", () => {
    z0 = b.dataset.z.split(",").map(Number); n = 0;
    starts.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update();
  }));
  $(".go-mul").addEventListener("click", () => { n += 1; update(); });
  $(".go-reset").addEventListener("click", () => { n = 0; update(); });
  update();
})();
