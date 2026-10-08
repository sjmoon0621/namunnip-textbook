/* 카드: 조립제법은 나눗셈의 어느 부분을 줄여 쓴 걸까? — 내리기·곱하기·더하기를 한 칸씩 */
(() => {
  const root = document.getElementById("card-cm1-synthetic");
  if (!root) return;
  const { C, F, fit } = NM;
  const P = NMPoly;
  const $ = (s) => root.querySelector(s), exBtns = [...root.querySelectorAll(".ex .chip")];
  const sa = $(".a");
  let c = [1, 0, -7, 6], s = Infinity;
  const { ctx, size } = fit($("canvas"), () => draw());

  function table() {
    const a = +sa.value, n = c.length - 1, b = [c[0]], m = [null];
    for (let i = 1; i <= n; i++) { m.push(a * b[i - 1]); b.push(c[i] + m[i]); }
    return { a, n, b, m, ops: 2 * n + 1 };
  }
  const desc2asc = (d) => d.slice().reverse();

  function arrow(x1, y1, x2, y2, col) {
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const t = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 7 * Math.cos(t - 0.4), y2 - 7 * Math.sin(t - 0.4)); ctx.lineTo(x2 - 7 * Math.cos(t + 0.4), y2 - 7 * Math.sin(t + 0.4)); ctx.closePath(); ctx.fill();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const T = table(), fs = w < 380 ? 14 : 16, LW = w < 380 ? 44 : 56, colW = (w - LW - 8) / (T.n + 1);
    const cx = (i) => LW + (i + 0.5) * colW, yH = h * 0.1, y1 = h * 0.3, y2 = h * 0.5, yL = h * 0.6, y3 = h * 0.72, yB = h * 0.9;
    const cur = Math.min(s, T.ops);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`;
    for (let i = 0; i <= T.n; i++) { const k = T.n - i; ctx.fillText(k === 0 ? "상수" : k === 1 ? "x" : `x${["", "", "²", "³", "⁴"][k]}`, cx(i), yH); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(LW - 4, y1 - 18); ctx.lineTo(LW - 4, yL); ctx.lineTo(w - 6, yL); ctx.stroke();
    ctx.fillStyle = C.warn; ctx.font = `600 ${fs}px ${F.mono}`; ctx.fillText(P.n(T.a), (LW - 4) / 2, y1);
    ctx.fillStyle = C.ink; ctx.font = `${fs}px ${F.mono}`;
    c.forEach((v, i) => ctx.fillText(P.n(v), cx(i), y1));
    const hot = C.warn;
    for (let k = 1; k <= cur; k++) {
      const now = k === cur && s <= T.ops;
      if (k === 1) {
        ctx.fillStyle = now ? hot : C.forest; ctx.font = `600 ${fs}px ${F.mono}`; ctx.fillText(P.n(T.b[0]), cx(0), y3);
        if (now) arrow(cx(0), y1 + 12, cx(0), y3 - 13, hot);
      } else if (k % 2 === 0) {
        const i = k / 2;
        ctx.fillStyle = now ? hot : C.ink2; ctx.font = `${fs}px ${F.mono}`; ctx.fillText(P.n(T.m[i]), cx(i), y2);
        if (now) { arrow(cx(i - 1) + 10, y3 - 10, cx(i) - 10, y2 + 10, hot); ctx.font = `600 11px ${F.mono}`; ctx.fillText(`×${P.n(T.a)}`, (cx(i - 1) + cx(i)) / 2 + 12, (y2 + y3) / 2 + 2); }
      } else {
        const i = (k - 1) / 2;
        ctx.fillStyle = now ? hot : C.forest; ctx.font = `600 ${fs}px ${F.mono}`; ctx.fillText(P.n(T.b[i]), cx(i), y3);
        if (now) { ctx.strokeStyle = hot; ctx.lineWidth = 1.5; ctx.strokeRect(cx(i) - colW * 0.36, y1 - 14, colW * 0.72, y2 - y1 + 28); ctx.font = `600 12px ${F.mono}`; ctx.fillText("+", cx(i) - colW * 0.36 - 8, (y1 + y2) / 2); }
      }
    }
    if (cur === T.ops) {
      const zero = Math.abs(T.b[T.n]) < 1e-9;
      ctx.strokeStyle = zero ? C.forest : C.warn; ctx.lineWidth = 2; ctx.strokeRect(cx(T.n) - colW * 0.4, y3 - 15, colW * 0.8, 30);
      ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.forest;
      ctx.fillText("몫의 계수", (cx(0) + cx(T.n - 1)) / 2, yB);
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx(0) - colW * 0.3, yB - 12); ctx.lineTo(cx(T.n - 1) + colW * 0.3, yB - 12); ctx.stroke();
      ctx.fillStyle = zero ? C.forest : C.warn; ctx.fillText(zero ? "나머지 0" : "나머지", cx(T.n), yB);
    }
  }

  function update() {
    const T = table(); if (s > T.ops) s = T.ops;
    $(".a-out").textContent = T.a;
    const done = s === T.ops, Q = desc2asc(T.b.slice(0, T.n)), R = T.b[T.n], Pa = P.at(desc2asc(c), T.a);
    $(".n-q").innerHTML = done ? P.fmt(Q, true) : "…"; $(".n-r").textContent = done ? P.n(R) : "…";
    let msg;
    if (s === 0) msg = `계수 ${c.map(P.n).join(", ")}를 차수 순서로 적고, 왼쪽에 <i>a</i> = ${P.n(T.a)}를 씁니다. '다음 칸'을 누르세요.`;
    else if (s === 1) msg = `② 첫 계수 ${P.n(c[0])}를 그대로 아래로 내립니다.`;
    else if (s % 2 === 0) { const i = s / 2; msg = `③ 방금 아래에 쓴 ${P.n(T.b[i - 1])}에 <i>a</i> = ${P.n(T.a)}를 곱해 ${P.n(T.m[i])}를 다음 칸 위에 씁니다.`; }
    else { const i = (s - 1) / 2; msg = `④ 그 칸의 계수와 더합니다: ${P.n(c[i])} + (${P.n(T.m[i])}) = ${P.n(T.b[i])}.`; }
    if (done) msg += ` 아래 줄의 마지막 수 ${P.n(R)}가 나머지, 앞의 수 ${T.b.slice(0, T.n).map(P.n).join(", ")}가 몫의 계수입니다.`;
    $(".msg").innerHTML = msg;
    const lin = T.a === 0 ? "<i>x</i>" : `<i>x</i> ${T.a < 0 ? "+" : "−"} ${Math.abs(T.a)}`;
    $(".chk").innerHTML = done
      ? `검산: P(${P.n(T.a)}) = ${P.n(Pa)}${Math.abs(Pa - R) < 1e-9 ? " = 나머지" : ""}. ${Math.abs(R) < 1e-9 ? `나머지가 0이므로 ${lin}는 인수입니다.` : `${lin}는 인수가 아닙니다.`}`
      : "끝까지 진행하면 나머지와 P(<i>a</i>)를 비교합니다.";
    draw();
  }
  $(".go-next").addEventListener("click", () => { s = Math.min(s + 1, 99); update(); });
  $(".go-all").addEventListener("click", () => { s = Infinity; update(); });
  $(".go-reset").addEventListener("click", () => { s = 0; update(); });
  exBtns.forEach((b) => b.addEventListener("click", () => { c = b.dataset.p.split(",").map(Number); exBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  sa.addEventListener("input", update);
  update();
})();
