/* 카드: 로그함수의 그래프는 지수함수의 그래프와 어떤 관계일까? — P(s, a^(s−q)+p)와 Q(a^(s−q)+p, s)의 y = x 대칭 */
(() => {
  const root = document.getElementById("card-alg-inverse-graph");
  if (!root) return;
  const { C, fit } = NM, E = NMExp;
  const $ = (s) => root.querySelector(s);
  const sa = $(".a"), st = $(".t"), sp = $(".p"), sq = $(".q"), cv = $("canvas");
  let g = null;
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = +sa.value, s = +st.value, p = +sp.value, q = +sq.value;
    const l = 30, b = 22, t = 10, r = 10, span = 10, unit = Math.min((w - l - r) / span, (h - t - b) / span);
    g = E.frame(ctx, w, h, { X0: -3, X1: -3 + (w - l - r) / unit, Y0: -3, Y1: -3 + (h - t - b) / unit, l, r, t, b,
      xt: [-2, 0, 2, 4, 6], yt: [-2, 0, 2, 4, 6] });
    ctx.save(); ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 4]); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(g.X(-3), g.Y(-3)); ctx.lineTo(g.X(9), g.Y(9)); ctx.stroke(); ctx.restore();
    E.tag(ctx, g, "y = x", g.X(5.6), g.Y(5.6) - 10, C.ink3, "right", 11);
    if (a === 1) { E.tag(ctx, g, "밑이 1이면 지수함수도 로그함수도 아닙니다", g.x0 + 8, g.y0 + 12, C.warn); return; }
    E.hline(ctx, g, p, C.forest, [4, 4], 1); E.vline(ctx, g, p, E.BLUE, [4, 4], 1);
    const ex = (x) => a ** (x - q) + p;
    E.curve(ctx, g, ex, C.forest, { lw: 2.4 });
    E.param(ctx, g, (u) => a ** u + p, (u) => u + q, -12, 12, E.BLUE, { lw: 2.4 });
    const P = [s, ex(s)], Q = [ex(s), s];
    ctx.save(); ctx.strokeStyle = C.warn; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(g.X(P[0]), g.Y(P[1])); ctx.lineTo(g.X(Q[0]), g.Y(Q[1])); ctx.stroke(); ctx.restore();
    E.dot(ctx, g, (P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2, C.warn, 3.5, true);
    E.dot(ctx, g, P[0], P[1], C.forest, 6); E.dot(ctx, g, Q[0], Q[1], E.BLUE, 6);
    E.tag(ctx, g, "P", g.X(P[0]) - 16, g.Y(P[1]) - 8, C.forest, "left", 12);
    E.tag(ctx, g, "Q", g.X(Q[0]) + 8, g.Y(Q[1]) + 10, E.BLUE, "left", 12);
    E.tag(ctx, g, "지수함수", g.x0 + 6, g.y0 + 10, C.forest, "left", 11);
    E.tag(ctx, g, "로그함수", g.x0 + 6, g.y0 + 28, E.BLUE, "left", 11);
  }

  function update() {
    const a = +sa.value, s = +st.value, p = +sp.value, q = +sq.value, A = E.n(a), y = a ** (s - q) + p;
    $(".a-out").textContent = A; $(".t-out").textContent = E.n(s); $(".p-out").textContent = E.n(p); $(".q-out").textContent = E.n(q);
    const sh = (v, txt) => (v === 0 ? txt : `${txt} ${v > 0 ? "−" : "+"} ${E.n(Math.abs(v))}`);
    const tail = (v) => (v === 0 ? "" : ` ${v > 0 ? "+" : "−"} ${E.n(Math.abs(v))}`);
    $(".eq").innerHTML = a === 1 ? "밑이 1이면 지수함수도 로그함수도 아닙니다."
      : `지수함수 <i>y</i> = ${A}<sup>${sh(q, "<i>x</i>")}</sup>${tail(p)} ⇄ 로그함수 <i>y</i> = log<sub>${A}</sub>(${sh(p, "<i>x</i>")})${tail(q)}`;
    const pt = (u, v) => `(${E.n(u, 2)}, ${E.n(v, 2)})`;
    $(".n-p").textContent = a === 1 ? "—" : pt(s, y);
    $(".n-q").textContent = a === 1 ? "—" : pt(y, s);
    $(".n-m").textContent = a === 1 ? "—" : pt((s + y) / 2, (s + y) / 2);
    draw();
  }
  E.drag(cv, (px) => { if (!g) return; st.value = String(g.IX(px)); update(); });
  [sa, st, sp, sq].forEach((s) => s.addEventListener("input", update));
  update();
})();
