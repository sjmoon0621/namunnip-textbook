/* 카드: 자기장으로 원자의 질량을 잴 수 있을까? — r = mv/qB, 질량 분석기 */
(() => {
  const root = document.getElementById("card-emq-lorentz");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sV = $(".v"), oV = $(".v-out"), sB = $(".b"), oB = $(".b-out"), nV = $(".n-v"), nR = $(".n-r"), nT = $(".n-t");
  const mp = 1.6726e-27, e = 1.602e-19;
  const P = { p: ["¹H⁺", mp, e, "#b5532f"], d: ["²H⁺", 2.0136 / 1.00728 * mp, e, "#8a4fb5"], a: ["⁴He²⁺", 4.0015 / 1.00728 * mp, 2 * e, "#3b7c2a"], e: ["e⁻", 9.109e-31, -e, "#3f6fa3"] };
  const on = { p: true, d: true, a: false, e: false };
  const calc = (k) => { const [, m, q] = P[k], V = 10 ** +sV.value, B = +sB.value, v = Math.sqrt(2 * Math.abs(q) * V / m); return { v, r: m * v / (Math.abs(q) * B), T: 2 * Math.PI * m / (Math.abs(q) * B) }; };
  const len = (x) => x >= 1 ? `${x.toFixed(2)} m` : x >= 0.01 ? `${(x * 100).toFixed(1)} cm` : `${(x * 1000).toFixed(2)} mm`;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    // 자기장 영역 (⊗ 무늬)
    const top = 10, bot = h - 34, ex = w * 0.5;
    ctx.fillStyle = "rgba(63,111,163,.06)"; ctx.fillRect(0, top, w, bot - top);
    ctx.strokeStyle = "rgba(63,111,163,.35)"; ctx.lineWidth = 1; for (let x = 20; x < w; x += 34) for (let y = top + 16; y < bot; y += 30) { ctx.beginPath(); ctx.moveTo(x - 3, y - 3); ctx.lineTo(x + 3, y + 3); ctx.moveTo(x + 3, y - 3); ctx.lineTo(x - 3, y + 3); ctx.stroke(); }
    // 검출판(아래 경계)과 입구
    ctx.fillStyle = C.ink; ctx.fillRect(0, bot, w, 4); ctx.fillStyle = "#fff"; ctx.fillRect(ex - 5, bot, 10, 4);
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("입구", ex, bot + 16); ctx.textAlign = "left"; ctx.fillText("검출판", 6, bot + 16);
    const ions = Object.keys(on).filter((k) => on[k] && k !== "e"), rmax = Math.max(1e-9, ...ions.map((k) => calc(k).r));
    const sc = Math.min((w * 0.46) / (2 * rmax), (bot - top - 10) / rmax);
    const drawPath = (k, R, lab) => {
      const [name, , q, col] = P[k], sgn = q > 0 ? -1 : 1; // 양전하: 위로 들어와 왼쪽으로 휨(B 안쪽, F = qv×B)
      const cx = ex + sgn * R; ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(cx, bot, R, sgn < 0 ? 0 : Math.PI, sgn < 0 ? Math.PI : 2 * Math.PI, true); ctx.stroke();
      const land = ex + 2 * sgn * R; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(land, bot, 5, 0, Math.PI * 2); ctx.fill();
      ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(lab, land, bot - 10);
      // 힘 화살표(궤적 꼭대기에서 중심 쪽)
      ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, bot - R); ctx.lineTo(cx, bot - R + Math.min(24, R * 0.4)); ctx.stroke();
    };
    ions.forEach((k) => drawPath(k, calc(k).r * sc, P[k][0]));
    if (on.e) { const R = Math.min(60, Math.max(14, calc("e").r * sc * 40)); drawPath("e", R, "e⁻ (확대)"); }
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("⊗ 자기장 (화면 안쪽)", w - 6, top + 12);
    ctx.textAlign = "left"; ctx.fillText(`축척: 입구에서 가장 먼 도착점까지 ${len(2 * rmax)}`, 6, top + 12);
  }
  function update() {
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(on[b.dataset.p])));
    oV.textContent = Math.round(10 ** +sV.value); oB.textContent = (+sB.value).toFixed(2);
    const ks = Object.keys(on).filter((k) => on[k]);
    nV.textContent = ks.map((k) => `${P[k][0]} ${(calc(k).v / 1000).toFixed(0)} km/s`).join(" · ") || "—";
    nR.textContent = ks.map((k) => `${P[k][0]} ${len(calc(k).r)}`).join(" · ") || "—";
    nT.textContent = ks.map((k) => { const T = calc(k).T; return `${P[k][0]} ${T < 1e-6 ? (T * 1e9).toFixed(2) + " ns" : (T * 1e6).toFixed(2) + " μs"}`; }).join(" · ") || "—";
    draw();
  }
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { on[b.dataset.p] = !on[b.dataset.p]; update(); }));
  sV.addEventListener("input", update); sB.addEventListener("input", update); update();
})();
