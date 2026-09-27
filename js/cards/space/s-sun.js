/* 카드: 같은 태양이 파장마다 왜 다르게 보일까? — 광구·채층·코로나 모식 렌더링 */
(() => {
  const root = document.getElementById("card-space-sun");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sC = $(".c"), oC = $(".c-out"), nL = $(".n-l"), nF = $(".n-f"), nO = $(".n-o");
  let wv = "vis";
  const INFO = {
    vis: ["광구 · 약 5800 K", "쌀알 무늬, 흑점, 주연 감광", "지상 (태양 필터 필수)"],
    ha: ["채층 · 약 1만 K", "홍염(가장자리), 필라멘트, 플라주(밝은 영역)", "지상 (Hα 필터)"],
    euv: ["코로나 아래쪽 · 약 100만 K", "코로나 고리, 코로나 구멍, 플레어", "우주 (대기가 흡수)"],
    xr: ["코로나 · 수백만 K", "밝은 활동 영역, 플레어, 코로나 구멍", "우주 (대기가 흡수)"],
  };
  let seed = 1; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const act = Math.sin(Math.PI * +sC.value / 100) ** 2, cx = w * 0.3, cy = h / 2, R = Math.min(w * 0.26, h * 0.42);
    ctx.fillStyle = "#0b0b0e"; ctx.fillRect(0, 0, w * 0.6, h);
    seed = 11; const nAR = Math.round(1 + act * 7), ARs = Array.from({ length: nAR }, () => { const lat = (rnd() < 0.5 ? -1 : 1) * (8 + rnd() * 25) * Math.PI / 180, lon = (rnd() - 0.5) * 2.4; return [R * Math.sin(lon) * Math.cos(lat), -R * Math.sin(lat), 0.5 + rnd()]; });
    if (wv === "vis") {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, "#fff6d8"); g.addColorStop(0.7, "#f7d890"); g.addColorStop(1, "#d98a3a"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip(); ctx.fillStyle = "rgba(160,100,40,.08)"; for (let i = 0; i < 900; i++) { ctx.beginPath(); ctx.arc(cx + (rnd() - 0.5) * 2 * R, cy + (rnd() - 0.5) * 2 * R, 1.5, 0, Math.PI * 2); ctx.fill(); } ctx.restore();
      ARs.forEach(([x, y, s]) => { ctx.fillStyle = "rgba(120,70,30,.55)"; ctx.beginPath(); ctx.arc(cx + x, cy + y, 5 * s, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#2a1a0e"; ctx.beginPath(); ctx.arc(cx + x, cy + y, 2.5 * s, 0, Math.PI * 2); ctx.fill(); });
    } else if (wv === "ha") {
      ctx.fillStyle = "#c0301e"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip(); ctx.fillStyle = "rgba(255,180,150,.07)"; for (let i = 0; i < 700; i++) { ctx.beginPath(); ctx.arc(cx + (rnd() - 0.5) * 2 * R, cy + (rnd() - 0.5) * 2 * R, 2, 0, Math.PI * 2); ctx.fill(); }
      ARs.forEach(([x, y, s]) => { ctx.fillStyle = "rgba(255,200,170,.55)"; ctx.beginPath(); ctx.ellipse(cx + x, cy + y, 11 * s, 6 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "rgba(60,10,5,.7)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + x - 18 * s, cy + y + 14); ctx.quadraticCurveTo(cx + x, cy + y + 22, cx + x + 20 * s, cy + y + 12); ctx.stroke(); }); ctx.restore();
      for (let k = 0; k < 1 + Math.round(act * 3); k++) { const a = rnd() * Math.PI * 2; ctx.strokeStyle = "rgba(230,70,50,.9)"; ctx.lineWidth = 3; ctx.beginPath(); const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a); ctx.moveTo(x, y); ctx.bezierCurveTo(x + 18 * Math.cos(a - 0.4), y + 18 * Math.sin(a - 0.4), x + 18 * Math.cos(a + 0.6), y + 18 * Math.sin(a + 0.6), cx + R * Math.cos(a + 0.12), cy + R * Math.sin(a + 0.12)); ctx.stroke(); }
    } else {
      const euv = wv === "euv", base = euv ? "#6a5a18" : "#3a3a48";
      const g = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.35); g.addColorStop(0, euv ? "rgba(200,170,60,.5)" : "rgba(170,170,220,.35)"); g.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w * 0.6, h);
      ctx.fillStyle = base; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R * 1.2, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = "rgba(0,0,0,.55)"; ctx.beginPath(); ctx.ellipse(cx, cy - R * 0.8, R * 0.45, R * 0.18 * (1.3 - act), 0, 0, Math.PI * 2); ctx.fill();
      ARs.forEach(([x, y, s]) => { for (let j = 0; j < 6; j++) { ctx.strokeStyle = euv ? `rgba(255,230,120,${0.35 + 0.1 * j})` : `rgba(230,230,255,${0.3 + 0.1 * j})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(cx + x, cy + y - 4, (6 + j * 3) * s, (4 + j * 2) * s, 0, Math.PI, 0); ctx.stroke(); } const gg = ctx.createRadialGradient(cx + x, cy + y, 0, cx + x, cy + y, 16 * s); gg.addColorStop(0, euv ? "rgba(255,240,170,.9)" : "rgba(255,255,255,.9)"); gg.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(cx + x, cy + y, 16 * s, 0, Math.PI * 2); ctx.fill(); });
      ctx.restore();
    }
    ctx.fillStyle = "#ccc"; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText({ vis: "가시광선", ha: "Hα", euv: "극자외선 17.1 nm", xr: "X선" }[wv], 8, 16);
    // 오른쪽: 층 구조와 온도
    const lx = w * 0.64, lw = w - lx - 12, layers = [["광구", 5800, "vis", 0.82], ["채층", 1e4, "ha", 0.62], ["전이층", 1e5, "", 0.46], ["코로나", 1.5e6, "euv", 0.24]];
    const Tlog = (T) => (Math.log10(T) - 3.5) / 3, bx = lx + 56;
    ctx.fillStyle = C.ink2; ctx.font = `600 10.5px ${F.sans}`; ctx.fillText("층 (높이 ↑)과 온도", lx, 14);
    layers.forEach(([n, T, key, yf]) => { const y = h * yf, sel = key === wv || (wv === "xr" && n === "코로나"); ctx.fillStyle = sel ? C.warn : C.ink2; ctx.font = `${sel ? "600 " : ""}10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(n, lx, y + 4); ctx.fillStyle = sel ? "rgba(181,83,47,.7)" : "rgba(141,141,146,.4)"; ctx.fillRect(bx, y - 6, Tlog(T) * (lw - 120), 12); ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.mono}`; ctx.fillText(T >= 1e6 ? `${T / 1e6}백만 K` : `${T.toLocaleString()} K`, bx + Tlog(T) * (lw - 120) + 4, y + 4); });
  }
  function update() {
    root.querySelectorAll("[data-w]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.w === wv)));
    const v = +sC.value, act = Math.sin(Math.PI * v / 100) ** 2; oC.textContent = act > 0.7 ? "극대기 근처" : act < 0.2 ? "극소기 근처" : "중간";
    const [l, f, o] = INFO[wv]; nL.textContent = l; nF.textContent = f; nO.textContent = o; draw();
  }
  root.querySelectorAll("[data-w]").forEach((b) => b.addEventListener("click", () => { wv = b.dataset.w; update(); }));
  sC.addEventListener("input", update); update();
})();
