/* 카드: 두 곡선 사이의 넓이는 어떻게 구할까? — 직선을 움직여 교점과 넓이, (위 − 아래)의 적분 확인 */
(() => {
  const root = document.getElementById("card-calc1-area-between");
  if (!root) return;
  const { C, fit } = NM, K = NMCalc, I = NMInt;
  const $ = (s) => root.querySelector(s);
  const sM = $(".m"), sK = $(".k");
  let p = [4, 0, -1];
  const { ctx, size } = fit($("canvas"), () => draw());
  const line = () => [+sK.value, +sM.value];
  const diff = () => { const q = p.slice(), l = line(); q[0] -= l[0]; q[1] -= l[1]; return q; };
  const meet = () => I.roots((x) => I.at(diff(), x), -4, 4);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const g = K.frame(ctx, w, h, { xr: [-4, 4], yr: [-6, 8], ys: 2 });
    const f = (x) => I.at(p, x), l = (x) => I.at(line(), x), r = meet();
    if (r.length >= 2) {
      const cuts = r;
      for (let i = 0; i < cuts.length - 1; i++) {
        const m = (cuts[i] + cuts[i + 1]) / 2, up = f(m) > l(m);
        I.fill(ctx, g, f, cuts[i], cuts[i + 1], { base: l, split: false, pos: up ? K.BLUE : C.amber, alpha: up ? .3 : .4 });
      }
    }
    K.curve(ctx, g, f, C.forest, { width: 2.6 });
    K.curve(ctx, g, l, C.warn, { width: 2.2 });
    r.forEach((x) => K.dot(ctx, g, x, f(x), C.ink));
    K.tag(ctx, g, "y = f(x)", g.x0 + 6, g.y0 + 10, C.forest);
    K.tag(ctx, g, "y = g(x)", g.x0 + 6, g.y0 + 28, C.warn);
  }

  function update() {
    const m = +sM.value, k = +sK.value, r = meet(), q = diff();
    $(".m-out").textContent = K.n(m); $(".k-out").textContent = K.n(k);
    $(".g-eq").innerHTML = `<i>g</i>(<i>x</i>) = ${I.fmt(line())} &nbsp; <i>f</i>(<i>x</i>) − <i>g</i>(<i>x</i>) = ${I.fmt(q)}`;
    $(".n-r").textContent = r.length ? r.map((x) => K.n(x, 3)).join(", ") : "없음";
    if (r.length < 2) { $(".n-s").textContent = "둘러싸인 도형 없음"; $(".n-v").textContent = "—"; }
    else {
      const a = r[0], b = r[r.length - 1];
      $(".n-s").textContent = I.val(I.absInt(q, a, b).area, 60);
      $(".n-v").textContent = I.val(I.def(q, a, b), 60);
    }
    draw();
  }
  K.chips(root, ".presets .chip", (b) => { p = b.dataset.p.split(",").map(Number); update(); });
  [sM, sK].forEach((s) => s.addEventListener("input", update));
  update();
})();
