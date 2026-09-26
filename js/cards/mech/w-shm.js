/* 카드: 용수철에 매단 추는 언제 가장 빠르고, 언제 가장 세게 당겨질까? — 용수철 진자의 단진동, x(t)·a(t) 그래프, a–x 관계 */
(() => {
  const root = document.getElementById("card-mech-shm");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sK = $(".k"), sM = $(".m"), sA = $(".a"), oK = $(".k-out"), oM = $(".m-out"), oA = $(".a-out");
  const nT = $(".n-t"), nV = $(".n-v"), nA = $(".n-a"), pause = $(".pause");
  let t = 0, running = true;
  const w0 = () => Math.sqrt(+sK.value / +sM.value);

  const { ctx, size } = fit(cv, () => draw());
  function spring(x0, x1, y, coils) {
    ctx.beginPath(); ctx.moveTo(x0, y);
    const n = coils * 2, dx = (x1 - x0 - 16) / n;
    ctx.lineTo(x0 + 8, y);
    for (let i = 0; i < n; i++) ctx.lineTo(x0 + 8 + dx * (i + 0.5), y + (i % 2 ? 8 : -8));
    ctx.lineTo(x1 - 8, y); ctx.lineTo(x1, y); ctx.stroke();
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const A = +sA.value, om = w0(), x = A * Math.cos(om * t), v = -A * om * Math.sin(om * t), a = -om * om * x;
    // 위: 용수철과 추
    const top = 18, eq = w * 0.5, sc = (w * 0.3) / 0.2;   // 0.2 m → 화면 30%
    const floorY = top + 50;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(10, floorY); ctx.lineTo(w - 10, floorY); ctx.stroke();
    ctx.fillStyle = "#8d8d92"; ctx.fillRect(10, top, 8, floorY - top);
    const bx = eq + x * sc;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; spring(18, bx - 18, floorY - 16, 10);
    ctx.fillStyle = "#e6d3b3"; ctx.strokeStyle = C.ink; ctx.fillRect(bx - 18, floorY - 32, 36, 32); ctx.strokeRect(bx - 18, floorY - 32, 36, 32);
    ctx.setLineDash([3, 4]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(eq, top); ctx.lineTo(eq, floorY + 6); ctx.stroke(); ctx.setLineDash([]);
    const arrow = (x0, y, dx, col, lab) => { if (Math.abs(dx) < 3) return; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + dx, y); ctx.stroke(); const s = Math.sign(dx); ctx.beginPath(); ctx.moveTo(x0 + dx, y); ctx.lineTo(x0 + dx - s * 7, y - 4); ctx.lineTo(x0 + dx - s * 7, y + 4); ctx.fill(); ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(lab, x0 + dx + s * 10, y + 4); };
    const vmax = A * om, amax = A * om * om;
    arrow(bx, floorY - 40, v / Math.max(vmax, 1e-6) * 50 * (A / 0.2 + 0.3), "#3b7c2a", "v");
    arrow(bx, floorY + 14, a / Math.max(amax, 1e-6) * 50 * (A / 0.2 + 0.3), "#b5532f", "a");
    // 아래 왼쪽: x(t), a(t) 두 주기
    const gx = 34, gy = floorY + 36, gw = w * 0.6 - gx, gh = h - gy - 16, T = 2 * Math.PI / om;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy + gh / 2); ctx.lineTo(gx + gw, gy + gh / 2); ctx.stroke();
    const plot = (fn, col) => { ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.beginPath(); for (let i = 0; i <= 120; i++) { const tt = t - 2 * T + 2 * T * i / 120; const y = gy + gh / 2 - fn(tt) * gh * 0.45; i ? ctx.lineTo(gx + gw * i / 120, y) : ctx.moveTo(gx, y); } ctx.stroke(); };
    plot((tt) => Math.cos(om * tt) * A / 0.2, "#3f6fa3");
    plot((tt) => -Math.cos(om * tt) * A / 0.2, "rgba(181,83,47,.8)");
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = "#3f6fa3"; ctx.fillText("변위 x", gx, gy - 4); ctx.fillStyle = "#b5532f"; ctx.fillText("가속도 a (모양만)", gx + 50, gy - 4);
    ctx.fillStyle = C.ink3; ctx.fillText("← 두 주기 전", gx, gy + gh + 12); ctx.textAlign = "right"; ctx.fillText("지금", gx + gw, gy + gh + 12);
    // 아래 오른쪽: a–x 관계
    const px = w * 0.66, pw = w - px - 16, pc = gy + gh / 2, pcx = px + pw / 2;
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(px, pc); ctx.lineTo(px + pw, pc); ctx.moveTo(pcx, gy); ctx.lineTo(pcx, gy + gh); ctx.stroke();
    const amaxAll = 0.2 * 80 / 0.1;   // 눈금 고정 (가장 큰 k/m, 가장 큰 A)
    const xa = (xx) => pcx + xx / 0.2 * pw / 2, ya = (aa) => pc - aa / (amaxAll * 0.25) * gh / 2;
    ctx.strokeStyle = "#8a4fb0"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xa(-A), ya(om * om * A)); ctx.lineTo(xa(A), ya(-om * om * A)); ctx.stroke();
    ctx.fillStyle = "#8a4fb0"; ctx.beginPath(); ctx.arc(xa(x), ya(a), 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("a–x: 기울기 = −ω²", px, gy - 4);
    ctx.fillText("x", px + pw - 8, pc - 4); ctx.fillText("a", pcx + 4, gy + 8);
  }
  function update() {
    oK.textContent = sK.value; oM.textContent = (+sM.value).toFixed(2); oA.textContent = (+sA.value).toFixed(2);
    const om = w0(), A = +sA.value;
    nT.textContent = `${(2 * Math.PI / om).toFixed(2)} s`; nV.textContent = `${(A * om).toFixed(2)} m/s`; nA.textContent = `${(A * om * om).toFixed(1)} m/s²`;
    draw();
  }
  [sK, sM, sA].forEach((el) => el.addEventListener("input", update));
  pause.addEventListener("click", () => { running = !running; pause.textContent = running ? "멈춤" : "다시 움직이기"; });
  loop(cv, (dt) => { if (running) t += dt; draw(); });
  update();
})();
