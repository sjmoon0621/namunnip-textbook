/* 카드: 버스로 오는 학생만 보면 지각할 확률이 달라질까? — 200명 띠그림(A: 버스 통학, B: 지각), 경계를 끌어 인원 조절, 조건을 고르면 표본공간이 줄어듦 */
(() => {
  const root = document.getElementById("card-stat-cond-table");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s), cv = $("canvas"), chips = [...root.querySelectorAll(".presets .chip")];
  const N = 200;
  let nA = 80, nAB = 24, nCB = 12, cond = 0, drag = null, G = null;
  const { ctx, size } = fit(cv, () => draw());

  function geo() {
    const { w, h } = size, x0 = 12, y0 = 30, W = w - 24, H = h - y0 - 30, xd = x0 + W * nA / N;
    return { x0, y0, W, H, xd, yA: y0 + H * (1 - nAB / nA), yC: y0 + H * (1 - nCB / (N - nA)) };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    G = geo();
    const { x0, y0, W, H, xd, yA, yC } = G, xe = x0 + W, yb = y0 + H;
    const lit = (col, isB) => cond === 0 || (cond === 1 ? col === 0 : isB);
    const piece = (x, y, pw, ph, isB, col, n, name) => {
      ctx.globalAlpha = lit(col, isB) ? 1 : 0.18;
      ctx.fillStyle = isB ? C.sprout : C.card; ctx.fillRect(x, y, pw, ph);
      ctx.strokeStyle = isB ? C.forest : C.ink3; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, pw - 1, ph - 1);
      ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      if (pw > 52 && ph > 36) {
        ctx.font = `600 11.5px ${F.sans}`; ctx.fillText(name, x + pw / 2, y + ph / 2 - 8);
        ctx.font = `600 13px ${F.mono}`; ctx.fillText(`${n}명`, x + pw / 2, y + ph / 2 + 9);
      } else if (pw > 26 && ph > 14) { ctx.font = `600 11px ${F.mono}`; ctx.fillText(n, x + pw / 2, y + ph / 2); }
      ctx.globalAlpha = 1;
    };
    piece(x0, y0, xd - x0, yA - y0, false, 0, nA - nAB, "A∩Bᶜ");
    piece(x0, yA, xd - x0, yb - yA, true, 0, nAB, "A∩B");
    piece(xd, y0, xe - xd, yC - y0, false, 1, N - nA - nCB, "Aᶜ∩Bᶜ");
    piece(xd, yC, xe - xd, yb - yC, true, 1, nCB, "Aᶜ∩B");
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    if (cond === 1) ctx.strokeRect(x0 + 1.5, y0 + 1.5, xd - x0 - 3, H - 3);
    if (cond === 2) { ctx.strokeRect(x0 + 1.5, yA + 1.5, xd - x0 - 3, yb - yA - 3); ctx.strokeRect(xd + 1.5, yC + 1.5, xe - xd - 3, yb - yC - 3); }
    ctx.font = `600 11.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillText(`A ${nA}명`, (x0 + xd) / 2, y0 - 10);
    ctx.fillText(`Aᶜ ${N - nA}명`, (xd + xe) / 2, y0 - 10);
    const knob = (x, y) => { ctx.fillStyle = C.card; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.stroke(); };
    knob(xd, yb + 8); knob((x0 + xd) / 2, yA); knob((xd + xe) / 2, yC);
  }

  function update() {
    const nB = nAB + nCB, f3 = (x) => x.toFixed(3);
    $(".tb2 tbody").innerHTML =
      `<tr><th></th><th>B 지각</th><th>Bᶜ</th><th>합계</th></tr>` +
      `<tr><th>A 버스</th><td>${nAB}</td><td>${nA - nAB}</td><td>${nA}</td></tr>` +
      `<tr><th>Aᶜ 그 외</th><td>${nCB}</td><td>${N - nA - nCB}</td><td>${N - nA}</td></tr>` +
      `<tr><th>합계</th><td>${nB}</td><td>${N - nB}</td><td>${N}</td></tr>`;
    const eq = [
      `P(B) = n(B)/n(S) = ${nB}/${N} = ${f3(nB / N)}`,
      `P(B|A) = P(A∩B)/P(A) = (${nAB}/${N}) ÷ (${nA}/${N}) = ${nAB}/${nA} = ${f3(nAB / nA)}`,
      nB ? `P(A|B) = P(A∩B)/P(B) = (${nAB}/${N}) ÷ (${nB}/${N}) = ${nAB}/${nB} = ${f3(nAB / nB)}` : "B인 학생이 없어 P(B) = 0이므로 P(A|B)를 정의할 수 없습니다.",
    ];
    $(".eq").textContent = eq[cond];
    $(".n-b").textContent = f3(nB / N);
    $(".n-ba").textContent = f3(nAB / nA);
    $(".n-bc").textContent = f3(nCB / (N - nA));
    $(".n-ab").textContent = nB ? f3(nAB / nB) : "—";
    draw();
  }

  const pos = (e) => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  cv.addEventListener("pointerdown", (e) => {
    if (!G) return;
    const [x, y] = pos(e), xe = G.x0 + G.W;
    const hs = [["v", G.xd, G.y0 + G.H + 8], ["a", (G.x0 + G.xd) / 2, G.yA], ["c", (G.xd + xe) / 2, G.yC]];
    let best = null, bd = 24;
    hs.forEach(([k, hx, hy]) => { const d = Math.hypot(x - hx, y - hy); if (d < bd) { bd = d; best = k; } });
    if (!best) return;
    drag = best; cv.setPointerCapture(e.pointerId); e.preventDefault();
  });
  cv.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const [x, y] = pos(e), up = (G.y0 + G.H - y) / G.H;
    if (drag === "v") {
      const qa = nAB / nA, qc = nCB / (N - nA);
      nA = clamp(Math.round((x - G.x0) / G.W * N / 10) * 10, 40, 160);
      nAB = Math.round(qa * nA); nCB = Math.round(qc * (N - nA));
    }
    if (drag === "a") nAB = clamp(Math.round(up * nA), 0, nA);
    if (drag === "c") nCB = clamp(Math.round(up * (N - nA)), 0, N - nA);
    update();
  });
  ["pointerup", "pointercancel"].forEach((t) => cv.addEventListener(t, () => { drag = null; }));
  chips.forEach((b) => b.addEventListener("click", () => {
    cond = +b.dataset.c; chips.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update();
  }));
  update();
})();
