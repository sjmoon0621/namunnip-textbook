/* 카드: 공식에 맞지 않는 삼차식은 어떻게 인수분해할까? — 유리수 근 후보를 넣어 보고 조립제법으로 차수 낮추기 */
(() => {
  const root = document.getElementById("card-cm1-factor-roots");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const P = NMPoly;
  const $ = (s) => root.querySelector(s), exBtns = [...root.querySelectorAll(".ex .chip")], cand = $(".cand");
  const X0 = -4, X1 = 4, Y0 = -20, Y1 = 20;
  let orig, rem, factors, tested, roots, last;
  const { ctx, size } = fit($("canvas"), () => draw());

  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const divisors = (n) => { n = Math.abs(n); const d = []; for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; };
  const frac = (p, q) => (q === 1 ? P.n(p) : `${p < 0 ? "−" : ""}${Math.abs(p)}/${q}`);
  const linear = ([c0, c1]) => `(${P.fmt([c0, c1], true)})`;

  function candidates() {
    if (rem[0] === 0) return [[0, 1]];
    const out = [], seen = new Set();
    for (const p of divisors(rem[0])) for (const q of divisors(rem[rem.length - 1])) {
      if (gcd(p, q) !== 1) continue;
      for (const s of [1, -1]) { const key = `${s * p}/${q}`; if (!seen.has(key)) { seen.add(key); out.push([s * p, q]); } }
    }
    return out.sort((a, b) => Math.abs(a[0] / a[1]) - Math.abs(b[0] / b[1]) || b[0] - a[0]);
  }

  function reset(p) { orig = p.slice(); rem = p.slice(); factors = []; tested = new Map(); roots = []; last = null; update(); }

  function test(p, q) {
    const r = p / q, v = P.at(rem, r);
    last = { p, q, v };
    if (Math.abs(v) > 1e-9) { tested.set(`${p}/${q}`, v); update(); return; }
    roots.push(r);
    const { q: Q } = P.div(rem, [-r, 1]);
    rem = Q.map((c) => Math.round(c / q));
    factors.push([-p, q]);
    tested = new Map();
    if (rem.length === 2) { factors.push(rem.slice()); roots.push(-rem[0] / rem[1]); rem = [1]; }
    update();
  }

  function factorHTML() {
    const groups = [];
    factors.forEach((f) => { const g = groups.find((x) => x.f[0] === f[0] && x.f[1] === f[1]); if (g) g.n++; else groups.push({ f, n: 1 }); });
    let s = groups.map((g) => linear(g.f) + (g.n > 1 ? `<sup>${g.n}</sup>` : "")).join("");
    if (rem.length > 2) s += `(${P.fmt(rem, true)})`;
    else if (rem[0] !== 1) s = (rem[0] === -1 ? "−" : P.n(rem[0])) + s;
    return s || P.fmt(orig, true);
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 34, y0 = 10, gw = w - x0 - 10, gh = h - y0 - 24;
    const X = (x) => x0 + (x - X0) / (X1 - X0) * gw, Y = (y) => y0 + (Y1 - y) / (Y1 - Y0) * gh;
    const lab = (v) => String(v).replace("-", "−");
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((v) => [v, lab(v)]), yt: [-20, -10, 0, 10, 20].map((v) => [v, lab(v)]) });
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x0 + gw, Y(0)); ctx.moveTo(X(0), y0); ctx.lineTo(X(0), y0 + gh); ctx.stroke();
    P.curve(ctx, (x) => P.at(orig, x), X, Y, X0, X1, { x: x0, y: y0, w: gw, h: gh }, C.ink2, 2);
    tested.forEach((v, key) => {
      const [p, q] = key.split("/").map(Number), x = p / q, y = P.at(orig, x);
      if (x < X0 || x > X1 || y < Y0 || y > Y1) return;
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(x), Y(y), 4.5, 0, 7); ctx.stroke();
    });
    roots.forEach((r) => { if (r < X0 || r > X1) return; ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(X(r), Y(0), 6, 0, 7); ctx.fill(); });
    ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = C.forest;
    ctx.fillText("● 0이 된 값", x0 + 6, y0 + 10); ctx.fillStyle = C.warn; ctx.fillText("○ 0이 아닌 값", x0 + 84, y0 + 10);
  }

  function update() {
    $(".fac").innerHTML = `P(<i>x</i>) = ${P.fmt(orig, true)}` + (factors.length ? `<br>= ${factorHTML()}` : "");
    const done = rem.length <= 2, list = done ? [] : candidates();
    cand.innerHTML = done ? "" : `<span class="lab">후보:</span>` + list.map(([p, q]) => `<button class="chip${tested.has(`${p}/${q}`) ? " miss" : ""}" type="button" data-p="${p}" data-q="${q}">${frac(p, q)}</button>`).join("");
    cand.querySelectorAll(".chip").forEach((b) => b.addEventListener("click", () => test(+b.dataset.p, +b.dataset.q)));
    let msg;
    const allMiss = !done && list.every(([p, q]) => tested.has(`${p}/${q}`));
    if (done) msg = "일차식의 곱으로 모두 쪼갰습니다. 초록 점(그래프와 <i>x</i>축의 교점)이 각 인수에서 나온 값입니다.";
    else if (allMiss) msg = `후보를 모두 넣어도 0이 되지 않습니다. 남은 식 ${P.fmt(rem, true)}은 유리수 계수 범위에서 더 인수분해되지 않습니다.`;
    else if (!last) msg = "후보 하나를 눌러 지금 남은 식에 넣어 보세요.";
    else if (Math.abs(last.v) > 1e-9) msg = `${frac(last.p, last.q)}를 넣으면 ${P.n(last.v)}입니다. 0이 아니므로 인수가 아닙니다.`;
    else msg = `${frac(last.p, last.q)}를 넣으면 0입니다. 인수정리로 ${linear([-last.p, last.q])}가 인수이고, 조립제법으로 나눈 몫 ${P.fmt(rem, true)}이 남습니다.`;
    $(".msg").innerHTML = msg;
    $(".n-c").textContent = last ? frac(last.p, last.q) : "—";
    const nv = $(".n-v"); nv.textContent = last ? P.n(last.v) : "—"; nv.className = `n-v ${last && Math.abs(last.v) < 1e-9 ? "good" : ""}`;
    $(".n-k").textContent = `${factors.length}개`;
    draw();
  }
  exBtns.forEach((b) => b.addEventListener("click", () => { exBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); reset(b.dataset.p.split(",").map(Number)); }));
  reset([6, -5, -2, 1]);
})();
