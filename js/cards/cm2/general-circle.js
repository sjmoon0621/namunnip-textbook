/* 카드: x² + y² + Ax + By + C = 0은 언제 원이 될까? — 계수 슬라이더와 완전제곱식으로 중심·반지름 읽기 */
(() => {
  const root = document.getElementById("card-cm2-general-circle");
  if (!root) return;
  const { C } = NM, K = NMCoord;
  const $ = (s) => root.querySelector(s);
  const P = K.plane($("canvas"), { cx: 0, cy: 0, span: 20 }, () => draw());
  const get = () => ["A", "B", "C"].map((i) => +$("." + i).value);
  const X = "<i>x</i>", Y = "<i>y</i>";

  function draw() {
    if (!P.size.w) return;
    P.grid();
    const [a, b, c] = get(), D = a * a + b * b - 4 * c, O = [-a / 2, -b / 2];
    if (D > 0) {
      P.circle(O[0], O[1], Math.sqrt(D) / 2, C.forest, 3);
      P.dot(O, C.forest, 4);
      P.text(`중심 (${K.n(O[0])}, ${K.n(O[1])})`, O, C.forest, 8, -12, "left");
    } else if (D === 0) {
      P.dot(O, C.warn, 6);
      P.text(`점 (${K.n(O[0])}, ${K.n(O[1])}) 하나`, O, C.warn, 10, -12, "left");
    } else {
      P.seg([O[0] - 0.4, O[1] - 0.4], [O[0] + 0.4, O[1] + 0.4], C.ink3, 1.5); P.seg([O[0] - 0.4, O[1] + 0.4], [O[0] + 0.4, O[1] - 0.4], C.ink3, 1.5);
      P.text("만족하는 점이 없습니다 (우변 < 0)", [P.view.cx, P.box().y1], C.warn, 0, 16, "center");
    }
  }

  function update() {
    const [a, b, c] = get(), D = a * a + b * b - 4 * c;
    $(".o-A").textContent = K.n(a); $(".o-B").textContent = K.n(b); $(".o-C").textContent = K.n(c);
    $(".n-c").textContent = `(${K.n(-a / 2)}, ${K.n(-b / 2)})`;
    $(".n-r2").textContent = K.n(D / 4);
    const g = $(".n-g");
    g.textContent = D > 0 ? `원, r = ${K.root(D, 4)}` : D === 0 ? "점 하나" : "없음";
    g.className = `n-g ${D > 0 ? "good" : "bad"}`;
    $(".eq").innerHTML = `${K.lin([[1, X + "<sup>2</sup>"], [1, Y + "<sup>2</sup>"], [a, X], [b, Y], [c, ""]])} = 0<br>${K.paren(X, -a / 2)}<sup>2</sup> + ${K.paren(Y, -b / 2)}<sup>2</sup> = ${K.n(a * a / 4)} + ${K.n(b * b / 4)} ${c > 0 ? "−" : "+"} ${K.n(Math.abs(c))} = ${K.n(D / 4)}`;
    draw();
  }
  root.querySelectorAll("input").forEach((i) => i.addEventListener("input", update));
  update();
})();
