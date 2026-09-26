/* 카드: 기체를 데우면 압력은 왜 커질까? — 입자 상자와 PV = nRT */
(() => {
  const root = document.getElementById("card-mech-ideal-gas");
  if (!root) return;
  const { C, F, fit, loop, reduce } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), sV = $(".v"), sN = $(".n"), oT = $(".t-out"), oV = $(".v-out"), oN = $(".n-out");
  const nP = $(".n-p"), nVr = $(".n-vr"), nK = $(".n-k");
  const R = 8.314;
  let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const MAXN = 80; const parts = Array.from({ length: MAXN }, () => ({ x: rnd(), y: rnd(), a: rnd() * Math.PI * 2 }));
  let hits = 0, hitT = 0, hitRate = 0;

  const { ctx, size } = fit(cv, () => draw());
  const P = () => +sN.value * R * +sT.value / (+sV.value / 1000);   // Pa
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const boxL = 20, boxT = 20, boxH = h - 40, maxW = w * 0.62, bw = maxW * (+sV.value / 50);
    // 용기와 피스톤
    const t = (+sT.value - 100) / 500;
    ctx.fillStyle = `rgba(${Math.round(63 + 170 * t)},${Math.round(111 - 30 * t)},${Math.round(163 - 110 * t)},.08)`; ctx.fillRect(boxL, boxT, bw, boxH);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(boxL + bw, boxT); ctx.lineTo(boxL, boxT); ctx.lineTo(boxL, boxT + boxH); ctx.lineTo(boxL + bw, boxT + boxH); ctx.stroke();
    ctx.fillStyle = "#8d8d92"; ctx.fillRect(boxL + bw, boxT - 6, 12, boxH + 12); ctx.fillRect(boxL + bw + 12, boxT + boxH / 2 - 4, Math.max(0, w - 130 - (boxL + bw + 12)), 8);
    const n = Math.round(MAXN * +sN.value / 2);
    ctx.fillStyle = "#b5532f";
    for (let i = 0; i < n; i++) { const p = parts[i]; ctx.beginPath(); ctx.arc(boxL + 4 + p.x * (bw - 8), boxT + 4 + p.y * (boxH - 8), 3.2, 0, Math.PI * 2); ctx.fill(); }
    // 오른쪽: 압력계
    const gx = w - 70, gy = h / 2, gr = Math.min(48, h * 0.28), Pk = P() / 1000, frac = Math.min(1, Pk / 500);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(gx, gy, gr, Math.PI * 0.75, Math.PI * 2.25); ctx.stroke();
    const a = Math.PI * 0.75 + frac * Math.PI * 1.5;
    ctx.strokeStyle = "#b5532f"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + Math.cos(a) * gr * 0.85, gy + Math.sin(a) * gr * 0.85); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(`${Pk.toFixed(0)} kPa`, gx, gy + gr * 0.55);
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.fillText(`벽 충돌 ${hitRate.toFixed(0)}회/초 (그림)`, gx, gy + gr + 16);
  }
  function update() {
    oT.textContent = sT.value; oV.textContent = (+sV.value).toFixed(1); oN.textContent = (+sN.value).toFixed(1);
    const p = P();
    nP.textContent = `${(p / 1000).toFixed(0)} kPa (${(p / 101325).toFixed(2)}기압)`;
    nVr.textContent = `${Math.sqrt(3 * R * +sT.value / 0.028).toFixed(0)} m/s`;
    nK.textContent = `${(p * +sV.value / 1000 / +sT.value).toFixed(2)} J/K (= nR)`;
    draw();
  }
  [sT, sV, sN].forEach((el) => el.addEventListener("input", update));
  loop(cv, (dt) => {
    if (reduce) return;
    const { w, h } = size; if (!w) return;
    const bw = w * 0.62 * (+sV.value / 50), boxH = h - 40, sp = 0.35 * Math.sqrt(+sT.value / 300) * dt * 300;   // 화면 px/초 ∝ √T
    const n = Math.round(MAXN * +sN.value / 2);
    for (let i = 0; i < n; i++) {
      const p = parts[i];
      p.x += Math.cos(p.a) * sp / bw; p.y += Math.sin(p.a) * sp / boxH;
      if (p.x < 0) { p.x = -p.x; p.a = Math.PI - p.a; hits++; } if (p.x > 1) { p.x = 2 - p.x; p.a = Math.PI - p.a; hits++; }
      if (p.y < 0) { p.y = -p.y; p.a = -p.a; hits++; } if (p.y > 1) { p.y = 2 - p.y; p.a = -p.a; hits++; }
    }
    hitT += dt; if (hitT > 1) { hitRate = hits / hitT; hits = 0; hitT = 0; }
    draw();
  });
  update();
})();
