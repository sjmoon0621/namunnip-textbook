/* 카드: 레이저는 왜 원자 두 층만으로는 만들 수 없을까? — 속도 방정식 정상 상태: 2준위 vs 4준위 */
(() => {
  const root = document.getElementById("card-emq-laser");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sP = $(".p"), oP = $(".p-out"), nR = $(".n-r"), nS = $(".n-s"), nO = $(".n-o");
  let M = 4;
  const TH = 0.2, G = 8; // 문턱 반전량(전체 원자 수 대비), G: 위 준위의 자발 방출 빠르기
  function state(W) {
    if (M === 2) { const up = W / (G + 2 * W); return { up, lo: 1 - up, out: 0, g: 0 }; }        // 흡수·방출이 같은 빛으로 → 최대 1/2
    // 4준위: 아래 레이저 준위는 빨리 비므로 ≈ 0, 바닥 준위 N0 = 1 − up
    const upNo = W / (G + W); if (upNo < TH) return { up: upNo, lo: 0.01, g0: 1 - upNo, out: 0 };
    return { up: TH, lo: 0.01, g0: 1 - TH, out: W * (1 - TH) - G * TH };                          // 문턱 위: 반전량 고정, 남는 펌핑이 빛으로
  }
  const Wth = G * TH / (1 - TH);
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const W = +sP.value, s = state(W);
    // 왼쪽: 준위 그림
    const lx0 = 20, lx1 = w * 0.42, levels = M === 2 ? [["위 준위", s.up, 0.3], ["아래 준위 (바닥)", s.lo, 0.85]] : [["펌핑 준위 (빨리 내려감)", 0.0, 0.12], ["위 레이저 준위", s.up, 0.35], ["아래 레이저 준위 (빨리 비워짐)", s.lo, 0.62], ["바닥 준위", s.g0, 0.88]];
    levels.forEach(([lab, frac, yf], i) => {
      const y = h * yf; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx0, y); ctx.lineTo(lx1, y); ctx.stroke();
      const n = Math.round(frac * 40); ctx.fillStyle = i === (M === 2 ? 0 : 1) ? C.warn : "#3f6fa3"; for (let k = 0; k < n; k++) { ctx.beginPath(); ctx.arc(lx0 + 8 + (k % 20) * ((lx1 - lx0 - 16) / 19), y - 6 - Math.floor(k / 20) * 9, 3, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(lab, lx0, y + 13);
    });
    // 화살표: 펌핑, 레이저 전이
    const arr = (x, ya, yb, col, t) => { ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, ya); ctx.lineTo(x, yb); ctx.stroke(); const d = Math.sign(yb - ya); ctx.beginPath(); ctx.moveTo(x, yb); ctx.lineTo(x - 4, yb - d * 8); ctx.lineTo(x + 4, yb - d * 8); ctx.fill(); ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(t, x + 6, (ya + yb) / 2); };
    if (M === 2) { arr(lx1 + 12, h * 0.85, h * 0.3, C.forest, "펌핑"); arr(lx1 + 60, h * 0.3, h * 0.85, C.warn, "빛"); }
    else { arr(lx1 + 10, h * 0.88, h * 0.12, C.forest, "펌핑"); arr(lx1 + 58, h * 0.35, h * 0.62, C.warn, s.out > 0 ? "레이저" : "빛"); }
    // 오른쪽: 출력 대 펌핑
    const gx0 = w * 0.64, gx1 = w - 12, gy0 = h - 26, gy1 = 16, X = (p) => gx0 + p / 10 * (gx1 - gx0), Y = (o) => gy0 - o / 8 * (gy0 - gy1);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, gy1); ctx.lineTo(gx0, gy0); ctx.lineTo(gx1, gy0); ctx.stroke();
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2.2; ctx.beginPath(); for (let p = 0; p <= 10; p += 0.05) { const o = state(p).out; p ? ctx.lineTo(X(p), Y(o)) : ctx.moveTo(X(p), Y(o)); } ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(W), Y(s.out), 4.5, 0, Math.PI * 2); ctx.fill();
    if (M === 4) { ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(X(Wth), gy1); ctx.lineTo(X(Wth), gy0); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("문턱", X(Wth) + 3, gy1 + 10); }
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("펌핑 세기 →", gx1, gy0 + 14); ctx.textAlign = "left"; ctx.fillText("레이저 출력", gx0 + 4, gy1 - 4);
  }
  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.m === M)));
    const W = +sP.value, s = state(W); oP.textContent = W.toFixed(1);
    nR.textContent = `${(s.up * 100).toFixed(0)} % : ${(s.lo * 100).toFixed(0)} %`;
    nS.textContent = M === 2 ? "밀도 반전 불가 (위 준위가 절반을 넘지 못함)" : s.out > 0 ? "밀도 반전 · 문턱 이상 → 레이저 발진" : "밀도 반전이지만 문턱 아래 (손실이 더 큼)";
    nO.textContent = s.out > 0 ? s.out.toFixed(2) : "0";
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { M = +b.dataset.m; update(); }));
  sP.addEventListener("input", update); update();
})();
