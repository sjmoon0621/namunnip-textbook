/* 카드: 에너지가 모자란 전자가 어떻게 벽을 통과할까? — 사각 장벽 투과 확률 (정확한 1차원 해) */
(() => {
  const root = document.getElementById("card-emq-tunnel");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sE = $(".e"), oE = $(".e-out"), sA = $(".a"), oA = $(".a-out"), nT = $(".n-t"), nK = $(".n-k"), nD = $(".n-d");
  const V0 = 5, K0 = 5.1232; // √(2m_e·1 eV)/ħ = 5.1232 nm⁻¹
  function T(E, a) {
    if (Math.abs(E - V0) < 1e-6) E += 1e-6;
    if (E < V0) { const k = K0 * Math.sqrt(V0 - E), s = Math.sinh(k * a); return 1 / (1 + V0 * V0 * s * s / (4 * E * (V0 - E))); }
    const k = K0 * Math.sqrt(E - V0), s = Math.sin(k * a); return 1 / (1 + V0 * V0 * s * s / (4 * E * (E - V0)));
  }
  const sci = (x) => { if (x > 0.01) return `${(x * 100).toFixed(x > 0.1 ? 0 : 1)} %`; const e = Math.floor(Math.log10(x)), m = x / 10 ** e; return `${m.toFixed(1)} × 10${String(e).replace("-", "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d])}`; };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const E = +sE.value, a = +sA.value, t = T(E, a);
    // 위: 장벽과 파동
    const x0 = 14, x1 = w - 14, top = 12, base = h * 0.52, span = 3.2, X = (x) => x0 + (x + 1.2) / span * (x1 - x0), Ye = (e) => base - e / 8 * (base - top);
    ctx.fillStyle = "rgba(181,83,47,.18)"; ctx.fillRect(X(0), Ye(V0), X(a) - X(0), base - Ye(V0)); ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.strokeRect(X(0), Ye(V0), X(a) - X(0), base - Ye(V0));
    ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(x0, Ye(E)); ctx.lineTo(x1, Ye(E)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`전자의 에너지 ${E.toFixed(1)} eV`, x0, Ye(E) - 4); ctx.fillStyle = C.warn; ctx.fillText("장벽 5 eV", X(0) + 3, Ye(V0) - 4);
    // 파동: 왼쪽 진폭 1, 장벽 속 감쇠(또는 진동), 오른쪽 진폭 √T
    const amp = 18, kk = K0 * Math.sqrt(E), kap = K0 * Math.sqrt(Math.abs(V0 - E)), At = Math.sqrt(t);
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2; ctx.beginPath();
    for (let px = x0; px <= x1; px += 1.5) {
      const x = (px - x0) / (x1 - x0) * span - 1.2; let y;
      if (x < 0) y = Math.cos(kk * x);
      else if (x <= a) y = E < V0 ? 0 : Math.cos(kap * x) * (1 + At) / 2;
      else y = At * Math.cos(kk * (x - a));
      if (x >= 0 && x <= a && E < V0) { const d = Math.exp(-kap * x), d2 = Math.exp(-kap * a); y = d2 >= 1 ? 1 : (d - d2) / (1 - d2) * (1 - At) + At; }
      const yy = Ye(E) - y * amp; px === x0 ? ctx.moveTo(px, yy) : ctx.lineTo(px, yy);
    }
    ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("들어오는 파동", X(-0.7), base - 4); ctx.fillText(`지나간 파동 (확률 ${sci(t)})`, X(a + (1.9 - a) / 2), base - 4);
    // 아래: T 대 두께 (로그)
    const gy0 = h - 22, gy1 = base + 18, gx0 = 50, gx1 = w - 14, Xa = (aa) => gx0 + aa / 1.5 * (gx1 - gx0), Yt = (tt) => gy0 - (Math.log10(Math.max(tt, 1e-14)) + 14) / 14 * (gy0 - gy1);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, gy1); ctx.lineTo(gx0, gy0); ctx.lineTo(gx1, gy0); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; [0, -7, -14].forEach((e) => ctx.fillText(e === 0 ? "1" : `10${String(e).replace("-", "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d])}`, gx0 - 4, Yt(10 ** e) + 3));
    ctx.textAlign = "center"; [0, 0.5, 1, 1.5].forEach((aa) => { ctx.textAlign = aa === 1.5 ? "right" : "center"; ctx.fillText(`${aa} nm`, Xa(aa), gy0 + 13); });
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2; ctx.beginPath(); for (let aa = 0.01; aa <= 1.5; aa += 0.01) { const y = Yt(T(E, aa)); aa < 0.015 ? ctx.moveTo(Xa(aa), y) : ctx.lineTo(Xa(aa), y); } ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(Xa(a), Yt(t), 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("투과 확률 (로그 눈금) — 장벽 두께", gx0 + 6, gy1 + 2);
  }
  function update() {
    const E = +sE.value, a = +sA.value; oE.textContent = E.toFixed(1); oA.textContent = a.toFixed(2);
    const t = T(E, a); nT.textContent = sci(t);
    nK.textContent = E < V0 ? `${(1 / (K0 * Math.sqrt(V0 - E))).toFixed(3)} nm` : "장벽보다 에너지가 커서 감쇠하지 않음";
    const r = T(E, a + 0.1) / t; nD.textContent = r < 1 ? `약 ${(1 / r).toFixed(1)}분의 1로 줄어듦` : `약 ${r.toFixed(2)}배`;
    draw();
  }
  sE.addEventListener("input", update); sA.addEventListener("input", update); update();
})();
