/* 카드: 당뇨병은 몸의 어떤 균형이 깨진 것일까? — 포도당 75 g을 마신 뒤 혈당·인슐린 곡선 (모식 모형) */
(() => {
  const root = document.getElementById("card-bio-glucose");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sB = $(".beta"), sS = $(".sens");

  /* 모식 모형 (분 단위)
     dG/dt = 흡수 + 간의 포도당 방출(인슐린이 억제) − (인슐린 비의존 흡수 + 감수성×인슐린)×G − 콩팥 배출(180 mg/dL 초과분)
     dI/dt = 분비 능력×혈당 반응(시그모이드)×(1 + 장 호르몬 효과) − 제거 */
  function sim(beta, sens) {
    const Vg = 130, A = 75000 * 0.9 / Vg, tau = 40;
    const k0 = 0.008, Si = 0.000712 * sens, E0 = 1.728, Ie = 10, n = 0.12, bet = 11.1 * beta, gam = 1.2;
    const sig = (G) => G ** 4 / (G ** 4 + 180 ** 4);
    let G = 90, I = 6, urine = 0;
    const out = [], dt = 0.5;
    for (let t = -600; t <= 180; t += dt) {
      const Ra = t >= 0 ? A * t / tau ** 2 * Math.exp(-t / tau) : 0;
      const ren = 0.0096 * Math.max(0, G - 180);
      const dG = Ra + E0 / (1 + I / Ie) - (k0 + Si * I) * G - ren;
      const dI = bet * sig(G) * (1 + gam * Ra / 3) - n * I;
      G += dG * dt; I += dI * dt;
      if (t >= 0) urine += ren * dt * Vg / 1000; // g
      if (t >= -30 && Math.abs(t % 2) < 1e-9) out.push([t, G, I]);
    }
    return { pts: out, urine };
  }

  const { ctx, size } = fit(cv, () => draw());
  let R = null;

  function draw() {
    const { w, h } = size;
    if (!w || !R) return;
    ctx.clearRect(0, 0, w, h);
    const padL = 38, padR = 12, gw = w - padL - padR;
    const X = (t) => padL + (t + 30) / 210 * gw;
    const gT = 20, gH = (h - 60) * 0.64, iT = gT + gH + 26, iH = (h - 60) * 0.36 - 4;
    const GMAX = 350, IMAX = 150;
    const YG = (v) => gT + (1 - Math.min(v, GMAX) / GMAX) * gH, YI = (v) => iT + (1 - Math.min(v, IMAX) / IMAX) * iH;
    NM.axes(ctx, { x0: padL, y0: gT, w: gw, h: gH, X, Y: YG, yt: [[0, "0"], [100, "100"], [200, "200"], [300, "300"]], ylabel: "혈당 (mg/dL)" });
    NM.axes(ctx, { x0: padL, y0: iT, w: gw, h: iH, X, Y: YI, xt: [[0, "0"], [30, "30"], [60, "60"], [90, "90"], [120, "120"], [150, "150"], [180, "180분"]], yt: [[0, "0"], [50, "50"], [100, "100"]], ylabel: "인슐린 (μU/mL)" });
    // 기준선
    ctx.font = `10.5px ${F.mono}`;
    ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
    ctx.strokeStyle = C.warn; ctx.beginPath(); ctx.moveTo(padL, YG(180)); ctx.lineTo(padL + gw, YG(180)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.textAlign = "right"; ctx.fillText("180: 넘으면 소변에 포도당", padL + gw - 2, YG(180) + 13);
    // 진단 기준 표시: 공복 126, 2시간 200
    const mark = (t, v, s) => {
      ctx.strokeStyle = "rgba(181,83,47,.7)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X(t) - 8, YG(v)); ctx.lineTo(X(t) + 8, YG(v)); ctx.stroke();
      ctx.fillStyle = C.warn; ctx.textAlign = "left"; ctx.fillText(s, X(t) + 10, YG(v) + 4);
    };
    mark(0, 126, "126"); mark(120, 200, "200");
    ctx.textAlign = "left";
    // 음료 시점
    ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(X(0) + .5, gT); ctx.lineTo(X(0) + .5, iT + iH); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.fillText("포도당 75 g", X(0) + 4, gT + 12);
    // 기준(건강) 곡선
    const line = (pts, k, Y) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(X(p[0]), Y(p[k])) : ctx.moveTo(X(p[0]), Y(p[k])))); ctx.stroke(); };
    ctx.setLineDash([4, 3]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2;
    line(BASE.pts, 1, YG); line(BASE.pts, 2, YI); ctx.setLineDash([]);
    ctx.strokeStyle = C.apple; ctx.lineWidth = 2.4; line(R.pts, 1, YG);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.2; line(R.pts, 2, YI);
    // 공복·2시간 점
    for (const t of [0, 120]) { const p = R.pts.find((q) => q[0] === t); ctx.beginPath(); ctx.arc(X(t), YG(p[1]), 4, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); }
  }
  const BASE = sim(1, 1);

  function update() {
    const b = +sB.value, s = +sS.value;
    $(".beta-out").textContent = b; $(".sens-out").textContent = s;
    R = sim(b / 100, s / 100);
    const f = R.pts.find((p) => p[0] === 0)[1], h2 = R.pts.find((p) => p[0] === 120)[1];
    const ip = Math.max(...R.pts.map((p) => p[2]));
    $(".fast").textContent = Math.round(f); $(".h2").textContent = Math.round(h2); $(".ipk").textContent = Math.round(ip);
    const cls = f >= 126 || h2 >= 200 ? 2 : f >= 100 || h2 >= 140 ? 1 : 0;
    const j = $(".judge");
    j.textContent = ["정상 범위", "경계 범위", "당뇨병 범위"][cls];
    j.className = "judge " + ["good", "", "bad"][cls];
    let m = "";
    if (b < 15) m = "인슐린이 거의 나오지 않습니다. 세포가 포도당을 받아들이지 못하고, 간은 계속 포도당을 내보내 공복 혈당부터 높습니다.";
    else if (s < 60 && b > 150 && cls === 0) m = "인슐린에 대한 반응이 약해졌지만, 이자가 인슐린을 훨씬 많이 내보내 혈당을 지키고 있습니다. 혈당은 정상이어도 인슐린 곡선은 기준보다 크게 높습니다.";
    else if (cls === 2) m = "인슐린에 대한 반응이 약하고 분비도 그만큼 늘지 못해 혈당이 제대로 내려가지 않습니다.";
    else if (cls === 1) m = "혈당이 정상보다 높게 오래 머뭅니다. 당뇨병 전 단계에 해당하는 범위입니다.";
    else m = "인슐린이 제때 나와 혈당이 2시간 안에 거의 제자리로 돌아옵니다.";
    if (R.urine > 0.5) m += ` 혈당이 180 mg/dL을 넘은 동안 포도당 약 ${R.urine.toFixed(0)} g이 소변으로 빠져나갔습니다(요당).`;
    $(".g-note").textContent = m;
    root.querySelectorAll("[data-set]").forEach((el) => el.setAttribute("aria-pressed", el.dataset.set === `${b},${s}`));
    draw();
  }
  [sB, sS].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-set]").forEach((el) => el.addEventListener("click", () => {
    const [b, s] = el.dataset.set.split(","); sB.value = b; sS.value = s; update();
  }));
  update();
})();
