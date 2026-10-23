/* 미적분Ⅰ 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const graph = (svg, box, opt) => {
    const F = Q.frame(...box, 30, 500, 10, (opt && opt.H) || 270);
    const bg = el("g", {}, svg), g = el("g", {}, svg);
    Q.axes(bg, F, (opt && opt.axes) || { step: 1 });
    return { F, bg, g };
  };

  // 속도와 거리: v(t) = 4 − 2t, [0, t] 넓이
  Q.def("calc1-vdist", (fig, svg) => {
    const v = (t) => 4 - 2 * t, X = (t) => 4 * t - t * t;
    const { F, bg, g } = graph(svg, [-0.3, 4.3, -5, 5], { H: 260 });
    const read = fig.querySelector(".q-read");
    Q.plot(bg, F, v, "b", 0, 4.2);
    txt(bg, F.X1, F.y(0) - 6, "t", "i", "end");
    Q.bind(fig, ({ t }) => {
      clear(g);
      const a = Math.min(t, 2);
      el("path", { d: `M${F.x(0)} ${F.y(0)} L${F.x(0)} ${F.y(4)} L${F.x(a)} ${F.y(v(a))} L${F.x(a)} ${F.y(0)} Z`, class: "la" }, g);
      if (t > 2) el("path", { d: `M${F.x(2)} ${F.y(0)} L${F.x(t)} ${F.y(v(t))} L${F.x(t)} ${F.y(0)} Z`, class: "ld" }, g);
      const dist = t <= 2 ? X(t) : 4 + (4 - X(t));
      read.textContent = `0초부터 ${num(t)}초까지: 위치의 변화 ∫v dt = ${num(X(t), 3)}, 움직인 거리 ∫|v| dt = ${num(dist, 3)}`;
    });
  });

  // 두 곡선 사이의 넓이: y = x² 와 y = x + k
  Q.def("calc1-between", (fig, svg) => {
    const { F, bg, g } = graph(svg, [-2.6, 3, -0.8, 7]);
    const read = fig.querySelector(".q-read");
    Q.plot(bg, F, (x) => (x * x <= 7 ? x * x : NaN), "b");
    Q.bind(fig, ({ k }) => {
      clear(g);
      const D = 1 + 4 * k, a = (1 - Math.sqrt(D)) / 2, b = (1 + Math.sqrt(D)) / 2;
      let d = `M${F.x(a)} ${F.y(a * a)}`;
      for (let i = 0; i <= 60; i++) { const t = a + (b - a) * i / 60; d += `L${F.x(t)} ${F.y(t + k)}`; }
      for (let i = 60; i >= 0; i--) { const t = a + (b - a) * i / 60; d += `L${F.x(t)} ${F.y(t * t)}`; }
      el("path", { d: d + "Z", class: "la" }, g);
      Q.plot(g, F, (x) => (x + k <= 7 ? x + k : NaN), "c");
      Q.dot(g, F.x(a), F.y(a * a), "fd", 4); Q.dot(g, F.x(b), F.y(b * b), "fd", 4);
      const S = (b - a) ** 3 / 6;
      read.textContent = `교점 x = ${num(a, 3)}, ${num(b, 3)}, 넓이 ∫(x + ${num(k)} − x²)dx = ${num(S, 4)}`;
    });
  });

  // 넓이 함수: f(t) = t² + 0.5, S(x) = ∫₀ˣ f, 띠 [x, x + h]
  Q.def("calc1-areafn", (fig, svg) => {
    const f = (t) => t * t / 2 + 0.5, S = (x) => x ** 3 / 6 + 0.5 * x;
    const { F, bg, g } = graph(svg, [-0.2, 2.7, -0.2, 3.2], { H: 270, axes: { step: 0.5, lstep: 1 } });
    const read = fig.querySelector(".q-read");
    Q.plot(bg, F, f, "b", -0.2, 2.6);
    Q.bind(fig, ({ x, h }) => {
      clear(g);
      let d = `M${F.x(0)} ${F.y(0)}`;
      for (let i = 0; i <= 60; i++) { const t = x * i / 60; d += `L${F.x(t)} ${F.y(f(t))}`; }
      el("path", { d: d + `L${F.x(x)} ${F.y(0)}Z`, class: "lb" }, g);
      let d2 = `M${F.x(x)} ${F.y(0)}`;
      for (let i = 0; i <= 20; i++) { const t = x + h * i / 20; d2 += `L${F.x(t)} ${F.y(f(t))}`; }
      el("path", { d: d2 + `L${F.x(x + h)} ${F.y(0)}Z`, class: "lc" }, g);
      const rate = (S(x + h) - S(x)) / h;
      read.textContent = `S(x) = ${num(S(x), 3)}, 띠의 넓이 ${num(S(x + h) - S(x), 3)}, 띠 ÷ h = ${num(rate, 3)}, f(x) = ${num(f(x), 3)}`;
    });
  });

  // 정적분: y = x² on [0, 1], 오른쪽 끝 직사각형 n개
  Q.def("calc1-riemann", (fig, svg) => {
    const F = Q.frame(-0.1, 1.15, -0.05, 1.15, 50, 500, 10, 260);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      let S = 0;
      for (let k = 1; k <= n; k++) {
        const x0 = (k - 1) / n, h = (k / n) ** 2; S += h / n;
        el("rect", { x: F.x(x0), y: F.y(h), width: F.x(1 / n) - F.x(0), height: F.y(0) - F.y(h), class: "lb" }, g);
        if (n <= 30) el("rect", { x: F.x(x0), y: F.y(h), width: F.x(1 / n) - F.x(0), height: F.y(0) - F.y(h), class: "gd" }, g);
      }
      Q.line(g, F.x(-0.1), F.y(0), F.x(1.15), F.y(0), "ax"); Q.line(g, F.x(0), F.y(-0.05), F.x(0), F.y(1.15), "ax");
      Q.plot(g, F, (x) => x * x, "d", 0, 1.07);
      txt(g, F.x(1), F.y(0) + 16, "1", "s", "middle"); txt(g, F.x(0) - 6, F.y(1) + 4, "1", "s", "end");
      read.textContent = `n = ${n}: 넓이의 합 S = (n+1)(2n+1)/(6n²) = ${S.toFixed(4)} (참값 1/3 ≈ 0.3333)`;
    });
  });

  // x^n의 부정적분: 미분과 적분의 왕복
  Q.def("calc1-powint", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const sup = (k) => String(k).split("").map((d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]).join("");
    Q.bind(fig, ({ n }) => {
      clear(g);
      el("rect", { x: 30, y: 80, width: 150, height: 60, class: "lb" }, g); txt(g, 105, 116, n ? `x${n === 1 ? "" : sup(n)}` : "1", "", "middle");
      el("rect", { x: 340, y: 80, width: 150, height: 60, class: "lc" }, g); txt(g, 415, 116, `x${n + 1 === 1 ? "" : sup(n + 1)} / ${n + 1}`, "", "middle");
      Q.arrow(g, 182, 98, 338, 98, "c", "fc"); Q.arrow(g, 338, 124, 182, 124, "b", "fb");
      txt(g, 260, 88, `적분: 지수 ${n} → ${n + 1}, ${n + 1}로 나눈다`, "s tc", "middle");
      txt(g, 260, 146, `미분: ${n + 1}을 내려 곱하고 지수를 하나 줄인다`, "s tb", "middle");
      txt(g, 260, 190, `(x${sup(n + 1)} / ${n + 1})′ = ${n + 1}x${n ? sup(n) : "⁰"} / ${n + 1} = x${n ? sup(n) : "⁰"}`, "s", "middle");
      read.textContent = `∫ x^${n} dx = x^${n + 1}/${n + 1} + C`;
    });
  });

  // 부정적분: y = x² + C 가족, x = 1에서 y를 지나는 것 하나
  Q.def("calc1-family", (fig, svg) => {
    const { F, bg, g } = graph(svg, [-3, 3, -5, 9]);
    const read = fig.querySelector(".q-read");
    for (let C = -4; C <= 6; C += 2) Q.plot(bg, F, (x) => x * x + C, "gd");
    Q.bind(fig, ({ y }) => {
      clear(g);
      const C = y - 1;
      Q.plot(g, F, (x) => x * x + C, "b");
      Q.dot(g, F.x(1), F.y(y), "fd", 5);
      Q.plot(g, F, (x) => 2 * (x - 1) + y, "d dsh", 0.3, 1.7);
      read.textContent = `점 (1, ${num(y)})을 지나는 것은 y = x² + (${num(C)}) 하나, 그 점의 기울기는 2`;
    });
  });

  // 속도: x(t) = t³ − 6t² + 9t, 수직선 위 점과 위치 그래프
  Q.def("calc1-motion", (fig, svg) => {
    const x = (t) => t ** 3 - 6 * t * t + 9 * t, v = (t) => 3 * t * t - 12 * t + 9;
    const L = Q.frame(-1, 13, 0, 1, 40, 500, 0, 1), F = Q.frame(0, 4.6, -1, 13, 40, 500, 80, 240);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.line(bg, 30, 40, 510, 40, "ax");
    for (let k = 0; k <= 12; k += 2) { Q.line(bg, L.x(k), 36, L.x(k), 44, "ax"); txt(bg, L.x(k), 60, String(k), "s", "middle"); }
    Q.line(bg, F.X0, F.y(0), F.X1, F.y(0), "ax"); Q.line(bg, F.X0, F.Y0, F.X0, F.Y1, "ax");
    [1, 2, 3, 4].forEach((t) => txt(bg, F.x(t), F.y(0) + 14, `${t}초`, "s", "middle"));
    Q.plot(bg, F, (t) => (x(t) <= 13 ? x(t) : NaN), "b", 0, 4.6);
    Q.bind(fig, ({ t }) => {
      clear(g);
      const p = x(t), s = v(t);
      Q.dot(g, L.x(p), 40, "fd", 7);
      if (Math.abs(s) > 0.05) Q.arrow(g, L.x(p), 22, L.x(p) + Math.sign(s) * Math.min(80, 8 * Math.abs(s)), 22, "d", "fd");
      Q.dot(g, F.x(t), F.y(p), "fd", 5);
      read.textContent = `t = ${num(t)}: 위치 ${num(p, 3)}, 속도 ${num(s, 3)} → ` + (s > 0.01 ? "양의 방향으로" : s < -0.01 ? "음의 방향으로" : "멈추며 방향을 바꾼다");
    });
  });

  // 실근의 개수: y = x³ − 3x 와 y = k
  Q.def("calc1-roots", (fig, svg) => {
    const f = (x) => x ** 3 - 3 * x;
    const { F, bg, g } = graph(svg, [-2.6, 2.6, -5, 5]);
    const read = fig.querySelector(".q-read");
    Q.plot(bg, F, (x) => (Math.abs(f(x)) <= 5 ? f(x) : NaN), "b");
    Q.dot(bg, F.x(-1), F.y(2), "fa", 4); Q.dot(bg, F.x(1), F.y(-2), "fa", 4);
    Q.bind(fig, ({ k }) => {
      clear(g);
      Q.line(g, F.X0, F.y(k), F.X1, F.y(k), "c");
      const roots = [];
      for (let i = 0; i < 520; i++) { const a = -2.6 + 5.2 * i / 520, b = -2.6 + 5.2 * (i + 1) / 520; const fa = f(a) - k, fb = f(b) - k; if (fa === 0 || fa * fb < 0) roots.push((a + b) / 2); }
      if (Math.abs(Math.abs(k) - 2) < 1e-9) roots.push(k > 0 ? -1 : 1);
      const uniq = roots.filter((r, i) => roots.findIndex((s) => Math.abs(s - r) < 0.02) === i);
      uniq.forEach((r) => Q.dot(g, F.x(r), F.y(k), "fd", 5));
      read.textContent = `k = ${num(k)}: 서로 다른 실근 ${uniq.length}개` + (Math.abs(k) < 2 ? " (극솟값 −2 < k < 극댓값 2)" : Math.abs(k) === 2 ? " (극점에서 접한다)" : "");
    });
  });

  // 그래프의 개형: f = x⁴ − 4x³ + 10, 단계별
  Q.def("calc1-sketch", (fig, svg) => {
    const f = (x) => x ** 4 - 4 * x ** 3 + 10;
    const names = ["f′(x) = 0인 점", "증가·감소 화살표", "곡선 잇기", "구간 [−1, 4]의 양 끝"];
    const { F, g } = graph(svg, [-1.5, 4.5, -20, 20], { H: 270, axes: { step: 1, lstep: 1, grid: false } });
    const read = fig.querySelector(".q-read");
    Q.bind(fig, ({ s }) => {
      clear(g);
      [[0, "fc"], [3, "fd"]].forEach(([x, c]) => { Q.dot(g, F.x(x), F.y(f(x)), c, 6); txt(g, F.x(x) + 8, F.y(f(x)) + (x ? 16 : -8), `(${x}, ${f(x)})`, "s"); });
      if (s >= 1) { Q.arrow(g, F.x(-1.2), F.y(16), F.x(-0.3), F.y(11), "k", "fk"); Q.arrow(g, F.x(0.4), F.y(9), F.x(2.6), F.y(-14), "k", "fk"); Q.arrow(g, F.x(3.3), F.y(-14), F.x(4.1), F.y(6), "k", "fk"); }
      if (s >= 2) Q.plot(g, F, (x) => (f(x) <= 20 ? f(x) : NaN), "b", -1.5, 4.5, 300);
      if (s >= 3) { Q.dot(g, F.x(-1), F.y(15), "fa", 6); Q.dot(g, F.x(4), F.y(10), "fa", 6); txt(g, F.x(-1) + 8, F.y(15) - 6, "최대 15", "s ta"); }
      read.textContent = names[s] + (s === 3 ? ": 최댓값 15 (x = −1), 최솟값 −17 (x = 3)" : "");
    }, (k, v) => names[v]);
  });

  // 증가·감소: 위 f = x³ − 6x² + 9x + 1, 아래 f′ = 3(x − 1)(x − 3)
  Q.def("calc1-incdec", (fig, svg) => {
    const f = (x) => x ** 3 - 6 * x * x + 9 * x + 1, d = (x) => 3 * x * x - 12 * x + 9;
    const top = Q.frame(-0.5, 4.5, -1, 7, 40, 500, 5, 150), bot = Q.frame(-0.5, 4.5, -4, 10, 40, 500, 160, 295);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    [top, bot].forEach((F) => { Q.line(bg, F.X0, F.y(0), F.X1, F.y(0), "ax"); Q.line(bg, F.x(0), F.Y0, F.x(0), F.Y1, "ax"); [1, 2, 3, 4].forEach((x) => txt(bg, F.x(x), F.y(0) + 13, String(x), "s", "middle")); });
    Q.plot(bg, top, (x) => (f(x) >= -1 && f(x) <= 7 ? f(x) : NaN), "b"); Q.plot(bg, bot, (x) => (d(x) <= 10 ? d(x) : NaN), "c");
    txt(bg, top.X1, top.Y0 + 12, "y = f(x)", "s", "end"); txt(bg, bot.X1, bot.Y0 + 12, "y = f′(x)", "s", "end");
    Q.bind(fig, ({ x }) => {
      clear(g);
      const s = d(x), cls = s > 1e-9 ? "fa" : s < -1e-9 ? "fd" : "fk";
      Q.dot(g, top.x(x), top.y(f(x)), cls, 5);
      Q.plot(g, top, (t) => { const y = s * (t - x) + f(x); return y >= -1 && y <= 7 ? y : NaN; }, "d", x - 0.5, x + 0.5);
      Q.dot(g, bot.x(x), bot.y(Math.min(10, s)), cls, 5);
      Q.line(g, top.x(x), top.y(f(x)), bot.x(x), bot.y(Math.min(10, s)), "gd dsh");
      read.textContent = `x = ${num(x)}: f′(x) = ${num(s, 3)} → ` + (s > 1e-9 ? "증가(오르막)" : s < -1e-9 ? "감소(내리막)" : "기울기 0");
    });
  });

  // 평균값 정리: f(x) = x³ − 3x² + 2x on [0, 4]
  Q.def("calc1-mvt", (fig, svg) => {
    const f = (x) => x ** 3 - 3 * x * x + 2 * x, d = (x) => 3 * x * x - 6 * x + 2;
    const { F, bg, g } = graph(svg, [-0.5, 4.5, -3, 26], { H: 260, axes: { step: 2, lstep: 2 } });
    const read = fig.querySelector(".q-read");
    Q.plot(bg, F, f, "b", -0.3, 4.3);
    Q.plot(bg, F, (x) => 6 * x, "c dsh", 0, 4);
    Q.dot(bg, F.x(0), F.y(0), "fc", 4); Q.dot(bg, F.x(4), F.y(24), "fc", 4);
    Q.bind(fig, ({ c }) => {
      clear(g);
      const m = d(c);
      Q.plot(g, F, (x) => m * (x - c) + f(c), "d", c - 1, c + 1);
      Q.dot(g, F.x(c), F.y(f(c)), "fd", 5);
      const par = Math.abs(m - 6) < 0.3;
      read.textContent = `할선의 기울기 6, c = ${num(c)}에서 접선의 기울기 ${num(m, 2)}` + (par ? " → 거의 평행 (정확한 값 c = 1 + √21/3 ≈ 2.53)" : "");
    });
  });

  // 접선의 방정식: y = x³ − 3x, 접점 t
  Q.def("calc1-tan", (fig, svg) => {
    const f = (x) => x ** 3 - 3 * x, d = (x) => 3 * x * x - 3;
    const { F, bg, g } = graph(svg, [-3, 3, -5, 5]);
    const read = fig.querySelector(".q-read");
    Q.plot(bg, F, f, "b");
    Q.dot(bg, F.x(0), F.y(2), "fc", 4); txt(bg, F.x(0) + 6, F.y(2) - 6, "(0, 2)", "s tc");
    Q.bind(fig, ({ t }) => {
      clear(g);
      const m = d(t), b = f(t) - m * t;
      Q.plot(g, F, (x) => m * x + b, "d");
      Q.dot(g, F.x(t), F.y(f(t)), "fd", 5);
      read.textContent = `접점 (${num(t)}, ${num(f(t), 3)}), 기울기 ${num(m, 3)}: y = ${num(m, 3)}x + (${num(b, 3)})` + (Math.abs(b - 2) < 1e-6 ? " → (0, 2)를 지난다" : "");
    });
  });

  // 곱의 미분법: 직사각형 f × g가 Δf, Δg만큼 늘 때
  Q.def("calc1-product", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), u = 60, ox = 40, oy = 240;
    Q.bind(fig, ({ h }) => {
      clear(g);
      const f = 3, gg = 2, df = 1.2 * h, dg = 0.9 * h;   // 모식: f' = 1.2, g' = 0.9
      el("rect", { x: ox, y: oy - gg * u, width: f * u, height: gg * u, class: "lb" }, g);
      el("rect", { x: ox + f * u, y: oy - gg * u, width: df * u, height: gg * u, class: "la" }, g);
      el("rect", { x: ox, y: oy - (gg + dg) * u, width: f * u, height: dg * u, class: "lc" }, g);
      el("rect", { x: ox + f * u, y: oy - (gg + dg) * u, width: df * u, height: dg * u, class: "ld" }, g);
      el("rect", { x: ox, y: oy - (gg + dg) * u, width: (f + df) * u, height: (gg + dg) * u, class: "k" }, g);
      txt(g, ox + f * u / 2, oy - gg * u / 2, "fg", "", "middle");
      txt(g, ox + (f + df) * u + 10, oy - gg * u / 2, "g·Δf", "s ta");
      txt(g, ox + f * u / 2, oy - (gg + dg) * u - 6, "f·Δg", "s tc", "middle");
      const A = gg * df, B = f * dg, C = df * dg;
      read.textContent = `늘어난 넓이: g·Δf = ${num(A, 3)}, f·Δg = ${num(B, 3)}, 모서리 Δf·Δg = ${num(C, 4)} (모서리의 비율 ${num(100 * C / (A + B + C), 1)}%)`;
    });
  });

  // 도함수: 위 y = x^n과 접선, 아래 y = n x^(n−1)
  Q.def("calc1-deriv", (fig, svg) => {
    const top = Q.frame(-1.6, 1.6, -3.5, 3.5, 40, 500, 5, 145), bot = Q.frame(-1.6, 1.6, -1, 9, 40, 500, 160, 295);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.line(bg, top.X0, top.y(0), top.X1, top.y(0), "ax"); Q.line(bg, top.x(0), top.Y0, top.x(0), top.Y1, "ax");
    Q.line(bg, bot.X0, bot.y(0), bot.X1, bot.y(0), "ax"); Q.line(bg, bot.x(0), bot.Y0, bot.x(0), bot.Y1, "ax");
    txt(bg, top.X1, top.Y0 + 12, "y = xⁿ", "s", "end"); txt(bg, bot.X1, bot.Y0 + 12, "기울기 y = n xⁿ⁻¹", "s", "end");
    Q.bind(fig, ({ n, x }) => {
      clear(g);
      const f = (t) => t ** n, d = (t) => n * t ** (n - 1);
      Q.plot(g, top, (t) => (Math.abs(f(t)) <= 3.5 ? f(t) : NaN), "b");
      Q.plot(g, top, (t) => { const y = d(x) * (t - x) + f(x); return Math.abs(y) <= 3.5 ? y : NaN; }, "d", x - 0.8, x + 0.8);
      Q.dot(g, top.x(x), top.y(f(x)), "fd", 5);
      Q.plot(g, bot, (t) => (d(t) <= 9 && d(t) >= -1 ? d(t) : NaN), "c");
      Q.dot(g, bot.x(x), bot.y(Math.max(-1, Math.min(9, d(x)))), "fd", 5);
      Q.line(g, top.x(x), top.y(f(x)), bot.x(x), bot.y(Math.max(-1, Math.min(9, d(x)))), "gd dsh");
      read.textContent = `x = ${num(x)}에서 기울기 ${n}·(${num(x)})^${n - 1} = ${num(d(x), 3)}`;
    });
  });

  // 미분가능성: |x|와 매끄러운 곡선 x² + x를 원점 둘레로 확대
  Q.def("calc1-corner", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const panel = (ox, f, cls, title, s) => {
      const F = Q.frame(-s, s, -s, s, ox, ox + 220, 30, 250);
      el("rect", { x: ox, y: 30, width: 220, height: 220, class: "lk" }, g);
      Q.line(g, ox, F.y(0), ox + 220, F.y(0), "ax"); Q.line(g, F.x(0), 30, F.x(0), 250, "ax");
      Q.plot(g, F, (x) => { const y = f(x); return Math.abs(y) <= s ? y : NaN; }, cls, -s, s, 300);
      txt(g, ox + 110, 20, title, "s", "middle");
    };
    Q.bind(fig, ({ z }) => {
      clear(g);
      const s = 2 / 4 ** z;
      panel(30, (x) => Math.abs(x), "d", "y = |x|", s);
      panel(270, (x) => x * x + x, "b", "y = x² + x", s);
      read.textContent = `${4 ** z}배 확대: |x|는 여전히 꺾여 있고, x² + x는 ${z ? "거의 직선(기울기 1)" : "곡선"}으로 보인다`;
    }, (k, v) => `${4 ** v}배`);
  });

  // 미분계수: y = 5t², t = 2와 2 + h를 잇는 할선
  Q.def("calc1-secant", (fig, svg) => {
    const f = (t) => 5 * t * t;
    const F = Q.frame(0, 4, 0, 40, 50, 500, 10, 250);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.line(bg, F.X0, F.Y1, F.X1, F.Y1, "ax"); Q.line(bg, F.X0, F.Y1, F.X0, F.Y0, "ax");
    [1, 2, 3, 4].forEach((t) => txt(bg, F.x(t), F.Y1 + 16, `${t}초`, "s", "middle"));
    [10, 20, 30, 40].forEach((v) => txt(bg, F.X0 - 6, F.y(v) + 4, `${v} m`, "s", "end"));
    Q.plot(bg, F, f, "b");
    Q.plot(bg, F, (t) => 20 * (t - 2) + 20, "a dsh", 1, 3);
    Q.bind(fig, ({ h }) => {
      clear(g);
      const m = (f(2 + h) - f(2)) / h;
      Q.plot(g, F, (t) => m * (t - 2) + 20, "d", 0.8, 3.6);
      Q.dot(g, F.x(2), F.y(20), "fk", 5); Q.dot(g, F.x(2 + h), F.y(f(2 + h)), "fd", 5);
      read.textContent = `2초에서 ${num(2 + h)}초까지 평균 속력 = 20 + 5h = ${num(m, 3)} m/s (점선은 기울기 20인 접선)`;
    });
  });

  // 사잇값 정리: f(x) = 0.4x³ − 1.5x² + x + 1 on [−1, 3.5]
  Q.def("calc1-ivt", (fig, svg) => {
    const f = (x) => 0.4 * x ** 3 - 1.2 * x * x + 0.3 * x + 1;
    const a = -0.6, b = 3.4;
    const { F, bg, g } = graph(svg, [-1.5, 4, -2.5, 4.5], { H: 250 });
    const read = fig.querySelector(".q-read");
    Q.plot(bg, F, f, "b", a, b);
    Q.dot(bg, F.x(a), F.y(f(a)), "fb", 4); Q.dot(bg, F.x(b), F.y(f(b)), "fb", 4);
    txt(bg, F.x(a), F.y(0) + 16, "a", "i", "middle"); txt(bg, F.x(b), F.y(0) + 16, "b", "i", "middle");
    Q.bind(fig, ({ k }) => {
      clear(g);
      Q.line(g, F.X0, F.y(k), F.X1, F.y(k), "c dsh");
      const lo = Math.min(f(a), f(b)), hi = Math.max(f(a), f(b)), roots = [];
      for (let i = 0; i < 400; i++) { const x1 = a + (b - a) * i / 400, x2 = a + (b - a) * (i + 1) / 400; if ((f(x1) - k) * (f(x2) - k) <= 0) roots.push((x1 + x2) / 2); }
      roots.forEach((r) => Q.dot(g, F.x(r), F.y(k), "fd", 5));
      const inside = k >= lo && k <= hi;
      read.textContent = `f(a) = ${num(f(a), 2)}, f(b) = ${num(f(b), 2)}, k = ${num(k)}: 만나는 점 ${roots.length}개` + (inside ? " (사잇값 정리로 적어도 1개가 보장된다)" : " (k가 f(a)와 f(b) 사이에 없어 보장은 없다)");
    });
  });

  // 연속: 세 가지 끊김과 연속인 경우 (a = 2)
  Q.def("calc1-cont", (fig, svg) => {
    const names = ["구멍: f(a)가 없다", "계단: 극한값이 없다", "떨어진 점: 극한값 ≠ f(a)", "연속"];
    const { F, g } = graph(svg, [-0.5, 4, -0.5, 5], { H: 250 });
    const read = fig.querySelector(".q-read");
    const hole = (x, y) => el("circle", { cx: F.x(x), cy: F.y(y), r: 5, class: "k", style: "fill:var(--card)" }, g);
    Q.bind(fig, ({ c }) => {
      clear(g);
      if (c === 1) { Q.plot(g, F, (x) => 0.5 * x + 1, "b", -0.5, 2); Q.plot(g, F, (x) => 0.5 * x + 2.5, "b", 2, 4); hole(2, 2); Q.dot(g, F.x(2), F.y(3.5), "fb", 5); }
      else {
        Q.plot(g, F, (x) => 0.5 * x * x - x + 2, "b");
        if (c === 0) hole(2, 2);
        if (c === 2) { hole(2, 2); Q.dot(g, F.x(2), F.y(4), "fd", 5); }
        if (c === 3) Q.dot(g, F.x(2), F.y(2), "fa", 5);
      }
      Q.line(g, F.x(2), F.y(0) - 4, F.x(2), F.y(0) + 4, "k"); txt(g, F.x(2), F.y(0) + 18, "a", "i", "middle");
      read.textContent = names[c];
    }, (k, v) => names[v].split(":")[0]);
  });

  // 0/0 꼴: 분자 x² − 4, 분모 x − 2, 비
  Q.def("calc1-00", (fig, svg) => {
    const { F, bg, g } = graph(svg, [0, 4, -4, 8], { H: 250 });
    const read = fig.querySelector(".q-read");
    Q.plot(bg, F, (x) => x * x - 4, "b"); Q.plot(bg, F, (x) => x - 2, "c"); Q.plot(bg, F, (x) => x + 2, "a dsh");
    el("circle", { cx: F.x(2), cy: F.y(4), r: 5, class: "k", style: "fill:var(--card)" }, bg);
    txt(bg, F.x(3.2), F.y(7), "분자 x² − 4", "s tb"); txt(bg, F.x(3.2), F.y(0.6), "분모 x − 2", "s tc"); txt(bg, F.x(0.2), F.y(2.8), "비", "s ta");
    Q.bind(fig, ({ x }) => {
      clear(g);
      if (Math.abs(x - 2) < 1e-9) { read.textContent = "x = 2에서는 0/0이라 값이 없다. 극한값은 근처의 값으로 정한다"; return; }
      const n = x * x - 4, d = x - 2;
      Q.dot(g, F.x(x), F.y(n), "fb", 4); Q.dot(g, F.x(x), F.y(d), "fc", 4); Q.dot(g, F.x(x), F.y(n / d), "fa", 5);
      read.textContent = `분자 ${num(n, 3)}, 분모 ${num(d, 3)}, 비 ${num(n / d, 3)}`;
    });
  });

  // 함수의 극한: (x² − 1)/(x − 1), x = 1 ± 10^(−e)
  Q.def("calc1-lim", (fig, svg) => {
    const { F, bg, g } = graph(svg, [-1.5, 3, -0.5, 4]);
    const read = fig.querySelector(".q-read");
    Q.plot(bg, F, (x) => x + 1, "b");
    el("circle", { cx: F.x(1), cy: F.y(2), r: 5, class: "k", style: "fill:var(--card)" }, bg);
    Q.bind(fig, ({ e }) => {
      clear(g);
      const h = 10 ** -e, xs = [1 - h, 1 + h];
      xs.forEach((x, i) => {
        const y = (x * x - 1) / (x - 1), px = e === 1 ? F.x(x) : F.x(1) + (i ? 1 : -1) * (40 / e);
        Q.dot(g, px, F.y(y), i ? "fc" : "fd", 5);
        Q.line(g, px, F.y(0), px, F.y(y), (i ? "c" : "d") + " dsh");
      });
      const f = (x) => ((x * x - 1) / (x - 1)).toFixed(e + 1);
      read.textContent = `f(${(1 - h).toFixed(e)}) = ${f(1 - h)}, f(${(1 + h).toFixed(e)}) = ${f(1 + h)} → 2에 다가간다` + (e > 1 ? " (점의 위치는 확대해 그렸다)" : "");
    }, (k, v) => (10 ** -v).toFixed(v));
  });
})();
