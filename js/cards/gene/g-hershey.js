/* 카드: 세균 속으로 들어가는 것은 단백질일까, DNA일까? — 허시·체이스 실험 결과 모식 */
(() => {
  const root = document.getElementById("card-gene-hershey");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sB = $(".b"), oB = $(".b-out"), nU = $(".n-u"), nD = $(".n-d"), nO = $(".n-o");
  let L = "S";
  // 상층액 비율: 흔든 시간 t에 따라 포화 (S: 최대 0.8, P: 최대 0.25)
  const sup = (t) => (L === "S" ? 0.8 : 0.25) * (1 - Math.exp(-t / 1.2));
  const { ctx, size } = fit(cv, () => draw());
  function phage(x, y, s, lab, inj) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = lab === "S" ? "#d4493a" : "#8d8d92"; ctx.fillStyle = lab === "S" ? "rgba(212,73,58,.25)" : "#fff"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(9, -12); ctx.lineTo(9, 0); ctx.lineTo(0, 6); ctx.lineTo(-9, 0); ctx.lineTo(-9, -12); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(0, 18); ctx.moveTo(-8, 22); ctx.lineTo(0, 18); ctx.lineTo(8, 22); ctx.stroke();
    if (!inj) { ctx.strokeStyle = lab === "P" ? "#3b5bd9" : "#5d5d61"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-4, -10); ctx.bezierCurveTo(4, -8, -4, -4, 3, -2); ctx.stroke(); }
    ctx.restore();
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const t = +sB.value, f = sup(t);
    // 1단계: 감염
    const bx = w * 0.18, by = h * 0.5;
    ctx.fillStyle = "#e9f0dc"; ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(bx, by + 20, 50, 24, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // 세균 안의 파지 DNA
    ctx.strokeStyle = L === "P" ? "#3b5bd9" : "#5d5d61"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx - 20, by + 18); ctx.bezierCurveTo(bx - 5, by + 30, bx + 5, by + 8, bx + 22, by + 22); ctx.stroke();
    [-26, 0, 26].forEach((dx) => phage(bx + dx, by - 22, 0.9, L, true));
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("① 감염: DNA만 주입", bx, h - 10);
    // 화살표
    ctx.fillStyle = C.ink3; ctx.font = `600 18px ${F.sans}`; ctx.fillText("→", w * 0.36, by); ctx.font = `10px ${F.sans}`; ctx.fillText(`② 믹서 ${t}분`, w * 0.36, by + 16);
    // 원심 분리관
    const tx = w * 0.56, tw = 56, ty = 16, th = h - 44;
    ctx.fillStyle = "rgba(110,164,230,.12)"; ctx.fillRect(tx - tw / 2, ty, tw, th); ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx - tw / 2, ty); ctx.lineTo(tx - tw / 2, ty + th - 20); ctx.quadraticCurveTo(tx, ty + th + 10, tx + tw / 2, ty + th - 20); ctx.lineTo(tx + tw / 2, ty); ctx.stroke();
    ctx.fillStyle = "#c9b18a"; ctx.beginPath(); ctx.moveTo(tx - tw / 2 + 3, ty + th - 30); ctx.quadraticCurveTo(tx, ty + th + 4, tx + tw / 2 - 3, ty + th - 30); ctx.fill();
    // 방사능 점
    const dots = (n, y0, y1, col) => { for (let i = 0; i < n; i++) { const u = ((i * 37) % 97) / 97, v = ((i * 61) % 89) / 89; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(tx - tw / 2 + 8 + u * (tw - 16), y0 + v * (y1 - y0), 2.6, 0, Math.PI * 2); ctx.fill(); } };
    const col = L === "S" ? "#d4493a" : "#3b5bd9", N = 40; dots(Math.round(N * f), ty + 10, ty + th * 0.6, col); dots(Math.round(N * (1 - f)), ty + th - 30, ty + th - 14, col);
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("상층액: 파지 껍질", tx + tw / 2 + 6, ty + 20); ctx.fillText("침전물: 대장균", tx + tw / 2 + 6, ty + th - 16);
    ctx.textAlign = "center"; ctx.fillText("③ 원심 분리", tx, h - 10);
    // 막대
    const gx = w * 0.84, gw = 22, gh = h - 60, gy = 20;
    [["상층액", f], ["침전물", 1 - f]].forEach(([lab, v], i) => { const x = gx + i * (gw + 16); ctx.fillStyle = C.rule; ctx.fillRect(x, gy, gw, gh); ctx.fillStyle = col; ctx.fillRect(x, gy + gh * (1 - v), gw, gh * v); ctx.fillStyle = C.ink; ctx.font = `600 10px ${F.mono}`; ctx.fillText(`${Math.round(v * 100)}%`, x + gw / 2, gy + gh * (1 - v) - 4); ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.fillText(lab, x + gw / 2, gy + gh + 12); });
    ctx.fillStyle = col; ctx.font = `600 11px ${F.sans}`; ctx.fillText(L === "S" ? "³⁵S (단백질)" : "³²P (DNA)", gx + gw + 8, h - 4);
  }
  function update() {
    root.querySelectorAll("[data-l]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.l === L)));
    const t = +sB.value, f = sup(t); oB.textContent = t;
    nU.textContent = `약 ${Math.round(f * 100)} %`; nD.textContent = `약 ${Math.round((1 - f) * 100)} %`;
    nO.textContent = L === "S" ? "³⁵S는 거의 검출되지 않음 (1 % 미만)" : "³²P가 검출됨 (약 30 %)";
    draw();
  }
  root.querySelectorAll("[data-l]").forEach((b) => b.addEventListener("click", () => { L = b.dataset.l; update(); }));
  sB.addEventListener("input", update); update();
})();
