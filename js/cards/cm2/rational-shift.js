/* 카드: y = k/(x − p) + q의 그래프는 어떻게 생겼을까? — k, p, q를 바꾸며 점근선·대칭의 중심·지나는 사분면을 본다 */
(() => {
  const root = document.getElementById("card-cm2-rational-shift");
  if (!root) return;
  const { C } = NM, K = NMCoord;
  const $ = (s) => root.querySelector(s);
  const sk = $(".k"), sp = $(".p"), sq = $(".q");
  let t = 1;
  const P = K.plane($("canvas"), { cx: 0, cy: 0, span: 13 }, () => draw());
  const X = "<i>x</i>", Y = "<i>y</i>";
  const par = () => [+sk.value, +sp.value, +sq.value];

  function draw() {
    if (!P.size.w) return;
    const [k, p, q] = par();
    P.grid();
    P.line(1, 0, -p, C.warn, 1.4, [6, 4]); P.line(0, 1, -q, C.warn, 1.4, [6, 4]);
    P.curve((x) => k / x, C.ink3, 1.4, [3, 4]);
    P.curve((x) => (Math.abs(x - p) < 1e-6 ? NaN : k / (x - p) + q), C.forest, 2.8);
    P.dot([p, q], C.warn, 4.5);
    P.text(`(${K.n(p)}, ${K.n(q)})`, [p, q], C.warn, 8, 12);
    const a = [p + t, q + k / t], b = [p - t, q - k / t];
    P.seg(a, b, C.amber, 1.3, [3, 3]); P.dot(b, C.amber, 4.5); P.knob(a, C.amber);
    P.text(`x = ${K.n(p)}`, [p, P.box().y1], C.warn, 6, 22);
    P.text(`y = ${K.n(q)}`, [P.box().x1, q], C.warn, -6, -12, "right");
  }

  function update() {
    const [k, p, q] = par();
    $(".k-out").textContent = K.n(k); $(".p-out").textContent = K.n(p); $(".q-out").textContent = K.n(q);
    const den = K.paren(X, p).replace(/^\(|\)$/g, "");
    $(".eq").innerHTML = `${Y} = ${K.n(k)}/(${den})${q ? (q > 0 ? " + " : " − ") + K.n(Math.abs(q)) : ""}<br>정의역 {${X} | ${X} ≠ ${K.n(p)}}, 치역 {${Y} | ${Y} ≠ ${K.n(q)}}`;
    $(".n-a").textContent = `x = ${K.n(p)}, y = ${K.n(q)}`;
    $(".n-c").textContent = `(${K.n(p)}, ${K.n(q)})`;
    $(".n-s").textContent = k > 0 ? "1·3사분면 쪽" : "2·4사분면 쪽";
    draw();
  }
  [sk, sp, sq].forEach((s) => s.addEventListener("input", update));
  P.drag([{ get: () => { const [k, p, q] = par(); return [p + t, q + k / t]; }, set: (x) => {
    const [k, p, q] = par(), b = P.box(), s = Math.round((x - p) * 4) / 4;
    if (Math.abs(s) < 0.25) return;
    const ya = q + k / s, yb = q - k / s;
    if ([ya, yb].every((v) => v > b.y0 + 0.3 && v < b.y1 - 0.3) && p - s > b.x0 + 0.3 && p - s < b.x1 - 0.3) t = s;
  } }], update);
  update();
})();
