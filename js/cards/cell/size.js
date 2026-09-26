/* 카드: 진핵세포는 왜 세포 안에 막을 잔뜩 두었을까? — 공 모양 세포의 표면적/부피 = 6/d, 확산 시간 r²/(6D), 내막계로 막 넓이 ×50 */
(() => {
  const root = document.getElementById("card-cell-size");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sD = $(".d"), oD = $(".d-out"), inner = $(".inner");
  const nV = $(".n-v"), nA = $(".n-a"), nR = $(".n-r"), nT = $(".n-t");
  const D = 10, INNER = 50;   // μm²/s, 간세포: 전체 막 ≈ 세포막 × 50
  const dia = () => Math.pow(10, +sD.value);
  const fmt = (x) => x >= 1e5 ? x.toExponential(1).replace("e+", "×10^") : x >= 100 ? Math.round(x).toLocaleString() : x >= 10 ? x.toFixed(0) : x >= 1 ? x.toFixed(1) : x.toFixed(2);
  const fmtT = (t) => t < 1 ? `${(t * 1000).toFixed(t < 0.01 ? 1 : 0)} ms` : t < 120 ? `${t.toFixed(1)} s` : `${(t / 60).toFixed(0)}분`;

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const d = dia(), on = inner.checked;
    // 위: 세포 그림 (화면 크기는 로그로 늘어남)
    const cx = w * 0.26, cy = h * 0.25, R = 16 + (Math.log10(d) + 0.3) / 2.6 * (h * 0.2 - 16);
    ctx.fillStyle = "#f4f1e8"; ctx.strokeStyle = C.forest; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.29); ctx.fill(); ctx.stroke();
    if (on && d > 1.5) {
      ctx.strokeStyle = "#e0a02a"; ctx.lineWidth = 1.2;
      for (let k = 0; k < 5; k++) { const rr = R * (0.35 + k * 0.1); ctx.beginPath(); ctx.arc(cx, cy, rr, -2.4 + k * 0.2, 0.3 + k * 0.25); ctx.stroke(); }
      ctx.fillStyle = "#e6dcef"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx - R * 0.05, cy + R * 0.05, R * 0.22, 0, 6.29); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "#d4493a"; for (let k = 0; k < 4; k++) { const a = k * 1.6 + 0.4; ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * R * 0.7, cy + Math.sin(a) * R * 0.7, R * 0.12, R * 0.06, a, 0, 6.29); ctx.stroke(); }
    }
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left";
    const tx = w * 0.52;
    ctx.fillText(`지름 ${d < 10 ? d.toFixed(1) : d.toFixed(0)} μm인 공 모양 세포`, tx, 30);
    ctx.font = `12px ${F.sans}`; ctx.fillStyle = C.ink2;
    ctx.fillText(`세포막: ${on ? "막 전체의 약 2 %" : "유일한 막"}`, tx, 52);
    ctx.fillText(on ? "초록: 세포막 · 노랑: 소포체" : "그림 크기는 로그 눈금", tx, 72);
    if (on) ctx.fillText("빨강: 미토콘드리아 · 보라: 핵", tx, 92);
    // 아래: 부피당 막 넓이 (로그–로그)
    const gx = 50, gy = h * 0.52, gw = w - gx - 16, gh = h * 0.38;
    const lx = (v) => gx + (Math.log10(v) + 0.3) / 2.6 * gw, ly = (v) => gy + gh - (Math.log10(v) + 2) / 5 * gh;   // y: 0.01 ~ 1000
    axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X: lx, Y: ly, xt: [[0.5, "0.5"], [1, "1"], [10, "10"], [100, "100"]], yt: [[0.01, "0.01"], [0.1, "0.1"], [1, "1"], [10, "10"], [100, "100"], [1000, "1000"]], xlabel: "지름 (μm)", ylabel: "부피당 막 넓이 (μm² / μm³)" });
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath();
    for (let lv = -0.3; lv <= 2.3; lv += 0.02) { const v = Math.pow(10, lv); const X = lx(v), Y = ly(6 / v); lv > -0.3 ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
    ctx.stroke();
    if (on) {
      ctx.strokeStyle = "#e0a02a"; ctx.setLineDash([5, 4]); ctx.beginPath();
      for (let lv = -0.3; lv <= 2.3; lv += 0.02) { const v = Math.pow(10, lv), yv = 6 * INNER / v; const X = lx(v), Y = ly(yv); lv > -0.3 ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
      ctx.stroke(); ctx.setLineDash([]);
    }
    const r0 = 6 / d, r1 = on ? 6 * INNER / d : r0;
    ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(lx(d), ly(r0), 5, 0, 6.29); ctx.fill();
    if (on) { ctx.fillStyle = "#e0a02a"; ctx.beginPath(); ctx.arc(lx(d), ly(r1), 5, 0, 6.29); ctx.fill(); }
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "right";
    const dl = Math.pow(10, (gw - 130) / gw * 2.6 - 0.3);   // 글자 왼쪽 끝의 지름
    ctx.fillStyle = C.forest; ctx.fillText("세포막만: 6 ÷ 지름", gx + gw - 4, ly(6 / dl) - 6);
    if (on) { ctx.fillStyle = "#b07a10"; ctx.fillText("세포 안의 막까지 (×50)", gx + gw - 4, ly(300 / dl) - 6); }
  }
  function update() {
    const d = dia(), on = inner.checked;
    oD.textContent = d < 10 ? d.toFixed(1) : d.toFixed(0);
    const A = Math.PI * d * d * (on ? INNER : 1), V = Math.PI * d ** 3 / 6, r = d / 2;
    nV.textContent = `${fmt(V)} μm³`; nA.textContent = `${fmt(A)} μm²`; nR.textContent = `${(A / V).toFixed(A / V < 1 ? 2 : 1)} /μm`;
    nT.textContent = fmtT(r * r / (6 * D));
    root.querySelectorAll("[data-d]").forEach((b) => b.setAttribute("aria-pressed", Math.abs(+b.dataset.d - d) / d < 0.02 ? "true" : "false"));
    draw();
  }
  root.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => { sD.value = Math.log10(+b.dataset.d); update(); }));
  sD.addEventListener("input", update); inner.addEventListener("change", update);
  update();
})();
