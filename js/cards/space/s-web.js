/* 카드: 거의 고르던 초기 우주에서 어떻게 거미줄 구조가 생겼을까? — 2차원 젤도비치 근사 */
(() => {
  const root = document.getElementById("card-space-cosmic-web");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), oT = $(".t-out"), sA = $(".a"), oA = $(".a-out"), nS = $(".n-s"), nV = $(".n-v");
  // 무작위 퍼텐셜 ψ = Σ A_k cos(k·q + φ), 변위 = −D ∇ψ
  let seed = 4; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const MODES = []; for (let i = 0; i < 40; i++) { const kk = 2 + Math.floor(rnd() * 6), ang = rnd() * Math.PI * 2, kx = Math.round(kk * Math.cos(ang)), ky = Math.round(kk * Math.sin(ang)); if (!kx && !ky) continue; const k2 = kx * kx + ky * ky; MODES.push([kx, ky, 1 / (k2 ** 1.2), rnd() * Math.PI * 2]); }
  const N = 110;
  const disp = (qx, qy) => { let dx = 0, dy = 0; MODES.forEach(([kx, ky, A, ph]) => { const s = Math.sin(2 * Math.PI * (kx * qx + ky * qy) + ph) * A * 2 * Math.PI; dx += kx * s; dy += ky * s; }); return [dx, dy]; };
  const D = Array.from({ length: N * N }, (_, i) => { const qx = (i % N + rnd()) / N, qy = (Math.floor(i / N) + rnd()) / N; return [qx, qy, ...disp(qx, qy)]; });
  const norm = Math.max(...D.map((d) => Math.hypot(d[2], d[3])));
  const grow = () => (+sT.value / 100) ** 1.5 * 0.22 * +sA.value / norm;
  function positions() { const g = grow(); return D.map(([qx, qy, dx, dy]) => [((qx + g * dx) % 1 + 1) % 1, ((qy + g * dy) % 1 + 1) % 1]); }
  const { ctx, size } = fit(cv, () => draw());
  let voidFrac = 0;
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#05060a"; ctx.fillRect(0, 0, w, h);
    const P = positions(), G = 36, cnt = new Array(G * G).fill(0);
    ctx.fillStyle = "rgba(170,200,255,.55)"; P.forEach(([x, y]) => { ctx.fillRect(x * w, y * h, 1.4, 1.4); cnt[Math.min(G - 1, Math.floor(y * G)) * G + Math.min(G - 1, Math.floor(x * G))]++; });
    const mean = P.length / (G * G); voidFrac = cnt.filter((c) => c < 0.35 * mean).length / cnt.length;
    ctx.fillStyle = "#aaa"; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(+sT.value === 0 ? "초기 우주: 거의 고른 분포" : "밝은 선: 벽과 실 · 어두운 곳: 보이드", 8, h - 8);
  }
  function update() {
    const t = +sT.value; oT.textContent = t === 0 ? "처음 (우주 배경 복사 무렵)" : t < 40 ? "초기" : t < 80 ? "중간" : "현재에 가까움"; oA.textContent = (+sA.value).toFixed(2);
    draw();
    const g = grow() * norm; nS.textContent = +sA.value === 0 ? "요동이 없어 아무 구조도 생기지 않음" : g < 0.03 ? "거의 고른 분포 (작은 요동만 있음)" : g < 0.1 ? "물질이 얇은 벽과 실로 모이기 시작" : "벽·실·매듭(은하단)과 넓은 보이드로 이루어진 거미줄";
    nV.textContent = `약 ${Math.round(voidFrac * 100)} %`;
  }
  sT.addEventListener("input", update); sA.addEventListener("input", update); update();
})();
