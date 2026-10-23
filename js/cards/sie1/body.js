/* 과학탐구실험 1 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const frame = (g, x0, x1, y0, y1, st, X0, X1) => { const F = Q.frame(x0, x1, y0, y1, X0 || 60, X1 || 490, 15, 205); Q.axes(g, F, { step: st || 1, label: false }); return F; };
  const ticks = (g, F, xs, ys) => { for (const x of xs) txt(g, F.x(x), 220, `${x}`, "s", "middle"); for (const y of ys) txt(g, F.X0 - 5, F.y(y) + 4, `${y}`, "s", "end"); };
  const rng = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
  const gauss = (r) => { const u = Math.max(1e-9, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

  // 1-1 갈릴레이의 빗면: 경사각 th (°), 박자 0.5 s
  Q.def("sie-incline", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ th }) => {
      clear(g);
      const a = 9.8 * Math.sin(th * Math.PI / 180) * 5 / 7, d = (n) => 0.5 * a * (n * 0.5) ** 2;
      const F = frame(g, 0, 8, 0, Math.max(1, d(8)), [1, Math.max(0.5, Math.ceil(d(8)) / 4)]); ticks(g, F, [0, 2, 4, 6, 8], []);
      txt(g, 490, 200, "박자 (0.5초마다)", "s", "end"); txt(g, 66, 26, "굴러간 거리 (m)", "s");
      Q.plot(g, F, d, "b", 0, 8, 200);
      for (let n = 1; n <= 8; n++) Q.dot(g, F.x(n), F.y(d(n)), "fd", 3.5);
      read.textContent = `경사 ${th}°: 박자 1, 2, 3, 4에 굴러간 거리 ${num(d(1), 2)}, ${num(d(2), 2)}, ${num(d(3), 2)}, ${num(d(4), 2)} m → 1 : 4 : 9 : 16 (시간의 제곱에 비례)`;
    });
  });

  // 1-2 빛의 속력 측정의 역사: 측정 k
  const LS = [["뢰머 (1676)", 220000, 50000], ["피조 (1849)", 313000, 15000], ["푸코 (1862)", 298000, 500], ["마이컬슨 (1926)", 299796, 4], ["현재 정의값", 299792.458, 0]];
  Q.def("sie-light", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      const X = (v) => 60 + (v - 150000) / 200000 * 430;
      Q.line(g, X(150000), 190, X(350000), 190, "ax");
      for (const v of [150000, 200000, 250000, 300000, 350000]) txt(g, X(v), 208, `${v / 1000}`, "s", "middle");
      txt(g, 490, 222, "빛의 속력 (천 km/s)", "s", "end");
      LS.forEach(([nm, v, e], i) => { const y = 30 + i * 32; Q.line(g, X(v - e), y, X(v + e), y, i === k ? "d" : "gd"); Q.dot(g, X(v), y, i === k ? "fd" : "fb", 4); txt(g, 56, y + 4, nm, "s", "end"); });
      Q.line(g, X(299792), 20, X(299792), 185, "gd");
      const [nm, v, e] = LS[k];
      read.textContent = `${nm}: ${Math.round(v).toLocaleString("ko-KR")} km/s` + (e ? ` ± ${e.toLocaleString("ko-KR")} km/s (어림)` : " (1983년부터 정의값)") + ". 방법이 정밀해질수록 값이 고쳐지고 오차가 줄었다";
    }, (key, v) => LS[v][0]);
  });

  // 2-1 진자 주기의 반복 측정: 길이 L (m), 측정 횟수 n, 반응 시간 오차 0.1 s
  Q.def("sie-pend", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ L, n }) => {
      clear(g);
      const T = 2 * Math.PI * Math.sqrt(L / 9.8), r = rng(13), xs = [];
      for (let i = 0; i < n; i++) xs.push(T + 0.1 * gauss(r));
      const m = xs.reduce((a, b) => a + b, 0) / n, sd = Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(1, n - 1)), se = sd / Math.sqrt(n);
      const F = frame(g, 0, 31, T - 0.4, T + 0.4, [5, 0.1]);
      ticks(g, F, [0, 10, 20, 30], []); for (const y of [-0.4, -0.2, 0, 0.2, 0.4]) txt(g, F.X0 - 5, F.y(T + y) + 4, num(T + y, 2), "s", "end");
      txt(g, 490, 200, "측정 번호", "s", "end"); txt(g, 66, 26, "잰 주기 (s)", "s");
      xs.forEach((x, i) => Q.dot(g, F.x(i + 1), F.y(x), "fb", 3));
      Q.line(g, F.x(0), F.y(m), F.x(31), F.y(m), "d");
      el("rect", { x: F.x(0), y: F.y(m + 2 * se), width: F.x(31) - F.x(0), height: F.y(m - 2 * se) - F.y(m + 2 * se), class: "la" }, g);
      read.textContent = `길이 ${L} m, ${n}번 측정: 평균 ${num(m, 3)} s (참값 ${num(T, 3)} s), 평균의 불확도 ±${num(2 * se, 3)} s. 측정을 4배로 늘리면 불확도는 절반이 된다`;
    });
  });

  // 2-2 파스퇴르의 백조목 플라스크: 목을 부러뜨린 날 b (0이면 부러뜨리지 않음)
  Q.def("sie-pasteur", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ b }) => {
      clear(g);
      const grow = (t, t0) => t < t0 ? 0 : 100 / (1 + Math.exp(-(t - t0 - 2) * 2));
      const F = frame(g, 0, 20, 0, 100, [2, 20]); ticks(g, F, [0, 5, 10, 15, 20], [0, 50, 100]);
      txt(g, 490, 200, "날짜", "s", "end"); txt(g, 66, 26, "미생물의 양 (상대값)", "s");
      Q.plot(g, F, (t) => grow(t, 0.5), "d", 0, 20, 200);
      Q.plot(g, F, (t) => b ? grow(t, b) : 0, "b", 0, 20, 200);
      txt(g, F.x(4), F.y(95), "목이 곧은 플라스크", "s td");
      read.textContent = b ? `백조목을 ${b}일째 부러뜨리면 그 뒤 곧 미생물이 자란다: 공기 속 먼지에 실려 들어온 것` : "백조목 플라스크: 공기는 통하지만 먼지가 목의 굽은 곳에 걸려, 몇 주가 지나도 미생물이 생기지 않는다";
    });
  });

  // 2-3 그래프 세로축의 시작값: 시작값 y0
  Q.def("sie-axis", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ y0 }) => {
      clear(g);
      const A = 50, B = 53, H = 160, top = 60, sc = (v) => (v - y0) / (top - y0) * H;
      Q.line(g, 80, 190, 400, 190, "ax"); Q.line(g, 80, 190, 80, 30, "ax");
      for (const v of [y0, (y0 + top) / 2, top]) txt(g, 74, 194 - sc(v), num(v, 0), "s", "end");
      el("rect", { x: 130, y: 190 - sc(A), width: 80, height: sc(A), class: "lb" }, g); txt(g, 170, 208, `A반 ${A}점`, "s", "middle");
      el("rect", { x: 270, y: 190 - sc(B), width: 80, height: sc(B), class: "lc" }, g); txt(g, 310, 208, `B반 ${B}점`, "s", "middle");
      const ratio = sc(B) / sc(A);
      read.textContent = `세로축을 ${y0}부터 그리면 B반 막대가 A반의 ${num(ratio, 2)}배로 보인다. 실제 차이는 ${num(B / A, 2)}배(6%)뿐이다`;
    });
  });

  // 2-4 우연히 나온 결과: 검사 수 m, 재현 실험 수 k (유의 수준 5%)
  Q.def("sie-repl", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ m, k }) => {
      clear(g);
      const p1 = 1 - 0.95 ** m, pk = 0.05 ** k;
      el("rect", { x: 200, y: 50, width: p1 * 250, height: 26, class: "ld" }, g); txt(g, 192, 68, `효과 없는 검사 ${m}번`, "s", "end"); txt(g, 206 + p1 * 250, 68, `${num(p1 * 100, 0)}%`, "s");
      el("rect", { x: 200, y: 110, width: Math.max(1, pk * 250 * 20), height: 26, class: "lb" }, g); txt(g, 192, 128, `독립 재현 ${k}번 통과`, "s", "end"); txt(g, 206 + Math.max(1, pk * 250 * 20), 128, pk >= 0.001 ? `${num(pk * 100, 2)}%` : `${pk.toExponential(0)}`, "s");
      read.textContent = `효과가 없는데도 우연히 '의미 있다'가 나올 확률: 한 번 검사 5%, ${m}번 중 한 번 이상 ${num(p1 * 100, 0)}%. 독립 재현 ${k}번을 모두 통과할 확률 ${pk >= 0.001 ? num(pk * 100, 2) + "%" : pk.toExponential(0)}`;
    });
  });
})();
