/* 카드: 밥을 먹으면 혈당은 어떻게 다시 내려갈까? — 인슐린·글루카곤의 음성 피드백 (모식 모형)
   혈당 mg/dL, 인슐린 μU/mL 어림, 글루카곤은 공복 대비 상대값 */
(() => {
  const root = document.getElementById("card-bio-glucose");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sCarb = $(".carb"), oCarb = $(".carb-out"), sT = $(".tcur"), oT = $(".tcur-out");
  const cEx = $(".ex"), cNoI = $(".noins"), cNoG = $(".nogcg");
  const nPeak = $(".g-peak"), nBack = $(".g-back"), nMin = $(".g-min"), msg = $(".gl-msg");
  const INS = "#3f6f9f", GCG = "#d0782a";
  const MEAL = 60, EX0 = 210, EX1 = 270, TMAX = 360, DT = 0.25;

  function sim(carb, ex, noIns, noGcg) {
    let G = 90, I = 10, X = 10, N = 60, Q1 = 0, Q2 = 0;
    const out = [];
    for (let i = 0, t = 0; t <= TMAX + 1e-9; i++, t = i * DT) {
      if (i === MEAL / DT) Q1 += carb * 1000 * 0.7;               // 흡수되어 혈액에 오는 양 (간이 먼저 일부를 가져감)
      const e1 = Q1 / 25, Ra = Q2 / 35; Q1 -= e1 * DT; Q2 += (e1 - Ra) * DT;
      const exer = ex && t >= EX0 && t < EX1;
      const S = noIns ? 0 : Math.max(0, 1 + 0.09 * (G - 90));       // 이자 β세포: 혈당이 높을수록 인슐린 분비
      I += DT * (S - 0.1 * I); X += DT * 0.06 * (I - X);            // X: 조직에서 실제로 작용하는 인슐린 (지연)
      const Nss = noGcg ? 0 : 60 * clamp(1 + (90 - G) / 20, 0.3, 4) + (exer ? 60 : 0); // 이자 α세포
      N += DT * (Nss - N) / 8;
      const hgp = 1.2 * (0.4 + 0.6 * N / 60) * 2 / (1 + X / 10);  // 간이 내보내는 포도당 (글리코젠 분해 등)
      const up = 0.7 + 0.05 * X * G / 90 * (exer ? 2.2 : 1) + (exer ? 0.6 : 0) + Math.max(0, G - 180) * 0.02; // 뇌 + 인슐린 의존 흡수 + 운동 + 오줌
      G = Math.max(20, G + DT * (Ra / 160 + hgp - up));
      if (i % 4 === 0) out.push({ t, G, I, N, hgp });
    }
    return out;
  }

  let data = [], ref = [];
  const { ctx, size } = fit(cv, () => draw());
  const at = (t) => data[clamp(Math.round(t), 0, data.length - 1)];

  function draw() {
    const { w, h } = size;
    if (!w || !data.length) return;
    ctx.clearRect(0, 0, w, h);
    const sh = Math.max(96, h * 0.27);
    drawScheme({ x: 0, y: 0, w, h: sh });
    const g = { x: 40, y: sh + 26, w: w - 52, h: (h - sh - 26 - 34) * 0.62 };
    const g2 = { x: 40, y: g.y + g.h + 20, w: g.w, h: h - (g.y + g.h + 20) - 30 };
    const X = (t) => g.x + t / TMAX * g.w;
    const Y = (v) => g.y + (1 - v / 320) * g.h;
    NM.axes(ctx, { x0: g.x, y0: g.y, w: g.w, h: g.h, X, Y, xt: [], yt: [[0, "0"], [100, "100"], [200, "200"], [300, "300"]], ylabel: "혈당 (mg/dL)" });
    ctx.fillStyle = "rgba(116,171,102,.14)"; ctx.fillRect(g.x, Y(140), g.w, Y(70) - Y(140));
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.forest; ctx.textAlign = "right"; ctx.fillText("정상 범위 어림 70–140", g.x + g.w - 3, Y(140) - 3);
    const band = (t0, t1, lab, col) => { ctx.fillStyle = col; ctx.fillRect(X(t0), g.y, X(t1) - X(t0), g.h); ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText(lab, X(t0) + 3, g.y + 11); };
    ctx.fillStyle = C.ink; ctx.fillRect(X(MEAL) - 1, g.y, 2, g.h); ctx.textAlign = "left"; ctx.fillStyle = C.ink2; ctx.fillText("식사", X(MEAL) + 4, g.y + 11);
    if (cEx.checked) band(EX0, EX1, "운동", "rgba(208,120,42,.10)");
    const line = (d, key, Yf, col, lw, dash) => { ctx.setLineDash(dash || []); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); d.forEach((p, i) => i ? ctx.lineTo(X(p.t), Yf(p[key])) : ctx.moveTo(X(p.t), Yf(p[key]))); ctx.stroke(); ctx.setLineDash([]); };
    if (cNoI.checked || cNoG.checked || cEx.checked) line(ref, "G", Y, C.ink3, 1.2, [5, 4]);
    line(data, "G", Y, C.ink, 2.4);
    // 호르몬
    const Yh = (v) => g2.y + (1 - clamp(v, 0, 3) / 3) * g2.h;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(g2.x + .5, g2.y + .5, g2.w, g2.h);
    line(data.map((p) => ({ t: p.t, v: p.I / 30 })), "v", Yh, INS, 1.8);
    line(data.map((p) => ({ t: p.t, v: p.N / 60 })), "v", Yh, GCG, 1.8);
    ctx.textAlign = "left"; ctx.fillStyle = INS; ctx.fillText("인슐린", g2.x + 4, g2.y + 11);
    ctx.fillStyle = GCG; ctx.fillText("글루카곤", g2.x + 50, g2.y + 11);
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("상대값", g2.x + g2.w - 4, g2.y + 11);
    ctx.textAlign = "center";
    for (let t = 0; t <= TMAX; t += 60) ctx.fillText(`${t / 60}`, X(t), g2.y + g2.h + 13);
    ctx.textAlign = "right"; ctx.fillText("시각 (시간)", g2.x + g2.w, g2.y + g2.h + 26);
    // 커서
    const t = +sT.value, d = at(t);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(t) + .5, g.y); ctx.lineTo(X(t) + .5, g2.y + g2.h); ctx.stroke();
    ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(X(t), Y(d.G), 4.5, 0, Math.PI * 2); ctx.fill();
  }

  /* 위: 이자 → 호르몬 → 간·조직, 지금 시각의 흐름 */
  function drawScheme(b) {
    const d = at(+sT.value), { x, y, w, h } = b;
    ctx.save();
    ctx.fillStyle = "#f6f1e4"; ctx.fillRect(x + 2, y + 2, w - 4, h - 8);
    const cy = y + h * 0.5, bx = [x + w * 0.14, x + w * 0.5, x + w * 0.86];
    const box = (cx, lab, sub, col) => {
      ctx.fillStyle = "#fff"; ctx.strokeStyle = col; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(cx - w * 0.12, cy - 22, w * 0.24, 44, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.font = `600 12px ${F.sans}`; ctx.fillText(lab, cx, cy - 4);
      ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.fillText(sub, cx, cy + 12);
    };
    box(bx[0], "혈액", `혈당 ${Math.round(d.G)}`, C.ink2);
    box(bx[1], "이자", "β세포 · α세포", C.ink2);
    const store = d.hgp < 0.9 && d.I > 15, rel = d.hgp > 1.5;
    box(bx[2], "간", store ? "포도당 → 글리코젠" : rel ? "글리코젠 → 포도당" : "거의 균형", C.ink2);
    const arrow = (x0, x1, yy, k, col, lab) => {
      const lw = 1 + 5 * clamp(k, 0, 1.5) / 1.5;
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.globalAlpha = 0.3 + 0.7 * clamp(k, 0, 1);
      ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x1 - 6, yy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1, yy); ctx.lineTo(x1 - 8, yy - 4 - lw / 2); ctx.lineTo(x1 - 8, yy + 4 + lw / 2); ctx.fill();
      ctx.globalAlpha = 1; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(lab, (x0 + x1) / 2, yy - 6 - lw / 2);
    };
    arrow(bx[0] + w * 0.12, bx[1] - w * 0.12, cy, (d.G - 60) / 80, C.ink2, "혈당 감지");
    arrow(bx[1] + w * 0.12, bx[2] - w * 0.12, cy - 10, d.I / 40, INS, "인슐린");
    arrow(bx[1] + w * 0.12, bx[2] - w * 0.12, cy + 14, d.N / 90, GCG, "글루카곤");
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText(`${Math.floor(+sT.value / 60)}시간 ${Math.round(+sT.value % 60)}분`, x + 8, y + 14);
    ctx.restore();
  }

  function update() {
    oCarb.textContent = sCarb.value;
    oT.textContent = `${Math.floor(+sT.value / 60)}:${String(Math.round(+sT.value % 60)).padStart(2, "0")}`;
    data = sim(+sCarb.value, cEx.checked, cNoI.checked, cNoG.checked);
    ref = sim(+sCarb.value, false, false, false);
    const after = data.filter((p) => p.t >= MEAL);
    const pk = Math.max(...after.map((p) => p.G));
    const back = after.find((p) => p.t > MEAL + 20 && p.G < 110);
    const mn = Math.min(...data.map((p) => p.G));
    nPeak.textContent = `${Math.round(pk)} mg/dL`; nPeak.className = "g-peak" + (pk > 200 ? " bad" : "");
    nBack.textContent = back ? `${Math.round(back.t - MEAL)}분` : "돌아오지 않음"; nBack.className = "g-back" + (back ? "" : " bad");
    nMin.textContent = `${Math.round(mn)} mg/dL`; nMin.className = "g-min" + (mn < 70 ? " bad" : "");
    msg.textContent = cNoI.checked ? "인슐린이 없으면 음성 피드백 고리가 끊깁니다. 세포가 포도당을 받아들이지 못하고 간도 포도당을 계속 내보내, 혈당이 높은 채로 머뭅니다. 1형 당뇨병이 이런 상태입니다."
      : cNoG.checked ? "글루카곤이 없으면 혈당이 떨어질 때 간이 포도당을 충분히 내보내지 못합니다. 공복이나 운동 중에 혈당이 정상 범위 아래로 내려갑니다."
      : cEx.checked ? "운동하면 근육이 포도당을 많이 씁니다. 혈당이 조금 내려가자 글루카곤이 늘어 간이 포도당을 내보내고, 혈당은 거의 제자리를 지킵니다."
      : "혈당이 오르면 인슐린이 늘고 글루카곤이 줄어, 혈당이 다시 내려갑니다. 결과(혈당)가 원인(호르몬 분비)을 거꾸로 되돌리는 음성 피드백입니다.";
    draw();
  }
  [sCarb].forEach((el) => el.addEventListener("input", update));
  sT.addEventListener("input", () => { oT.textContent = `${Math.floor(+sT.value / 60)}:${String(Math.round(+sT.value % 60)).padStart(2, "0")}`; draw(); });
  [cEx, cNoI, cNoG].forEach((el) => el.addEventListener("change", update));
  update();
})();
