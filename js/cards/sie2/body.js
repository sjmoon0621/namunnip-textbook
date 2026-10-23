/* 과학탐구실험 2 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const frame = (g, x0, x1, y0, y1, st, X0, X1) => { const F = Q.frame(x0, x1, y0, y1, X0 || 60, X1 || 490, 15, 205); Q.axes(g, F, { step: st || 1, label: false }); return F; };
  const ticks = (g, F, xs, ys) => { for (const x of xs) txt(g, F.x(x), 220, `${x}`, "s", "middle"); for (const y of ys) txt(g, F.X0 - 5, F.y(y) + 4, `${y}`, "s", "end"); };
  const rng = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
  const gauss = (r) => { const u = Math.max(1e-9, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

  // 1-1 달걀 삶는 시간: 지름 d (cm), 지름 4.5 cm일 때 10분
  Q.def("sie-egg", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ d }) => {
      clear(g);
      const t = (x) => 10 * (x / 4.5) ** 2;
      const F = frame(g, 3, 6, 0, 20, [0.5, 5]); ticks(g, F, [3, 3.5, 4, 4.5, 5, 5.5, 6], [0, 5, 10, 15, 20]);
      txt(g, 490, 200, "달걀 지름 (cm)", "s", "end"); txt(g, 66, 26, "노른자 가운데까지 익는 시간 (분)", "s");
      Q.plot(g, F, t, "b", 3, 6, 100); Q.plot(g, F, (x) => 10 * x / 4.5, "gd", 3, 6, 10);
      Q.dot(g, F.x(d), F.y(t(d)), "fd", 5);
      read.textContent = `지름 ${num(d, 1)} cm: 약 ${num(t(d), 1)}분 (지름의 제곱에 비례). 회색 직선처럼 지름에 비례한다고 생각하면 ${num(10 * d / 4.5, 1)}분으로 어림하게 된다`;
    });
  });

  // 1-2 측정 일수와 평균의 불확도: 측정 일수 n, 날마다 출렁임 15 μg/m³
  Q.def("sie-days", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const r = rng(21), xs = []; for (let i = 0; i < n; i++) xs.push(Math.max(3, 35 + 15 * gauss(r)));
      const m = xs.reduce((a, b) => a + b, 0) / n, se = 15 / Math.sqrt(n);
      const F = frame(g, 0, 31, 0, 80, [5, 20]); ticks(g, F, [0, 10, 20, 30], [0, 20, 40, 60, 80]);
      txt(g, 490, 200, "측정한 날", "s", "end"); txt(g, 66, 26, "미세먼지 (μg/m³)", "s");
      xs.forEach((x, i) => Q.dot(g, F.x(i + 1), F.y(x), "fb", 3));
      el("rect", { x: F.x(0), y: F.y(m + 2 * se), width: F.x(31) - F.x(0), height: F.y(m - 2 * se) - F.y(m + 2 * se), class: "la" }, g);
      Q.line(g, F.x(0), F.y(m), F.x(31), F.y(m), "d");
      read.textContent = `${n}일 측정: 평균 ${num(m, 1)} μg/m³, 평균의 불확도 약 ±${num(2 * se, 1)}. 두 장소의 차이가 이보다 작으면 우연과 구별하기 어렵다`;
    });
  });

  // 1-3 종이 기둥: A4 너비 21 cm를 n겹으로 말 때 좌굴 하중(상대값)
  Q.def("sie-column", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const r = (k) => 21 / (2 * Math.PI * k), I = (k) => Math.PI * r(k) ** 3 * k * 0.01;
      const base = I(1);
      for (let k = 1; k <= 5; k++) { const h = I(k) / base * 140; el("rect", { x: 40 + (k - 1) * 90, y: 180 - h, width: 60, height: h, class: k === n ? "lc" : "lk" }, g); txt(g, 70 + (k - 1) * 90, 198, `${k}겹`, "s", "middle"); txt(g, 70 + (k - 1) * 90, 174 - h, `${num(I(k) / base * 100, 0)}`, "s", "middle"); }
      read.textContent = `${n}겹으로 말면 반지름 ${num(r(n), 2)} cm, 휘어 꺾이기 시작하는 하중은 1겹의 ${num(I(n) / base * 100, 0)}% (반지름의 세제곱 × 두께에 비례). 다만 1겹은 벽이 얇아 찌그러지기 쉬워 실제 최적은 시험으로 찾는다`;
    });
  });

  // 2-1 센서의 두 점 보정: 센서 값 raw (0 °C = 180, 100 °C = 820)
  Q.def("sie-calib", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ raw }) => {
      clear(g);
      const T = (x) => (x - 180) / (820 - 180) * 100;
      const F = frame(g, 0, 1023, -30, 130, [128, 20]); ticks(g, F, [0, 256, 512, 768, 1023], [-20, 0, 20, 40, 60, 80, 100, 120]);
      txt(g, 490, 200, "센서가 보낸 값 (0~1023)", "s", "end"); txt(g, 66, 26, "온도 (°C)", "s");
      Q.plot(g, F, T, "b", 0, 1023, 50);
      Q.dot(g, F.x(180), F.y(0), "fc", 5); Q.dot(g, F.x(820), F.y(100), "fc", 5);
      Q.dot(g, F.x(raw), F.y(T(raw)), "fd", 5);
      read.textContent = `얼음물에서 180, 끓는 물에서 820을 보낸 센서: 값 ${raw} → (${raw} − 180) ÷ 6.4 = ${num(T(raw), 1)} °C (두 점 사이를 직선으로 가정)`;
    });
  });

  // 2-2 교실 이산화 탄소 농도: 환기 횟수 ach (회/시간), 학생 30명, 교실 180 m³
  Q.def("sie-co2", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ ach }) => {
      clear(g);
      const out = 420, src = 30 * 0.005 * 3600 / 180000 * 1e6; // ppm/h
      const C = (tm) => { const t = tm / 60; return ach > 0 ? out + src / ach * (1 - Math.exp(-ach * t)) : out + src * t; };
      const F = frame(g, 0, 50, 0, 3500, [10, 500]); ticks(g, F, [0, 10, 20, 30, 40, 50], [0, 1000, 2000, 3000]);
      txt(g, 490, 200, "수업 시작 뒤 시간 (분)", "s", "end"); txt(g, 66, 26, "이산화 탄소 (ppm)", "s");
      Q.line(g, F.x(0), F.y(1000), F.x(50), F.y(1000), "d"); txt(g, F.x(50), F.y(1000) - 4, "권장 기준 1000 ppm", "s td", "end");
      Q.plot(g, F, C, "b", 0, 50, 200);
      read.textContent = `환기 ${ach}회/시간: 50분 뒤 약 ${num(C(50), 0)} ppm` + (C(50) > 1000 ? " (기준 초과, 졸음과 집중력 저하)" : " (기준 이하)");
    });
  });

  // 2-3 불리한 자료를 뺄 때: 뺀 자료 수 k (효과가 없는 두 집단, 각 10개)
  Q.def("sie-cherry", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      const r = rng(5), A = [], B = [];
      for (let i = 0; i < 10; i++) { A.push(50 + 8 * gauss(r)); B.push(50 + 8 * gauss(r)); }
      const Bs = [...B].sort((a, b) => a - b).slice(k);
      const mean = (x) => x.reduce((a, b) => a + b, 0) / x.length;
      const F = frame(g, 0, 3, 20, 80, [1, 10]); ticks(g, F, [], [20, 40, 60, 80]);
      A.forEach((v, i) => Q.dot(g, F.x(0.8 + (i % 5) * 0.06), F.y(v), "fb", 3.5));
      B.forEach((v) => Q.dot(g, F.x(2.0 + (B.indexOf(v) % 5) * 0.06), F.y(v), Bs.includes(v) ? "fc" : "fk", 3.5));
      Q.line(g, F.x(0.6), F.y(mean(A)), F.x(1.2), F.y(mean(A)), "b"); Q.line(g, F.x(1.8), F.y(mean(Bs)), F.x(2.4), F.y(mean(Bs)), "c");
      txt(g, F.x(1), 220, "대조군", "s", "middle"); txt(g, F.x(2.1), 220, "실험군", "s", "middle");
      read.textContent = k ? `실험군에서 낮은 값 ${k}개를 '실수'라며 빼면: 평균 차 ${num(mean(Bs) - mean(A), 1)}점 (원래 ${num(mean(B) - mean(A), 1)}점). 효과가 없는데 효과가 있는 것처럼 보이게 된다` : `자료를 모두 쓰면 평균 차 ${num(mean(B) - mean(A), 1)}점: 같은 분포에서 나온 우연한 차이이다`;
    });
  });
})();
