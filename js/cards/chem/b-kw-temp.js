/* 카드: pH 7은 언제나 중성일까? — 온도에 따른 물의 이온화 상수 Kw */
(() => {
  const root = document.getElementById("card-chem-kw-temp");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".temp"), oT = $(".temp-out");
  const dK = $(".kw"), dH = $(".h"), dN = $(".neu"), dJ = $(".judge");
  // pKw 측정값 (CRC Handbook, 포화 증기압 조건)
  const TAB = [[0, 14.94], [10, 14.53], [20, 14.17], [25, 14.00], [30, 13.83], [40, 13.53], [50, 13.26], [60, 13.02], [70, 12.80], [80, 12.60], [90, 12.43], [100, 12.26]];
  const pKw = (T) => { for (let i = 1; i < TAB.length; i++) if (T <= TAB[i][0]) { const [a, pa] = TAB[i - 1], [b, pb] = TAB[i]; return pa + (pb - pa) * (T - a) / (b - a); } return TAB.at(-1)[1]; };
  const sup = (e) => String(e).split("").map((c) => "⁻⁰¹²³⁴⁵⁶⁷⁸⁹"["-0123456789".indexOf(c)]).join("");
  const sci = (v) => { const e = Math.floor(Math.log10(v)); return `${(v / 10 ** e).toFixed(1)}×10${sup(e)}`; };

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const T = +sT.value, x0 = 40, y0 = 22, pw = w - x0 - 96, ph = h - y0 - 36;
    const X = (t) => x0 + t / 100 * pw, Y = (p) => y0 + (1 - (p - 6) / 1.6) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [0, 25, 50, 75, 100].map((v) => [v, `${v}`]), yt: [6.0, 6.4, 6.8, 7.2, 7.6].map((v) => [v, v.toFixed(1)]), ylabel: "순수한 물의 pH (= 중성의 기준)", xlabel: "온도 (°C)" });
    // 산성·염기성 영역
    ctx.font = `10.5px ${F.mono}`;
    ctx.beginPath(); for (let t = 0; t <= 100; t++) t ? ctx.lineTo(X(t), Y(pKw(t) / 2)) : ctx.moveTo(X(t), Y(pKw(t) / 2));
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.setLineDash([4, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(7)); ctx.lineTo(x0 + pw, Y(7)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("pH 7.00", x0 + pw + 4, Y(7) + 4);
    ctx.fillStyle = "rgba(70,110,190,.9)"; ctx.fillText("곡선 위 = 염기성", x0 + pw * 0.62, Y(7.45));
    ctx.fillStyle = "rgba(214,96,58,.95)"; ctx.fillText("곡선 아래 = 산성", x0 + 6, Y(6.12));
    for (const [t] of TAB) { ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(X(t), Y(pKw(t) / 2), 2.5, 0, 7); ctx.fill(); }
    const n = pKw(T) / 2;
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(X(T) + .5, y0); ctx.lineTo(X(T) + .5, y0 + ph); ctx.stroke();
    ctx.beginPath(); ctx.arc(X(T), Y(n), 6, 0, 7); ctx.fillStyle = C.ink; ctx.fill();
    ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.font = `500 12px ${F.mono}`;
    ctx.fillText(`pH ${n.toFixed(2)}`, X(T) + 9, Y(n) - 8);
    // 37 °C 표시
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.fillText("체온", X(37), Y(6.05));
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(X(37) + .5, Y(6.1)); ctx.lineTo(X(37) + .5, Y(pKw(37) / 2) + 6); ctx.stroke();
  }

  function update() {
    const T = +sT.value, p = pKw(T), n = p / 2;
    oT.textContent = T;
    dK.textContent = sci(10 ** -p); dH.textContent = sci(10 ** -n); dN.textContent = n.toFixed(2);
    dJ.textContent = Math.abs(n - 7) < 0.005 ? "중성" : 7 > n ? "약한 염기성" : "약한 산성";
    dJ.className = "judge " + (Math.abs(n - 7) < 0.005 ? "good" : "bad");
    draw();
  }
  sT.addEventListener("input", update);
  root.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { sT.value = b.dataset.t; update(); }));
  update();
})();
