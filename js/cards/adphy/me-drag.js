/* 카드: 공기 저항이 있으면 포물선은 어떻게 찌그러질까? — 선형 저항 dv/dt = g − kv의 해석해, 위치·속도·가속도 벡터와 호도그래프 */
(() => {
  const root = document.getElementById("card-adphy-drag");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sA = $(".ang"), sV = $(".v"), sK = $(".k"), sT = $(".t");
  const oA = $(".ang-out"), oV = $(".v-out"), oK = $(".k-out"), oT = $(".t-out");
  const nR = $(".n-r"), nV = $(".n-v"), nA = $(".n-a"), nRange = $(".n-R");
  const g = 9.8, BLUE = "#3f6fa3", RED = "#d4493a";

  /* 상태: 시각 t에서 위치·속도·가속도 */
  function state(v0, th, k, t) {
    const vx0 = v0 * Math.cos(th), vy0 = v0 * Math.sin(th);
    if (k < 1e-6) return { x: vx0 * t, y: vy0 * t - 0.5 * g * t * t, vx: vx0, vy: vy0 - g * t, ax: 0, ay: -g };
    const E = Math.exp(-k * t), vt = g / k;
    const vx = vx0 * E, vy = (vy0 + vt) * E - vt;
    return { x: vx0 * (1 - E) / k, y: (vy0 + vt) * (1 - E) / k - vt * t, vx, vy, ax: -k * vx, ay: -g - k * vy };
  }
  function flight(v0, th, k) {
    let hi = 2 * v0 * Math.sin(th) / g + 0.01, lo = 1e-4;
    if (state(v0, th, k, hi).y > 0) hi *= 3;
    for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (state(v0, th, k, m).y > 0) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  const range = (v0, th, k) => state(v0, th, k, flight(v0, th, k)).x;
  function best(v0, k) { let ba = 45, br = 0; for (let d = 10; d <= 60; d += 0.5) { const r = range(v0, d * Math.PI / 180, k); if (r > br) { br = r; ba = d; } } return ba; }

  function arrow(ctx, x, y, dx, dy, col, lw = 2) {
    const L = Math.hypot(dx, dy); if (L < 2) return;
    const ux = dx / L, uy = dy / L, hd = 7;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx - ux * hd * 0.8, y + dy - uy * hd * 0.8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + dx, y + dy); ctx.lineTo(x + dx - ux * hd - uy * hd * 0.45, y + dy - uy * hd + ux * hd * 0.45); ctx.lineTo(x + dx - ux * hd + uy * hd * 0.45, y + dy - uy * hd - ux * hd * 0.45); ctx.closePath(); ctx.fill();
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const th = +sA.value * Math.PI / 180, v0 = +sV.value, k = +sK.value;
    const T0 = flight(v0, th, 0), T = flight(v0, th, k), t = +sT.value * T;
    /* 왼쪽: 궤적 (같은 눈금의 x, y) */
    const R0 = v0 * v0 * Math.sin(2 * th) / g, H0 = (v0 * Math.sin(th)) ** 2 / (2 * g);
    const pw = w * 0.64 - 30, ph = h - 50, px0 = 30, py0 = h - 24;
    const sc = Math.min(pw / (R0 * 1.02), ph / (H0 * 1.05));
    const X = (x) => px0 + x * sc, Y = (y) => py0 - y * sc;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px0, py0); ctx.lineTo(px0 + pw, py0); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    const step = [1, 2, 5, 10, 20, 50].find((d) => d * sc > 34) || 50;
    for (let x = 0; X(x) <= px0 + pw; x += step) { ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(X(x), py0); ctx.lineTo(X(x), py0 + 4); ctx.stroke(); ctx.fillText(`${x}`, X(x), py0 + 14); }
    const path = (kk, TT, col, dash, lw) => {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath();
      for (let i = 0; i <= 120; i++) { const s = state(v0, th, kk, TT * i / 120); if (i) ctx.lineTo(X(s.x), Y(s.y)); else ctx.moveTo(X(s.x), Y(s.y)); }
      ctx.stroke(); ctx.setLineDash([]);
    };
    path(0, T0, C.ink3, [4, 4], 1.2);
    if (k > 0) path(k, T, C.ink, [], 2);
    const s = state(v0, th, k, t), bx = X(s.x), by = Y(s.y);
    ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 3]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px0, py0); ctx.lineTo(bx, by); ctx.stroke(); ctx.setLineDash([]);
    arrow(ctx, bx, by, s.vx * 0.4 * sc, -s.vy * 0.4 * sc, BLUE);
    arrow(ctx, bx, by, s.ax * 0.4 * sc, -s.ay * 0.4 * sc, RED);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(bx, by, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink2; ctx.fillText(k > 0 ? "실선: 저항 있음 · 점선: 진공 (m)" : "진공 (눈금: m)", px0 + 4, 14);
    /* 오른쪽: 호도그래프 (vx, vy) */
    const hx0 = w * 0.71, hw = w - hx0 - 14, hy1 = 22, hh = h - 46;
    const vs = Math.min(hw / (v0 * 1.05), hh / (2.1 * v0));
    const VX = (vx) => hx0 + vx * vs, VY = (vy) => hy1 + hh / 2 - vy * vs;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(VX(0), hy1); ctx.lineTo(VX(0), hy1 + hh); ctx.moveTo(VX(0), VY(0)); ctx.lineTo(VX(v0 * 1.05), VY(0)); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText("vy", VX(0) + 4, hy1 + 8); ctx.textAlign = "right"; ctx.fillText("vx", VX(v0 * 1.05), VY(0) - 5);
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink2; ctx.fillText("속도 벡터의 자취", hx0, 14);
    const vx0 = v0 * Math.cos(th), vy0 = v0 * Math.sin(th);
    ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(VX(vx0), VY(vy0)); ctx.lineTo(VX(vx0), VY(vy0 - g * T0)); ctx.stroke(); ctx.setLineDash([]);
    if (k > 0) {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i <= 60; i++) { const q = state(v0, th, k, T * i / 60); if (i) ctx.lineTo(VX(q.vx), VY(q.vy)); else ctx.moveTo(VX(q.vx), VY(q.vy)); }
      ctx.stroke();
      const vt = g / k;
      if (vt < 1.05 * v0) { ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(VX(0), VY(-vt), 3.5, 0, Math.PI * 2); ctx.fill(); ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("종단 속도", VX(0) + 6, VY(-vt) + 4); }
    }
    arrow(ctx, VX(0), VY(0), s.vx * vs, -s.vy * vs, BLUE);
    arrow(ctx, VX(s.vx), VY(s.vy), s.ax * 0.4 * vs, -s.ay * 0.4 * vs, RED);
  }
  function update() {
    const th = +sA.value * Math.PI / 180, v0 = +sV.value, k = +sK.value;
    oA.textContent = sA.value; oV.textContent = (+sV.value).toFixed(1).replace(/\.0$/, ""); oK.textContent = k.toFixed(2);
    const T = flight(v0, th, k), t = +sT.value * T, s = state(v0, th, k, t);
    oT.textContent = t.toFixed(2);
    nR.textContent = `(${s.x.toFixed(1)}, ${s.y.toFixed(1)}) m`;
    nV.textContent = `(${s.vx.toFixed(1)}, ${s.vy.toFixed(1)}) m/s`;
    nA.textContent = `(${s.ax.toFixed(2)}, ${s.ay.toFixed(2)}) m/s²`;
    nRange.textContent = `${range(v0, th, k).toFixed(1)} m (${range(v0, th, 0).toFixed(1)}) · ${best(v0, k).toFixed(1)}°`;
    root.querySelectorAll("[data-k]").forEach((b) => b.setAttribute("aria-pressed", String(Math.abs(+b.dataset.k - k) < 1e-6)));
    draw();
  }
  root.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => { sK.value = b.dataset.k; update(); }));
  [sA, sV, sK, sT].forEach((el) => el.addEventListener("input", update));
  update();
})();
