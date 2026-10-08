/* 카드: 안쪽 함수와 바깥 함수의 변화율은 어떻게 합쳐질까? — Δx → Δu → Δy 전달과 dy/dx = (dy/du)(du/dx) */
(() => {
  const root = document.getElementById("card-calc2-chain-lines");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sx = $(".sx"), sd = $(".sd");
  const P = {
    cube: { g: (x) => 2 * x - 1, gp: () => 2, f: (u) => u ** 3, fp: (u) => 3 * u * u, gl: "u = 2x − 1", fl: "y = u³",
      xr: [-0.5, 1.5], xs: 0.5, ur: [-2.2, 2.2], us: 1, yr: [-9, 9], ys: 3 },
    sin: { g: (x) => x * x, gp: (x) => 2 * x, f: Math.sin, fp: Math.cos, gl: "u = x²", fl: "y = sin u",
      xr: [-2, 2], xs: 1, ur: [-0.5, 4.5], us: 1, yr: [-1.3, 1.3], ys: 0.5 },
    exp: { g: (x) => -x * x, gp: (x) => -2 * x, f: Math.exp, fp: Math.exp, gl: "u = −x²", fl: "y = eᵘ",
      xr: [-2, 2], xs: 1, ur: [-4.5, 0.5], us: 1, yr: [-0.15, 1.15], ys: 0.5 },
  };
  let key = "cube", dx = 0.4;
  const { ctx, size } = fit($("canvas"), () => draw());

  function tri(g, x1, y1, x2, y2, ch, cv) {
    ctx.save(); ctx.beginPath(); ctx.rect(g.x0, g.y0, g.w, g.h); ctx.clip(); ctx.lineWidth = 2.4;
    ctx.strokeStyle = ch; ctx.beginPath(); ctx.moveTo(g.X(x1), g.Y(y1)); ctx.lineTo(g.X(x2), g.Y(y1)); ctx.stroke();
    ctx.strokeStyle = cv; ctx.beginPath(); ctx.moveTo(g.X(x2), g.Y(y1)); ctx.lineTo(g.X(x2), g.Y(y2)); ctx.stroke();
    ctx.restore();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[key], x = +sx.value, u = p.g(x), u2 = p.g(x + dx), y = p.f(u), y2 = p.f(u2), half = w / 2;
    const L = K.frame(ctx, w, h, { xr: p.xr, yr: p.ur, xs: p.xs, ys: p.us, R: half + 8, L: 30 });
    K.curve(ctx, L, p.g, C.forest);
    tri(L, x, u, x + dx, u2, C.ink2, C.amber);
    K.dot(ctx, L, x, u, C.ink, false, 3.5); K.dot(ctx, L, x + dx, u2, C.ink, false, 3.5);
    K.tag(ctx, L, p.gl, L.x0 + 4, L.y0 + 10, C.forest, "left", 10.5);
    K.tag(ctx, L, "x →", L.x0 + L.w - 2, L.y0 + L.h - 10, C.ink3, "right", 10);
    const Rg = K.frame(ctx, w, h, { xr: p.ur, yr: p.yr, xs: p.us, ys: p.ys, L: half + 34 });
    K.curve(ctx, Rg, p.f, C.forest);
    tri(Rg, u, y, u2, y2, C.amber, C.warn);
    K.dot(ctx, Rg, u, y, C.ink, false, 3.5); K.dot(ctx, Rg, u2, y2, C.ink, false, 3.5);
    K.tag(ctx, Rg, p.fl, Rg.x0 + 4, Rg.y0 + 10, C.forest, "left", 10.5);
    K.tag(ctx, Rg, "u →", Rg.x0 + Rg.w - 2, Rg.y0 + Rg.h - 10, C.ink3, "right", 10);
  }

  function update() {
    const p = P[key], x = +sx.value, u = p.g(x), du = p.g(x + dx) - u, dy = p.f(u + du) - p.f(u);
    $(".x-out").textContent = n(x, 2); $(".d-out").textContent = n(dx, 6);
    $(".n-ux").textContent = n(du / dx, 4);
    $(".n-yu").textContent = Math.abs(du) < 1e-12 ? "Δu = 0" : n(dy / du, 4);
    $(".n-yx").textContent = n(dy / dx, 4);
    $(".n-gp").textContent = n(p.gp(x), 4); $(".n-fp").textContent = n(p.fp(u), 4); $(".n-pr").textContent = n(p.fp(u) * p.gp(x), 4);
    draw();
  }

  K.chips(root, ".presets .chip[data-k]", (b) => {
    key = b.dataset.k; const p = P[key];
    sx.min = p.xr[0]; sx.max = p.xr[1]; sx.value = 1;
    update();
  });
  $(".go-half").addEventListener("click", () => { if (dx > 1e-5) { dx = +(dx / 2).toPrecision(6); sd.value = Math.max(0.005, dx); update(); } });
  sx.addEventListener("input", update);
  sd.addEventListener("input", () => { dx = +sd.value; update(); });
  update();
})();
