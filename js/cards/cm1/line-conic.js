/* 카드: 일차식과 이차식을 함께 만족하는 해는 몇 개일까? — 직선을 대입한 이차방정식의 판별식과 교점의 개수 */
(() => {
  const root = document.getElementById("card-cm1-line-conic");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const P = NMPoly, E = NMEq;
  const $ = (s) => root.querySelector(s), btns = [...root.querySelectorAll(".presets .chip")];
  const sm = $(".m"), sk = $(".k");
  const XA = -6, XB = 6, YA = -4.5, YB = 4.5;
  let curve = "circ";
  const { ctx, size } = fit($("canvas"), () => draw());
  const sgn = (v) => String(v).replace("-", "−");

  const CURVES = {
    circ: { name: "x² + y² = 5", coef: (m, k) => [k * k - 5, 2 * m * k, 1 + m * m] },
    para: { name: "x² − y = 3", coef: (m, k) => [-(k + 3), -m, 1] },
    hyp: { name: "xy = 2", coef: (m, k) => [-2, k, m] },
  };

  function solve() {
    const m = +sm.value, k = +sk.value, c = CURVES[curve].coef(m, k);
    let xs = [], D = null, deg = 2;
    if (Math.abs(c[2]) < 1e-12) {
      deg = 1;
      if (Math.abs(c[1]) > 1e-12) xs = [-c[0] / c[1]];
    } else {
      D = c[1] * c[1] - 4 * c[2] * c[0];
      if (Math.abs(D) < 1e-9) xs = [-c[1] / (2 * c[2])];
      else if (D > 0) xs = [(-c[1] - Math.sqrt(D)) / (2 * c[2]), (-c[1] + Math.sqrt(D)) / (2 * c[2])].sort((a, b) => a - b);
    }
    return { m, k, c, D, deg, pts: xs.map((x) => [x, m * x + k]) };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 26, y0 = 8, gw = w - x0 - 8, gh = h - y0 - 22;
    const X = (x) => x0 + (x - XA) / (XB - XA) * gw, Y = (y) => y0 + (YB - y) / (YB - YA) * gh;
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [-6, -4, -2, 0, 2, 4, 6].map((v) => [v, sgn(v)]), yt: [-4, -2, 0, 2, 4].map((v) => [v, sgn(v)]) });
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x0 + gw, Y(0)); ctx.moveTo(X(0), y0); ctx.lineTo(X(0), y0 + gh); ctx.stroke();
    const S = solve(), box = { x: x0, y: y0, w: gw, h: gh };
    ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.5;
    if (curve === "circ") { ctx.beginPath(); ctx.ellipse(X(0), Y(0), X(Math.sqrt(5)) - X(0), Y(0) - Y(Math.sqrt(5)), 0, 0, 7); ctx.stroke(); }
    ctx.restore();
    if (curve === "para") P.curve(ctx, (x) => x * x - 3, X, Y, XA, XB, box, C.forest, 2.5);
    if (curve === "hyp") { P.curve(ctx, (x) => 2 / x, X, Y, XA, -0.05, box, C.forest, 2.5); P.curve(ctx, (x) => 2 / x, X, Y, 0.05, XB, box, C.forest, 2.5); }
    P.curve(ctx, (x) => S.m * x + S.k, X, Y, XA, XB, box, C.amber, 2.5);
    S.pts.forEach(([x, y]) => {
      if (y < YA || y > YB) return;
      ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(x), Y(y), 6, 0, 7); ctx.fill();
    });
    ctx.font = `600 11.5px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
    const lab = (t, x, y, col) => { const tw = ctx.measureText(t).width; ctx.fillStyle = C.card; ctx.fillRect(x - 3, y - 2, tw + 6, 17); ctx.fillStyle = col; ctx.fillText(t, x, y); };
    lab(CURVES[curve].name, x0 + 6, y0 + 5, C.forest);
    lab(`y = ${S.m === 0 ? "" : (S.m === 1 ? "" : S.m === -1 ? "−" : sgn(S.m)) + "x"}${S.m === 0 ? sgn(S.k) : S.k === 0 ? "" : ` ${S.k < 0 ? "−" : "+"} ${Math.abs(S.k)}`}`, x0 + 6, y0 + 24, C.amber);
  }

  function update() {
    const S = solve();
    $(".m-out").textContent = sgn(S.m); $(".k-out").textContent = sgn(S.k);
    btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.c === curve)));
    $(".eq").innerHTML = `<i>y</i> = <i>mx</i> + <i>k</i>를 대입: ${P.fmt(S.c, true)} = 0` + (S.deg === 1 ? " (일차방정식)" : "");
    const d = $(".n-d");
    if (S.deg === 1) { d.textContent = "쓸 수 없음"; d.className = "n-d"; }
    else { d.textContent = E.frac(S.D); d.className = `n-d ${S.D > 1e-9 ? "good" : Math.abs(S.D) < 1e-9 ? "" : "bad"}`; }
    $(".n-c").textContent = `${S.pts.length}개${S.deg === 2 && S.pts.length === 1 ? " (접함)" : ""}`;
    $(".n-s").textContent = S.pts.length ? S.pts.map(([x, y]) => `(${E.frac(x)}, ${E.frac(y)})`).join(", ") : "실수 해 없음";
    draw();
  }
  sm.addEventListener("input", update); sk.addEventListener("input", update);
  btns.forEach((b) => b.addEventListener("click", () => { curve = b.dataset.c; update(); }));
  update();
})();
