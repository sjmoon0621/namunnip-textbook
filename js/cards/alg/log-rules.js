/* 카드: 로그를 쓰면 왜 곱셈이 덧셈이 될까? — 로그 눈금자 위에 log M, log N 길이를 이어 붙이기 */
(() => {
  const root = document.getElementById("card-alg-log-rules");
  if (!root) return;
  const { C, F, fit } = NM, E = NMExp;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".presets .chip")];
  const sm = $(".m"), sn = $(".n"), sk = $(".k");
  let r = 0;
  const LO = -1, HI = 2;
  const { ctx, size } = fit($("canvas"), () => draw());

  function legs() {
    const M = +sm.value, N = +sn.value, k = +sk.value, lm = Math.log10(M), ln = Math.log10(N);
    if (r === 0) return { segs: [[lm, C.forest, "log M"], [ln, E.BLUE, "log N"]], end: lm + ln, val: M * N };
    if (r === 1) return { segs: [[lm, C.forest, "log M"], [-ln, E.BLUE, "−log N"]], end: lm - ln, val: M / N };
    const segs = [];
    if (k === 0) return { segs, end: 0, val: 1 };
    const whole = Math.floor(Math.abs(k)), part = Math.abs(k) - whole, s = Math.sign(k);
    for (let i = 0; i < whole; i++) segs.push([s * lm, i % 2 ? C.leaf : C.forest, s > 0 ? "log M" : "−log M"]);
    if (part) segs.push([s * part * lm, C.leaf, `${s > 0 ? "" : "−"}½ log M`]);
    return { segs, end: k * lm, val: M ** k };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const L = 18, R = w - 18, X = (v) => L + (v - LO) / (HI - LO) * (R - L), yTop = h * 0.2, yBot = h * 0.78;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
    [yTop, yBot].forEach((y) => { ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke(); });
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center"; ctx.fillStyle = C.ink3;
    for (let v = LO; v <= HI + 1e-9; v += 0.5) { ctx.fillRect(X(v) - 0.5, yTop - 5, 1, 10); ctx.textBaseline = "bottom"; ctx.fillText(E.n(v), X(v), yTop - 7); }
    ctx.textAlign = "left"; ctx.fillText("로그 값 (고른 눈금)", L, yTop + 16);
    ctx.textAlign = "center";
    for (let d = LO; d < HI; d++) for (let m = 1; m <= 9; m++) {
      const v = m * 10 ** d, x = X(Math.log10(v)), major = m === 1 || m === 2 || m === 5;
      ctx.fillStyle = major ? C.ink : C.ink3; ctx.fillRect(x - 0.5, yBot, 1, major ? 10 : 5);
      if (major && (w > 380 || m !== 2)) { ctx.textBaseline = "top"; ctx.fillText(E.n(v), x, yBot + 12); }
    }
    ctx.fillStyle = C.ink; ctx.fillRect(X(HI) - 0.5, yBot, 1, 10); ctx.textBaseline = "top"; ctx.fillText("100", X(HI) - 8, yBot + 12);
    ctx.textAlign = "left"; ctx.textBaseline = "bottom"; ctx.fillStyle = C.ink3; ctx.fillText("수 (로그 눈금)", L, yBot - 4);
    const { segs, end, val } = legs();
    let pos = 0;
    const span = yBot - yTop - 40;
    segs.forEach(([d, col, lab], i) => {
      const y = yTop + 26 + (segs.length > 1 ? i * span / (segs.length - 1) * 0.55 : 0), x1 = X(pos), x2 = X(pos + d);
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
      const dir = Math.sign(d) || 1; ctx.beginPath(); ctx.moveTo(x2, y); ctx.lineTo(x2 - dir * 8, y - 5); ctx.lineTo(x2 - dir * 8, y + 5); ctx.fill();
      ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillText(lab, (x1 + x2) / 2, y - 4);
      pos += d;
    });
    ctx.setLineDash([4, 4]); ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(X(0), yTop); ctx.lineTo(X(0), yBot); ctx.stroke();
    const inR = end >= LO - 1e-9 && end <= HI + 1e-9;
    if (inR) { ctx.beginPath(); ctx.moveTo(X(end), yTop); ctx.lineTo(X(end), yBot); ctx.stroke(); }
    ctx.setLineDash([]);
    if (inR) { ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(end), yBot, 6, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(X(end), yTop, 4.5, 0, 7); ctx.fill(); }
    ctx.fillStyle = C.warn; ctx.font = `600 12px ${F.sans}`; ctx.textBaseline = "bottom";
    const t = inR ? `도착: ${E.n(val, 3)}` : "도착점이 눈금 밖";
    const tx = inR ? Math.min(R - ctx.measureText(t).width / 2, Math.max(L + ctx.measureText(t).width / 2, X(end))) : (L + R) / 2;
    ctx.textAlign = "center"; ctx.fillText(t, tx, h - 4);
  }

  function update() {
    const M = +sm.value, N = +sn.value, k = +sk.value, { segs, val } = legs();
    $(".m-out").textContent = E.n(M); $(".n-out").textContent = E.n(N); $(".k-out").textContent = E.n(k);
    $(".n-row").hidden = r === 2; $(".k-row").hidden = r !== 2;
    const lM = Math.log10(M).toFixed(4), lN = Math.log10(N).toFixed(4);
    const eqs = [
      `log (${E.n(M)} × ${E.n(N)}) = log ${E.n(M)} + log ${E.n(N)} ≈ ${lM} + ${lN}`,
      `log (${E.n(M)} ÷ ${E.n(N)}) = log ${E.n(M)} − log ${E.n(N)} ≈ ${lM} − ${lN}`,
      `log ${E.n(M)}<sup>${E.n(k)}</sup> = ${E.n(k)} × log ${E.n(M)} ≈ ${E.n(k)} × ${lM}`,
    ];
    $(".eq").innerHTML = eqs[r];
    $(".n-s").textContent = E.n(segs.reduce((s, x) => s + x[0], 0), 4);
    $(".n-l").textContent = E.n(Math.log10(val), 4);
    $(".n-v").textContent = E.n(val, 4);
    draw();
  }
  chips.forEach((c) => c.addEventListener("click", () => { r = +c.dataset.r; chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c))); update(); }));
  [sm, sn, sk].forEach((s) => s.addEventListener("input", update));
  update();
})();
