/* 카드: 전자는 원자핵 둘레의 어디에 있을까? — 수소 오비탈의 |ψ|² 표본점과 지름 확률 분포 */
(() => {
  const root = document.getElementById("card-emq-orbital");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sN = $(".n"), oN = $(".n-out"), nP = $(".n-p"), nB = $(".n-b"), nE = $(".n-e");
  let orb = "1s";
  // 지름 확률 P(r) (r: a₀ 단위, 정규화 안 함), 각도 분포 f(cosθ), 주양자수
  const O = {
    "1s": [(r) => r * r * Math.exp(-2 * r), () => 1, 1],
    "2s": [(r) => r * r * (2 - r) ** 2 * Math.exp(-r), () => 1, 2],
    "2p": [(r) => r ** 4 * Math.exp(-r), (c) => c * c, 2],
    "3s": [(r) => r * r * (27 - 18 * r + 2 * r * r) ** 2 * Math.exp(-2 * r / 3), () => 1, 3],
    "3d": [(r) => r ** 6 * Math.exp(-2 * r / 3), (c) => (3 * c * c - 1) ** 2, 3],
  };
  const RMAX = 30, NR = 1200;
  let seed = 1; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  function sample(n) {
    const [P, A] = O[orb], cdf = []; let s = 0; for (let i = 0; i < NR; i++) { s += P((i + 0.5) / NR * RMAX); cdf.push(s); }
    seed = 17; const out = [];
    for (let k = 0; k < n; k++) {
      const u = rnd() * s; let lo = 0, hi = NR - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (cdf[m] < u) lo = m + 1; else hi = m; } const r = (lo + rnd()) / NR * RMAX;
      let c; do { c = 2 * rnd() - 1; } while (rnd() * 4 > A(c)); const ph = 2 * Math.PI * rnd(), st = Math.sqrt(1 - c * c);
      out.push([r * st * Math.cos(ph), r * c]); // x, z 투영
    }
    return out;
  }
  const peak = () => { const [P] = O[orb]; let best = 0, rb = 0; for (let i = 1; i < NR; i++) { const r = i / NR * RMAX, v = P(r); if (v > best) { best = v; rb = r; } } return rb; };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = Math.round(10 ** +sN.value), nq = O[orb][2], view = nq === 1 ? 4 : nq === 2 ? 11 : 22, cx = w * 0.26, cy = h / 2, sc = Math.min(w * 0.24, h * 0.46) / view;
    ctx.fillStyle = "#101418"; ctx.fillRect(cx - view * sc, cy - view * sc, 2 * view * sc, 2 * view * sc);
    ctx.fillStyle = "rgba(140,200,255,.7)"; const r0 = n > 2000 ? 0.9 : 1.4;
    sample(n).forEach(([x, z]) => { if (Math.abs(x) < view && Math.abs(z) < view) { ctx.beginPath(); ctx.arc(cx + x * sc, cy - z * sc, r0, 0, Math.PI * 2); ctx.fill(); } });
    ctx.strokeStyle = "rgba(224,160,42,.9)"; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, nq * nq * sc, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#d7263d"; ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#e0a02a"; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("점선: 보어 궤도", cx - view * sc + 4, cy + view * sc - 6);
    // 오른쪽: 지름 확률
    const gx0 = w * 0.56, gx1 = w - 12, gy0 = h - 26, gy1 = 18, X = (r) => gx0 + r / view * (gx1 - gx0), [P] = O[orb];
    let mx = 0; for (let i = 1; i <= 300; i++) mx = Math.max(mx, P(i / 300 * view));
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, gy1); ctx.lineTo(gx0, gy0); ctx.lineTo(gx1, gy0); ctx.stroke();
    ctx.fillStyle = "rgba(63,111,163,.25)"; ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx0, gy0); for (let i = 0; i <= 300; i++) { const r = i / 300 * view; ctx.lineTo(X(r), gy0 - P(r) / mx * (gy0 - gy1)); } ctx.lineTo(gx1, gy0); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "#e0a02a"; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(nq * nq), gy1); ctx.lineTo(X(nq * nq), gy0); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; for (let r = 0; r <= view; r += view > 12 ? 5 : view > 5 ? 2 : 1) ctx.fillText(`${r}`, X(r), gy0 + 13);
    ctx.textAlign = "right"; ctx.fillText("핵에서의 거리 (a₀)", gx1, gy0 - 6); ctx.textAlign = "left"; ctx.font = `10px ${F.sans}`; ctx.fillText("거리별 발견 확률", gx0 + 4, gy1 - 4);
  }
  function update() {
    root.querySelectorAll("[data-o]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.o === orb)));
    oN.textContent = Math.round(10 ** +sN.value).toLocaleString();
    const nq = O[orb][2], pk = peak(); nP.textContent = `${pk.toFixed(1)} a₀ (${(pk * 0.0529).toFixed(3)} nm)`; nB.textContent = `${nq * nq} a₀ (${(nq * nq * 0.0529).toFixed(3)} nm)`; nE.textContent = `${(-13.6 / (nq * nq)).toFixed(2)} eV`;
    draw();
  }
  root.querySelectorAll("[data-o]").forEach((b) => b.addEventListener("click", () => { orb = b.dataset.o; update(); }));
  sN.addEventListener("input", update); update();
})();
