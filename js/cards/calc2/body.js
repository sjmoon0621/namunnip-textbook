/* 미적분Ⅱ 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  // 좌표 틀과 눈금을 함께 그린다
  const frame = (g, x0, x1, y0, y1, opt) => { const F = Q.frame(x0, x1, y0, y1, 50, 490, 15, 215); Q.axes(g, F, opt || {}); return F; };

  // 1-1 수렴의 뜻: a_n = 1 + (−1)^n / n, 오차 ε 띠
  Q.def("calc2-conv", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ e }) => {
      clear(g);
      const F = frame(g, 0, 30, 0, 2, { step: [5, 0.5] });
      el("rect", { x: 50, y: F.y(1 + e), width: 440, height: F.y(1 - e) - F.y(1 + e), class: "la", opacity: 0.4 }, g);
      Q.line(g, 50, F.y(1), 490, F.y(1), "gd");
      const N = Math.floor(1 / e) + 1;
      for (let n = 1; n <= 30; n++) Q.dot(g, F.x(n), F.y(1 + (-1) ** n / n), n >= N ? "fb" : "fd", 3.5);
      Q.line(g, F.x(N), 15, F.x(N), 215, "d");
      read.textContent = `ε = ${num(e, 2)}: n ≥ ${N}인 모든 항이 1 ± ε 띠 안에 있다 (1/n < ε ⇔ n > ${num(1 / e, 2)})`;
    });
  });

  // 1-2 조임 정리: −1/n ≤ sin n / n ≤ 1/n
  Q.def("calc2-squeeze", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ m }) => {
      clear(g);
      const F = frame(g, 0, 40, -1, 1, { step: [5, 0.5] });
      Q.plot(g, F, (x) => 1 / x, "c", 0.9, 40); Q.plot(g, F, (x) => -1 / x, "c", 0.9, 40);
      for (let n = 1; n <= m; n++) Q.dot(g, F.x(n), F.y(Math.sin(n) / n), "fb", 3.5);
      read.textContent = `n = ${m}: sin ${m} / ${m} = ${num(Math.sin(m) / m, 4)}, 위아래 경계 ±${num(1 / m, 4)} 사이에 갇혀 0으로 간다`;
    });
  });

  // 1-3 등비수열 r^n
  Q.def("calc2-rn", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ r }) => {
      clear(g);
      const F = frame(g, 0, 20, -3, 3, { step: [5, 1] });
      for (let n = 1; n <= 20; n++) { const v = r ** n; if (Math.abs(v) <= 3) Q.dot(g, F.x(n), F.y(v), "fb", 3.5); }
      const s = r > 1 ? "∞로 발산" : r === 1 ? "1로 수렴" : r > -1 ? "0으로 수렴" : r === -1 ? "1과 −1을 오가며 진동(발산)" : "부호를 바꾸며 크기가 커져 진동(발산)";
      read.textContent = `r = ${num(r, 2)}: rⁿ은 ${s}`;
    });
  });

  // 1-4 급수: 부분합 Σ 1/(k(k+1)) 과 Σ 1/k
  Q.def("calc2-partial", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const F = frame(g, 0, 50, 0, 5, { step: [10, 1] });
      let s1 = 0, s2 = 0;
      for (let k = 1; k <= n; k++) { s1 += 1 / (k * (k + 1)); s2 += 1 / k; Q.dot(g, F.x(k), F.y(s1), "fb", 3); Q.dot(g, F.x(k), F.y(s2), "fd", 3); }
      Q.line(g, 50, F.y(1), 490, F.y(1), "gd");
      read.textContent = `n = ${n}: Σ1/(k(k+1)) = 1 − 1/${n + 1} = ${num(s1, 4)} (1로 수렴), Σ1/k = ${num(s2, 3)} (끝없이 커짐)`;
    });
  });

  // 1-5 튀는 공: 높이 10 m, 튀어 오르는 비율 r
  Q.def("calc2-bounce", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ r }) => {
      clear(g);
      const F = frame(g, 0, 12, 0, 10, { step: [2, 2] });
      let x = 0, h = 10, d = "M" + F.x(0) + " " + F.y(10);
      for (let i = 0; i < 12 && h > 0.01; i++) {
        const w = Math.sqrt(h) * 0.6; x += w;
        d += ` Q ${F.x(x - w * 0.4)} ${F.y(h * 0.2)} ${F.x(x)} ${F.y(0)}`;
        h *= r; const w2 = Math.sqrt(h) * 0.6;
        d += ` Q ${F.x(x + w2 * 0.5)} ${F.y(h * 1.9)} ${F.x(x + w2)} ${F.y(0)}`; x += w2;
      }
      el("path", { d, class: "b" }, g);
      const total = 10 + 2 * 10 * r / (1 - r);
      read.textContent = `r = ${num(r, 2)}: 전체 이동 거리 10 + 2 × 10r/(1 − r) = ${num(total, 2)} m`;
    });
  });

  // 2-1 (1 + h)^(1/h)
  Q.def("calc2-e", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ h }) => {
      clear(g);
      const F = frame(g, -0.9, 2, 1, 4, { step: [0.5, 0.5] });
      const f = (x) => Math.abs(x) < 1e-9 ? Math.E : (1 + x) ** (1 / x);
      Q.plot(g, F, f, "b", -0.9, 2, 300);
      Q.line(g, 50, F.y(Math.E), 490, F.y(Math.E), "gd"); txt(g, 486, F.y(Math.E) - 4, "e", "s i", "end");
      if (Math.abs(h) > 1e-9) Q.dot(g, F.x(h), F.y(f(h)), "fd", 5);
      read.textContent = Math.abs(h) < 1e-9 ? "h = 0에서는 정의되지 않지만, 극한값은 e ≈ 2.71828" : `h = ${num(h, 3)}: (1 + h)^(1/h) = ${num(f(h), 5)}`;
    });
  });

  // 2-2 a sin x + b cos x = R sin(x + α)
  Q.def("calc2-wave", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a, b }) => {
      clear(g);
      const F = frame(g, 0, 2 * Math.PI, -4, 4, { step: [Math.PI / 2, 1] });
      const R = Math.hypot(a, b), al = Math.atan2(b, a);
      Q.plot(g, F, (x) => a * Math.sin(x), "k", 0, 2 * Math.PI); Q.plot(g, F, (x) => b * Math.cos(x), "gd", 0, 2 * Math.PI);
      Q.plot(g, F, (x) => a * Math.sin(x) + b * Math.cos(x), "b", 0, 2 * Math.PI);
      read.textContent = `${num(a)} sin x + ${num(b)} cos x = ${num(R, 3)} sin(x + ${num(al * 180 / Math.PI, 1)}°), 최댓값 ${num(R, 3)}`;
    });
  });

  // 2-3 sin x ≤ x ≤ tan x (단위원)
  Q.def("calc2-sinx", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), cx = 70, cy = 200, R = 160;
    Q.bind(fig, ({ x }) => {
      clear(g);
      el("path", { d: `M${cx} ${cy} L${cx + R} ${cy} A${R} ${R} 0 0 0 ${cx + R * Math.cos(x)} ${cy - R * Math.sin(x)} Z`, class: "la" }, g);
      Q.line(g, cx, cy, cx + R + 10, cy, "ax"); Q.line(g, cx, cy, cx + R * Math.cos(x), cy - R * Math.sin(x), "k");
      Q.line(g, cx + R * Math.cos(x), cy, cx + R * Math.cos(x), cy - R * Math.sin(x), "d");
      Q.line(g, cx + R, cy, cx + R, cy - R * Math.tan(x), "c"); Q.line(g, cx, cy, cx + R, cy - R * Math.tan(x), "gd");
      txt(g, cx + R * Math.cos(x) - 4, cy - R * Math.sin(x) / 2, "sin x", "s td", "end"); txt(g, cx + R + 6, cy - R * Math.tan(x) / 2, "tan x", "s tc");
      txt(g, 330, 60, `x = ${num(x, 3)}`, "s"); txt(g, 330, 85, `sin x = ${num(Math.sin(x), 4)}`, "s"); txt(g, 330, 110, `tan x = ${num(Math.tan(x), 4)}`, "s");
      txt(g, 330, 140, `sin x / x = ${num(Math.sin(x) / x, 5)}`, "s tb");
      read.textContent = `x = ${num(x, 3)}: sin x < x < tan x 이므로 cos x < sin x / x < 1, 곧 ${num(Math.cos(x), 4)} < ${num(Math.sin(x) / x, 4)} < 1`;
    });
  });

  // 2-4 tan x 의 접선 기울기 sec² x
  Q.def("calc2-tan", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a }) => {
      clear(g);
      const F = frame(g, -1.5, 1.5, -4, 4, { step: [0.5, 1] });
      Q.plot(g, F, Math.tan, "b", -1.45, 1.45, 300);
      const m = 1 / Math.cos(a) ** 2;
      Q.plot(g, F, (x) => Math.tan(a) + m * (x - a), "c", -1.5, 1.5);
      Q.dot(g, F.x(a), F.y(Math.tan(a)), "fd", 5);
      read.textContent = `x = ${num(a, 2)}: 접선의 기울기 1/cos² x = ${num(m, 3)} (언제나 1 이상)`;
    });
  });

  // 2-5 합성함수 sin(x²): 안쪽 변화율 2x × 바깥 변화율 cos u
  Q.def("calc2-chain", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ x }) => {
      clear(g);
      const F = frame(g, -3, 3, -1.5, 1.5, { step: [1, 0.5] });
      Q.plot(g, F, (t) => Math.sin(t * t), "b", -3, 3, 400);
      const u = x * x, m = Math.cos(u) * 2 * x;
      Q.plot(g, F, (t) => Math.sin(u) + m * (t - x), "c", x - 0.5, x + 0.5);
      Q.dot(g, F.x(x), F.y(Math.sin(u)), "fd", 5);
      read.textContent = `x = ${num(x, 2)}: u = x² = ${num(u, 3)}, du/dx = ${num(2 * x, 2)}, dy/du = cos u = ${num(Math.cos(u), 3)} → dy/dx = ${num(m, 3)}`;
    });
  });

  // 2-6 타원 x = 2 cos t, y = sin t 의 접선
  Q.def("calc2-param", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ t }) => {
      clear(g);
      const F = Q.frame(-3, 3, -1.6, 1.6, 50, 490, 15, 215); Q.axes(g, F, { step: [1, 1] });
      let d = ""; for (let i = 0; i <= 120; i++) { const s = i / 120 * 2 * Math.PI; d += (i ? "L" : "M") + F.x(2 * Math.cos(s)).toFixed(1) + " " + F.y(Math.sin(s)).toFixed(1); }
      el("path", { d, class: "b" }, g);
      const x = 2 * Math.cos(t), y = Math.sin(t), dx = -2 * Math.sin(t), dy = Math.cos(t);
      const L = 1.2 / Math.hypot(dx, dy);
      Q.line(g, F.x(x - dx * L), F.y(y - dy * L), F.x(x + dx * L), F.y(y + dy * L), "c");
      Q.dot(g, F.x(x), F.y(y), "fd", 5);
      read.textContent = `t = ${num(t, 2)}: dx/dt = ${num(dx, 3)}, dy/dt = ${num(dy, 3)}` + (Math.abs(dx) < 1e-6 ? ", 접선이 세로선" : `, dy/dx = ${num(dy / dx, 3)}`);
    });
  });

  // 2-7 원 x² + y² = 25 의 음함수 미분
  Q.def("calc2-implicit", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a }) => {
      clear(g);
      const F = Q.frame(-8, 8, -6, 6, 110, 430, 15, 215); Q.axes(g, F, { step: [2, 2] });
      el("circle", { cx: F.x(0), cy: F.y(0), r: F.x(5) - F.x(0), class: "b" }, g);
      const t = a * Math.PI / 180, x = 5 * Math.cos(t), y = 5 * Math.sin(t);
      const dx = -y, dy = x, L = 3 / Math.hypot(dx, dy);
      Q.line(g, F.x(x - dx * L), F.y(y - dy * L), F.x(x + dx * L), F.y(y + dy * L), "c");
      Q.line(g, F.x(0), F.y(0), F.x(x), F.y(y), "gd");
      Q.dot(g, F.x(x), F.y(y), "fd", 5);
      read.textContent = `점 (${num(x, 2)}, ${num(y, 2)}): 2x + 2y·y′ = 0 에서 y′ = −x/y = ` + (Math.abs(y) < 1e-6 ? "정의되지 않음(세로 접선)" : num(-x / y, 3));
    });
  });

  // 2-8 y = ln x 위 점 (t, ln t)의 접선과 y절편
  Q.def("calc2-tangent", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ t }) => {
      clear(g);
      const F = frame(g, -1, 8, -2, 3, { step: [1, 1] });
      Q.plot(g, F, Math.log, "b", 0.05, 8, 300);
      const b = Math.log(t) - 1;
      Q.plot(g, F, (x) => Math.log(t) + (x - t) / t, "c", -1, 8);
      Q.dot(g, F.x(t), F.y(Math.log(t)), "fd", 5); Q.dot(g, F.x(0), F.y(b), "fk", 4);
      read.textContent = `접점 (${num(t, 2)}, ln ${num(t, 2)}): 접선 y = x/${num(t, 2)} + (ln t − 1), y절편 ${num(b, 3)}` + (Math.abs(b) < 0.02 ? " → 원점을 지난다 (t = e)" : "");
    });
  });

  // 2-9 y = e^(−x²) 의 오목·볼록
  Q.def("calc2-concave", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ x }) => {
      clear(g);
      const F = frame(g, -3, 3, -0.2, 1.2, { step: [1, 0.5] });
      const f = (t) => Math.exp(-t * t), f1 = (t) => -2 * t * f(t), f2 = (t) => (4 * t * t - 2) * f(t);
      const ip = 1 / Math.SQRT2;
      el("rect", { x: F.x(-ip), y: 15, width: F.x(ip) - F.x(-ip), height: 200, class: "la", opacity: 0.3 }, g);
      Q.plot(g, F, f, "b", -3, 3, 300);
      Q.plot(g, F, (t) => f(x) + f1(x) * (t - x), "c", x - 0.8, x + 0.8);
      Q.dot(g, F.x(x), F.y(f(x)), "fd", 5);
      for (const s of [-ip, ip]) Q.dot(g, F.x(s), F.y(f(s)), "fk", 4);
      read.textContent = `x = ${num(x, 2)}: f′ = ${num(f1(x), 3)}, f″ = ${num(f2(x), 3)} → ` + (Math.abs(f2(x)) < 0.01 ? "변곡점 근처" : f2(x) < 0 ? "위로 볼록 (색칠한 구간)" : "아래로 볼록");
    });
  });

  // 2-10 e^x = kx 의 실근 개수
  Q.def("calc2-roots", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      const F = frame(g, -3, 3, -3, 10, { step: [1, 2] });
      Q.plot(g, F, Math.exp, "b", -3, 3, 300); Q.plot(g, F, (x) => k * x, "c", -3, 3);
      const E = Math.E, n = k < 0 ? 1 : k < E - 1e-9 ? 0 : Math.abs(k - E) < 1e-9 ? 1 : 2;
      read.textContent = `k = ${num(k, 2)}: 실근 ${n}개` + (Math.abs(k - E) < 0.06 ? " (k = e에서 접한다)" : "");
    });
  });

  // 2-11 단진동 x = cos t
  Q.def("calc2-shm", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ t }) => {
      clear(g);
      const F = Q.frame(0, 2 * Math.PI, -1.3, 1.3, 50, 330, 15, 215); Q.axes(g, F, { step: [Math.PI / 2, 0.5] });
      Q.plot(g, F, Math.cos, "b", 0, 2 * Math.PI); Q.plot(g, F, (s) => -Math.sin(s), "c", 0, 2 * Math.PI); Q.plot(g, F, (s) => -Math.cos(s), "d", 0, 2 * Math.PI);
      Q.line(g, F.x(t), 15, F.x(t), 215, "gd");
      const X = 420 + 60 * Math.cos(t);
      Q.line(g, 360, 120, 480, 120, "ax"); Q.dot(g, X, 120, "fb", 9);
      txt(g, 340, 30, "파랑 위치, 주황 속도, 빨강 가속도", "s");
      read.textContent = `t = ${num(t, 2)}: 위치 ${num(Math.cos(t), 3)}, 속도 ${num(-Math.sin(t), 3)}, 가속도 ${num(-Math.cos(t), 3)}`;
    });
  });

  // 3-1 ∫_1^2 x^n dx
  Q.def("calc2-xn", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const F = frame(g, 0, 2.5, 0, 4, { step: [0.5, 1] });
      const f = (x) => x ** n;
      let d = `M${F.x(1)} ${F.y(0)}`; for (let i = 0; i <= 50; i++) { const x = 1 + i / 50; d += ` L${F.x(x).toFixed(1)} ${F.y(Math.min(4, f(x))).toFixed(1)}`; } d += ` L${F.x(2)} ${F.y(0)} Z`;
      el("path", { d, class: "la" }, g);
      Q.plot(g, F, f, "b", 0.05, 2.5, 300);
      const A = Math.abs(n + 1) < 1e-9 ? Math.log(2) : (2 ** (n + 1) - 1) / (n + 1);
      read.textContent = `n = ${num(n, 2)}: ∫₁² xⁿ dx = ` + (Math.abs(n + 1) < 1e-9 ? `ln 2 = ${num(A, 4)} (공식이 0으로 나누게 되는 경우)` : `(2^${num(n + 1, 2)} − 1)/${num(n + 1, 2)} = ${num(A, 4)}`);
    });
  });

  // 3-2 치환적분: ∫_0^b 2x cos(x²) dx = ∫_0^{b²} cos u du
  Q.def("calc2-sub", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ b }) => {
      clear(g);
      const F1 = Q.frame(0, 1.6, -3, 2, 40, 250, 15, 215), F2 = Q.frame(0, 2.6, -3, 2, 280, 490, 15, 215);
      Q.axes(g, F1, { step: [0.5, 1] }); Q.axes(g, F2, { step: [0.5, 1] });
      const f = (x) => 2 * x * Math.cos(x * x);
      const fill = (F, h, a, c) => { let d = `M${F.x(a)} ${F.y(0)}`; for (let i = 0; i <= 60; i++) { const x = a + (c - a) * i / 60; d += ` L${F.x(x).toFixed(1)} ${F.y(h(x)).toFixed(1)}`; } d += ` L${F.x(c)} ${F.y(0)} Z`; el("path", { d, class: "la" }, g); };
      fill(F1, f, 0, b); fill(F2, Math.cos, 0, b * b);
      Q.plot(g, F1, f, "b", 0, 1.6, 200); Q.plot(g, F2, Math.cos, "c", 0, 2.6, 200);
      txt(g, 60, 30, "y = 2x cos(x²)", "s"); txt(g, 300, 30, "y = cos u", "s");
      read.textContent = `b = ${num(b, 2)}: ∫₀^b 2x cos(x²) dx = ∫₀^${num(b * b, 3)} cos u du = sin(${num(b * b, 3)}) = ${num(Math.sin(b * b), 4)}`;
    });
  });

  // 3-3 부분적분 넓이: ∫_1^b ln x dx + ∫_0^{ln b} e^y dy = b ln b
  Q.def("calc2-parts", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ b }) => {
      clear(g);
      const F = frame(g, 0, 5.5, 0, 2, { step: [1, 0.5] });
      const L = Math.log(b);
      let d = `M${F.x(1)} ${F.y(0)}`; for (let i = 0; i <= 60; i++) { const x = 1 + (b - 1) * i / 60; d += ` L${F.x(x).toFixed(1)} ${F.y(Math.log(x)).toFixed(1)}`; } d += ` L${F.x(b)} ${F.y(0)} Z`;
      el("path", { d, class: "la" }, g);
      let d2 = `M${F.x(0)} ${F.y(0)} L${F.x(1)} ${F.y(0)}`; for (let i = 0; i <= 60; i++) { const x = 1 + (b - 1) * i / 60; d2 += ` L${F.x(x).toFixed(1)} ${F.y(Math.log(x)).toFixed(1)}`; } d2 += ` L${F.x(0)} ${F.y(L)} Z`;
      el("path", { d: d2, class: "lc" }, g);
      Q.plot(g, F, Math.log, "b", 0.3, 5.5, 300);
      const A1 = b * L - b + 1, A2 = b - 1;
      read.textContent = `b = ${num(b, 2)}: 초록 ∫₁^b ln x dx = ${num(A1, 4)}, 주황 ∫₀^{ln b} eʸ dy = ${num(A2, 4)}, 합 = b ln b = ${num(b * L, 4)}`;
    });
  });

  // 3-4 구분구적법: (1/n) Σ (k/n)²
  Q.def("calc2-riemann", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const F = frame(g, 0, 1.1, 0, 1.1, { step: [0.25, 0.25] });
      let S = 0;
      for (let k = 1; k <= n; k++) { const h = (k / n) ** 2; S += h / n; el("rect", { x: F.x((k - 1) / n), y: F.y(h), width: F.x(1 / n) - F.x(0), height: F.y(0) - F.y(h), class: "la" }, g); }
      Q.plot(g, F, (x) => x * x, "b", 0, 1.05);
      read.textContent = `n = ${n}: (1/n) Σ (k/n)² = ${num(S, 5)} → n이 커지면 ∫₀¹ x² dx = 1/3 ≈ 0.33333`;
    });
  });

  // 3-5 y = x² 과 y = ax 사이의 넓이 a³/6
  Q.def("calc2-between", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a }) => {
      clear(g);
      const F = frame(g, -0.5, 3.5, -1, 10, { step: [1, 2] });
      let d = `M${F.x(0)} ${F.y(0)}`; for (let i = 0; i <= 60; i++) { const x = a * i / 60; d += ` L${F.x(x).toFixed(1)} ${F.y(a * x).toFixed(1)}`; } for (let i = 60; i >= 0; i--) { const x = a * i / 60; d += ` L${F.x(x).toFixed(1)} ${F.y(x * x).toFixed(1)}`; } d += " Z";
      el("path", { d, class: "la" }, g);
      Q.plot(g, F, (x) => x * x, "b", -0.5, 3.5); Q.plot(g, F, (x) => a * x, "c", -0.5, 3.5);
      read.textContent = `a = ${num(a, 2)}: 넓이 ∫₀^a (ax − x²) dx = a³/6 = ${num(a ** 3 / 6, 4)}`;
    });
  });

  // 3-6 y = √x 를 x축 둘레로 회전, 원판 n개
  Q.def("calc2-disk", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const F = frame(g, 0, 4.4, -2.2, 2.2, { step: [1, 1] });
      let V = 0;
      for (let k = 1; k <= n; k++) { const x0 = (k - 1) * 4 / n, r = Math.sqrt(k * 4 / n); V += Math.PI * r * r * 4 / n; el("rect", { x: F.x(x0), y: F.y(r), width: F.x(4 / n) - F.x(0), height: F.y(-r) - F.y(r), class: "la" }, g); }
      Q.plot(g, F, Math.sqrt, "b", 0, 4.2); Q.plot(g, F, (x) => -Math.sqrt(x), "b", 0, 4.2);
      read.textContent = `원판 ${n}개: 부피 합 ${num(V, 3)} → n이 커지면 ∫₀⁴ π x dx = 8π ≈ ${num(8 * Math.PI, 3)}`;
    });
  });

  // 3-7 v(t) = t² − 4t + 3, 0 ≤ t ≤ T: 위치 변화와 움직인 거리
  Q.def("calc2-dist", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ T }) => {
      clear(g);
      const F = frame(g, 0, 5.2, -2, 8.5, { step: [1, 2] });
      const v = (t) => t * t - 4 * t + 3, P = (t) => t ** 3 / 3 - 2 * t * t + 3 * t;
      let d = `M${F.x(0)} ${F.y(0)}`; for (let i = 0; i <= 80; i++) { const t = T * i / 80; d += ` L${F.x(t).toFixed(1)} ${F.y(v(t)).toFixed(1)}`; } d += ` L${F.x(T)} ${F.y(0)} Z`;
      el("path", { d, class: "la" }, g);
      Q.plot(g, F, v, "b", 0, 5);
      let dist = 0; for (let i = 0; i < 2000; i++) { const t = T * (i + 0.5) / 2000; dist += Math.abs(v(t)) * T / 2000; }
      read.textContent = `0 ≤ t ≤ ${num(T, 1)}: 위치의 변화 ∫v dt = ${num(P(T), 3)}, 움직인 거리 ∫|v| dt = ${num(dist, 3)}`;
    });
  });
})();
