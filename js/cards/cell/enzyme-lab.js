/* 카드: 효소가 가장 잘 일하는 조건은 어떻게 찾을까? — 가상 실험. 속도 = E·S/(Km+S)·f(T)·f(pH), f(T) = Q10 증가 × 변성 시그모이드 (모식). 통제 변인이 바뀌면 경고 */
(() => {
  const root = document.getElementById("card-cell-enzyme-lab");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sel = $(".indep"), note = $(".note");
  const V = { T: $(".v-T"), pH: $(".v-pH"), S: $(".v-S"), E: $(".v-E") };
  const O = { T: $(".o-T"), pH: $(".o-pH"), S: $(".o-S"), E: $(".o-E") };
  const ENZ = {
    amy: { name: "침 아밀레이스", pH: 6.8, Tm: 46, T0: 37 },
    pep: { name: "펩신", pH: 2.0, Tm: 47, T0: 37 },
    try: { name: "트립신", pH: 8.0, Tm: 47, T0: 37 },
    taq: { name: "Taq DNA 중합 효소", pH: 8.3, Tm: 84, T0: 72 },
  };
  const AX = { T: { lab: "온도 (°C)", min: 0, max: 100, ticks: [0, 20, 40, 60, 80, 100] }, pH: { lab: "pH", min: 1, max: 12, ticks: [2, 4, 6, 8, 10, 12] }, S: { lab: "기질 농도 (상대)", min: 0, max: 10, ticks: [0, 2, 4, 6, 8, 10] }, E: { lab: "효소 양 (상대)", min: 0, max: 3, ticks: [0, 1, 2, 3] } };
  const KM = 1.5;
  let enz = "amy", recs = [];
  const cond = () => ({ T: +V.T.value, pH: +V.pH.value, S: +V.S.value, E: +V.E.value });
  function rate(e, c) {
    const z = ENZ[e];
    const fT = Math.pow(2, (c.T - z.T0) / 10) / (1 + Math.exp((c.T - z.Tm) / 3.5));
    const fpH = Math.exp(-Math.pow((c.pH - z.pH) / 1.4, 2));
    return 100 * c.E * c.S / (KM + c.S) * fT * fpH / (2 / (2 + KM) * 1.8);   // 상대값
  }
  let seed = 1; const noise = () => { const x = Math.sin(seed++ * 45.1) * 43758.5; return (x - Math.floor(x) - 0.5) * 0.08; };
  function measure() {
    const c = cond(), iv = sel.value;
    const base = recs.find((r) => r.iv === iv && r.enz === enz);
    let bad = false;
    if (base) bad = ["T", "pH", "S", "E"].some((k) => k !== iv && base.c[k] !== c[k]);
    recs.push({ enz, iv, c, x: c[iv], y: Math.max(0, rate(enz, c) * (1 + noise())), bad });
    note.textContent = bad ? "통제 변인이 첫 측정과 다릅니다. 이 점(빨강)은 독립 변인만의 효과로 볼 수 없습니다." : `${ENZ[enz].name}, ${AX[iv].lab} = ${c[iv]}에서 측정했습니다.`;
    note.classList.toggle("bad", bad);
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const c = cond(), r = rate(enz, c), iv = sel.value, ax = AX[iv];
    // 시험관 (반응 5분 뒤 생성물의 양을 색으로)
    const tx = 20, ty = 16, tw = 34, th = 88;
    const p = Math.min(1, r / 120);
    ctx.fillStyle = `rgb(${Math.round(70 + 170 * p)},${Math.round(90 + 110 * p)},${Math.round(160 - 60 * p)})`;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(tx, ty + 20); ctx.lineTo(tx, ty + th - tw / 2); ctx.arc(tx + tw / 2, ty + th - tw / 2, tw / 2, Math.PI, 0, true); ctx.lineTo(tx + tw, ty + 20); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx, ty + th - tw / 2); ctx.arc(tx + tw / 2, ty + th - tw / 2, tw / 2, Math.PI, 0, true); ctx.lineTo(tx + tw, ty); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(`${ENZ[enz].name} · 지금 조건의 반응 속도 ${r.toFixed(0)}`, tx + tw + 16, ty + 16);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2;
    ctx.fillText(`온도 ${c.T} °C · pH ${c.pH} · 기질 ${c.S} · 효소 ${c.E}`, tx + tw + 16, ty + 36);
    ctx.fillText("시험관 색: 5분 동안 생긴 생성물 (푸른색 → 노란색)", tx + tw + 16, ty + 56);
    // 속도 막대
    const bx = tx + tw + 16, bw = w - bx - 20;
    ctx.fillStyle = "#e7e8e1"; ctx.fillRect(bx, ty + 68, bw, 10);
    ctx.fillStyle = C.forest; ctx.fillRect(bx, ty + 68, Math.min(1, r / 200) * bw, 10);
    // 그래프
    const gx = 46, gy = ty + th + 34, gw = w - gx - 14, gh = h - gy - 36;
    const pts = recs.filter((q) => q.iv === iv && q.enz === enz);
    const ymax = Math.max(120, ...pts.map((q) => q.y * 1.1));
    const X = (v) => gx + (v - ax.min) / (ax.max - ax.min) * gw, Y = (v) => gy + gh - v / ymax * gh;
    NM.axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: ax.ticks.map((v) => [v, v]), yt: [0, 50, 100, 150, 200, 250].filter((v) => v <= ymax).map((v) => [v, v]), xlabel: ax.lab, ylabel: `반응 속도 (상대) — ${ENZ[enz].name}` });
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(c[iv]), gy); ctx.lineTo(X(c[iv]), gy + gh); ctx.stroke(); ctx.setLineDash([]);
    pts.forEach((q) => { ctx.fillStyle = q.bad ? C.warn : C.ink; ctx.beginPath(); ctx.arc(X(q.x), Y(q.y), q.bad ? 5 : 4.5, 0, 6.29); ctx.fill(); });
    if (!pts.length) { ctx.fillStyle = C.ink3; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("‘측정해 기록’을 눌러 점을 찍어 보세요", gx + gw / 2, gy + gh / 2); }
  }
  function update() {
    Object.keys(V).forEach((k) => (O[k].textContent = V[k].value));
    root.querySelectorAll("[data-e]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.e === enz ? "true" : "false"));
    draw();
  }
  root.querySelectorAll("[data-e]").forEach((b) => b.addEventListener("click", () => { enz = b.dataset.e; note.textContent = ""; update(); }));
  Object.values(V).forEach((el) => el.addEventListener("input", update));
  sel.addEventListener("change", () => { note.textContent = ""; update(); });
  $(".measure").addEventListener("click", () => { measure(); update(); });
  $(".clear").addEventListener("click", () => { recs = recs.filter((q) => !(q.iv === sel.value && q.enz === enz)); note.textContent = ""; update(); });
  // 예시 측정: 침 아밀레이스, pH 7, 기질 2, 효소 1에서 온도만 바꿈
  [10, 20, 30, 40, 50, 60].forEach((T) => { const c = { T, pH: 7, S: 2, E: 1 }; recs.push({ enz: "amy", iv: "T", c, x: T, y: rate("amy", c) * (1 + noise()), bad: false }); });
  update();
})();
