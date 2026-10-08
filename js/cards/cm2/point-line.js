/* 카드: 점에서 직선까지 가장 짧은 길은 어디일까? — 직선 위의 점 Q를 끌어 최소 PQ = 수선 PH = 공식 값 확인 */
(() => {
  const root = document.getElementById("card-cm2-point-line");
  if (!root) return;
  const { C } = NM, K = NMCoord;
  const $ = (s) => root.querySelector(s);
  const Pt = [5, 4], Q = [0, 3];
  const P = K.plane($("canvas"), { cx: 1.5, cy: 1.5, span: 13 }, () => draw());
  const abc = () => ["a", "b", "c"].map((i) => +$("." + i).value);
  const X = "<i>x</i>", Y = "<i>y</i>";
  /* 점 p를 직선 위로 정사영 */
  const proj = (p) => { const [a, b, c] = abc(), t = (a * p[0] + b * p[1] + c) / (a * a + b * b); return [p[0] - a * t, p[1] - b * t]; };
  const ok = () => { const [a, b] = abc(); return a || b; };

  function draw() {
    if (!P.size.w) return;
    P.grid();
    const [a, b, c] = abc();
    if (!ok()) { P.knob(Pt, C.warn); P.text("a, b가 모두 0이면 직선이 아닙니다", [P.view.cx, P.view.cy], C.warn, 0, 0, "center"); return; }
    P.line(a, b, c, C.forest, 3);
    const H = proj(Pt);
    P.seg(Pt, Q, C.ink3, 1.5, [5, 4]);
    P.seg(Pt, H, C.warn, 3);
    P.right(H, [-b, a], [Pt[0] - H[0], Pt[1] - H[1]], C.warn);
    P.dot(H, C.warn, 4);
    P.knob(Q, C.ink2); P.knob(Pt, C.warn);
    P.text(`P(${K.n(Pt[0])}, ${K.n(Pt[1])})`, Pt, C.warn, 10, -12, "left");
    P.text("H", H, C.warn, -10, 12, "right");
    P.text("Q", Q, C.ink2, 10, 12, "left");
  }

  function update() {
    const [a, b, c] = abc();
    $(".o-a").textContent = K.n(a); $(".o-b").textContent = K.n(b); $(".o-c").textContent = K.n(c);
    if (!ok()) {
      $(".eq").textContent = "a, b가 모두 0이면 직선이 아닙니다.";
      [".n-pq", ".n-ph", ".n-f"].forEach((s) => { $(s).textContent = "—"; }); draw(); return;
    }
    const q = proj(Q); Q[0] = q[0]; Q[1] = q[1];
    const H = proj(Pt), v = a * Pt[0] + b * Pt[1] + c, k = a * a + b * b;
    $(".n-pq").textContent = K.n(Math.hypot(Pt[0] - Q[0], Pt[1] - Q[1]));
    $(".n-ph").textContent = K.n(Math.hypot(Pt[0] - H[0], Pt[1] - H[1]));
    const ex = K.over(Math.abs(v), k), dec = K.n(Math.abs(v) / Math.sqrt(k));
    $(".n-f").textContent = ex === dec ? ex : `${ex} ≈ ${dec}`;
    $(".eq").innerHTML = `직선 ${K.lin([[a, X], [b, Y], [c, ""]])} = 0<br>|${K.pn(a)}·${K.pn(Pt[0])} + ${K.pn(b)}·${K.pn(Pt[1])} + ${K.pn(c)}| / √(${K.pn(a)}<sup>2</sup> + ${K.pn(b)}<sup>2</sup>) = ${Math.abs(v)}/√${k} = ${ex}`;
    draw();
  }
  root.querySelectorAll("input").forEach((i) => i.addEventListener("input", update));
  P.drag([
    { get: () => Pt, set: (x, y) => { Pt[0] = Math.round(x); Pt[1] = Math.round(y); } },
    { get: () => Q, set: (x, y) => { if (ok()) { const q = proj([x, y]); Q[0] = q[0]; Q[1] = q[1]; } }, off: () => !ok() },
  ], update);
  update();
})();
