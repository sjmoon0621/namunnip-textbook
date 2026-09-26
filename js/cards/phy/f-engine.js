/* 카드: 열기관의 효율은 왜 100%가 될 수 없을까? — 이상 기체 카르노 순환의 P–V 도표 */
(() => {
  const root = document.getElementById("card-phy-engine");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const [cvA, cvB] = root.querySelectorAll("canvas");
  const sH = $(".th"), sC = $(".tc"), sR = $(".rr");
  const oH = $(".th-out"), oC = $(".tc-out"), oR = $(".rr-out");
  const nQh = $(".e-qh"), nW = $(".e-w"), nQc = $(".e-qc"), nEta = $(".e-eta");

  const Rg = 8.314, n = 0.04, G = 5 / 3; // 단원자 이상 기체 0.04 mol, V는 L, P는 kPa
  const HOT = "#c8553d", COLD = "#3569a8";
  let u = 0, parts = null;

  function cyc() {
    const TH = +sH.value, TC = +sC.value, r = +sR.value, k = (TH / TC) ** (1 / (G - 1));
    const V1 = 1, V2 = r, V3 = r * k, V4 = k;
    const QH = n * Rg * TH * Math.log(r), QC = n * Rg * TC * Math.log(r);
    return { TH, TC, r, V1, V2, V3, V4, QH, QC, W: QH - QC };
  }
  // 순환 위의 점: 단계 s(0~3)와 진행 f(0~1)
  function state(c, uu) {
    const s = Math.floor(uu) % 4, f = uu - Math.floor(uu);
    const lg = (a, b) => a * (b / a) ** f;
    let V, T;
    if (s === 0) { V = lg(c.V1, c.V2); T = c.TH; }
    else if (s === 1) { V = lg(c.V2, c.V3); T = c.TH * (c.V2 / V) ** (G - 1); }
    else if (s === 2) { V = lg(c.V3, c.V4); T = c.TC; }
    else { V = lg(c.V4, c.V1); T = c.TC * (c.V4 / V) ** (G - 1); }
    return { s, V, T, P: n * Rg * T / V };
  }

  function update() {
    const c = cyc();
    oH.textContent = c.TH; oC.textContent = c.TC; oR.textContent = c.r.toFixed(1);
    nQh.textContent = `${c.QH.toFixed(0)} J`; nW.textContent = `${c.W.toFixed(0)} J`; nQc.textContent = `${c.QC.toFixed(0)} J`;
    nEta.textContent = `${(c.W / c.QH * 100).toFixed(1)}%`;
    drawA(); drawB();
  }

  const A = fit(cvA, () => drawA());
  const B = fit(cvB, () => drawB());
  const LAB = ["뜨거운 쪽에서 열을 받으며 팽창", "단열 팽창 (온도가 내려감)", "차가운 쪽으로 열을 버리며 압축", "단열 압축 (온도가 올라감)"];

  function drawA() {
    const { ctx, size: { w, h } } = A; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const c = cyc(), st = state(c, u);
    const cw = w * 0.42, cx = w / 2, bot = h - 58, maxH = h - 110;
    const ph = 18 + (st.V / c.V3) * (maxH - 18), topY = bot - ph;
    // 열원 / 단열판
    const src = st.s === 0 ? [HOT, `뜨거운 열원 ${c.TH} K`] : st.s === 2 ? [COLD, `차가운 열원 ${c.TC} K`] : ["#9aa0a6", "단열판"];
    ctx.fillStyle = src[0]; ctx.fillRect(cx - cw / 2 - 10, bot + 2, cw + 20, 16);
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center"; ctx.fillStyle = C.ink2; ctx.fillText(src[1], cx, bot + 34);
    // 실린더, 기체, 피스톤
    const tf = (st.T - 250) / 650;
    ctx.fillStyle = `rgba(${Math.round(120 + 100 * tf)},${Math.round(150 - 60 * tf)},${Math.round(200 - 140 * tf)},.22)`;
    ctx.fillRect(cx - cw / 2, topY, cw, ph);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - cw / 2, 18); ctx.lineTo(cx - cw / 2, bot); ctx.lineTo(cx + cw / 2, bot); ctx.lineTo(cx + cw / 2, 18); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.fillRect(cx - cw / 2 + 2, topY - 10, cw - 4, 10);
    ctx.fillRect(cx - 3, 8, 6, topY - 18);
    // 기체 분자: 빠르기 ∝ √T
    if (!parts) parts = Array.from({ length: 26 }, () => [Math.random(), Math.random(), Math.random() * 6.28]);
    const sp = Math.sqrt(st.T / 300), tn = performance.now() / 1000;
    ctx.fillStyle = C.ink;
    parts.forEach(([a, b, p0]) => {
      const fx = (a + 0.13 * sp * tn * (0.6 + b)) % 1, fy = (b + 0.11 * sp * tn * (0.6 + a) + p0) % 1;
      const tx = Math.abs(fx * 2 - 1), ty = Math.abs(fy * 2 - 1);
      ctx.beginPath(); ctx.arc(cx - cw / 2 + 5 + tx * (cw - 10), topY + 4 + ty * (ph - 8), 2.2, 0, Math.PI * 2); ctx.fill();
    });
    // 열 화살표
    if (st.s === 0 || st.s === 2) {
      const up = st.s === 0, col = up ? HOT : COLD, x = cx + cw / 2 + 14;
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.5;
      const y0 = up ? bot + 8 : bot - 20, y1 = up ? bot - 20 : bot + 8;
      ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y1 + (up ? -4 : 4)); ctx.lineTo(x - 5, y1 + (up ? 4 : -4)); ctx.lineTo(x + 5, y1 + (up ? 4 : -4)); ctx.fill();
      ctx.textAlign = "left"; ctx.fillText(up ? "Q_H" : "Q_C", x + 7, bot - 4);
    }
    ctx.textAlign = "center"; ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`;
    ctx.fillText(`${st.s + 1}. ${LAB[st.s]}`, cx, h - 8);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText(`T = ${st.T.toFixed(0)} K`, 6, 14);
  }

  function drawB() {
    const { ctx, size: { w, h } } = B; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const c = cyc(), P1 = n * Rg * c.TH / c.V1;
    const x0 = 40, y0 = 22, pw = w - x0 - 10, ph = h - y0 - 34;
    const Vm = c.V3 * 1.05, Pm = P1 * 1.08;
    const X = (V) => x0 + V / Vm * pw, Y = (P) => y0 + (1 - P / Pm) * ph;
    const nice = (m) => { const s = m / 4, p = 10 ** Math.floor(Math.log10(s)); return [1, 2, 5, 10].map((k) => k * p).find((k) => k >= s); };
    const xs = nice(Vm), ys = nice(Pm), xt = [], yt = [];
    for (let v = 0; v <= Vm; v += xs) xt.push([v, `${v}`]);
    for (let p = 0; p <= Pm; p += ys) yt.push([p, `${p}`]);
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt, yt, ylabel: "압력 P (kPa)", xlabel: "부피 V (L)" });
    const path = () => { ctx.beginPath(); for (let k = 0; k <= 400; k++) { const q = state(c, Math.min(k / 100, 3.9999)); k ? ctx.lineTo(X(q.V), Y(q.P)) : ctx.moveTo(X(q.V), Y(q.P)); } ctx.closePath(); };
    path(); ctx.fillStyle = "rgba(116,171,102,.28)"; ctx.fill();
    [[0, HOT], [1, C.ink2], [2, COLD], [3, C.ink2]].forEach(([s, col]) => {
      ctx.beginPath();
      for (let k = 0; k <= 60; k++) { const q = state(c, s + Math.min(k / 60, 0.9999)); k ? ctx.lineTo(X(q.V), Y(q.P)) : ctx.moveTo(X(q.V), Y(q.P)); }
      ctx.strokeStyle = col; ctx.lineWidth = s % 2 ? 1.5 : 2.5; ctx.stroke();
    });
    const q = state(c, u);
    ctx.beginPath(); ctx.arc(X(q.V), Y(q.P), 5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    // 넓이 = 한 번 돌 때 하는 일
    const mid = state(c, 0.5), mid2 = state(c, 2.5);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.forest; ctx.textAlign = "center";
    ctx.fillText(`넓이 = W`, X((mid.V + mid2.V) / 2), Y((mid.P + mid2.P) / 2) + 4);
    ctx.textAlign = "left";
  }

  [sH, sC, sR].forEach((el) => el.addEventListener("input", () => {
    if (+sC.value >= +sH.value - 50) sC.value = +sH.value - 50;
    update();
  }));
  update();
  loop(cvA, (dt) => {
    if (NM.reduce) return;
    u = (u + dt * 0.32) % 4;
    drawA(); drawB();
  });
})();
