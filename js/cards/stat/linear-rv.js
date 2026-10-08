/* 카드: 점수를 두 배 하고 5점을 더하면 표준편차는? — 주사위 눈 X와 Y = aX + b의 분포, 평균과 평균 ± 표준편차 비교 */
(() => {
  const root = document.getElementById("card-stat-linear-rv");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const S = NMStat;
  const $ = (s) => root.querySelector(s), sa = $(".a"), sb = $(".b");
  const XS = [1, 2, 3, 4, 5, 6], LO = -27, HI = 27;
  const { ctx, size } = fit($("canvas"), () => draw());
  const ms = (vals) => { const m = vals.reduce((a, b) => a + b, 0) / 6; return { m, s: Math.sqrt(vals.reduce((a, v) => a + (v - m) ** 2, 0) / 6) }; };

  function row(X, vals, base, hMax, col, name, w) {
    const groups = new Map();
    vals.forEach((v, i) => { const k = v.toFixed(3); if (!groups.has(k)) groups.set(k, { v, src: [] }); groups.get(k).src.push(i + 1); });
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(LO), base); ctx.lineTo(X(HI), base); ctx.stroke();
    for (const { v, src } of groups.values()) {
      const p = src.length / 6, len = Math.min(hMax, p * 6 * hMax * 0.55), x = X(v);
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x, base - len); ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, base - len, 3.5, 0, 7); ctx.fill();
    }
    const { m, s } = ms(vals), y = base + 9;
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.moveTo(X(m), base + 2); ctx.lineTo(X(m) - 6, y + 4); ctx.lineTo(X(m) + 6, y + 4); ctx.fill();
    if (s > 1e-9) {
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(X(m - s), y + 9); ctx.lineTo(X(m + s), y + 9); ctx.moveTo(X(m - s), y + 4); ctx.lineTo(X(m - s), y + 14); ctx.moveTo(X(m + s), y + 4); ctx.lineTo(X(m + s), y + 14); ctx.stroke();
    }
    ctx.fillStyle = col; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillText(name, 6, base - hMax * 0.55 - 4 < 14 ? 14 : base - hMax * 0.55 - 4);
    return { m, s, groups };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 14, gw = w - 28, X = (v) => x0 + (clamp(v, LO, HI) - LO) / (HI - LO) * gw;
    const a = +sa.value, b = +sb.value, ys = XS.map((x) => a * x + b);
    const bx = Math.round(h * 0.36), by = Math.round(h * 0.78), hMax = h * 0.26;
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    XS.forEach((x, i) => { ctx.beginPath(); ctx.moveTo(X(x), bx + 1); ctx.lineTo(X(ys[i]), by - Math.min(hMax, hMax * 0.55) - 2); ctx.stroke(); });
    ctx.setLineDash([]);
    row(X, XS, bx, hMax, C.forest, "X (주사위 눈)", w);
    row(X, ys, by, hMax, C.ink, `Y = ${S.short(a, 1)}X ${b < 0 ? "−" : "+"} ${Math.abs(b)}`, w);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    [-24, -16, -8, 0, 8, 16, 24].forEach((t) => ctx.fillText(String(t).replace("-", "−"), X(t), h - 4));
    ctx.font = `600 10.5px ${F.mono}`; ctx.fillStyle = C.forest;
    XS.forEach((x) => ctx.fillText(String(x), X(x), bx + 30));
  }

  function update() {
    const a = +sa.value, b = +sb.value;
    $(".a-out").textContent = S.short(a, 1); $(".b-out").textContent = String(b).replace("-", "−");
    const y = ms(XS.map((x) => a * x + b)), x = ms(XS);
    $(".n-e").textContent = S.fmt(y.m, 3); $(".n-e2").textContent = S.fmt(a * x.m + b, 3);
    $(".n-s").textContent = S.fmt(y.s, 3); $(".n-s2").textContent = S.fmt(Math.abs(a) * x.s, 3);
    draw();
  }
  [sa, sb].forEach((s) => s.addEventListener("input", update));
  update();
})();
