/* 카드: 달에는 왜 대기가 없을까? — 탈출 속도(역학적 에너지 보존)와 기체 분자 속력 비교 */
(() => {
  const root = document.getElementById("card-mech-escape");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sV = $(".v"), oV = $(".v-out"), oF = $(".frac-out");
  const nVe = $(".n-ve"), nFate = $(".n-fate"), nT = $(".n-T");
  const G = 6.674e-11, kB = 1.381e-23, u = 1.661e-27;
  // 질량(kg), 반지름(m), 기체가 빠져나가는 대기 윗부분(외기권)의 대략 온도(K) — 대기가 없는 달·수성은 낮 표면 온도, 실제 대기
  const P = {
    earth: { n: "지구", M: 5.972e24, R: 6.371e6, T: 1000, air: "N₂, O₂" },
    moon: { n: "달", M: 7.35e22, R: 1.737e6, T: 390, air: "거의 없음" },
    mars: { n: "화성", M: 6.42e23, R: 3.39e6, T: 250, air: "옅은 CO₂" },
    mercury: { n: "수성", M: 3.30e23, R: 2.44e6, T: 700, air: "거의 없음" },
    jupiter: { n: "목성", M: 1.898e27, R: 6.99e7, T: 1000, air: "H₂, He" },
    titan: { n: "타이탄", M: 1.345e23, R: 2.575e6, T: 150, air: "N₂ (지구보다 짙음)" },
  };
  const GASES = [["H₂", 2], ["He", 4], ["H₂O", 18], ["N₂", 28], ["O₂", 32], ["CO₂", 44]];
  let p = "earth";

  const ve = () => Math.sqrt(2 * G * P[p].M / P[p].R);
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const B = P[p], v = +sV.value * ve();
    // ① 에너지 우물: r = R..8R, U = -GM/r (단위 질량), 발사체 에너지 E = v²/2 - GM/R
    const top = 24, H1 = h * 0.5, x0 = 40, x1 = w - 14;
    const U = (r) => -G * B.M / r, U0 = U(B.R), E = v * v / 2 + U0;
    const rx = (r) => x0 + (r / B.R - 1) / 7 * (x1 - x0), uy = (e) => top + (e / U0) * (H1 - top);   // U0(음수)가 아래
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText("① 중력의 에너지 우물 (단위 질량당)", 10, 14);
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(x0, uy(0)); ctx.lineTo(x1, uy(0)); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.fillText("0 (무한히 먼 곳)", x1 - 80, uy(0) - 4);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 100; i++) { const r = B.R * (1 + 7 * i / 100); i ? ctx.lineTo(rx(r), uy(U(r))) : ctx.moveTo(rx(r), uy(U(r))); } ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.fillText("표면", x0 - 4, uy(U0) + 14);
    ctx.fillText("거리 →", x1 - 36, H1 + 14);
    // 에너지 수평선
    const escapes = E >= 0;
    const ey = Math.max(top - 6, uy(E));
    ctx.strokeStyle = escapes ? "#3b7c2a" : "#b5532f"; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.6;
    let rTurn = escapes ? Infinity : -G * B.M / E;
    ctx.beginPath(); ctx.moveTo(x0, ey); ctx.lineTo(escapes ? x1 : Math.min(x1, rx(rTurn)), ey); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = escapes ? "#3b7c2a" : "#b5532f"; ctx.font = `600 11px ${F.sans}`;
    ctx.fillText(escapes ? "역학적 에너지 ≥ 0 → 탈출" : `되돌아옴 (최고 ${((rTurn / B.R - 1) * B.R / 1000).toFixed(0)} km)`, x0 + 6, ey - 6);
    // ② 기체 분자 속력 막대
    const y2 = H1 + 34, bh = (h - y2 - 10) / GASES.length;
    ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText(`② 대기 윗부분(약 ${B.T} K)에서 분자의 평균 속력`, 10, y2 - 8);
    const vmax = Math.max(12000, ve() / 6 * 1.3, ...GASES.map(([, m]) => Math.sqrt(3 * kB * B.T / (m * u))) );
    const bx0 = 50, bw = w - bx0 - 16, X = (v) => bx0 + v / vmax * bw;
    const lim = ve() / 6;
    GASES.forEach(([n, m], i) => {
      const vr = Math.sqrt(3 * kB * B.T / (m * u)), y = y2 + i * bh + 2, keep = vr < lim;
      ctx.fillStyle = keep ? "rgba(59,124,42,.75)" : "rgba(181,83,47,.7)"; ctx.fillRect(bx0, y, X(vr) - bx0, bh - 6);
      ctx.fillStyle = C.ink; ctx.font = `11px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(n, bx0 - 6, y + bh / 2);
      ctx.textAlign = "left"; ctx.fillStyle = C.ink2; ctx.fillText(`${(vr / 1000).toFixed(2)} km/s ${keep ? "남음" : "빠져나감"}`, Math.min(X(vr) + 5, w - 110), y + bh / 2);
    });
    ctx.strokeStyle = C.ink; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(lim), y2 - 2); ctx.lineTo(X(lim), h - 8); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = X(lim) > w - 90 ? "right" : "left"; ctx.fillText("탈출 속도 ÷ 6", X(lim) + (X(lim) > w - 90 ? -4 : 4), h - 2);
  }
  function update() {
    const B = P[p], V = ve(), v = +sV.value * V;
    oV.textContent = (v / 1000).toFixed(1); oF.textContent = Math.round(+sV.value * 100);
    nVe.textContent = `${(V / 1000).toFixed(1)} km/s`;
    nFate.textContent = +sV.value >= 1 ? "탈출" : "다시 떨어짐";
    nT.textContent = B.air;
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === p)));
    draw();
  }
  sV.addEventListener("input", update);
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { p = b.dataset.p; update(); }));
  update();
})();
