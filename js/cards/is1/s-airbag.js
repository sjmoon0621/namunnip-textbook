/* 카드: 에어백은 무엇을 줄이고, 무엇은 줄이지 못할까? — 힘–시간 그래프의 넓이(충격량) */
(() => {
  const root = document.getElementById("card-is1-airbag");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sV = $(".spd"), oV = $(".spd-out"), sT = $(".dur"), oT = $(".dur-out");
  const nJ = $(".imp"), nF = $(".favg"), nG = $(".gs"), nD = $(".dist");

  const M = 70, g = 9.81, TREF = 10; // 탑승자 질량 (kg), 비교용 짧은 충돌 시간 (ms)
  // 힘의 모양: 반 사인 모양 F(t) = Fmax·sin(πt/T) → 넓이 = 2FmaxT/π = Δp
  const peak = (dp, Tms) => Math.PI * dp / (2 * Tms / 1000);

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const v = +sV.value / 3.6, dp = M * v, T = +sT.value;
    const pRef = peak(dp, TREF), pNow = peak(dp, T);
    const padL = 46, padR = 12, padT = 24, padB = 34, pw = w - padL - padR, ph = h - padT - padB;
    const TMAX = 160, FMAX = pRef * 1.08;
    const X = (ms) => padL + ms / TMAX * pw, Y = (f) => padT + (1 - f / FMAX) * ph;
    const niceStep = (m) => { const s = m / 4, p = 10 ** Math.floor(Math.log10(s)); return [1, 2, 5, 10].map((k) => k * p).find((k) => k >= s); };
    const fs = niceStep(FMAX / 1000) * 1000, yt = [];
    for (let f = 0; f <= FMAX; f += fs) yt.push([f, (f / 1000).toFixed(0)]);
    NM.axes(ctx, { x0: padL, y0: padT, w: pw, h: ph, X, Y,
      xt: [[0, "0"], [40, "40"], [80, "80"], [120, "120"], [160, "160"]], yt,
      ylabel: "탑승자가 받는 힘 (kN)", xlabel: "시간 (ms, 1 ms = 0.001초)" });
    const pulse = (Tms, fp) => { ctx.beginPath(); ctx.moveTo(X(0), Y(0)); for (let i = 0; i <= 80; i++) { const t = Tms * i / 80; ctx.lineTo(X(t), Y(fp * Math.sin(Math.PI * i / 80))); } ctx.lineTo(X(Tms), Y(0)); };
    // 비교: 10 ms 만에 멈출 때
    pulse(TREF, pRef); ctx.fillStyle = "rgba(181,83,47,.12)"; ctx.fill();
    ctx.setLineDash([4, 3]); ctx.strokeStyle = C.warn; ctx.lineWidth = 1.4; ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.warn;
    ctx.fillText(`${TREF} ms 만에 멈출 때`, X(TREF) + 6, Y(pRef) + 12);
    // 지금
    pulse(T, pNow); ctx.fillStyle = "rgba(116,171,102,.3)"; ctx.fill();
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.2; ctx.stroke();
    // 평균 힘
    const fa = dp / (T / 1000);
    ctx.setLineDash([2, 3]); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(0), Y(fa)); ctx.lineTo(X(T), Y(fa)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.forest; ctx.font = `600 12px ${F.sans}`;
    let lx = X(T) + 10; if (lx + 170 > w - padR) lx = X(T) - 180;
    const ly = Math.max(padT + 44, Y(pNow * 0.55));
    ctx.fillText(`넓이 = 충격량 ${Math.round(dp)} N·s`, lx, ly);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`;
    ctx.fillText(`점선 그래프와 넓이가 같음`, lx, ly + 15);
  }

  function update() {
    const kmh = +sV.value, v = kmh / 3.6, T = +sT.value, dp = M * v;
    oV.textContent = kmh; oT.textContent = T;
    nJ.textContent = `${Math.round(dp)} N·s`;
    const fa = dp / (T / 1000);
    nF.textContent = `${(fa / 1000).toFixed(1)} kN`;
    nG.textContent = `${Math.round(v / (T / 1000) / g)} g`;
    const d = v * T / 1000 / 2;
    nD.textContent = d >= 1 ? `${d.toFixed(2)} m` : `${Math.round(d * 100)} cm`;
    draw();
  }
  [sV, sT].forEach((el) => el.addEventListener("input", update));
  update();
})();
