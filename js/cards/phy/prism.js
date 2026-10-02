/* 카드: 프리즘은 하얀빛 속 무지개를 어떻게 꺼낼까? — 코시 분산, 두 번 굴절, 연속·선 스펙트럼 */
(() => {
  const root = document.getElementById("card-phy-prism");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const GL = [["크라운", 0.0042], ["플린트", 0.011], ["고분산", 0.018]], A0 = 1.505, APEX = 60 * Math.PI / 180;
  const LINES = { white: null, h: [656, 486, 434, 410], na: [589, 589.6], red: [650] };
  let src = "white";
  const n = (lam) => A0 + GL[+$(".g").value][1] / (lam / 1000) ** 2;
  // 프리즘을 지난 뒤 빛의 꺾인 각(편각), 내부 전반사면 null
  function dev(lam, i) { const nn = n(lam), r1 = Math.asin(Math.sin(i) / nn), r2 = APEX - r1; if (nn * Math.sin(r2) >= 1) return null; return i + Math.asin(nn * Math.sin(r2)) - APEX; }
  const rgb = (l) => { let r = 0, g = 0, b = 0; if (l < 440) { r = (440 - l) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; } else if (l < 510) { g = 1; b = (510 - l) / 20; } else if (l < 580) { r = (l - 510) / 70; g = 1; } else if (l < 645) { r = 1; g = (645 - l) / 65; } else r = 1; return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`; };
  const { ctx, size } = fit($("canvas"), () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#16181d"; ctx.fillRect(0, 0, w, h);
    const i = +$(".i").value * Math.PI / 180, cx = w * 0.36, cy = h * 0.56, s = Math.min(h * 0.7, w * 0.3);
    const P = [[cx, cy - s * 0.58], [cx - s / 2, cy + s * 0.29], [cx + s / 2, cy + s * 0.29]];
    ctx.fillStyle = "rgba(180,210,240,.18)"; ctx.strokeStyle = "rgba(200,220,240,.7)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(...P[0]); ctx.lineTo(...P[1]); ctx.lineTo(...P[2]); ctx.closePath(); ctx.fill(); ctx.stroke();
    // 왼쪽 면의 입사점과 법선
    const ex = (P[0][0] + P[1][0]) / 2, ey = (P[0][1] + P[1][1]) / 2, nAng = Math.PI + Math.PI / 6;   // 왼쪽 면 바깥 법선 방향 (-cos30, -sin30)
    const inDir = nAng + Math.PI - i;   // 입사광 진행 방향 (법선 반대쪽에서 i만큼 기울어 들어옴)
    ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ex - Math.cos(inDir) * w * 0.3, ey - Math.sin(inDir) * w * 0.3); ctx.lineTo(ex, ey); ctx.stroke();
    const lams = LINES[src] || Array.from({ length: 31 }, (_, k) => 400 + k * 10);
    const scrX = w - 40, sc = [];
    lams.forEach((lam) => {
      const nn = n(lam), r1 = Math.asin(Math.sin(i) / nn), d1 = nAng + Math.PI - r1;   // 유리 속 진행 방향
      // 오른쪽 면과 만나는 점 (선분 P0–P2 교차)
      const dx = Math.cos(d1), dy = Math.sin(d1), ax = P[0][0], ay = P[0][1], bx = P[2][0] - ax, by = P[2][1] - ay;
      const den = dx * by - dy * bx, t = ((ax - ex) * by - (ay - ey) * bx) / den; const qx = ex + dx * t, qy = ey + dy * t;
      const dv = dev(lam, i); const col = src === "white" ? rgb(lam) : rgb(lam);
      ctx.strokeStyle = col; ctx.globalAlpha = src === "white" ? 0.5 : 0.9; ctx.lineWidth = src === "white" ? 1.5 : 2; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(qx, qy); ctx.stroke();
      if (dv !== null) { const out = 0 - (dv - (Math.PI / 2 - i - 0)) * 0 + (inDir + dv); const L = (scrX - qx) / Math.cos(out); const sx = scrX, sy = qy + Math.sin(out) * L; ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(sx, sy); ctx.stroke(); sc.push([lam, sy]); }
      ctx.globalAlpha = 1;
    });
    // 스크린
    ctx.fillStyle = "#2a2c31"; ctx.fillRect(scrX, 6, 12, h - 12);
    sc.forEach(([lam, y]) => { ctx.fillStyle = rgb(lam); ctx.fillRect(scrX, y - (src === "white" ? 3 : 1.5), 12, src === "white" ? 6 : 3); });
    ctx.fillStyle = "#ccc"; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("스크린", scrX - 4, 16);
    // 확대 창: 스크린에 맺힌 스펙트럼을 가로로 펼쳐 400~700 nm 자리와 함께 보여 줌
    if (sc.length) {
      const y0s = dev(700, i), y1s = dev(400, i), bx = 14, by = h - 34, bw = w * 0.5, bh = 14;
      ctx.fillStyle = "#0c0d10"; ctx.fillRect(bx - 4, by - 16, bw + 8, bh + 34);
      ctx.fillStyle = "#aaa"; ctx.textAlign = "left"; ctx.fillText("스크린 확대 (빨강 → 보라)", bx, by - 5);
      sc.forEach(([lam]) => { const d = dev(lam, i); if (d === null || y0s === null || y1s === null) return; const u = (d - y0s) / (y1s - y0s); ctx.fillStyle = rgb(lam); ctx.fillRect(bx + u * bw - (src === "white" ? bw / 60 : 1.5), by, src === "white" ? bw / 30 : 3, bh); });
      ctx.fillStyle = "#888"; ctx.font = `9px ${F.mono}`; ctx.fillText("700 nm", bx, by + bh + 11); ctx.textAlign = "right"; ctx.fillText("400 nm", bx + bw, by + bh + 11);
    }
    const dr = dev(700, i), dvl = dev(400, i);
    $(".n-r").textContent = n(700).toFixed(4); $(".n-v").textContent = n(400).toFixed(4);
    $(".n-d").textContent = dr !== null && dvl !== null ? `${((dvl - dr) * 180 / Math.PI).toFixed(2)}°` : "전반사";
  }
  root.querySelectorAll("input").forEach((el) => el.addEventListener("input", () => { $(".i-out").textContent = $(".i").value; $(".g-out").textContent = GL[+$(".g").value][0]; draw(); }));
  $(".src").addEventListener("click", (e) => { const b = e.target.closest("[data-s]"); if (!b) return; src = b.dataset.s; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); });
  draw();
})();
