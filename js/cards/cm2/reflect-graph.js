/* 카드: 대칭이동한 도형의 방정식은 어떻게 구할까? — 원·포물선·직선을 네 기준으로 대칭이동, f(x, −y) 꼴 확인 */
(() => {
  const root = document.getElementById("card-cm2-reflect-graph");
  if (!root) return;
  const { C, clamp } = NM, K = NMCoord;
  const $ = (s) => root.querySelector(s), shapes = [...root.querySelectorAll(".shape .chip")], mirs = [...root.querySelectorAll(".mir .chip")];
  let kind = "c", mir = "x", t = 0.8;
  const P = K.plane($("canvas"), { cx: 0, cy: 0, span: 16 }, () => draw());
  const RF = { x: ([x, y]) => [x, -y], y: ([x, y]) => [-x, y], o: ([x, y]) => [-x, -y], d: ([x, y]) => [y, x] };
  const x = "<i>x</i>", y = "<i>y</i>", sq = "<sup>2</sup>";
  /* 원래 도형: 매개변수 점, 식, 대입한 식과 정리한 식, 새 식의 좌변·우변 값 */
  const S = {
    c: { at: (u) => [3 + 2 * Math.cos(u), 1 + 2 * Math.sin(u)], rng: [-Math.PI, Math.PI],
      f: `(${x} − 3)${sq} + (${y} − 1)${sq} = 4`,
      sub: { x: `(${x} − 3)${sq} + (−${y} − 1)${sq} = 4`, y: `(−${x} − 3)${sq} + (${y} − 1)${sq} = 4`, o: `(−${x} − 3)${sq} + (−${y} − 1)${sq} = 4`, d: `(${y} − 3)${sq} + (${x} − 1)${sq} = 4` },
      out: { x: `(${x} − 3)${sq} + (${y} + 1)${sq} = 4`, y: `(${x} + 3)${sq} + (${y} − 1)${sq} = 4`, o: `(${x} + 3)${sq} + (${y} + 1)${sq} = 4`, d: `(${x} − 1)${sq} + (${y} − 3)${sq} = 4` },
      g: { x: (X, Y) => [(X - 3) ** 2 + (Y + 1) ** 2, 4], y: (X, Y) => [(X + 3) ** 2 + (Y - 1) ** 2, 4], o: (X, Y) => [(X + 3) ** 2 + (Y + 1) ** 2, 4], d: (X, Y) => [(X - 1) ** 2 + (Y - 3) ** 2, 4] } },
    p: { at: (u) => [u, u * u - 2 * u - 1], rng: [-1.5, 3.5],
      f: `${y} = ${x}${sq} − 2${x} − 1`,
      sub: { x: `−${y} = ${x}${sq} − 2${x} − 1`, y: `${y} = (−${x})${sq} − 2(−${x}) − 1`, o: `−${y} = (−${x})${sq} − 2(−${x}) − 1`, d: `${x} = ${y}${sq} − 2${y} − 1` },
      out: { x: `${y} = −${x}${sq} + 2${x} + 1`, y: `${y} = ${x}${sq} + 2${x} − 1`, o: `${y} = −${x}${sq} − 2${x} + 1`, d: `${x} = ${y}${sq} − 2${y} − 1` },
      g: { x: (X, Y) => [Y, -X * X + 2 * X + 1], y: (X, Y) => [Y, X * X + 2 * X - 1], o: (X, Y) => [Y, -X * X - 2 * X + 1], d: (X, Y) => [X, Y * Y - 2 * Y - 1] } },
    l: { at: (u) => [u, 2 * u - 3], rng: [-1, 4.5],
      f: `${y} = 2${x} − 3`,
      sub: { x: `−${y} = 2${x} − 3`, y: `${y} = 2(−${x}) − 3`, o: `−${y} = 2(−${x}) − 3`, d: `${x} = 2${y} − 3` },
      out: { x: `${y} = −2${x} + 3`, y: `${y} = −2${x} − 3`, o: `${y} = 2${x} + 3`, d: `${y} = ${x}/2 + 3/2` },
      g: { x: (X, Y) => [Y, -2 * X + 3], y: (X, Y) => [Y, -2 * X - 3], o: (X, Y) => [Y, 2 * X + 3], d: (X, Y) => [Y, X / 2 + 1.5] } },
  };
  const samples = () => { const s = S[kind], N = 160, [u0, u1] = kind === "c" ? s.rng : kind === "p" ? [-3, 5] : [-8, 8]; return Array.from({ length: N + 1 }, (_, i) => s.at(u0 + (u1 - u0) * i / N)); };

  function draw() {
    if (!P.size.w) return;
    P.grid();
    if (mir === "x") P.line(0, 1, 0, C.forest, 2.5, [2, 3]);
    else if (mir === "y") P.line(1, 0, 0, C.forest, 2.5, [2, 3]);
    else if (mir === "d") P.line(1, -1, 0, C.forest, 2.5, [2, 3]);
    else P.dot([0, 0], C.forest, 5);
    const pts = samples();
    P.path(pts, C.ink3, 2, [6, 4]);
    P.path(pts.map(RF[mir]), C.warn, 3);
    const q = S[kind].at(t), q2 = RF[mir](q);
    P.seg(q, q2, C.ink3, 1.2, [3, 3]);
    P.knob(q, C.ink2); P.dot(q2, C.warn, 5);
    P.text("Q", q, C.ink2, 10, -12, "left"); P.text("Q′", q2, C.warn, 10, -12, "left");
  }

  function update() {
    const s = S[kind], q = s.at(t), q2 = RF[mir](q), [l, r] = s.g[mir](q2[0], q2[1]);
    $(".n-q").textContent = `(${K.n(q[0])}, ${K.n(q[1])})`; $(".n-q2").textContent = `(${K.n(q2[0])}, ${K.n(q2[1])})`;
    $(".n-c").textContent = `${K.n(l)} = ${K.n(r)} 성립`;
    $(".eq").innerHTML = `${s.f}<br>→ ${s.sub[mir]}${s.sub[mir] === s.out[mir] ? "" : `<br>→ ${s.out[mir]}`}`;
    draw();
  }
  shapes.forEach((b) => b.addEventListener("click", () => { kind = b.dataset.s; t = kind === "c" ? 0.8 : 1; shapes.forEach((z) => z.setAttribute("aria-pressed", String(z === b))); update(); }));
  mirs.forEach((b) => b.addEventListener("click", () => { mir = b.dataset.m; mirs.forEach((z) => z.setAttribute("aria-pressed", String(z === b))); update(); }));
  P.drag([{ get: () => S[kind].at(t), set: (X, Y) => { t = kind === "c" ? Math.atan2(Y - 1, X - 3) : clamp(Math.round(X * 4) / 4, ...S[kind].rng); } }], update);
  update();
})();
