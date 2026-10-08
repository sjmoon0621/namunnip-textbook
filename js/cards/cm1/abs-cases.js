/* 카드: 절댓값이 두 개면 어디서 나누어 풀까? — 절댓값 기호 안이 0이 되는 값으로 범위를 나누고 범위별 일차부등식을 합치기 */
(() => {
  const root = document.getElementById("card-cm1-abs-cases");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const E = NMEq;
  const $ = (s) => root.querySelector(s), exBtns = [...root.querySelectorAll(".ex .chip")], opBtns = [...root.querySelectorAll(".ops .chip")];
  const sk = $(".k");
  const XA = -4, XB = 5, YA = -3, YB = 8;
  let terms, lin, op = "<", step = Infinity;
  const { ctx, size } = fit($("canvas"), () => draw());
  const esc = (o) => o.replace("<", "&lt;").replace(">", "&gt;");

  function load(spec) {
    const [t, l] = spec.split("|");
    terms = t.split(";").map((x) => x.split(":").map(Number));
    lin = l.split(",").map(Number);
  }
  const f = (x) => terms.reduce((s, [c, p]) => s + c * Math.abs(x - p), lin[0] * x + lin[1]);

  function absText(c, p) {
    const inner = p === 0 ? "<i>x</i>" : `<i>x</i> ${p < 0 ? "+" : "−"} ${Math.abs(p)}`;
    return `${Math.abs(c) === 1 ? "" : Math.abs(c)}|${inner}|`;
  }
  function fText() {
    let s = "";
    terms.forEach(([c, p], i) => { s += i === 0 ? (c < 0 ? "−" : "") + absText(c, p) : ` ${c < 0 ? "−" : "+"} ${absText(c, p)}`; });
    if (lin[0]) s += ` ${lin[0] < 0 ? "−" : "+"} ${Math.abs(lin[0]) === 1 ? "" : Math.abs(lin[0])}<i>x</i>`;
    if (lin[1]) s += ` ${lin[1] < 0 ? "−" : "+"} ${Math.abs(lin[1])}`;
    return s;
  }
  function linText(s, t) {
    if (Math.abs(s) < 1e-12) return E.frac(t);
    const a = s === 1 ? "" : s === -1 ? "−" : E.frac(s);
    return `${a}<i>x</i>${Math.abs(t) < 1e-12 ? "" : ` ${t < 0 ? "−" : "+"} ${E.frac(Math.abs(t))}`}`;
  }

  function cases() {
    const k = +sk.value, bs = [...new Set(terms.map(([, p]) => p))].sort((a, b) => a - b);
    const edges = [-Infinity, ...bs, Infinity];
    return edges.slice(0, -1).map((lo, i) => {
      const hi = edges[i + 1], region = [E.iv(lo, hi, isFinite(lo), false)];
      const tx = isFinite(lo) && isFinite(hi) ? (lo + hi) / 2 : isFinite(lo) ? lo + 1 : hi - 1;
      let s = lin[0], t = lin[1];
      terms.forEach(([c, p]) => { const sg = tx >= p ? 1 : -1; s += c * sg; t += -c * sg * p; });
      const raw = E.linSolve(s, t, op, k), sol = E.cap(raw, region);
      const rText = !isFinite(lo) ? `<i>x</i> &lt; ${E.frac(hi)}` : !isFinite(hi) ? `<i>x</i> ≥ ${E.frac(lo)}` : `${E.frac(lo)} ≤ <i>x</i> &lt; ${E.frac(hi)}`;
      return { lo, hi, s, t, raw, sol, rText };
    });
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = +sk.value, K = cases(), shown = Math.min(step, K.length);
    const x0 = 26, y0 = 8, gw = w - x0 - 8, gh = h * 0.72 - y0;
    const X = (x) => x0 + (x - XA) / (XB - XA) * gw, Y = (y) => y0 + (YB - y) / (YB - YA) * gh;
    K.forEach((q, i) => {
      if (i !== shown - 1 || step > K.length) return;
      const pa = isFinite(q.lo) ? X(q.lo) : x0, pb = isFinite(q.hi) ? X(q.hi) : x0 + gw;
      ctx.fillStyle = C.sprout; ctx.globalAlpha = 0.3; ctx.fillRect(pa, y0, pb - pa, h - y0 - 4); ctx.globalAlpha = 1;
    });
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [], yt: [-2, 0, 2, 4, 6, 8].map((v) => [v, E.frac(v)]) });
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x0 + gw, Y(0)); ctx.moveTo(X(0), y0); ctx.lineTo(X(0), y0 + gh); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, gw, gh); ctx.clip();
    K.forEach((q) => { if (isFinite(q.lo)) { ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(X(q.lo), y0); ctx.lineTo(X(q.lo), y0 + gh); ctx.stroke(); ctx.setLineDash([]); } });
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(x0, Y(k)); ctx.lineTo(x0 + gw, Y(k)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let i = 0; i <= 240; i++) { const x = XA + (XB - XA) * i / 240; i ? ctx.lineTo(X(x), Y(f(x))) : ctx.moveTo(X(x), Y(f(x))); }
    ctx.stroke(); ctx.restore();
    ctx.font = `600 11.5px ${F.sans}`; ctx.textBaseline = "top"; ctx.textAlign = "left";
    const lab = (t, x, y, col) => { const tw = ctx.measureText(t).width; ctx.fillStyle = C.card; ctx.fillRect(x - 3, y - 2, tw + 6, 17); ctx.fillStyle = col; ctx.fillText(t, x, y); };
    lab(`y = ${E.frac(k)}`, x0 + 6, y0 + 5, C.amber);
    const ny = h * 0.72 + h * 0.28 * 0.45;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, ny); ctx.lineTo(x0 + gw, ny); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.textBaseline = "top";
    for (let v = -4; v <= 5; v++) { ctx.beginPath(); ctx.moveTo(X(v), ny - 4); ctx.lineTo(X(v), ny + 4); ctx.stroke(); ctx.fillText(E.frac(v), X(v), ny + 10); }
    const sol = step > K.length ? K.reduce((S, q) => E.cup(S, q.sol), []) : K.slice(0, shown).reduce((S, q) => E.cup(S, q.sol), []);
    E.band(ctx, sol, { X, y: ny, x0, x1: x0 + gw, col: C.forest, card: C.card });
  }

  function update() {
    const k = +sk.value, K = cases();
    $(".k-out").textContent = E.frac(k);
    opBtns.forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.op === op)));
    $(".n-q").innerHTML = `${fText()} ${esc(op)} ${E.frac(k)}`;
    const shown = Math.min(step, K.length);
    $(".work").innerHTML = K.map((q, i) => {
      if (i >= shown) return `<li>${q.rText}일 때: …</li>`;
      const ineq = `${linText(q.s, q.t)} ${esc(op)} ${E.frac(k)}`;
      const raw = Math.abs(q.s) < 1e-12 ? (q.raw.length ? "늘 참" : "늘 거짓") : E.say(q.raw, true);
      return `<li class="${i === shown - 1 && step <= K.length ? "on" : ""}">${q.rText}일 때: ${ineq} → ${raw} → <b>${E.say(q.sol, true)}</b></li>`;
    }).join("");
    const S = K.reduce((acc, q) => E.cup(acc, q.sol), []);
    const n = $(".n-s");
    n.innerHTML = step >= K.length ? E.say(S, true) : "…";
    n.className = `n-s ${step >= K.length ? (S.length ? "good" : "bad") : ""}`;
    $(".go-next").disabled = step >= K.length;
    draw();
  }

  $(".go-next").addEventListener("click", () => { step = Math.min(step + 1, cases().length); update(); });
  $(".go-all").addEventListener("click", () => { step = Infinity; update(); });
  $(".go-reset").addEventListener("click", () => { step = 0; update(); });
  sk.addEventListener("input", update);
  opBtns.forEach((x) => x.addEventListener("click", () => { op = x.dataset.op; update(); }));
  exBtns.forEach((b) => b.addEventListener("click", () => {
    load(b.dataset.f); step = 0;
    exBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update();
  }));
  load(exBtns[0].dataset.f);
  update();
})();
