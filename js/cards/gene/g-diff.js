/* 카드: 같은 DNA에서 어떻게 다른 세포가 될까? — 전사 인자 조합 → 유전자 발현 → 세포 종류 */
(() => {
  const root = document.getElementById("card-gene-differentiation");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), nG = $(".n-g"), nC = $(".n-c");
  const on = { Oct4: false, Sox2: false, MyoD: true, MEF2: true, Pax6: false };
  const TFC = { Oct4: "#e0a02a", Sox2: "#3b7c2a", MyoD: "#d4493a", MEF2: "#8a4fb5", Pax6: "#3f6fa3" };
  // [유전자, 필요한 전사 인자, 설명]
  const G = [["Nanog 등 줄기세포 유전자", ["Oct4", "Sox2"]], ["근육 액틴", ["MyoD"]], ["미오신 (근육 수축)", ["MyoD", "MEF2"]], ["크리스탈린 (투명한 수정체)", ["Pax6", "Sox2"]]];
  const act = () => G.filter(([, req]) => req.every((t) => on[t]));
  function fate() {
    const a = act().map((g) => g[0]);
    if (a[0] === G[0][0] && a.length === 1) return ["줄기세포 (분화하지 않은 상태 유지)", "stem"];
    if (a.includes(G[2][0])) return ["근육 세포 (수축하는 긴 세포)", "muscle"];
    if (a.includes(G[1][0])) return ["근육 전구 세포 (근육 유전자 일부만 켜짐)", "premuscle"];
    if (a.includes(G[3][0])) return ["수정체 세포 (크리스탈린이 가득한 투명한 세포)", "lens"];
    return ["특별한 유전자가 켜지지 않음 (분화 방향 없음)", "none"];
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 14, x1 = w * 0.66, rh = (h - 30) / G.length;
    ctx.fillStyle = C.ink2; ctx.font = `600 10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("핵 속 DNA (모든 세포에 같음)", x0, 12);
    G.forEach(([name, req], i) => {
      const y = 26 + i * rh + rh / 2, lit = req.every((t) => on[t]);
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      req.forEach((t, k) => { const bx = x0 + 6 + k * 40; ctx.fillStyle = "#eee"; ctx.fillRect(bx, y - 7, 36, 14); if (on[t]) { ctx.fillStyle = TFC[t]; ctx.beginPath(); ctx.arc(bx + 18, y - 12, 9, 0, Math.PI * 2); ctx.fill(); } ctx.fillStyle = on[t] ? "#fff" : C.ink3; ctx.font = `600 8.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(t, bx + 18, on[t] ? y - 9 : y + 3); });
      const gx = x0 + 96; ctx.fillStyle = lit ? "#3f6fa3" : "#d9dad2"; ctx.fillRect(gx, y - 9, x1 - gx, 18); ctx.fillStyle = lit ? "#fff" : C.ink3; ctx.font = `600 10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(`${name}${lit ? " ✓" : ""}`, (gx + x1) / 2, y + 4);
      if (lit) { ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx + 6, y + 13); ctx.lineTo(x1 - 6, y + 13); ctx.stroke(); }
    });
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("회색 칸: 전사 인자가 붙는 조절 부위 · 붉은 선: mRNA", x0, h - 4);
    // 세포 그림
    const [lab, k] = fate(), cx = w * 0.84, cy = h * 0.46;
    ctx.fillStyle = "#fbe9e0"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath();
    if (k === "muscle") ctx.ellipse(cx, cy, w * 0.14, 16, 0, 0, Math.PI * 2); else if (k === "premuscle") ctx.ellipse(cx, cy, w * 0.09, 22, 0, 0, Math.PI * 2); else if (k === "lens") { ctx.fillStyle = "rgba(200,230,255,.6)"; ctx.ellipse(cx, cy, w * 0.1, 30, 0, 0, Math.PI * 2); } else ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    if (k === "muscle") { ctx.strokeStyle = "rgba(212,73,58,.6)"; for (let i = -5; i <= 5; i++) { ctx.beginPath(); ctx.moveTo(cx + i * w * 0.022, cy - 12); ctx.lineTo(cx + i * w * 0.022, cy + 12); ctx.stroke(); } [-0.07, 0, 0.07].forEach((d) => { ctx.fillStyle = "#6a4a8a"; ctx.beginPath(); ctx.arc(cx + d * w, cy, 4, 0, Math.PI * 2); ctx.fill(); }); }
    else { ctx.fillStyle = "#6a4a8a"; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = C.ink; ctx.font = `600 10.5px ${F.sans}`; ctx.textAlign = "center"; const words = lab.split(" ("); ctx.fillText(words[0], cx, cy + 50); if (words[1]) { ctx.font = `9.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.fillText("(" + words[1], cx, cy + 64); }
  }
  function update() {
    root.querySelectorAll("[data-t]").forEach((b) => b.setAttribute("aria-pressed", String(on[b.dataset.t])));
    const a = act(); nG.textContent = a.length ? a.map((g) => g[0]).join(", ") : "없음"; nC.textContent = fate()[0]; draw();
  }
  root.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { on[b.dataset.t] = !on[b.dataset.t]; update(); }));
  update();
})();
