/* 카드: 추우면 왜 몸이 떨릴까? — 시상 하부의 체온 조절 (모식 모형, 열량은 어림 W)
   몸: 70 kg, 열용량 약 245 kJ/°C. 화면의 1초 = 몸의 10분 */
(() => {
  const root = document.getElementById("card-bio-thermo");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sTa = $(".ta"), oTa = $(".ta-out"), cFever = $(".fever");
  const nTc = $(".tc"), nM = $(".heat-m"), nL = $(".heat-l"), msg = $(".th-msg");
  let clo = 1;

  function ctrl(Tc, sp) {
    const e = sp - Tc; // 양수: 기준보다 차갑다
    return {
      vaso: clamp(0.3 - 2.5 * e, 0, 1),            // 피부 혈관: 0 수축 … 1 확장
      shiver: clamp((e - 0.1) * 500, 0, 250),       // 골격근 떨림 (W)
      meta: clamp((e - 0.05) * 100, 0, 40),         // 티록신·에피네프린에 의한 물질대사 촉진 (W)
      sweat: clamp((-e - 0.1) * 900, 0, 600),       // 땀 증발 (W)
    };
  }
  function flows(Tc, Ta, sp) {
    const c = ctrl(Tc, sp);
    const M = 85 + c.shiver + c.meta;
    const R = 0.055 - 0.044 * c.vaso + clo * 0.086 + 0.06; // 조직 + 옷 + 공기 (°C/W)
    const dry = (Tc - Ta) / R, evap = 12 + c.sweat;
    return { c, M, dry, evap, net: M - dry - evap };
  }

  let Tc = 37, hist = [], clock = 0, phase = 0;
  const sp = () => cFever.checked ? 39 : 37;
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const f = flows(Tc, +sTa.value, sp()), c = f.c;
    const topH = h * 0.58;
    // 배경: 기온
    const Ta = +sTa.value, warm = clamp((Ta + 10) / 55, 0, 1);
    ctx.fillStyle = `rgb(${Math.round(220 + 30 * warm)},${Math.round(232 - 20 * warm)},${Math.round(242 - 60 * warm)})`;
    ctx.fillRect(0, 0, w, topH);
    // 사람
    const px = w * 0.22, py = topH * 0.55, s = Math.min(topH / 190, w / 330);
    const jit = c.shiver > 15 ? Math.sin(phase * 60) * c.shiver / 250 * 2.2 : 0;
    const skin = `rgb(${Math.round(200 + 45 * c.vaso)},${Math.round(170 - 35 * c.vaso)},${Math.round(150 - 35 * c.vaso)})`;
    ctx.save(); ctx.translate(px + jit, py);
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(0, -62 * s, 15 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(-18 * s, -44 * s, 36 * s, 58 * s, 8 * s); ctx.fill();
    ctx.lineCap = "round"; ctx.strokeStyle = skin; ctx.lineWidth = 9 * s;
    ctx.beginPath(); ctx.moveTo(-18 * s, -38 * s); ctx.lineTo(-28 * s, 6 * s); ctx.moveTo(18 * s, -38 * s); ctx.lineTo(28 * s, 6 * s);
    ctx.moveTo(-9 * s, 12 * s); ctx.lineTo(-11 * s, 60 * s); ctx.moveTo(9 * s, 12 * s); ctx.lineTo(11 * s, 60 * s); ctx.stroke();
    if (clo > 0) { ctx.fillStyle = clo > 2 ? "rgba(70,80,110,.85)" : "rgba(90,120,150,.55)"; ctx.beginPath(); ctx.roundRect(-20 * s, -45 * s, 40 * s, clo > 0.6 ? 70 * s : 40 * s, 8 * s); ctx.fill(); }
    // 땀
    if (c.sweat > 10) { ctx.fillStyle = "rgba(63,111,159,.8)"; const n = Math.min(6, Math.ceil(c.sweat / 60)); for (let i = 0; i < n; i++) { const yy = ((phase * 20 + i * 17) % 40) - 70; ctx.beginPath(); ctx.arc((i % 2 ? 1 : -1) * (12 + i * 2) * s, yy * s, 2.2, 0, Math.PI * 2); ctx.fill(); } }
    // 떨림 표시
    if (c.shiver > 15) { ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(k * 38 * s, -20 * s); ctx.lineTo(k * 44 * s, -14 * s); ctx.lineTo(k * 38 * s, -8 * s); ctx.lineTo(k * 44 * s, -2 * s); ctx.stroke(); } }
    ctx.restore();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText(`기온 ${Ta} °C`, 8, 15);
    ctx.textAlign = "center"; ctx.fillStyle = C.ink2;
    ctx.fillText(`피부 혈관 ${c.vaso < 0.15 ? "수축" : c.vaso > 0.6 ? "확장" : "보통"}`, px, topH - 8);

    // 열 막대: 생산 vs 방출
    const bx = w * 0.45, bw = w - bx - 12, maxW = 520;
    const bar = (y, parts, lab) => {
      ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.font = `10.5px ${F.mono}`; ctx.fillText(lab, bx, y - 5);
      let x0 = bx;
      for (const [v, col, name] of parts) {
        const ww = clamp(v, 0, maxW) / maxW * bw;
        ctx.fillStyle = col; ctx.fillRect(x0, y, ww, 14);
        if (ww > 34) { ctx.fillStyle = "#fff"; ctx.font = `10px ${F.sans}`; ctx.fillText(name, x0 + 3, y + 11); }
        x0 += ww;
      }
    };
    const tot = (a) => a.reduce((s2, p) => s2 + Math.max(0, p[0]), 0);
    const prod = [[85, "#8a8f7c", "기초 대사"], [c.meta, "#b0853a", "호르몬"], [c.shiver, C.warn, "떨림"]];
    const loss = [[Math.max(0, f.dry), "#3f6f9f", "피부로"], [f.evap, "#6aa0c8", "땀·호흡 증발"]];
    bar(topH * 0.3, prod, `열 생산 ${Math.round(tot(prod))} W`);
    bar(topH * 0.62, loss, f.dry < 0 ? `열 방출 ${Math.round(f.evap)} W (공기에서 ${Math.round(-f.dry)} W 받음)` : `열 방출 ${Math.round(tot(loss))} W`);

    // 체온 기록
    const g = { x: 40, y: topH + 26, w: w - 52, h: h - topH - 48 };
    const Y = (T) => g.y + (1 - (T - 34.5) / 5) * g.h;
    NM.axes(ctx, { x0: g.x, y0: g.y, w: g.w, h: g.h, X: (x) => x, Y, xt: [], yt: [[35, "35"], [37, "37"], [39, "39"]], ylabel: "심부 체온 (°C) · 최근 6시간" });
    const X = (i) => g.x + g.w * (1 - (hist.length - 1 - i) / 36);
    ctx.setLineDash([5, 4]); ctx.strokeStyle = C.warn; ctx.lineWidth = 1.2; ctx.beginPath();
    hist.forEach((p, i) => { const y = Y(p.sp); i ? ctx.lineTo(X(i), y) : ctx.moveTo(X(i), y); }); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.beginPath();
    hist.forEach((p, i) => { const y = Y(p.T); i ? ctx.lineTo(X(i), y) : ctx.moveTo(X(i), y); }); ctx.stroke();
    ctx.textAlign = "right"; ctx.fillStyle = C.warn; ctx.font = `10px ${F.mono}`; ctx.fillText("점선: 시상 하부의 기준값", g.x + g.w, g.y + g.h + 14);
  }

  function readout() {
    const f = flows(Tc, +sTa.value, sp());
    nTc.textContent = `${Tc.toFixed(1)} °C`;
    nTc.className = "tc" + (Tc < 35.5 || Tc > 38 ? " bad" : "");
    nM.textContent = `${Math.round(f.M)} W`;
    nL.textContent = `${Math.round(f.dry + f.evap)} W`;
    const e = sp() - Tc, c = f.c;
    msg.textContent = Tc < 35.2 ? "떨림을 최대로 해도 잃는 열을 채우지 못합니다. 체온이 35 °C 아래로 내려가는 저체온증 위험 상태입니다."
      : cFever.checked && e > 0.4 ? "기준값이 39 °C로 올라가, 37 °C인 몸을 ‘춥다’고 판단합니다. 피부 혈관을 조이고 떨어서 체온을 올리는 중입니다. 이것이 오한입니다."
      : !cFever.checked && e < -0.4 ? "기준값이 37 °C로 돌아왔는데 몸은 아직 뜨겁습니다. 피부 혈관을 넓히고 땀을 흘려 열을 내보냅니다. 열이 내릴 때 땀이 나는 까닭입니다."
      : c.shiver > 15 ? "피부 혈관을 조여 열 손실을 줄이고, 그래도 부족한 열은 근육을 떨어서 만듭니다."
      : c.sweat > 20 ? "피부 혈관을 넓혀 열을 피부로 보내고, 땀이 증발하면서 열을 빼앗아 갑니다."
      : "피부 혈관의 굵기만 조절해도 열의 들고 남이 맞는 온도입니다.";
  }

  function tick(dtSim) { // dtSim: 초 단위 몸의 시간
    const f = flows(Tc, +sTa.value, sp());
    Tc += f.net * dtSim / 245000;
  }
  sTa.addEventListener("input", () => { oTa.textContent = sTa.value; readout(); draw(); });
  cFever.addEventListener("change", () => { readout(); draw(); });
  root.querySelectorAll("[data-clo]").forEach((b) => b.addEventListener("click", () => {
    clo = +b.dataset.clo;
    root.querySelectorAll("[data-clo]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    readout(); draw();
  }));
  root.querySelectorAll("[data-ta]").forEach((b) => b.addEventListener("click", () => { sTa.value = b.dataset.ta; oTa.textContent = sTa.value; readout(); draw(); }));
  // 처음 상태를 평형으로 맞추고, 기록을 채운다
  for (let i = 0; i < 2000; i++) tick(60);
  for (let i = 0; i < 37; i++) hist.push({ T: Tc, sp: sp() });
  oTa.textContent = sTa.value; readout();
  loop(cv, (dt) => {
    phase += dt;
    const sim = dt * 600; // 1초 = 10분
    for (let i = 0; i < 10; i++) tick(sim / 10);
    clock += sim;
    if (clock >= 600) { clock -= 600; hist.push({ T: Tc, sp: sp() }); if (hist.length > 37) hist.shift(); }
    readout(); draw();
  });
})();
