/* 카드: (a + b + c)²의 아홉 조각은 어떻게 모일까? — 가르는 선을 끌어 바꾸는 넓이 모형 */
(() => {
  const root = document.getElementById("card-cm1-sq3");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const sl = [$(".a"), $(".b"), $(".c")], cv = $("canvas");
  const NAME = ["a", "b", "c"], DIAG = [C.leaf, C.amber, C.apple], PAIR = { "01": C.forest, "12": C.warn, "02": C.ink3 };
  const fmt = (v) => String(Math.round(v * 100) / 100);
  const { ctx, size } = fit(cv, () => draw());
  let geo = null, drag = -1;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const L = sl.map((s) => +s.value), T = L[0] + L[1] + L[2], pad = 26, S = Math.min(w, h) - pad - 8, k = S / T;
    const x0 = (w - S + pad) / 2, y0 = pad, cut = [0, L[0], L[0] + L[1], T].map((v) => v * k);
    geo = { x0, y0, S, k, cut };
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const x = x0 + cut[j], y = y0 + cut[i], cw = L[j] * k, ch = L[i] * k;
      const col = i === j ? DIAG[i] : PAIR[[i, j].sort().join("")];
      ctx.globalAlpha = i === j ? 0.45 : 0.2; ctx.fillStyle = col; ctx.fillRect(x, y, cw, ch); ctx.globalAlpha = 1;
      ctx.strokeStyle = C.card; ctx.lineWidth = 2; ctx.strokeRect(x, y, cw, ch);
      const name = i === j ? `${NAME[i]}²` : { "01": "ab", "12": "bc", "02": "ca" }[[i, j].sort().join("")];
      if (cw > 22 && ch > 16) {
        ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = `600 ${cw > 50 && ch > 34 ? 14 : 11}px ${F.mono}`; ctx.fillText(name, x + cw / 2, y + ch / 2 - (ch > 40 ? 8 : 0));
        if (ch > 40 && cw > 40) { ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.fillText(fmt(L[i] * L[j]), x + cw / 2, y + ch / 2 + 10); }
      }
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(x0, y0, S, S);
    ctx.font = `600 12px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let j = 0; j < 3; j++) {
      ctx.fillStyle = DIAG[j]; const mx = x0 + (cut[j] + cut[j + 1]) / 2;
      ctx.fillText(`${NAME[j]}=${fmt(L[j])}`, mx, y0 - 12);
      ctx.save(); ctx.translate(x0 - 12, y0 + (cut[j] + cut[j + 1]) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(`${NAME[j]}=${fmt(L[j])}`, 0, 0); ctx.restore();
    }
    [1, 2].forEach((m) => {
      const x = x0 + cut[m];
      ctx.strokeStyle = drag === m ? C.warn : C.ink; ctx.lineWidth = drag === m ? 3 : 2;
      ctx.beginPath(); ctx.moveTo(x, y0 - 2); ctx.lineTo(x, y0 + S + 2); ctx.stroke();
      ctx.fillStyle = drag === m ? C.warn : C.ink; ctx.beginPath(); ctx.arc(x, y0 + S, 5, 0, 7); ctx.fill();
    });
  }

  function update() {
    const [a, b, c] = sl.map((s) => +s.value);
    ["a", "b", "c"].forEach((n, i) => { $(`.${n}-out`).textContent = fmt(+sl[i].value); });
    const t = (a + b + c) ** 2, s = a * a + b * b + c * c, p = 2 * (a * b + b * c + c * a);
    $(".n-t").textContent = fmt(t); $(".n-s").textContent = fmt(s); $(".n-p").textContent = fmt(p);
    $(".sum").textContent = `${fmt(s)} + ${fmt(p)} = ${fmt(s + p)}  ${Math.abs(s + p - t) < 1e-9 ? "= (a+b+c)²" : ""}`;
    draw();
  }
  const local = (e) => { const r = cv.getBoundingClientRect(); return e.clientX - r.left; };
  cv.addEventListener("pointerdown", (e) => {
    if (!geo) return; const x = local(e);
    const d = [1, 2].map((m) => Math.abs(x - (geo.x0 + geo.cut[m])));
    drag = d[0] <= d[1] ? 1 : 2; if (Math.min(...d) > 30) { drag = -1; return; }
    cv.setPointerCapture(e.pointerId); draw();
  });
  cv.addEventListener("pointermove", (e) => {
    if (drag < 0) return;
    const i = drag - 1, L = sl.map((s) => +s.value), pairSum = L[i] + L[i + 1], left = i === 0 ? 0 : L[0];
    const v = clamp(Math.round(((local(e) - geo.x0) / geo.k - left) * 2) / 2, Math.max(0.5, pairSum - 6), Math.min(6, pairSum - 0.5));
    if (v === L[i]) return;
    sl[i].value = v; sl[i + 1].value = pairSum - v; update();
  });
  const end = () => { if (drag >= 0) { drag = -1; draw(); } };
  cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
  sl.forEach((s) => s.addEventListener("input", update));
  update();
})();
