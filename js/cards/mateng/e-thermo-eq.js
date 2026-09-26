/* 카드: 반응식을 두 배로 하면 ΔH는 어떻게 될까? — 열화학 반응식의 계수·방향·상태와 ΔH, 에너지 도표 */
(() => {
  const root = document.getElementById("card-mateng-thermo-eq");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), eq = $(".eq"), nDh = $(".n-dh"), nKind = $(".n-kind"), nG = $(".n-g"), rev = $(".rev");
  // [계수, 화학식], ΔH (kJ), 첫째 반응물의 몰 질량
  const RX = {
    ch4: { L: [[1, "CH₄(g)"], [2, "O₂(g)"]], R: [[1, "CO₂(g)"], [2, "H₂O(l)"]], dh: -890.3, M: 16.04 },
    h2l: { L: [[2, "H₂(g)"], [1, "O₂(g)"]], R: [[2, "H₂O(l)"]], dh: -571.6, M: 2.016 },
    h2g: { L: [[2, "H₂(g)"], [1, "O₂(g)"]], R: [[2, "H₂O(g)"]], dh: -483.6, M: 2.016 },
    nh4: { L: [[1, "NH₄NO₃(s)"]], R: [[1, "NH₄⁺(aq)"], [1, "NO₃⁻(aq)"]], dh: 25.7, M: 80.04 },
    caco3: { L: [[1, "CaCO₃(s)"]], R: [[1, "CaO(s)"], [1, "CO₂(g)"]], dh: 178.3, M: 100.09 },
  };
  let r = "ch4", k = 1, flip = false;
  const coef = (c) => { const v = c * k; return v === 1 ? "" : v === 0.5 ? "½" : v === 1.5 ? "³⁄₂" : Number.isInteger(v) ? `${v}` : `${v}`; };
  const side = (arr) => arr.map(([c, f]) => `${coef(c)}${f}`).join(" + ");
  const dH = () => RX[r].dh * k * (flip ? -1 : 1);
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const d = dH(), top = 40, bot = h - 40, mid = (top + bot) / 2, span = Math.min(bot - top, (bot - top) * Math.abs(d) / 1800 + 30);
    const yR = d < 0 ? mid - span / 2 : mid + span / 2, yP = d < 0 ? mid + span / 2 : mid - span / 2;
    const x0 = 40, x1 = w - 40, xa = x0 + (x1 - x0) * 0.08, xb = x0 + (x1 - x0) * 0.62;
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, top - 16); ctx.lineTo(x0, bot + 10); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.save(); ctx.translate(x0 - 10, mid); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("엔탈피 H", 0, 0); ctx.restore();
    const lv = (x, y, label, col) => { ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (x1 - x0) * 0.3, y); ctx.stroke(); ctx.fillStyle = C.ink; ctx.font = `11.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(label, x + (x1 - x0) * 0.15, y - 8); };
    const L = flip ? RX[r].R : RX[r].L, Rr = flip ? RX[r].L : RX[r].R;
    lv(xa, yR, side(L), "#3f6fa3"); lv(xb, yP, side(Rr), "#b5532f");
    // ΔH 화살표
    const ax = (xa + (x1 - x0) * 0.3 + xb) / 2;
    ctx.strokeStyle = d < 0 ? "#b5532f" : "#3f6fa3"; ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(ax, yR); ctx.lineTo(ax, yP - Math.sign(yP - yR) * 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax, yP); ctx.lineTo(ax - 6, yP - Math.sign(yP - yR) * 10); ctx.lineTo(ax + 6, yP - Math.sign(yP - yR) * 10); ctx.fill();
    ctx.font = `600 12px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`ΔH = ${d > 0 ? "+" : "−"}${Math.abs(d).toFixed(1)} kJ`, ax + 10, (yR + yP) / 2 + 4);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.fillText(d < 0 ? "열을 내놓음 → 주변이 따뜻해짐" : "열을 흡수함 → 주변이 차가워짐", ax + 10, (yR + yP) / 2 + 20);
  }
  function update() {
    const d = dH(), L = flip ? RX[r].R : RX[r].L, Rr = flip ? RX[r].L : RX[r].R;
    eq.textContent = `${side(L)} → ${side(Rr)}    ΔH = ${d > 0 ? "+" : "−"}${Math.abs(d).toFixed(1)} kJ`;
    nDh.textContent = `${d > 0 ? "+" : "−"}${Math.abs(d).toFixed(1)} kJ`; nKind.textContent = d < 0 ? "발열" : "흡열";
    const first = L[0][0] * k, perG = d / (first * (flip ? 1 : RX[r].M));
    nG.textContent = flip ? "—" : `${perG > 0 ? "+" : "−"}${Math.abs(perG).toFixed(1)} kJ/g`;
    root.querySelectorAll("[data-r]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.r === r)));
    root.querySelectorAll("[data-k]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.k === k)));
    rev.setAttribute("aria-pressed", String(flip));
    draw();
  }
  root.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => { r = b.dataset.r; update(); }));
  root.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => { k = +b.dataset.k; update(); }));
  rev.addEventListener("click", () => { flip = !flip; update(); });
  update();
})();
