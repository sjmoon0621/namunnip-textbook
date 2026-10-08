/* 카드: 음수로 나누면 왜 부등호 방향이 바뀔까? — 직선 y = ax와 y = b를 비교해 ax (부등호) b의 해를 수직선에 */
(() => {
  const root = document.getElementById("card-cm1-lin-ineq");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const E = NMEq;
  const $ = (s) => root.querySelector(s), opBtns = [...root.querySelectorAll(".ops .chip")];
  const sa = $(".a"), sb = $(".b");
  const XA = -6, XB = 6, YA = -8, YB = 8;
  let op = ">";
  const { ctx, size } = fit($("canvas"), () => draw());
  const sgn = (v) => String(v).replace("-", "−");
  const holds = (v, b) => (op === ">" ? v > b + 1e-9 : op === "<" ? v < b - 1e-9 : op === "≥" ? v > b - 1e-9 : v < b + 1e-9);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = +sa.value, b = +sb.value, S = E.linSolve(a, 0, op, b);
    const x0 = 26, y0 = 8, gw = w - x0 - 8, gh = h * 0.72 - y0;
    const X = (x) => x0 + (x - XA) / (XB - XA) * gw, Y = (y) => y0 + (YB - y) / (YB - YA) * gh;
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [], yt: [-8, -4, 0, 4, 8].map((v) => [v, sgn(v)]) });
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x0 + gw, Y(0)); ctx.moveTo(X(0), y0); ctx.lineTo(X(0), y0 + gh); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, gw, gh); ctx.clip();
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(x0, Y(b)); ctx.lineTo(x0 + gw, Y(b)); ctx.stroke(); ctx.setLineDash([]);
    const N = 240;
    for (let i = 0; i < N; i++) {
      const xa = XA + (XB - XA) * i / N, xb = XA + (XB - XA) * (i + 1) / N, ok = holds(a * (xa + xb) / 2, b);
      ctx.strokeStyle = ok ? C.forest : C.ink3; ctx.lineWidth = ok ? 3.5 : 1.5;
      ctx.beginPath(); ctx.moveTo(X(xa), Y(a * xa)); ctx.lineTo(X(xb), Y(a * xb)); ctx.stroke();
    }
    ctx.restore();
    ctx.font = `600 11.5px ${F.sans}`; ctx.textBaseline = "top"; ctx.textAlign = "left";
    const lab = (t, x, y, col) => { const tw = ctx.measureText(t).width; ctx.fillStyle = C.card; ctx.fillRect(x - 3, y - 2, tw + 6, 17); ctx.fillStyle = col; ctx.fillText(t, x, y); };
    lab(`y = ${a === 0 ? "0" : (a === 1 ? "" : a === -1 ? "−" : sgn(a)) + "x"}`, x0 + 6, y0 + 5, C.forest);
    lab(`y = ${sgn(b)}`, x0 + 6, y0 + 24, C.amber);
    const ny = h * 0.72 + (h * 0.28) * 0.42;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, ny); ctx.lineTo(x0 + gw, ny); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.textBaseline = "top";
    for (let v = -6; v <= 6; v += 2) { ctx.beginPath(); ctx.moveTo(X(v), ny - 4); ctx.lineTo(X(v), ny + 4); ctx.stroke(); ctx.fillText(sgn(v), X(v), ny + 10); }
    E.band(ctx, S, { X, y: ny, x0, x1: x0 + gw, col: C.forest, card: C.card });
    ctx.textAlign = "left"; ctx.textBaseline = "bottom"; ctx.fillStyle = C.ink2; ctx.font = `600 11px ${F.sans}`;
    ctx.fillText("해", x0, ny - 8);
  }

  function update() {
    const a = +sa.value, b = +sb.value, S = E.linSolve(a, 0, op, b);
    $(".a-out").textContent = sgn(a); $(".b-out").textContent = sgn(b);
    opBtns.forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.op === op)));
    const lhs = a === 0 ? "0 · <i>x</i>" : `${a === 1 ? "" : a === -1 ? "−" : E.frac(a)}<i>x</i>`;
    let eq = `${lhs} ${op.replace("<", "&lt;").replace(">", "&gt;")} ${sgn(b)}`;
    const o = $(".n-o"), aa = $(".n-a");
    if (a === 0) { eq += ` → 좌변은 언제나 0이므로 0 ${op.replace("<", "&lt;").replace(">", "&gt;")} ${sgn(b)}의 참·거짓을 봅니다`; aa.textContent = "0 (나눌 수 없음)"; o.textContent = "—"; o.className = "n-o"; }
    else {
      const fo = a < 0 ? E.flip[op] : op;
      eq += ` → 양변을 ${E.frac(a)}로 나누면 <i>x</i> ${fo.replace("<", "&lt;").replace(">", "&gt;")} ${E.frac(b / a)}`;
      aa.textContent = a > 0 ? `${E.frac(a)} (양수)` : `${E.frac(a)} (음수)`;
      o.textContent = a > 0 ? "그대로" : "바뀜"; o.className = `n-o ${a < 0 ? "bad" : "good"}`;
    }
    $(".eq").innerHTML = eq;
    $(".n-s").innerHTML = E.say(S, true);
    draw();
  }
  sa.addEventListener("input", update); sb.addEventListener("input", update);
  opBtns.forEach((x) => x.addEventListener("click", () => { op = x.dataset.op; update(); }));
  update();
})();
