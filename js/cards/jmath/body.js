/* 직무 수학 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const won = (v) => Math.round(v).toLocaleString("ko-KR");
  const frame = (g, x0, x1, y0, y1, st) => { const F = Q.frame(x0, x1, y0, y1, 60, 490, 15, 205); Q.axes(g, F, { step: st || 1, label: false }); return F; };
  const ticks = (g, F, xs, ys, fy) => { for (const x of xs) txt(g, F.x(x), 220, `${x}`, "s", "middle"); for (const y of ys) txt(g, F.X0 - 5, F.y(y) + 4, fy ? fy(y) : `${y}`, "s", "end"); };
  const bar = (g, x, y, w, h, cls, lab) => { el("rect", { x, y, width: Math.max(0, w), height: h, class: cls }, g); if (lab) txt(g, x - 6, y + h - 5, lab, "s", "end"); };

  // 1-1 쿠폰 비교: 3000원 할인 vs 15% 할인
  Q.def("jm-coupon", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ p }) => {
      clear(g);
      const F = frame(g, 0, 40000, 0, 40000, [5000, 5000]); ticks(g, F, [0, 10000, 20000, 30000, 40000], [0, 20000, 40000], (y) => `${y / 10000}만`);
      Q.plot(g, F, (x) => Math.max(0, x - 3000), "b", 0, 40000); Q.plot(g, F, (x) => x * 0.85, "c", 0, 40000);
      Q.line(g, F.x(p), 15, F.x(p), 205, "gd");
      const a = Math.max(0, p - 3000), b = p * 0.85;
      txt(g, 66, 26, "파랑 3000원 할인, 주황 15% 할인 후 내는 돈", "s");
      read.textContent = `주문 ${won(p)}원: 3000원 할인 ${won(a)}원, 15% 할인 ${won(b)}원 → ` + (Math.abs(a - b) < 1 ? "같다" : a < b ? "3000원 쿠폰이 유리" : "15% 쿠폰이 유리") + " (2만 원에서 같아진다)";
    });
  });

  // 1-2 페인트 어림: 방 가로 a, 세로 b, 높이 2.4 m, 문·창 4 m², 1통 10 m², 2회 칠
  Q.def("jm-paint", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a, b }) => {
      clear(g);
      const wall = 2 * (a + b) * 2.4 - 4, need = wall * 2 / 10, cans = Math.ceil(need);
      el("rect", { x: 60, y: 40, width: a * 30, height: b * 30, class: "lb" }, g); txt(g, 60 + a * 15, 34, `${a} m`, "s", "middle"); txt(g, 54, 40 + b * 15, `${b} m`, "s", "end");
      for (let i = 0; i < cans; i++) el("rect", { x: 330 + (i % 6) * 26, y: 40 + Math.floor(i / 6) * 34, width: 20, height: 26, class: i < need ? "lc" : "lk" }, g);
      txt(g, 330, 200, `필요 ${num(need, 2)}통 → ${cans}통 구입`, "s");
      read.textContent = `벽 넓이 2 × (${a} + ${b}) × 2.4 − 4 = ${num(wall, 1)} m², 두 번 칠하면 ${num(wall * 2, 1)} m² → 10 m²당 1통이므로 ${num(need, 2)}통, 올림하여 ${cans}통`;
    });
  });

  // 1-3 투약량: 체중 w kg × 15 mg/kg, 약 농도 50 mg/mL
  Q.def("jm-dose", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ w }) => {
      clear(g);
      const mg = w * 15, ml = mg / 50;
      el("rect", { x: 80, y: 90, width: 300, height: 40, class: "gd" }, g);
      el("rect", { x: 80, y: 90, width: 300 * ml / 20, height: 40, class: "lb" }, g);
      for (let i = 0; i <= 20; i += 2) { Q.line(g, 80 + i * 15, 130, 80 + i * 15, 140, "k"); txt(g, 80 + i * 15, 156, `${i}`, "s", "middle"); }
      txt(g, 390, 115, "mL", "s"); txt(g, 80, 70, `체중 ${w} kg × 15 mg/kg = ${won(mg)} mg`, "s"); txt(g, 80, 190, `${won(mg)} mg ÷ 50 mg/mL = ${num(ml, 2)} mL`, "s tb");
      read.textContent = `체중 ${w} kg: 약 ${won(mg)} mg = 주사기 ${num(ml, 2)} mL (농도 50 mg/mL)`;
    });
  });

  // 2-1 배합비 1 : 2 : 4 (시멘트 : 모래 : 자갈)
  Q.def("jm-mix", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ v }) => {
      clear(g);
      const u = v / 7, P = [["시멘트", 1, "lk"], ["모래", 2, "lc"], ["자갈", 4, "lb"]];
      let x = 60; P.forEach(([n, k, cls]) => { const w = 400 * k / 7; el("rect", { x, y: 70, width: w, height: 50, class: cls }, g); txt(g, x + w / 2, 100, `${n} ${num(k * u, 2)} m³`, "s", "middle"); x += w; });
      txt(g, 60, 55, `전체 ${v} m³ = 7등분 × ${num(u, 3)} m³`, "s");
      read.textContent = `전체 ${v} m³: 시멘트 ${num(u, 2)}, 모래 ${num(2 * u, 2)}, 자갈 ${num(4 * u, 2)} m³ (비 1 : 2 : 4)`;
    });
  });

  // 2-2 연속 할인
  Q.def("jm-discount", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a, b }) => {
      clear(g);
      const r1 = 1 - a / 100, r2 = r1 * (1 - b / 100), tot = (1 - r2) * 100;
      bar(g, 120, 40, 360, 30, "lk", "정가"); bar(g, 120, 90, 360 * r1, 30, "lc", `${a}% 할인`); bar(g, 120, 140, 360 * r2, 30, "lb", `추가 ${b}%`);
      Q.line(g, 120 + 360 * (1 - (a + b) / 100), 30, 120 + 360 * (1 - (a + b) / 100), 180, "d");
      txt(g, 120, 200, `빨간 선 = 단순히 더한 ${a + b}% 할인`, "s td");
      read.textContent = `${a}% 할인 후 ${b}% 추가 할인: 정가의 ${num(r2 * 100, 1)}% → 실제 할인율 ${num(tot, 1)}% (${a + b}%가 아님)`;
    });
  });

  // 2-3 테두리 타일: 한 변 n칸 바닥 둘레
  Q.def("jm-border", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const s = Math.min(22, 180 / (n + 2));
      for (let i = 0; i < n + 2; i++) for (let j = 0; j < n + 2; j++) { const edge = i === 0 || j === 0 || i === n + 1 || j === n + 1; el("rect", { x: 40 + i * s, y: 15 + j * s, width: s - 1, height: s - 1, class: edge ? "lc" : "lb" }, g); }
      txt(g, 300, 60, `안쪽 ${n} × ${n} = ${n * n}칸`, "s"); txt(g, 300, 90, `테두리 4 × ${n} + 4 = ${4 * n + 4}장`, "s tc"); txt(g, 300, 120, "(네 모서리를 따로 센다)", "s");
      read.textContent = `한 변 ${n}칸인 바닥: 테두리 타일 4n + 4 = ${4 * n + 4}장`;
    });
  });

  // 2-4 물통 모양에 따른 수위 그래프 (같은 속도로 물 넣기)
  Q.def("jm-tank", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const N = ["원기둥", "위가 넓은 통", "아래가 넓은 통"];
    Q.bind(fig, ({ s }) => {
      clear(g);
      const F = Q.frame(0, 1, 0, 1, 230, 490, 15, 205); Q.axes(g, F, { step: 0.25, label: false });
      txt(g, 490, 220, "시간", "s", "end"); txt(g, 236, 26, "수위", "s");
      const h = [(t) => t, (t) => Math.cbrt(t), (t) => 1 - Math.cbrt(1 - t)][s];
      Q.plot(g, F, h, "b", 0, 1, 200);
      const shape = [[[60, 40], [180, 40], [180, 200], [60, 200]], [[40, 40], [200, 40], [120, 200], [120, 200]], [[120, 40], [120, 40], [200, 200], [40, 200]]][s];
      el("path", { d: "M" + shape.map((p) => p.join(" ")).join(" L") + " Z", class: "lb", opacity: 0.6 }, g);
      read.textContent = `${N[s]}: 수위가 ` + ["일정한 빠르기로 오른다 (직선)", "처음에 빠르다가 점점 느려진다 (위로 볼록)", "처음에 느리다가 점점 빨라진다 (아래로 볼록)"][s];
    }, (k, v) => N[v]);
  });

  // 2-5 빌릴까 살까: 대여 하루 3만 원, 구입 45만 원 + 하루 유지비 5천 원
  Q.def("jm-rent", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ d }) => {
      clear(g);
      const F = frame(g, 0, 30, 0, 90, [5, 10]); ticks(g, F, [0, 10, 18, 20, 30], [0, 30, 60, 90], (y) => `${y}만`);
      Q.plot(g, F, (x) => 3 * x, "c", 0, 30); Q.plot(g, F, (x) => 45 + 0.5 * x, "b", 0, 30);
      Q.line(g, F.x(d), 15, F.x(d), 205, "gd");
      txt(g, 66, 26, "주황 빌리기, 파랑 사기 (만 원)", "s");
      const r = 3 * d, b = 45 + 0.5 * d;
      read.textContent = `${d}일: 빌리면 ${r}만 원, 사면 ${num(b, 1)}만 원 → ` + (r < b ? "빌리는 편이 싸다" : r > b ? "사는 편이 싸다" : "같다") + " (18일에서 같아진다)";
    });
  });

  // 3-1 상자 전개도의 판지 사용량: 가로 a, 세로 b, 높이 h (cm)
  Q.def("jm-net", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a, b, h }) => {
      clear(g);
      const s = 3.2, x0 = 30, y0 = 15;
      const R = [[h, 0, a, h], [0, h, h, b], [h, h, a, b], [h + a, h, h, b], [h + a + h, h, a, b], [h, h + b, a, h]];
      const W = 2 * a + 2 * h, H = 2 * h + b;
      el("rect", { x: x0, y: y0, width: W * s, height: H * s, class: "gd" }, g);
      R.forEach(([x, y, w, hh]) => el("rect", { x: x0 + x * s, y: y0 + y * s, width: w * s, height: hh * s, class: "lc" }, g));
      const area = 2 * (a * b + b * h + a * h), board = W * H;
      txt(g, 330, 60, `겉넓이 ${area} cm²`, "s"); txt(g, 330, 90, `직사각형 판지 ${W} × ${H} = ${board} cm²`, "s"); txt(g, 330, 120, `버려지는 판지 ${num((1 - area / board) * 100, 1)}%`, "s td");
      read.textContent = `상자 ${a} × ${b} × ${h} cm: 겉넓이 ${area} cm², 판지 ${board} cm² 가운데 ${board - area} cm²가 버려진다`;
    });
  });

  // 3-2 쌓기나무 세 방향 모양: 3 × 3 바닥의 높이
  const STK = [[[2, 1, 0], [1, 1, 0], [3, 0, 1]], [[1, 2, 1], [0, 3, 0], [1, 2, 1]], [[3, 2, 1], [2, 1, 0], [1, 0, 0]]];
  Q.def("jm-views", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      const H = STK[k], c = 18;
      H.forEach((row, i) => row.forEach((v, j) => { el("rect", { x: 40 + j * c, y: 40 + i * c, width: c - 1, height: c - 1, class: v ? "lb" : "gd" }, g); if (v) txt(g, 40 + j * c + 9, 40 + i * c + 13, `${v}`, "s", "middle"); }));
      txt(g, 67, 120, "위 (숫자 = 높이)", "s", "middle");
      const front = [0, 1, 2].map((j) => Math.max(...H.map((r) => r[j]))), side = H.map((r) => Math.max(...r));
      front.forEach((v, j) => { for (let t = 0; t < v; t++) el("rect", { x: 180 + j * c, y: 110 - (t + 1) * c, width: c - 1, height: c - 1, class: "lc" }, g); });
      side.forEach((v, i) => { for (let t = 0; t < v; t++) el("rect", { x: 320 + (2 - i) * c, y: 110 - (t + 1) * c, width: c - 1, height: c - 1, class: "la" }, g); });
      txt(g, 207, 130, "앞", "s", "middle"); txt(g, 347, 130, "옆 (오른쪽)", "s", "middle");
      const tot = H.flat().reduce((s, v) => s + v, 0);
      read.textContent = `쌓기나무 ${tot}개: 앞에서 본 높이 ${front.join(", ")}, 오른쪽에서 본 높이 ${side.slice().reverse().join(", ")}`;
    });
  });

  // 3-3 닮음비 k: 길이 k배, 넓이 k²배, 부피 k³배
  Q.def("jm-similar", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      el("rect", { x: 40, y: 150, width: 30, height: 20, class: "lb" }, g);
      el("rect", { x: 100, y: 170 - 20 * k, width: 30 * k, height: 20 * k, class: "lc" }, g);
      bar(g, 340, 40, 30 * k, 22, "lb", "길이"); bar(g, 340, 80, 30 * k * k / 3, 22, "lc", "넓이"); bar(g, 340, 120, 30 * k ** 3 / 9, 22, "ld", "부피");
      txt(g, 340, 180, `${num(k, 1)}배, ${num(k * k, 2)}배, ${num(k ** 3, 2)}배`, "s");
      read.textContent = `닮음비 1 : ${num(k, 1)}: 둘레·테두리 ${num(k, 1)}배, 칠할 넓이 ${num(k * k, 2)}배, 부피·무게 ${num(k ** 3, 2)}배`;
    });
  });

  // 3-4 울타리 24 m 직사각형 텃밭
  Q.def("jm-fence", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ w }) => {
      clear(g);
      const l = 12 - w, A = w * l;
      el("rect", { x: 40, y: 40, width: w * 18, height: l * 13, class: "la" }, g);
      txt(g, 40 + w * 9, 34, `${num(w, 1)} m`, "s", "middle"); txt(g, 34, 40 + l * 6.5, `${num(l, 1)} m`, "s", "end");
      const F = Q.frame(0, 12, 0, 40, 290, 490, 15, 205); Q.axes(g, F, { step: [2, 10], label: false });
      Q.plot(g, F, (x) => x * (12 - x), "b", 0, 12); Q.dot(g, F.x(w), F.y(A), "fd", 5);
      txt(g, 490, 220, "가로", "s", "end"); txt(g, 296, 26, "넓이", "s");
      read.textContent = `가로 ${num(w, 1)} m, 세로 ${num(l, 1)} m: 넓이 ${num(A, 2)} m²` + (Math.abs(w - 6) < 0.01 ? " (정사각형일 때 최대 36 m²)" : "");
    });
  });

  // 3-5 원기둥 물탱크: 반지름 r, 높이 h (m), 분당 200 L
  Q.def("jm-cyl", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ r, h }) => {
      clear(g);
      const V = Math.PI * r * r * h, L = V * 1000, t = L / 200;
      const W = r * 60, Hh = h * 50;
      el("rect", { x: 120 - W, y: 200 - Hh, width: 2 * W, height: Hh, class: "lb" }, g);
      el("ellipse", { cx: 120, cy: 200 - Hh, rx: W, ry: W * 0.25, class: "la" }, g); el("ellipse", { cx: 120, cy: 200, rx: W, ry: W * 0.25, class: "k" }, g);
      txt(g, 260, 60, `부피 π × ${r}² × ${h} = ${num(V, 2)} m³`, "s"); txt(g, 260, 90, `= ${won(L)} L`, "s"); txt(g, 260, 120, `분당 200 L이면 ${num(t, 1)}분`, "s tb");
      read.textContent = `반지름 ${r} m, 높이 ${h} m: ${num(V, 2)} m³ = ${won(L)} L, 가득 채우는 데 약 ${num(t, 0)}분`;
    });
  });

  // 4-1 근무 배정: n명 중 오전·오후·야간 각 1명
  Q.def("jm-shift", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const p = n * (n - 1) * (n - 2);
      [["오전", n], ["오후", n - 1], ["야간", n - 2]].forEach(([s, c], i) => { el("rect", { x: 60 + i * 140, y: 60, width: 110, height: 60, class: ["la", "lc", "lb"][i] }, g); txt(g, 115 + i * 140, 85, s, "s", "middle"); txt(g, 115 + i * 140, 108, `${c}가지`, "s", "middle"); if (i < 2) txt(g, 185 + i * 140, 95, "×", "s", "middle"); });
      txt(g, 260, 170, `= ${p}가지`, "s tc", "middle");
      read.textContent = `${n}명 가운데 오전, 오후, 야간 1명씩: ${n} × ${n - 1} × ${n - 2} = ${p}가지 (곱의 법칙, 순열 ₙP₃)`;
    });
  });

  // 4-2 불량률 p에서 10개 모두 정상일 확률
  Q.def("jm-defect", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ p, n }) => {
      clear(g);
      const F = frame(g, 0, 50, 0, 1, [5, 0.1]); ticks(g, F, [0, 10, 20, 30, 40, 50], [0, 0.5, 1]);
      Q.plot(g, F, (k) => (1 - p / 100) ** k, "b", 0, 50, 100);
      const q = (1 - p / 100) ** n;
      Q.dot(g, F.x(n), F.y(q), "fd", 5);
      txt(g, 490, 200, "검사 개수", "s", "end"); txt(g, 66, 26, "불량품이 하나도 없을 확률", "s");
      read.textContent = `불량률 ${num(p, 1)}%, ${n}개 검사: 모두 정상일 확률 (1 − ${num(p / 100, 3)})^${n} = ${num(q, 3)}, 불량이 하나 이상 나올 확률 ${num(1 - q, 3)}`;
    });
  });

  // 4-3 계급의 크기에 따른 히스토그램: 배달 시간 40개
  const DT = [12, 14, 15, 17, 18, 18, 19, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 25, 26, 26, 27, 27, 28, 28, 29, 30, 30, 31, 32, 33, 34, 35, 36, 38, 40, 42, 45, 48, 55];
  Q.def("jm-hist", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ w }) => {
      clear(g);
      const lo = 10, hi = 60, bins = Math.ceil((hi - lo) / w), C = Array(bins).fill(0);
      DT.forEach((x) => C[Math.min(bins - 1, Math.floor((x - lo) / w))]++);
      const F = frame(g, lo, hi, 0, Math.max(...C) + 1, [w, 1]);
      for (let x = lo; x <= hi; x += w * Math.ceil(10 / w)) txt(g, F.x(x), 220, `${x}`, "s", "middle");
      C.forEach((c, i) => el("rect", { x: F.x(lo + i * w), y: F.y(c), width: F.x(w) - F.x(0) - 1, height: F.y(0) - F.y(c), class: "lb" }, g));
      txt(g, 490, 200, "배달 시간 (분)", "s", "end");
      read.textContent = `계급의 크기 ${w}분: 계급 ${bins}개, 가장 많은 계급의 도수 ${Math.max(...C)}` + (w <= 2 ? " (너무 잘게 나눠 들쭉날쭉)" : w >= 20 ? " (너무 크게 묶어 모양이 사라짐)" : "");
    });
  });

  // 4-4 세로축을 자른 그래프의 과장
  Q.def("jm-axis", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ s }) => {
      clear(g);
      const A = 980, B = 1020, top = 1040, k = 180 / (top - s);
      [["작년", A, "lb"], ["올해", B, "lc"]].forEach(([n, v, cls], i) => { const h = (v - s) * k; el("rect", { x: 120 + i * 140, y: 200 - h, width: 80, height: h, class: cls }, g); txt(g, 160 + i * 140, 194 - h, `${v}`, "s", "middle"); txt(g, 160 + i * 140, 216, n, "s", "middle"); });
      Q.line(g, 100, 200, 400, 200, "ax"); txt(g, 96, 204, `${s}`, "s", "end");
      const look = (B - s) / (A - s);
      read.textContent = `세로축을 ${s}에서 시작: 막대 높이는 ${num(look, 2)}배로 보이지만 실제 증가는 ${num(B / A, 3)}배 (약 ${num((B / A - 1) * 100, 1)}%)`;
    });
  });

  // 4-5 가중 점수로 납품 업체 고르기: 가격 점수와 품질 점수, 가격 가중치 w
  const SUP = [["가", 90, 60], ["나", 70, 85], ["다", 60, 95]];
  Q.def("jm-score", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ w }) => {
      clear(g);
      const S = SUP.map(([n, p, q]) => [n, w / 100 * p + (1 - w / 100) * q]);
      const best = S.slice().sort((a, b) => b[1] - a[1])[0][0];
      S.forEach(([n, v], i) => bar(g, 120, 40 + i * 50, v * 3.5, 30, n === best ? "lc" : "lb", `업체 ${n}`));
      S.forEach(([, v], i) => txt(g, 126 + v * 3.5, 60 + i * 50, num(v, 1), "s"));
      read.textContent = `가격 가중치 ${w}%, 품질 ${100 - w}%: ` + S.map(([n, v]) => `${n} ${num(v, 1)}`).join(", ") + ` → 업체 ${best} 선택`;
    });
  });
})();
