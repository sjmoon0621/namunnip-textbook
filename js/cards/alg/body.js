/* 대수 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const graph = (svg, box, opt) => {
    const F = Q.frame(...box, 30, 500, 10, (opt && opt.H) || 290);
    const bg = el("g", {}, svg), g = el("g", {}, svg);
    Q.axes(bg, F, (opt && opt.axes) || { step: 1 });
    return { F, bg, g };
  };

  // 거듭제곱근: y = x^n 과 y = a
  Q.def("alg-root", (fig, svg) => {
    const { F, g } = graph(svg, [-3, 3, -10, 10], { axes: { step: 1, lstep: 2 } });
    const read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n, a }) => {
      clear(g);
      Q.plot(g, F, (x) => x ** n, "b", -3, 3, 400);
      Q.plot(g, F, () => a, "c");
      const roots = [];
      if (n % 2) roots.push(Math.sign(a) * Math.abs(a) ** (1 / n));
      else if (a > 0) roots.push(a ** (1 / n), -(a ** (1 / n)));
      else if (a === 0) roots.push(0);
      roots.forEach((r) => Q.dot(g, F.x(r), F.y(a), "fd", 5));
      read.textContent = `x^${n} = ${a}의 실근 ${roots.length}개` + (roots.length ? `: ${roots.map((r) => num(r, 3)).join(", ")}` : " (짝수 거듭제곱은 음수가 될 수 없다)");
    });
  });

  // 수학적 귀납법: 도미노 (b번째 이음이 끊김, 0이면 끊김 없음)
  Q.def("alg-domino", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ t, b }) => {
      clear(g);
      Q.line(g, 10, 150, 510, 150, "k");
      let fallen = 0;
      for (let i = 1; i <= 12; i++) {
        const x = 20 + (i - 1) * 40, down = i <= t && (b === 0 || i <= b);
        if (down) fallen = i;
        const ang = down ? 62 : 0, r = ang * Math.PI / 180, h = 70, w = 10;
        const pts = [[0, 0], [w, 0], [w, -h], [0, -h]].map(([px, py]) => [x + px * Math.cos(r) - py * Math.sin(r), 150 + px * Math.sin(r) + py * Math.cos(r)]);
        el("path", { d: "M" + pts.map((p) => p.join(" ")).join("L") + "Z", class: down ? "ld" : "lb" }, g);
        el("path", { d: "M" + pts.map((p) => p.join(" ")).join("L") + "Z", class: "k" }, g);
        txt(g, x + 5, 170, String(i), "s", "middle");
        if (b && i === b) { Q.line(g, x + 25, 60, x + 25, 150, "d dsh"); txt(g, x + 25, 54, "끊김", "s td", "middle"); }
      }
      read.textContent = b ? `${b}번에서 ${b + 1}번으로 넘어가는 단계가 없어 ${b}번 뒤로는 쓰러지지 않는다` : `첫 도미노와 'k번이 쓰러지면 k+1번도 쓰러진다'가 있으면 ${fallen}번까지, 계속하면 모두 쓰러진다`;
    }, (k, v) => k === "b" ? (v ? `${v}번 뒤` : "없음") : String(v));
  });

  // 귀납적 정의: 2 × n 판 타일링, 끝을 세로 1개 / 가로 2개로
  Q.def("alg-tiling", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const a = [0, 1, 2]; for (let k = 3; k <= 12; k++) a[k] = a[k - 1] + a[k - 2];
    const board = (x, y, n, u, endKind) => {
      for (let i = 0; i < n; i++) el("rect", { x: x + i * u, y, width: u, height: 2 * u, class: "gd" }, g);
      if (endKind === 1) el("rect", { x: x + (n - 1) * u + 1, y: y + 1, width: u - 2, height: 2 * u - 2, class: "lc" }, g);
      if (endKind === 2) { el("rect", { x: x + (n - 2) * u + 1, y: y + 1, width: 2 * u - 2, height: u - 2, class: "la" }, g); el("rect", { x: x + (n - 2) * u + 1, y: y + u + 1, width: 2 * u - 2, height: u - 2, class: "la" }, g); }
      el("rect", { x, y, width: n * u, height: 2 * u, class: "k" }, g);
    };
    Q.bind(fig, ({ n }) => {
      clear(g);
      const u = Math.min(30, 300 / n);
      txt(g, 20, 24, `2 × ${n} 판`, "");
      board(20, 40, n, u, 1); txt(g, 20, 40 + 2 * u + 16, `끝이 세로 하나 → 남은 2 × ${n - 1}: ${a[n - 1] || (n === 1 ? 1 : 0)}가지`, "s");
      if (n >= 2) { board(20, 130, n, u, 2); txt(g, 20, 130 + 2 * u + 16, `끝이 가로 둘 → 남은 2 × ${n - 2}: ${n === 2 ? 1 : a[n - 2]}가지`, "s"); }
      read.textContent = `a${n} = ${a[n]}` + (n >= 3 ? ` = a${n - 1} + a${n - 2} = ${a[n - 1]} + ${a[n - 2]}` : " (직접 센다)");
    });
  });

  // 세제곱의 합: L자 띠로 정사각형 만들기
  Q.def("alg-cubes", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), cls = ["la", "lb", "lc", "ld", "la", "lb", "lc"];
    Q.bind(fig, ({ n }) => {
      clear(g);
      const T = (k) => k * (k + 1) / 2, side = T(n), u = Math.min(30, 250 / side), ox = 20, oy = 10;
      for (let k = n; k >= 1; k--) {
        const s = T(k) * u;
        el("rect", { x: ox, y: oy, width: s, height: s, class: cls[k - 1] }, g);
        el("rect", { x: ox, y: oy, width: s, height: s, class: "k" }, g);
      }
      txt(g, ox + side * u + 14, 60, `1³ + 2³ + … + ${n}³`, "");
      txt(g, ox + side * u + 14, 90, `= ${Array.from({ length: n }, (_, i) => (i + 1) ** 3).reduce((a, b) => a + b)}`, "s");
      txt(g, ox + side * u + 14, 120, `= (1 + 2 + … + ${n})² = ${side}²`, "s td");
      read.textContent = `한 변 ${side}인 정사각형, 넓이 ${side * side}`;
    });
  });

  // 합의 기호: 시작, 끝, 일반항을 바꾸어 펼쳐 보기
  Q.def("alg-sigma", (fig, svg) => {
    const T = [["2k − 1", (k) => 2 * k - 1], ["k²", (k) => k * k], ["2ᵏ", (k) => 2 ** k]];
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ s, e, f }) => {
      clear(g);
      const [name, fn] = T[f];
      txt(g, 30, 70, "∑", "", "start").setAttribute("style", "font-size:52px");
      txt(g, 44, 22, `${e}`, "s", "middle"); txt(g, 44, 92, `k = ${s}`, "s", "middle"); txt(g, 72, 60, name, "");
      if (s > e) { txt(g, 30, 150, "시작이 끝보다 크면 더할 항이 없다", "s td"); read.textContent = "더할 항이 없다"; return; }
      const terms = [];
      for (let k = s; k <= e; k++) terms.push(fn(k));
      const sum = terms.reduce((a, b) => a + b, 0);
      txt(g, 150, 60, "= " + terms.join(" + "), "s");
      terms.forEach((v, i) => { const w = Math.min(40, 440 / terms.length); el("rect", { x: 40 + i * w, y: 200 - Math.min(80, v / Math.max(...terms) * 80), width: w - 4, height: Math.min(80, v / Math.max(...terms) * 80), class: "lb" }, g); });
      read.textContent = `항 ${terms.length}개의 합 = ${sum}`;
    }, (k, v) => k === "f" ? T[v][0] : String(v));
  });

  // 등비수열: 공비 r, 첫째항 1, 10항까지 막대
  Q.def("alg-geo", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ r }) => {
      clear(g);
      const vals = Array.from({ length: 10 }, (_, i) => r ** i), M = Math.max(1, ...vals.map(Math.abs)), y0 = 130, s = 110 / M;
      Q.line(g, 30, y0, 500, y0, "ax");
      vals.forEach((v, i) => {
        const x = 40 + i * 46, h = v * s;
        el("rect", { x, y: v >= 0 ? y0 - h : y0, width: 34, height: Math.abs(h), class: v >= 0 ? "lb" : "ld" }, g);
        txt(g, x + 17, y0 + (v >= 0 ? 16 : -6), String(i + 1), "s", "middle");
      });
      const S = r === 1 ? 10 : (r ** 10 - 1) / (r - 1);
      read.textContent = `aₙ = ${num(r)}^(n−1): 제10항 ${num(r ** 9, 3)}, 10항까지의 합 ${num(S, 3)}` + (M > 1 ? ` (막대는 최대 ${num(M, 1)}에 맞춰 줄였다)` : "");
    });
  });

  // 등차수열의 합: 계단 두 개를 맞붙여 직사각형 (첫째항 1)
  Q.def("alg-arith", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n, d }) => {
      clear(g);
      const a = 1, l = a + (n - 1) * d, w = Math.min(36, 440 / n), u = Math.min(14, 220 / (a + l));
      for (let i = 0; i < n; i++) {
        const h1 = (a + i * d) * u, h2 = (l - i * d) * u, x = 40 + i * w;
        el("rect", { x, y: 240 - h1, width: w - 2, height: h1, class: "la" }, g);
        el("rect", { x, y: 240 - h1 - h2, width: w - 2, height: h2, class: "lc" }, g);
      }
      Q.line(g, 40, 240 - (a + l) * u, 40 + n * w, 240 - (a + l) * u, "d dsh");
      const S = n * (a + l) / 2;
      txt(g, 40, 240 - (a + l) * u - 6, `높이 a₁ + aₙ = ${a + l}`, "s td");
      read.textContent = `1, ${1 + d}, ${1 + 2 * d}, …, ${l}: 직사각형 ${n} × ${a + l} = ${n * (a + l)}, 합 = ${S}`;
    });
  });

  // 수열의 뜻: 자연수 n에 a_n 을 대응시킨 점그래프
  Q.def("alg-seqfunc", (fig, svg) => {
    const S = [["aₙ = n²", (n) => n * n], ["aₙ = 2n − 1", (n) => 2 * n - 1], ["aₙ = 2ⁿ⁻¹", (n) => 2 ** (n - 1)], ["aₙ = (n³ − 3n² + 8n)/6", (n) => (n ** 3 - 3 * n * n + 8 * n) / 6]];
    const F = Q.frame(0, 8.5, 0, 70, 50, 500, 15, 230);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.line(bg, F.X0, F.Y1, F.X1, F.Y1, "ax"); Q.line(bg, F.X0, F.Y1, F.X0, F.Y0, "ax");
    for (let n = 1; n <= 8; n++) txt(bg, F.x(n), F.Y1 + 16, String(n), "s", "middle");
    [20, 40, 60].forEach((v) => txt(bg, F.X0 - 6, F.y(v) + 4, String(v), "s", "end"));
    Q.bind(fig, ({ f }) => {
      clear(g);
      const [name, fn] = S[f];
      if (f >= 2) { const other = S[5 - f][1]; for (let n = 1; n <= 8; n++) if (other(n) <= 70) Q.dot(g, F.x(n), F.y(other(n)), "fc", 3); }
      const vals = [];
      for (let n = 1; n <= 8; n++) { const v = fn(n); vals.push(num(v, 2)); if (v <= 70) Q.dot(g, F.x(n), F.y(v), "fd", 5); }
      read.textContent = `${name}: ${vals.join(", ")}` + (f >= 2 ? " (노랑은 다른 쪽 수열, 넷째 항까지 같다)" : "");
    }, (k, v) => S[v][0]);
  });

  // 코사인법칙: b = 5, c = 4, 끼인각 A
  Q.def("alg-cosine", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), s = 34, ox = 180, oy = 220, b = 5, c = 4;
    Q.bind(fig, ({ A }) => {
      clear(g);
      const t = A * Math.PI / 180, B = [ox + c * s, oy], C = [ox + b * s * Math.cos(t), oy - b * s * Math.sin(t)];
      el("path", { d: `M${ox} ${oy} L${B[0]} ${B[1]} L${C[0]} ${C[1]} Z`, class: "lb" }, g);
      el("path", { d: `M${ox} ${oy} L${B[0]} ${B[1]} L${C[0]} ${C[1]} Z`, class: "k" }, g);
      Q.line(g, B[0], B[1], C[0], C[1], "d");
      el("path", { d: `M${ox + 22} ${oy} A22 22 0 0 0 ${ox + 22 * Math.cos(t)} ${oy - 22 * Math.sin(t)}`, class: "c" }, g);
      txt(g, ox - 10, oy + 16, "A", "i"); txt(g, B[0] + 6, B[1] + 16, "B", "i"); txt(g, C[0] - 4, C[1] - 8, "C", "i", "end");
      txt(g, (ox + B[0]) / 2, oy + 18, "c = 4", "s", "middle"); txt(g, (ox + C[0]) / 2 - 12, (oy + C[1]) / 2, "b = 5", "s", "end");
      const a2 = b * b + c * c - 2 * b * c * Math.cos(t);
      read.textContent = `a² = 25 + 16 − 40 cos ${A}° = ${num(a2, 2)}, a ≈ ${num(Math.sqrt(a2), 3)}` + (A === 90 ? " (피타고라스 정리)" : A < 90 ? " (직각일 때 41보다 작다)" : " (직각일 때 41보다 크다)");
    });
  });

  // 삼각함수의 그래프: 단위원 위의 점과 펼친 사인 곡선
  Q.def("alg-sinwave", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), cx = 80, cy = 120, R = 60, X0 = 170, W = 340;
    const X = (deg) => X0 + deg / 720 * W;
    Q.bind(fig, ({ d }) => {
      clear(g);
      const th = d * Math.PI / 180, px = cx + R * Math.cos(th), py = cy - R * Math.sin(th);
      Q.line(g, 10, cy, 150, cy, "ax"); Q.line(g, cx, 50, cx, 190, "ax"); el("circle", { cx, cy, r: R, class: "gd" }, g);
      Q.line(g, X0, cy, X0 + W, cy, "ax");
      [0, 180, 360, 540, 720].forEach((a) => txt(g, X(a), cy + 76, a ? `${a / 180}π` : "0", "s", "middle"));
      let path = "";
      for (let a = 0; a <= d; a += 2) path += (a ? "L" : "M") + X(a) + " " + (cy - R * Math.sin(a * Math.PI / 180));
      el("path", { d: path, class: "b" }, g);
      Q.line(g, cx, cy, px, py, "k"); Q.line(g, px, py, px, cy, "d"); Q.line(g, px, py, X(d), py, "gd dsh");
      Q.dot(g, px, py, "fd", 5); Q.dot(g, X(d), py, "fd", 5);
      read.textContent = `θ = ${d}°: sin θ = ${num(Math.sin(th), 3)}, cos θ = ${num(Math.cos(th), 3)}`;
    });
  });

  // 일반각과 호도법: 동경이 돈 양과 호의 길이
  Q.def("alg-rad", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), cx = 150, cy = 140, R = 100;
    Q.bind(fig, ({ d }) => {
      clear(g);
      Q.line(g, 30, cy, 270, cy, "ax"); Q.line(g, cx, 20, cx, 260, "ax");
      el("circle", { cx, cy, r: R, class: "gd" }, g);
      Q.line(g, cx, cy, cx + R, cy, "k");
      const th = d * Math.PI / 180, turns = Math.abs(d) / 360;
      // 돈 경로를 바퀴마다 반지름을 조금씩 줄인 나선으로
      let path = "";
      const N = Math.max(2, Math.ceil(Math.abs(d) / 3));
      for (let i = 0; i <= N; i++) { const t = th * i / N, rr = 30 + 12 * (Math.abs(t) / (2 * Math.PI)); path += (i ? "L" : "M") + (cx + rr * Math.cos(t)) + " " + (cy - rr * Math.sin(t)); }
      el("path", { d: path, class: "c" }, g);
      Q.line(g, cx, cy, cx + R * Math.cos(th), cy - R * Math.sin(th), "d");
      Q.dot(g, cx + R * Math.cos(th), cy - R * Math.sin(th), "fd", 5);
      const a = ((d % 360) + 360) % 360;
      const quad = a % 90 === 0 ? "축 위" : `제${Math.floor(a / 90) + 1}사분면`;
      txt(g, 300, 80, `${d}° = ${num(th, 3)} rad`, "");
      txt(g, 300, 110, `= 360° × ${Math.floor(d / 360)} + ${a}°`, "s");
      txt(g, 300, 140, `동경의 위치: ${quad}`, "s");
      txt(g, 300, 170, `반지름 1인 원의 호 길이 ${num(Math.abs(th), 3)}`, "s tc");
      read.textContent = `${num(turns, 2)}바퀴 ${d >= 0 ? "양의 방향" : "음의 방향"}, ${quad}`;
    });
  });

  // 지수함수의 활용: 탄소-14 반감기 5730년
  Q.def("alg-decay", (fig, svg) => {
    const F = Q.frame(0, 25000, 0, 1, 60, 500, 15, 220);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.line(bg, F.X0, F.Y1, F.X1, F.Y1, "ax"); Q.line(bg, F.X0, F.Y1, F.X0, F.Y0, "ax");
    [0, 5730, 11460, 17190, 22920].forEach((t) => { Q.line(bg, F.x(t), F.Y1, F.x(t), F.Y1 + 5, "ax"); txt(bg, F.x(t), F.Y1 + 18, String(t), "s", "middle"); });
    [0.25, 0.5, 0.75, 1].forEach((v) => txt(bg, F.X0 - 6, F.y(v) + 4, `${v * 100}%`, "s", "end"));
    txt(bg, F.X1, F.Y1 + 34, "지난 시간(년)", "s", "end");
    Q.plot(bg, F, (t) => 0.5 ** (t / 5730), "b");
    Q.bind(fig, ({ r }) => {
      clear(g);
      const p = r / 100, t = 5730 * Math.log(p) / Math.log(0.5);
      Q.line(g, F.X0, F.y(p), F.x(t), F.y(p), "c dsh"); Q.line(g, F.x(t), F.y(p), F.x(t), F.Y1, "d dsh");
      Q.dot(g, F.x(t), F.y(p), "fd", 5);
      read.textContent = `${r}% 남음 → t = 5730 × log(${p}) / log(1/2) ≈ ${Math.round(t)}년`;
    });
  });

  // 지수함수의 평행이동: y = a^(x − p) + q
  Q.def("alg-expshift", (fig, svg) => {
    const { F, g } = graph(svg, [-5, 5, -4, 10], { axes: { step: 1, lstep: 2 } });
    const read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a, p, q }) => {
      clear(g);
      if (Math.abs(a - 1) < 1e-9) { Q.plot(g, F, () => 1 + q, "b"); read.textContent = "밑이 1이면 상수함수"; return; }
      Q.plot(g, F, (x) => q, "d dsh");
      Q.plot(g, F, (x) => a ** (x - p) + q, "b", -5, 5, 400);
      Q.dot(g, F.x(p), F.y(1 + q), "fd", 5);
      read.textContent = `점근선 y = ${q}, 점 (${p}, ${1 + q})를 지난다, ${a > 1 ? "증가" : "감소"}함수`;
    });
  });

  // 지수함수와 로그함수: 밑 a, y = x 대칭 (가로·세로 같은 눈금)
  Q.def("alg-pair", (fig, svg) => {
    const F = Q.frame(-4, 6, -4, 6, 110, 410, 0, 300);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.axes(bg, F, { step: 1, lstep: 2 });
    Q.plot(bg, F, (x) => x, "gd dsh");
    Q.bind(fig, ({ a }) => {
      clear(g);
      if (Math.abs(a - 1) < 1e-9) { read.textContent = "밑이 1이면 y = 1인 상수함수가 되어 역함수가 없다"; Q.plot(g, F, () => 1, "b"); return; }
      Q.plot(g, F, (x) => a ** x, "b", -4, 6, 400);
      Q.plot(g, F, (x) => Math.log(x) / Math.log(a), "c", 0.001, 6, 600);
      Q.dot(g, F.x(0), F.y(1), "fb", 4); Q.dot(g, F.x(1), F.y(0), "fc", 4);
      read.textContent = `y = ${num(a)}^x (파랑)과 y = log_${num(a)} x (노랑): (0, 1) ↔ (1, 0), ` + (a > 1 ? "둘 다 증가" : "둘 다 감소");
    });
  });

  // 상용로그: log 2^n = n log 2 의 정수·소수 부분
  Q.def("alg-digits", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const L = n * Math.log10(2), ip = Math.floor(L), fp = L - ip, lead = 10 ** fp;
      txt(g, 20, 34, `log 2^${n} = ${n} × 0.30103 = ${L.toFixed(4)}`, "");
      el("rect", { x: 20, y: 60, width: 300, height: 40, class: "lb" }, g); txt(g, 170, 86, `정수 부분 ${ip} → ${ip + 1}자리 수`, "", "middle");
      el("rect", { x: 330, y: 60, width: 170, height: 40, class: "lc" }, g); txt(g, 415, 86, `소수 부분 ${fp.toFixed(4)}`, "s", "middle");
      // 소수 부분을 0~1 눈금에서 1~9 위치로
      Q.line(g, 40, 150, 480, 150, "ax");
      for (let d = 1; d <= 10; d++) { const x = 40 + Math.log10(d) * 440; Q.line(g, x, 144, x, 156, "ax"); txt(g, x, 174, String(d === 10 ? 10 : d), "s", "middle"); }
      Q.dot(g, 40 + fp * 440, 150, "fd", 6);
      txt(g, 260, 205, `10^${fp.toFixed(4)} ≈ ${lead.toFixed(3)} → 맨 앞 숫자 ${Math.floor(lead)}`, "td", "middle");
      read.textContent = `2^${n} ≈ ${lead.toFixed(3)} × 10^${ip}: ${ip + 1}자리, 맨 앞 숫자 ${Math.floor(lead)}`;
    });
  });

  // 로그: 높이 N에서 x = log₂N 읽기
  Q.def("alg-logdef", (fig, svg) => {
    const { F, bg, g } = graph(svg, [-2.5, 4.5, -1, 17], { H: 270, axes: { step: 1, lstep: 2 } });
    const read = fig.querySelector(".q-read");
    Q.plot(bg, F, (x) => 2 ** x, "b");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const x = Math.log2(n);
      Q.line(g, F.x(0), F.y(n), F.x(x), F.y(n), "c dsh"); Q.line(g, F.x(x), F.y(n), F.x(x), F.y(0), "d dsh");
      Q.dot(g, F.x(x), F.y(n), "fd", 5); Q.dot(g, F.x(x), F.y(0), "fd", 4);
      read.textContent = `log₂ ${num(n)} = ${num(x, 4)} (2^${num(x, 4)} = ${num(n)})`;
    });
  });

  // 지수법칙: 2^m · 2^n = 2^(m+n)
  Q.def("alg-explaw", (fig, svg) => {
    const { F, bg, g } = graph(svg, [-3, 4.2, -1, 17], { H: 270, axes: { step: 1, lstep: 2 } });
    const read = fig.querySelector(".q-read");
    Q.plot(bg, F, (x) => 2 ** x, "b");
    Q.bind(fig, ({ m, n }) => {
      clear(g);
      [[m, "fa"], [n, "fc"], [m + n, "fd"]].forEach(([x, c]) => { Q.line(g, F.x(x), F.y(0), F.x(x), F.y(2 ** x), c.replace("f", "") + " dsh"); Q.dot(g, F.x(x), F.y(2 ** x), c, 5); });
      read.textContent = `2^${num(m)} × 2^${num(n)} = ${num(2 ** m, 3)} × ${num(2 ** n, 3)} = ${num(2 ** m * 2 ** n, 3)}, 2^${num(m + n)} = ${num(2 ** (m + n), 3)}`;
    });
  });

  // 지수의 확장: y = 2^x 위의 점과 2배 계단
  Q.def("alg-ladder", (fig, svg) => {
    const { F, bg, g } = graph(svg, [-3.5, 4.5, -1, 17], { H: 250, axes: { step: 1, lstep: 2 } });
    const read = fig.querySelector(".q-read");
    Q.plot(bg, F, (x) => 2 ** x, "b");
    for (let k = -3; k <= 4; k++) Q.dot(bg, F.x(k), F.y(2 ** k), "fb", 3);
    Q.bind(fig, ({ x }) => {
      clear(g);
      const v = 2 ** x;
      Q.line(g, F.x(x), F.y(0), F.x(x), F.y(v), "d dsh"); Q.dot(g, F.x(x), F.y(v), "fd", 6);
      const show = Number.isInteger(x) ? (x >= 0 ? String(v) : `1/${2 ** -x}`) : x === 0.5 ? "√2" : x === -0.5 ? "1/√2" : `${num(v, 3)}`;
      read.textContent = `2^(${num(x)}) = ${show}` + (Number.isInteger(x) ? "" : ` ≈ ${num(v, 4)}`) + `, 한 칸 위 2^(${num(x + 1)})은 그 2배`;
    });
  });
})();
