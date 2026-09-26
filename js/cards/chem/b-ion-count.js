/* 카드: 산과 염기를 섞을 때 이온 수는 어떻게 변할까? — 이온 수 그래프와 전기 전도도 */
(() => {
  const root = document.getElementById("card-chem-ion-count");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sV = $(".vb"), oV = $(".vb-out"), oB = $(".base-name");
  const dW = $(".water"), dT = $(".total"), dS = $(".side"), msg = $(".msg");
  // 25 °C 무한 희석 몰 전도율 (S·cm²/mol, 이온 1 mol 기준)
  const LAM = { H: 349.8, OH: 198.6, Na: 50.1, Cl: 76.3, SO4: 160.0, Ba: 127.2 };
  const ION = {
    H: ["H⁺", C.apple], OH: ["OH⁻", "#3d6fb6"], Na: ["Na⁺", "#8a5fb0"], Cl: ["Cl⁻", C.forest], SO4: ["SO₄²⁻", "#c98a1b"], Ba: ["Ba²⁺", "#3a9a9a"],
  };
  const PAIRS = {
    hcl: { acid: "0.10 M HCl", base: "0.10 M NaOH", f: (V) => ({ H: Math.max(0, 2 - .1 * V), OH: Math.max(0, .1 * V - 2), Na: .1 * V, Cl: 2 }), water: (V) => Math.min(2, .1 * V) },
    h2so4: { acid: "0.050 M H₂SO₄", base: "0.10 M NaOH", f: (V) => ({ H: Math.max(0, 2 - .1 * V), OH: Math.max(0, .1 * V - 2), Na: .1 * V, SO4: 1 }), water: (V) => Math.min(2, .1 * V) },
    ba: { acid: "0.050 M H₂SO₄", base: "0.050 M Ba(OH)₂", f: (V) => ({ H: Math.max(0, 2 - .1 * V), OH: Math.max(0, .1 * V - 2), Ba: Math.max(0, .05 * V - 1), SO4: Math.max(0, 1 - .05 * V) }), water: (V) => Math.min(2, .1 * V), ppt: (V) => Math.min(1, .05 * V) },
  };
  let pair = "hcl";
  const kappa = (V) => { const n = PAIRS[pair].f(V); let s = 0; for (const k in n) s += n[k] * LAM[k]; return s / (20 + V); };

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const P = PAIRS[pair], V = +sV.value, n = P.f(V);
    const split = Math.round(w * 0.36);
    // ── 비커: 점 하나 = 0.1 mmol
    const bx = 10, bw = split - 22, by = 30, bh = h - 64;
    const lvl = by + bh * (1 - 0.45 - 0.45 * V / 40);
    ctx.fillStyle = "rgba(90,150,210,.10)"; ctx.fillRect(bx, lvl, bw, by + bh - lvl);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
    let seed = 9; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const ppt = P.ppt ? P.ppt(V) : 0;
    ctx.fillStyle = "#e6e6e0"; ctx.strokeStyle = C.ink3; ctx.lineWidth = .6;
    const perRow = Math.floor((bw - 8) / 7);
    for (let i = 0; i < Math.round(ppt * 10); i++) { const x = bx + 4 + (i % perRow) * 7, y = by + bh - 8 - Math.floor(i / perRow) * 7; ctx.fillRect(x, y, 6, 6); ctx.strokeRect(x + .3, y + .3, 5.4, 5.4); }
    const top = lvl + 6, bot = by + bh - 10 - Math.ceil(Math.round(ppt * 10) / perRow) * 7;
    for (const k in n) {
      const cnt = Math.round(n[k] * 10);
      ctx.fillStyle = ION[k][1];
      for (let i = 0; i < cnt; i++) { ctx.beginPath(); ctx.arc(bx + 6 + r() * (bw - 12), top + r() * Math.max(4, bot - top), 3, 0, 7); ctx.fill(); }
    }
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink3;
    ctx.fillText("점 1개 = 0.1 mmol", bx, by - 10);
    if (ppt > 0) { ctx.fillStyle = C.ink2; ctx.fillText("□ BaSO₄ 앙금", bx, h - 16); }
    ctx.fillStyle = C.ink3; ctx.fillText("물 분자는 그리지 않음", bx, h - 3);

    // ── 그래프: 위 = 이온 수, 아래 = 전류 세기(상대)
    const x0 = split + 36, pw = w - x0 - 64, gy1 = 22, gh1 = (h - 70) * 0.62, gy2 = gy1 + gh1 + 30, gh2 = h - gy2 - 26;
    const X = (v) => x0 + v / 40 * pw, Y1 = (m) => gy1 + (1 - m / 4) * gh1;
    NM.axes(ctx, { x0, y0: gy1, w: pw, h: gh1, X, Y: Y1, xt: [], yt: [0, 1, 2, 3, 4].map((v) => [v, `${v}`]), ylabel: "이온 수 (mmol)" });
    const keys = Object.keys(P.f(0)).concat(Object.keys(P.f(40))).filter((k, i, a) => a.indexOf(k) === i);
    const labs = [];
    keys.forEach((k) => {
      ctx.beginPath(); for (let v = 0; v <= 40; v += 0.25) { const y = Y1(P.f(v)[k] || 0); v ? ctx.lineTo(X(v), y) : ctx.moveTo(X(v), y); }
      ctx.strokeStyle = ION[k][1]; ctx.lineWidth = 2; ctx.stroke();
      labs.push({ k, y: Y1(P.f(40)[k] || 0) + 4 });
    });
    labs.sort((a, b) => a.y - b.y);
    for (let i = 1; i < labs.length; i++) labs[i].y = Math.max(labs[i].y, labs[i - 1].y + 12);
    labs.forEach(({ k, y }) => { ctx.fillStyle = ION[k][1]; ctx.textAlign = "left"; ctx.fillText(ION[k][0], x0 + pw + 6, y); });
    const km = Math.max(...Array.from({ length: 81 }, (_, i) => kappa(i / 2))) * 1.08;
    const Y2 = (q) => gy2 + (1 - q / km) * gh2;
    NM.axes(ctx, { x0, y0: gy2, w: pw, h: gh2, X, Y: Y2, xt: [0, 10, 20, 30, 40].map((v) => [v, `${v}`]), yt: [], ylabel: "전류의 세기 (상대값)", xlabel: `넣은 ${P.base} (mL)` });
    ctx.beginPath(); for (let v = 0; v <= 40; v += 0.25) { const y = Y2(kappa(v)); v ? ctx.lineTo(X(v), y) : ctx.moveTo(X(v), y); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
    // 현재 위치, 중화점
    ctx.setLineDash([3, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(20) + .5, gy1); ctx.lineTo(X(20) + .5, gy2 + gh2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.fillText("중화점", X(20), gy1 - 8);
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(X(V) + .5, gy1); ctx.lineTo(X(V) + .5, gy2 + gh2); ctx.stroke();
    ctx.beginPath(); ctx.arc(X(V), Y2(kappa(V)), 4, 0, 7); ctx.fillStyle = C.ink; ctx.fill();
    ctx.textAlign = "left";
  }

  function update() {
    const P = PAIRS[pair], V = +sV.value, n = P.f(V);
    oV.textContent = V.toFixed(1); oB.textContent = P.base;
    dW.textContent = `${P.water(V).toFixed(2)} mmol`;
    dT.textContent = `${Object.values(n).reduce((a, b) => a + b, 0).toFixed(2)} mmol`;
    dS.textContent = n.H > 1e-9 ? "산성" : n.OH > 1e-9 ? "염기성" : "중성 (중화점)";
    msg.textContent = pair === "ba" ? (V < 20 ? "H⁺는 OH⁻와 만나 물이 되고, SO₄²⁻는 Ba²⁺와 만나 앙금이 됩니다. 이온이 두 쌍씩 사라지니 전류가 빠르게 약해집니다." : V === 20 ? "중화점: 용액 속 이온이 거의 없어 전류가 거의 흐르지 않습니다." : "넣는 Ba²⁺와 OH⁻가 그대로 남아 이온 수와 전류가 다시 늘어납니다.")
      : V < 20 ? "넣은 OH⁻는 곧바로 H⁺와 물이 되고, 그 자리를 Na⁺가 채웁니다. 전체 이온 수는 그대로지만, 잘 움직이는 H⁺가 Na⁺로 바뀌어 전류는 약해집니다."
      : V === 20 ? "중화점: H⁺도 OH⁻도 거의 없습니다. 남은 것은 구경꾼 이온뿐입니다."
      : "중화점을 지나면 넣은 Na⁺와 OH⁻가 모두 남아 이온 수가 늘어납니다.";
    draw();
  }
  sV.addEventListener("input", update);
  root.querySelectorAll("[data-pair]").forEach((b) => b.addEventListener("click", () => {
    pair = b.dataset.pair; root.querySelectorAll("[data-pair]").forEach((x) => x.setAttribute("aria-pressed", x === b)); update();
  }));
  update();
})();
