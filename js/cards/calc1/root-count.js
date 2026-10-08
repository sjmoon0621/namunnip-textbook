/* 카드: 근을 구하지 않고 근의 개수를 셀 수 있을까? — y = f(x)와 수평선 y = k의 교점 */
(() => {
  const root = document.getElementById("card-calc1-root-count");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sk = $(".sk"), cv = $("canvas");
  const FS = [
    { f: (x) => x ** 3 - 3 * x, z: [-1, 1], xr: [-3, 3], yr: [-4, 4], ext: "극대 2 · 극소 −2" },
    { f: (x) => x ** 4 - 2 * x * x, z: [-1, 0, 1], xr: [-2.2, 2.2], yr: [-2, 4], ext: "극소 −1 · 극대 0" },
  ];
  let F = FS[0], g = null;
  const { ctx, size } = fit(cv, () => draw());

  function roots(k) {
    const h = (x) => F.f(x) - k, cuts = [F.xr[0] - 2, ...F.z, F.xr[1] + 2], out = [];
    for (let i = 0; i < cuts.length - 1; i++) {
      let a = cuts[i], b = cuts[i + 1], ha = h(a), hb = h(b);
      if (Math.abs(ha) < 1e-9) { out.push(a); continue; }
      if (ha * hb > 0) continue;
      for (let j = 0; j < 60; j++) { const m = (a + b) / 2, hm = h(m); if (ha * hm <= 0) { b = m; hb = hm; } else { a = m; ha = hm; } }
      out.push((a + b) / 2);
    }
    const last = cuts[cuts.length - 1];
    if (Math.abs(h(last)) < 1e-9) out.push(last);
    return out.filter((r, i) => out.findIndex((s) => Math.abs(s - r) < 1e-6) === i).sort((a, b) => a - b);
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = +sk.value;
    g = K.frame(ctx, w, h, { xr: F.xr, yr: F.yr });
    for (const z of F.z) K.curve(ctx, g, () => F.f(z), C.ink3, { width: 1, dash: [3, 4] });
    K.curve(ctx, g, F.f, C.forest, { width: 2.6 });
    K.curve(ctx, g, () => k, C.warn, { width: 2 });
    const rs = roots(k);
    for (const r of rs) { K.guide(ctx, g, r, k, C.warn, "x"); K.dot(ctx, g, r, k, C.warn, false, 5); }
    K.tag(ctx, g, `y = ${n(k, 2)} · 교점 ${rs.length}개`, g.x0 + 6, g.Y(k) - 13, C.warn);
  }

  function update() {
    const k = +sk.value, rs = roots(k);
    $(".k-out").textContent = n(k, 2);
    const touch = F.z.some((z) => Math.abs(F.f(z) - k) < 1e-9);
    const c = $(".n-c"); c.textContent = `${rs.length}개${touch ? " (중근 포함)" : ""}`; c.className = `n-c ${touch ? "good" : ""}`;
    $(".n-r").textContent = rs.length ? rs.map((r) => n(r, 2)).join(", ") : "없음";
    $(".n-e").textContent = F.ext;
    draw();
  }

  const drag = (e) => { if (!g) return; const r = cv.getBoundingClientRect(); sk.value = g.iy(e.clientY - r.top); update(); };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  K.chips(root, ".presets .chip", (b) => { F = FS[+b.dataset.k]; sk.min = F.yr[0]; sk.max = F.yr[1]; sk.value = F.yr[0] === -4 ? 1 : -0.5; update(); });
  sk.addEventListener("input", update);
  update();
})();
