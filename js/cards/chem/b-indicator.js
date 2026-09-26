/* 카드: 지시약은 왜 딱 그 순간에 색이 바뀔까? — 적정 곡선과 지시약의 변색 범위 */
(() => {
  const root = document.getElementById("card-chem-indicator");
  if (!root) return;
  const { C, F, clamp, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sV = $(".vb"), oV = $(".vb-out");
  const dP = $(".ph"), dR = $(".range"), dE = $(".eqph"), msg = $(".msg"), sw = $(".swatch"), swl = $(".sw-label");
  const KW = 1.0e-14, VA = 20;
  // 변색 범위와 색 (산성 색 → 염기성 색)
  const IND = {
    mo: { name: "메틸 오렌지", lo: 3.1, hi: 4.4, a: [214, 60, 50], b: [240, 200, 60], an: "붉은색", bn: "노란색" },
    mr: { name: "메틸 레드", lo: 4.4, hi: 6.2, a: [214, 50, 60], b: [240, 200, 60], an: "붉은색", bn: "노란색" },
    btb: { name: "BTB", lo: 6.0, hi: 7.6, a: [226, 196, 52], b: [40, 80, 170], an: "노란색", bn: "파란색" },
    pp: { name: "페놀프탈레인", lo: 8.2, hi: 10.0, a: [250, 250, 248], b: [214, 40, 140], an: "무색", bn: "붉은색" },
  };
  let acid = "hcl", c = 0.1, ind = "pp";
  const Ka = () => acid === "hcl" ? 1e8 : 1.8e-5;
  function pH(vb) {
    const V = VA + vb, CA = c * VA / V, Na = c * vb / V, ka = Ka();
    let lo = -15, hi = 1;
    for (let i = 0; i < 90; i++) { const m = (lo + hi) / 2, h = 10 ** m; (h + Na - KW / h - CA * ka / (ka + h)) > 0 ? hi = m : lo = m; }
    return -(lo + hi) / 2;
  }
  function volAt(p) { // pH가 p가 되는 NaOH 부피 (단조 증가)
    if (pH(0) >= p) return 0; if (pH(40) <= p) return Infinity;
    let lo = 0, hi = 40; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; pH(m) < p ? lo = m : hi = m; } return (lo + hi) / 2;
  }
  const colorAt = (I, p) => { const t = clamp((p - I.lo) / (I.hi - I.lo), 0, 1); return I.a.map((x, i) => Math.round(x + (I.b[i] - x) * t)); };

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 34, y0 = 16, pw = w - x0 - 12, ph = h - y0 - 34;
    const X = (v) => x0 + v / 40 * pw, Y = (p) => y0 + (1 - p / 14) * ph;
    // 지시약 띠
    const I = IND[ind];
    const [r1, g1, b1] = colorAt(I, I.lo), [r2, g2, b2] = colorAt(I, I.hi);
    const grad = ctx.createLinearGradient(0, Y(I.lo), 0, Y(I.hi));
    grad.addColorStop(0, `rgba(${r1},${g1},${b1},.28)`); grad.addColorStop(1, `rgba(${r2},${g2},${b2},.28)`);
    ctx.fillStyle = grad; ctx.fillRect(x0, Y(I.hi), pw, Y(I.lo) - Y(I.hi));
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [0, 10, 20, 30, 40].map((v) => [v, `${v}`]), yt: [0, 2, 4, 6, 8, 10, 12, 14].map((v) => [v, `${v}`]), ylabel: "pH", xlabel: "넣은 NaOH (mL)" });
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText(`${I.name} 변색 범위 ${I.lo}–${I.hi}`, x0 + 6, Y(I.hi) - 5);
    // 곡선
    ctx.beginPath();
    for (let v = 0; v <= 40; v += 0.02) { const y = Y(pH(v)); v ? ctx.lineTo(X(v), y) : ctx.moveTo(X(v), y); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.stroke();
    // 중화점
    const pe = pH(20);
    ctx.setLineDash([3, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(20) + .5, y0); ctx.lineTo(X(20) + .5, y0 + ph); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(X(20), Y(pe), 4.5, 0, 7); ctx.fillStyle = C.card; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.fillText(`중화점 pH ${pe.toFixed(2)}`, X(20) + 8, Y(pe) + 4);
    // 현재 위치
    const V = +sV.value, p = pH(V);
    ctx.beginPath(); ctx.arc(X(V), Y(p), 5, 0, 7); ctx.fillStyle = `rgb(${colorAt(I, p).join(",")})`; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke();
  }

  function update() {
    const V = +sV.value, p = pH(V), I = IND[ind];
    oV.textContent = V.toFixed(2);
    dP.textContent = p.toFixed(2); dE.textContent = pH(20).toFixed(2);
    const v1 = volAt(I.lo), v2 = volAt(I.hi);
    const f = (v) => v === 0 ? "시작 전" : isFinite(v) ? `${v.toFixed(2)}` : "40 넘음";
    dR.textContent = `${f(v1)} – ${f(v2)} mL`;
    const col = colorAt(I, p); sw.style.background = `rgb(${col.join(",")})`;
    swl.textContent = p < I.lo ? I.an : p > I.hi ? I.bn : "변하는 중";
    const good = v1 > 19.9 && v2 < 20.1 || (v1 > 19.9 && v1 < 20.1) || (v2 > 19.9 && v2 < 20.1);
    const ok = isFinite(v2) && v1 > 19.8 && v1 < 20.2;
    msg.textContent = ok || good ? `${I.name}은 중화점(20.00 mL) 바로 곁에서 색이 바뀝니다. 곡선이 거의 수직인 구간이 변색 범위를 지나가기 때문입니다.`
      : v2 < 19.8 ? `${I.name}은 중화점보다 한참 앞(${v1.toFixed(1)} mL 부근)에서 색이 바뀌기 시작합니다. 이 적정에는 알맞지 않습니다.`
      : `${I.name}은 중화점에서 벗어난 곳에서 색이 바뀝니다. 다른 지시약과 비교해 보세요.`;
    draw();
  }
  sV.addEventListener("input", update);
  const group = (attr, fn) => root.querySelectorAll(`[${attr}]`).forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll(`[${attr}]`).forEach((x) => x.setAttribute("aria-pressed", x === b)); fn(b.getAttribute(attr)); update();
  }));
  group("data-acid", (v) => acid = v); group("data-c", (v) => c = +v); group("data-ind", (v) => ind = v);
  update();
})();
