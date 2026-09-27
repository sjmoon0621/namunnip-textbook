/* 카드: 와인은 어떻게 식초가 되고, 식초는 어떻게 과일 향이 될까? — C₂ 화합물 반응 지도 */
(() => {
  const root = document.getElementById("card-rxn-reaction-map");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), nQ = $(".n-q"), nK = $(".n-k"), nG = $(".n-g"), note = $(".n-note");
  // 노드: [이름, 식, 작용기, x, y]
  const N = {
    ene: ["에텐 (알켄)", "CH₂=CH₂", "C=C", 0.15, 0.16],
    cl: ["클로로에테인", "CH₃CH₂Cl", "−Cl", 0.15, 0.84],
    oh: ["에탄올 (알코올)", "CH₃CH₂OH", "−OH", 0.5, 0.16],
    cho: ["아세트알데하이드", "CH₃CHO", "−CHO", 0.85, 0.16],
    cooh: ["아세트산 (카복실산)", "CH₃COOH", "−COOH", 0.85, 0.5],
    est: ["아세트산 에틸 (에스터)", "CH₃COOCH₂CH₃", "−COO−", 0.55, 0.84],
  };
  // 반응: [출발, 도착, 식, 종류·조건, 작용기 변화, 설명]
  const E = {
    hyd: ["ene", "oh", "CH₂=CH₂ + H₂O → CH₃CH₂OH", "첨가 반응 · 인산 촉매, 고온·고압", "C=C → −OH", "이중 결합이 끊어지며 H와 OH가 붙습니다. 공업용 에탄올을 만드는 방법입니다."],
    ox1: ["oh", "cho", "CH₃CH₂OH → CH₃CHO + 2H⁺ + 2e⁻ (예: 산화 구리(II)와 가열)", "산화 · 산화제 또는 효소(알코올 탈수소 효소)", "−OH → −CHO", "탄소에 붙은 H를 잃습니다(산화). 몸속에서는 간이 이 반응을 합니다."],
    ox2: ["cho", "cooh", "2CH₃CHO + O₂ → 2CH₃COOH", "산화 · 아세트산균, 촉매", "−CHO → −COOH", "알데하이드는 쉽게 산화되므로 은거울 반응, 펠링 반응으로 확인합니다."],
    est: ["cooh", "est", "CH₃COOH + CH₃CH₂OH ⇌ CH₃COOCH₂CH₃ + H₂O", "에스터화 (축합) · 진한 황산, 가열", "−COOH + −OH → −COO− (+ H₂O)", "물 한 분자가 빠지며 두 분자가 이어집니다. 가역 반응입니다."],
    hydro: ["est", "cooh", "CH₃COOCH₂CH₃ + H₂O → CH₃COOH + CH₃CH₂OH", "가수 분해 · 산 또는 염기(NaOH), 가열", "−COO− → −COOH + −OH", "염기로 가수 분해하면 카복실산 염이 생기며, 기름을 이렇게 가수 분해하면 비누가 됩니다."],
    hcl: ["ene", "cl", "CH₂=CH₂ + HCl → CH₃CH₂Cl", "첨가 반응", "C=C → −Cl", "알켄의 이중 결합에 HCl이 붙습니다."],
    dehy: ["oh", "ene", "CH₃CH₂OH → CH₂=CH₂ + H₂O", "탈수 (제거 반응) · 진한 황산, 약 170 °C", "−OH → C=C", "수화 반응의 반대입니다. 물이 빠지며 이중 결합이 생깁니다."],
  };
  let e = "ox1";
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const P = (k) => [N[k][3] * w, N[k][4] * h];
    // 반응 화살표 (에스터화는 아세트산·에탄올 두 곳에서)
    Object.entries(E).forEach(([k, [a, b]]) => {
      const sel = k === e, [x1, y1] = P(a), [x2, y2] = P(b), off = (k === "dehy" || k === "hydro") ? 10 : (k === "hyd" || k === "est") ? -10 : 0, L = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / L * off, ny = (x2 - x1) / L * off, ux = (x2 - x1) / L, uy = (y2 - y1) / L;
      const cut = (u, v) => Math.min(Math.abs(56 / (u || 1e-9)), Math.abs(26 / (v || 1e-9))), d1 = cut(ux, uy), sx = x1 + ux * d1 + nx, sy = y1 + uy * d1 + ny, ex = x2 - ux * d1 + nx, ey = y2 - uy * d1 + ny;
      ctx.strokeStyle = sel ? C.warn : "rgba(141,141,146,.55)"; ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = sel ? 3 : 1.4; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      const a2 = Math.atan2(ey - sy, ex - sx); ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 9 * Math.cos(a2 - 0.4), ey - 9 * Math.sin(a2 - 0.4)); ctx.lineTo(ex - 9 * Math.cos(a2 + 0.4), ey - 9 * Math.sin(a2 + 0.4)); ctx.fill();
      if (k === "est") { const [ox, oy] = P("oh"); ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(ox + 10, oy + 20); ctx.lineTo((x1 + x2) / 2 + nx, (y1 + y2) / 2 + ny); ctx.stroke(); ctx.setLineDash([]); }
    });
    Object.entries(N).forEach(([k, [name, f, g]]) => {
      const [x, y] = P(k), inv = E[e][0] === k || E[e][1] === k || (e === "est" && k === "oh") || (e === "hydro" && k === "oh");
      ctx.fillStyle = inv ? "#fff5e6" : "#fff"; ctx.strokeStyle = inv ? C.warn : C.rule; ctx.lineWidth = inv ? 2 : 1; ctx.beginPath(); ctx.roundRect(x - 54, y - 22, 108, 44, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(f, x, y - 3); ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.fillText(name, x, y + 13);
    });
  }
  function update() {
    root.querySelectorAll("[data-e]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.e === e)));
    const [, , q, k, g, t] = E[e]; nQ.textContent = q; nK.textContent = k; nG.textContent = g; note.textContent = t; draw();
  }
  root.querySelectorAll("[data-e]").forEach((b) => b.addEventListener("click", () => { e = b.dataset.e; update(); }));
  update();
})();
