/* 카드: 어두운 곳에서 찍은 사진은 왜 자글자글할까? — 광자 수(푸아송), 띠틈 문턱, 포화 */
(() => {
  const root = document.getElementById("card-emq-pixels");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sP = $(".p"), oP = $(".p-out"), sL = $(".l"), oL = $(".l-out"), nE = $(".n-e"), nN = $(".n-n"), nS = $(".n-s");
  const GW = 64, GH = 44, QE = 0.6, FULL = 10000, GAP = 1.12;
  // 장면: 해·산·집 모양의 밝기 지도 (0~1)
  const scene = Array.from({ length: GW * GH }, (_, i) => {
    const x = (i % GW) / GW, y = Math.floor(i / GW) / GH;
    let v = 0.35 + 0.4 * (1 - y); // 하늘 그러데이션
    if ((x - 0.75) ** 2 + (y - 0.25) ** 2 < 0.012) v = 1;                  // 해
    if (y > 0.55 - 0.25 * Math.sin(x * Math.PI)) v = 0.18 + 0.1 * x;       // 산
    if (x > 0.15 && x < 0.38 && y > 0.6 && y < 0.9) v = 0.6;                // 집
    if (x > 0.22 && x < 0.3 && y > 0.72 && y < 0.9) v = 0.08;               // 문
    return v;
  });
  // 결정적 난수 (같은 설정이면 같은 잡음)
  let seed = 1; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const poisson = (m) => { if (m > 30) { const u = rnd(), v = rnd(); return Math.max(0, Math.round(m + Math.sqrt(m) * Math.sqrt(-2 * Math.log(u + 1e-12)) * Math.cos(2 * Math.PI * v))); } let L = Math.exp(-m), k = 0, p = 1; do { k++; p *= rnd(); } while (p > L); return k - 1; };
  const eph = (nm) => 1239.8 / nm;
  function image() { seed = 7; const Np = 10 ** +sP.value, ok = eph(+sL.value) >= GAP; return scene.map((v) => ok ? Math.min(FULL, poisson(Np * v * QE)) : 0); }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const img = image(), Np = 10 ** +sP.value, maxE = Math.max(1, Math.min(FULL, Np * QE)), pw = Math.min((w * 0.58) / GW, (h - 20) / GH), ox = 10, oy = 10;
    img.forEach((n, i) => { const g = Math.round(255 * Math.min(1, n / maxE)); ctx.fillStyle = `rgb(${g},${g},${g})`; ctx.fillRect(ox + (i % GW) * pw, oy + Math.floor(i / GW) * pw, pw + 0.5, pw + 0.5); });
    const row = Math.floor(GH * 0.4); ctx.strokeStyle = C.amber; ctx.lineWidth = 1; ctx.strokeRect(ox, oy + row * pw, GW * pw, pw);
    // 한 줄의 값
    const gx0 = ox + GW * pw + 24, gx1 = w - 10, gy0 = h - 24, gy1 = 18, Y = (n) => gy0 - n / (maxE * 1.25) * (gy0 - gy1);
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(gx0, gy1); ctx.lineTo(gx0, gy0); ctx.lineTo(gx1, gy0); ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); for (let x = 0; x < GW; x++) { const m = Np * scene[row * GW + x] * QE * (eph(+sL.value) >= GAP ? 1 : 0), X = gx0 + (gx1 - gx0) * (x + 0.5) / GW; x ? ctx.lineTo(X, Y(Math.min(FULL, m))) : ctx.moveTo(X, Y(Math.min(FULL, m))); } ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#3f6fa3"; for (let x = 0; x < GW; x++) { const X = gx0 + (gx1 - gx0) * (x + 0.5) / GW; ctx.beginPath(); ctx.arc(X, Y(img[row * GW + x]), 1.8, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("노란 줄의 픽셀별 전자 수", gx0 + 4, gy1 - 6); ctx.fillText("점선: 평균 · 점: 실제", gx0 + 4, gy0 + 14);
  }
  function update() {
    const Np = 10 ** +sP.value, nm = +sL.value, E = eph(nm), ok = E >= GAP; oP.textContent = Np < 10 ? Np.toFixed(1) : Math.round(Np).toLocaleString(); oL.textContent = nm;
    nE.textContent = `${E.toFixed(2)} eV ${ok ? "(띠틈 1.12 eV보다 큼)" : "(띠틈보다 작아 전자를 못 만듦)"}`;
    const N = ok ? Math.min(FULL, Np * QE) : 0; nN.textContent = ok ? `약 ${Math.round(N).toLocaleString()}개${Np * QE > FULL ? " (포화: 하얗게 날아감)" : ""}` : "0개";
    nS.textContent = N > 0 ? `약 ${Math.sqrt(N).toFixed(N < 100 ? 1 : 0)}` : "—";
    draw();
  }
  sP.addEventListener("input", update); sL.addEventListener("input", update); update();
})();
