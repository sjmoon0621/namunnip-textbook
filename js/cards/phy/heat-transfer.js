/* 카드: 난로의 열은 어떤 길로 나에게 올까? — 전도(1차원 막대), 대류(입자 순환), 복사(흡수율·거리·진공) */
(() => {
  const root = document.getElementById("card-phy-heat-transfer");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const KAP = { cu: 1.1e-4, fe: 2.3e-5, glass: 3.4e-7 }, ABS = { black: 0.95, white: 0.3, foil: 0.05 };
  let mode = "cond", mat = "cu", heat = "bottom", surf = "black", t = 0, rod, wax, parts, Tth;
  function reset() {
    t = 0; rod = new Array(40).fill(20); wax = new Array(5).fill(true); Tth = 20;
    parts = Array.from({ length: 160 }, () => ({ x: Math.random(), y: Math.random(), T: 20 }));
  }
  const { ctx, size } = fit($("canvas"), () => draw());
  const tc = (T) => { const u = Math.max(0, Math.min(1, (T - 20) / 80)); return `rgb(${Math.round(70 + 185 * u)},${Math.round(110 + 40 * Math.sin(u * 3))},${Math.round(210 - 180 * u)})`; };
  function step(dt) {
    t += dt;
    if (mode === "cond") {
      const k = KAP[mat], dx = 0.5 / 40, sub = Math.ceil(k * dt * 60 / (0.4 * dx * dx)) || 1, h = dt * 60 / sub;   // 60배속
      for (let s = 0; s < sub; s++) { const U = rod.slice(); U[0] = 100; for (let i = 1; i < 39; i++) U[i] = rod[i] + k * h * (rod[i + 1] - 2 * rod[i] + rod[i - 1]) / (dx * dx) - 0.0002 * h * (rod[i] - 20); U[39] = U[38]; rod = U; }
      wax = wax.map((on, j) => on && rod[8 + j * 7] < 60);
    } else if (mode === "conv") {
      const bottom = heat === "bottom", A = bottom ? 0.07 : 0;   // 아래 가열이면 대류 세포 두 개 (흐름 함수 ψ = A sin(2πx) sin(πy))
      parts.forEach((p) => {
        const u = -A * Math.PI * Math.sin(2 * Math.PI * p.x) * Math.cos(Math.PI * p.y), v = A * 2 * Math.PI * Math.cos(2 * Math.PI * p.x) * Math.sin(Math.PI * p.y);   // 가운데로 올라가고 양옆으로 내려옴
        p.x += u * dt + (Math.random() - 0.5) * dt * 0.02; p.y += v * dt + (Math.random() - 0.5) * dt * 0.01;
        p.x = Math.max(0.01, Math.min(0.99, p.x)); p.y = Math.max(0.01, Math.min(0.99, p.y));
        if (bottom) { if (p.y > 0.85 && Math.abs(p.x - 0.5) < 0.3) p.T += (95 - p.T) * dt * 0.8; if (p.y < 0.1) p.T += (25 - p.T) * dt * 0.15; p.T += (40 - p.T) * dt * 0.01; }
        else p.T += (95 - 75 * Math.min(1, p.y * 2.5) - p.T) * dt * 0.02 * (1 - p.y * 0.5);   // 위 가열: 느린 전도로만 아래로
      });
    } else {
      const k = $(".vac").checked ? 0.03 : 0.06;   // 진공이면 공기로 빠져나가는 열(전도·대류)이 없어 덜 식음
      Tth += (ABS[surf] * 2.0 - k * (Tth - 20)) * dt;
    }
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#f4f1e8"; ctx.fillRect(0, 0, w, h);
    const flame = (x, y, s) => { ctx.fillStyle = "#f0a030"; ctx.beginPath(); ctx.moveTo(x - 10 * s, y); ctx.quadraticCurveTo(x, y - 30 * s, x + 10 * s, y); ctx.fill(); ctx.fillStyle = "#e05a2a"; ctx.beginPath(); ctx.moveTo(x - 5 * s, y); ctx.quadraticCurveTo(x, y - 16 * s, x + 5 * s, y); ctx.fill(); };
    if (mode === "cond") {
      const x0 = 70, x1 = w - 30, y = h * 0.45, seg = (x1 - x0) / 40;
      flame(x0 - 10, y + 30, 1.4);
      rod.forEach((T, i) => { ctx.fillStyle = tc(T); ctx.fillRect(x0 + i * seg, y - 8, seg + 0.5, 16); });
      ctx.strokeStyle = C.ink2; ctx.strokeRect(x0, y - 8, x1 - x0, 16);
      wax.forEach((on, j) => { const x = x0 + (8 + j * 7) * seg; ctx.fillStyle = "#f1e3a8"; if (on) { ctx.beginPath(); ctx.arc(x, y + 14, 5, 0, Math.PI * 2); ctx.fill(); } else { ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(x, h - 16, 5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; } });
      ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("막대 아래 붙인 촛농 — 녹으면 떨어짐", x0, y + 40);
      $(".l2").textContent = "가운데 온도"; $(".n-2").textContent = `${rod[20].toFixed(0)} °C`; $(".l3").textContent = "떨어진 촛농"; $(".n-3").textContent = `${wax.filter((x) => !x).length} / 5`;
    } else if (mode === "conv") {
      const bx = w * 0.25, by = 20, bw = w * 0.5, bh = h - 50;
      ctx.fillStyle = "rgba(200,225,245,.5)"; ctx.fillRect(bx, by, bw, bh); ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, bh);
      if (heat === "bottom") flame(bx + bw / 2, h - 6, 1.4); else { ctx.fillStyle = "#e05a2a"; ctx.fillRect(bx, by - 6, bw, 6); ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.fillText("윗면 가열판", bx + bw + 6, by + 4); }
      parts.forEach((p) => { ctx.fillStyle = tc(p.T); ctx.beginPath(); ctx.arc(bx + p.x * bw, by + p.y * bh, 3, 0, Math.PI * 2); ctx.fill(); });
      const top = parts.filter((p) => p.y < 0.2), bot = parts.filter((p) => p.y > 0.8), avg = (a) => a.reduce((s, p) => s + p.T, 0) / Math.max(1, a.length);
      $(".l2").textContent = "윗부분 물"; $(".n-2").textContent = `${avg(top).toFixed(0)} °C`; $(".l3").textContent = "아랫부분 물"; $(".n-3").textContent = `${avg(bot).toFixed(0)} °C`;
    } else {
      const vac = $(".vac").checked;
      ctx.fillStyle = vac ? "#1c1e1b" : "#f4f1e8"; ctx.fillRect(w * 0.18, 10, w * 0.5, h - 20);
      ctx.fillStyle = "#b5532f"; ctx.fillRect(20, h * 0.25, 26, h * 0.5);
      for (let k = 0; k < 6; k++) { const ph = ((t * 0.8 + k / 6) % 1); ctx.strokeStyle = `rgba(214,80,40,${1 - ph})`; ctx.lineWidth = 2; ctx.beginPath(); for (let x = 50; x < 50 + ph * (w * 0.62); x += 3) { const y = h / 2 + Math.sin(x * 0.25) * 6 + (k - 2.5) * 12; x === 50 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
      const tx = w * 0.78; ctx.fillStyle = surf === "black" ? "#222" : surf === "white" ? "#f8f8f8" : "#c9ccd1"; ctx.strokeStyle = C.ink2; ctx.beginPath(); ctx.arc(tx, h / 2, 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(`${Tth.toFixed(1)} °C`, tx, h / 2 + 36);
      ctx.fillStyle = vac ? "#ddd" : C.ink3; ctx.font = `10px ${F.sans}`; ctx.fillText(vac ? "진공 — 전도·대류 없음" : "공기", w * 0.43, 24);
      $(".l2").textContent = "온도계"; $(".n-2").textContent = `${Tth.toFixed(1)} °C`; $(".l3").textContent = "흡수율"; $(".n-3").textContent = `${Math.round(ABS[surf] * 100)}%`;
    }
    $(".n-t").textContent = mode === "cond" ? `${Math.round(t * 60)} s` : `${t.toFixed(0)} s`;
  }
  loop($("canvas"), (dt) => { step(dt); draw(); });
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-m],[data-r],[data-h],[data-s]"); if (!b) return;
    const k = Object.keys(b.dataset)[0], v = b.dataset[k];
    if (k === "m") { mode = v; ["cond", "conv", "rad"].forEach((m) => ($(`.opt-${m}`).hidden = m !== mode)); }
    if (k === "r") mat = v; if (k === "h") heat = v; if (k === "s") surf = v;
    root.querySelectorAll(`[data-${k}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); reset(); draw();
  });
  $(".restart").addEventListener("click", () => { reset(); draw(); });
  $(".vac").addEventListener("change", reset);
  reset();
  const dm = location.search.match(/demo=(\w+)/);
  if (dm) { root.querySelector(`[data-m="${dm[1]}"]`).click(); for (let i = 0; i < 400; i++) step(0.05); draw(); }
})();
