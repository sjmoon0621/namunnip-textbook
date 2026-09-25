/* 카드: 전구를 직렬로 이으면 왜 어두워질까? — 정격이 다른 두 전구의 직렬·병렬 연결 (옴의 법칙) */
(() => {
  const root = document.getElementById("card-phy-bulbs");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), selA = $(".bulb-a"), selB = $(".bulb-b");
  const V = 220;
  let mode = "series";

  // 정격 220 V에서 소비 전력 P인 전구의 저항: R = V² / P (필라멘트 저항이 일정하다고 본 모식)
  const R = (p) => V * V / p;
  function solve() {
    const pa = +selA.value, pb = +selB.value, ra = R(pa), rb = R(pb);
    if (mode === "single") { const i = V / ra; return { a: { v: V, i, p: V * i }, b: null }; }
    if (mode === "parallel") return { a: { v: V, i: V / ra, p: V * V / ra }, b: { v: V, i: V / rb, p: V * V / rb } };
    const i = V / (ra + rb);
    return { a: { v: i * ra, i, p: i * i * ra }, b: { v: i * rb, i, p: i * i * rb } };
  }

  const P = fit(cv, () => draw());

  function bulb(ctx, x, y, r, p, label) {
    // 빛: 소비 전력(W)에 따라 퍼지는 원 (밝기 모식)
    const k = Math.min(1, p / 100);
    if (p > 0.5) {
      const g = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * (1.6 + 2.6 * Math.sqrt(k)));
      g.addColorStop(0, `rgba(240,190,60,${0.25 + 0.6 * Math.sqrt(k)})`); g.addColorStop(1, "rgba(240,190,60,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * (1.6 + 2.6 * Math.sqrt(k)), 0, Math.PI * 2); ctx.fill();
    }
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,250,235,${0.5 + 0.5 * Math.sqrt(k)})`; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.strokeStyle = k > 0.05 ? `rgb(${200 + 55 * k},${120 + 80 * k},40)` : C.ink2; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x - r * .5, y + r * .2);
    for (let i = 0; i <= 8; i++) ctx.lineTo(x - r * .5 + r * i / 8, y + r * .2 + (i % 2 ? -r * .22 : 0));
    ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(label, x, y + r + 16);
  }

  function draw() {
    const { ctx, size: { w, h } } = P;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = solve(), pa = +selA.value, pb = +selB.value;
    const x0 = w * 0.1, x1 = w * 0.9, yT = h * 0.28, yB = h * 0.82, r = Math.min(22, w / 22);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    // 전원 (왼쪽 세로선 가운데)
    const ym = (yT + yB) / 2;
    ctx.beginPath(); ctx.moveTo(x0, yT); ctx.lineTo(x0, ym - 16); ctx.moveTo(x0, ym + 16); ctx.lineTo(x0, yB); ctx.stroke();
    ctx.beginPath(); ctx.arc(x0, ym, 16, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); for (let i = 0; i <= 20; i++) { const t = i / 20; ctx.lineTo(x0 - 9 + 18 * t, ym - 5 * Math.sin(t * Math.PI * 2)); } ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText("220 V", x0 + 22, ym + 4);
    // 아래 도선
    ctx.beginPath(); ctx.moveTo(x0, yB); ctx.lineTo(x1, yB); ctx.lineTo(x1, yT); ctx.stroke();
    const la = `${pa} W 전구`, lb = `${pb} W 전구`;
    if (mode === "series") {
      const xa = x0 + (x1 - x0) * 0.35, xb = x0 + (x1 - x0) * 0.68;
      ctx.beginPath(); ctx.moveTo(x0, yT); ctx.lineTo(xa - r, yT); ctx.moveTo(xa + r, yT); ctx.lineTo(xb - r, yT); ctx.moveTo(xb + r, yT); ctx.lineTo(x1, yT); ctx.stroke();
      bulb(ctx, xa, yT, r, s.a.p, la); bulb(ctx, xb, yT, r, s.b.p, lb);
    } else if (mode === "single") {
      const xa = (x0 + x1) / 2;
      ctx.beginPath(); ctx.moveTo(x0, yT); ctx.lineTo(xa - r, yT); ctx.moveTo(xa + r, yT); ctx.lineTo(x1, yT); ctx.stroke();
      bulb(ctx, xa, yT, r, s.a.p, la);
    } else {
      const xa = x0 + (x1 - x0) * 0.42, xb = x0 + (x1 - x0) * 0.75;
      ctx.beginPath(); ctx.moveTo(x0, yT); ctx.lineTo(x1, yT);
      [xa, xb].forEach((x) => { ctx.moveTo(x, yT); ctx.lineTo(x, ym - r); ctx.moveTo(x, ym + r); ctx.lineTo(x, yB); });
      ctx.stroke();
      bulb(ctx, xa, ym, r, s.a.p, la); bulb(ctx, xb, ym, r, s.b.p, lb);
    }
    ctx.textAlign = "right"; ctx.fillStyle = C.ink3;
    const tp = s.a.p + (s.b ? s.b.p : 0);
    ctx.fillText(`전체 소비 전력 ${tp.toFixed(1)} W`, x1, 16);
    ctx.textAlign = "left";
  }

  const put = (cls, o) => {
    const [v, i, p] = root.querySelectorAll(`${cls} dd`);
    if (!o) { v.textContent = i.textContent = p.textContent = "—"; return; }
    v.textContent = `${o.v.toFixed(1)} V`; i.textContent = `${(o.i * 1000).toFixed(0)} mA`; p.textContent = `${o.p.toFixed(1)} W`;
  };
  function update() {
    const s = solve();
    put(".ra", s.a); put(".rb", s.b);
    root.querySelector(".ra dt").textContent = `${selA.value} W 전구 · 전압`;
    root.querySelector(".rb dt").textContent = `${selB.value} W 전구 · 전압`;
    root.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
    draw();
  }
  root.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.mode; update(); }));
  selA.addEventListener("change", update); selB.addEventListener("change", update);
  update();
})();
