/* 카드: 렌즈는 왜 빛을 정확히 한 점에 모으지 못할까? — 양볼록 렌즈·거울 광선 추적 (스넬 법칙) */
(() => {
  const root = document.getElementById("card-emq-aberration");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sA = $(".a"), oA = $(".a-out"), nS = $(".n-s"), nK = $(".n-k");
  let mode = "sph";
  // 단위: mm. 렌즈: 양볼록, 곡률 반지름 R, 두께 T, 반지름 H
  const R = 60, T = 16, H = 26;
  const norm = (x, y) => { const m = Math.hypot(x, y); return [x / m, y / m]; };
  function refract([dx, dy], [nx, ny], n1, n2) { // n은 입사 쪽을 향하는 법선
    const c = -(dx * nx + dy * ny), r = n1 / n2, k = 1 - r * r * (1 - c * c); if (k < 0) return null;
    return norm(r * dx + (r * c - Math.sqrt(k)) * nx, r * dy + (r * c - Math.sqrt(k)) * ny);
  }
  function hitSphere(px, py, dx, dy, cx, near) { // 중심 (cx,0), 반지름 R
    const ox = px - cx, b = ox * dx + py * dy, c = ox * ox + py * py - R * R, D = b * b - c; if (D < 0) return null;
    const t = near ? -b - Math.sqrt(D) : -b + Math.sqrt(D); return [px + t * dx, py + t * dy];
  }
  function traceLens(y, n) {
    // 앞면 중심 (T/2 - R + R ... ): 앞면 꼭짓점 x = -T/2, 중심 x = -T/2 + R. 뒷면 꼭짓점 x = T/2, 중심 x = T/2 - R
    const p1 = hitSphere(-200, y, 1, 0, -T / 2 + R, true); if (!p1) return null;
    const n1 = norm(p1[0] - (-T / 2 + R), p1[1]); const d1 = refract([1, 0], n1, 1, n);
    const p2 = hitSphere(p1[0], p1[1], d1[0], d1[1], T / 2 - R, false); if (!p2) return null;
    const n2 = norm(-(p2[0] - (T / 2 - R)), -p2[1]); const d2 = refract(d1, n2, n, 1); if (!d2) return null;
    return [[-200, y], p1, p2, d2];
  }
  function traceMirror(y, para) { // 거울 꼭짓점 x = 0, 오목, 빛은 왼쪽에서 오른쪽으로 → 반사해 왼쪽으로. 초점 거리 f = 60
    const f = 60; let px, nx, ny;
    // 오목면이 왼쪽(빛이 오는 쪽)을 향함. 법선은 빛이 오는 쪽으로
    if (para) { px = -y * y / (4 * f); [nx, ny] = norm(-1, -y / (2 * f)); }
    else { const Rm = 2 * f; px = -(Rm - Math.sqrt(Rm * Rm - y * y)); [nx, ny] = norm(-Rm - px, -y); }
    const d = [1, 0], dot = d[0] * nx + d[1] * ny, r = [d[0] - 2 * dot * nx, d[1] - 2 * dot * ny];
    return [[-200, y], [px, y], r];
  }
  const axisCross = (p, d) => p[0] - p[1] * d[0] / d[1];
  const { ctx, size } = fit(cv, () => draw());
  let stats = {};
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const ap = +sA.value / 100, cy = h / 2, sc = Math.min((h * 0.42) / H, mode === "mir" ? (w * 0.7) / 95 : (w * 0.62) / 78), ox = mode === "mir" ? w * 0.82 : w * 0.28, X = (x) => ox + x * sc, Y = (y) => cy - y * sc;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
    const crosses = [];
    if (mode !== "mir") {
      // 렌즈 모양
      ctx.fillStyle = "rgba(110,164,230,.25)"; ctx.strokeStyle = "#3f6fa3"; ctx.beginPath();
      const a1 = Math.asin(H / R); ctx.arc(X(-T / 2 + R), cy, R * sc, Math.PI - a1, Math.PI + a1); ctx.arc(X(T / 2 - R), cy, R * sc, -a1, a1); ctx.closePath(); ctx.fill(); ctx.stroke();
      const cols = mode === "chr" ? [[1.513, "#d7263d"], [1.52, "#3b7c2a"], [1.528, "#3b5bd9"]] : [[1.52, C.warn]];
      const K = 9;
      cols.forEach(([n, col]) => { for (let k = -K; k <= K; k++) { if (k === 0) continue; const y = k / K * (H - 2) * ap; const r = traceLens(y, n); if (!r) continue; const [p0, p1, p2, d] = r; const xc = axisCross(p2, d); crosses.push([xc, col, Math.abs(y)]); ctx.strokeStyle = col; ctx.globalAlpha = mode === "chr" ? 0.75 : 0.85; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X(-60), Y(y)); ctx.lineTo(X(p1[0]), Y(p1[1])); ctx.lineTo(X(p2[0]), Y(p2[1])); const tEnd = (Math.min(w, X(xc) + 0.35 * (w - X(xc))) - X(p2[0])) / sc / d[0]; ctx.lineTo(X(p2[0] + d[0] * tEnd), Y(p2[1] + d[1] * tEnd)); ctx.stroke(); ctx.globalAlpha = 1; } });
    } else {
      // 거울 두 개를 위(구면)·아래(포물면) 반쪽씩
      const Rm = 120; ctx.lineWidth = 3;
      ctx.strokeStyle = C.warn; ctx.beginPath(); for (let y = 0; y <= H; y += 0.5) { const px = -(Rm - Math.sqrt(Rm * Rm - y * y)); y ? ctx.lineTo(X(px), Y(y)) : ctx.moveTo(X(px), Y(y)); } ctx.stroke();
      ctx.strokeStyle = "#3f6fa3"; ctx.beginPath(); for (let y = 0; y <= H; y += 0.5) { const px = -y * y / 240; y ? ctx.lineTo(X(px), Y(-y)) : ctx.moveTo(X(px), Y(-y)); } ctx.stroke();
      ctx.lineWidth = 1.2; for (let k = 1; k <= 8; k++) for (const para of [false, true]) { const y = k / 8 * (H - 1) * ap * (para ? -1 : 1), [p0, p1, d] = traceMirror(y, para), xc = axisCross(p1, d); crosses.push([xc, para ? "#3f6fa3" : C.warn, Math.abs(y), para]); ctx.strokeStyle = para ? "#3f6fa3" : C.warn; ctx.beginPath(); ctx.moveTo(0, Y(y)); ctx.lineTo(X(p1[0]), Y(p1[1])); const tEnd = (p1[0] - (xc - 25)) / -d[0] * 1; ctx.lineTo(X(p1[0] + d[0] * tEnd), Y(p1[1] + d[1] * tEnd)); ctx.stroke(); }
      ctx.fillStyle = C.warn; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("구면 거울", w - 8, 16); ctx.fillStyle = "#3f6fa3"; ctx.fillText("포물면 거울", w - 8, h - 8);
    }
    // 초점 흩어짐 표시
    const xs = (sel) => crosses.filter(sel).map((c) => c[0]);
    if (mode === "mir") { const s = xs((c) => !c[3]), p = xs((c) => c[3]); stats = { spread: Math.max(...s) - Math.min(...s), p: Math.max(...p) - Math.min(...p) }; }
    else if (mode === "chr") { const r = xs((c) => c[1] === "#d7263d"), b = xs((c) => c[1] === "#3b5bd9"); const mr = r.reduce((a, v) => a + v, 0) / r.length, mb = b.reduce((a, v) => a + v, 0) / b.length; stats = { spread: Math.max(...crosses.map((c) => c[0])) - Math.min(...crosses.map((c) => c[0])), rb: mr - mb }; }
    else { const s = xs(() => true); stats = { spread: Math.max(...s) - Math.min(...s) }; }
    const all = crosses.map((c) => c[0]), lo = Math.min(...all), hi = Math.max(...all);
    ctx.fillStyle = "rgba(35,35,38,.12)"; ctx.fillRect(Math.min(X(lo), X(hi)), cy - 4, Math.abs(X(hi) - X(lo)) + 1, 8);
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("↑ 광선이 광축을 지나는 범위", (X(lo) + X(hi)) / 2, h - 8);
  }
  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === mode)));
    oA.textContent = sA.value; draw();
    nS.textContent = mode === "mir" ? `구면 ${stats.spread.toFixed(2)} mm · 포물면 ${stats.p.toFixed(2)} mm` : `${stats.spread.toFixed(2)} mm`;
    nK.textContent = mode === "sph" ? "가장자리 광선일수록 렌즈 가까이 모임" : mode === "chr" ? `파란빛이 빨간빛보다 약 ${stats.rb.toFixed(1)} mm 가까이 모임` : "포물면은 광축과 나란한 빛을 모두 한 점에 모음";
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; update(); }));
  sA.addEventListener("input", update); update();
})();
