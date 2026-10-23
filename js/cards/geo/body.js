/* 기하 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  // 공간의 점을 화면에 비스듬히 그린다 (z축 둘레로 a만큼 돌려 본다)
  const P3 = (cx, cy, s, a) => (x, y, z) => [cx + s * (x * Math.cos(a) - y * Math.sin(a)), cy - s * (z + 0.4 * (x * Math.sin(a) + y * Math.cos(a)))];
  const seg = (g, p, A, B, cls) => { const [x1, y1] = p(...A), [x2, y2] = p(...B); return Q.line(g, x1, y1, x2, y2, cls || "k"); };
  const dot3 = (g, p, A, cls, r) => { const [x, y] = p(...A); return Q.dot(g, x, y, cls || "fd", r || 4); };
  const axes3 = (g, p, L) => { for (const [v, n] of [[[L, 0, 0], "x"], [[0, L, 0], "y"], [[0, 0, L], "z"]]) { seg(g, p, [0, 0, 0], v, "ax"); const [x, y] = p(...v); txt(g, x + 4, y - 4, n, "i"); } };
  const frame = (g, x0, x1, y0, y1, X0, X1, Y0, Y1, st) => { const F = Q.frame(x0, x1, y0, y1, X0, X1, Y0, Y1); Q.axes(g, F, { step: st || 1 }); return F; };

  // 1-1 포물선 y² = 4px: 초점까지 거리 = 준선까지 거리
  Q.def("geo-parabola", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ p, t }) => {
      clear(g);
      const F = frame(g, -4, 8, -5, 5, 40, 490, 10, 220);
      let d = ""; for (let i = 0; i <= 120; i++) { const y = -5 + i / 12; d += (i ? "L" : "M") + F.x(y * y / (4 * p)).toFixed(1) + " " + F.y(y).toFixed(1); }
      el("path", { d, class: "b" }, g);
      Q.line(g, F.x(-p), 10, F.x(-p), 220, "c"); Q.dot(g, F.x(p), F.y(0), "fc", 5); txt(g, F.x(p) + 4, F.y(0) + 16, "F", "i");
      const x = t * t / (4 * p), y = t;
      Q.line(g, F.x(x), F.y(y), F.x(p), F.y(0), "d"); Q.line(g, F.x(x), F.y(y), F.x(-p), F.y(y), "d");
      Q.dot(g, F.x(x), F.y(y), "fd", 5);
      read.textContent = `p = ${num(p, 1)}, 점 P(${num(x, 2)}, ${num(y, 2)}): PF = ${num(Math.hypot(x - p, y), 3)}, 준선까지 ${num(x + p, 3)}`;
    });
  });

  // 1-2 타원: PF + PF′ = 2a
  Q.def("geo-ellipse", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a, t }) => {
      clear(g);
      const b = 3, F = frame(g, -7, 7, -4, 4, 40, 490, 15, 215);
      const A = Math.max(a, b + 0.01), c = Math.sqrt(A * A - b * b);
      el("ellipse", { cx: F.x(0), cy: F.y(0), rx: F.x(A) - F.x(0), ry: F.y(0) - F.y(b), class: "b" }, g);
      const x = A * Math.cos(t), y = b * Math.sin(t);
      for (const s of [-1, 1]) { Q.dot(g, F.x(s * c), F.y(0), "fc", 5); Q.line(g, F.x(x), F.y(y), F.x(s * c), F.y(0), "d"); }
      Q.dot(g, F.x(x), F.y(y), "fd", 5);
      const d1 = Math.hypot(x - c, y), d2 = Math.hypot(x + c, y);
      read.textContent = `a = ${num(A, 2)}, b = 3, c = √(a² − b²) = ${num(c, 3)}: PF + PF′ = ${num(d1, 3)} + ${num(d2, 3)} = ${num(d1 + d2, 3)} = 2a`;
    });
  });

  // 1-3 쌍곡선 x²/a² − y²/b² = 1: |PF − PF′| = 2a, 점근선 y = ±(b/a)x
  Q.def("geo-hyperbola", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ b, t }) => {
      clear(g);
      const a = 2, c = Math.hypot(a, b), F = frame(g, -8, 8, -6, 6, 40, 490, 10, 220);
      for (const s of [-1, 1]) { let d = ""; for (let i = 0; i <= 80; i++) { const u = -2.2 + i * 4.4 / 80; d += (i ? "L" : "M") + F.x(s * a * Math.cosh(u)).toFixed(1) + " " + F.y(b * Math.sinh(u)).toFixed(1); } el("path", { d, class: "b" }, g); }
      Q.plot(g, F, (x) => b / a * x, "gd"); Q.plot(g, F, (x) => -b / a * x, "gd");
      const x = a * Math.cosh(t), y = b * Math.sinh(t);
      for (const s of [-1, 1]) { Q.dot(g, F.x(s * c), F.y(0), "fc", 5); Q.line(g, F.x(x), F.y(y), F.x(s * c), F.y(0), "d"); }
      Q.dot(g, F.x(x), F.y(y), "fd", 5);
      const d1 = Math.hypot(x - c, y), d2 = Math.hypot(x + c, y);
      read.textContent = `a = 2, b = ${num(b, 1)}: PF′ − PF = ${num(d2, 3)} − ${num(d1, 3)} = ${num(d2 - d1, 3)} = 2a, 점근선 y = ±${num(b / a, 2)}x`;
    });
  });

  // 1-4 타원 x²/16 + y²/9 = 1 위 점에서의 접선 x x₁/16 + y y₁/9 = 1
  Q.def("geo-tangent", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ t }) => {
      clear(g);
      const F = frame(g, -8, 8, -5, 5, 40, 490, 15, 215);
      el("ellipse", { cx: F.x(0), cy: F.y(0), rx: F.x(4) - F.x(0), ry: F.y(0) - F.y(3), class: "b" }, g);
      const x1 = 4 * Math.cos(t), y1 = 3 * Math.sin(t);
      if (Math.abs(y1) > 1e-6) Q.plot(g, F, (x) => (1 - x * x1 / 16) * 9 / y1, "c"); else Q.line(g, F.x(x1), 15, F.x(x1), 215, "c");
      Q.dot(g, F.x(x1), F.y(y1), "fd", 5);
      read.textContent = `접점 (${num(x1, 2)}, ${num(y1, 2)}): 접선 ${num(x1 / 16, 3)}x + ${num(y1 / 9, 3)}y = 1` + (Math.abs(y1) > 1e-6 ? `, 기울기 ${num(-9 * x1 / (16 * y1), 3)}` : ", 세로선");
    });
  });

  // 2-1 정육면체에서 꼬인 위치의 두 모서리
  Q.def("geo-skew", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a }) => {
      clear(g);
      const p = P3(260, 170, 90, a * Math.PI / 180), V = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]];
      for (const [i, j] of [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]) seg(g, p, V[i], V[j], "gd");
      seg(g, p, V[0], V[1], "b"); seg(g, p, V[2], V[6], "c"); seg(g, p, V[4], V[5], "a");
      const lab = (v, s) => { const [x, y] = p(...v); txt(g, x + 5, y - 5, s, "s"); };
      lab(V[0], "A"); lab(V[1], "B"); lab(V[2], "C"); lab(V[6], "G"); lab(V[4], "E"); lab(V[5], "F");
      read.textContent = "파랑 AB와 초록 EF는 평행, 파랑 AB와 주황 CG는 만나지도 평행하지도 않은 꼬인 위치이다 (보는 방향을 돌려 확인)";
    });
  });

  // 2-2 삼수선: 평면 위 점 H, 공중의 점 P(높이 h), 평면 위 직선 l
  Q.def("geo-threeperp", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ h }) => {
      clear(g);
      const p = P3(250, 175, 55, 0.5);
      for (const [A, B] of [[[-3, -1, 0], [3, -1, 0]], [[3, -1, 0], [3, 3, 0]], [[3, 3, 0], [-3, 3, 0]], [[-3, 3, 0], [-3, -1, 0]]]) seg(g, p, A, B, "gd");
      const H = [0, 0, 0], O = [0, 2, 0], P = [0, 0, h];
      seg(g, p, [-3, 2, 0], [3, 2, 0], "b");
      seg(g, p, P, H, "d"); seg(g, p, H, O, "c"); seg(g, p, P, O, "a");
      dot3(g, p, P); dot3(g, p, H, "fk"); dot3(g, p, O, "fk");
      const lab = (v, s) => { const [x, y] = p(...v); txt(g, x + 6, y - 6, s, "s"); };
      lab(P, "P"); lab(H, "H"); lab(O, "O"); lab([3, 2, 0], "l");
      read.textContent = `PH ⊥ 평면, HO ⊥ l 이면 PO ⊥ l. PO = √(PH² + HO²) = √(${num(h * h, 2)} + 4) = ${num(Math.hypot(h, 2), 3)}`;
    });
  });

  // 2-3 정사영: 길이 4인 선분이 평면과 θ를 이룬다
  Q.def("geo-proj", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ th }) => {
      clear(g);
      const r = th * Math.PI / 180, L = 4, p = P3(140, 180, 45, 0.6);
      for (const [A, B] of [[[-1, -1.5, 0], [5, -1.5, 0]], [[5, -1.5, 0], [5, 1.5, 0]], [[5, 1.5, 0], [-1, 1.5, 0]], [[-1, 1.5, 0], [-1, -1.5, 0]]]) seg(g, p, A, B, "gd");
      const A = [0, 0, 0], B = [L * Math.cos(r), 0, L * Math.sin(r)], B2 = [L * Math.cos(r), 0, 0];
      seg(g, p, A, B, "b"); seg(g, p, A, B2, "c"); seg(g, p, B, B2, "d");
      dot3(g, p, B, "fb");
      const Sx = 360, Sy = 120;
      el("rect", { x: Sx, y: Sy - 40, width: 100, height: 80, class: "lb", opacity: 0.6 }, g);
      el("rect", { x: Sx, y: Sy - 40 * Math.cos(r), width: 100, height: 80 * Math.cos(r), class: "lc", opacity: 0.6 }, g);
      txt(g, Sx + 50, 200, "판의 넓이와 그림자", "s", "middle");
      read.textContent = `θ = ${th}°: 선분 4 → 정사영 4 cos θ = ${num(L * Math.cos(r), 3)}, 넓이 S → S cos θ (${num(Math.cos(r) * 100, 1)}%)`;
    });
  });

  // 2-4 공간좌표 P(a, b, c)
  Q.def("geo-coord3", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a, b, c }) => {
      clear(g);
      const p = P3(230, 170, 30, 0.6);
      axes3(g, p, 5.5);
      const B = [[0, 0, 0], [a, 0, 0], [a, b, 0], [0, b, 0], [0, 0, c], [a, 0, c], [a, b, c], [0, b, c]];
      for (const [i, j] of [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]) seg(g, p, B[i], B[j], "gd");
      seg(g, p, [0, 0, 0], [a, b, 0], "c"); seg(g, p, [0, 0, 0], [a, b, c], "b");
      dot3(g, p, [a, b, c]);
      const d = Math.hypot(a, b, c);
      read.textContent = `P(${a}, ${b}, ${c}): 밑면 대각선 √(a² + b²) = ${num(Math.hypot(a, b), 3)}, OP = √(a² + b² + c²) = ${num(d, 3)}`;
    });
  });

  // 2-5 구 x² + y² + z² = 16 을 평면 z = k 로 자른 단면
  Q.def("geo-sphere", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), R = 4, cx = 200, cy = 115, s = 22;
    Q.bind(fig, ({ k }) => {
      clear(g);
      el("circle", { cx, cy, r: R * s, class: "b" }, g);
      el("ellipse", { cx, cy, rx: R * s, ry: R * s * 0.25, class: "gd" }, g);
      const r = Math.sqrt(Math.max(0, R * R - k * k));
      el("ellipse", { cx, cy: cy - k * s, rx: r * s, ry: r * s * 0.25, class: "la" }, g);
      el("ellipse", { cx, cy: cy - k * s, rx: r * s, ry: r * s * 0.25, class: "c" }, g);
      Q.line(g, cx, cy, cx, cy - k * s, "d"); Q.line(g, cx, cy - k * s, cx + r * s, cy - k * s, "a"); Q.line(g, cx, cy, cx + r * s, cy - k * s, "gd");
      txt(g, 330, 70, `|k| = ${num(Math.abs(k), 2)}`, "s td"); txt(g, 330, 95, `단면 반지름 ${num(r, 3)}`, "s"); txt(g, 330, 120, `반지름 R = 4`, "s");
      read.textContent = `z = ${num(k, 2)}: 단면은 반지름 √(16 − k²) = ${num(r, 3)}인 원` + (Math.abs(Math.abs(k) - R) < 1e-9 ? " (한 점에서 접한다)" : "");
    });
  });

  // 3-1 벡터의 합 a + b (평행사변형)
  Q.def("geo-vadd", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ bx, by }) => {
      clear(g);
      const F = frame(g, -2, 8, -3, 5, 40, 490, 10, 220);
      const a = [3, 1], b = [bx, by], s = [a[0] + b[0], a[1] + b[1]];
      const ar = (u, v, cls) => Q.arrow(g, F.x(u[0]), F.y(u[1]), F.x(v[0]), F.y(v[1]), cls, "f" + cls);
      Q.line(g, F.x(a[0]), F.y(a[1]), F.x(s[0]), F.y(s[1]), "gd"); Q.line(g, F.x(b[0]), F.y(b[1]), F.x(s[0]), F.y(s[1]), "gd");
      ar([0, 0], a, "b"); ar([0, 0], b, "c"); ar([0, 0], s, "d");
      read.textContent = `a = (3, 1), b = (${num(bx)}, ${num(by)}) → a + b = (${num(s[0])}, ${num(s[1])}), |a + b| = ${num(Math.hypot(...s), 3)}`;
    });
  });

  // 3-2 내분점의 위치벡터 (n a + m b)/(m + n)
  Q.def("geo-section", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ m }) => {
      clear(g);
      const n = 4 - m, F = frame(g, -1, 8, -1, 6, 40, 490, 10, 220), A = [1, 1], B = [7, 5];
      const P = [(n * A[0] + m * B[0]) / 4, (n * A[1] + m * B[1]) / 4];
      Q.line(g, F.x(A[0]), F.y(A[1]), F.x(B[0]), F.y(B[1]), "gd");
      for (const [v, cls] of [[A, "b"], [B, "c"], [P, "d"]]) Q.arrow(g, F.x(0), F.y(0), F.x(v[0]), F.y(v[1]), cls, "f" + cls);
      txt(g, F.x(A[0]) - 12, F.y(A[1]) + 4, "A", "s", "end"); txt(g, F.x(B[0]) + 6, F.y(B[1]), "B", "s"); txt(g, F.x(P[0]) + 6, F.y(P[1]) + 14, "P", "s");
      read.textContent = `AP : PB = ${num(m, 1)} : ${num(n, 1)} → p = (${num(n, 1)}a + ${num(m, 1)}b)/4 = (${num(P[0], 2)}, ${num(P[1], 2)})`;
    });
  });

  // 3-3 내적 a · b = |a||b| cos θ
  Q.def("geo-dot", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ th }) => {
      clear(g);
      const F = frame(g, -5, 6, -4, 5, 40, 490, 10, 220), r = th * Math.PI / 180, A = [4, 0], B = [3 * Math.cos(r), 3 * Math.sin(r)];
      const pr = 3 * Math.cos(r);
      Q.line(g, F.x(B[0]), F.y(B[1]), F.x(pr), F.y(0), "gd");
      el("rect", { x: Math.min(F.x(0), F.x(pr)), y: F.y(0) - 4, width: Math.abs(F.x(pr) - F.x(0)), height: 8, class: pr >= 0 ? "la" : "ld" }, g);
      Q.arrow(g, F.x(0), F.y(0), F.x(A[0]), F.y(A[1]), "b", "fb"); Q.arrow(g, F.x(0), F.y(0), F.x(B[0]), F.y(B[1]), "c", "fc");
      const d = 12 * Math.cos(r);
      read.textContent = `|a| = 4, |b| = 3, θ = ${th}°: a · b = 4 × 3 × cos θ = ${num(d, 3)}` + (Math.abs(d) < 1e-9 ? " (수직)" : d > 0 ? " (예각)" : " (둔각)");
    });
  });

  // 3-4 직선의 벡터방정식 p = a + t u
  Q.def("geo-line", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ t }) => {
      clear(g);
      const F = frame(g, -4, 8, -3, 6, 40, 490, 10, 220), A = [1, 2], u = [2, 1];
      Q.plot(g, F, (x) => A[1] + (x - A[0]) / 2, "gd");
      const P = [A[0] + t * u[0], A[1] + t * u[1]];
      Q.arrow(g, F.x(0), F.y(0), F.x(A[0]), F.y(A[1]), "b", "fb");
      Q.arrow(g, F.x(A[0]), F.y(A[1]), F.x(A[0] + u[0]), F.y(A[1] + u[1]), "c", "fc");
      Q.arrow(g, F.x(0), F.y(0), F.x(P[0]), F.y(P[1]), "d", "fd");
      read.textContent = `t = ${num(t, 2)}: p = (1, 2) + ${num(t, 2)}(2, 1) = (${num(P[0], 2)}, ${num(P[1], 2)}), 매개변수를 없애면 (x − 1)/2 = y − 2`;
    });
  });

  // 3-5 법선벡터 n = (1, 1, 2)인 평면 x + y + 2z = d
  Q.def("geo-plane", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ d }) => {
      clear(g);
      const p = P3(240, 160, 26, 0.6);
      axes3(g, p, 6);
      // 평면이 세 축과 만나는 점 (d, 0, 0), (0, d, 0), (0, 0, d/2)
      if (d > 0) {
        const X = p(d, 0, 0), Y = p(0, d, 0), Z = p(0, 0, d / 2);
        el("path", { d: `M${X[0]} ${X[1]} L${Y[0]} ${Y[1]} L${Z[0]} ${Z[1]} Z`, class: "la", opacity: 0.7 }, g);
      }
      const t = d / 6, H = [t, t, 2 * t];
      seg(g, p, [0, 0, 0], H, "d"); dot3(g, p, H);
      const n = Math.sqrt(6);
      read.textContent = `평면 x + y + 2z = ${num(d, 1)}: 원점에서의 거리 |d|/|n| = ${num(d, 1)}/√6 = ${num(d / n, 3)}, 수선의 발 (${num(t, 2)}, ${num(t, 2)}, ${num(2 * t, 2)})`;
    });
  });
})();
