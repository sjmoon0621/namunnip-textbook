/* 카드: 이차부등식의 해는 그래프의 어디에 있을까? — 포물선이 x축보다 위·아래인 범위와 판별식 */
(() => {
  const root = document.getElementById("card-cm1-quad-ineq");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const E = NMEq;
  const $ = (s) => root.querySelector(s), opBtns = [...root.querySelectorAll(".ops .chip")], aBtns = [...root.querySelectorAll(".as .chip")];
  const sb = $(".b"), sc = $(".c");
  const XA = -6, XB = 6, YA = -10, YB = 10;
  let op = ">", a = 1;
  const { ctx, size } = fit($("canvas"), () => draw());
  const esc = (o) => o.replace("<", "&lt;").replace(">", "&gt;");
  const holds = (v) => (op === ">" ? v > 1e-9 : op === "<" ? v < -1e-9 : op === "≥" ? v > -1e-9 : v < 1e-9);

  function polyText(b, c) {
    const lead = a === 1 ? "" : a === -1 ? "−" : String(a);
    let s = `${lead}<i>x</i><sup>2</sup>`;
    if (b) s += ` ${b < 0 ? "−" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}<i>x</i>`;
    if (c) s += ` ${c < 0 ? "−" : "+"} ${Math.abs(c)}`;
    return s;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const b = +sb.value, c = +sc.value, { set } = E.quadSolve(a, b, c, op), f = (x) => a * x * x + b * x + c;
    const x0 = 26, y0 = 8, gw = w - x0 - 8, gh = h * 0.72 - y0;
    const X = (x) => x0 + (x - XA) / (XB - XA) * gw, Y = (y) => y0 + (YB - y) / (YB - YA) * gh;
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [], yt: [-10, -5, 0, 5, 10].map((v) => [v, E.frac(v)]) });
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x0 + gw, Y(0)); ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(0), y0); ctx.lineTo(X(0), y0 + gh); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, gw, gh); ctx.clip();
    const N = 300;
    for (let i = 0; i < N; i++) {
      const xa = XA + (XB - XA) * i / N, xb = XA + (XB - XA) * (i + 1) / N, ok = holds(f((xa + xb) / 2));
      ctx.strokeStyle = ok ? C.forest : C.ink3; ctx.lineWidth = ok ? 3.5 : 1.5;
      ctx.beginPath(); ctx.moveTo(X(xa), Y(f(xa))); ctx.lineTo(X(xb), Y(f(xb))); ctx.stroke();
    }
    const R = E.quadRoots(a, b, c);
    R.real.forEach((r) => { ctx.fillStyle = (op === "≥" || op === "≤") ? C.forest : C.card; ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(r), Y(0), 5, 0, 7); ctx.fill(); ctx.stroke(); });
    ctx.restore();
    ctx.font = `600 11.5px ${F.sans}`; ctx.textBaseline = "top"; ctx.textAlign = "left";
    const t = op === ">" || op === "≥" ? "굵은 부분: x축보다 위" : "굵은 부분: x축보다 아래";
    const tw = ctx.measureText(t).width; ctx.fillStyle = C.card; ctx.fillRect(x0 + 3, y0 + 3, tw + 6, 17); ctx.fillStyle = C.forest; ctx.fillText(t, x0 + 6, y0 + 5);
    const ny = h * 0.72 + h * 0.28 * 0.45;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, ny); ctx.lineTo(x0 + gw, ny); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.textBaseline = "top";
    for (let v = -6; v <= 6; v += 2) { ctx.beginPath(); ctx.moveTo(X(v), ny - 4); ctx.lineTo(X(v), ny + 4); ctx.stroke(); ctx.fillText(E.frac(v), X(v), ny + 10); }
    E.band(ctx, set, { X, y: ny, x0, x1: x0 + gw, col: C.forest, card: C.card });
  }

  function update() {
    const b = +sb.value, c = +sc.value, { R, set } = E.quadSolve(a, b, c, op);
    $(".b-out").textContent = E.frac(b); $(".c-out").textContent = E.frac(c);
    opBtns.forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.op === op)));
    aBtns.forEach((x) => x.setAttribute("aria-pressed", String(+x.dataset.a === a)));
    let eq = `${polyText(b, c)} ${esc(op)} 0`;
    if (R.kind === "two") eq += `, 근 ${R.text.join(", ")}`;
    else if (R.kind === "double") eq += `, 중근 ${R.text[0]}`;
    else eq += `, 허근 ${R.pm}`;
    $(".eq").innerHTML = eq;
    const d = $(".n-d"); d.textContent = E.frac(R.D); d.className = `n-d ${R.D > 0 ? "good" : R.D < 0 ? "bad" : ""}`;
    $(".n-x").textContent = R.kind === "two" ? "두 점에서 만남" : R.kind === "double" ? "한 점에서 접함" : "만나지 않음";
    const n = $(".n-s"); n.innerHTML = E.say(set, true); n.className = `n-s ${set.length ? "good" : "bad"}`;
    draw();
  }
  sb.addEventListener("input", update); sc.addEventListener("input", update);
  opBtns.forEach((x) => x.addEventListener("click", () => { op = x.dataset.op; update(); }));
  aBtns.forEach((x) => x.addEventListener("click", () => { a = +x.dataset.a; update(); }));
  update();
})();
