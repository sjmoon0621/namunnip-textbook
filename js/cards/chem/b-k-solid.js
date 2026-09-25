/* 카드: 평형 상수 식에는 왜 고체가 빠질까? — CaCO₃(s) ⇌ CaO(s) + CO₂(g), 800 °C */
(() => {
  const root = document.getElementById("card-chem-k-solid");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sM = $(".mass"), sV = $(".vol"), oM = $(".mass-out"), oV = $(".vol-out");
  const dP = $(".p-co2"), dL = $(".left"), dO = $(".cao"), msg = $(".msg");

  const KP = 0.22, T = 1073.15, R = 0.08206, M_CC = 100.09, M_CAO = 56.08;
  function state() {
    const m = +sM.value, V = +sV.value, n0 = m / M_CC, nEq = KP * V / (R * T);
    if (n0 > nEq) return { m, V, P: KP, nCO2: nEq, left: n0 - nEq, sat: true };
    return { m, V, P: n0 * R * T / V, nCO2: n0, left: 0, sat: false };
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = state();
    const split = Math.round(w * 0.42);
    // ── 용기: 너비가 부피에 비례
    const maxW = split - 24, bh = h - 60, bw = maxW * (0.3 + 0.7 * s.V / 10), bx = 12, by = 24;
    ctx.fillStyle = "rgba(224,160,42,.05)"; ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(bx + .5, by + .5, bw, bh);
    // 기체 점: 개수 ∝ 몰수, 넓이 ∝ 부피 → 점의 밀도 ∝ 압력
    const nd = Math.round(s.nCO2 * 2600);
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    ctx.fillStyle = "#8d8d92";
    for (let i = 0; i < nd; i++) { ctx.beginPath(); ctx.arc(bx + 4 + rnd() * (bw - 8), by + 4 + rnd() * (bh - 40), 2, 0, Math.PI * 2); ctx.fill(); }
    // 고체 더미: CaCO₃(흰색), CaO(회색)
    const nCC = Math.round(s.left * M_CC * 10), nCaO = Math.round(s.nCO2 * M_CC * 10);
    const cell = 7, perRow = Math.max(4, Math.floor((bw - 10) / cell));
    const blocks = [...Array(nCaO).fill("cao"), ...Array(nCC).fill("cc")];
    blocks.forEach((k, i) => {
      const r = Math.floor(i / perRow), c = i % perRow;
      const x = bx + 5 + c * cell, y = by + bh - 4 - (r + 1) * cell;
      ctx.fillStyle = k === "cc" ? "#fbfbf8" : "#a9a9a2"; ctx.fillRect(x, y, cell - 1, cell - 1);
      ctx.strokeStyle = "#8d8d92"; ctx.lineWidth = .6; ctx.strokeRect(x + .3, y + .3, cell - 1.6, cell - 1.6);
    });
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText(`V = ${s.V.toFixed(1)} L · 800 °C`, bx, by - 8);
    ctx.fillText("□ CaCO₃  ■ CaO  · CO₂", bx, h - 12);

    // ── 그래프: 처음 넣은 CaCO₃ 질량에 따른 CO₂ 압력
    const x0 = split + 40, y0 = 24, pw = w - x0 - 12, ph = h - y0 - 40, mMax = 5, pMax = 0.3;
    const X = (m) => x0 + m / mMax * pw, Y = (p) => y0 + (1 - p / pMax) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [0, 1, 2, 3, 4, 5].map((v) => [v, `${v}`]), yt: [[0, "0"], [0.1, "0.1"], [0.2, "0.2"], [0.3, "0.3"]], ylabel: "CO₂ 압력 (atm)", xlabel: "처음 넣은 CaCO₃ (g)" });
    const mEq = KP * s.V / (R * T) * M_CC;
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.2; ctx.beginPath();
    ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(Math.min(mEq, mMax)), Y(Math.min(mEq, mMax) / M_CC * R * T / s.V)); if (mEq < mMax) ctx.lineTo(X(mMax), Y(KP)); ctx.stroke();
    ctx.setLineDash([3, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, Y(KP)); ctx.lineTo(x0 + pw, Y(KP)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText("Kₚ ≈ 0.22 atm", x0 + 4, Y(KP) - 6);
    if (mEq < mMax) { ctx.fillStyle = C.ink3; ctx.textAlign = X(mEq) > x0 + pw * 0.55 ? "right" : "left"; ctx.fillText("여기부터 CaCO₃가 남음", X(mEq) + (X(mEq) > x0 + pw * 0.55 ? -6 : 6), Y(KP) + 34); }
    ctx.beginPath(); ctx.arc(X(s.m), Y(s.P), 5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    ctx.textAlign = "left";
  }

  function update() {
    const s = state();
    oM.textContent = s.m.toFixed(2); oV.textContent = s.V.toFixed(1);
    dP.textContent = `${s.P.toFixed(3)} atm`;
    dL.textContent = `${(s.left * M_CC).toFixed(2)} g`;
    dO.textContent = `${(s.nCO2 * M_CAO).toFixed(2)} g`;
    msg.textContent = s.sat ? "CaCO₃가 남아 있습니다. 고체를 더 넣어도, 덜 넣어도 CO₂ 압력은 그대로입니다."
      : "CaCO₃가 모두 분해되었습니다. 고체가 남지 않았으니 평형이 아니고, CO₂ 압력은 Kₚ보다 작습니다.";
    msg.classList.toggle("bad", !s.sat);
    draw();
  }
  [sM, sV].forEach((el) => el.addEventListener("input", update));
  update();
})();
