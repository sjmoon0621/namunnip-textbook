/* 공통수학1 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;

  // 다항식의 연산: (x+3)(x+2) 넓이 모형
  Q.def("cm1-poly-area", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ x }) => {
      clear(g);
      const u = 30, oy = 20, W = (x + 3) * u, H = (x + 2) * u;
      const s = Math.min(1, 420 / W, 250 / H), a = x * u * s, b3 = 3 * u * s, b2 = 2 * u * s, ox = (520 - a - b3) / 2;
      el("rect", { x: ox, y: oy, width: a, height: a, class: "la" }, g);
      el("rect", { x: ox + a, y: oy, width: b3, height: a, class: "lb" }, g);
      el("rect", { x: ox, y: oy + a, width: a, height: b2, class: "lb" }, g);
      el("rect", { x: ox + a, y: oy + a, width: b3, height: b2, class: "lc" }, g);
      el("rect", { x: ox, y: oy, width: a + b3, height: a + b2, class: "k" }, g);
      Q.line(g, ox + a, oy, ox + a, oy + a + b2, "k");
      Q.line(g, ox, oy + a, ox + a + b3, oy + a, "k");
      txt(g, ox + a / 2, oy + a / 2 + 5, "x²", "", "middle");
      txt(g, ox + a + b3 / 2, oy + a / 2 + 5, "3x", "", "middle");
      txt(g, ox + a / 2, oy + a + b2 / 2 + 5, "2x", "", "middle");
      txt(g, ox + a + b3 / 2, oy + a + b2 / 2 + 5, "6", "", "middle");
      txt(g, ox + a / 2, oy + a + b2 + 18, "x", "s", "middle");
      txt(g, ox + a + b3 / 2, oy + a + b2 + 18, "3", "s", "middle");
      txt(g, ox - 8, oy + a / 2 + 4, "x", "s", "end");
      txt(g, ox - 8, oy + a + b2 / 2 + 4, "2", "s", "end");
      const area = (x + 3) * (x + 2);
      read.textContent = `넓이 (x + 3)(x + 2) = ${num(x + 3)} × ${num(x + 2)} = ${num(area)}, 식 x² + 5x + 6에 넣으면 ${num(x * x)} + ${num(5 * x)} + 6 = ${num(x * x + 5 * x + 6)}`;
    });
  });

  // 나머지정리: P(x) = x³ − 2x² − 5x + 6, x = a에서의 높이
  Q.def("cm1-rem", (fig, svg) => {
    const P = (x) => x ** 3 - 2 * x * x - 5 * x + 6;
    const F = Q.frame(-3.5, 4.5, -12, 12, 20, 500, 10, 290);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.axes(bg, F, { step: 1, lstep: 2 });
    Q.plot(bg, F, P, "b");
    Q.bind(fig, ({ a }) => {
      clear(g);
      const r = P(a);
      Q.line(g, F.x(a), F.y(0), F.x(a), F.y(Math.max(-12, Math.min(12, r))), r === 0 ? "a" : "d");
      Q.dot(g, F.x(a), F.y(Math.max(-12, Math.min(12, r))), r === 0 ? "fa" : "fd", 5);
      read.textContent = `x − (${num(a)})로 나눈 나머지 = P(${num(a)}) = ${num(r, 3)}` + (r === 0 ? ", 나누어떨어진다" : "");
    });
  });

  // 인수분해: a² − b² L자 도형 → (a+b)(a−b) 직사각형 (a = 5)
  Q.def("cm1-sqdiff", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ b, t }) => {
      clear(g);
      const a = 5, u = 38, ox = 40, oy = 16, ab = a - b;
      // 고정 조각: 왼쪽 a × (a−b) 아래 띠가 아니라, 위 띠 a × (a−b) 를 두고 오른쪽 아래 (a−b) × b 를 옮긴다
      el("rect", { x: ox, y: oy, width: a * u, height: ab * u, class: "la" }, g);
      el("rect", { x: ox, y: oy, width: a * u, height: ab * u, class: "k" }, g);
      // 옮기는 조각: 처음 위치 (x: 0~a−b, y: a−b~a) 크기 (a−b)×b → 회전해 오른쪽 (x: a~a+b, y: 0~a−b)
      const x0 = ox, y0 = oy + ab * u, x1 = ox + a * u, y1 = oy;
      const cx = x0 + (x1 - x0) * t, cy = y0 + (y1 - y0) * t;
      const w = ab * u + (b * u - ab * u) * t, h = b * u + (ab * u - b * u) * t;
      el("rect", { x: cx, y: cy, width: w, height: h, class: "lb" }, g);
      el("rect", { x: cx, y: cy, width: w, height: h, class: "b" }, g);
      if (t === 0) el("rect", { x: ox + ab * u, y: oy + ab * u, width: b * u, height: b * u, class: "gd dsh" }, g);
      txt(g, ox + a * u / 2, oy - 2 + 14, "", "s", "middle");
      txt(g, ox + a * u / 2, oy + ab * u / 2 + 5, `${num(a)} × ${num(ab)}`, "", "middle");
      txt(g, cx + w / 2, cy + h / 2 + 5, `${num(ab)} × ${num(b)}`, "tb", "middle");
      if (t === 1) {
        txt(g, ox + (a + b) * u / 2, oy + ab * u + 20, `가로 a + b = ${num(a + b)}`, "s", "middle");
        txt(g, ox + (a + b) * u + 8, oy + ab * u / 2 + 4, `세로 a − b = ${num(ab)}`, "s");
      }
      read.textContent = `a = 5, b = ${num(b)}일 때 a² − b² = ${num(a * a - b * b)}, (a + b)(a − b) = ${num(a + b)} × ${num(ab)} = ${num((a + b) * ab)}`;
    });
  });

  // 복소수: i의 거듭제곱이 네 자리를 돈다
  Q.def("cm1-ipow", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const cx = 260, cy = 130, R = 90, pos = [[1, 0], [0, -1], [-1, 0], [0, 1]], name = ["1", "i", "−1", "−i"];
    el("circle", { cx, cy, r: R, class: "gd" }, svg);
    pos.forEach(([px, py], k) => txt(svg, cx + px * (R + 26), cy + py * (R + 18) + 5, name[k], "i", "middle"));
    Q.bind(fig, ({ n }) => {
      clear(g);
      for (let k = 0; k < Math.min(n, 12); k++) {
        const [ax, ay] = pos[k % 4], [bx, by] = pos[(k + 1) % 4];
        const off = 4 + Math.floor(k / 4) * 6;
        el("path", { d: `M${cx + ax * (R - off)} ${cy + ay * (R - off)} Q${cx + (ax + bx) * (R - off) * .75} ${cy + (ay + by) * (R - off) * .75} ${cx + bx * (R - off)} ${cy + by * (R - off)}`, class: "b" }, g);
      }
      const [px, py] = pos[n % 4];
      Q.dot(g, cx + px * R, cy + py * R, "fd", 7);
      read.textContent = `i의 ${n}제곱 = ${name[n % 4]} (${n}을 4로 나눈 나머지가 ${n % 4})`;
    });
  });

  // 이차함수 그래프 하나와 x축 교점 (판별식·이차함수 절에서 함께 쓴다)
  function quadFig(fig, svg, f, info, box) {
    const F = Q.frame(...(box || [-3, 5, -5, 7]), 20, 500, 10, 270);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.axes(bg, F, { step: 1 });
    Q.bind(fig, (v) => {
      clear(g);
      const { a, b, c } = f(v);
      Q.plot(g, F, (x) => a * x * x + b * x + c, "b");
      const D = b * b - 4 * a * c;
      if (D >= 0) [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)].forEach((r) => Q.dot(g, F.x(r), F.y(0), "fd", 5));
      read.textContent = info(v, D);
    });
  }
  Q.def("cm1-vieta", (fig, svg) => quadFig(fig, svg, ({ p, q }) => ({ a: 1, b: -(p + q), c: p * q }),
    ({ p, q }) => `x² − (${num(p + q)})x + (${num(p * q)}) = 0: 두 근의 합 ${num(p + q)}, 곱 ${num(p * q)}`, [-5, 5, -6, 8]));
  // y = x² − 4x + k. 허근일 때는 꼭짓점을 지나는 가로선에 대해 뒤집은 포물선을 점선으로 겹쳐, 그 x절편으로 허근의 실수부분과 허수부분을 보인다
  Q.def("cm1-qf", (fig, svg) => {
    const F = Q.frame(-2, 6, -4, 8, 20, 500, 10, 270);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.axes(bg, F, { step: 1 });
    Q.bind(fig, ({ k }) => {
      clear(g);
      const q = k - 4;
      Q.plot(g, F, (x) => (x - 2) ** 2 + q, "b");
      if (q <= 0) {
        [2 - Math.sqrt(-q), 2 + Math.sqrt(-q)].forEach((r) => Q.dot(g, F.x(r), F.y(0), "fd", 5));
        read.textContent = `꼭짓점 (2, ${num(q)}), D/4 = ${num(-q)}: ` + (q < 0 ? "x축과 두 점에서 만난다" : "x축에 접한다");
      } else {
        Q.plot(g, F, (x) => q - (x - 2) ** 2, "c dsh");
        const s = Math.sqrt(q);
        [2 - s, 2 + s].forEach((r) => Q.dot(g, F.x(r), F.y(0), "fc", 5));
        read.textContent = `꼭짓점 (2, ${num(q)}), D/4 = ${num(-q)}: x축과 만나지 않는다. 뒤집은 점선은 x = 2 ± ${num(s)}에서 x축과 만나고, 허근은 2 ± ${s === 1 ? "" : num(s)}i`;
      }
    });
  });
  // 포물선 y = x²과 직선 y = 2x + k
  Q.def("cm1-lp", (fig, svg) => {
    const F = Q.frame(-3, 4, -3, 10, 20, 500, 10, 270);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.axes(bg, F, { step: 1, lstep: 2 });
    Q.plot(bg, F, (x) => x * x, "b");
    Q.bind(fig, ({ k }) => {
      clear(g);
      Q.plot(g, F, (x) => 2 * x + k, "c");
      const D4 = 1 + k;
      if (D4 >= 0) [1 - Math.sqrt(D4), 1 + Math.sqrt(D4)].forEach((r) => Q.dot(g, F.x(r), F.y(r * r), "fd", 5));
      read.textContent = `x² − 2x − (${num(k)}) = 0의 D/4 = ${num(D4)}: ` + (D4 > 0 ? "두 점에서 만난다" : D4 === 0 ? "점 (1, 1)에서 접한다" : "만나지 않는다");
    });
  });
  // 최대·최소: y = x² − 4x + 1, 범위 [p, p + 2]
  Q.def("cm1-minmax", (fig, svg) => {
    const f = (x) => x * x - 4 * x + 1;
    const F = Q.frame(-2, 7, -4, 12, 20, 500, 10, 270);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.axes(bg, F, { step: 1, lstep: 2 });
    Q.plot(bg, F, f, "gd");
    Q.bind(fig, ({ p }) => {
      clear(g);
      const q = p + 2;
      el("rect", { x: F.x(p), y: F.Y0, width: F.x(q) - F.x(p), height: F.Y1 - F.Y0, class: "lk", opacity: .6 }, g);
      Q.plot(g, F, f, "b", p, q);
      const cand = [p, q];
      if (p <= 2 && 2 <= q) cand.push(2);
      let lo = cand[0], hi = cand[0];
      cand.forEach((x) => { if (f(x) < f(lo)) lo = x; if (f(x) > f(hi)) hi = x; });
      Q.dot(g, F.x(lo), F.y(f(lo)), "fb", 6);
      Q.dot(g, F.x(hi), F.y(f(hi)), "fd", 6);
      read.textContent = `${num(p)} ≤ x ≤ ${num(q)}: 최솟값 ${num(f(lo))} (x = ${num(lo)}), 최댓값 ${num(f(hi))} (x = ${num(hi)})`;
    });
  });
  // 삼차방정식: 상자의 부피 V = x(10 − 2x)(8 − 2x)
  Q.def("cm1-cubic", (fig, svg) => {
    const V = (x) => x * (10 - 2 * x) * (8 - 2 * x);
    const F = Q.frame(-0.5, 7, -60, 80, 30, 500, 10, 270);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.axes(bg, F, { step: 1, label: false });
    for (let x = 1; x <= 7; x++) txt(bg, F.x(x), F.y(0) + 14, String(x), "s", "middle");
    for (let y = -40; y <= 80; y += 20) if (y) txt(bg, F.x(0) - 5, F.y(y) + 4, num(y), "s", "end");
    el("rect", { x: F.x(4), y: F.Y0, width: F.X1 - F.x(4), height: F.Y1 - F.Y0, class: "lk", opacity: .7 }, bg);
    txt(bg, F.x(5.5), F.Y0 + 16, "x > 4는 상자가 안 된다", "s", "middle");
    Q.plot(bg, F, V, "b");
    Q.line(bg, F.X0, F.y(48), F.X1, F.y(48), "c dsh");
    txt(bg, F.X1 - 4, F.y(48) - 6, "V = 48", "tc", "end");
    [1, 2, 6].forEach((r) => Q.dot(bg, F.x(r), F.y(48), "fc", 4));
    Q.bind(fig, ({ x }) => {
      clear(g);
      Q.line(g, F.x(x), F.y(0), F.x(x), F.y(V(x)), "d");
      Q.dot(g, F.x(x), F.y(V(x)), "fd", 5);
      read.textContent = `높이 ${num(x)}, 밑면 ${num(10 - 2 * x)} × ${num(8 - 2 * x)}, 부피 ${num(V(x))}` + (Math.abs(V(x) - 48) < 1e-9 ? " = 48" : "");
    });
  });
  // 연립이차방정식: 원 x² + y² = 25와 직선 x + y = c
  Q.def("cm1-sys", (fig, svg) => {
    const F = Q.frame(-8, 8, -6, 7, 30, 490, 10, 384);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.axes(bg, F, { step: 1, lstep: 5 });
    el("ellipse", { cx: F.x(0), cy: F.y(0), rx: F.x(5) - F.x(0), ry: F.y(0) - F.y(5), class: "b" }, bg);
    Q.bind(fig, ({ c }) => {
      clear(g);
      Q.plot(g, F, (x) => c - x, "c");
      const D4 = 50 - c * c;
      if (D4 >= 0) [(c - Math.sqrt(D4)) / 2, (c + Math.sqrt(D4)) / 2].forEach((x) => Q.dot(g, F.x(x), F.y(c - x), "fd", 5));
      read.textContent = `x + y = ${num(c)}을 대입하면 D/4 = 50 − ${num(c * c)} = ${num(D4)}: ` + (D4 > 0 ? `교점 두 개 (x = ${num((c - Math.sqrt(D4)) / 2)}, ${num((c + Math.sqrt(D4)) / 2)})` : D4 === 0 ? "접한다" : "만나지 않는다");
    });
  });
  // 연립일차부등식: x ≥ a 와 x ≤ b 의 공통부분
  Q.def("cm1-lin", (fig, svg) => {
    const F = Q.frame(-3, 9, 0, 1, 30, 490, 0, 1);
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a, b }) => {
      clear(g);
      const y0 = 150;
      Q.line(g, 20, y0, 500, y0, "ax");
      for (let x = -3; x <= 9; x++) { Q.line(g, F.x(x), y0 - 4, F.x(x), y0 + 4, "ax"); txt(g, F.x(x), y0 + 20, num(x), "s", "middle"); }
      Q.line(g, F.x(a), 70, 500, 70, "a"); Q.dot(g, F.x(a), 70, "fa", 5); txt(g, 500, 60, `x ≥ ${num(a)}`, "ta", "end");
      Q.line(g, 20, F.x(0) * 0 + 100, F.x(b), 100, "b"); Q.dot(g, F.x(b), 100, "fb", 5); txt(g, 24, 90, `x ≤ ${num(b)}`, "tb");
      if (a <= b) {
        el("rect", { x: F.x(a), y: y0 - 7, width: Math.max(F.x(b) - F.x(a), 0.1), height: 14, class: "lc" }, g);
        Q.line(g, F.x(a), y0, F.x(b), y0, "c");
        Q.dot(g, F.x(a), y0, "fc", 5); Q.dot(g, F.x(b), y0, "fc", 5);
        read.textContent = a === b ? `공통부분은 한 점 x = ${num(a)}` : `공통부분 ${num(a)} ≤ x ≤ ${num(b)}`;
      } else read.textContent = "두 해가 겹치지 않으므로 연립부등식의 해가 없다";
    });
  });
  // 절댓값 부등식: |x − a| ≤ r
  Q.def("cm1-abs", (fig, svg) => {
    const F = Q.frame(-8, 8, 0, 1, 30, 490, 0, 1);
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a, r }) => {
      clear(g);
      const y0 = 110;
      Q.line(g, 20, y0, 500, y0, "ax");
      for (let x = -8; x <= 8; x++) { Q.line(g, F.x(x), y0 - 4, F.x(x), y0 + 4, "ax"); if (x % 2 === 0) txt(g, F.x(x), y0 + 22, num(x), "s", "middle"); }
      el("rect", { x: F.x(a - r), y: y0 - 8, width: F.x(a + r) - F.x(a - r), height: 16, class: "lc" }, g);
      Q.line(g, F.x(a - r), y0, F.x(a + r), y0, "c");
      Q.dot(g, F.x(a - r), y0, "fc", 5); Q.dot(g, F.x(a + r), y0, "fc", 5);
      Q.dot(g, F.x(a), y0, "fd", 4);
      Q.arrow(g, F.x(a), 60, F.x(a + r), 60, "d", "fd"); Q.arrow(g, F.x(a), 60, F.x(a - r), 60, "d", "fd");
      txt(g, F.x(a + r / 2), 50, `r = ${num(r)}`, "td", "middle"); txt(g, F.x(a - r / 2), 50, `r = ${num(r)}`, "td", "middle");
      read.textContent = `|x − (${num(a)})| ≤ ${num(r)}  ⇔  ${num(a - r)} ≤ x ≤ ${num(a + r)}`;
    });
  });
  // 이차부등식: x² − 4x + k < 0 의 범위
  Q.def("cm1-qineq", (fig, svg) => {
    const F = Q.frame(-2, 6, -4, 8, 20, 500, 10, 270);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.axes(bg, F, { step: 1, lstep: 2 });
    Q.bind(fig, ({ k }) => {
      clear(g);
      const D4 = 4 - k;
      if (D4 > 0) {
        const p = 2 - Math.sqrt(D4), q = 2 + Math.sqrt(D4);
        el("rect", { x: F.x(p), y: F.y(0) - 6, width: F.x(q) - F.x(p), height: 12, class: "ld" }, g);
        Q.plot(g, F, (x) => x * x - 4 * x + k, "d", p, q);
        read.textContent = `x² − 4x + ${num(k)} < 0의 해: ${num(p)} < x < ${num(q)}`;
      } else read.textContent = D4 === 0 ? "그래프가 x축에 접하므로 x² − 4x + 4 < 0의 해는 없다" : "그래프가 x축보다 위에 있으므로 해가 없다";
      Q.plot(g, F, (x) => x * x - 4 * x + k, "b");
      if (D4 > 0) Q.plot(g, F, (x) => x * x - 4 * x + k, "d", 2 - Math.sqrt(D4), 2 + Math.sqrt(D4));
    });
  });
  // 곱의 법칙: m × n 격자
  Q.def("cm1-prod", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ m, n }) => {
      clear(g);
      const s = Math.min(52, 380 / n, 220 / m), ox = 110, oy = 24;
      for (let j = 0; j < n; j++) txt(g, ox + (j + .5) * s, oy - 6, "바지" + (j + 1), "s", "middle");
      for (let i = 0; i < m; i++) {
        txt(g, ox - 8, oy + (i + .5) * s + 4, "티셔츠" + (i + 1), "s", "end");
        for (let j = 0; j < n; j++) el("rect", { x: ox + j * s + 2, y: oy + i * s + 2, width: s - 4, height: s - 4, class: (i + j) % 2 ? "lb" : "la" }, g);
      }
      read.textContent = `${m}줄 × ${n}칸 = ${m * n}가지`;
    });
  });
  // 순열: 자리마다 남은 사람 수
  Q.def("cm1-perm", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), rIn = fig.querySelector('input[data-k="r"]');
    Q.bind(fig, ({ n, r }) => {
      if (r > n) { rIn.value = n; r = n; fig.querySelector('output[data-k="r"]').textContent = n; }
      clear(g);
      const w = Math.min(56, 460 / r), ox = (520 - w * r) / 2;
      let prod = 1;
      for (let k = 0; k < r; k++) {
        el("rect", { x: ox + k * w + 3, y: 60, width: w - 6, height: w - 6, class: "lb" }, g);
        txt(g, ox + (k + .5) * w, 60 + (w - 6) / 2 + 6, String(n - k), "", "middle");
        txt(g, ox + (k + .5) * w, 50, `${k + 1}번째`, "s", "middle");
        if (k) txt(g, ox + k * w, 60 + (w - 6) / 2 + 6, "×", "s", "middle");
        prod *= n - k;
      }
      read.textContent = `${n}P${r} = ` + Array.from({ length: r }, (_, k) => n - k).join(" × ") + ` = ${prod}`;
    });
  });
  // 조합: 60가지 순열을 10개 묶음(6개씩)으로
  Q.def("cm1-comb", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), P = "ABCDE";
    const sets = [];
    for (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) for (let c = b + 1; c < 5; c++) sets.push([a, b, c]);
    const perms = (s) => [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map((p) => p.map((i) => P[s[i]]).join(""));
    Q.bind(fig, ({ k }) => {
      clear(g);
      sets.forEach((s, i) => {
        const col = i % 5, row = Math.floor(i / 5), x = 14 + col * 100, y = 14 + row * 116;
        el("rect", { x, y, width: 92, height: 106, class: i === k ? "lc" : "lk" }, g);
        perms(s).forEach((w, j) => txt(g, x + 46, y + 16 + j * 15, w, i === k ? "" : "s", "middle"));
      });
      read.textContent = `묶음 ${k + 1}: {${sets[k].map((i) => P[i]).join(", ")}}를 늘어놓는 6가지 → 조합으로는 1가지`;
    }, (key, v) => String(v + 1));
  });
  // 행렬의 뜻: 세 도시 노선도 ↔ 3×3 행렬
  Q.def("cm1-road", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const sets = [
      [[0, 2, 0], [1, 0, 1], [1, 0, 0]],
      [[0, 1, 1], [1, 0, 2], [0, 1, 0]],
      [[0, 0, 2], [2, 0, 0], [0, 1, 0]],
      [[0, 1, 1], [1, 0, 1], [1, 1, 0]],
    ];
    const pos = [[70, 50], [210, 50], [140, 190]];
    Q.bind(fig, ({ v }) => {
      clear(g);
      const M = sets[v];
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
        if (!M[i][j]) continue;
        const [x1, y1] = pos[i], [x2, y2] = pos[j], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
        const nx = -dy / L * 8, ny = dx / L * 8;   // 왕복 노선을 비켜 그린다
        Q.arrow(g, x1 + dx * .17 + nx, y1 + dy * .17 + ny, x2 - dx * .17 + nx, y2 - dy * .17 + ny, "b", "fb");
        txt(g, (x1 + x2) / 2 + nx * 2.2, (y1 + y2) / 2 + ny * 2.2 + 4, String(M[i][j]), "tb", "middle");
      }
      pos.forEach(([x, y], k) => { el("circle", { cx: x, cy: y, r: 16, class: "lk" }, g); el("circle", { cx: x, cy: y, r: 16, class: "k" }, g); txt(g, x, y + 5, String(k + 1), "", "middle"); });
      const ox = 330, oy = 60, s = 44;
      el("path", { d: `M${ox - 6} ${oy - 20} Q${ox - 16} ${oy + 54} ${ox - 6} ${oy + 128}`, class: "k" }, g);
      el("path", { d: `M${ox + 3 * s + 2} ${oy - 20} Q${ox + 3 * s + 12} ${oy + 54} ${ox + 3 * s + 2} ${oy + 128}`, class: "k" }, g);
      for (let i = 0; i < 3; i++) {
        txt(g, ox - 22, oy + i * s + 5, `${i + 1}행`, "s", "end");
        txt(g, ox + i * s + s / 2, oy - 26, `${i + 1}열`, "s", "middle");
        for (let j = 0; j < 3; j++) txt(g, ox + j * s + s / 2, oy + i * s + 5, String(M[i][j]), M[i][j] ? "tb" : "", "middle");
      }
      txt(g, ox + 1.5 * s, oy + 3 * s + 14, "행 = 출발, 열 = 도착", "s", "middle");
      read.textContent = `(1, 2) 성분 ${M[0][1]}: 1 → 2 노선 ${M[0][1]}개, (2, 1) 성분 ${M[1][0]}: 2 → 1 노선 ${M[1][0]}개`;
    }, (k, x) => String(x + 1));
  });
  // 행렬의 곱: 판매량 A(2×2) × 가격 P(2×2: 월요일 가격, 화요일 할인 가격)
  Q.def("cm1-mmul", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const A = [[30, 20], [25, 40]], P = [[4, 3], [3, 2]];
    const C = [[0, 0], [0, 0]].map((r, i) => r.map((_, j) => A[i][0] * P[0][j] + A[i][1] * P[1][j]));
    const mat = (M, ox, oy, s, hiR, hiC, name) => {
      el("path", { d: `M${ox - 4} ${oy - 22} Q${ox - 12} ${oy + s / 2} ${ox - 4} ${oy + 2 * s - 18}`, class: "k" }, g);
      el("path", { d: `M${ox + 2 * s + 4} ${oy - 22} Q${ox + 2 * s + 12} ${oy + s / 2} ${ox + 2 * s + 4} ${oy + 2 * s - 18}`, class: "k" }, g);
      if (hiR != null) el("rect", { x: ox, y: oy + hiR * s - 20, width: 2 * s, height: 28, class: "la" }, g);
      if (hiC != null) el("rect", { x: ox + hiC * s + 4, y: oy - 22, width: s - 8, height: 2 * s - 4, class: "lb" }, g);
      M.forEach((r, i) => r.forEach((v, j) => txt(g, ox + j * s + s / 2, oy + i * s, String(v), "", "middle")));
      txt(g, ox + s, oy + 2 * s + 6, name, "s", "middle");
    };
    Q.bind(fig, ({ c }) => {
      clear(g);
      const i = c >> 1, j = c & 1;
      mat(A, 30, 80, 50, i, null, "판매량 (행: 지점, 열: 메뉴)");
      txt(g, 148, 105, "×", "", "middle");
      mat(P, 170, 80, 50, null, j, "가격 (열: 월, 화)");
      txt(g, 290, 105, "=", "", "middle");
      mat(C, 320, 80, 60, null, null, "매출 (천 원)");
      el("rect", { x: 320 + j * 60 + 5, y: 80 + i * 60 - 20, width: 50, height: 28, class: "lc" }, g);
      txt(g, 320 + j * 60 + 30, 80 + i * 60, String(C[i][j]), "", "middle");
      read.textContent = `(${i + 1}, ${j + 1}) 성분 = ${A[i][0]}×${P[0][j]} + ${A[i][1]}×${P[1][j]} = ${C[i][j]}`;
    }, (k, x) => `(${(x >> 1) + 1}, ${(x & 1) + 1})`);
  });
  Q.def("cm1-disc", (fig, svg) => quadFig(fig, svg, ({ c }) => ({ a: 1, b: -2, c }),
    ({ c }, D) => `D/4 = 1 − c = ${num(D / 4)}: ` + (D > 0 ? "서로 다른 두 실근" : D === 0 ? "중근 x = 1" : "서로 다른 두 허근 (x축과 만나지 않음)")));
})();
