/* 카드: 바닷물을 마실 물로 바꾸려면 얼마나 세게 눌러야 할까? — π = cRT, U자관, 역삼투 */
(() => {
  const root = document.getElementById("card-mateng-osmosis");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sC = $(".c"), sP = $(".p"), oC = $(".c-out"), oP = $(".p-out");
  const nPi = $(".n-pi"), nHh = $(".n-hh"), nDir = $(".n-dir");
  const R = 0.08206, T = 298;
  const SOL = { sugar: 0.1, saline: 0.308, sea: 1.1 };
  let ph = 0;
  const pi = () => +sC.value * R * T;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const P = +sP.value, net = pi() - P;   // >0 이면 물이 용액 쪽으로
    const cx = w * 0.5, tw = Math.min(70, w * 0.2), bot = h - 34, top = 30;
    const lvl = Math.max(-1, Math.min(1, net / 30)) * 50;   // 수면 차 (모식)
    const lL = h * 0.45 + lvl, lR = h * 0.45 - lvl;
    // U자관
    ctx.fillStyle = "rgba(110,164,230,.35)"; ctx.fillRect(cx - tw * 2, lL, tw, bot - lL); ctx.fillRect(cx - tw * 2, bot - 30, tw * 4, 30);
    ctx.fillStyle = "rgba(224,160,42,.35)"; ctx.fillRect(cx + tw, lR, tw, bot - lR); ctx.fillRect(cx, bot - 30, tw * 2, 30);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - tw * 2, top); ctx.lineTo(cx - tw * 2, bot); ctx.lineTo(cx + tw * 2, bot); ctx.lineTo(cx + tw * 2, top); ctx.moveTo(cx - tw, top); ctx.lineTo(cx - tw, bot - 30); ctx.lineTo(cx + tw, bot - 30); ctx.lineTo(cx + tw, top); ctx.stroke();
    // 막
    ctx.strokeStyle = "#3b7c2a"; ctx.lineWidth = 3; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(cx, bot - 30); ctx.lineTo(cx, bot); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#3b7c2a"; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("반투과성 막", cx, bot + 14);
    // 용질 입자 (오른쪽만)
    let s = 4; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    ctx.fillStyle = "#b5532f"; const n = Math.round(+sC.value * 40);
    for (let i = 0; i < n; i++) { const inTube = rnd() < 0.6; const x = inTube ? cx + tw + 6 + rnd() * (tw - 12) : cx + 6 + rnd() * (tw - 12), y = inTube ? lR + 6 + rnd() * (bot - lR - 12) : bot - 26 + rnd() * 22; ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill(); }
    // 물의 흐름 화살표 (움직임)
    if (Math.abs(net) > 0.2) {
      const dir = Math.sign(net), off = ((ph * 30) % 30) * dir;
      ctx.fillStyle = "#3f6fa3"; for (let k = -1; k <= 1; k++) { const x = cx + k * 30 + off; ctx.beginPath(); ctx.moveTo(x + dir * 8, bot - 15); ctx.lineTo(x - dir * 4, bot - 21); ctx.lineTo(x - dir * 4, bot - 9); ctx.fill(); }
    }
    // 피스톤 (오른쪽 위)
    if (P > 0) { ctx.fillStyle = "#8d8d92"; ctx.fillRect(cx + tw + 2, lR - 14, tw - 4, 12); ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.fillText(`${P} atm ↓`, cx + tw * 1.5, lR - 20); }
    ctx.fillStyle = C.ink2; ctx.font = `600 12px ${F.sans}`; ctx.fillText("순수한 물", cx - tw * 1.5, top - 8); ctx.fillText("용액", cx + tw * 1.5, top - 8);
    ctx.textAlign = "left"; ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.fillText("파란 삼각형: 물의 알짜 이동 · 붉은 점: 용질 입자", 8, h - 4);
  }
  function update() {
    oC.textContent = (+sC.value).toFixed(2); oP.textContent = sP.value;
    const p = pi(), net = p - +sP.value;
    nPi.textContent = `${p.toFixed(1)} atm`; nHh.textContent = `약 ${(p * 101325 / (1000 * 9.8)).toFixed(0)} m`;
    nDir.textContent = Math.abs(net) < 0.2 ? "평형 (알짜 이동 없음)" : net > 0 ? "물 → 용액 (삼투)" : "용액 → 물 (역삼투)";
    nDir.classList.toggle("bad", net < -0.2);
    root.querySelectorAll("[data-sol]").forEach((b) => b.setAttribute("aria-pressed", String(Math.abs(SOL[b.dataset.sol] - +sC.value) < 0.005)));
    draw();
  }
  [sC, sP].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-sol]").forEach((b) => b.addEventListener("click", () => { sC.value = SOL[b.dataset.sol]; update(); }));
  loop(cv, (dt) => { ph += dt; draw(); });
  update();
})();
