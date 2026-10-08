/* 카드: tan x의 접선의 기울기는 왜 1보다 작아지지 않을까? — 몫의 미분법으로 얻은 tan, cot, sec, csc의 도함수 */
(() => {
  const root = document.getElementById("card-calc2-trig-table");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sx = $(".sx"), cv = $("canvas");
  const PI = Math.PI, H = 1e-5, sin = Math.sin, cos = Math.cos;
  const P = {
    tan: { f: (x) => sin(x) / cos(x), d: (x) => 1 / cos(x) ** 2, den: cos, dl: "sec²x", asy: [PI / 2, 3 * PI / 2],
      eq: "(sin <i>x</i>/cos <i>x</i>)′ = (cos²<i>x</i> + sin²<i>x</i>)/cos²<i>x</i> = 1/cos²<i>x</i> = sec²<i>x</i>" },
    cot: { f: (x) => cos(x) / sin(x), d: (x) => -1 / sin(x) ** 2, den: sin, dl: "−csc²x", asy: [0, PI, 2 * PI],
      eq: "(cos <i>x</i>/sin <i>x</i>)′ = (−sin²<i>x</i> − cos²<i>x</i>)/sin²<i>x</i> = −1/sin²<i>x</i> = −csc²<i>x</i>" },
    sec: { f: (x) => 1 / cos(x), d: (x) => sin(x) / cos(x) ** 2, den: cos, dl: "sec x tan x", asy: [PI / 2, 3 * PI / 2],
      eq: "(1/cos <i>x</i>)′ = −(−sin <i>x</i>)/cos²<i>x</i> = (1/cos <i>x</i>)(sin <i>x</i>/cos <i>x</i>) = sec <i>x</i> tan <i>x</i>" },
    csc: { f: (x) => 1 / sin(x), d: (x) => -cos(x) / sin(x) ** 2, den: sin, dl: "−csc x cot x", asy: [0, PI, 2 * PI],
      eq: "(1/sin <i>x</i>)′ = −cos <i>x</i>/sin²<i>x</i> = −(1/sin <i>x</i>)(cos <i>x</i>/sin <i>x</i>) = −csc <i>x</i> cot <i>x</i>" },
  };
  let key = "tan", g = null;
  const piLab = (v) => { const k = Math.round(v / (PI / 2)); return ["0", "π/2", "π", "3π/2", "2π"][k] ?? ""; };
  const ok = (x) => Math.abs(P[key].den(x)) > 0.04;
  const slope = (x) => (P[key].f(x + H) - P[key].f(x - H)) / (2 * H);
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[key], x0 = +sx.value;
    g = K.frame(ctx, w, h, { xr: [-0.2, 2 * PI + 0.2], yr: [-4, 4], xs: PI / 2, ys: 2, xf: piLab });
    ctx.save(); ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 4]); ctx.lineWidth = 1; ctx.beginPath();
    for (const a of p.asy) { ctx.moveTo(g.X(a), g.y0); ctx.lineTo(g.X(a), g.y0 + g.h); }
    ctx.stroke(); ctx.restore();
    if (ok(x0)) {
      const y0 = p.f(x0), m = slope(x0);
      K.curve(ctx, g, (x) => y0 + m * (x - x0), C.warn, { width: 1.6, dash: [6, 4] });
    }
    K.curve(ctx, g, (x) => (Math.abs(p.den(x)) < 1e-3 ? NaN : p.f(x)), C.forest, { N: 1200 });
    if (ok(x0) && Math.abs(p.f(x0)) < 4) K.dot(ctx, g, x0, p.f(x0), C.warn);
    K.tag(ctx, g, `y = ${key} x`, g.x0 + g.w - 4, g.y0 + 10, C.forest, "right");
  }

  function update() {
    const p = P[key], x0 = +sx.value;
    $(".x-out").textContent = n(x0, 2);
    $(".d-k").textContent = p.dl;
    if (ok(x0)) {
      $(".n-y").textContent = n(p.f(x0), 4); $(".n-m").textContent = n(slope(x0), 4); $(".n-k").textContent = n(p.d(x0), 4);
    } else {
      ["n-y", "n-m", "n-k"].forEach((c) => { $("." + c).textContent = "정의 안 됨"; });
    }
    $(".eq").innerHTML = p.eq;
    draw();
  }

  K.chips(root, ".presets .chip", (b) => { key = b.dataset.k; update(); });
  sx.addEventListener("input", update);
  const drag = (e) => {
    if (!g) return;
    const r = cv.getBoundingClientRect();
    sx.value = clamp(Math.round(g.ix(e.clientX - r.left) * 100) / 100, 0.05, 6.23); update();
  };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  update();
})();
