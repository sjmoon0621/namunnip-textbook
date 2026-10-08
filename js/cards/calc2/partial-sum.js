/* 카드: 끝없이 더한 값은 어떻게 정할까? — 항을 하나씩 더해 부분합 Sₙ을 쌓고, 소거되는 꼴로 Sₙ의 식과 극한 확인 */
(() => {
  const root = document.getElementById("card-calc2-partial-sum");
  if (!root) return;
  const { C, fit } = NM;
  const S = NMSeq, n = S.n;
  const $ = (s) => root.querySelector(s);
  const sn = $(".nn"), MAX = 40;
  const P = {
    tel: {
      a: (k) => 1 / (k * (k + 1)), yr: [-0.2, 1.3], yt: [0, 0.5, 1], L: 1, j: "1에 수렴",
      t: (k) => `(1/${k} − 1/${k + 1})`, res: (m) => `1 − 1/${m + 1}`,
    },
    tel2: {
      a: (k) => 2 / (k * (k + 2)), yr: [-0.2, 1.8], yt: [0, 0.5, 1, 1.5], L: 1.5, j: "3/2에 수렴",
      t: (k) => `(1/${k} − 1/${k + 2})`, res: (m) => (m === 1 ? "2/3" : `1 + 1/2 − 1/${m + 1} − 1/${m + 2}`),
    },
    sqrt: {
      a: (k) => Math.sqrt(k + 1) - Math.sqrt(k), yr: [-0.2, 6], yt: [0, 2, 4, 6], L: Infinity, j: "양의 무한대로 발산",
      t: (k) => `(√${k + 1} − √${k})`, res: (m) => `√${m + 1} − 1`,
    },
    alt: {
      a: (k) => (k % 2 ? 1 : -1), yr: [-1.3, 1.5], yt: [-1, 0, 1], L: NaN, j: "진동 (발산)",
      t: (k) => (k % 2 ? "1" : "(−1)"), res: (m) => String(m % 2),
    },
  };
  let key = "tel";
  const { ctx, size } = fit($("canvas"), () => draw());
  const partial = (m) => { let s = 0; for (let k = 1; k <= m; k++) s += P[key].a(k); return s; };

  function draw() {
    const { w, h } = size; if (!w) return;
    const p = P[key], m = +sn.value;
    const g = S.frame(ctx, w, h, { xr: [0, MAX + 1], yr: p.yr, xt: [1, 10, 20, 30, 40], yt: p.yt, L: 34, B: 22 });
    if (isFinite(p.L)) S.hline(ctx, g, p.L, C.forest);
    const bw = Math.max(2, g.w / (MAX + 1) * 0.5);
    let s = 0;
    for (let k = 1; k <= m; k++) {
      const v = p.a(k), y0 = g.Y(0), y1 = g.Y(Math.max(p.yr[0], Math.min(p.yr[1], v)));
      ctx.fillStyle = C.amber; ctx.fillRect(g.X(k) - bw / 2, Math.min(y0, y1), bw, Math.abs(y1 - y0));
      s += v; S.dot(ctx, g, k, s, C.forest, k === m ? 5 : 3.2);
    }
    S.tag(ctx, `n = ${m}일 때 Sₙ = ${n(s, 5)}`, g.x0 + g.w - 4, g.y0 + 10, C.forest, "right");
  }

  function update() {
    const p = P[key], m = +sn.value;
    $(".nn-out").textContent = String(m);
    const terms = m <= 3 ? [...Array(m)].map((_, i) => p.t(i + 1)) : [p.t(1), p.t(2), "…", p.t(m)];
    $(".eq").textContent = `n = ${m}: Sₙ = ${terms.join(" + ")} = ${p.res(m)}`;
    $(".n-a").textContent = n(p.a(m), 6); $(".n-s").textContent = n(partial(m), 6);
    const dj = $(".n-j"); dj.textContent = p.j; dj.className = `n-j ${isFinite(p.L) ? "good" : "bad"}`;
    draw();
  }
  S.chips(root, ".presets .chip", (b) => { key = b.dataset.k; sn.value = "5"; update(); });
  $(".go-add").addEventListener("click", () => { sn.value = String(Math.min(MAX, +sn.value + 1)); update(); });
  $(".go-reset").addEventListener("click", () => { sn.value = "1"; update(); });
  sn.addEventListener("input", update);
  update();
})();
