/* 카드: 어떤 실수를 넣어도 성립하는 부등식은 어떻게 알아볼까? — y = (좌변 − 우변)의 그래프로 반례를 찾고, 증명은 완전제곱식으로 */
(() => {
  const root = document.getElementById("card-cm2-ineq-graph");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const sx = $(".x"), sb = $(".b"), kb = [...root.querySelectorAll(".ks .chip")];
  const n = (v) => { const r = Math.round(v * 1000) / 1000; return r < 0 ? "−" + Math.abs(r) : String(Math.abs(r)); };
  const P = (v) => (v < 0 ? `(${n(v)})` : n(v));
  const K = [
    { L: (x) => x * x + 1, R: (x) => 2 * x, s: false, xr: [-2, 4], yr: [-2, 10], v: "x", t: "x² + 1 ≥ 2x",
      pf: "x² + 1 − 2x = (x − 1)² ≥ 0. 등호는 x = 1일 때 성립합니다. 절대부등식입니다." },
    { L: (x) => x * x + 1, R: (x) => 2 * x, s: true, xr: [-2, 4], yr: [-2, 10], v: "x", t: "x² + 1 > 2x",
      pf: "x² + 1 − 2x = (x − 1)²은 x = 1에서 0이 됩니다. 0 > 0은 거짓이므로 x = 1이 반례이고, 절대부등식이 아닙니다." },
    { L: (x) => x * x, R: (x) => x, s: false, xr: [-1.5, 2], yr: [-1, 4], v: "x", t: "x² ≥ x",
      pf: "x² − x = x(x − 1)은 0 < x < 1에서 음수입니다. 예를 들어 x = 0.5이면 0.25 ≥ 0.5가 거짓이므로 절대부등식이 아닙니다." },
    { L: (x) => x * x - 4 * x + 5, R: () => 0, s: true, xr: [-1, 5], yr: [-2, 10], v: "x", t: "x² − 4x + 5 > 0",
      pf: "x² − 4x + 5 = (x − 2)² + 1 ≥ 1 > 0. 등호가 성립하는 값도 없습니다. 절대부등식입니다." },
    { L: (x, b) => x * x + b * b, R: (x, b) => x * b, s: false, xr: [-3, 3], yr: [-3, 27], v: "a", two: true, t: "a² + b² ≥ ab",
      pf: "a² − ab + b² = (a − b/2)² + 3b²/4 ≥ 0. 등호는 a − b/2 = 0이고 b = 0, 곧 a = b = 0일 때만 성립합니다. 절대부등식입니다." },
    { L: (x, b) => Math.abs(x) + Math.abs(b), R: (x, b) => Math.abs(x + b), s: false, xr: [-3, 3], yr: [-1.5, 7], v: "a", two: true, t: "|a| + |b| ≥ |a + b|",
      pf: "양변이 0 이상이므로 제곱해 비교합니다. (|a| + |b|)² − |a + b|² = 2(|ab| − ab) ≥ 0. 등호는 ab ≥ 0일 때 성립합니다. 절대부등식입니다." },
  ];
  let k = 0, proof = false;
  const { ctx, size } = fit($("canvas"), () => draw());
  const f = (x) => K[k].L(x, +sb.value) - K[k].R(x, +sb.value);
  const holds = (d) => (K[k].s ? d > 1e-12 : d >= -1e-12);
  /* 그림 범위를 0.01 간격으로 훑어 최솟값과 첫 반례를 찾는다 */
  function scan() {
    const [a, b] = K[k].xr; let mn = Infinity, at = 0, bad = null;
    for (let i = Math.round(a * 100); i <= Math.round(b * 100); i++) { const x = i / 100, d = f(x); if (d < mn - 1e-12) { mn = d; at = x; } if (bad === null && !holds(d)) bad = x; }
    return { mn, at, bad };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const c = K[k], [xa, xb] = c.xr, [ya, yb] = c.yr;
    const x0 = 34, y0 = 24, gw = w - x0 - 12, gh = h - y0 - 30;
    const X = (x) => x0 + (x - xa) / (xb - xa) * gw, Y = (y) => y0 + (yb - y) / (yb - ya) * gh;
    const xs = [], ys = [];
    for (let v = Math.ceil(xa); v <= xb; v++) xs.push([v, n(v)]);
    const yst = (yb - ya) > 12 ? 5 : (yb - ya) > 6 ? 2 : 1;
    for (let v = Math.ceil(ya / yst) * yst; v <= yb; v += yst) ys.push([v, n(v)]);
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: xs, yt: ys, xlabel: c.v, ylabel: "좌변 − 우변" });
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x0 + gw, Y(0)); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, gw, gh); ctx.clip();
    ctx.fillStyle = C.warn; ctx.globalAlpha = 0.25;
    for (let px = 0; px < gw; px++) { const x = xa + px / gw * (xb - xa), d = f(x); if (d < 0) ctx.fillRect(x0 + px, Y(0), 1, Y(d) - Y(0)); }
    ctx.globalAlpha = 1; ctx.strokeStyle = C.forest; ctx.lineWidth = 2.4; ctx.beginPath();
    for (let px = 0; px <= gw; px++) { const x = xa + px / gw * (xb - xa), y = Y(f(x)); px ? ctx.lineTo(x0 + px, y) : ctx.moveTo(x0 + px, y); }
    ctx.stroke();
    /* 등호가 되는 점: '≥'이면 초록(성립), '>'이면 붉은(반례) */
    for (let i = Math.round(xa * 100); i <= Math.round(xb * 100); i++) {
      const x = i / 100, d = f(x);
      if (Math.abs(d) < 1e-12) { ctx.beginPath(); ctx.arc(X(x), Y(0), 5, 0, Math.PI * 2); ctx.fillStyle = c.s ? C.warn : C.forest; ctx.fill(); }
    }
    const xv = +sx.value;
    if (xv >= xa && xv <= xb) {
      ctx.strokeStyle = C.ink2; ctx.setLineDash([4, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(xv), y0); ctx.lineTo(X(xv), y0 + gh); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(X(xv), Y(f(xv)), 5.5, 0, Math.PI * 2); ctx.fillStyle = holds(f(xv)) ? C.ink : C.warn; ctx.fill();
    }
    ctx.restore();
  }
  function update() {
    const c = K[k], xv = +sx.value, b = +sb.value;
    sx.min = c.xr[0]; sx.max = c.xr[1];
    $(".x-out").textContent = n(+sx.value); $(".b-out").textContent = n(b);
    $(".vn").innerHTML = `<i>${c.v}</i>`; $(".bwrap").hidden = !c.two;
    const L = c.L(xv, b), Rr = c.R(xv, b), ok = holds(L - Rr);
    $(".eq").textContent = `${c.t}${c.two ? `   (b = ${n(b)})` : ""}`;
    const at = $(".n-at"); at.textContent = `${n(L)} ${ok ? (c.s ? ">" : "≥") : (c.s ? "≤" : "<")} ${n(Rr)} → ${ok ? "성립" : "깨짐"}`; at.className = `n-at ${ok ? "good" : "bad"}`;
    const s = scan();
    $(".n-min").textContent = `${n(s.mn)} (${c.v} = ${n(s.at)})`;
    const v = $(".n-v"); v.textContent = s.bad === null ? (c.two ? "이 b에서는 반례 없음" : "반례 없음") : `반례 ${c.v} = ${n(s.bad)}`; v.className = `n-v ${s.bad === null ? "good" : "bad"}`;
    $(".msg").textContent = proof ? c.pf : "그래프가 0 아래로 내려가거나, '>'인데 0에 닿는 곳이 있으면 반례입니다.";
    draw();
  }
  kb.forEach((bt) => bt.addEventListener("click", () => { k = +bt.dataset.k; proof = false; kb.forEach((x) => x.setAttribute("aria-pressed", String(x === bt))); update(); }));
  [sx, sb].forEach((s) => s.addEventListener("input", update));
  $(".go-proof").addEventListener("click", () => { proof = !proof; update(); });
  update();
})();
