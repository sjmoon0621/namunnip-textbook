/* 카드: 바람은 왜 등압선을 따라, 또는 비스듬히 불까? — 지균풍·경도풍·지상풍의 힘 균형 (북반구) */
(() => {
  const root = document.getElementById("card-esys-winds");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sG = $(".g"), oG = $(".g-out"), sP = $(".p"), oP = $(".p-out"), sR = $(".r"), oR = $(".r-out"), sF = $(".f"), oF = $(".f-out"), nG = $(".n-g"), nV = $(".n-v"), nB = $(".n-b");
  let mode = "geo";
  const RHO = 1.0, OM = 7.292e-5;
  function calc() {
    const G = +sG.value * 1e-3, f = 2 * OM * Math.sin(+sP.value * Math.PI / 180), r = +sR.value * 1000, Vg = G / (RHO * f), pgf = G / RHO;
    if (mode === "geo") return { Vg, V: Vg, pgf, cor: f * Vg, fr: 0, a: 0, ok: true };
    if (mode === "low") { const V = -f * r / 2 + Math.sqrt((f * r / 2) ** 2 + f * r * Vg); return { Vg, V, pgf, cor: f * V, cen: V * V / r, fr: 0, a: 0, ok: true }; }
    if (mode === "high") { const d = (f * r / 2) ** 2 - f * r * Vg; if (d < 0) return { Vg, V: NaN, pgf, ok: false }; const V = f * r / 2 - Math.sqrt(d); return { Vg, V, pgf, cor: f * V, cen: V * V / r, fr: 0, a: 0, ok: true }; }
    const a = +sF.value * Math.PI / 180, V = Vg * Math.cos(a); return { Vg, V, pgf, cor: f * V, fr: f * V * Math.tan(a), a, ok: true };
  }
  const { ctx, size } = fit(cv, () => draw());
  function arrow(x, y, ang, len, col, lab, lw = 3) {
    if (len < 1) return; const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex - Math.cos(ang) * 7, ey - Math.sin(ang) * 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - Math.cos(ang) * 11 - Math.sin(ang) * 5.5, ey - Math.sin(ang) * 11 + Math.cos(ang) * 5.5); ctx.lineTo(ex - Math.cos(ang) * 11 + Math.sin(ang) * 5.5, ey - Math.sin(ang) * 11 - Math.cos(ang) * 5.5); ctx.fill();
    ctx.font = `600 11px ${F.sans}`; ctx.textAlign = Math.cos(ang) > 0.3 ? "left" : Math.cos(ang) < -0.3 ? "right" : "center"; ctx.fillText(lab, ex + Math.cos(ang) * 8, ey + Math.sin(ang) * 12 + 4);
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = calc(), px = w / 2; let py = h * 0.5;
    ctx.strokeStyle = "#8d8d92"; ctx.lineWidth = 1.2; ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    const curved = mode === "low" || mode === "high";
    if (!curved) {
      for (let i = -2; i <= 2; i++) { const y = py + i * h * 0.17; ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(w - 10, y); ctx.stroke(); ctx.fillText(`${1000 + i * 4} hPa`, 12, y - 4); }
      ctx.font = `600 13px ${F.sans}`; ctx.fillStyle = "#3f6fa3"; ctx.textAlign = "center"; ctx.fillText("저기압 쪽", w / 2, 16); ctx.fillStyle = C.warn; ctx.fillText("고기압 쪽", w / 2, h - 8);
    } else {
      const cy = h * 0.72, R0 = h * 0.42; py = cy - R0;
      for (let i = -2; i <= 3; i++) { const rr = R0 + i * h * 0.12; if (rr < 12) continue; ctx.beginPath(); ctx.arc(px, cy, rr, 0, Math.PI * 2); ctx.stroke(); ctx.fillText(`${mode === "low" ? 1000 + i * 4 : 1020 - i * 4} hPa`, px + rr * 0.72 + 4, cy - rr * 0.72); }
      ctx.font = `700 22px ${F.sans}`; ctx.fillStyle = mode === "low" ? "#3f6fa3" : C.warn; ctx.textAlign = "center"; ctx.fillText(mode === "low" ? "L" : "H", px, cy + 8);
    }
    if (!r.ok) { ctx.fillStyle = C.warn; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("이 기압 경도와 곡률로는 고기압의 경도풍이 성립하지 않음", w / 2, py - 20); return; }
    const up = -Math.PI / 2, down = Math.PI / 2, sc = (h * 0.28) / Math.max(r.pgf, r.cor, r.fr || 0, 1e-9);
    let pd = up, wd = 0; // 기본: 저기압이 위쪽, 바람은 동쪽(→)
    if (mode === "low") { pd = down; wd = Math.PI; }       // 중심이 아래 → 기압 경도력 아래, 반시계 방향이면 꼭대기에서 서쪽(←)
    if (mode === "high") { pd = up; wd = 0; }              // 기압 경도력 바깥(위), 시계 방향이면 꼭대기에서 동쪽(→)
    if (mode === "sfc") wd = -r.a;                         // 저기압(위) 쪽으로 a만큼 꺾임
    const cd = wd + Math.PI / 2;                           // 전향력: 바람의 오른쪽 (화면 좌표에서 +90°)
    arrow(px, py, pd, r.pgf * sc, "#3f6fa3", "기압 경도력");
    arrow(px, py, cd, r.cor * sc, "#8a4fb5", "전향력");
    if (mode === "sfc") arrow(px, py, wd + Math.PI, r.fr * sc, "#6a6a6a", "마찰력");
    arrow(px, py, wd, Math.min(w * 0.4, 20 + r.V * 3), C.forest, `바람 ${r.V.toFixed(1)} m/s`, 4);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
    if (curved) { ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(`구심력 = ${mode === "low" ? "기압 경도력 − 전향력" : "전향력 − 기압 경도력"}`, px, h - 8); }
  }
  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === mode)));
    root.querySelectorAll(".x-r").forEach((e) => (e.hidden = !(mode === "low" || mode === "high")));
    root.querySelectorAll(".x-f").forEach((e) => (e.hidden = mode !== "sfc"));
    oG.textContent = (+sG.value).toFixed(1); oP.textContent = sP.value; oR.textContent = sR.value; oF.textContent = sF.value;
    const r = calc(); nG.textContent = `${r.Vg.toFixed(1)} m/s`;
    nV.textContent = r.ok ? `${r.V.toFixed(1)} m/s` : "성립하지 않음";
    nB.textContent = { geo: "기압 경도력 = 전향력", low: "기압 경도력 > 전향력 → 지균풍보다 느림", high: "전향력 > 기압 경도력 → 지균풍보다 빠름", sfc: "기압 경도력 = 전향력 + 마찰력 (벡터 합) → 저기압 쪽으로 꺾임" }[mode];
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; update(); }));
  [sG, sP, sR, sF].forEach((s) => s.addEventListener("input", update)); update();
})();
