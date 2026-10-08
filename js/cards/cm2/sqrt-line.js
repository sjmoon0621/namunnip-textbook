/* 카드: 무리함수의 그래프와 직선은 몇 번 만날까? — y = √(x + 2)와 y = x + k에서 k를 바꾸며 교점 수를 센다
   x + k = √(x + 2)에서 u = √(x + 2) ≥ 0으로 놓으면 u² − u + (k − 2) = 0, 교점은 이 식의 0 이상인 근 u마다 하나 */
(() => {
  const root = document.getElementById("card-cm2-sqrt-line");
  if (!root) return;
  const { C } = NM, K = NMCoord;
  const $ = (s) => root.querySelector(s);
  const sk = $(".k");
  const P = K.plane($("canvas"), { cx: 0.5, cy: 1, span: 10 }, () => draw());
  const X = "<i>x</i>", Y = "<i>y</i>";

  function meets(k) {
    const D = 1 - 4 * (k - 2);
    if (D < -1e-12) return [];
    const s = Math.sqrt(Math.max(D, 0)), us = Math.abs(s) < 1e-12 ? [0.5] : [(1 + s) / 2, (1 - s) / 2];
    return us.filter((u) => u >= -1e-12).map((u) => [u * u - 2, u]).sort((a, b) => a[0] - b[0]);
  }

  function draw() {
    if (!P.size.w) return;
    const k = +sk.value, pts = meets(k);
    P.grid();
    P.curve((x) => (x < -2 ? NaN : Math.sqrt(x + 2)), C.forest, 2.8);
    P.dot([-2, 0], C.forest, 4);
    P.line(1, -1, k, C.amber, 2.2);
    pts.forEach((p) => P.dot(p, C.warn, 6));
    pts.forEach((p, i) => P.text(`(${K.n(p[0])}, ${K.n(p[1])})`, p, C.warn, i ? 10 : -10, i ? 14 : -14, i ? "left" : "right"));
    P.text("y = √(x + 2)", [3.5, Math.sqrt(5.5)], C.forest, 0, 16, "center");
  }

  function update() {
    const k = +sk.value, pts = meets(k);
    $(".k-out").textContent = K.n(k);
    $(".eq").innerHTML = `${Y} = ${X}${k ? (k > 0 ? " + " : " − ") + K.n(Math.abs(k)) : ""}, ${Y} = √(${X} + 2)<br><i>u</i> = √(${X} + 2)로 놓으면 <i>u</i><sup>2</sup> − <i>u</i> ${k - 2 < 0 ? "−" : "+"} ${K.n(Math.abs(k - 2))} = 0 (<i>u</i> ≥ 0)`;
    const n = $(".n-n"); n.textContent = `${pts.length}개`; n.className = pts.length === 2 ? "good" : pts.length ? "" : "bad";
    $(".n-d").textContent = K.n(9 - 4 * k);
    $(".n-p").textContent = pts.length ? pts.map((p) => `(${K.n(p[0])}, ${K.n(p[1])})`).join(" ") : "없음";
    draw();
  }
  sk.addEventListener("input", update);
  update();
})();
