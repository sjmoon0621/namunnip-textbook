/* 카드: 수레도 말을 당긴다면, 말은 어떻게 수레를 끌까? — 작용 반작용 쌍과 물체별 알짜힘 */
(() => {
  const root = document.getElementById("card-phy-horse");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sP = $(".push"), oP = $(".push-out"), ice = $(".ice");
  const nT1 = $(".t-hc"), nT2 = $(".t-ch"), nF = $(".f-gh"), nA = $(".acc");

  const g = 9.81, MH = 500, MC = 300, R = 0.05 * MC * g; // 굴림 저항 147 N (모식)
  const PAIR_T = C.forest, PAIR_G = C.amber, COL_R = "#8d8d92";
  let view = "horse", x = 0, v = 0, t = 0;

  function forces() {
    const P = +sP.value, mu = ice.checked ? 0.1 : 0.6, fmax = mu * MH * g;
    const f = Math.min(P, fmax), slip = P > fmax;
    let a, T, r;
    if (v <= 1e-9 && f <= R) { a = 0; T = f; r = f; }       // 정지: 수레의 저항이 버팀
    else { a = (f - R) / (MH + MC); T = MC * a + R; r = R; }
    return { P, f, slip, a, T, r, fmax };
  }

  function step(dt) {
    const s = forces();
    v += s.a * dt; if (v < 0) v = 0;
    x += v * dt; t += dt;
    if (x > 80 || t > 14) { x = 0; v = 0; t = 0; }
  }

  function update() {
    const s = forces();
    oP.textContent = s.P;
    nT1.textContent = `${s.T.toFixed(0)} N`; nT2.textContent = `${s.T.toFixed(0)} N`;
    nF.textContent = `${s.f.toFixed(0)} N` + (s.slip ? " (미끄러짐)" : "");
    nF.classList.toggle("bad", s.slip);
    nA.textContent = `${s.a.toFixed(2)} m/s²`;
  }

  const { ctx, size } = fit(cv, () => draw());

  function arrow(x0, y0, x1, y1, col, lw = 2.6, dash) {
    if (Math.abs(x1 - x0) < 3) return;
    const a = Math.atan2(y1 - y0, x1 - x0), hl = 9;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    if (dash) ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - hl * 0.8 * Math.cos(a), y1 - hl * 0.8 * Math.sin(a)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - hl * Math.cos(a - 0.4), y1 - hl * Math.sin(a - 0.4));
    ctx.lineTo(x1 - hl * Math.cos(a + 0.4), y1 - hl * Math.sin(a + 0.4)); ctx.fill();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = forces();
    const gy = h * 0.72, u = w / 13; // 1 m
    // 땅
    ctx.fillStyle = ice.checked ? "#dfeaf0" : "#d9c7a6"; ctx.fillRect(0, gy, w, 8);
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    for (let m = Math.floor(x) - 1; m < x + 14; m++) { const px = (m - x) * u + w * 0.1; if (m % 2 === 0) { ctx.beginPath(); ctx.moveTo(px, gy + 8); ctx.lineTo(px, gy + 13); ctx.stroke(); } }
    const hx = w * 0.62, cx = w * 0.26; // 말(가슴)과 수레 중심의 화면 위치
    const on = (who) => view === "all" ? (who === "horse" || who === "cart" || who === "ext") : view === who;
    const alpha = (a) => { ctx.globalAlpha = a ? 1 : 0.18; };
    // 수레
    ctx.fillStyle = "#8a6b4e"; ctx.fillRect(cx - 1.3 * u, gy - 1.5 * u, 2.6 * u, 0.9 * u);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, gy - 0.45 * u, 0.45 * u, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#c9c4b4"; ctx.beginPath(); ctx.arc(cx, gy - 0.45 * u, 0.12 * u, 0, Math.PI * 2); ctx.fill();
    // 끌채
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx + 1.3 * u, gy - 1.1 * u); ctx.lineTo(hx - 0.9 * u, gy - 1.25 * u); ctx.stroke();
    // 말
    ctx.fillStyle = "#6b4a33";
    ctx.beginPath(); ctx.ellipse(hx, gy - 1.55 * u, 1.05 * u, 0.42 * u, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx + 0.7 * u, gy - 1.8 * u); ctx.lineTo(hx + 1.35 * u, gy - 2.6 * u); ctx.lineTo(hx + 1.7 * u, gy - 2.35 * u); ctx.lineTo(hx + 1.0 * u, gy - 1.5 * u); ctx.fill();
    ctx.strokeStyle = "#6b4a33"; ctx.lineWidth = 0.16 * u;
    const ph = t * (1.5 + v * 1.2), sw = v > 0.01 || s.f > R ? 0.18 : 0;
    [[-0.75, 0], [-0.55, 1.6], [0.6, 3.1], [0.8, 4.7]].forEach(([lx, p]) => {
      const dx = Math.sin(ph * 4 + p) * sw * u;
      ctx.beginPath(); ctx.moveTo(hx + lx * u, gy - 1.3 * u); ctx.lineTo(hx + lx * u + dx, gy); ctx.stroke();
    });
    const k = 0.15 * u / 60; // 1 N → px
    const L = (F) => Math.min(F * k * 1.1, 3.2 * u);
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
    // 땅 ↔ 말 (마찰): 말이 땅을 뒤로, 땅이 말을 앞으로
    alpha(on("horse") || on("ext")); arrow(hx - 0.2 * u, gy - 0.25 * u, hx - 0.2 * u + L(s.f), gy - 0.25 * u, PAIR_G);
    ctx.fillStyle = PAIR_G; if (s.f > 1) ctx.fillText("땅→말", hx + 0.2 * u + L(s.f) / 2, gy - 0.4 * u);
    alpha(view === "ground"); arrow(hx - 0.2 * u, gy + 4, hx - 0.2 * u - L(s.P), gy + 4, PAIR_G, 2, true);
    if (view === "ground" && s.P > 1) ctx.fillText("말→땅", hx - 0.2 * u - L(s.P) / 2, gy + 22);
    // 수레 ↔ 말 (끌채)
    const ty = gy - 1.8 * u;
    alpha(view === "horse"); arrow(hx - 0.9 * u, ty, hx - 0.9 * u - L(s.T), ty, PAIR_T);
    ctx.fillStyle = PAIR_T; if (view === "horse" && s.T > 1) ctx.fillText("수레→말", hx - 0.9 * u - L(s.T) / 2, ty - 8);
    alpha(view === "cart"); arrow(cx + 1.3 * u, ty - 0.5 * u, cx + 1.3 * u + L(s.T), ty - 0.5 * u, PAIR_T);
    if (view === "cart" && s.T > 1) ctx.fillText("말→수레", cx + 1.3 * u + L(s.T) / 2, ty - 0.5 * u - 8);
    // 땅 → 수레 (굴림 저항)
    alpha(on("cart") || on("ext")); arrow(cx, gy - 0.1 * u, cx - L(s.r), gy - 0.1 * u, COL_R);
    ctx.fillStyle = COL_R; if (s.r > 1) ctx.fillText("저항", cx - L(s.r) / 2, gy + 20);
    ctx.globalAlpha = 1;
    // 알짜힘 판정
    const net = view === "horse" ? s.f - s.T : view === "cart" ? s.T - s.r : view === "all" ? s.f - s.r : null;
    ctx.textAlign = "left"; ctx.font = `500 12px ${F.mono}`; ctx.fillStyle = C.ink;
    const who = { horse: "말", cart: "수레", all: "말+수레", ground: "땅" }[view];
    if (net != null) ctx.fillText(`${who}에 작용하는 알짜힘 = ${net.toFixed(0)} N`, 10, 20);
    else ctx.fillText("말이 땅을 뒤로 민다 (땅에 작용하는 힘)", 10, 20);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText(`말 500 kg · 수레 300 kg · v = ${v.toFixed(2)} m/s`, 10, 38);
    if (view === "all") ctx.fillText("끌채의 두 힘은 서로 상쇄되어 빠짐", 10, 54);
    if (s.slip) { ctx.fillStyle = C.warn; ctx.fillText(`발굽이 미끄러짐: 땅이 줄 수 있는 힘은 최대 ${s.fmax.toFixed(0)} N`, 10, view === "all" ? 70 : 54); }
  }

  sP.addEventListener("input", () => { update(); draw(); });
  ice.addEventListener("input", () => { update(); draw(); });
  root.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => {
    view = b.dataset.view;
    root.querySelectorAll("[data-view]").forEach((c) => c.setAttribute("aria-pressed", c === b ? "true" : "false"));
    draw();
  }));
  $(".h-reset").addEventListener("click", () => { x = 0; v = 0; t = 0; draw(); });
  update();
  loop(cv, (dt) => { for (let i = 0; i < 5; i++) step(dt / 5); update(); draw(); });
})();
