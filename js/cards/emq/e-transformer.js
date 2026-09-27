/* 카드: 변압기는 왜 교류에서만 작동할까? — V = −N dΦ/dt, V₁:V₂ = N₁:N₂ */
(() => {
  const root = document.getElementById("card-emq-transformer");
  if (!root) return;
  const { C, F, fit, loop, reduce } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), s1 = $(".n1"), o1 = $(".n1-out"), s2 = $(".n2"), o2 = $(".n2-out"), nV = $(".n-v"), nI = $(".n-i"), nP = $(".n-p");
  let src = "ac", t0 = 0;
  const V1 = 220;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const N1 = +s1.value, N2 = +s2.value;
    // 왼쪽: 철심과 코일
    const lx = 16, lw = w * 0.4, ty = 20, by = h - 24, core = 16;
    ctx.fillStyle = "#9a9aa0"; ctx.fillRect(lx + 20, ty, lw - 40, core); ctx.fillRect(lx + 20, by - core, lw - 40, core); ctx.fillRect(lx + 20, ty, core, by - ty); ctx.fillRect(lx + lw - 20 - core, ty, core, by - ty);
    const coil = (x, n, col) => { const turns = Math.max(3, Math.min(22, Math.round(Math.sqrt(n)))), top = ty + core + 6, bot = by - core - 6; ctx.strokeStyle = col; ctx.lineWidth = 2.2; for (let i = 0; i < turns; i++) { const y = top + (bot - top) * (i + 0.5) / turns; ctx.beginPath(); ctx.ellipse(x + core / 2, y, core * 0.9, 3, 0, 0, Math.PI * 2); ctx.stroke(); } };
    coil(lx + 20, N1, C.warn); coil(lx + lw - 20 - core, N2, "#3f6fa3");
    // 자기 선속 순환 화살표 (현재 선속 부호)
    const ph = src === "ac" ? Math.sin(t0) : 1, fl = src === "ac" ? -Math.cos(t0) : 1;
    ctx.strokeStyle = "rgba(138,79,181,.8)"; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.strokeRect(lx + 20 + core / 2, ty + core / 2, lw - 40 - core, by - ty - core); ctx.setLineDash([]);
    ctx.fillStyle = "#8a4fb5"; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(`자기 선속 Φ ${fl > 0.2 ? "→" : fl < -0.2 ? "←" : "≈ 0"}`, lx + lw / 2, ty + core + 18);
    ctx.fillStyle = C.warn; ctx.fillText(`1차 N₁=${N1}`, lx + 40, by + 16); ctx.fillStyle = "#3f6fa3"; ctx.fillText(`2차 N₂=${N2}`, lx + lw - 40, by + 16);
    // 오른쪽: 세 그래프
    const gx0 = w * 0.48, gx1 = w - 10, rows = [["1차 전압 V₁", C.warn], ["철심 속 자기 선속 Φ", "#8a4fb5"], ["2차 전압 V₂", "#3f6fa3"]], rh = (h - 20) / 3;
    const T = 4 * Math.PI, V2 = V1 * N2 / N1, vmax = Math.max(V1, V2) * Math.SQRT2;
    rows.forEach(([lab, col], i) => {
      const y0 = 10 + rh * i + rh / 2, amp = rh * 0.38;
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, y0); ctx.lineTo(gx1, y0); ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
      for (let k = 0; k <= 200; k++) {
        const t = k / 200 * T; let v;
        if (src === "ac") v = i === 0 ? Math.sin(t) * V1 * Math.SQRT2 / vmax : i === 1 ? -Math.cos(t) : Math.sin(t) * V2 * Math.SQRT2 / vmax;
        else { const on = t > 0.6; v = i === 0 ? (on ? 0.5 : 0) : i === 1 ? (on ? 1 - Math.exp(-(t - 0.6) * 6) : 0) : (on ? 0.9 * Math.exp(-(t - 0.6) * 6) * N2 / N1 * V1 / vmax * 2 : 0); }
        const x = gx0 + (gx1 - gx0) * k / 200, y = y0 - Math.max(-1.1, Math.min(1.1, v)) * amp; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke(); ctx.fillStyle = col; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(lab, gx0 + 4, 10 + rh * i + 10);
      if (src === "ac") { const x = gx0 + (gx1 - gx0) * ((t0 % T) / T); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(x, 10 + rh * i + 12); ctx.lineTo(x, 10 + rh * (i + 1) - 4); ctx.stroke(); }
    });
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(src === "ac" ? "V₂는 Φ가 가장 빨리 변할 때 가장 큼" : "스위치를 켠 순간에만 V₂가 생김", gx1, h - 4);
  }
  function update() {
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === src)));
    const N1 = +s1.value, N2 = +s2.value; o1.textContent = N1; o2.textContent = N2;
    if (src === "dc") { nV.textContent = "0 V (켜는 순간 제외)"; nI.textContent = "0 A"; nP.textContent = "0 W"; }
    else { const V2 = V1 * N2 / N1, I2 = V2 / 10, I1 = I2 * N2 / N1; nV.textContent = `${V2 < 10 ? V2.toFixed(1) : Math.round(V2)} V`; nI.textContent = `${I2.toFixed(I2 < 10 ? 2 : 0)} A · ${I1.toFixed(I1 < 10 ? 2 : 0)} A`; nP.textContent = `${Math.round(V2 * I2)} W`; }
    draw();
  }
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { src = b.dataset.s; update(); }));
  s1.addEventListener("input", update); s2.addEventListener("input", update); update();
  loop(cv, (dt) => { if (reduce || src !== "ac") return false; t0 += dt * 2; draw(); });
})();
