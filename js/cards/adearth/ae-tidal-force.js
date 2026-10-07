/* 카드: 태양이 달보다 지구를 훨씬 세게 당기는데, 왜 조석은 달이 더 크게 만들까? — 기조력 벡터장과 2GMR/d³ */
(() => {
  const root = document.getElementById("card-adearth-tidal-force");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sD = $(".sl-d");
  const G = 6.674e-11, RE = 6.371e6, ME = 5.972e24, GE = 9.81;
  const MASS = { moon: 7.342e22, sun: 1.989e30 };
  let body = "moon";
  const sci = (x) => { const e = Math.floor(Math.log10(Math.abs(x))), m = x / 10 ** e; return `${m.toFixed(2)}×10${String(e).replace("-", "⁻").replace(/\d/g, (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[c])}`; };
  const calc = () => {
    const M = MASS[body === "sun" ? "sun" : "moon"], dR = 10 ** +sD.value, d = dR * RE, GM = G * M;
    const near = GM / (d - RE) ** 2 - GM / d ** 2, far = GM / d ** 2 - GM / (d + RE) ** 2, app = 2 * GM * RE / d ** 3;
    const eq = 1.5 * (M / ME) * (RE / d) ** 3 * RE;
    return { M, dR, d, GM, near, far, app, eq, pull: GM / d ** 2 };
  };
  /* 지구 중심 기준 위치 (x,y)[m]에서의 기조 가속도 (천체는 +x 방향 d) */
  const tidal = (s, x, y) => {
    const dx = s.d - x, dy = -y, r3 = (dx * dx + dy * dy) ** 1.5;
    return [s.GM * dx / r3 - s.GM / s.d ** 2, s.GM * dy / r3];
  };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    const s = calc();
    ctx.clearRect(0, 0, w, h);
    const ex = w * 0.34, ey = h * 0.5, Rp = Math.min(w, h) * 0.25;
    /* 부푼 바다 (과장) */
    const e = Math.min(0.32, 0.14 * (s.near / s.app) ** 0.5 + 0.04);
    ctx.fillStyle = "rgba(63,111,163,.20)"; ctx.beginPath();
    for (let i = 0; i <= 180; i++) {
      const th = i / 180 * Math.PI * 2, [ax, ay] = tidal(s, RE * Math.cos(th), RE * Math.sin(th));
      const radial = ax * Math.cos(th) + ay * Math.sin(th), rr = Rp * (1.08 + e * radial / Math.max(s.near, s.far));
      const x = ex + rr * Math.cos(th), y = ey - rr * Math.sin(th);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#cfe0c4"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(ex, ey, Rp, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(ex, ey, 2.5, 0, Math.PI * 2); ctx.fill();
    /* 기조력 화살표 */
    const big = Math.max(s.near, s.far), L = Rp * 0.55;
    for (let i = 0; i < 16; i++) {
      const th = i / 16 * Math.PI * 2, x = RE * Math.cos(th), y = RE * Math.sin(th), [ax, ay] = tidal(s, x, y);
      const px = ex + Rp * Math.cos(th), py = ey - Rp * Math.sin(th), vx = ax / big * L, vy = -ay / big * L, len = Math.hypot(vx, vy);
      if (len < 2) continue;
      ctx.strokeStyle = C.apple; ctx.fillStyle = C.apple; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + vx, py + vy); ctx.stroke();
      const ux = vx / len, uy = vy / len, hd = Math.min(7, len * 0.5);
      ctx.beginPath(); ctx.moveTo(px + vx, py + vy); ctx.lineTo(px + vx - hd * ux - hd * 0.5 * uy, py + vy - hd * uy + hd * 0.5 * ux); ctx.lineTo(px + vx - hd * ux + hd * 0.5 * uy, py + vy - hd * uy - hd * 0.5 * ux); ctx.fill();
    }
    /* 천체 */
    const scaleDraw = s.dR * Rp < (w - ex - 30);
    const bx = scaleDraw ? ex + s.dR * Rp : w - 34, by = ey;
    const br = body === "sun" ? 22 : Math.max(5, Math.min(Rp * 0.27, 18));
    ctx.fillStyle = body === "sun" ? C.amber : "#b9b9bd"; ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText(body === "sun" ? "태양" : "달", bx, by + br + 14);
    if (!scaleDraw) {
      ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(ex + Rp * 1.6, ey); ctx.lineTo(bx - br - 6, ey); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.fillText("축척 무시 →", (ex + Rp * 1.6 + bx - br) / 2, ey - 8);
    }
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`;
    ctx.fillText("빨간 화살표: 기조력 (가장 긴 것에 맞춤)", 10, 16);
    ctx.fillText("파란 영역: 평형 조석 (과장)", 10, 31);
  }
  function update() {
    const s = calc();
    root.querySelectorAll("[data-b]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.b === body)));
    $(".d-out").textContent = s.dR >= 1000 ? s.dR.toFixed(0) : s.dR >= 10 ? s.dR.toFixed(1) : s.dR.toFixed(2);
    $(".n-near").textContent = `${sci(s.near)} m/s²`;
    $(".n-far").textContent = `${sci(s.far)} m/s²`;
    const errN = (s.app / s.near - 1) * 100;
    $(".n-app").textContent = `${sci(s.app)}` + (Math.abs(errN) >= 0.5 ? ` (${errN > 0 ? "+" : ""}${errN.toFixed(0)}%)` : "");
    $(".n-g").textContent = sci(s.near / GE);
    $(".n-pull").textContent = `${sci(s.pull)} m/s²`;
    $(".n-eq").textContent = s.eq < 1 ? `${(s.eq * 100).toFixed(1)} cm` : s.eq < 1000 ? `${s.eq.toFixed(1)} m` : `${(s.eq / 1000).toFixed(1)} km (식 성립 안 함)`;
    draw();
  }
  root.querySelectorAll("[data-b]").forEach((b) => b.addEventListener("click", () => {
    body = b.dataset.b;
    sD.value = body === "sun" ? Math.log10(1.496e11 / RE) : body === "moon" ? Math.log10(3.844e8 / RE) : Math.log10(4);
    update();
  }));
  sD.addEventListener("input", update);
  update();
})();
