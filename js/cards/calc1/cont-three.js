/* 카드: 그래프가 '이어져 있다'는 것을 극한으로 어떻게 말할까? — x = 2에서 연속의 세 조건을 차례로 확인 */
(() => {
  const root = document.getElementById("card-calc1-cont-three");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sk = $(".sk"), sc = $(".sc"), cd = $(".cd");
  const st = () => {
    const k = +sk.value, c = +sc.value, def = cd.checked, R = k - 2;
    const c1 = def, c2 = Math.abs(R - 4) < 1e-9, c3 = c1 && c2 && Math.abs(c - 4) < 1e-9;
    return { k, c, def, R, c1, c2, c3 };
  };
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = st(), col = s.c3 ? C.forest : K.BLUE;
    const g = K.frame(ctx, w, h, { xr: [0, 4], yr: [-1, 7], xs: 1, ys: 1 });
    K.curve(ctx, g, (x) => x * x, col, { from: 0, to: 2 - 1e-9 });
    K.curve(ctx, g, (x) => s.k - x, col, { from: 2 + 1e-9, to: 4 });
    if (!s.c3) {
      K.dot(ctx, g, 2, 4, col, true);
      if (!s.c2) K.dot(ctx, g, 2, s.R, col, true);
    }
    if (s.def) K.dot(ctx, g, 2, s.c, s.c3 ? C.forest : C.warn, false, 5);
    K.guide(ctx, g, 2, Math.max(4, s.R, s.def ? s.c : 0), C.ink3, "x");
    K.tag(ctx, g, "좌극한 4", g.X(2) - 10, g.Y(4) - 12, col, "right");
    if (!s.c2) K.tag(ctx, g, `우극한 ${n(s.R)}`, g.X(2) + 10, g.Y(s.R) + (s.R > 4 ? -12 : 12), col, "left");
    if (s.def && !s.c3) K.tag(ctx, g, `f(2) = ${n(s.c)}`, g.X(2) + 10, g.Y(s.c) + (s.c >= s.R ? -12 : 12), C.warn, "left");
  }

  function mark(sel, ok, skip) {
    const li = $(sel);
    li.className = skip ? "skip" : ok ? "yes" : "no";
    li.querySelector("b").textContent = skip ? "—" : ok ? "○" : "×";
  }

  function update() {
    const s = st();
    $(".k-out").textContent = n(s.k, 1); $(".c-out").textContent = s.def ? n(s.c, 1) : "없음";
    sc.disabled = !s.def;
    mark(".c1", s.c1); mark(".c2", s.c2); mark(".c3", s.c3, !(s.c1 && s.c2));
    $(".n-lr").textContent = `4 / ${n(s.R, 1)}`;
    $(".n-f").textContent = s.def ? n(s.c, 1) : "정의 안 됨";
    const v = $(".n-v"); v.textContent = s.c3 ? "연속" : "불연속"; v.className = `n-v ${s.c3 ? "good" : "bad"}`;
    $(".st").textContent = s.c3 ? "근처의 값들이 모이는 곳(4)에 점 f(2) = 4가 찍혀 있습니다."
      : !s.c2 ? "좌극한과 우극한이 달라 그래프가 끊어집니다. 이 상태로는 f(2)를 어떻게 정해도 연속이 될 수 없습니다."
        : !s.c1 ? "극한값 4는 있지만 점이 비어 있습니다. f(2) = 4로 정의하면 연속이 됩니다."
          : "극한값 4와 함숫값이 다릅니다. 점이 제자리에서 떨어져 있습니다.";
    draw();
  }
  [sk, sc, cd].forEach((el) => el.addEventListener("input", update));
  update();
})();
