/* 카드: 위성이 얼마나 높이 떠야 시계가 땅 위보다 빨리 갈까? — 두 상대성 효과의 합 */
(() => {
  const root = document.getElementById("card-extra-gps");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = root.querySelector("canvas");
  const sH = $(".h"), oH = $(".h-out"), sD = $(".d"), oD = $(".d-out");
  const dSR = $(".sr"), dGR = $(".gr"), dNet = $(".net"), dErr = $(".err");
  const GM = 3.986e14, R = 6.371e6, c = 2.998e8, DAY = 86400;
  // 하루 동안 앞서는 시간 (μs): 속도 효과(−), 중력 효과(+)
  function eff(hkm) {
    const r = R + hkm * 1000, v2 = GM / r;
    const sr = -v2 / (2 * c * c) * DAY * 1e6, gr = GM / (c * c) * (1 / R - 1 / r) * DAY * 1e6;
    return { sr, gr, net: sr + gr };
  }
  const sgn = (x) => `${x >= 0 ? "+" : "−"}${Math.abs(x).toFixed(1)} μs`;
  const V = fit(cv, () => draw());
  function draw() {
    const { ctx, size: { w, h } } = V; if (!w) return;
    const padL = 40, padR = 10, padT = 12, padB = 30, pw = w - padL - padR, ph = h - padT - padB;
    const X = (k) => padL + k / 40000 * pw, Y = (u) => padT + (1 - (u + 40) / 100) * ph;
    ctx.clearRect(0, 0, w, h);
    NM.axes(ctx, { x0: padL, y0: padT, w: pw, h: ph, X, Y,
      xt: [[0, "0"], [10000, "1만"], [20000, "2만"], [30000, "3만"], [40000, "4만 km"]],
      yt: [[-40, "−40"], [0, "0"], [20, "+20"], [40, "+40"], [60, "+60"]],
      xlabel: "궤도 높이", ylabel: "하루에 앞서는 시간 (μs)" });
    const curves = [["sr", "rgba(47,109,176,.9)"], ["gr", "rgba(181,83,47,.9)"], ["net", C.ink]];
    for (const [key, col] of curves) {
      ctx.beginPath();
      for (let k = 200; k <= 40000; k += 200) { const u = eff(k)[key]; k > 200 ? ctx.lineTo(X(k), Y(u)) : ctx.moveTo(X(k), Y(u)); }
      ctx.strokeStyle = col; ctx.lineWidth = key === "net" ? 2 : 1.2; ctx.stroke(); ctx.lineWidth = 1;
    }
    ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(padL, Y(0) + .5); ctx.lineTo(padL + pw, Y(0) + .5); ctx.stroke();
    const z = R * 0.5 / 1000;
    ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(X(z), Y(0), 4, 0, Math.PI * 2); ctx.fill();
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("맞비김 약 3200 km", X(z) + 6, Y(0) + 14);
    const hk = +sH.value, e = eff(hk);
    ctx.beginPath(); ctx.arc(X(hk), Y(e.net), 5, 0, Math.PI * 2); ctx.fillStyle = C.warn; ctx.fill();
    ctx.fillStyle = "rgba(47,109,176,.9)"; ctx.fillText("움직임 (느려짐)", padL + pw - 120, Y(-30));
    ctx.fillStyle = "rgba(181,83,47,.9)"; ctx.fillText("중력 (빨라짐)", padL + pw - 120, Y(50));
  }
  function update() {
    const hk = +sH.value, d = +sD.value; oH.textContent = hk; oD.textContent = d;
    const e = eff(hk);
    dSR.textContent = sgn(e.sr); dGR.textContent = sgn(e.gr); dNet.textContent = sgn(e.net);
    const km = Math.abs(e.net) * 1e-6 * c * d / 1000;
    dErr.textContent = `${km.toFixed(1)} km`;
    dErr.classList.toggle("bad", km > 1);
    draw();
  }
  sH.addEventListener("input", update); sD.addEventListener("input", update);
  root.querySelectorAll("[data-h]").forEach((b) => b.addEventListener("click", () => { sH.value = b.dataset.h; update(); }));
  update();
})();
