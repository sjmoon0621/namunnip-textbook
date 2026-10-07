/* 카드: 전압을 얼마나 걸어야 전기 분해가 시작되고, 전기는 얼마나 들까? — 이론 분해 전압·과전압(모식)·패러데이 법칙 */
(() => {
  const root = document.getElementById("card-adchem-elec-v");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sV = $(".v"), sT = $(".t");
  const FA = 96485, VM = 24.79, RCELL = 1.0; /* 셀 저항 1 Ω: 모식 */
  /* Emin: 이론 분해 전압(V), eta: 과전압 합(V, 대략값 — 모식)
     cat/an: [이름, 반응식, 전자 1 mol당 생성물 mol, 몰질량(g/mol) 또는 0(기체), 부호(+1 생성, −1 소모)] */
  const CELL = {
    water: { Emin: 1.23, eta: 0.6, cat: ["H₂", "2H₂O + 2e⁻ → H₂ + 2OH⁻", 1 / 2, 0, 1], an: ["O₂", "2H₂O → O₂ + 4H⁺ + 4e⁻", 1 / 4, 0, 1] },
    nacl: { Emin: 2.19, eta: 0.5, cat: ["H₂", "2H₂O + 2e⁻ → H₂ + 2OH⁻", 1 / 2, 0, 1], an: ["Cl₂", "2Cl⁻ → Cl₂ + 2e⁻", 1 / 2, 0, 1] },
    cupt: { Emin: 0.89, eta: 0.6, cat: ["Cu", "Cu²⁺ + 2e⁻ → Cu", 1 / 2, 63.55, 1], an: ["O₂", "2H₂O → O₂ + 4H⁺ + 4e⁻", 1 / 4, 0, 1] },
    cucu: { Emin: 0, eta: 0.15, cat: ["Cu", "Cu²⁺ + 2e⁻ → Cu", 1 / 2, 63.55, 1], an: ["Cu", "Cu → Cu²⁺ + 2e⁻ (전극이 녹음)", 1 / 2, 63.55, -1] },
  };
  let c = "water";
  const cur = (V) => Math.max(0, (V - CELL[c].Emin - CELL[c].eta) / RCELL);
  const amount = (p, ne) => {
    const mol = ne * p[2];
    return { mol, txt: p[3] ? `${(mol * p[3]).toFixed(2)} g` : `${(mol * VM * 1000).toFixed(0)} mL` };
  };

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const K = CELL[c], V = +sV.value, I = cur(V), ne = I * +sT.value * 60 / FA;
    /* 왼쪽: I–V */
    const x0 = 40, x1 = w * 0.56, top = 20, bot = h - 30, IMAX = 5;
    const X = (v) => x0 + v / 5 * (x1 - x0), Y = (i) => bot - i / IMAX * (bot - top);
    ctx.fillStyle = "rgba(224,160,42,.16)"; ctx.fillRect(X(K.Emin), top, X(K.Emin + K.eta) - X(K.Emin), bot - top);
    NM.axes(ctx, { x0, y0: top, w: x1 - x0, h: bot - top, X, Y, xt: [[0, "0"], [1, "1"], [2, "2"], [3, "3"], [4, "4"], [5, "5"]],
      yt: [[0, "0"], [2, "2"], [4, "4"]], xlabel: "V (V)", ylabel: "I (A)" });
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(X(K.Emin), top); ctx.lineTo(X(K.Emin), bot); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(`이론 ${K.Emin.toFixed(2)} V`, X(K.Emin) + 4, top + 12);
    ctx.fillStyle = "#a07514"; ctx.fillText("과전압", X(K.Emin) + 4, top + 26);
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2.4; ctx.beginPath();
    for (let v = 0; v <= 5.0001; v += 0.02) { const y = Y(Math.min(cur(v), IMAX)); v ? ctx.lineTo(X(v), y) : ctx.moveTo(X(v), y); }
    ctx.stroke();
    ctx.fillStyle = I > 0 ? C.forest : C.ink3; ctx.beginPath(); ctx.arc(X(V), Y(Math.min(I, IMAX)), 5, 0, Math.PI * 2); ctx.fill();
    /* 오른쪽: 생성물 막대 */
    const rx0 = w * 0.64, rx1 = w - 10, bw = (rx1 - rx0) / 2 - 14;
    const ref = 0.08; /* 막대 눈금 고정: 80 mmol에서 가득 참 */
    const rows = [[K.cat, "(−)극 · 환원", "#3f6fa3"], [K.an, "(+)극 · 산화", C.warn]];
    rows.forEach(([p, lab, col], i) => {
      const bx = rx0 + i * (bw + 28), a = amount(p, ne), hh = Math.min(a.mol / ref, 1) * (bot - top - 30);
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(bx, top + 30, bw, bot - top - 30);
      ctx.fillStyle = col; ctx.globalAlpha = p[4] < 0 ? 0.35 : 0.85;
      ctx.fillRect(bx + 1, bot - hh, bw - 2, hh); ctx.globalAlpha = 1;
      ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(lab, bx + bw / 2, bot + 14);
      ctx.font = `600 11.5px ${F.mono}`;
      ctx.fillText(`${p[0]} ${p[4] < 0 ? "−" : ""}${(a.mol * 1000).toFixed(1)} mmol`, bx + bw / 2, top + 6);
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2;
      ctx.fillText(p[4] < 0 ? `${a.txt} 녹음` : a.txt, bx + bw / 2, top + 21);
    });
  }

  function update() {
    root.querySelectorAll("[data-c]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.c === c)));
    const K = CELL[c], V = +sV.value, t = +sT.value, I = cur(V), Q = I * t * 60, ne = Q / FA;
    $(".v-out").textContent = V.toFixed(2); $(".t-out").textContent = t;
    $(".eq").innerHTML = `<b>(−)극</b> ${K.cat[1]}<br><b>(+)극</b> ${K.an[1]}`;
    $(".n-i").textContent = I.toFixed(2) + " A";
    $(".n-q").textContent = Q.toFixed(0) + " C";
    $(".n-n").textContent = (ne * 1000).toFixed(1) + " mmol";
    const f = $(".n-f");
    f.textContent = I > 0 ? (K.Emin > 0 ? (K.Emin / V * 100).toFixed(0) + " %" : "이론 최소 0") : "반응 없음";
    draw();
  }
  root.querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => { c = b.dataset.c; update(); }));
  sV.addEventListener("input", update); sT.addEventListener("input", update);
  if (/demo/.test(location.search)) { c = "cupt"; sV.value = 2.5; }
  update();
})();
