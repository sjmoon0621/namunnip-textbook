/* 카드: 전하를 띠지 않은 물체는 왜 대전체에 끌려올까? — 정전기 유도(금속), 유전 분극(절연체), 접지 */
(() => {
  const root = document.getElementById("card-emq-polarize");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sD = $(".d"), oD = $(".d-out"), nQ = $(".n-q"), nF = $(".n-f");
  let mode = "metal", sg = -1;
  const POS = "#b5532f", NEG = "#3f6fa3";
  const sym = (x, y, s, r = 6) => { ctx.fillStyle = s > 0 ? POS : NEG; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = `700 ${r * 1.7}px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(s > 0 ? "+" : "−", x, y + r * 0.6); };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const d = +sD.value, cy = h * 0.5, R = h * 0.28, sc = (w * 0.55) / 15, rodX = 30, bx = rodX + 20 + d * sc + R, strength = Math.min(1, 3 / d);
    // 막대
    ctx.fillStyle = "#d8d2c4"; ctx.fillRect(rodX - 14, cy - h * 0.38, 28, h * 0.76);
    for (let i = 0; i < 6; i++) sym(rodX, cy - h * 0.3 + i * h * 0.12, sg, 6);
    // 공
    ctx.fillStyle = mode === "diel" ? "#efe9da" : "#c9cdd2"; ctx.beginPath(); ctx.arc(bx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.stroke();
    if (mode === "diel") {
      // 분자 쌍극자: (−)쪽이 막대 전하 반대 방향으로 약간 치우침
      const sh = 2 + 5 * strength;
      for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) { const x = bx + i * R * 0.27, y = cy + j * R * 0.27; if (Math.hypot(x - bx, y - cy) > R * 0.85) continue; ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.ellipse(x, y, 9 + sh / 2, 7, 0, 0, Math.PI * 2); ctx.stroke(); const near = -sg; sym(x - sh, y, near, 3.5); sym(x + sh, y, -near, 3.5); }
    } else {
      // 도체: 가까운 쪽에 반대 전하, 먼 쪽에 같은 전하 (접지면 먼 쪽 전하 없음)
      const n = Math.round(2 + 6 * strength);
      for (let k = 0; k < n; k++) { const t = (k + 0.5) / n * Math.PI * 0.8 - Math.PI * 0.4; sym(bx - R * 0.86 * Math.cos(t), cy + R * 0.86 * Math.sin(t), -sg, 5.5); if (mode === "metal") sym(bx + R * 0.86 * Math.cos(t), cy + R * 0.86 * Math.sin(t), sg, 5.5); }
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) if ((i + j) % 2 === 0) { sym(bx + i * R * 0.35, cy + j * R * 0.35 - 6, 1, 4); sym(bx + i * R * 0.35, cy + j * R * 0.35 + 6, -1, 4); }
      if (mode === "ground") { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; const gx = bx + R; ctx.beginPath(); ctx.moveTo(gx, cy); ctx.lineTo(gx + 30, cy); ctx.lineTo(gx + 30, h - 20); ctx.stroke(); [0, 1, 2].forEach((k) => { ctx.beginPath(); ctx.moveTo(gx + 30 - 14 + k * 5, h - 20 + k * 5); ctx.lineTo(gx + 30 + 14 - k * 5, h - 20 + k * 5); ctx.stroke(); }); ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(sg < 0 ? "전자가 땅으로" : "전자가 땅에서", gx + 36, cy + 20); }
    }
    // 힘 화살표 (끌림)
    const Frel = mode === "diel" ? (6 / d) ** 5 * 0.4 : (6 / d) ** 5, L = Math.min(80, 10 + 20 * Math.log10(1 + Frel * 9));
    ctx.strokeStyle = C.forest; ctx.fillStyle = C.forest; ctx.lineWidth = 3; const ay = cy - R - 14; ctx.beginPath(); ctx.moveTo(bx, ay); ctx.lineTo(bx - L, ay); ctx.stroke(); ctx.beginPath(); ctx.moveTo(bx - L - 8, ay); ctx.lineTo(bx - L + 2, ay - 6); ctx.lineTo(bx - L + 2, ay + 6); ctx.fill();
    ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("끌어당기는 힘", bx + 6, ay + 4);
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(mode === "diel" ? "분자마다 전하가 살짝 치우침 (유전 분극)" : "자유 전자가 이동 (정전기 유도)", bx, h - 6);
  }
  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === mode)));
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.s === sg)));
    const d = +sD.value; oD.textContent = d;
    nQ.textContent = mode === "ground" ? `${sg < 0 ? "+" : "−"} (먼 쪽 전하가 땅으로 빠짐)` : "0 (전하가 나뉘었을 뿐)";
    const Frel = mode === "diel" ? (6 / d) ** 5 * 0.4 : (6 / d) ** 5 * (mode === "ground" ? 3 : 1);
    nF.textContent = `막대 쪽으로 끌림 · 상대 크기 ${Frel < 0.01 ? Frel.toExponential(1) : Frel.toFixed(Frel < 10 ? 2 : 0)}${mode === "ground" ? " (알짜 전하가 있어 더 셈, 대략)" : ""}`;
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; update(); }));
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { sg = +b.dataset.s; update(); }));
  sD.addEventListener("input", update); update();
})();
