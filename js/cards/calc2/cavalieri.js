/* 카드: 입체를 비스듬히 밀면 부피가 바뀔까? — 원판 조각을 똑바로·비스듬히 쌓아 단면 넓이와 부피 비교 (카발리에리의 원리) */
(() => {
  const root = document.getElementById("card-calc2-cavalieri");
  if (!root) return;
  const { C, F } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s), ss = $(".ss"), sn = $(".sn"), sy = $(".sy");
  const PI = Math.PI, H = 2;
  const P = [
    { r: (y) => 1 - y / H, V: 2 * PI / 3, rmax: 1 },
    { r: () => 0.8, V: PI * 0.64 * H, rmax: 0.8 },
  ];
  const SHIFT = { tilt: (y, s) => s * y, bend: (y, s) => s * Math.sin(PI * y / H) };
  let k = 0, bend = "tilt";
  const { ctx, size } = NM.fit($("canvas"), () => draw());

  function stack(cx, base, sc, shift, m, cut, label) {
    const p = P[k], d = H / m;
    for (let i = 0; i < m; i++) {
      const y0 = i * d, y1 = (i + 1) * d, ym = (y0 + y1) / 2, r = p.r(ym) * sc, c = cx + shift(ym) * sc;
      const yb = base - y0 * sc, yt = base - y1 * sc, ry = r * 0.28, hit = cut >= y0 && cut <= y1 + 1e-9;
      const col = hit ? C.warn : (i % 2 ? K.BLUE : C.forest);
      ctx.globalAlpha = hit ? 0.55 : 0.25; ctx.fillStyle = col;
      ctx.beginPath(); ctx.ellipse(c, yb, r, ry, 0, 0, PI); ctx.lineTo(c - r, yt); ctx.ellipse(c, yt, r, ry, 0, PI, 0, true); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1; ctx.strokeStyle = col; ctx.lineWidth = hit ? 1.6 : 1;
      ctx.beginPath(); ctx.ellipse(c, yt, r, ry, 0, 0, 2 * PI); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(c - r, yb); ctx.lineTo(c - r, yt); ctx.moveTo(c + r, yb); ctx.lineTo(c + r, yt); ctx.stroke();
    }
    ctx.font = `600 11.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText(label, cx + shift(H / 2) * sc * (bend === "tilt" ? 1 : 0.5), base + 22);
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = +ss.value, m = +sn.value, cut = +sy.value, p = P[k];
    const base = h - 30, colW = w / 2;
    const sc = Math.min((h - 54) / (H + 0.3), (colW - 16) / (2 * p.rmax + 1.5));
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(8, base); ctx.lineTo(w - 8, base); ctx.stroke();
    const yc = base - cut * sc;
    ctx.save(); ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(8, yc); ctx.lineTo(w - 8, yc); ctx.stroke(); ctx.restore();
    const leftC = colW / 2, rightC = colW + 16 + p.rmax * sc;
    stack(leftC, base, sc, () => 0, m, cut, "똑바로");
    stack(rightC, base, sc, (y) => SHIFT[bend](y, s), m, cut, bend === "tilt" ? "기울임" : "휨");
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.warn; ctx.textAlign = "left";
    ctx.fillText(`y = ${n(cut, 2)}`, 10, Math.max(14, yc - 6));
  }

  function update() {
    const p = P[k], s = +ss.value, m = +sn.value, cut = +sy.value, d = H / m;
    let sum = 0; for (let i = 0; i < m; i++) sum += PI * p.r((i + 0.5) * d) ** 2 * d;
    const A = PI * p.r(cut) ** 2;
    $(".s-out").textContent = n(s, 2); $(".n-out").textContent = m; $(".y-out").textContent = n(cut, 2);
    $(".n-l").textContent = n(A, 4); $(".n-r").textContent = n(A, 4);
    $(".n-s").textContent = `${n(sum, 4)} / ${n(sum, 4)}`; $(".n-v").textContent = `${n(p.V, 4)} (${k ? "1.28π" : "2π/3"})`;
    draw();
  }

  K.chips(root, ".fn .chip", (bt) => { k = +bt.dataset.k; update(); });
  K.chips(root, ".bend .chip", (bt) => { bend = bt.dataset.b; update(); });
  [ss, sn, sy].forEach((el) => el.addEventListener("input", update));
  update();
})();
