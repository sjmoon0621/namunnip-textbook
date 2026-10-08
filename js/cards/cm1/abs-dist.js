/* 카드: |x − a| < r은 수직선에서 어떤 범위일까? — V자 그래프와 수평선, a에서의 거리로 해 읽기 */
(() => {
  const root = document.getElementById("card-cm1-abs-dist");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const E = NMEq;
  const $ = (s) => root.querySelector(s), opBtns = [...root.querySelectorAll(".ops .chip")];
  const sa = $(".a"), sr = $(".r");
  const XA = -6, XB = 6, YA = -2.5, YB = 6;
  let op = "<";
  const { ctx, size } = fit($("canvas"), () => draw());
  const sgn = (v) => E.frac(v);
  const esc = (o) => o.replace("<", "&lt;").replace(">", "&gt;");
  const holds = (v, r) => (op === ">" ? v > r + 1e-9 : op === "<" ? v < r - 1e-9 : op === "≥" ? v > r - 1e-9 : v < r + 1e-9);

  function solve() {
    const a = +sa.value, r = +sr.value;
    const right = E.cap(E.linSolve(1, -a, op, r), [E.iv(a, Infinity, true, false)]);
    const left = E.cap(E.linSolve(-1, a, op, r), [E.iv(-Infinity, a, false, false)]);
    return { a, r, S: E.cup(left, right) };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { a, r, S } = solve();
    const x0 = 26, y0 = 8, gw = w - x0 - 8, gh = h * 0.7 - y0;
    const X = (x) => x0 + (x - XA) / (XB - XA) * gw, Y = (y) => y0 + (YB - y) / (YB - YA) * gh;
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [], yt: [-2, 0, 2, 4, 6].map((v) => [v, sgn(v)]) });
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x0 + gw, Y(0)); ctx.moveTo(X(0), y0); ctx.lineTo(X(0), y0 + gh); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, gw, gh); ctx.clip();
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(x0, Y(r)); ctx.lineTo(x0 + gw, Y(r)); ctx.stroke(); ctx.setLineDash([]);
    const N = 240;
    for (let i = 0; i < N; i++) {
      const xa = XA + (XB - XA) * i / N, xb = XA + (XB - XA) * (i + 1) / N, ok = holds(Math.abs((xa + xb) / 2 - a), r);
      ctx.strokeStyle = ok ? C.forest : C.ink3; ctx.lineWidth = ok ? 3.5 : 1.5;
      ctx.beginPath(); ctx.moveTo(X(xa), Y(Math.abs(xa - a))); ctx.lineTo(X(xb), Y(Math.abs(xb - a))); ctx.stroke();
    }
    ctx.restore();
    ctx.font = `600 11.5px ${F.sans}`; ctx.textBaseline = "top"; ctx.textAlign = "left";
    const lab = (t, x, y, col) => { const tw = ctx.measureText(t).width; ctx.fillStyle = C.card; ctx.fillRect(x - 3, y - 2, tw + 6, 17); ctx.fillStyle = col; ctx.fillText(t, x, y); };
    lab(`y = |x${a === 0 ? "" : ` ${a < 0 ? "+" : "−"} ${E.frac(Math.abs(a))}`}|`, x0 + 6, y0 + 5, C.forest);
    lab(`y = ${sgn(r)}`, x0 + 6, y0 + 24, C.amber);
    const ny = h * 0.7 + h * 0.3 * 0.5;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, ny); ctx.lineTo(x0 + gw, ny); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.textBaseline = "top";
    for (let v = -6; v <= 6; v += 2) { ctx.beginPath(); ctx.moveTo(X(v), ny - 4); ctx.lineTo(X(v), ny + 4); ctx.stroke(); ctx.fillText(String(v).replace("-", "−"), X(v), ny + 10); }
    if (r > 0) {
      const ay = ny - 16;
      ctx.strokeStyle = C.warn; ctx.fillStyle = C.warn; ctx.lineWidth = 1.3;
      [a - r, a + r].forEach((e) => { ctx.beginPath(); ctx.moveTo(X(a), ay); ctx.lineTo(X(e), ay); ctx.stroke(); const d = e < a ? 1 : -1; ctx.beginPath(); ctx.moveTo(X(e), ay); ctx.lineTo(X(e) + 6 * d, ay - 4); ctx.lineTo(X(e) + 6 * d, ay + 4); ctx.closePath(); ctx.fill(); });
      ctx.font = `600 11px ${F.mono}`; ctx.textBaseline = "bottom";
      ctx.fillText(`${sgn(r)}`, (X(a - r) + X(a)) / 2, ay - 3); ctx.fillText(`${sgn(r)}`, (X(a + r) + X(a)) / 2, ay - 3);
    }
    E.band(ctx, S, { X, y: ny, x0, x1: x0 + gw, col: C.forest, card: C.card });
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.moveTo(X(a), ny + 2); ctx.lineTo(X(a) - 5, ny + 9); ctx.lineTo(X(a) + 5, ny + 9); ctx.closePath(); ctx.fill();
  }

  function update() {
    const { a, r, S } = solve();
    $(".a-out").textContent = sgn(a); $(".r-out").textContent = sgn(r);
    opBtns.forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.op === op)));
    const absT = `|<i>x</i>${a === 0 ? "" : ` ${a < 0 ? "+" : "−"} ${E.frac(Math.abs(a))}`}|`;
    let eq = `${absT} ${esc(op)} ${sgn(r)}`;
    if (r < 0) eq += " → 절댓값은 음수가 될 수 없습니다";
    else if (r === 0) eq += ` → 거리가 0인 점은 <i>x</i> = ${sgn(a)} 하나뿐입니다`;
    else eq += (op === "<" || op === "≤") ? ` → <i>x</i>와 ${sgn(a)} 사이의 거리가 ${sgn(r)}${op === "<" ? "보다 작다" : " 이하"}` : ` → <i>x</i>와 ${sgn(a)} 사이의 거리가 ${sgn(r)}${op === ">" ? "보다 크다" : " 이상"}`;
    $(".eq").innerHTML = eq;
    $(".n-l").textContent = r >= 0 ? sgn(a - r) : "—"; $(".n-h").textContent = r >= 0 ? sgn(a + r) : "—";
    const n = $(".n-s"); n.innerHTML = E.say(S, true); n.className = `n-s ${S.length ? "good" : "bad"}`;
    draw();
  }
  sa.addEventListener("input", update); sr.addEventListener("input", update);
  opBtns.forEach((x) => x.addEventListener("click", () => { op = x.dataset.op; update(); }));
  update();
})();
