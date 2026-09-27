/* 카드: 도선을 둥글게 감으면 자기장은 어떻게 달라질까? — 단면 도선들의 2D 자기장(중첩)과 3D 공식의 세기 */
(() => {
  const root = document.getElementById("card-emq-bfield");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sI = $(".i"), oI = $(".i-out"), sP = $(".p"), oP = $(".p-out"), lab = $(".p-lab"), nB = $(".n-b"), nC = $(".n-c");
  let mode = "line";
  const MU = 4e-7 * Math.PI;
  const LAB = { line: ["도선에서의 거리 r = ", " cm", 0.5, 10, 0.5, 2], loop: ["고리의 반지름 R = ", " cm", 1, 10, 0.5, 3], sol: ["1 cm당 감은 수 = ", " 회", 1, 20, 1, 5] };
  function wires(w, h) {
    const cx = w / 2, cy = h / 2;
    if (mode === "line") return [[cx, cy, 1]];
    if (mode === "loop") { const R = Math.min(h * 0.3, 18 + +sP.value * 9); return [[cx, cy - R, 1], [cx, cy + R, -1]]; }
    const N = 9, Lx = w * 0.5, out = []; for (let i = 0; i < N; i++) { const x = cx - Lx / 2 + Lx * i / (N - 1); out.push([x, cy - h * 0.18, 1], [x, cy + h * 0.18, -1]); } return out;
  }
  // 화면 좌표(y 아래)에서 ⊙ 전류 둘레가 반시계로 보이도록 부호를 잡는다
  const field = (W, x, y) => { let bx = 0, by = 0; for (const [wx, wy, s] of W) { const dx = x - wx, dy = y - wy, r2 = dx * dx + dy * dy + 4; bx += s * dy / r2; by += -s * dx / r2; } return [bx, by]; };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const W = wires(w, h), cx = w / 2, cy = h / 2;
    // 씨앗: 화면 위 세로선과 도선 근처
    const seeds = [];
    if (mode === "line") for (let k = 1; k <= 6; k++) seeds.push([cx + k * k * 4 + 8, cy]);
    else if (mode === "loop") { const R = cy - W[0][1]; seeds.push([cx, cy]); [0.25, 0.5, 0.72, 0.88].forEach((f) => { seeds.push([cx, cy - R * f]); seeds.push([cx, cy + R * f]); }); }
    else { for (let k = -2; k <= 2; k++) seeds.push([cx, cy + k * h * 0.055]); }
    ctx.strokeStyle = "rgba(63,111,163,.75)"; ctx.lineWidth = 1.3;
    seeds.forEach(([sx, sy]) => {
      for (const dir of [1, -1]) {
        let x = sx, y = sy; ctx.beginPath(); ctx.moveTo(x, y); let arrowAt = null;
        for (let n = 0; n < 1600; n++) {
          const [bx, by] = field(W, x, y), m = Math.hypot(bx, by) || 1e-9, st = 2.5;
          const [bx2, by2] = field(W, x + dir * bx / m * st / 2, y + dir * by / m * st / 2), m2 = Math.hypot(bx2, by2) || 1e-9;
          x += dir * bx2 / m2 * st; y += dir * by2 / m2 * st; ctx.lineTo(x, y);
          if (n === 60 && dir === 1) arrowAt = [x, y, bx2 / m2, by2 / m2];
          if (x < -20 || x > w + 20 || y < -20 || y > h + 20) break;
          if (n > 40 && Math.hypot(x - sx, y - sy) < 2.5) break;
          if (W.some(([wx, wy]) => Math.hypot(x - wx, y - wy) < 5)) break;
        }
        ctx.stroke();
        if (arrowAt) { const [ax, ay, ux, uy] = arrowAt; ctx.fillStyle = "#3f6fa3"; ctx.beginPath(); ctx.moveTo(ax + ux * 6, ay + uy * 6); ctx.lineTo(ax - ux * 4 - uy * 4, ay - uy * 4 + ux * 4); ctx.lineTo(ax - ux * 4 + uy * 4, ay - uy * 4 - ux * 4); ctx.fill(); }
      }
    });
    // 도선 단면
    W.forEach(([x, y, s]) => { ctx.fillStyle = "#f3e2c8"; ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = C.warn; if (s > 0) { ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); } else { ctx.strokeStyle = C.warn; ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4); ctx.stroke(); } });
    if (mode === "sol") { ctx.fillStyle = C.ink2; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("N", cx + w * 0.3, cy + 4); ctx.fillText("S", cx - w * 0.3, cy + 4); }
    if (mode === "line") { const r = +sP.value, px = cx + Math.min(w * 0.45, 12 + r * 18); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(px, cy, 4, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, cy); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("측정점", px, cy + 16); }
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("⊙ 전류가 화면 밖으로  ⊗ 전류가 화면 안으로", 8, h - 8);
  }
  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === mode)));
    const I = +sI.value, p = +sP.value; oI.textContent = I; oP.textContent = p;
    let B; if (mode === "line") B = MU * I / (2 * Math.PI * p / 100); else if (mode === "loop") B = MU * I / (2 * p / 100); else B = MU * p * 100 * I;
    nB.textContent = B >= 1e-3 ? `${(B * 1000).toFixed(2)} mT` : `${(B * 1e6).toFixed(1)} μT`;
    nC.textContent = `약 ${(B / 50e-6).toFixed(B / 50e-6 < 10 ? 1 : 0)} 배`;
    draw();
  }
  function setMode(m) { mode = m; const [t, u, mn, mx, st, v] = LAB[m]; lab.firstChild.textContent = t; lab.lastChild.textContent = u; sP.min = mn; sP.max = mx; sP.step = st; sP.value = v; update(); }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.m)));
  sI.addEventListener("input", update); sP.addEventListener("input", update); update();
})();
