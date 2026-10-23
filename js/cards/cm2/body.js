/* 공통수학2 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  // 가로·세로 눈금 간격이 같은 좌표평면 틀 (x0..x1, y0..y1, 화면 높이 H)
  const plane = (x0, x1, y0, y1, W, H) => {
    const s = Math.min((W - 40) / (x1 - x0), (H - 20) / (y1 - y0));
    const X0 = (W - s * (x1 - x0)) / 2, Y0 = (H - s * (y1 - y0)) / 2;
    return Q.frame(x0, x1, y0, y1, X0, X0 + s * (x1 - x0), Y0, Y0 + s * (y1 - y0));
  };

  // 내분점: A(−3, −1), B(5, 3)을 m : n으로
  Q.def("cm2-div", (fig, svg) => {
    const F = plane(-5, 7, -3, 5, 520, 300), A = [-3, -1], B = [5, 3];
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.axes(bg, F, { step: 1, lstep: 2 });
    Q.line(bg, F.x(A[0]), F.y(A[1]), F.x(B[0]), F.y(B[1]), "k");
    Q.line(bg, F.x(A[0]), F.y(A[1]), F.x(B[0]), F.y(A[1]), "ax dsh");
    Q.line(bg, F.x(B[0]), F.y(A[1]), F.x(B[0]), F.y(B[1]), "ax dsh");
    Q.dot(bg, F.x(A[0]), F.y(A[1]), "fk"); txt(bg, F.x(A[0]) - 8, F.y(A[1]) + 16, "A", "i", "end");
    Q.dot(bg, F.x(B[0]), F.y(B[1]), "fk"); txt(bg, F.x(B[0]) + 8, F.y(B[1]) - 6, "B", "i");
    Q.bind(fig, ({ m, n }) => {
      clear(g);
      const px = (m * B[0] + n * A[0]) / (m + n), py = (m * B[1] + n * A[1]) / (m + n);
      Q.line(g, F.x(px), F.y(py), F.x(px), F.y(A[1]), "b dsh");
      Q.line(g, F.x(px), F.y(py), F.x(B[0]), F.y(py), "b dsh");
      Q.dot(g, F.x(px), F.y(A[1]), "fb", 4); Q.dot(g, F.x(B[0]), F.y(py), "fb", 4);
      Q.dot(g, F.x(px), F.y(py), "fd", 6); txt(g, F.x(px) - 8, F.y(py) - 8, "P", "i td", "end");
      read.textContent = `P = ((${m}·5 + ${n}·(−3))/${m + n}, (${m}·3 + ${n}·(−1))/${m + n}) = (${num(px)}, ${num(py)})`;
    });
  });

  // 점과 직선 사이의 거리: P(5, 4), 3x + 4y − 12 = 0
  Q.def("cm2-pl", (fig, svg) => {
    const F = plane(-3, 8, -2, 6, 520, 300), P = [5, 4], H = [68 / 25, 24 / 25], line = (x) => (12 - 3 * x) / 4;
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.axes(bg, F, { step: 1, lstep: 2 });
    Q.plot(bg, F, line, "b");
    Q.line(bg, F.x(P[0]), F.y(P[1]), F.x(H[0]), F.y(H[1]), "c dsh");
    Q.dot(bg, F.x(H[0]), F.y(H[1]), "fc", 4); txt(bg, F.x(H[0]) - 8, F.y(H[1]) + 16, "H", "i tc", "end");
    Q.dot(bg, F.x(P[0]), F.y(P[1]), "fk", 5); txt(bg, F.x(P[0]) + 8, F.y(P[1]) - 6, "P", "i");
    Q.bind(fig, ({ t }) => {
      clear(g);
      const q = [t, line(t)], d = Math.hypot(P[0] - q[0], P[1] - q[1]);
      Q.line(g, F.x(P[0]), F.y(P[1]), F.x(q[0]), F.y(q[1]), "d");
      Q.dot(g, F.x(q[0]), F.y(q[1]), "fd", 5); txt(g, F.x(q[0]) + 8, F.y(q[1]) + 16, "Q", "i td");
      read.textContent = `PQ = ${num(d, 3)} (가장 짧은 값 PH = 19/5 = 3.8)`;
    });
  });

  // 원의 방정식: 중심 (a, b), 반지름 r, 원 위를 도는 점 P
  Q.def("cm2-circle", (fig, svg) => {
    const F = plane(-8, 8, -6, 6, 520, 320);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.axes(bg, F, { step: 1, lstep: 2 });
    let v = { a: 2, b: 1, r: 3 };
    const s = F.x(1) - F.x(0);
    const draw = (t) => {
      clear(g);
      const { a, b, r } = v, th = 0.7 + t * 0.6, px = a + r * Math.cos(th), py = b + r * Math.sin(th);
      el("circle", { cx: F.x(a), cy: F.y(b), r: r * s, class: "b" }, g);
      Q.dot(g, F.x(a), F.y(b), "fb", 4);
      Q.line(g, F.x(a), F.y(b), F.x(px), F.y(b), "c");
      Q.line(g, F.x(px), F.y(b), F.x(px), F.y(py), "a");
      Q.line(g, F.x(a), F.y(b), F.x(px), F.y(py), "k dsh");
      Q.dot(g, F.x(px), F.y(py), "fd", 5); txt(g, F.x(px) + 8, F.y(py) - 6, "P", "i td");
      const dx = px - a, dy = py - b;
      read.textContent = `(${num(px)} − ${num(a)})² + (${num(py)} − ${num(b)})² = ${num(dx * dx)} + ${num(dy * dy)} = ${num(dx * dx + dy * dy)} = r²`;
    };
    let T = 0;
    Q.bind(fig, (val) => { v = val; draw(T); });
    Q.loop(fig, (t) => { T = t; draw(t); });
  });

  // 원과 직선: x² + y² = 5, y = 2x + k
  Q.def("cm2-cl", (fig, svg) => {
    const F = plane(-6, 6, -4.5, 4.5, 520, 320), r = Math.sqrt(5), s = F.x(1) - F.x(0);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.axes(bg, F, { step: 1, lstep: 2 });
    el("circle", { cx: F.x(0), cy: F.y(0), r: r * s, class: "b" }, bg);
    Q.bind(fig, ({ k }) => {
      clear(g);
      Q.plot(g, F, (x) => 2 * x + k, "c");
      const hx = -2 * k / 5, hy = k / 5, d = Math.abs(k) / Math.sqrt(5);   // 원점에서 직선에 내린 수선의 발
      Q.line(g, F.x(0), F.y(0), F.x(hx), F.y(hy), "d");
      Q.dot(g, F.x(hx), F.y(hy), "fd", 4);
      const D4 = 25 - k * k;
      if (D4 >= 0) [(-2 * k - Math.sqrt(D4)) / 5, (-2 * k + Math.sqrt(D4)) / 5].forEach((x) => Q.dot(g, F.x(x), F.y(2 * x + k), "fc", 5));
      read.textContent = `d = |k|/√5 = ${num(d, 3)}, r = √5 ≈ 2.236, D/4 = ${num(D4)}: ` + (D4 > 0 ? "두 점에서 만난다" : D4 === 0 ? "접한다" : "만나지 않는다");
    });
  });

  // 평행이동: y = x² → y − n = (x − m)²
  Q.def("cm2-tr", (fig, svg) => {
    const F = plane(-5, 5, -3, 7, 520, 300);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.axes(bg, F, { step: 1, lstep: 2 });
    Q.plot(bg, F, (x) => x * x, "b");
    Q.bind(fig, ({ m, n }) => {
      clear(g);
      Q.plot(g, F, (x) => (x - m) ** 2 + n, "c");
      [[0, 0], [1, 1], [-1, 1]].forEach(([x, y]) => {
        Q.arrow(g, F.x(x), F.y(y), F.x(x + m), F.y(y + n), "ax dsh", "fk");
        Q.dot(g, F.x(x), F.y(y), "fb", 4); Q.dot(g, F.x(x + m), F.y(y + n), "fc", 4);
      });
      read.textContent = `y − (${num(n)}) = (x − (${num(m)}))², 꼭짓점 (0, 0) → (${num(m)}, ${num(n)})`;
    });
  });

  // 대칭이동과 가장 짧은 길: A(1, 3), B(5, 1), A′(1, −3)
  Q.def("cm2-path", (fig, svg) => {
    const F = plane(-1, 7, -4, 4, 520, 300), A = [1, 3], B = [5, 1], A2 = [1, -3];
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.axes(bg, F, { step: 1 });
    Q.line(bg, F.x(A[0]), F.y(A[1]), F.x(A2[0]), F.y(A2[1]), "gd dsh");
    [[A, "A", "fk"], [B, "B", "fk"], [A2, "A′", "fb"]].forEach(([p, s, c]) => { Q.dot(bg, F.x(p[0]), F.y(p[1]), c, 5); txt(bg, F.x(p[0]) - 8, F.y(p[1]) - 6, s, "i", "end"); });
    Q.bind(fig, ({ p }) => {
      clear(g);
      const d = (u, v) => Math.hypot(u[0] - v[0], u[1] - v[1]), P = [p, 0];
      Q.line(g, F.x(A[0]), F.y(A[1]), F.x(p), F.y(0), "c");
      Q.line(g, F.x(p), F.y(0), F.x(B[0]), F.y(B[1]), "c");
      Q.line(g, F.x(A2[0]), F.y(A2[1]), F.x(p), F.y(0), "b dsh");
      Q.dot(g, F.x(p), F.y(0), "fd", 5); txt(g, F.x(p) + 6, F.y(0) + 16, "P", "i td");
      read.textContent = `AP + PB = ${num(d(A, P), 3)} + ${num(d(P, B), 3)} = ${num(d(A, P) + d(P, B), 3)} (가장 짧을 때 4√2 ≈ 5.657)`;
    });
  });

  // 집합의 표현: n의 양의 약수
  Q.def("cm2-set", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const ds = [];
      for (let k = 1; k <= n; k++) if (n % k === 0) ds.push(k);
      for (let k = 1; k <= 36; k++) {
        const x = 20 + (k - 1) * 13.7, on = ds.includes(k);
        el("rect", { x, y: 40, width: 11, height: 26, class: on ? "lc" : "lk" }, g);
        if (on || k % 6 === 0 || k === 1) txt(g, x + 5.5, on ? 84 : 84, String(k), on ? "s tc" : "s", "middle");
      }
      txt(g, 20, 130, `원소나열법  {${ds.join(", ")}}`, "", "start");
      txt(g, 20, 165, `조건제시법  {x | x는 ${n}의 양의 약수},  원소 ${ds.length}개`, "", "start");
      read.textContent = `${n}의 양의 약수는 ${ds.length}개`;
    });
  });

  // 부분집합의 개수: 원소마다 넣는다/뺀다
  Q.def("cm2-subsets", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), E = ["a", "b", "c", "d"];
    Q.bind(fig, ({ n }) => {
      clear(g);
      const all = [];
      for (let m = 0; m < 1 << n; m++) all.push(E.slice(0, n).filter((_, i) => m >> (n - 1 - i) & 1));
      const cols = Math.min(all.length, 8), rows = Math.ceil(all.length / cols), w = 500 / cols;
      all.forEach((s, i) => {
        const x = 10 + (i % cols) * w, y = 20 + Math.floor(i / cols) * 54;
        el("rect", { x: x + 2, y, width: w - 4, height: 44, class: s.length ? "lb" : "lk" }, g);
        txt(g, x + w / 2, y + 27, s.length ? "{" + s.join(", ") + "}" : "∅", "s", "middle");
      });
      txt(g, 260, 30 + rows * 54 + 14, n ? E.slice(0, n).map(() => "2").join(" × ") + ` = ${1 << n}` : "원소가 없으면 부분집합은 ∅ 하나", "", "middle");
      read.textContent = `원소 ${n}개 → 부분집합 2^${n} = ${1 << n}개`;
    });
  });

  // 집합의 연산: 벤 다이어그램 영역 칠하기 (격자 표본으로 영역을 칠한다)
  Q.def("cm2-ops", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const names = ["A ∪ B", "A ∩ B", "A − B", "Bᶜ", "(A ∪ B)ᶜ"];
    const inA = (x, y) => (x - 200) ** 2 + (y - 125) ** 2 < 85 ** 2, inB = (x, y) => (x - 320) ** 2 + (y - 125) ** 2 < 85 ** 2;
    const test = [(a, b) => a || b, (a, b) => a && b, (a, b) => a && !b, (a, b) => !b, (a, b) => !a && !b];
    const ink = el("g", {}, svg);
    el("rect", { x: 20, y: 15, width: 480, height: 220, class: "k" }, ink);
    el("circle", { cx: 200, cy: 125, r: 85, class: "k" }, ink); el("circle", { cx: 320, cy: 125, r: 85, class: "k" }, ink);
    txt(ink, 32, 36, "U", "i"); txt(ink, 140, 70, "A", "i"); txt(ink, 372, 70, "B", "i");
    Q.bind(fig, ({ o }) => {
      clear(g);
      const st = 6;
      for (let x = 20; x < 500; x += st) for (let y = 15; y < 235; y += st) {
        if (test[o](inA(x + st / 2, y + st / 2), inB(x + st / 2, y + st / 2))) el("rect", { x, y, width: st, height: st, class: "lc" }, g);
      }
      read.textContent = `칠한 영역: ${names[o]}`;
    }, (k, v) => names[v]);
  });

  // 명제와 진리집합: U = {1, …, 24}, p: a의 배수, q: b의 배수
  Q.def("cm2-truth", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a, b }) => {
      clear(g);
      const bad = [];
      for (let k = 1; k <= 24; k++) {
        const x = 14 + ((k - 1) % 12) * 41, y = 30 + Math.floor((k - 1) / 12) * 70, p = k % a === 0, q = k % b === 0;
        el("rect", { x, y, width: 37, height: 50, class: p && !q ? "ld" : p && q ? "la" : q ? "lb" : "lk" }, g);
        txt(g, x + 18.5, y + 22, String(k), "", "middle");
        txt(g, x + 18.5, y + 40, (p ? "P" : "") + (q ? "Q" : ""), "s", "middle");
        if (p && !q) bad.push(k);
      }
      txt(g, 14, 190, "초록은 P와 Q 모두, 파랑은 Q에만, 빨강은 P에만 있는 수(반례)", "s");
      read.textContent = bad.length ? `반례 ${bad.join(", ")}: '${a}의 배수이면 ${b}의 배수이다'는 거짓` : `P ⊂ Q: '${a}의 배수이면 ${b}의 배수이다'는 참 (1~24에서)`;
    });
  });

  // 역과 대우: p: x ≤ a, q: x ≤ 3 (수직선)
  Q.def("cm2-conv", (fig, svg) => {
    const F = Q.frame(-1, 8, 0, 1, 50, 490, 0, 1), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const band = (y, from, to, cls, label, lcls) => {
      Q.line(g, F.x(from), y, F.x(to), y, cls);
      Q.dot(g, F.x(from === -1 ? to : from), y, cls.replace(/^(\w)/, "f$1"), 5);
      txt(g, 8, y + 4, label, lcls || "s", "start");
    };
    Q.bind(fig, ({ a }) => {
      clear(g);
      const y0 = 205;
      Q.line(g, 20, y0, 500, y0, "ax");
      for (let x = -1; x <= 8; x++) { Q.line(g, F.x(x), y0 - 4, F.x(x), y0 + 4, "ax"); txt(g, F.x(x), y0 + 20, String(x), "s", "middle"); }
      band(40, -1, a, "a", "P", "ta"); band(70, -1, 3, "b", "Q", "tb");
      band(110, a, 8, "c", "Pᶜ", "tc"); band(140, 3, 8, "d", "Qᶜ", "td");
      const pq = a <= 3, qp = 3 <= a;
      txt(g, 500, 30, `p → q: ${pq ? "참" : "거짓"}`, pq ? "ta" : "td", "end");
      txt(g, 500, 60, `역 q → p: ${qp ? "참" : "거짓"}`, qp ? "ta" : "td", "end");
      txt(g, 500, 130, `대우 ~q → ~p: ${pq ? "참" : "거짓"}`, pq ? "ta" : "td", "end");
      read.textContent = `P = {x | x ≤ ${num(a)}}, Q = {x | x ≤ 3}: ` + (pq ? "P ⊂ Q이므로 명제와 대우가 참" : "P ⊄ Q이므로 명제와 대우가 거짓") + (qp ? ", Q ⊂ P이므로 역은 참" : ", 역은 거짓");
    });
  });

  // 충분조건: P: −a < x < a, Q: −1 < x < 3
  Q.def("cm2-suff", (fig, svg) => {
    const F = Q.frame(-5, 5, 0, 1, 30, 490, 0, 1), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a }) => {
      clear(g);
      const y0 = 150;
      Q.line(g, 20, y0, 500, y0, "ax");
      for (let x = -5; x <= 5; x++) { Q.line(g, F.x(x), y0 - 4, F.x(x), y0 + 4, "ax"); txt(g, F.x(x), y0 + 20, num(x), "s", "middle"); }
      el("rect", { x: F.x(-1), y: 70, width: F.x(3) - F.x(-1), height: 22, class: "lb" }, g); txt(g, F.x(3) + 8, 86, "Q", "i tb");
      const inside = -a >= -1 && a <= 3;
      el("rect", { x: F.x(-a), y: 40, width: F.x(a) - F.x(-a), height: 22, class: inside ? "la" : "ld" }, g); txt(g, F.x(a) + 8, 56, "P", "i ta");
      read.textContent = inside ? `P ⊂ Q: p는 q이기 위한 충분조건, q는 p이기 위한 필요조건` : `P ⊄ Q: x = ${num(-a + 0.25)} 근처처럼 P에만 있는 수가 반례`;
    });
  });

  // 귀류법: 분모 q에서 (p/q)²이 2에 가장 가까운 p
  Q.def("cm2-sqrt2", (fig, svg) => {
    const F = Q.frame(1.9, 2.1, 0, 1, 30, 490, 0, 1), bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const y0 = 110;
    Q.line(bg, 20, y0, 500, y0, "ax");
    for (let v = 1.9; v <= 2.1001; v += 0.05) { Q.line(bg, F.x(v), y0 - 5, F.x(v), y0 + 5, "ax"); txt(bg, F.x(v), y0 + 22, v.toFixed(2), "s", "middle"); }
    Q.line(bg, F.x(2), 40, F.x(2), y0 + 5, "d dsh"); txt(bg, F.x(2), 34, "2", "td", "middle");
    Q.bind(fig, ({ q }) => {
      clear(g);
      const p = Math.round(Math.SQRT2 * q), v = (p / q) ** 2;
      for (let k = 1; k <= q; k++) { const pp = Math.round(Math.SQRT2 * k), vv = (pp / k) ** 2; if (vv > 1.9 && vv < 2.1) Q.dot(g, F.x(vv), y0, "fb", 3); }
      Q.dot(g, F.x(Math.min(2.1, Math.max(1.9, v))), y0, "fd", 6);
      read.textContent = `q = ${q}에서 가장 가까운 p = ${p}: (${p}/${q})² = ${p * p}/${q * q} ≈ ${v.toFixed(6)}, 2와의 차 ${(p * p - 2 * q * q)}/${q * q}`;
    });
  });

  // 산술평균과 기하평균: 지름 a + b = 10인 반원
  Q.def("cm2-amgm", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), u = 44, ox = 40, oy = 250;
    Q.bind(fig, ({ a }) => {
      clear(g);
      const b = 10 - a, R = 5 * u, cx = ox + R, h = Math.sqrt(a * b) * u;
      el("path", { d: `M${ox} ${oy} A${R} ${R} 0 0 1 ${ox + 2 * R} ${oy} Z`, class: "lk" }, g);
      el("path", { d: `M${ox} ${oy} A${R} ${R} 0 0 1 ${ox + 2 * R} ${oy}`, class: "k" }, g);
      Q.line(g, ox, oy, ox + 2 * R, oy, "k");
      Q.line(g, cx, oy, cx, oy - R, "b dsh");
      Q.line(g, ox + a * u, oy, ox + a * u, oy - h, "d");
      Q.line(g, ox, oy, ox + a * u, oy - h, "ax"); Q.line(g, ox + 2 * R, oy, ox + a * u, oy - h, "ax");
      Q.dot(g, ox + a * u, oy - h, "fd", 4);
      txt(g, ox + a * u / 2, oy + 18, `a = ${num(a)}`, "s", "middle");
      txt(g, ox + a * u + b * u / 2, oy + 18, `b = ${num(b)}`, "s", "middle");
      txt(g, cx + 6, oy - R + 14, "(a+b)/2 = 5", "s tb");
      txt(g, ox + a * u + 6, oy - h / 2, `√ab = ${num(Math.sqrt(a * b), 3)}`, "s td");
      read.textContent = `산술평균 5, 기하평균 √(${num(a)}×${num(b)}) = ${num(Math.sqrt(a * b), 3)}` + (a === 5 ? ": a = b이므로 같다" : ": 기하평균이 더 작다");
    });
  });

  // 함수의 뜻: X = {1, 2, 3}에서 Y = {a, b, c, d}로의 네 가지 대응
  Q.def("cm2-func", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const maps = [
      { e: [[0, 0], [1, 2], [2, 2]], ok: "함수이다 (Y의 c에 둘이 들어와도 괜찮다)" },
      { e: [[0, 1], [1, 0], [2, 3]], ok: "함수이고, 일대일함수이다" },
      { e: [[0, 0], [0, 1], [1, 2], [2, 3]], ok: "함수가 아니다: 1에서 화살표가 둘 나간다" },
      { e: [[0, 0], [2, 1]], ok: "함수가 아니다: 2에 대응하는 원소가 없다" },
    ];
    const X = [60, 115, 170], Yy = [40, 90, 140, 190];
    Q.bind(fig, ({ v }) => {
      clear(g);
      el("ellipse", { cx: 120, cy: 115, rx: 55, ry: 95, class: "lk" }, g); el("ellipse", { cx: 400, cy: 115, rx: 55, ry: 105, class: "lk" }, g);
      txt(g, 120, 14, "X", "i", "middle"); txt(g, 400, 14, "Y", "i", "middle");
      X.forEach((y, i) => { Q.dot(g, 120, y, "fk", 4); txt(g, 100, y + 5, String(i + 1), "", "end"); });
      Yy.forEach((y, i) => { Q.dot(g, 400, y, "fk", 4); txt(g, 420, y + 5, "abcd"[i], "i"); });
      const out = [0, 0, 0];
      maps[v].e.forEach(([i, j]) => { out[i]++; Q.arrow(g, 126, X[i], 392, Yy[j], "b", "fb"); });
      out.forEach((c, i) => { if (c !== 1) el("circle", { cx: 120, cy: X[i], r: 11, class: "d" }, g); });
      read.textContent = maps[v].ok;
    }, (k, x) => String(x + 1));
  });

  // 합성함수: f(x) = 0.8x, g(x) = x − 3 (천 원)
  Q.def("cm2-comp", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const box = (x, y, name, rule, cls) => { el("rect", { x, y, width: 110, height: 46, class: cls }, g); txt(g, x + 55, y + 20, name, "i", "middle"); txt(g, x + 55, y + 38, rule, "s", "middle"); };
    Q.bind(fig, ({ x }) => {
      clear(g);
      const fx = 0.8 * x, gfx = fx - 3, gx = x - 3, fgx = 0.8 * gx;
      txt(g, 30, 52, num(x), "", "middle"); box(70, 30, "f", "× 0.8", "lb"); txt(g, 225, 52, num(fx), "", "middle"); box(265, 30, "g", "− 3", "lc"); txt(g, 430, 52, num(gfx), "td", "middle");
      Q.arrow(g, 44, 53, 68, 53, "k"); Q.arrow(g, 182, 53, 205, 53, "k"); Q.arrow(g, 247, 53, 263, 53, "k"); Q.arrow(g, 377, 53, 405, 53, "k");
      txt(g, 470, 57, "g(f(x))", "s");
      txt(g, 30, 142, num(x), "", "middle"); box(70, 120, "g", "− 3", "lc"); txt(g, 225, 142, num(gx), "", "middle"); box(265, 120, "f", "× 0.8", "lb"); txt(g, 430, 142, num(fgx), "td", "middle");
      Q.arrow(g, 44, 143, 68, 143, "k"); Q.arrow(g, 182, 143, 205, 143, "k"); Q.arrow(g, 247, 143, 263, 143, "k"); Q.arrow(g, 377, 143, 405, 143, "k");
      txt(g, 470, 147, "f(g(x))", "s");
      read.textContent = `g(f(${x})) = ${num(gfx)}, f(g(${x})) = ${num(fgx)}, 차이 ${num(fgx - gfx)}(천 원)`;
    });
  });

  // 역함수: f(x) = 2x − 4 와 f⁻¹(x) = (x + 4)/2, y = x 대칭
  Q.def("cm2-inv", (fig, svg) => {
    const F = plane(-6, 6, -6, 6, 520, 320);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.axes(bg, F, { step: 1, lstep: 2 });
    Q.plot(bg, F, (x) => x, "gd dsh");
    Q.plot(bg, F, (x) => 2 * x - 4, "b");
    Q.plot(bg, F, (x) => (x + 4) / 2, "c");
    txt(bg, F.x(4.6), F.y(5.6), "y = f(x)", "s tb"); txt(bg, F.x(3.4), F.y(2.6), "y = f⁻¹(x)", "s tc");
    Q.bind(fig, ({ t }) => {
      clear(g);
      const a = t, b = 2 * t - 4;
      Q.line(g, F.x(a), F.y(b), F.x(b), F.y(a), "d dsh");
      Q.dot(g, F.x(a), F.y(b), "fb", 5); Q.dot(g, F.x(b), F.y(a), "fc", 5);
      read.textContent = `(${num(a)}, ${num(b)})는 y = f(x) 위, (${num(b)}, ${num(a)})는 y = f⁻¹(x) 위`;
    });
  });

  // 유리함수: y = k/(x − p) + q
  Q.def("cm2-rat", (fig, svg) => {
    const F = plane(-7, 7, -6, 7, 520, 320);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.axes(bg, F, { step: 1, lstep: 2 });
    Q.bind(fig, ({ k, p, q }) => {
      clear(g);
      Q.line(g, F.x(p), F.Y0, F.x(p), F.Y1, "d dsh"); Q.line(g, F.X0, F.y(q), F.X1, F.y(q), "d dsh");
      if (k === 0) { Q.plot(g, F, () => q, "b"); read.textContent = "k = 0이면 직선 y = q (유리함수의 그래프가 아니다)"; return; }
      Q.plot(g, F, (x) => k / (x - p) + q, "b", F.x0, p - 1e-3, 400);
      Q.plot(g, F, (x) => k / (x - p) + q, "b", p + 1e-3, F.x1, 400);
      Q.dot(g, F.x(p), F.y(q), "fd", 4);
      read.textContent = `y = ${k}/(x − (${p})) + (${q}): 점근선 x = ${p}, y = ${q}, 대칭의 중심 (${p}, ${q})`;
    });
  });

  // 무리함수: y = √(a(x − p)) + q
  Q.def("cm2-sqrt", (fig, svg) => {
    const F = plane(-7, 7, -4, 6, 520, 300);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.axes(bg, F, { step: 1, lstep: 2 });
    Q.bind(fig, ({ a, p, q }) => {
      clear(g);
      if (a === 0) { read.textContent = "a = 0이면 y = q인 상수함수가 된다"; Q.plot(g, F, () => q, "b"); return; }
      const f = (x) => (a * (x - p) >= 0 ? Math.sqrt(a * (x - p)) + q : NaN);
      if (a > 0) Q.plot(g, F, f, "b", p, F.x1, 400); else Q.plot(g, F, f, "b", F.x0, p, 400);
      Q.dot(g, F.x(p), F.y(q), "fd", 5);
      read.textContent = `시작점 (${p}, ${q}), 정의역 x ${a > 0 ? "≥" : "≤"} ${p}, 치역 y ≥ ${q}`;
    });
  });

  // 수직: 기울기 m인 직선과 90° 돌린 직선
  Q.def("cm2-perp", (fig, svg) => {
    const F = plane(-4, 4, -3, 3, 520, 300);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.axes(bg, F, { step: 1 });
    Q.bind(fig, ({ m }) => {
      clear(g);
      const L = 2 / Math.hypot(1, m), p = L, q = m * L;   // Q(p, q): 원점에서 길이 2
      Q.plot(g, F, (x) => m * x, "b");
      if (m !== 0) Q.plot(g, F, (x) => -x / m, "c"); else Q.line(g, F.x(0), F.Y0, F.x(0), F.Y1, "c");
      el("path", { d: `M${F.x(0)} ${F.y(0)} L${F.x(p)} ${F.y(0)} L${F.x(p)} ${F.y(q)} Z`, class: "lb" }, g);
      el("path", { d: `M${F.x(0)} ${F.y(0)} L${F.x(0)} ${F.y(p)} L${F.x(-q)} ${F.y(p)} Z`, class: "lc" }, g);
      Q.dot(g, F.x(p), F.y(q), "fb", 5); txt(g, F.x(p) + 8, F.y(q) + 4, "Q", "i tb");
      Q.dot(g, F.x(-q), F.y(p), "fc", 5); txt(g, F.x(-q) - 8, F.y(p) - 6, "Q′", "i tc", "end");
      read.textContent = m === 0 ? "기울기 0인 직선에 수직인 직선은 y축에 평행하다 (기울기가 없다)" : `기울기 ${num(m)}와 ${num(-1 / m, 3)}, 곱 = ${num(m * (-1 / m))}`;
    });
  });
})();
