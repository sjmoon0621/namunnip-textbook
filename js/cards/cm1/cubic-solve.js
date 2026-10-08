/* 카드: 근의 공식이 없는 삼차방정식은 어떻게 풀까? — 근의 후보 대입 → 조립제법으로 차수 낮추기 → 근의 공식 */
(() => {
  const root = document.getElementById("card-cm1-cubic-solve");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const P = NMPoly, E = NMEq;
  const $ = (s) => root.querySelector(s), exBtns = [...root.querySelectorAll(".ex .chip")];
  const X0 = -4, X1 = 4, Y0 = -15, Y1 = 15;
  let orig, cur, factors, roots, cand, done;
  const { ctx, size } = fit($("canvas"), () => draw());

  const divisors = (n) => { n = Math.abs(n); const d = []; for (let k = 1; k <= n; k++) if (n % k === 0) d.push(k); return d; };
  function candidates(p) {
    const s = new Set();
    divisors(p[0]).forEach((a) => divisors(p[p.length - 1]).forEach((b) => { s.add(a / b); s.add(-a / b); }));
    return [...s].sort((a, b) => Math.abs(a) - Math.abs(b) || b - a);
  }
  const den = (v) => { for (let d = 1; d <= 12; d++) if (Math.abs(v * d - Math.round(v * d)) < 1e-9) return d; return 1; };
  function linFactor(r) {
    const d = den(r), n = Math.round(r * d), x = d === 1 ? "<i>x</i>" : `${d}<i>x</i>`;
    return n === 0 ? x : `(${x} ${n < 0 ? "+" : "−"} ${Math.abs(n)})`;
  }

  function reset(p) {
    orig = p; cur = p.slice(); factors = []; roots = []; cand = null; done = false;
    const box = $(".cands"); box.innerHTML = "";
    candidates(p).forEach((v) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "chip"; b.dataset.v = v; b.textContent = E.frac(v);
      b.addEventListener("click", () => { if (done) return; cand = v; update(); });
      box.appendChild(b);
    });
    update();
  }

  function divide() {
    if (cand === null || Math.abs(P.at(cur, cand)) > 1e-9) return;
    const d = den(cand);
    const { q } = P.div(cur, [-cand, 1]);
    cur = P.scale(q, 1 / d).map((v) => (Math.abs(v) < 1e-12 ? 0 : v));
    factors.push(cand); roots.push(E.frac(cand)); cand = null;
    if (cur.length - 1 <= 2) {
      done = true;
      if (cur.length - 1 === 2) { const R = E.quadRoots(cur[2], cur[1], cur[0]); R.text.forEach((t) => roots.push(t)); }
      else if (cur.length - 1 === 1) roots.push(E.frac(-cur[0] / cur[1]));
    }
    update();
  }

  function factorText() {
    const lin = factors.map(linFactor).join("");
    const rest = P.fmt(cur, true);
    if (!factors.length) return `P(<i>x</i>) = ${rest}`;
    return `P(<i>x</i>) = ${lin}(${rest})`;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 34, y0 = 10, gw = w - x0 - 10, gh = h - y0 - 24;
    const X = (x) => x0 + (x - X0) / (X1 - X0) * gw, Y = (y) => y0 + (Y1 - y) / (Y1 - Y0) * gh;
    const lab = (v) => String(v).replace("-", "−");
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((v) => [v, lab(v)]), yt: [-15, -10, -5, 0, 5, 10, 15].map((v) => [v, lab(v)]) });
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x0 + gw, Y(0)); ctx.moveTo(X(0), y0); ctx.lineTo(X(0), y0 + gh); ctx.stroke();
    P.curve(ctx, (x) => P.at(orig, x), X, Y, X0, X1, { x: x0, y: y0, w: gw, h: gh }, C.forest, 2.5);
    factors.forEach((r) => { ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(X(r), Y(0), 6, 0, 7); ctx.fill(); });
    if (cand !== null) {
      const v = P.at(orig, cand), hit = Math.abs(P.at(cur, cand)) < 1e-9, vy = Math.max(Y0, Math.min(Y1, v));
      ctx.strokeStyle = hit ? C.forest : C.warn; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(X(cand), Y(0)); ctx.lineTo(X(cand), Y(vy)); ctx.stroke();
      ctx.fillStyle = hit ? C.forest : C.warn; ctx.beginPath(); ctx.arc(X(cand), Y(vy), 5, 0, 7); ctx.fill();
      ctx.font = `600 11.5px ${F.sans}`; ctx.textBaseline = "middle";
      const txt = hit ? `P(${E.frac(cand)}) = 0` : `P(${E.frac(cand)}) = ${P.n(v)}${v > Y1 || v < Y0 ? " (그림 밖)" : ""}`;
      const tw = ctx.measureText(txt).width, right = X(cand) + 12 + tw < x0 + gw;
      const ty = Math.max(y0 + 10, Math.min(y0 + gh - 10, hit ? Y(0) - 16 : Y(vy / 2)));
      ctx.textAlign = right ? "left" : "right";
      ctx.fillStyle = C.card; ctx.fillRect(right ? X(cand) + 8 : X(cand) - 12 - tw, ty - 8, tw + 4, 16);
      ctx.fillStyle = hit ? C.forest : C.warn; ctx.fillText(txt, right ? X(cand) + 10 : X(cand) - 10, ty);
    }
    if (done) {
      const R = cur.length - 1 === 2 ? E.quadRoots(cur[2], cur[1], cur[0]) : null, imag = R && R.kind === "imag" ? 2 : 0;
      if (R) R.real.forEach((r) => { ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(X(r), Y(0), 6, 0, 7); ctx.fill(); });
      ctx.font = `600 11.5px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
      const t = imag > 0 ? `허근 ${imag}개는 그래프에 나타나지 않음` : "실근 = x축과 만나는 점";
      const tw = ctx.measureText(t).width;
      ctx.fillStyle = C.card; ctx.fillRect(x0 + 6, y0 + 4, tw + 8, 18);
      ctx.fillStyle = C.ink2; ctx.fillText(t, x0 + 10, y0 + 7);
    }
  }

  function update() {
    const deg = cur.length - 1;
    root.querySelectorAll(".cands .chip").forEach((b) => {
      const v = +b.dataset.v, tried = cand !== null && Math.abs(v - cand) < 1e-12;
      b.setAttribute("aria-pressed", String(tried));
      b.disabled = done;
    });
    const hit = cand !== null && Math.abs(P.at(cur, cand)) < 1e-9;
    $(".go-div").disabled = !hit || done;
    $(".eq").innerHTML = factorText();
    $(".d-v").textContent = cand === null ? "대입한 값" : `남은 식에 ${E.frac(cand)} 대입`;
    $(".n-v").textContent = cand === null ? "—" : P.n(P.at(cur, cand));
    $(".n-v").className = `n-v ${hit ? "good" : ""}`;
    $(".n-d").textContent = String(deg);
    $(".n-r").textContent = roots.length ? roots.join(", ") : "—";
    let msg;
    if (done) msg = deg === 2 ? `이차식 ${P.fmt(cur, true)}이 남았으므로 근의 공식으로 나머지 두 근을 구했습니다. 근은 모두 ${roots.length}개입니다.` : `남은 식이 일차식이므로 근을 바로 구했습니다.`;
    else if (cand === null) msg = factors.length ? `남은 식 ${P.fmt(cur, true)} = 0의 근을 다시 후보에서 찾으세요.` : "후보를 하나 눌러 남은 식에 대입해 보세요.";
    else if (hit) msg = `값이 0이므로 ${linFactor(cand)}는 인수입니다. '조립제법으로 나누기'를 누르세요.`;
    else msg = `0이 아니므로 ${E.frac(cand)}는 근이 아닙니다. 다른 후보를 골라 보세요.`;
    $(".msg").innerHTML = msg;
    draw();
  }

  $(".go-div").addEventListener("click", divide);
  $(".go-reset").addEventListener("click", () => reset(orig));
  exBtns.forEach((b) => b.addEventListener("click", () => {
    exBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    reset(b.dataset.p.split(",").map(Number));
  }));
  reset([6, -5, -2, 1]);
})();
