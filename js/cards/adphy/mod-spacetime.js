/* 카드: 동시에 일어난 두 사건이 다른 관찰자에게는 동시가 아닐 수 있을까? — 민코프스키 시공간 도표와 로런츠 변환 */
(() => {
  const root = document.getElementById("card-adphy-spacetime");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sB = $(".sb"), oB = $(".ob"), oG = $(".og"), nS = $(".ns"), nP = $(".np"), nI = $(".ni");
  const L = 4.6; /* 그림의 반너비 (광년) */
  let B = [3, 0]; /* [x, ct] in S */
  const beta = () => +sB.value, gam = () => 1 / Math.sqrt(1 - beta() ** 2);
  const lorentz = ([x, t], b) => { const g = 1 / Math.sqrt(1 - b * b); return [g * (x - b * t), g * (t - b * x)]; };

  const { ctx, size } = fit(cv, () => draw());
  let P1, P2;
  function txt(s, x, y, al, c, f) { ctx.fillStyle = c || C.ink3; ctx.font = f || `11px ${F.sans}`; ctx.textAlign = al || "left"; ctx.fillText(s, x, y); }

  /* 한 패널: 자기 좌표 (직교축) + 상대 관찰자의 기울어진 축. b는 상대 관찰자의 속도 */
  function panel(P, ev, b, me, other, colMe, colOther) {
    const { x0, y0, s } = P, X = (x) => x0 + s / 2 + x / L * s / 2, Y = (t) => y0 + s / 2 - t / L * s / 2;
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, s, s); ctx.clip();
    ctx.fillStyle = "#fbfbf8"; ctx.fillRect(x0, y0, s, s);
    /* 눈금 쌍곡선 */
    ctx.strokeStyle = "rgba(141,141,146,.35)"; ctx.lineWidth = 1;
    [1, 2].forEach((k) => [1, -1].forEach((sg) => {
      ctx.beginPath(); for (let i = -60; i <= 60; i++) { const u = i / 60 * 2.2, t = sg * k * Math.cosh(u), x = k * Math.sinh(u); i > -60 ? ctx.lineTo(X(x), Y(t)) : ctx.moveTo(X(x), Y(t)); } ctx.stroke();
      ctx.beginPath(); for (let i = -60; i <= 60; i++) { const u = i / 60 * 2.2, x = sg * k * Math.cosh(u), t = k * Math.sinh(u); i > -60 ? ctx.lineTo(X(x), Y(t)) : ctx.moveTo(X(x), Y(t)); } ctx.stroke();
    }));
    /* 빛 원뿔 */
    ctx.strokeStyle = C.amber; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(X(-L), Y(-L)); ctx.lineTo(X(L), Y(L)); ctx.moveTo(X(-L), Y(L)); ctx.lineTo(X(L), Y(-L)); ctx.stroke(); ctx.setLineDash([]);
    /* 자기 축 */
    ctx.strokeStyle = colMe; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(X(-L), Y(0)); ctx.lineTo(X(L), Y(0)); ctx.moveTo(X(0), Y(-L)); ctx.lineTo(X(0), Y(L)); ctx.stroke();
    ctx.fillStyle = colMe; for (let k = -4; k <= 4; k++) if (k) { ctx.fillRect(X(k) - 0.5, Y(0) - 3, 1.5, 6); ctx.fillRect(X(0) - 3, Y(k) - 0.5, 6, 1.5); }
    txt(`x${me}`, X(L) - 4, Y(0) - 6, "right", colMe, `bold 11px ${F.mono}`); txt(`ct${me}`, X(0) + 5, y0 + 12, "left", colMe, `bold 11px ${F.mono}`);
    /* 상대 관찰자의 축: 시간축 x = b·ct, 공간축 ct = b·x, 눈금은 (γb, γ)k */
    const g = 1 / Math.sqrt(1 - b * b);
    ctx.strokeStyle = colOther; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(X(-b * L * 2), Y(-L * 2)); ctx.lineTo(X(b * L * 2), Y(L * 2)); ctx.moveTo(X(-L * 2), Y(-b * L * 2)); ctx.lineTo(X(L * 2), Y(b * L * 2)); ctx.stroke();
    ctx.fillStyle = colOther;
    for (let k = -4; k <= 4; k++) if (k) { [[g * b * k, g * k], [g * k, g * b * k]].forEach(([x, t]) => { if (Math.abs(x) < L && Math.abs(t) < L) { ctx.beginPath(); ctx.arc(X(x), Y(t), 2.6, 0, 7); ctx.fill(); } }); }
    const tl = Math.min(L * 0.92 / Math.max(Math.abs(b), 1e-3), L * 0.92);
    txt(`ct${other}`, X(b * tl) + 6, Y(tl) + 12, "left", colOther, `bold 11px ${F.mono}`);
    txt(`x${other}`, X(tl) - 2, Y(b * tl) + (b >= 0 ? -6 : 14), "right", colOther, `bold 11px ${F.mono}`);
    /* 사건 B를 지나는 상대 관찰자의 '같은 시각' 선 (공간축에 나란) */
    const [bx, bt] = ev;
    ctx.strokeStyle = colOther; ctx.globalAlpha = 0.6; ctx.setLineDash([2, 3]); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(X(bx - 2 * L), Y(bt - b * 2 * L)); ctx.lineTo(X(bx + 2 * L), Y(bt + b * 2 * L)); ctx.stroke();
    ctx.strokeStyle = colMe; ctx.beginPath(); ctx.moveTo(X(-L), Y(bt)); ctx.lineTo(X(L), Y(bt)); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    /* 사건 */
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(0), Y(0), 4, 0, 7); ctx.fill(); txt("O", X(0) - 6, Y(0) + 14, "right", C.ink, `bold 11px ${F.mono}`);
    ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(X(bx), Y(bt), 6, 0, 7); ctx.fill(); txt("B", X(bx) + 8, Y(bt) - 6, "left", C.apple, `bold 12px ${F.mono}`);
    ctx.restore();
    ctx.strokeStyle = C.rule; ctx.strokeRect(x0 + 0.5, y0 + 0.5, s - 1, s - 1);
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = Math.min((w - 18) / 2, h - 26);
    P1 = { x0: 4, y0: 4, s }; P2 = { x0: w - s - 4, y0: 4, s };
    const b = beta(), Bp = lorentz(B, b);
    panel(P1, B, b, "", "′", C.ink, "#3f6fa3");
    panel(P2, Bp, -b, "′", "", "#3f6fa3", C.ink);
    txt("S가 그린 도표", P1.x0 + s / 2, P1.y0 + s + 16, "center", C.ink);
    txt("S′가 그린 도표", P2.x0 + s / 2, P2.y0 + s + 16, "center", "#3f6fa3");
    const f = (v) => (Math.abs(v) < 0.005 ? "0.00" : v.toFixed(2));
    nS.textContent = `(${f(B[0])}, ${f(B[1])})`; nP.textContent = `(${f(Bp[0])}, ${f(Bp[1])})`;
    const I = B[1] ** 2 - B[0] ** 2;
    nI.textContent = `${f(I)} · ${Math.abs(I) < 0.05 ? "빛꼴" : I > 0 ? "시간꼴" : "공간꼴"}`;
    oB.textContent = b.toFixed(2); oG.textContent = gam().toFixed(3);
  }
  /* 끌기 */
  let drag = false;
  const pick = (e) => {
    const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (!P1 || px > P1.x0 + P1.s) return null;
    return [clamp((px - P1.x0 - P1.s / 2) / (P1.s / 2) * L, -L * 0.95, L * 0.95), clamp(-(py - P1.y0 - P1.s / 2) / (P1.s / 2) * L, -L * 0.95, L * 0.95)];
  };
  cv.addEventListener("pointerdown", (e) => { const p = pick(e); if (!p) return; drag = true; cv.setPointerCapture(e.pointerId); B = p; clearChips(); draw(); });
  cv.addEventListener("pointermove", (e) => { if (!drag) return; const p = pick(e); if (p) { B = p; draw(); } });
  cv.addEventListener("pointerup", () => { drag = false; });
  const clearChips = () => root.querySelectorAll("[data-p]").forEach((c) => c.setAttribute("aria-pressed", "false"));
  const PRE = { sim: () => [3, 0], clock: () => [2 * gam() * beta(), 2 * gam()], cause: () => [1, 3], light: () => [3, 3] };
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => {
    B = PRE[b.dataset.p](); clearChips(); b.setAttribute("aria-pressed", "true"); draw();
  }));
  sB.addEventListener("input", () => {
    const on = root.querySelector('[data-p="clock"][aria-pressed="true"]');
    if (on) B = PRE.clock();
    draw();
  });
  root.querySelector('[data-p="sim"]').setAttribute("aria-pressed", "true");
  draw();
})();
