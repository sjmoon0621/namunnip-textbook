/* 카드: 표의 칸 하나를 어떻게 정확히 가리킬까? — m × n 행렬에서 칸을 골라 행·열·성분 a_ij 확인 */
(() => {
  const root = document.getElementById("card-cm1-matrix-entry");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const X = NMMat;
  const $ = (s) => root.querySelector(s), btns = [...root.querySelectorAll(".rule .chip")];
  const sm = $(".m"), sn = $(".n"), cv = $("canvas");
  const SALE = { rows: ["매점 가", "매점 나"], cols: ["우유", "빵", "주스"], v: [[12, 8, 5], [9, 11, 7]] };
  const RULE = { sum: (i, j) => i + j, diff: (i, j) => 2 * i - j, prod: (i, j) => i * j };
  const TXT = { sum: "<i>i</i> + <i>j</i>", diff: "2<i>i</i> − <i>j</i>", prod: "<i>ij</i>" };
  const SHOW = { sum: (i, j) => `${i} + ${j}`, diff: (i, j) => `2·${i} − ${j}`, prod: (i, j) => `${i}·${j}` };
  let kind = "sale", si = 2, sj = 3, box = null;
  const { ctx, size } = fit(cv, () => draw());

  const dims = () => [+sm.value, +sn.value];
  const val = (i, j) => (kind === "sale" ? SALE.v[i - 1][j - 1] : RULE[kind](i, j));
  const sub = (i, j) => `<i>a</i><sub>${i}${j}</sub>`;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const [m, n] = dims(), sale = kind === "sale";
    const left = sale ? 66 : 40, top = sale ? 42 : 28;
    const cs = Math.min(64, (w - left - 24) / n, (h - top - 12) / m);
    const gx = left + (w - left - 12 - cs * n) / 2, gy = top + (h - top - 8 - cs * m) / 2;
    box = { gx, gy, cs, m, n };
    ctx.fillStyle = C.sprout; ctx.globalAlpha = 0.45;
    ctx.fillRect(gx, gy + (si - 1) * cs, cs * n, cs);
    ctx.fillRect(gx + (sj - 1) * cs, gy, cs, cs * m);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    for (let i = 0; i <= m; i++) { ctx.beginPath(); ctx.moveTo(gx, gy + i * cs); ctx.lineTo(gx + n * cs, gy + i * cs); ctx.stroke(); }
    for (let j = 0; j <= n; j++) { ctx.beginPath(); ctx.moveTo(gx + j * cs, gy); ctx.lineTo(gx + j * cs, gy + m * cs); ctx.stroke(); }
    X.paren(ctx, gx - 8, gy - 2, n * cs + 16, m * cs + 4, C.ink);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
      const on = i === si && j === sj;
      ctx.font = `${on ? 700 : 500} ${Math.round(Math.min(18, cs * 0.36))}px ${F.mono}`;
      ctx.fillStyle = on ? C.forest : C.ink;
      ctx.fillText(X.n(val(i, j)), gx + (j - 0.5) * cs, gy + (i - 0.5) * cs);
    }
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.5;
    ctx.strokeRect(gx + (sj - 1) * cs + 1.5, gy + (si - 1) * cs + 1.5, cs - 3, cs - 3);
    for (let i = 1; i <= m; i++) {
      ctx.fillStyle = i === si ? C.forest : C.ink3; ctx.textAlign = "right";
      ctx.font = `600 11px ${F.sans}`;
      const y = gy + (i - 0.5) * cs;
      if (sale) { ctx.fillText(`제${i}행`, gx - 14, y - 7); ctx.font = `11px ${F.sans}`; ctx.fillText(SALE.rows[i - 1], gx - 14, y + 8); }
      else ctx.fillText(`제${i}행`, gx - 14, y);
    }
    for (let j = 1; j <= n; j++) {
      ctx.fillStyle = j === sj ? C.forest : C.ink3; ctx.textAlign = "center";
      ctx.font = `600 11px ${F.sans}`;
      const x = gx + (j - 0.5) * cs;
      if (sale) { ctx.fillText(`제${j}열`, x, gy - 28); ctx.font = `11px ${F.sans}`; ctx.fillText(SALE.cols[j - 1], x, gy - 13); }
      else ctx.fillText(`제${j}열`, x, gy - 13);
    }
  }

  function update() {
    if (kind === "sale") { sm.value = 2; sn.value = 3; }
    sm.disabled = sn.disabled = kind === "sale";
    const [m, n] = dims();
    si = clamp(si, 1, m); sj = clamp(sj, 1, n);
    $(".m-out").textContent = m; $(".n-out").textContent = n;
    $(".n-size").textContent = `${m} × ${n}${m === n ? " (정사각)" : ""}`;
    $(".n-cnt").textContent = `${m * n}개`;
    $(".d-ij").innerHTML = `(${si}, ${sj}) 성분 ${sub(si, sj)}`;
    $(".n-ij").textContent = X.n(val(si, sj));
    $(".d-ji").innerHTML = `자리를 바꾼 ${sub(sj, si)}`;
    const ji = sj <= m && si <= n;
    $(".n-ji").textContent = ji ? X.n(val(sj, si)) : "없음";
    const rule = kind === "sale"
      ? `${sub(si, sj)} = ${SALE.rows[si - 1]}의 ${SALE.cols[sj - 1]} 판매량 = ${val(si, sj)}`
      : `<i>a</i><sub><i>ij</i></sub> = ${TXT[kind]} → ${sub(si, sj)} = ${SHOW[kind](si, sj).replace("-", "−")} = ${X.n(val(si, sj))}`;
    $(".eq").innerHTML = rule;
    draw();
  }

  function pick(e) {
    if (!box) return;
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const j = Math.floor((x - box.gx) / box.cs) + 1, i = Math.floor((y - box.gy) / box.cs) + 1;
    if (i < 1 || j < 1 || i > box.m || j > box.n || (i === si && j === sj)) return;
    si = i; sj = j; update();
  }
  cv.tabIndex = 0;
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); pick(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) pick(e); });
  cv.addEventListener("keydown", (e) => {
    const d = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
    if (!d) return;
    e.preventDefault(); si += d[0]; sj += d[1]; update();
  });
  btns.forEach((b) => b.addEventListener("click", () => {
    kind = b.dataset.k; btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    if (kind !== "sale") { sm.value = 3; sn.value = 3; }
    update();
  }));
  [sm, sn].forEach((s) => s.addEventListener("input", update));
  update();
})();
