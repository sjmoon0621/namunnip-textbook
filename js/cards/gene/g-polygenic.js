/* 카드: 키는 왜 고르게 이어질까? — n쌍 더하기 효과(이항 분포) + 환경(정규 분포) */
(() => {
  const root = document.getElementById("card-gene-polygenic");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sN = $(".n"), oN = $(".n-out"), sE = $(".e"), oE = $(".e-out"), nK = $(".n-k"), nX = $(".n-x"), nS = $(".n-s");
  const binom = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sN.value, sd = +sE.value, M = 2 * n, x0 = 36, x1 = w - 14, y0 = h - 26, y1 = 14, X = (cm) => x0 + (cm - 140) / 60 * (x1 - x0);
    const val = (k) => 150 + 40 * k / M, p = (k) => binom(M, k) / 2 ** M;
    // 연속 분포 (혼합 정규)
    const dens = (x) => { if (sd === 0) return 0; let s = 0; for (let k = 0; k <= M; k++) s += p(k) * Math.exp(-(((x - val(k)) / sd) ** 2) / 2) / (sd * Math.sqrt(2 * Math.PI)); return s; };
    let dmax = 0; for (let x = 140; x <= 200; x += 0.25) dmax = Math.max(dmax, dens(x));
    const pmax = Math.max(...Array.from({ length: M + 1 }, (_, k) => p(k))), bw = Math.min(26, (X(190) - X(150)) / (M + 1) * 0.8);
    const Yp = (v) => y0 - v / pmax * (y0 - y1) * 0.92;
    for (let k = 0; k <= M; k++) { ctx.fillStyle = sd === 0 ? "rgba(63,111,163,.75)" : "rgba(63,111,163,.28)"; const x = X(val(k)); ctx.fillRect(x - bw / 2, Yp(p(k)), bw, y0 - Yp(p(k))); }
    if (sd > 0) { ctx.strokeStyle = C.warn; ctx.lineWidth = 2.2; ctx.beginPath(); for (let x = 140; x <= 200; x += 0.25) { const y = y0 - dens(x) / dmax * (y0 - y1) * 0.92; x === 140 ? ctx.moveTo(X(x), y) : ctx.lineTo(X(x), y); } ctx.stroke(); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; [140, 150, 160, 170, 180, 190, 200].forEach((c) => ctx.fillText(c, X(c), y0 + 13)); ctx.textAlign = "right"; ctx.fillText("키 (cm)", x1, y0 - 4);
    ctx.textAlign = "left"; ctx.font = `10px ${F.sans}`; ctx.fillStyle = "#3f6fa3"; ctx.fillText("막대: 유전자형별 비율 (대문자 대립유전자 0개 → 왼쪽)", x0 + 4, y1 + 4); if (sd > 0) { ctx.fillStyle = C.warn; ctx.fillText("곡선: 환경의 영향까지 더한 분포", x0 + 4, y1 + 18); }
  }
  function update() {
    const n = +sN.value, sd = +sE.value; oN.textContent = n; oE.textContent = sd.toFixed(1);
    nK.textContent = `${2 * n + 1}가지`; const pe = 1 / 4 ** n; nX.textContent = pe >= 0.001 ? `각각 ${(pe * 100).toFixed(pe > 0.01 ? 1 : 2)} % (1/${4 ** n})` : `각각 1/${(4 ** n).toLocaleString()}`;
    const step = 40 / (2 * n); nS.textContent = sd === 0 ? `계단 모양 (한 계단 ${step.toFixed(1)} cm)` : sd >= step * 0.6 ? "계단이 사라진 매끄러운 종 모양" : "계단이 남은 울퉁불퉁한 모양";
    draw();
  }
  sN.addEventListener("input", update); sE.addEventListener("input", update); update();
})();
