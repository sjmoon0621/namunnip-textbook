/* 카드: 지수부등식에서 부등호는 언제 뒤집힐까? — aˣ ○ k, logₐ x ○ k의 해를 그래프에서 칠하기 */
(() => {
  const root = document.getElementById("card-alg-exp-ineq");
  if (!root) return;
  const { C, fit } = NM, E = NMExp;
  const $ = (s) => root.querySelector(s);
  const mds = [...root.querySelectorAll(".chip.md")], sgs = [...root.querySelectorAll(".chip.sg")];
  const sa = $(".a"), sk = $(".k");
  let mode = "exp", sign = ">";
  const LIM = { exp: { min: -2, max: 12, X: [-4, 4], Y: [-3, 12], yt: [0, 4, 8, 12], xt: [-4, -2, 0, 2, 4] },
    log: { min: -3, max: 3, X: [-1, 10], Y: [-3.5, 3.5], yt: [-3, -2, -1, 0, 1, 2, 3], xt: [0, 2, 4, 6, 8, 10] } };
  const { ctx, size } = fit($("canvas"), () => draw());

  /* 해를 구간 목록으로: [왼끝, 오른끝, 왼끝 포함?, 오른끝 포함?], 점 해는 { pt } */
  function solve() {
    const a = +sa.value, k = +sk.value, inc = a > 1;
    if (a === 1) return { none: "밑이 1이면 다루지 않습니다", segs: [] };
    if (mode === "exp") {
      if (k <= 0) return sign === ">" ? { all: true, segs: [[-Infinity, Infinity, false, false]] } : { segs: [] };
      const b = Math.log(k) / Math.log(a);
      if (sign === "=") return { b, pt: b, segs: [] };
      const right = (sign === ">") === inc;
      return { b, segs: [right ? [b, Infinity, false, false] : [-Infinity, b, false, false]] };
    }
    const b = a ** k;
    if (sign === "=") return { b, pt: b, segs: [] };
    const right = (sign === ">") === inc;
    return { b, segs: [right ? [b, Infinity, false, false] : [0, b, false, false]] };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = +sa.value, k = +sk.value, L = LIM[mode], r = solve();
    const g = E.frame(ctx, w, h, { X0: L.X[0], X1: L.X[1], Y0: L.Y[0], Y1: L.Y[1], xt: L.xt, yt: L.yt });
    if (mode === "log") { E.vline(ctx, g, 0, C.ink3, [], 1.2); ctx.save(); ctx.fillStyle = C.ink3; ctx.globalAlpha = 0.12; ctx.fillRect(g.x0, g.y0, g.X(0) - g.x0, g.gh); ctx.restore(); }
    if (a !== 1) {
      if (mode === "exp") E.curve(ctx, g, (x) => a ** x, C.forest, { lw: 2.5 });
      else E.param(ctx, g, (u) => a ** u, (u) => u, -6, 6, C.forest, { lw: 2.5 });
    }
    E.hline(ctx, g, k, E.BLUE, [], 1.8);
    E.tag(ctx, g, `y = ${E.n(k)}`, g.x0 + g.gw - 4, g.Y(k) - 11, E.BLUE, "right", 11);
    const y0 = g.Y(0);
    ctx.save(); ctx.strokeStyle = C.warn; ctx.lineWidth = 6; ctx.lineCap = "butt";
    r.segs.forEach(([l, rr]) => {
      const x1 = Math.max(g.x0, l === -Infinity ? g.x0 : g.X(l)), x2 = Math.min(g.x0 + g.gw, rr === Infinity ? g.x0 + g.gw : g.X(rr));
      if (x2 > x1) { ctx.beginPath(); ctx.moveTo(x1, y0); ctx.lineTo(x2, y0); ctx.stroke(); }
      [[l, x1], [rr, x2]].forEach(([v]) => { if (isFinite(v)) E.dot(ctx, g, v, 0, C.warn, 5, true); });
    });
    ctx.restore();
    if (r.pt !== undefined) { E.dot(ctx, g, r.pt, 0, C.warn, 6); }
    if (r.b !== undefined && a !== 1) { E.vline(ctx, g, r.b, C.warn, [3, 3], 1); E.dot(ctx, g, r.b, k, C.ink, 4.5); }
    E.tag(ctx, g, mode === "exp" ? `y = ${E.n(a)}ˣ` : `y = log x (밑 ${E.n(a)})`, g.x0 + 6, g.y0 + 10, C.forest, "left", 11);
  }

  function update() {
    const a = +sa.value, k = +sk.value, A = E.n(a), r = solve(), inc = a > 1;
    const L = LIM[mode]; if (+sk.min !== L.min) { sk.min = L.min; sk.max = L.max; }
    $(".a-out").textContent = A; $(".k-out").textContent = E.n(+sk.value);
    const S = { "=": "=", ">": "&gt;", "<": "&lt;" }[sign];
    $(".eq").innerHTML = mode === "exp" ? `${A}<sup><i>x</i></sup> ${S} ${E.n(k)}` : `log<sub>${A}</sub> <i>x</i> ${S} ${E.n(k)} (진수 조건 <i>x</i> &gt; 0)`;
    $(".n-b").textContent = r.b === undefined ? "없음" : `x ${E.approx(r.b).startsWith("≈") ? E.approx(r.b) : `= ${E.approx(r.b)}`}`;
    const d = $(".n-d");
    d.textContent = a === 1 || sign === "=" ? "—" : inc ? "그대로" : "바뀜"; d.className = `n-d ${!inc && a !== 1 && sign !== "=" ? "bad" : ""}`;
    let s;
    if (r.none) s = r.none;
    else if (r.all) s = "모든 실수";
    else if (r.pt !== undefined) s = `x ${Math.abs(r.pt - Math.round(r.pt)) < 1e-9 ? "=" : "≈"} ${E.n(r.pt, 3)}`;
    else if (!r.segs.length) s = "해 없음";
    else { const [l, rr] = r.segs[0]; s = l === -Infinity ? `x < ${E.n(rr, 3)}` : rr === Infinity ? `x > ${E.n(l, 3)}` : `${E.n(l, 3)} < x < ${E.n(rr, 3)}`; }
    $(".n-s").textContent = s;
    draw();
  }
  mds.forEach((c) => c.addEventListener("click", () => {
    mode = c.dataset.m; mds.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
    const L = LIM[mode]; sk.min = L.min; sk.max = L.max; sk.value = mode === "exp" ? 4 : 2; update();
  }));
  sgs.forEach((c) => c.addEventListener("click", () => { sign = c.dataset.s; sgs.forEach((x) => x.setAttribute("aria-pressed", String(x === c))); update(); }));
  [sa, sk].forEach((s) => s.addEventListener("input", update));
  update();
})();
