/* 카드: 둘레와 넓이만 알면 직사각형의 가로, 세로를 알 수 있을까? — 합 s, 곱 p인 두 수를 t² − st + p = 0의 근으로 찾기 */
(() => {
  const root = document.getElementById("card-cm1-sum-product");
  if (!root) return;
  const { C, F, fit } = NM;
  const E = NMEqPlot;
  const $ = (s) => root.querySelector(s);
  const ss = $(".s"), sp = $(".p");
  const { ctx, size } = fit($("canvas"), () => draw());
  const I = "<i>i</i>";
  const ex = (v) => (Math.abs(v - E.r3(v)) < 1e-9 ? "" : "≈ ") + E.n(v);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = +ss.value, p = +sp.value, r = E.roots(1, -s, p);
    const gap = 16, lw = (w - gap) * 0.42, top = 22, bh = h - top - 24;
    ctx.font = `600 11.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillText("직사각형", 6, 13);
    const u = Math.min(lw - 12, bh) / 12, ox = 6, oy = top + bh;
    ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.strokeRect(ox, oy - s / 2 * u, s / 2 * u, s / 2 * u); ctx.restore();
    if (r.kind >= 0) {
      const big = r.kind ? r.xs[1] : r.xs[0], small = r.xs[0];
      ctx.fillStyle = C.sprout; ctx.globalAlpha = 0.6; ctx.fillRect(ox, oy - small * u, big * u, small * u); ctx.globalAlpha = 1;
      ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.strokeRect(ox, oy - small * u, big * u, small * u);
      const box = { x: 0, y: top, w: lw, h: bh };
      E.tag(ctx, `가로 ${ex(big)}`, ox + big * u / 2, oy - small * u - 10, C.forest, "center", box);
      E.tag(ctx, `세로 ${ex(small)}`, ox + big * u + 6, oy - small * u / 2, C.forest, "left", box);
    } else {
      E.tag(ctx, "이런 직사각형은 없음", ox + 4, top + 10, C.warn, "left", { x: 0, y: top, w: lw, h: bh });
      E.tag(ctx, `넓이 최대 ${E.n(s * s / 4)} (정사각형)`, ox + 4, top + 28, C.ink2, "left", { x: 0, y: top, w: lw, h: bh });
    }
    const rx = lw + gap + 26, vtx = p - s * s / 4;
    ctx.fillStyle = C.ink2; ctx.fillText("y = t² − st + p", rx, 13);
    const fr = E.frame(ctx, { x: rx, y: top, w: w - rx - 8, h: bh }, { X0: -1, X1: 13, Y0: Math.min(-4, vtx - 3), Y1: Math.max(12, p + 3) }, { xs: 2, xname: "t" });
    E.curve(ctx, fr, (t) => t * t - s * t + p, C.forest, 2.2);
    if (r.kind >= 0) r.xs.forEach((x) => E.dot(ctx, fr.X(x), fr.Y(0), r.kind ? C.forest : C.amber, 5.5));
    else E.tag(ctx, "t축과 만나지 않음", fr.box.x + 4, fr.box.y + 10, C.warn, "left", fr.box);
  }

  function update() {
    const s = +ss.value, p = +sp.value, r = E.roots(1, -s, p), D = s * s - 4 * p;
    $(".s-out").textContent = s; $(".p-out").textContent = p;
    $(".eq").innerHTML = `두 수는 <i>t</i><sup>2</sup> − ${s}<i>t</i> + ${p} = 0의 근`;
    const nd = $(".n-d"); nd.textContent = E.n(D); nd.className = `n-d ${D < 0 ? "bad" : "good"}`;
    $(".n-r").innerHTML = r.kind === 2 ? `${ex(r.xs[0])}, ${ex(r.xs[1])}` : r.kind === 0 ? `${ex(r.xs[0])}, ${ex(r.xs[0])}` : `${E.n(r.p)} ± ${ex(r.q)}${I}`;
    const nk = $(".n-k"); nk.textContent = r.kind === 2 ? "있음" : r.kind === 0 ? "정사각형" : "없음 (허수)";
    nk.className = `n-k ${r.kind < 0 ? "bad" : "good"}`;
    draw();
  }
  [ss, sp].forEach((x) => x.addEventListener("input", update));
  update();
})();
