/* 카드: 탄산음료 뚜껑을 열면 왜 거품이 날까? — CO₂(g) ⇌ CO₂(aq), 헨리 법칙과 평형 이동 */
(() => {
  const root = document.getElementById("card-chem-soda");
  if (!root) return;
  const { C, F, clamp, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sT = $(".temp"), oT = $(".temp-out"), lid = $(".lid"), fresh = $(".fresh");
  const dP = $(".p"), dC = $(".c"), dS = $(".s"), msg = $(".msg");

  // 헨리 상수 kH(25 °C) = 0.034 mol/(L·atm), 온도 의존 상수 2400 K (Sander 2015)
  const kH = (T) => 0.034 * Math.exp(2400 * (1 / (T + 273.15) - 1 / 298.15));
  const R = 0.08206, VL = 0.475, VH = 0.025, PAIR = 4.2e-4, M = 44.01;
  let C0, ng, open, t, hist, bubbles, marks;
  // 새 병: 5 °C에서 CO₂ 총 0.0756 mol을 넣고 밀봉한 뒤 평형
  function seal(ntot) {
    const T = +sT.value, P = ntot / (kH(T) * VL + VH / (R * (T + 273.15)));
    C0 = kH(T) * P; ng = P * VH / (R * (T + 273.15));
  }
  function reset() { open = false; t = 0; hist = []; bubbles = []; marks = []; seal(0.0756); lid.textContent = "뚜껑 열기"; push(); }
  const P = () => open ? PAIR : ng * R * (+sT.value + 273.15) / VH;
  function push() { hist.push({ t, c: C0 * M, s: kH(+sT.value) * P() * M }); if (hist.length > 1200) hist.shift(); }

  function step(dt) {
    const T = +sT.value, Seq = kH(T) * P();
    const k = open ? 0.06 : 0.5;      // 모식: 실제로는 몇 분–몇 시간 걸린다
    const dC = (Seq - C0) * (1 - Math.exp(-k * dt));
    C0 += dC;
    if (!open) ng -= dC * VL;
    // 거품: 과포화 정도에 비례 (모식)
    const over = Math.max(0, C0 - Seq) / Seq;
    const rate = open ? Math.min(60, 8 * Math.max(0, C0 - Seq) / 0.01) : 0;
    let n = rate * dt; while (n > 0) { if (Math.random() < n) bubbles.push({ x: Math.random(), y: 1, r: 1.5 + Math.random() * 2.5, v: 0.25 + Math.random() * 0.35 }); n -= 1; }
    for (const b of bubbles) { b.y -= b.v * dt; b.x += (Math.random() - .5) * 0.02; }
    bubbles = bubbles.filter((b) => b.y > 0);
    t += dt;
    return over;
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const split = Math.round(w * 0.36);
    // ── 병
    const bw = Math.min(split - 40, 110), bx = (split - bw) / 2, by = 62, bh = h - 84;
    const neck = bw * 0.36, nx = bx + (bw - neck) / 2, liq = by + bh * 0.1;
    ctx.fillStyle = "rgba(160,110,60,.28)"; ctx.fillRect(bx, liq, bw, by + bh - liq);
    ctx.save(); ctx.beginPath(); ctx.rect(bx, liq, bw, by + bh - liq); ctx.clip();
    ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 1;
    for (const b of bubbles) { ctx.beginPath(); ctx.arc(bx + b.x * bw, liq + b.y * (by + bh - liq), b.r, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(nx, by - 24); ctx.lineTo(nx, by - 6); ctx.lineTo(bx, by + 10); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + 10); ctx.lineTo(nx + neck, by - 6); ctx.lineTo(nx + neck, by - 24); ctx.stroke();
    if (!open) { ctx.fillStyle = C.apple; ctx.fillRect(nx - 3, by - 34, neck + 6, 10); }
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText(`${P().toFixed(open ? 4 : 2)} atm`, split / 2, by - 40);
    ctx.fillStyle = C.ink3; ctx.fillText(open ? "뚜껑 열림" : "밀봉", split / 2, h - 6);

    // ── 그래프: 녹아 있는 CO₂
    const x0 = split + 36, y0 = 22, pw = w - x0 - 10, ph = h - y0 - 34;
    const tNow = Math.max(t, 60), tMin = tNow - 60, yMax = 16;
    const X = (v) => x0 + (v - tMin) / 60 * pw, Y = (c) => y0 + (1 - c / yMax) * ph;
    const xt = []; for (let s = Math.ceil(tMin / 15) * 15; s <= tNow; s += 15) xt.push([s, `${s}`]);
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt, yt: [0, 4, 8, 12, 16].map((v) => [v, `${v}`]), ylabel: "녹아 있는 CO₂ (g/L)", xlabel: "시간 (모식)" });
    for (const mk of marks) if (mk.t >= tMin) { ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText(mk.label, X(mk.t) + 3, y0 + 11); ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(X(mk.t) + .5, y0); ctx.lineTo(X(mk.t) + .5, y0 + ph); ctx.stroke(); }
    const line = (k, col, dash) => { ctx.setLineDash(dash); ctx.beginPath(); let s0 = false; for (const s of hist) { if (s.t < tMin) continue; const y = Y(Math.min(s[k], yMax)); s0 ? ctx.lineTo(X(s.t), y) : ctx.moveTo(X(s.t), y); s0 = true; } ctx.strokeStyle = col; ctx.lineWidth = dash.length ? 1.4 : 2.2; ctx.stroke(); ctx.setLineDash([]); };
    line("s", C.ink3, [4, 4]); line("c", "#8a5a2b", []);
    ctx.textAlign = "right"; ctx.fillStyle = "#8a5a2b"; ctx.fillText("녹아 있는 양", x0 + pw, y0 + ph - 20);
    ctx.fillStyle = C.ink3; ctx.fillText("점선: 지금 압력의 평형 용해량", x0 + pw, y0 + ph - 6);
    ctx.textAlign = "left";
  }

  function readout() {
    const T = +sT.value, p = P(), s = kH(T) * p * M;
    dP.textContent = `${p.toFixed(open ? 4 : 2)} atm`;
    dC.textContent = `${(C0 * M).toFixed(2)} g/L`;
    dS.textContent = `${s.toFixed(s < 0.1 ? 3 : 2)} g/L`;
    msg.textContent = open ? (C0 * M > s * 1.5 ? "병 속 압력이 공기 중 CO₂ 분압(약 0.0004 atm)으로 떨어졌습니다. 녹아 있는 양이 평형보다 훨씬 많으니 CO₂(aq) → CO₂(g) 쪽으로 이동하며 거품이 납니다." : "거의 평형입니다. 김이 다 빠진 상태입니다.")
      : "밀봉한 병: 윗공간의 CO₂와 녹아 있는 CO₂가 평형을 이룹니다. 온도를 바꾸면 압력과 녹는 양이 함께 달라집니다.";
  }

  sT.addEventListener("input", () => { oT.textContent = sT.value; readout(); draw(); });
  lid.addEventListener("click", () => {
    if (open) { seal(C0 * VL); open = false; marks.push({ t, label: "닫음" }); lid.textContent = "뚜껑 열기"; }
    else { open = true; ng = 0; marks.push({ t, label: "엶" }); lid.textContent = "다시 닫기"; }
    readout();
  });
  fresh.addEventListener("click", () => { reset(); readout(); draw(); });
  oT.textContent = sT.value;
  reset();
  let acc = 0;
  loop(cv, (dt) => { step(dt); acc += dt; if (acc > 0.1) { acc = 0; push(); readout(); } draw(); });
  readout();
})();
