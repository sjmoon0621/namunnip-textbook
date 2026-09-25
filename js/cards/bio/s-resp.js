/* 카드: 세포 호흡은 포도당의 에너지를 어떻게 꺼낼까? — 단계별 ATP·운반체·열 장부 (표준 상태 어림값) */
(() => {
  const root = document.getElementById("card-bio-resp");
  if (!root) return;
  const { C, F, clamp, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".prog"), o2 = $(".o2"), basis = $(".basis"), shuttle = $(".shuttle"), playBtn = $(".play");
  let mode = "resp";

  const TOTAL = 2870, E_ATP = 30.5, E_NADH = 219, E_FADH = 157; // kJ/mol, 표준 상태 어림값
  const BLUE = "#4a78b5", HEAT = "#d9822b", GRAY = "#d9dad2";
  const STAGE = ["시작", "해당 과정", "피루브산 산화", "TCA 회로", "전자 전달계"];

  function states() {
    const nV = basis.value === "old" ? 3 : 2.5, fV = basis.value === "old" ? 2 : 1.5;
    const cyto = shuttle.value === "gp" ? fV : nV; // 세포질 NADH 2개가 미토콘드리아로 넘어가는 방식
    const etc = 8 * nV + 2 * cyto + 2 * fV;
    if (mode === "burn") return [0, 1, 2, 3, 4].map((s) => ({ atp: 0, nadh: 0, fadh: 0, co2: s ? 6 : 0, heat: s ? TOTAL : 0 }));
    if (!o2.checked) return [0, 1, 2, 3, 4].map((s) => ({ atp: s ? 2 : 0, nadh: 0, fadh: 0, co2: 0, heat: s ? 135 : 0, lactate: s > 0 }));
    const atpD = [0, 2, 2, 4, 4], nadh = [0, 2, 4, 10, 0], fadh = [0, 0, 0, 2, 0], co2 = [0, 0, 2, 6, 6];
    return [0, 1, 2, 3, 4].map((s) => {
      const atp = atpD[s] + (s === 4 ? etc : 0);
      const heat = s < 4 ? [0, 85, 152, 244][s] : TOTAL - atp * E_ATP;
      return { atp, nadh: nadh[s], fadh: fadh[s], co2: co2[s], heat };
    });
  }
  function energy(st) {
    const a = st.atp * E_ATP, c = st.nadh * E_NADH + st.fadh * E_FADH;
    return { atp: a, car: c, heat: st.heat, rem: Math.max(0, TOTAL - a - c - st.heat) };
  }

  const { ctx, size } = fit(cv, () => draw());
  const VW = 400, VH = 300;

  function txt(s, x, y, o = {}) {
    ctx.font = `${o.w || 500} ${o.size || 12}px ${o.mono ? F.mono : F.sans}`;
    ctx.textAlign = o.align || "center"; ctx.fillStyle = o.c || C.ink; ctx.fillText(s, x, y); ctx.textAlign = "left";
  }
  function arrow(x0, y0, x1, y1, c) {
    ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    const a = Math.atan2(y1 - y0, x1 - x0);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - 7 * Math.cos(a - .4), y1 - 7 * Math.sin(a - .4)); ctx.lineTo(x1 - 7 * Math.cos(a + .4), y1 - 7 * Math.sin(a + .4)); ctx.fill();
  }

  function draw() {
    const { w, h } = size;
    if (!w) return;
    const dpr = cv.width / w, s = w / VW;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr * s, 0, 0, dpr * s, 0, 0);
    const t = +sT.value, S = states(), aer = o2.checked && mode === "resp";
    const alphaOf = (k) => (mode === "burn" ? 0.25 : t >= k ? 1 : t > k - 1 ? 0.55 + 0.45 * (t - (k - 1)) : 0.3);

    // 세포질
    ctx.fillStyle = "#f4f1e8"; ctx.strokeStyle = "#cfc6ae"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.roundRect(6, 20, 122, 162, 10); ctx.fill(); ctx.stroke();
    txt("세포질", 16, 36, { align: "left", c: C.ink3, size: 11, mono: 1 });
    ctx.globalAlpha = mode === "burn" ? 0.25 : 1;
    txt("포도당", 67, 60, { w: 700 }); txt("C₆H₁₂O₆", 67, 74, { size: 10, c: C.ink3, mono: 1 });
    ctx.globalAlpha = alphaOf(1);
    arrow(67, 80, 67, 112, C.ink2);
    ctx.fillStyle = "#f4f1e8"; ctx.fillRect(30, 89, 74, 15);
    txt("① 해당 과정", 67, 100, { size: 10.5, w: 700, c: C.forest });
    txt(S[1].lactate ? "젖산 ×2" : "피루브산 ×2", 67, 128, { w: 700 });
    txt(S[1].lactate ? "ATP 2 (발효)" : "ATP 2 · NADH 2", 67, 144, { size: 10, mono: 1, c: C.ink2 });
    ctx.globalAlpha = 1;

    // 미토콘드리아
    const mx = 268, my = 98;
    ctx.globalAlpha = aer ? 1 : 0.35;
    ctx.fillStyle = "#fbeee4"; ctx.strokeStyle = "#c99b7a"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(mx, my, 124, 80, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#f7e0cf"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(mx, my, 112, 68, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // 내막 주름(크리스타)
    ctx.strokeStyle = "#c99b7a"; ctx.lineWidth = 1.2;
    for (let k = 0; k < 7; k++) { const x = 188 + k * 27; ctx.beginPath(); ctx.moveTo(x, 164 - (k % 2 ? 4 : 0)); ctx.lineTo(x, 146); ctx.stroke(); }
    txt("미토콘드리아", mx, 16, { c: C.ink3, size: 11, mono: 1 });
    ctx.globalAlpha = aer ? alphaOf(2) : 0.35;
    arrow(112, 128, 172, 88, C.ink2);
    txt("② 피루브산 산화", 214, 60, { size: 10.5, w: 700, c: C.forest });
    txt("NADH 2 · CO₂ 2", 214, 74, { size: 10, mono: 1, c: C.ink2 });
    ctx.globalAlpha = aer ? alphaOf(3) : 0.35;
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(318, 70, 22, 0.3, Math.PI * 2 - 0.2); ctx.stroke();
    txt("③ TCA 회로", 318, 74, { size: 10.5, w: 700, c: C.forest });
    txt("ATP 2 · NADH 6", 318, 106, { size: 10, mono: 1, c: C.ink2 });
    txt("FADH₂ 2 · CO₂ 4", 318, 119, { size: 10, mono: 1, c: C.ink2 });
    ctx.globalAlpha = aer ? alphaOf(4) : 0.35;
    ctx.fillStyle = "rgba(247,224,207,.95)"; ctx.fillRect(mx - 96, 129, 192, 34);
    txt("④ 전자 전달계 (내막)", mx, 140, { size: 10.5, w: 700, c: C.forest });
    txt(`NADH·FADH₂ → ATP ${aer ? S[4].atp - 4 : "—"} · O₂ → H₂O`, mx, 158, { size: 10, mono: 1, c: C.ink2 });
    ctx.globalAlpha = 1;
    if (mode === "resp" && !o2.checked) {
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(190, 40); ctx.lineTo(346, 156); ctx.moveTo(346, 40); ctx.lineTo(190, 156); ctx.stroke();
      ctx.fillStyle = "rgba(251,251,248,.92)"; ctx.fillRect(200, 88, 136, 20);
      txt("O₂가 없어 멈춤", mx, 103, { w: 700, c: C.warn });
    }
    if (mode === "burn" && t > 0) {
      const fx = 200, fy = 110, sc = 0.6 + 0.4 * Math.min(1, t);
      ctx.save(); ctx.translate(fx, fy); ctx.scale(sc, sc);
      ctx.fillStyle = "rgba(224,160,42,.85)"; ctx.beginPath(); ctx.moveTo(0, -70); ctx.bezierCurveTo(40, -20, 44, 30, 0, 44); ctx.bezierCurveTo(-44, 30, -40, -20, 0, -70); ctx.fill();
      ctx.fillStyle = "rgba(212,73,58,.8)"; ctx.beginPath(); ctx.moveTo(0, -30); ctx.bezierCurveTo(22, 0, 22, 30, 0, 38); ctx.bezierCurveTo(-22, 30, -22, 0, 0, -30); ctx.fill();
      ctx.restore();
      ctx.fillStyle = "rgba(251,251,248,.9)"; ctx.fillRect(122, 162, 156, 18);
      txt("한꺼번에 타서 열과 빛으로", 200, 175, { w: 700, c: C.warn });
    }

    // 에너지 막대
    const i = Math.min(3, Math.floor(t)), f = t - i;
    const e0 = energy(S[i]), e1 = energy(S[i + 1]);
    const E = {}; for (const k in e0) E[k] = e0[k] + (e1[k] - e0[k]) * f;
    const bx = 8, by = 214, bw = 384, bh = 22;
    txt("포도당 1몰의 에너지 2870 kJ가 지금 어디에 있나", bx, by - 8, { align: "left", size: 11, c: C.ink2 });
    const segs = [["atp", C.forest, "ATP"], ["car", BLUE, "NADH·FADH₂"], ["rem", GRAY, "아직 분자 속"], ["heat", HEAT, "열"]];
    let x = bx;
    segs.forEach(([k, c]) => { const ww = E[k] / TOTAL * bw; ctx.fillStyle = c; ctx.fillRect(x, by, ww, bh); x += ww; });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(bx + .5, by + .5, bw, bh);
    let lx = bx;
    segs.forEach(([k, c, name]) => {
      ctx.fillStyle = c; ctx.fillRect(lx, by + 34, 10, 10);
      const s2 = `${name} ${Math.round(E[k])}`;
      txt(s2, lx + 14, by + 43, { align: "left", size: 10.5, mono: 1, c: C.ink2 });
      ctx.font = `10.5px ${F.mono}`; lx += 14 + ctx.measureText(s2).width + 12;
    });
    txt("kJ, 표준 상태 어림값", VW - 8, by + 64, { align: "right", size: 10, c: C.ink3, mono: 1 });
  }

  const NOTE = {
    resp: [
      "포도당 한 분자에서 출발합니다. 막대를 밀어 단계를 진행해 보세요.",
      "해당 과정: 세포질에서 포도당이 피루브산 2개로 쪼개집니다. ATP는 알짜로 2개뿐이고, 에너지의 일부는 NADH에 실립니다.",
      "피루브산 산화: 미토콘드리아로 들어간 피루브산에서 CO₂가 떨어져 나가고 NADH가 생깁니다. 아직 ATP는 없습니다.",
      "TCA 회로: 남은 탄소가 모두 CO₂로 나갑니다. 이제 포도당의 에너지 대부분은 ATP가 아니라 NADH와 FADH₂에 실려 있습니다(파란색).",
      "전자 전달계: NADH와 FADH₂의 전자가 O₂까지 전달되며 H⁺ 농도 차이를 만들고, 그 흐름으로 ATP 합성 효소가 ATP를 대량으로 만듭니다.",
    ],
    anaer: "산소가 없으면 전자 전달계가 멈추고, NADH가 쌓여 TCA 회로도 멈춥니다. 근육 세포는 NADH로 피루브산을 젖산으로 바꾸어 해당 과정만 계속합니다. ATP는 2개뿐이고, 에너지 대부분이 젖산 속에 남습니다.",
    burn: "불에 태워도 전체 반응식(포도당 + 6O₂ → 6CO₂ + 6H₂O)과 나오는 에너지 총량은 같습니다. 다만 한 번에 나오니 ATP로 붙잡을 틈이 없이 모두 열과 빛이 됩니다.",
  };

  function update() {
    const t = +sT.value, S = states(), st = S[Math.floor(t + 1e-6)];
    $(".prog-out").textContent = mode === "burn" ? (t > 0 ? "연소" : "시작") : STAGE[Math.floor(t + 1e-6)];
    const fin = S[4];
    $(".atp").textContent = st.atp % 1 ? st.atp.toFixed(1) : st.atp;
    const e = energy(st);
    $(".eff").textContent = `${(e.atp / TOTAL * 100).toFixed(0)}%`;
    $(".heat").textContent = `${(e.heat / TOTAL * 100).toFixed(0)}%`;
    $(".co2").textContent = st.co2;
    $(".note").textContent = mode === "burn" ? NOTE.burn : !o2.checked ? (t >= 1 ? NOTE.anaer : NOTE.resp[0]) : NOTE.resp[Math.floor(t + 1e-6)];
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.m === mode));
    $(".final").textContent = mode === "burn" ? "0개" : o2.checked ? `${fin.atp}개` : "2개 (발효)";
    draw();
  }
  let raf = 0;
  playBtn.addEventListener("click", () => {
    cancelAnimationFrame(raf);
    const start = performance.now();
    const step = (now) => { const p = clamp((now - start) / 6000, 0, 1); sT.value = (4 * p).toFixed(2); update(); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  });
  sT.addEventListener("input", () => { cancelAnimationFrame(raf); update(); });
  [o2, basis, shuttle].forEach((el) => el.addEventListener("change", update));
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; update(); }));
  update();
})();
