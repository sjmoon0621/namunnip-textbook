/* 카드: 태양광과 풍력만으로 하루 전기를 채울 수 있을까? — 하루 수요와 발전량 (모식, 상대값) */
(() => {
  const root = document.getElementById("card-is2-renewable");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sS = $(".pv"), sW = $(".wind"), sB = $(".bat");
  const oS = $(".pv-out"), oW = $(".wind-out"), oB = $(".bat-out");
  const nRe = $(".re"), nGap = $(".gap"), nCut = $(".cut"), msg = $(".r-msg");

  const DT = 0.25, STEPS = 96;
  const g = (t, m, s) => Math.exp(-0.5 * ((t - m) / s) ** 2);
  const ramp = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  // 수요 (하루 최대 ≈ 100): 밤에 낮고 낮에 높은 모식 곡선
  const demand = (t) => 62 + 26 * (ramp(t, 6, 10) - ramp(t, 20, 23.5)) + 8 * g(t, 15, 2.5);
  const SKY = {
    summer: { rise: 5.5, set: 19.5, peak: 0.8, name: "맑은 여름날" },
    cloudy: { rise: 5.5, set: 19.5, peak: 0.2, name: "흐린 여름날" },
    winter: { rise: 7.5, set: 17.5, peak: 0.6, name: "맑은 겨울날" },
  };
  const WIND = { strong: 0.45, weak: 0.08 };
  let sky = "summer", wind = "weak";
  const sun = (t) => { const k = SKY[sky]; if (t <= k.rise || t >= k.set) return 0; return k.peak * Math.pow(Math.sin(Math.PI * (t - k.rise) / (k.set - k.rise)), 1.3); };
  const windCF = (t) => WIND[wind] * (1 + 0.35 * Math.cos(2 * Math.PI * (t - 3) / 24));

  function simulate() {
    const PV = +sS.value, WD = +sW.value, CAP = +sB.value, ETA = 0.95;  // 충전·방전 각 95%
    let soc = 0; const rows = [];
    for (let pass = 0; pass < 2; pass++) {              // 하루를 두 번 돌려 저장량이 하루 주기로 맞춰지게
      rows.length = 0;
      let E = { dem: 0, direct: 0, dis: 0, gap: 0, cut: 0, gen: 0 };
      for (let i = 0; i < STEPS; i++) {
        const t = i * DT, d = demand(t), s = PV * sun(t), w = WD * windCF(t), re = s + w;
        const direct = Math.min(d, re);
        let surplus = re - direct, need = d - direct, chg = 0, dis = 0;
        if (surplus > 0 && CAP > 0) { chg = Math.min(surplus, (CAP - soc) / DT / ETA); soc += chg * ETA * DT; surplus -= chg; }
        if (need > 0 && soc > 0) { dis = Math.min(need, soc * ETA / DT); soc -= dis / ETA * DT; need -= dis; }
        rows.push({ t, d, s, w, direct, dis, gap: need, cut: surplus, chg });
        E.dem += d * DT; E.direct += direct * DT; E.dis += dis * DT; E.gap += need * DT; E.cut += surplus * DT; E.gen += re * DT;
      }
      rows.E = E;
    }
    return rows;
  }

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = simulate();
    const padL = 34, padR = 10, padT = 22, padB = 30, pw = w - padL - padR, ph = h - padT - padB;
    const ymax = Math.max(130, ...rows.map((r) => r.s + r.w)) * 1.05;
    const X = (t) => padL + t / 24 * pw, Y = (v) => padT + (1 - v / ymax) * ph;
    NM.axes(ctx, { x0: padL, y0: padT, w: pw, h: ph, X, Y,
      xt: [[0, "0시"], [6, "6"], [12, "12"], [18, "18"], [24, "24시"]],
      yt: [[0, "0"], [50, "50"], [100, "100"], ...(ymax > 200 ? [[200, "200"]] : [])], ylabel: "전력 (하루 최대 수요 ≈ 100)" });
    const area = (lo, hi, col) => {
      ctx.beginPath();
      rows.forEach((r, i) => { const x = X(r.t), y = Y(hi(r)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      for (let i = rows.length - 1; i >= 0; i--) ctx.lineTo(X(rows[i].t), Y(lo(rows[i])));
      ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    };
    // 수요를 채운 방식: 바로 쓴 재생 → 저장에서 꺼낸 것 → 부족분
    area(() => 0, (r) => r.direct, "rgba(224,160,42,.55)");
    area((r) => r.direct, (r) => r.direct + r.dis, "rgba(59,124,42,.6)");
    area((r) => r.direct + r.dis, (r) => r.d, "rgba(181,83,47,.35)");
    // 수요 위: 충전, 버림
    area((r) => r.d, (r) => r.d + r.chg, "rgba(59,124,42,.25)");
    area((r) => r.d + r.chg, (r) => r.d + r.chg + r.cut, "rgba(141,141,146,.35)");
    // 발전량 선
    ctx.beginPath(); rows.forEach((r, i) => { const x = X(r.t), y = Y(r.s + r.w); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.strokeStyle = "#a8781c"; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); rows.forEach((r, i) => { const x = X(r.t), y = Y(r.d); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink; ctx.textAlign = "right";
    ctx.fillText("수요", X(23.8), Y(demand(23.8)) - 6); ctx.textAlign = "left";
    ctx.fillStyle = C.ink3; ctx.fillText(`${SKY[sky].name} · 바람 ${wind === "strong" ? "강함" : "약함"}`, padL + 6, padT + 12);
  }

  function update() {
    oS.textContent = sS.value; oW.textContent = sW.value; oB.textContent = sB.value;
    const E = simulate().E;
    const re = (E.direct + E.dis) / E.dem;
    nRe.textContent = `${Math.round(re * 100)}%`;
    nGap.textContent = `${Math.round(E.gap / E.dem * 100)}%`;
    nGap.classList.toggle("bad", E.gap / E.dem > 0.05);
    nCut.textContent = E.gen > 0 ? `${Math.round(E.cut / E.gen * 100)}%` : "—";
    msg.textContent = E.gap / E.dem < 0.01 ? "이날은 재생 에너지와 저장 장치만으로 수요를 모두 채웠습니다. 날씨를 바꿔도 그럴까요?"
      : +sB.value === 0 && E.cut > 1 ? "한낮에는 전기가 남아 버리는데 밤에는 모자랍니다. 저장 장치를 늘려 보세요."
      : "모자란 몫(붉은 부분)은 다른 발전소가 채워야 합니다.";
    root.querySelectorAll("[data-sky]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.sky === sky));
    root.querySelectorAll("[data-wind]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.wind === wind));
    draw();
  }
  [sS, sW, sB].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-sky]").forEach((b) => b.addEventListener("click", () => { sky = b.dataset.sky; update(); }));
  root.querySelectorAll("[data-wind]").forEach((b) => b.addEventListener("click", () => { wind = b.dataset.wind; update(); }));
  update();
})();
