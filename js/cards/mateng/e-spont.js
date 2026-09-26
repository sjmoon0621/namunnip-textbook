/* 카드: 열을 흡수하는 변화도 저절로 일어날 수 있을까? — ΔH·ΔS 부호 네 칸과 온도 (깁스 에너지 없이 정성적으로) */
(() => {
  const root = document.getElementById("card-mateng-spont");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), oT = $(".t-out"), msg = $(".sp-msg");
  // [이름, ΔH 부호, ΔS 부호, 기준 온도(°C) — 이 온도보다 높으면(+,+) / 낮으면(−,−) 저절로, 설명, 칸 안 위치(0~1)]
  const ITEMS = [
    ["얼음이 녹음", 1, 1, 0, "0 °C보다 높으면 저절로 녹습니다. 녹으면서 열을 흡수하지만(ΔH > 0) 분자가 자유로워집니다(ΔS > 0).", [0.3, 0.3]],
    ["물이 끓음", 1, 1, 100, "1기압에서 100 °C보다 높으면 저절로 끓습니다. 기체가 되면 엔트로피가 크게 늘어납니다.", [0.7, 0.55]],
    ["석회석 분해", 1, 1, 840, "CaCO₃ → CaO + CO₂. 기체가 생겨 ΔS > 0이지만 흡열이 커서 약 840 °C 이상에서 잘 일어납니다.", [0.55, 0.8]],
    ["질산 암모늄 용해", 1, 1, -60, "흡열이지만 이온이 흩어져 엔트로피가 크게 늘어, 실온에서 저절로 녹습니다(냉찜질 팩).", [0.8, 0.25]],
    ["물이 얼음", -1, -1, 0, "0 °C보다 낮으면 저절로 업니다. 열을 내놓지만(ΔH < 0) 분자가 묶입니다(ΔS < 0).", [0.3, 0.3]],
    ["수증기 응결", -1, -1, 100, "1기압에서 100 °C보다 낮으면 저절로 응결합니다.", [0.7, 0.55]],
    ["암모니아 합성", -1, -1, 460, "N₂ + 3H₂ → 2NH₃. 발열이지만 기체 분자 수가 줄어 ΔS < 0이라, 낮은 온도일수록 유리합니다(약 460 °C 아래).", [0.5, 0.8]],
    ["과산화 수소 분해", -1, 1, null, "2H₂O₂ → 2H₂O + O₂. 발열이고 기체가 생겨 두 조건이 모두 유리하므로 어느 온도에서나 저절로 일어나는 방향입니다(다만 촉매가 없으면 느림).", [0.5, 0.5]],
    ["광합성", 1, -1, null, "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. 흡열이고 작은 분자들이 큰 분자로 모여 두 조건이 모두 불리합니다. 빛 에너지를 넣어 줘야 일어납니다.", [0.5, 0.5]],
  ];
  let sel = null;
  const spont = (it, T) => it[1] < 0 && it[2] > 0 ? true : it[1] > 0 && it[2] < 0 ? false : it[1] > 0 ? T > it[3] : T < it[3];
  const layout = () => { const { w, h } = size, m = 36, g = (w - m - 10) / 2, gh = (h - m - 10) / 2; return { m, g, gh }; };
  const pos = (it) => { const { m, g, gh } = layout(); const col = it[1] < 0 ? 0 : 1, row = it[2] > 0 ? 0 : 1; return [m + col * g + it[5][0] * g, 10 + row * gh + it[5][1] * gh]; };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const T = +sT.value, { m, g, gh } = layout();
    const cells = [[0, 0, "항상 저절로", "rgba(59,124,42,.12)"], [1, 0, "높은 온도에서 저절로", "rgba(224,160,42,.12)"], [0, 1, "낮은 온도에서 저절로", "rgba(63,111,163,.12)"], [1, 1, "저절로 일어나지 않음", "rgba(141,141,146,.14)"]];
    cells.forEach(([c, r, lab, col]) => { ctx.fillStyle = col; ctx.fillRect(m + c * g, 10 + r * gh, g - 2, gh - 2); ctx.fillStyle = C.ink2; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(lab, m + c * g + 6, 10 + r * gh + 16); });
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText("ΔH < 0 (발열)", m + g / 2, h - 6); ctx.fillText("ΔH > 0 (흡열)", m + g * 1.5, h - 6);
    ctx.save(); ctx.translate(14, 10 + gh / 2); ctx.rotate(-Math.PI / 2); ctx.fillText("ΔS > 0", 0, 0); ctx.restore();
    ctx.save(); ctx.translate(14, 10 + gh * 1.5); ctx.rotate(-Math.PI / 2); ctx.fillText("ΔS < 0", 0, 0); ctx.restore();
    ITEMS.forEach((it) => {
      const [x, y] = pos(it), ok = spont(it, T);
      ctx.fillStyle = ok ? "#3b7c2a" : "#a3a3a8"; ctx.beginPath(); ctx.arc(x, y, it === sel ? 8 : 6, 0, Math.PI * 2); ctx.fill();
      if (it === sel) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke(); }
      ctx.fillStyle = C.ink; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(it[0], x, y - 11);
    });
  }
  function update() {
    oT.textContent = sT.value.replace("-", "−");
    msg.textContent = sel ? `${sel[0]}: ${sel[4]} 지금 ${sT.value.replace("-", "−")} °C에서는 ${spont(sel, +sT.value) ? "저절로 일어납니다." : "저절로 일어나지 않습니다."}` : "점을 눌러 보세요.";
    draw();
  }
  cv.addEventListener("click", (e) => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    let best = null, bd = 400; ITEMS.forEach((it) => { const [px, py] = pos(it), d = (px - x) ** 2 + (py - y) ** 2; if (d < bd) { bd = d; best = it; } });
    sel = best; update();
  });
  sT.addEventListener("input", update);
  sel = ITEMS[0]; update();
})();
