/* 카드: 꼭짓점의 좌표만으로 삼각형의 넓이를 구할 수 있을까? — 높이 = A에서 직선 BC까지의 거리 */
(() => {
  const root = document.getElementById("card-cm2-tri-area");
  if (!root) return;
  const { C } = NM, K = NMCoord;
  const $ = (s) => root.querySelector(s);
  const A = [-1, 4], B = [-3, -2], Cc = [4, 0];
  const P = K.plane($("canvas"), { cx: 1, cy: 2, span: 14 }, () => draw());
  const X = "<i>x</i>", Y = "<i>y</i>";
  /* 직선 BC: ax + by + c = 0 (정수 계수, 최대공약수로 나눔) */
  function lineBC() {
    let a = Cc[1] - B[1], b = B[0] - Cc[0], c = -(a * B[0] + b * B[1]);
    const g = K.gcd(K.gcd(a, b), c) || 1, s = a < 0 || (a === 0 && b < 0) ? -1 : 1;
    return [a / g * s, b / g * s, c / g * s];
  }

  function draw() {
    if (!P.size.w) return;
    P.grid();
    P.path([A, B, Cc], C.forest, 2.5, null, true, C.sprout, 0.4);
    if (B[0] !== Cc[0] || B[1] !== Cc[1]) {
      const [a, b, c] = lineBC();
      P.line(a, b, c, C.ink3, 1.2, [6, 4]);
      const t = (a * A[0] + b * A[1] + c) / (a * a + b * b), H = [A[0] - a * t, A[1] - b * t];
      if (Math.abs(t) > 1e-9) {
        P.seg(A, H, C.warn, 2.5); P.right(H, [Cc[0] - B[0], Cc[1] - B[1]], [A[0] - H[0], A[1] - H[1]], C.warn);
        P.text("h", [(A[0] + H[0]) / 2, (A[1] + H[1]) / 2], C.warn, 8, 0, "left");
      }
    }
    const g = [(A[0] + B[0] + Cc[0]) / 3, (A[1] + B[1] + Cc[1]) / 3];
    for (const [p, name] of [[A, "A"], [B, "B"], [Cc, "C"]]) {
      P.knob(p, C.forest);
      const dx = p[0] - g[0], dy = p[1] - g[1], L = Math.hypot(dx, dy) || 1;
      P.text(`${name}(${K.n(p[0])}, ${K.n(p[1])})`, p, C.forest, dx / L * 16, -dy / L * 16, dx >= 0 ? "left" : "right");
    }
  }

  function update() {
    const k = (Cc[0] - B[0]) ** 2 + (Cc[1] - B[1]) ** 2;
    if (!k) {
      $(".eq").textContent = "B와 C가 겹쳐서 밑변이 없습니다.";
      [".n-bc", ".n-h", ".n-s"].forEach((s) => { $(s).textContent = "—"; }); draw(); return;
    }
    const [a, b, c] = lineBC(), v = a * A[0] + b * A[1] + c, kk = a * a + b * b;
    const cross = (B[0] - A[0]) * (Cc[1] - A[1]) - (Cc[0] - A[0]) * (B[1] - A[1]);
    $(".n-bc").textContent = K.surd(k); $(".n-h").textContent = K.over(Math.abs(v), kk);
    $(".n-s").textContent = K.frac(Math.abs(cross), 2);
    $(".eq").innerHTML = `직선 BC: ${K.lin([[a, X], [b, Y], [c, ""]])} = 0<br>h = |${K.pn(a)}·${K.pn(A[0])} + ${K.pn(b)}·${K.pn(A[1])} + ${K.pn(c)}| / √${kk} = ${K.over(Math.abs(v), kk)}<br>넓이 = (1/2) × ${K.surd(k)} × ${K.over(Math.abs(v), kk)} = ${K.frac(Math.abs(cross), 2)}`;
    draw();
  }
  const grab = (p) => ({ get: () => p, set: (x, y) => { p[0] = Math.round(x); p[1] = Math.round(y); } });
  P.drag([grab(A), grab(B), grab(Cc)], update);
  update();
})();
