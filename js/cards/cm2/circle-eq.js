/* 카드: 원 위의 점들은 어떤 식을 만족할까? — 중심·반지름·점 P를 끌어 (x − a)² + (y − b)²과 r² 비교 */
(() => {
  const root = document.getElementById("card-cm2-circle-eq");
  if (!root) return;
  const { C } = NM, K = NMCoord;
  const $ = (s) => root.querySelector(s);
  const O = [1, -1], T = [3, 2];
  let r = 3;
  const P = K.plane($("canvas"), { cx: 0, cy: 0, span: 15 }, () => draw());
  const X = "<i>x</i>", Y = "<i>y</i>";
  const val = () => (T[0] - O[0]) ** 2 + (T[1] - O[1]) ** 2;
  const where = () => { const d = val() - r * r; return Math.abs(d) < 1e-9 ? 0 : Math.sign(d); };

  function draw() {
    if (!P.size.w) return;
    P.grid();
    const w = where(), col = w === 0 ? C.forest : w < 0 ? C.amber : C.warn;
    P.circle(O[0], O[1], r, C.forest, 3);
    const Hd = [O[0] + r, O[1]];
    P.seg(O, Hd, C.ink2, 1.5);
    P.text(`r = ${K.n(r)}`, [O[0] + r / 2, O[1]], C.ink2, 0, 12, "center");
    P.seg(O, T, col, 2, [5, 4]);
    P.dot(O, C.forest, 4);
    P.knob(O, C.forest); P.knob(Hd, C.ink2); P.knob(T, col);
    P.text(`C(${K.n(O[0])}, ${K.n(O[1])})`, O, C.forest, -10, -14, "right");
    P.text(`P(${K.n(T[0])}, ${K.n(T[1])})`, T, col, 12, -12, "left");
  }

  function update() {
    const v = val(), w = where();
    $(".n-v").textContent = K.n(v); $(".n-r").textContent = K.n(r * r);
    const e = $(".n-w"); e.textContent = w === 0 ? "원 위" : w < 0 ? "원의 내부" : "원의 외부"; e.className = `n-w ${w === 0 ? "good" : ""}`;
    $(".eq").innerHTML = `원: ${K.paren(X, O[0])}<sup>2</sup> + ${K.paren(Y, O[1])}<sup>2</sup> = ${K.n(r * r)}<br>P를 넣으면 ${K.pn(T[0] - O[0])}<sup>2</sup> + ${K.pn(T[1] - O[1])}<sup>2</sup> = ${K.n(v)} ${w === 0 ? "=" : w < 0 ? "&lt;" : "&gt;"} ${K.n(r * r)}`;
    draw();
  }
  P.drag([
    { get: () => O, set: (x, y) => { O[0] = Math.round(x); O[1] = Math.round(y); } },
    { get: () => [O[0] + r, O[1]], set: (x, y) => { r = NM.clamp(Math.round(Math.hypot(x - O[0], y - O[1]) * 2) / 2, 0.5, 7); } },
    { get: () => T, set: (x, y) => { T[0] = Math.round(x); T[1] = Math.round(y); } },
  ], update);
  update();
})();
