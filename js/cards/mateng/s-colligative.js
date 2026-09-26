/* 카드: 소금물은 왜 더 높은 온도에서 끓고, 더 낮은 온도에서 얼까? — 라울 법칙으로 낮아진 증기 압력 곡선, ΔTb = Kb·im, ΔTf = Kf·im */
(() => {
  const root = document.getElementById("card-mateng-colligative");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sM = $(".m"), oM = $(".m-out");
  const nIm = $(".n-im"), nP = $(".n-p"), nBp = $(".n-bp"), nFp = $(".n-fp");
  const R = 8.314, DH = 40700, KB = 0.52, KF = 1.86, NW = 55.51;
  let I = 1;
  const p0 = (T) => 760 * Math.exp(-DH / R * (1 / T - 1 / 373.15));   // 물의 증기 압력 (mmHg), 클라우지우스–클라페이롱
  const xw = () => NW / (NW + I * +sM.value);
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 56, y0 = h - 32, pw = w - x0 - 20, ph = h - 54, Tmin = 90, Tmax = 106, Pmin = 500, Pmax = 950;
    const X = (t) => x0 + (t - Tmin) / (Tmax - Tmin) * pw, Y = (p) => y0 - (p - Pmin) / (Pmax - Pmin) * ph;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.textAlign = "center"; for (let t = 90; t <= 106; t += 2) { ctx.beginPath(); ctx.moveTo(X(t), y0); ctx.lineTo(X(t), y0 - ph); ctx.stroke(); ctx.fillText(`${t}`, X(t), y0 + 13); }
    ctx.fillText("온도 (°C)", x0 + pw / 2, y0 + 26);
    ctx.textAlign = "right"; for (let p = 500; p <= 900; p += 100) ctx.fillText(`${p}`, x0 - 5, Y(p) + 3);
    ctx.save(); ctx.translate(14, y0 - ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("증기 압력 (mmHg)", 0, 0); ctx.restore();
    ctx.strokeStyle = C.ink; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(x0, Y(760)); ctx.lineTo(x0 + pw, Y(760)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText("1기압 = 760 mmHg", x0 + 4, Y(760) - 5);
    const curve = (f, col, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); for (let i = 0; i <= 100; i++) { const t = Tmin + (Tmax - Tmin) * i / 100, p = f * p0(t + 273.15); i ? ctx.lineTo(X(t), Y(p)) : ctx.moveTo(X(t), Y(p)); } ctx.stroke(); };
    curve(1, "#3f6fa3", 2); curve(xw(), "#b5532f", 2.4);
    const bp = 1 / (1 / 373.15 - R * Math.log(1 / xw()) / DH) - 273.15;
    ctx.fillStyle = "#3f6fa3"; ctx.beginPath(); ctx.arc(X(100), Y(760), 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#b5532f"; ctx.beginPath(); ctx.arc(X(bp), Y(760), 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#b5532f"; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(bp), Y(760)); ctx.lineTo(X(bp), y0); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = "#3f6fa3"; ctx.fillText("순수한 물", X(92), Y(p0(92 + 273.15)) - 8);
    ctx.fillStyle = "#b5532f"; ctx.fillText("용액", X(97), Y(xw() * p0(97 + 273.15)) + 16);
  }
  function update() {
    const m = +sM.value, im = I * m; oM.textContent = m.toFixed(2);
    nIm.textContent = `${im.toFixed(2)} mol/kg`;
    nP.textContent = `${(760 * xw()).toFixed(1)} mmHg`;
    nBp.textContent = `${(100 + KB * im).toFixed(2)} °C`;
    nFp.textContent = `${(-KF * im).toFixed(2)} °C`.replace("-", "−");
    root.querySelectorAll("[data-i]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.i === I)));
    draw();
  }
  sM.addEventListener("input", update);
  root.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => { I = +b.dataset.i; update(); }));
  update();
})();
