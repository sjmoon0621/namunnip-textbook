/* 카드: 다 쓴 전지는 왜 전압이 0이 될까? — 네른스트 식 E = E° − (RT/nF) ln Q, ln K = nFE°/RT */
(() => {
  const root = document.getElementById("card-adchem-nernst");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), s1 = $(".s1"), s2 = $(".s2"), sT = $(".t");
  const R = 8.314, FA = 96485, LN10 = Math.log(10);
  const CELL = {
    dan: { n: 2, E0: 1.104, eq: "Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)", l1: "[Zn²⁺] (M)", l2: "[Cu²⁺] (M)", rg: [-4, 0], v: [-1, 0],
      lq: (a, b) => a - b, x: [-10, 45] },
    conc: { n: 2, E0: 0, eq: "Cu²⁺(B 쪽) + Cu(A 쪽) → Cu²⁺(A 쪽) + Cu(B 쪽)", l1: "A 쪽 [Cu²⁺] (M)", l2: "B 쪽 [Cu²⁺] (M)", rg: [-4, 0], v: [-3, 0],
      lq: (a, b) => a - b, x: [-6, 6] },
    fuel: { n: 4, E0: 1.229, eq: "2H₂(g) + O₂(g) → 2H₂O(l)", l1: "P(H₂) (bar)", l2: "P(O₂) (bar)", rg: [-2, 1], v: [0, -0.68],
      lq: (a, b) => -(2 * a + b), x: [-10, 90] },
  };
  let c = "dan";
  const slope = (T) => R * T / (CELL[c].n * FA) * LN10; /* V per log10 Q */
  const pow = (x) => { const v = Math.pow(10, x); return v >= 0.01 ? v.toPrecision(2) : v.toExponential(1).replace("e-", "×10^−"); };
  const sgn = (x, d) => (x > 0 ? "+" : x < 0 ? "−" : "") + Math.abs(x).toFixed(d);

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const K = CELL[c], T = +sT.value + 273.15, lq = K.lq(+s1.value, +s2.value), E = K.E0 - slope(T) * lq;
    const [xa, xb] = K.x;
    const ends = [K.E0 - slope(353.15) * xa, K.E0 - slope(353.15) * xb, K.E0 - slope(273.15) * xa, K.E0 - slope(273.15) * xb];
    const ya = Math.min(...ends), yb = Math.max(...ends);
    const x0 = 48, x1 = w - 12, top = 18, bot = h - 34;
    const X = (q) => x0 + (q - xa) / (xb - xa) * (x1 - x0), Y = (e) => top + (yb - e) / (yb - ya) * (bot - top);
    ctx.fillStyle = "rgba(59,124,42,.07)"; ctx.fillRect(x0, top, x1 - x0, Y(0) - top);
    ctx.fillStyle = "rgba(181,83,47,.06)"; ctx.fillRect(x0, Y(0), x1 - x0, bot - Y(0));
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillStyle = C.forest; ctx.fillText("E > 0 : 정반응 자발 (Q < K)", x1 - 4, top + 13);
    ctx.fillStyle = C.warn; ctx.fillText("E < 0 : 역반응 자발 (Q > K)", x1 - 4, bot - 6);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, top); ctx.lineTo(x0, bot); ctx.moveTo(x0, Y(0)); ctx.lineTo(x1, Y(0)); ctx.stroke();
    /* 눈금 */
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    const stepX = (xb - xa) > 40 ? 20 : (xb - xa) > 20 ? 10 : 2;
    for (let q = Math.ceil(xa / stepX) * stepX; q <= xb; q += stepX) ctx.fillText(String(q).replace("-", "−"), X(q), bot + 13);
    ctx.textAlign = "right"; ctx.fillText("log Q", x1, bot + 27);
    const stepY = (yb - ya) > 2 ? 1 : (yb - ya) > 0.8 ? 0.5 : 0.1;
    for (let e = Math.ceil(ya / stepY) * stepY; e <= yb + 1e-9; e += stepY) ctx.fillText(sgn(Math.round(e * 10) / 10, 1), x0 - 4, Y(e) + 3);
    ctx.textAlign = "left"; ctx.fillText("E (V)", 4, 12);
    /* 25 °C 기준선과 지금 온도의 선 */
    if (Math.abs(T - 298.15) > 0.5) {
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(X(xa), Y(K.E0 - slope(298.15) * xa)); ctx.lineTo(X(xb), Y(K.E0 - slope(298.15) * xb)); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(X(xa), Y(K.E0 - slope(T) * xa)); ctx.lineTo(X(xb), Y(K.E0 - slope(T) * xb)); ctx.stroke();
    /* E° (log Q = 0) */
    if (xa < 0 && xb > 0 && K.E0 !== 0) {
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(0), Y(K.E0), 3, 0, Math.PI * 2); ctx.fill();
      ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`E° = ${K.E0.toFixed(3)}`, X(0) + 6, Y(K.E0) - 8);
    }
    /* 평형: E = 0 */
    const lK = K.E0 / slope(T);
    if (lK > xa && lK < xb) {
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(X(lK), top); ctx.lineTo(X(lK), bot); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink2; ctx.font = `600 10.5px ${F.sans}`; const rt = X(lK) > (x0 + x1) * 0.6;
      ctx.textAlign = rt ? "right" : "left"; ctx.fillText(`Q = K (평형, E = 0)`, X(lK) + (rt ? -5 : 5), Y(0) - 8);
    }
    /* 지금 상태 */
    const q = Math.max(xa, Math.min(xb, lq));
    ctx.fillStyle = E >= 0 ? C.forest : C.warn; ctx.beginPath(); ctx.arc(X(q), Y(K.E0 - slope(T) * q), 5.5, 0, Math.PI * 2); ctx.fill();
  }

  function setCell(k, keep) {
    c = k; const K = CELL[c];
    root.querySelectorAll("[data-c]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.c === c)));
    [s1, s2].forEach((s, i) => { s.min = K.rg[0]; s.max = K.rg[1]; if (!keep) s.value = K.v[i]; });
    $(".l1").textContent = K.l1; $(".l2").textContent = K.l2;
    update();
  }
  function update() {
    const K = CELL[c], T = +sT.value + 273.15, lq = K.lq(+s1.value, +s2.value), E = K.E0 - slope(T) * lq;
    $(".o1").textContent = pow(+s1.value); $(".o2").textContent = pow(+s2.value); $(".t-out").textContent = sT.value;
    let eq = `${K.eq}   n = ${K.n}`;
    if (c === "conc") eq += Math.abs(E) < 1e-4 ? "   두 극의 전위가 같음" : E > 0 ? "   (+)극: B 쪽" : "   (+)극: A 쪽";
    $(".eq").textContent = eq;
    $(".n-q").textContent = sgn(lq, 2);
    const e = $(".n-e"); e.textContent = sgn(E, 3); e.className = "n-e " + (E > 0 ? "good" : E < 0 ? "bad" : "");
    $(".n-g").textContent = sgn(-K.n * FA * E / 1000, 1);
    const lK = K.E0 / slope(T);
    $(".n-k").textContent = lK === 0 ? "1" : `10^${lK.toFixed(1)}`;
    draw();
  }
  root.querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => setCell(b.dataset.c)));
  [s1, s2, sT].forEach((s) => s.addEventListener("input", update));
  setCell("dan");
  if (/demo/.test(location.search)) { s1.value = 0; s2.value = -4; update(); }
})();
