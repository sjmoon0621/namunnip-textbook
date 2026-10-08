/* 카드: 공간에서 두 벡터가 수직인지 어떻게 알까? — a·b = a1b1 + a2b2 + a3b3, cosθ, 돌려 보는 3차원 그림 */
(() => {
  const root = document.getElementById("card-geo-dot-space");
  if (!root) return;
  const { C, F, fit } = NM;
  const V = NMGeoVec;
  const $ = (s) => root.querySelector(s), cv = $("canvas"), btns = [...root.querySelectorAll(".presets .chip")];
  const sl = [$(".s1"), $(".s2"), $(".s3")];
  let a = [1, 2, 2];
  const view = V.view3();
  const { ctx, size } = fit(cv, () => draw());
  const par = (v) => v < 0 ? `(${V.n(v)})` : V.n(v);
  const getB = () => sl.map((s) => +s.value);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    V.fit3(view, w, h, 3.6);
    V.axes3(ctx, view, 3.6, { grid: 3 });
    const b = getB(), La = V.norm(a), Lb = V.norm(b);
    for (const v of [a, b]) V.line3(ctx, view, v, [v[0], v[1], 0], C.ink3, 1, [2, 3]);
    if (La > 0 && Lb > 0) {
      const th = V.angle(a, b), ua = V.mul(1 / La, a), ub = V.mul(1 / Lb, b), r = 0.9;
      if (th > 0.02 && th < Math.PI - 0.02) {
        ctx.save(); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath();
        for (let i = 0; i <= 30; i++) {
          const t = i / 30, k1 = Math.sin((1 - t) * th) / Math.sin(th), k2 = Math.sin(t * th) / Math.sin(th);
          const q = view.P(V.mul(r, V.add(V.mul(k1, ua), V.mul(k2, ub))));
          i ? ctx.lineTo(...q) : ctx.moveTo(...q);
        }
        ctx.stroke(); ctx.restore();
        const m = V.add(ua, ub), Lm = V.norm(m);
        if (Lm > 0.05) { const q = view.P(V.mul((r + 0.35) / Lm, m)); V.text(ctx, "θ", q[0], q[1], C.ink2, { font: `italic 13px ${F.serif}` }); }
      }
    }
    const d = V.dotp(a, b);
    V.arrow3(ctx, view, [0, 0, 0], a, C.apple, 3, 11);
    V.arrow3(ctx, view, [0, 0, 0], b, d === 0 ? C.forest : C.amber, 3, 11);
    const O = view.P([0, 0, 0]);
    const lab = (v, s, col) => { const [x, y] = view.P(v), L = Math.hypot(x - O[0], y - O[1]) || 1; V.vlabel(ctx, s, x + (x - O[0]) / L * 16, y + (y - O[1]) / L * 16, col); };
    if (La > 0) lab(a, "{a}", C.apple);
    if (Lb > 0) lab(b, "{b}", d === 0 ? C.forest : C.amber);
  }

  function update() {
    const b = getB(), d = V.dotp(a, b), La = V.norm(a), Lb = V.norm(b), ok = Lb > 0;
    b.forEach((v, i) => { root.querySelector(`.o${i + 1}`).textContent = V.n(v); });
    const vs = (x) => `<span class="vec"><i>${x}</i></span>`;
    $(".eq").innerHTML = `${vs("a")}·${vs("b")} = ${a.map((x, i) => `${par(x)}×${par(b[i])}`).join(" + ")} = ${V.n(d)}`;
    const nd = $(".n-d"); nd.textContent = V.n(d); nd.className = `n-d ${d === 0 && ok ? "good" : ""}`;
    $(".n-c").textContent = ok ? V.n(d / (La * Lb), 3) : "—";
    $(".n-t").textContent = ok ? `${V.n(V.deg(V.angle(a, b)), 1)}°${d === 0 ? " (수직)" : ""}` : "{b} = 0";
    if (!ok) $(".n-t").textContent = "영벡터";
    draw();
  }
  V.orbit(cv, view, draw);
  btns.forEach((x) => x.addEventListener("click", () => { a = x.dataset.a.split(",").map(Number); btns.forEach((y) => y.setAttribute("aria-pressed", String(y === x))); update(); }));
  sl.forEach((s) => s.addEventListener("input", update));
  update();
})();
