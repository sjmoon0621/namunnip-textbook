/* 카드: 대전된 막대와 액체 줄기 — 극성 분자의 배향과 끌림, 용매별 용해성 */
(() => {
  const root = document.getElementById("card-chem-polar-lab");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const LQ = { water: ["물", 1.0, "#bcd9f2"], ethanol: ["에탄올", 0.7, "#d9e8c9"], hexane: ["헥세인", 0.02, "#f2ecd0"] };
  // [물에서 색, 헥세인에서 색, 설명]
  const SO = { i2: ["#e3c9a0", "#8b3fa8", "아이오딘(무극성)은 헥세인에 잘 녹아 보라색이 되고, 물에는 거의 녹지 않습니다."], cuso4: ["#3f8fd8", "#f2ecd0", "황산 구리(이온 결정)는 물에 녹아 파란색이 되고, 헥세인에는 녹지 않아 바닥에 가라앉습니다."], oil: ["#f2ecd0", "#f0d878", "식용유(무극성)는 헥세인과 섞이고, 물과는 층을 이룹니다."] };
  let liq = "water", rod = "plus", sol = "i2", t = 0;
  const { ctx, size } = fit($("canvas"), () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const bx = w * 0.18, top = 14, k = rod === "none" ? 0 : LQ[liq][1];
    // 뷰렛
    ctx.fillStyle = "rgba(220,235,245,.6)"; ctx.strokeStyle = C.ink2; ctx.fillRect(bx - 8, top, 16, 40); ctx.strokeRect(bx - 8, top, 16, 40);
    // 줄기: 막대 쪽(오른쪽)으로 휨
    const rx = bx + 70, ry = h * 0.55;
    ctx.strokeStyle = LQ[liq][2]; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bx, top + 40);
    for (let y = top + 40; y < h - 10; y += 4) { const d = Math.max(0, y - (top + 40)); const u = Math.min(1, Math.max(0, (y - (ry - 70)) / 120)), pull = k * 55 * u * u * (3 - 2 * u); /* 막대 근처에서 휘고, 지나면 그 방향으로 계속 떨어짐 */ ctx.lineTo(bx + pull * Math.min(1, d / 60) + Math.sin(t * 20 + y) * 0.6, y); }
    ctx.stroke();
    // 막대
    if (rod !== "none") { ctx.fillStyle = rod === "plus" ? "#d9e3ec" : "#3a3a40"; ctx.save(); ctx.translate(rx, ry); ctx.rotate(0.35); ctx.fillRect(0, -6, 110, 12); ctx.fillStyle = rod === "plus" ? C.warn : "#3f6fa3"; ctx.font = `600 12px ${F.mono}`; for (let i = 0; i < 4; i++) ctx.fillText(rod === "plus" ? "+" : "−", 8 + i * 12, 4); ctx.restore(); }
    // 분자 배향 확대
    const zx = w * 0.42, zy = 20; ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`줄기 속 ${LQ[liq][0]} 분자 (확대)`, zx, zy);
    for (let i = 0; i < 6; i++) { const x = zx + 14 + (i % 3) * 30, y = zy + 22 + Math.floor(i / 3) * 26; const ang = liq === "hexane" || rod === "none" ? (i * 1.7 + t) % 6.28 : rod === "plus" ? Math.PI : 0; ctx.save(); ctx.translate(x, y); ctx.rotate(ang); if (liq === "hexane") { ctx.fillStyle = "#c9c9cf"; ctx.fillRect(-10, -3, 20, 6); } else { ctx.fillStyle = "#d9534f"; ctx.beginPath(); ctx.arc(-4, 0, 6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#e8e8ea"; ctx.beginPath(); ctx.arc(5, -4, 3.5, 0, Math.PI * 2); ctx.arc(5, 4, 3.5, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
    if (liq !== "hexane" && rod !== "none") { ctx.fillStyle = C.ink2; ctx.fillText(rod === "plus" ? "δ− 쪽(O)이 막대를 향함" : "δ+ 쪽(H)이 막대를 향함", zx, zy + 76); }
    // 용해 시험관 두 개
    const tx = w * 0.72, so = SO[sol];
    [["물", so[0], sol === "oil" ? "layer" : sol === "cuso4" ? "dis" : "sett"], ["헥세인", so[1], sol === "cuso4" ? "sett" : "dis"]].forEach(([n, col, st], i) => {
      const x = tx + i * 56, y0 = h * 0.35, y1 = h - 20;
      ctx.fillStyle = st === "dis" ? col : i === 0 ? "rgba(220,235,245,.8)" : "#f7f3e2"; ctx.fillRect(x, y0 + 20, 30, y1 - y0 - 20);
      if (st === "layer") { ctx.fillStyle = col; ctx.fillRect(x, y0 + 20, 30, 18); }
      if (st === "sett") { ctx.fillStyle = sol === "cuso4" ? "#3f8fd8" : "#5a3a6a"; ctx.fillRect(x + 4, y1 - 6, 22, 6); if (sol === "i2" && i === 0) { ctx.fillStyle = col; ctx.globalAlpha = 0.5; ctx.fillRect(x, y0 + 20, 30, y1 - y0 - 26); ctx.globalAlpha = 1; } }
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.strokeRect(x, y0, 30, y1 - y0);
      ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.fillText(n, x + 15, y0 - 4);
    });
    $(".verdict").textContent = `${rod === "none" ? "막대가 없으면 모든 줄기가 곧게 떨어집니다." : liq === "hexane" ? "헥세인은 무극성이라 거의 휘지 않습니다." : `${LQ[liq][0]}은 극성이라 ${rod === "plus" ? "(+)" : "(−)"} 막대 쪽으로 휩니다.`} ${so[2]}`;
  }
  loop($("canvas"), (dt) => { t += dt; draw(); });
  root.addEventListener("click", (e) => { const b = e.target.closest("[data-l],[data-r],[data-s]"); if (!b) return; const k = Object.keys(b.dataset)[0]; if (k === "l") liq = b.dataset.l; if (k === "r") rod = b.dataset.r; if (k === "s") sol = b.dataset.s; root.querySelectorAll(`[data-${k}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); });
  draw();
})();
