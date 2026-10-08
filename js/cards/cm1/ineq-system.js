/* 카드: 두 부등식을 함께 만족하는 범위는 어디일까? — 두 해를 수직선에 겹쳐 공통부분 찾기 */
(() => {
  const root = document.getElementById("card-cm1-ineq-system");
  if (!root) return;
  const { C, F, fit } = NM;
  const E = NMEq;
  const $ = (s) => root.querySelector(s), exBtns = [...root.querySelectorAll(".ex .chip")];
  const sp = $(".p"), sq = $(".q");
  const ops = [">", "≤"], XA = -6, XB = 6;
  let given = exBtns[0].dataset.t;
  const opBtns = [[...root.querySelectorAll(".r1 .chip")], [...root.querySelectorAll(".r2 .chip")]];
  const { ctx, size } = fit($("canvas"), () => draw());
  const sgn = (v) => E.frac(v);
  const esc = (o) => o.replace("<", "&lt;").replace(">", "&gt;");

  function sets() {
    const A = E.linSolve(1, 0, ops[0], +sp.value), B = E.linSolve(1, 0, ops[1], +sq.value);
    return { A, B, S: E.cap(A, B) };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { A, B, S } = sets(), x0 = 40, x1 = w - 14;
    const X = (x) => x0 + (x - XA) / (XB - XA) * (x1 - x0);
    const rows = [h * 0.17, h * 0.42, h * 0.7], axisY = h * 0.86;
    S.forEach((a) => {
      const pa = a.lo === -Infinity ? x0 : X(a.lo), pb = a.hi === Infinity ? x1 : X(a.hi);
      ctx.fillStyle = C.sprout; ctx.globalAlpha = 0.35; ctx.fillRect(pa - (pb - pa < 2 ? 3 : 0), rows[0] - 14, Math.max(pb - pa, 6), axisY - rows[0] + 14); ctx.globalAlpha = 1;
    });
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    for (let v = XA; v <= XB; v++) { ctx.beginPath(); ctx.moveTo(X(v) + 0.5, rows[0] - 14); ctx.lineTo(X(v) + 0.5, axisY); ctx.stroke(); }
    ctx.strokeStyle = C.ink2; ctx.beginPath(); ctx.moveTo(x0, axisY); ctx.lineTo(x1, axisY); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.textBaseline = "top";
    for (let v = XA; v <= XB; v += 2) ctx.fillText(String(v).replace("-", "−"), X(v), axisY + 5);
    const names = ["①", "②", "공통"], cols = [C.amber, C.apple, C.forest];
    [A, B, S].forEach((set, i) => {
      ctx.font = `600 11.5px ${F.sans}`; ctx.fillStyle = cols[i]; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(names[i], 4, rows[i]);
      if (!set.length) { ctx.fillStyle = C.ink3; ctx.font = `11.5px ${F.sans}`; ctx.fillText("해 없음", X(-1), rows[i]); return; }
      E.band(ctx, set, { X, y: rows[i], x0, x1, col: cols[i], card: C.card, lw: i === 2 ? 6 : 4 });
    });
  }

  function update() {
    const { A, B, S } = sets();
    $(".p-out").textContent = sgn(+sp.value); $(".q-out").textContent = sgn(+sq.value);
    opBtns.forEach((g, i) => g.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.op === ops[i]))));
    const simple = `① <i>x</i> ${esc(ops[0])} ${sgn(+sp.value)}, ② <i>x</i> ${esc(ops[1])} ${sgn(+sq.value)}`;
    $(".eq").innerHTML = given ? `${given} → ${simple}` : simple;
    $(".n-1").innerHTML = E.say(A, true); $(".n-2").innerHTML = E.say(B, true);
    const n = $(".n-s"); n.innerHTML = E.say(S, true); n.className = `n-s ${S.length ? "good" : "bad"}`;
    draw();
  }
  const manual = () => { given = null; exBtns.forEach((b) => b.setAttribute("aria-pressed", "false")); update(); };
  sp.addEventListener("input", manual); sq.addEventListener("input", manual);
  opBtns.forEach((g, i) => g.forEach((b) => b.addEventListener("click", () => { ops[i] = b.dataset.op; manual(); })));
  exBtns.forEach((b) => b.addEventListener("click", () => {
    const [o1, p, o2, q] = b.dataset.s.split(",");
    ops[0] = o1; ops[1] = o2; sp.value = p; sq.value = q; given = b.dataset.t;
    exBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update();
  }));
  update();
})();
