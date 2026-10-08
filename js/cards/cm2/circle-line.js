/* 카드: 원과 직선이 만나는지 그리지 않고 알 수 있을까? — 판별식 D/4와 중심에서의 거리 d를 함께 비교 */
(() => {
  const root = document.getElementById("card-cm2-circle-line");
  if (!root) return;
  const { C } = NM, K = NMCoord;
  const $ = (s) => root.querySelector(s);
  const P = K.plane($("canvas"), { cx: 0, cy: 0, span: 16 }, () => draw());
  const get = () => ["r", "m", "k"].map((i) => +$("." + i).value);
  const X = "<i>x</i>";
  const calc = () => {
    const [r, m, k] = get(), D4 = r * r * (1 + m * m) - k * k, d = Math.abs(k) / Math.sqrt(1 + m * m);
    return { r, m, k, D4, d, s: Math.abs(D4) < 1e-9 ? 0 : Math.sign(D4) };
  };

  function draw() {
    if (!P.size.w) return;
    P.grid();
    const { r, m, k, D4, s } = calc(), O = [0, 0];
    P.circle(0, 0, r, C.forest, 3);
    P.line(m, -1, k, s > 0 ? C.ink : s === 0 ? C.forest : C.warn, 2.5);
    const H = [-m * k / (1 + m * m), k / (1 + m * m)];
    if (Math.abs(k) > 1e-9) {
      P.seg(O, H, C.warn, 2, [5, 4]); P.right(H, [1, m], [-H[0], -H[1]], C.warn);
      P.text("d", [H[0] / 2, H[1] / 2], C.warn, 8, -6, "left");
    }
    if (s >= 0) {
      const sq = Math.sqrt(Math.max(0, D4));
      for (const t of s ? [-1, 1] : [1]) { const x = (-m * k + t * sq) / (1 + m * m); P.dot([x, m * x + k], C.ink, 5.5); }
      if (s === 0) P.text("접점", H, C.forest, 10, -12, "left");
    }
    P.dot(O, C.forest, 3.5);
  }

  function update() {
    const { r, m, k, D4, d, s } = calc();
    $(".o-r").textContent = K.n(r); $(".o-m").textContent = K.n(m); $(".o-k").textContent = K.n(k);
    $(".n-d").textContent = K.n(D4, 4);
    $(".n-dr").textContent = `${K.n(d)} ${Math.abs(d - r) < 1e-9 ? "=" : d < r ? "<" : ">"} ${K.n(r)}`;
    const e = $(".n-rel"); e.textContent = s > 0 ? "두 점에서 만남" : s === 0 ? "접함" : "만나지 않음"; e.className = `n-rel ${s === 0 ? "good" : ""}`;
    $(".eq").innerHTML = `<i>x</i><sup>2</sup> + (${K.lin([[m, X], [k, ""]])})<sup>2</sup> = ${K.n(r * r)}<br>→ ${K.lin([[1 + m * m, X + "<sup>2</sup>"], [2 * m * k, X], [k * k - r * r, ""]])} = 0`;
    draw();
  }
  root.querySelectorAll(".presets .chip").forEach((b) => b.addEventListener("click", () => {
    const v = b.dataset.p.split(","); ["r", "m", "k"].forEach((i, j) => { $("." + i).value = v[j]; }); update();
  }));
  root.querySelectorAll("input").forEach((i) => i.addEventListener("input", update));
  update();
})();
