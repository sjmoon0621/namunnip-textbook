/* 카드: 대장균은 젖당 분해 효소를 언제 만들까? — 젖당 오페론 (억제 단백질 + CAP) */
(() => {
  const root = document.getElementById("card-gene-lac");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), nR = $(".n-r"), nC = $(".n-c"), nT = $(".n-t");
  let glu = false, lac = true, mut = "none";
  function state() {
    const rep = mut === "i" ? "none" : lac ? "free" : "bound", opBlocked = mut !== "o" && rep === "bound", cap = !glu;
    const level = opBlocked ? 0.02 : cap ? 1 : 0.15;
    return { rep, opBlocked, cap, level };
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = state(), y = h * 0.55, bh = 22, L = w - 28, X = (f) => 14 + f * L;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0), y); ctx.lineTo(X(1), y); ctx.stroke();
    const seg = (a, b, col, t, sub) => { ctx.fillStyle = col; ctx.fillRect(X(a), y - bh / 2, X(b) - X(a), bh); ctx.fillStyle = "#fff"; ctx.font = `600 10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(t, (X(a) + X(b)) / 2, y + 3.5); if (sub) { ctx.fillStyle = C.ink2; ctx.font = `9.5px ${F.sans}`; ctx.fillText(sub, (X(a) + X(b)) / 2, y + bh / 2 + 12); } };
    seg(0.02, 0.14, mut === "i" ? "#b8b8b8" : "#6a6a6a", "lacI", "조절 유전자"); seg(0.22, 0.29, "#b8a2d1", "CAP"); seg(0.29, 0.39, "#8a4fb5", "P"); seg(0.39, 0.46, mut === "o" ? "#b8d8b0" : "#3b7c2a", "O"); ctx.fillStyle = C.ink2; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("CAP 자리 · 프로모터 · 작동 부위", X(0.34), y + bh / 2 + 12);
    seg(0.47, 0.67, "#3f6fa3", "lacZ"); seg(0.67, 0.83, "#3f6fa3", "lacY"); seg(0.83, 0.97, "#3f6fa3", "lacA"); ctx.fillStyle = C.ink2; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("구조 유전자 (젖당 분해·흡수)", X(0.72), y + bh / 2 + 12);
    // 억제 단백질
    const repDraw = (x, yy, withAllo) => { ctx.fillStyle = "#d4493a"; ctx.beginPath(); ctx.moveTo(x - 16, yy); ctx.lineTo(x + 16, yy); ctx.lineTo(x + 12, yy - 20); ctx.lineTo(x - 12, yy - 20); ctx.closePath(); ctx.fill(); if (withAllo) { ctx.fillStyle = "#e0a02a"; ctx.beginPath(); ctx.arc(x + 12, yy - 22, 6, 0, Math.PI * 2); ctx.fill(); } ctx.fillStyle = C.ink2; ctx.font = `9px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(withAllo ? "억제 단백질 + 알로락토스" : "억제 단백질", x, yy - 26 - (withAllo ? 6 : 0)); };
    if (s.rep === "bound" && mut !== "o") repDraw(X(0.425), y - bh / 2, false);
    else if (s.rep === "bound") { repDraw(X(0.1), y - 60, false); ctx.fillStyle = C.warn; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("작동 부위에 붙지 못함", X(0.1), y - 44); }
    else if (s.rep === "free") repDraw(X(0.1), y - 60, true);
    else { ctx.fillStyle = C.warn; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("억제 단백질이 만들어지지 않음", X(0.12), y - 50); }
    // CAP
    if (s.cap) { ctx.fillStyle = "#8a4fb5"; ctx.beginPath(); ctx.arc(X(0.255), y - bh / 2 - 12, 12, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = `600 9px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("CAP", X(0.255), y - bh / 2 - 9); }
    // RNA 중합 효소
    const polX = s.opBlocked ? X(0.34) : X(0.34) + (X(0.6) - X(0.34)) * Math.min(1, s.level);
    ctx.fillStyle = s.opBlocked ? "rgba(59,124,42,.35)" : "rgba(59,124,42,.7)"; ctx.beginPath(); ctx.ellipse(polX, y + bh / 2 + 32, 28, 14, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = `600 9px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("RNA 중합 효소", polX, y + bh / 2 + 35);
    // mRNA
    if (!s.opBlocked) { const n = Math.round(1 + s.level * 5); for (let k = 0; k < n; k++) { const yy = h - 14 - k * 7; ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0.47), yy); ctx.lineTo(X(0.97), yy); ctx.stroke(); } ctx.fillStyle = C.warn; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("mRNA", X(0.46), h - 12); }
    // 배지
    ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(`포도당 ${glu ? "있음" : "없음"} · 젖당 ${lac ? "있음" : "없음"}`, w - 12, 16);
  }
  function update() {
    root.querySelector("[data-g]").setAttribute("aria-pressed", String(glu)); root.querySelector("[data-l]").setAttribute("aria-pressed", String(lac));
    root.querySelectorAll("[data-x]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.x === mut)));
    const s = state();
    nR.textContent = s.rep === "none" ? "없음 (조절 유전자 고장)" : s.rep === "free" ? "알로락토스와 결합해 작동 부위에서 떨어짐" : mut === "o" ? "있지만 고장 난 작동 부위에 붙지 못함" : "작동 부위에 붙어 전사를 막음";
    nC.textContent = s.cap ? "cAMP와 결합해 프로모터 옆에 붙음 → 전사 촉진" : "포도당이 충분해 붙지 않음";
    nT.textContent = s.level > 0.9 ? "많이 일어남" : s.level > 0.1 ? "조금 일어남" : "거의 일어나지 않음";
    draw();
  }
  root.querySelector("[data-g]").addEventListener("click", () => { glu = !glu; update(); });
  root.querySelector("[data-l]").addEventListener("click", () => { lac = !lac; update(); });
  root.querySelectorAll("[data-x]").forEach((b) => b.addEventListener("click", () => { mut = b.dataset.x; update(); }));
  update();
})();
