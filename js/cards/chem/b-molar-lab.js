/* 카드: 정확히 0.100 M 용액을 만들려면? — 황산 구리(Ⅱ) 수용액 만들기 가상 실험 */
(() => {
  const root = document.getElementById("card-chem-molar-lab");
  if (!root) return;
  const { C, F, clamp, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sM = $(".mass"), oM = $(".mass-out"), rinse = $(".rinse"), fill = $(".fill");
  const dN = $(".n"), dV = $(".v"), dC = $(".c"), dE = $(".err"), msg = $(".msg");
  const MW = { hyd: 249.69, anh: 159.61 };
  let reagent = "hyd", flask = 250;
  const TARGET = 0.100;

  function state() {
    const m = +sM.value, M = MW[reagent];
    const n = m / M * (rinse.checked ? 1 : 0.97);        // 헹구지 않으면 약 3% 남는다고 가정 (모식)
    let V = flask, exact = true;
    if (fill.value === "over") V = flask + 3;
    if (fill.value === "water") { V = flask; exact = false; }   // 물 V mL + 용질 → 용액 부피는 V보다 조금 큼
    return { m, n, V, C: n / (V / 1000), exact };
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = state();
    // ── 전자저울
    const bx = w * 0.05, bw = w * 0.34, by = h * 0.62;
    ctx.fillStyle = "#e8e9e3"; ctx.fillRect(bx, by, bw, h * 0.2);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.strokeRect(bx + .5, by + .5, bw, h * 0.2);
    ctx.fillStyle = C.night; ctx.fillRect(bx + bw * 0.2, by + h * 0.05, bw * 0.6, h * 0.1);
    ctx.fillStyle = "#b5d7ac"; ctx.font = `500 ${Math.round(h * 0.07)}px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(`${s.m.toFixed(2)} g`, bx + bw / 2, by + h * 0.125);
    ctx.fillStyle = "#cfd0c8"; ctx.fillRect(bx + bw * 0.15, by - 6, bw * 0.7, 6);
    // 가루 더미
    const pile = clamp(s.m / 12, 0, 1) * h * 0.14;
    ctx.fillStyle = reagent === "hyd" ? "#3d7fc4" : "#e9ece6";
    ctx.beginPath(); ctx.moveTo(bx + bw / 2 - pile * 1.4, by - 6); ctx.quadraticCurveTo(bx + bw / 2, by - 6 - pile * 1.6, bx + bw / 2 + pile * 1.4, by - 6); ctx.fill();
    if (reagent === "anh") { ctx.strokeStyle = C.ink3; ctx.lineWidth = .8; ctx.stroke(); }
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2;
    ctx.fillText(reagent === "hyd" ? "CuSO₄·5H₂O (파란 결정)" : "무수 CuSO₄ (흰 가루)", bx + bw / 2, by + h * 0.26);

    // ── 부피 플라스크
    const fx = w * 0.68, neckW = w * 0.035, bulbR = Math.min(w * 0.13, h * 0.26), baseY = h * 0.9, bulbY = baseY - bulbR;
    const neckTop = h * 0.08, mark = h * 0.26;
    // 용액 색: Cu²⁺ 농도에 비례 (모식)
    const a = clamp(s.C / 0.2, 0, 1) * 0.75 + 0.05;
    const level = fill.value === "over" ? mark - h * 0.05 : mark;
    ctx.save();
    ctx.beginPath(); ctx.arc(fx, bulbY, bulbR, 0, Math.PI * 2); ctx.rect(fx - neckW / 2, neckTop, neckW, bulbY - neckTop); ctx.clip();
    ctx.fillStyle = `rgba(40,120,200,${a})`; ctx.fillRect(fx - bulbR, level, bulbR * 2, baseY - level);
    ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    const ang = Math.asin(neckW / 2 / bulbR);
    ctx.beginPath(); ctx.moveTo(fx - neckW / 2, neckTop); ctx.lineTo(fx - neckW / 2, bulbY - bulbR * Math.cos(ang));
    ctx.arc(fx, bulbY, bulbR, -Math.PI / 2 - ang, -Math.PI / 2 + ang, true);
    ctx.lineTo(fx + neckW / 2, neckTop); ctx.stroke();
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(fx - neckW, mark + .5); ctx.lineTo(fx + neckW, mark + .5); ctx.stroke();
    ctx.fillStyle = C.warn; ctx.textAlign = "left"; ctx.fillText("눈금선", fx + neckW + 4, mark + 4);
    ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText(fill.value === "water" ? `비커에 물 ${flask} mL + 용질` : `${flask} mL 부피 플라스크`, fx, baseY + 16);
    // 화살표
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx + bw + 10, h * 0.55); ctx.lineTo(fx - bulbR - 12, h * 0.55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(fx - bulbR - 12, h * 0.55); ctx.lineTo(fx - bulbR - 19, h * 0.55 - 4); ctx.lineTo(fx - bulbR - 19, h * 0.55 + 4); ctx.closePath(); ctx.fillStyle = C.ink3; ctx.fill();
    ctx.fillText("녹이고 옮기기", (bx + bw + fx - bulbR) / 2, h * 0.55 - 8);
  }

  function update() {
    const s = state();
    oM.textContent = s.m.toFixed(2);
    dN.textContent = `${(s.n * 1000).toFixed(2)} mmol`;
    dV.textContent = s.exact ? `${s.V.toFixed(1)} mL` : `${flask} mL보다 조금 큼`;
    dC.textContent = s.exact ? `${s.C.toFixed(4)} M` : `${s.C.toFixed(4)} M 미만`;
    const e = (s.C / TARGET - 1) * 100;
    dE.textContent = s.exact ? `${e >= 0 ? "+" : ""}${e.toFixed(1)} %` : "알 수 없음";
    dE.className = "err " + (s.exact && Math.abs(e) < 0.5 ? "good" : "bad");
    const tips = [];
    if (reagent === "anh" && Math.abs(s.m - 0.1 * flask / 1000 * MW.hyd) < 0.05) tips.push("오수화물의 질량을 무수물 병에서 달았습니다. 결정수 5H₂O가 없으니 몰수가 훨씬 많아집니다.");
    if (reagent === "hyd" && Math.abs(s.m - 0.1 * flask / 1000 * MW.anh) < 0.05) tips.push("무수물의 몰질량(159.6)으로 계산한 질량입니다. 오수화물은 결정수까지 포함해 249.7 g/mol입니다.");
    if (!rinse.checked) tips.push("비커와 유리 막대에 남은 용액을 헹궈 넣지 않으면 그만큼 용질을 잃습니다.");
    if (fill.value === "over") tips.push("눈금선을 넘기면 부피가 커져 농도가 낮아집니다. 물을 다시 빼내도 용질이 함께 빠져 되돌릴 수 없습니다.");
    if (fill.value === "water") tips.push(`물 ${flask} mL에 녹이면 ‘용액’ ${flask} mL가 아닙니다. 용질이 녹으며 부피가 변하므로 정확한 용액 부피를 알 수 없습니다.`);
    msg.textContent = tips.length ? tips.join(" ") : Math.abs(e) < 0.5 ? "목표한 0.100 M 용액이 만들어졌습니다." : `목표는 0.100 M입니다. 이 병의 용질로 ${flask} mL를 만들려면 몇 g이 필요한지 계산해 보세요.`;
    draw();
  }
  sM.addEventListener("input", update); rinse.addEventListener("change", update); fill.addEventListener("change", update);
  root.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => { reagent = b.dataset.r; root.querySelectorAll("[data-r]").forEach((x) => x.setAttribute("aria-pressed", x === b)); update(); }));
  root.querySelectorAll("[data-f]").forEach((b) => b.addEventListener("click", () => {
    flask = +b.dataset.f; root.querySelectorAll("[data-f]").forEach((x) => x.setAttribute("aria-pressed", x === b));
    fill.querySelector("[value=water]").textContent = `플라스크 대신 물 ${flask} mL에 녹인다`; update();
  }));
  update();
})();
