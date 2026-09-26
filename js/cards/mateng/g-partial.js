/* 카드: 깊이 잠수할 때는 왜 공기 대신 다른 기체를 마실까? — 혼합 기체의 부분 압력 = 몰 분율 × 전체 압력 */
(() => {
  const root = document.getElementById("card-mateng-partial");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sP = $(".p"), oP = $(".p-out"), nO2 = $(".n-o2"), nN2 = $(".n-n2"), nJ = $(".n-judge");
  const MIX = {
    air: [["N₂", 0.781, "#6ea4e6"], ["O₂", 0.209, "#d4493a"], ["Ar 등", 0.01, "#b0b0b8"]],
    nitrox: [["N₂", 0.68, "#6ea4e6"], ["O₂", 0.32, "#d4493a"]],
    trimix: [["N₂", 0.35, "#6ea4e6"], ["O₂", 0.18, "#d4493a"], ["He", 0.47, "#e0a02a"]],
    o2: [["O₂", 0.95, "#d4493a"], ["N₂ 등", 0.05, "#6ea4e6"]],
  };
  let mix = "air";
  const pp = (name) => { const g = MIX[mix].find((x) => x[0].startsWith(name)); return g ? g[1] * +sP.value : 0; };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const P = +sP.value, x0 = 56, y0 = h - 30, pw = w - x0 - 20, ph = h - 50, PM = 8;
    const Y = (p) => y0 - p / PM * ph;
    // 산소 안전 띠 (0.16 ~ 1.4)
    ctx.fillStyle = "rgba(59,124,42,.1)"; ctx.fillRect(x0, Y(1.4), pw, Y(0.16) - Y(1.4));
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    [0, 1, 2, 4, 6, 8].forEach((p) => { ctx.beginPath(); ctx.moveTo(x0, Y(p)); ctx.lineTo(x0 + pw, Y(p)); ctx.stroke(); ctx.fillText(`${p}`, x0 - 5, Y(p) + 3); });
    ctx.save(); ctx.translate(14, y0 - ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("압력 (atm)", 0, 0); ctx.restore();
    ctx.setLineDash([4, 4]); ctx.strokeStyle = "#d4493a"; [[1.4, "산소 중독 위험 1.4"], [0.16, "저산소 0.16"]].forEach(([p, l]) => { ctx.beginPath(); ctx.moveTo(x0, Y(p)); ctx.lineTo(x0 + pw, Y(p)); ctx.stroke(); ctx.fillStyle = "#d4493a"; ctx.textAlign = "right"; ctx.fillText(l, x0 + pw, Y(p) - 3); });
    ctx.strokeStyle = "#3f6fa3"; ctx.beginPath(); ctx.moveTo(x0, Y(3.2)); ctx.lineTo(x0 + pw, Y(3.2)); ctx.stroke(); ctx.fillStyle = "#3f6fa3"; ctx.fillText("질소 마취 약 3.2", x0 + pw, Y(3.2) - 3); ctx.setLineDash([]);
    // 막대: 전체(쌓기) + 성분별
    const gases = MIX[mix], bw = Math.min(70, pw / (gases.length + 2) * 0.7), gap = pw / (gases.length + 2);
    let acc = 0; const bx = x0 + gap * 0.5;
    gases.forEach(([n, f, col]) => { const p = f * P; ctx.fillStyle = col; ctx.fillRect(bx, Y(acc + p), bw, Y(acc) - Y(acc + p)); acc += p; });
    ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("전체", bx + bw / 2, y0 + 14); ctx.fillText(`${P.toFixed(2)}`, bx + bw / 2, Y(P) - 5);
    gases.forEach(([n, f, col], i) => { const x = x0 + gap * (i + 1.5), p = f * P; ctx.fillStyle = col; ctx.fillRect(x, Y(p), bw, Y(0) - Y(p)); ctx.fillStyle = C.ink; ctx.fillText(`${n} ${Math.round(f * 100)}%`, x + bw / 2, y0 + 14); ctx.font = `10.5px ${F.mono}`; ctx.fillText(p.toFixed(2), x + bw / 2, Y(p) - 5); ctx.font = `600 11px ${F.sans}`; });
  }
  function update() {
    const P = +sP.value; oP.textContent = P.toFixed(2);
    const o2 = pp("O₂"), n2 = pp("N₂");
    nO2.textContent = `${o2.toFixed(2)} atm`; nN2.textContent = `${n2.toFixed(2)} atm`;
    const warn = [];
    if (o2 < 0.16) warn.push("저산소"); if (o2 > 1.4) warn.push("산소 중독 위험"); if (n2 > 3.2) warn.push("질소 마취 위험");
    nJ.textContent = warn.length ? warn.join(", ") : "안전 범위"; nJ.classList.toggle("bad", warn.length > 0);
    root.querySelectorAll("[data-mix]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mix === mix)));
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(Math.abs(+b.dataset.p - P) < 0.005)));
    draw();
  }
  sP.addEventListener("input", update);
  root.querySelectorAll("[data-mix]").forEach((b) => b.addEventListener("click", () => { mix = b.dataset.mix; update(); }));
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { sP.value = b.dataset.p; update(); }));
  update();
})();
