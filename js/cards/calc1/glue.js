/* 카드: 두 식을 이어 붙이면 언제 매끄럽게 이어질까? — x² (x < 1)와 ax + b (x ≥ 1)의 연속·미분가능 조건 */
(() => {
  const root = document.getElementById("card-calc1-glue");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sa = $(".sa"), sb = $(".sb");
  const { ctx, size } = fit($("canvas"), () => draw());
  const st = () => { const a = +sa.value, b = +sb.value, f1 = a + b, cont = Math.abs(f1 - 1) < 1e-9; return { a, b, f1, cont, diff: cont && Math.abs(a - 2) < 1e-9 }; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = st();
    const g = K.frame(ctx, w, h, { xr: [-1.5, 3], yr: [-2, 5], xs: 1, ys: 1 });
    K.curve(ctx, g, (x) => x * x, C.forest, { from: -1.5, to: 1 });
    K.curve(ctx, g, (x) => s.a * x + s.b, s.diff ? C.forest : K.BLUE, { from: 1, to: 3 });
    K.curve(ctx, g, (x) => 1 + 2 * (x - 1), C.ink3, { from: 0.3, to: 1.7, width: 1.4, dash: [5, 4] });
    K.dot(ctx, g, 1, 1, C.forest, !s.cont);
    K.dot(ctx, g, 1, s.f1, s.diff ? C.forest : K.BLUE);
    K.tag(ctx, g, "왼쪽 기울기 2", g.X(0.3) - 4, g.Y(1 + 2 * (0.3 - 1)) + 12, C.ink3, "right");
    K.tag(ctx, g, s.diff ? "매끄럽게 이어짐" : s.cont ? "이어졌지만 꺾임" : "끊어짐", g.X(1) + 10, g.Y(s.f1) - 16, s.diff ? C.forest : C.warn);
  }

  function update() {
    const s = st();
    $(".a-out").textContent = n(s.a, 1); $(".b-out").textContent = n(s.b, 1);
    const c = $(".n-c"); c.textContent = `1 / ${n(s.f1, 1)}`; c.className = `n-c ${s.cont ? "good" : "bad"}`;
    const l = $(".n-l"); l.textContent = s.cont ? "2" : "없음 (발산)"; l.className = `n-l ${s.cont ? "" : "bad"}`;
    const r = $(".n-r"); r.textContent = n(s.a, 1); r.className = `n-r ${s.diff ? "good" : ""}`;
    $(".st").innerHTML = s.diff
      ? "연속이고 좌우 미분계수가 모두 2입니다. <i>x</i> = 1에서 미분가능하고 f′(1) = 2입니다."
      : s.cont ? `연속이지만 좌우 미분계수가 2와 ${n(s.a, 1)}로 다릅니다. 미분가능하지 않습니다.`
        : "연속이 아니므로 미분가능하지 않습니다. 끊어진 쪽의 평균변화율은 분자가 0으로 가지 않아 발산합니다.";
    draw();
  }
  [sa, sb].forEach((el) => el.addEventListener("input", update));
  update();
})();
