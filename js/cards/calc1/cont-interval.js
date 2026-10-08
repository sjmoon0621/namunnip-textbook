/* 카드: 구간의 끝점까지 연속이라는 것은 무슨 뜻일까? — 구간의 끝점 포함 여부에 따라 달라지는 구간에서의 연속 */
(() => {
  const root = document.getElementById("card-calc1-cont-interval");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sa = $(".sa"), sb = $(".sb"), gl = $(".go-left"), gr = $(".go-right");
  /* 각 함수가 구간 [a, b] (끝 포함 여부 L, R)에서 연속이 아닌 까닭을 돌려준다. 연속이면 null */
  const FN = {
    jump: {
      f: (x) => (x < 2 ? x : x - 1), yr: [-1.5, 4],
      fail: (a, b, L, R) => (a < 2 && 2 < b ? "구간 안의 x = 2에서 좌극한 2와 우극한 1이 달라 불연속입니다."
        : b === 2 && R ? "오른쪽 끝 2에서 좌극한 2와 f(2) = 1이 다릅니다." : null),
      ok: (a, b, L) => (a === 2 && L ? "왼쪽 끝 2에서 우극한 1 = f(2)이므로 끝점에서도 연속입니다." : ""),
    },
    recip: {
      f: (x) => 1 / (x - 1), yr: [-4, 4],
      fail: (a, b, L, R) => (a < 1 && 1 < b ? "구간 안의 x = 1에서 함숫값이 정의되지 않습니다."
        : (a === 1 && L) || (b === 1 && R) ? "끝점 x = 1에서 함숫값이 정의되지 않습니다." : null),
      ok: () => "",
    },
    sqrt: {
      f: (x) => (x < 0 ? NaN : Math.sqrt(x)), yr: [-0.5, 2.5],
      fail: (a) => (a < 0 ? "x < 0인 점이 구간에 들어 있어 함숫값이 정의되지 않습니다." : null),
      ok: (a, b, L) => (a === 0 && L ? "왼쪽 끝 0에서 우극한 0 = f(0)이므로 끝점에서도 연속입니다." : ""),
    },
  };
  let k = "jump";
  const { ctx, size } = fit($("canvas"), () => draw());
  const st = () => {
    const a = +sa.value, b = +sb.value, L = gl.getAttribute("aria-pressed") === "true", R = gr.getAttribute("aria-pressed") === "true";
    const why = FN[k].fail(a, b, L, R);
    return { a, b, L, R, why };
  };

  function bracket(ctx, g, x, closed, left, color) {
    const X = g.X(x), Y = g.Y(0) + 0, s = 9, d = left ? 1 : -1;
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2.4; ctx.beginPath();
    if (closed) { ctx.moveTo(X + d * 5, Y - s); ctx.lineTo(X, Y - s); ctx.lineTo(X, Y + s); ctx.lineTo(X + d * 5, Y + s); }
    else { ctx.moveTo(X + d * 5, Y - s); ctx.quadraticCurveTo(X - d * 2, Y, X + d * 5, Y + s); }
    ctx.stroke(); ctx.restore();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = st(), F = FN[k], col = s.why ? C.warn : C.forest;
    const g = K.frame(ctx, w, h, { xr: [-1.5, 4.5], yr: F.yr, xs: 1, ys: 1 });
    ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = 0.09; ctx.fillRect(g.X(s.a), g.y0, g.X(s.b) - g.X(s.a), g.h); ctx.restore();
    if (k === "jump") {
      K.curve(ctx, g, F.f, C.ink3, { to: 2 - 1e-9, width: 1.6 });
      K.curve(ctx, g, F.f, C.ink3, { from: 2, width: 1.6 });
      K.curve(ctx, g, F.f, col, { from: s.a, to: Math.min(s.b, 2 - 1e-9) });
      if (s.b >= 2) K.curve(ctx, g, F.f, col, { from: Math.max(s.a, 2), to: s.b });
      K.dot(ctx, g, 2, 2, C.ink2, true); K.dot(ctx, g, 2, 1, C.ink2, false);
    } else if (k === "recip") {
      K.curve(ctx, g, F.f, C.ink3, { to: 1 - 1e-6, width: 1.6 });
      K.curve(ctx, g, F.f, C.ink3, { from: 1 + 1e-6, width: 1.6 });
      if (s.a < 1) K.curve(ctx, g, F.f, col, { from: s.a, to: Math.min(s.b, 1 - 1e-6) });
      if (s.b > 1) K.curve(ctx, g, F.f, col, { from: Math.max(s.a, 1 + 1e-6), to: s.b });
    } else {
      K.curve(ctx, g, F.f, C.ink3, { from: 0, width: 1.6 });
      K.curve(ctx, g, F.f, col, { from: Math.max(0, s.a), to: s.b });
      K.dot(ctx, g, 0, 0, C.ink2, false, 3.5);
    }
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(g.X(s.a), g.Y(0)); ctx.lineTo(g.X(s.b), g.Y(0)); ctx.stroke(); ctx.restore();
    bracket(ctx, g, s.a, s.L, true, col);
    bracket(ctx, g, s.b, s.R, false, col);
  }

  function update() {
    if (+sb.value <= +sa.value) sb.value = +sa.value + 0.5;
    const s = st();
    $(".a-out").textContent = n(s.a, 1); $(".b-out").textContent = n(s.b, 1);
    $(".n-i").textContent = `${s.L ? "[" : "("}${n(s.a, 1)}, ${n(s.b, 1)}${s.R ? "]" : ")"}`;
    $(".n-k").textContent = s.L && s.R ? "닫힌구간" : !s.L && !s.R ? "열린구간" : "반닫힌 구간";
    const v = $(".n-v"); v.textContent = s.why ? "연속 아님" : "연속"; v.className = `n-v ${s.why ? "bad" : "good"}`;
    $(".st").textContent = s.why || FN[k].ok(s.a, s.b, s.L, s.R) || "구간의 모든 점에서 연속입니다.";
    draw();
  }
  K.chips(root, ".fn .chip", (b) => { k = b.dataset.k; update(); });
  [gl, gr].forEach((b) => b.addEventListener("click", () => { b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")); update(); }));
  sa.addEventListener("input", () => { if (+sb.value <= +sa.value) sb.value = Math.min(4, +sa.value + 0.5); update(); });
  sb.addEventListener("input", () => { if (+sb.value <= +sa.value) sa.value = Math.max(-1, +sb.value - 0.5); update(); });
  update();
})();
