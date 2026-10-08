/* 카드: 원 위의 한 점에서 그은 접선의 방정식은? — 접점 P를 끌어 x₁x + y₁y = r², 기울기 m이면 y = mx ± r√(m² + 1) */
(() => {
  const root = document.getElementById("card-cm2-tangent");
  if (!root) return;
  const { C } = NM, K = NMCoord;
  const $ = (s) => root.querySelector(s), modes = [...root.querySelectorAll(".mode .chip")];
  let mode = 1, th = Math.atan2(4, 3);
  const P = K.plane($("canvas"), { cx: 0, cy: 0, span: 15 }, () => draw());
  const X = "<i>x</i>", Y = "<i>y</i>";
  const rr = () => +$(".r").value, mm = () => +$(".m").value;
  /* 접점: 정수 좌표 점 가까이면 그 점으로 */
  function pt() {
    const r = rr(), x = r * Math.cos(th), y = r * Math.sin(th), a = Math.round(x), b = Math.round(y);
    return a * a + b * b === r * r && Math.hypot(a - x, b - y) < 0.35 ? [a, b] : [x, y];
  }

  function draw() {
    if (!P.size.w) return;
    P.grid();
    const r = rr(), O = [0, 0];
    P.circle(0, 0, r, C.forest, 3);
    P.dot(O, C.forest, 3.5);
    if (mode === 1) {
      const p = pt();
      P.line(p[0], p[1], -r * r, C.warn, 2.5);
      P.seg(O, p, C.ink2, 2); P.right(p, [-p[1], p[0]], [-p[0], -p[1]], C.ink2);
      P.knob(p, C.warn);
      P.text(`P(${K.n(p[0])}, ${K.n(p[1])})`, p, C.warn, p[0] >= 0 ? 12 : -12, p[1] >= 0 ? -14 : 14, p[0] >= 0 ? "left" : "right");
    } else {
      const m = mm(), s = Math.sqrt(1 + m * m);
      for (const t of [1, -1]) {
        const T = [-t * r * m / s, t * r / s];
        P.line(m, -1, t * r * s, C.warn, 2.5);
        P.seg(O, T, C.ink2, 2); P.right(T, [1, m], [-T[0], -T[1]], C.ink2);
        P.dot(T, C.warn, 5);
      }
    }
  }

  function update() {
    const r = rr();
    $(".o-r").textContent = r; $(".o-m").textContent = K.n(mm());
    $(".m-row").hidden = mode === 1;
    $(".f-note").hidden = mode === 2;
    if (mode === 1) {
      const p = pt(), int = Number.isInteger(p[0]) && Number.isInteger(p[1]);
      const sl = (a, b) => (Math.abs(b) < 1e-9 ? "없음" : int ? K.frac(a, b) : K.n(a / b));
      $(".d1").textContent = "반지름 OP 기울기"; $(".n1").textContent = sl(p[1], p[0]);
      $(".d2").textContent = "접선 기울기"; $(".n2").textContent = sl(-p[0], p[1]);
      $(".d3").textContent = "두 기울기의 곱";
      $(".n3").textContent = Math.abs(p[0]) < 1e-9 || Math.abs(p[1]) < 1e-9 ? "곱할 수 없음" : "−1";
      $(".eq").innerHTML = `접선: ${K.lin([[p[0], X], [p[1], Y]])} = ${r * r}`;
    } else {
      const m = mm(), q = Math.round(m * 2), ex = K.root(r * r * (4 + q * q), 4);
      $(".d1").textContent = "기울기 m"; $(".n1").textContent = K.n(m);
      $(".d2").textContent = "y절편 ±r√(m² + 1)"; $(".n2").textContent = `±${ex}`;
      $(".d3").textContent = "근삿값"; $(".n3").textContent = `±${K.n(r * Math.sqrt(1 + m * m))}`;
      $(".eq").innerHTML = `접선: <i>y</i> = ${K.lin([[m, X]])} ± ${ex}`;
    }
    draw();
  }
  modes.forEach((b) => b.addEventListener("click", () => {
    mode = +b.dataset.mode; modes.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update();
  }));
  root.querySelectorAll("input").forEach((i) => i.addEventListener("input", update));
  P.drag([{ get: () => pt(), set: (x, y) => { th = Math.atan2(y, x); }, off: () => mode !== 1 }], update);
  update();
})();
