/* 카드: 이차부등식이 섞인 연립부등식은 어떻게 풀까? — 두 그래프와 세 수직선(①, ②, 공통부분) */
(() => {
  const root = document.getElementById("card-cm1-quad-system");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const E = NMEq;
  const $ = (s) => root.querySelector(s), exBtns = [...root.querySelectorAll(".ex .chip")], opBtns = [...root.querySelectorAll(".ops .chip")];
  const sb = $(".b"), sc = $(".c");
  const XA = -6, XB = 6, YA = -10, YB = 10;
  let first = [1, -1, -6, "≤"], op = ">";
  const { ctx, size } = fit($("canvas"), () => draw());
  const esc = (o) => o.replace("<", "&lt;").replace(">", "&gt;");

  function solveFirst() {
    const [a, b, c, o] = first;
    if (a === 0) return E.linSolve(b, c, o, 5);
    return E.quadSolve(a, b, c, o).set;
  }
  function sets() {
    const A = solveFirst(), Q = E.quadSolve(1, +sb.value, +sc.value, op);
    return { A, B: Q.set, R: Q.R, S: E.cap(A, Q.set) };
  }
  function polyText(b, c) {
    let s = "<i>x</i><sup>2</sup>";
    if (b) s += ` ${b < 0 ? "−" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}<i>x</i>`;
    if (c) s += ` ${c < 0 ? "−" : "+"} ${Math.abs(c)}`;
    return s;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { A, B, S } = sets(), b = +sb.value, c = +sc.value;
    const x0 = 40, y0 = 8, gw = w - x0 - 10, gh = h * 0.56 - y0;
    const X = (x) => x0 + (x - XA) / (XB - XA) * gw, Y = (y) => y0 + (YB - y) / (YB - YA) * gh;
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [], yt: [-10, -5, 0, 5, 10].map((v) => [v, E.frac(v)]) });
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x0 + gw, Y(0)); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, gw, gh); ctx.clip();
    const [a1, b1, c1] = first;
    const f1 = a1 === 0 ? (x) => b1 * x + c1 - 5 : (x) => a1 * x * x + b1 * x + c1, f2 = (x) => x * x + b * x + c;
    [[f1, C.amber], [f2, C.apple]].forEach(([f, col]) => {
      ctx.strokeStyle = col; ctx.lineWidth = 2.3; ctx.beginPath();
      for (let i = 0; i <= 240; i++) { const x = XA + (XB - XA) * i / 240; i ? ctx.lineTo(X(x), Y(f(x))) : ctx.moveTo(X(x), Y(f(x))); }
      ctx.stroke();
    });
    ctx.restore();
    ctx.font = `600 11px ${F.sans}`; ctx.textBaseline = "top"; ctx.textAlign = "left";
    const lab = (t, x, y, col) => { const tw = ctx.measureText(t).width; ctx.fillStyle = C.card; ctx.fillRect(x - 3, y - 2, tw + 6, 16); ctx.fillStyle = col; ctx.fillText(t, x, y); };
    const plain = (a, b, c) => polyText(b, c).replace(/<\/?i>/g, "").replace("<sup>2</sup>", "²").replace(/^x²/, a === 1 ? "x²" : `${a}x²`);
    lab(a1 === 0 ? `① y = ${b1}x − 8` : `① y = ${plain(a1, b1, c1)}`, x0 + 6, y0 + 4, C.amber);
    lab(`② y = ${plain(1, b, c)}`, x0 + 6, y0 + 22, C.apple);
    const rows = [h * 0.64, h * 0.75, h * 0.86], axisY = h * 0.93;
    S.forEach((iv) => {
      const pa = iv.lo === -Infinity ? x0 : X(iv.lo), pb = iv.hi === Infinity ? x0 + gw : X(iv.hi);
      ctx.fillStyle = C.sprout; ctx.globalAlpha = 0.35; ctx.fillRect(pa - (pb - pa < 2 ? 3 : 0), rows[0] - 10, Math.max(pb - pa, 6), axisY - rows[0] + 10); ctx.globalAlpha = 1;
    });
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, axisY); ctx.lineTo(x0 + gw, axisY); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.textBaseline = "top";
    for (let v = -6; v <= 6; v += 2) { ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(X(v) + 0.5, rows[0] - 10); ctx.lineTo(X(v) + 0.5, axisY); ctx.stroke(); ctx.fillText(E.frac(v), X(v), axisY + 4); }
    const names = ["①", "②", "공통"], cols = [C.amber, C.apple, C.forest];
    [A, B, S].forEach((set, i) => {
      ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = cols[i]; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(names[i], 4, rows[i]);
      if (!set.length) { ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.fillText("해 없음", X(-1), rows[i]); return; }
      E.band(ctx, set, { X, y: rows[i], x0, x1: x0 + gw, col: cols[i], card: C.card, lw: i === 2 ? 5 : 4 });
    });
  }

  function update() {
    const { A, B, R, S } = sets(), b = +sb.value, c = +sc.value;
    $(".b-out").textContent = E.frac(b); $(".c-out").textContent = E.frac(c);
    opBtns.forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.op === op)));
    const rt = R.kind === "two" ? `근 ${R.text.join(", ")}` : R.kind === "double" ? `중근 ${R.text[0]}` : "실근 없음 (D &lt; 0)";
    $(".eq").innerHTML = `② ${polyText(b, c)} ${esc(op)} 0, ${rt}`;
    $(".n-1").innerHTML = E.say(A, true); $(".n-2").innerHTML = E.say(B, true);
    const n = $(".n-s"); n.innerHTML = E.say(S, true); n.className = `n-s ${S.length ? "good" : "bad"}`;
    draw();
  }
  sb.addEventListener("input", update); sc.addEventListener("input", update);
  opBtns.forEach((x) => x.addEventListener("click", () => { op = x.dataset.op; update(); }));
  exBtns.forEach((x) => x.addEventListener("click", () => {
    const p = x.dataset.f.split(","); first = [+p[0], +p[1], +p[2], p[3]];
    exBtns.forEach((y) => y.setAttribute("aria-pressed", String(y === x))); update();
  }));
  update();
})();
